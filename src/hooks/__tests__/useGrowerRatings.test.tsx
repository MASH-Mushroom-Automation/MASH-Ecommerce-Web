/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor } from "@testing-library/react";
import { useGrowerRatings } from "../useGrowerRatings";

// ---------- mock FirebaseReviewService ----------
jest.mock("@/lib/firebase/reviews", () => ({
  FirebaseReviewService: {
    getReviews: jest.fn(),
  },
}));

const { FirebaseReviewService } = jest.requireMock("@/lib/firebase/reviews") as {
  FirebaseReviewService: {
    getReviews: jest.Mock;
  };
};

// ---------- helpers ----------
function makeStats(avg: number, total: number) {
  return {
    averageRating: avg,
    totalReviews: total,
    ratingDistribution: { 5: total, 4: 0, 3: 0, 2: 0, 1: 0 },
    verifiedPurchaseCount: 0,
    recommendationPercentage: 100,
  };
}

// ---------- tests ----------
describe("useGrowerRatings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with empty ratings and loading false when no IDs", () => {
    const { result } = renderHook(() => useGrowerRatings([]));

    expect(result.current.ratings).toEqual({});
    expect(result.current.loading).toBe(false);
  });

  it("should fetch ratings for all provided grower IDs", async () => {
    const stats1 = makeStats(4.5, 20);
    const stats2 = makeStats(3.8, 10);

    FirebaseReviewService.getReviews
      .mockResolvedValueOnce({ stats: stats1 })
      .mockResolvedValueOnce({ stats: stats2 });

    const { result } = renderHook(() => useGrowerRatings(["g1", "g2"]));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(FirebaseReviewService.getReviews).toHaveBeenCalledWith("grower", "g1");
    expect(FirebaseReviewService.getReviews).toHaveBeenCalledWith("grower", "g2");
    expect(result.current.ratings["g1"]).toEqual(stats1);
    expect(result.current.ratings["g2"]).toEqual(stats2);
  });

  it("should set loading true during fetch", async () => {
    let resolveG1: (val: unknown) => void;
    FirebaseReviewService.getReviews.mockReturnValueOnce(
      new Promise((resolve) => { resolveG1 = resolve; })
    );

    const { result } = renderHook(() => useGrowerRatings(["g1"]));

    await waitFor(() => expect(result.current.loading).toBe(true));

    // Resolve
    resolveG1!({ stats: makeStats(5, 1) });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.ratings["g1"]).toBeDefined();
  });

  it("should return default stats for failed grower fetches", async () => {
    const stats1 = makeStats(4.0, 15);

    FirebaseReviewService.getReviews
      .mockResolvedValueOnce({ stats: stats1 })
      .mockRejectedValueOnce(new Error("Not found"));

    const { result } = renderHook(() => useGrowerRatings(["g1", "g2"]));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.ratings["g1"]).toEqual(stats1);
    // g2 should have default stats (zeros)
    expect(result.current.ratings["g2"]).toEqual({
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      verifiedPurchaseCount: 0,
      recommendationPercentage: 0,
    });
  });

  it("should not re-fetch already-fetched grower IDs", async () => {
    const stats1 = makeStats(4.0, 10);
    FirebaseReviewService.getReviews.mockResolvedValueOnce({ stats: stats1 });

    const { result, rerender } = renderHook(
      ({ ids }: { ids: string[] }) => useGrowerRatings(ids),
      { initialProps: { ids: ["g1"] } }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(FirebaseReviewService.getReviews).toHaveBeenCalledTimes(1);

    // Re-render with same IDs - should NOT refetch
    rerender({ ids: ["g1"] });
    expect(FirebaseReviewService.getReviews).toHaveBeenCalledTimes(1);
  });

  it("should fetch only new IDs on rerender", async () => {
    const stats1 = makeStats(4.0, 10);
    const stats2 = makeStats(3.5, 5);

    FirebaseReviewService.getReviews
      .mockResolvedValueOnce({ stats: stats1 })
      .mockResolvedValueOnce({ stats: stats2 });

    const { result, rerender } = renderHook(
      ({ ids }: { ids: string[] }) => useGrowerRatings(ids),
      { initialProps: { ids: ["g1"] } }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(FirebaseReviewService.getReviews).toHaveBeenCalledTimes(1);

    // Re-render with g1 + g2 - should only fetch g2
    rerender({ ids: ["g1", "g2"] });

    await waitFor(() =>
      expect(result.current.ratings["g2"]).toBeDefined()
    );

    expect(FirebaseReviewService.getReviews).toHaveBeenCalledTimes(2);
    expect(FirebaseReviewService.getReviews).toHaveBeenLastCalledWith("grower", "g2");
  });

  it("should handle all fetches failing gracefully", async () => {
    FirebaseReviewService.getReviews
      .mockRejectedValueOnce(new Error("fail1"))
      .mockRejectedValueOnce(new Error("fail2"));

    const { result } = renderHook(() => useGrowerRatings(["g1", "g2"]));

    await waitFor(() => expect(result.current.loading).toBe(false));

    // All should have default stats
    expect(result.current.ratings["g1"]?.averageRating).toBe(0);
    expect(result.current.ratings["g2"]?.averageRating).toBe(0);
  });

  it("should handle single grower ID", async () => {
    const stats = makeStats(5.0, 100);
    FirebaseReviewService.getReviews.mockResolvedValueOnce({ stats });

    const { result } = renderHook(() => useGrowerRatings(["g1"]));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.ratings["g1"]).toEqual(stats);
    expect(Object.keys(result.current.ratings)).toHaveLength(1);
  });

  it("should preserve previous ratings when adding new IDs", async () => {
    const stats1 = makeStats(4.0, 10);
    const stats2 = makeStats(3.0, 5);

    FirebaseReviewService.getReviews
      .mockResolvedValueOnce({ stats: stats1 })
      .mockResolvedValueOnce({ stats: stats2 });

    const { result, rerender } = renderHook(
      ({ ids }: { ids: string[] }) => useGrowerRatings(ids),
      { initialProps: { ids: ["g1"] } }
    );

    await waitFor(() => expect(result.current.ratings["g1"]).toBeDefined());

    // Add g2
    rerender({ ids: ["g1", "g2"] });

    await waitFor(() => expect(result.current.ratings["g2"]).toBeDefined());

    // g1 should still be present with original stats
    expect(result.current.ratings["g1"]).toEqual(stats1);
    expect(result.current.ratings["g2"]).toEqual(stats2);
  });

  it("should not fetch when growerIds array is undefined-like", () => {
    // Hook checks: if (!growerIds || growerIds.length === 0) return;
    const { result } = renderHook(() => useGrowerRatings([]));

    expect(FirebaseReviewService.getReviews).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });
});
