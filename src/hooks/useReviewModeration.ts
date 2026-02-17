/**
 * useReviewModeration Hook
 *
 * Custom React hook for admin review moderation with real-time updates.
 * Provides filtering, pagination, moderation actions, and admin responses.
 * Mirrors useFirebaseReviews pattern but fetches ALL reviews (not just approved).
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FirebaseReviewService } from "@/lib/firebase/reviews";
import { syncReviewToSanity } from "@/lib/reviews/sync";
import { toast } from "sonner";
import type {
  FirestoreReview,
  ReviewStatus,
  ReviewTargetType,
  ModerationAction,
  ModerationStats,
  ReviewFilters,
} from "@/types/reviews";

/** Page size for admin pagination */
const DEFAULT_PAGE_SIZE = 20;

export interface UseReviewModerationReturn {
  /** All reviews (with filters applied) */
  reviews: FirestoreReview[];
  /** Full moderation statistics (unfiltered) */
  stats: ModerationStats | null;
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Current active filters */
  filters: ReviewFilters;
  /** Update filters */
  setFilters: (filters: ReviewFilters) => void;
  /** Current page (0-based) */
  page: number;
  /** Set current page */
  setPage: (page: number) => void;
  /** Total pages available */
  totalPages: number;
  /** Page size */
  pageSize: number;
  /** Reviews on current page */
  paginatedReviews: FirestoreReview[];
  /** Moderate a review (approve/reject/flag/delete) */
  moderateReview: (reviewId: string, action: ModerationAction, reason?: string) => Promise<void>;
  /** Add admin response to a review */
  addAdminResponse: (reviewId: string, response: string) => Promise<void>;
  /** Delete review as admin */
  deleteReviewAsAdmin: (reviewId: string, reason?: string) => Promise<void>;
  /** Clear flags on a review */
  clearFlags: (reviewId: string) => Promise<void>;
  /** Manual refetch */
  refetch: () => void;
}

/**
 * Hook for admin review moderation with real-time Firestore subscription.
 *
 * @param pageSize - Number of reviews per page (default: 20)
 * @returns Moderation controls, reviews, stats, and pagination
 *
 * @example
 * const { reviews, stats, moderateReview, paginatedReviews } = useReviewModeration();
 */
export function useReviewModeration(
  pageSize: number = DEFAULT_PAGE_SIZE,
): UseReviewModerationReturn {
  const { user } = useAuth();
  const [allReviews, setAllReviews] = useState<FirestoreReview[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReviewFilters>({});
  const [page, setPage] = useState(0);

  // Subscribe to ALL reviews in real-time
  useEffect(() => {
    // Guard for test environment
    if (typeof window === "undefined" && !global.__ENABLE_REALTIME_IN_TESTS) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = FirebaseReviewService.subscribeToAllReviews(
      (updatedReviews, updatedStats) => {
        setAllReviews(updatedReviews);
        setStats(updatedStats);
        setLoading(false);
        setError(null);
      },
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Apply client-side filters
  const filteredReviews = useMemo(() => {
    let result = [...allReviews];

    if (filters.status) {
      result = result.filter((r) => r.status === filters.status);
    }
    if (filters.targetType) {
      result = result.filter((r) => r.targetType === filters.targetType);
    }
    if (filters.ratingMin !== undefined) {
      result = result.filter((r) => r.rating >= filters.ratingMin!);
    }
    if (filters.ratingMax !== undefined) {
      result = result.filter((r) => r.rating <= filters.ratingMax!);
    }
    if (filters.dateFrom) {
      result = result.filter((r) => r.createdAt >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      result = result.filter((r) => r.createdAt <= filters.dateTo!);
    }
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(kw) ||
          r.content.toLowerCase().includes(kw) ||
          r.userName.toLowerCase().includes(kw) ||
          r.targetName.toLowerCase().includes(kw),
      );
    }
    if (filters.flaggedOnly) {
      result = result.filter((r) => r.flagCount > 0);
    }

    return result;
  }, [allReviews, filters]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / pageSize));

  const paginatedReviews = useMemo(() => {
    const start = page * pageSize;
    return filteredReviews.slice(start, start + pageSize);
  }, [filteredReviews, page, pageSize]);

  // Reset page on filter change
  useEffect(() => {
    setPage(0);
  }, [filters]);

  // Moderate a review
  const moderateReview = useCallback(
    async (reviewId: string, action: ModerationAction, reason?: string) => {
      if (!user) {
        toast.error("Please sign in as admin to moderate reviews.");
        return;
      }

      try {
        await FirebaseReviewService.moderateReview(reviewId, user.id, action, reason);

        // Fire-and-forget sync to Sanity after moderation
        const review = allReviews.find((r) => r.id === reviewId);
        if (review) {
          syncReviewToSanity(reviewId, { ...review, status: action === "approve" ? "approved" : action === "reject" ? "rejected" : action === "flag" ? "flagged" : review.status } as never);
        }

        const actionLabel = action.charAt(0).toUpperCase() + action.slice(1);
        toast.success(`Review ${actionLabel.toLowerCase()}d successfully.`);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to moderate review";
        toast.error(message);
      }
    },
    [user],
  );

  // Add admin response
  const addAdminResponse = useCallback(
    async (reviewId: string, response: string) => {
      if (!user) {
        toast.error("Please sign in as admin to respond.");
        return;
      }

      try {
        await FirebaseReviewService.addAdminResponse(reviewId, user.id, response);

        // Fire-and-forget sync to Sanity after admin response
        const review = allReviews.find((r) => r.id === reviewId);
        if (review) {
          syncReviewToSanity(reviewId, { ...review, adminResponse: response } as never);
        }

        toast.success("Admin response added successfully.");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to add response";
        toast.error(message);
      }
    },
    [user],
  );

  // Delete review as admin
  const deleteReviewAsAdmin = useCallback(
    async (reviewId: string, reason?: string) => {
      if (!user) {
        toast.error("Please sign in as admin to delete reviews.");
        return;
      }

      try {
        await FirebaseReviewService.deleteReviewAsAdmin(reviewId, user.id, reason);
        toast.success("Review deleted successfully.");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete review";
        toast.error(message);
      }
    },
    [user],
  );

  // Clear flags
  const clearFlags = useCallback(
    async (reviewId: string) => {
      if (!user) {
        toast.error("Please sign in as admin to clear flags.");
        return;
      }

      try {
        await FirebaseReviewService.clearFlags(reviewId, user.id);
        toast.success("Flags cleared successfully.");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to clear flags";
        toast.error(message);
      }
    },
    [user],
  );

  // Manual refetch
  const refetch = useCallback(() => {
    setLoading(true);
    FirebaseReviewService.getAllReviews(filters)
      .then(({ reviews: r, stats: s }) => {
        setAllReviews(r);
        setStats(s);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to fetch reviews");
        setLoading(false);
      });
  }, [filters]);

  return {
    reviews: filteredReviews,
    stats,
    loading,
    error,
    filters,
    setFilters,
    page,
    setPage,
    totalPages,
    pageSize,
    paginatedReviews,
    moderateReview,
    addAdminResponse,
    deleteReviewAsAdmin,
    clearFlags,
    refetch,
  };
}
