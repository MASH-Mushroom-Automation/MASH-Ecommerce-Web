/**
 * Tests for src/lib/api/inventory.ts
 * Inventory API client - uses raw fetch directly
 */
import { InventoryApi } from "../inventory";

// Setup fetch mock
const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

function mockJsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  };
}

describe("InventoryApi", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("getInventory", () => {
    it("fetches inventory for a product", async () => {
      const mockData = { success: true, data: { productId: "p1", quantity: 50, threshold: 10, lastUpdated: "2025-01-01" } };
      mockFetch.mockResolvedValueOnce(mockJsonResponse(mockData));

      const result = await InventoryApi.getInventory("p1");
      expect(mockFetch).toHaveBeenCalledWith("/api/products/p1/inventory");
      expect(result).toEqual(mockData);
    });

    it("throws when fetch fails", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
      await expect(InventoryApi.getInventory("p1")).rejects.toThrow("Failed to fetch inventory");
    });
  });

  describe("updateStock", () => {
    it("sends PUT with quantity to correct URL", async () => {
      const mockData = { success: true, data: { productId: "p1", quantity: 100, threshold: 10, lastUpdated: "2025-01-01" } };
      mockFetch.mockResolvedValueOnce(mockJsonResponse(mockData));

      const result = await InventoryApi.updateStock("p1", 100);
      expect(mockFetch).toHaveBeenCalledWith("/api/products/p1/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: 100 }),
      });
      expect(result).toEqual(mockData);
    });

    it("throws when update fails", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 400 });
      await expect(InventoryApi.updateStock("p1", -5)).rejects.toThrow("Failed to update stock");
    });
  });

  describe("setStockAlert", () => {
    it("sends POST with alert config", async () => {
      const alertConfig = { threshold: 5, enabled: true, notifyEmail: true, notifySMS: false };
      const mockData = { success: true, data: { productId: "p1", ...alertConfig } };
      mockFetch.mockResolvedValueOnce(mockJsonResponse(mockData));

      const result = await InventoryApi.setStockAlert("p1", alertConfig);
      expect(mockFetch).toHaveBeenCalledWith("/api/products/p1/stock-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alertConfig),
      });
      expect(result).toEqual(mockData);
    });

    it("throws when setting alert fails", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
      await expect(InventoryApi.setStockAlert("p1", { enabled: true })).rejects.toThrow("Failed to set stock alert");
    });
  });

  describe("getLowStockProducts", () => {
    it("fetches low stock products", async () => {
      const mockData = {
        success: true,
        data: [
          { id: "p1", name: "Product 1", quantity: 2, threshold: 5, lastUpdated: "2025-01-01" },
          { id: "p2", name: "Product 2", quantity: 1, threshold: 10, lastUpdated: "2025-01-02" },
        ],
      };
      mockFetch.mockResolvedValueOnce(mockJsonResponse(mockData));

      const result = await InventoryApi.getLowStockProducts();
      expect(mockFetch).toHaveBeenCalledWith("/api/inventory/low-stock");
      expect(result.data).toHaveLength(2);
    });

    it("throws when fetch fails", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 503 });
      await expect(InventoryApi.getLowStockProducts()).rejects.toThrow("Failed to fetch low stock products");
    });
  });
});
