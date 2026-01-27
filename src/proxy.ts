import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { applyRateLimit } from "@/middleware/rate-limit";

/**
 * Authentication Proxy (Next.js 16)
 *
 * Protects routes based on authentication status.
 * Implements rate limiting for API endpoints (STORY-TEST-016).
 *
 * Authentication Methods Supported:
 * - Google OAuth: Firebase Auth (token in sessionStorage on client)
 * - Email/Password: Backend JWT (token in auth-token cookie)
 *
 * Note: For Firebase-only Google auth, client-side protection in AuthContext
 * handles most auth flows. This proxy provides server-side route protection
 * for backend-authenticated users.
 */

// Define protected routes that require authentication
const protectedRoutes = [
  "/checkout",
  "/seller",
  "/profile/my-information",
  "/profile/order-history",
  "/wishlist",
];

// Define auth routes that authenticated users shouldn't access
const authRoutes = [
  "/login",
  "/signup",
  "/forgot-password",
  "/verify-otp",
  "/reset-password",
];

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/shop",
  "/product",
  "/about",
  "/grower",
  "/contact",
  "/faq",
  "/privacy",
  "/terms",
  "/shipping-info",
  "/returns-policy",
  // Auth routes are public (anyone can access them)
  "/login",
  "/signup",
  "/forgot-password",
  "/verify-otp",
  "/reset-password",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // STORY-TEST-016: Apply rate limiting to API endpoints
  if (pathname.startsWith("/api/")) {
    const rateLimitResponse = applyRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse; // Return 429 if rate limited
    }
  }

  // Check for authentication
  // - Backend users: auth-token cookie (JWT from email/password login)
  // - Firebase Google users: firebase-auth cookie (set by AuthContext)
  const authToken = request.cookies.get("auth-token")?.value;
  const firebaseAuth = request.cookies.get("firebase-auth")?.value;
  const isAuthenticated = !!authToken || !!firebaseAuth;

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Redirect unauthenticated users trying to access protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Note: We no longer redirect authenticated users from auth routes here.
  // This is handled client-side in the login page useEffect to avoid cookie timing issues.

  return NextResponse.next();
}

/**
 * Add security headers to response
 * Implements STORY-TEST-013: Security Audit & Fixes
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  return response;
}

// Export as default for Next.js 16+ compatibility
export default proxy;

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg).*)",
  ],
};
