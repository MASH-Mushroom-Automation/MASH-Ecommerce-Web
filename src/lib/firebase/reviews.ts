/**
 * Firebase Review Service
 *
 * Provides CRUD operations for product and grower reviews stored in Firestore.
 * Supports real-time listeners, helpful votes, and rating aggregation.
 *
 * Collection: /reviews/{reviewId}
 * Indexes: targetType+targetId+status (composite), userId+targetId (uniqueness check)
 */

import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  type Firestore,
  type Unsubscribe,
  Timestamp,
} from "firebase/firestore";
import { firebaseApp } from "./config";
import type {
  FirestoreReview,
  CreateReviewInput,
  UpdateReviewInput,
  RatingStats,
  ReviewTargetType,
} from "@/types/reviews";

const REVIEWS_COLLECTION = "reviews";

/** Get Firestore instance */
function getDb(): Firestore {
  return getFirestore(firebaseApp);
}

/**
 * Calculate rating statistics from a set of reviews.
 */
function calculateRatingStats(reviews: FirestoreReview[]): RatingStats {
  const approvedReviews = reviews.filter((r) => r.status === "approved");

  if (approvedReviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      verifiedPurchaseCount: 0,
      recommendationPercentage: 0,
    };
  }

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let totalRating = 0;
  let verifiedCount = 0;

  for (const review of approvedReviews) {
    const r = review.rating as 1 | 2 | 3 | 4 | 5;
    if (r >= 1 && r <= 5) {
      distribution[r]++;
    }
    totalRating += review.rating;
    if (review.verifiedPurchase) verifiedCount++;
  }

  const avg = totalRating / approvedReviews.length;
  const recommended = distribution[5] + distribution[4];
  const recommendationPct = (recommended / approvedReviews.length) * 100;

  return {
    averageRating: Math.round(avg * 10) / 10,
    totalReviews: approvedReviews.length,
    ratingDistribution: distribution,
    verifiedPurchaseCount: verifiedCount,
    recommendationPercentage: Math.round(recommendationPct),
  };
}

/**
 * Transform a Firestore document snapshot into a FirestoreReview object.
 */
function transformDoc(docSnap: { id: string; data: () => Record<string, unknown> }): FirestoreReview {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    targetType: (data.targetType as string) as FirestoreReview["targetType"],
    targetId: data.targetId as string,
    targetName: data.targetName as string,
    userId: data.userId as string,
    userName: data.userName as string,
    userEmail: data.userEmail as string,
    userPhotoURL: data.userPhotoURL as string | undefined,
    rating: data.rating as number,
    title: data.title as string,
    content: data.content as string,
    images: (data.images as string[]) || [],
    verifiedPurchase: (data.verifiedPurchase as boolean) || false,
    status: (data.status as string as FirestoreReview["status"]) || "pending",
    helpfulCount: (data.helpfulCount as number) || 0,
    helpfulVotes: (data.helpfulVotes as string[]) || [],
    createdAt: data.createdAt instanceof Timestamp
      ? data.createdAt.toDate().toISOString()
      : (data.createdAt as string) || new Date().toISOString(),
    updatedAt: data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate().toISOString()
      : (data.updatedAt as string) || new Date().toISOString(),
  };
}

