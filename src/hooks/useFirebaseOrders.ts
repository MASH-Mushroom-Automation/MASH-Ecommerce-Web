/**
 * useFirebaseOrders Hook
 *
 * Custom hook for managing Firebase orders in seller/admin dashboard.
 * Provides real-time subscriptions and order management functions.
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  FirebaseOrdersService,
  type FirestoreOrder,
  type OrderStatus,
} from "@/lib/firebase/orders";

export interface OrderSummaryStats {
  totalOrders: number;
  pendingApproval: number;
  approved: number;
  processing: number;
  readyForPickup: number;
  shipped: number;
  delivered: number;
  completed: number;
  cancelled: number;
  rejected: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
}

export interface UseFirebaseOrdersOptions {
  statusFilter?: OrderStatus | "all";
  limitCount?: number;
  realtime?: boolean;
  /** When set, only orders whose top-level sellerId matches are fetched */
  sellerId?: string;
}

export interface UseFirebaseOrdersReturn {
  orders: FirestoreOrder[];
  pendingOrders: FirestoreOrder[];
  stats: OrderSummaryStats;
  loading: boolean;
  error: string | null;
  // Actions
  approveOrder: (orderId: string, adminId: string) => Promise<boolean>;
  rejectOrder: (orderId: string, adminId: string, reason: string) => Promise<boolean>;
  updateOrderStatus: (orderId: string, status: OrderStatus, adminId: string, note?: string) => Promise<boolean>;
  refreshOrders: () => Promise<void>;
  // Filters
  filterByStatus: (status: OrderStatus | "all") => FirestoreOrder[];
  searchOrders: (query: string) => FirestoreOrder[];
}

/**
 * Hook for managing Firebase orders
 */
