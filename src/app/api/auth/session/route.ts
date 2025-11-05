import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Get session information
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NO_SESSION",
            message: "No active session found"
          }
        },
        { status: 401 }
      );
    }

    // Mock session data - in production, validate tokens with auth provider
    const session = {
      isAuthenticated: true,
      user: {
        id: "usr_123456",
        email: "user@mash.market",
        role: "customer"
      },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      device: {
        ip: request.ip || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        platform: "web"
      }
    };

    return NextResponse.json({
      success: true,
      data: session,
      message: "Session retrieved successfully",
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SESSION_ERROR",
          message: "Failed to retrieve session"
        }
      },
      { status: 500 }
    );
  }
}

// Refresh session
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NO_REFRESH_TOKEN",
            message: "No refresh token found"
          }
        },
        { status: 401 }
      );
    }

    // Mock token refresh - in production, validate with auth provider
    const newToken = `mock-token-${Date.now()}`;
    const newRefreshToken = `mock-refresh-${Date.now()}`;

    // Set new cookies
    const response = NextResponse.json({
      success: true,
      data: {
        accessToken: newToken,
        refreshToken: newRefreshToken,
        expiresIn: 3600
      },
      message: "Session refreshed successfully",
      timestamp: new Date().toISOString()
    });

    response.cookies.set("authToken", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 // 24 hours
    });

    response.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "REFRESH_FAILED",
          message: "Failed to refresh session"
        }
      },
      { status: 500 }
    );
  }
}
