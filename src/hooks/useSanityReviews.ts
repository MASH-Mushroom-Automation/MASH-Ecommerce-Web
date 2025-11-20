/**
 * useSanityReviews Hook
 * 
 * Custom React hook for fetching product reviews from Sanity CMS with real-time updates.
 * Includes rating calculations and review statistics.
 * 
 * Phase 8: Customer Reviews System
 */

import { useState, useEffect, useCallback } from 'react';
import { sanityClient } from '@/lib/sanity/client';

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  verifiedPurchase: boolean;
  reviewDate: string;
  helpfulCount: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ProductRating {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  verifiedPurchaseCount: number;
  recommendationPercentage: number; // % of 4-5 star reviews
}

interface UseSanityReviewsReturn {
  reviews: Review[];
  rating: ProductRating | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetch reviews for a specific product with real-time updates
 * 
 * @param productId - The Sanity document ID of the product
 * @param includeAll - Include pending/rejected reviews (for admin)
 * @returns reviews, rating statistics, loading state, error, and refetch function
 * 
 * @example
 * const { reviews, rating, loading } = useSanityReviews(product._id);
 */
export function useSanityReviews(
  productId: string,
  includeAll: boolean = false
): UseSanityReviewsReturn {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<ProductRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      console.log('⭐ [REVIEWS] Fetching reviews for product:', productId);
      
      const statusFilter = includeAll ? '' : `&& status == "approved"`;
      
      const query = `{
        "reviews": *[_type == "review" && product._ref == $productId ${statusFilter}] | order(reviewDate desc) {
          _id,
          "productId": product._ref,
          customerName,
          customerEmail,
          rating,
          title,
          content,
          "images": images[].asset->url,
          verifiedPurchase,
          reviewDate,
          helpfulCount,
          status
        },
        "stats": *[_type == "review" && product._ref == $productId && status == "approved"] {
          rating,
          verifiedPurchase
        }
      }`;

      const data = await sanityClient.fetch(query, { productId });
      
      // Transform reviews
      const transformedReviews: Review[] = data.reviews.map((review: any) => ({
        id: review._id,
        productId: review.productId,
        customerName: review.customerName,
        customerEmail: review.customerEmail,
        rating: review.rating,
        title: review.title,
        content: review.content,
        images: review.images || [],
        verifiedPurchase: review.verifiedPurchase,
        reviewDate: review.reviewDate,
        helpfulCount: review.helpfulCount || 0,
        status: review.status,
      }));

      // Calculate rating statistics
      const ratings = data.stats.map((s: any) => s.rating);
      const verifiedCount = data.stats.filter((s: any) => s.verifiedPurchase).length;
      
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      
      ratings.forEach((r: number) => {
        if (r >= 1 && r <= 5) {
          distribution[r as keyof typeof distribution]++;
        }
      });

      const avgRating = ratings.length > 0
        ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
        : 0;

      const recommendedCount = distribution[5] + distribution[4];
      const recommendationPercentage = ratings.length > 0
        ? (recommendedCount / ratings.length) * 100
        : 0;

      setReviews(transformedReviews);
      setRating({
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: ratings.length,
        ratingDistribution: distribution,
        verifiedPurchaseCount: verifiedCount,
        recommendationPercentage: Math.round(recommendationPercentage),
      });
      
      setLoading(false);
      setError(null);

      console.log('📊 [REVIEWS] Reviews loaded:', {
        count: transformedReviews.length,
        avgRating: avgRating.toFixed(1),
        verified: verifiedCount,
        recommendation: `${recommendationPercentage.toFixed(0)}%`,
      });

    } catch (err) {
      console.error('❌ [REVIEWS] Error fetching reviews:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch reviews'));
      setLoading(false);
    }
  }, [productId, includeAll]);

  useEffect(() => {
    fetchReviews();

    // 🔄 Real-time subscription for review updates
    console.log('🧹 [REVIEWS] Setting up real-time subscription...');
    
    const subscription = sanityClient
      .listen(`*[_type == "review" && product._ref == "${productId}"]`)
      .subscribe((update) => {
        if (update.type === 'mutation') {
          console.log('🔄 [REVIEWS] Review updated in real-time! Refreshing...');
          fetchReviews();
        }
      });

    return () => {
      console.log('🧹 [REVIEWS] Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, [fetchReviews, productId]);

  return { reviews, rating, loading, error, refetch: fetchReviews };
}

/**
 * Fetch all reviews across all products (for admin dashboard)
 * 
 * @returns All reviews with statistics
 * 
 * @example
 * const { reviews, loading } = useAllReviews();
 */
export function useAllReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAllReviews = useCallback(async () => {
    try {
      console.log('⭐ [REVIEWS] Fetching all reviews...');
      
      const query = `*[_type == "review"] | order(reviewDate desc) {
        _id,
        "productId": product._ref,
        "productName": product->name,
        customerName,
        customerEmail,
        rating,
        title,
        content,
        "images": images[].asset->url,
        verifiedPurchase,
        reviewDate,
        helpfulCount,
        status
      }`;

      const data = await sanityClient.fetch(query);
      
      const transformedReviews: Review[] = data.map((review: any) => ({
        id: review._id,
        productId: review.productId,
        productName: review.productName,
        customerName: review.customerName,
        customerEmail: review.customerEmail,
        rating: review.rating,
        title: review.title,
        content: review.content,
        images: review.images || [],
        verifiedPurchase: review.verifiedPurchase,
        reviewDate: review.reviewDate,
        helpfulCount: review.helpfulCount || 0,
        status: review.status,
      }));

      setReviews(transformedReviews);
      setLoading(false);
      setError(null);

      console.log('📊 [REVIEWS] All reviews loaded:', transformedReviews.length);

    } catch (err) {
      console.error('❌ [REVIEWS] Error fetching all reviews:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch reviews'));
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllReviews();

    // Real-time subscription for all reviews
    const subscription = sanityClient
      .listen('*[_type == "review"]')
      .subscribe((update) => {
        if (update.type === 'mutation') {
          console.log('🔄 [REVIEWS] Reviews updated in real-time!');
          fetchAllReviews();
        }
      });

    return () => subscription.unsubscribe();
  }, [fetchAllReviews]);

  return { reviews, loading, error, refetch: fetchAllReviews };
}
