import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";

// PUT update password
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value || cookieStore.get("auth-token")?.value;

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

    // Validate required fields
    if (!body.currentPassword || !body.newPassword) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Current password and new password are required",
            details: {
              required: ["currentPassword", "newPassword"]
            }
          }
        },
        { status: 400 }
      );
    }

    // Validate password strength
    if (body.newPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Password must be at least 8 characters long",
            details: {
              field: "newPassword",
              minLength: 8
            }
          }
        },
        { status: 400 }
      );
    }

    const response = await apiRequest<ApiResponse<any>>("/api/seller/password", { method: "PUT", body: JSON.stringify(body) });
    return NextResponse.json({ ...response, timestamp: new Date().toISOString(), requestId: `req_${Date.now()}` });
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPDATE_FAILED",
          message: "Failed to update password"
        }
      },
      { status: 500 }
    );
  }
}
