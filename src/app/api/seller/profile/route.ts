import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";

// GET seller profile
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

    // Forward cookies and auth token to backend
    const cookieHeader = request.headers.get("cookie") || "";

    // Call real backend API
    const response = await apiRequest<ApiResponse<any>>(
      "/seller/profile",
      {
        method: "GET",
        headers: {
          Cookie: cookieHeader,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return NextResponse.json({
      ...response,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error) {
    console.error("Error fetching seller profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch seller profile"
        }
      },
      { status: 500 }
    );
  }
}

// PUT update seller profile
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

    const body = await request.json();

    // Forward cookies and auth token to backend
    const cookieHeader = request.headers.get("cookie") || "";

    // Call real backend API
    const response = await apiRequest<ApiResponse<any>>(
      "/seller/profile",
      {
        method: "PUT",
        body: JSON.stringify(body),
        headers: {
          Cookie: cookieHeader,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return NextResponse.json({
      ...response,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error) {
    console.error("Error updating seller profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPDATE_FAILED",
          message: "Failed to update seller profile"
        }
      },
      { status: 500 }
    );
  }
}
