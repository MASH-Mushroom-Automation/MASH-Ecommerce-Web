/**
 * API Interceptor
 * 
 * Phase 5: Session Management & Security
 * 
 * Provides a fetch wrapper with automatic:
 * - Authorization header injection
 * - Token refresh on 401 responses
 * - Request retry after token refresh
 * - Consistent error handling
 */

import { getAuthToken, refreshAccessToken, isTokenExpiringSoon } from "./token-refresh";
import { logout } from "./auth";

// Configuration
const MAX_RETRY_ATTEMPTS = 1;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:30000/api/v1";
const LOCAL_API_URL = process.env.NEXT_PUBLIC_LOCAL_API_URL || "http://localhost:30000/api/v1";
const EMAIL_SERVICE_ENV = process.env.NEXT_PUBLIC_EMAIL_SERVICE_ENV || "local";
const ENABLE_API_LOGGING = process.env.NEXT_PUBLIC_ENABLE_API_LOGGING === "true";

// Email-dependent endpoints that should use local backend
const EMAIL_ENDPOINTS = [
  "/auth/register",
  "/auth/verify-email-code",
  "/auth/resend-verification",
  "/auth/resend-verification-code",
  "/auth/forgot-password",
  "/auth/verify-reset-code",
  "/auth/reset-password",
  "/auth/resend-password-reset-code",
];

// Public endpoints that don't require authentication
const PUBLIC_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email-code",
  "/auth/resend-verification-code",
  "/auth/google/login",
  "/auth/firebase-sync",
  "/health",
  "/products",
  "/categories",
];

/**
 * Request configuration options
 */
export interface ApiRequestOptions extends RequestInit {
  /** Skip authentication header */
  skipAuth?: boolean;
  /** Skip token refresh on 401 */
  skipRefresh?: boolean;
  /** Custom base URL override */
  baseUrl?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
}

/**
 * API Error class with additional context
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
    public endpoint?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Determine which base URL to use based on endpoint
 */
function getBaseUrl(endpoint: string): string {
  const isEmailEndpoint = EMAIL_ENDPOINTS.some((ep) => endpoint.includes(ep));
  
  if (isEmailEndpoint && EMAIL_SERVICE_ENV === "local") {
    if (ENABLE_API_LOGGING) {
      console.log(`[API Interceptor] 📧 Email endpoint: ${endpoint} → LOCAL`);
    }
    return LOCAL_API_URL;
  }
  
  return API_BASE_URL;
}

/**
 * Check if endpoint requires authentication
 */
function requiresAuth(endpoint: string): boolean {
  return !PUBLIC_ENDPOINTS.some((pub) => endpoint.includes(pub));
}

/**
 * Create request headers with optional auth token
 */
function createHeaders(
  options: ApiRequestOptions,
  token: string | null
): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Add auth token if available and not skipped
  if (token && !options.skipAuth) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Execute fetch with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("Request timeout", 408, undefined, url);
    }
    throw error;
  }
}

/**
 * Main API request function with interceptor features
 * 
 * @param endpoint - API endpoint (e.g., "/auth/login", "/users/profile")
 * @param options - Request options
 * @returns Promise<T> - Parsed JSON response
 * 
 * @example
 * ```typescript
 * // Simple GET
 * const user = await apiRequestWithInterceptor<User>("/users/profile");
 * 
 * // POST with body
 * const result = await apiRequestWithInterceptor<LoginResponse>("/auth/login", {
 *   method: "POST",
 *   body: JSON.stringify({ email, password }),
 * });
 * 
 * // Skip auth for public endpoints
 * const products = await apiRequestWithInterceptor<Product[]>("/products", {
 *   skipAuth: true,
 * });
 * ```
 */
export async function apiRequestWithInterceptor<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
  retryCount = 0
): Promise<T> {
  const baseUrl = options.baseUrl || getBaseUrl(endpoint);
  const url = `${baseUrl}${endpoint}`;
  const timeout = options.timeout || 30000; // 30 seconds default

  // Get current auth token
  let token = getAuthToken();

  // Proactively refresh token if it's expiring soon
  if (token && isTokenExpiringSoon(token) && !options.skipRefresh) {
    if (ENABLE_API_LOGGING) {
      console.log("[API Interceptor] Token expiring soon, refreshing proactively...");
    }
    const newToken = await refreshAccessToken();
    if (newToken) {
      token = newToken;
    }
  }

  // Create headers
  const headers = createHeaders(options, token);

  if (ENABLE_API_LOGGING) {
    console.log(`[API Interceptor] ${options.method || "GET"} ${url}`);
  }

  try {
    // Execute request
    const response = await fetchWithTimeout(
      url,
      {
        ...options,
        headers,
      },
      timeout
    );

    // Parse response
    let data: T;
    const contentType = response.headers.get("content-type");
    
    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      data = (await response.text()) as unknown as T;
    }

    // Handle 401 Unauthorized - attempt token refresh
    if (response.status === 401 && !options.skipRefresh && retryCount < MAX_RETRY_ATTEMPTS) {
      if (ENABLE_API_LOGGING) {
        console.log("[API Interceptor] 401 received, attempting token refresh...");
      }

      const newToken = await refreshAccessToken();
      
      if (newToken) {
        if (ENABLE_API_LOGGING) {
          console.log("[API Interceptor] Token refreshed, retrying request...");
        }
        // Retry request with new token
        return apiRequestWithInterceptor<T>(endpoint, options, retryCount + 1);
      } else {
        // Refresh failed - logout user
        if (ENABLE_API_LOGGING) {
          console.log("[API Interceptor] Token refresh failed, logging out...");
        }
        logout();
        throw new ApiError("Session expired", 401, data, endpoint);
      }
    }

    // Handle other error responses
    if (!response.ok) {
      const errorMessage = 
        (data as { message?: string })?.message || 
        (data as { error?: string })?.error ||
        `Request failed with status ${response.status}`;
      
      throw new ApiError(errorMessage, response.status, data, endpoint);
    }

    return data;
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new ApiError(
        "Network error - please check your connection",
        0,
        undefined,
        endpoint
      );
    }

    // Handle other errors
    throw new ApiError(
      error instanceof Error ? error.message : "Unknown error",
      500,
      undefined,
      endpoint
    );
  }
}

/**
 * Create a configured API client with common methods
 */
export const apiClient = {
  /**
   * GET request
   */
  get: <T>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequestWithInterceptor<T>(endpoint, { ...options, method: "GET" }),

  /**
   * POST request
   */
  post: <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequestWithInterceptor<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  /**
   * PUT request
   */
  put: <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequestWithInterceptor<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  /**
   * PATCH request
   */
  patch: <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequestWithInterceptor<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  /**
   * DELETE request
   */
  delete: <T>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequestWithInterceptor<T>(endpoint, { ...options, method: "DELETE" }),
};

export default apiClient;
