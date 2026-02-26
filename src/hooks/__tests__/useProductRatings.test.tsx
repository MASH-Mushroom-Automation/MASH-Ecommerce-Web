/**
 * useProductRatings Hook Tests - COVERAGE-018
 *
 * Tests for batch product rating stats hook with caching.
 *
 * Hook source: src/hooks/useProductRatings.ts
 * Data source: FirebaseReviewService.getReviews("product", id)
 *
 * Mock strategy:
 *   - FirebaseReviewService: jest.mock + jest.requireMock
 *   - Hook caches via fetchedRef (useRef<Set>)
 *   - Effect dependency: productIds.join(",")
 */

import { renderHook, act, waitFor } from "@testing-library/react";

jest.mock("@/lib/firebase/reviews", () => ({
  FirebaseReviewService: {
    getReviews: jest.fn(),
  },
}));

const { FirebaseReviewService } = jest.requireMock(
  "@/lib/firebase/reviews"
) as {
  FirebaseReviewService: { getReviews: jest.Mock };
};

import { useProductRatings } from "../useProductRatings";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const defaultStats = {
  averageRating: 0,
  totalReviews: 0,
  ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  verifiedPurchaseCount: 0,
  recommendationPercentage: 0,
};

function makeStats(avg: number, total: number) {
  return {
    averageRating: avg,
    totalReviews: total,
    ratingDistribution: { 5: total, 4: 0, 3: 0, 2: 0, 1: 0 },
    verifiedPurchaseCount: 0,
    recommendationPercentage: 100,
  };
}

// ============================================================================
// Tests
// ============================================================================

describe("useProductRatings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return empty ratings and loading=false for empty IDs", () => {
    const { result } = renderHook(() => useProductRatings([]));
    expect(result.current.ratings).toEqual({});
    expect(result.current.loading).toBe(false);
  });

  it("should fetch ratings for all product IDs", async () => {
    const stats1 = makeStats(4.5, 10);
    const stats2 = makeStats(3.2, 5);

    FirebaseReviewService.getReviews
      .mockResolvedValueOnce({ stats: stats1 })
      .mockResolvedValueOnce({ stats: stats2 });

    const { result } = renderHook(() =>
      useProductRatings(["prod-1", "prod-2"])
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.ratings["prod-1"]).toEqual(stats1);
    expect(result.current.ratings["prod-2"]).toEqual(stats2);
    expect(FirebaseReviewService.getReviews).toHaveBeenCalledWith(
      "product",
      "prod-1"
    );
    expect(FirebaseReviewService.getReviews).toHaveBeenCalledWith(
      "product",
      "prod-2"
    );
  });

  it("should show loading=true while fetching", async () => {
    let resolveGetReviews!: (v: unknown) => void;
    FirebaseReviewService.getReviews.mockReturnValue(
      new Promise((r) => {
        resolveGetReviews = r;
      })
    );

    const { result } = renderHook(() => useProductRatings(["prod-1"]));

    // Should start loading
    await waitFor(() => expect(result.current.loading).toBe(true));

    // Resolve
    await act(async () => {
      resolveGetReviews({ stats: makeStats(4.0, 3) });
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.ratings["prod-1"]).toEqual(makeStats(4.0, 3));
  });

  it("should return default zero-stats when a fetch fails", async () => {
    FirebaseReviewService.getReviews
      .mockResolvedValueOnce({ stats: makeStats(5.0, 1) })
      .mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() =>
      useProductRatings(["good-prod", "bad-prod"])
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.ratings["good-prod"]).toEqual(makeStats(5.0, 1));
    expect(result.current.ratings["bad-prod"]).toEqual(defaultStats);
  });

  it("should not re-fetch already cached IDs on rerender", async () => {
    FirebaseReviewService.getReviews.mockResolvedValueOnce({
      stats: makeStats(4.0, 2),
    });

    const { result, rerender } = renderHook(
      (props: { ids: string[] }) => useProductRatings(props.ids),
      { initialProps: { ids: ["prod-1"] } }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(FirebaseReviewService.getReviews).toHaveBeenCalledTimes(1);

    // Rerender with same IDs - should NOT re-fetch
    rerender({ ids: ["prod-1"] });
    expect(FirebaseReviewService.getReviews).toHaveBeenCalledTimes(1);
  });

  it("should fetch only new IDs when IDs are added", async () => {
    const stats1 = makeStats(4.0, 2);
    const stats2 = makeStats(3.5, 8);

    FirebaseReviewService.getReviews.mockResolvedValueOnce({
      stats: stats1,
    });

    const { result, rerender } = renderHook(
      (props: { ids: string[] }) => useProductRatings(props.ids),
      { initialProps: { ids: ["prod-1"] } }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.ratings["prod-1"]).toEqual(stats1);

    // Add a new ID
    FirebaseReviewService.getReviews.mockResolvedValueOnce({
      stats: stats2,
    });

    rerender({ ids: ["prod-1", "prod-2"] });

    await waitFor(() =>
      expect(result.current.ratings["prod-2"]).toBeDefined()
    );

    // Only prod-2 should have been fetched (prod-1 was cached)
    expect(FirebaseReviewService.getReviews).toHaveBeenCalledTimes(2);
    expect(result.current.ratings["prod-1"]).toEqual(stats1);
    expect(result.current.ratings["prod-2"]).toEqual(stats2);
  });

  it("should handle all IDs failing gracefully", async () => {
    FirebaseReviewService.getReviews
      .mockRejectedValueOnce(new Error("fail1"))
      .mockRejectedValueOnce(new Error("fail2"));

    const { result } = renderHook(() =>
      useProductRatings(["bad-1", "bad-2"])
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.ratings["bad-1"]).toEqual(defaultStats);
    expect(result.current.ratings["bad-2"]).toEqual(defaultStats);
  });

  it("should work with a single product ID", async () => {
    const stats = makeStats(4.8, 20);
    FirebaseReviewService.getReviews.mockResolvedValueOnce({ stats });

    const { result } = renderHook(() => useProductRatings(["single-prod"]));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.ratings["single-prod"]).toEqual(stats);
    expect(FirebaseReviewService.getReviews).toHaveBeenCalledTimes(1);
  });
});
