/**
 * useSellerReviews Hook Tests - COVERAGE-016
 *
 * Tests for useSellerReviews hook.
 *
 * Hook source: src/hooks/useSellerReviews.ts
 * Dependencies: AuthContext (global mock), Sanity (global mock),
 *               FirebaseReviewService, calculateRatingStats
 *
 * Mock strategy:
 *   - AuthContext: global.__mockAuthContext (jest.setupMocks.js)
 *   - sanityClient: jest.requireMock (jest.setup.js)
 *   - FirebaseReviewService + calculateRatingStats: jest.mock inline factory
 */

import { renderHook, act, waitFor } from "@testing-library/react";

// --- Mock Firebase review service ---
jest.mock("@/lib/firebase/reviews", () => ({
  FirebaseReviewService: {
    getReviews: jest.fn(),
  },
  calculateRatingStats: jest.fn(),
}));

const { FirebaseReviewService, calculateRatingStats } = jest.requireMock(
  "@/lib/firebase/reviews"
) as {
  FirebaseReviewService: { getReviews: jest.Mock };
  calculateRatingStats: jest.Mock;
};

// Access global Sanity mock
const { sanityClient } = jest.requireMock("@/lib/sanity/client") as {
  sanityClient: { fetch: jest.Mock };
};

import { useSellerReviews } from "../useSellerReviews";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockUser = {
  id: "seller-1",
  email: "seller@test.com",
  displayName: "Test Seller",
};

const mockProducts = [
  { _id: "prod-1", name: "Organic Mango", slug: "organic-mango" },
  { _id: "prod-2", name: "Fresh Basil", slug: "fresh-basil" },
];

