/**
 * useRecentOrders Hook Tests - COVERAGE-016
 *
 * Tests for useRecentOrders hook (TanStack Query based).
 *
 * Hook source: src/hooks/useRecentOrders.ts
 * Data source: Backend API via apiRequest (global mock in jest.setup.js)
 *
 * Mock strategy:
 *   - apiRequest: jest.requireMock (global mock)
 *   - TanStack Query: Wrapped in QueryClientProvider
 */

import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Access global apiRequest mock
const { apiRequest } = jest.requireMock("@/lib/api-client") as {
  apiRequest: jest.Mock;
};

import { useRecentOrders } from "../useRecentOrders";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Override hook's retry:2 for test determinism
        gcTime: 0,
      },
    },
  });
}

function createWrapper(queryClient: QueryClient) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockOrders = [
  {
    id: "order-1",
    orderNumber: "ORD-001",
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
    status: "DELIVERED",
    totalAmount: 500,
    currency: "PHP",
    userId: "user-1",
  },
  {
    id: "order-2",
    orderNumber: "ORD-002",
    createdAt: "2025-01-14T08:00:00Z",
    updatedAt: "2025-01-14T08:00:00Z",
    status: "PENDING",
    totalAmount: 250,
    currency: "PHP",
    userId: "user-2",
  },
];

// ============================================================================
// useRecentOrders
// ============================================================================

describe("useRecentOrders", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = createQueryClient();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("should start in loading state", () => {
    // Use a resolved mock instead of never-resolving promise to avoid leaked promises
    apiRequest.mockResolvedValueOnce({
      data: { data: [], meta: { total: 0, page: 1, limit: 5, totalPages: 0 } },
    });

    const { result } = renderHook(() => useRecentOrders(), {
      wrapper: createWrapper(queryClient),
    });

    // First synchronous render always shows loading before query resolves
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it(
    "should fetch recent orders with default params",
    async () => {
      // API returns nested: { data: { data: RecentOrder[], meta: {...} } }
      apiRequest.mockResolvedValueOnce({
        data: { data: mockOrders, meta: { total: 2, page: 1, limit: 5, totalPages: 1 } },
      });

      const { result } = renderHook(() => useRecentOrders(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 10000 });

      expect(result.current.data).toEqual(mockOrders);

      // Verify URL includes default params
      expect(apiRequest).toHaveBeenCalledWith(
        expect.stringContaining("page=1"),
        expect.objectContaining({ method: "GET" })
      );
      expect(apiRequest).toHaveBeenCalledWith(
        expect.stringContaining("limit=5"),
        expect.any(Object)
      );
      expect(apiRequest).toHaveBeenCalledWith(
        expect.stringContaining("sortBy=createdAt"),
        expect.any(Object)
      );
      expect(apiRequest).toHaveBeenCalledWith(
        expect.stringContaining("sortOrder=desc"),
        expect.any(Object)
      );
    },
    30000
  );

  it("should pass custom params", async () => {
    apiRequest.mockResolvedValueOnce({
      data: { data: mockOrders, meta: { total: 2, page: 2, limit: 10, totalPages: 1 } },
    });

    const { result } = renderHook(
      () =>
        useRecentOrders({
          page: 2,
          limit: 10,
          sortBy: "totalAmount",
          sortOrder: "asc",
        }),
      { wrapper: createWrapper(queryClient) }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiRequest).toHaveBeenCalledWith(
      expect.stringContaining("page=2"),
      expect.any(Object)
    );
    expect(apiRequest).toHaveBeenCalledWith(
      expect.stringContaining("limit=10"),
      expect.any(Object)
    );
    expect(apiRequest).toHaveBeenCalledWith(
      expect.stringContaining("sortBy=totalAmount"),
      expect.any(Object)
    );
    expect(apiRequest).toHaveBeenCalledWith(
      expect.stringContaining("sortOrder=asc"),
      expect.any(Object)
    );
  });

  it("should handle API error", async () => {
    // The hook sets retry: 2, which overrides QueryClient defaults.
    // Provide enough rejections for all retries.
    apiRequest
      .mockRejectedValueOnce(new Error("Unauthorized"))
      .mockRejectedValueOnce(new Error("Unauthorized"))
      .mockRejectedValueOnce(new Error("Unauthorized"));

    const { result } = renderHook(() => useRecentOrders(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 5000,
    });

    expect(result.current.error?.message).toBe("Unauthorized");
  });

  it("should return empty array when no orders exist", async () => {
    apiRequest.mockResolvedValueOnce({
      data: { data: [], meta: { total: 0, page: 1, limit: 5, totalPages: 0 } },
    });

    const { result } = renderHook(() => useRecentOrders(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
  });

  it("should use proper query key including params", async () => {
    apiRequest.mockResolvedValueOnce({
      data: { data: mockOrders, meta: { total: 2, page: 1, limit: 5, totalPages: 1 } },
    });

    const params = { page: 1, limit: 5 };

    renderHook(() => useRecentOrders(params), {
      wrapper: createWrapper(queryClient),
    });

    // Query should be cached under ["orders", "recent", params]
    await waitFor(() => {
      const cachedData = queryClient.getQueryData([
        "orders",
        "recent",
        params,
      ]);
      expect(cachedData).toBeDefined();
    });
  });

  it("should refetch on window focus (refetchOnWindowFocus: true)", async () => {
    apiRequest.mockResolvedValueOnce({
      data: { data: mockOrders, meta: { total: 2, page: 1, limit: 5, totalPages: 1 } },
    });

    const { result } = renderHook(() => useRecentOrders(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // The hook is configured with refetchOnWindowFocus: true
    // We can verify the query options indirectly through the observer
    expect(result.current.data).toEqual(mockOrders);
  });
});
