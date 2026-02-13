"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FirebaseReviewService, calculateRatingStats } from "@/lib/firebase/reviews";
import { sanityClient } from "@/lib/sanity/client";
import type { FirestoreReview, RatingStats } from "@/types/reviews";

interface SellerProduct {
  _id: string;
  name: string;
  slug: string;
}

interface SellerReviewsReturn {
  reviews: FirestoreReview[];
  stats: RatingStats;
  products: SellerProduct[];
  loading: boolean;
  error: string | null;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  ratingFilter: number | null;
  setRatingFilter: (rating: number | null) => void;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  paginatedReviews: FirestoreReview[];
  recentCount: number;
}

const PAGE_SIZE = 15;

/**
 * Hook for seller to view reviews on their products.
 * Fetches seller's products from Sanity, then reviews from Firestore.
 */
export function useSellerReviews(): SellerReviewsReturn {
  const { user } = useAuth();
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [allReviews, setAllReviews] = useState<FirestoreReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [page, setPage] = useState(0);

  // Fetch seller's products and their reviews
  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch seller's products from Sanity
      const sellerProducts = await sanityClient.fetch<SellerProduct[]>(
        `*[_type == "product" && (
          grower->slug.current == $userId ||
          grower._ref == $userId ||
          seller == $userId
        )]{
          _id,
          name,
          "slug": slug.current
        }`,
        { userId: user.id },
      );

      setProducts(sellerProducts);

      if (sellerProducts.length === 0) {
        setAllReviews([]);
        setLoading(false);
        return;
      }

      // Fetch reviews for all seller products
      const productIds = sellerProducts.map((p) => p._id);
      const reviewPromises = productIds.map((id) =>
        FirebaseReviewService.getReviews("product", id)
          .then((result) => result.reviews)
          .catch(() => [] as FirestoreReview[]),
      );

      const reviewArrays = await Promise.all(reviewPromises);
      const allSellerReviews = reviewArrays
        .flat()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setAllReviews(allSellerReviews);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Apply filters
  const filteredReviews = useMemo(() => {
    let result = [...allReviews];

    if (selectedProductId) {
      result = result.filter((r) => r.targetId === selectedProductId);
    }
    if (ratingFilter !== null) {
      result = result.filter((r) => r.rating === ratingFilter);
    }

    return result;
  }, [allReviews, selectedProductId, ratingFilter]);

  // Stats computed from all (unfiltered) reviews
  const stats = useMemo(() => calculateRatingStats(allReviews), [allReviews]);

  // Recent reviews count (last 7 days)
  const recentCount = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return allReviews.filter((r) => new Date(r.createdAt).getTime() > sevenDaysAgo).length;
  }, [allReviews]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / PAGE_SIZE));
  const paginatedReviews = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filteredReviews.slice(start, start + PAGE_SIZE);
  }, [filteredReviews, page]);

  // Reset page on filter change
  useEffect(() => {
    setPage(0);
  }, [selectedProductId, ratingFilter]);

  return {
    reviews: filteredReviews,
    stats,
    products,
    loading,
    error,
    selectedProductId,
    setSelectedProductId,
    ratingFilter,
    setRatingFilter,
    page,
    setPage,
    totalPages,
    paginatedReviews,
    recentCount,
  };
}
