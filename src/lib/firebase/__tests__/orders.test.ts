/**
 * Tests for FirebaseOrdersService
 * COVERAGE-007: Firebase Services - orders.ts
 *
 * Tests order lifecycle: creation, queries, subscriptions,
 * admin approve/reject, status updates, cancellation,
 * Lalamove tracking, and payment status updates.
 */

// Mock notifications BEFORE orders module loads
jest.mock("../notifications", () => ({
  FirebaseNotificationsService: {
    createOrderNotification: jest.fn().mockResolvedValue(undefined),
  },
  NotificationTemplates: {
    orderPlaced: jest.fn(() => ({
      title: "Order Placed",
      message: "Your order has been placed",
    })),
    orderApproved: jest.fn(() => ({
      title: "Order Approved",
      message: "Your order has been approved",
    })),
    orderRejected: jest.fn((_num: string, reason?: string) => ({
      title: "Order Rejected",
      message: `Rejected: ${reason}`,
    })),
    orderProcessing: jest.fn(() => ({
      title: "Processing",
      message: "Your order is being processed",
    })),
    orderShipped: jest.fn(() => ({
      title: "Shipped",
      message: "Your order has been shipped",
    })),
    orderDelivered: jest.fn(() => ({
      title: "Delivered",
      message: "Your order has been delivered",
    })),
    orderCompleted: jest.fn(() => ({
      title: "Completed",
      message: "Your order is complete",
    })),
    driverAssigned: jest.fn((_num: string, name: string) => ({
      title: "Driver Assigned",
      message: `${name} assigned to your order`,
    })),
  },
}));

import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  onSnapshot,
  runTransaction,
  Timestamp,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import {
  FirebaseOrdersService,
  updateOrderPaymentStatus,
} from "../orders";
import type { CreateOrderData, FirestoreOrder } from "../orders";
import {
  FirebaseNotificationsService,
  NotificationTemplates,
} from "../notifications";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockDocRef = { id: "order-1", path: "orders/order-1" };
const mockCollectionRef = { id: "orders", path: "orders" };

function makeOrderData(overrides: Partial<CreateOrderData> = {}): CreateOrderData {
  return {
    userId: "user-1",
    userEmail: "test@example.com",
    userName: "Test User",
    userPhone: "+639171234567",
    items: [
      {
        productId: "prod-1",
        name: "Mushroom Kit",
        price: 500,
        quantity: 2,
        image: "/img.jpg",
      },
    ],
    subtotal: 1000,
    tax: 120,
    deliveryFee: 50,
    total: 1170,
    deliveryMethod: "pickup",
    paymentMethod: "cod",
    ...overrides,
  };
}

function makeFirestoreOrder(
  overrides: Partial<FirestoreOrder> = {}
): FirestoreOrder {
  return {
    id: "user-1-1234567890",
    orderNumber: "MASH-20260101-001",
    userId: "user-1",
    userEmail: "test@example.com",
    userName: "Test User",
    userPhone: "+639171234567",
    items: [
      {
        productId: "prod-1",
        name: "Mushroom Kit",
        price: 500,
        quantity: 2,
        image: "/img.jpg",
      },
    ],
    subtotal: 1000,
    tax: 120,
    deliveryFee: 50,
    total: 1170,
    deliveryMethod: "pickup",
    paymentMethod: "cod",
    paymentStatus: "pending",
    status: "pending_approval",
    statusHistory: [
      {
        status: "pending_approval",
        timestamp: Timestamp.now(),
        updatedBy: "user-1",
        note: "Order placed",
      },
    ],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    ...overrides,
  };
}

