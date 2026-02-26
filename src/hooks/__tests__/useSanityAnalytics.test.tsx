/**
 * Tests for src/hooks/useSanityAnalytics.ts
 *
 * Hooks:  useSanityAnalytics, useDashboardMetrics
 *
 * useSanityAnalytics fetches analytics reports from Sanity CMS with
 * optional reportType filtering, transforms _id to id, and subscribes
 * to real-time updates via listenSafe.
 *
 * useDashboardMetrics aggregates data from multiple Sanity queries
 * (sales-overview, customer-insights, product-performance) into a
 * single DashboardMetrics object.
 */

import { renderHook, waitFor, act } from "@testing-library/react";

// Grab global Sanity mocks (set up in jest.setup.js)
const { sanityClient, listenSafe } = jest.requireMock("@/lib/sanity/client");

import {
  useSanityAnalytics,
  useDashboardMetrics,
  type AnalyticsReport,
  type DashboardMetrics,
} from "../useSanityAnalytics";

// ─── Helpers ──────────────────────────────────────────────────

const makeReport = (overrides: Partial<AnalyticsReport> = {}): any => ({
  _id: "report-1",
  reportName: "Sales Report",
  reportType: "sales-overview",
  dateRange: { startDate: "2025-01-01", endDate: "2025-01-31" },
  salesMetrics: {
    totalRevenue: 10000,
    totalOrders: 100,
    averageOrderValue: 100,
    totalProducts: 50,
    conversionRate: 3.5,
  },
  generatedAt: "2025-01-31T00:00:00Z",
  ...overrides,
});

const makeSalesData = (overrides = {}) => ({
  salesMetrics: {
    totalRevenue: 50000,
    totalOrders: 200,
    averageOrderValue: 250,
    conversionRate: 4.2,
    ...overrides,
  },
});

const makeCustomerData = (overrides = {}) => ({
  customerMetrics: {
    newCustomers: 50,
    returningCustomers: 150,
    ...overrides,
  },
});

const makeProductData = (overrides = {}) => ({
  topProducts: [
    { product: { id: "p1", name: "Top Product" }, unitsSold: 100, revenue: 5000 },
    ...((overrides as any)?.additionalProducts || []),
  ],
});

// ─── Setup ────────────────────────────────────────────────────

let subscribeCb: ((update: any) => void) | null = null;
const mockUnsubscribe = jest.fn();

beforeEach(() => {
  sanityClient.fetch.mockClear();
  listenSafe.mockClear();
  mockUnsubscribe.mockClear();
  subscribeCb = null;

  // Default: return array of reports
  sanityClient.fetch.mockResolvedValue([
    makeReport({ _id: "r1", reportName: "Report 1" }),
    makeReport({ _id: "r2", reportName: "Report 2" }),
  ]);

  // Capture real-time subscription callback
  listenSafe.mockReturnValue({
    subscribe: jest.fn((cb: any) => {
      subscribeCb = cb;
      return { unsubscribe: mockUnsubscribe };
    }),
  });
});

// ═══════════════════════════════════════════════════════════════
// useSanityAnalytics
// ═══════════════════════════════════════════════════════════════

