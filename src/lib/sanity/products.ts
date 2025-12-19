/**
 * Sanity Products API
 * Utilities for creating, updating, and managing products in Sanity CMS
 */

import { sanityClient, projectId, dataset } from "./client";
import type { UploadedImage } from "@/components/seller/product-form/ImageUploader";
import type { ProductVariant } from "@/components/seller/product-form/VariantManager";

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
 * Upload image file to Sanity Assets API
 */
export async function uploadImageToSanity(file: File): Promise<SanityAsset> {
  try {
    // Create form data with the image
    const formData = new FormData();
    formData.append("file", file);

    // Upload to Sanity Assets API
    const uploadUrl = `https://${projectId}.api.sanity.io/v2021-03-25/assets/images/${dataset}`;

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SANITY_API_TOKEN || ""}`,
      },
      body: formData,
    });

    if (!response.ok) {
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
 */
export async function uploadProductImages(
  images: UploadedImage[]
): Promise<SanityImageAsset[]> {
  const uploadPromises = images.map(async (image) => {
    // Skip if already uploaded
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

    // Upload new image
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

    throw new Error("Image has no file or asset ID");
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

  const result = await sanityClient.create(variantDoc);
  return result._id;
}

/**
 * Create a new product in Sanity CMS
 */
export async function createProduct(
  data: ProductFormData
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
      ...(data.seo && {
        seo: {
          _type: "object",
          metaTitle: data.seo.metaTitle,
          metaDescription: data.seo.metaDescription,
        },
      }),
    };

    // Create the product
    const product = await sanityClient.create(productDoc);

    // Create variants if enabled
    if (data.hasVariants && data.variants && data.variants.length > 0) {
      const variantIds = await Promise.all(
        data.variants.map((variant) =>
          createProductVariant(product._id, variant, data.name)
        )
      );

      // Update product with variant references
      await sanityClient
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
