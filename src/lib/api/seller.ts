// API functions for seller-related operations
// All methods call the Next.js API routes which proxy to the real NestJS backend.
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

// ─── Helper ──────────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.error?.message ?? json.message ?? `Request failed: ${url}`);
  }
  return json as ApiResponse<T>;
}

// ─── SellerApi ────────────────────────────────────────────────────────────────

export class SellerApi {
  // ── Dashboard ─────────────────────────────────────────────────────────────

  static async getDashboardStats(): Promise<ApiResponse<SellerDashboardStats>> {
    return apiFetch<SellerDashboardStats>("/api/seller/dashboard");
  }

  static async getSalesData(): Promise<ApiResponse<SellerSalesData[]>> {
    return apiFetch<SellerSalesData[]>("/api/seller/sales-data");
  }

  static async getProductPerformance(
    limit = 10,
    orderBy: "revenue" | "sales" = "revenue"
  ): Promise<ApiResponse<SellerProductPerformance[]>> {
    return apiFetch<SellerProductPerformance[]>(
      `/api/seller/products/top-performing?limit=${limit}&orderBy=${orderBy}`
    );
  }

  // ── Products ──────────────────────────────────────────────────────────────

  static async getProducts(
    params: { page?: number; limit?: number; search?: string } = {},
  ): Promise<ApiResponse<SellerProduct[]>> {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.search) qs.set("search", params.search);
    const query = qs.toString();
    return apiFetch<SellerProduct[]>(`/api/seller/inventory${query ? `?${query}` : ""}`);
  }

  static async getProductById(id: string): Promise<ApiResponse<SellerProduct | null>> {
    return apiFetch<SellerProduct | null>(`/api/seller/inventory?id=${id}`);
  }

  static async updateProduct(
    productId: string,
    productData: Partial<SellerProduct>
  ): Promise<ApiResponse<SellerProduct>> {
    return apiFetch<SellerProduct>(`/api/seller/products/${productId}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    });
  }

  static async deleteProduct(productId: string): Promise<ApiResponse<boolean>> {
    return apiFetch<boolean>(`/api/seller/products/${productId}`, {
      method: "DELETE",
    });
  }

  // ── Orders ────────────────────────────────────────────────────────────────

  static async getOrders(
    params: { page?: number; limit?: number; status?: string; search?: string } = {}
  ): Promise<ApiResponse<SellerOrder[]>> {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.status) qs.set("status", params.status);
    if (params.search) qs.set("search", params.search);
    const query = qs.toString();
    return apiFetch<SellerOrder[]>(`/api/seller/orders${query ? `?${query}` : ""}`);
  }

  static async getOrderById(id: string): Promise<ApiResponse<SellerOrderDetail | null>> {
    return apiFetch<SellerOrderDetail | null>(`/api/seller/orders/${id}`);
  }

  static async updateOrderStatus(
    id: string,
    status: SellerOrderStatus,
  ): Promise<ApiResponse<SellerOrderDetail | null>> {
    return apiFetch<SellerOrderDetail | null>(`/api/seller/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  // ── Refunds ───────────────────────────────────────────────────────────────

  static async getRefunds(
    params: { page?: number; limit?: number; status?: string; search?: string } = {}
  ): Promise<ApiResponse<SellerRefund[]>> {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.status) qs.set("status", params.status);
    if (params.search) qs.set("search", params.search);
    const query = qs.toString();
    return apiFetch<SellerRefund[]>(`/api/seller/refunds${query ? `?${query}` : ""}`);
  }

  // ── Notifications ─────────────────────────────────────────────────────────

  static async getNotifications(): Promise<ApiResponse<SellerNotification[]>> {
    return apiFetch<SellerNotification[]>("/api/seller/notifications");
  }

  static async markNotificationAsRead(id: string): Promise<ApiResponse<boolean>> {
    return apiFetch<boolean>("/api/seller/notifications", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
  }

  // ── Addresses ─────────────────────────────────────────────────────────────

  static async getAddresses(): Promise<ApiResponse<SellerAddress[]>> {
    return apiFetch<SellerAddress[]>("/api/seller/addresses");
  }

  static async createAddress(
    address: Omit<SellerAddress, "id">,
  ): Promise<ApiResponse<SellerAddress>> {
    return apiFetch<SellerAddress>("/api/seller/addresses", {
      method: "POST",
      body: JSON.stringify(address),
    });
  }

  static async updateAddress(
    id: string,
    address: Partial<SellerAddress>,
  ): Promise<ApiResponse<SellerAddress>> {
    // Existing route expects { id, ...address } in the PUT body
    return apiFetch<SellerAddress>("/api/seller/addresses", {
      method: "PUT",
      body: JSON.stringify({ id, ...address }),
    });
  }

  static async deleteAddress(id: string): Promise<ApiResponse<boolean>> {
    // Existing route expects ?id= query param
    return apiFetch<boolean>(`/api/seller/addresses?id=${id}`, {
      method: "DELETE",
    });
  }
}
