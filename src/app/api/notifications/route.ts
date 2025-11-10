import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Mock notifications data
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const unreadOnly = searchParams.get("unread") === "true";
    const type = searchParams.get("type");

    // Filter notifications
    let filtered = [...MOCK_NOTIFICATIONS];
    
    if (unreadOnly) {
      filtered = filtered.filter(n => !n.read);
    }
    
    if (type) {
      filtered = filtered.filter(n => n.type === type);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginated = filtered.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginated,
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
        hasNext: endIndex < filtered.length,
        hasPrev: page > 1
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
    
    // Mock preferences update
    const preferences = {
      email: body.email !== false,
      push: body.push !== false,
      sms: body.sms || false,
      types: {
        orders: body.types?.orders !== false,
        alerts: body.types?.alerts !== false,
        system: body.types?.system !== false,
        marketing: body.types?.marketing || false,
        device: body.types?.device !== false
      },
      quiet: {
        enabled: body.quiet?.enabled || false,
        startTime: body.quiet?.startTime || "22:00",
        endTime: body.quiet?.endTime || "08:00"
      }
    };

    return NextResponse.json({
      success: true,
      data: preferences,
      message: "Notification preferences updated",
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
