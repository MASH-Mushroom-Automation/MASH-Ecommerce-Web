/**
 * useSanityOrders Hook
 * Fetches and monitors orders with real-time updates
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { sanityClient, listenSafe } from "@/lib/sanity/client";

// TypeScript interfaces
export interface OrderItem {
  product: {
    id: string;
    name: string;
    image?: string;
  };
  variant?: {
    id: string;
    variantName: string;
  };
  quantity: number;
  price: number;
  discount: number;
  subtotal: number;
}

export interface ShippingAddress {
  fullAddress: string;
  city: string;
  province: string;
  postalCode?: string;
  country: string;
}

export interface StatusHistoryEntry {
  status: string;
  timestamp: string;
  notes?: string;
  updatedBy?: string;
}

export interface Order {
  _id?: string;
  id: string;
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerId?: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentStatus: string;
  paymentReference?: string;
  status: string;
  statusHistory?: StatusHistoryEntry[];
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  customerNotes?: string;
  internalNotes?: string;
  couponCode?: string;
  source: string;
  isPriority: boolean;
}

export interface OrderSummary {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  priorityOrders: number;
}

export interface OrderFilters {
  status?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  customerId?: string;
  isPriority?: boolean;
}

/**
 * Hook to fetch and monitor all orders
 */
