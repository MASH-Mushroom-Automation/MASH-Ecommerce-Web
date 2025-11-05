// API route for products - Backend integrated
import { NextRequest, NextResponse } from "next/server";
import { apiRequest } from "@/lib/api-client";
import { cookies } from "next/headers";
import type { ProductApiResponse, ApiResponse } from "@/types/api";

// Get all products with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const params = {
      page: searchParams.get("page")
        ? parseInt(searchParams.get("page")!)
        : undefined,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : undefined,
      category: searchParams.get("category") || undefined,
      grower: searchParams.get("grower") || undefined,
      minPrice: searchParams.get("minPrice")
        ? parseFloat(searchParams.get("minPrice")!)
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? parseFloat(searchParams.get("maxPrice")!)
        : undefined,
      search: searchParams.get("search") || undefined,
      sortBy: searchParams.get("sortBy") as
        | "name"
        | "price"
        | "createdAt"
        | undefined,
      sortOrder: searchParams.get("sortOrder") as "asc" | "desc" | undefined,
    };

    // Build query string for backend
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.category) queryParams.append("category", params.category);
    if (params.grower) queryParams.append("grower", params.grower);
    if (params.minPrice) queryParams.append("minPrice", params.minPrice.toString());
    if (params.maxPrice) queryParams.append("maxPrice", params.maxPrice.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const query = queryParams.toString();
    const endpoint = query ? `/api/products?${query}` : "/api/products";
    
    // Call real backend API
    const response = await apiRequest<ApiResponse<ProductApiResponse[]>>(endpoint, {
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

// Create a new product (sellers only)
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
            message: "Authentication required to create products"
          }
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Call real backend API to create product
    const response = await apiRequest<ApiResponse<ProductApiResponse>>("/api/products", {
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
          message: error instanceof Error ? error.message : "Failed to create product"
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
