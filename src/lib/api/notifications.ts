/**
 * Notifications API Client
 * Handles seller notification operations
 */

import { ApiResponse } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: "order" | "payment" | "review" | "alert" | "report" | "customer" | "shipping" | "performance";
  priority: "high" | "medium" | "low";
}

export interface NotificationListParams {
  type?: string;
  isRead?: boolean;
  limit?: number;
  page?: number;
}

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Sample notification data - will be replaced with real API
const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "New Order Received",
    message: "You have received a new order for 5kg Oyster Mushrooms from John Doe",
    time: "2 minutes ago",
    isRead: false,
    type: "order",
    priority: "high",
  },
  {
    id: "2",
    title: "Payment Confirmed",
    message: "Payment of ₱2,500 has been confirmed for Order #12345",
    time: "1 hour ago",
    isRead: false,
    type: "payment",
    priority: "high",
  },
  {
    id: "3",
    title: "Product Review",
    message: "Customer left a 5-star review for your Shiitake Mushrooms",
    time: "3 hours ago",
    isRead: true,
    type: "review",
    priority: "medium",
  },
  {
    id: "4",
    title: "Low Stock Alert",
    message: "Your Enoki Mushrooms are running low (only 2kg left)",
    time: "1 day ago",
    isRead: true,
    type: "alert",
    priority: "high",
  },
  {
    id: "5",
    title: "Weekly Sales Report",
    message: "Your sales increased by 15% this week compared to last week",
    time: "2 days ago",
    isRead: true,
    type: "report",
    priority: "low",
  },
  {
    id: "6",
    title: "New Customer Registration",
    message: "A new customer has registered and is interested in your products",
    time: "3 days ago",
    isRead: true,
    type: "customer",
    priority: "medium",
  },
  {
    id: "7",
    title: "Shipping Update",
    message: "Order #12346 has been shipped and is on its way to the customer",
    time: "4 days ago",
    isRead: true,
    type: "shipping",
    priority: "medium",
  },
  {
    id: "8",
    title: "Monthly Performance",
    message: "Your store performance for this month is excellent! Keep up the good work.",
    time: "1 week ago",
    isRead: true,
    type: "performance",
    priority: "low",
  },
];

export class NotificationsApi {
  /**
   * Get seller notifications
   */
  static async getNotifications(
    params?: NotificationListParams
  ): Promise<ApiResponse<{ notifications: Notification[]; unreadCount: number }>> {
    await delay(300);

    // TODO: Replace with real API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/seller/notifications?${new URLSearchParams(params)}`);
    // return await response.json();

    let filtered = [...SAMPLE_NOTIFICATIONS];

    if (params?.type && params.type !== "all") {
      if (params.type === "unread") {
        filtered = filtered.filter((n) => !n.isRead);
      } else if (params.type === "read") {
        filtered = filtered.filter((n) => n.isRead);
      } else {
        filtered = filtered.filter((n) => n.type === params.type);
      }
    }

    if (params?.isRead !== undefined) {
      filtered = filtered.filter((n) => n.isRead === params.isRead);
    }

    const unreadCount = filtered.filter((n) => !n.isRead).length;

    return {
      success: true,
      data: {
        notifications: filtered,
        unreadCount,
      },
    };
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<ApiResponse<{ message: string }>> {
    await delay(200);

    // TODO: Replace with real API call
    // const response = await fetch(`${API_BASE_URL}/seller/notifications/${notificationId}/read`, {
    //   method: 'PUT',
    // });
    // return await response.json();

    return {
      success: true,
      data: {
        message: "Notification marked as read",
      },
    };
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(): Promise<ApiResponse<{ message: string }>> {
    await delay(300);

    // TODO: Replace with real API call
    // const response = await fetch(`${API_BASE_URL}/seller/notifications/mark-all-read`, {
    //   method: 'PUT',
    // });
    // return await response.json();

    return {
      success: true,
      data: {
        message: "All notifications marked as read",
      },
    };
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string): Promise<ApiResponse<{ message: string }>> {
    await delay(200);

    // TODO: Replace with real API call
    // const response = await fetch(`${API_BASE_URL}/seller/notifications/${notificationId}`, {
    //   method: 'DELETE',
    // });
    // return await response.json();

    return {
      success: true,
      data: {
        message: "Notification deleted",
      },
    };
  }
}
