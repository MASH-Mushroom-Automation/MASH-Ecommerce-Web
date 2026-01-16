import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Authentication Proxy (Next.js 16)
 * 
 * Protects routes based on authentication status.
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
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for authentication
  // - Backend users: auth-token cookie (JWT)
  // - Firebase Google users: Client-side only (checked in AuthContext)
  const authToken = request.cookies.get("auth-token")?.value;
  const isAuthenticated = !!authToken;

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Redirect unauthenticated users trying to access protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users trying to access auth routes
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/shop", request.url));
  }

  // Allow access to public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  return NextResponse.next();
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
