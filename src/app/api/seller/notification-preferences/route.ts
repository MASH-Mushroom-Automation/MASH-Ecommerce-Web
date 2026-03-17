import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";

// GET notification preferences
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

    const cookieHeader = request.headers.get("cookie") || "";
    const response = await apiRequest<ApiResponse<any>>("/seller/notification-preferences", {
      method: "GET",
      headers: { Cookie: cookieHeader, Authorization: `Bearer ${token}` },
    });
    return NextResponse.json({ ...response, timestamp: new Date().toISOString(), requestId: `req_${Date.now()}` });
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch notification preferences"
        }
      },
      { status: 500 }
    );
  }
}

// PUT update notification preferences
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
    const cookieHeader = request.headers.get("cookie") || "";
    const response = await apiRequest<ApiResponse<any>>("/seller/notification-preferences", {
      method: "PUT",
      body: JSON.stringify(body),
      headers: { Cookie: cookieHeader, Authorization: `Bearer ${token}` },
    });
    return NextResponse.json({ ...response, timestamp: new Date().toISOString(), requestId: `req_${Date.now()}` });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPDATE_FAILED",
          message: "Failed to update notification preferences"
        }
      },
      { status: 500 }
    );
  }
}
