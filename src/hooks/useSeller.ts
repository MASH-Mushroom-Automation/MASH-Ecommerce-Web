// Custom hooks for seller data fetching
import { useState, useEffect, useCallback } from "react";
import { SellerApi } from "@/lib/api/seller";
import { FirebaseOrdersService } from "@/lib/firebase/orders";

import {
  SellerDashboardStats,
  SellerSalesData,
  SellerProductPerformance,
  SellerOrder,
  SellerOrderDetail,
  SellerOrderStatus,
  SellerProduct,
  SellerRefund,
  SellerNotification,
  SellerAddress,
  ApiResponse,
} from "@/types/api";

// Firebase order statuses → SellerOrder status mapping
const FIREBASE_TO_SELLER_STATUS: Record<string, SellerOrderStatus> = {
  pending_approval: "PENDING",
  approved: "CONFIRMED",
  processing: "PROCESSING",
  ready_for_pickup: "PROCESSING",
  shipped: "SHIPPED",
  delivered: "DELIVERED",
  completed: "DELIVERED",
  cancelled: "CANCELLED",
  rejected: "CANCELLED",
};

const COMPLETED_STATUSES = ["delivered", "completed"];
const EXCLUDED_STATUSES = ["cancelled", "rejected"];

/** Convert a Firestore Timestamp (or anything) to a JS Date */
function toDate(ts: any): Date {
  if (!ts) return new Date(0);
  if (typeof ts.toDate === "function") return ts.toDate();
  return new Date(ts);
}

// Dashboard hooks
export function useSellerDashboard() {
  const [stats, setStats] = useState<SellerDashboardStats | null>(null);
  const [salesData, setSalesData] = useState<SellerSalesData[]>([]);
  const [productPerformance, setProductPerformance] = useState<SellerProductPerformance[]>([]);
  const [recentOrders, setRecentOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch Firebase orders + seller's own Sanity products concurrently.
      // Using the API route so sellerId is enforced server-side via JWT cookie,
      // matching the same restriction applied on the seller products page.
      const [allOrders, productsResponse] = await Promise.all([
        FirebaseOrdersService.getAllOrders(),
        fetch("/api/seller/products?limit=1000").then((r) => r.json()),
      ]);
      const sanityProducts: Array<{ id: string; name: string; stock: number }> =
        productsResponse.data ?? [];

      // ── Date Boundaries ──────────────────────────────────────────
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

      // ── Stats ────────────────────────────────────────────────────
      const currentMonthOrders = allOrders.filter(
        (o) => toDate(o.createdAt) >= startOfMonth
      );
      const lastMonthOrders = allOrders.filter((o) => {
        const d = toDate(o.createdAt);
        return d >= startOfLastMonth && d <= endOfLastMonth;
      });

      const currentRevenue = currentMonthOrders
        .filter((o) => COMPLETED_STATUSES.includes(o.status))
        .reduce((sum, o) => sum + (o.total || 0), 0);

      const lastRevenue = lastMonthOrders
        .filter((o) => COMPLETED_STATUSES.includes(o.status))
        .reduce((sum, o) => sum + (o.total || 0), 0);

      const totalSales = allOrders
        .filter((o) => !EXCLUDED_STATUSES.includes(o.status))
        .reduce(
          (sum, o) =>
            sum +
            (o.items || []).reduce(
              (s: number, item: any) => s + (item.quantity || 0),
              0
            ),
          0
        );

      const orderGrowth =
        lastMonthOrders.length > 0
          ? ((currentMonthOrders.length - lastMonthOrders.length) /
            lastMonthOrders.length) *
          100
          : 0;
      const revenueGrowth =
        lastRevenue > 0
          ? ((currentRevenue - lastRevenue) / lastRevenue) * 100
          : 0;

      const computedStats: SellerDashboardStats = {
        totalSales,
        totalOrders: allOrders.length,
        totalProducts: sanityProducts.length,
        totalRevenue: currentRevenue,
        salesGrowth: Math.round(orderGrowth * 10) / 10,
        orderGrowth: Math.round(orderGrowth * 10) / 10,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      };

      // ── Sales Chart (last 7 days) ─────────────────────────────────
      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const computedSalesData: SellerSalesData[] = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
        const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

        const dayOrders = allOrders.filter((o) => {
          const created = toDate(o.createdAt);
          return created >= dayStart && created <= dayEnd;
        });

        const daySales = dayOrders
          .filter((o) => !EXCLUDED_STATUSES.includes(o.status))
          .reduce(
            (sum, o) =>
              sum +
              (o.items || []).reduce(
                (s: number, item: any) => s + (item.quantity || 0),
                0
              ),
            0
          );

        const dayRevenue = dayOrders
          .filter((o) => COMPLETED_STATUSES.includes(o.status))
          .reduce((sum, o) => sum + (o.total || 0), 0);

        computedSalesData.push({
          name: daysOfWeek[dayStart.getDay()],
          sales: daySales,
          revenue: dayRevenue,
        });
      }

      // ── Recent Orders (last 5) ───────────────────────────────────
      const sortedOrders = [...allOrders].sort(
        (a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime()
      );

      const computedRecentOrders: SellerOrder[] = sortedOrders
        .slice(0, 5)
        .map((o) => ({
          id: o.orderNumber || o.id,
          date: toDate(o.createdAt).toISOString().split("T")[0],
          customer: o.userName || o.userEmail || "Unknown",
          items: (o.items || []).length,
          total: o.total || 0,
          status: FIREBASE_TO_SELLER_STATUS[o.status] || "PENDING",
        }));

      // ── Product Performance (Sanity products × Firebase orders) ──
      const productStats = new Map<string, { sales: number; revenue: number }>();

      for (const order of allOrders) {
        if (EXCLUDED_STATUSES.includes(order.status)) continue;
        for (const item of order.items || []) {
          if (!item.productId) continue;
          const existing = productStats.get(item.productId) || { sales: 0, revenue: 0 };
          existing.sales += item.quantity || 0;
          existing.revenue += (item.price || 0) * (item.quantity || 0);
          productStats.set(item.productId, existing);
        }
      }

      const computedProductPerformance: SellerProductPerformance[] = sanityProducts
        .map((p) => {
          const ps = productStats.get(p.id) || { sales: 0, revenue: 0 };
          return {
            name: p.name,
            sales: ps.sales,
            stock: p.stock || 0,
            revenue: ps.revenue,
          };
        })
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

      setStats(computedStats);
      setSalesData(computedSalesData);
      setProductPerformance(computedProductPerformance);
      setRecentOrders(computedRecentOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats,
    salesData,
    productPerformance,
    recentOrders,
    loading,
    error,
    refetch: fetchDashboardData,
  };
}


export function useSellerOrderDetail(orderId?: string) {
  const [order, setOrder] = useState<SellerOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      setOrder(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await SellerApi.getOrderById(orderId);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Order not found");
      }
      setOrder(response.data);
    } catch (err) {
      setOrder(null);
      setError(err instanceof Error ? err.message : "Failed to fetch order");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const updateStatus = useCallback(
    async (status: SellerOrderStatus) => {
      if (!orderId) {
        throw new Error("Missing order id");
      }

      const response = await SellerApi.updateOrderStatus(orderId, status);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to update order status");
      }

      setOrder(response.data);
      return response.data;
    },
    [orderId]
  );

  return {
    order,
    loading,
    error,
    updateStatus,
    refetch: fetchOrder,
  };
}

