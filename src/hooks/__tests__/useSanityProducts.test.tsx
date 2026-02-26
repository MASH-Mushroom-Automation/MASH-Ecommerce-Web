/**
 * Tests for src/hooks/useSanityProducts.ts
 * Hooks: useSanityProducts, useSanityProduct, useSanitySuggestedProducts, useSanityFeaturedProducts
 */

import { renderHook, waitFor, act } from "@testing-library/react";

// Global mocks: sanityClient, listenSafe from jest.setup.js
const mockSanityClient =
  jest.requireMock("@/lib/sanity/client").sanityClient;
const mockListenSafe =
  jest.requireMock("@/lib/sanity/client").listenSafe;

// Mock dynamic import of transformSanityProduct
const mockTransform = jest.fn((p: Record<string, unknown>) => ({
  id: p._id,
  name: p.name,
  slug: typeof p.slug === "object" ? (p.slug as { current: string }).current : p.slug,
  price: p.price,
  mainImage: p.mainImage || p.image,
  stock: p.stock || (p as Record<string, unknown>).quantity,
  isAvailable: p.isAvailable,
  isFeatured: p.isFeatured,
  category: p.category,
}));

jest.mock("@/types/sanity", () => ({
  transformSanityProduct: (...args: unknown[]) => mockTransform(...(args as [Record<string, unknown>])),
}));

import {
  useSanityProducts,
  useSanityProduct,
  useSanitySuggestedProducts,
  useSanityFeaturedProducts,
} from "../useSanityProducts";

// Sample data
const sampleProduct = {
  _id: "prod-1",
  _createdAt: "2026-01-01T00:00:00Z",
  _updatedAt: "2026-01-02T00:00:00Z",
  name: "King Oyster Mushroom",
  slug: { current: "king-oyster" },
  description: "Premium mushroom",
  price: 120,
  mainImage: "https://cdn.sanity.io/images/king.jpg",
  stock: 50,
  isAvailable: true,
  isFeatured: true,
  category: { _id: "cat-1", name: "Oyster", slug: "oyster" },
};

const sampleProduct2 = {
  _id: "prod-2",
  name: "Shiitake",
  slug: { current: "shiitake" },
  price: 200,
  mainImage: "https://cdn.sanity.io/images/shiitake.jpg",
  isAvailable: true,
  isFeatured: false,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockTransform.mockClear();
  // Re-mock transform to return simplified objects
  mockTransform.mockImplementation((p: Record<string, unknown>) => ({
    id: p._id,
    name: p.name,
    slug: typeof p.slug === "object" ? (p.slug as { current: string }).current : p.slug,
    price: p.price,
    mainImage: p.mainImage,
    isAvailable: p.isAvailable,
    isFeatured: p.isFeatured,
    category: p.category,
  }));
});

// ---- useSanityProducts ----
describe("useSanityProducts", () => {
  it("should fetch products and set loading states", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([sampleProduct, sampleProduct2]);

    const { result } = renderHook(() => useSanityProducts());

    // Initially loading
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.products).toHaveLength(2);
    expect(result.current.error).toBeNull();
    expect(mockSanityClient.fetch).toHaveBeenCalled();
  });

  it("should handle fetch error", async () => {
    // Use mockRejectedValue (persistent) to ensure it rejects
    mockSanityClient.fetch.mockRejectedValue(new Error("Network error"));

    // Use unique filters to avoid cache hit from other tests
    const { result } = renderHook(() => useSanityProducts({ search: "error-test-unique" }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).not.toBeNull();
    });

    expect(result.current.products).toHaveLength(0);
  });

  it("should support category filter", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([sampleProduct]);

    const { result } = renderHook(() =>
      useSanityProducts({ category: "oyster" })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.products).toHaveLength(1);
    // Verify GROQ query contains category filter
    const query = mockSanityClient.fetch.mock.calls[0][0];
    expect(query).toContain("oyster");
  });

  it("should support featured filter", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([sampleProduct]);

    const { result } = renderHook(() =>
      useSanityProducts({ featured: true })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    const query = mockSanityClient.fetch.mock.calls[0][0];
    expect(query).toContain("isFeatured == true");
  });

  it("should support search filter", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([sampleProduct]);

    const { result } = renderHook(() =>
      useSanityProducts({ search: "oyster" })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    const query = mockSanityClient.fetch.mock.calls[0][0];
    expect(query).toContain("oyster");
  });

  it("should support sort by price-asc", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([sampleProduct]);

    const { result } = renderHook(() =>
      useSanityProducts({ sortBy: "price-asc" })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    const query = mockSanityClient.fetch.mock.calls[0][0];
    expect(query).toContain("order(price asc)");
  });

  it("should support sort by newest", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([sampleProduct]);

    renderHook(() => useSanityProducts({ sortBy: "newest" }));

    await waitFor(() => {
      const query = mockSanityClient.fetch.mock.calls[0][0];
      expect(query).toContain("order(_createdAt desc)");
    });
  });

  it("should apply client-side price filtering", async () => {
    mockSanityClient.fetch.mockResolvedValue([
      { ...sampleProduct, price: 50 },
      { ...sampleProduct2, price: 250 },
    ]);

    const { result } = renderHook(() =>
      useSanityProducts({ minPrice: 100, maxPrice: 300 })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Only product with price 250 should pass (50 < 100 is filtered)
    expect(result.current.products).toHaveLength(1);
  });

  it("should support pagination with limit and offset", async () => {
    mockSanityClient.fetch
      .mockResolvedValueOnce([sampleProduct]) // paginated results
      .mockResolvedValueOnce(10); // count query

    const { result } = renderHook(() =>
      useSanityProducts({ limit: 5, offset: 0 })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.products).toHaveLength(1);
    expect(result.current.totalCount).toBe(10);
    // Should have made two fetch calls (data + count)
    expect(mockSanityClient.fetch).toHaveBeenCalledTimes(2);
  });

  it("should support refetch", async () => {
    mockSanityClient.fetch.mockResolvedValue([sampleProduct]);

    const { result } = renderHook(() => useSanityProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Clear and refetch
    mockSanityClient.fetch.mockResolvedValue([sampleProduct, sampleProduct2]);
    mockTransform.mockImplementation((p: Record<string, unknown>) => ({
      id: p._id,
      name: p.name,
    }));

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.products).toHaveLength(2));
  });

  it("should support tags filter", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([sampleProduct]);

    renderHook(() => useSanityProducts({ tags: ["organic", "premium"] }));

    await waitFor(() => {
      const query = mockSanityClient.fetch.mock.calls[0][0];
      expect(query).toContain("organic");
      expect(query).toContain("premium");
    });
  });
});

