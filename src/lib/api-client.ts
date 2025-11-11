// API Client Configuration
// Centralized API client for making requests to the backend

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_ENDPOINT ||
  "https://mash-backend-api-production.up.railway.app/";

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

// Generic API request function
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;

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
        const refreshResponse = await fetch(
          `${API_BASE_URL}/auth/refresh-token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
          }
        );

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          
          // Update tokens (handle both response formats)
          const newAccessToken = refreshData.data?.accessToken || refreshData.accessToken;
          const newRefreshToken = refreshData.data?.refreshToken || refreshData.refreshToken;
          
          if (typeof document !== "undefined" && newAccessToken) {
            document.cookie = `auth-token=${encodeURIComponent(newAccessToken)}; Path=/`;
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
      document.cookie = "auth-token=; Path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
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
