import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  fetchProductById,
  updateProduct,
  ProductFormData,
} from "@/lib/sanity/products";
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

// GET /api/seller/products/[id] - Get single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
            message: "Authentication required",
          },
        },
        { status: 401 },
      );
    }

    const { id } = await params;

    // Get current user ID to verify ownership
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
        { status: 401 },
      );
    }

    // Fetch product with seller verification
    const product = await fetchProductById(id, sellerId);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message:
              "Product not found or you don't have permission to view it",
          },
        },
        { status: 404 },
      );
    }

    // Transform to match expected format
    return NextResponse.json({
      success: true,
      data: {
        id: product._id,
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        stock: product.stock,
        sku: product.sku,
        weight: product.weight,
        isAvailable: product.isAvailable,
        hasVariants: product.hasVariants,
        image: product.mainImage || product.images?.[0] || "",
        mainImageRef: product.mainImageRef || undefined,
        images: product.images || [],
        imageRefs: product.imageRefs || [],
        slug: product.slug,
        seo: product.seo,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to fetch product",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

// PUT /api/seller/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
            message: "Authentication required to update products",
          },
        },
        { status: 401 },
      );
    }

    const { id } = await params;

    // Get current user ID to verify ownership
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
        { status: 401 },
      );
    }

    // Parse the request body
    const body = await request.json();

    // Validate required fields
    if (
      !body.name ||
      !body.description ||
      !body.category ||
      body.price === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message:
              "Missing required fields: name, description, category, or price",
          },
        },
        { status: 400 },
      );
    }

    // Prepare product data
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

    // Update product in Sanity (with seller verification)
    const result = await updateProduct(id, productData, sellerId);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: result._id,
          slug: result.slug,
          message: "Product updated successfully",
        },
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}`,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPDATE_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to update product",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
