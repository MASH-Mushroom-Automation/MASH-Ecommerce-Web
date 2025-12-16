import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";

// GET /api/user/onboarding - Get onboarding data
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

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

    // Call real backend API
    const response = await apiRequest<ApiResponse<any>>(
      "/api/users/onboarding",
      { method: "GET" }
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
          code: "FETCH_ERROR",
          message: error instanceof Error ? error.message : "Failed to fetch onboarding data"
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// PUT /api/user/onboarding - Update onboarding data
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

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

    const data = await request.json();

    // Call real backend API
    const response = await apiRequest<ApiResponse<any>>(
      "/api/users/onboarding",
      {
        method: "PUT",
        body: JSON.stringify(data),
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
          code: "UPDATE_ERROR",
          message: error instanceof Error ? error.message : "Failed to update onboarding data"
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST /api/user/onboarding - Complete onboarding
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

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

    // Call real backend API
    const response = await apiRequest<ApiResponse<any>>(
      "/api/users/onboarding/complete",
      { method: "POST" }
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
          code: "COMPLETE_ERROR",
          message: error instanceof Error ? error.message : "Failed to complete onboarding"
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
