/**
 * Firebase to Sanity Sync API Route
 *
 * POST /api/reviews/sync-to-sanity
 *
 * Syncs a Firebase review document to Sanity CMS using createOrReplace.
 * Uses SANITY_API_WRITE_TOKEN (server-side only) for mutations.
 * Implements retry logic with exponential backoff.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@sanity/client";

// Server-side Sanity client with write token
const sanityWriteClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION!,
  token: process.env.SANITY_API_WRITE_TOKEN!,
  useCdn: false,
});

/** Firebase review data shape from the request body */
interface SyncRequestBody {
  reviewId: string;
  reviewData: {
    targetType: "product" | "grower";
    targetId: string;
    targetName: string;
    userId: string;
    userName: string;
    userEmail: string;
    userPhotoURL?: string;
    rating: number;
    title: string;
    content: string;
    images?: string[];
    status: string;
    verifiedPurchase: boolean;
    helpfulCount: number;
    flagCount: number;
    flagReasons?: string[];
    adminResponse?: string;
    adminResponseDate?: string;
    moderatedBy?: string;
    moderatedAt?: string;
    createdAt: string;
    updatedAt?: string;
  };
}

/**
 * Map Firebase review data to Sanity document fields.
 */
export function mapFirebaseToSanity(
  reviewId: string,
  data: SyncRequestBody["reviewData"],
  sanityTargetRef: string | null,
): Record<string, unknown> {
  const sanityDoc: Record<string, unknown> = {
    _type: "review",
    targetType: data.targetType,
    targetId: data.targetId,
    customerName: data.userName,
    customerEmail: data.userEmail,
    customerPhotoURL: data.userPhotoURL || undefined,
    firebaseUserId: data.userId,
    rating: data.rating,
    title: data.title,
    content: data.content,
    verifiedPurchase: data.verifiedPurchase,
    status: data.status,
    helpfulCount: data.helpfulCount,
    flagCount: data.flagCount,
    flagReasons: data.flagReasons || [],
    adminResponse: data.adminResponse || undefined,
    adminResponseDate: data.adminResponseDate || undefined,
    moderatedBy: data.moderatedBy || undefined,
    moderatedAt: data.moderatedAt || undefined,
    reviewDate: data.createdAt,
    firebaseReviewId: reviewId,
  };

  // Set the reference to the target entity
  if (sanityTargetRef) {
    if (data.targetType === "product") {
      sanityDoc.product = { _type: "reference", _ref: sanityTargetRef };
    } else if (data.targetType === "grower") {
      sanityDoc.grower = { _type: "reference", _ref: sanityTargetRef };
    }
  }

  return sanityDoc;
}

/**
 * Query Sanity for the target entity _id given a Firebase targetId.
 */
async function findSanityTarget(
  targetType: "product" | "grower",
  targetId: string,
): Promise<string | null> {
  try {
    const type = targetType === "product" ? "product" : "grower";
    // Try matching by _id first, then by slug
    const result = await sanityWriteClient.fetch<{ _id: string } | null>(
      `*[_type == $type && (_id == $targetId || slug.current == $targetId)][0]{ _id }`,
      { type, targetId },
    );
    return result?._id || null;
  } catch (error) {
    console.error(`[sync-to-sanity] Failed to find ${targetType} target:`, error);
    return null;
  }
}

/**
 * Find existing Sanity review document by firebaseReviewId.
 */
async function findExistingSanityReview(firebaseReviewId: string): Promise<string | null> {
  try {
    const result = await sanityWriteClient.fetch<{ _id: string } | null>(
      `*[_type == "review" && firebaseReviewId == $firebaseReviewId][0]{ _id }`,
      { firebaseReviewId },
    );
    return result?._id || null;
  } catch (error) {
    console.error("[sync-to-sanity] Failed to find existing review:", error);
    return null;
  }
}

/**
 * Execute with retry logic: 3 attempts with exponential backoff (1s, 2s, 4s).
 */
async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxAttempts) {
        const backoffMs = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
        console.warn(
          `[sync-to-sanity] Attempt ${attempt}/${maxAttempts} failed, retrying in ${backoffMs}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }
  throw lastError;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SyncRequestBody;

    if (!body.reviewId || !body.reviewData) {
      return NextResponse.json(
        { success: false, error: "Missing reviewId or reviewData" },
        { status: 400 },
      );
    }

    if (!process.env.SANITY_API_WRITE_TOKEN) {
      console.error("[sync-to-sanity] SANITY_API_WRITE_TOKEN not configured");
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 },
      );
    }

    const { reviewId, reviewData } = body;

    // Find the target entity in Sanity
    const sanityTargetRef = await findSanityTarget(
      reviewData.targetType,
      reviewData.targetId,
    );

    if (!sanityTargetRef) {
      console.warn(
        `[sync-to-sanity] Target not found in Sanity: ${reviewData.targetType}/${reviewData.targetId}. Syncing without reference.`,
      );
    }

    // Check if a Sanity document already exists for this Firebase review
    const existingSanityId = await findExistingSanityReview(reviewId);

    // Map Firebase data to Sanity document
    const sanityDoc = mapFirebaseToSanity(reviewId, reviewData, sanityTargetRef);

    // Set the _id: use existing or generate new
    const docId = existingSanityId || `review-firebase-${reviewId}`;
    sanityDoc._id = docId;

    // Create or replace in Sanity with retry
    const result = await withRetry(async () => {
      return sanityWriteClient.createOrReplace(sanityDoc as { _id: string; _type: string });
    });

    const syncedAt = new Date().toISOString();

    console.log(
      `[sync-to-sanity] Synced review ${reviewId} -> Sanity ${result._id} at ${syncedAt}`,
    );

    return NextResponse.json({
      success: true,
      sanityId: result._id,
      syncedAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[sync-to-sanity] Sync failed:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
