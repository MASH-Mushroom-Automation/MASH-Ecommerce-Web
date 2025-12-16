/**
 * useFirebaseNotifications Hook
 *
 * React hook for managing notifications with Firebase.
 * Provides real-time notification updates and actions.
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  FirebaseNotificationsService,
  FirestoreNotification,
  NotificationType,
} from "@/lib/firebase/notifications";

export interface UseFirebaseNotificationsOptions {
  /** Enable real-time subscription */
  realtime?: boolean;
  /** Maximum notifications to fetch */
  maxResults?: number;
  /** Auto-fetch on mount */
  autoFetch?: boolean;
}

export interface UseFirebaseNotificationsReturn {
  /** All notifications */
  notifications: FirestoreNotification[];
  /** Unread notifications */
  unreadNotifications: FirestoreNotification[];
  /** Unread count */
  unreadCount: number;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
  /** Mark a notification as read */
  markAsRead: (notificationId: string) => Promise<boolean>;
  /** Mark all notifications as read */
  markAllAsRead: () => Promise<boolean>;
  /** Delete a notification */
  deleteNotification: (notificationId: string) => Promise<boolean>;
  /** Clear all notifications */
  clearAll: () => Promise<boolean>;
  /** Refresh notifications */
  refresh: () => Promise<void>;
}

export function useFirebaseNotifications(
  options: UseFirebaseNotificationsOptions = {}
): UseFirebaseNotificationsReturn {
  const { realtime = true, maxResults = 50, autoFetch = true } = options;
  const { user, isAuthenticated } = useAuth();

  const [notifications, setNotifications] = useState<FirestoreNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Computed values
  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.read),
    [notifications]
  );

  const unreadCount = useMemo(() => unreadNotifications.length, [unreadNotifications]);

  // Fetch notifications (one-time)
  const fetchNotifications = useCallback(async () => {
    if (!user?.uid) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await FirebaseNotificationsService.getUserNotifications(
        user.uid,
        maxResults
      );
      setNotifications(data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [user?.uid, maxResults]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.uid || !realtime) {
      if (autoFetch && user?.uid) {
        fetchNotifications();
      } else {
        setLoading(false);
      }
      return;
    }

    setLoading(true);

    const unsubscribe = FirebaseNotificationsService.subscribeToNotifications(
      user.uid,
      (data) => {
        setNotifications(data);
        setLoading(false);
        setError(null);
      },
      maxResults
    );

    return () => {
      unsubscribe();
    };
  }, [user?.uid, realtime, maxResults, autoFetch, fetchNotifications]);

  // Mark single notification as read
  const markAsRead = useCallback(
    async (notificationId: string): Promise<boolean> => {
      try {
        await FirebaseNotificationsService.markAsRead(notificationId);
        
        // Optimistic update if not using realtime
        if (!realtime) {
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notificationId ? { ...n, read: true } : n
            )
          );
        }
        
        return true;
      } catch (err) {
        console.error("Error marking notification as read:", err);
        return false;
      }
    },
    [realtime]
  );

  // Mark all as read
  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    if (!user?.uid) return false;

    try {
      await FirebaseNotificationsService.markAllAsRead(user.uid);
      
      // Optimistic update if not using realtime
      if (!realtime) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true }))
        );
      }
      
      return true;
    } catch (err) {
      console.error("Error marking all as read:", err);
      return false;
    }
  }, [user?.uid, realtime]);

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId: string): Promise<boolean> => {
      try {
        await FirebaseNotificationsService.deleteNotification(notificationId);
        
        // Optimistic update if not using realtime
        if (!realtime) {
          setNotifications((prev) =>
            prev.filter((n) => n.id !== notificationId)
          );
        }
        
        return true;
      } catch (err) {
        console.error("Error deleting notification:", err);
        return false;
      }
    },
    [realtime]
  );

  // Clear all notifications
  const clearAll = useCallback(async (): Promise<boolean> => {
    if (!user?.uid) return false;

    try {
      await FirebaseNotificationsService.deleteAllNotifications(user.uid);
      
      // Optimistic update if not using realtime
      if (!realtime) {
        setNotifications([]);
      }
      
      return true;
    } catch (err) {
      console.error("Error clearing notifications:", err);
      return false;
    }
  }, [user?.uid, realtime]);

  // Refresh
  const refresh = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadNotifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refresh,
  };
}

/**
 * Format notification time for display
 */
export function formatNotificationTime(timestamp: { toDate?: () => Date } | Date): string {
  const date = timestamp && typeof timestamp === 'object' && 'toDate' in timestamp 
    ? timestamp.toDate() 
    : new Date(timestamp as Date);
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Get notification icon based on type
 */
export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    order_placed: "📦",
    order_approved: "✅",
    order_rejected: "❌",
    order_processing: "⏳",
    order_shipped: "🚚",
    order_delivered: "📬",
    order_completed: "🎉",
    driver_assigned: "🧑‍✈️",
    delivery_update: "📍",
    promo: "🎁",
    system: "ℹ️",
  };
  return icons[type] || "🔔";
}