function mockGetDocsResult(orders: FirestoreOrder[]) {
  return {
    docs: orders.map((o) => ({
      id: o.id,
      data: () => o,
      exists: () => true,
      ref: { id: o.id },
    })),
    empty: orders.length === 0,
    size: orders.length,
    forEach: (fn: (d: { data: () => FirestoreOrder }) => void) =>
      orders.forEach((o) => fn({ data: () => o })),
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------
describe("FirebaseOrdersService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(doc).mockReturnValue(mockDocRef as any);
    jest.mocked(collection).mockReturnValue(mockCollectionRef as any);
    jest.mocked(query).mockReturnValue("mock-query" as any);
    jest.mocked(where).mockReturnValue("mock-where" as any);
    jest.mocked(orderBy).mockReturnValue("mock-orderBy" as any);
    jest.mocked(limit).mockReturnValue("mock-limit" as any);
  });

  // ========================================================================
  // createOrder
  // ========================================================================
  describe("createOrder", () => {
    it("creates an order with correct structure and returns orderId", async () => {
      const data = makeOrderData();
      const orderId = await FirebaseOrdersService.createOrder(data);

      expect(orderId).toContain("user-1-");
      expect(setDoc).toHaveBeenCalledTimes(1);

      const savedOrder = jest.mocked(setDoc).mock.calls[0][1] as FirestoreOrder;
      expect(savedOrder.userId).toBe("user-1");
      expect(savedOrder.status).toBe("pending_approval");
      expect(savedOrder.paymentStatus).toBe("pending");
      expect(savedOrder.total).toBe(1170);
      expect(savedOrder.orderNumber).toMatch(/^MASH-\d{8}-\d{3}$/);
      expect(savedOrder.statusHistory).toHaveLength(1);
      expect(savedOrder.statusHistory[0].status).toBe("pending_approval");
    });

    it("sends order notification after creation", async () => {
      const data = makeOrderData();
      await FirebaseOrdersService.createOrder(data);

      expect(NotificationTemplates.orderPlaced).toHaveBeenCalled();
      expect(
        FirebaseNotificationsService.createOrderNotification
      ).toHaveBeenCalledWith(
        "user-1",
        expect.any(String),
        expect.stringMatching(/^MASH-/),
        "order_placed",
        "Order Placed",
        "Your order has been placed"
      );
    });

    it("includes optional fields when provided", async () => {
      const data = makeOrderData({
        deliveryMethod: "lalamove",
        deliveryAddress: {
          address: "123 Main St",
          lat: 14.5,
          lng: 121.0,
          name: "John",
          phone: "+639171234567",
        },
        lalamoveQuotationId: "quote-123",
        lalamoveScheduleAt: "2026-01-10T10:00:00Z",
        lalamoveVehicleType: "MOTORCYCLE",
        lalamoveDistance: "5.2km",
        notes: "Leave at front gate",
      });

      await FirebaseOrdersService.createOrder(data);
      const savedOrder = jest.mocked(setDoc).mock.calls[0][1] as FirestoreOrder;

      expect(savedOrder.deliveryAddress).toBeDefined();
      expect(savedOrder.lalamoveQuotationId).toBe("quote-123");
      expect(savedOrder.lalamoveVehicleType).toBe("MOTORCYCLE");
      expect(savedOrder.notes).toBe("Leave at front gate");
    });

    it("does not fail if notification fails", async () => {
      jest
        .mocked(FirebaseNotificationsService.createOrderNotification)
        .mockRejectedValueOnce(new Error("Notification failed"));

      const data = makeOrderData();
      const orderId = await FirebaseOrdersService.createOrder(data);

      expect(orderId).toBeDefined();
      expect(setDoc).toHaveBeenCalledTimes(1);
    });

    it("throws if setDoc fails", async () => {
      jest.mocked(setDoc).mockRejectedValueOnce(new Error("Firestore error"));

      await expect(
        FirebaseOrdersService.createOrder(makeOrderData())
      ).rejects.toThrow("Firestore error");
    });
  });

  // ========================================================================
  // getUserOrders
  // ========================================================================
  describe("getUserOrders", () => {
    it("returns orders for a user", async () => {
      const orders = [makeFirestoreOrder(), makeFirestoreOrder({ id: "order-2" })];
      jest.mocked(getDocs).mockResolvedValueOnce(mockGetDocsResult(orders) as any);

      const result = await FirebaseOrdersService.getUserOrders("user-1");

      expect(where).toHaveBeenCalledWith("userId", "==", "user-1");
      expect(orderBy).toHaveBeenCalledWith("createdAt", "desc");
      expect(result).toHaveLength(2);
    });

    it("returns empty array on error", async () => {
      jest.mocked(getDocs).mockRejectedValueOnce(new Error("Fail"));

      const result = await FirebaseOrdersService.getUserOrders("user-1");
      expect(result).toEqual([]);
    });
  });

  // ========================================================================
  // getOrder
  // ========================================================================
  describe("getOrder", () => {
    it("returns order when it exists", async () => {
      const order = makeFirestoreOrder();
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => order,
      } as any);

      const result = await FirebaseOrdersService.getOrder("order-1");
      expect(result).toEqual(order);
      expect(doc).toHaveBeenCalledWith(expect.anything(), "orders", "order-1");
    });

    it("returns null when order does not exist", async () => {
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
        data: () => null,
      } as any);

      const result = await FirebaseOrdersService.getOrder("nonexistent");
      expect(result).toBeNull();
    });

    it("returns null on error", async () => {
      jest.mocked(getDoc).mockRejectedValueOnce(new Error("Fail"));

      const result = await FirebaseOrdersService.getOrder("order-1");
      expect(result).toBeNull();
    });
  });

  // ========================================================================
  // getOrderByNumber
  // ========================================================================
  describe("getOrderByNumber", () => {
    it("returns order when found", async () => {
      const order = makeFirestoreOrder();
      jest
        .mocked(getDocs)
        .mockResolvedValueOnce(mockGetDocsResult([order]) as any);

      const result = await FirebaseOrdersService.getOrderByNumber(
        "MASH-20260101-001"
      );

      expect(where).toHaveBeenCalledWith(
        "orderNumber",
        "==",
        "MASH-20260101-001"
      );
      expect(limit).toHaveBeenCalledWith(1);
      expect(result).toEqual(order);
    });

    it("returns null when not found", async () => {
      jest
        .mocked(getDocs)
        .mockResolvedValueOnce(mockGetDocsResult([]) as any);

      const result = await FirebaseOrdersService.getOrderByNumber("MASH-NONE");
      expect(result).toBeNull();
    });

    it("returns null on error", async () => {
      jest.mocked(getDocs).mockRejectedValueOnce(new Error("Fail"));

      const result = await FirebaseOrdersService.getOrderByNumber("MASH-ERR");
      expect(result).toBeNull();
    });
  });

  // ========================================================================
  // subscribeToOrder
  // ========================================================================
  describe("subscribeToOrder", () => {
    it("calls onSnapshot with order ref", () => {
      const onUpdate = jest.fn();
      const onError = jest.fn();

      FirebaseOrdersService.subscribeToOrder("order-1", onUpdate, onError);

      expect(onSnapshot).toHaveBeenCalledWith(
        mockDocRef,
        expect.any(Function),
        expect.any(Function)
      );
    });

    it("returns unsubscribe function", () => {
      const unsubscribe = jest.fn();
      jest.mocked(onSnapshot).mockReturnValueOnce(unsubscribe as any);

      const result = FirebaseOrdersService.subscribeToOrder(
        "order-1",
        jest.fn()
      );
      expect(result).toBe(unsubscribe);
    });
  });

  // ========================================================================
  // subscribeToUserOrders
  // ========================================================================
  describe("subscribeToUserOrders", () => {
    it("sets up snapshot with userId query", () => {
      const onUpdate = jest.fn();
      FirebaseOrdersService.subscribeToUserOrders("user-1", onUpdate);

      expect(where).toHaveBeenCalledWith("userId", "==", "user-1");
      expect(onSnapshot).toHaveBeenCalled();
    });
  });

  // ========================================================================
  // getPendingOrders
  // ========================================================================
  describe("getPendingOrders", () => {
    it("queries for pending_approval status", async () => {
      const orders = [makeFirestoreOrder()];
      jest.mocked(getDocs).mockResolvedValueOnce(mockGetDocsResult(orders) as any);

      const result = await FirebaseOrdersService.getPendingOrders();

      expect(where).toHaveBeenCalledWith("status", "==", "pending_approval");
      expect(orderBy).toHaveBeenCalledWith("createdAt", "asc");
      expect(result).toHaveLength(1);
    });

    it("returns empty array on error", async () => {
      jest.mocked(getDocs).mockRejectedValueOnce(new Error("Fail"));
      const result = await FirebaseOrdersService.getPendingOrders();
      expect(result).toEqual([]);
    });
  });

  // ========================================================================
  // getAllOrders
  // ========================================================================
  describe("getAllOrders", () => {
    it("returns all orders ordered by createdAt desc", async () => {
      const orders = [makeFirestoreOrder(), makeFirestoreOrder({ id: "o-2" })];
      jest.mocked(getDocs).mockResolvedValueOnce(mockGetDocsResult(orders) as any);

      const result = await FirebaseOrdersService.getAllOrders();

      expect(orderBy).toHaveBeenCalledWith("createdAt", "desc");
      expect(result).toHaveLength(2);
    });

    it("applies limit when provided", async () => {
      jest.mocked(getDocs).mockResolvedValueOnce(mockGetDocsResult([]) as any);

      await FirebaseOrdersService.getAllOrders(10);
      expect(limit).toHaveBeenCalledWith(10);
    });

    it("returns empty array on error", async () => {
      jest.mocked(getDocs).mockRejectedValueOnce(new Error("Fail"));
      const result = await FirebaseOrdersService.getAllOrders();
      expect(result).toEqual([]);
    });
  });

  // ========================================================================
  // getOrdersByStatus
  // ========================================================================
  describe("getOrdersByStatus", () => {
    it("queries by specific status", async () => {
      jest.mocked(getDocs).mockResolvedValueOnce(mockGetDocsResult([]) as any);

      await FirebaseOrdersService.getOrdersByStatus("approved");

      expect(where).toHaveBeenCalledWith("status", "==", "approved");
      expect(orderBy).toHaveBeenCalledWith("createdAt", "desc");
    });
  });

  // ========================================================================
  // subscribeToPendingOrders / subscribeToAllOrders
  // ========================================================================
  describe("subscribeToPendingOrders", () => {
    it("sets up snapshot with pending_approval filter", () => {
      FirebaseOrdersService.subscribeToPendingOrders(jest.fn());

      expect(where).toHaveBeenCalledWith("status", "==", "pending_approval");
      expect(onSnapshot).toHaveBeenCalled();
    });
  });

  describe("subscribeToAllOrders", () => {
    it("sets up snapshot for all orders", () => {
      FirebaseOrdersService.subscribeToAllOrders(jest.fn());

      expect(orderBy).toHaveBeenCalledWith("createdAt", "desc");
      expect(onSnapshot).toHaveBeenCalled();
    });
  });

  // ========================================================================
  // approveOrder
  // ========================================================================
  describe("approveOrder", () => {
    it("approves a pending order via transaction", async () => {
      const order = makeFirestoreOrder({ status: "pending_approval", statusHistory: [] });
      jest.mocked(runTransaction).mockImplementation((_db, updateFn) => {
        const tx = {
          get: jest.fn().mockResolvedValue({
            exists: () => true,
            data: () => order,
          }),
          update: jest.fn(),
          set: jest.fn(),
          delete: jest.fn(),
        };
        return updateFn(tx);
      });

      await FirebaseOrdersService.approveOrder("order-1", "admin-1");

      expect(runTransaction).toHaveBeenCalled();
    });

    it("throws when order is not pending_approval", async () => {
      const order = makeFirestoreOrder({ status: "approved" });
      jest.mocked(runTransaction).mockImplementation((_db, updateFn) => {
        const tx = {
          get: jest.fn().mockResolvedValue({
            exists: () => true,
            data: () => order,
          }),
          update: jest.fn(),
          set: jest.fn(),
          delete: jest.fn(),
        };
        return updateFn(tx);
      });

      await expect(
        FirebaseOrdersService.approveOrder("order-1", "admin-1")
      ).rejects.toThrow("Order is not pending approval");
    });

    it("throws when order not found", async () => {
      jest.mocked(runTransaction).mockImplementation((_db, updateFn) => {
        const tx = {
          get: jest.fn().mockResolvedValue({
            exists: () => false,
            data: () => null,
          }),
          update: jest.fn(),
          set: jest.fn(),
          delete: jest.fn(),
        };
        return updateFn(tx);
      });

      await expect(
        FirebaseOrdersService.approveOrder("order-1", "admin-1")
      ).rejects.toThrow("Order not found");
    });

    it("falls back to 'system' for invalid adminId", async () => {
      const order = makeFirestoreOrder({ status: "pending_approval", statusHistory: [] });
      let capturedUpdateData: Record<string, unknown> = {};

      jest.mocked(runTransaction).mockImplementation((_db, updateFn) => {
        const tx = {
          get: jest.fn().mockResolvedValue({
            exists: () => true,
            data: () => order,
          }),
          update: jest.fn((ref, data) => {
            capturedUpdateData = data;
          }),
          set: jest.fn(),
          delete: jest.fn(),
        };
        return updateFn(tx);
      });

      await FirebaseOrdersService.approveOrder("order-1", "undefined");

      expect(capturedUpdateData.approvedBy).toBe("system");
    });
  });

  // ========================================================================
  // rejectOrder
  // ========================================================================
  describe("rejectOrder", () => {
    it("rejects an order with reason via transaction", async () => {
      const order = makeFirestoreOrder({
        status: "pending_approval",
        statusHistory: [],
      });
      let capturedUpdateData: Record<string, unknown> = {};

      jest.mocked(runTransaction).mockImplementation((_db, updateFn) => {
        const tx = {
          get: jest.fn().mockResolvedValue({
            exists: () => true,
            data: () => order,
          }),
          update: jest.fn((_ref, data) => {
            capturedUpdateData = data;
          }),
          set: jest.fn(),
          delete: jest.fn(),
        };
        return updateFn(tx);
      });

      await FirebaseOrdersService.rejectOrder(
        "order-1",
        "admin-1",
        "Out of stock"
      );

      expect(capturedUpdateData.status).toBe("rejected");
      expect(capturedUpdateData.rejectionReason).toBe("Out of stock");
    });

    it("throws when order not found", async () => {
      jest.mocked(runTransaction).mockImplementation((_db, updateFn) => {
        const tx = {
          get: jest.fn().mockResolvedValue({
            exists: () => false,
            data: () => null,
          }),
          update: jest.fn(),
          set: jest.fn(),
          delete: jest.fn(),
        };
        return updateFn(tx);
      });

      await expect(
        FirebaseOrdersService.rejectOrder("order-1", "admin-1", "test")
      ).rejects.toThrow("Order not found");
    });

    it("uses default reason when invalid", async () => {
      const order = makeFirestoreOrder({ status: "pending_approval", statusHistory: [] });
      let capturedUpdateData: Record<string, unknown> = {};

      jest.mocked(runTransaction).mockImplementation((_db, updateFn) => {
        const tx = {
          get: jest.fn().mockResolvedValue({
            exists: () => true,
            data: () => order,
          }),
          update: jest.fn((_ref, data) => {
            capturedUpdateData = data;
          }),
          set: jest.fn(),
          delete: jest.fn(),
        };
        return updateFn(tx);
      });

      await FirebaseOrdersService.rejectOrder(
        "order-1",
        "admin-1",
        "undefined"
      );

      expect(capturedUpdateData.rejectionReason).toBe(
        "Order rejected by seller"
      );
    });
  });

  // ========================================================================
  // updateOrderStatus
  // ========================================================================
  describe("updateOrderStatus", () => {
    it("updates status and sends notification", async () => {
      const order = makeFirestoreOrder({
        status: "approved",
        statusHistory: [],
      });

      // First getDoc for pre-transaction read
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => order,
      } as any);

      // Transaction
      jest.mocked(runTransaction).mockImplementation((_db, updateFn) => {
        const tx = {
          get: jest.fn().mockResolvedValue({
            exists: () => true,
            data: () => order,
          }),
          update: jest.fn(),
          set: jest.fn(),
          delete: jest.fn(),
        };
        return updateFn(tx);
      });

      await FirebaseOrdersService.updateOrderStatus(
        "order-1",
        "processing",
        "admin-1",
        "Started processing"
      );

      expect(runTransaction).toHaveBeenCalled();
      expect(
        FirebaseNotificationsService.createOrderNotification
      ).toHaveBeenCalledWith(
        "user-1",
        "order-1",
        "MASH-20260101-001",
        "order_processing",
        "Processing",
        "Your order is being processed"
      );
    });

    it("throws when order not found before transaction", async () => {
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
        data: () => null,
      } as any);

      await expect(
        FirebaseOrdersService.updateOrderStatus(
          "order-1",
          "processing",
          "admin-1"
        )
      ).rejects.toThrow("Order not found");
    });

    it("does not send notification for cancelled status", async () => {
      const order = makeFirestoreOrder({
        status: "approved",
        statusHistory: [],
      });

      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => order,
      } as any);

      jest.mocked(runTransaction).mockImplementation((_db, updateFn) => {
        const tx = {
          get: jest.fn().mockResolvedValue({
            exists: () => true,
            data: () => order,
          }),
          update: jest.fn(),
          set: jest.fn(),
          delete: jest.fn(),
        };
        return updateFn(tx);
      });

      await FirebaseOrdersService.updateOrderStatus(
        "order-1",
        "cancelled",
        "admin-1"
      );

      // Notification should NOT be called for cancelled status
      expect(
        FirebaseNotificationsService.createOrderNotification
      ).not.toHaveBeenCalled();
    });

    it("sends notification for shipped status", async () => {
      const order = makeFirestoreOrder({ status: "processing", statusHistory: [] });

      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => order,
      } as any);

      jest.mocked(runTransaction).mockImplementation((_db, updateFn) => {
        const tx = {
          get: jest.fn().mockResolvedValue({
            exists: () => true,
            data: () => order,
          }),
          update: jest.fn(),
          set: jest.fn(),
          delete: jest.fn(),
        };
        return updateFn(tx);
      });

      await FirebaseOrdersService.updateOrderStatus(
        "order-1",
        "shipped",
        "admin-1"
      );

      expect(
        FirebaseNotificationsService.createOrderNotification
      ).toHaveBeenCalledWith(
        "user-1",
        "order-1",
        "MASH-20260101-001",
        "order_shipped",
        "Shipped",
        "Your order has been shipped"
      );
    });

    it("uses 'system' for invalid updatedBy", async () => {
      const order = makeFirestoreOrder({ status: "approved", statusHistory: [] });

      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => order,
      } as any);

      let capturedHistoryEntry: { updatedBy: string } | undefined;
      jest.mocked(runTransaction).mockImplementation((_db, updateFn) => {
        const tx = {
          get: jest.fn().mockResolvedValue({
            exists: () => true,
            data: () => order,
          }),
          update: jest.fn((_ref, data: any) => {
            const history = data.statusHistory;
            capturedHistoryEntry = history[history.length - 1];
          }),
          set: jest.fn(),
          delete: jest.fn(),
        };
        return updateFn(tx);
      });

      await FirebaseOrdersService.updateOrderStatus(
        "order-1",
        "processing",
        "undefined"
      );

      expect(capturedHistoryEntry?.updatedBy).toBe("system");
    });
  });

  // ========================================================================
  // listenToOrder
  // ========================================================================
  describe("listenToOrder", () => {
    it("calls onSnapshot and returns unsubscribe", () => {
      const unsub = jest.fn();
      jest.mocked(onSnapshot).mockReturnValueOnce(unsub as any);

      const callback = jest.fn();
      const result = FirebaseOrdersService.listenToOrder("order-1", callback);

      expect(onSnapshot).toHaveBeenCalledWith(
        mockDocRef,
        expect.any(Function),
        expect.any(Function)
      );
      expect(result).toBe(unsub);
    });
  });

  // ========================================================================
  // setLalamoveOrderId
  // ========================================================================
  describe("setLalamoveOrderId", () => {
    it("sets lalamove order ID with merge", async () => {
      await FirebaseOrdersService.setLalamoveOrderId(
        "order-1",
        "lala-123",
        "https://share.link"
      );

      expect(setDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          lalamoveOrderId: "lala-123",
          lalamoveTracking: expect.objectContaining({
            status: "ASSIGNING_DRIVER",
            shareLink: "https://share.link",
          }),
        }),
        { merge: true }
      );
    });

    it("omits shareLink when not provided", async () => {
      await FirebaseOrdersService.setLalamoveOrderId("order-1", "lala-123");

      const callData = jest.mocked(setDoc).mock.calls[0][1] as any;
      expect(callData.lalamoveTracking.shareLink).toBeUndefined();
    });

    it("throws on failure", async () => {
      jest.mocked(setDoc).mockRejectedValueOnce(new Error("Fail"));

      await expect(
        FirebaseOrdersService.setLalamoveOrderId("order-1", "lala-123")
      ).rejects.toThrow("Fail");
    });
  });

  // ========================================================================
  // updateLalamoveTracking
  // ========================================================================
  describe("updateLalamoveTracking", () => {
    it("merges tracking data into existing order", async () => {
      const order = makeFirestoreOrder({
        lalamoveTracking: {
          orderId: "lala-123",
          quotationId: "quote-1",
          status: "ASSIGNING_DRIVER",
          createdAt: new Date(),
          lastUpdated: new Date(),
        },
      });

      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => order,
      } as any);

      await FirebaseOrdersService.updateLalamoveTracking("order-1", {
        status: "ON_GOING",
      });

      expect(setDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          lalamoveTracking: expect.objectContaining({
            status: "ON_GOING",
          }),
        }),
        { merge: true }
      );
    });

    it("sends notification when driver is assigned", async () => {
      const order = makeFirestoreOrder({
        orderNumber: "MASH-20260101-001",
      });

      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => order,
      } as any);

      await FirebaseOrdersService.updateLalamoveTracking("order-1", {
        driver: {
          id: "driver-1",
          name: "Juan",
          phone: "+639171111111",
          plateNumber: "ABC 123",
        },
      });

      expect(NotificationTemplates.driverAssigned).toHaveBeenCalledWith(
        "MASH-20260101-001",
        "Juan"
      );
      expect(
        FirebaseNotificationsService.createOrderNotification
      ).toHaveBeenCalledWith(
        "user-1",
        "order-1",
        "MASH-20260101-001",
        "driver_assigned",
        "Driver Assigned",
        "Juan assigned to your order"
      );
    });

    it("handles non-existent order gracefully", async () => {
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
        data: () => null,
      } as any);

      // Should not throw; existingOrder will be null
      await FirebaseOrdersService.updateLalamoveTracking("order-1", {
        status: "ON_GOING",
      });

      expect(setDoc).toHaveBeenCalled();
    });
  });

  // ========================================================================
  // cancelOrder
  // ========================================================================
  describe("cancelOrder", () => {
    it.each(["pending_approval", "approved", "processing"] as const)(
      "cancels order with status %s",
      async (status) => {
        const order = makeFirestoreOrder({ status, statusHistory: [] });
        let capturedUpdateData: Record<string, unknown> = {};

        jest.mocked(runTransaction).mockImplementation((_db, updateFn) => {
          const tx = {
            get: jest.fn().mockResolvedValue({
              exists: () => true,
              data: () => order,
            }),
            update: jest.fn((_ref, data) => {
              capturedUpdateData = data;
            }),
            set: jest.fn(),
            delete: jest.fn(),
          };
          return updateFn(tx);
        });

        await FirebaseOrdersService.cancelOrder(
          "order-1",
          "user-1",
          "Changed my mind"
        );

        expect(capturedUpdateData.status).toBe("cancelled");
      }
    );

    it.each(["shipped", "delivered", "completed", "rejected", "cancelled"] as const)(
      "throws for non-cancellable status %s",
      async (status) => {
        const order = makeFirestoreOrder({ status });

        jest.mocked(runTransaction).mockImplementation((_db, updateFn) => {
          const tx = {
            get: jest.fn().mockResolvedValue({
              exists: () => true,
              data: () => order,
            }),
            update: jest.fn(),
            set: jest.fn(),
            delete: jest.fn(),
          };
          return updateFn(tx);
        });

        await expect(
          FirebaseOrdersService.cancelOrder("order-1", "user-1")
        ).rejects.toThrow("Cannot cancel order with status");
      }
    );

    it("throws when order not found", async () => {
      jest.mocked(runTransaction).mockImplementation((_db, updateFn) => {
        const tx = {
          get: jest.fn().mockResolvedValue({
            exists: () => false,
            data: () => null,
          }),
          update: jest.fn(),
          set: jest.fn(),
          delete: jest.fn(),
        };
        return updateFn(tx);
      });

      await expect(
        FirebaseOrdersService.cancelOrder("order-1", "user-1")
      ).rejects.toThrow("Order not found");
    });

    it("uses default cancellation note when no reason provided", async () => {
      const order = makeFirestoreOrder({
        status: "pending_approval",
        statusHistory: [],
      });
      let capturedHistory: Array<{ note: string }> = [];

      jest.mocked(runTransaction).mockImplementation((_db, updateFn) => {
        const tx = {
          get: jest.fn().mockResolvedValue({
            exists: () => true,
            data: () => order,
          }),
          update: jest.fn((_ref, data: any) => {
            capturedHistory = data.statusHistory;
          }),
          set: jest.fn(),
          delete: jest.fn(),
        };
        return updateFn(tx);
      });

      await FirebaseOrdersService.cancelOrder("order-1", "user-1");

      expect(capturedHistory[capturedHistory.length - 1].note).toBe(
        "Order cancelled"
      );
    });
  });

  // ========================================================================
  // updatePaymentStatus
  // ========================================================================
  describe("updatePaymentStatus", () => {
    it("updates payment status with merge", async () => {
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => makeFirestoreOrder(),
      } as any);

      await FirebaseOrdersService.updatePaymentStatus("order-1", {
        status: "paid",
        paymentId: "pay-123",
        paidAt: "2026-01-10T10:00:00Z",
      });

      expect(setDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          paymentStatus: "paid",
          "payment.paymentId": "pay-123",
          "payment.paidAt": "2026-01-10T10:00:00Z",
        }),
        { merge: true }
      );
    });

    it("returns early when order not found", async () => {
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
        data: () => null,
      } as any);

      await FirebaseOrdersService.updatePaymentStatus("order-1", {
        status: "paid",
      });

      expect(setDoc).not.toHaveBeenCalled();
    });

    it("includes optional payment fields when provided", async () => {
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => makeFirestoreOrder(),
      } as any);

      await FirebaseOrdersService.updatePaymentStatus("order-1", {
        status: "paid",
        paymentIntentId: "pi-123",
        sourceId: "src-456",
        failedAt: "2026-01-10T12:00:00Z",
      });

      const callData = jest.mocked(setDoc).mock.calls[0][1] as Record<string, unknown>;
      expect(callData["payment.paymentIntentId"]).toBe("pi-123");
      expect(callData["payment.sourceId"]).toBe("src-456");
      expect(callData["payment.failedAt"]).toBe("2026-01-10T12:00:00Z");
    });

    it("throws on firestore error", async () => {
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => makeFirestoreOrder(),
      } as any);
      jest.mocked(setDoc).mockRejectedValueOnce(new Error("Write failed"));

      await expect(
        FirebaseOrdersService.updatePaymentStatus("order-1", {
          status: "failed",
        })
      ).rejects.toThrow("Write failed");
    });
  });

  // ========================================================================
  // updateOrderPaymentStatus (standalone)
  // ========================================================================
  describe("updateOrderPaymentStatus", () => {
    it("delegates to FirebaseOrdersService.updatePaymentStatus", async () => {
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => makeFirestoreOrder(),
      } as any);

      await updateOrderPaymentStatus("order-1", { status: "paid" });

      expect(setDoc).toHaveBeenCalled();
    });
  });
});
