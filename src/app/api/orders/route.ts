import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Mock orders data
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Filter orders
    let filtered = [...MOCK_ORDERS];
    
    if (status) {
      filtered = filtered.filter(order => order.status === status);
    }

    // Sort orders
    filtered.sort((a: any, b: any) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      if (sortOrder === "desc") {
        return bVal > aVal ? 1 : -1;
      }
      return aVal > bVal ? 1 : -1;
    });

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
    
    // Validate required fields
    const requiredFields = ["items", "shippingAddress", "paymentMethod"];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Missing required fields",
            details: { fields: missingFields }
          }
        },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = body.items.reduce((total: number, item: any) => {
      return total + (item.price * item.quantity);
    }, 0);
    const shipping = body.shipping || 50;
    const tax = body.tax || 0;
    const total = subtotal + shipping + tax;

    // Mock order creation
    const newOrder = {
      id: `ord_${Date.now()}`,
      orderNumber: `#${Date.now().toString().slice(-5)}`,
      status: "pending",
      items: body.items,
      subtotal,
      shipping,
      tax,
      total,
      shippingAddress: body.shippingAddress,
      billingAddress: body.billingAddress || body.shippingAddress,
      paymentMethod: body.paymentMethod,
      paymentStatus: "pending",
      trackingNumber: null,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      notes: body.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: newOrder,
      message: "Order created successfully",
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