export function useSanityOrders(filters?: OrderFilters) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders from Sanity
  const fetchOrders = useCallback(async () => {
    try {
      console.log("📦 [ORDERS] Fetching orders...", filters);
      setLoading(true);

      // Build GROQ query with filters
      const queryConditions: string[] = ['_type == "order"'];

      if (filters?.status) {
        queryConditions.push(`status == "${filters.status}"`);
      }
      if (filters?.paymentStatus) {
        queryConditions.push(`paymentStatus == "${filters.paymentStatus}"`);
      }
      if (filters?.startDate) {
        queryConditions.push(`orderDate >= "${filters.startDate}"`);
      }
      if (filters?.endDate) {
        queryConditions.push(`orderDate <= "${filters.endDate}"`);
      }
      if (filters?.customerId) {
        queryConditions.push(`customerId == "${filters.customerId}"`);
      }
      if (filters?.isPriority !== undefined) {
        queryConditions.push(`isPriority == ${filters.isPriority}`);
      }

      const whereClause = queryConditions.join(" && ");

      const query = `*[${whereClause}] | order(orderDate desc) {
        _id,
        orderNumber,
        orderDate,
        customerName,
        customerEmail,
        customerPhone,
        customerId,
        items[]{
          quantity,
          price,
          discount,
          subtotal,
          "product": product->{
            _id,
            name,
            "image": image.asset->url
          },
          "variant": variant->{
            _id,
            variantName
          }
        },
        subtotal,
        shippingFee,
        tax,
        discount,
        total,
        shippingAddress,
        paymentMethod,
        paymentStatus,
        paymentReference,
        status,
        statusHistory,
        trackingNumber,
        carrier,
        estimatedDelivery,
        customerNotes,
        internalNotes,
        couponCode,
        source,
        isPriority
      }`;

      const result = await sanityClient.fetch<Order[]>(query);

      const transformedOrders = result.map((order) => ({
        ...order,
        id: order._id,
      })) as Order[];

      setOrders(transformedOrders);

      // Calculate order summary
      if (transformedOrders.length > 0) {
        const pending = transformedOrders.filter((o) => o.status === "pending").length;
        const processing = transformedOrders.filter((o) => o.status === "processing").length;
        const shipped = transformedOrders.filter((o) => o.status === "shipped").length;
        const delivered = transformedOrders.filter((o) => o.status === "delivered").length;
        const cancelled = transformedOrders.filter((o) => o.status === "cancelled").length;
        const priority = transformedOrders.filter((o) => o.isPriority).length;

        const totalRevenue = transformedOrders
          .filter((o) => o.status !== "cancelled" && o.paymentStatus === "paid")
          .reduce((sum, o) => sum + o.total, 0);

        const orderSummary: OrderSummary = {
          totalOrders: transformedOrders.length,
          pendingOrders: pending,
          processingOrders: processing,
          shippedOrders: shipped,
          deliveredOrders: delivered,
          cancelledOrders: cancelled,
          totalRevenue,
          averageOrderValue: totalRevenue / (transformedOrders.length - cancelled || 1),
          priorityOrders: priority,
        };

        setSummary(orderSummary);
      } else {
        setSummary(null);
      }

      console.log(`✅ [ORDERS] Loaded ${transformedOrders.length} orders`, {
        pending,
        processing,
        shipped,
        delivered,
        revenue: totalRevenue,
      });
      setError(null);
    } catch (err) {
      console.error("❌ [ORDERS] Error fetching orders:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Real-time subscription to order changes
  useEffect(() => {
    fetchOrders();

    // Subscribe to real-time updates
    const subscription = listenSafe(`*[_type == "order"]`).subscribe((update: any) => {
      if (update.type === "mutation") {
        console.log("🔄 [ORDERS] Order updated in real-time!");
        fetchOrders();
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchOrders]);

  // Get orders by status
  const getOrdersByStatus = useCallback(
    (status: string) => {
      return orders.filter((o) => o.status === status);
    },
    [orders]
  );

  // Get priority orders
  const getPriorityOrders = useCallback(() => {
    return orders.filter((o) => o.isPriority);
  }, [orders]);

  // Get recent orders
  const getRecentOrders = useCallback(
    (count: number = 10) => {
      return orders.slice(0, count);
    },
    [orders]
  );

  // Search orders
  const searchOrders = useCallback(
    (query: string) => {
      const lowerQuery = query.toLowerCase();
      return orders.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(lowerQuery) ||
          order.customerName.toLowerCase().includes(lowerQuery) ||
          order.customerEmail.toLowerCase().includes(lowerQuery)
      );
    },
    [orders]
  );

  return {
    orders,
    summary,
    loading,
    error,
    getOrdersByStatus,
    getPriorityOrders,
    getRecentOrders,
    searchOrders,
    refetch: fetchOrders,
  };
}

/**
 * Hook to get a single order by ID or order number
 */
export function useSanityOrder(orderIdentifier: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        console.log(`📦 [ORDER] Fetching order: ${orderIdentifier}`);
        setLoading(true);

        // Try both _id and orderNumber
        const query = `*[_type == "order" && (_id == $id || orderNumber == $orderNumber)][0] {
          _id,
          orderNumber,
          orderDate,
          customerName,
          customerEmail,
          customerPhone,
          customerId,
          items[]{
            quantity,
            price,
            discount,
            subtotal,
            "product": product->{
              _id,
              name,
              "image": image.asset->url
            },
            "variant": variant->{
              _id,
              variantName
            }
          },
          subtotal,
          shippingFee,
          tax,
          discount,
          total,
          shippingAddress,
          paymentMethod,
          paymentStatus,
          paymentReference,
          status,
          statusHistory,
          trackingNumber,
          carrier,
          estimatedDelivery,
          customerNotes,
          internalNotes,
          couponCode,
          source,
          isPriority
        }`;

        const result = await sanityClient.fetch<Order>(query, {
          id: orderIdentifier,
          orderNumber: orderIdentifier,
        });

        if (result) {
          setOrder({
            ...result,
            id: result._id,
          });
          console.log(`✅ [ORDER] Loaded order: ${result.orderNumber}`);
        } else {
          console.warn(`⚠️ [ORDER] Order not found: ${orderIdentifier}`);
          setOrder(null);
        }

        setError(null);
      } catch (err) {
        console.error("❌ [ORDER] Error fetching order:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Subscribe to real-time updates for this specific order
    const subscription = sanityClient
      listenSafe(`*[_type == "order" && (_id == "${orderIdentifier}" || orderNumber == "${orderIdentifier}")]`)
      .subscribe((update) => {
        if (update.type === "mutation") {
          console.log("🔄 [ORDER] Order updated in real-time!");
          fetchOrder();
        }
      });

    return () => subscription.unsubscribe();
  }, [orderIdentifier]);

  return { order, loading, error };
}

/**
 * Hook to get order statistics for dashboard
 */
export function useOrderStatistics(dateRange?: { start: string; end: string }) {
  const filters: OrderFilters = {};
  if (dateRange) {
    filters.startDate = dateRange.start;
    filters.endDate = dateRange.end;
  }

  const { summary, loading } = useSanityOrders(filters);

  return { statistics: summary, loading };
}
