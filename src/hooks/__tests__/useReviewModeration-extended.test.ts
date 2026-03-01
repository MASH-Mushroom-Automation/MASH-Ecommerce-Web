/**
 * Additional tests for useReviewModeration hook - branch/function coverage expansion
 * Covers: filtering (all types), pagination, moderation actions, admin response, delete, clearFlags, refetch, error paths
 */

import { renderHook, act } from "@testing-library/react";

// Use global auth mock (set up in jest.setupMocks.js)
const mockUser = { id: "admin-1", email: "admin@test.com", displayName: "Admin User" };

const mockModerateReview = jest.fn().mockResolvedValue(undefined);
const mockAddAdminResponse = jest.fn().mockResolvedValue(undefined);
const mockDeleteReview = jest.fn().mockResolvedValue(undefined);
const mockClearFlags = jest.fn().mockResolvedValue(undefined);
const mockGetAllReviews = jest.fn().mockResolvedValue({ reviews: [], stats: null });
const mockSubscribeToAll = jest.fn();

jest.mock("@/lib/firebase/reviews", () => ({
  FirebaseReviewService: {
    subscribeToAllReviews: (...args: any[]) => mockSubscribeToAll(...args),
    moderateReview: (...args: any[]) => mockModerateReview(...args),
    addAdminResponse: (...args: any[]) => mockAddAdminResponse(...args),
    deleteReviewAsAdmin: (...args: any[]) => mockDeleteReview(...args),
    clearFlags: (...args: any[]) => mockClearFlags(...args),
    getAllReviews: (...args: any[]) => mockGetAllReviews(...args),
  },
}));

