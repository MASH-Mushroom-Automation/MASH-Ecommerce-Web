/**
 * useStockSync Hook Tests - COVERAGE-018
 *
 * Tests for real-time stock synchronization hook via stockSync singleton.
 *
 * Hook source: src/hooks/useStockSync.ts
 * Dependencies: stockSync (@/lib/product/stock-sync)
 *
 * Mock strategy:
 *   - stockSync: jest.mock with module-level mock fns + getter-based mock
 *     (export const pattern, same as InventoryApi)
 */

import { renderHook, act } from "@testing-library/react";

// Module-level mock functions for the stockSync singleton
const mockGetLocalStock = jest.fn();
const mockSetLocalStock = jest.fn();
const mockSubscribe = jest.fn();

jest.mock("@/lib/product/stock-sync", () => ({
  stockSync: {
    get getLocalStock() {
      return mockGetLocalStock;
    },
    get setLocalStock() {
      return mockSetLocalStock;
    },
    get subscribe() {
      return mockSubscribe;
    },
  },
}));

import useStockSync from "../useStockSync";

// ============================================================================
// Tests
// ============================================================================

describe("useStockSync", () => {
  let subscriberCallback: ((id: string, stock: number) => void) | null;
  const mockUnsubscribe = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    subscriberCallback = null;

    // subscribe captures the callback and returns unsubscribe
    mockSubscribe.mockImplementation(
      (cb: (id: string, stock: number) => void) => {
        subscriberCallback = cb;
        return mockUnsubscribe;
      }
    );
  });

  it("should use cached stock value if available", () => {
    mockGetLocalStock.mockReturnValue(42);

    const { result } = renderHook(() => useStockSync("prod-1", 10));

    // Cached value (42) takes priority over initial (10)
    expect(result.current).toBe(42);
  });

  it("should use initial value when no cache exists", () => {
    mockGetLocalStock.mockReturnValue(undefined);

    const { result } = renderHook(() => useStockSync("prod-1", 25));

    // No cache, uses initial value
    expect(result.current).toBe(25);
  });

  it("should use 0 when no cache and no initial value", () => {
    mockGetLocalStock.mockReturnValue(undefined);

    const { result } = renderHook(() => useStockSync("prod-1"));

    expect(result.current).toBe(0);
  });

  it("should subscribe to stock updates on mount", () => {
    mockGetLocalStock.mockReturnValue(10);

    renderHook(() => useStockSync("prod-1", 10));

    expect(mockSubscribe).toHaveBeenCalledTimes(1);
    expect(typeof subscriberCallback).toBe("function");
  });

  it("should update stock when subscription fires for matching product", () => {
    mockGetLocalStock.mockReturnValue(10);

    const { result } = renderHook(() => useStockSync("prod-1", 10));

    expect(result.current).toBe(10);

    // Simulate stock update
    act(() => {
      subscriberCallback?.("prod-1", 50);
    });

    expect(result.current).toBe(50);
  });

  it("should not update stock for different product ID", () => {
    mockGetLocalStock.mockReturnValue(10);

    const { result } = renderHook(() => useStockSync("prod-1", 10));

    // Update for a different product
    act(() => {
      subscriberCallback?.("prod-2", 99);
    });

    expect(result.current).toBe(10); // unchanged
  });

  it("should unsubscribe on unmount", () => {
    mockGetLocalStock.mockReturnValue(10);

    const { unmount } = renderHook(() => useStockSync("prod-1", 10));

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it("should set local stock when initial provided and cache is empty", () => {
    mockGetLocalStock.mockReturnValue(undefined);

    renderHook(() => useStockSync("prod-1", 15));

    expect(mockSetLocalStock).toHaveBeenCalledWith("prod-1", 15);
  });

  it("should not overwrite cache when cache already has value and initial matches", () => {
    mockGetLocalStock.mockReturnValue(15);

    renderHook(() => useStockSync("prod-1", 15));

    // setLocalStock should NOT be called when cached === initial
    expect(mockSetLocalStock).not.toHaveBeenCalled();
  });

  it("should hydration-fix: update cache when cached=0 and initial>0", () => {
    mockGetLocalStock.mockReturnValue(0);

    renderHook(() => useStockSync("prod-1", 20));

    // Hydration fix: cached=0 (default) but initial=20 (positive)
    expect(mockSetLocalStock).toHaveBeenCalledWith("prod-1", 20);
  });
});
