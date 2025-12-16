/**
 * Firebase Notifications Service
 *
 * Manages real-time notifications in Firestore.
 * Handles notification creation, reading, and marking as read.
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  updateDoc,
  writeBatch,
  deleteDoc,
  limit,
  getFirestore,
} from "firebase/firestore";
import { firebaseApp } from "./config";

// Initialize Firestore
const db = getFirestore(firebaseApp);

/**
 * Notification Types
 */
export type NotificationType =
  | "order_placed"           // Buyer placed an order
  | "order_approved"         // Admin approved the order
  | "order_rejected"         // Admin rejected the order
  | "order_processing"       // Order is being prepared
  | "order_shipped"          // Order shipped/out for delivery
  | "order_delivered"        // Order delivered
  | "order_completed"        // Order completed
  | "driver_assigned"        // Lalamove driver assigned
  | "delivery_update"        // Delivery status update
  | "promo"                  // Promotional notification
  | "system";                // System notification

/**
 * Notification document structure
 */
export interface FirestoreNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  data?: {
    orderId?: string;
    orderNumber?: string;
    status?: string;
    link?: string;
    [key: string]: unknown;
  };
  createdAt: Timestamp;
  readAt?: Timestamp;
}

/**
 * Create notification input
 */
export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: {
    orderId?: string;
    orderNumber?: string;
    status?: string;
    link?: string;
    [key: string]: unknown;
  };
}

/**
 * Firebase Notifications Service
 */
export class FirebaseNotificationsService {
  private static readonly COLLECTION = "notifications";

  /**
   * Create a new notification
   */
  static async createNotification(data: CreateNotificationData): Promise<string> {
    try {
      const notificationsRef = collection(db, this.COLLECTION);
      const notificationId = doc(notificationsRef).id;

      const notification: FirestoreNotification = {
        id: notificationId,
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        read: false,
        data: data.data,
        createdAt: Timestamp.now(),
      };

      await setDoc(doc(db, this.COLLECTION, notificationId), notification);

      console.log("[FirebaseNotificationsService] Notification created:", notificationId);
      return notificationId;
    } catch (error) {
      console.error("[FirebaseNotificationsService] Error creating notification:", error);
      throw error;
    }
  }

  /**
   * Get notifications for a user
   */
  static async getUserNotifications(
    userId: string,
    maxResults: number = 50
  ): Promise<FirestoreNotification[]> {
    try {
      const notificationsRef = collection(db, this.COLLECTION);
      const q = query(
        notificationsRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(maxResults)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as FirestoreNotification);
    } catch (error) {
      console.error("[FirebaseNotificationsService] Error getting notifications:", error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const notificationsRef = collection(db, this.COLLECTION);
      const q = query(
        notificationsRef,
        where("userId", "==", userId),
        where("read", "==", false)
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error("[FirebaseNotificationsService] Error getting unread count:", error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, this.COLLECTION, notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: Timestamp.now(),
      });

      console.log("[FirebaseNotificationsService] Marked as read:", notificationId);
    } catch (error) {
      console.error("[FirebaseNotificationsService] Error marking as read:", error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<void> {
    try {
      const notificationsRef = collection(db, this.COLLECTION);
      const q = query(
        notificationsRef,
        where("userId", "==", userId),
        where("read", "==", false)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return;

      const batch = writeBatch(db);
      snapshot.docs.forEach((docSnap) => {
        batch.update(docSnap.ref, {
          read: true,
          readAt: Timestamp.now(),
        });
      });

      await batch.commit();
      console.log("[FirebaseNotificationsService] Marked all as read for user:", userId);
    } catch (error) {
      console.error("[FirebaseNotificationsService] Error marking all as read:", error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION, notificationId));
      console.log("[FirebaseNotificationsService] Deleted notification:", notificationId);
    } catch (error) {
      console.error("[FirebaseNotificationsService] Error deleting notification:", error);
      throw error;
    }
  }

  /**
   * Delete all notifications for a user
   */
  static async deleteAllNotifications(userId: string): Promise<void> {
    try {
      const notificationsRef = collection(db, this.COLLECTION);
      const q = query(notificationsRef, where("userId", "==", userId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) return;

      const batch = writeBatch(db);
      snapshot.docs.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });

      await batch.commit();
      console.log("[FirebaseNotificationsService] Deleted all for user:", userId);
    } catch (error) {
      console.error("[FirebaseNotificationsService] Error deleting all:", error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time notifications for a user
   */
  static subscribeToNotifications(
    userId: string,
    callback: (notifications: FirestoreNotification[]) => void,
    maxResults: number = 50
  ): () => void {
    const notificationsRef = collection(db, this.COLLECTION);
    const q = query(
      notificationsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(maxResults)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifications = snapshot.docs.map(
          (doc) => doc.data() as FirestoreNotification
        );
        callback(notifications);
      },
      (error) => {
        console.error("[FirebaseNotificationsService] Subscription error:", error);
      }
    );

    return unsubscribe;
  }

  /**
   * Create order notification (helper for order status changes)
   */
  static async createOrderNotification(
    userId: string,
    orderId: string,
    orderNumber: string,
    type: NotificationType,
    title: string,
    message: string
  ): Promise<string> {
    return this.createNotification({
      userId,
      type,
      title,
      message,
      data: {
        orderId,
        orderNumber,
        link: `/profile/order-history`,
      },
    });
  }
}

/**
 * Notification message templates
 */
export const NotificationTemplates = {
  orderPlaced: (orderNumber: string) => ({
    title: "Order Placed Successfully!",
    message: `Your order ${orderNumber} has been placed and is pending approval.`,
  }),

  orderApproved: (orderNumber: string) => ({
    title: "Order Approved! 🎉",
    message: `Great news! Your order ${orderNumber} has been approved and is being prepared.`,
  }),

  orderRejected: (orderNumber: string, reason?: string) => ({
    title: "Order Rejected",
    message: reason
      ? `Your order ${orderNumber} was rejected: ${reason}`
      : `Your order ${orderNumber} was rejected. Please contact support for more information.`,
  }),

  orderProcessing: (orderNumber: string) => ({
    title: "Order Being Prepared",
    message: `Your order ${orderNumber} is now being prepared for delivery.`,
  }),

  orderShipped: (orderNumber: string) => ({
    title: "Order Shipped! 🚚",
    message: `Your order ${orderNumber} is on its way! Track your delivery in real-time.`,
  }),

  driverAssigned: (orderNumber: string, driverName?: string) => ({
    title: "Driver Assigned",
    message: driverName
      ? `${driverName} has been assigned to deliver your order ${orderNumber}.`
      : `A driver has been assigned to deliver your order ${orderNumber}.`,
  }),

  orderDelivered: (orderNumber: string) => ({
    title: "Order Delivered! 📦",
    message: `Your order ${orderNumber} has been delivered. Enjoy your fresh mushrooms!`,
  }),

  orderCompleted: (orderNumber: string) => ({
    title: "Order Completed",
    message: `Your order ${orderNumber} is now complete. Thank you for shopping with MASH!`,
  }),

  // Admin notifications
  newOrderAdmin: (orderNumber: string, customerName: string) => ({
    title: "New Order Received! 🔔",
    message: `${customerName} placed order ${orderNumber}. Review and approve in the dashboard.`,
  }),
};

// Export for convenience
export { db as notificationsDb };
