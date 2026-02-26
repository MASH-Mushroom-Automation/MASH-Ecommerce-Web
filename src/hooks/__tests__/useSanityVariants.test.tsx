/**
 * Tests for src/hooks/useSanityVariants.ts
 *
 * Hooks:  useSanityVariants, useVariantOptions
 *
 * useSanityVariants fetches product variants from Sanity, computes a
 * VariantSummary (prices, sizes, colors, weights), auto-selects a
 * default variant, and subscribes to real-time updates via listenSafe.
 *
 * useVariantOptions is a thin wrapper extracting option arrays from
 * useSanityVariants.
 */

import { renderHook, waitFor, act } from "@testing-library/react";

// Grab global Sanity mocks (set up in jest.setup.js)
const { sanityClient, listenSafe } = jest.requireMock("@/lib/sanity/client");

import {
  useSanityVariants,
  useVariantOptions,
  type ProductVariant,
} from "../useSanityVariants";

// ─── Helpers ──────────────────────────────────────────────────

const makeVariantResponse = (
  id: string,
  overrides: Partial<Record<string, unknown>> = {}
) => ({
  _id: id,
  productId: "product-1",
  variantName: `Variant ${id}`,
  sku: `SKU-${id}`,
  size: undefined,
  color: undefined,
  weight: undefined,
  customAttribute: undefined,
  price: 100,
  compareAtPrice: undefined,
  stockQuantity: 10,
  lowStockThreshold: 3,
  images: [],
  isAvailable: true,
  isDefault: false,
  sortOrder: 0,
  ...overrides,
});

const mockVariantsData = [
  makeVariantResponse("v1", {
    variantName: "Small Red",
    size: "Small",
    color: "Red",
    price: 100,
    stockQuantity: 10,
    isDefault: true,
    sortOrder: 1,
  }),
  makeVariantResponse("v2", {
    variantName: "Medium Blue",
    size: "Medium",
    color: "Blue",
    price: 200,
    stockQuantity: 5,
    lowStockThreshold: 5,
    sortOrder: 2,
  }),
  makeVariantResponse("v3", {
    variantName: "Large Red",
    size: "Large",
    color: "Red",
    weight: "500g",
    price: 300,
    stockQuantity: 0,
    sortOrder: 3,
  }),
];

// ─── Setup ────────────────────────────────────────────────────

let subscribeFn: jest.Mock;
const mockUnsubscribe = jest.fn();

beforeEach(() => {
  sanityClient.fetch.mockClear();
  listenSafe.mockClear();
  mockUnsubscribe.mockClear();

  // Default: resolve with empty array
  sanityClient.fetch.mockResolvedValue([]);

  subscribeFn = jest.fn(() => ({ unsubscribe: mockUnsubscribe }));
  listenSafe.mockReturnValue({ subscribe: subscribeFn });
});

// ─── useSanityVariants ────────────────────────────────────────

