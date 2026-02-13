"use client";

import { useState, useEffect, useRef } from "react";
import { FirebaseReviewService } from "@/lib/firebase/reviews";
import type { RatingStats } from "@/types/reviews";

interface GrowerRatingMap {
  [growerId: string]: RatingStats;
}

interface UseGrowerRatingsReturn {
  ratings: GrowerRatingMap;
  loading: boolean;
}

/**
 * Batch-fetch review rating stats for multiple growers.
 * Fetches stats in parallel for all provided grower IDs.
 * Caches results to avoid duplicate fetches.
 */
export function useGrowerRatings(growerIds: string[]): UseGrowerRatingsReturn {
  const [ratings, setRatings] = useState<GrowerRatingMap>({});
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!growerIds || growerIds.length === 0) return;

    // Only fetch IDs we haven't fetched yet
    const newIds = growerIds.filter((id) => !fetchedRef.current.has(id));
    if (newIds.length === 0) return;

    let cancelled = false;

    const fetchRatings = async () => {
      setLoading(true);
      try {
        const results = await Promise.all(
          newIds.map(async (id) => {
            try {
              const { stats } = await FirebaseReviewService.getReviews("grower", id);
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

        const newRatings: GrowerRatingMap = {};
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
  }, [growerIds.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  return { ratings, loading };
}