// Products hooks
export function useSellerProducts(
  params: { page?: number; limit?: number; search?: string } = {}
) {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await SellerApi.getProducts(params);
      setProducts(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [params.page, params.limit, params.search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    pagination,
    refetch: fetchProducts,
  };
}

// Orders hooks
export function useSellerOrders(
  params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}
) {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await SellerApi.getOrders(params);
      setOrders(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [params.page, params.limit, params.status, params.search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    pagination,
    refetch: fetchOrders,
  };
}

// Refunds hooks
export function useSellerRefunds(
  params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}
) {
  const [refunds, setRefunds] = useState<SellerRefund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchRefunds = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await SellerApi.getRefunds(params);
      setRefunds(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch refunds");
      setRefunds([]);
    } finally {
      setLoading(false);
    }
  }, [params.page, params.limit, params.status]);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  return {
    refunds,
    loading,
    error,
    pagination,
    refetch: fetchRefunds,
  };
}

// Notifications hooks
export function useSellerNotifications() {
  const [notifications, setNotifications] = useState<SellerNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await SellerApi.getNotifications();
      setNotifications(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch notifications"
      );
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await SellerApi.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
  };
}

// Addresses hooks
export function useSellerAddresses() {
  const [addresses, setAddresses] = useState<SellerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await SellerApi.getAddresses();
      setAddresses(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch addresses"
      );
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAddress = useCallback(
    async (address: Omit<SellerAddress, "id">) => {
      try {
        const response = await SellerApi.createAddress(address);
        setAddresses((prev) => [...prev, response.data]);
        return response;
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : "Failed to create address"
        );
      }
    },
    []
  );

  const updateAddress = useCallback(
    async (id: string, address: Partial<SellerAddress>) => {
      try {
        const response = await SellerApi.updateAddress(id, address);
        setAddresses((prev) =>
          prev.map((addr) => (addr.id === id ? response.data : addr))
        );
        return response;
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : "Failed to update address"
        );
      }
    },
    []
  );

  const deleteAddress = useCallback(async (id: string) => {
    try {
      await SellerApi.deleteAddress(id);
      setAddresses((prev) => prev.filter((addr) => addr.id !== id));
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to delete address"
      );
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  return {
    addresses,
    loading,
    error,
    refetch: fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
  };
}
