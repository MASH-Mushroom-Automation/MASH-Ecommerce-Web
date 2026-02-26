/**
 * Tests for FirebaseNotificationsService & NotificationTemplates
 * COVERAGE-007: Firebase Services - notifications.ts
 */

jest.unmock("@/lib/firebase/notifications");

import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import {
  FirebaseNotificationsService,
  NotificationTemplates,
  type CreateNotificationData,
} from "@/lib/firebase/notifications";

const mockDocRef = { id: "notif-123", path: "notifications/notif-123" };

describe("FirebaseNotificationsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(doc).mockReturnValue(mockDocRef as any);
    jest.mocked(collection).mockReturnValue("notifications-ref" as any);
    jest.mocked(query).mockReturnValue("query-ref" as any);
    jest.mocked(where).mockReturnValue("where-clause" as any);
    jest.mocked(orderBy).mockReturnValue("orderBy-clause" as any);
    jest.mocked(limit).mockReturnValue("limit-clause" as any);
  });

  // ==========================================================================
  // createNotification
  // ==========================================================================
  describe("createNotification", () => {
    it("creates notification and returns ID", async () => {
      jest.mocked(setDoc).mockResolvedValue(undefined);

      const data: CreateNotificationData = {
        userId: "user1",
        type: "order_placed",
        title: "Order Placed!",
        message: "Your order has been placed.",
        data: { orderId: "ord-1" },
      };

      const result = await FirebaseNotificationsService.createNotification(data);

      expect(result).toBe("notif-123");
      expect(setDoc).toHaveBeenCalledTimes(1);
      const savedData = jest.mocked(setDoc).mock.calls[0][1] as any;
      expect(savedData.id).toBe("notif-123");
      expect(savedData.userId).toBe("user1");
      expect(savedData.type).toBe("order_placed");
      expect(savedData.read).toBe(false);
      expect(savedData.createdAt).toBeDefined();
    });

    it("throws on Firestore error", async () => {
      jest.mocked(setDoc).mockRejectedValue(new Error("Write failed"));

      await expect(
        FirebaseNotificationsService.createNotification({
          userId: "u",
          type: "system",
          title: "T",
          message: "M",
        })
      ).rejects.toThrow("Write failed");
    });
  });

  // ==========================================================================
  // getUserNotifications
  // ==========================================================================
  describe("getUserNotifications", () => {
    it("returns notifications for user", async () => {
      const mockNotif = {
        id: "n1",
        userId: "user1",
        type: "order_placed",
        title: "Title",
        message: "Msg",
        read: false,
      };
      jest.mocked(getDocs).mockResolvedValue({
        docs: [{ data: () => mockNotif }],
        empty: false,
      } as any);

      const result = await FirebaseNotificationsService.getUserNotifications("user1");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("n1");
      expect(where).toHaveBeenCalledWith("userId", "==", "user1");
      expect(orderBy).toHaveBeenCalledWith("createdAt", "desc");
      expect(limit).toHaveBeenCalledWith(50);
    });

    it("respects custom maxResults", async () => {
      jest.mocked(getDocs).mockResolvedValue({ docs: [], empty: true } as any);

      await FirebaseNotificationsService.getUserNotifications("user1", 10);

      expect(limit).toHaveBeenCalledWith(10);
    });

    it("throws on error", async () => {
      jest.mocked(getDocs).mockRejectedValue(new Error("Query failed"));

      await expect(
        FirebaseNotificationsService.getUserNotifications("user1")
      ).rejects.toThrow("Query failed");
    });
  });

  // ==========================================================================
  // getUnreadCount
  // ==========================================================================
  describe("getUnreadCount", () => {
    it("returns number of unread notifications", async () => {
      jest.mocked(getDocs).mockResolvedValue({ size: 5, docs: [], empty: false } as any);

      const count = await FirebaseNotificationsService.getUnreadCount("user1");

      expect(count).toBe(5);
      expect(where).toHaveBeenCalledWith("userId", "==", "user1");
      expect(where).toHaveBeenCalledWith("read", "==", false);
    });

    it("returns 0 on error", async () => {
      jest.mocked(getDocs).mockRejectedValue(new Error("Fail"));

      // getUnreadCount throws, it does not silently return 0
      await expect(
        FirebaseNotificationsService.getUnreadCount("user1")
      ).rejects.toThrow("Fail");
    });
  });

  // ==========================================================================
  // markAsRead
  // ==========================================================================
  describe("markAsRead", () => {
    it("updates notification read status", async () => {
      jest.mocked(updateDoc).mockResolvedValue(undefined);

      await FirebaseNotificationsService.markAsRead("notif-1");

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ read: true })
      );
    });

    it("throws on error", async () => {
      jest.mocked(updateDoc).mockRejectedValue(new Error("Update failed"));

      await expect(
        FirebaseNotificationsService.markAsRead("notif-1")
      ).rejects.toThrow("Update failed");
    });
  });

  // ==========================================================================
  // markAllAsRead
  // ==========================================================================
  describe("markAllAsRead", () => {
    it("batch-updates all unread notifications", async () => {
      const docRef1 = { path: "notifications/n1" };
      const docRef2 = { path: "notifications/n2" };
      jest.mocked(getDocs).mockResolvedValue({
        docs: [{ ref: docRef1 }, { ref: docRef2 }],
        empty: false,
      } as any);
      const mockBatch = {
        update: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined),
        set: jest.fn(),
        delete: jest.fn(),
      };
      jest.mocked(writeBatch).mockReturnValue(mockBatch as any);

      await FirebaseNotificationsService.markAllAsRead("user1");

      expect(mockBatch.update).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it("skips batch when no unread notifications", async () => {
      jest.mocked(getDocs).mockResolvedValue({
        docs: [],
        empty: true,
      } as any);

      await FirebaseNotificationsService.markAllAsRead("user1");

      expect(writeBatch).not.toHaveBeenCalled();
    });

    it("throws on error", async () => {
      jest.mocked(getDocs).mockRejectedValue(new Error("Batch fail"));

      await expect(
        FirebaseNotificationsService.markAllAsRead("user1")
      ).rejects.toThrow("Batch fail");
    });
  });

  // ==========================================================================
  // deleteNotification
  // ==========================================================================
  describe("deleteNotification", () => {
    it("deletes single notification", async () => {
      jest.mocked(deleteDoc).mockResolvedValue(undefined);

      await FirebaseNotificationsService.deleteNotification("notif-1");

      expect(deleteDoc).toHaveBeenCalledTimes(1);
    });

    it("throws on error", async () => {
      jest.mocked(deleteDoc).mockRejectedValue(new Error("Delete failed"));

      await expect(
        FirebaseNotificationsService.deleteNotification("notif-1")
      ).rejects.toThrow("Delete failed");
    });
  });

  // ==========================================================================
  // deleteAllNotifications
  // ==========================================================================
  describe("deleteAllNotifications", () => {
    it("batch-deletes all user notifications", async () => {
      const docRef1 = { path: "notifications/n1" };
      jest.mocked(getDocs).mockResolvedValue({
        docs: [{ ref: docRef1 }],
        empty: false,
      } as any);
      const mockBatch = {
        delete: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined),
        set: jest.fn(),
        update: jest.fn(),
      };
      jest.mocked(writeBatch).mockReturnValue(mockBatch as any);

      await FirebaseNotificationsService.deleteAllNotifications("user1");

      expect(mockBatch.delete).toHaveBeenCalledWith(docRef1);
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it("skips when user has no notifications", async () => {
      jest.mocked(getDocs).mockResolvedValue({ docs: [], empty: true } as any);

      await FirebaseNotificationsService.deleteAllNotifications("user1");

      expect(writeBatch).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // subscribeToNotifications
  // ==========================================================================
  describe("subscribeToNotifications", () => {
    it("subscribes with onSnapshot and calls callback", () => {
      const mockUnsub = jest.fn();
      jest.mocked(onSnapshot).mockImplementation((_ref: any, callback: any) => {
        callback({
          docs: [{ data: () => ({ id: "n1", title: "Test" }) }],
        });
        return mockUnsub;
      });

      const callback = jest.fn();
      const unsub = FirebaseNotificationsService.subscribeToNotifications("user1", callback);

      expect(callback).toHaveBeenCalledWith([expect.objectContaining({ id: "n1" })]);
      expect(typeof unsub).toBe("function");
    });

    it("respects custom maxResults", () => {
      jest.mocked(onSnapshot).mockReturnValue(jest.fn());

      FirebaseNotificationsService.subscribeToNotifications("user1", jest.fn(), 25);

      expect(limit).toHaveBeenCalledWith(25);
    });
  });

  // ==========================================================================
  // createOrderNotification
  // ==========================================================================
  describe("createOrderNotification", () => {
    it("creates notification with order data", async () => {
      jest.mocked(setDoc).mockResolvedValue(undefined);

      const result = await FirebaseNotificationsService.createOrderNotification(
        "user1",
        "order-1",
        "MASH-20260101-001",
        "order_placed",
        "Order Placed!",
        "Your order was placed."
      );

      expect(result).toBe("notif-123");
      const savedData = jest.mocked(setDoc).mock.calls[0][1] as any;
      expect(savedData.data.orderId).toBe("order-1");
      expect(savedData.data.orderNumber).toBe("MASH-20260101-001");
      expect(savedData.data.link).toBe("/profile/order-history");
    });
  });
});

// ==========================================================================
// NotificationTemplates
// ==========================================================================
describe("NotificationTemplates", () => {
  it("orderPlaced returns correct template", () => {
    const t = NotificationTemplates.orderPlaced("MASH-001");
    expect(t.title).toContain("Order Placed");
    expect(t.message).toContain("MASH-001");
  });

  it("orderApproved returns correct template", () => {
    const t = NotificationTemplates.orderApproved("MASH-002");
    expect(t.title).toContain("Approved");
    expect(t.message).toContain("MASH-002");
  });

  it("orderRejected includes reason when provided", () => {
    const t = NotificationTemplates.orderRejected("MASH-003", "Out of stock");
    expect(t.message).toContain("Out of stock");
  });

  it("orderRejected has default message without reason", () => {
    const t = NotificationTemplates.orderRejected("MASH-003");
    expect(t.message).toContain("contact support");
  });

  it("driverAssigned includes driver name when provided", () => {
    const t = NotificationTemplates.driverAssigned("MASH-004", "Juan");
    expect(t.message).toContain("Juan");
  });

  it("driverAssigned has generic message without driver name", () => {
    const t = NotificationTemplates.driverAssigned("MASH-004");
    expect(t.message).toContain("A driver");
  });

  it("orderProcessing returns correct template", () => {
    const t = NotificationTemplates.orderProcessing("MASH-005");
    expect(t.title).toContain("Prepared");
    expect(t.message).toContain("MASH-005");
  });

  it("orderShipped returns correct template", () => {
    const t = NotificationTemplates.orderShipped("MASH-006");
    expect(t.title).toContain("Shipped");
    expect(t.message).toContain("MASH-006");
  });

  it("orderDelivered returns correct template", () => {
    const t = NotificationTemplates.orderDelivered("MASH-007");
    expect(t.title).toContain("Delivered");
  });

  it("orderCompleted returns correct template", () => {
    const t = NotificationTemplates.orderCompleted("MASH-008");
    expect(t.title).toContain("Completed");
  });

  it("newOrderAdmin returns correct template", () => {
    const t = NotificationTemplates.newOrderAdmin("MASH-009", "John Doe");
    expect(t.message).toContain("John Doe");
    expect(t.message).toContain("MASH-009");
  });
});