// ---- useSanityProduct (single) ----
describe("useSanityProduct", () => {
  it("should fetch a single product by slug", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(sampleProduct);

    const { result } = renderHook(() => useSanityProduct("king-oyster"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.product).toBeDefined();
    expect(result.current.product?.name).toBe("King Oyster Mushroom");
    expect(result.current.error).toBeNull();
    expect(mockSanityClient.fetch).toHaveBeenCalledWith(
      expect.any(String),
      { slug: "king-oyster" }
    );
  });

  it("should return null for non-existent slug", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useSanityProduct("nonexistent"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.product).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should handle fetch error", async () => {
    mockSanityClient.fetch.mockRejectedValueOnce(new Error("Server error"));

    const { result } = renderHook(() => useSanityProduct("king-oyster"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error?.message).toBe("Server error");
    expect(result.current.product).toBeNull();
  });

  it("should set up real-time subscription", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(sampleProduct);

    renderHook(() => useSanityProduct("king-oyster"));

    await waitFor(() => {
      expect(mockListenSafe).toHaveBeenCalled();
    });
  });

  it("should not fetch if slug is empty", async () => {
    const { result } = renderHook(() => useSanityProduct(""));

    // Should not call fetch
    expect(mockSanityClient.fetch).not.toHaveBeenCalled();
    // Loading state remains true since no effect runs to set it false
    // (the useEffect returns early without calling fetchProduct)
  });
});

// ---- useSanitySuggestedProducts ----
describe("useSanitySuggestedProducts", () => {
  it("should fetch suggested products from same grower", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([sampleProduct2]);

    const { result } = renderHook(() =>
      useSanitySuggestedProducts("prod-1", "grower-1", 4)
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.suggestedProducts).toHaveLength(1);
    expect(result.current.error).toBeNull();
    expect(mockSanityClient.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        currentProductId: "prod-1",
        growerId: "grower-1",
      })
    );
  });

  it("should return empty when no growerId", async () => {
    const { result } = renderHook(() =>
      useSanitySuggestedProducts("prod-1", undefined, 4)
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.suggestedProducts).toEqual([]);
    expect(mockSanityClient.fetch).not.toHaveBeenCalled();
  });

  it("should return empty when no currentProductId", async () => {
    const { result } = renderHook(() =>
      useSanitySuggestedProducts(undefined, "grower-1", 4)
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.suggestedProducts).toEqual([]);
  });

  it("should handle fetch error", async () => {
    mockSanityClient.fetch.mockRejectedValueOnce(new Error("Error"));

    const { result } = renderHook(() =>
      useSanitySuggestedProducts("prod-1", "grower-1")
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeDefined();
    expect(result.current.suggestedProducts).toEqual([]);
  });
});

// ---- useSanityFeaturedProducts ----
describe("useSanityFeaturedProducts", () => {
  it("should fetch from singleton first", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce({
      products: [sampleProduct, sampleProduct2],
    });

    const { result } = renderHook(() => useSanityFeaturedProducts(4));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.products).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it("should fall back to isFeatured flag when singleton is empty", async () => {
    // First call (singleton) returns empty
    mockSanityClient.fetch
      .mockResolvedValueOnce({ products: [] })
      .mockResolvedValueOnce([sampleProduct]); // fallback query

    const { result } = renderHook(() => useSanityFeaturedProducts(8));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.products).toHaveLength(1);
    expect(mockSanityClient.fetch).toHaveBeenCalledTimes(2);
  });

  it("should fall back when singleton returns null products", async () => {
    mockSanityClient.fetch
      .mockResolvedValueOnce(null) // singleton not found
      .mockResolvedValueOnce([sampleProduct]); // fallback

    const { result } = renderHook(() => useSanityFeaturedProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // First check for null → goes to legacy/fallback
    expect(result.current.products).toBeDefined();
  });

  it("should handle fetch error", async () => {
    mockSanityClient.fetch.mockRejectedValueOnce(new Error("Timeout"));

    const { result } = renderHook(() => useSanityFeaturedProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error?.message).toBe("Timeout");
  });

  it("should set up real-time listener via listenSafe", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce({ products: [sampleProduct] });

    renderHook(() => useSanityFeaturedProducts());

    await waitFor(() => {
      expect(mockListenSafe).toHaveBeenCalled();
    });
  });
});
