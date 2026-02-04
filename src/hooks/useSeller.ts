// Custom hooks for seller data fetching
import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SellerApi } from "@/lib/api/seller";
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

// Dashboard hooks
export function useSellerDashboard() {
  const [stats, setStats] = useState<SellerDashboardStats | null>(null);
  const [salesData, setSalesData] = useState<SellerSalesData[]>([]);
  const [productPerformance, setProductPerformance] = useState<
    SellerProductPerformance[]
  >([]);
  const [recentOrders, setRecentOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        statsResponse,
        salesResponse,
        performanceResponse,
        ordersResponse,
      ] = await Promise.all([
        SellerApi.getDashboardStats(),
        SellerApi.getSalesData(),
        SellerApi.getProductPerformance(),
        SellerApi.getOrders({ limit: 5 }),
      ]);

      setStats(statsResponse.data);
      setSalesData(salesResponse.data);
      setProductPerformance(performanceResponse.data);
      setRecentOrders(ordersResponse.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch dashboard data",
      );
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
    [orderId],
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
  params: { page?: number; limit?: number; search?: string } = {},
) {
  const query = useQuery({
    queryKey: ["seller-products", params],
    queryFn: () => SellerApi.getProducts(params),
    staleTime: 0, // Always refetch when mounting seller products list
  });

  return {
    products: query.data?.data || [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    pagination: query.data?.pagination,
    refetch: query.refetch,
  };
}

export function useSellerProduct(productId?: string) {
  const query = useQuery({
    queryKey: ["seller-product", productId],
    queryFn: () =>
      productId
        ? SellerApi.getProductById(productId)
        : Promise.resolve({ data: null, success: true }),
    enabled: !!productId,
    staleTime: 0, // Ensure we always have fresh data for editing
  });

  return {
    product: query.data?.data || null,
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
  };
}

export function useUpdateSellerProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: any }) =>
      SellerApi.updateProduct(productId, data),
    // Optimistic updates
    onMutate: async ({ productId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["seller-products"] });
      await queryClient.cancelQueries({
        queryKey: ["seller-product", productId],
      });

      // Snapshot previous values for all matching product lists
      const previousQueries = queryClient.getQueriesData({
        queryKey: ["seller-products"],
      });
      const previousProduct = queryClient.getQueryData([
        "seller-product",
        productId,
      ]);

      // Optimistically update all matching product lists
      queryClient.setQueriesData(
        { queryKey: ["seller-products"] },
        (old: any) => {
          if (!old || !old.data) return old;

          // Transform ProductFormData to Partial<SellerProduct> for optimistic update
          const optimisticUpdate: any = {
            name: data.name,
            price: data.price,
            stock: data.quantity,
            description: data.description,
            isAvailable: data.isAvailable,
          };

          // Map image
          if (data.images && data.images.length > 0) {
            optimisticUpdate.image = data.images[0].url;
          }

          // Map status
          if (data.isAvailable !== undefined || data.quantity !== undefined) {
            const isAvailable =
              data.isAvailable !== undefined ? data.isAvailable : true;
            const stock = data.quantity !== undefined ? data.quantity : 0;
            optimisticUpdate.status = isAvailable
              ? stock > 0
                ? "Active"
                : "Out of Stock"
              : "Inactive";
          }

          return {
            ...old,
            data: old.data.map((p: any) =>
              p.id === productId ? { ...p, ...optimisticUpdate } : p,
            ),
          };
        },
      );

      if (previousProduct) {
        queryClient.setQueryData(["seller-product", productId], (old: any) => {
          if (!old || !old.data) return old;

          // Transform ProductFormData to Partial<SellerProduct>
          const optimisticUpdate: any = {
            name: data.name,
            price: data.price,
            stock: data.quantity,
            description: data.description,
            isAvailable: data.isAvailable,
            sku: data.sku,
            weight: data.weight,
            compareAtPrice: data.compareAtPrice,
            hasVariants: data.hasVariants,
            variants: data.variants,
            images: data.images,
            seo: data.seo,
          };

          return {
            ...old,
            data: { ...old.data, ...optimisticUpdate },
          };
        });
      }

      return { previousQueries, previousProduct };
    },
    // If mutation fails, use context returned from onMutate to roll back
    onError: (err, variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }
      if (context?.previousProduct) {
        queryClient.setQueryData(
          ["seller-product", variables.productId],
          context.previousProduct,
        );
      }
    },
    // Always refetch after error or success
    onSettled: (data, error, variables) => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["seller-products"] }),
        queryClient.invalidateQueries({
          queryKey: ["seller-product", variables.productId],
        }),
      ]);
    },
  });
}

// Orders hooks
export function useSellerOrders(
  params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {},
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
  } = {},
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
        err instanceof Error ? err.message : "Failed to fetch notifications",
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
            : notification,
        ),
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
        err instanceof Error ? err.message : "Failed to fetch addresses",
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
          err instanceof Error ? err.message : "Failed to create address",
        );
      }
    },
    [],
  );

  const updateAddress = useCallback(
    async (id: string, address: Partial<SellerAddress>) => {
      try {
        const response = await SellerApi.updateAddress(id, address);
        setAddresses((prev) =>
          prev.map((addr) => (addr.id === id ? response.data : addr)),
        );
        return response;
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : "Failed to update address",
        );
      }
    },
    [],
  );

  const deleteAddress = useCallback(async (id: string) => {
    try {
      await SellerApi.deleteAddress(id);
      setAddresses((prev) => prev.filter((addr) => addr.id !== id));
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to delete address",
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
