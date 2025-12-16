import { signOutFirebase } from "@/lib/firebase";

// Utility to check if user is authenticated (client-side)
export function isAuthenticated(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.includes("auth-token=");
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
