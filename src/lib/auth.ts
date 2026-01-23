import { signOutFirebase } from "@/lib/firebase";

// API Base URL for backend calls
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:30000/api/v1";

/**
 * Check if user is authenticated by verifying HTTP-only cookie existence
 * Uses Next.js API route to check cookie presence
 */
export async function isAuthenticated(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  
  try {
    const response = await fetch("/api/auth/get-token");
    if (!response.ok) return false;
    
    const data = await response.json();
    return data.hasAuthToken || false;
  } catch (error) {
    console.error("[Auth] Error checking authentication:", error);
    return false;
  }
}

/**
 * Synchronous auth check using cookie presence
 * Less reliable but doesn't require async call
 */
export function isAuthenticatedSync(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.includes("auth-token=");
}

/**
 * Get auth token info (existence only, not the actual token value)
 * Tokens are HTTP-only and not accessible from client-side JavaScript
 */
export async function getAuthTokenInfo(): Promise<{
  hasAuthToken: boolean;
  hasRefreshToken: boolean;
}> {
  try {
    const response = await fetch("/api/auth/get-token");
    if (!response.ok) {
      return { hasAuthToken: false, hasRefreshToken: false };
    }
    
    const data = await response.json();
    return {
      hasAuthToken: data.hasAuthToken || false,
      hasRefreshToken: data.hasRefreshToken || false,
    };
  } catch (error) {
    console.error("[Auth] Error getting token info:", error);
    return { hasAuthToken: false, hasRefreshToken: false };
  }
}

/**
 * Set auth and refresh tokens using HTTP-only cookies
 * Replaces direct localStorage access for security
 * 
 * @param accessToken - JWT access token from backend
 * @param refreshToken - JWT refresh token from backend (optional)
 * @param rememberMe - Extend cookie expiry if true
 */
export async function setAuthToken(
  accessToken: string,
  refreshToken?: string,
  rememberMe = false
): Promise<boolean> {
  console.log("🟢 [Auth] setAuthToken called via API route:", {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    rememberMe,
  });

  try {
    const response = await fetch("/api/auth/set-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessToken,
        refreshToken,
        rememberMe,
      }),
      credentials: "include", // Important: allows cookies to be set
    });

    if (!response.ok) {
      console.error("❌ [Auth] Failed to set auth tokens via API:", response.status);
      return false;
    }

    console.log("🟢 [Auth] Auth tokens set successfully via HTTP-only cookies");
    return true;
  } catch (error) {
    console.error("❌ [Auth] Error setting auth tokens:", error);
    return false;
  }
}

/**
 * Clear auth tokens and logout
 * Uses API route to clear HTTP-only cookies
 */
export async function logout(): Promise<void> {
  console.log("🔴 [Auth] logout called");
  
  try {
    // Clear HTTP-only cookies via API
    const response = await fetch("/api/auth/clear-tokens", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      console.warn("⚠️ [Auth] Failed to clear tokens via API, clearing client state anyway");
    } else {
      console.log("🔴 [Auth] Auth tokens cleared via API");
    }
  } catch (error) {
    console.error("❌ [Auth] Error clearing tokens via API:", error);
  }

  // Clear client-side storage (non-sensitive data)
  if (typeof window !== "undefined") {
    try {
      console.log("🔴 [Auth] Clearing client-side storage (cookies + session)");

      // Clear cookie-based data (cart, wishlist, preferences) and HTTP-only auth cookies
      const { clearAllCookies } = await import("@/lib/cookies");
      await clearAllCookies();

      // Clear ephemeral sessionStorage keys
      sessionStorage.removeItem("pendingVerificationEmail");
      sessionStorage.removeItem("resetPasswordEmail");
      sessionStorage.removeItem("user");

      // Clear Google auth redirect markers
      sessionStorage.removeItem("google_auth_redirect");

      // Sign out from Firebase if user was authenticated via Google
      console.log("🔴 [Auth] Signing out from Firebase");
      await signOutFirebase();
    } catch (error) {
      console.error("❌ [Auth] Error clearing storage:", error);
    }
  }
}

/**
 * Logout from all devices/sessions
 * 
 * Phase 5: Session Management & Security
 * 
 * This function:
 * 1. Calls backend to invalidate all refresh tokens
 * 2. Clears local auth state via logout()
 * 
 * @returns Promise<boolean> - True if backend logout succeeded
 */
export async function logoutEverywhere(): Promise<boolean> {
  console.log("🔴 [Auth] logoutEverywhere called - invalidating all sessions");

  // Try to call backend logout endpoint (requires auth token in cookie)
  let backendLogoutSuccess = false;
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Send auth cookies
      body: JSON.stringify({
        logoutAll: true, // Invalidate all sessions
      }),
    });

    if (response.ok) {
      console.log("🟢 [Auth] Backend logout successful - all sessions invalidated");
      backendLogoutSuccess = true;
    } else {
      console.warn("⚠️ [Auth] Backend logout failed:", response.status);
    }
  } catch (error) {
    console.error("❌ [Auth] Backend logout error:", error);
    // Continue with local logout even if backend fails
  }

  // Always clear local state
  await logout();

  return backendLogoutSuccess;
}

/**
 * Refresh the access token using the refresh token from HTTP-only cookie
 * Tokens are managed server-side for security
 * 
 * @returns Promise<boolean> - True if refresh succeeded
 */
export async function refreshToken(): Promise<boolean> {
  console.log("[Auth] Attempting token refresh using HTTP-only cookies");

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Send refresh-token cookie
    });

    if (!response.ok) {
      console.error("[Auth] Token refresh failed:", response.status);
      if (response.status === 401 || response.status === 403) {
        // Refresh token is invalid - logout
        await logout();
      }
      return false;
    }

    const data = await response.json();
    const newAccessToken = data.data?.accessToken || data.accessToken;
    const newRefreshToken = data.data?.refreshToken || data.refreshToken;

    if (newAccessToken) {
      // Set new tokens via API (HTTP-only cookies)
      const success = await setAuthToken(newAccessToken, newRefreshToken, true);
      if (success) {
        console.log("[Auth] Token refresh successful");
        return true;
      }
    }

    console.error("[Auth] Token refresh failed - no access token in response");
    return false;
  } catch (error) {
    console.error("[Auth] Token refresh error:", error);
    return false;
  }
}
