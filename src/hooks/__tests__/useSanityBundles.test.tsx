/**
 * Tests for src/hooks/useSanityBundles.ts
 *
 * Hooks:  useSanityBundles, useSanityBundle
 *
 * useSanityBundles - fetches all active bundles with real-time subscription,
 *   computes summary, exposes getFeaturedBundles / getBundlesByBadge / calculateSavings.
 * useSanityBundle  - fetches a single bundle by slug with real-time subscription.
 *
 * sanityClient.fetch and sanityClient.listen are globally mocked in jest.setup.js.
 */

import { renderHook, waitFor, act } from "@testing-library/react";

const mockSanityFetch = jest.requireMock("@/lib/sanity/client").sanityClient
  .fetch as jest.Mock;
const mockSanityListen = jest.requireMock("@/lib/sanity/client").sanityClient
  .listen as jest.Mock;

import { useSanityBundles, useSanityBundle } from "../useSanityBundles";
import type { ProductBundle } from "../useSanityBundles";

// ─── Helpers ──────────────────────────────────────────────────

const makeProduct = (id: string, price: number) => ({
  id,
  name: `Product ${id}`,
  slug: `product-${id}`,
  price,
  image: `https://img.test/${id}.jpg`,
});

const makeBundle = (overrides: Partial<Record<string, unknown>> = {}): Record<string, unknown> => ({
  _id: "bundle-1",
  bundleName: "Starter Kit",
  slug: { current: "starter-kit" },
  description: "A starter bundle",
  tagline: "Best value",
  products: [
    { product: makeProduct("p1", 100), quantity: 2, variant: null },
    { product: makeProduct("p2", 50), quantity: 1, variant: { id: "v1", variantName: "Large" } },
  ],
  bundlePrice: 200,
  discountPercentage: null,
  savingsAmount: null,
  bundleImage: "https://img.test/bundle.jpg",
  additionalImages: ["https://img.test/extra.jpg"],
  isActive: true,
  availableFrom: null,
  availableUntil: null,
  stockLimit: 100,
  featured: true,
  badge: "hot",
  sortOrder: 1,
  ...overrides,
});

const makeBundleDirect = (overrides: Partial<Record<string, unknown>> = {}): Record<string, unknown> => {
  const base = makeBundle(overrides);
  // For single-bundle endpoint, strip slug wrapper
  return { ...base, slug: (base.slug as { current: string }).current };
};

let listenCallback: ((update: { type: string }) => void) | null = null;
let listenUnsubscribe: jest.Mock;

