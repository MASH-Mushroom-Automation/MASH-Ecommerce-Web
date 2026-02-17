/**
 * useFirebaseReviews Hook Unit Tests
 *
 * Tests the custom React hook that manages Firebase review operations:
 * - Subscription setup and cleanup
 * - Submit review (auth gating, success, error)
 * - Update review
 * - Delete review
 * - Helpful voting
 * - Flag review
 * - User review detection (hasUserReviewed, userReview)
 * - Refetch
 */

import { renderHook, act } from "@testing-library/react";
import { useFirebaseReviews } from "@/hooks/useFirebaseReviews";
import { FirebaseReviewService } from "@/lib/firebase/reviews";
import { toast } from "sonner";
import type { FirestoreReview, RatingStats } from "@/types/reviews";

// Mock AuthContext
const mockUseAuth = global.__mockUseAuth as jest.Mock;

// Mock FirebaseReviewService
jest.mock("@/lib/firebase/reviews", () => ({
  FirebaseReviewService: {
    subscribeToReviews: jest.fn(),
    createReview: jest.fn(),
    updateReview: jest.fn(),
    deleteReview: jest.fn(),
    toggleHelpfulVote: jest.fn(),
    flagReview: jest.fn(),
    getReviews: jest.fn(),
  },
}));

// Mock toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fetch for verify-purchase API
// global.fetch already polyfilled by jest.setupMocks.js

const mockService = FirebaseReviewService as jest.Mocked<typeof FirebaseReviewService>;

function makeReview(overrides: Partial<FirestoreReview> = {}): FirestoreReview {
  return {
    id: "review-1",
    targetType: "product",
    targetId: "product-abc",
    targetName: "Test Kit",
    userId: "user-456",
    userName: "Jane Doe",
    userEmail: "jane@example.com",
    rating: 4,
    title: "Great product",
    content: "Really liked it, would buy again.",
    images: [],
    verifiedPurchase: false,
    status: "approved",
    helpfulCount: 0,
    helpfulVotes: [],
    flagCount: 0,
    flaggedBy: [],
    flagReasons: [],
    createdAt: "2026-02-10T10:00:00.000Z",
    updatedAt: "2026-02-10T10:00:00.000Z",
    ...overrides,
  };
}

function makeStats(): RatingStats {
  return {
    averageRating: 4.0,
    totalReviews: 1,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 0 },
    verifiedPurchaseCount: 0,
    recommendationPercentage: 100,
  };
}

