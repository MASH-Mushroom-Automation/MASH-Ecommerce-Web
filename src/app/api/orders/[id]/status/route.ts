import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

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

    if (!body.status) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Status is required",
            details: { fields: ["status"] }
          }
        },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid status",
            details: { validStatuses }
          }
        },
        { status: 400 }
      );
    }

    // TODO: Replace with real database update
    const updatedOrder = {
      id,
      status: body.status,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: "Order status updated successfully",
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPDATE_ERROR",
          message: error instanceof Error ? error.message : "Failed to update order status"
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
