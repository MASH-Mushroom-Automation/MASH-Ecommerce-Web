/**
 * API Route: Get Auth & Refresh Tokens from HTTP-Only Cookies
 * GET /api/auth/get-token
 * 
 * Reads HTTP-only cookies and returns token values
 * This allows client-side code to check token existence without direct access
 * 
 * Security: Tokens themselves stay in HTTP-only cookies (XSS protection)
 * Only returns existence status and expiry info, not full token values
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get("auth-token");
    const refreshToken = request.cookies.get("refresh-token");

    // Return token existence status only (not full values for security)
    return NextResponse.json(
      {
        hasAuthToken: !!authToken,
        hasRefreshToken: !!refreshToken,
        authTokenExists: !!authToken?.value,
        refreshTokenExists: !!refreshToken?.value,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API] Error getting token info:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
