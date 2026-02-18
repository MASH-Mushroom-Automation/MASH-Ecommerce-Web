/**
 * Review Sync Utility
 *
 * Fire-and-forget helper to sync reviews between Firebase and Sanity.
 * All calls are non-blocking and errors are logged without user impact.
 */

import type { FirestoreReview } from "@/types/reviews";

/**
 * Sync a Firebase review to Sanity CMS.
 * Fire-and-forget: does not block the caller and errors are only logged.
 */
export function syncReviewToSanity(reviewId: string, reviewData: Partial<FirestoreReview>): void {
  fetch("/api/reviews/sync-to-sanity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reviewId, reviewData }),
  })
    .then((res) => {
      if (!res.ok) {
        console.warn(`[review-sync] Sync to Sanity failed for ${reviewId}: ${res.status}`);
      }
    })
    .catch((err) => {
      console.error(`[review-sync] Sync to Sanity error for ${reviewId}:`, err);
    });
}

/**
 * Sync a Sanity review to Firebase Firestore.
 * Fire-and-forget: does not block the caller and errors are only logged.
 */
export function syncReviewFromSanity(sanityId: string): void {
  fetch("/api/reviews/sync-from-sanity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sanityId }),
  })
    .then((res) => {
      if (!res.ok) {
        console.warn(`[review-sync] Sync from Sanity failed for ${sanityId}: ${res.status}`);
      }
    })
    .catch((err) => {
      console.error(`[review-sync] Sync from Sanity error for ${sanityId}:`, err);
    });
}
