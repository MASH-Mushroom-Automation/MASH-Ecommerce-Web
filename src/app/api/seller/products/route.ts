import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";

// GET /api/seller/products - Get seller's products
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
    
    // Build query params
    const queryParams = new URLSearchParams();
    if (searchParams.get("page")) queryParams.append("page", searchParams.get("page")!);
    if (searchParams.get("limit")) queryParams.append("limit", searchParams.get("limit")!);
    if (searchParams.get("search")) queryParams.append("search", searchParams.get("search")!);
    
    const query = queryParams.toString();
    const endpoint = query ? `/api/seller/products?${query}` : "/api/seller/products";

    // Call real backend API
    const response = await apiRequest<ApiResponse<any>>(endpoint, {
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
          message: error instanceof Error ? error.message : "Failed to fetch products"
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
