/**
 * API Route: Enable Two-Factor Authentication
 * POST /api/auth/2fa/enable
 *
 * Enables 2FA for the authenticated user by proxying to the NestJS backend.
 * Requires a valid auth token in cookies or Authorization header.
 *
 * Returns: { success: true } or error
 */

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:30000/api/v1";

function extractToken(request: NextRequest): string | null {
  // Try auth-token cookie first
  const cookieToken = request.cookies.get("auth-token")?.value;
  if (cookieToken) return cookieToken;

  // Fall back to Authorization header
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request);

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_URL}/auth/2fa/enable`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage =
        data.error?.message || data.message || "Failed to enable 2FA";
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error("[API] Error enabling 2FA:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
