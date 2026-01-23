import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
const API_TIMEOUT = Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000;

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - NOTE: Auth is managed with HTTP-only cookies on the server.
// Client-side code should not read access tokens from localStorage for security reasons.
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Do not set Authorization header from localStorage. Server will use cookies.
    // If a non-HTTP-only token is intentionally used, set it here (explicitly).

    // Log request in development
    if (process.env.NEXT_PUBLIC_ENABLE_API_LOGGING === 'true') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error: unknown) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (process.env.NEXT_PUBLIC_ENABLE_API_LOGGING === 'true') {
      console.log(`[API Response] ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      
      if (status === 401) {
        // ⚠️ DON'T auto-redirect on 401 - let the calling component handle it
        // This allows login/signup pages to show proper error messages
        // Only redirect if NOT on an auth-related endpoint
        const isAuthEndpoint = error.config?.url?.includes('/auth/');
        
        if (!isAuthEndpoint && typeof window !== 'undefined') {
          // Non-auth endpoint returned 401 - user session expired. Redirect to login.
          console.warn('[API] Session expired - redirecting to login');
          window.location.href = '/login';
        }
        // For auth endpoints (login, register, etc.), let the error propagate
        // so the page can show proper toast notifications
      } else if (status === 403) {
        console.error('[API] Forbidden - Insufficient permissions');
      } else if (status === 404) {
        // Suppress 404 errors - expected when backend not running
        if (process.env.NEXT_PUBLIC_ENABLE_API_LOGGING === 'true') {
          console.warn('[API] Resource not found - using CMS data instead');
        }
      } else if (status === 500) {
        console.error('[API] Server error');
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('[API] No response from server', error.request);
    } else {
      // Error setting up request
      console.error('[API] Request setup error', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
