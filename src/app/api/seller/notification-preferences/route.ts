import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Mock notification preferences
const MOCK_NOTIFICATION_PREFERENCES = {
  notifyNewOrders: true,
  notifyMessages: true,
  notifyUpdates: false,
  notifyLowStock: true,
  notifyReviews: true,
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  updatedAt: new Date().toISOString()
};

// GET notification preferences
export async function GET(request: NextRequest) {
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

    return NextResponse.json({
      success: true,
      data: MOCK_NOTIFICATION_PREFERENCES,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
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

    // Allow updating any boolean notification preference
    const allowedFields = [
      "notifyNewOrders",
      "notifyMessages",
      "notifyUpdates",
      "notifyLowStock",
      "notifyReviews",
      "emailNotifications",
      "pushNotifications",
      "smsNotifications"
    ];

    const updates: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined && typeof body[field] === "boolean") {
        updates[field] = body[field];
      }
    }

    // In production, update backend
    const updatedPreferences = {
      ...MOCK_NOTIFICATION_PREFERENCES,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: updatedPreferences,
      message: "Notification preferences updated successfully",
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
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