describe("useSanityVariants", () => {
  it("starts in loading state", () => {
    sanityClient.fetch.mockReturnValueOnce(new Promise(() => {}));

    const { result } = renderHook(() => useSanityVariants("product-1"));

    expect(result.current.loading).toBe(true);
    expect(result.current.variants).toEqual([]);
    expect(result.current.summary).toBeNull();
    expect(result.current.selectedVariant).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("fetches and transforms variants", async () => {
    sanityClient.fetch.mockResolvedValue(mockVariantsData);

    const { result } = renderHook(() => useSanityVariants("product-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.variants).toHaveLength(3);
    // _id -> id transformation
    expect(result.current.variants[0].id).toBe("v1");
    expect(result.current.variants[0].variantName).toBe("Small Red");
    expect(result.current.variants[0].size).toBe("Small");
    expect(result.current.variants[0].color).toBe("Red");
    expect(result.current.error).toBeNull();
  });

  it("computes variant summary correctly", async () => {
    sanityClient.fetch.mockResolvedValue(mockVariantsData);

    const { result } = renderHook(() => useSanityVariants("product-1"));

    await waitFor(() => expect(result.current.summary).not.toBeNull());

    const summary = result.current.summary!;
    expect(summary.totalVariants).toBe(3);
    expect(summary.availableVariants).toBe(2); // v1 (10), v2 (5); v3 has 0
    expect(summary.outOfStockVariants).toBe(1); // v3
    expect(summary.lowestPrice).toBe(100);
    expect(summary.highestPrice).toBe(300);
    expect(summary.priceRange).toBe("₱100.00 - ₱300.00");
    expect(summary.sizes).toEqual(["Small", "Medium", "Large"]);
    expect(summary.colors).toEqual(["Red", "Blue"]);
    expect(summary.weights).toEqual(["500g"]);
  });

  it("displays single price when lowest equals highest", async () => {
    const samePrice = [
      makeVariantResponse("v1", { price: 150, stockQuantity: 5 }),
      makeVariantResponse("v2", { price: 150, stockQuantity: 3 }),
    ];
    sanityClient.fetch.mockResolvedValue(samePrice);

    const { result } = renderHook(() => useSanityVariants("product-1"));

    await waitFor(() => expect(result.current.summary).not.toBeNull());
    expect(result.current.summary!.priceRange).toBe("₱150.00");
  });

  it("auto-selects default variant (isDefault=true)", async () => {
    sanityClient.fetch.mockResolvedValue(mockVariantsData);

    const { result } = renderHook(() => useSanityVariants("product-1"));

    await waitFor(() => expect(result.current.selectedVariant).not.toBeNull());
    expect(result.current.selectedVariant!.id).toBe("v1");
    expect(result.current.selectedVariant!.isDefault).toBe(true);
  });

  it("auto-selects first available variant when no default", async () => {
    const noDefault = [
      makeVariantResponse("v1", { stockQuantity: 0, isDefault: false }),
      makeVariantResponse("v2", { stockQuantity: 5, isDefault: false }),
    ];
    sanityClient.fetch.mockResolvedValue(noDefault);

    const { result } = renderHook(() => useSanityVariants("product-1"));

    await waitFor(() => expect(result.current.selectedVariant).not.toBeNull());
    expect(result.current.selectedVariant!.id).toBe("v2");
  });

  it("sets summary to null when no variants", async () => {
    sanityClient.fetch.mockResolvedValue([]);

    const { result } = renderHook(() => useSanityVariants("product-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.summary).toBeNull();
    expect(result.current.variants).toEqual([]);
  });

  it("handles fetch errors", async () => {
    sanityClient.fetch.mockRejectedValue(new Error("Sanity error"));

    const { result } = renderHook(() => useSanityVariants("product-1"));

    await waitFor(() => expect(result.current.error).toBe("Sanity error"));
    expect(result.current.loading).toBe(false);
    expect(result.current.variants).toEqual([]);
  });

  it("handles non-Error fetch failures", async () => {
    sanityClient.fetch.mockRejectedValue("string error");

    const { result } = renderHook(() => useSanityVariants("product-1"));

    await waitFor(() =>
      expect(result.current.error).toBe("Failed to fetch variants")
    );
  });

  // ── Real-time subscription ──────────────────────────────────

  it("subscribes to real-time variant updates via listenSafe", async () => {
    sanityClient.fetch.mockResolvedValue([]);

    const { result } = renderHook(() => useSanityVariants("product-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(listenSafe).toHaveBeenCalledWith(
      expect.stringContaining("productVariant")
    );
    expect(subscribeFn).toHaveBeenCalled();
  });

  it("refetches on mutation update", async () => {
    sanityClient.fetch.mockResolvedValue([]);

    renderHook(() => useSanityVariants("product-1"));

    await waitFor(() => expect(subscribeFn).toHaveBeenCalled());

    // Simulate mutation event
    const callback = subscribeFn.mock.calls[0][0];
    sanityClient.fetch.mockResolvedValue(mockVariantsData);

    act(() => callback({ type: "mutation" }));

    await waitFor(() =>
      expect(sanityClient.fetch).toHaveBeenCalledTimes(2)
    );
  });

  it("unsubscribes on unmount", async () => {
    sanityClient.fetch.mockResolvedValue([]);

    const { unmount } = renderHook(() => useSanityVariants("product-1"));

    await waitFor(() => expect(subscribeFn).toHaveBeenCalled());
    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  // ── selectVariant ───────────────────────────────────────────

  it("selectVariant matches by criteria", async () => {
    sanityClient.fetch.mockResolvedValue(mockVariantsData);

    const { result } = renderHook(() => useSanityVariants("product-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.selectVariant({ size: "Medium", color: "Blue" });
    });

    expect(result.current.selectedVariant!.id).toBe("v2");
  });

  it("selectVariant does not change selection when no match", async () => {
    sanityClient.fetch.mockResolvedValue(mockVariantsData);

    const { result } = renderHook(() => useSanityVariants("product-1"));

    await waitFor(() => expect(result.current.selectedVariant).not.toBeNull());
    const original = result.current.selectedVariant;

    act(() => {
      result.current.selectVariant({ size: "XXL" });
    });

    // selectedVariant unchanged
    expect(result.current.selectedVariant).toBe(original);
  });

  it("selectVariant matches partial criteria", async () => {
    sanityClient.fetch.mockResolvedValue(mockVariantsData);

    const { result } = renderHook(() => useSanityVariants("product-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.selectVariant({ color: "Blue" });
    });

    expect(result.current.selectedVariant!.id).toBe("v2");
  });

  // ── selectVariantById ───────────────────────────────────────

  it("selectVariantById selects correct variant", async () => {
    sanityClient.fetch.mockResolvedValue(mockVariantsData);

    const { result } = renderHook(() => useSanityVariants("product-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.selectVariantById("v3");
    });

    expect(result.current.selectedVariant!.id).toBe("v3");
  });

  it("selectVariantById does nothing with unknown id", async () => {
    sanityClient.fetch.mockResolvedValue(mockVariantsData);

    const { result } = renderHook(() => useSanityVariants("product-1"));

    await waitFor(() => expect(result.current.selectedVariant).not.toBeNull());
    const original = result.current.selectedVariant;

    act(() => {
      result.current.selectVariantById("unknown-id");
    });

    expect(result.current.selectedVariant).toBe(original);
  });

  // ── Stock utilities ─────────────────────────────────────────

  it("isInStock returns true when stockQuantity > 0", async () => {
    sanityClient.fetch.mockResolvedValue(mockVariantsData);

    const { result } = renderHook(() => useSanityVariants("product-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    const inStockVariant = result.current.variants.find((v) => v.id === "v1")!;
    const outOfStock = result.current.variants.find((v) => v.id === "v3")!;

    expect(result.current.isInStock(inStockVariant)).toBe(true);
    expect(result.current.isInStock(outOfStock)).toBe(false);
  });

  it("isLowStock returns true when quantity > 0 and <= threshold", async () => {
    sanityClient.fetch.mockResolvedValue(mockVariantsData);

    const { result } = renderHook(() => useSanityVariants("product-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    // v2 has stockQuantity=5, lowStockThreshold=5 => low stock
    const lowStock = result.current.variants.find((v) => v.id === "v2")!;
    expect(result.current.isLowStock(lowStock)).toBe(true);

    // v1 has stockQuantity=10, lowStockThreshold=3 => not low stock
    const normalStock = result.current.variants.find((v) => v.id === "v1")!;
    expect(result.current.isLowStock(normalStock)).toBe(false);

    // v3 has stockQuantity=0 => not low stock (out of stock)
    const outOfStock = result.current.variants.find((v) => v.id === "v3")!;
    expect(result.current.isLowStock(outOfStock)).toBe(false);
  });

  it("getStockStatus returns correct status strings", async () => {
    sanityClient.fetch.mockResolvedValue(mockVariantsData);

    const { result } = renderHook(() => useSanityVariants("product-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    const v1 = result.current.variants.find((v) => v.id === "v1")!;
    const v2 = result.current.variants.find((v) => v.id === "v2")!;
    const v3 = result.current.variants.find((v) => v.id === "v3")!;

    expect(result.current.getStockStatus(v1)).toBe("in-stock");
    expect(result.current.getStockStatus(v2)).toBe("low-stock");
    expect(result.current.getStockStatus(v3)).toBe("out-of-stock");
  });

  // ── refetch ─────────────────────────────────────────────────

  it("refetch re-fetches data from Sanity", async () => {
    sanityClient.fetch.mockResolvedValue([]);

    const { result } = renderHook(() => useSanityVariants("product-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    sanityClient.fetch.mockResolvedValue(mockVariantsData);

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.variants).toHaveLength(3);
  });
});

// ─── useVariantOptions ────────────────────────────────────────

describe("useVariantOptions", () => {
  beforeEach(() => {
    sanityClient.fetch.mockClear();
    listenSafe.mockClear();
  });

  it("extracts sizes, colors, and weights from variants", async () => {
    sanityClient.fetch.mockResolvedValue(mockVariantsData);

    const { result } = renderHook(() => useVariantOptions("product-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.options.sizes).toEqual(["Small", "Medium", "Large"]);
    expect(result.current.options.colors).toEqual(["Red", "Blue"]);
    expect(result.current.options.weights).toEqual(["500g"]);
  });

  it("returns empty arrays when no variants", async () => {
    sanityClient.fetch.mockResolvedValue([]);

    const { result } = renderHook(() => useVariantOptions("product-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.options.sizes).toEqual([]);
    expect(result.current.options.colors).toEqual([]);
    expect(result.current.options.weights).toEqual([]);
  });

  it("passes loading state through", () => {
    sanityClient.fetch.mockReturnValueOnce(new Promise(() => {}));

    const { result } = renderHook(() => useVariantOptions("product-1"));

    expect(result.current.loading).toBe(true);
  });
});
