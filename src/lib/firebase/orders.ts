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
  lalamoveOrderId?: string;

  // Payment
  paymentMethod: "cod" | "gcash" | "card";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";

  // Order Status
  status: OrderStatus;
  statusHistory: StatusHistoryEntry[];

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
  paymentMethod: "cod" | "gcash" | "card";
  notes?: string;
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

      const order: FirestoreOrder = {
        id: orderId,
        orderNumber,
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        userPhone: data.userPhone,
        items: data.items,
        subtotal: data.subtotal,
        tax: data.tax,
        deliveryFee: data.deliveryFee,
        total: data.total,
        deliveryMethod: data.deliveryMethod,
        pickupLocation: data.pickupLocation,
        deliveryAddress: data.deliveryAddress,
        lalamoveQuotationId: data.lalamoveQuotationId,
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
        notes: data.notes,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await setDoc(orderRef, order);

      console.log("[FirebaseOrdersService] Order created:", {
        orderId,
        orderNumber,
        total: data.total,
      });

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
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as FirestoreOrder);
    } catch (error) {
      console.error("[FirebaseOrdersService] Error getting user orders:", error);
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
    orderNumber: string
  ): Promise<FirestoreOrder | null> {
    try {
      const ordersRef = collection(db, this.COLLECTION);
      const q = query(
        ordersRef,
        where("orderNumber", "==", orderNumber),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      return snapshot.docs[0].data() as FirestoreOrder;
    } catch (error) {
      console.error("[FirebaseOrdersService] Error getting order by number:", error);
      return null;
    }
  }

  /**
   * Subscribe to order updates (real-time)
   */
  static subscribeToOrder(
    orderId: string,
    onUpdate: (order: FirestoreOrder | null) => void,
    onError?: (error: Error) => void
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
      }
    );
  }

  /**
   * Subscribe to user's orders (real-time)
   */
  static subscribeToUserOrders(
    userId: string,
    onUpdate: (orders: FirestoreOrder[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    const ordersRef = collection(db, this.COLLECTION);
    const q = query(
      ordersRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
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
      }
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
        orderBy("createdAt", "asc")
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as FirestoreOrder);
    } catch (error) {
      console.error("[FirebaseOrdersService] Error getting pending orders:", error);
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
    status: OrderStatus
  ): Promise<FirestoreOrder[]> {
    try {
      const ordersRef = collection(db, this.COLLECTION);
      const q = query(
        ordersRef,
        where("status", "==", status),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as FirestoreOrder);
    } catch (error) {
      console.error("[FirebaseOrdersService] Error getting orders by status:", error);
      return [];
    }
  }

  /**
   * Subscribe to pending orders (for admin/seller dashboard)
   */
  static subscribeToPendingOrders(
    onUpdate: (orders: FirestoreOrder[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    const ordersRef = collection(db, this.COLLECTION);
    const q = query(
      ordersRef,
      where("status", "==", "pending_approval"),
      orderBy("createdAt", "asc")
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
      }
    );
  }

  /**
   * Approve order (admin/seller)
   */
  static async approveOrder(orderId: string, adminId: string): Promise<void> {
    try {
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
          ...order.statusHistory,
          {
            status: "approved",
            timestamp: Timestamp.now(),
            updatedBy: adminId,
            note: "Order approved by seller",
          },
        ];

        transaction.update(orderRef, {
          status: "approved",
          statusHistory: newHistory,
          approvedBy: adminId,
          approvedAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
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
    reason: string
  ): Promise<void> {
    try {
      const orderRef = doc(db, this.COLLECTION, orderId);

      await runTransaction(db, async (transaction) => {
        const orderSnap = await transaction.get(orderRef);
        if (!orderSnap.exists()) {
          throw new Error("Order not found");
        }

        const order = orderSnap.data() as FirestoreOrder;

        const newHistory: StatusHistoryEntry[] = [
          ...order.statusHistory,
          {
            status: "rejected",
            timestamp: Timestamp.now(),
            updatedBy: adminId,
            note: `Rejected: ${reason}`,
          },
        ];

        transaction.update(orderRef, {
          status: "rejected",
          statusHistory: newHistory,
          rejectionReason: reason,
          updatedAt: Timestamp.now(),
        });
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
    note?: string
  ): Promise<void> {
    try {
      const orderRef = doc(db, this.COLLECTION, orderId);

      await runTransaction(db, async (transaction) => {
        const orderSnap = await transaction.get(orderRef);
        if (!orderSnap.exists()) {
          throw new Error("Order not found");
        }

        const order = orderSnap.data() as FirestoreOrder;

        const newHistory: StatusHistoryEntry[] = [
          ...order.statusHistory,
          {
            status: newStatus,
            timestamp: Timestamp.now(),
            updatedBy,
            note,
          },
        ];

        transaction.update(orderRef, {
          status: newStatus,
          statusHistory: newHistory,
          updatedAt: Timestamp.now(),
        });
      });

      console.log("[FirebaseOrdersService] Order status updated:", {
        orderId,
        newStatus,
      });
    } catch (error) {
      console.error("[FirebaseOrdersService] Error updating order status:", error);
      throw error;
    }
  }

  /**
   * Set Lalamove order ID (after creating delivery)
   */
  static async setLalamoveOrderId(
    orderId: string,
    lalamoveOrderId: string
  ): Promise<void> {
    try {
      const orderRef = doc(db, this.COLLECTION, orderId);
      await setDoc(
        orderRef,
        {
          lalamoveOrderId,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );

      console.log("[FirebaseOrdersService] Lalamove order ID set:", {
        orderId,
        lalamoveOrderId,
      });
    } catch (error) {
      console.error("[FirebaseOrdersService] Error setting Lalamove order ID:", error);
      throw error;
    }
  }

  /**
   * Update payment status
   */
  static async updatePaymentStatus(
    orderId: string,
    paymentStatus: "pending" | "paid" | "failed" | "refunded"
  ): Promise<void> {
    try {
      const orderRef = doc(db, this.COLLECTION, orderId);
      await setDoc(
        orderRef,
        {
          paymentStatus,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );

      console.log("[FirebaseOrdersService] Payment status updated:", {
        orderId,
        paymentStatus,
      });
    } catch (error) {
      console.error("[FirebaseOrdersService] Error updating payment status:", error);
      throw error;
    }
  }

  /**
   * Cancel order (customer or admin)
   */
  static async cancelOrder(
    orderId: string,
    cancelledBy: string,
    reason?: string
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
          throw new Error(
            `Cannot cancel order with status: ${order.status}`
          );
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
}
