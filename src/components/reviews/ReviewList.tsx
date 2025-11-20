/**
 * ReviewList Component
 * 
 * Displays product reviews with rating summary, distribution chart, and individual review cards.
 * Updates in real-time when reviews are added/modified in Sanity CMS.
 * 
 * Phase 8: Customer Reviews System
 */

"use client";

import { useSanityReviews } from "@/hooks/useSanityReviews";
import { Star, CheckCircle, ThumbsUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { useState } from "react";

interface ReviewListProps {
  productId: string;
  showForm?: boolean;
}

/**
 * Display product reviews with real-time updates
 * 
 * @param productId - Sanity product document ID
 * @param showForm - Show review submission form (default: false)
 * 
 * @example
 * <ReviewList productId={product._id} />
 */
export function ReviewList({ productId, showForm = false }: ReviewListProps) {
  const { reviews, rating, loading } = useSanityReviews(productId);
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'helpful'>('newest');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!rating || rating.totalReviews === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to review this product!
            </p>
            {showForm && (
              <Button>Write a Review</Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort reviews
  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'highest':
        return b.rating - a.rating;
      case 'helpful':
        return b.helpfulCount - a.helpfulCount;
      case 'newest':
      default:
        return new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime();
    }
  });

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Average Rating */}
            <div className="flex flex-col items-center justify-center text-center p-6 bg-muted/50 rounded-lg">
              <div className="text-6xl font-bold mb-2">{rating.averageRating}</div>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${
                      star <= Math.round(rating.averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                Based on {rating.totalReviews} {rating.totalReviews === 1 ? 'review' : 'reviews'}
              </p>
              {rating.verifiedPurchaseCount > 0 && (
                <Badge variant="secondary" className="mt-2">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {rating.verifiedPurchaseCount} Verified {rating.verifiedPurchaseCount === 1 ? 'Purchase' : 'Purchases'}
                </Badge>
              )}
              {rating.recommendationPercentage >= 70 && (
                <p className="text-sm text-green-600 font-medium mt-3">
                  {rating.recommendationPercentage}% of customers recommend this product
                </p>
              )}
            </div>

            {/* Rating Distribution */}
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = rating.ratingDistribution[star as keyof typeof rating.ratingDistribution];
                const percentage = rating.totalReviews > 0 ? (count / rating.totalReviews) * 100 : 0;
                
                return (
                  <div key={star} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-medium">{star}</span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-16 text-right">
                      {count} ({Math.round(percentage)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Write Review Button */}
          {showForm && (
            <div className="mt-6 text-center">
              <Button size="lg">Write a Review</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}</h3>
        <div className="flex gap-2">
          <Button
            variant={sortBy === 'newest' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('newest')}
          >
            Newest
          </Button>
          <Button
            variant={sortBy === 'highest' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('highest')}
          >
            Highest Rated
          </Button>
          <Button
            variant={sortBy === 'helpful' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('helpful')}
          >
            Most Helpful
          </Button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {sortedReviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{review.customerName}</h4>
                    {review.verifiedPurchase && (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified Purchase
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.reviewDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Title */}
              <h5 className="font-semibold text-lg mb-2">{review.title}</h5>

              {/* Review Content */}
              <p className="text-muted-foreground leading-relaxed mb-4">{review.content}</p>

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mb-4 flex-wrap">
                  {review.images.map((img, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border">
                      <Image
                        src={img}
                        alt={`Review image ${idx + 1}`}
                        fill
                        className="object-cover hover:scale-110 transition-transform cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Helpful Button */}
              <div className="flex items-center gap-4 pt-4 border-t">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Helpful ({review.helpfulCount})
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Real-Time Indicator */}
      <Alert className="bg-blue-50 border-blue-200">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <AlertDescription className="text-blue-800">
            Reviews update in real-time • Changes appear in 1-2 seconds
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
}

/**
 * Compact review summary for product cards
 * 
 * @example
 * <CompactReviewSummary productId={product._id} />
 */
export function CompactReviewSummary({ productId }: { productId: string }) {
  const { rating, loading } = useSanityReviews(productId);

  if (loading || !rating || rating.totalReviews === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= Math.round(rating.averageRating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        {rating.averageRating} ({rating.totalReviews})
      </span>
    </div>
  );
}
