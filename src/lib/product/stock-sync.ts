import { InventoryApi } from "@/lib/api/inventory";

type QueueItem = {
  id: string; // productId
  delta: number; // negative for decrement
  retries?: number;
  createdAt: number;
};

const QUEUE_KEY = "mash-stock-sync-queue";
const STOCK_CACHE_KEY = "mash-stock-cache";

type Subscriber = (productId: string, stock: number) => void;

class StockSync {
  private queue: QueueItem[] = [];
  private stockCache: Record<string, number> = {};
  private subscribers: Subscriber[] = [];
  private processing = false;

  constructor() {
    this.loadQueue();
    this.loadCache();
    // Process periodically
    setInterval(() => this.processQueue(), 2000);
    // Listen for multi-tab changes
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (e) => {
        if (e.key === QUEUE_KEY) {
          this.loadQueue();
        } else if (e.key === STOCK_CACHE_KEY) {
          this.loadCache();
        }
      });
    }
  }

  private persistQueue() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      console.warn("[stock-sync] failed to persist queue", e);
    }
  }

  private persistCache() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STOCK_CACHE_KEY, JSON.stringify(this.stockCache));
    } catch (e) {
      console.warn("[stock-sync] failed to persist cache", e);
    }
  }

  private loadCache() {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(STOCK_CACHE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, number>;
      this.stockCache = parsed || {};
      // Emit all cached values so subscribers update
      Object.entries(this.stockCache).forEach(([id, qty]) => this.emit(id, qty));
    } catch (e) {
      console.warn("[stock-sync] failed to load cache", e);
      this.stockCache = {};
    }
  }

  private loadQueue() {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(QUEUE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as QueueItem[];
      this.queue = parsed || [];
    } catch (e) {
      console.warn("[stock-sync] failed to load queue", e);
      this.queue = [];
    }
  }

  enqueue(productId: string, delta: number) {
    const item: QueueItem = { id: productId, delta, retries: 0, createdAt: Date.now() };
    this.queue.push(item);
    this.persistQueue();
  }

  adjustLocalStock(productId: string, delta: number) {
    const prev = this.stockCache[productId] ?? 0;
    const next = Math.max(0, prev + delta);
    this.stockCache[productId] = next;
    this.emit(productId, next);
    this.persistCache();
    return next;
  }

  setLocalStock(productId: string, stock: number) {
    this.stockCache[productId] = stock;
    this.emit(productId, stock);
    this.persistCache();
  }

  getLocalStock(productId: string): number | undefined {
    return this.stockCache[productId];
  }

  subscribe(sub: Subscriber) {
    this.subscribers.push(sub);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== sub);
    };
  }

  private emit(productId: string, stock: number) {
    this.subscribers.forEach((s) => s(productId, stock));
  }

  async processQueue() {
    if (this.processing) return;
    if (this.queue.length === 0) return;

    this.processing = true;

    const item = this.queue[0];

    try {
      // Attempt to decrement on backend (server expects positive new quantity or delta depending on API)
      // We'll call InventoryApi.updateStock with the delta applied to current stock. To be conservative, request backend to decrement by -delta.
      const current = this.getLocalStock(item.id) ?? null;
      const desiredDelta = item.delta;
      // Backend API expects total quantity, so get current backend level first
      const backend = await InventoryApi.getInventory(item.id).catch(() => null);

      if (backend && backend.data) {
        const backendQty = backend.data.quantity;
        const newQty = Math.max(0, backendQty + desiredDelta);

        // Attempt authoritative update
        const res = await InventoryApi.updateStock(item.id, newQty).catch((err) => {
          throw err;
        });

        // On success, update local cache to backend authoritative value
        if (res && res.data) {
          this.setLocalStock(item.id, res.data.quantity);
        }
      } else {
        // If we couldn't fetch backend (offline), keep item queued for retry
        throw new Error("Backend unreachable");
      }

      // Remove processed item
      this.queue.shift();
      this.persistQueue();
    } catch (error) {
      // Retry with backoff
      item.retries = (item.retries || 0) + 1;
      const maxRetries = 5;
      if (item.retries > maxRetries) {
        // Give up and remove, but log
        console.error("[stock-sync] failed after retries, dropping item", item, error);
        this.queue.shift();
        this.persistQueue();
      } else {
        // Exponential backoff: move item to end and set delay by updating createdAt
        item.createdAt = Date.now() + Math.pow(2, item.retries) * 1000;
        // rotate
        this.queue.push(this.queue.shift() as QueueItem);
        this.persistQueue();
      }
    } finally {
      this.processing = false;
    }
  }
}

export const stockSync = new StockSync();

export default stockSync;