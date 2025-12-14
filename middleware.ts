import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
  "/catalog",
  "/product",
  "/about",
  "/grower",
  "/stores",
  "/shop",
  "/contact",
  "/faq",
  "/privacy",
  "/terms",
  "/shipping-info",
  "/returns-policy",
];

// All routes are now public - no authentication checks
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes (including webhooks)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  console.log("🔶 [Middleware] Accessed for path:", pathname);

  // Get authentication token from cookies
  // TODO: Replace with your actual auth token name
  const authToken = request.cookies.get("auth-token")?.value;
  const isAuthenticated = !!authToken;
  console.log("🔶 [Middleware] Auth token present:", !!authToken);
  console.log("🔶 [Middleware] Is authenticated:", isAuthenticated);

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  console.log("🔶 [Middleware] Is protected route:", isProtectedRoute);

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  console.log("🔶 [Middleware] Is auth route:", isAuthRoute);

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );
  console.log("🔶 [Middleware] Is public route:", isPublicRoute);

  // Redirect unauthenticated users trying to access protected routes
  if (isProtectedRoute && !isAuthenticated) {
    console.log(
      "🔶 [Middleware] Redirecting to login - protected route without auth"
    );
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users trying to access auth routes
  if (isAuthRoute && isAuthenticated) {
    console.log(
      "🔶 [Middleware] Redirecting to catalog - authenticated user on auth route"
    );
    return NextResponse.redirect(new URL("/catalog", request.url));
  }

  console.log("🔶 [Middleware] Allowing access to route");

  // Allow access to public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Allow access to all routes
  return NextResponse.next();
}
