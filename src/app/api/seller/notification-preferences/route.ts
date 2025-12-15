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

    const response = await apiRequest<ApiResponse<any>>("/api/seller/notification-preferences", { method: "GET" });
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
    const response = await apiRequest<ApiResponse<any>>("/api/seller/notification-preferences", { method: "PUT", body: JSON.stringify(body) });
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
