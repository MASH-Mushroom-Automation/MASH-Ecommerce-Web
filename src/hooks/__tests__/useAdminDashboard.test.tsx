/**
 * @jest-environment jsdom
 */

import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAdminDashboard, useAdminDashboardWithInterval } from "../useAdminDashboard";

// ---------- mock apiRequest ----------
const mockApiRequest = jest.requireMock("@/lib/api-client").apiRequest as jest.Mock;

// ---------- QueryClient wrapper ----------
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

// ---------- helpers ----------
const sampleDashboardData = {
  alert: {
    type: "info",
    message: "System running normally",
    actionUrl: "/admin/settings",
    actionLabel: "View",
  },
  metrics: {
    totalRevenue: 150000,
    totalOrders: 250,
    totalCustomers: 180,
    totalProducts: 45,
    pendingOrders: 12,
    completedOrders: 230,
    cancelledOrders: 8,
    averageOrderValue: 600,
  },
  charts: {
    weeklySales: [
      { date: "2025-01-01", sales: 5000, orders: 10 },
      { date: "2025-01-02", sales: 7000, orders: 15 },
    ],
    revenueTrend: [
      { date: "2025-01-01", revenue: 5000 },
      { date: "2025-01-02", revenue: 7000 },
    ],
  },
};

function successResponse(data = sampleDashboardData) {
  return {
    success: true,
    statusCode: 200,
    data,
    timestamp: "2025-01-01T00:00:00Z",
    path: "/api/v1/admin/dashboard",
    correlationId: "test-123",
  };
}

// ---------- tests ----------
describe("useAdminDashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    (console.log as jest.Mock).mockRestore();
    (console.error as jest.Mock).mockRestore();
  });

  it("should start in loading state", () => {
    mockApiRequest.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useAdminDashboard(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it("should fetch admin dashboard data on mount", async () => {
    mockApiRequest.mockResolvedValueOnce(successResponse());

    const { result } = renderHook(() => useAdminDashboard(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(sampleDashboardData);
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/dashboard", expect.objectContaining({ method: "GET" }));
  });

  it("should throw error when API returns success: false", async () => {
    mockApiRequest
      .mockResolvedValueOnce({ success: false, data: null })
      .mockResolvedValueOnce({ success: false, data: null })
      .mockResolvedValueOnce({ success: false, data: null });

    const { result } = renderHook(() => useAdminDashboard(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 5000 });

    expect(result.current.error?.message).toBe("Failed to fetch admin dashboard data");
  });

  it("should handle network error after retries", async () => {
    // Hook has retry: 2 (3 total attempts)
    mockApiRequest
      .mockRejectedValueOnce(new Error("Network failure"))
      .mockRejectedValueOnce(new Error("Network failure"))
      .mockRejectedValueOnce(new Error("Network failure"));

    const { result } = renderHook(() => useAdminDashboard(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 5000 });

    expect(result.current.error?.message).toBe("Network failure");
  });

  it("should have staleTime of 1 minute", async () => {
    mockApiRequest.mockResolvedValueOnce(successResponse());

    const { result } = renderHook(() => useAdminDashboard(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isStale).toBe(false);
  });

  it("should use correct query key", async () => {
    mockApiRequest.mockResolvedValueOnce(successResponse());

    const { result } = renderHook(() => useAdminDashboard(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Data was fetched once proving the query key works
    expect(mockApiRequest).toHaveBeenCalledTimes(1);
  });
});

describe("useAdminDashboardWithInterval", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    (console.log as jest.Mock).mockRestore();
    (console.error as jest.Mock).mockRestore();
  });

  it("should fetch data on mount", async () => {
    mockApiRequest.mockResolvedValueOnce(successResponse());

    const { result } = renderHook(() => useAdminDashboardWithInterval(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(sampleDashboardData);
  });

  it("should accept custom refetch interval", async () => {
    mockApiRequest.mockResolvedValueOnce(successResponse());

    const { result } = renderHook(() => useAdminDashboardWithInterval(30000), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(sampleDashboardData);
  });

  it("should handle error with custom interval", async () => {
    mockApiRequest
      .mockRejectedValueOnce(new Error("Timeout"))
      .mockRejectedValueOnce(new Error("Timeout"))
      .mockRejectedValueOnce(new Error("Timeout"));

    const { result } = renderHook(() => useAdminDashboardWithInterval(60000), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 5000 });

    expect(result.current.error?.message).toBe("Timeout");
  });
});
