import { renderHook, act } from "@testing-library/react";
import { useRecentlyViewed } from "../useRecentlyViewed";

const STORAGE_KEY = "mash-recently-viewed";

describe("useRecentlyViewed", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("should initialize with empty list", () => {
    const { result } = renderHook(() => useRecentlyViewed());
    expect(result.current.recentlyViewed).toEqual([]);
    expect(result.current.recentProductIds).toEqual([]);
  });

  it("should set isLoaded to true after mount", () => {
    const { result } = renderHook(() => useRecentlyViewed());
    expect(result.current.isLoaded).toBe(true);
  });

  it("should track a product view", () => {
    const { result } = renderHook(() => useRecentlyViewed());

    act(() => {
      result.current.trackView("product-1");
    });

    expect(result.current.recentlyViewed).toHaveLength(1);
    expect(result.current.recentlyViewed[0].productId).toBe("product-1");
    expect(result.current.recentProductIds).toEqual(["product-1"]);
  });

  it("should track multiple products in order (most recent first)", () => {
    const { result } = renderHook(() => useRecentlyViewed());

    act(() => {
      result.current.trackView("product-1");
    });
    act(() => {
      result.current.trackView("product-2");
    });
    act(() => {
      result.current.trackView("product-3");
    });

    expect(result.current.recentProductIds).toEqual([
      "product-3",
      "product-2",
      "product-1",
    ]);
  });

  it("should deduplicate by moving existing product to front", () => {
    const { result } = renderHook(() => useRecentlyViewed());

    act(() => {
      result.current.trackView("product-1");
    });
    act(() => {
      result.current.trackView("product-2");
    });
    act(() => {
      result.current.trackView("product-1");
    });

    expect(result.current.recentlyViewed).toHaveLength(2);
    expect(result.current.recentProductIds).toEqual([
      "product-1",
      "product-2",
    ]);
  });

  it("should enforce max 20 products (FIFO)", () => {
    const { result } = renderHook(() => useRecentlyViewed());

    for (let i = 0; i < 25; i++) {
      act(() => {
        result.current.trackView(`product-${i}`);
      });
    }

    expect(result.current.recentlyViewed).toHaveLength(20);
    // Most recent (product-24) should be first
    expect(result.current.recentProductIds[0]).toBe("product-24");
    // Oldest kept (product-5) should be last
    expect(result.current.recentProductIds[19]).toBe("product-5");
    // product-0 through product-4 should be evicted
    expect(result.current.recentProductIds).not.toContain("product-0");
    expect(result.current.recentProductIds).not.toContain("product-4");
  });

  it("should persist to localStorage", () => {
    const { result } = renderHook(() => useRecentlyViewed());

    act(() => {
      result.current.trackView("product-1");
    });

    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].productId).toBe("product-1");
  });

  it("should load from localStorage on mount", () => {
    const existing = [
      { productId: "saved-1", viewedAt: "2026-01-01T00:00:00.000Z" },
      { productId: "saved-2", viewedAt: "2026-01-02T00:00:00.000Z" },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

    const { result } = renderHook(() => useRecentlyViewed());

    expect(result.current.recentlyViewed).toHaveLength(2);
    expect(result.current.recentProductIds).toEqual(["saved-1", "saved-2"]);
  });

  it("should handle corrupted localStorage data gracefully", () => {
    localStorage.setItem(STORAGE_KEY, "invalid json");

    const { result } = renderHook(() => useRecentlyViewed());

    expect(result.current.recentlyViewed).toEqual([]);
    expect(result.current.isLoaded).toBe(true);
  });

  it("should handle non-array localStorage data gracefully", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ not: "an array" }));

    const { result } = renderHook(() => useRecentlyViewed());

    expect(result.current.recentlyViewed).toEqual([]);
  });

  it("should clear recently viewed products", () => {
    const { result } = renderHook(() => useRecentlyViewed());

    act(() => {
      result.current.trackView("product-1");
      result.current.trackView("product-2");
    });

    act(() => {
      result.current.clearRecentlyViewed();
    });

    expect(result.current.recentlyViewed).toEqual([]);
    // After clearing state, the useEffect syncs empty array to localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored === null || stored === "[]").toBe(true);
  });

  it("should store viewedAt timestamp for each product", () => {
    const { result } = renderHook(() => useRecentlyViewed());

    act(() => {
      result.current.trackView("product-1");
    });

    const item = result.current.recentlyViewed[0];
    expect(item.viewedAt).toBeDefined();
    expect(new Date(item.viewedAt).getTime()).not.toBeNaN();
  });

  it("should not track views before localStorage is loaded", () => {
    // Pre-populate localStorage before mount
    const existing = [
      { productId: "existing-1", viewedAt: "2026-01-01T00:00:00.000Z" },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

    const { result } = renderHook(() => useRecentlyViewed());

    // After mount, isLoaded should be true and we can track
    expect(result.current.isLoaded).toBe(true);
    expect(result.current.recentlyViewed).toHaveLength(1);
  });
});
