/**
 * Token Refresh Service
 *
 * Phase 5: Session Management & Security
 *
 * Handles silent token refresh to maintain user sessions:
 * - Automatic token refresh before expiry
 * - Token expiry detection
 * - Graceful session termination on refresh failure
 */

import { setAuthToken, logout } from "./auth";

// Configuration
const TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // Refresh 5 minutes before expiry
const TOKEN_CHECK_INTERVAL_MS = 60 * 1000; // Check every minute

// API Base URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:30000/api/v1";

// Token refresh state
let refreshPromise: Promise<string | null> | null = null;
let tokenCheckInterval: NodeJS.Timeout | null = null;

/**
 * Get the auth token from cookies
 */
export function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/auth-token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Get the refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
}

/**
 * Decode JWT token to get payload (without verification)
 * Note: This is for client-side expiry checking only
 */
export function decodeToken(
  token: string
): { exp?: number; iat?: number; sub?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    console.error("[TokenRefresh] Failed to decode token");
    return null;
  }
}

/**
 * Check if token is expired or about to expire
 */
export function isTokenExpiringSoon(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true; // Treat invalid tokens as expired

  const expiryTime = decoded.exp * 1000; // Convert to milliseconds
  const timeUntilExpiry = expiryTime - Date.now();

  return timeUntilExpiry < TOKEN_REFRESH_THRESHOLD_MS;
}

/**
 * Check if token is fully expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;

  return Date.now() >= decoded.exp * 1000;
}

/**
 * Get time until token expiry in milliseconds
 */
export function getTokenExpiryTime(token: string): number | null {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return null;

  return decoded.exp * 1000 - Date.now();
}

/**
 * Refresh access token using refresh token
 * Implements request deduplication to prevent multiple simultaneous refresh requests
 */
export async function refreshAccessToken(): Promise<string | null> {
  // Return existing promise if refresh is already in progress
  if (refreshPromise) {
    console.log("[TokenRefresh] Refresh already in progress, waiting...");
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    console.log("[TokenRefresh] No refresh token available");
    return null;
  }

  console.log("[TokenRefresh] Starting token refresh...");

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        console.error(
          "[TokenRefresh] Refresh failed with status:",
          response.status
        );

        // If refresh token is invalid/expired, logout user
        if (response.status === 401 || response.status === 403) {
          console.log("[TokenRefresh] Refresh token invalid, logging out...");
          logout();
          return null;
        }

        throw new Error(`Refresh failed: ${response.status}`);
      }

      const data = await response.json();

      // Handle both response formats
      const newAccessToken = data.data?.accessToken || data.accessToken;
      const newRefreshToken = data.data?.refreshToken || data.refreshToken;

      if (!newAccessToken) {
        console.error("[TokenRefresh] No access token in response");
        return null;
      }

      // Store new tokens
      console.log("[TokenRefresh] Storing new access token...");
      setAuthToken(newAccessToken, true);

      if (newRefreshToken) {
        console.log("[TokenRefresh] Storing new refresh token...");
        localStorage.setItem("refreshToken", newRefreshToken);
      }

      console.log("[TokenRefresh] Token refresh successful!");
      return newAccessToken;
    } catch (error) {
      console.error("[TokenRefresh] Token refresh error:", error);

      // On network error, don't logout immediately - might be temporary
      // The next API call will trigger another refresh attempt
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Check and refresh token if needed
 * Returns true if token is valid (either already valid or successfully refreshed)
 * Note: Returns false silently for Firebase-only users (no backend token expected)
 */
export async function ensureValidToken(): Promise<boolean> {
  const token = getAuthToken();

  if (!token) {
    // Don't log - this is expected for Google OAuth users who use Firebase-only auth
    return false;
  }

  if (isTokenExpired(token)) {
    console.log("[TokenRefresh] Token is expired, attempting refresh...");
    const newToken = await refreshAccessToken();
    return !!newToken;
  }

  if (isTokenExpiringSoon(token)) {
    console.log(
      "[TokenRefresh] Token expiring soon, refreshing proactively..."
    );
    // Don't wait for this - let it refresh in background
    refreshAccessToken().catch(console.error);
  }

  return true;
}

/**
 * Start automatic token refresh checking
 * Should be called once when the app initializes (in AuthProvider)
 */
export function startTokenRefreshCheck(): void {
  if (tokenCheckInterval) {
    console.log("[TokenRefresh] Token check already running");
    return;
  }

  console.log("[TokenRefresh] Starting automatic token refresh check...");

  // Initial check
  ensureValidToken().catch(console.error);

  // Periodic checks
  tokenCheckInterval = setInterval(() => {
    const token = getAuthToken();
    if (token && isTokenExpiringSoon(token)) {
      console.log(
        "[TokenRefresh] Periodic check: token expiring soon, refreshing..."
      );
      refreshAccessToken().catch(console.error);
    }
  }, TOKEN_CHECK_INTERVAL_MS);
}

/**
 * Stop automatic token refresh checking
 * Should be called when user logs out
 */
export function stopTokenRefreshCheck(): void {
  if (tokenCheckInterval) {
    console.log("[TokenRefresh] Stopping automatic token refresh check");
    clearInterval(tokenCheckInterval);
    tokenCheckInterval = null;
  }
}

/**
 * Get token expiry info for debugging/display
 */
export function getTokenInfo(): {
  hasToken: boolean;
  hasRefreshToken: boolean;
  isExpired: boolean;
  isExpiringSoon: boolean;
  expiresIn: string | null;
} {
  const token = getAuthToken();
  const refreshToken = getRefreshToken();

  if (!token) {
    return {
      hasToken: false,
      hasRefreshToken: !!refreshToken,
      isExpired: true,
      isExpiringSoon: true,
      expiresIn: null,
    };
  }

  const expiryMs = getTokenExpiryTime(token);
  let expiresIn: string | null = null;

  if (expiryMs !== null) {
    if (expiryMs < 0) {
      expiresIn = "Expired";
    } else if (expiryMs < 60000) {
      expiresIn = `${Math.round(expiryMs / 1000)}s`;
    } else if (expiryMs < 3600000) {
      expiresIn = `${Math.round(expiryMs / 60000)}m`;
    } else {
      expiresIn = `${Math.round(expiryMs / 3600000)}h`;
    }
  }

  return {
    hasToken: true,
    hasRefreshToken: !!refreshToken,
    isExpired: isTokenExpired(token),
    isExpiringSoon: isTokenExpiringSoon(token),
    expiresIn,
  };
}
