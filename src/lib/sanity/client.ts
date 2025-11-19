/**
 * Sanity Client Configuration
 * 
 * This file configures the Sanity client for fetching content from Sanity CMS.
 * Used on both server and client side for content management.
 */

import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

// Sanity project configuration
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "z9tn0u8x";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-09-25";
export const useCdn = process.env.NODE_ENV === "production";

// Optional: Sanity API token for authenticated requests (read/write)
// Use read token for public content, write token for admin operations
const token = process.env.SANITY_API_READ_TOKEN;

/**
 * Create the Sanity client
 * 
 * This client is used throughout the app to fetch content from Sanity.
 * It's configured with the project ID, dataset, and API version.
 */
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn, // Use CDN in production for faster response times
  token, // Optional: for authenticated requests
  perspective: "published", // Only fetch published content
});

/**
 * Image URL builder
 * 
 * Helper to generate optimized image URLs from Sanity image references.
 * Supports transformations like width, height, crop, format, etc.
 * 
 * @example
 * const imageUrl = urlFor(product.image)
 *   .width(800)
 *   .height(600)
 *   .format('webp')
 *   .url();
 */
const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

/**
 * Helper to get optimized image URL with common settings
 * 
 * @param source - Sanity image reference
 * @param width - Image width (default: 800)
 * @param height - Image height (optional, maintains aspect ratio if not provided)
 * @returns Optimized image URL
 */
export function getImageUrl(
  source: SanityImageSource,
  width: number = 800,
  height?: number
): string {
  let imageBuilder = urlFor(source).width(width).format("webp").quality(80);

  if (height) {
    imageBuilder = imageBuilder.height(height).fit("crop");
  }

  return imageBuilder.url();
}

/**
 * Helper to check if Sanity is properly configured
 * 
 * @returns true if Sanity credentials are configured
 */
export function isSanityConfigured(): boolean {
  return !!(projectId && dataset && projectId !== "your-projectID");
}
