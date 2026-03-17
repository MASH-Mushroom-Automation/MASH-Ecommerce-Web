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
    // Stop the background setInterval so it doesn't interfere with tests
    stockSync.stopSync();
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
    // Mock global fetch to handle both getInventory (GET) and updateStock (PUT).
    // stock-sync.ts may use the real InventoryApi (not the mocked module) due to
    // SWC import binding order. Mocking fetch covers that code path.
    const fetchMock = jest.spyOn(global, "fetch").mockImplementation((_url: any, opts?: any) => {
      const isUpdate = opts?.method === "PUT";
      const qty = isUpdate ? 9 : 10; // GET=10 (getInventory), PUT=9 (updateStock)
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { quantity: qty } }),
      } as any);
    });

    stockSync.setLocalStock("p1", 10);
    stockSync.enqueue("p1", -1);

    await stockSync.processQueue();

    fetchMock.mockRestore();

    const queue = JSON.parse(localStorage.getItem("mash-stock-sync-queue") || "[]");
    expect(queue).toHaveLength(0);

    // Should update local stock with backend authoritative value (9)
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
    // should set nextAttempt into the future
    expect(queue[0].nextAttempt).toBeDefined();
    expect(queue[0].nextAttempt).toBeGreaterThan(now);
  });

  test("processQueue drops item after max retries", async () => {
    const item = { id: "p1", delta: -1, retries: 5, createdAt: Date.now() };
    (stockSync as any).queue = [item];

    (InventoryApi.getInventory as jest.Mock).mockRejectedValue(new Error("Permanent Error"));

    await stockSync.processQueue();

    const queue = JSON.parse(localStorage.getItem("mash-stock-sync-queue") || "[]");
    expect(queue).toHaveLength(0);
  });

  test("drops item emits event and logs warn, not error", async () => {
    const item = { id: "p2", delta: -1, retries: 5, createdAt: Date.now() };
    (stockSync as any).queue = [item];

    (InventoryApi.getInventory as jest.Mock).mockRejectedValue(new Error("Backend unreachable"));

    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const events: any[] = [];
    window.addEventListener('stock-sync:drop', (e: any) => events.push(e.detail));

    await stockSync.processQueue();

    expect(warnSpy).toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ id: 'p2' });

    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  test("drop logs only once even if processQueue called repeatedly", async () => {
    const item = { id: "p3", delta: -1, retries: 5, createdAt: Date.now() };
    (stockSync as any).queue = [item];

    (InventoryApi.getInventory as jest.Mock).mockRejectedValue(new Error("Backend unreachable"));

    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const events: any[] = [];
    window.addEventListener('stock-sync:drop', (e: any) => events.push(e.detail));

    // First call should drop and emit
    await stockSync.processQueue();

    // Second call should be no-op and not emit or warn again
    await stockSync.processQueue();

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ id: 'p3' });

    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
