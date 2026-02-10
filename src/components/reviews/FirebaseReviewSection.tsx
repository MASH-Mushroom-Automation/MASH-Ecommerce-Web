/**
 * FirebaseReviewSection Component
 *
 * Complete review section with rating summary, review list, submission form,
 * and helpful voting. Connects to Firebase Firestore for real-time updates.
 * Works for both product and grower reviews.
 */

"use client";

import React, { useState } from "react";
import {
  Star,
  CheckCircle,
  ThumbsUp,
  Loader2,
  ChevronDown,
  Trash2,
  Flag,
  MessageSquare,
} from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useFirebaseReviews } from "@/hooks/useFirebaseReviews";
import { ReviewForm } from "./ReviewForm";
import { cn } from "@/lib/utils";
import type { FirestoreReview, ReviewTargetType, FlagReviewInput } from "@/types/reviews";

interface FirebaseReviewSectionProps {
  /** Type of entity */
  targetType: ReviewTargetType;
  /** Entity ID (Sanity document _id or slug) */
  targetId: string;
  /** Display name of the entity */
  targetName: string;
  /** Number of reviews to show initially (default: 5) */
  initialCount?: number;
}

type SortOption = "newest" | "highest" | "lowest" | "helpful";

/**
 * Full review section with real-time Firebase reviews.
 *
 * @example
 * <FirebaseReviewSection
 *   targetType="product"
 *   targetId={product.id}
 *   targetName={product.name}
 * />
 */