jest.mock("@/lib/reviews/sync", () => ({
  syncReviewToSanity: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

(global as any).__ENABLE_REALTIME_IN_TESTS = true;

import { useReviewModeration } from "@/hooks/useReviewModeration";

const mockReviews = [
  { id: "r1", title: "Great", content: "Loved it", rating: 5, status: "approved", userName: "User1", targetName: "Product1", targetType: "product", createdAt: "2024-01-01", flagCount: 0 },
  { id: "r2", title: "Bad", content: "Terrible", rating: 1, status: "pending", userName: "User2", targetName: "Product2", targetType: "product", createdAt: "2024-06-01", flagCount: 3 },
  { id: "r3", title: "OK", content: "Mediocre", rating: 3, status: "approved", userName: "User3", targetName: "Store1", targetType: "store", createdAt: "2024-03-01", flagCount: 0 },
];
const mockStats = { total: 3, pending: 1, approved: 2, rejected: 0, flagged: 1, averageRating: 3, totalFlagged: 1 };

describe("useReviewModeration - extended coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up global auth mock with admin user
    (global as any).__mockAuthContext = {
      ...(global as any).__mockAuthContext,
      user: mockUser,
      isAuthenticated: true,
    };
    (global as any).__mockUseAuth.mockReturnValue((global as any).__mockAuthContext);
    mockSubscribeToAll.mockImplementation((cb: any) => { cb(mockReviews, mockStats); return jest.fn(); });
  });

  it("should filter by status", () => {
    const { result } = renderHook(() => useReviewModeration());
    act(() => { result.current.setFilters({ status: "pending" as any }); });
    expect(result.current.reviews).toHaveLength(1);
    expect(result.current.reviews[0].id).toBe("r2");
  });

  it("should filter by targetType", () => {
    const { result } = renderHook(() => useReviewModeration());
    act(() => { result.current.setFilters({ targetType: "store" as any }); });
    expect(result.current.reviews).toHaveLength(1);
  });

  it("should filter by ratingMin", () => {
    const { result } = renderHook(() => useReviewModeration());
    act(() => { result.current.setFilters({ ratingMin: 4 }); });
    expect(result.current.reviews).toHaveLength(1);
  });

  it("should filter by ratingMax", () => {
    const { result } = renderHook(() => useReviewModeration());
    act(() => { result.current.setFilters({ ratingMax: 2 }); });
    expect(result.current.reviews).toHaveLength(1);
  });

  it("should filter by dateFrom", () => {
    const { result } = renderHook(() => useReviewModeration());
    act(() => { result.current.setFilters({ dateFrom: "2024-02-01" }); });
    expect(result.current.reviews).toHaveLength(2);
  });

  it("should filter by dateTo", () => {
    const { result } = renderHook(() => useReviewModeration());
    act(() => { result.current.setFilters({ dateTo: "2024-02-01" }); });
    expect(result.current.reviews).toHaveLength(1);
  });

  it("should filter by keyword in content", () => {
    const { result } = renderHook(() => useReviewModeration());
    act(() => { result.current.setFilters({ keyword: "terrible" }); });
    expect(result.current.reviews).toHaveLength(1);
    expect(result.current.reviews[0].id).toBe("r2");
  });

  it("should filter by keyword in userName", () => {
    const { result } = renderHook(() => useReviewModeration());
    act(() => { result.current.setFilters({ keyword: "User3" }); });
    expect(result.current.reviews).toHaveLength(1);
  });

  it("should filter by keyword in targetName", () => {
    const { result } = renderHook(() => useReviewModeration());
    act(() => { result.current.setFilters({ keyword: "Store1" }); });
    expect(result.current.reviews).toHaveLength(1);
  });

  it("should filter flaggedOnly", () => {
    const { result } = renderHook(() => useReviewModeration());
    act(() => { result.current.setFilters({ flaggedOnly: true }); });
    expect(result.current.reviews).toHaveLength(1);
    expect(result.current.reviews[0].flagCount).toBe(3);
  });

  it("should paginate correctly", () => {
    const { result } = renderHook(() => useReviewModeration(2));
    expect(result.current.paginatedReviews).toHaveLength(2);
    expect(result.current.totalPages).toBe(2);
    act(() => { result.current.setPage(1); });
    expect(result.current.paginatedReviews).toHaveLength(1);
  });

  it("should reset page on filter change", () => {
    const { result } = renderHook(() => useReviewModeration(2));
    act(() => { result.current.setPage(1); });
    act(() => { result.current.setFilters({ status: "approved" as any }); });
    expect(result.current.page).toBe(0);
  });

  it("should moderate (approve) a review", async () => {
    const { result } = renderHook(() => useReviewModeration());
    await act(async () => { await result.current.moderateReview("r1", "approve"); });
    expect(mockModerateReview).toHaveBeenCalledWith("r1", "admin-1", "approve", undefined);
  });

  it("should moderate (reject) with reason", async () => {
    const { result } = renderHook(() => useReviewModeration());
    await act(async () => { await result.current.moderateReview("r2", "reject", "Spam"); });
    expect(mockModerateReview).toHaveBeenCalledWith("r2", "admin-1", "reject", "Spam");
  });

  it("should moderate (flag) a review", async () => {
    const { result } = renderHook(() => useReviewModeration());
    await act(async () => { await result.current.moderateReview("r1", "flag"); });
    expect(mockModerateReview).toHaveBeenCalledWith("r1", "admin-1", "flag", undefined);
  });

  it("should add admin response", async () => {
    const { result } = renderHook(() => useReviewModeration());
    await act(async () => { await result.current.addAdminResponse("r1", "Thanks!"); });
    expect(mockAddAdminResponse).toHaveBeenCalledWith("r1", "admin-1", "Thanks!");
  });

  it("should delete review as admin", async () => {
    const { result } = renderHook(() => useReviewModeration());
    await act(async () => { await result.current.deleteReviewAsAdmin("r2", "Violates policy"); });
    expect(mockDeleteReview).toHaveBeenCalledWith("r2", "admin-1", "Violates policy");
  });

  it("should clear flags on review", async () => {
    const { result } = renderHook(() => useReviewModeration());
    await act(async () => { await result.current.clearFlags("r2"); });
    expect(mockClearFlags).toHaveBeenCalledWith("r2", "admin-1");
  });

  it("should handle moderation error", async () => {
    mockModerateReview.mockRejectedValueOnce(new Error("Denied"));
    const { result } = renderHook(() => useReviewModeration());
    await act(async () => { await result.current.moderateReview("r1", "approve"); });
    const { toast } = require("sonner");
    expect(toast.error).toHaveBeenCalledWith("Denied");
  });

  it("should handle admin response error", async () => {
    mockAddAdminResponse.mockRejectedValueOnce(new Error("Nope"));
    const { result } = renderHook(() => useReviewModeration());
    await act(async () => { await result.current.addAdminResponse("r1", "Hi"); });
    const { toast } = require("sonner");
    expect(toast.error).toHaveBeenCalledWith("Nope");
  });

  it("should handle delete error", async () => {
    mockDeleteReview.mockRejectedValueOnce(new Error("Cannot delete"));
    const { result } = renderHook(() => useReviewModeration());
    await act(async () => { await result.current.deleteReviewAsAdmin("r1"); });
    const { toast } = require("sonner");
    expect(toast.error).toHaveBeenCalledWith("Cannot delete");
  });

  it("should handle clearFlags error", async () => {
    mockClearFlags.mockRejectedValueOnce(new Error("No permission"));
    const { result } = renderHook(() => useReviewModeration());
    await act(async () => { await result.current.clearFlags("r2"); });
    const { toast } = require("sonner");
    expect(toast.error).toHaveBeenCalledWith("No permission");
  });

  it("should refetch reviews", async () => {
    mockGetAllReviews.mockResolvedValue({ reviews: [mockReviews[0]], stats: mockStats });
    const { result } = renderHook(() => useReviewModeration());
    await act(async () => {
      result.current.refetch();
      await new Promise(r => setTimeout(r, 100));
    });
    expect(mockGetAllReviews).toHaveBeenCalled();
  });

  it("should handle refetch error", async () => {
    mockGetAllReviews.mockRejectedValueOnce(new Error("Fetch failed"));
    const { result } = renderHook(() => useReviewModeration());
    await act(async () => {
      result.current.refetch();
      await new Promise(r => setTimeout(r, 100));
    });
    expect(result.current.error).toBe("Fetch failed");
  });
});
