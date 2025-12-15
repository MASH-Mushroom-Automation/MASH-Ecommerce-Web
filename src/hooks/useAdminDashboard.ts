"use client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import { AdminDashboardResponse, AdminDashboardData } from "@/types/admin";

// Dev token for testing (bypasses auth-token cookie)
const DEV_TOKEN =
  process.env.NEXT_PUBLIC_DEV_ADMIN_TOKEN ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWo2eDVvbG8wMDAwaHp4b2Niczhjemk0IiwiZW1haWwiOiJtYXNoLnNlbGxlci50ZXN0QGdtYWlsLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc2NTc5MzY0OSwiZXhwIjoxNzY1ODgwMDQ5fQ.luZXzDF7yyd617TREDaBR_fGu5xknHTO8lT5tavHrLU";

const USE_DEV_TOKEN = process.env.NEXT_PUBLIC_USE_DEV_TOKEN === "true";
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

/**
 * Fetch admin dashboard data from the backend
 */
async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const headers: Record<string, string> = {};

  // Always use dev token in development mode (or when explicitly enabled)
  if ((IS_DEVELOPMENT || USE_DEV_TOKEN) && DEV_TOKEN) {
    headers["Authorization"] = `Bearer ${DEV_TOKEN}`;
    console.log("[Admin Dashboard] 🔐 Using hardcoded dev token for testing");
  }

  try {
    const response = await apiRequest<AdminDashboardResponse>(
      "/admin/dashboard",
      {
        method: "GET",
        headers,
      }
    );

    if (!response.success) {
      console.error(
        "[Admin Dashboard] ❌ API returned success: false",
        response
      );
      throw new Error("Failed to fetch admin dashboard data");
    }

    console.log("[Admin Dashboard] ✅ Data fetched successfully");
    return response.data;
  } catch (error) {
    console.error("[Admin Dashboard] ❌ Fetch error:", error);
    throw error;
  }
}

/**
 * TanStack Query hook for fetching admin dashboard data
 *
 * Features:
 * - Auto-refetches every 5 minutes
 * - Caches data for 1 minute
 * - Provides loading, error states, and refetch function
 *
 * @example
 * ```tsx
 * const { data, isLoading, isError, error, refetch } = useAdminDashboard();
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (isError) return <ErrorMessage error={error} />;
 *
 * return <DashboardContent data={data} onRefresh={refetch} />;
 * ```
 */
export function useAdminDashboard(): UseQueryResult<AdminDashboardData, Error> {
  return useQuery<AdminDashboardData, Error>({
    queryKey: ["admin", "dashboard"],
    queryFn: fetchAdminDashboard,
    staleTime: 1 * 60 * 1000, // Data is fresh for 1 minute
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

/**
 * Hook variant with custom refetch interval
 *
 * @param refetchInterval - Milliseconds between auto-refetches (default: 5 minutes)
 */
export function useAdminDashboardWithInterval(
  refetchInterval: number = 5 * 60 * 1000
): UseQueryResult<AdminDashboardData, Error> {
  return useQuery<AdminDashboardData, Error>({
    queryKey: ["admin", "dashboard"],
    queryFn: fetchAdminDashboard,
    staleTime: 1 * 60 * 1000,
    refetchInterval,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}
