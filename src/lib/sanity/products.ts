/**
 * Sanity Products API
 * Utilities for creating, updating, and managing products in Sanity CMS
 */

import { sanityClient, projectId, dataset } from "./client";
import { createClient } from "next-sanity";
import type { UploadedImage } from "@/components/seller/product-form/ImageUploader";
import type { ProductVariant } from "@/components/seller/product-form/VariantManager";

// Create a write-enabled client for mutations (server-side only)
const getWriteClient = () => {
  const writeToken =
    process.env.SANITY_API_WRITE_TOKEN ||
    process.env.SANITY_AUTH_TOKEN ||
    process.env.SANITY_API_READ_TOKEN; // Fallback to read token if write not available

  return createClient({
    projectId,
    dataset,
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-26",
    useCdn: false, // Don't use CDN for write operations
    token: writeToken,
  });
};

// Types for Sanity operations
interface SanityAsset {
  _id: string;
  url: string;
}

interface SanityImageAsset {
  _type: "image";
  asset: {
    _type: "reference";
    _ref: string;
  };
  alt?: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  category: string; // Category ID
  price: number;
  compareAtPrice?: number;
  quantity: number;
  trackInventory: boolean;
  hasVariants: boolean;
  variants?: ProductVariant[];
  images: UploadedImage[];
  sku?: string;
  weight?: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
  isAvailable?: boolean;
  isDraft?: boolean;
}

/**
 * Upload image file to Sanity Assets API (Server-side)
 * Uses server-side token for security
 */
export async function uploadImageToSanity(
  file: File | Buffer,
  filename?: string,
  contentType?: string
): Promise<SanityAsset> {
  try {
    // Get write token (server-side only)
    const writeToken =
      process.env.SANITY_API_WRITE_TOKEN ||
      process.env.SANITY_AUTH_TOKEN ||
      process.env.NEXT_PUBLIC_SANITY_API_TOKEN; // Fallback for client-side (not recommended)

    if (!writeToken) {
      throw new Error("Sanity write token not configured");
    }

    // Create form data with the image
    const formData = new FormData();
    
    // Handle both File and Buffer
    if (file instanceof File) {
      formData.append("file", file);
    } else {
      // Buffer from server-side
      const blob = new Blob([file], { type: contentType || "image/jpeg" });
      formData.append("file", blob, filename || "image.jpg");
    }

    // Upload to Sanity Assets API
    const uploadUrl = `https://${projectId}.api.sanity.io/v2021-03-25/assets/images/${dataset}`;

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${writeToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Sanity upload error:", errorText);
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      _id: data.document._id,
      url: data.document.url,
    };
  } catch (error) {
    console.error("Error uploading image to Sanity:", error);
    throw new Error("Failed to upload image. Please try again.");
  }
}

/**
 * Upload multiple images and return Sanity asset references
 * 
 * Note: Images should already have sanityAssetId set if uploaded via API route.
 * This function is primarily used server-side after images are uploaded.
 */
export async function uploadProductImages(
  images: UploadedImage[]
): Promise<SanityImageAsset[]> {
  const uploadPromises = images.map(async (image) => {
    // Use existing asset ID if available (from client-side upload)
    if (image.sanityAssetId) {
      return {
        _type: "image" as const,
        asset: {
          _type: "reference" as const,
          _ref: image.sanityAssetId,
        },
        alt: image.alt || "",
      };
    }

    // Upload new image if file is available (server-side direct upload)
    // Note: This path is mainly for server-side scripts, not the web form
    if (image.file) {
      const asset = await uploadImageToSanity(image.file);
      return {
        _type: "image" as const,
        asset: {
          _type: "reference" as const,
          _ref: asset._id,
        },
        alt: image.alt || "",
      };
    }

    // If neither asset ID nor file is available, this is an error
    throw new Error(
      `Image "${image.id}" has no file or asset ID. Images must be uploaded first.`
    );
  });

  return Promise.all(uploadPromises);
}

/**
 * Generate a unique slug for a product
 */
