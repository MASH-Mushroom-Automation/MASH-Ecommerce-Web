import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "next-sanity";
import { projectId, dataset } from "@/lib/sanity/client";

// POST /api/seller/products/upload-image - Upload product image to Sanity
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
            message: "Authentication required to upload images",
          },
        },
        { status: 401 }
      );
    }

    // Get the write token from environment (server-side only)
    const writeToken =
      process.env.SANITY_API_WRITE_TOKEN ||
      process.env.SANITY_AUTH_TOKEN;

    if (!writeToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CONFIG_ERROR",
            message: "Sanity write token not configured",
          },
        },
        { status: 500 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const alt = formData.get("alt") as string | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "No file provided",
          },
        },
        { status: 400 }
      );
    }

    // Convert File to Buffer for Sanity client
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create write-enabled Sanity client
    const writeClient = createClient({
      projectId,
      dataset,
      apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-26",
      useCdn: false, // Don't use CDN for write operations
      token: writeToken,
    });

    // Upload image using Sanity client's asset upload method
    const asset = await writeClient.assets.upload("image", buffer, {
      filename: file.name,
      contentType: file.type,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          assetId: asset._id,
          url: asset.url,
          alt: alt || "",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPLOAD_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to upload image",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

