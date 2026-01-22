/**
 * Orders API Client
 * Handles order-related operations for customers
 */

import { ApiResponse } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

// Helper to get auth token from cookie
function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )auth-token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// Helper for safe fetch with timeout
async function tryFetch<T = unknown>(
  input: string,
  init?: RequestInit,
  timeoutMs: number = 10000
): Promise<{ ok: boolean; json: T | null; status: number }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const res = await fetch(input, { ...init, signal: controller.signal });
    clearTimeout(timeout);
    let json: unknown = null;
    try {
      json = await res.json();
    } catch {
      json = null;
    }
    return { ok: res.ok, json: json as T | null, status: res.status };
  } catch {
    clearTimeout(timeout);
    return { ok: false, json: null, status: 0 };
  }
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
  productId?: string;
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  shipping: string;
  payment: string;
  total: number;
  status: "to-pay" | "to-receive" | "completed";
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export interface OrderDetail extends Order {
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress?: string;
  pickupLocation?: string;
  notes?: string;
}

export interface CreateOrderRequest {
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  pickupLocation: string;
  paymentMethod: "cod" | "gcash" | "card";
  paymentDetails?: Record<string, unknown>;
  total: number;
}

export interface CreateOrderResponse {
  orderId: string;
  status: string;
  paymentUrl?: string;
}

export interface OrdersListParams {
  status?: "to-pay" | "to-receive" | "completed";
  page?: number;
  limit?: number;
}

// Simulate API delay for development
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock orders data - will be replaced with real API
const MOCK_ORDERS: Order[] = [
  {
    id: "1",
    date: "3:47PM 09 / 25 / 2025",
    items: [
      {
        name: "Fresh White Oyster Mushrooms",
        quantity: 1,
        price: 120,
        image: "/white.jpg",
        productId: "1",
      },
      {
        name: "Mushroom Chips",
        quantity: 2,
        price: 140,
        image: "/Pink-Oyster-1.webp",
        productId: "2",
      },
    ],
    shipping: "1-3 Days",
    payment: "Cash-on-Deliver (COD)",
    total: 932.0,
    status: "to-pay",
  },
];

export class OrdersApi {
  /**
   * Get user's order history
   */
  static async getOrders(
    params?: OrdersListParams
  ): Promise<ApiResponse<Order[]>> {
    await delay(300);

    // TODO: Replace with real API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/user/orders?${new URLSearchParams(params)}`);
    // return await response.json();

    let filtered = [...MOCK_ORDERS];

    if (params?.status) {
      filtered = filtered.filter((order) => order.status === params.status);
    }

    return {
      success: true,
      data: filtered,
    };
  }

  /**
   * Get specific order details
   */
  static async getOrderById(
    orderId: string
  ): Promise<ApiResponse<OrderDetail>> {
    await delay(200);

    // TODO: Replace with real API call
    // const response = await fetch(`${API_BASE_URL}/user/orders/${orderId}`);
    // return await response.json();

    const order = MOCK_ORDERS.find((o) => o.id === orderId);

    if (!order) {
      return {
        success: false,
        data: null as any,
        message: "Order not found",
      };
    }

    // Extend order with detail fields
    const orderDetail: OrderDetail = {
      ...order,
      customerInfo: {
        name: "John Doe",
        email: "john@example.com",
        phone: "+63 912 345 6789",
      },
      pickupLocation: "MASH Makati Hub",
      trackingNumber: `TRACK-${orderId}`,
      estimatedDelivery: "Oct 28, 2025",
    };

    return {
      success: true,
      data: orderDetail,
    };
  }

