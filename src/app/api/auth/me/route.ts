import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse, UserProfile } from "@/types/api";

// Get current authenticated user
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    if (!token) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "No authentication token found"
          }
        },
        { status: 401 }
      );
    }

    // Call real backend API
    const response = await apiRequest<ApiResponse<UserProfile>>(
      "/api/auth/me",
      { method: "GET" }
    );

    return NextResponse.json({
      ...response,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to retrieve user information"
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Update current user profile
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    if (!token) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required"
          }
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Call real backend API
    const response = await apiRequest<ApiResponse<UserProfile>>(
      "/api/auth/profile",
      {
        method: "PUT",
        body: JSON.stringify(body),
      }
    );

    return NextResponse.json({
      ...response,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPDATE_FAILED",
          message: "Failed to update profile"
        }
      },
      { status: 500 }
    );
  }
}