export async function generateUniqueSlug(name: string): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Check if slug exists
  const existingProduct = await sanityClient.fetch(
    `*[_type == "product" && slug.current == $slug][0]`,
    { slug: baseSlug }
  );

  if (!existingProduct) {
    return baseSlug;
  }

  // If slug exists, add a number suffix
  let counter = 1;
  let uniqueSlug = `${baseSlug}-${counter}`;

  while (true) {
    const exists = await sanityClient.fetch(
      `*[_type == "product" && slug.current == $slug][0]`,
      { slug: uniqueSlug }
    );

    if (!exists) {
      return uniqueSlug;
    }

    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }
}

/**
 * Create product variant in Sanity
 */
async function createProductVariant(
  productId: string,
  variant: ProductVariant,
  productName: string
): Promise<string> {
  const variantDoc = {
    _type: "productVariant",
    product: {
      _type: "reference",
      _ref: productId,
    },
    name: `${productName} - ${variant.value}`,
    slug: {
      _type: "slug",
      current: await generateUniqueSlug(`${productName}-${variant.value}`),
    },
    variantName: variant.value,
    sku: variant.sku,
    variantType: variant.type,
    variantValue: variant.value,
    price: variant.price,
    compareAtPrice: variant.compareAtPrice,
    inventory: {
      _type: "object",
      quantityInStock: variant.quantityInStock,
      trackInventory: true,
    },
    isAvailable: variant.isAvailable,
  };

  const writeClient = getWriteClient();
  const result = await writeClient.create(variantDoc);
  return result._id;
}

/**
 * Create a new product in Sanity CMS
 */
export async function createProduct(
  data: ProductFormData,
  sellerId?: string
): Promise<{ _id: string; slug: string }> {
  try {
    // Upload images
    const uploadedImages = await uploadProductImages(data.images);
    const [primaryImage, ...additionalImages] = uploadedImages;

    // Generate unique slug
    const slug = await generateUniqueSlug(data.name);

    // Create product document
    const productDoc = {
      _type: "product",
      name: data.name,
      slug: {
        _type: "slug",
        current: slug,
      },
      description: data.description,
      image: primaryImage,
      images: additionalImages,
      category: {
        _type: "reference",
        _ref: data.category,
      },
      price: data.price,
      quantity: data.quantity,
      inventory: {
        _type: "object",
        quantityInStock: data.quantity,
        trackInventory: data.trackInventory,
        lowStockThreshold: 10,
      },
      hasVariants: data.hasVariants,
      sku: data.sku || `PROD-${Date.now()}`,
      weight: data.weight,
      isAvailable: data.isAvailable !== false,
      // Store seller/user ID for filtering
      ...(sellerId && {
        sellerId: sellerId,
      }),
      ...(data.seo && {
        seo: {
          _type: "object",
          metaTitle: data.seo.metaTitle,
          metaDescription: data.seo.metaDescription,
        },
      }),
    };

    // Create the product using write client
    const writeClient = getWriteClient();
    const product = await writeClient.create(productDoc);

    // Create variants if enabled
    if (data.hasVariants && data.variants && data.variants.length > 0) {
      const variantIds = await Promise.all(
        data.variants.map((variant) =>
          createProductVariant(product._id, variant, data.name)
        )
      );

      // Update product with variant references
      await writeClient
        .patch(product._id)
        .set({
          variants: variantIds.map((id) => ({
            _type: "reference",
            _ref: id,
            _key: id,
          })),
        })
        .commit();
    }

    return {
      _id: product._id,
      slug: slug,
    };
  } catch (error) {
    console.error("Error creating product:", error);
    throw new Error("Failed to create product. Please try again.");
  }
}

/**
 * Update an existing product in Sanity CMS
 */
