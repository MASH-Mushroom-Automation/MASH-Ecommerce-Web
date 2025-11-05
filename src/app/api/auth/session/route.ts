import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";

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

    // Call real backend API
    const response = await apiRequest<ApiResponse<any>>(
      "/api/auth/session",
      { method: "GET" }
    );

    return NextResponse.json({
      ...response,
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

    // Call real backend API to refresh session
    const backendResponse = await apiRequest<ApiResponse<any>>(
      "/api/auth/refresh",
      {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      }
    );

    if (!backendResponse.success || !backendResponse.data) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "REFRESH_FAILED",
            message: "Failed to refresh session"
          }
        },
        { status: 401 }
      );
    }

    // Set new cookies from backend response
    const response = NextResponse.json({
      ...backendResponse,
      timestamp: new Date().toISOString()
    });

    if (backendResponse.data.accessToken) {
      response.cookies.set("authToken", backendResponse.data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 // 24 hours
      });
    }

    if (backendResponse.data.refreshToken) {
      response.cookies.set("refreshToken", backendResponse.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });
    }

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
