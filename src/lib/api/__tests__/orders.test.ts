/**
 * Tests for src/lib/api/orders.ts
 * OrdersApi - customer order management
 */
import { OrdersApi } from "../orders";

// Mock global fetch for tryFetch
const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

describe("OrdersApi", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockFetch.mockReset();
    // Default: simulate backend unavailable (status 0)
    mockFetch.mockResolvedValue({
      ok: false,
      status: 0,
      json: async () => null,
    });
    // Mock document.cookie for getAuthToken
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "",
    });
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  // For methods that only use delay() (no fetch first)
  async function resolveAsync<T>(promise: Promise<T>): Promise<T> {
    jest.advanceTimersByTime(600);
    return promise;
  }

  // For methods where fetch resolves via microtask THEN delay() runs
  // advanceTimersByTimeAsync processes microtasks between timer ticks
  async function resolveWithFetchThenDelay<T>(promise: Promise<T>): Promise<T> {
    await jest.advanceTimersByTimeAsync(15000);
    return promise;
  }

  describe("getOrders", () => {
    it("returns all orders when no params given", async () => {
      const result = await resolveAsync(OrdersApi.getOrders());
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("filters orders by status", async () => {
      const result = await resolveAsync(
        OrdersApi.getOrders({ status: "completed" })
      );
      expect(result.success).toBe(true);
      // MOCK_ORDERS only has to-pay status, so completed filter returns empty
      result.data.forEach((order) => {
        expect(order.status).toBe("completed");
      });
    });

    it("returns orders with required fields", async () => {
      const result = await resolveAsync(OrdersApi.getOrders());
      if (result.data.length > 0) {
        const order = result.data[0];
        expect(order.id).toBeDefined();
        expect(order.date).toBeDefined();
        expect(order.items).toBeDefined();
        expect(order.total).toBeDefined();
        expect(order.status).toBeDefined();
      }
    });
  });

  describe("getOrderById", () => {
    it("returns order detail when found", async () => {
      const result = await resolveAsync(OrdersApi.getOrderById("1"));
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.customerInfo).toBeDefined();
      expect(result.data.customerInfo.name).toBeDefined();
    });

    it("includes tracking and delivery info", async () => {
      const result = await resolveAsync(OrdersApi.getOrderById("1"));
      expect(result.data.trackingNumber).toBe("TRACK-1");
      expect(result.data.estimatedDelivery).toBeDefined();
    });

    it("returns not found for invalid ID", async () => {
      const result = await resolveAsync(OrdersApi.getOrderById("99999"));
      expect(result.success).toBe(false);
      expect(result.message).toBe("Order not found");
    });
  });

  describe("createOrder", () => {
    const orderData = {
      customerInfo: {
        name: "Test User",
        email: "test@example.com",
        phone: "+63 912 345 6789",
      },
      items: [{ productId: "p1", quantity: 2, price: 120 }],
      pickupLocation: "main",
      paymentMethod: "cod" as const,
      total: 240,
    };

    it("tries real backend API first", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { orderId: "BACKEND-123", status: "pending" },
        }),
      });

      const result = await resolveAsync(OrdersApi.createOrder(orderData));
      expect(result.success).toBe(true);
      expect(result.data.orderId).toBe("BACKEND-123");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/orders"),
        expect.objectContaining({ method: "POST" })
      );
    });

    it("includes auth token in header when available", async () => {
      document.cookie = "auth-token=my-test-token";
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { orderId: "BACKEND-456", status: "pending" },
        }),
      });

      await resolveAsync(OrdersApi.createOrder(orderData));
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer my-test-token",
          }),
        })
      );
    });

    it("falls back to mock when backend unavailable (status 0)", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 0,
        json: async () => null,
      });

      const result = await resolveWithFetchThenDelay(OrdersApi.createOrder(orderData));
      expect(result.success).toBe(true);
      expect(result.data.orderId).toMatch(/^ORD-/);
      expect(result.data.status).toBe("pending");
    });

    it("generates payment URL for gcash", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 0,
        json: async () => null,
      });

      const gcashOrder = { ...orderData, paymentMethod: "gcash" as const };
      const result = await resolveWithFetchThenDelay(OrdersApi.createOrder(gcashOrder));
      expect(result.data.paymentUrl).toBeDefined();
    });

    it("handles 401 unauthorized from backend", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: "Unauthorized" }),
      });

      const result = await resolveWithFetchThenDelay(OrdersApi.createOrder(orderData));
      // Falls through to mock
      expect(result.success).toBe(true);
      expect(result.data.orderId).toMatch(/^ORD-/);
    });

    it("transforms pickup location to backend address format", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { orderId: "BACKEND-789", status: "pending" },
        }),
      });

      await resolveAsync(OrdersApi.createOrder(orderData));
      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.shippingAddress.city).toBe("Caloocan City");
      expect(body.paymentMethod).toBe("CASH_ON_DELIVERY");
    });
  });

  describe("cancelOrder", () => {
    it("returns success with message", async () => {
      const result = await resolveAsync(
        OrdersApi.cancelOrder("1", "Changed my mind")
      );
      expect(result.success).toBe(true);
      expect(result.data.message).toContain("cancelled");
    });
  });

  describe("updateOrderStatus", () => {
    it("tries real backend API first", async () => {
      document.cookie = "auth-token=seller-token";
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: "Status updated",
          data: { id: "1", status: "TO_SHIP" },
        }),
      });

      const result = await resolveAsync(
        OrdersApi.updateOrderStatus("1", "TO_SHIP")
      );
      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/orders/1/status"),
        expect.objectContaining({ method: "PATCH" })
      );
    });

    it("sends cancellation reason when rejecting", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "Cancelled" }),
      });

      await resolveAsync(
        OrdersApi.updateOrderStatus("1", "CANCELLED", "Out of stock")
      );
      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.status).toBe("CANCELLED");
      expect(body.cancellationReason).toBe("Out of stock");
    });

    it("returns unauthorized on 401", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: "Unauthorized" }),
      });

      const result = await resolveAsync(
        OrdersApi.updateOrderStatus("1", "TO_SHIP")
      );
      expect(result.success).toBe(false);
      expect(result.message).toContain("Unauthorized");
    });

    it("falls back to mock when backend unavailable", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 0,
        json: async () => null,
      });

      const result = await resolveWithFetchThenDelay(
        OrdersApi.updateOrderStatus("1", "TO_SHIP")
      );
      expect(result.success).toBe(true);
      expect(result.data.message).toContain("approved");
    });

    it("mock returns cancelled message for CANCELLED status", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 0,
        json: async () => null,
      });

      const result = await resolveWithFetchThenDelay(
        OrdersApi.updateOrderStatus("1", "CANCELLED")
      );
      expect(result.success).toBe(true);
      expect(result.data.message).toContain("cancelled");
    });
  });
});