  /**
   * Create a new order (checkout)
   * Tries backend first, falls back to mock if unavailable
   */
  static async createOrder(
    orderData: CreateOrderRequest
  ): Promise<ApiResponse<CreateOrderResponse>> {
    // Try real backend first
    const token = getAuthToken();
    const url = `${API_BASE_URL}/orders`;
    
    console.log("[OrdersApi] Creating order at:", url);
    
    // Transform frontend order data to backend format
    const backendOrderData = {
      userId: "guest", // Will be overwritten by backend from JWT
      items: orderData.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      shippingAddress: {
        street: orderData.pickupLocation === "main" 
          ? "Brgy 176-D, Bagong Silang, Caloocan City" 
          : "5th Avenue, Bonifacio Global City, Taguig",
        city: orderData.pickupLocation === "main" ? "Caloocan City" : "Taguig",
        state: "METRO MANILA",
        zipCode: orderData.pickupLocation === "main" ? "1428" : "1634",
        country: "Philippines",
      },
      paymentMethod: orderData.paymentMethod === "cod" ? "CASH_ON_DELIVERY" : orderData.paymentMethod.toUpperCase(),
      notes: `Pickup at ${orderData.pickupLocation === "main" ? "MASH Main Pickup Center" : "MASH BGC Pickup Point"}. Customer: ${orderData.customerInfo.name}, Phone: ${orderData.customerInfo.phone}`,
    };

    const { ok, json, status } = await tryFetch<{ data?: CreateOrderResponse; message?: string }>(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(backendOrderData),
    });

    if (ok && json) {
      console.log("[OrdersApi] Order created successfully via backend:", json);
      return {
        success: true,
        data: json.data || {
          orderId: `ORD-${Date.now()}`,
          status: "pending",
        },
      };
    }

    // Log error but continue to mock fallback
    if (status === 401) {
      console.warn("[OrdersApi] Unauthorized - user may need to login");
    } else if (status === 0) {
      console.warn("[OrdersApi] Backend not available, using mock");
    } else {
      console.warn("[OrdersApi] Backend error:", status, json);
    }

    // Mock order creation as fallback
    await delay(500);
    const orderId = `ORD-${Date.now()}`;

    return {
      success: true,
      data: {
        orderId,
        status: "pending",
        paymentUrl:
          orderData.paymentMethod === "gcash"
            ? "https://gcash.com/pay/mock"
            : undefined,
      },
    };
  }

  /**
   * Cancel an order (if status allows)
   */
  static async cancelOrder(
    orderId: string,
    reason: string
  ): Promise<ApiResponse<{ message: string }>> {
    await delay(300);

    // TODO: Replace with real API call
    // const response = await fetch(`${API_BASE_URL}/user/orders/${orderId}/cancel`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ reason }),
    // });
    // return await response.json();

    return {
      success: true,
      data: {
        message: "Order cancelled successfully",
      },
    };
  }

  /**
   * Update order status (Seller action)
   * Used for approving or rejecting orders
   */
  static async updateOrderStatus(
    orderId: string,
    newStatus: "TO_SHIP" | "CANCELLED",
    reason?: string
  ): Promise<ApiResponse<{ message: string; order?: any }>> {
    const token = getAuthToken();
    const url = `${API_BASE_URL}/orders/${orderId}/status`;

    console.log("[OrdersApi] Updating order status:", { orderId, newStatus, reason });

    const { ok, json, status } = await tryFetch<{ data?: any; message?: string }>(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        status: newStatus,
        ...(reason && { cancellationReason: reason }),
      }),
    });

    if (ok && json) {
      console.log("[OrdersApi] Order status updated successfully:", json);
      return {
        success: true,
        data: {
          message: json.message || "Order status updated successfully",
          order: json.data,
        },
      };
    }

    // Log error but continue to mock fallback
    if (status === 401) {
      console.warn("[OrdersApi] Unauthorized - seller may need to login");
      return {
        success: false,
        data: null as any,
        message: "Unauthorized. Please login again.",
      };
    } else if (status === 0) {
      console.warn("[OrdersApi] Backend not available, using mock");
    } else {
      console.warn("[OrdersApi] Backend error:", status, json);
    }

    // Mock fallback for development
    await delay(500);
    return {
      success: true,
      data: {
        message: `Order ${newStatus === "TO_SHIP" ? "approved" : "cancelled"} successfully`,
      },
    };
  }
}
