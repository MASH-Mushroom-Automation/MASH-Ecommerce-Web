// API route for single product - Backend integrated
import { NextRequest, NextResponse } from "next/server";
import { apiRequest } from "@/lib/api-client";
import { cookies } from "next/headers";
import type { ProductApiResponse, ApiResponse } from "@/types/api";

// GET /api/products/:id - Get product details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Call real backend API
    const response = await apiRequest<ApiResponse<ProductApiResponse>>(
      `/api/products/${id}`,
      { method: "GET" }
    );

    if (!response.success) {
      return NextResponse.json(response, { status: 404 });
    }

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
          message: error instanceof Error ? error.message : "Failed to fetch product"
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// PUT /api/products/:id - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
            message: "Authentication required to update products"
          }
        },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    
    // Call real backend API
    const response = await apiRequest<ApiResponse<ProductApiResponse>>(
      `/api/products/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(body),
      }
    );

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
          message: error instanceof Error ? error.message : "Failed to update product"
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// DELETE /api/products/:id - Delete product (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
            message: "Authentication required to delete products"
          }
        },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    // Call real backend API
    const response = await apiRequest<ApiResponse<{ message: string }>>(
      `/api/products/${id}`,
      { method: "DELETE" }
    );

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
          code: "DELETE_ERROR",
          message: error instanceof Error ? error.message : "Failed to delete product"
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