beforeEach(() => {
  mockSanityFetch.mockClear();
  listenCallback = null;
  listenUnsubscribe = jest.fn();
  mockSanityListen.mockClear();
  mockSanityListen.mockImplementation(() => ({
    subscribe: jest.fn((cb: (update: { type: string }) => void) => {
      listenCallback = cb;
      return { unsubscribe: listenUnsubscribe };
    }),
  }));
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// useSanityBundles
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("useSanityBundles", () => {
  it("starts in loading state", () => {
    mockSanityFetch.mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useSanityBundles());
    expect(result.current.loading).toBe(true);
    expect(result.current.bundles).toEqual([]);
    expect(result.current.summary).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("fetches bundles without productId", async () => {
    const raw = [makeBundle()];
    mockSanityFetch.mockResolvedValueOnce(raw);

    const { result } = renderHook(() => useSanityBundles());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.bundles).toHaveLength(1);
    expect(result.current.bundles[0].id).toBe("bundle-1");
    expect(result.current.bundles[0].bundleName).toBe("Starter Kit");
    expect(result.current.error).toBeNull();

    // Should call fetch without productId param
    expect(mockSanityFetch).toHaveBeenCalledWith(
      expect.stringContaining("productBundle"),
      expect.objectContaining({})
    );
  });

  it("fetches bundles with productId filter", async () => {
    mockSanityFetch.mockResolvedValueOnce([makeBundle()]);

    const { result } = renderHook(() => useSanityBundles("prod-123"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockSanityFetch).toHaveBeenCalledWith(
      expect.stringContaining("references"),
      expect.objectContaining({ productId: "prod-123" })
    );
  });

  it("calculates savings when savingsAmount is null", async () => {
    // products: 2*100 + 1*50 = 250, bundlePrice=200 => savings=50, discount=20%
    mockSanityFetch.mockResolvedValueOnce([makeBundle()]);

    const { result } = renderHook(() => useSanityBundles());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.bundles[0].savingsAmount).toBe(50);
    expect(result.current.bundles[0].discountPercentage).toBe(20);
  });

  it("preserves provided savingsAmount and discountPercentage", async () => {
    mockSanityFetch.mockResolvedValueOnce([
      makeBundle({ savingsAmount: 75, discountPercentage: 30 }),
    ]);

    const { result } = renderHook(() => useSanityBundles());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.bundles[0].savingsAmount).toBe(75);
    expect(result.current.bundles[0].discountPercentage).toBe(30);
  });

  it("filters out bundles outside availability window", async () => {
    const futureBundle = makeBundle({
      _id: "bundle-future",
      bundleName: "Future",
      availableFrom: new Date(Date.now() + 86400000).toISOString(),
    });
    const expiredBundle = makeBundle({
      _id: "bundle-expired",
      bundleName: "Expired",
      availableUntil: new Date(Date.now() - 86400000).toISOString(),
    });
    const activeBundle = makeBundle({ _id: "bundle-active", bundleName: "Active" });

    mockSanityFetch.mockResolvedValueOnce([futureBundle, expiredBundle, activeBundle]);

    const { result } = renderHook(() => useSanityBundles());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.bundles).toHaveLength(1);
    expect(result.current.bundles[0].id).toBe("bundle-active");
  });

  it("computes summary for available bundles", async () => {
    const b1 = makeBundle({ _id: "b1", featured: true, savingsAmount: 50, discountPercentage: 20 });
    const b2 = makeBundle({ _id: "b2", featured: false, savingsAmount: 30, discountPercentage: 12 });
    mockSanityFetch.mockResolvedValueOnce([b1, b2]);

    const { result } = renderHook(() => useSanityBundles());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const summary = result.current.summary;
    expect(summary).not.toBeNull();
    expect(summary!.totalBundles).toBe(2);
    expect(summary!.activeBundles).toBe(2);
    expect(summary!.featuredBundles).toBe(1);
    expect(summary!.totalSavings).toBe(80);
    expect(summary!.averageDiscount).toBe(16);
  });

  it("sets summary to null when no bundles available", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useSanityBundles());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.summary).toBeNull();
    expect(result.current.bundles).toEqual([]);
  });

  it("handles fetch error", async () => {
    mockSanityFetch.mockRejectedValueOnce(new Error("Network failure"));

    const { result } = renderHook(() => useSanityBundles());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Network failure");
    expect(result.current.bundles).toEqual([]);
  });

  it("handles non-Error throw", async () => {
    mockSanityFetch.mockRejectedValueOnce("string error");

    const { result } = renderHook(() => useSanityBundles());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Failed to fetch bundles");
  });

  it("subscribes to real-time updates and unsubscribes on unmount", async () => {
    mockSanityFetch.mockResolvedValue([makeBundle()]);

    const { unmount } = renderHook(() => useSanityBundles());
    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalled());

    expect(mockSanityListen).toHaveBeenCalledWith(
      expect.stringContaining("productBundle")
    );

    unmount();
    expect(listenUnsubscribe).toHaveBeenCalled();
  });

  it("refetches on real-time mutation event", async () => {
    mockSanityFetch.mockResolvedValue([makeBundle()]);

    renderHook(() => useSanityBundles());
    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalledTimes(1));

    // Trigger real-time update
    act(() => {
      listenCallback?.({ type: "mutation" });
    });

    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalledTimes(2));
  });

  it("does not refetch for non-mutation events", async () => {
    mockSanityFetch.mockResolvedValue([makeBundle()]);

    renderHook(() => useSanityBundles());
    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalledTimes(1));

    act(() => {
      listenCallback?.({ type: "reconnect" });
    });

    // Should still be 1 call
    expect(mockSanityFetch).toHaveBeenCalledTimes(1);
  });

  // ── Utility methods ──

  describe("getFeaturedBundles", () => {
    it("returns only featured bundles", async () => {
      mockSanityFetch.mockResolvedValueOnce([
        makeBundle({ _id: "f1", featured: true }),
        makeBundle({ _id: "f2", featured: false }),
        makeBundle({ _id: "f3", featured: true }),
      ]);

      const { result } = renderHook(() => useSanityBundles());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const featured = result.current.getFeaturedBundles();
      expect(featured).toHaveLength(2);
      expect(featured.map((b) => b.id)).toEqual(["f1", "f3"]);
    });
  });

  describe("getBundlesByBadge", () => {
    it("filters bundles by badge type", async () => {
      mockSanityFetch.mockResolvedValueOnce([
        makeBundle({ _id: "b1", badge: "hot" }),
        makeBundle({ _id: "b2", badge: "new" }),
        makeBundle({ _id: "b3", badge: "hot" }),
      ]);

      const { result } = renderHook(() => useSanityBundles());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const hotBundles = result.current.getBundlesByBadge("hot");
      expect(hotBundles).toHaveLength(2);

      const newBundles = result.current.getBundlesByBadge("new");
      expect(newBundles).toHaveLength(1);
    });
  });

  describe("calculateSavings", () => {
    it("calculates savings amount and percentage", async () => {
      mockSanityFetch.mockResolvedValueOnce([makeBundle()]);

      const { result } = renderHook(() => useSanityBundles());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const bundle = result.current.bundles[0];
      const savings = result.current.calculateSavings(bundle);
      // total product price = 2*100 + 1*50 = 250, bundlePrice=200
      expect(savings.amount).toBe(50);
      expect(savings.percentage).toBe(20);
    });
  });

  describe("refetch", () => {
    it("calls fetchBundles again on refetch", async () => {
      mockSanityFetch.mockResolvedValue([makeBundle()]);

      const { result } = renderHook(() => useSanityBundles());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const callsBefore = mockSanityFetch.mock.calls.length;

      await act(async () => {
        result.current.refetch();
      });

      expect(mockSanityFetch.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// useSanityBundle (single bundle by slug)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("useSanityBundle", () => {
  it("starts in loading state", () => {
    mockSanityFetch.mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useSanityBundle("starter-kit"));
    expect(result.current.loading).toBe(true);
    expect(result.current.bundle).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("fetches a single bundle by slug", async () => {
    const raw = {
      _id: "bundle-1",
      bundleName: "Starter Kit",
      slug: "starter-kit",
      products: [
        { product: makeProduct("p1", 100), quantity: 2, variant: null },
        { product: makeProduct("p2", 50), quantity: 1, variant: null },
      ],
      bundlePrice: 200,
      discountPercentage: null,
      savingsAmount: null,
      isActive: true,
      featured: true,
      badge: "hot",
      sortOrder: 1,
    };
    mockSanityFetch.mockResolvedValueOnce(raw);

    const { result } = renderHook(() => useSanityBundle("starter-kit"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.bundle).not.toBeNull();
    expect(result.current.bundle!.id).toBe("bundle-1");
    expect(result.current.bundle!.bundleName).toBe("Starter Kit");
    expect(result.current.bundle!.savingsAmount).toBe(50);
    expect(result.current.bundle!.discountPercentage).toBe(20);
    expect(result.current.error).toBeNull();
  });

  it("preserves provided savingsAmount and discountPercentage", async () => {
    const raw = {
      _id: "bundle-1",
      bundleName: "Kit",
      products: [
        { product: makeProduct("p1", 100), quantity: 1, variant: null },
      ],
      bundlePrice: 80,
      savingsAmount: 25,
      discountPercentage: 22,
      isActive: true,
      featured: false,
      sortOrder: 0,
    };
    mockSanityFetch.mockResolvedValueOnce(raw);

    const { result } = renderHook(() => useSanityBundle("kit"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.bundle!.savingsAmount).toBe(25);
    expect(result.current.bundle!.discountPercentage).toBe(22);
  });

  it("returns null when bundle not found", async () => {
    mockSanityFetch.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useSanityBundle("nonexistent"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.bundle).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("handles fetch error", async () => {
    mockSanityFetch.mockRejectedValueOnce(new Error("Connection lost"));

    const { result } = renderHook(() => useSanityBundle("starter-kit"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Connection lost");
    expect(result.current.bundle).toBeNull();
  });

  it("handles non-Error throw", async () => {
    mockSanityFetch.mockRejectedValueOnce("unexpected");

    const { result } = renderHook(() => useSanityBundle("starter-kit"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Failed to fetch bundle");
  });

  it("subscribes to real-time updates and unsubscribes on unmount", async () => {
    mockSanityFetch.mockResolvedValue({
      _id: "b1",
      bundleName: "Kit",
      products: [{ product: makeProduct("p1", 100), quantity: 1, variant: null }],
      bundlePrice: 80,
      savingsAmount: null,
      discountPercentage: null,
      isActive: true,
      featured: false,
      sortOrder: 0,
    });

    const { unmount } = renderHook(() => useSanityBundle("kit"));
    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalled());

    expect(mockSanityListen).toHaveBeenCalledWith(
      expect.stringContaining("productBundle")
    );

    unmount();
    expect(listenUnsubscribe).toHaveBeenCalled();
  });

  it("refetches on real-time mutation event", async () => {
    mockSanityFetch.mockResolvedValue({
      _id: "b1",
      bundleName: "Kit",
      products: [{ product: makeProduct("p1", 100), quantity: 1, variant: null }],
      bundlePrice: 80,
      savingsAmount: null,
      discountPercentage: null,
      isActive: true,
      featured: false,
      sortOrder: 0,
    });

    renderHook(() => useSanityBundle("kit"));
    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalledTimes(1));

    act(() => {
      listenCallback?.({ type: "mutation" });
    });

    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalledTimes(2));
  });
});
