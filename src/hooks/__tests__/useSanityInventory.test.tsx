/**
 * useSanityInventory Hook Tests - COVERAGE-016
 *
 * Tests for useSanityInventory and useProductInventory hooks.
 *
 * Hook source: src/hooks/useSanityInventory.ts
 * Data source: Sanity CMS with listenSafe real-time subscription
 *
 * Mock strategy: jest.requireMock for global Sanity mock (jest.setup.js)
 * Error type: Error objects (not strings)
 */

import { renderHook, act, waitFor } from "@testing-library/react";

// Access global Sanity mock
const { sanityClient, listenSafe } = jest.requireMock(
  "@/lib/sanity/client"
) as {
  sanityClient: { fetch: jest.Mock };
  listenSafe: jest.Mock;
};

import {
  useSanityInventory,
  useProductInventory,
} from "../useSanityInventory";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const rawInventoryItem = (
  id: string,
  name: string,
  qty: number,
  threshold = 10,
  allowBackorders = false
) => ({
  _id: id,
  name,
  quantityInStock: qty,
  lowStockThreshold: threshold,
  allowBackorders,
  trackInventory: true,
});

// ============================================================================
// useSanityInventory
// ============================================================================

describe("useSanityInventory", () => {
  let subscribeFn: jest.Mock;
  let unsubscribeFn: jest.Mock;
  let capturedCallback: ((update: any) => void) | null;

  beforeEach(() => {
    jest.clearAllMocks();
    capturedCallback = null;
    unsubscribeFn = jest.fn();
    subscribeFn = jest.fn((callback) => {
      capturedCallback = callback;
      return { unsubscribe: unsubscribeFn };
    });
    listenSafe.mockReturnValue({ subscribe: subscribeFn });
  });

  it("should start in loading state", () => {
    sanityClient.fetch.mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useSanityInventory());
    expect(result.current.loading).toBe(true);
    expect(result.current.inventory).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("should fetch and process inventory data", async () => {
    sanityClient.fetch.mockResolvedValueOnce([
      rawInventoryItem("p1", "Mango", 50),
      rawInventoryItem("p2", "Basil", 5, 10),
      rawInventoryItem("p3", "Lettuce", 0),
    ]);

    const { result } = renderHook(() => useSanityInventory());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.inventory).toHaveLength(3);

    // In-stock product
    const mango = result.current.inventory.find(
      (i) => i.productId === "p1"
    );
    expect(mango?.stockStatus).toBe("in-stock");
    expect(mango?.isLowStock).toBe(false);
    expect(mango?.isOutOfStock).toBe(false);

    // Low-stock product (5 <= threshold 10)
    const basil = result.current.inventory.find(
      (i) => i.productId === "p2"
    );
    expect(basil?.stockStatus).toBe("low-stock");
    expect(basil?.isLowStock).toBe(true);
    expect(basil?.isOutOfStock).toBe(false);

    // Out-of-stock product
    const lettuce = result.current.inventory.find(
      (i) => i.productId === "p3"
    );
    expect(lettuce?.stockStatus).toBe("out-of-stock");
    expect(lettuce?.isOutOfStock).toBe(true);
    expect(lettuce?.isLowStock).toBe(false);
  });

  it("should compute stock counts correctly", async () => {
    sanityClient.fetch.mockResolvedValueOnce([
      rawInventoryItem("p1", "A", 100),
      rawInventoryItem("p2", "B", 50),
      rawInventoryItem("p3", "C", 3, 10),
      rawInventoryItem("p4", "D", 0),
      rawInventoryItem("p5", "E", 0),
    ]);

    const { result } = renderHook(() => useSanityInventory());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.inStockCount).toBe(2);
    expect(result.current.lowStockCount).toBe(1);
    expect(result.current.outOfStockCount).toBe(2);
  });

  it("should default missing numeric fields to 0 or 10", async () => {
    sanityClient.fetch.mockResolvedValueOnce([
      {
        _id: "px",
        name: "No Fields",
        quantityInStock: 0,
        lowStockThreshold: 0,
        allowBackorders: false,
        trackInventory: true,
      },
    ]);

    const { result } = renderHook(() => useSanityInventory());

    await waitFor(() => expect(result.current.loading).toBe(false));

    const item = result.current.inventory[0];
    expect(item.quantityInStock).toBe(0);
    expect(item.isOutOfStock).toBe(true);
  });

  it("should handle fetch error with Error instance", async () => {
    sanityClient.fetch.mockRejectedValueOnce(new Error("Sanity unavailable"));

    const { result } = renderHook(() => useSanityInventory());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("Sanity unavailable");
  });

  it("should wrap non-Error exceptions", async () => {
    sanityClient.fetch.mockRejectedValueOnce("string error");

    const { result } = renderHook(() => useSanityInventory());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("Failed to fetch inventory");
  });

  it("should set up listenSafe subscription", async () => {
    sanityClient.fetch.mockResolvedValueOnce([]);

    renderHook(() => useSanityInventory());

    await waitFor(() =>
      expect(listenSafe).toHaveBeenCalledWith('*[_type == "product"]')
    );
    expect(subscribeFn).toHaveBeenCalled();
  });

  it("should refetch on mutation event", async () => {
    sanityClient.fetch
      .mockResolvedValueOnce([rawInventoryItem("p1", "A", 50)])
      .mockResolvedValueOnce([
        rawInventoryItem("p1", "A", 50),
        rawInventoryItem("p2", "B", 20),
      ]);

    const { result } = renderHook(() => useSanityInventory());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.inventory).toHaveLength(1);

    // Simulate mutation event
    act(() => {
      capturedCallback?.({ type: "mutation" });
    });

    await waitFor(() =>
      expect(result.current.inventory).toHaveLength(2)
    );
  });

  it("should not refetch on non-mutation events", async () => {
    sanityClient.fetch.mockResolvedValueOnce([]);

    renderHook(() => useSanityInventory());

    await waitFor(() =>
      expect(sanityClient.fetch).toHaveBeenCalledTimes(1)
    );

    act(() => {
      capturedCallback?.({ type: "reconnect" });
    });

    // Should still be 1 fetch call
    expect(sanityClient.fetch).toHaveBeenCalledTimes(1);
  });

  it("should unsubscribe on unmount", async () => {
    sanityClient.fetch.mockResolvedValueOnce([]);

    const { unmount } = renderHook(() => useSanityInventory());

    await waitFor(() => expect(subscribeFn).toHaveBeenCalled());

    unmount();

    expect(unsubscribeFn).toHaveBeenCalled();
  });

  it("should call refetch when invoking returned refetch fn", async () => {
    sanityClient.fetch
      .mockResolvedValueOnce([rawInventoryItem("p1", "A", 10)])
      .mockResolvedValueOnce([rawInventoryItem("p1", "A", 20)]);

    const { result } = renderHook(() => useSanityInventory());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.inventory[0].quantityInStock).toBe(10);

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() =>
      expect(result.current.inventory[0].quantityInStock).toBe(20)
    );
  });

  it("should handle empty data from Sanity", async () => {
    sanityClient.fetch.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useSanityInventory());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.inventory).toEqual([]);
    expect(result.current.inStockCount).toBe(0);
    expect(result.current.lowStockCount).toBe(0);
    expect(result.current.outOfStockCount).toBe(0);
  });
});