describe("useFirebaseReviews", () => {
  let unsubscribeMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    unsubscribeMock = jest.fn();

    // Re-setup fetch mock for verify-purchase API (clearAllMocks resets it)
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ verified: false }),
    });

    // Default: auth user present
    mockUseAuth.mockReturnValue({
      user: {
        id: "user-123",
        displayName: "Test User",
        email: "test@example.com",
        photoURL: "https://example.com/photo.jpg",
      },
      isAuthenticated: true,
      loading: false,
    });

    // Default: subscribeToReviews immediately calls callback with empty reviews
    mockService.subscribeToReviews.mockImplementation(
      (_targetType, _targetId, callback) => {
        callback([], {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          verifiedPurchaseCount: 0,
          recommendationPercentage: 0,
        });
        return unsubscribeMock;
      },
    );
  });

  // ===== Subscription =====

  describe("subscription", () => {
    it("subscribes to reviews on mount", () => {
      renderHook(() => useFirebaseReviews("product", "product-abc"));
      expect(mockService.subscribeToReviews).toHaveBeenCalledWith(
        "product",
        "product-abc",
        expect.any(Function),
      );
    });

    it("unsubscribes on unmount", () => {
      const { unmount } = renderHook(() =>
        useFirebaseReviews("product", "product-abc"),
      );
      unmount();
      expect(unsubscribeMock).toHaveBeenCalled();
    });

    it("sets loading to false after subscription callback", () => {
      const { result } = renderHook(() =>
        useFirebaseReviews("product", "product-abc"),
      );
      expect(result.current.loading).toBe(false);
    });

    it("does not subscribe when targetId is empty", () => {
      renderHook(() => useFirebaseReviews("product", ""));
      expect(mockService.subscribeToReviews).not.toHaveBeenCalled();
    });

    it("populates reviews from subscription callback", () => {
      const reviews = [makeReview()];
      const stats = makeStats();
      mockService.subscribeToReviews.mockImplementation(
        (_targetType, _targetId, callback) => {
          callback(reviews, stats);
          return unsubscribeMock;
        },
      );

      const { result } = renderHook(() =>
        useFirebaseReviews("product", "product-abc"),
      );
      expect(result.current.reviews).toEqual(reviews);
      expect(result.current.stats).toEqual(stats);
    });
  });

  // ===== User Review Detection =====

  describe("user review detection", () => {
    it("returns hasUserReviewed=false when no matching review", () => {
      const { result } = renderHook(() =>
        useFirebaseReviews("product", "product-abc"),
      );
      expect(result.current.hasUserReviewed).toBe(false);
      expect(result.current.userReview).toBeNull();
    });

    it("returns hasUserReviewed=true when user has review", () => {
      const userReview = makeReview({ userId: "user-123" });
      mockService.subscribeToReviews.mockImplementation(
        (_targetType, _targetId, callback) => {
          callback([userReview], makeStats());
          return unsubscribeMock;
        },
      );

      const { result } = renderHook(() =>
        useFirebaseReviews("product", "product-abc"),
      );
      expect(result.current.hasUserReviewed).toBe(true);
      expect(result.current.userReview).toEqual(userReview);
    });

    it("returns null userReview when not authenticated", () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
      const { result } = renderHook(() =>
        useFirebaseReviews("product", "product-abc"),
      );
      expect(result.current.userReview).toBeNull();
    });
  });

  // ===== Submit Review =====

  describe("submitReview", () => {
    it("calls createReview with correct parameters", async () => {
      mockService.createReview.mockResolvedValue("new-review-id");
      const { result } = renderHook(() =>
        useFirebaseReviews("product", "product-abc"),
      );

      await act(async () => {
        await result.current.submitReview({
          targetType: "product",
          targetId: "product-abc",
          targetName: "Test Kit",
          rating: 5,
          title: "Excellent",
          content: "Really great product, highly recommend!",
        });
      });

      expect(mockService.createReview).toHaveBeenCalledWith(
        "user-123",
        "Test User",
        "test@example.com",
        "https://example.com/photo.jpg",
        {
          targetType: "product",
          targetId: "product-abc",
          targetName: "Test Kit",
          rating: 5,
          title: "Excellent",
          content: "Really great product, highly recommend!",
          verifiedPurchase: false,
        },
      );
      expect(toast.success).toHaveBeenCalledWith("Review submitted successfully!");
    });

    it("shows error toast on authentication failure", async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        loading: false,
      });

      const { result } = renderHook(() =>
        useFirebaseReviews("product", "product-abc"),
      );

      await expect(
        act(async () => {
          await result.current.submitReview({
            targetType: "product",
            targetId: "product-abc",
            targetName: "Test Kit",
            rating: 5,
            title: "Excellent",
            content: "Really great product!",
          });
        }),
      ).rejects.toThrow("Authentication required");

      expect(toast.error).toHaveBeenCalledWith("Please sign in to submit a review.");
    });

    it("shows error toast when service throws", async () => {
      mockService.createReview.mockRejectedValue(new Error("Duplicate review"));
      const { result } = renderHook(() =>
        useFirebaseReviews("product", "product-abc"),
      );

      let thrownError: Error | null = null;
      await act(async () => {
        try {
          await result.current.submitReview({
            targetType: "product",
            targetId: "product-abc",
            targetName: "Test Kit",
            rating: 5,
            title: "Excellent",
            content: "Really great product!",
          });
        } catch (e) {
          thrownError = e as Error;
        }
      });

      expect(thrownError?.message).toBe("Duplicate review");
      expect(toast.error).toHaveBeenCalledWith("Duplicate review");
    });
  });

  // ===== Update Review =====

  describe("updateReview", () => {
    it("calls service updateReview with correct parameters", async () => {
      mockService.updateReview.mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useFirebaseReviews("product", "product-abc"),
      );

      await act(async () => {
        await result.current.updateReview("review-1", {
          rating: 5,
          title: "Updated Title",
          content: "Updated content that is long enough.",
        });
      });

      expect(mockService.updateReview).toHaveBeenCalledWith(
        "review-1",
        "user-123",
        { rating: 5, title: "Updated Title", content: "Updated content that is long enough." },
      );
      expect(toast.success).toHaveBeenCalledWith("Review updated successfully!");
    });

    it("requires authentication", async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
      const { result } = renderHook(() =>
        useFirebaseReviews("product", "product-abc"),
      );

      await expect(
        act(async () => {
          await result.current.updateReview("review-1", {
            rating: 5,
            title: "Updated",
            content: "Updated content",
          });
        }),
      ).rejects.toThrow("Authentication required");
    });
  });

  // ===== Delete Review =====

  describe("deleteReview", () => {
    it("calls service deleteReview", async () => {
      mockService.deleteReview.mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useFirebaseReviews("product", "product-abc"),
      );

      await act(async () => {
        await result.current.deleteReview("review-1");
      });

      expect(mockService.deleteReview).toHaveBeenCalledWith("review-1", "user-123");
      expect(toast.success).toHaveBeenCalledWith("Review deleted.");
    });

    it("requires authentication", async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
      const { result } = renderHook(() =>
        useFirebaseReviews("product", "product-abc"),
      );

      await expect(
        act(async () => {
          await result.current.deleteReview("review-1");
        }),
      ).rejects.toThrow("Authentication required");
    });
  });

  // ===== Helpful Vote =====

  describe("voteHelpful", () => {
    it("calls toggleHelpfulVote", async () => {
      mockService.toggleHelpfulVote.mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useFirebaseReviews("product", "product-abc"),
      );

      await act(async () => {
        await result.current.voteHelpful("review-1");
      });

      expect(mockService.toggleHelpfulVote).toHaveBeenCalledWith("review-1", "user-123");
    });

    it("shows error toast when not authenticated", async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
      const { result } = renderHook(() =>
        useFirebaseReviews("product", "product-abc"),
      );

      await act(async () => {
        await result.current.voteHelpful("review-1");
      });

      expect(toast.error).toHaveBeenCalledWith("Please sign in to vote.");
      expect(mockService.toggleHelpfulVote).not.toHaveBeenCalled();
    });
  });

  // ===== Flag Review =====

  describe("flagReview", () => {
    it("calls service flagReview with input", async () => {
      mockService.flagReview.mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useFirebaseReviews("product", "product-abc"),
      );

      await act(async () => {
        await result.current.flagReview("review-1", {
          reason: "spam",
          details: "This is spam content",
        });
      });

      expect(mockService.flagReview).toHaveBeenCalledWith("review-1", "user-123", {
        reason: "spam",
        details: "This is spam content",
      });
      expect(toast.success).toHaveBeenCalledWith("Review has been flagged for moderation.");
    });

    it("requires authentication", async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
      const { result } = renderHook(() =>
        useFirebaseReviews("product", "product-abc"),
      );

      await act(async () => {
        await result.current.flagReview("review-1", { reason: "fake" });
      });

      expect(toast.error).toHaveBeenCalledWith("Please sign in to flag a review.");
      expect(mockService.flagReview).not.toHaveBeenCalled();
    });

    it("shows error toast on service failure", async () => {
      mockService.flagReview.mockRejectedValue(new Error("Already flagged"));
      const { result } = renderHook(() =>
        useFirebaseReviews("product", "product-abc"),
      );

      await act(async () => {
        await result.current.flagReview("review-1", { reason: "spam" });
      });

      expect(toast.error).toHaveBeenCalledWith("Already flagged");
    });
  });

  // ===== Refetch =====

  describe("refetch", () => {
    it("calls getReviews and updates state", async () => {
      const reviews = [makeReview()];
      const stats = makeStats();
      mockService.getReviews.mockResolvedValue({ reviews, stats });

      const { result } = renderHook(() =>
        useFirebaseReviews("product", "product-abc"),
      );

      await act(async () => {
        result.current.refetch();
      });

      expect(mockService.getReviews).toHaveBeenCalledWith("product", "product-abc");
    });

    it("does nothing when targetId is empty", () => {
      const { result } = renderHook(() => useFirebaseReviews("product", ""));
      result.current.refetch();
      expect(mockService.getReviews).not.toHaveBeenCalled();
    });
  });
});
