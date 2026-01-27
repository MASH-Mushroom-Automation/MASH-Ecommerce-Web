import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:30000/api/v1";

// GET /api/seller/verification-status - Check seller verification status
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    console.log("[Seller-Verification] Status check requested");
    console.log("[Seller-Verification] Has auth token:", !!token);

    if (!token) {
      console.log("[Seller-Verification] No auth token found in cookies");
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required. Please sign in again.",
          },
        },
        { status: 401 },
      );
    }

    // Forward request to backend
    const backendUrl = `${API_URL}/seller-verification/status`;
    console.log("[Seller-Verification] Forwarding to:", backendUrl);

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log(
      "[Seller-Verification] Backend response status:",
      response.status,
    );
    console.log(
      "[Seller-Verification] Backend response:",
      JSON.stringify(data, null, 2),
    );

    // If backend returns 404, user has no application
    if (response.status === 404) {
      return NextResponse.json(
        {
          success: true,
          data: {
            hasApplication: false,
            status: null,
          },
        },
        { status: 200 },
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "BACKEND_ERROR",
            message: data.message || "Failed to check verification status",
          },
        },
        { status: response.status },
      );
    }

    // Parse the nested backend response structure
    // Backend returns: { data: { hasApplication, data: { applicationStatus, ... } } }
    const backendData = data.data || data;
    const applicationData = backendData.data || backendData;

    // Return the verification status
    return NextResponse.json({
      success: true,
      data: {
        hasApplication: backendData.hasApplication ?? true,
        status: applicationData.applicationStatus || applicationData.status,
        applicationId: applicationData.requestId || applicationData.id,
        submittedAt: applicationData.submittedAt || applicationData.createdAt,
        reviewedAt: applicationData.processedAt || applicationData.reviewedAt,
        rejectionReason: applicationData.rejectionReason,
        businessInfo: applicationData.businessInfo,
        progressPercentage: applicationData.progressPercentage,
        nextSteps: applicationData.nextSteps,
        estimatedCompletionTime: applicationData.estimatedCompletionTime,
      },
    });
  } catch (error) {
    console.error("[Seller-Verification] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to check verification status",
        },
      },
      { status: 500 },
    );
  }
}