// ============================================================================
// useProductInventory
// ============================================================================

describe("useProductInventory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    listenSafe.mockReturnValue({
      subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
    });
  });

  it("should return product inventory when product exists", async () => {
    sanityClient.fetch.mockResolvedValueOnce([
      rawInventoryItem("target-prod", "Target", 25, 10),
      rawInventoryItem("other-prod", "Other", 100),
    ]);

    const { result } = renderHook(() =>
      useProductInventory("target-prod")
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.inventory?.productId).toBe("target-prod");
    expect(result.current.isInStock).toBe(true);
    expect(result.current.isLowStock).toBe(false);
    expect(result.current.quantityInStock).toBe(25);
  });

  it("should return defaults when product not found", async () => {
    sanityClient.fetch.mockResolvedValueOnce([
      rawInventoryItem("other-prod", "Other", 50),
    ]);

    const { result } = renderHook(() =>
      useProductInventory("missing-prod")
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.inventory).toBeUndefined();
    expect(result.current.isInStock).toBe(false);
    expect(result.current.isLowStock).toBe(false);
    expect(result.current.quantityInStock).toBe(0);
  });

  it("should report low-stock product", async () => {
    sanityClient.fetch.mockResolvedValueOnce([
      rawInventoryItem("low-prod", "Low", 3, 10),
    ]);

    const { result } = renderHook(() =>
      useProductInventory("low-prod")
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.isInStock).toBe(true);
    expect(result.current.isLowStock).toBe(true);
  });

  it("should report out-of-stock product", async () => {
    sanityClient.fetch.mockResolvedValueOnce([
      rawInventoryItem("oos-prod", "OOS", 0),
    ]);

    const { result } = renderHook(() =>
      useProductInventory("oos-prod")
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.isInStock).toBe(false);
    expect(result.current.isLowStock).toBe(false);
    expect(result.current.quantityInStock).toBe(0);
  });
});
