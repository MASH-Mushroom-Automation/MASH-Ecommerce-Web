/**
 * Orders API Client
 * Handles order-related operations for customers
 */

import { ApiResponse } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

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
   */
  static async createOrder(
    orderData: CreateOrderRequest
  ): Promise<ApiResponse<CreateOrderResponse>> {
    await delay(500);

    // TODO: Replace with real API call
    // const response = await fetch(`${API_BASE_URL}/orders/create`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(orderData),
    // });
    // return await response.json();

    // Mock order creation
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
}
