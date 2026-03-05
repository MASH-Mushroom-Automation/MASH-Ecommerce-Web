/**
 * Tests for src/hooks/useFirebaseOrders.ts
 *
 * Hooks:  useFirebaseOrders, useFirebaseOrder, useUserFirebaseOrders
 *
 * All hooks call static methods on FirebaseOrdersService which we mock
 * at the module level.
 */

import { renderHook, waitFor, act } from "@testing-library/react";

// ─── Module mock ──────────────────────────────────────────────

const mockGetAllOrders = jest.fn();
const mockGetOrdersByStatus = jest.fn();
const mockGetOrdersBySeller = jest.fn();
const mockSubscribeToAllOrders = jest.fn();
const mockSubscribeToSellerOrders = jest.fn();
const mockSubscribeToOrder = jest.fn();
const mockSubscribeToUserOrders = jest.fn();
const mockApproveOrder = jest.fn();
const mockRejectOrder = jest.fn();
const mockUpdateOrderStatus = jest.fn();

jest.mock("@/lib/firebase/orders", () => ({
  FirebaseOrdersService: {
    getAllOrders: (...args: unknown[]) => mockGetAllOrders(...args),
    getOrdersByStatus: (...args: unknown[]) => mockGetOrdersByStatus(...args),
    getOrdersBySeller: (...args: unknown[]) => mockGetOrdersBySeller(...args),
    subscribeToAllOrders: (...args: unknown[]) => mockSubscribeToAllOrders(...args),
    subscribeToSellerOrders: (...args: unknown[]) => mockSubscribeToSellerOrders(...args),
    subscribeToOrder: (...args: unknown[]) => mockSubscribeToOrder(...args),
    subscribeToUserOrders: (...args: unknown[]) => mockSubscribeToUserOrders(...args),
    approveOrder: (...args: unknown[]) => mockApproveOrder(...args),
    rejectOrder: (...args: unknown[]) => mockRejectOrder(...args),
    updateOrderStatus: (...args: unknown[]) => mockUpdateOrderStatus(...args),
  },
}));

import {
  useFirebaseOrders,
  useFirebaseOrder,
  useUserFirebaseOrders,
} from "../useFirebaseOrders";
import type { UseFirebaseOrdersOptions } from "../useFirebaseOrders";

// ─── Helpers ──────────────────────────────────────────────────

const makeOrder = (id: string, overrides: Partial<Record<string, unknown>> = {}) => ({
  id,
  orderNumber: `MASH-20250601-${id}`,
  userId: "user-1",
  userName: "John Doe",
  userEmail: "john@test.com",
  status: "pending_approval" as const,
  items: [
    { name: "Oyster Mushroom", quantity: 2, price: 150, subtotal: 300 },
  ],
  total: 350,
  createdAt: {
    toDate: () => new Date("2025-06-01T10:00:00Z"),
  },
  ...overrides,
});

const todayOrder = (id: string) => {
  const now = new Date();
  return makeOrder(id, {
    createdAt: { toDate: () => now },
  });
};

let realtimeCallback: ((orders: unknown[]) => void) | null = null;
let realtimeErrorCallback: ((err: Error) => void) | null = null;
const mockUnsubscribe = jest.fn();

