/**
 * Tests for src/lib/api/notifications.ts
 * Notifications API - mock data with filtering
 */
import { NotificationsApi } from "../notifications";

describe("NotificationsApi", () => {
  // Use fake timers to speed up the delay() calls
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Helper to resolve delayed promises
  async function resolveAsync<T>(promise: Promise<T>): Promise<T> {
    jest.advanceTimersByTime(500);
    return promise;
  }

  describe("getNotifications", () => {
    it("returns all notifications when no params", async () => {
      const promise = NotificationsApi.getNotifications();
      jest.advanceTimersByTime(500);
      const result = await promise;
      expect(result.success).toBe(true);
      expect(result.data.notifications.length).toBeGreaterThan(0);
      expect(typeof result.data.unreadCount).toBe("number");
    });

    it("filters by notification type", async () => {
      const result = await resolveAsync(
        NotificationsApi.getNotifications({ type: "order" })
      );
      expect(result.success).toBe(true);
      result.data.notifications.forEach((n) => {
        expect(n.type).toBe("order");
      });
    });

    it("filters unread notifications", async () => {
      const result = await resolveAsync(
        NotificationsApi.getNotifications({ type: "unread" })
      );
      expect(result.success).toBe(true);
      result.data.notifications.forEach((n) => {
        expect(n.isRead).toBe(false);
      });
    });

    it("filters read notifications", async () => {
      const result = await resolveAsync(
        NotificationsApi.getNotifications({ type: "read" })
      );
      expect(result.success).toBe(true);
      result.data.notifications.forEach((n) => {
        expect(n.isRead).toBe(true);
      });
    });

    it("filters by isRead param", async () => {
      const result = await resolveAsync(
        NotificationsApi.getNotifications({ isRead: false })
      );
      expect(result.success).toBe(true);
      result.data.notifications.forEach((n) => {
        expect(n.isRead).toBe(false);
      });
    });

    it("returns correct unread count", async () => {
      const result = await resolveAsync(NotificationsApi.getNotifications());
      const manualCount = result.data.notifications.filter((n) => !n.isRead).length;
      expect(result.data.unreadCount).toBe(manualCount);
    });

    it("returns all notifications when type is 'all'", async () => {
      const allResult = await resolveAsync(NotificationsApi.getNotifications());
      const typeAllResult = await resolveAsync(
        NotificationsApi.getNotifications({ type: "all" })
      );
      expect(typeAllResult.data.notifications.length).toBe(
        allResult.data.notifications.length
      );
    });

    it("each notification has required fields", async () => {
      const result = await resolveAsync(NotificationsApi.getNotifications());
      result.data.notifications.forEach((n) => {
        expect(n.id).toBeDefined();
        expect(n.title).toBeDefined();
        expect(n.message).toBeDefined();
        expect(n.time).toBeDefined();
        expect(typeof n.isRead).toBe("boolean");
        expect(n.type).toBeDefined();
        expect(n.priority).toBeDefined();
      });
    });
  });

  describe("markAsRead", () => {
    it("returns success", async () => {
      const result = await resolveAsync(
        NotificationsApi.markAsRead("1")
      );
      expect(result.success).toBe(true);
      expect(result.data.message).toBe("Notification marked as read");
    });
  });

  describe("markAllAsRead", () => {
    it("returns success", async () => {
      const result = await resolveAsync(NotificationsApi.markAllAsRead());
      expect(result.success).toBe(true);
      expect(result.data.message).toBe("All notifications marked as read");
    });
  });

  describe("deleteNotification", () => {
    it("returns success", async () => {
      const result = await resolveAsync(
        NotificationsApi.deleteNotification("1")
      );
      expect(result.success).toBe(true);
    });
  });
});
