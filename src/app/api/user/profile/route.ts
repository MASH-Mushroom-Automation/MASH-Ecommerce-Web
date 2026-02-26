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
import { FirebaseUserService } from "@/lib/firebase";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:30000/api/v1";

// GET /api/user/profile - Get user profile (backend authenticated users only)
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    // If there's no backend JWT token, but there is a Firebase session cookie, return profile from Firestore
    const firebaseUidCookie = cookieStore.get("firebase-uid")?.value;

    if (!token && firebaseUidCookie) {
      try {
        // Fetch profile from Firestore for Google-auth users
        const profile = await FirebaseUserService.getProfile(firebaseUidCookie);
        if (profile) {
          return NextResponse.json(
            {
              success: true,
              data: profile,
              timestamp: new Date().toISOString(),
              requestId: `req_${Date.now()}`,
            },
            { status: 200 },
          );
        }

        return NextResponse.json(
          {
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "Profile not found in Firestore",
            },
          },
          { status: 404 },
        );
      } catch (err) {
        console.error("[Profile API] Failed to get Firestore profile:", err);
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "FETCH_ERROR",
              message: "Failed to fetch profile from Firestore",
            },
          },
          { status: 500 },
        );
      }
    }

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message:
              "Authentication required. Google users should use Firebase/Firestore directly.",
          },
        },
        { status: 401 },
      );
    }

    const cookieHeader = request.headers.get("cookie") || "";
    // Call real backend API (forward HTTP-only cookies to backend)
    const response = await apiRequest<ApiResponse<UserProfile>>(
      "/users/profile",
      { method: "GET", headers: { Cookie: cookieHeader } },
    );

    return NextResponse.json({
      ...response,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`,
    });
  } catch (error) {
    // Check if this is a 404 (user not found in backend DB - e.g. Firebase/SSO users)
    // Return 404 gracefully instead of 500 to avoid triggering logout flows
    const isNotFound =
      error instanceof Error &&
      (error.message.includes("User not found") ||
        error.message.includes("404") ||
        (error as any).statusCode === 404);

    if (isNotFound) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "User profile not found in backend. This is expected for SSO/Firebase users.",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to fetch profile",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
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
            message: "Authentication required",
          },
        },
        { status: 401 },
      );
    }

    const body = await request.json();

    const cookieHeader = request.headers.get("cookie") || "";
    // Call real backend API (forward HTTP-only cookies to backend)
    const response = await apiRequest<ApiResponse<UserProfile>>(
      "/users/profile",
      {
        method: "PUT",
        body: JSON.stringify(body),
        headers: { Cookie: cookieHeader },
      },
    );

    return NextResponse.json({
      ...response,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPDATE_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to update profile",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
