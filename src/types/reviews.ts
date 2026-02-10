/**
 * Review & Rating Type Definitions
 *
 * TypeScript interfaces for product and grower reviews stored in Firebase Firestore.
 * Supports both product reviews and grower/store reviews with unified rating system.
 */

/** The entity type a review is associated with */
export type ReviewTargetType = "product" | "grower";

/** Moderation status of a review */
export type ReviewStatus = "pending" | "approved" | "rejected";

/**
 * Core review data stored in Firestore.
 * Used for both product and grower reviews.
 */
export interface FirestoreReview {
  /** Firestore document ID (auto-generated) */
  id: string;
  /** Type of entity being reviewed */
  targetType: ReviewTargetType;
  /** ID of the product or grower being reviewed (Sanity document _id or slug) */
  targetId: string;
  /** Display name of the reviewed entity (for denormalized reads) */
  targetName: string;
  /** Firebase Auth UID of the reviewer */
  userId: string;
  /** Display name of the reviewer */
  userName: string;
  /** Email of the reviewer */
  userEmail: string;
  /** Avatar URL of the reviewer */
  userPhotoURL?: string;
  /** Star rating 1-5 */
  rating: number;
  /** Short review title */
  title: string;
  /** Full review text */
  content: string;
  /** Optional image URLs uploaded by the reviewer */
  images?: string[];
  /** Whether the user has purchased the product */
  verifiedPurchase: boolean;
  /** Moderation status */
  status: ReviewStatus;
  /** Number of helpful votes */
  helpfulCount: number;
  /** Array of user IDs who marked this review as helpful */
  helpfulVotes: string[];
  /** ISO timestamp when the review was created */
  createdAt: string;
  /** ISO timestamp when the review was last updated */
  updatedAt: string;
}

/**
 * Data required to create a new review.
 * Fields like id, createdAt, updatedAt, status are auto-set by the service.
 */
export interface CreateReviewInput {
  targetType: ReviewTargetType;
  targetId: string;
  targetName: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
}

/**
 * Data allowed when updating a review (only review content, not metadata).
 */
export interface UpdateReviewInput {
  rating?: number;
  title?: string;
  content?: string;
  images?: string[];
}

/**
 * Aggregated rating statistics for a product or grower.
 */
export interface RatingStats {
  /** Weighted average rating (1 decimal place) */
  averageRating: number;
  /** Total number of approved reviews */
  totalReviews: number;
  /** Distribution of ratings by star count */
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  /** Number of reviews from verified purchasers */
  verifiedPurchaseCount: number;
  /** Percentage of 4-5 star reviews */
  recommendationPercentage: number;
}

/**
 * Return type for the useReviews hook.
 */
export interface UseReviewsReturn {
  reviews: FirestoreReview[];
  stats: RatingStats | null;
  loading: boolean;
  error: string | null;
  /** Submit a new review */
  submitReview: (input: CreateReviewInput) => Promise<void>;
  /** Update an existing review (own review only) */
  updateReview: (reviewId: string, input: UpdateReviewInput) => Promise<void>;
  /** Delete a review (own review only) */
  deleteReview: (reviewId: string) => Promise<void>;
  /** Vote a review as helpful */
  voteHelpful: (reviewId: string) => Promise<void>;
  /** Check if current user already reviewed this entity */
  hasUserReviewed: boolean;
  /** The current user's review if it exists */
  userReview: FirestoreReview | null;
  /** Re-fetch reviews */
  refetch: () => void;
}