const mockReviews = [
  {
    id: "rev-1",
    targetId: "prod-1",
    userId: "user-a",
    rating: 5,
    comment: "Great product!",
    createdAt: new Date().toISOString(),
  },
  {
    id: "rev-2",
    targetId: "prod-1",
    userId: "user-b",
    rating: 4,
    comment: "Good quality",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "rev-3",
    targetId: "prod-2",
    userId: "user-c",
    rating: 3,
    comment: "Average",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const defaultStats = {
  average: 4.0,
  total: 3,
  distribution: { 1: 0, 2: 0, 3: 1, 4: 1, 5: 1 },
};

// ============================================================================
// useSellerReviews
// ============================================================================

describe("useSellerReviews", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set up authenticated user via global mock
    (global as any).__mockAuthContext = {
      ...(global as any).__mockAuthContext,
      user: mockUser,
      isAuthenticated: true,
      loading: false,
    };

    calculateRatingStats.mockReturnValue(defaultStats);
  });

  afterEach(() => {
    // Reset auth context
    (global as any).__mockAuthContext = {
      ...(global as any).__mockAuthContext,
      user: null,
      isAuthenticated: false,
    };
  });

  it("should start in loading state", () => {
    sanityClient.fetch.mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useSellerReviews());
    expect(result.current.loading).toBe(true);
    expect(result.current.reviews).toEqual([]);
    expect(result.current.products).toEqual([]);
  });

  it("should stop loading when no user exists", async () => {
    (global as any).__mockAuthContext = {
      ...(global as any).__mockAuthContext,
      user: null,
      isAuthenticated: false,
    };

    const { result } = renderHook(() => useSellerReviews());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(sanityClient.fetch).not.toHaveBeenCalled();
    expect(result.current.products).toEqual([]);
    expect(result.current.reviews).toEqual([]);
  });

  it("should fetch products then reviews for the seller", async () => {
    sanityClient.fetch.mockResolvedValueOnce(mockProducts);
    FirebaseReviewService.getReviews
      .mockResolvedValueOnce({ reviews: [mockReviews[0], mockReviews[1]] })
      .mockResolvedValueOnce({ reviews: [mockReviews[2]] });

    const { result } = renderHook(() => useSellerReviews());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.products).toEqual(mockProducts);
    expect(result.current.reviews).toHaveLength(3);
    expect(result.current.error).toBeNull();

    // Verify products fetched with seller ID
    expect(sanityClient.fetch).toHaveBeenCalledWith(
      expect.any(String),
      { userId: "seller-1" }
    );

    // Verify reviews fetched for each product
    expect(FirebaseReviewService.getReviews).toHaveBeenCalledWith(
      "product",
      "prod-1"
    );
    expect(FirebaseReviewService.getReviews).toHaveBeenCalledWith(
      "product",
      "prod-2"
    );
  });

  it("should sort reviews by createdAt descending", async () => {
    sanityClient.fetch.mockResolvedValueOnce(mockProducts);
    FirebaseReviewService.getReviews
      .mockResolvedValueOnce({ reviews: [mockReviews[0], mockReviews[1]] })
      .mockResolvedValueOnce({ reviews: [mockReviews[2]] });

    const { result } = renderHook(() => useSellerReviews());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Most recent review first
    expect(result.current.reviews[0].id).toBe("rev-1");
    expect(result.current.reviews[2].id).toBe("rev-3");
  });

  it("should handle no products (empty seller)", async () => {
    sanityClient.fetch.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useSellerReviews());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.products).toEqual([]);
    expect(result.current.reviews).toEqual([]);
    expect(FirebaseReviewService.getReviews).not.toHaveBeenCalled();
  });

  it("should handle review fetch failures gracefully", async () => {
    sanityClient.fetch.mockResolvedValueOnce(mockProducts);
    // First product reviews succeed, second fails
    FirebaseReviewService.getReviews
      .mockResolvedValueOnce({ reviews: [mockReviews[0]] })
      .mockRejectedValueOnce(new Error("Firebase down"));

    const { result } = renderHook(() => useSellerReviews());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Should still have reviews from successful product
    expect(result.current.reviews).toHaveLength(1);
  });

  it("should handle Sanity fetch error", async () => {
    sanityClient.fetch.mockRejectedValueOnce(new Error("Sanity error"));

    const { result } = renderHook(() => useSellerReviews());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Sanity error");
  });

  it("should handle non-Error exception", async () => {
    sanityClient.fetch.mockRejectedValueOnce(42);

    const { result } = renderHook(() => useSellerReviews());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Failed to load reviews");
  });

  it("should compute stats using calculateRatingStats", async () => {
    sanityClient.fetch.mockResolvedValueOnce([mockProducts[0]]);
    FirebaseReviewService.getReviews.mockResolvedValueOnce({
      reviews: [mockReviews[0]],
    });

    const { result } = renderHook(() => useSellerReviews());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(calculateRatingStats).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: "rev-1" })])
    );
    expect(result.current.stats).toEqual(defaultStats);
  });

  it("should count recent reviews (last 7 days)", async () => {
    sanityClient.fetch.mockResolvedValueOnce(mockProducts);
    FirebaseReviewService.getReviews
      .mockResolvedValueOnce({ reviews: [mockReviews[0], mockReviews[1]] })
      .mockResolvedValueOnce({ reviews: [mockReviews[2]] });

    const { result } = renderHook(() => useSellerReviews());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // rev-1 = now (recent), rev-2 = 2 days ago (recent), rev-3 = 10 days ago (not recent)
    expect(result.current.recentCount).toBe(2);
  });

  // --- Filter & Pagination ---

  it("should filter reviews by selected product", async () => {
    sanityClient.fetch.mockResolvedValueOnce(mockProducts);
    FirebaseReviewService.getReviews
      .mockResolvedValueOnce({ reviews: [mockReviews[0], mockReviews[1]] })
      .mockResolvedValueOnce({ reviews: [mockReviews[2]] });

    const { result } = renderHook(() => useSellerReviews());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.reviews).toHaveLength(3);

    act(() => {
      result.current.setSelectedProductId("prod-2");
    });

    expect(result.current.reviews).toHaveLength(1);
    expect(result.current.reviews[0].targetId).toBe("prod-2");
  });

  it("should filter reviews by rating", async () => {
    sanityClient.fetch.mockResolvedValueOnce(mockProducts);
    FirebaseReviewService.getReviews
      .mockResolvedValueOnce({ reviews: [mockReviews[0], mockReviews[1]] })
      .mockResolvedValueOnce({ reviews: [mockReviews[2]] });

    const { result } = renderHook(() => useSellerReviews());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setRatingFilter(5);
    });

    expect(result.current.reviews).toHaveLength(1);
    expect(result.current.reviews[0].rating).toBe(5);
  });

  it("should reset page when filter changes", async () => {
    sanityClient.fetch.mockResolvedValueOnce(mockProducts);
    FirebaseReviewService.getReviews
      .mockResolvedValueOnce({ reviews: [mockReviews[0]] })
      .mockResolvedValueOnce({ reviews: [] });

    const { result } = renderHook(() => useSellerReviews());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Set page to non-zero
    act(() => {
      result.current.setPage(2);
    });
    expect(result.current.page).toBe(2);

    // Change filter should reset page to 0
    act(() => {
      result.current.setSelectedProductId("prod-1");
    });
    expect(result.current.page).toBe(0);
  });

  it("should paginate reviews (PAGE_SIZE = 15)", async () => {
    // Generate 20 reviews for pagination test
    const manyReviews = Array.from({ length: 20 }, (_, i) => ({
      id: `rev-${i}`,
      targetId: "prod-1",
      userId: `user-${i}`,
      rating: 5,
      comment: `Review ${i}`,
      createdAt: new Date(Date.now() - i * 60000).toISOString(),
    }));

    sanityClient.fetch.mockResolvedValueOnce([mockProducts[0]]);
    FirebaseReviewService.getReviews.mockResolvedValueOnce({
      reviews: manyReviews,
    });

    const { result } = renderHook(() => useSellerReviews());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.totalPages).toBe(2);
    expect(result.current.paginatedReviews).toHaveLength(15);

    // Go to page 2
    act(() => {
      result.current.setPage(1);
    });

    expect(result.current.paginatedReviews).toHaveLength(5);
  });

  it("should return totalPages of at least 1", async () => {
    sanityClient.fetch.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useSellerReviews());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.totalPages).toBe(1);
  });
});
