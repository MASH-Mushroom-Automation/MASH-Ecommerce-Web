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
  FlagReviewInput,
  RatingStats,
  ReviewTargetType,
  ReviewStatus,
  ModerationAction,
  ModerationLogEntry,
  ReviewFilters,
  ModerationStats,
} from "@/types/reviews";

const REVIEWS_COLLECTION = "reviews";

/** Get Firestore instance */
function getDb(): Firestore {
  return getFirestore(firebaseApp);
}

/** Safely check if a value is a Firestore Timestamp (works with mocked Timestamp too) */
function isFirestoreTimestamp(value: unknown): value is Timestamp {
  return (
    value !== null &&
    value !== undefined &&
    typeof value === "object" &&
    typeof (value as Record<string, unknown>).toDate === "function"
  );
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
 * Calculate moderation statistics from all reviews (not just approved).
 */
function calculateModerationStats(reviews: FirestoreReview[]): ModerationStats {
  if (reviews.length === 0) {
    return {
      totalReviews: 0,
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
      flaggedCount: 0,
      averageRating: 0,
    };
  }

  let totalRating = 0;
  let pendingCount = 0;
  let approvedCount = 0;
  let rejectedCount = 0;
  let flaggedCount = 0;

  for (const review of reviews) {
    totalRating += review.rating;
    switch (review.status) {
      case "pending":
        pendingCount++;
        break;
      case "approved":
        approvedCount++;
        break;
      case "rejected":
        rejectedCount++;
        break;
      case "flagged":
        flaggedCount++;
        break;
    }
    if (review.flagCount > 0) {
      flaggedCount = Math.max(flaggedCount, reviews.filter((r) => r.flagCount > 0).length);
    }
  }

  // Deduplicate: flaggedCount is actual reviews with flags > 0
  flaggedCount = reviews.filter((r) => r.flagCount > 0).length;

  return {
    totalReviews: reviews.length,
    pendingCount,
    approvedCount,
    rejectedCount,
    flaggedCount,
    averageRating: Math.round((totalRating / reviews.length) * 10) / 10,
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
    adminResponse: data.adminResponse as string | undefined,
    adminResponseDate: data.adminResponseDate as string | undefined,
    flagCount: (data.flagCount as number) || 0,
    flaggedBy: (data.flaggedBy as string[]) || [],
    flagReasons: (data.flagReasons as string[]) || [],
    moderatedBy: data.moderatedBy as string | undefined,
    moderatedAt: data.moderatedAt as string | undefined,
    sellerResponse: data.sellerResponse as string | undefined,
    sellerResponseDate: data.sellerResponseDate as string | undefined,
    sellerRespondedBy: data.sellerRespondedBy as string | undefined,
    createdAt: isFirestoreTimestamp(data.createdAt)
      ? (data.createdAt as Timestamp).toDate().toISOString()
      : (data.createdAt as string) || new Date().toISOString(),
    updatedAt: isFirestoreTimestamp(data.updatedAt)
      ? (data.updatedAt as Timestamp).toDate().toISOString()
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
      userPhotoURL: userPhotoURL || null,
      rating: input.rating,
      title: input.title.trim(),
      content: input.content.trim(),
      images: input.images || [],
      verifiedPurchase: input.verifiedPurchase || false,
      status: "approved" as const,
      helpfulCount: 0,
      helpfulVotes: [],
      adminResponse: null,
      adminResponseDate: null,
      flagCount: 0,
      flaggedBy: [],
      flagReasons: [],
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
   * Flag a review for moderation.
   * Each user can only flag a review once.
   */
  async flagReview(reviewId: string, userId: string, input: FlagReviewInput): Promise<void> {
    const db = getDb();
    const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Review not found.");
    }

    const data = docSnap.data();
    const flaggedBy: string[] = data.flaggedBy || [];

    if (flaggedBy.includes(userId)) {
      throw new Error("You have already flagged this review.");
    }

    // Cannot flag own review
    if (data.userId === userId) {
      throw new Error("You cannot flag your own review.");
    }

    const reasonText = input.details
      ? `${input.reason}: ${input.details}`
      : input.reason;

    await updateDoc(docRef, {
      flaggedBy: arrayUnion(userId),
      flagReasons: arrayUnion(reasonText),
      flagCount: increment(1),
      updatedAt: new Date().toISOString(),
    });

    console.log("[Reviews] Flagged review:", reviewId, "reason:", input.reason);
  },

  /**
   * Moderate a review (admin only): approve, reject, flag, or delete.
   * Writes a moderation log entry to a subcollection for audit trail.
   */
  async moderateReview(
    reviewId: string,
    adminId: string,
    action: ModerationAction,
    reason?: string,
  ): Promise<void> {
    const db = getDb();
    const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Review not found.");
    }

    const statusMap: Record<ModerationAction, ReviewStatus> = {
      approve: "approved",
      reject: "rejected",
      flag: "flagged",
      delete: "rejected", // soft-delete by rejecting
    };

    const newStatus = statusMap[action];
    const now = new Date().toISOString();

    const updateData: Record<string, unknown> = {
      status: newStatus,
      moderatedBy: adminId,
      moderatedAt: now,
      updatedAt: now,
    };

    if (action === "reject" && reason) {
      updateData.rejectionReason = reason;
    }

    await updateDoc(docRef, updateData);

    // Write moderation log entry to subcollection
    const logEntry: ModerationLogEntry = {
      action,
      adminId,
      reason,
      timestamp: now,
    };
    await addDoc(collection(db, REVIEWS_COLLECTION, reviewId, "moderationLog"), logEntry);

    console.log("[Reviews] Moderated review:", reviewId, "action:", action);
  },

  /**
   * Add an admin response to a review.
   */
  async addAdminResponse(
    reviewId: string,
    adminId: string,
    response: string,
  ): Promise<void> {
    if (!response || response.trim().length < 10) {
      throw new Error("Admin response must be at least 10 characters.");
    }

    const db = getDb();
    const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Review not found.");
    }

    const now = new Date().toISOString();
    await updateDoc(docRef, {
      adminResponse: response.trim(),
      adminResponseDate: now,
      updatedAt: now,
    });

    // Log admin response action
    const logEntry: ModerationLogEntry = {
      action: "approve" as ModerationAction,
      adminId,
      reason: "Admin response added",
      timestamp: now,
    };
    await addDoc(collection(db, REVIEWS_COLLECTION, reviewId, "moderationLog"), logEntry);

    console.log("[Reviews] Admin response added to review:", reviewId);
  },

  /**
   * Fetch ALL reviews (no status filter) for admin dashboard.
   * Optionally filter by targetType.
   */
  async getAllReviews(
    filters?: ReviewFilters,
  ): Promise<{ reviews: FirestoreReview[]; stats: ModerationStats }> {
    const db = getDb();

    // Base query: all reviews without status filter
    let q;
    if (filters?.targetType) {
      q = query(
        collection(db, REVIEWS_COLLECTION),
        where("targetType", "==", filters.targetType),
        orderBy("createdAt", "desc"),
      );
    } else {
      q = query(
        collection(db, REVIEWS_COLLECTION),
        orderBy("createdAt", "desc"),
      );
    }

    const snapshot = await getDocs(q);
    let reviews = snapshot.docs.map((d) =>
      transformDoc(d as unknown as { id: string; data: () => Record<string, unknown> }),
    );

    // Apply client-side filters
    if (filters?.status) {
      reviews = reviews.filter((r) => r.status === filters.status);
    }
    if (filters?.ratingMin !== undefined) {
      reviews = reviews.filter((r) => r.rating >= filters.ratingMin!);
    }
    if (filters?.ratingMax !== undefined) {
      reviews = reviews.filter((r) => r.rating <= filters.ratingMax!);
    }
    if (filters?.dateFrom) {
      reviews = reviews.filter((r) => r.createdAt >= filters.dateFrom!);
    }
    if (filters?.dateTo) {
      reviews = reviews.filter((r) => r.createdAt <= filters.dateTo!);
    }
    if (filters?.keyword) {
      const kw = filters.keyword.toLowerCase();
      reviews = reviews.filter(
        (r) =>
          r.title.toLowerCase().includes(kw) ||
          r.content.toLowerCase().includes(kw) ||
          r.userName.toLowerCase().includes(kw),
      );
    }
    if (filters?.flaggedOnly) {
      reviews = reviews.filter((r) => r.flagCount > 0);
    }

    // Calculate moderation stats from unfiltered data
    const allReviews = snapshot.docs.map((d) =>
      transformDoc(d as unknown as { id: string; data: () => Record<string, unknown> }),
    );
    const moderationStats = calculateModerationStats(allReviews);

    return { reviews, stats: moderationStats };
  },

  /**
   * Fetch reviews by status (admin use).
   */
  async getReviewsByStatus(
    status: ReviewStatus,
  ): Promise<FirestoreReview[]> {
    const db = getDb();
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where("status", "==", status),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) =>
      transformDoc(d as unknown as { id: string; data: () => Record<string, unknown> }),
    );
  },

  /**
   * Delete a review as admin (hard delete with audit log).
   */
  async deleteReviewAsAdmin(
    reviewId: string,
    adminId: string,
    reason?: string,
  ): Promise<void> {
    const db = getDb();
    const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Review not found.");
    }

    // Write moderation log before deleting
    const logEntry: ModerationLogEntry = {
      action: "delete",
      adminId,
      reason: reason || "Admin deleted review",
      timestamp: new Date().toISOString(),
    };
    await addDoc(collection(db, REVIEWS_COLLECTION, reviewId, "moderationLog"), logEntry);

    await deleteDoc(docRef);
    console.log("[Reviews] Admin deleted review:", reviewId, "by:", adminId);
  },

  /**
   * Clear all flags on a review after admin review.
   */
  async clearFlags(
    reviewId: string,
    adminId: string,
  ): Promise<void> {
    const db = getDb();
    const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Review not found.");
    }

    const now = new Date().toISOString();
    await updateDoc(docRef, {
      flagCount: 0,
      flaggedBy: [],
      flagReasons: [],
      moderatedBy: adminId,
      moderatedAt: now,
      updatedAt: now,
    });

    // Log the flag clearing
    const logEntry: ModerationLogEntry = {
      action: "approve",
      adminId,
      reason: "Flags cleared after admin review",
      timestamp: now,
    };
    await addDoc(collection(db, REVIEWS_COLLECTION, reviewId, "moderationLog"), logEntry);

    console.log("[Reviews] Cleared flags on review:", reviewId);
  },

  /**
   * Add a seller response to a review.
   */
  async addSellerResponse(
    reviewId: string,
    sellerId: string,
    sellerName: string,
    response: string,
  ): Promise<void> {
    if (!response || response.trim().length < 10) {
      throw new Error("Seller response must be at least 10 characters.");
    }

    const db = getDb();
    const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Review not found.");
    }

    const now = new Date().toISOString();
    await updateDoc(docRef, {
      sellerResponse: response.trim(),
      sellerResponseDate: now,
      sellerRespondedBy: sellerId,
      updatedAt: now,
    });

    console.log("[Reviews] Seller response added to review:", reviewId);
  },

  /**
   * Update a seller response (within 24 hours of original).
   */
  async updateSellerResponse(
    reviewId: string,
    sellerId: string,
    response: string,
  ): Promise<void> {
    if (!response || response.trim().length < 10) {
      throw new Error("Seller response must be at least 10 characters.");
    }

    const db = getDb();
    const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Review not found.");
    }

    const data = docSnap.data();
    if (data.sellerRespondedBy !== sellerId) {
      throw new Error("You can only edit your own response.");
    }

    // Check 24-hour edit window
    const responseDate = new Date(data.sellerResponseDate);
    const hoursElapsed = (Date.now() - responseDate.getTime()) / (1000 * 60 * 60);
    if (hoursElapsed > 24) {
      throw new Error("Response can only be edited within 24 hours of posting.");
    }

    await updateDoc(docRef, {
      sellerResponse: response.trim(),
      updatedAt: new Date().toISOString(),
    });

    console.log("[Reviews] Seller response updated on review:", reviewId);
  },

  /**
   * Delete a seller response.
   */
  async deleteSellerResponse(
    reviewId: string,
    sellerId: string,
  ): Promise<void> {
    const db = getDb();
    const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Review not found.");
    }

    const data = docSnap.data();
    if (data.sellerRespondedBy !== sellerId) {
      throw new Error("You can only delete your own response.");
    }

    await updateDoc(docRef, {
      sellerResponse: null,
      sellerResponseDate: null,
      sellerRespondedBy: null,
      updatedAt: new Date().toISOString(),
    });

    console.log("[Reviews] Seller response deleted on review:", reviewId);
  },

  /**
   * Subscribe to ALL reviews in real-time (admin dashboard).
   * Unlike subscribeToReviews, this does not filter by status or target.
   */
  subscribeToAllReviews(
    callback: (reviews: FirestoreReview[], stats: ModerationStats) => void,
  ): Unsubscribe {
    const db = getDb();
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      orderBy("createdAt", "desc"),
    );

    return onSnapshot(q, (snapshot) => {
      const reviews = snapshot.docs.map((d) =>
        transformDoc(d as unknown as { id: string; data: () => Record<string, unknown> }),
      );
      const stats = calculateModerationStats(reviews);
      callback(reviews, stats);
    });
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

export { calculateRatingStats, calculateModerationStats };
export type { RatingStats as FirebaseRatingStats };
