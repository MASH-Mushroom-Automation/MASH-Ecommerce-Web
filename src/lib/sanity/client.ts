/**
 * Sanity Client Configuration
 * 
 * This file configures the Sanity client for fetching content from Sanity CMS.
 * Used on both server and client side for content management.
 * 
 * Supports:
 * - Published content (sanityClient)
 * - Draft content for Visual Editing (previewClient)
 */

import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

// Sanity project configuration - PP_Namias Free Project (gerattrr)
// Migrated from MASH CMS (xyq5fhxs) on December 6, 2025
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "gerattrr";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-26";
// ALWAYS use CDN to reduce API quota usage (with longer cache)
export const useCdn = true;

// Optional: Sanity API token for authenticated requests (read/write)
// Use read token for public content, write token for admin operations
const readToken = process.env.SANITY_API_READ_TOKEN;
const writeToken = process.env.SANITY_API_WRITE_TOKEN;

/**
 * Create the Sanity client for published content (READ-ONLY)
 * 
 * This client is used throughout the app to fetch content from Sanity.
 * It's configured with the project ID, dataset, and API version.
 */
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn, // Use CDN to reduce API quota usage
  token: readToken, // Read token for public content
  perspective: "published", // Only fetch published content
  // Aggressive caching to avoid quota limits
  stega: {
    enabled: false, // Disable Stega encoding to reduce overhead
  },
  // Request deduplication (prevent duplicate requests)
  resultSourceMap: false,
});

/**
 * Create the Sanity client for WRITE operations (mutations)
 * 
 * This client is used for creating, updating, and deleting content.
 * Requires SANITY_API_WRITE_TOKEN with Editor or higher permissions.
 * 
 * IMPORTANT: Only use this client for mutations - never for public reads.
 * If write token is not available, falls back to read token (will fail on mutations).
 */
export const sanityWriteClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Never use CDN for mutations
  token: writeToken || readToken, // Prefer write token, fallback to read token
  perspective: "published",
  stega: {
    enabled: false,
  },
  resultSourceMap: false,
});

/**
 * Create the Sanity client for FRESH reads (bypasses CDN cache)
 * 
 * Use this client when you need guaranteed fresh data, such as:
 * - Immediately after a mutation to show updated values
 * - Real-time inventory updates
 * - Any scenario where stale data is unacceptable
 * 
 * WARNING: Use sparingly - this bypasses CDN and uses more API quota.
 */
export const sanityFreshClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Bypass CDN for fresh data
  token: readToken,
  perspective: "raw", // See both published and draft documents
  stega: {
    enabled: false,
  },
  resultSourceMap: false,
});

/**
 * Check if write operations are properly configured
 * @returns true if write token is available
 */
export function isWriteConfigured(): boolean {
  return !!writeToken;
}

/**
 * Create the Sanity client for draft/preview content
 * 
 * Used for Visual Editing in Sanity Presentation tool.
 * Shows draft content before it's published.
 */
export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Don't use CDN for drafts - need real-time data
  token: readToken, // Required for authenticated draft access
  perspective: "previewDrafts", // Show draft content
  stega: {
    enabled: true, // Enable Stega for click-to-edit in Presentation tool
    studioUrl: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || "http://localhost:3333",
  },
});

/**
 * Get the appropriate client based on draft mode
 * 
 * @param isDraftMode - Whether to use draft mode
 * @returns The appropriate Sanity client
 */
export function getClient(isDraftMode: boolean = false) {
  return isDraftMode ? previewClient : sanityClient;
}

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

/**
 * Safe listen wrapper for real-time subscriptions.
 * By default this is disabled to avoid noisy console output when
 * the Sanity project does not support listen (free projects / CORS issues).
 *
 * Enable by setting NEXT_PUBLIC_ENABLE_SANITY_LISTEN=true in your env.
 */
export function listenSafe(query: string, params?: Record<string, any>, options?: any) {
  const enabled = process.env.NEXT_PUBLIC_ENABLE_SANITY_LISTEN === 'true';
  if (!enabled) {
    // return a no-op subscription object matching Sanity's API
    return {
      subscribe: (observerOrCb: any) => ({ unsubscribe: () => {} }),
    } as any;
  }

  try {
    return sanityClient.listen(query, params || {}, options || {});
  } catch (err) {
    console.warn('[sanity] listen() failed, real-time subscriptions are disabled for this query', err?.message || err);
    return {
      subscribe: (observerOrCb: any) => ({ unsubscribe: () => {} }),
    } as any;
  }
}
