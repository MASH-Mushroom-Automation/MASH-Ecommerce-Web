/**
 * Tests for src/hooks/useSanityOrders.ts
 *
 * Hooks:  useSanityOrders, useSanityOrder, useOrderStatistics
 *
 * Uses sanityClient.fetch and listenSafe (globally mocked in jest.setup.js).
 * Error type: string | null. Loading uses `loading` state name.
 */

import { renderHook, waitFor, act } from "@testing-library/react";

// Access the global sanity mocks
const mockSanityFetch = jest.requireMock("@/lib/sanity/client").sanityClient
  .fetch as jest.Mock;
const mockListenSafe = jest.requireMock("@/lib/sanity/client")
  .listenSafe as jest.Mock;

import {
  useSanityOrders,
  useSanityOrder,
  useOrderStatistics,
} from "../useSanityOrders";

// ─── Helpers ──────────────────────────────────────────────────

const makeOrder = (id: string, overrides: Record<string, unknown> = {}) => ({
  _id: id,
  orderNumber: `ORD-${id}`,
  orderDate: "2025-06-01T10:00:00Z",
  customerName: `Customer ${id}`,
  customerEmail: `cust-${id}@test.com`,
  customerPhone: "+639171234567",
  customerId: `user-${id}`,
  items: [
    {
      quantity: 2,
      price: 250,
      discount: 0,
      subtotal: 500,
      product: { _id: "prod-1", name: "Lion's Mane", image: "https://img.test/p.jpg" },
      variant: null,
    },
  ],
  subtotal: 500,
  shippingFee: 50,
  tax: 0,
  discount: 0,
  total: 550,
  shippingAddress: {
    fullAddress: "123 Main St",
    city: "Manila",
    province: "Metro Manila",
    postalCode: "1000",
    country: "Philippines",
  },
  paymentMethod: "cod",
  paymentStatus: "paid",
  paymentReference: null,
  status: "pending",
  statusHistory: [],
  trackingNumber: null,
  carrier: null,
  estimatedDelivery: null,
  customerNotes: null,
  internalNotes: null,
  couponCode: null,
  source: "web",
  isPriority: false,
  ...overrides,
});

let unsubscribeFn: jest.Mock;

beforeEach(() => {
  mockSanityFetch.mockReset();
  mockSanityFetch.mockResolvedValue([]);

  unsubscribeFn = jest.fn();
  mockListenSafe.mockReturnValue({
    subscribe: jest.fn(() => ({ unsubscribe: unsubscribeFn })),
  });
});

// ═════════════════════════════════════════════════════════════════
// useSanityOrders
// ═════════════════════════════════════════════════════════════════

