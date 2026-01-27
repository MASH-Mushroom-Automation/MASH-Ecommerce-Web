import { stockSync } from "../stock-sync";
import { InventoryApi } from "@/lib/api/inventory";

// Mock InventoryApi
jest.mock("@/lib/api/inventory", () => ({
  InventoryApi: {
    getInventory: jest.fn(),
    updateStock: jest.fn(),
  },
}));

describe("StockSync", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear private queue and cache
    (stockSync as any).queue = [];
    (stockSync as any).stockCache = {};
    (stockSync as any).subscribers = [];
    (stockSync as any).processing = false;
    localStorage.clear();
  });

  test("adjustLocalStock updates cache and emits change", () => {
    const sub = jest.fn();
    stockSync.subscribe(sub);

    stockSync.setLocalStock("p1", 10);
    expect(sub).toHaveBeenCalledWith("p1", 10);

    const newStock = stockSync.adjustLocalStock("p1", -2);
    expect(newStock).toBe(8);
    expect(sub).toHaveBeenCalledWith("p1", 8);
  });

  test("enqueue adds to queue and persists", () => {
    stockSync.enqueue("p1", -1);
    const queue = JSON.parse(localStorage.getItem("mash-stock-sync-queue") || "[]");
    expect(queue).toHaveLength(1);
    expect(queue[0].id).toBe("p1");
    expect(queue[0].delta).toBe(-1);
  });

  test("processQueue calls backend and dequeues on success", async () => {
    stockSync.enqueue("p1", -1);
    stockSync.setLocalStock("p1", 10);

    // Mock successful backend calls
    (InventoryApi.getInventory as jest.Mock).mockResolvedValue({ data: { quantity: 10 } });
    (InventoryApi.updateStock as jest.Mock).mockResolvedValue({ data: { quantity: 9 } });

    await stockSync.processQueue();

    const queue = JSON.parse(localStorage.getItem("mash-stock-sync-queue") || "[]");
    expect(queue).toHaveLength(0);
    expect(InventoryApi.updateStock).toHaveBeenCalledWith("p1", 9);
    // Should update local stock with authoritative value
    expect(stockSync.getLocalStock("p1")).toBe(9);
  });

  test("processQueue retries on failure with backoff", async () => {
    stockSync.enqueue("p1", -1);
    // Mock failure
    (InventoryApi.getInventory as jest.Mock).mockRejectedValue(new Error("Network Error"));

    const now = Date.now();
    await stockSync.processQueue();

    const queue = JSON.parse(localStorage.getItem("mash-stock-sync-queue") || "[]");
    expect(queue).toHaveLength(1);
    expect(queue[0].retries).toBe(1);
    expect(queue[0].createdAt).toBeGreaterThan(now); // pushed to future
  });

  test("processQueue drops item after max retries", async () => {
    const item = { id: "p1", delta: -1, retries: 5, createdAt: Date.now() };
    (stockSync as any).queue = [item];

    (InventoryApi.getInventory as jest.Mock).mockRejectedValue(new Error("Permanent Error"));

    await stockSync.processQueue();

    const queue = JSON.parse(localStorage.getItem("mash-stock-sync-queue") || "[]");
    expect(queue).toHaveLength(0);
  });
});
