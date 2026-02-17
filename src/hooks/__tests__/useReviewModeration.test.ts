/**
 * Tests for useReviewModeration Hook
 *
 * Tests admin moderation hook functionality including filtering,
 * pagination, moderations actions, and admin responses.
 */

import { renderHook, act } from "@testing-library/react";
import { useReviewModeration } from "../useReviewModeration";
import { FirebaseReviewService } from "@/lib/firebase/reviews";

// Mock the firebase reviews service
jest.mock("@/lib/firebase/reviews", () => ({
  FirebaseReviewService: {
    subscribeToAllReviews: jest.fn(() => jest.fn()),
    getAllReviews: jest.fn().mockResolvedValue({ reviews: [], stats: null }),
    moderateReview: jest.fn().mockResolvedValue(undefined),
    addAdminResponse: jest.fn().mockResolvedValue(undefined),
    deleteReviewAsAdmin: jest.fn().mockResolvedValue(undefined),
    clearFlags: jest.fn().mockResolvedValue(undefined),
  },
  calculateModerationStats: jest.fn(),
}));

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("useReviewModeration", () => {
  const mockUser = {
    id: "admin-1",
    email: "admin@test.com",
    displayName: "Admin User",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Set up auth mock
    global.__mockAuthContext = {
      ...global.__mockAuthContext,
      user: mockUser,
      isAuthenticated: true,
    };
    global.__mockUseAuth.mockReturnValue(global.__mockAuthContext);
  });

  it("should initialize with loading state", () => {
    const { result } = renderHook(() => useReviewModeration());

    expect(result.current.loading).toBe(true);
    expect(result.current.reviews).toEqual([]);
    expect(result.current.page).toBe(0);
  });

  it("should subscribe to all reviews on mount", () => {
    renderHook(() => useReviewModeration());

    expect(FirebaseReviewService.subscribeToAllReviews).toHaveBeenCalledWith(
      expect.any(Function),
    );
  });

  it("should call unsubscribe on unmount", () => {
    const mockUnsubscribe = jest.fn();
    (FirebaseReviewService.subscribeToAllReviews as jest.Mock).mockReturnValue(mockUnsubscribe);

    const { unmount } = renderHook(() => useReviewModeration());
    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it("should provide default empty stats", () => {
    const { result } = renderHook(() => useReviewModeration());

    expect(result.current.stats).toBeNull();
  });

  it("should provide filter management", () => {
    const { result } = renderHook(() => useReviewModeration());

    expect(result.current.filters).toEqual({});

    act(() => {
      result.current.setFilters({ status: "pending" });
    });

    expect(result.current.filters).toEqual({ status: "pending" });
  });

  it("should reset page on filter change", () => {
    const { result } = renderHook(() => useReviewModeration());

    act(() => {
      result.current.setPage(2);
    });
    expect(result.current.page).toBe(2);

    act(() => {
      result.current.setFilters({ status: "approved" });
    });
    expect(result.current.page).toBe(0);
  });

  it("should call moderateReview on the service", async () => {
    const { result } = renderHook(() => useReviewModeration());

    await act(async () => {
      await result.current.moderateReview("review-1", "approve");
    });

    expect(FirebaseReviewService.moderateReview).toHaveBeenCalledWith(
      "review-1",
      "admin-1",
      "approve",
      undefined,
    );
  });

  it("should call moderateReview with reason for reject", async () => {
    const { result } = renderHook(() => useReviewModeration());

    await act(async () => {
      await result.current.moderateReview("review-1", "reject", "Spam content");
    });

    expect(FirebaseReviewService.moderateReview).toHaveBeenCalledWith(
      "review-1",
      "admin-1",
      "reject",
      "Spam content",
    );
  });

  it("should call addAdminResponse on the service", async () => {
    const { result } = renderHook(() => useReviewModeration());

    await act(async () => {
      await result.current.addAdminResponse("review-1", "Thank you for your feedback!");
    });

    expect(FirebaseReviewService.addAdminResponse).toHaveBeenCalledWith(
      "review-1",
      "admin-1",
      "Thank you for your feedback!",
    );
  });

  it("should call deleteReviewAsAdmin on the service", async () => {
    const { result } = renderHook(() => useReviewModeration());

    await act(async () => {
      await result.current.deleteReviewAsAdmin("review-1", "Violates policy");
    });

    expect(FirebaseReviewService.deleteReviewAsAdmin).toHaveBeenCalledWith(
      "review-1",
      "admin-1",
      "Violates policy",
    );
  });

  it("should call clearFlags on the service", async () => {
    const { result } = renderHook(() => useReviewModeration());

    await act(async () => {
      await result.current.clearFlags("review-1");
    });

    expect(FirebaseReviewService.clearFlags).toHaveBeenCalledWith(
      "review-1",
      "admin-1",
    );
  });

  it("should calculate totalPages based on reviews and pageSize", () => {
    const { result } = renderHook(() => useReviewModeration(5));

    // With 0 reviews, 1 page minimum
    expect(result.current.totalPages).toBe(1);
  });

  it("should provide pagination controls", () => {
    const { result } = renderHook(() => useReviewModeration());

    expect(result.current.page).toBe(0);
    expect(result.current.pageSize).toBe(20);

    act(() => {
      result.current.setPage(1);
    });

    expect(result.current.page).toBe(1);
  });

  it("should not moderate without user", async () => {
    global.__mockAuthContext = {
      ...global.__mockAuthContext,
      user: null,
      isAuthenticated: false,
    };
    global.__mockUseAuth.mockReturnValue(global.__mockAuthContext);

    const { toast } = require("sonner");
    const { result } = renderHook(() => useReviewModeration());

    await act(async () => {
      await result.current.moderateReview("review-1", "approve");
    });

    expect(FirebaseReviewService.moderateReview).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith("Please sign in as admin to moderate reviews.");
  });
});
