/**
 * @jest-environment jsdom
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { useNotifications } from "../useNotifications";

// ---------- mock NotificationsApi ----------
jest.mock("@/lib/api/notifications", () => {
  const actual = jest.requireActual("@/lib/api/notifications");
  return {
    ...actual,
    NotificationsApi: {
      getNotifications: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      deleteNotification: jest.fn(),
    },
  };
});

const {
  NotificationsApi,
} = jest.requireMock("@/lib/api/notifications") as {
  NotificationsApi: {
    getNotifications: jest.Mock;
    markAsRead: jest.Mock;
    markAllAsRead: jest.Mock;
    deleteNotification: jest.Mock;
  };
};

// ---------- helpers ----------
const sampleNotifications = [
  { id: "1", title: "Order", message: "New order", isRead: false, type: "order", priority: "high", time: "2m ago" },
  { id: "2", title: "Payment", message: "Payment received", isRead: true, type: "payment", priority: "medium", time: "1h ago" },
  { id: "3", title: "Review", message: "New review", isRead: false, type: "review", priority: "low", time: "3h ago" },
];

function successResponse(notifications = sampleNotifications, unreadCount?: number) {
  return {
    success: true,
    data: {
      notifications,
      unreadCount: unreadCount ?? notifications.filter((n) => !n.isRead).length,
    },
  };
}

// ---------- tests ----------
describe("useNotifications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: resolved so loading state tests don't leak pending promises
    NotificationsApi.getNotifications.mockResolvedValue(
      successResponse([])
    );
  });

  // --- initial / loading ---
  it("should start in loading state", () => {
    const { result } = renderHook(() => useNotifications());
    // First synchronous render always shows loading before effect fires
    expect(result.current.loading).toBe(true);
    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.error).toBeNull();
  });

  // --- successful fetch ---
  it(
    "should fetch notifications on mount",
    async () => {
      NotificationsApi.getNotifications.mockResolvedValueOnce(successResponse());

      const { result } = renderHook(() => useNotifications());
      await waitFor(() => expect(result.current.loading).toBe(false), {
        timeout: 10000,
      });

      expect(result.current.notifications).toHaveLength(3);
      expect(result.current.unreadCount).toBe(2);
      expect(result.current.error).toBeNull();
      expect(NotificationsApi.getNotifications).toHaveBeenCalledWith(undefined);
    },
    30000
  );

  // --- params forwarded ---
  it("should forward params to API", async () => {
    NotificationsApi.getNotifications.mockResolvedValueOnce(successResponse([]));

    const params = { type: "order", isRead: false, limit: 5, page: 1 };
    const { result } = renderHook(() => useNotifications(params));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(NotificationsApi.getNotifications).toHaveBeenCalledWith(params);
  });

  // --- API returns success: false ---
  it("should set error when API returns success: false", async () => {
    NotificationsApi.getNotifications.mockResolvedValueOnce({
      success: false,
      message: "Unauthorized",
    });

    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Unauthorized");
    expect(result.current.notifications).toEqual([]);
  });

  it("should use default error message when success: false without message", async () => {
    NotificationsApi.getNotifications.mockResolvedValueOnce({ success: false });

    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Failed to fetch notifications");
  });

  // --- thrown error ---
  it("should handle thrown Error object", async () => {
    NotificationsApi.getNotifications.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Network error");
  });

  it("should handle thrown non-Error value", async () => {
    NotificationsApi.getNotifications.mockRejectedValueOnce("string error");

    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Failed to fetch notifications");
  });

  // --- refetch ---
  it("should support manual refetch", async () => {
    NotificationsApi.getNotifications
      .mockResolvedValueOnce(successResponse([sampleNotifications[0]], 1))
      .mockResolvedValueOnce(successResponse());

    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.notifications).toHaveLength(1);

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.notifications).toHaveLength(3);
    expect(NotificationsApi.getNotifications).toHaveBeenCalledTimes(2);
  });

  // --- markAsRead ---
  describe("markAsRead", () => {
    it("should update local state on success", async () => {
      NotificationsApi.getNotifications.mockResolvedValueOnce(successResponse());
      NotificationsApi.markAsRead.mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useNotifications());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.unreadCount).toBe(2);

      await act(async () => {
        await result.current.markAsRead("1");
      });

      expect(NotificationsApi.markAsRead).toHaveBeenCalledWith("1");
      const updated = result.current.notifications.find((n) => n.id === "1");
      expect(updated?.isRead).toBe(true);
      expect(result.current.unreadCount).toBe(1);
    });

    it("should not update state when API returns success: false", async () => {
      NotificationsApi.getNotifications.mockResolvedValueOnce(successResponse());
      NotificationsApi.markAsRead.mockResolvedValueOnce({ success: false });

      const { result } = renderHook(() => useNotifications());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.markAsRead("1");
      });

      const n = result.current.notifications.find((n) => n.id === "1");
      expect(n?.isRead).toBe(false);
      expect(result.current.unreadCount).toBe(2);
    });

    it("should handle thrown error gracefully", async () => {
      NotificationsApi.getNotifications.mockResolvedValueOnce(successResponse());
      NotificationsApi.markAsRead.mockRejectedValueOnce(new Error("fail"));

      const { result } = renderHook(() => useNotifications());
      await waitFor(() => expect(result.current.loading).toBe(false));

      // Should not throw to caller
      await act(async () => {
        await result.current.markAsRead("1");
      });

      expect(result.current.unreadCount).toBe(2);
    });

    it("should not decrement unreadCount below zero", async () => {
      // Start with all read
      const allRead = sampleNotifications.map((n) => ({ ...n, isRead: true }));
      NotificationsApi.getNotifications.mockResolvedValueOnce(successResponse(allRead, 0));
      NotificationsApi.markAsRead.mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useNotifications());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.unreadCount).toBe(0);

      await act(async () => {
        await result.current.markAsRead("1");
      });

      // Already read, marking again shouldn't change unreadCount since isRead is already true
      // and the Map callback sets isRead=true regardless
      expect(result.current.unreadCount).toBe(0);
    });
  });

  // --- markAllAsRead ---
  describe("markAllAsRead", () => {
    it("should mark all notifications as read on success", async () => {
      NotificationsApi.getNotifications.mockResolvedValueOnce(successResponse());
      NotificationsApi.markAllAsRead.mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useNotifications());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.unreadCount).toBe(2);

      await act(async () => {
        await result.current.markAllAsRead();
      });

      expect(NotificationsApi.markAllAsRead).toHaveBeenCalled();
      expect(result.current.unreadCount).toBe(0);
      expect(result.current.notifications.every((n) => n.isRead)).toBe(true);
    });

    it("should not update state when API returns success: false", async () => {
      NotificationsApi.getNotifications.mockResolvedValueOnce(successResponse());
      NotificationsApi.markAllAsRead.mockResolvedValueOnce({ success: false });

      const { result } = renderHook(() => useNotifications());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.markAllAsRead();
      });

      expect(result.current.unreadCount).toBe(2);
    });

    it("should handle thrown error gracefully", async () => {
      NotificationsApi.getNotifications.mockResolvedValueOnce(successResponse());
      NotificationsApi.markAllAsRead.mockRejectedValueOnce(new Error("fail"));

      const { result } = renderHook(() => useNotifications());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.markAllAsRead();
      });

      expect(result.current.unreadCount).toBe(2);
    });
  });

  // --- removeNotification ---
  describe("removeNotification", () => {
    it("should remove notification from local state on success", async () => {
      NotificationsApi.getNotifications.mockResolvedValueOnce(successResponse());
      NotificationsApi.deleteNotification.mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useNotifications());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.notifications).toHaveLength(3);

      await act(async () => {
        await result.current.removeNotification("2"); // isRead=true
      });

      expect(NotificationsApi.deleteNotification).toHaveBeenCalledWith("2");
      expect(result.current.notifications).toHaveLength(2);
      expect(result.current.notifications.find((n) => n.id === "2")).toBeUndefined();
      // Unread count unchanged because removed item was read
      expect(result.current.unreadCount).toBe(2);
    });

    it("should decrement unreadCount when removing unread notification", async () => {
      NotificationsApi.getNotifications.mockResolvedValueOnce(successResponse());
      NotificationsApi.deleteNotification.mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useNotifications());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.unreadCount).toBe(2);

      await act(async () => {
        await result.current.removeNotification("1"); // isRead=false
      });

      expect(result.current.notifications).toHaveLength(2);
      expect(result.current.unreadCount).toBe(1);
    });

    it("should not update state when API returns success: false", async () => {
      NotificationsApi.getNotifications.mockResolvedValueOnce(successResponse());
      NotificationsApi.deleteNotification.mockResolvedValueOnce({ success: false });

      const { result } = renderHook(() => useNotifications());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.removeNotification("1");
      });

      expect(result.current.notifications).toHaveLength(3);
    });

    it("should handle thrown error gracefully", async () => {
      NotificationsApi.getNotifications.mockResolvedValueOnce(successResponse());
      NotificationsApi.deleteNotification.mockRejectedValueOnce(new Error("fail"));

      const { result } = renderHook(() => useNotifications());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.removeNotification("1");
      });

      expect(result.current.notifications).toHaveLength(3);
    });
  });
});
