/**
 * Firebase Orders Service
 *
 * Manages order data in Firestore.
 * Handles order creation, status updates, and admin approval workflow.
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
  runTransaction,
  getFirestore,
  limit,
} from "firebase/firestore";
import { firebaseApp } from "./config";
import {
  FirebaseNotificationsService,
  NotificationTemplates,
  NotificationType,
} from "./notifications";

// Initialize Firestore
const db = getFirestore(firebaseApp);

/**
 * Order Status Types
 */
export type OrderStatus =
  | "pending_approval" // Waiting for seller/admin approval
  | "approved" // Approved, ready to process
  | "rejected" // Rejected by seller/admin
  | "processing" // Being prepared
  | "ready_for_pickup" // Ready at pickup location
  | "shipped" // Handed to Lalamove driver
  | "delivered" // Delivered to customer
  | "completed" // Confirmed by customer
  | "cancelled"; // Cancelled by customer or seller

/**
 * Status history entry
 */
export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: Timestamp;
  updatedBy: string;
  note?: string;
}

/**
 * Order item structure
 */
export interface FirestoreOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  grower?: string;
  unit?: string;
  sellerId?: string; // Seller/grower ID for filtering orders by seller
}

/**
 * Pickup location structure
 */
export interface PickupLocation {
  id: string;
  name: string;
  address: string;
}

/**
 * Delivery address structure
 */
export interface DeliveryAddress {
  address: string;
  lat: number;
  lng: number;
  name: string;
  phone: string;
  notes?: string;
}

/**
 * Order document structure in Firestore
 */
export interface FirestoreOrder {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;

  // Items
  items: FirestoreOrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;

  // Delivery
  deliveryMethod: "pickup" | "lalamove";
  pickupLocation?: PickupLocation;
  deliveryAddress?: DeliveryAddress;
  lalamoveQuotationId?: string;
  lalamoveScheduleAt?: string;
  lalamoveOrderId?: string;
  lalamoveVehicleType?: string;
  lalamoveDistance?: string;

  // Lalamove Tracking (Phase 8)
  lalamoveTracking?: {
    orderId: string; // Lalamove order ID
    quotationId: string; // Lalamove quotation ID
    status: string;
    shareLink?: string;
    driver?: {
      id: string;
      name: string;
      phone: string;
      plateNumber: string;
      photo?: string;
      coordinates?: {
        lat: number;
        lng: number;
        updatedAt: Date;
      };
    };
    eta?: {
      minutes: number;
      distance: number; // in km
    };
    timeline?: Array<{
      status: string;
      timestamp: Date;
      note?: string;
    }>;
    createdAt: Date;
    lastUpdated: Date;
  };

  // Payment
  paymentMethod: "cod" | "gcash" | "card";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";

  // Order Status
  status: OrderStatus;
  statusHistory: StatusHistoryEntry[];

  // Seller
  sellerId?: string; // Primary seller ID (for single-seller orders)

  // Metadata
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  approvedBy?: string;
  approvedAt?: Timestamp;
  rejectionReason?: string;
}

/**
 * Create order data input
 */
export interface CreateOrderData {
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  items: FirestoreOrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  deliveryMethod: "pickup" | "lalamove";
  pickupLocation?: PickupLocation;
  deliveryAddress?: DeliveryAddress;
  lalamoveQuotationId?: string;
  lalamoveScheduleAt?: string;
  lalamoveVehicleType?: string;
  lalamoveDistance?: string;
  paymentMethod: "cod" | "gcash" | "card";
  notes?: string;
  sellerId?: string; // Primary seller ID (for single-seller orders)
}

/**
 * Firebase Orders Service
 *
 * Handles all order operations with Firestore:
 * - Create orders
 * - Get orders (user & admin)
 * - Update order status
 * - Approve/reject orders
 * - Real-time subscriptions
 */
export class FirebaseOrdersService {
  private static readonly COLLECTION = "orders";

