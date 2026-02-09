// API Client Configuration
// Centralized API client for making requests to the backend with dual-environment support

import { logger } from "@/lib/logger";

// Backend URLs - Default to port 30000 for local development
const PRODUCTION_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:30000/api/v1";
const LOCAL_API_URL =
  process.env.NEXT_PUBLIC_LOCAL_API_URL || "http://localhost:30000/api/v1";
const EMAIL_SERVICE_ENV = process.env.NEXT_PUBLIC_EMAIL_SERVICE_ENV || "local";
const ENABLE_API_LOGGING =
  process.env.NEXT_PUBLIC_ENABLE_API_LOGGING === "true";

// Email-dependent endpoints that should use local backend (when EMAIL_SERVICE_ENV is "local")
// These endpoints require working email service which is only configured on localhost
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

// Public endpoints that don't require credentials (no cookies needed)
// These endpoints are before user is authenticated
const PUBLIC_ENDPOINTS = [
  "/auth/register",
  "/auth/login",
  "/auth/verify-email-code",
  "/auth/resend-verification",
  "/auth/resend-verification-code",
  "/auth/forgot-password",
  "/auth/verify-reset-code",
  "/auth/reset-password",
  "/auth/resend-password-reset-code",
  "/auth/google/login",
  "/health",
];

/**
 * Determine which base URL to use based on endpoint
 * @param endpoint - API endpoint path (e.g., "/auth/register")
 * @returns Base URL to use for the request
 */
function getBaseUrl(endpoint: string): string {
  // Check if endpoint requires email service
  const isEmailEndpoint = EMAIL_ENDPOINTS.some((emailEndpoint) =>
    endpoint.includes(emailEndpoint)
  );

  // If it's an email endpoint and we're using local email service
  if (isEmailEndpoint && EMAIL_SERVICE_ENV === "local") {
    if (ENABLE_API_LOGGING) {
      console.log(
        `[API] Email endpoint detected: ${endpoint} → Using LOCAL backend (${LOCAL_API_URL})`
      );
    }
    return LOCAL_API_URL;
  }

  // All other endpoints use production backend
  if (ENABLE_API_LOGGING) {
    console.log(
      `[API] Standard endpoint: ${endpoint} → Using PRODUCTION backend (${PRODUCTION_API_URL})`
    );
  }
  return PRODUCTION_API_URL;
}

// Helper to get auth token from cookies
function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/auth-token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// Helper to get refresh token from cookies (may be HTTP-only and unavailable)
function getRefreshToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/refresh-token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// Note: Refresh token is now in HTTP-only cookie (not accessible from JavaScript)
// Token refresh is handled automatically by backend via cookie

