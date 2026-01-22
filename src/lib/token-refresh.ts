/**
 * Token Refresh Service
 *
 * Phase 5: Session Management & Security
 *
 * Handles silent token refresh to maintain user sessions:
 * - Automatic token refresh before expiry
 * - Token expiry detection
 * - Graceful session termination on refresh failure
 * 
 * Updated for cookie-based token storage (HTTP-only cookies)
 */

import { refreshToken as refreshAuthToken, logout } from "./auth";

// Configuration
const TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // Refresh 5 minutes before expiry
const TOKEN_CHECK_INTERVAL_MS = 60 * 1000; // Check every minute

// Token refresh state
let refreshPromise: Promise<boolean> | null = null;
let tokenCheckInterval: NodeJS.Timeout | null = null;

/**
 * Check if tokens exist using API route
 * HTTP-only cookies are not accessible from JavaScript
 */
async function hasValidTokens(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/get-token");
    if (!response.ok) return false;
    
    const data = await response.json();
    return data.hasAuthToken || false;
  } catch {
    return false;
  }
}

/**
 * Decode JWT token to get payload (without verification)
 * Note: This is for client-side expiry checking only
 * Since tokens are HTTP-only, we can't access them directly
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
 * Refresh access token using refresh token (HTTP-only cookies)
 * Implements request deduplication to prevent multiple simultaneous refresh requests
 */
export async function refreshAccessToken(): Promise<boolean> {
  // Return existing promise if refresh is already in progress
  if (refreshPromise) {
    console.log("[TokenRefresh] Refresh already in progress, waiting...");
    return refreshPromise;
  }

  console.log("[TokenRefresh] Starting token refresh using HTTP-only cookies...");

  refreshPromise = (async () => {
    try {
      const success = await refreshAuthToken();
      
      if (success) {
        console.log("[TokenRefresh] Token refresh successful!");
      } else {
        console.error("[TokenRefresh] Token refresh failed");
      }
      
      return success;
    } catch (error) {
      console.error("[TokenRefresh] Token refresh error:", error);
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Check and refresh token if needed
 * Returns true if token is valid (either already valid or successfully refreshed)
 * 
 * Note: Since tokens are HTTP-only, we rely on backend to check expiry
 * We attempt refresh on API 401 errors rather than proactive checking
 */
export async function ensureValidToken(): Promise<boolean> {
  const hasTokens = await hasValidTokens();

  if (!hasTokens) {
    // Don't log - this is expected for guests or logged-out users
    return false;
  }

  // Tokens exist - assume valid
  // Actual validation happens on backend API calls
  return true;
}

/**
 * Start automatic token refresh checking
 * Should be called once when the app initializes (in AuthProvider)
 * 
 * Note: With HTTP-only cookies, we can't check token expiry client-side
 * Instead, we rely on API interceptors to handle 401 responses
 */
export function startTokenRefreshCheck(): void {
  if (tokenCheckInterval) {
    console.log("[TokenRefresh] Token check already running");
    return;
  }

  console.log("[TokenRefresh] Starting automatic token validity check...");

  // Initial check
  ensureValidToken().catch(console.error);

  // Periodic checks (basic presence check)
  tokenCheckInterval = setInterval(async () => {
    const hasTokens = await hasValidTokens();
    if (!hasTokens) {
      console.log("[TokenRefresh] No tokens found, stopping check");
      stopTokenRefreshCheck();
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
 * 
 * Note: Limited functionality with HTTP-only cookies
 * We can only check token existence, not expiry
 */
export async function getTokenInfo(): Promise<{
  hasToken: boolean;
  hasRefreshToken: boolean;
  isExpired: boolean;
  isExpiringSoon: boolean;
  expiresIn: string | null;
}> {
  try {
    const response = await fetch("/api/auth/get-token");
    
    if (!response.ok) {
      return {
        hasToken: false,
        hasRefreshToken: false,
        isExpired: true,
        isExpiringSoon: true,
        expiresIn: null,
      };
    }
    
    const data = await response.json();
    
    return {
      hasToken: data.hasAuthToken || false,
      hasRefreshToken: data.hasRefreshToken || false,
      isExpired: !data.hasAuthToken, // Assume expired if no token
      isExpiringSoon: false, // Can't determine without decoding token
      expiresIn: data.hasAuthToken ? "Unknown (HTTP-only)" : null,
    };
  } catch (error) {
    console.error("[TokenRefresh] Error getting token info:", error);
    return {
      hasToken: false,
      hasRefreshToken: false,
      isExpired: true,
      isExpiringSoon: true,
      expiresIn: null,
    };
  }
}
