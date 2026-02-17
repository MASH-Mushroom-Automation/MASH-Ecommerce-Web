"use client";

import { useState, useEffect, useRef } from "react";
import { FirebaseReviewService } from "@/lib/firebase/reviews";
import type { RatingStats } from "@/types/reviews";

interface ProductRatingMap {
  [productId: string]: RatingStats;
}

interface UseProductRatingsReturn {
  ratings: ProductRatingMap;
  loading: boolean;
}

/**
 * Batch-fetch review rating stats for multiple product IDs.
 * Fetches stats in parallel and caches results.
 */
export function useProductRatings(productIds: string[]): UseProductRatingsReturn {
  const [ratings, setRatings] = useState<ProductRatingMap>({});
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!productIds || productIds.length === 0) return;

    // Only fetch IDs we haven't fetched yet
    const newIds = productIds.filter((id) => !fetchedRef.current.has(id));
    if (newIds.length === 0) return;

    let cancelled = false;

    const fetchRatings = async () => {
      setLoading(true);
      try {
        const results = await Promise.all(
          newIds.map(async (id) => {
            try {
              const { stats } = await FirebaseReviewService.getReviews("product", id);
              return { id, stats };
            } catch {
              return {
                id,
                stats: {
                  averageRating: 0,
                  totalReviews: 0,
                  ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
                  verifiedPurchaseCount: 0,
                  recommendationPercentage: 0,
                } as RatingStats,
              };
            }
          }),
        );

        if (cancelled) return;

        const newRatings: ProductRatingMap = {};
        for (const { id, stats } of results) {
          newRatings[id] = stats;
          fetchedRef.current.add(id);
        }

        setRatings((prev) => ({ ...prev, ...newRatings }));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRatings();

    return () => {
      cancelled = true;
    };
  }, [productIds.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  return { ratings, loading };
}
