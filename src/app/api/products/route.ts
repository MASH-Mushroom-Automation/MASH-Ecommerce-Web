// API route for products - ready for CMS integration
import { NextRequest, NextResponse } from "next/server";
import { ProductsApi } from "@/lib/api/products";
import { cookies } from "next/headers";

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

    const response = await ProductsApi.getProducts(params);
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
    
    // Validate required fields
    const requiredFields = ["name", "description", "price", "category", "weight"];
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

    // Mock product creation
    const newProduct = {
      id: `prod_${Date.now()}`,
      ...body,
      grower: body.grower || "Default Grower",
      images: body.images || [],
      image: body.images?.[0] || "/placeholder.png",
      inStock: body.inStock !== false,
      tag: body.tag || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: newProduct,
      message: "Product created successfully",
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
