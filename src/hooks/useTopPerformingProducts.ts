"use client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";

// TypeScript types for the API response
export interface TopPerformingProduct {
  productId: string;
  productName: string;
  unitsSold: number;
  stock: number;
  revenue: number;
  price: number;
  imageUrl?: string;
  orderCount: number;
}

export interface TopPerformingProductsResponse {
  data: TopPerformingProduct[];
  meta: {
    total: number;
    limit: number;
    orderBy: "revenue" | "units";
  };
}

export interface TopPerformingProductsParams {
  limit?: number;
  orderBy?: "revenue" | "units";
}

// Dev token for testing
const DEV_TOKEN =
  process.env.NEXT_PUBLIC_DEV_ADMIN_TOKEN ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWo2eDVvbG8wMDAwaHp4b2Iczhjemk0IiwiZW1haWwiOiJtYXNoLnNlbGxlci50ZXN0QGdtYWlsLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc2NTc5MzY0OSwiZXhwIjoxNzY1ODgwMDQ5fQ.luZXzDF7yyd617TREDaBR_fGu5xknHTO8lT5tavHrLU";

const USE_DEV_TOKEN = process.env.NEXT_PUBLIC_USE_DEV_TOKEN === "true";
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

/**
 * Fetch top performing products from the backend
 */
async function fetchTopPerformingProducts(
  params: TopPerformingProductsParams = {}
): Promise<TopPerformingProduct[]> {
  const { limit = 10, orderBy = "revenue" } = params;

  const headers: Record<string, string> = {};

  // Always use dev token in development mode (or when explicitly enabled)
  if ((IS_DEVELOPMENT || USE_DEV_TOKEN) && DEV_TOKEN) {
    headers["Authorization"] = `Bearer ${DEV_TOKEN}`;
    console.log("[Top Products] Using hardcoded dev token for testing");
  }

  try {
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      orderBy,
    });

    const response = await fetch(
      `/api/admin/products/top-performing?${queryParams}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch top performing products (${response.status})`);
    }

    const data = (await response.json()) as TopPerformingProductsResponse;
    console.log("[Top Products] Data fetched successfully", data);
    return data.data;
  } catch (error) {
    console.error("[Top Products] Fetch error:", error);
    throw error;
  }
}

/**
 * TanStack Query hook for fetching top performing products
 *
 * @param params - Query parameters (limit, orderBy)
 *
 * @example
 * ```tsx
 * const { data, isLoading, refetch } = useTopPerformingProducts({ limit: 5, orderBy: 'revenue' });
 *
 * if (isLoading) return <LoadingSpinner />;
 *
 * return <ProductTable products={data} />;
 * ```
 */
export function useTopPerformingProducts(
  params: TopPerformingProductsParams = {}
): UseQueryResult<TopPerformingProduct[], Error> {
  return useQuery<TopPerformingProduct[], Error>({
    queryKey: ["admin", "products", "top-performing", params],
    queryFn: () => fetchTopPerformingProducts(params),
    staleTime: 2 * 60 * 1000, // Data is fresh for 2 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}