beforeEach(() => {
  mockGetAllOrders.mockReset();
  mockGetOrdersByStatus.mockReset();
  mockGetOrdersBySeller.mockReset();
  mockSubscribeToAllOrders.mockReset();
  mockSubscribeToSellerOrders.mockReset();
  mockSubscribeToOrder.mockReset();
  mockSubscribeToUserOrders.mockReset();
  mockApproveOrder.mockReset();
  mockRejectOrder.mockReset();
  mockUpdateOrderStatus.mockReset();
  mockUnsubscribe.mockClear();
  realtimeCallback = null;
  realtimeErrorCallback = null;

  // Default: getAllOrders resolves, subscribe returns unsubscribe
  mockGetAllOrders.mockResolvedValue([]);
  mockGetOrdersBySeller.mockResolvedValue([]);
  mockSubscribeToAllOrders.mockImplementation(
    (onNext: (orders: unknown[]) => void, onError: (err: Error) => void) => {
      realtimeCallback = onNext;
      realtimeErrorCallback = onError;
      return mockUnsubscribe;
    }
  );
  mockSubscribeToSellerOrders.mockImplementation(
    (_sellerId: string, onNext: (orders: unknown[]) => void, onError: (err: Error) => void) => {
      realtimeCallback = onNext;
      realtimeErrorCallback = onError;
      return mockUnsubscribe;
    }
  );
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// useFirebaseOrders
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("useFirebaseOrders", () => {
  it("starts in loading state", () => {
    mockGetAllOrders.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useFirebaseOrders());
    expect(result.current.loading).toBe(true);
    expect(result.current.orders).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("fetches all orders by default", async () => {
    const orders = [makeOrder("1"), makeOrder("2")];
    mockGetAllOrders.mockResolvedValueOnce(orders);

    const { result } = renderHook(() => useFirebaseOrders());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetAllOrders).toHaveBeenCalledWith(undefined);
    // Real-time also sets orders so check the latest
    expect(result.current.error).toBeNull();
  });

  it("fetches orders by status filter", async () => {
    const orders = [makeOrder("1", { status: "approved" })];
    mockGetOrdersByStatus.mockResolvedValueOnce(orders);

    const { result } = renderHook(() =>
      useFirebaseOrders({ statusFilter: "approved" } as UseFirebaseOrdersOptions)
    );
    await waitFor(() => expect(mockGetOrdersByStatus).toHaveBeenCalledWith("approved"));
  });

  it("passes limitCount to getAllOrders", async () => {
    mockGetAllOrders.mockResolvedValueOnce([]);

    renderHook(() => useFirebaseOrders({ limitCount: 10 }));
    await waitFor(() => expect(mockGetAllOrders).toHaveBeenCalledWith(10));
  });

  it("uses getOrdersBySeller when sellerId is provided", async () => {
    const sellerOrders = [makeOrder("s-1", { sellerId: "seller-abc" })];
    mockGetOrdersBySeller.mockResolvedValueOnce(sellerOrders);

    const { result } = renderHook(() =>
      useFirebaseOrders({ sellerId: "seller-abc" })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockGetOrdersBySeller).toHaveBeenCalledWith("seller-abc", undefined);
    expect(mockGetAllOrders).not.toHaveBeenCalled();
    expect(mockSubscribeToSellerOrders).toHaveBeenCalledWith(
      "seller-abc",
      expect.any(Function),
      expect.any(Function)
    );
    expect(mockSubscribeToAllOrders).not.toHaveBeenCalled();
  });

  it("computes stats correctly", async () => {
    const orders = [
      makeOrder("1", { status: "pending_approval", total: 100 }),
      makeOrder("2", { status: "approved", total: 200 }),
      makeOrder("3", { status: "processing", total: 300 }),
      makeOrder("4", { status: "cancelled", total: 50 }),
      makeOrder("5", { status: "delivered", total: 400 }),
    ];
    mockGetAllOrders.mockResolvedValueOnce(orders);

    const { result } = renderHook(() => useFirebaseOrders());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Trigger via real-time callback to set orders
    act(() => {
      realtimeCallback?.(orders);
    });

    await waitFor(() => {
      const { stats } = result.current;
      expect(stats.totalOrders).toBe(5);
      expect(stats.pendingApproval).toBe(1);
      expect(stats.approved).toBe(1);
      expect(stats.processing).toBe(1);
      expect(stats.cancelled).toBe(1);
      expect(stats.delivered).toBe(1);
      // Revenue excludes cancelled + rejected
      expect(stats.totalRevenue).toBe(1000); // 100+200+300+400
    });
  });

  it("computes todayOrders correctly", async () => {
    const orders = [
      todayOrder("today-1"),
      makeOrder("old-1", {
        status: "completed",
        total: 500,
        createdAt: { toDate: () => new Date("2024-01-01T00:00:00Z") },
      }),
    ];
    mockGetAllOrders.mockResolvedValueOnce(orders);

    const { result } = renderHook(() => useFirebaseOrders());

    act(() => {
      realtimeCallback?.(orders);
    });

    await waitFor(() => {
      expect(result.current.stats.todayOrders).toBe(1);
    });
  });

  it("returns pendingOrders subset", async () => {
    const orders = [
      makeOrder("1", { status: "pending_approval" }),
      makeOrder("2", { status: "approved" }),
      makeOrder("3", { status: "pending_approval" }),
    ];
    mockGetAllOrders.mockResolvedValueOnce(orders);

    const { result } = renderHook(() => useFirebaseOrders());

    act(() => {
      realtimeCallback?.(orders);
    });

    await waitFor(() => {
      expect(result.current.pendingOrders).toHaveLength(2);
    });
  });

  it("subscribes to real-time updates (realtime=true)", async () => {
    mockGetAllOrders.mockResolvedValueOnce([]);

    const { unmount } = renderHook(() => useFirebaseOrders({ realtime: true }));
    await waitFor(() => expect(mockSubscribeToAllOrders).toHaveBeenCalled());

    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it("does not subscribe when realtime=false", async () => {
    mockGetAllOrders.mockResolvedValueOnce([]);

    renderHook(() => useFirebaseOrders({ realtime: false }));
    await waitFor(() => expect(mockGetAllOrders).toHaveBeenCalled());

    expect(mockSubscribeToAllOrders).not.toHaveBeenCalled();
  });

  it("applies status filter to real-time updates", async () => {
    mockGetOrdersByStatus.mockResolvedValueOnce([]);

    renderHook(() => useFirebaseOrders({ statusFilter: "approved" } as UseFirebaseOrdersOptions));
    await waitFor(() => expect(mockSubscribeToAllOrders).toHaveBeenCalled());

    // Simulate real-time with mixed statuses
    const mixed = [
      makeOrder("1", { status: "approved" }),
      makeOrder("2", { status: "pending_approval" }),
    ];
    act(() => {
      realtimeCallback?.(mixed);
    });

    // The hook filters by statusFilter in the callback
  });

  it("handles real-time subscription error", async () => {
    mockGetAllOrders.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useFirebaseOrders());
    await waitFor(() => expect(mockSubscribeToAllOrders).toHaveBeenCalled());

    act(() => {
      realtimeErrorCallback?.(new Error("Connection lost"));
    });

    await waitFor(() => {
      expect(result.current.error).toBe("Connection lost");
    });
  });

  it("handles fetch error", async () => {
    mockGetAllOrders.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useFirebaseOrders());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Network error");
  });

  it("handles non-Error throw on fetch", async () => {
    mockGetAllOrders.mockRejectedValueOnce("string error");

    const { result } = renderHook(() => useFirebaseOrders());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Failed to fetch orders");
  });

  // ── Actions ──

  describe("approveOrder", () => {
    it("calls FirebaseOrdersService.approveOrder", async () => {
      mockGetAllOrders.mockResolvedValueOnce([]);
      mockApproveOrder.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useFirebaseOrders());
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.approveOrder("ord-1", "admin-1");
      });

      expect(success).toBe(true);
      expect(mockApproveOrder).toHaveBeenCalledWith("ord-1", "admin-1");
    });

    it("returns false and sets error on failure", async () => {
      mockGetAllOrders.mockResolvedValueOnce([]);
      mockApproveOrder.mockRejectedValueOnce(new Error("Forbidden"));

      const { result } = renderHook(() => useFirebaseOrders());
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.approveOrder("ord-1", "admin-1");
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe("Forbidden");
    });
  });

  describe("rejectOrder", () => {
    it("calls FirebaseOrdersService.rejectOrder", async () => {
      mockGetAllOrders.mockResolvedValueOnce([]);
      mockRejectOrder.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useFirebaseOrders());
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.rejectOrder("ord-1", "admin-1", "Bad item");
      });

      expect(success).toBe(true);
      expect(mockRejectOrder).toHaveBeenCalledWith("ord-1", "admin-1", "Bad item");
    });

    it("returns false on failure", async () => {
      mockGetAllOrders.mockResolvedValueOnce([]);
      mockRejectOrder.mockRejectedValueOnce(new Error("Not found"));

      const { result } = renderHook(() => useFirebaseOrders());
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.rejectOrder("ord-1", "admin-1", "reason");
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe("Not found");
    });
  });

  describe("updateOrderStatus", () => {
    it("calls FirebaseOrdersService.updateOrderStatus", async () => {
      mockGetAllOrders.mockResolvedValueOnce([]);
      mockUpdateOrderStatus.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useFirebaseOrders());
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.updateOrderStatus("ord-1", "shipped" as any, "admin-1", "Shipped via Lalamove");
      });

      expect(success).toBe(true);
      expect(mockUpdateOrderStatus).toHaveBeenCalledWith("ord-1", "shipped", "admin-1", "Shipped via Lalamove");
    });

    it("returns false on failure", async () => {
      mockGetAllOrders.mockResolvedValueOnce([]);
      mockUpdateOrderStatus.mockRejectedValueOnce(new Error("Invalid status"));

      const { result } = renderHook(() => useFirebaseOrders());
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.updateOrderStatus("ord-1", "shipped" as any, "admin-1");
      });

      expect(success).toBe(false);
    });
  });

  // ── Filters ──

  describe("filterByStatus", () => {
    it("returns all orders for 'all'", async () => {
      const orders = [
        makeOrder("1", { status: "approved" }),
        makeOrder("2", { status: "pending_approval" }),
      ];
      mockGetAllOrders.mockResolvedValueOnce(orders);

      const { result } = renderHook(() => useFirebaseOrders());

      act(() => {
        realtimeCallback?.(orders);
      });

      await waitFor(() => {
        const filtered = result.current.filterByStatus("all");
        expect(filtered).toHaveLength(2);
      });
    });

    it("returns filtered orders for specific status", async () => {
      const orders = [
        makeOrder("1", { status: "approved" }),
        makeOrder("2", { status: "pending_approval" }),
        makeOrder("3", { status: "approved" }),
      ];
      mockGetAllOrders.mockResolvedValueOnce(orders);

      const { result } = renderHook(() => useFirebaseOrders());

      act(() => {
        realtimeCallback?.(orders);
      });

      await waitFor(() => {
        const filtered = result.current.filterByStatus("approved" as any);
        expect(filtered).toHaveLength(2);
      });
    });
  });

  describe("searchOrders", () => {
    it("returns all orders for empty query", async () => {
      const orders = [makeOrder("1"), makeOrder("2")];
      mockGetAllOrders.mockResolvedValueOnce(orders);

      const { result } = renderHook(() => useFirebaseOrders());

      act(() => {
        realtimeCallback?.(orders);
      });

      await waitFor(() => {
        const searched = result.current.searchOrders("");
        expect(searched).toHaveLength(2);
      });
    });

    it("searches by order number", async () => {
      const orders = [
        makeOrder("1", { orderNumber: "MASH-20250601-001" }),
        makeOrder("2", { orderNumber: "MASH-20250601-002" }),
      ];
      mockGetAllOrders.mockResolvedValueOnce(orders);

      const { result } = renderHook(() => useFirebaseOrders());

      act(() => {
        realtimeCallback?.(orders);
      });

      await waitFor(() => {
        const searched = result.current.searchOrders("001");
        expect(searched).toHaveLength(1);
      });
    });

    it("searches by user name", async () => {
      const orders = [
        makeOrder("1", { userName: "John Doe" }),
        makeOrder("2", { userName: "Jane Smith" }),
      ];
      mockGetAllOrders.mockResolvedValueOnce(orders);

      const { result } = renderHook(() => useFirebaseOrders());

      act(() => {
        realtimeCallback?.(orders);
      });

      await waitFor(() => {
        const searched = result.current.searchOrders("jane");
        expect(searched).toHaveLength(1);
      });
    });

    it("searches by item name", async () => {
      const orders = [
        makeOrder("1", { items: [{ name: "Oyster Mushroom", quantity: 1, price: 100, subtotal: 100 }] }),
        makeOrder("2", { items: [{ name: "Lion's Mane", quantity: 1, price: 200, subtotal: 200 }] }),
      ];
      mockGetAllOrders.mockResolvedValueOnce(orders);

      const { result } = renderHook(() => useFirebaseOrders());

      act(() => {
        realtimeCallback?.(orders);
      });

      await waitFor(() => {
        const searched = result.current.searchOrders("lion");
        expect(searched).toHaveLength(1);
      });
    });
  });

  describe("refreshOrders", () => {
    it("calls fetchOrders again", async () => {
      mockGetAllOrders.mockResolvedValue([]);

      const { result } = renderHook(() => useFirebaseOrders());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.refreshOrders();
      });

      expect(mockGetAllOrders).toHaveBeenCalledTimes(2);
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// useFirebaseOrder (single)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("useFirebaseOrder", () => {
  let orderCallback: ((order: unknown) => void) | null = null;
  let orderErrorCallback: ((err: Error) => void) | null = null;
  const orderUnsubscribe = jest.fn();

  beforeEach(() => {
    orderCallback = null;
    orderErrorCallback = null;
    orderUnsubscribe.mockClear();
    mockSubscribeToOrder.mockImplementation(
      (orderId: string, onNext: (order: unknown) => void, onError: (err: Error) => void) => {
        orderCallback = onNext;
        orderErrorCallback = onError;
        return orderUnsubscribe;
      }
    );
  });

  it("starts in loading state", () => {
    const { result } = renderHook(() => useFirebaseOrder("ord-1"));
    expect(result.current.loading).toBe(true);
    expect(result.current.order).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("subscribes to order updates", async () => {
    const { result } = renderHook(() => useFirebaseOrder("ord-1"));

    expect(mockSubscribeToOrder).toHaveBeenCalledWith(
      "ord-1",
      expect.any(Function),
      expect.any(Function)
    );

    const order = makeOrder("ord-1");
    act(() => {
      orderCallback?.(order);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.order).toEqual(order);
    });
  });

  it("handles null orderId", async () => {
    const { result } = renderHook(() => useFirebaseOrder(null));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.order).toBeNull();
    expect(mockSubscribeToOrder).not.toHaveBeenCalled();
  });

  it("handles subscription error", async () => {
    const { result } = renderHook(() => useFirebaseOrder("ord-1"));

    act(() => {
      orderErrorCallback?.(new Error("Order not found"));
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe("Order not found");
    });
  });

  it("unsubscribes on unmount", async () => {
    const { unmount } = renderHook(() => useFirebaseOrder("ord-1"));

    unmount();
    expect(orderUnsubscribe).toHaveBeenCalled();
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// useUserFirebaseOrders
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("useUserFirebaseOrders", () => {
  let userCallback: ((orders: unknown[]) => void) | null = null;
  let userErrorCallback: ((err: Error) => void) | null = null;
  const userUnsubscribe = jest.fn();

  beforeEach(() => {
    userCallback = null;
    userErrorCallback = null;
    userUnsubscribe.mockClear();
    mockSubscribeToUserOrders.mockImplementation(
      (userId: string, onNext: (orders: unknown[]) => void, onError: (err: Error) => void) => {
        userCallback = onNext;
        userErrorCallback = onError;
        return userUnsubscribe;
      }
    );
  });

  it("starts in loading state", () => {
    const { result } = renderHook(() => useUserFirebaseOrders("user-1"));
    expect(result.current.loading).toBe(true);
    expect(result.current.orders).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("subscribes to user orders", async () => {
    const { result } = renderHook(() => useUserFirebaseOrders("user-1"));

    expect(mockSubscribeToUserOrders).toHaveBeenCalledWith(
      "user-1",
      expect.any(Function),
      expect.any(Function)
    );

    const orders = [makeOrder("1"), makeOrder("2")];
    act(() => {
      userCallback?.(orders);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.orders).toHaveLength(2);
    });
  });

  it("handles null userId", async () => {
    const { result } = renderHook(() => useUserFirebaseOrders(null));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.orders).toEqual([]);
    expect(mockSubscribeToUserOrders).not.toHaveBeenCalled();
  });

  it("handles subscription error", async () => {
    const { result } = renderHook(() => useUserFirebaseOrders("user-1"));

    act(() => {
      userErrorCallback?.(new Error("Permission denied"));
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe("Permission denied");
    });
  });

  it("unsubscribes on unmount", async () => {
    const { unmount } = renderHook(() => useUserFirebaseOrders("user-1"));

    unmount();
    expect(userUnsubscribe).toHaveBeenCalled();
  });
});
