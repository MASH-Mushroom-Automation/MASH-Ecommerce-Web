import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createProduct, ProductFormData, fetchSellerProducts } from "@/lib/sanity/products";
import type { UploadedImage } from "@/components/seller/product-form/ImageUploader";
import type { ProductVariant } from "@/components/seller/product-form/VariantManager";
import { getUserIdFromToken } from "@/lib/jwt";

// Helper function to get current user ID from JWT token
async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return null;
    }

    // Extract user ID directly from JWT token (sub field)
    const userId = getUserIdFromToken(token);
    return userId;
  } catch (error) {
    console.error("Error getting current user ID:", error);
    return null;
  }
}

// POST /api/seller/products - Create a new product in Sanity
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required to create products",
          },
        },
        { status: 401 }
      );
    }

    // Get current user ID
    const sellerId = await getCurrentUserId();
    if (!sellerId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Unable to identify seller account",
          },
        },
        { status: 401 }
      );
    }

    // Parse the request body
    // The form will send JSON with image data (either File objects as base64 or already uploaded asset IDs)
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.description || !body.category || body.price === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Missing required fields: name, description, category, or price",
          },
        },
        { status: 400 }
      );
    }

    // Validate images
    if (!body.images || body.images.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "At least one product image is required",
          },
        },
        { status: 400 }
      );
    }

    // Validate variants if enabled
    if (body.hasVariants && (!body.variants || body.variants.length === 0)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "At least one variant is required when variants are enabled",
          },
        },
        { status: 400 }
      );
    }

    // Prepare product data
    // Images should already have sanityAssetId if uploaded via the upload-image endpoint
    // or have file data that will be uploaded during product creation
    const productData: ProductFormData = {
      name: body.name,
      description: body.description,
      category: body.category,
      price: body.price,
      compareAtPrice: body.compareAtPrice,
      quantity: body.quantity || 0,
      trackInventory: body.trackInventory !== false,
      hasVariants: body.hasVariants || false,
      variants: body.hasVariants ? body.variants : undefined,
      images: body.images as UploadedImage[],
      sku: body.sku,
      weight: body.weight,
      seo: body.seo,
      isAvailable: body.isAvailable !== false,
    };

    // Create product in Sanity (this will handle image uploads server-side)
    // Pass sellerId to link product to the current seller
    const result = await createProduct(productData, sellerId);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: result._id,
          slug: result.slug,
          message: "Product created successfully",
        },
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CREATE_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to create product",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// GET /api/seller/products - Get seller's products from Sanity
export async function GET(request: NextRequest) {
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

    // Get current user ID to filter products
    const sellerId = await getCurrentUserId();
    if (!sellerId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Unable to identify seller account"
          }
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Build query params
    const params = {
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
      search: searchParams.get("search") || undefined,
      sellerId: sellerId, // Filter by current seller
    };

    // Fetch products from Sanity filtered by seller ID
    const result = await fetchSellerProducts(params);

    return NextResponse.json({
      data: result.products,
      success: true,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error) {
    console.error("Error fetching seller products:", error);
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
