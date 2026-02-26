/**
 * Tests for src/hooks/useSeller.ts
 *
 * Hooks: useSellerDashboard, useSellerOrderDetail, useSellerProducts,
 *        useSellerOrders, useSellerRefunds, useSellerNotifications,
 *        useSellerAddresses
 *
 * Uses SellerApi static methods. All must be mocked since they have
 * internal delays and static mock data.
 */

import { renderHook, waitFor, act } from "@testing-library/react";

jest.setTimeout(30000);

// ─── Mock SellerApi ──────────────────────────────────────────

const mockGetDashboardStats = jest.fn();
const mockGetSalesData = jest.fn();
const mockGetProductPerformance = jest.fn();
const mockGetOrders = jest.fn();
const mockGetOrderById = jest.fn();
const mockUpdateOrderStatus = jest.fn();
const mockGetProducts = jest.fn();
const mockGetRefunds = jest.fn();
const mockGetNotifications = jest.fn();
const mockMarkNotificationAsRead = jest.fn();
const mockGetAddresses = jest.fn();
const mockCreateAddress = jest.fn();
const mockUpdateAddress = jest.fn();
const mockDeleteAddress = jest.fn();

jest.mock("@/lib/api/seller", () => ({
  SellerApi: {
    getDashboardStats: (...args: unknown[]) => mockGetDashboardStats(...args),
    getSalesData: (...args: unknown[]) => mockGetSalesData(...args),
    getProductPerformance: (...args: unknown[]) => mockGetProductPerformance(...args),
    getOrders: (...args: unknown[]) => mockGetOrders(...args),
    getOrderById: (...args: unknown[]) => mockGetOrderById(...args),
    updateOrderStatus: (...args: unknown[]) => mockUpdateOrderStatus(...args),
    getProducts: (...args: unknown[]) => mockGetProducts(...args),
    getRefunds: (...args: unknown[]) => mockGetRefunds(...args),
    getNotifications: (...args: unknown[]) => mockGetNotifications(...args),
    markNotificationAsRead: (...args: unknown[]) => mockMarkNotificationAsRead(...args),
    getAddresses: (...args: unknown[]) => mockGetAddresses(...args),
    createAddress: (...args: unknown[]) => mockCreateAddress(...args),
    updateAddress: (...args: unknown[]) => mockUpdateAddress(...args),
    deleteAddress: (...args: unknown[]) => mockDeleteAddress(...args),
  },
}));

import {
  useSellerDashboard,
  useSellerOrderDetail,
  useSellerProducts,
  useSellerOrders,
  useSellerRefunds,
  useSellerNotifications,
  useSellerAddresses,
} from "../useSeller";

// ─── Helpers ──────────────────────────────────────────────────

const MOCK_STATS = {
  totalSales: 1250,
  totalOrders: 45,
  totalProducts: 12,
  totalRevenue: 15600,
  salesGrowth: 12.5,
  orderGrowth: 8.3,
  revenueGrowth: 15.2,
};

const MOCK_SALES = [
  { name: "Mon", sales: 4000, revenue: 4800 },
  { name: "Tue", sales: 3000, revenue: 3600 },
];

const MOCK_PERFORMANCE = [
  { name: "Oyster Mushrooms", sales: 120, stock: 50, revenue: 14400 },
];

const MOCK_ORDERS = [
  { id: "ord-1", customer: "Alice", status: "pending", total: 500 },
  { id: "ord-2", customer: "Bob", status: "shipped", total: 300 },
];

const MOCK_ORDER_DETAIL = {
  id: "ord-1",
  customer: "Alice",
  status: "pending",
  total: 500,
  items: [],
  updatedAt: "2026-01-01",
  timeline: [],
};

const MOCK_PRODUCTS = [
  { id: "p-1", name: "Lion's Mane", price: 250, stock: 100, status: "Active" },
  { id: "p-2", name: "Shiitake", price: 200, stock: 50, status: "Active" },
];

const MOCK_REFUNDS = [
  { id: "ref-1", customer: "Alice", status: "pending", amount: 100 },
];

const MOCK_NOTIFICATIONS = [
  { id: "notif-1", message: "New order received", isRead: false },
  { id: "notif-2", message: "Payment confirmed", isRead: true },
];

const MOCK_ADDRESSES = [
  { id: "addr-1", street: "123 Main St", city: "Manila", isDefault: true },
  { id: "addr-2", street: "456 Oak Ave", city: "Quezon City", isDefault: false },
];

