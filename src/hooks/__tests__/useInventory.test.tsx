/**
 * @jest-environment jsdom
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { useInventory } from "../useInventory";

// ---------- mock InventoryApi ----------
const mockGetInventory = jest.fn();
const mockUpdateStock = jest.fn();
const mockSetStockAlert = jest.fn();
const mockGetLowStockProducts = jest.fn();

jest.mock("@/lib/api/inventory", () => ({
  InventoryApi: {
    get getInventory() { return mockGetInventory; },
    get updateStock() { return mockUpdateStock; },
    get setStockAlert() { return mockSetStockAlert; },
    get getLowStockProducts() { return mockGetLowStockProducts; },
  },
}));

// ---------- helpers ----------
const sampleStockLevel = {
  productId: "p1",
  quantity: 50,
  threshold: 10,
  lastUpdated: "2025-01-01T00:00:00Z",
};

const sampleLowStockProducts = [
  { id: "p2", name: "Enoki", quantity: 3, threshold: 10, lastUpdated: "2025-01-01" },
  { id: "p3", name: "Maitake", quantity: 1, threshold: 5, lastUpdated: "2025-01-02" },
];

// ---------- tests ----------
describe("useInventory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- initial state ---
  it("should initialize with default state", () => {
    const { result } = renderHook(() => useInventory("p1"));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.stockLevel).toBeNull();
    expect(result.current.lowStockProducts).toEqual([]);
  });

  it("should initialize without productId", () => {
    const { result } = renderHook(() => useInventory());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.stockLevel).toBeNull();
  });

  // --- getInventory ---
  describe("getInventory", () => {
    it("should fetch inventory for productId", async () => {
      mockGetInventory.mockResolvedValueOnce({ data: sampleStockLevel });

      const { result } = renderHook(() => useInventory("p1"));

      await act(async () => {
        await result.current.getInventory();
      });

      expect(mockGetInventory).toHaveBeenCalledWith("p1");
      expect(result.current.stockLevel).toEqual(sampleStockLevel);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("should do nothing when productId is undefined", async () => {
      const { result } = renderHook(() => useInventory());

      await act(async () => {
        await result.current.getInventory();
      });

      expect(mockGetInventory).not.toHaveBeenCalled();
    });

    it("should handle Error object on failure", async () => {
      mockGetInventory.mockRejectedValueOnce(new Error("API down"));

      const { result } = renderHook(() => useInventory("p1"));

      await act(async () => {
        await result.current.getInventory();
      });

      expect(result.current.error).toBe("API down");
      expect(result.current.loading).toBe(false);
    });

    it("should handle non-Error rejection", async () => {
      mockGetInventory.mockRejectedValueOnce("string error");

      const { result } = renderHook(() => useInventory("p1"));

      await act(async () => {
        await result.current.getInventory();
      });

      expect(result.current.error).toBe("Failed to fetch inventory");
    });

    it("should set loading true during fetch", async () => {
      mockGetInventory.mockResolvedValueOnce({ data: sampleStockLevel });

      const { result } = renderHook(() => useInventory("p1"));

      // Before calling, loading is false (lazy hook - doesn't fetch on mount)
      expect(result.current.loading).toBe(false);

      await act(async () => {
        await result.current.getInventory();
      });

      // After completing, loading should be false again
      expect(result.current.loading).toBe(false);
      expect(result.current.stockLevel).toEqual(sampleStockLevel);
    });
  });

  // --- updateStock ---
  describe("updateStock", () => {
    it("should update stock and return new level", async () => {
      const updatedLevel = { ...sampleStockLevel, quantity: 100 };
      mockUpdateStock.mockResolvedValueOnce({ data: updatedLevel });

      const { result } = renderHook(() => useInventory("p1"));

      let returnValue: unknown;
      await act(async () => {
        returnValue = await result.current.updateStock(100);
      });

      expect(mockUpdateStock).toHaveBeenCalledWith("p1", 100);
      expect(result.current.stockLevel).toEqual(updatedLevel);
      expect(returnValue).toEqual(updatedLevel);
      expect(result.current.loading).toBe(false);
    });

    it("should do nothing when productId is undefined", async () => {
      const { result } = renderHook(() => useInventory());

      await act(async () => {
        await result.current.updateStock(50);
      });

      expect(mockUpdateStock).not.toHaveBeenCalled();
    });

    it("should handle error and rethrow", async () => {
      mockUpdateStock.mockRejectedValueOnce(new Error("Update failed"));

      const { result } = renderHook(() => useInventory("p1"));

      let thrownError: unknown;
      await act(async () => {
        try {
          await result.current.updateStock(100);
        } catch (e) {
          thrownError = e;
        }
      });

      expect(thrownError).toBeInstanceOf(Error);
      expect((thrownError as Error).message).toBe("Update failed");
      // Hook uses err.message for Error instances, not the fallback string
      expect(result.current.error).toBe("Update failed");
      expect(result.current.loading).toBe(false);
    });

    it("should handle non-Error rejection", async () => {
      mockUpdateStock.mockRejectedValueOnce(42);

      const { result } = renderHook(() => useInventory("p1"));

      let thrownError: unknown;
      await act(async () => {
        try {
          await result.current.updateStock(50);
        } catch (e) {
          thrownError = e;
        }
      });

      expect(thrownError).toBe(42);
      expect(result.current.error).toBe("Failed to update stock");
    });
  });

  // --- setStockAlert ---
  describe("setStockAlert", () => {
    const alertData = { threshold: 10, enabled: true, notifyEmail: true, notifySMS: false };
    const alertResponse = { productId: "p1", ...alertData };

    it("should set stock alert and return result", async () => {
      mockSetStockAlert.mockResolvedValueOnce({ data: alertResponse });

      const { result } = renderHook(() => useInventory("p1"));

      let returnValue: unknown;
      await act(async () => {
        returnValue = await result.current.setStockAlert(alertData);
      });

      expect(mockSetStockAlert).toHaveBeenCalledWith("p1", alertData);
      expect(returnValue).toEqual(alertResponse);
      expect(result.current.loading).toBe(false);
    });

    it("should do nothing when productId is undefined", async () => {
      const { result } = renderHook(() => useInventory());

      await act(async () => {
        await result.current.setStockAlert(alertData);
      });

      expect(mockSetStockAlert).not.toHaveBeenCalled();
    });

    it("should handle error and rethrow", async () => {
      mockSetStockAlert.mockRejectedValueOnce(new Error("Alert failed"));

      const { result } = renderHook(() => useInventory("p1"));

      let thrownError: unknown;
      await act(async () => {
        try {
          await result.current.setStockAlert(alertData);
        } catch (e) {
          thrownError = e;
        }
      });

      expect(thrownError).toBeInstanceOf(Error);
      expect((thrownError as Error).message).toBe("Alert failed");
      // Hook uses err.message for Error instances
      expect(result.current.error).toBe("Alert failed");
    });
  });

  // --- getLowStockProducts ---
  describe("getLowStockProducts", () => {
    it("should fetch low stock products", async () => {
      mockGetLowStockProducts.mockResolvedValueOnce({ data: sampleLowStockProducts });

      const { result } = renderHook(() => useInventory("p1"));

      let returnValue: unknown;
      await act(async () => {
        returnValue = await result.current.getLowStockProducts();
      });

      expect(mockGetLowStockProducts).toHaveBeenCalled();
      expect(result.current.lowStockProducts).toEqual(sampleLowStockProducts);
      expect(returnValue).toEqual(sampleLowStockProducts);
      expect(result.current.loading).toBe(false);
    });

    it("should work even without productId", async () => {
      mockGetLowStockProducts.mockResolvedValueOnce({ data: sampleLowStockProducts });

      const { result } = renderHook(() => useInventory());

      await act(async () => {
        await result.current.getLowStockProducts();
      });

      expect(result.current.lowStockProducts).toEqual(sampleLowStockProducts);
    });

    it("should handle error and rethrow", async () => {
      mockGetLowStockProducts.mockRejectedValueOnce(new Error("Fetch failed"));

      const { result } = renderHook(() => useInventory("p1"));

      let thrownError: unknown;
      await act(async () => {
        try {
          await result.current.getLowStockProducts();
        } catch (e) {
          thrownError = e;
        }
      });

      expect(thrownError).toBeInstanceOf(Error);
      expect((thrownError as Error).message).toBe("Fetch failed");
      // Hook uses err.message for Error instances
      expect(result.current.error).toBe("Fetch failed");
    });

    it("should return empty array when no low stock products", async () => {
      mockGetLowStockProducts.mockResolvedValueOnce({ data: [] });

      const { result } = renderHook(() => useInventory("p1"));

      await act(async () => {
        await result.current.getLowStockProducts();
      });

      expect(result.current.lowStockProducts).toEqual([]);
    });
  });

  // --- error clearing ---
  it("should clear error on new successful operation", async () => {
    mockGetInventory
      .mockRejectedValueOnce(new Error("First fail"))
      .mockResolvedValueOnce({ data: sampleStockLevel });

    const { result } = renderHook(() => useInventory("p1"));

    await act(async () => {
      await result.current.getInventory();
    });
    expect(result.current.error).toBe("First fail");

    await act(async () => {
      await result.current.getInventory();
    });
    expect(result.current.error).toBeNull();
    expect(result.current.stockLevel).toEqual(sampleStockLevel);
  });
});
