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
  contentType?: string,
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
      // Buffer from server-side - convert to Uint8Array for Blob compatibility
      const uint8Array = new Uint8Array(file);
      const blob = new Blob([uint8Array], {
        type: contentType || "image/jpeg",
      });
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
  images: UploadedImage[],
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

    // If URL is provided but no asset ID, fetch the remote image and upload to Sanity
    if (image.url) {
      try {
        const res = await fetch(image.url);
        if (!res.ok) {
          throw new Error(`Failed to fetch remote image: ${res.status}`);
        }
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const filename = image.url.split("/").pop() || "image.jpg";
        const contentType = res.headers.get("content-type") || undefined;

        const asset = await uploadImageToSanity(buffer, filename, contentType);

        return {
          _type: "image" as const,
          asset: {
            _type: "reference" as const,
            _ref: asset._id,
          },
          alt: image.alt || "",
        };
      } catch (err) {
        console.error("Failed to import remote image:", err);
        // Do not throw here; return null to indicate failure and allow caller to continue
        return null as unknown as SanityImageAsset;
      }
    }

    // If neither asset ID, file, nor url is available, return null
    console.error(
      `Image "${image.id}" has no file, asset ID, or url. Skipping image.`,
    );
    return null as unknown as SanityImageAsset;
  });

  const results = await Promise.all(uploadPromises);
  // Filter out failed (null) uploads
  return results.filter(Boolean) as SanityImageAsset[];
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
    { slug: baseSlug },
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
      { slug: uniqueSlug },
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
  productName: string,
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
  sellerId?: string,
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
      ...(uploadedImages.length > 0 && {
        image: primaryImage,
        images: additionalImages,
      }),
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
          createProductVariant(product._id, variant, data.name),
        ),
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
 * Fetch a single product by ID (with optional seller verification)
 */
export async function fetchProductById(
  productId: string,
  sellerId?: string,
): Promise<{
  _id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  stock: number;
  sku?: string;
  weight?: number;
  isAvailable?: boolean;
  mainImage?: string;
  mainImageAssetId?: string;
  images?: Array<{ url: string; assetId: string }>;
  slug: string;
  sellerId?: string;
  compareAtPrice?: number;
  hasVariants?: boolean;
  variants?: Array<{
    _id: string;
    variantType?: string;
    variantValue?: string;
    sku?: string;
    price?: number;
    compareAtPrice?: number;
    quantityInStock?: number;
    isAvailable?: boolean;
  }>;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
} | null> {
  try {
    let query = `*[_type == "product" && _id == $productId`;

    // Verify seller ownership if sellerId provided
    if (sellerId) {
      query += ` && sellerId == $sellerId`;
    }

    query += `][0] {
      _id,
      name,
      description,
      price,
      compareAtPrice,
      "stock": coalesce(inventory.quantityInStock, quantity, 0),
      sku,
      weight,
      isAvailable,
      hasVariants,
      "mainImage": coalesce(mainImage.asset->url, image.asset->url),
      "mainImageAssetId": coalesce(mainImage.asset->_id, image.asset->_id),
      "images": images[]{ "url": asset->url, "assetId": asset._ref },
      "variants": variants[]->{ _id, variantType, variantValue, sku, price, compareAtPrice, "quantityInStock": inventory.quantityInStock, isAvailable },
      "category": category._ref,
      "slug": slug.current,
      sellerId,
      seo {
        metaTitle,
        metaDescription
      }
    }`;

    const product = await sanityClient.fetch(
      query,
      { productId, sellerId },
      { useCdn: false },
    );
    return product || null;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw new Error("Failed to fetch product");
  }
}

/**
 * Update an existing product in Sanity CMS
 * Verifies seller ownership before updating
 */
