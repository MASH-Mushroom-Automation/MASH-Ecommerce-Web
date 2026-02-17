/**
 * API Route: Send 2FA OTP Code
 * POST /api/auth/2fa/send
 *
 * Sends (or resends) an OTP code to the user's registered phone number
 * for two-factor authentication during login.
 *
 * Body: { tempToken: string }
 * Returns: { success: true, message: "OTP sent" } or error
 */

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:30000/api/v1";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tempToken } = body;

    if (!tempToken || typeof tempToken !== "string") {
      return NextResponse.json(
        { error: "Temporary token is required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/auth/2fa/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tempToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage =
        data.error?.message || data.message || "Failed to send OTP";
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: data.message || "OTP sent",
      ...data,
    });
  } catch (error) {
    console.error("[API] Error sending 2FA OTP:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
