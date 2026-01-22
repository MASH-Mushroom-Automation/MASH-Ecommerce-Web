/**
 * API Route: Clear Auth & Refresh Tokens (Logout)
 * POST /api/auth/clear-tokens
 * 
 * Clears HTTP-only authentication cookies
 * Used during logout to ensure complete session cleanup
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json(
      { message: "Tokens cleared successfully" },
      { status: 200 }
    );

    // Clear auth-token cookie
    response.cookies.set({
      name: "auth-token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
      path: "/",
    });

    // Clear refresh-token cookie
    response.cookies.set({
      name: "refresh-token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
      path: "/",
    });

    console.log("[API] Auth tokens cleared successfully");

    return response;
  } catch (error) {
    console.error("[API] Error clearing tokens:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
