/**
 * useWishlistProducts Hook Tests - COVERAGE-018
 *
 * Tests for wishlist product fetching hook (Sanity GROQ query by IDs).
 *
 * Hook source: src/hooks/useWishlistProducts.ts
 * Data source: sanityClient.fetch (global mock in jest.setup.js)
 * Dependencies: wishlistProductsQuery, transformSanityProduct
 *
 * Mock strategy:
 *   - sanityClient: global mock (jest.setup.js)
 *   - transformSanityProduct: jest.mock("@/types/sanity")
 *   - wishlistProductsQuery: jest.mock("@/lib/sanity/queries")
 */

import { renderHook, waitFor } from "@testing-library/react";

// Mock transformSanityProduct
jest.mock("@/types/sanity", () => ({
  transformSanityProduct: jest.fn((p: Record<string, unknown>) => ({
    id: p._id || p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    image: "https://mock-image.url",
  })),
}));

// Mock the query string
jest.mock("@/lib/sanity/queries", () => ({
  wishlistProductsQuery: 'mock-wishlist-query',
}));

// Access sanityClient mock
const { sanityClient } = jest.requireMock("@/lib/sanity/client") as {
  sanityClient: { fetch: jest.Mock };
};

const { transformSanityProduct } = jest.requireMock("@/types/sanity") as {
  transformSanityProduct: jest.Mock;
};

import { useWishlistProducts } from "../useWishlistProducts";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockSanityProducts = [
  { _id: "prod-1", name: "Organic Mango", slug: "organic-mango", price: 150 },
  { _id: "prod-2", name: "Fresh Basil", slug: "fresh-basil", price: 50 },
];

// ============================================================================
// Tests
// ============================================================================

describe("useWishlistProducts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset default sanityClient behavior
    sanityClient.fetch.mockResolvedValue([]);
  });

  it("should return empty products for empty IDs", async () => {
    const { result } = renderHook(() => useWishlistProducts([]));

    // Empty IDs should not trigger loading (early return sets loading=false)
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.products).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(sanityClient.fetch).not.toHaveBeenCalled();
  });

  it(
    "should fetch and transform products by IDs",
    async () => {
      sanityClient.fetch.mockResolvedValueOnce(mockSanityProducts);

      const { result } = renderHook(() =>
        useWishlistProducts(["prod-1", "prod-2"])
      );

      await waitFor(
        () => expect(result.current.loading).toBe(false),
        { timeout: 10000 }
      );

      expect(result.current.products).toHaveLength(2);
      expect(result.current.error).toBeNull();
      expect(sanityClient.fetch).toHaveBeenCalledWith(
        "mock-wishlist-query",
        { ids: ["prod-1", "prod-2"] }
      );
      expect(transformSanityProduct).toHaveBeenCalledTimes(2);
      // .map passes (element, index, array) so use expect.objectContaining
      expect(transformSanityProduct).toHaveBeenNthCalledWith(
        1,
        mockSanityProducts[0],
        0,
        mockSanityProducts
      );
    },
    30000
  );

  it(
    "should handle fetch error",
    async () => {
      sanityClient.fetch.mockRejectedValueOnce(new Error("Sanity error"));

      const { result } = renderHook(() =>
        useWishlistProducts(["prod-1"])
      );

      await waitFor(
        () => expect(result.current.loading).toBe(false),
        { timeout: 10000 }
      );

      expect(result.current.error).toBe("Sanity error");
      expect(result.current.products).toEqual([]);
    },
    30000
  );

  it(
    "should handle non-Error exception",
    async () => {
      sanityClient.fetch.mockRejectedValueOnce("string error");

      const { result } = renderHook(() =>
        useWishlistProducts(["prod-1"])
      );

      await waitFor(
        () => expect(result.current.loading).toBe(false),
        { timeout: 10000 }
      );

      expect(result.current.error).toBe("Failed to fetch products");
    },
    30000
  );

  it(
    "should show loading state during fetch",
    async () => {
      let resolveFetch!: (v: unknown) => void;
      sanityClient.fetch.mockReturnValueOnce(
        new Promise((r) => {
          resolveFetch = r;
        })
      );

      const { result } = renderHook(() =>
        useWishlistProducts(["prod-1"])
      );

      // Should be loading
      await waitFor(() => expect(result.current.loading).toBe(true));

      // Resolve
      await resolveFetch(mockSanityProducts.slice(0, 1));

      await waitFor(
        () => expect(result.current.loading).toBe(false),
        { timeout: 10000 }
      );

      expect(result.current.products).toHaveLength(1);
    },
    30000
  );

  it(
    "should refetch when IDs change",
    async () => {
      sanityClient.fetch.mockResolvedValueOnce([mockSanityProducts[0]]);

      const { result, rerender } = renderHook(
        (props: { ids: string[] }) => useWishlistProducts(props.ids),
        { initialProps: { ids: ["prod-1"] } }
      );

      await waitFor(
        () => expect(result.current.loading).toBe(false),
        { timeout: 10000 }
      );
      expect(result.current.products).toHaveLength(1);

      // Change IDs
      sanityClient.fetch.mockResolvedValueOnce(mockSanityProducts);
      rerender({ ids: ["prod-1", "prod-2"] });

      await waitFor(
        () => expect(result.current.products).toHaveLength(2),
        { timeout: 10000 }
      );

      expect(sanityClient.fetch).toHaveBeenCalledTimes(2);
    },
    30000
  );

  it("should handle empty response from Sanity", async () => {
    sanityClient.fetch.mockResolvedValueOnce([]);

    const { result } = renderHook(() =>
      useWishlistProducts(["nonexistent-id"])
    );

    await waitFor(
      () => expect(result.current.loading).toBe(false),
      { timeout: 10000 }
    );

    expect(result.current.products).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
