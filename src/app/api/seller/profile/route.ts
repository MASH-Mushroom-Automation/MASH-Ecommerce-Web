import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Mock seller profile data
const MOCK_SELLER_PROFILE = {
  id: "seller_123456",
  userId: "usr_123456",
  name: "Fungi Fresh Farms",
  email: "contact@fungifreshfarms.com",
  phone: "09123456789",
  description: "Urban-grown gourmet mushrooms for the modern kitchen.",
  website: "https://fungifreshfarms.com",
  location: "Caloocan City, Metro Manila",
  logo: "/placeholder.png",
  banner: "/placeholder.png",
  coords: {
    lat: 14.6507,
    lng: 120.9622
  },
  isVerified: true,
  rating: 4.8,
  reviewCount: 127,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// GET seller profile
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

    // In production, fetch from backend with token
    // For now, return mock data
    return NextResponse.json({
      success: true,
      data: MOCK_SELLER_PROFILE,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error) {
    console.error("Error fetching seller profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch seller profile"
        }
      },
      { status: 500 }
    );
  }
}

// PUT update seller profile
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
    const allowedFields = [
      "name",
      "email",
      "phone",
      "description",
      "website",
      "location",
      "logo",
      "banner",
      "coords"
    ];

    const updates: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    // In production, update backend
    // For now, merge with mock data
    const updatedProfile = {
      ...MOCK_SELLER_PROFILE,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: "Seller profile updated successfully",
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error) {
    console.error("Error updating seller profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPDATE_FAILED",
          message: "Failed to update seller profile"
        }
      },
      { status: 500 }
    );
  }
}
