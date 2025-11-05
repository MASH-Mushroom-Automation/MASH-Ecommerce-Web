import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // TODO: Replace with real database call
    const order = {
      id,
      orderNumber: `#${id.slice(-5)}`,
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
        street: "123 Mushroom St",
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: order,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_ERROR",
          message: error instanceof Error ? error.message : "Failed to fetch order"
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const body = await request.json();

    // TODO: Replace with real database update
    const updatedOrder = {
      id,
      ...body,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: "Order updated successfully",
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPDATE_ERROR",
          message: error instanceof Error ? error.message : "Failed to update order"
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
