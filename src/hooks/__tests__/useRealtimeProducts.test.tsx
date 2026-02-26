/**
 * Tests for src/hooks/useRealtimeProducts.ts
 *
 * Hook:  useRealtimeProducts (default export)
 *
 * Real-time product updates from Sanity CMS with cache-first strategy.
 * Module-level productCache Map with 30s TTL. Uses subscriptionManager
 * for real-time subscription when realtime option is true.
 */

import { renderHook, waitFor, act } from "@testing-library/react";

// ─── Module mock for @/lib/sanity/realtime ────────────────────

const mockSubscribe = jest.fn();

jest.mock("@/lib/sanity/realtime", () => ({
  realtimeClient: {},
  subscriptionManager: {
    subscribe: (...args: unknown[]) => mockSubscribe(...args),
  },
}));

// Grab global Sanity mock
const { sanityClient } = jest.requireMock("@/lib/sanity/client");

import { useRealtimeProducts, clearProductCache } from "../useRealtimeProducts";

// ─── Helpers ──────────────────────────────────────────────────

const makeSanityProduct = (
  id: string,
  overrides: Record<string, unknown> = {}
) => ({
  _id: id,
  _createdAt: "2025-01-01T00:00:00Z",
  _updatedAt: "2025-01-01T00:00:00Z",
  name: `Product ${id}`,
  slug: { current: `product-${id}` },
  description: `Description for ${id}`,
  price: 100,
  compareAtPrice: undefined,
  stock: 10,
  sku: `SKU-${id}`,
  weight: 0.5,
  unit: "kg",
  isAvailable: true,
  isFeatured: false,
  isPromo: false,
  promoEndDate: undefined,
  productTags: ["tag1"],
  mainImage: "https://cdn.sanity.io/image.jpg",
  images: ["https://cdn.sanity.io/img1.jpg"],
  category: { _id: "cat-1", name: "Mushrooms", slug: "mushrooms" },
  ...overrides,
});

const mockUnsubscribe = jest.fn();

// ─── Setup ────────────────────────────────────────────────────

beforeEach(() => {
  sanityClient.fetch.mockClear();
  mockSubscribe.mockReset();
  mockUnsubscribe.mockClear();

  // Clear module-level product cache to prevent cross-test contamination
  clearProductCache();

  // Default: no subscription, returns unsubscribe
  mockSubscribe.mockReturnValue(mockUnsubscribe);

  // Default: empty resolved array
  sanityClient.fetch.mockResolvedValue([]);
});

// ─── Tests ────────────────────────────────────────────────────

