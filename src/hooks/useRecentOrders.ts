"use client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";

// TypeScript types for the API response
export interface RecentOrder {
  id: string;
  orderNumber?: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  totalAmount: number;
  currency?: string;
  userId: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  items?: Array<{
    id: string;
    productId: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress?: any;
  paymentMethod?: string;
  paymentStatus?: string;
}

export interface RecentOrdersResponse {
  data: RecentOrder[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RecentOrdersParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Dev token for testing
const DEV_TOKEN =
  process.env.NEXT_PUBLIC_DEV_ADMIN_TOKEN ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWo2eDVvbG8wMDAwaHp4b2Iczhjemk0IiwiZW1haWwiOiJtYXNoLnNlbGxlci50ZXN0QGdtYWlsLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc2NTc5MzY0OSwiZXhwIjoxNzY1ODgwMDQ5fQ.luZXzDF7yyd617TREDaBR_fGu5xknHTO8lT5tavHrLU";

const USE_DEV_TOKEN = process.env.NEXT_PUBLIC_USE_DEV_TOKEN === "true";
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

/**
 * Fetch recent orders from the backend
 */
async function fetchRecentOrders(
  params: RecentOrdersParams = {}
): Promise<RecentOrder[]> {
  const {
    page = 1,
    limit = 5,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = params;

  const headers: Record<string, string> = {};

  // Always use dev token in development mode (or when explicitly enabled)
  if ((IS_DEVELOPMENT || USE_DEV_TOKEN) && DEV_TOKEN) {
    headers["Authorization"] = `Bearer ${DEV_TOKEN}`;
    console.log("[Recent Orders] 🔐 Using hardcoded dev token for testing");
  }

  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
    });

    const response = await apiRequest<{ data: RecentOrdersResponse }>(
      `/orders?${queryParams}`,
      {
        method: "GET",
        headers,
      }
    );

    console.log("[Recent Orders] ✅ Data fetched successfully", response);
    // API returns nested data: { data: { data: [], meta: {} } }
    return response.data.data;
  } catch (error) {
    console.error("[Recent Orders] ❌ Fetch error:", error);
    throw error;
  }
}

/**
 * TanStack Query hook for fetching recent orders
 *
 * @param params - Query parameters (page, limit, sortBy, sortOrder)
 *
 * @example
 * ```tsx
 * const { data, isLoading, refetch } = useRecentOrders({
 *   page: 1,
 *   limit: 5,
 *   sortBy: 'createdAt',
 *   sortOrder: 'desc'
 * });
 *
 * if (isLoading) return <LoadingSpinner />;
 *
 * return <OrdersTable orders={data} />;
 * ```
 */
export function useRecentOrders(
  params: RecentOrdersParams = {}
): UseQueryResult<RecentOrder[], Error> {
  return useQuery<RecentOrder[], Error>({
    queryKey: ["orders", "recent", params],
    queryFn: () => fetchRecentOrders(params),
    staleTime: 1 * 60 * 1000, // Data is fresh for 1 minute
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}
