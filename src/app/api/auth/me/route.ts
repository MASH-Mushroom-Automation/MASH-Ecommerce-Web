import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Get current authenticated user
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
            message: "No authentication token found"
          }
        },
        { status: 401 }
      );
    }

    // Mock user data for development
    // In production, verify JWT and fetch from database
    const mockUser = {
      id: "usr_123456",
      email: "user@mash.market",
      firstName: "John",
      lastName: "Grower",
      role: "customer",
      isSeller: false,
      avatar: "/profile_placeholder.png",
      preferences: {
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        theme: "light",
        language: "en"
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: mockUser,
      message: "User retrieved successfully",
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to retrieve user information"
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Update current user profile
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    
    // Validate input
    const allowedFields = ["firstName", "lastName", "phone", "bio", "preferences"];
    const updates: any = {};
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    // Mock update - in production, update database
    const updatedUser = {
      id: "usr_123456",
      email: "user@mash.market",
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "Profile updated successfully",
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPDATE_FAILED",
          message: "Failed to update profile"
        }
      },
      { status: 500 }
    );
  }
}