  /**
   * Generate human-readable order number
   * Format: MASH-YYYYMMDD-XXX
   */
  private static generateOrderNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `MASH-${dateStr}-${random}`;
  }

  /**
   * Create a new order
   */
  static async createOrder(data: CreateOrderData): Promise<string> {
    try {
      const ordersRef = collection(db, this.COLLECTION);
      const orderNumber = this.generateOrderNumber();
      const orderId = `${data.userId}-${Date.now()}`;
      const orderRef = doc(ordersRef, orderId);

      // Build base order object
      const order: FirestoreOrder = {
        id: orderId,
        orderNumber,
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        userPhone: data.userPhone,
        // Strip undefined fields from each item (Firestore rejects undefined values)
        items: data.items.map((item) => {
          const sanitized: FirestoreOrderItem = {
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          };
          if (item.grower !== undefined) sanitized.grower = item.grower;
          if (item.unit !== undefined) sanitized.unit = item.unit;
          if (item.sellerId !== undefined) sanitized.sellerId = item.sellerId;
          return sanitized;
        }),
        subtotal: data.subtotal,
        tax: data.tax,
        deliveryFee: data.deliveryFee,
        total: data.total,
        deliveryMethod: data.deliveryMethod,
        paymentMethod: data.paymentMethod,
        paymentStatus: "pending",
        status: "pending_approval",
        statusHistory: [
          {
            status: "pending_approval",
            timestamp: Timestamp.now(),
            updatedBy: data.userId,
            note: "Order placed, awaiting seller approval",
          },
        ],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Only add optional fields if they have values (Firebase doesn't accept undefined)
      if (data.pickupLocation) {
        order.pickupLocation = data.pickupLocation;
      }
      if (data.deliveryAddress) {
        order.deliveryAddress = data.deliveryAddress;
      }
      if (data.lalamoveQuotationId) {
        order.lalamoveQuotationId = data.lalamoveQuotationId;
      }
      if (data.lalamoveScheduleAt) {
        order.lalamoveScheduleAt = data.lalamoveScheduleAt;
      }
      if (data.lalamoveVehicleType) {
        order.lalamoveVehicleType = data.lalamoveVehicleType;
      }
      if (data.lalamoveDistance) {
        order.lalamoveDistance = data.lalamoveDistance;
      }
      if (data.notes) {
        order.notes = data.notes;
      }
      if (data.sellerId) {
        order.sellerId = data.sellerId;
      }

      await setDoc(orderRef, order);

      console.log("[FirebaseOrdersService] Order created:", {
        orderId,
        orderNumber,
        total: data.total,
      });

      // Send notification to buyer
      try {
        const template = NotificationTemplates.orderPlaced(orderNumber);
        await FirebaseNotificationsService.createOrderNotification(
          data.userId,
          orderId,
          orderNumber,
          "order_placed",
          template.title,
          template.message,
        );
      } catch (notifError) {
        // Don't fail order creation if notification fails
        console.error(
          "[FirebaseOrdersService] Notification error:",
          notifError,
        );
      }

      return orderId;
    } catch (error) {
      console.error("[FirebaseOrdersService] Error creating order:", error);
      throw error;
    }
  }

  /**
   * Get user's orders
   */
  static async getUserOrders(userId: string): Promise<FirestoreOrder[]> {
    try {
      const ordersRef = collection(db, this.COLLECTION);
      const q = query(
        ordersRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as FirestoreOrder);
    } catch (error) {
      console.error(
        "[FirebaseOrdersService] Error getting user orders:",
        error,
      );
      return [];
    }
  }

  /**
   * Get single order by ID
   */
  static async getOrder(orderId: string): Promise<FirestoreOrder | null> {
    try {
      const orderRef = doc(db, this.COLLECTION, orderId);
      const snap = await getDoc(orderRef);
      return snap.exists() ? (snap.data() as FirestoreOrder) : null;
    } catch (error) {
      console.error("[FirebaseOrdersService] Error getting order:", error);
      return null;
    }
  }

  /**
   * Get order by order number
   */
  static async getOrderByNumber(
    orderNumber: string,
  ): Promise<FirestoreOrder | null> {
    try {
      const ordersRef = collection(db, this.COLLECTION);
      const q = query(
        ordersRef,
        where("orderNumber", "==", orderNumber),
        limit(1),
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      return snapshot.docs[0].data() as FirestoreOrder;
    } catch (error) {
      console.error(
        "[FirebaseOrdersService] Error getting order by number:",
        error,
      );
      return null;
    }
  }

  /**
   * Subscribe to order updates (real-time)
   */
  static subscribeToOrder(
    orderId: string,
    onUpdate: (order: FirestoreOrder | null) => void,
    onError?: (error: Error) => void,
  ): () => void {
    const orderRef = doc(db, this.COLLECTION, orderId);

    return onSnapshot(
      orderRef,
      (snap) => {
        onUpdate(snap.exists() ? (snap.data() as FirestoreOrder) : null);
      },
      (error) => {
        console.error("[FirebaseOrdersService] Snapshot error:", error);
        if (onError) {
          onError(error);
        }
      },
    );
  }

  /**
   * Subscribe to user's orders (real-time)
   */
  static subscribeToUserOrders(
    userId: string,
    onUpdate: (orders: FirestoreOrder[]) => void,
    onError?: (error: Error) => void,
  ): () => void {
    const ordersRef = collection(db, this.COLLECTION);
    const q = query(
      ordersRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const orders = snapshot.docs.map((doc) => doc.data() as FirestoreOrder);
        onUpdate(orders);
      },
      (error) => {
        console.error("[FirebaseOrdersService] Snapshot error:", error);
        if (onError) {
          onError(error);
        }
      },
    );
  }

  /**
   * Get all pending orders (for admin/seller)
   */
  static async getPendingOrders(): Promise<FirestoreOrder[]> {
    try {
      const ordersRef = collection(db, this.COLLECTION);
      const q = query(
        ordersRef,
        where("status", "==", "pending_approval"),
        orderBy("createdAt", "asc"),
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as FirestoreOrder);
    } catch (error) {
      console.error(
        "[FirebaseOrdersService] Error getting pending orders:",
        error,
      );
      return [];
    }
  }

  /**
   * Get all orders (for admin/seller)
   */
  static async getAllOrders(limitCount?: number): Promise<FirestoreOrder[]> {
    try {
      const ordersRef = collection(db, this.COLLECTION);
      let q = query(ordersRef, orderBy("createdAt", "desc"));

      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as FirestoreOrder);
    } catch (error) {
      console.error("[FirebaseOrdersService] Error getting all orders:", error);
      return [];
    }
  }

  /**
   * Get orders by status
   */
  static async getOrdersByStatus(
    status: OrderStatus,
  ): Promise<FirestoreOrder[]> {
    try {
      const ordersRef = collection(db, this.COLLECTION);
      const q = query(
        ordersRef,
        where("status", "==", status),
        orderBy("createdAt", "desc"),
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as FirestoreOrder);
    } catch (error) {
      console.error(
        "[FirebaseOrdersService] Error getting orders by status:",
        error,
      );
      return [];
    }
  }

  /**
   * Subscribe to pending orders (for admin/seller dashboard)
   */
  static subscribeToPendingOrders(
    onUpdate: (orders: FirestoreOrder[]) => void,
    onError?: (error: Error) => void,
  ): () => void {
    const ordersRef = collection(db, this.COLLECTION);
    const q = query(
      ordersRef,
      where("status", "==", "pending_approval"),
      orderBy("createdAt", "asc"),
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const orders = snapshot.docs.map((doc) => doc.data() as FirestoreOrder);
        onUpdate(orders);
      },
      (error) => {
        console.error("[FirebaseOrdersService] Snapshot error:", error);
        if (onError) {
          onError(error);
        }
      },
    );
  }

  /**
   * Subscribe to all orders (for admin/seller dashboard)
   */
  static subscribeToAllOrders(
    onUpdate: (orders: FirestoreOrder[]) => void,
    onError?: (error: Error) => void,
  ): () => void {
    const ordersRef = collection(db, this.COLLECTION);
    const q = query(ordersRef, orderBy("createdAt", "desc"));

    return onSnapshot(
      q,
      (snapshot) => {
        const orders = snapshot.docs.map((doc) => doc.data() as FirestoreOrder);
        onUpdate(orders);
      },
      (error) => {
        console.error("[FirebaseOrdersService] Snapshot error:", error);
        if (onError) {
          onError(error);
        }
      },
    );
  }

  /**
   * Get orders for a specific seller (one-shot fetch)
   */
  static async getOrdersBySeller(
    sellerId: string,
    limitCount?: number,
  ): Promise<FirestoreOrder[]> {
    try {
      const ordersRef = collection(db, this.COLLECTION);
      // No orderBy here — combining where(sellerId) + orderBy(createdAt) requires
      // a composite index that may not exist. Sort client-side instead.
      let q = query(ordersRef, where("sellerId", "==", sellerId));

      const snapshot = await getDocs(q);
      let orders = snapshot.docs.map((doc) => doc.data() as FirestoreOrder);

      // Sort descending by createdAt client-side
      orders.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() ?? 0;
        const bTime = b.createdAt?.toMillis?.() ?? 0;
        return bTime - aTime;
      });

      if (limitCount) {
        orders = orders.slice(0, limitCount);
      }

      return orders;
    } catch (error) {
      console.error(
        "[FirebaseOrdersService] Error getting seller orders:",
        error,
      );
      return [];
    }
  }

  /**
   * Subscribe to a specific seller's orders (real-time)
   */
  static subscribeToSellerOrders(
    sellerId: string,
    onUpdate: (orders: FirestoreOrder[]) => void,
    onError?: (error: Error) => void,
  ): () => void {
    const ordersRef = collection(db, this.COLLECTION);
    // No orderBy here — combining where(sellerId) + orderBy(createdAt) requires
    // a composite index that may not exist. Sort client-side in the callback.
    const q = query(ordersRef, where("sellerId", "==", sellerId));

    return onSnapshot(
      q,
      (snapshot) => {
        const orders = snapshot.docs
          .map((doc) => doc.data() as FirestoreOrder)
          .sort((a, b) => {
            const aTime = a.createdAt?.toMillis?.() ?? 0;
            const bTime = b.createdAt?.toMillis?.() ?? 0;
            return bTime - aTime;
          });
        onUpdate(orders);
      },
      (error) => {
        console.error(
          "[FirebaseOrdersService] Seller subscription error:",
          error,
        );
        if (onError) {
          onError(error);
        }
      },
    );
  }

  /**
   * Approve order (admin/seller)
   */
  static async approveOrder(orderId: string, adminId: string): Promise<void> {
    try {
      // Validate inputs
      if (!adminId || adminId === "undefined") {
        console.warn("[FirebaseOrdersService] Invalid adminId, using default");
        adminId = "system";
      }

      const orderRef = doc(db, this.COLLECTION, orderId);

      await runTransaction(db, async (transaction) => {
        const orderSnap = await transaction.get(orderRef);
        if (!orderSnap.exists()) {
          throw new Error("Order not found");
        }

        const order = orderSnap.data() as FirestoreOrder;
        if (order.status !== "pending_approval") {
          throw new Error("Order is not pending approval");
        }

        const newHistory: StatusHistoryEntry[] = [
          ...(order.statusHistory || []),
          {
            status: "approved",
            timestamp: Timestamp.now(),
            updatedBy: adminId,
            note: "Order approved by seller",
          },
        ];

        // Only include defined fields
        const updateData: any = {
          status: "approved",
          statusHistory: newHistory,
          approvedBy: adminId,
          approvedAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        transaction.update(orderRef, updateData);
      });

      console.log("[FirebaseOrdersService] Order approved:", orderId);
    } catch (error) {
      console.error("[FirebaseOrdersService] Error approving order:", error);
      throw error;
    }
  }

  /**
   * Reject order (admin/seller)
   */
  static async rejectOrder(
    orderId: string,
    adminId: string,
    reason: string,
  ): Promise<void> {
    try {
      // Validate inputs
      if (!adminId || adminId === "undefined") {
        console.warn("[FirebaseOrdersService] Invalid adminId, using default");
        adminId = "system";
      }
      if (!reason || reason === "undefined") {
        reason = "Order rejected by seller";
      }

      const orderRef = doc(db, this.COLLECTION, orderId);

      await runTransaction(db, async (transaction) => {
        const orderSnap = await transaction.get(orderRef);
        if (!orderSnap.exists()) {
          throw new Error("Order not found");
        }

        const order = orderSnap.data() as FirestoreOrder;

        const newHistory: StatusHistoryEntry[] = [
          ...(order.statusHistory || []),
          {
            status: "rejected",
            timestamp: Timestamp.now(),
            updatedBy: adminId,
            note: `Rejected: ${reason}`,
          },
        ];

        // Only include defined fields
        const updateData: any = {
          status: "rejected",
          statusHistory: newHistory,
          rejectionReason: reason,
          updatedAt: Timestamp.now(),
        };

        transaction.update(orderRef, updateData);
      });

      console.log("[FirebaseOrdersService] Order rejected:", orderId);
    } catch (error) {
      console.error("[FirebaseOrdersService] Error rejecting order:", error);
      throw error;
    }
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    updatedBy: string,
    note?: string,
  ): Promise<void> {
    try {
      // Validate inputs
      if (!updatedBy || updatedBy === "undefined") {
        console.warn(
          "[FirebaseOrdersService] Invalid updatedBy, using default",
        );
        updatedBy = "system";
      }

      const orderRef = doc(db, this.COLLECTION, orderId);

      // First, get order info before transaction
      const orderSnap = await getDoc(orderRef);
      if (!orderSnap.exists()) {
        throw new Error("Order not found");
      }
      const orderData = orderSnap.data() as FirestoreOrder;
      const orderUserId = orderData.userId;
      const orderNumber = orderData.orderNumber;

      await runTransaction(db, async (transaction) => {
        const orderSnapInTx = await transaction.get(orderRef);
        if (!orderSnapInTx.exists()) {
          throw new Error("Order not found");
        }

        const order = orderSnapInTx.data() as FirestoreOrder;

        // Build status history entry without undefined fields
        const historyEntry: StatusHistoryEntry = {
          status: newStatus,
          timestamp: Timestamp.now(),
          updatedBy: updatedBy || "system",
        };

        // Only add note if it's defined
        if (note) {
          historyEntry.note = note;
        }

        const newHistory: StatusHistoryEntry[] = [
          ...(order.statusHistory || []),
          historyEntry,
        ];

        // Build update data with only defined fields
        const updateData: any = {
          status: newStatus,
          statusHistory: newHistory,
          updatedAt: Timestamp.now(),
        };

        transaction.update(orderRef, updateData);
      });

      console.log("[FirebaseOrdersService] Order status updated:", {
        orderId,
        newStatus,
      });

      // Send notification to customer about status change
      if (orderUserId && orderNumber) {
        await this.sendOrderStatusNotification(
          orderUserId,
          orderId,
          orderNumber,
          newStatus,
          note,
        );
      }
    } catch (error) {
      console.error(
        "[FirebaseOrdersService] Error updating order status:",
        error,
      );
      throw error;
    }
  }

  /**
   * Listen to realtime order updates
   * Returns unsubscribe function to stop listening
   */
  static listenToOrder(
    orderId: string,
    callback: (order: FirestoreOrder | null) => void,
  ): () => void {
    const orderRef = doc(db, this.COLLECTION, orderId);

    const unsubscribe = onSnapshot(
      orderRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const order = {
            ...snapshot.data(),
            id: snapshot.id,
          } as FirestoreOrder;
          callback(order);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error(
          "[FirebaseOrdersService] Realtime listener error:",
          error,
        );
        callback(null);
      },
    );

    return unsubscribe;
  }

  /**
   * Send notification for order status change
   */
  private static async sendOrderStatusNotification(
    userId: string,
    orderId: string,
    orderNumber: string,
    status: OrderStatus,
    note?: string,
  ): Promise<void> {
    try {
      let notificationType: NotificationType;
      let template: { title: string; message: string };

      switch (status) {
        case "approved":
          notificationType = "order_approved";
          template = NotificationTemplates.orderApproved(orderNumber);
          break;
        case "rejected":
          notificationType = "order_rejected";
          template = NotificationTemplates.orderRejected(orderNumber, note);
          break;
        case "processing":
          notificationType = "order_processing";
          template = NotificationTemplates.orderProcessing(orderNumber);
          break;
        case "shipped":
          notificationType = "order_shipped";
          template = NotificationTemplates.orderShipped(orderNumber);
          break;
        case "delivered":
          notificationType = "order_delivered";
          template = NotificationTemplates.orderDelivered(orderNumber);
          break;
        case "completed":
          notificationType = "order_completed";
          template = NotificationTemplates.orderCompleted(orderNumber);
          break;
        default:
          // Don't send notification for pending_approval, ready_for_pickup, cancelled
          return;
      }

      await FirebaseNotificationsService.createOrderNotification(
        userId,
        orderId,
        orderNumber,
        notificationType,
        template.title,
        template.message,
      );

      console.log(
        "[FirebaseOrdersService] Notification sent for status:",
        status,
      );
    } catch (error) {
      // Don't throw - notification failure shouldn't break order update
      console.error(
        "[FirebaseOrdersService] Error sending notification:",
        error,
      );
    }
  }

  /**
   * Set Lalamove order ID (after creating delivery)
   */
  static async setLalamoveOrderId(
    orderId: string,
    lalamoveOrderId: string,
    shareLink?: string,
  ): Promise<void> {
    try {
      const orderRef = doc(db, this.COLLECTION, orderId);

      // Build lalamove tracking object without undefined fields
      const lalamoveTracking: any = {
        status: "ASSIGNING_DRIVER",
        lastUpdated: Timestamp.now(),
      };

      // Only add shareLink if defined
      if (shareLink) {
        lalamoveTracking.shareLink = shareLink;
      }

      await setDoc(
        orderRef,
        {
          lalamoveOrderId,
          lalamoveTracking,
          updatedAt: Timestamp.now(),
        },
        { merge: true },
      );

      console.log("[FirebaseOrdersService] Lalamove order ID set:", {
        orderId,
        lalamoveOrderId,
      });
    } catch (error) {
      console.error(
        "[FirebaseOrdersService] Error setting Lalamove order ID:",
        error,
      );
      throw error;
    }
  }

  /**
   * Update Lalamove tracking info
   */
  static async updateLalamoveTracking(
    orderId: string,
    tracking: {
      status?: string;
      driver?: {
        id: string;
        name: string;
        phone: string;
        plateNumber: string;
        photo?: string;
        coordinates?: {
          lat: number;
          lng: number;
          updatedAt: Date;
        };
      };
      eta?: {
        minutes: number;
        distance: number;
      };
      lastUpdated?: Date;
    },
  ): Promise<void> {
    try {
      const orderRef = doc(db, this.COLLECTION, orderId);
      const updateData: Record<string, unknown> = {
        updatedAt: Timestamp.now(),
      };

      // Get existing order for merging
      const orderSnap = await getDoc(orderRef);
      let existingOrder: FirestoreOrder | null = null;

      if (orderSnap.exists()) {
        existingOrder = orderSnap.data() as FirestoreOrder;
      }

      // Build tracking update - preserve orderId and quotationId
      const trackingUpdate: any = {
        ...existingOrder?.lalamoveTracking,
        lastUpdated: new Date(),
      };

      if (tracking.status) trackingUpdate.status = tracking.status;
      if (tracking.driver) trackingUpdate.driver = tracking.driver;
      if (tracking.eta) trackingUpdate.eta = tracking.eta;

      updateData.lalamoveTracking = trackingUpdate;

      await setDoc(orderRef, updateData, { merge: true });

      console.log("[FirebaseOrdersService] Lalamove tracking updated:", {
        orderId,
        status: tracking.status,
        hasDriver: !!tracking.driver,
      });

      // Send notification when driver is assigned
      if (tracking.driver && existingOrder) {
        try {
          const template = NotificationTemplates.driverAssigned(
            existingOrder.orderNumber,
            tracking.driver.name,
          );
          await FirebaseNotificationsService.createOrderNotification(
            existingOrder.userId,
            orderId,
            existingOrder.orderNumber,
            "driver_assigned",
            template.title,
            template.message,
          );
        } catch (notifError) {
          console.error(
            "[FirebaseOrdersService] Driver notification error:",
            notifError,
          );
        }
      }
    } catch (error) {
      console.error(
        "[FirebaseOrdersService] Error updating Lalamove tracking:",
        error,
      );
      throw error;
    }
  }

  /**
   * Cancel order (customer or admin)
   */
  static async cancelOrder(
    orderId: string,
    cancelledBy: string,
    reason?: string,
  ): Promise<void> {
    try {
      const orderRef = doc(db, this.COLLECTION, orderId);

      await runTransaction(db, async (transaction) => {
        const orderSnap = await transaction.get(orderRef);
        if (!orderSnap.exists()) {
          throw new Error("Order not found");
        }

        const order = orderSnap.data() as FirestoreOrder;

        // Only allow cancellation of certain statuses
        const cancellableStatuses: OrderStatus[] = [
          "pending_approval",
          "approved",
          "processing",
        ];

        if (!cancellableStatuses.includes(order.status)) {
          throw new Error(`Cannot cancel order with status: ${order.status}`);
        }

        const newHistory: StatusHistoryEntry[] = [
          ...order.statusHistory,
          {
            status: "cancelled",
            timestamp: Timestamp.now(),
            updatedBy: cancelledBy,
            note: reason || "Order cancelled",
          },
        ];

        transaction.update(orderRef, {
          status: "cancelled",
          statusHistory: newHistory,
          updatedAt: Timestamp.now(),
        });
      });

      console.log("[FirebaseOrdersService] Order cancelled:", orderId);
    } catch (error) {
      console.error("[FirebaseOrdersService] Error cancelling order:", error);
      throw error;
    }
  }

  /**
   * Update order payment status
   * Called by payment webhooks to update payment state
   */
  static async updatePaymentStatus(
    orderId: string,
    paymentData: {
      status: "pending" | "paid" | "failed" | "processing" | "refunded";
      paymentId?: string;
      paymentIntentId?: string;
      sourceId?: string;
      paidAt?: string;
      failedAt?: string;
    },
  ): Promise<void> {
    try {
      const orderRef = doc(db, this.COLLECTION, orderId);
      const orderSnap = await getDoc(orderRef);

      if (!orderSnap.exists()) {
        console.error(
          "[FirebaseOrdersService] Order not found for payment update:",
          orderId,
        );
        return;
      }

      const updateData: Record<string, unknown> = {
        paymentStatus: paymentData.status,
        updatedAt: Timestamp.now(),
      };

      // Add payment IDs if provided
      if (paymentData.paymentId) {
        updateData["payment.paymentId"] = paymentData.paymentId;
      }
      if (paymentData.paymentIntentId) {
        updateData["payment.paymentIntentId"] = paymentData.paymentIntentId;
      }
      if (paymentData.sourceId) {
        updateData["payment.sourceId"] = paymentData.sourceId;
      }
      if (paymentData.paidAt) {
        updateData["payment.paidAt"] = paymentData.paidAt;
      }
      if (paymentData.failedAt) {
        updateData["payment.failedAt"] = paymentData.failedAt;
      }

      await setDoc(orderRef, updateData, { merge: true });

      console.log(
        `[FirebaseOrdersService] Payment status updated for order ${orderId}: ${paymentData.status}`,
      );
    } catch (error) {
      console.error(
        "[FirebaseOrdersService] Error updating payment status:",
        error,
      );
      throw error;
    }
  }
}

/**
 * Standalone function to update order payment status
 * For use in webhook handlers
 */
export async function updateOrderPaymentStatus(
  orderId: string,
  paymentData: {
    status: "pending" | "paid" | "failed" | "processing" | "refunded";
    paymentId?: string;
    paymentIntentId?: string;
    sourceId?: string;
    paidAt?: string;
    failedAt?: string;
  },
): Promise<void> {
  return FirebaseOrdersService.updatePaymentStatus(orderId, paymentData);
}
