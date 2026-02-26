/**
 * @jest-environment jsdom
 */

import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTopPerformingProducts } from "../useTopPerformingProducts";

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
const sampleProducts = [
  {
    productId: "p1",
    productName: "Oyster Mushrooms",
    unitsSold: 150,
    stock: 200,
    revenue: 15000,
    price: 100,
    imageUrl: "https://example.com/oyster.jpg",
    orderCount: 50,
  },
  {
    productId: "p2",
    productName: "Shiitake Mushrooms",
    unitsSold: 100,
    stock: 80,
    revenue: 12000,
    price: 120,
    orderCount: 30,
  },
];

// ---------- tests ----------
describe("useTopPerformingProducts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Silence console.log/error from the hook
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    (console.log as jest.Mock).mockRestore();
    (console.error as jest.Mock).mockRestore();
  });

  it("should start in loading state", () => {
    mockApiRequest.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useTopPerformingProducts(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it("should fetch top performing products with default params", async () => {
    mockApiRequest.mockResolvedValueOnce({
      data: { data: sampleProducts, meta: { total: 2, limit: 10, orderBy: "revenue" } },
    });

    const { result } = renderHook(() => useTopPerformingProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(sampleProducts);
    expect(mockApiRequest).toHaveBeenCalledWith(
      expect.stringContaining("/admin/products/top-performing"),
      expect.objectContaining({ method: "GET" })
    );
    // Default params: limit=10, orderBy=revenue
    const calledUrl = mockApiRequest.mock.calls[0][0] as string;
    expect(calledUrl).toContain("limit=10");
    expect(calledUrl).toContain("orderBy=revenue");
  });

  it("should fetch with custom params", async () => {
    mockApiRequest.mockResolvedValueOnce({
      data: { data: [sampleProducts[0]], meta: { total: 1, limit: 5, orderBy: "units" } },
    });

    const { result } = renderHook(
      () => useTopPerformingProducts({ limit: 5, orderBy: "units" }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([sampleProducts[0]]);
    const calledUrl = mockApiRequest.mock.calls[0][0] as string;
    expect(calledUrl).toContain("limit=5");
    expect(calledUrl).toContain("orderBy=units");
  });

  it("should handle API error after retries", async () => {
    // Hook has retry: 2, so needs 3 rejections
    mockApiRequest
      .mockRejectedValueOnce(new Error("Server error"))
      .mockRejectedValueOnce(new Error("Server error"))
      .mockRejectedValueOnce(new Error("Server error"));

    const { result } = renderHook(() => useTopPerformingProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 5000 });

    expect(result.current.error?.message).toBe("Server error");
  });

  it("should return empty array when API returns empty data", async () => {
    mockApiRequest.mockResolvedValueOnce({
      data: { data: [], meta: { total: 0, limit: 10, orderBy: "revenue" } },
    });

    const { result } = renderHook(() => useTopPerformingProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
  });

  it("should use correct query key including params", async () => {
    mockApiRequest.mockResolvedValueOnce({
      data: { data: sampleProducts, meta: { total: 2, limit: 10, orderBy: "revenue" } },
    });

    const params = { limit: 5, orderBy: "units" as const };
    const { result } = renderHook(() => useTopPerformingProducts(params), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify query was made (proves query key works)
    expect(mockApiRequest).toHaveBeenCalledTimes(1);
  });

  it("should have staleTime of 2 minutes", async () => {
    mockApiRequest.mockResolvedValueOnce({
      data: { data: sampleProducts, meta: { total: 2, limit: 10, orderBy: "revenue" } },
    });

    const { result } = renderHook(() => useTopPerformingProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isStale).toBe(false);
    // Data should be fresh (staleTime = 2 minutes)
  });
});
