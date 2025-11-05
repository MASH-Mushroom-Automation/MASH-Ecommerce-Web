import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";

// Mock orders data (fallback only - will be removed when backend is stable)
const MOCK_ORDERS = [
  {
    id: "ord_001",
    orderNumber: "#12345",
    status: "processing",
    items: [
      {
        id: "item_1",
        productId: "1",
        name: "Fresh White Oyster Mushrooms",
        quantity: 2,
        price: 120,
        weight: "250g",
        image: "/white.jpg"
      }
    ],
    subtotal: 240,
    shipping: 50,
    tax: 0,
    total: 290,
    shippingAddress: {
      name: "John Grower",
      street: "UCC Congressional Campus",
      city: "Quezon City",
      province: "Metro Manila",
      postalCode: "1100",
      country: "Philippines",
      phone: "+63 956 955 2608"
    },
    paymentMethod: "GCash",
    paymentStatus: "paid",
    trackingNumber: null,
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "ord_002",
    orderNumber: "#12344",
    status: "delivered",
    items: [
      {
        id: "item_2",
        productId: "4",
        name: "White Oyster Mushroom Growing Kit",
        quantity: 1,
        price: 350,
        weight: "2kg",
        image: "/kit-1.jpg"
      }
    ],
    subtotal: 350,
    shipping: 80,
    tax: 0,
    total: 430,
    shippingAddress: {
      name: "John Grower",
      street: "UCC Congressional Campus",
      city: "Quezon City",
      province: "Metro Manila",
      postalCode: "1100",
      country: "Philippines",
      phone: "+63 956 955 2608"
    },
    paymentMethod: "Maya",
    paymentStatus: "paid",
    trackingNumber: "TRK123456789",
    deliveredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Get user orders
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
    if (searchParams.get("status")) queryParams.append("status", searchParams.get("status")!);
    if (searchParams.get("sortBy")) queryParams.append("sortBy", searchParams.get("sortBy")!);
    if (searchParams.get("sortOrder")) queryParams.append("sortOrder", searchParams.get("sortOrder")!);
    
    const query = queryParams.toString();
    const endpoint = query ? `/api/orders?${query}` : "/api/orders";
    
    // Call real backend API
    const response = await apiRequest<ApiResponse<any[]>>(endpoint, {
      method: "GET",
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
          code: "FETCH_ERROR",
          message: "Failed to fetch orders"
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Create new order
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
    
    // Call real backend API to create order
    const response = await apiRequest<ApiResponse<any>>("/api/orders", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return NextResponse.json({
      ...response,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CREATE_ERROR",
          message: error instanceof Error ? error.message : "Failed to create order"
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