// Generic API request function with dynamic base URL selection
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  // Dynamic base URL selection based on endpoint type
  const baseUrl = getBaseUrl(endpoint);
  const url = `${baseUrl}${endpoint}`;

  if (ENABLE_API_LOGGING) {
    logger.debug("[API] Request", {
      method: options.method || "GET",
      url,
    });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Add auth token if available
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Check if this is a public endpoint (no credentials needed)
  const isPublicEndpoint = PUBLIC_ENDPOINTS.some((publicEndpoint) =>
    endpoint.includes(publicEndpoint)
  );

  // Build fetch options
  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  // Only include credentials for authenticated endpoints (not public ones)
  // This prevents CORS preflight issues on registration/login
  if (!isPublicEndpoint && !headers["Authorization"]) {
    fetchOptions.credentials = "include";
  }

  const response = await fetch(url, fetchOptions);

  const data = await response.json();

  // Handle 400 Bad Request for auth endpoints (validation errors)
  if (response.status === 400) {
    const isAuthEndpoint = endpoint.includes('/auth/login') || 
                          endpoint.includes('/auth/register') || 
                          endpoint.includes('/auth/verify') ||
                          endpoint.includes('/auth/forgot-password') ||
                          endpoint.includes('/auth/reset-password');
    
    if (isAuthEndpoint) {
      // Extract error message from backend structure
      const errorMessage = data.error?.message || 
                         data.details?.message || 
                         data.message || 
                         "Validation failed";
      
      // Ensure errorMessage is always a string
      const messageString = typeof errorMessage === 'string' 
        ? errorMessage 
        : JSON.stringify(errorMessage);
      
      const error: any = new Error(messageString);
      error.statusCode = 400;
      
      // Create comprehensive nested error response structure
      error.response = {
        status: 400,
        statusCode: 400,
        data: {
          message: messageString,
          error: data.error?.type || data.error?.code || "Bad Request",
          statusCode: data.statusCode || 400,
          details: data.details || data.error,
          ...data
        }
      };
      
      if (ENABLE_API_LOGGING) {
        console.error(`[API] Auth error (400): ${messageString}`, {
          fullError: data.error,
          details: data.details
        });
      }
      
      throw error;
    }
  }

  // Handle unauthorized errors (token expired)
  if (response.status === 401) {
    const refreshToken = getRefreshToken();
    
    // ⚠️ DON'T redirect on auth endpoints (login, register, etc.)
    // Let those pages handle the error and show toast notifications
    const isAuthEndpoint = endpoint.includes('/auth/login') || 
                          endpoint.includes('/auth/register') || 
                          endpoint.includes('/auth/verify') ||
                          endpoint.includes('/auth/forgot-password') ||
                          endpoint.includes('/auth/reset-password');
    
    if (refreshToken && !isAuthEndpoint) {
      try {
        // Refresh token using HTTP-only cookies
        // Backend will read refresh-token cookie automatically
        const refreshUrl = `${PRODUCTION_API_URL}/auth/refresh-token`;

        if (ENABLE_API_LOGGING) {
          console.log(
            `[API] Token expired, attempting refresh: ${refreshUrl}`
          );
        }

        const refreshResponse = await fetch(refreshUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Send HTTP-only cookies
        });

        if (refreshResponse.ok) {
          // Tokens are automatically set as HTTP-only cookies by backend
          // No need to manually update cookies here
          
          // Retry original request with refreshed cookies
          return apiRequest<T>(endpoint, options);
        }
      } catch (error) {
        console.error("Token refresh failed:", error);
      }
    }

    // If it's an auth endpoint (login/register), throw the error immediately
    // so the page can show proper toast notifications
    if (isAuthEndpoint) {
      // Extract error message from backend structure: data.error.message
      // Backend sends: {error: {message: "Invalid credentials"}}
      const errorMessage = data.error?.message || 
                         data.details?.message || 
                         data.message || 
                         "Authentication failed";
      
      // Ensure errorMessage is always a string (defensive coding)
      const messageString = typeof errorMessage === 'string' 
        ? errorMessage 
        : JSON.stringify(errorMessage);
      
      const error: any = new Error(messageString);
      error.statusCode = 401;
      
      // Create comprehensive nested error response structure
      error.response = {
        status: 401,
        statusCode: 401,
        data: {
          message: messageString,
          error: data.error?.type || data.error?.code || "Unauthorized",
          statusCode: data.statusCode || 401,
          details: data.details || data.error,
          ...data // Include all backend fields
        }
      };
      
      if (ENABLE_API_LOGGING) {
        console.error(`[API] Auth error (401): ${messageString}`, {
          fullError: data.error,
          details: data.details
        });
      }
      
      throw error;
    }

    // If refresh fails or no refresh token (non-auth endpoints), clear tokens and redirect
    if (typeof window !== "undefined") {
      // Clear auth token cookie (client-side fallback)
      document.cookie =
        "auth-token=; Path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      
      // Call logout API to clear HTTP-only cookies properly
      fetch("/api/auth/clear-tokens", {
        method: "POST",
        credentials: "include",
      }).catch(console.error);
      
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    // Extract detailed error message from various response formats
    let errorMessage = data.message || data.error?.message || `API Error: ${response.status}`;
    
    // Add status code for better error handling
    const error: any = new Error(errorMessage);
    error.statusCode = response.status;
    error.response = data;
    
    if (ENABLE_API_LOGGING) {
      console.error(`[API] Error: ${response.status} - ${errorMessage}`, data);
    }
    
    throw error;
  }

  return data;
}

// Specific API methods
export const api = {
  // Authentication
  login: (email: string, password: string) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    apiRequest("/auth/logout", {
      method: "POST",
    }),

  refreshToken: (refreshToken: string) =>
    apiRequest("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),

  // User
  getProfile: () => apiRequest("/users/profile", { method: "GET" }),

  updateProfile: (data: Record<string, unknown>) =>
    apiRequest("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Products
  getProducts: (params?: Record<string, string | number>) => {
    const queryString = params
      ? "?" +
        new URLSearchParams(
          Object.entries(params).map(([k, v]) => [k, String(v)])
        ).toString()
      : "";
    return apiRequest(`/products${queryString}`, { method: "GET" });
  },

  getProduct: (id: string) =>
    apiRequest(`/products/${id}`, { method: "GET" }),

  // Add more API methods as needed
};

export default api;
