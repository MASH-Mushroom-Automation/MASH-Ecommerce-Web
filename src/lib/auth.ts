// Utility to check if user is authenticated (client-side)
export function isAuthenticated(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.includes("auth-token=");
}