beforeEach(() => {
  mockGetDashboardStats.mockReset();
  mockGetSalesData.mockReset();
  mockGetProductPerformance.mockReset();
  mockGetOrders.mockReset();
  mockGetOrderById.mockReset();
  mockUpdateOrderStatus.mockReset();
  mockGetProducts.mockReset();
  mockGetRefunds.mockReset();
  mockGetNotifications.mockReset();
  mockMarkNotificationAsRead.mockReset();
  mockGetAddresses.mockReset();
  mockCreateAddress.mockReset();
  mockUpdateAddress.mockReset();
  mockDeleteAddress.mockReset();
});

// ═══════════════════════════════════════════════════════════════
// useSellerDashboard
// ═══════════════════════════════════════════════════════════════

describe("useSellerDashboard", () => {
  function setupDashboardMocks() {
    mockGetDashboardStats.mockResolvedValue({ data: MOCK_STATS });
    mockGetSalesData.mockResolvedValue({ data: MOCK_SALES });
    mockGetProductPerformance.mockResolvedValue({ data: MOCK_PERFORMANCE });
    mockGetOrders.mockResolvedValue({ data: MOCK_ORDERS });
  }

  it("should start in loading state", () => {
    setupDashboardMocks();
    const { result } = renderHook(() => useSellerDashboard());
    expect(result.current.loading).toBe(true);
  });

  it("should fetch all dashboard data in parallel", async () => {
    setupDashboardMocks();

    const { result } = renderHook(() => useSellerDashboard());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.stats).toEqual(MOCK_STATS);
    expect(result.current.salesData).toEqual(MOCK_SALES);
    expect(result.current.productPerformance).toEqual(MOCK_PERFORMANCE);
    expect(result.current.recentOrders).toEqual(MOCK_ORDERS);
    expect(result.current.error).toBeNull();
  });

  it("should call getOrders with limit 5", async () => {
    setupDashboardMocks();

    renderHook(() => useSellerDashboard());

    await waitFor(() =>
      expect(mockGetOrders).toHaveBeenCalledWith({ limit: 5 })
    );
  });

  it("should handle error from any API call", async () => {
    mockGetDashboardStats.mockRejectedValue(new Error("API down"));
    mockGetSalesData.mockResolvedValue({ data: [] });
    mockGetProductPerformance.mockResolvedValue({ data: [] });
    mockGetOrders.mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useSellerDashboard());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("API down");
  });

  it("should handle non-Error thrown", async () => {
    mockGetDashboardStats.mockRejectedValue("string error");
    mockGetSalesData.mockResolvedValue({ data: [] });
    mockGetProductPerformance.mockResolvedValue({ data: [] });
    mockGetOrders.mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useSellerDashboard());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Failed to fetch dashboard data");
  });

  it("should provide refetch function", async () => {
    setupDashboardMocks();

    const { result } = renderHook(() => useSellerDashboard());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.refetch).toBeDefined();

    // Reset and refetch
    setupDashboardMocks();
    await act(async () => {
      await result.current.refetch();
    });

    expect(mockGetDashboardStats).toHaveBeenCalledTimes(2);
  });
});

// ═══════════════════════════════════════════════════════════════
// useSellerOrderDetail
// ═══════════════════════════════════════════════════════════════

