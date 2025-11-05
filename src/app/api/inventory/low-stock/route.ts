import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

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

    // TODO: Replace with real database query
    const lowStockProducts = [
      {
        id: "prod_1",
        name: "Fresh White Oyster Mushrooms",
        quantity: 5,
        threshold: 20,
        lastUpdated: new Date().toISOString()
      },
      {
        id: "prod_2",
        name: "Dried Shiitake Mushrooms",
        quantity: 8,
        threshold: 15,
        lastUpdated: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      data: lowStockProducts,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_ERROR",
          message: error instanceof Error ? error.message : "Failed to fetch low stock products"
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
