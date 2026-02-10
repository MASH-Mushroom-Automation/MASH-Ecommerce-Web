/**
 * ReviewForm Component
 *
 * Allows authenticated users to submit or edit a review for a product or grower.
 * Uses React Hook Form + Zod validation. Integrates with Firebase via useFirebaseReviews.
 */

"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Send, Pencil, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { StarRatingInput } from "./StarRatingInput";
import type {
  CreateReviewInput,
  UpdateReviewInput,
  FirestoreReview,
  ReviewTargetType,
} from "@/types/reviews";

const reviewSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be under 100 characters"),
  content: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(1000, "Review must be under 1000 characters"),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  /** Type of entity being reviewed */
  targetType: ReviewTargetType;
  /** ID of the entity (product ID or grower slug/ID) */
  targetId: string;
  /** Display name of the entity */
  targetName: string;
  /** Submit handler from useFirebaseReviews */
  onSubmit: (input: CreateReviewInput) => Promise<void>;
  /** Update handler from useFirebaseReviews */
  onUpdate: (reviewId: string, input: UpdateReviewInput) => Promise<void>;
  /** Whether the user has already reviewed */
  hasUserReviewed: boolean;
  /** The user's existing review (for editing) */
  existingReview: FirestoreReview | null;
}

export function ReviewForm({
  targetType,
  targetId,
  targetName,
  onSubmit,
  onUpdate,
  hasUserReviewed,
  existingReview,
}: ReviewFormProps) {
  const { user, isAuthenticated } = useAuth();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      title: existingReview?.title || "",
      content: existingReview?.content || "",
    },
  });

  // Not authenticated - show sign-in prompt
  if (!isAuthenticated || !user) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">
              Sign in to leave a review
            </p>
            <Button variant="outline" asChild>
              <a href="/login">Sign In</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Already reviewed and not editing - show edit prompt
  if (hasUserReviewed && !isEditing) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              You have already reviewed this {targetType}. 
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditing(true);
                setRating(existingReview?.rating || 0);
              }}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Review
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const onFormSubmit = async (data: ReviewFormData) => {
    if (rating === 0) {
      setRatingError("Please select a rating.");
      return;
    }
    setRatingError(null);
    setSubmitting(true);

    try {
      if (isEditing && existingReview) {
        await onUpdate(existingReview.id, {
          rating,
          title: data.title,
          content: data.content,
        });
        setIsEditing(false);
      } else {
        await onSubmit({
          targetType,
          targetId,
          targetName,
          rating,
          title: data.title,
          content: data.content,
        });
        reset();
        setRating(0);
      }
    } catch {
      // Error is handled in the hook with toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {isEditing ? "Edit Your Review" : "Write a Review"}
          </CardTitle>
          {isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Star Rating */}
          <div>
            <StarRatingInput
              value={rating}
              onChange={setRating}
              disabled={submitting}
            />
            {ratingError && (
              <p className="text-sm text-destructive mt-1">{ratingError}</p>
            )}
          </div>

          {/* Review Title */}
          <div className="space-y-2">
            <Label htmlFor="review-title">Review Title</Label>
            <Input
              id="review-title"
              placeholder="Summarize your experience"
              disabled={submitting}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Review Content */}
          <div className="space-y-2">
            <Label htmlFor="review-content">Your Review</Label>
            <Textarea
              id="review-content"
              placeholder="Tell others about your experience..."
              rows={4}
              disabled={submitting}
              {...register("content")}
            />
            {errors.content && (
              <p className="text-sm text-destructive">
                {errors.content.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditing ? "Updating..." : "Submitting..."}
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {isEditing ? "Update Review" : "Submit Review"}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
