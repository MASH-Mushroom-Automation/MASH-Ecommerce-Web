import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Get unread notification count
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

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

    // Mock unread count - in production, query from database
    const unreadCount = 3; // Simulating 3 unread notifications
    
    return NextResponse.json({
      success: true,
      data: {
        count: unreadCount,
        hasUnread: unreadCount > 0
      },
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_ERROR",
          message: "Failed to fetch unread count"
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