export function useFirebaseOrders(
  options: UseFirebaseOrdersOptions = {}
): UseFirebaseOrdersReturn {
  const { statusFilter = "all", limitCount, realtime = true, sellerId } = options;

  const [orders, setOrders] = useState<FirestoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate stats from orders
  const stats = useMemo((): OrderSummaryStats => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter((order) => {
      const orderDate = order.createdAt?.toDate?.() || new Date(order.createdAt as unknown as string);
      return orderDate >= today;
    });

    return {
      totalOrders: orders.length,
      pendingApproval: orders.filter((o) => o.status === "pending_approval").length,
      approved: orders.filter((o) => o.status === "approved").length,
      processing: orders.filter((o) => o.status === "processing").length,
      readyForPickup: orders.filter((o) => o.status === "ready_for_pickup").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      completed: orders.filter((o) => o.status === "completed").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
      rejected: orders.filter((o) => o.status === "rejected").length,
      totalRevenue: orders
        .filter((o) => !["cancelled", "rejected"].includes(o.status))
        .reduce((sum, o) => sum + o.total, 0),
      todayOrders: todayOrders.length,
      todayRevenue: todayOrders
        .filter((o) => !["cancelled", "rejected"].includes(o.status))
        .reduce((sum, o) => sum + o.total, 0),
    };
  }, [orders]);

  // Get pending orders
  const pendingOrders = useMemo(
    () => orders.filter((o) => o.status === "pending_approval"),
    [orders]
  );

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let fetchedOrders: FirestoreOrder[];

      if (sellerId) {
        // Seller-scoped fetch — only orders belonging to this seller
        fetchedOrders = await FirebaseOrdersService.getOrdersBySeller(sellerId, limitCount);
        // Apply status filter client-side (avoids a composite Firestore index)
        if (statusFilter !== "all") {
          fetchedOrders = fetchedOrders.filter((o) => o.status === statusFilter);
        }
      } else if (statusFilter !== "all") {
        fetchedOrders = await FirebaseOrdersService.getOrdersByStatus(statusFilter);
      } else {
        fetchedOrders = await FirebaseOrdersService.getAllOrders(limitCount);
      }

      setOrders(fetchedOrders);
    } catch (err) {
      console.error("[useFirebaseOrders] Error fetching orders:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, limitCount, sellerId]);

  // Initial fetch and real-time subscription
  useEffect(() => {
    fetchOrders();

    if (realtime) {
      let unsubscribe: () => void;

      if (sellerId) {
        // Seller-scoped real-time subscription
        unsubscribe = FirebaseOrdersService.subscribeToSellerOrders(
          sellerId,
          (updatedOrders) => {
            if (statusFilter !== "all") {
              setOrders(updatedOrders.filter((o) => o.status === statusFilter));
            } else {
              setOrders(updatedOrders);
            }
            setLoading(false);
          },
          (err) => {
            console.error("[useFirebaseOrders] Seller subscription error:", err);
            setError(err.message);
          }
        );
      } else {
        // Unscoped real-time subscription (admin)
        unsubscribe = FirebaseOrdersService.subscribeToAllOrders(
          (updatedOrders) => {
            if (statusFilter !== "all") {
              setOrders(updatedOrders.filter((o) => o.status === statusFilter));
            } else {
              setOrders(updatedOrders);
            }
            setLoading(false);
          },
          (err) => {
            console.error("[useFirebaseOrders] Subscription error:", err);
            setError(err.message);
          }
        );
      }

      return () => {
        unsubscribe();
      };
    }
  }, [fetchOrders, realtime, statusFilter, sellerId]);

  // Approve order
  const approveOrder = useCallback(
    async (orderId: string, adminId: string): Promise<boolean> => {
      try {
        await FirebaseOrdersService.approveOrder(orderId, adminId);
        return true;
      } catch (err) {
        console.error("[useFirebaseOrders] Error approving order:", err);
        setError(err instanceof Error ? err.message : "Failed to approve order");
        return false;
      }
    },
    []
  );

  // Reject order
  const rejectOrder = useCallback(
    async (orderId: string, adminId: string, reason: string): Promise<boolean> => {
      try {
        await FirebaseOrdersService.rejectOrder(orderId, adminId, reason);
        return true;
      } catch (err) {
        console.error("[useFirebaseOrders] Error rejecting order:", err);
        setError(err instanceof Error ? err.message : "Failed to reject order");
        return false;
      }
    },
    []
  );

  // Update order status
  const updateOrderStatus = useCallback(
    async (
      orderId: string,
      status: OrderStatus,
      adminId: string,
      note?: string
    ): Promise<boolean> => {
      try {
        await FirebaseOrdersService.updateOrderStatus(orderId, status, adminId, note);
        return true;
      } catch (err) {
        console.error("[useFirebaseOrders] Error updating order status:", err);
        setError(err instanceof Error ? err.message : "Failed to update order status");
        return false;
      }
    },
    []
  );

  // Filter by status
  const filterByStatus = useCallback(
    (status: OrderStatus | "all"): FirestoreOrder[] => {
      if (status === "all") return orders;
      return orders.filter((o) => o.status === status);
    },
    [orders]
  );

  // Search orders
  const searchOrders = useCallback(
    (query: string): FirestoreOrder[] => {
      if (!query.trim()) return orders;

      const lowerQuery = query.toLowerCase();
      return orders.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(lowerQuery) ||
          order.userName.toLowerCase().includes(lowerQuery) ||
          order.userEmail.toLowerCase().includes(lowerQuery) ||
          order.items.some((item) =>
            item.name.toLowerCase().includes(lowerQuery)
          )
      );
    },
    [orders]
  );

  return {
    orders,
    pendingOrders,
    stats,
    loading,
    error,
    approveOrder,
    rejectOrder,
    updateOrderStatus,
    refreshOrders: fetchOrders,
    filterByStatus,
    searchOrders,
  };
}

/**
 * Hook for a single order with real-time updates
 */
export function useFirebaseOrder(orderId: string | null) {
  const [order, setOrder] = useState<FirestoreOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = FirebaseOrdersService.subscribeToOrder(
      orderId,
      (updatedOrder) => {
        setOrder(updatedOrder);
        setLoading(false);
      },
      (err) => {
        console.error("[useFirebaseOrder] Error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [orderId]);

  return { order, loading, error };
}

/**
 * Hook for user's orders (buyer side)
 */
export function useUserFirebaseOrders(userId: string | null) {
  const [orders, setOrders] = useState<FirestoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = FirebaseOrdersService.subscribeToUserOrders(
      userId,
      (updatedOrders) => {
        setOrders(updatedOrders);
        setLoading(false);
      },
      (err) => {
        console.error("[useUserFirebaseOrders] Error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [userId]);

  return { orders, loading, error };
}
