import { signOutFirebase } from "@/lib/firebase";

// API Base URL for backend calls
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:30000/api/v1";

// Utility to check if user is authenticated (client-side)
export function isAuthenticated(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.includes("auth-token=");
}

// Get auth token from cookie
export function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/auth-token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// Get refresh token from localStorage
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
}

// Set auth token cookie (optionally persistent via Max-Age)
export function setAuthToken(token: string, remember = false) {
  console.log("🟢 [Auth] setAuthToken called with:", {
    tokenLength: token?.length,
    remember,
    hasDocument: typeof document !== "undefined",
  });

  if (typeof document === "undefined") {
    console.error(
      "❌ [Auth] Cannot set cookie - document is undefined (SSR context)"
    );
    return;
  }

  const attrs: string[] = ["Path=/"]; // same-site defaults to Lax in modern browsers
  if (remember) {
    const maxAge = 60 * 60 * 24 * 30; // 30 days
    attrs.push(`Max-Age=${maxAge}`);
  }

  const cookieString = `auth-token=${encodeURIComponent(token)}; ${attrs.join("; ")}`;
  console.log(
    "🟢 [Auth] Setting cookie:",
    cookieString.substring(0, 50) + "..."
  );
  document.cookie = cookieString;

  // Verify cookie was set
  const wasSet = document.cookie.includes("auth-token=");
  console.log("🟢 [Auth] Cookie verification - was set:", wasSet);
  if (!wasSet) {
    console.error("❌ [Auth] Failed to set auth-token cookie!");
  }
}

// Clear auth token cookie and any auth-related storage
export function logout() {
  console.log("🔴 [Auth] logout called");
  if (typeof document === "undefined") return;
  // Expire the auth cookie
  console.log("🔴 [Auth] Expiring auth-token cookie");
  document.cookie =
    "auth-token=; Path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  try {
    // Clear all auth-related storage
    console.log("🔴 [Auth] Clearing localStorage and sessionStorage");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    sessionStorage.removeItem("pendingVerificationEmail");
    sessionStorage.removeItem("resetPasswordEmail");

    // Optional: clear cached user data
    sessionStorage.removeItem("user");

    // Proactively clear client-side persisted app state
    localStorage.removeItem("mash-wishlist");
    localStorage.removeItem("cart");
    localStorage.removeItem("mash-cart"); // Current cart key
    
    // Clear Google auth redirect markers
    localStorage.removeItem("google_auth_redirect");
    sessionStorage.removeItem("google_auth_redirect");

    // Also sign out from Firebase if user was authenticated via Google
    console.log("🔴 [Auth] Signing out from Firebase");
    signOutFirebase().catch((err) => {
      console.warn("Firebase sign out failed:", err);
    });
  } catch {
    // ignore storage errors (e.g., disabled storage)
    console.error("❌ [Auth] Error clearing storage");
  }
}

/**
 * Logout from all devices/sessions
 * 
 * Phase 5: Session Management & Security
 * 
 * This function:
 * 1. Calls backend to invalidate all refresh tokens
 * 2. Clears local auth state
 * 3. Signs out from Firebase
 * 
 * @returns Promise<boolean> - True if backend logout succeeded
 */
export async function logoutEverywhere(): Promise<boolean> {
  console.log("🔴 [Auth] logoutEverywhere called - invalidating all sessions");

  const token = getAuthToken();
  const refreshToken = getRefreshToken();

  // Try to call backend logout endpoint
  let backendLogoutSuccess = false;
  
  if (token || refreshToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          refreshToken: refreshToken || undefined,
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
  }

  // Always clear local state
  logout();

  return backendLogoutSuccess;
}

/**
 * Refresh the access token using the refresh token
 * 
 * @returns Promise<string | null> - New access token or null if refresh failed
 */
export async function refreshToken(): Promise<string | null> {
  const currentRefreshToken = getRefreshToken();
  
  if (!currentRefreshToken) {
    console.log("[Auth] No refresh token available");
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });

    if (!response.ok) {
      console.error("[Auth] Token refresh failed:", response.status);
      if (response.status === 401 || response.status === 403) {
        // Refresh token is invalid - logout
        logout();
      }
      return null;
    }

    const data = await response.json();
    const newAccessToken = data.data?.accessToken || data.accessToken;
    const newRefreshToken = data.data?.refreshToken || data.refreshToken;

    if (newAccessToken) {
      setAuthToken(newAccessToken, true);
    }

    if (newRefreshToken) {
      localStorage.setItem("refreshToken", newRefreshToken);
    }

    console.log("[Auth] Token refresh successful");
    return newAccessToken;
  } catch (error) {
    console.error("[Auth] Token refresh error:", error);
    return null;
  }
}