export async function updateProduct(
  productId: string,
  data: ProductFormData,
  sellerId?: string,
): Promise<{ _id: string; slug: string; warnings?: string[] }> {
  try {
    // Verify seller ownership if sellerId provided
    if (sellerId) {
      const existingProduct = await fetchProductById(productId, sellerId);
      if (!existingProduct) {
        throw new Error(
          "Product not found or you don't have permission to edit it",
        );
      }
    }

    // Determine final image assets (tolerant import)
    // Strategy:
    // 1) Use provided sanityAssetId if available
    // 2) Match incoming URLs to existing product images to reuse asset IDs
    // 3) Upload provided files
    // 4) Attempt to import remote URLs; on failure, continue and preserve existing images

    const existing = await fetchProductById(productId, sellerId);

    // Quick reorder-only optimization: if no files are provided and all incoming URLs match existing images,
    // map incoming URLs to existing asset IDs and skip network operations.
    const incomingUrls = (data.images || []).map((i) => i.url).filter(Boolean);
    const hasFiles = (data.images || []).some((i) => !!i.file);

    const finalAssets: Array<{
      _type: "image";
      asset: { _type: "reference"; _ref: string };
    }> = [];
    const failedImports: string[] = [];
    let reorderOnlyOptimizationApplied = false;

    // Track already-added asset refs to prevent duplicates
    const addedAssetRefs = new Set<string>();

    // Helper to add asset to finalAssets with deduplication
    const addAsset = (assetRef: string): boolean => {
      if (addedAssetRefs.has(assetRef)) {
        return false; // Already added, skip
      }
      addedAssetRefs.add(assetRef);
      finalAssets.push({
        _type: "image" as const,
        asset: { _type: "reference" as const, _ref: assetRef },
      });
      return true;
    };

    // Quick reorder-only optimization: if no files are provided and all incoming URLs match existing images,
    // map incoming URLs to existing asset IDs and skip network operations entirely.
    if (existing && !hasFiles && incomingUrls.length > 0) {
      const urlToAsset = new Map<string, string>();
      if (existing.mainImage && existing.mainImageAssetId) {
        urlToAsset.set(existing.mainImage, existing.mainImageAssetId);
      }
      if (existing.images) {
        for (const e of existing.images) {
          if (e.url && e.assetId) urlToAsset.set(e.url, e.assetId);
        }
      }

      const allMatch = incomingUrls.every((url) => urlToAsset.has(url));
      if (allMatch) {
        for (const img of data.images || []) {
          if (img.sanityAssetId) {
            addAsset(img.sanityAssetId);
          } else if (img.url) {
            const aid = urlToAsset.get(img.url);
            if (aid) {
              addAsset(aid);
            }
          }
        }
        reorderOnlyOptimizationApplied = true;
      }
    }

    // Only process images individually if the reorder optimization wasn't applied
    for (const img of data.images || []) {
      // Skip per-image processing if reorder optimization already handled all images
      if (reorderOnlyOptimizationApplied) {
        break;
      }
      // 1) Asset ID already provided
      if (img.sanityAssetId) {
        addAsset(img.sanityAssetId);
        continue;
      }

      // 2) Try to match with existing product images by URL
      let matchedAssetId: string | undefined;
      if (existing) {
        if (
          existing.mainImage &&
          img.url &&
          existing.mainImage === img.url &&
          existing.mainImageAssetId
        ) {
          matchedAssetId = existing.mainImageAssetId;
        }
        if (!matchedAssetId && existing.images && img.url) {
          const match = existing.images.find(
            (e) => e.url === img.url && e.assetId,
          );
          if (match) matchedAssetId = match.assetId;
        }
      }

      if (matchedAssetId) {
        addAsset(matchedAssetId);
        continue;
      }

      // 3) Upload file if provided
      if (img.file) {
        try {
          const asset = await uploadImageToSanity(img.file);
          addAsset(asset._id);
          continue;
        } catch (err) {
          console.error("Failed to upload image file:", err);
          failedImports.push(img.id);
          continue;
        }
      }

      // 4) Attempt to import remote URL; tolerate failure
      if (img.url) {
        try {
          const res = await fetch(img.url);
          if (!res.ok)
            throw new Error(`Failed to fetch remote image: ${res.status}`);
          const arrayBuffer = await res.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const filename = img.url.split("/").pop() || "image.jpg";
          const contentType = res.headers.get("content-type") || undefined;

          const asset = await uploadImageToSanity(
            buffer,
            filename,
            contentType,
          );
          addAsset(asset._id);
          continue;
        } catch (err) {
          console.error("Failed to import remote image:", err);
          // Don't throw - record failure and continue
          failedImports.push(img.id);
          continue;
        }
      }

      // If nothing matched, record failure (but keep going)
      failedImports.push(img.id);
    }

    // If some imports failed, preserve any existing images not already included
    if (failedImports.length > 0 && existing) {
      // Use the already-tracked addedAssetRefs set for deduplication

      // Add main image if not included
      if (
        existing.mainImageAssetId &&
        !addedAssetRefs.has(existing.mainImageAssetId)
      ) {
        addedAssetRefs.add(existing.mainImageAssetId);
        finalAssets.unshift({
          _type: "image",
          asset: { _type: "reference", _ref: existing.mainImageAssetId },
        });
      }

      // Add other existing images (preserve order)
      if (existing.images && existing.images.length > 0) {
        for (const e of existing.images) {
          if (e.assetId && !addedAssetRefs.has(e.assetId)) {
            addedAssetRefs.add(e.assetId);
            finalAssets.push({
              _type: "image",
              asset: { _type: "reference", _ref: e.assetId },
            });
          }
        }
      }
    }

    // Fallback: if finalAssets is empty but existing had images, reuse them
    if (finalAssets.length === 0 && existing) {
      if (existing.mainImageAssetId) {
        finalAssets.push({
          _type: "image",
          asset: { _type: "reference", _ref: existing.mainImageAssetId },
        });
      }
      if (existing.images && existing.images.length > 0) {
        for (const e of existing.images) {
          if (e.assetId) {
            finalAssets.push({
              _type: "image",
              asset: { _type: "reference", _ref: e.assetId },
            });
          }
        }
      }
    }

    const [primaryImage, ...additionalImages] = finalAssets;

    // Update product using write client
    const writeClient = getWriteClient();
    const patch = writeClient.patch(productId);

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

    // Handle variants: create new variant documents for submitted variants and attach references
    if (data.hasVariants) {
      if (data.variants && data.variants.length > 0) {
        try {
          const variantIds = await Promise.all(
            data.variants.map((variant) =>
              createProductVariant(
                productId,
                variant as ProductVariant,
                data.name,
              ),
            ),
          );

          // Set variant references on the product (preserve order)
          patch.set({
            variants: variantIds.map((id) => ({
              _type: "reference",
              _ref: id,
              _key: id,
            })),
          });
        } catch (err) {
          console.error("Failed to create product variants:", err);
          // Proceed without blocking the product update; variants may be retried separately
        }
      } else {
        // If variants are enabled but none provided, ensure product has an empty variants array
        patch.set({ variants: [] });
      }
    } else {
      // If variants disabled, remove references from the product
      try {
        patch.unset(["variants"] as any);
      } catch (err) {
        // Some Sanity clients may not support unset on empty paths; ignore errors
        console.warn("Failed to unset variants field:", err);
      }
    }

    await patch.commit();

    // Get current slug
    const product = await writeClient.fetch(
      `*[_type == "product" && _id == $id][0]{slug}`,
      { id: productId },
    );

    return {
      _id: productId,
      slug: product?.slug?.current || "",
      warnings: failedImports.length > 0 ? failedImports : undefined,
    };
  } catch (error) {
    console.error("Error updating product:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update product. Please try again.";
    throw new Error(message);
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
  const allProducts = await sanityClient.fetch<
    Array<{
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
    }>
  >(query, queryParams, { useCdn: false });

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
      image:
        product.mainImage || product.images?.[0] || "/placeholder-product.jpg",
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
