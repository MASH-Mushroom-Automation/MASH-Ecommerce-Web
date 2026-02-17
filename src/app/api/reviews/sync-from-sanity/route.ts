/**
 * Sanity to Firebase Sync API Route
 *
 * POST /api/reviews/sync-from-sanity
 *
 * Syncs a Sanity review document back to Firebase Firestore.
 * Handles Sanity webhook payloads or manual sync requests.
 * Uses last-write-wins conflict resolution based on updatedAt timestamps.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@sanity/client";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { firebaseApp } from "@/lib/firebase/config";

// Server-side Sanity client with read token
const sanityReadClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION!,
  token: process.env.SANITY_API_WRITE_TOKEN!,
  useCdn: false,
});

interface SyncFromSanityRequest {
  sanityId?: string;
  // Sanity webhook payload fields
  _id?: string;
  _type?: string;
}

/**
 * Determine which fields to sync from Sanity to Firestore.
 * Only syncs moderation-related fields that are managed in Sanity.
 */
export function extractSyncableFields(sanityDoc: Record<string, unknown>): {
  fieldsToUpdate: Record<string, unknown>;
  fieldNames: string[];
} {
  const fieldsToUpdate: Record<string, unknown> = {};
  const fieldNames: string[] = [];

  // Status sync
  if (sanityDoc.status !== undefined) {
    fieldsToUpdate.status = sanityDoc.status;
    fieldNames.push("status");
  }

  // Admin response sync
  if (sanityDoc.adminResponse !== undefined) {
    fieldsToUpdate.adminResponse = sanityDoc.adminResponse;
    fieldNames.push("adminResponse");
  }

  if (sanityDoc.adminResponseDate !== undefined) {
    fieldsToUpdate.adminResponseDate = sanityDoc.adminResponseDate;
    fieldNames.push("adminResponseDate");
  }

  // Moderation fields
  if (sanityDoc.moderatedBy !== undefined) {
    fieldsToUpdate.moderatedBy = sanityDoc.moderatedBy;
    fieldNames.push("moderatedBy");
  }

  if (sanityDoc.moderatedAt !== undefined) {
    fieldsToUpdate.moderatedAt = sanityDoc.moderatedAt;
    fieldNames.push("moderatedAt");
  }

  // Flag fields
  if (sanityDoc.flagCount !== undefined) {
    fieldsToUpdate.flagCount = sanityDoc.flagCount;
    fieldNames.push("flagCount");
  }

  if (sanityDoc.flagReasons !== undefined) {
    fieldsToUpdate.flagReasons = sanityDoc.flagReasons;
    fieldNames.push("flagReasons");
  }

  return { fieldsToUpdate, fieldNames };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SyncFromSanityRequest;

    // Support both direct request and Sanity webhook payload
    const sanityId = body.sanityId || body._id;

    if (!sanityId) {
      return NextResponse.json(
        { success: false, error: "Missing sanityId or _id" },
        { status: 400 },
      );
    }

    // Skip drafts
    if (sanityId.startsWith("drafts.")) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: "Draft document ignored",
      });
    }

    // Fetch the Sanity review document
    const sanityDoc = await sanityReadClient.fetch<Record<string, unknown> | null>(
      `*[_type == "review" && _id == $sanityId][0]{
        _id,
        _updatedAt,
        firebaseReviewId,
        status,
        adminResponse,
        adminResponseDate,
        moderatedBy,
        moderatedAt,
        flagCount,
        flagReasons
      }`,
      { sanityId },
    );

    if (!sanityDoc) {
      return NextResponse.json(
        { success: false, error: `Sanity review not found: ${sanityId}` },
        { status: 404 },
      );
    }

    const firebaseId = sanityDoc.firebaseReviewId as string;

    if (!firebaseId) {
      console.warn(
        `[sync-from-sanity] No firebaseReviewId on Sanity doc ${sanityId}. Skipping.`,
      );
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: "No firebaseReviewId found on Sanity document",
      });
    }

    // Find corresponding Firestore document using client SDK
    const db = getFirestore(firebaseApp);
    const reviewRef = doc(db, "reviews", firebaseId);
    const firebaseSnap = await getDoc(reviewRef);

    if (!firebaseSnap.exists()) {
      console.warn(
        `[sync-from-sanity] Firestore review not found: ${firebaseId}. Skipping.`,
      );
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: `Firestore document ${firebaseId} not found`,
      });
    }

    const firebaseData = firebaseSnap.data();

    // Last-write-wins: compare updatedAt timestamps
    const sanityUpdatedAt = sanityDoc._updatedAt
      ? new Date(sanityDoc._updatedAt as string).getTime()
      : 0;
    const firebaseUpdatedAt = firebaseData?.updatedAt
      ? new Date(firebaseData.updatedAt).getTime()
      : 0;

    if (firebaseUpdatedAt > sanityUpdatedAt) {
      console.log(
        `[sync-from-sanity] Firebase is newer than Sanity for ${firebaseId}. Skipping.`,
      );
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: "Firebase document is newer",
      });
    }

    // Extract fields to sync
    const { fieldsToUpdate, fieldNames } = extractSyncableFields(sanityDoc);

    if (fieldNames.length === 0) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: "No syncable fields changed",
      });
    }

    // Update Firestore using client SDK
    await updateDoc(reviewRef, {
      ...fieldsToUpdate,
      updatedAt: new Date().toISOString(),
    });

    console.log(
      `[sync-from-sanity] Synced Sanity ${sanityId} -> Firebase ${firebaseId}: ${fieldNames.join(", ")}`,
    );

    return NextResponse.json({
      success: true,
      firebaseId,
      fieldsUpdated: fieldNames,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[sync-from-sanity] Sync failed:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
