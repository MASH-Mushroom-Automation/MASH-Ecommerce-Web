/**
 * useOrders Hook Tests - COVERAGE-016
 *
 * Tests for useOrders and useOrder hooks.
 *
 * Hook source: src/hooks/useOrders.ts
 * API module: src/lib/api/orders.ts (OrdersApi static class)
 *
 * Mock strategy: jest.mock with inline factory + jest.requireMock
 * Response format: ApiResponse { success: boolean, data?: T, message?: string }
 */

import { renderHook, act, waitFor } from "@testing-library/react";

// --- Mock OrdersApi with inline factory ---
jest.mock("@/lib/api/orders", () => ({
  OrdersApi: {
    getOrders: jest.fn(),
    getOrderById: jest.fn(),
  },
}));

const { OrdersApi } = jest.requireMock("@/lib/api/orders") as {
  OrdersApi: {
    getOrders: jest.Mock;
    getOrderById: jest.Mock;
  };
};

import { useOrders, useOrder } from "../useOrders";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockOrder = {
  id: "order-1",
  orderNumber: "ORD-001",
  status: "PENDING",
  totalAmount: 500,
  createdAt: "2025-01-15T10:00:00Z",
};

const mockOrder2 = {
  id: "order-2",
  orderNumber: "ORD-002",
  status: "DELIVERED",
  totalAmount: 1200,
  createdAt: "2025-01-14T08:00:00Z",
};

const mockOrderDetail = {
  ...mockOrder,
  items: [
    { id: "item-1", productId: "prod-1", quantity: 2, price: 150 },
    { id: "item-2", productId: "prod-2", quantity: 1, price: 200 },
  ],
  shippingAddress: { city: "Manila" },
};

// ============================================================================
// useOrders
// ============================================================================

describe("useOrders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should start in loading state", () => {
    OrdersApi.getOrders.mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useOrders());
    expect(result.current.loading).toBe(true);
    expect(result.current.orders).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("should fetch orders successfully", async () => {
    OrdersApi.getOrders.mockResolvedValueOnce({
      success: true,
      data: [mockOrder, mockOrder2],
    });

    const { result } = renderHook(() => useOrders());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.orders).toEqual([mockOrder, mockOrder2]);
    expect(result.current.error).toBeNull();
  });

  it("should pass params to API", async () => {
    OrdersApi.getOrders.mockResolvedValueOnce({
      success: true,
      data: [mockOrder],
    });

    renderHook(() => useOrders({ status: "PENDING", page: 1, limit: 10 }));

    await waitFor(() =>
      expect(OrdersApi.getOrders).toHaveBeenCalledWith({
        status: "PENDING",
        page: 1,
        limit: 10,
      })
    );
  });

  it("should set error when response.success is false", async () => {
    OrdersApi.getOrders.mockResolvedValueOnce({
      success: false,
      message: "Access denied",
    });

    const { result } = renderHook(() => useOrders());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Access denied");
    expect(result.current.orders).toEqual([]);
  });

  it("should use default error when success is false and no message", async () => {
    OrdersApi.getOrders.mockResolvedValueOnce({
      success: false,
    });

    const { result } = renderHook(() => useOrders());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Failed to fetch orders");
  });

  it("should handle API rejection with Error", async () => {
    OrdersApi.getOrders.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useOrders());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Network error");
  });

  it("should handle non-Error rejection", async () => {
    OrdersApi.getOrders.mockRejectedValueOnce("unknown");

    const { result } = renderHook(() => useOrders());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Failed to fetch orders");
  });

  it("should refetch orders via refetch()", async () => {
    OrdersApi.getOrders
      .mockResolvedValueOnce({ success: true, data: [mockOrder] })
      .mockResolvedValueOnce({
        success: true,
        data: [mockOrder, mockOrder2],
      });

    const { result } = renderHook(() => useOrders());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.orders).toHaveLength(1);

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() =>
      expect(result.current.orders).toHaveLength(2)
    );
  });

  it("should handle refetch error", async () => {
    OrdersApi.getOrders
      .mockResolvedValueOnce({ success: true, data: [mockOrder] })
      .mockRejectedValueOnce(new Error("Refetch failed"));

    const { result } = renderHook(() => useOrders());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() =>
      expect(result.current.error).toBe("Refetch failed")
    );
  });
});

// ============================================================================
// useOrder
// ============================================================================

describe("useOrder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should start in loading state", () => {
    OrdersApi.getOrderById.mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useOrder("order-1"));
    expect(result.current.loading).toBe(true);
    expect(result.current.order).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should not fetch when orderId is null", async () => {
    const { result } = renderHook(() => useOrder(null));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(OrdersApi.getOrderById).not.toHaveBeenCalled();
    expect(result.current.order).toBeNull();
  });

  it("should fetch order by ID", async () => {
    OrdersApi.getOrderById.mockResolvedValueOnce({
      success: true,
      data: mockOrderDetail,
    });

    const { result } = renderHook(() => useOrder("order-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.order).toEqual(mockOrderDetail);
    expect(result.current.error).toBeNull();
    expect(OrdersApi.getOrderById).toHaveBeenCalledWith("order-1");
  });

  it("should set error when response.success is false", async () => {
    OrdersApi.getOrderById.mockResolvedValueOnce({
      success: false,
      message: "Order not found",
    });

    const { result } = renderHook(() => useOrder("order-999"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Order not found");
  });

  it("should use default error when success is false and no message", async () => {
    OrdersApi.getOrderById.mockResolvedValueOnce({
      success: false,
    });

    const { result } = renderHook(() => useOrder("order-999"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Failed to fetch order");
  });

  it("should handle API rejection", async () => {
    OrdersApi.getOrderById.mockRejectedValueOnce(new Error("Server error"));

    const { result } = renderHook(() => useOrder("order-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Server error");
  });

  it("should handle non-Error rejection", async () => {
    OrdersApi.getOrderById.mockRejectedValueOnce(null);

    const { result } = renderHook(() => useOrder("order-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Failed to fetch order");
  });
});