export function FirebaseReviewSection({
  targetType,
  targetId,
  targetName,
  initialCount = 5,
}: FirebaseReviewSectionProps) {
  const { user } = useAuth();
  const {
    reviews,
    stats,
    loading,
    submitReview,
    updateReview,
    deleteReview,
    voteHelpful,
    flagReview,
    hasUserReviewed,
    userReview,
  } = useFirebaseReviews(targetType, targetId);

  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showAll, setShowAll] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Sort reviews
  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case "highest":
        return b.rating - a.rating;
      case "lowest":
        return a.rating - b.rating;
      case "helpful":
        return b.helpfulCount - a.helpfulCount;
      case "newest":
      default:
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  });

  const displayedReviews = showAll
    ? sortedReviews
    : sortedReviews.slice(0, initialCount);

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {stats && stats.totalReviews > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {targetType === "product" ? "Customer" : "Community"} Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Average Rating */}
              <div className="flex flex-col items-center justify-center text-center p-6 bg-muted/50 rounded-lg">
                <div className="text-5xl font-bold mb-2">
                  {stats.averageRating}
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "w-5 h-5",
                        star <= Math.round(stats.averageRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300",
                      )}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  Based on {stats.totalReviews}{" "}
                  {stats.totalReviews === 1 ? "review" : "reviews"}
                </p>
                {stats.verifiedPurchaseCount > 0 && (
                  <Badge variant="secondary" className="mt-2">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {stats.verifiedPurchaseCount} Verified
                  </Badge>
                )}
                {stats.recommendationPercentage >= 70 && (
                  <p className="text-sm text-green-600 font-medium mt-3">
                    {stats.recommendationPercentage}% recommend this{" "}
                    {targetType}
                  </p>
                )}
              </div>

              {/* Rating Distribution */}
              <div className="space-y-3">
                {([5, 4, 3, 2, 1] as const).map((star) => {
                  const count = stats.ratingDistribution[star];
                  const pct =
                    stats.totalReviews > 0
                      ? (count / stats.totalReviews) * 100
                      : 0;

                  return (
                    <div key={star} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-16">
                        <span className="text-sm font-medium">{star}</span>
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-16 text-right">
                        {count} ({Math.round(pct)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Form */}
      <ReviewForm
        targetType={targetType}
        targetId={targetId}
        targetName={targetName}
        onSubmit={submitReview}
        onUpdate={updateReview}
        hasUserReviewed={hasUserReviewed}
        existingReview={userReview}
      />

      {/* Sort Controls */}
      {reviews.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-lg font-semibold">
            {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
          </h3>
          <div className="flex gap-2">
            {(
              [
                ["newest", "Newest"],
                ["highest", "Highest"],
                ["lowest", "Lowest"],
                ["helpful", "Helpful"],
              ] as const
            ).map(([key, label]) => (
              <Button
                key={key}
                variant={sortBy === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy(key)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
              <p className="text-muted-foreground">
                Be the first to review this {targetType}!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {displayedReviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            currentUserId={user?.id}
            onVoteHelpful={voteHelpful}
            onDelete={deleteReview}
            onFlag={flagReview}
          />
        ))}
      </div>

      {/* Show More Button */}
      {reviews.length > initialCount && !showAll && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setShowAll(true)}
            className="gap-2"
          >
            <ChevronDown className="w-4 h-4" />
            Show All {reviews.length} Reviews
          </Button>
        </div>
      )}

      {/* Real-Time Indicator */}
      {reviews.length > 0 && (
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              Reviews update in real-time
            </AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  );
}

/**
 * Individual review card with helpful voting, flagging, and delete.
 */
function ReviewCard({
  review,
  currentUserId,
  onVoteHelpful,
  onDelete,
  onFlag,
}: {
  review: FirestoreReview;
  currentUserId?: string;
  onVoteHelpful: (reviewId: string) => Promise<void>;
  onDelete: (reviewId: string) => Promise<void>;
  onFlag: (reviewId: string, input: FlagReviewInput) => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);
  const isOwn = currentUserId === review.userId;
  const hasVoted = currentUserId
    ? review.helpfulVotes.includes(currentUserId)
    : false;
  const hasFlagged = currentUserId
    ? review.flaggedBy.includes(currentUserId)
    : false;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your review?")) return;
    setDeleting(true);
    try {
      await onDelete(review.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {review.userPhotoURL && (
              <div className="relative w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src={review.userPhotoURL}
                  alt={review.userName}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm">{review.userName}</h4>
                {review.verifiedPurchase && (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {isOwn && (
                  <Badge variant="outline" className="text-xs">
                    You
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "w-3.5 h-3.5",
                        star <= review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300",
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <h5 className="font-semibold mb-2">{review.title}</h5>

        {/* Content */}
        <p className="text-muted-foreground leading-relaxed mb-4 text-sm">
          {review.content}
        </p>

        {/* Images */}
        {review.images && review.images.length > 0 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {review.images.map((img, idx) => (
              <div
                key={idx}
                className="relative w-20 h-20 rounded-lg overflow-hidden border"
              >
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

        {/* Admin Response */}
        {review.adminResponse && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg border-l-4 border-primary">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Seller Response</span>
              {review.adminResponseDate && (
                <span className="text-xs text-muted-foreground">
                  {new Date(review.adminResponseDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{review.adminResponse}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-muted-foreground hover:text-primary",
              hasVoted && "text-primary",
            )}
            onClick={() => onVoteHelpful(review.id)}
            disabled={isOwn}
          >
            <ThumbsUp
              className={cn("w-4 h-4 mr-2", hasVoted && "fill-current")}
            />
            Helpful ({review.helpfulCount})
          </Button>

          {!isOwn && currentUserId && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-muted-foreground hover:text-orange-500",
                hasFlagged && "text-orange-500",
              )}
              onClick={() => {
                if (hasFlagged) return;
                const reason = prompt("Why are you flagging this review? (spam, inappropriate, fake, offensive, other)");
                if (reason) {
                  onFlag(review.id, {
                    reason: (["spam", "inappropriate", "fake", "offensive"].includes(reason.toLowerCase())
                      ? reason.toLowerCase()
                      : "other") as "spam" | "inappropriate" | "fake" | "offensive" | "other",
                    details: reason,
                  });
                }
              }}
              disabled={hasFlagged}
            >
              <Flag className={cn("w-4 h-4 mr-2", hasFlagged && "fill-current")} />
              {hasFlagged ? "Flagged" : "Flag"}
            </Button>
          )}

          {isOwn && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact rating display for cards and listings.
 */
export function CompactFirebaseRating({
  targetType,
  targetId,
}: {
  targetType: ReviewTargetType;
  targetId: string;
}) {
  const { stats, loading } = useFirebaseReviews(targetType, targetId);

  if (loading || !stats || stats.totalReviews === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "w-3 h-3",
              star <= Math.round(stats.averageRating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300",
            )}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        {stats.averageRating} ({stats.totalReviews})
      </span>
    </div>
  );
}
