/**
 * User Profile API Route
 * 
 * NOTE: For Google-authenticated users, profile data comes directly from Firebase/Firestore via AuthContext.
 * This endpoint is only used for backend email/password authenticated users.
 * 
 * For Google auth: AuthContext → Firestore → User Profile (no API call needed)
 * For Email auth: This API → Backend → User Profile
 */

import { NextRequest, NextResponse } from "next/server";
import { apiRequest } from "@/lib/api-client";
import { cookies } from "next/headers";
import type { ApiResponse, UserProfile } from "@/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:30000/api/v1";

// GET /api/user/profile - Get user profile (backend authenticated users only)
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
            message: "Authentication required. Google users should use Firebase/Firestore directly."
          }
        },
        { status: 401 }
      );
    }

    // Call real backend API
    const response = await apiRequest<ApiResponse<UserProfile>>(
      "/users/profile",
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
          message: error instanceof Error ? error.message : "Failed to fetch profile"
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// PUT /api/user/profile - Update user profile (backend authenticated users only)
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

    // Call real backend API
    const response = await apiRequest<ApiResponse<UserProfile>>(
      "/users/profile",
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
          code: "UPDATE_ERROR",
          message: error instanceof Error ? error.message : "Failed to update profile"
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