export async function updateProduct(
  productId: string,
  data: ProductFormData
): Promise<{ _id: string; slug: string }> {
  try {
    // Upload new images if any
    const uploadedImages = await uploadProductImages(data.images);
    const [primaryImage, ...additionalImages] = uploadedImages;

    // Update product
    const patch = sanityClient.patch(productId);

    patch.set({
      name: data.name,
      description: data.description,
      image: primaryImage,
      images: additionalImages,
      category: {
        _type: "reference",
        _ref: data.category,
      },
      price: data.price,
      quantity: data.quantity,
      inventory: {
        _type: "object",
        quantityInStock: data.quantity,
        trackInventory: data.trackInventory,
      },
      hasVariants: data.hasVariants,
      sku: data.sku,
      weight: data.weight,
      isAvailable: data.isAvailable,
      ...(data.seo && {
        seo: {
          _type: "object",
          metaTitle: data.seo.metaTitle,
          metaDescription: data.seo.metaDescription,
        },
      }),
    });

    await patch.commit();

    // Get current slug
    const product = await sanityClient.fetch(
      `*[_type == "product" && _id == $id][0]{slug}`,
      { id: productId }
    );

    return {
      _id: productId,
      slug: product.slug.current,
    };
  } catch (error) {
    console.error("Error updating product:", error);
    throw new Error("Failed to update product. Please try again.");
  }
}

/**
 * Fetch all categories for the category selector
 */
export async function fetchCategories() {
  return sanityClient.fetch(`
    *[_type == "category"] | order(name asc) {
      _id,
      name,
      slug,
      "subcategories": *[_type == "category" && parentCategory._ref == ^._id] {
        _id,
        name,
        slug
      }
    }
  `);
}

/**
 * Fetch seller products from Sanity
 * Transforms Sanity products to match SellerProduct interface
 * Filters by sellerId if provided
 */
export async function fetchSellerProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  sellerId?: string;
}): Promise<{
  products: Array<{
    id: string;
    name: string;
    image: string;
    price: number;
    stock: number;
    category: string;
    status: "Active" | "Inactive" | "Out of Stock";
    description?: string;
    weight?: string;
    isActive?: boolean;
    isDeleted?: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const search = params?.search || "";

  // Build GROQ query
  let query = `*[_type == "product" && !(_id in path("drafts.**"))`;
  
  // Filter by seller ID if provided
  if (params?.sellerId) {
    query += ` && sellerId == $sellerId`;
  }
  
  // Add search filter if provided
  if (search) {
    query += ` && (name match $search || description match $search || sku match $search)`;
  }
  
  query += `] {
    _id,
    _createdAt,
    _updatedAt,
    name,
    description,
    price,
    "stock": coalesce(inventory.quantityInStock, quantity, 0),
    sku,
    weight,
    isAvailable,
    "mainImage": coalesce(mainImage.asset->url, image.asset->url),
    "images": images[].asset->url,
    category->{
      _id,
      name,
      "slug": slug.current
    }
  } | order(_createdAt desc)`;

  // Prepare query parameters
  const queryParams: Record<string, any> = {};
  if (params?.sellerId) {
    queryParams.sellerId = params.sellerId;
  }
  if (search) {
    queryParams.search = `*${search}*`;
  }

  // Fetch all matching products
  const allProducts = await sanityClient.fetch<Array<{
    _id: string;
    _createdAt: string;
    _updatedAt: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    sku?: string;
    weight?: number;
    isAvailable?: boolean;
    mainImage?: string;
    images?: string[];
    category?: {
      _id: string;
      name: string;
      slug: string;
    } | null;
  }>>(query, queryParams);

  // Transform to SellerProduct format
  const transformedProducts = allProducts.map((product) => {
    // Determine status based on availability and stock
    let status: "Active" | "Inactive" | "Out of Stock" = "Inactive";
    if (product.isAvailable) {
      status = product.stock > 0 ? "Active" : "Out of Stock";
    }

    return {
      id: product._id,
      name: product.name,
      image: product.mainImage || product.images?.[0] || "/placeholder-product.jpg",
      price: product.price,
      stock: product.stock || 0,
      category: product.category?.name || "Uncategorized",
      status,
      description: product.description,
      weight: product.weight ? `${product.weight}g` : undefined,
      isActive: product.isAvailable,
      isDeleted: false,
      createdAt: product._createdAt,
      updatedAt: product._updatedAt,
    };
  });

  // Apply pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedProducts = transformedProducts.slice(startIndex, endIndex);

  return {
    products: paginatedProducts,
    pagination: {
      page,
      limit,
      total: transformedProducts.length,
      totalPages: Math.ceil(transformedProducts.length / limit),
    },
  };
}