describe("useSellerOrderDetail", () => {
  it("should start in loading state", () => {
    mockGetOrderById.mockResolvedValue({ success: true, data: MOCK_ORDER_DETAIL });
    const { result } = renderHook(() => useSellerOrderDetail("ord-1"));
    expect(result.current.loading).toBe(true);
  });

  it("should fetch order by ID", async () => {
    mockGetOrderById.mockResolvedValue({ success: true, data: MOCK_ORDER_DETAIL });

    const { result } = renderHook(() => useSellerOrderDetail("ord-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.order).toEqual(MOCK_ORDER_DETAIL);
    expect(result.current.error).toBeNull();
  });

  it("should handle undefined orderId (no fetch)", async () => {
    const { result } = renderHook(() => useSellerOrderDetail(undefined));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.order).toBeNull();
    expect(mockGetOrderById).not.toHaveBeenCalled();
  });

  it("should handle order not found", async () => {
    mockGetOrderById.mockResolvedValue({
      success: false,
      data: null,
      message: "Order not found",
    });

    const { result } = renderHook(() => useSellerOrderDetail("nonexistent"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.order).toBeNull();
    expect(result.current.error).toBe("Order not found");
  });

  it("should handle fetch error", async () => {
    mockGetOrderById.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useSellerOrderDetail("ord-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Network error");
    expect(result.current.order).toBeNull();
  });

  it("should handle non-Error thrown", async () => {
    mockGetOrderById.mockRejectedValue("fail");

    const { result } = renderHook(() => useSellerOrderDetail("ord-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Failed to fetch order");
  });

  it("should provide updateStatus function", async () => {
    mockGetOrderById.mockResolvedValue({ success: true, data: MOCK_ORDER_DETAIL });
    const updatedOrder = { ...MOCK_ORDER_DETAIL, status: "shipped" };
    mockUpdateOrderStatus.mockResolvedValue({ success: true, data: updatedOrder });

    const { result } = renderHook(() => useSellerOrderDetail("ord-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    let updated: unknown;
    await act(async () => {
      updated = await result.current.updateStatus("shipped" as any);
    });

    expect(mockUpdateOrderStatus).toHaveBeenCalledWith("ord-1", "shipped");
    expect(updated).toEqual(updatedOrder);
    expect(result.current.order).toEqual(updatedOrder);
  });

  it("should throw when updateStatus called without orderId", async () => {
    const { result } = renderHook(() => useSellerOrderDetail(undefined));

    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(
      act(async () => {
        await result.current.updateStatus("shipped" as any);
      })
    ).rejects.toThrow("Missing order id");
  });

  it("should throw when updateStatus gets unsuccessful response", async () => {
    mockGetOrderById.mockResolvedValue({ success: true, data: MOCK_ORDER_DETAIL });
    mockUpdateOrderStatus.mockResolvedValue({ success: false, data: null, message: "Cannot update" });

    const { result } = renderHook(() => useSellerOrderDetail("ord-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(
      act(async () => {
        await result.current.updateStatus("shipped" as any);
      })
    ).rejects.toThrow("Cannot update");
  });

  it("should provide refetch function", async () => {
    mockGetOrderById.mockResolvedValue({ success: true, data: MOCK_ORDER_DETAIL });

    const { result } = renderHook(() => useSellerOrderDetail("ord-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    mockGetOrderById.mockResolvedValueOnce({ success: true, data: MOCK_ORDER_DETAIL });
    await act(async () => {
      await result.current.refetch();
    });

    expect(mockGetOrderById).toHaveBeenCalledTimes(2);
  });
});

// ═══════════════════════════════════════════════════════════════
// useSellerProducts
// ═══════════════════════════════════════════════════════════════

describe("useSellerProducts", () => {
  it("should start in loading state", () => {
    mockGetProducts.mockResolvedValue({ data: MOCK_PRODUCTS, pagination: null });
    const { result } = renderHook(() => useSellerProducts());
    expect(result.current.loading).toBe(true);
  });

  it("should fetch products", async () => {
    mockGetProducts.mockResolvedValue({
      data: MOCK_PRODUCTS,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    });

    const { result } = renderHook(() => useSellerProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.products).toEqual(MOCK_PRODUCTS);
    expect(result.current.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
    });
    expect(result.current.error).toBeNull();
  });

  it("should pass params to API", async () => {
    mockGetProducts.mockResolvedValue({ data: [], pagination: null });

    renderHook(() =>
      useSellerProducts({ page: 2, limit: 5, search: "lion" })
    );

    await waitFor(() =>
      expect(mockGetProducts).toHaveBeenCalledWith({ page: 2, limit: 5, search: "lion" })
    );
  });

  it("should handle error", async () => {
    mockGetProducts.mockRejectedValue(new Error("Fetch failed"));

    const { result } = renderHook(() => useSellerProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Fetch failed");
    expect(result.current.products).toEqual([]);
  });

  it("should handle non-Error thrown", async () => {
    mockGetProducts.mockRejectedValue("oops");

    const { result } = renderHook(() => useSellerProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Failed to fetch products");
  });

  it("should provide refetch function", async () => {
    mockGetProducts.mockResolvedValue({ data: MOCK_PRODUCTS, pagination: null });

    const { result } = renderHook(() => useSellerProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.refetch).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════
// useSellerOrders
// ═══════════════════════════════════════════════════════════════

describe("useSellerOrders", () => {
  it("should start in loading state", () => {
    mockGetOrders.mockResolvedValue({ data: MOCK_ORDERS, pagination: null });
    const { result } = renderHook(() => useSellerOrders());
    expect(result.current.loading).toBe(true);
  });

  it("should fetch orders", async () => {
    mockGetOrders.mockResolvedValue({
      data: MOCK_ORDERS,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    });

    const { result } = renderHook(() => useSellerOrders());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.orders).toEqual(MOCK_ORDERS);
    expect(result.current.error).toBeNull();
  });

  it("should pass params to API", async () => {
    mockGetOrders.mockResolvedValue({ data: [], pagination: null });

    renderHook(() =>
      useSellerOrders({ status: "shipped", search: "alice" })
    );

    await waitFor(() =>
      expect(mockGetOrders).toHaveBeenCalledWith({ status: "shipped", search: "alice" })
    );
  });

  it("should handle error", async () => {
    mockGetOrders.mockRejectedValue(new Error("Orders API down"));

    const { result } = renderHook(() => useSellerOrders());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Orders API down");
    expect(result.current.orders).toEqual([]);
  });

  it("should handle non-Error thrown", async () => {
    mockGetOrders.mockRejectedValue(42);

    const { result } = renderHook(() => useSellerOrders());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Failed to fetch orders");
  });

  it("should provide refetch function", async () => {
    mockGetOrders.mockResolvedValue({ data: [], pagination: null });

    const { result } = renderHook(() => useSellerOrders());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.refetch).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════
// useSellerRefunds
// ═══════════════════════════════════════════════════════════════

describe("useSellerRefunds", () => {
  it("should start in loading state", () => {
    mockGetRefunds.mockResolvedValue({ data: MOCK_REFUNDS, pagination: null });
    const { result } = renderHook(() => useSellerRefunds());
    expect(result.current.loading).toBe(true);
  });

  it("should fetch refunds", async () => {
    mockGetRefunds.mockResolvedValue({
      data: MOCK_REFUNDS,
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    const { result } = renderHook(() => useSellerRefunds());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.refunds).toEqual(MOCK_REFUNDS);
    expect(result.current.error).toBeNull();
  });

  it("should pass params to API", async () => {
    mockGetRefunds.mockResolvedValue({ data: [], pagination: null });

    renderHook(() => useSellerRefunds({ status: "pending" }));

    await waitFor(() =>
      expect(mockGetRefunds).toHaveBeenCalledWith({ status: "pending" })
    );
  });

  it("should handle error", async () => {
    mockGetRefunds.mockRejectedValue(new Error("Refunds API down"));

    const { result } = renderHook(() => useSellerRefunds());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Refunds API down");
    expect(result.current.refunds).toEqual([]);
  });

  it("should handle non-Error thrown", async () => {
    mockGetRefunds.mockRejectedValue("fail");

    const { result } = renderHook(() => useSellerRefunds());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Failed to fetch refunds");
  });
});

// ═══════════════════════════════════════════════════════════════
// useSellerNotifications
// ═══════════════════════════════════════════════════════════════

describe("useSellerNotifications", () => {
  it("should start in loading state", () => {
    mockGetNotifications.mockResolvedValue({ data: MOCK_NOTIFICATIONS });
    const { result } = renderHook(() => useSellerNotifications());
    expect(result.current.loading).toBe(true);
  });

  it("should fetch notifications", async () => {
    mockGetNotifications.mockResolvedValue({ data: MOCK_NOTIFICATIONS });

    const { result } = renderHook(() => useSellerNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.notifications).toEqual(MOCK_NOTIFICATIONS);
    expect(result.current.error).toBeNull();
  });

  it("should handle error", async () => {
    mockGetNotifications.mockRejectedValue(new Error("Notifications API down"));

    const { result } = renderHook(() => useSellerNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Notifications API down");
    expect(result.current.notifications).toEqual([]);
  });

  it("should handle non-Error thrown", async () => {
    mockGetNotifications.mockRejectedValue("fail");

    const { result } = renderHook(() => useSellerNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Failed to fetch notifications");
  });

  it("should mark notification as read", async () => {
    mockGetNotifications.mockResolvedValue({ data: [...MOCK_NOTIFICATIONS] });
    mockMarkNotificationAsRead.mockResolvedValue({});

    const { result } = renderHook(() => useSellerNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.markAsRead("notif-1");
    });

    expect(mockMarkNotificationAsRead).toHaveBeenCalledWith("notif-1");
    const updated = result.current.notifications.find((n: any) => n.id === "notif-1");
    expect(updated?.isRead).toBe(true);
  });

  it("should handle markAsRead failure gracefully", async () => {
    mockGetNotifications.mockResolvedValue({ data: [...MOCK_NOTIFICATIONS] });
    mockMarkNotificationAsRead.mockRejectedValue(new Error("Failed"));

    const { result } = renderHook(() => useSellerNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Should not throw
    await act(async () => {
      await result.current.markAsRead("notif-1");
    });

    // Notification should remain unchanged (optimistic update not applied on failure)
    expect(mockMarkNotificationAsRead).toHaveBeenCalledWith("notif-1");
  });

  it("should provide refetch function", async () => {
    mockGetNotifications.mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useSellerNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.refetch).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════
// useSellerAddresses
// ═══════════════════════════════════════════════════════════════

describe("useSellerAddresses", () => {
  it("should start in loading state", () => {
    mockGetAddresses.mockResolvedValue({ data: MOCK_ADDRESSES });
    const { result } = renderHook(() => useSellerAddresses());
    expect(result.current.loading).toBe(true);
  });

  it("should fetch addresses", async () => {
    mockGetAddresses.mockResolvedValue({ data: MOCK_ADDRESSES });

    const { result } = renderHook(() => useSellerAddresses());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.addresses).toEqual(MOCK_ADDRESSES);
    expect(result.current.error).toBeNull();
  });

  it("should handle error", async () => {
    mockGetAddresses.mockRejectedValue(new Error("Addresses API down"));

    const { result } = renderHook(() => useSellerAddresses());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Addresses API down");
    expect(result.current.addresses).toEqual([]);
  });

  it("should handle non-Error thrown", async () => {
    mockGetAddresses.mockRejectedValue("fail");

    const { result } = renderHook(() => useSellerAddresses());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Failed to fetch addresses");
  });

  it("should create address", async () => {
    mockGetAddresses.mockResolvedValue({ data: [...MOCK_ADDRESSES] });
    const newAddr = { street: "789 New St", city: "Makati", isDefault: false };
    const createdAddr = { id: "addr-new", ...newAddr };
    mockCreateAddress.mockResolvedValue({ data: createdAddr });

    const { result } = renderHook(() => useSellerAddresses());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createAddress(newAddr as any);
    });

    expect(mockCreateAddress).toHaveBeenCalledWith(newAddr);
    expect(result.current.addresses).toContainEqual(createdAddr);
  });

  it("should throw on create address failure", async () => {
    mockGetAddresses.mockResolvedValue({ data: [] });
    mockCreateAddress.mockRejectedValue(new Error("Create failed"));

    const { result } = renderHook(() => useSellerAddresses());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(
      act(async () => {
        await result.current.createAddress({ street: "x" } as any);
      })
    ).rejects.toThrow("Create failed");
  });

  it("should update address", async () => {
    mockGetAddresses.mockResolvedValue({ data: [...MOCK_ADDRESSES] });
    const updatedAddr = { ...MOCK_ADDRESSES[0], street: "Updated St" };
    mockUpdateAddress.mockResolvedValue({ data: updatedAddr });

    const { result } = renderHook(() => useSellerAddresses());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateAddress("addr-1", { street: "Updated St" });
    });

    expect(mockUpdateAddress).toHaveBeenCalledWith("addr-1", { street: "Updated St" });
    const updated = result.current.addresses.find((a: any) => a.id === "addr-1");
    expect(updated?.street).toBe("Updated St");
  });

  it("should throw on update address failure", async () => {
    mockGetAddresses.mockResolvedValue({ data: [...MOCK_ADDRESSES] });
    mockUpdateAddress.mockRejectedValue(new Error("Update failed"));

    const { result } = renderHook(() => useSellerAddresses());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(
      act(async () => {
        await result.current.updateAddress("addr-1", { street: "x" });
      })
    ).rejects.toThrow("Update failed");
  });

  it("should delete address", async () => {
    mockGetAddresses.mockResolvedValue({ data: [...MOCK_ADDRESSES] });
    mockDeleteAddress.mockResolvedValue({});

    const { result } = renderHook(() => useSellerAddresses());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.addresses).toHaveLength(2);

    await act(async () => {
      await result.current.deleteAddress("addr-1");
    });

    expect(mockDeleteAddress).toHaveBeenCalledWith("addr-1");
    expect(result.current.addresses).toHaveLength(1);
    expect(result.current.addresses.find((a: any) => a.id === "addr-1")).toBeUndefined();
  });

  it("should throw on delete address failure", async () => {
    mockGetAddresses.mockResolvedValue({ data: [...MOCK_ADDRESSES] });
    mockDeleteAddress.mockRejectedValue(new Error("Delete failed"));

    const { result } = renderHook(() => useSellerAddresses());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(
      act(async () => {
        await result.current.deleteAddress("addr-1");
      })
    ).rejects.toThrow("Delete failed");
  });

  it("should provide refetch function", async () => {
    mockGetAddresses.mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useSellerAddresses());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.refetch).toBeDefined();
  });
});