export const FirebaseReviewService = {
  /**
   * Create a new review in Firestore.
   * Auto-approves reviews (no moderation queue for Firebase reviews).
   */
  async createReview(
    userId: string,
    userName: string,
    userEmail: string,
    userPhotoURL: string | undefined,
    input: CreateReviewInput,
  ): Promise<FirestoreReview> {
    const db = getDb();

    // Check if user already reviewed this entity
    const existingQuery = query(
      collection(db, REVIEWS_COLLECTION),
      where("userId", "==", userId),
      where("targetId", "==", input.targetId),
      where("targetType", "==", input.targetType),
      limit(1),
    );
    const existingSnap = await getDocs(existingQuery);
    if (!existingSnap.empty) {
      throw new Error("You have already reviewed this item. You can edit your existing review.");
    }

    // Validate rating range
    if (input.rating < 1 || input.rating > 5 || !Number.isInteger(input.rating)) {
      throw new Error("Rating must be an integer between 1 and 5.");
    }

    const now = new Date().toISOString();
    const reviewData = {
      targetType: input.targetType,
      targetId: input.targetId,
      targetName: input.targetName,
      userId,
      userName,
      userEmail,
      userPhotoURL: userPhotoURL || undefined,
      rating: input.rating,
      title: input.title.trim(),
      content: input.content.trim(),
      images: input.images || [],
      verifiedPurchase: false,
      status: "approved" as const,
      helpfulCount: 0,
      helpfulVotes: [],
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), reviewData);
    console.log("[Reviews] Created review:", docRef.id);

    return { ...reviewData, id: docRef.id };
  },

  /**
   * Fetch all approved reviews for a specific target (product or grower).
   */
  async getReviews(
    targetType: ReviewTargetType,
    targetId: string,
  ): Promise<{ reviews: FirestoreReview[]; stats: RatingStats }> {
    const db = getDb();
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where("targetType", "==", targetType),
      where("targetId", "==", targetId),
      where("status", "==", "approved"),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(q);
    const reviews = snapshot.docs.map((d) =>
      transformDoc(d as unknown as { id: string; data: () => Record<string, unknown> }),
    );
    const stats = calculateRatingStats(reviews);

    return { reviews, stats };
  },

  /**
   * Get a user's review for a specific target (if it exists).
   */
  async getUserReview(
    userId: string,
    targetType: ReviewTargetType,
    targetId: string,
  ): Promise<FirestoreReview | null> {
    const db = getDb();
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where("userId", "==", userId),
      where("targetId", "==", targetId),
      where("targetType", "==", targetType),
      limit(1),
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    return transformDoc(
      snapshot.docs[0] as unknown as { id: string; data: () => Record<string, unknown> },
    );
  },

  /**
   * Update an existing review (only the owner can update).
   */
  async updateReview(
    reviewId: string,
    userId: string,
    input: UpdateReviewInput,
  ): Promise<void> {
    const db = getDb();
    const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Review not found.");
    }

    const existing = docSnap.data();
    if (existing.userId !== userId) {
      throw new Error("You can only edit your own reviews.");
    }

    if (input.rating !== undefined) {
      if (input.rating < 1 || input.rating > 5 || !Number.isInteger(input.rating)) {
        throw new Error("Rating must be an integer between 1 and 5.");
      }
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (input.rating !== undefined) updateData.rating = input.rating;
    if (input.title !== undefined) updateData.title = input.title.trim();
    if (input.content !== undefined) updateData.content = input.content.trim();
    if (input.images !== undefined) updateData.images = input.images;

    await updateDoc(docRef, updateData);
    console.log("[Reviews] Updated review:", reviewId);
  },

  /**
   * Delete a review (only the owner can delete).
   */
  async deleteReview(reviewId: string, userId: string): Promise<void> {
    const db = getDb();
    const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Review not found.");
    }

    const existing = docSnap.data();
    if (existing.userId !== userId) {
      throw new Error("You can only delete your own reviews.");
    }

    await deleteDoc(docRef);
    console.log("[Reviews] Deleted review:", reviewId);
  },

  /**
   * Toggle helpful vote on a review.
   * If the user already voted, removes the vote. Otherwise, adds it.
   */
  async toggleHelpfulVote(reviewId: string, userId: string): Promise<void> {
    const db = getDb();
    const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Review not found.");
    }

    const data = docSnap.data();
    const helpfulVotes: string[] = data.helpfulVotes || [];
    const alreadyVoted = helpfulVotes.includes(userId);

    if (alreadyVoted) {
      await updateDoc(docRef, {
        helpfulVotes: arrayRemove(userId),
        helpfulCount: increment(-1),
      });
    } else {
      await updateDoc(docRef, {
        helpfulVotes: arrayUnion(userId),
        helpfulCount: increment(1),
      });
    }
  },

  /**
   * Subscribe to real-time review updates for a target entity.
   * Returns an unsubscribe function.
   */
  subscribeToReviews(
    targetType: ReviewTargetType,
    targetId: string,
    callback: (reviews: FirestoreReview[], stats: RatingStats) => void,
  ): Unsubscribe {
    const db = getDb();
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where("targetType", "==", targetType),
      where("targetId", "==", targetId),
      where("status", "==", "approved"),
      orderBy("createdAt", "desc"),
    );

    return onSnapshot(q, (snapshot) => {
      const reviews = snapshot.docs.map((d) =>
        transformDoc(d as unknown as { id: string; data: () => Record<string, unknown> }),
      );
      const stats = calculateRatingStats(reviews);
      callback(reviews, stats);
    });
  },
};

export { calculateRatingStats };
export type { RatingStats as FirebaseRatingStats };
