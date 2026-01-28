import { InventoryApi } from "@/lib/api/inventory";

type QueueItem = {
  id: string; // productId
  delta: number; // negative for decrement
  retries?: number;
  createdAt: number; // original enqueue time
  nextAttempt?: number; // timestamp when item is eligible for re-processing
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
    const now = Date.now();
    const item: QueueItem = { id: productId, delta, retries: 0, createdAt: now, nextAttempt: now };
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

    // Find first item whose nextAttempt (or createdAt) is <= now
    const now = Date.now();
    const idx = this.queue.findIndex((it) => (it.nextAttempt ?? it.createdAt) <= now);
    if (idx === -1) return; // nothing scheduled yet

    this.processing = true;

    const item = this.queue[idx];

    try {
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

        // Remove processed item
        this.queue.splice(idx, 1);
        this.persistQueue();
      } else {
        // If we couldn't fetch backend (offline), keep item queued for retry
        throw new Error("Backend unreachable");
      }
    } catch (error) {
      // Retry with backoff
      item.retries = (item.retries || 0) + 1;
      const maxRetries = 5;
      if (item.retries > maxRetries) {
        // Give up and remove, but warn with details (less noisy than console.error stack)
        console.warn(
          "[stock-sync] dropping item after max retries",
          { id: item.id, retries: item.retries, delta: item.delta, reason: (error && (error as any).message) || String(error) }
        );

        // Dispatch an event so other parts can react (optional)
        try {
          if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
            window.dispatchEvent(new CustomEvent('stock-sync:drop', { detail: { id: item.id } }));
          }
        } catch (e) {
          // ignore
        }

        this.queue.splice(idx, 1);
        this.persistQueue();
      } else {
        // Exponential backoff: schedule next attempt and move item to end
        const delay = Math.pow(2, item.retries) * 1000;
        item.nextAttempt = Date.now() + delay;
        // rotate item to end to avoid busy-looping on other items
        this.queue.splice(idx, 1);
        this.queue.push(item);
        this.persistQueue();
      }
    } finally {
      this.processing = false;
    }
  }
}

export const stockSync = new StockSync();

export default stockSync;