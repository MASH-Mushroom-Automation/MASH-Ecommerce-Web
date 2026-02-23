/**
 * useFirebaseReviews Hook
 *
 * Custom React hook for managing reviews stored in Firebase Firestore.
 * Provides real-time updates, CRUD operations, and rating aggregation.
 * Works for both product and grower reviews.
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FirebaseReviewService } from "@/lib/firebase/reviews";
import { syncReviewToSanity } from "@/lib/reviews/sync";
import { toast } from "sonner";
import type {
  FirestoreReview,
  CreateReviewInput,
  UpdateReviewInput,
  FlagReviewInput,
  RatingStats,
  ReviewTargetType,
  UseReviewsReturn,
} from "@/types/reviews";

/**
 * Hook for fetching and managing reviews with real-time Firestore updates.
 *
 * @param targetType - "product" or "grower"
 * @param targetId - The Sanity document ID or slug of the entity
 * @returns Reviews, stats, CRUD methods, and loading state
 *
 * @example
 * const { reviews, stats, submitReview, loading } = useFirebaseReviews("product", product.id);
 */
export function useFirebaseReviews(
  targetType: ReviewTargetType,
  targetId: string,
): UseReviewsReturn {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<FirestoreReview[]>([]);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch reviews on mount and subscribe to real-time updates
  useEffect(() => {
    if (!targetId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = FirebaseReviewService.subscribeToReviews(
      targetType,
      targetId,
      (updatedReviews, updatedStats) => {
        setReviews(updatedReviews);
        setStats(updatedStats);
        setLoading(false);
        setError(null);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [targetType, targetId]);

  // Check if current user has already reviewed
  const userReview = useMemo(() => {
    if (!user) return null;
    return reviews.find((r) => r.userId === user.id) || null;
  }, [reviews, user]);

  const hasUserReviewed = userReview !== null;

  // Submit a new review
  const submitReview = useCallback(
    async (input: CreateReviewInput) => {
      if (!isAuthenticated || !user) {
        toast.error("Please sign in to submit a review.");
        throw new Error("Authentication required");
      }

      try {
        // Auto-verify purchase status for product reviews
        let verifiedPurchase = false;
        if (input.targetType === "product") {
          try {
            const res = await fetch(
              `/api/reviews/verify-purchase?userId=${encodeURIComponent(user.id)}&productId=${encodeURIComponent(input.targetId)}`
            );
            if (res.ok) {
              const data = await res.json();
              verifiedPurchase = !!data.verified;
            }
          } catch {
            // Verification failed - continue with unverified
          }
        }

        await FirebaseReviewService.createReview(
          user.id,
          user.displayName || user.firstName || "Anonymous",
          user.email,
          user.photoURL || user.imageUrl,
          { ...input, verifiedPurchase },
        );
        // Fire-and-forget sync to Sanity
        syncReviewToSanity(input.targetId, {
          ...input,
          userId: user.id,
          userName: user.displayName || user.firstName || "Anonymous",
          userEmail: user.email,
          userPhotoURL: user.photoURL || user.imageUrl || "",
        } as never);
        toast.success("Review submitted successfully!");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to submit review";
        toast.error(message);
        throw err;
      }
    },
    [isAuthenticated, user],
  );

  // Update an existing review
  const updateReview = useCallback(
    async (reviewId: string, input: UpdateReviewInput) => {
      if (!isAuthenticated || !user) {
        toast.error("Please sign in to update your review.");
        throw new Error("Authentication required");
      }

      try {
        await FirebaseReviewService.updateReview(reviewId, user.id, input);
        toast.success("Review updated successfully!");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update review";
        toast.error(message);
        throw err;
      }
    },
    [isAuthenticated, user],
  );

  // Delete a review
  const deleteReview = useCallback(
    async (reviewId: string) => {
      if (!isAuthenticated || !user) {
        toast.error("Please sign in to delete your review.");
        throw new Error("Authentication required");
      }

      try {
        await FirebaseReviewService.deleteReview(reviewId, user.id);
        toast.success("Review deleted.");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete review";
        toast.error(message);
        throw err;
      }
    },
    [isAuthenticated, user],
  );

  // Vote a review as helpful
  const voteHelpful = useCallback(
    async (reviewId: string) => {
      if (!isAuthenticated || !user) {
        toast.error("Please sign in to vote.");
        return;
      }

      try {
        await FirebaseReviewService.toggleHelpfulVote(reviewId, user.id);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to vote";
        toast.error(message);
      }
    },
    [isAuthenticated, user],
  );

  // Flag a review for moderation
  const flagReview = useCallback(
    async (reviewId: string, input: FlagReviewInput) => {
      if (!isAuthenticated || !user) {
        toast.error("Please sign in to flag a review.");
        return;
      }

      try {
        await FirebaseReviewService.flagReview(reviewId, user.id, input);
        toast.success("Review has been flagged for moderation.");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to flag review";
        toast.error(message);
      }
    },
    [isAuthenticated, user],
  );

  // Manual refetch
  const refetch = useCallback(() => {
    if (!targetId) return;
    setLoading(true);
    FirebaseReviewService.getReviews(targetType, targetId)
      .then(({ reviews: r, stats: s }) => {
        setReviews(r);
        setStats(s);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to fetch reviews");
        setLoading(false);
      });
  }, [targetType, targetId]);

  return {
    reviews,
    stats,
    loading,
    error,
    submitReview,
    updateReview,
    deleteReview,
    voteHelpful,
    flagReview,
    hasUserReviewed,
    userReview,
    refetch,
  };
}
