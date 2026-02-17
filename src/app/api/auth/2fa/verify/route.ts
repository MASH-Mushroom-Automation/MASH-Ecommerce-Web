/**
 * API Route: Verify Two-Factor Authentication Code
 * POST /api/auth/2fa/verify
 *
 * Verifies a 2FA OTP code during login. Uses the temporary token
 * issued after successful email/password authentication.
 *
 * Body: { code: string, tempToken: string, rememberDevice?: boolean }
 * Returns: { accessToken, refreshToken, user } or error
 */

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:30000/api/v1";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, tempToken, rememberDevice } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "OTP code is required" },
        { status: 400 }
      );
    }

    if (!tempToken || typeof tempToken !== "string") {
      return NextResponse.json(
        { error: "Temporary token is required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/auth/2fa/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tempToken}`,
      },
      body: JSON.stringify({ code, rememberDevice: !!rememberDevice }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage =
        data.error?.message || data.message || "Invalid 2FA code";
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Error verifying 2FA code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