describe("useSanityAnalytics", () => {
  it("starts in loading state", () => {
    sanityClient.fetch.mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useSanityAnalytics());

    expect(result.current.loading).toBe(true);
    expect(result.current.reports).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("fetches all analytics reports when no reportType specified", async () => {
    const { result } = renderHook(() => useSanityAnalytics());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(sanityClient.fetch).toHaveBeenCalledTimes(1);
    expect(sanityClient.fetch).toHaveBeenCalledWith(
      expect.stringContaining('_type == "analytics"')
    );
    expect(result.current.reports).toHaveLength(2);
  });

  it("filters by reportType when specified", async () => {
    const { result } = renderHook(() => useSanityAnalytics("sales-overview"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(sanityClient.fetch).toHaveBeenCalledWith(
      expect.stringContaining('reportType == "sales-overview"')
    );
  });

  it("transforms _id to id field on each report", async () => {
    sanityClient.fetch.mockResolvedValue([
      makeReport({ _id: "abc-123" }),
    ]);

    const { result } = renderHook(() => useSanityAnalytics());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.reports[0].id).toBe("abc-123");
  });

  it("returns no error on successful fetch", async () => {
    const { result } = renderHook(() => useSanityAnalytics());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
  });

  // ─── Error Handling ──────────────────────────────────────────

  it("sets string error on fetch failure (Error instance)", async () => {
    sanityClient.fetch.mockRejectedValue(new Error("Sanity unreachable"));

    const { result } = renderHook(() => useSanityAnalytics());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Sanity unreachable");
    expect(result.current.reports).toEqual([]);
  });

  it("sets fallback string error on non-Error rejection", async () => {
    sanityClient.fetch.mockRejectedValue("unexpected");

    const { result } = renderHook(() => useSanityAnalytics());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Failed to fetch analytics");
  });

  // ─── Real-time Subscription ──────────────────────────────────

  it("subscribes to listenSafe for real-time updates", async () => {
    const { result } = renderHook(() => useSanityAnalytics());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(listenSafe).toHaveBeenCalledWith(
      expect.stringContaining('_type == "analytics"')
    );
  });

  it("re-fetches on mutation event", async () => {
    const { result } = renderHook(() => useSanityAnalytics());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const callsBefore = sanityClient.fetch.mock.calls.length;

    sanityClient.fetch.mockResolvedValue([
      makeReport({ _id: "r1", reportName: "Updated" }),
    ]);

    await act(async () => {
      if (subscribeCb) subscribeCb({ type: "mutation" });
    });

    await waitFor(() => {
      expect(sanityClient.fetch.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });

  it("ignores non-mutation events", async () => {
    const { result } = renderHook(() => useSanityAnalytics());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const callsBefore = sanityClient.fetch.mock.calls.length;

    await act(async () => {
      if (subscribeCb) subscribeCb({ type: "welcome" });
    });

    // No additional fetch
    expect(sanityClient.fetch.mock.calls.length).toBe(callsBefore);
  });

  it("unsubscribes on unmount", async () => {
    const { result, unmount } = renderHook(() => useSanityAnalytics());
    await waitFor(() => expect(result.current.loading).toBe(false));

    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  // ─── Refetch ─────────────────────────────────────────────────

  it("provides refetch function that re-fetches data", async () => {
    const { result } = renderHook(() => useSanityAnalytics());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const callsBefore = sanityClient.fetch.mock.calls.length;

    sanityClient.fetch.mockResolvedValue([
      makeReport({ _id: "r3", reportName: "Refetched" }),
    ]);

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(sanityClient.fetch.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });

  it("clears previous error on successful refetch", async () => {
    sanityClient.fetch.mockRejectedValueOnce(new Error("First fail"));

    const { result } = renderHook(() => useSanityAnalytics());
    await waitFor(() => expect(result.current.error).not.toBeNull());

    sanityClient.fetch.mockResolvedValue([makeReport()]);

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.error).toBeNull();
      expect(result.current.reports).toHaveLength(1);
    });
  });

  // ─── reportType change ──────────────────────────────────────

  it("re-fetches when reportType prop changes", async () => {
    const { result, rerender } = renderHook(
      ({ type }: { type?: string }) => useSanityAnalytics(type),
      { initialProps: { type: "sales-overview" } }
    );
    await waitFor(() => expect(result.current.loading).toBe(false));

    const callsBefore = sanityClient.fetch.mock.calls.length;

    rerender({ type: "customer-insights" });

    await waitFor(() => {
      expect(sanityClient.fetch.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// useDashboardMetrics
// ═══════════════════════════════════════════════════════════════

describe("useDashboardMetrics", () => {
  beforeEach(() => {
    // Override default to return separate query results in order
    sanityClient.fetch
      .mockResolvedValueOnce(makeSalesData())      // salesQuery
      .mockResolvedValueOnce(makeCustomerData())   // customersQuery
      .mockResolvedValueOnce(makeProductData());    // productsQuery
  });

  it("starts in loading state", () => {
    sanityClient.fetch.mockReset();
    sanityClient.fetch.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useDashboardMetrics());

    expect(result.current.loading).toBe(true);
    expect(result.current.metrics).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("fetches and aggregates metrics from 3 Sanity queries", async () => {
    const { result } = renderHook(() => useDashboardMetrics());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(sanityClient.fetch).toHaveBeenCalledTimes(3);
    expect(result.current.metrics).not.toBeNull();
  });

  it("returns correct revenue and orders from sales data", async () => {
    const { result } = renderHook(() => useDashboardMetrics());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.metrics!.totalRevenue).toBe(50000);
    expect(result.current.metrics!.totalOrders).toBe(200);
    expect(result.current.metrics!.averageOrderValue).toBe(250);
    expect(result.current.metrics!.conversionRate).toBe(4.2);
  });

  it("returns correct total customers (new + returning)", async () => {
    const { result } = renderHook(() => useDashboardMetrics());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // 50 new + 150 returning = 200
    expect(result.current.metrics!.totalCustomers).toBe(200);
  });

  it("returns top selling product name from product data", async () => {
    const { result } = renderHook(() => useDashboardMetrics());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.metrics!.topSellingProduct).toBe("Top Product");
  });

  it("defaults revenueGrowth to 0", async () => {
    const { result } = renderHook(() => useDashboardMetrics());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.metrics!.revenueGrowth).toBe(0);
  });

  // ─── Null / Missing Data ─────────────────────────────────────

  it("handles null sales data gracefully", async () => {
    sanityClient.fetch.mockReset();
    sanityClient.fetch
      .mockResolvedValueOnce(null)               // salesQuery returns null
      .mockResolvedValueOnce(makeCustomerData())
      .mockResolvedValueOnce(makeProductData());

    const { result } = renderHook(() => useDashboardMetrics());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.metrics!.totalRevenue).toBe(0);
    expect(result.current.metrics!.totalOrders).toBe(0);
  });

  it("handles null customer data gracefully", async () => {
    sanityClient.fetch.mockReset();
    sanityClient.fetch
      .mockResolvedValueOnce(makeSalesData())
      .mockResolvedValueOnce(null)               // customersQuery returns null
      .mockResolvedValueOnce(makeProductData());

    const { result } = renderHook(() => useDashboardMetrics());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.metrics!.totalCustomers).toBe(0);
  });

  it("handles null product data - topSellingProduct defaults to N/A", async () => {
    sanityClient.fetch.mockReset();
    sanityClient.fetch
      .mockResolvedValueOnce(makeSalesData())
      .mockResolvedValueOnce(makeCustomerData())
      .mockResolvedValueOnce(null);              // productsQuery returns null

    const { result } = renderHook(() => useDashboardMetrics());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.metrics!.topSellingProduct).toBe("N/A");
  });

  // ─── Error Handling ──────────────────────────────────────────

  it("sets string error on any query failure", async () => {
    sanityClient.fetch.mockReset();
    sanityClient.fetch.mockRejectedValue(new Error("Dashboard fetch error"));

    const { result } = renderHook(() => useDashboardMetrics());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Dashboard fetch error");
    expect(result.current.metrics).toBeNull();
  });

  it("sets fallback string error on non-Error rejection", async () => {
    sanityClient.fetch.mockReset();
    sanityClient.fetch.mockRejectedValue(42);

    const { result } = renderHook(() => useDashboardMetrics());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Failed to fetch dashboard metrics");
  });

  // ─── Real-time Subscription ──────────────────────────────────

  it("subscribes to listenSafe for real-time updates", async () => {
    const { result } = renderHook(() => useDashboardMetrics());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(listenSafe).toHaveBeenCalled();
  });

  it("unsubscribes on unmount", async () => {
    const { result, unmount } = renderHook(() => useDashboardMetrics());
    await waitFor(() => expect(result.current.loading).toBe(false));

    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
