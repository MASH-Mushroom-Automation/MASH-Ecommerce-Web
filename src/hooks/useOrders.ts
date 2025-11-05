/**
 * Custom hooks for order-related operations
 */

import { useState, useEffect } from "react";
import { OrdersApi, Order, OrderDetail, OrdersListParams } from "@/lib/api/orders";

/**
 * Hook to fetch user's order history
 */
export function useOrders(params?: OrdersListParams) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await OrdersApi.getOrders(params);

        if (!active) return;

        if (response.success && response.data) {
          setOrders(response.data);
        } else {
          setError(response.message || "Failed to fetch orders");
        }
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to fetch orders");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      active = false;
    };
  }, [params?.status, params?.page, params?.limit]);

  const refetch = async () => {
    setLoading(true);
    try {
      const response = await OrdersApi.getOrders(params);
      if (response.success && response.data) {
        setOrders(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  return { orders, loading, error, refetch };
}

/**
 * Hook to fetch a specific order by ID
 */
export function useOrder(orderId: string | null) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    let active = true;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await OrdersApi.getOrderById(orderId);

        if (!active) return;

        if (response.success && response.data) {
          setOrder(response.data);
        } else {
          setError(response.message || "Failed to fetch order");
        }
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to fetch order");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchOrder();

    return () => {
      active = false;
    };
  }, [orderId]);

  return { order, loading, error };
}
