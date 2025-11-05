/**
 * Custom hooks for notification operations
 */

import { useState, useEffect, useCallback } from "react";
import {
  NotificationsApi,
  Notification,
  NotificationListParams,
} from "@/lib/api/notifications";

/**
 * Hook to fetch and manage seller notifications
 */
export function useNotifications(params?: NotificationListParams) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await NotificationsApi.getNotifications(params);

      if (response.success && response.data) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      } else {
        setError(response.message || "Failed to fetch notifications");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch notifications"
      );
    } finally {
      setLoading(false);
    }
  }, [params?.type, params?.isRead, params?.limit, params?.page]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      const response = await NotificationsApi.markAsRead(id);
      if (response.success) {
        // Update local state
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await NotificationsApi.markAllAsRead();
      if (response.success) {
        // Update local state
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const removeNotification = async (id: string) => {
    try {
      const response = await NotificationsApi.deleteNotification(id);
      if (response.success) {
        // Update local state
        setNotifications((prev) => {
          const removed = prev.find((n) => n.id === id);
          if (removed && !removed.isRead) {
            setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
          }
          return prev.filter((n) => n.id !== id);
        });
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
  };
}