describe("useSanityOrders", () => {
  it("should start in loading state", () => {
    const { result } = renderHook(() => useSanityOrders());
    expect(result.current.loading).toBe(true);
  });

  it("should fetch and transform orders", async () => {
    const data = [makeOrder("001"), makeOrder("002")];
    mockSanityFetch.mockResolvedValueOnce(data);

    const { result } = renderHook(() => useSanityOrders());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.orders).toHaveLength(2);
    expect(result.current.orders[0].id).toBe("001");
    expect(result.current.orders[0].orderNumber).toBe("ORD-001");
    expect(result.current.error).toBeNull();
  });

  it("should calculate order summary", async () => {
    const data = [
      makeOrder("001", { status: "pending", paymentStatus: "paid", total: 100, isPriority: false }),
      makeOrder("002", { status: "processing", paymentStatus: "paid", total: 200, isPriority: true }),
      makeOrder("003", { status: "shipped", paymentStatus: "paid", total: 300, isPriority: false }),
      makeOrder("004", { status: "delivered", paymentStatus: "paid", total: 400, isPriority: false }),
      makeOrder("005", { status: "cancelled", paymentStatus: "unpaid", total: 500, isPriority: false }),
    ];
    mockSanityFetch.mockResolvedValueOnce(data);

    const { result } = renderHook(() => useSanityOrders());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.summary).not.toBeNull();
    expect(result.current.summary!.totalOrders).toBe(5);
    expect(result.current.summary!.pendingOrders).toBe(1);
    expect(result.current.summary!.processingOrders).toBe(1);
    expect(result.current.summary!.shippedOrders).toBe(1);
    expect(result.current.summary!.deliveredOrders).toBe(1);
    expect(result.current.summary!.cancelledOrders).toBe(1);
    expect(result.current.summary!.priorityOrders).toBe(1);
    // Revenue: only non-cancelled + paid = 100+200+300+400 = 1000
    expect(result.current.summary!.totalRevenue).toBe(1000);
  });

  it("should set summary to null for empty results", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useSanityOrders());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.summary).toBeNull();
  });

  it("should handle error", async () => {
    mockSanityFetch.mockRejectedValueOnce(new Error("Sanity fetch failed"));

    const { result } = renderHook(() => useSanityOrders());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Sanity fetch failed");
    expect(result.current.orders).toEqual([]);
  });

  it("should handle non-Error thrown", async () => {
    mockSanityFetch.mockRejectedValueOnce("string error");

    const { result } = renderHook(() => useSanityOrders());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Failed to fetch orders");
  });

  it("should subscribe to real-time updates via listenSafe", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useSanityOrders());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockListenSafe).toHaveBeenCalledWith(expect.stringContaining("order"));
  });

  it("should unsubscribe on unmount", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    const { result, unmount } = renderHook(() => useSanityOrders());

    await waitFor(() => expect(result.current.loading).toBe(false));
    unmount();
    expect(unsubscribeFn).toHaveBeenCalled();
  });

  it("should apply status filter", async () => {
    mockSanityFetch.mockResolvedValueOnce([makeOrder("001", { status: "processing" })]);

    const { result } = renderHook(() =>
      useSanityOrders({ status: "processing" })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockSanityFetch).toHaveBeenCalledWith(
      expect.stringContaining('status == "processing"')
    );
  });

  it("should apply paymentStatus filter", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    renderHook(() => useSanityOrders({ paymentStatus: "paid" }));

    await waitFor(() =>
      expect(mockSanityFetch).toHaveBeenCalledWith(
        expect.stringContaining('paymentStatus == "paid"')
      )
    );
  });

  it("should apply date range filters", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    renderHook(() =>
      useSanityOrders({ startDate: "2025-01-01", endDate: "2025-12-31" })
    );

    await waitFor(() => {
      const query = mockSanityFetch.mock.calls[0][0];
      expect(query).toContain('orderDate >= "2025-01-01"');
      expect(query).toContain('orderDate <= "2025-12-31"');
    });
  });

  it("should apply customerId filter", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    renderHook(() => useSanityOrders({ customerId: "user-123" }));

    await waitFor(() =>
      expect(mockSanityFetch).toHaveBeenCalledWith(
        expect.stringContaining('customerId == "user-123"')
      )
    );
  });

  it("should apply isPriority filter", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    renderHook(() => useSanityOrders({ isPriority: true }));

    await waitFor(() =>
      expect(mockSanityFetch).toHaveBeenCalledWith(
        expect.stringContaining("isPriority == true")
      )
    );
  });

  // -------------------------------------------------------------------
  // Utility methods
  // -------------------------------------------------------------------

  it("getOrdersByStatus should filter orders", async () => {
    const data = [
      makeOrder("001", { status: "pending" }),
      makeOrder("002", { status: "delivered" }),
      makeOrder("003", { status: "pending" }),
    ];
    mockSanityFetch.mockResolvedValueOnce(data);

    const { result } = renderHook(() => useSanityOrders());

    await waitFor(() => expect(result.current.loading).toBe(false));
    const pending = result.current.getOrdersByStatus("pending");
    expect(pending).toHaveLength(2);
  });

  it("getPriorityOrders should return priority orders", async () => {
    const data = [
      makeOrder("001", { isPriority: true }),
      makeOrder("002", { isPriority: false }),
    ];
    mockSanityFetch.mockResolvedValueOnce(data);

    const { result } = renderHook(() => useSanityOrders());

    await waitFor(() => expect(result.current.loading).toBe(false));
    const priority = result.current.getPriorityOrders();
    expect(priority).toHaveLength(1);
  });

  it("getRecentOrders should limit returned orders", async () => {
    const data = Array.from({ length: 20 }, (_, i) => makeOrder(`${i + 1}`));
    mockSanityFetch.mockResolvedValueOnce(data);

    const { result } = renderHook(() => useSanityOrders());

    await waitFor(() => expect(result.current.loading).toBe(false));
    const recent = result.current.getRecentOrders(5);
    expect(recent).toHaveLength(5);
  });

  it("getRecentOrders should default to 10", async () => {
    const data = Array.from({ length: 20 }, (_, i) => makeOrder(`${i + 1}`));
    mockSanityFetch.mockResolvedValueOnce(data);

    const { result } = renderHook(() => useSanityOrders());

    await waitFor(() => expect(result.current.loading).toBe(false));
    const recent = result.current.getRecentOrders();
    expect(recent).toHaveLength(10);
  });

  it("searchOrders should match by orderNumber", async () => {
    const data = [
      makeOrder("001"),
      makeOrder("002"),
    ];
    mockSanityFetch.mockResolvedValueOnce(data);

    const { result } = renderHook(() => useSanityOrders());

    await waitFor(() => expect(result.current.loading).toBe(false));
    const found = result.current.searchOrders("ORD-001");
    expect(found).toHaveLength(1);
    expect(found[0].orderNumber).toBe("ORD-001");
  });

  it("searchOrders should match by customerName", async () => {
    const data = [
      makeOrder("001", { customerName: "Alice" }),
      makeOrder("002", { customerName: "Bob" }),
    ];
    mockSanityFetch.mockResolvedValueOnce(data);

    const { result } = renderHook(() => useSanityOrders());

    await waitFor(() => expect(result.current.loading).toBe(false));
    const found = result.current.searchOrders("alice");
    expect(found).toHaveLength(1);
    expect(found[0].customerName).toBe("Alice");
  });

  it("searchOrders should match by customerEmail", async () => {
    const data = [
      makeOrder("001", { customerEmail: "alice@shop.com" }),
      makeOrder("002", { customerEmail: "bob@shop.com" }),
    ];
    mockSanityFetch.mockResolvedValueOnce(data);

    const { result } = renderHook(() => useSanityOrders());

    await waitFor(() => expect(result.current.loading).toBe(false));
    const found = result.current.searchOrders("bob@");
    expect(found).toHaveLength(1);
  });

  it("should expose refetch function", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useSanityOrders());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.refetch).toBeDefined();
  });
});

