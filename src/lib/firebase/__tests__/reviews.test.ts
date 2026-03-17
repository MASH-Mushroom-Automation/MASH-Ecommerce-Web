/**
 * Firebase Review Service Unit Tests
 *
 * Tests all CRUD operations, voting, flagging, and rating calculations
 * for the FirebaseReviewService connected to Firestore.
 *
 * Mocks: firebase/firestore (global in jest.setupMocks.js)
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
} from "firebase/firestore";
import { FirebaseReviewService, calculateRatingStats } from "../reviews";
import type {
  FirestoreReview,
  CreateReviewInput,
  UpdateReviewInput,
  RatingStats,
} from "@/types/reviews";

// ============================================================
// Test Fixtures
// ============================================================

const mockUser = {
  id: "user-123",
  name: "Test User",
  email: "test@example.com",
  photoURL: "https://example.com/photo.jpg",
};

const mockCreateInput: CreateReviewInput = {
  targetType: "product",
  targetId: "product-abc",
  targetName: "Test Mushroom Kit",
  rating: 4,
  title: "Great product",
  content: "Really loved this mushroom kit, excellent quality!",
};

function makeReview(overrides: Partial<FirestoreReview> = {}): FirestoreReview {
  return {
    id: "review-1",
    targetType: "product",
    targetId: "product-abc",
    targetName: "Test Mushroom Kit",
    userId: "user-123",
    userName: "Test User",
    userEmail: "test@example.com",
    userPhotoURL: "https://example.com/photo.jpg",
    rating: 4,
    title: "Great product",
    content: "Really loved this mushroom kit!",
    images: [],
    verifiedPurchase: false,
    status: "approved",
    helpfulCount: 0,
    helpfulVotes: [],
    adminResponse: undefined,
    adminResponseDate: undefined,
    flagCount: 0,
    flaggedBy: [],
    flagReasons: [],
    createdAt: "2026-02-11T10:00:00.000Z",
    updatedAt: "2026-02-11T10:00:00.000Z",
    ...overrides,
  };
}

// ============================================================
// calculateRatingStats Tests
// ============================================================

describe("calculateRatingStats", () => {
  it("returns zero stats for empty array", () => {
    const stats = calculateRatingStats([]);
    expect(stats.averageRating).toBe(0);
    expect(stats.totalReviews).toBe(0);
    expect(stats.verifiedPurchaseCount).toBe(0);
    expect(stats.recommendationPercentage).toBe(0);
    expect(stats.ratingDistribution).toEqual({
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    });
  });

  it("returns zero stats when all reviews are pending", () => {
    const reviews: FirestoreReview[] = [
      makeReview({ status: "pending", rating: 5 }),
      makeReview({ status: "rejected", rating: 3 }),
    ];
    const stats = calculateRatingStats(reviews);
    expect(stats.totalReviews).toBe(0);
    expect(stats.averageRating).toBe(0);
  });

  it("calculates correct average for single review", () => {
    const reviews: FirestoreReview[] = [makeReview({ rating: 5 })];
    const stats = calculateRatingStats(reviews);
    expect(stats.averageRating).toBe(5);
    expect(stats.totalReviews).toBe(1);
  });

  it("calculates correct average for multiple reviews", () => {
    const reviews: FirestoreReview[] = [
      makeReview({ id: "r1", rating: 5 }),
      makeReview({ id: "r2", rating: 3 }),
      makeReview({ id: "r3", rating: 4 }),
      makeReview({ id: "r4", rating: 2 }),
      makeReview({ id: "r5", rating: 1 }),
    ];
    const stats = calculateRatingStats(reviews);
    // (5+3+4+2+1) / 5 = 3.0
    expect(stats.averageRating).toBe(3);
    expect(stats.totalReviews).toBe(5);
  });

  it("rounds average to 1 decimal place", () => {
    const reviews: FirestoreReview[] = [
      makeReview({ id: "r1", rating: 4 }),
      makeReview({ id: "r2", rating: 5 }),
      makeReview({ id: "r3", rating: 3 }),
    ];
    const stats = calculateRatingStats(reviews);
    // (4+5+3) / 3 = 4.0
    expect(stats.averageRating).toBe(4);
  });

  it("counts rating distribution correctly", () => {
    const reviews: FirestoreReview[] = [
      makeReview({ id: "r1", rating: 5 }),
      makeReview({ id: "r2", rating: 5 }),
      makeReview({ id: "r3", rating: 4 }),
      makeReview({ id: "r4", rating: 3 }),
      makeReview({ id: "r5", rating: 1 }),
    ];
    const stats = calculateRatingStats(reviews);
    expect(stats.ratingDistribution).toEqual({
      5: 2,
      4: 1,
      3: 1,
      2: 0,
      1: 1,
    });
  });

  it("counts verified purchases correctly", () => {
    const reviews: FirestoreReview[] = [
      makeReview({ id: "r1", verifiedPurchase: true }),
      makeReview({ id: "r2", verifiedPurchase: false }),
      makeReview({ id: "r3", verifiedPurchase: true }),
    ];
    const stats = calculateRatingStats(reviews);
    expect(stats.verifiedPurchaseCount).toBe(2);
  });

  it("calculates recommendation percentage correctly", () => {
    const reviews: FirestoreReview[] = [
      makeReview({ id: "r1", rating: 5 }),
      makeReview({ id: "r2", rating: 4 }),
      makeReview({ id: "r3", rating: 3 }),
      makeReview({ id: "r4", rating: 2 }),
    ];
    const stats = calculateRatingStats(reviews);
    // 4-5 star reviews: 2 out of 4 = 50%
    expect(stats.recommendationPercentage).toBe(50);
  });

  it("handles 100% recommendation", () => {
    const reviews: FirestoreReview[] = [
      makeReview({ id: "r1", rating: 5 }),
      makeReview({ id: "r2", rating: 4 }),
    ];
    const stats = calculateRatingStats(reviews);
    expect(stats.recommendationPercentage).toBe(100);
  });

  it("only counts approved reviews", () => {
    const reviews: FirestoreReview[] = [
      makeReview({ id: "r1", rating: 5, status: "approved" }),
      makeReview({ id: "r2", rating: 1, status: "pending" }),
      makeReview({ id: "r3", rating: 1, status: "rejected" }),
      makeReview({ id: "r4", rating: 1, status: "flagged" }),
    ];
    const stats = calculateRatingStats(reviews);
    expect(stats.totalReviews).toBe(1);
    expect(stats.averageRating).toBe(5);
  });
});

// ============================================================
// FirebaseReviewService.createReview Tests
// ============================================================

describe("FirebaseReviewService.createReview", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: no existing review (empty result)
    (getDocs as jest.Mock).mockResolvedValue({ docs: [], empty: true });
    (addDoc as jest.Mock).mockResolvedValue({ id: "new-review-id" });
  });

  it("creates a review with correct data", async () => {
    const result = await FirebaseReviewService.createReview(
      mockUser.id,
      mockUser.name,
      mockUser.email,
      mockUser.photoURL,
      mockCreateInput,
    );

    expect(addDoc).toHaveBeenCalledTimes(1);
    expect(result.id).toBe("new-review-id");
    expect(result.targetType).toBe("product");
    expect(result.targetId).toBe("product-abc");
    expect(result.rating).toBe(4);
    expect(result.title).toBe("Great product");
    expect(result.status).toBe("approved");
    expect(result.helpfulCount).toBe(0);
    expect(result.helpfulVotes).toEqual([]);
    expect(result.flagCount).toBe(0);
    expect(result.flaggedBy).toEqual([]);
  });

  it("trims title and content whitespace", async () => {
    const input: CreateReviewInput = {
      ...mockCreateInput,
      title: "  Nice product  ",
      content: "  Some nice review text here  ",
    };

    const result = await FirebaseReviewService.createReview(
      mockUser.id,
      mockUser.name,
      mockUser.email,
      undefined,
      input,
    );

    expect(result.title).toBe("Nice product");
    expect(result.content).toBe("Some nice review text here");
    expect(result.userPhotoURL).toBeNull();
  });

  it("throws error if user already reviewed this entity", async () => {
    (getDocs as jest.Mock).mockResolvedValue({
      docs: [{ id: "existing-review" }],
      empty: false,
    });

    await expect(
      FirebaseReviewService.createReview(
        mockUser.id,
        mockUser.name,
        mockUser.email,
        mockUser.photoURL,
        mockCreateInput,
      ),
    ).rejects.toThrow("You have already reviewed this item");
  });

  it("validates rating must be integer between 1 and 5", async () => {
    // Rating too low
    await expect(
      FirebaseReviewService.createReview(
        mockUser.id,
        mockUser.name,
        mockUser.email,
        undefined,
        { ...mockCreateInput, rating: 0 },
      ),
    ).rejects.toThrow("Rating must be an integer between 1 and 5");

    // Rating too high
    await expect(
      FirebaseReviewService.createReview(
        mockUser.id,
        mockUser.name,
        mockUser.email,
        undefined,
        { ...mockCreateInput, rating: 6 },
      ),
    ).rejects.toThrow("Rating must be an integer between 1 and 5");

    // Non-integer rating
    await expect(
      FirebaseReviewService.createReview(
        mockUser.id,
        mockUser.name,
        mockUser.email,
        undefined,
        { ...mockCreateInput, rating: 3.5 },
      ),
    ).rejects.toThrow("Rating must be an integer between 1 and 5");
  });

  it("supports grower review target type", async () => {
    const growerInput: CreateReviewInput = {
      targetType: "grower",
      targetId: "grower-xyz",
      targetName: "Farm ABC",
      rating: 5,
      title: "Great farm",
      content: "Wonderful experience visiting this farm",
    };

    const result = await FirebaseReviewService.createReview(
      mockUser.id,
      mockUser.name,
      mockUser.email,
      undefined,
      growerInput,
    );

    expect(result.targetType).toBe("grower");
    expect(result.targetId).toBe("grower-xyz");
    expect(result.targetName).toBe("Farm ABC");
  });

  it("includes images when provided", async () => {
    const input: CreateReviewInput = {
      ...mockCreateInput,
      images: ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
    };

    const result = await FirebaseReviewService.createReview(
      mockUser.id,
      mockUser.name,
      mockUser.email,
      undefined,
      input,
    );

    expect(result.images).toEqual([
      "https://example.com/img1.jpg",
      "https://example.com/img2.jpg",
    ]);
  });

  it("defaults images to empty array when none provided", async () => {
    const result = await FirebaseReviewService.createReview(
      mockUser.id,
      mockUser.name,
      mockUser.email,
      undefined,
      mockCreateInput,
    );
    expect(result.images).toEqual([]);
  });
});

// ============================================================
// FirebaseReviewService.getReviews Tests
// ============================================================

describe("FirebaseReviewService.getReviews", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns empty reviews and zero stats when no docs", async () => {
    (getDocs as jest.Mock).mockResolvedValue({ docs: [] });

    const { reviews, stats } = await FirebaseReviewService.getReviews(
      "product",
      "product-abc",
    );

    expect(reviews).toEqual([]);
    expect(stats.totalReviews).toBe(0);
    expect(stats.averageRating).toBe(0);
    expect(query).toHaveBeenCalled();
    expect(where).toHaveBeenCalled();
  });

  it("applies correct query filters", async () => {
    (getDocs as jest.Mock).mockResolvedValue({ docs: [] });

    await FirebaseReviewService.getReviews("grower", "grower-xyz");

    expect(where).toHaveBeenCalledWith("targetType", "==", "grower");
    expect(where).toHaveBeenCalledWith("targetId", "==", "grower-xyz");
    expect(where).toHaveBeenCalledWith("status", "==", "approved");
    expect(orderBy).toHaveBeenCalledWith("createdAt", "desc");
  });
});

// ============================================================
// FirebaseReviewService.getUserReview Tests
// ============================================================

describe("FirebaseReviewService.getUserReview", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns null when user has no review", async () => {
    (getDocs as jest.Mock).mockResolvedValue({ docs: [], empty: true });

    const result = await FirebaseReviewService.getUserReview(
      "user-123",
      "product",
      "product-abc",
    );

    expect(result).toBeNull();
    expect(where).toHaveBeenCalledWith("userId", "==", "user-123");
    expect(limit).toHaveBeenCalledWith(1);
  });
});

// ============================================================
// FirebaseReviewService.updateReview Tests
// ============================================================

describe("FirebaseReviewService.updateReview", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws error when review not found", async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => false,
      data: () => null,
    });

    await expect(
      FirebaseReviewService.updateReview("review-1", "user-123", {
        rating: 5,
      }),
    ).rejects.toThrow("Review not found");
  });

  it("throws error when user is not the owner", async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ userId: "different-user" }),
    });

    await expect(
      FirebaseReviewService.updateReview("review-1", "user-123", {
        rating: 5,
      }),
    ).rejects.toThrow("You can only edit your own reviews");
  });

  it("validates rating on update", async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ userId: "user-123" }),
    });

    await expect(
      FirebaseReviewService.updateReview("review-1", "user-123", {
        rating: 0,
      }),
    ).rejects.toThrow("Rating must be an integer between 1 and 5");

    await expect(
      FirebaseReviewService.updateReview("review-1", "user-123", {
        rating: 6,
      }),
    ).rejects.toThrow("Rating must be an integer between 1 and 5");
  });

  it("updates review with valid data", async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ userId: "user-123" }),
    });

    await FirebaseReviewService.updateReview("review-1", "user-123", {
      rating: 5,
      title: "Updated title",
      content: "Updated content here",
    });

    expect(updateDoc).toHaveBeenCalledTimes(1);
  });
});

// ============================================================
// FirebaseReviewService.deleteReview Tests
// ============================================================

describe("FirebaseReviewService.deleteReview", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws error when review not found", async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => false,
      data: () => null,
    });

    await expect(
      FirebaseReviewService.deleteReview("review-1", "user-123"),
    ).rejects.toThrow("Review not found");
  });

  it("throws error when user is not the owner", async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ userId: "different-user" }),
    });

    await expect(
      FirebaseReviewService.deleteReview("review-1", "user-123"),
    ).rejects.toThrow("You can only delete your own reviews");
  });

  it("deletes review when user is owner", async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ userId: "user-123" }),
    });

    await FirebaseReviewService.deleteReview("review-1", "user-123");
    expect(deleteDoc).toHaveBeenCalledTimes(1);
  });
});

// ============================================================
// FirebaseReviewService.toggleHelpfulVote Tests
// ============================================================

describe("FirebaseReviewService.toggleHelpfulVote", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws error when review not found", async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => false,
      data: () => null,
    });

    await expect(
      FirebaseReviewService.toggleHelpfulVote("review-1", "user-123"),
    ).rejects.toThrow("Review not found");
  });

  it("adds helpful vote when user has not voted", async () => {
    const mockDocRef = { id: "review-1", path: "reviews/review-1" };
    (doc as jest.Mock).mockReturnValue(mockDocRef);
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ helpfulVotes: [] }),
    });

    await FirebaseReviewService.toggleHelpfulVote("review-1", "user-123");

    expect(updateDoc).toHaveBeenCalledWith(mockDocRef, {
      helpfulVotes: arrayUnion("user-123"),
      helpfulCount: increment(1),
    });
  });

  it("removes helpful vote when user already voted", async () => {
    const mockDocRef = { id: "review-1", path: "reviews/review-1" };
    (doc as jest.Mock).mockReturnValue(mockDocRef);
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ helpfulVotes: ["user-123"] }),
    });

    await FirebaseReviewService.toggleHelpfulVote("review-1", "user-123");

    expect(updateDoc).toHaveBeenCalledWith(mockDocRef, {
      helpfulVotes: arrayRemove("user-123"),
      helpfulCount: increment(-1),
    });
  });
});

// ============================================================
// FirebaseReviewService.flagReview Tests
// ============================================================

describe("FirebaseReviewService.flagReview", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws error when review not found", async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => false,
      data: () => null,
    });

    await expect(
      FirebaseReviewService.flagReview("review-1", "user-123", {
        reason: "spam",
      }),
    ).rejects.toThrow("Review not found");
  });

  it("throws error when user already flagged", async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ userId: "other-user", flaggedBy: ["user-123"] }),
    });

    await expect(
      FirebaseReviewService.flagReview("review-1", "user-123", {
        reason: "spam",
      }),
    ).rejects.toThrow("You have already flagged this review");
  });

  it("throws error when flagging own review", async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ userId: "user-123", flaggedBy: [] }),
    });

    await expect(
      FirebaseReviewService.flagReview("review-1", "user-123", {
        reason: "spam",
      }),
    ).rejects.toThrow("You cannot flag your own review");
  });

  it("flags review successfully", async () => {
    const mockDocRef = { id: "review-1", path: "reviews/review-1" };
    (doc as jest.Mock).mockReturnValue(mockDocRef);
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ userId: "other-user", flaggedBy: [] }),
    });

    await FirebaseReviewService.flagReview("review-1", "user-123", {
      reason: "spam",
      details: "Looks like spam content",
    });

    expect(updateDoc).toHaveBeenCalledWith(mockDocRef, {
      flaggedBy: arrayUnion("user-123"),
      flagReasons: arrayUnion("spam: Looks like spam content"),
      flagCount: increment(1),
      updatedAt: expect.any(String),
    });
  });

  it("flags review without details", async () => {
    const mockDocRef = { id: "review-1", path: "reviews/review-1" };
    (doc as jest.Mock).mockReturnValue(mockDocRef);
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ userId: "other-user", flaggedBy: [] }),
    });

    await FirebaseReviewService.flagReview("review-1", "user-123", {
      reason: "inappropriate",
    });

    expect(updateDoc).toHaveBeenCalledWith(mockDocRef, {
      flaggedBy: arrayUnion("user-123"),
      flagReasons: arrayUnion("inappropriate"),
      flagCount: increment(1),
      updatedAt: expect.any(String),
    });
  });
});

// ============================================================
// FirebaseReviewService.subscribeToReviews Tests
// ============================================================

describe("FirebaseReviewService.subscribeToReviews", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sets up onSnapshot listener and returns unsubscribe function", () => {
    const mockUnsubscribe = jest.fn();
    (onSnapshot as jest.Mock).mockReturnValue(mockUnsubscribe);

    const callback = jest.fn();
    const unsubscribe = FirebaseReviewService.subscribeToReviews(
      "product",
      "product-abc",
      callback,
    );

    expect(onSnapshot).toHaveBeenCalledTimes(1);
    expect(typeof unsubscribe).toBe("function");
  });

  it("creates query with correct filters", () => {
    const mockUnsubscribe = jest.fn();
    (onSnapshot as jest.Mock).mockReturnValue(mockUnsubscribe);

    FirebaseReviewService.subscribeToReviews("grower", "grower-xyz", jest.fn());

    expect(where).toHaveBeenCalledWith("targetType", "==", "grower");
    expect(where).toHaveBeenCalledWith("targetId", "==", "grower-xyz");
    expect(where).toHaveBeenCalledWith("status", "==", "approved");
  });
});
