import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(
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

    if (typeof body.threshold !== "number") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Threshold must be a number",
            details: { fields: ["threshold"] }
          }
        },
        { status: 400 }
      );
    }

    // TODO: Replace with real database update
    const stockAlert = {
      productId: id,
      threshold: body.threshold,
      enabled: true,
      notifyEmail: body.notifyEmail || true,
      notifySMS: body.notifySMS || false,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: stockAlert,
      message: "Stock alert configured successfully",
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CREATE_ERROR",
          message: error instanceof Error ? error.message : "Failed to create stock alert"
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
