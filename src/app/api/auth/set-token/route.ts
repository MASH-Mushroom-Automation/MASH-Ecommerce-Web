/**
 * API Route: Set Auth & Refresh Tokens (HTTP-Only Cookies)
 * POST /api/auth/set-token
 * 
 * Sets HTTP-only cookies for authentication tokens
 * Security: httpOnly, secure (production), sameSite=lax
 * 
 * Used by:
 * - Email/Password login
 * - Token refresh
 * - Backend JWT authentication
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      accessToken, 
      refreshToken, 
      rememberMe = false 
    } = body;

    if (!accessToken) {
      return NextResponse.json(
        { message: "Access token is required" },
        { status: 400 }
      );
    }

    const isProduction = process.env.NODE_ENV === "production";

    // Determine token expiry based on rememberMe
    const accessTokenMaxAge = rememberMe
      ? 30 * 24 * 60 * 60 // 30 days if remember me
      : 7 * 24 * 60 * 60; // 7 days default

    const refreshTokenMaxAge = rememberMe
      ? 90 * 24 * 60 * 60 // 90 days if remember me
      : 30 * 24 * 60 * 60; // 30 days default

    // Create response
    const response = NextResponse.json(
      { message: "Tokens set successfully" },
      { status: 200 }
    );

    // Set auth-token cookie (HTTP-only)
    response.cookies.set({
      name: "auth-token",
      value: accessToken,
      httpOnly: true, // Prevents XSS attacks
      secure: isProduction, // HTTPS only in production
      sameSite: "lax", // CSRF protection
      maxAge: accessTokenMaxAge,
      path: "/",
    });

    // Set refresh-token cookie if provided (HTTP-only)
    if (refreshToken) {
      response.cookies.set({
        name: "refresh-token",
        value: refreshToken,
        httpOnly: true, // Prevents XSS attacks
        secure: isProduction, // HTTPS only in production
        sameSite: "lax", // CSRF protection
        maxAge: refreshTokenMaxAge,
        path: "/",
      });
    }

    console.log("[API] Auth tokens set successfully:", {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      rememberMe,
      accessTokenMaxAge,
      refreshTokenMaxAge,
    });

    return response;
  } catch (error) {
    console.error("[API] Error setting auth tokens:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