describe("useRealtimeProducts", () => {
  // ── Loading / Initial state ─────────────────────────────────

  it("starts in loading state", () => {
    // Use hanging promise to keep in loading state
    sanityClient.fetch.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useRealtimeProducts());

    expect(result.current.loading).toBe(true);
    expect(result.current.products).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.isRealtime).toBe(false);
    expect(result.current.lastUpdated).toBeNull();
  });

  it("fetches and transforms products", async () => {
    const sanityProducts = [
      makeSanityProduct("p1", { name: "Oyster", price: 150, isFeatured: true }),
      makeSanityProduct("p2", { name: "Shiitake", price: 200 }),
    ];
    sanityClient.fetch.mockResolvedValue(sanityProducts);

    const { result } = renderHook(() => useRealtimeProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.products).toHaveLength(2);

    // Verify transformation: _id -> id, slug.current -> slug
    const p1 = result.current.products[0];
    expect(p1.id).toBe("p1");
    expect(p1.sanityId).toBe("p1");
    expect(p1.name).toBe("Oyster");
    expect(p1.slug).toBe("product-p1");
    expect(p1.price).toBe(150);
    expect(p1.isFeatured).toBe(true);
    expect(p1.mainImage).toBe("https://cdn.sanity.io/image.jpg");
    expect(p1.category?.id).toBe("cat-1");
    expect(p1.category?.slug).toBe("mushrooms");
  });

  it("handles empty product list", async () => {
    const { result } = renderHook(() => useRealtimeProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.products).toEqual([]);
    expect(result.current.lastUpdated).not.toBeNull();
  });

  it("handles fetch errors", async () => {
    sanityClient.fetch.mockRejectedValue(new Error("Sanity unavailable"));

    const { result } = renderHook(() => useRealtimeProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error!.message).toBe("Sanity unavailable");
  });

  // ── Transformation edge cases ───────────────────────────────

  it("handles product with no category", async () => {
    const noCategory = makeSanityProduct("p1", { category: null });
    sanityClient.fetch.mockResolvedValue([noCategory]);

    const { result } = renderHook(() => useRealtimeProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.products[0].category).toBeUndefined();
  });

  it("handles product with no slug", async () => {
    const noSlug = makeSanityProduct("p1", { slug: undefined });
    sanityClient.fetch.mockResolvedValue([noSlug]);

    const { result } = renderHook(() => useRealtimeProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.products[0].slug).toBe("");
  });

  it("defaults missing fields gracefully", async () => {
    const sparse = {
      _id: "p-sparse",
      _createdAt: "2025-01-01",
      _updatedAt: "2025-01-01",
    };
    sanityClient.fetch.mockResolvedValue([sparse]);

    const { result } = renderHook(() => useRealtimeProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    const p = result.current.products[0];
    expect(p.name).toBe("");
    expect(p.price).toBe(0);
    expect(p.stock).toBe(0);
    expect(p.isAvailable).toBe(true);
    expect(p.isFeatured).toBe(false);
    expect(p.productTags).toEqual([]);
    expect(p.images).toEqual([]);
  });

  // ── Real-time mode ─────────────────────────────────────────

  it("sets isRealtime flag to true when realtime option is true", async () => {
    const { result } = renderHook(() =>
      useRealtimeProducts({ realtime: true })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isRealtime).toBe(true);
  });

  it("subscribes via subscriptionManager when realtime=true", async () => {
    renderHook(() => useRealtimeProducts({ realtime: true }));

    await waitFor(() => expect(mockSubscribe).toHaveBeenCalled());

    const [key, config] = mockSubscribe.mock.calls[0];
    expect(key).toContain("products:");
    expect(config.query).toContain("product");
    expect(config.debounceMs).toBe(1000); // default
    expect(typeof config.onUpdate).toBe("function");
  });

  it("uses custom debounceMs when provided", async () => {
    renderHook(() =>
      useRealtimeProducts({ realtime: true, debounceMs: 2000 })
    );

    await waitFor(() => expect(mockSubscribe).toHaveBeenCalled());

    const config = mockSubscribe.mock.calls[0][1];
    expect(config.debounceMs).toBe(2000);
  });

  it("does not subscribe when realtime=false", async () => {
    renderHook(() => useRealtimeProducts({ realtime: false }));

    await waitFor(() => expect(sanityClient.fetch).toHaveBeenCalled());
    expect(mockSubscribe).not.toHaveBeenCalled();
  });

  it("unsubscribes from realtime on unmount", async () => {
    const { unmount } = renderHook(() =>
      useRealtimeProducts({ realtime: true })
    );

    await waitFor(() => expect(mockSubscribe).toHaveBeenCalled());
    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  // ── Fetch invocation ────────────────────────────────────────

  it("calls sanityClient.fetch with GROQ query", async () => {
    renderHook(() => useRealtimeProducts());

    await waitFor(() => expect(sanityClient.fetch).toHaveBeenCalled());

    const query = sanityClient.fetch.mock.calls[0][0];
    expect(query).toContain('_type == "product"');
    expect(query).toContain("isAvailable == true");
  });

  // ── lastUpdated ─────────────────────────────────────────────

  it("sets lastUpdated after successful fetch", async () => {
    sanityClient.fetch.mockResolvedValue([makeSanityProduct("p1")]);

    const { result } = renderHook(() => useRealtimeProducts());

    await waitFor(() => expect(result.current.lastUpdated).not.toBeNull());
    expect(result.current.lastUpdated).toBeInstanceOf(Date);
  });

  // ── refetch ─────────────────────────────────────────────────

  it("refetch calls sanityClient.fetch again", async () => {
    const { result } = renderHook(() => useRealtimeProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // The initial fetch already happened; setup for refetch
    sanityClient.fetch.mockResolvedValue([makeSanityProduct("p-new")]);

    await act(async () => {
      await result.current.refetch();
    });

    // fetch should have been called at least twice
    expect(sanityClient.fetch.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
