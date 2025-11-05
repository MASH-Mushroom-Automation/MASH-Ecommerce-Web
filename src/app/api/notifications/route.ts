import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";

// Mock notifications data (fallback)
const MOCK_NOTIFICATIONS = [
  {
    id: "notif_1",
    type: "order",
    title: "Order Shipped",
    message: "Your order #12345 has been shipped and is on its way!",
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    icon: "📦",
    actionUrl: "/orders/12345"
  },
  {
    id: "notif_2",
    type: "alert",
    title: "New Grower Near You",
    message: "FungiFreshFarms just started selling in your area",
    read: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    icon: "🍄",
    actionUrl: "/grower/FungiFreshFarms"
  },
  {
    id: "notif_3",
    type: "system",
    title: "Welcome to MASH!",
    message: "Thank you for joining our marketplace. Start exploring fresh mushrooms from local growers.",
    read: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    icon: "👋",
    actionUrl: "/shop"
  },
  {
    id: "notif_4",
    type: "device",
    title: "Device Alert",
    message: "Your growing kit temperature is above optimal range",
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    icon: "⚠️",
    actionUrl: "/devices",
    priority: "high"
  }
];

// Get user notifications
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

    const { searchParams } = new URL(request.url);
    
    // Build query params for backend
    const queryParams = new URLSearchParams();
    if (searchParams.get("page")) queryParams.append("page", searchParams.get("page")!);
    if (searchParams.get("limit")) queryParams.append("limit", searchParams.get("limit")!);
    if (searchParams.get("unread")) queryParams.append("unread", searchParams.get("unread")!);
    if (searchParams.get("type")) queryParams.append("type", searchParams.get("type")!);
    
    const query = queryParams.toString();
    const endpoint = query ? `/api/notifications?${query}` : "/api/notifications";

    // Call real backend API
    const response = await apiRequest<ApiResponse<any>>(endpoint, { method: "GET" });

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
          message: "Failed to fetch notifications"
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Update notification preferences
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
            message: "Authentication required"
          }
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Call real backend API
    const response = await apiRequest<ApiResponse<any>>("/api/notifications/preferences", {
      method: "POST",
      body: JSON.stringify(body),
    });

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
          message: "Failed to update preferences"
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