// ═════════════════════════════════════════════════════════════════
// useSanityOrder (single order)
// ═════════════════════════════════════════════════════════════════

describe("useSanityOrder", () => {
  it("should fetch a single order by identifier", async () => {
    const order = makeOrder("order-123");
    mockSanityFetch.mockResolvedValueOnce(order);

    const { result } = renderHook(() => useSanityOrder("order-123"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.order).not.toBeNull();
    expect(result.current.order!.id).toBe("order-123");
    expect(result.current.error).toBeNull();
  });

  it("should pass identifier as both id and orderNumber params", async () => {
    mockSanityFetch.mockResolvedValueOnce(makeOrder("x"));

    renderHook(() => useSanityOrder("ORD-456"));

    await waitFor(() =>
      expect(mockSanityFetch).toHaveBeenCalledWith(
        expect.any(String),
        { id: "ORD-456", orderNumber: "ORD-456" }
      )
    );
  });

  it("should handle order not found", async () => {
    mockSanityFetch.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useSanityOrder("nonexistent"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.order).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should handle fetch error", async () => {
    mockSanityFetch.mockRejectedValueOnce(new Error("Order fetch failed"));

    const { result } = renderHook(() => useSanityOrder("x"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Order fetch failed");
    expect(result.current.order).toBeNull();
  });

  it("should handle non-Error thrown", async () => {
    mockSanityFetch.mockRejectedValueOnce("fail");

    const { result } = renderHook(() => useSanityOrder("x"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Failed to fetch order");
  });

  it("should subscribe to real-time updates for specific order", async () => {
    mockSanityFetch.mockResolvedValueOnce(makeOrder("abc"));

    const { result } = renderHook(() => useSanityOrder("abc"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockListenSafe).toHaveBeenCalledWith(
      expect.stringContaining("abc")
    );
  });

  it("should unsubscribe on unmount", async () => {
    mockSanityFetch.mockResolvedValueOnce(makeOrder("abc"));

    const { unmount } = renderHook(() => useSanityOrder("abc"));

    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalled());
    unmount();
    expect(unsubscribeFn).toHaveBeenCalled();
  });
});

// ═════════════════════════════════════════════════════════════════
// useOrderStatistics
// ═════════════════════════════════════════════════════════════════

describe("useOrderStatistics", () => {
  it("should return statistics from summary", async () => {
    const data = [
      makeOrder("001", { status: "delivered", paymentStatus: "paid", total: 1000 }),
    ];
    // Use mockResolvedValue (not Once) because useOrderStatistics creates a new
    // filters object {} on each render, triggering re-fetches via useCallback dep.
    mockSanityFetch.mockResolvedValue(data);

    const { result } = renderHook(() => useOrderStatistics());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.statistics).not.toBeNull();
    expect(result.current.statistics!.totalOrders).toBe(1);
    expect(result.current.statistics!.totalRevenue).toBe(1000);
  });

  it("should pass date range as filters", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    renderHook(() =>
      useOrderStatistics({ start: "2025-01-01", end: "2025-06-30" })
    );

    await waitFor(() => {
      const query = mockSanityFetch.mock.calls[0][0];
      expect(query).toContain('orderDate >= "2025-01-01"');
      expect(query).toContain('orderDate <= "2025-06-30"');
    });
  });

  it("should return null statistics for no orders", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useOrderStatistics());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.statistics).toBeNull();
  });
});
