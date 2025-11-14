import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { ApiResponse } from "@/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_ENDPOINT ||
  "http://localhost:3000/";

// POST /api/user/avatar - Upload user avatar
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    // Get the form data from the request
    const formData = await request.formData();

    // Forward the multipart/form-data body directly to the backend
    const res = await fetch(`${API_BASE_URL}/api/users/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type - let fetch set it with boundary for multipart
      },
      body: formData,
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UPLOAD_FAILED",
            message: "Failed to upload avatar",
            details: json,
          },
        },
        { status: res.status }
      );
    }

    const data = json?.data ?? json;
    return NextResponse.json({
      success: true,
      data,
      message: "Avatar uploaded successfully",
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPLOAD_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to upload avatar",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
