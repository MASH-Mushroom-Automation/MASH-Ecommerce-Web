// API Client Configuration
// Centralized API client for making requests to the backend with dual-environment support

// Backend URLs
const PRODUCTION_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
const LOCAL_API_URL =
  process.env.NEXT_PUBLIC_LOCAL_API_URL || "http://localhost:3000/api/v1";
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
        `[API] 📧 Email endpoint detected: ${endpoint} → Using LOCAL backend (${LOCAL_API_URL})`
      );
    }
    return LOCAL_API_URL;
  }

  // All other endpoints use production backend
  if (ENABLE_API_LOGGING) {
    console.log(
      `[API] ☁️ Standard endpoint: ${endpoint} → Using PRODUCTION backend (${PRODUCTION_API_URL})`
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

// Helper to get refresh token from localStorage
function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
}

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
    console.log(`[API] 📡 Request: ${options.method || "GET"} ${url}`);
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

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  // Handle unauthorized errors (token expired)
  if (response.status === 401) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        // Refresh token always uses production backend (session management)
        const refreshUrl = `${PRODUCTION_API_URL}/auth/refresh-token`;

        if (ENABLE_API_LOGGING) {
          console.log(
            `[API] 🔄 Token expired, attempting refresh: ${refreshUrl}`
          );
        }

        const refreshResponse = await fetch(refreshUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();

          // Update tokens (handle both response formats)
          const newAccessToken =
            refreshData.data?.accessToken || refreshData.accessToken;
          const newRefreshToken =
            refreshData.data?.refreshToken || refreshData.refreshToken;

          if (typeof document !== "undefined" && newAccessToken) {
            document.cookie = `auth-token=${encodeURIComponent(
              newAccessToken
            )}; Path=/`;
          }
          if (typeof window !== "undefined" && newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }

          // Retry original request with new token
          return apiRequest<T>(endpoint, options);
        }
      } catch (error) {
        console.error("Token refresh failed:", error);
      }
    }

    // If refresh fails or no refresh token, clear tokens and redirect to login
    if (typeof window !== "undefined") {
      document.cookie =
        "auth-token=; Path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error(data.message || `API Error: ${response.status}`);
  }

  return data;
}

// Specific API methods
export const api = {
  // Authentication
  login: (email: string, password: string) =>
    apiRequest("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    apiRequest("/api/v1/auth/logout", {
      method: "POST",
    }),

  refreshToken: (refreshToken: string) =>
    apiRequest("/api/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),

  // User
  getProfile: () => apiRequest("/api/v1/users/profile", { method: "GET" }),

  updateProfile: (data: Record<string, unknown>) =>
    apiRequest("/api/v1/users/profile", {
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
    return apiRequest(`/api/v1/products${queryString}`, { method: "GET" });
  },

  getProduct: (id: string) =>
    apiRequest(`/api/v1/products/${id}`, { method: "GET" }),

  // Add more API methods as needed
};

export default api;
