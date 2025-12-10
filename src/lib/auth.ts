import { signOutFirebase } from "@/lib/firebase";

// Utility to check if user is authenticated (client-side)
export function isAuthenticated(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.includes("auth-token=");
}

// Set auth token cookie (optionally persistent via Max-Age)
export function setAuthToken(token: string, remember = false) {
  if (typeof document === "undefined") return;
  const attrs: string[] = ["Path=/"]; // same-site defaults to Lax in modern browsers
  if (remember) {
    const maxAge = 60 * 60 * 24 * 30; // 30 days
    attrs.push(`Max-Age=${maxAge}`);
  }
  document.cookie = `auth-token=${encodeURIComponent(token)}; ${attrs.join(
    "; "
  )}`;
}

// Clear auth token cookie and any auth-related storage
export function logout() {
  if (typeof document === "undefined") return;
  // Expire the auth cookie
  document.cookie =
    "auth-token=; Path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  try {
    // Clear all auth-related storage
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    sessionStorage.removeItem("pendingVerificationEmail");
    sessionStorage.removeItem("resetPasswordEmail");
    
    // Optional: clear cached user data
    sessionStorage.removeItem("user");
    
    // Proactively clear client-side persisted app state
    localStorage.removeItem("mash-wishlist");
    localStorage.removeItem("cart");
    
    // Also sign out from Firebase if user was authenticated via Google
    signOutFirebase().catch((err) => {
      console.warn("Firebase sign out failed:", err);
    });
  } catch {
    // ignore storage errors (e.g., disabled storage)
  }
}
