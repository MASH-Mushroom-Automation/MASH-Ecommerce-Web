/**
 * Tests for src/hooks/useSanityReviews.ts
 * Hooks: useSanityReviews, useAllReviews
 *
 * useSanityReviews fetches { reviews: [...], stats: [...] } as a single GROQ result.
 * useAllReviews fetches a flat array of reviews.
 */

import React from "react";
import { render, screen, cleanup, waitFor, renderHook } from "@testing-library/react";

// Use global mocks from jest.setup.js
const mockSanityClient =
  jest.requireMock("@/lib/sanity/client").sanityClient;
const mockListenSafe =
  jest.requireMock("@/lib/sanity/client").listenSafe;

import { useSanityReviews, useAllReviews } from "../useSanityReviews";

// Raw review data as returned by Sanity GROQ (inside reviews array)
const rawReview1 = {
  _id: "rev-1",
  productId: "prod-1",
  customerName: "John Doe",
  customerEmail: "john@example.com",
  rating: 5,
  title: "Excellent mushrooms",
  content: "Best King Oyster I have ever had!",
  images: [],
  verifiedPurchase: true,
  reviewDate: "2026-01-10T12:00:00Z",
  helpfulCount: 3,
  status: "approved",
};

const rawReview2 = {
  _id: "rev-2",
  productId: "prod-1",
  customerName: "Jane Smith",
  customerEmail: "jane@example.com",
  rating: 4,
  title: "Good quality",
  content: "Very fresh, nice packaging.",
  images: [],
  verifiedPurchase: true,
  reviewDate: "2026-01-11T12:00:00Z",
  helpfulCount: 1,
  status: "approved",
};

const rawReview3 = {
  _id: "rev-3",
  productId: "prod-1",
  customerName: "Bob",
  customerEmail: "bob@example.com",
  rating: 2,
  title: "Not great",
  content: "Arrived late and slightly dried out.",
  images: [],
  verifiedPurchase: false,
  reviewDate: "2026-01-12T12:00:00Z",
  helpfulCount: 0,
  status: "approved",
};

// Stats array: simplified {rating, verifiedPurchase} from approved reviews
const stats3 = [
  { rating: 5, verifiedPurchase: true },
  { rating: 4, verifiedPurchase: true },
  { rating: 2, verifiedPurchase: false },
];

// Helper: build the { reviews, stats } response shape
function makeReviewResponse(
  reviews: typeof rawReview1[],
  stats: typeof stats3
) {
  return { reviews, stats };
}

// Flat review for useAllReviews (includes _id, productName, etc.)
const flatReview1 = { ...rawReview1, productName: "King Oyster 500g" };
const flatReview2 = { ...rawReview2, productName: "King Oyster 500g" };
const flatReview3 = { ...rawReview3, productName: "King Oyster 500g" };
const flatReview4 = {
  _id: "rev-4",
  productId: "prod-2",
  productName: "Shiitake 250g",
  customerName: "Alice",
  customerEmail: "alice@example.com",
  rating: 3,
  title: "Average shiitake",
  content: "Nothing special.",
  images: [],
  verifiedPurchase: true,
  reviewDate: "2026-01-13T12:00:00Z",
  helpfulCount: 0,
  status: "approved",
};

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

// ---- useSanityReviews ----
describe("useSanityReviews", () => {
  it("should fetch reviews for a product and set loading states", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(
      makeReviewResponse([rawReview1, rawReview2, rawReview3], stats3)
    );

    const { result } = renderHook(() => useSanityReviews("prod-1"));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.reviews).toHaveLength(3);
    expect(result.current.error).toBeNull();
  });

  it("should transform review _id to id", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(
      makeReviewResponse([rawReview1], [stats3[0]])
    );

    const { result } = renderHook(() => useSanityReviews("prod-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.reviews[0]).toBeDefined();
    expect(result.current.reviews[0].id).toBe("rev-1");
  });

  it("should calculate average rating", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(
      makeReviewResponse([rawReview1, rawReview2, rawReview3], stats3)
    );

    const { result } = renderHook(() => useSanityReviews("prod-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Average: (5 + 4 + 2) / 3 = 3.666... rounded to 1 decimal = 3.7
    expect(result.current.rating).toBeDefined();
    expect(result.current.rating?.averageRating).toBeCloseTo(3.7, 1);
    expect(result.current.rating?.totalReviews).toBe(3);
  });

  it("should compute rating distribution", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(
      makeReviewResponse([rawReview1, rawReview2, rawReview3], stats3)
    );

    const { result } = renderHook(() => useSanityReviews("prod-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    const dist = result.current.rating?.ratingDistribution;
    expect(dist).toBeDefined();
    if (dist) {
      expect(dist[5]).toBe(1);
      expect(dist[4]).toBe(1);
      expect(dist[2]).toBe(1);
      expect(dist[1]).toBe(0);
      expect(dist[3]).toBe(0);
    }
  });

  it("should calculate verified purchase count", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(
      makeReviewResponse([rawReview1, rawReview2, rawReview3], stats3)
    );

    const { result } = renderHook(() => useSanityReviews("prod-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.rating?.verifiedPurchaseCount).toBe(2);
  });

  it("should calculate recommendation percentage", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(
      makeReviewResponse([rawReview1, rawReview2, rawReview3], stats3)
    );

    const { result } = renderHook(() => useSanityReviews("prod-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    // 4+ star reviews: review1(5) + review2(4) = 2 out of 3 => 66.67% rounded = 67
    expect(result.current.rating?.recommendationPercentage).toBe(67);
  });

  it("should return zero rating for empty reviews", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(
      makeReviewResponse([], [])
    );

    const { result } = renderHook(() => useSanityReviews("prod-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.reviews).toEqual([]);
    expect(result.current.rating?.averageRating).toBe(0);
    expect(result.current.rating?.totalReviews).toBe(0);
  });

  it("should handle fetch error", async () => {
    mockSanityClient.fetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useSanityReviews("prod-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error?.message).toContain("Network error");
    expect(result.current.reviews).toEqual([]);
  });

  it("should set up real-time listener via listenSafe", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(
      makeReviewResponse([rawReview1], [stats3[0]])
    );

    renderHook(() => useSanityReviews("prod-1"));

    await waitFor(() => {
      expect(mockListenSafe).toHaveBeenCalled();
    });
  });

  it("should calculate rating for single perfect review", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(
      makeReviewResponse([rawReview1], [{ rating: 5, verifiedPurchase: true }])
    );

    const { result } = renderHook(() => useSanityReviews("prod-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.rating?.averageRating).toBe(5);
    expect(result.current.rating?.totalReviews).toBe(1);
    expect(result.current.rating?.recommendationPercentage).toBe(100);
  });
});

// ---- useAllReviews ----
describe("useAllReviews", () => {
  it("should fetch all reviews across all products", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([
      flatReview1,
      flatReview2,
      flatReview3,
      flatReview4,
    ]);

    const { result } = renderHook(() => useAllReviews());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.reviews).toHaveLength(4);
    expect(result.current.error).toBeNull();
  });

  it("should handle empty result", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useAllReviews());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.reviews).toEqual([]);
  });

  it("should handle fetch error", async () => {
    mockSanityClient.fetch.mockRejectedValueOnce(new Error("Server error"));

    const { result } = renderHook(() => useAllReviews());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error?.message).toContain("Server error");
    expect(result.current.reviews).toEqual([]);
  });
});