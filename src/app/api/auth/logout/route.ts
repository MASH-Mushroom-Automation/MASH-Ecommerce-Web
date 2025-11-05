import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Logout user session
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Clear authentication cookies
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });

    // Delete auth cookies
    response.cookies.delete("authToken");
    response.cookies.delete("refreshToken");
    response.cookies.delete("user");
    
    // Clear any session storage markers
    response.cookies.set("loggedOut", "true", {
      maxAge: 1 // Expires immediately, just for signaling
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "LOGOUT_ERROR",
          message: "Failed to logout properly"
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
