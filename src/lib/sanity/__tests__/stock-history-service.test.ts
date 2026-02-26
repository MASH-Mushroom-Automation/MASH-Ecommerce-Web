/**
 * Tests for src/lib/sanity/stock-history-service.ts
 * Stock history queries, pagination, CSV export, stats
 */

// Mock sanity client
jest.mock("@/lib/sanity/client", () => ({
  sanityClient: {
    fetch: jest.fn(),
  },
}));

// Mock stock-management queries module
jest.mock("@/lib/sanity/queries/stock-management", () => ({
  getStockHistoryQuery: jest.fn(() => "mock-history-query"),
  getRecentAdjustmentsQuery: jest.fn(() => "mock-recent-query"),
  countStockAdjustmentsQuery: jest.fn(() => "mock-count-query"),
  getStockAdjustmentsByTypeQuery: jest.fn(() => "mock-type-query"),
}));

import { sanityClient } from "@/lib/sanity/client";
import {
  getStockHistory,
  getAdjustmentsByType,
  getRecentAdjustments,
  exportStockHistoryToCSV,
  downloadCSV,
  getStockHistoryStats,
} from "../stock-history-service";

const mockFetch = sanityClient.fetch as jest.Mock;

describe("stock-history-service", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ─── getStockHistory ────────────────────────────────────────────────

  describe("getStockHistory", () => {
    const mockItems = [
      {
        _id: "adj-1",
        adjustmentType: "received",
        quantityChange: 10,
        previousStock: 0,
        newStock: 10,
        reason: "Restock",
        notes: "Delivery from supplier",
        adjustmentDate: "2025-01-15T10:00:00Z",
        adjustedBy: { _id: "u1", name: "John", email: "john@test.com" },
      },
      {
        _id: "adj-2",
        adjustmentType: "sold",
        quantityChange: -3,
        previousStock: 10,
        newStock: 7,
        reason: "Order #123",
        notes: null,
        adjustmentDate: "2025-01-16T11:00:00Z",
        adjustedBy: { _id: "u2", name: "Jane", email: "jane@test.com" },
      },
    ];

    it("returns paginated stock history", async () => {
      mockFetch
        .mockResolvedValueOnce(mockItems) // items query
        .mockResolvedValueOnce(2); // count query

      const result = await getStockHistory("product-1");
      expect(result.items).toEqual(mockItems);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
      expect(result.hasMore).toBe(false);
      expect(result.totalPages).toBe(1);
    });

    it("calculates hasMore correctly", async () => {
      mockFetch
        .mockResolvedValueOnce(mockItems)
        .mockResolvedValueOnce(50);

      const result = await getStockHistory("product-1", {
        page: 1,
        pageSize: 2,
      });
      expect(result.hasMore).toBe(true);
      expect(result.totalPages).toBe(25);
    });

    it("passes adjustmentTypes filter to query params", async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(0);

      await getStockHistory("product-1", {
        filters: { adjustmentTypes: ["received", "sold"] },
      });

      // sanityClient.fetch was called with params containing adjustmentTypes
      const callParams = mockFetch.mock.calls[0][1];
      expect(callParams.adjustmentTypes).toEqual(["received", "sold"]);
    });

    it("passes dateFrom filter", async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(0);

      await getStockHistory("product-1", {
        filters: { dateFrom: "2025-01-01T00:00:00Z" },
      });

      const callParams = mockFetch.mock.calls[0][1];
      expect(callParams.dateFrom).toBe("2025-01-01T00:00:00Z");
    });

    it("converts Date object for dateFrom", async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(0);

      const date = new Date("2025-01-01T00:00:00Z");
      await getStockHistory("product-1", {
        filters: { dateFrom: date },
      });

      const callParams = mockFetch.mock.calls[0][1];
      expect(callParams.dateFrom).toBe(date.toISOString());
    });

    it("passes dateTo filter", async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(0);

      await getStockHistory("product-1", {
        filters: { dateTo: "2025-12-31T23:59:59Z" },
      });

      const callParams = mockFetch.mock.calls[0][1];
      expect(callParams.dateTo).toBe("2025-12-31T23:59:59Z");
    });

    it("calculates offset correctly for page 2", async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(0);

      await getStockHistory("product-1", { page: 2, pageSize: 10 });

      const callParams = mockFetch.mock.calls[0][1];
      expect(callParams.offset).toBe(10);
    });

    it("uses default page=1 and pageSize=20", async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(0);

      const result = await getStockHistory("product-1");
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });
  });

  // ─── getAdjustmentsByType ───────────────────────────────────────────

  describe("getAdjustmentsByType", () => {
    it("returns paginated results for a type", async () => {
      const items = [
        { _id: "adj-x", adjustmentType: "damaged", quantityChange: -2 },
      ];
      mockFetch
        .mockResolvedValueOnce(items)
        .mockResolvedValueOnce(1);

      const result = await getAdjustmentsByType("damaged");
      expect(result.items).toEqual(items);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it("passes date range filters", async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(0);

      await getAdjustmentsByType("received", {
        dateFrom: "2025-01-01",
        dateTo: "2025-12-31",
      });

      const params = mockFetch.mock.calls[0][1];
      expect(params.dateFrom).toBe("2025-01-01");
      expect(params.dateTo).toBe("2025-12-31");
    });

    it("converts Date objects for date filters", async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(0);

      const from = new Date("2025-06-01T00:00:00Z");
      const to = new Date("2025-06-30T23:59:59Z");
      await getAdjustmentsByType("sold", {
        dateFrom: from,
        dateTo: to,
      });

      const params = mockFetch.mock.calls[0][1];
      expect(params.dateFrom).toBe(from.toISOString());
      expect(params.dateTo).toBe(to.toISOString());
    });

    it("paginates correctly", async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(100);

      const result = await getAdjustmentsByType("sold", {
        page: 3,
        pageSize: 10,
      });
      expect(result.page).toBe(3);
      expect(result.hasMore).toBe(true);
      expect(result.totalPages).toBe(10);
    });
  });

  // ─── getRecentAdjustments ──────────────────────────────────────────

  describe("getRecentAdjustments", () => {
    it("returns recent adjustments array", async () => {
      const items = [{ _id: "r1" }, { _id: "r2" }];
      mockFetch.mockResolvedValueOnce(items);

      const result = await getRecentAdjustments(5);
      expect(result).toEqual(items);
    });

    it("uses default limit", async () => {
      mockFetch.mockResolvedValueOnce([]);
      await getRecentAdjustments();
      // Should have called getRecentAdjustmentsQuery with default limit 20
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  // ─── exportStockHistoryToCSV ───────────────────────────────────────

  describe("exportStockHistoryToCSV", () => {
    it("returns CSV string with header", () => {
      const csv = exportStockHistoryToCSV([]);
      expect(csv).toContain("Date");
      expect(csv).toContain("Type");
      expect(csv).toContain("Quantity Change");
      expect(csv).toContain("Previous Stock");
      expect(csv).toContain("New Stock");
    });

    it("formats rows correctly", () => {
      const history = [
        {
          _id: "adj-1",
          adjustmentType: "received" as const,
          quantityChange: 10,
          previousStock: 0,
          newStock: 10,
          reason: "Restock",
          notes: "From supplier",
          adjustmentDate: "2025-01-15T10:00:00Z",
          adjustedBy: { _id: "u1", name: "John", email: "john@r.com" },
        },
      ];
      const csv = exportStockHistoryToCSV(history);
      const lines = csv.split("\n");
      expect(lines).toHaveLength(2); // header + 1 row
      expect(lines[1]).toContain("received");
      expect(lines[1]).toContain("10");
      expect(lines[1]).toContain('"Restock"');
      expect(lines[1]).toContain('"From supplier"');
      expect(lines[1]).toContain('"John"');
    });

    it("handles null notes", () => {
      const history = [
        {
          _id: "adj-2",
          adjustmentType: "sold" as const,
          quantityChange: -1,
          previousStock: 10,
          newStock: 9,
          reason: "Order",
          notes: null as any,
          adjustmentDate: "2025-01-16T11:00:00Z",
          adjustedBy: null as any,
        },
      ];
      const csv = exportStockHistoryToCSV(history);
      // notes column should be empty string wrapped in quotes
      expect(csv).toContain('""');
    });

    it("handles missing adjustedBy", () => {
      const history = [
        {
          _id: "adj-3",
          adjustmentType: "adjustment" as const,
          quantityChange: 5,
          previousStock: 9,
          newStock: 14,
          reason: "Correction",
          notes: "",
          adjustmentDate: "2025-01-17T12:00:00Z",
          adjustedBy: null as any,
        },
      ];
      const csv = exportStockHistoryToCSV(history);
      expect(csv).toContain('"Unknown"');
    });

    it("uses email when name is missing", () => {
      const history = [
        {
          _id: "adj-4",
          adjustmentType: "returned" as const,
          quantityChange: 2,
          previousStock: 14,
          newStock: 16,
          reason: "Return",
          notes: "",
          adjustmentDate: "2025-01-18T09:00:00Z",
          adjustedBy: { _id: "u3", name: "", email: "backup@t.com" },
        },
      ];
      const csv = exportStockHistoryToCSV(history);
      expect(csv).toContain('"backup@t.com"');
    });
  });

  // ─── downloadCSV ───────────────────────────────────────────────────

  describe("downloadCSV", () => {
    it("creates a blob and triggers download", () => {
      const mockCreateObjectURL = jest.fn(() => "blob:url");
      const mockRevokeObjectURL = jest.fn();
      Object.defineProperty(global, "URL", {
        value: {
          createObjectURL: mockCreateObjectURL,
          revokeObjectURL: mockRevokeObjectURL,
        },
        writable: true,
        configurable: true,
      });

      const clickSpy = jest.fn();
      const appendChildSpy = jest.spyOn(document.body, "appendChild").mockImplementation((node) => node);
      const removeChildSpy = jest.spyOn(document.body, "removeChild").mockImplementation((node) => node);
      jest.spyOn(document, "createElement").mockReturnValue({
        href: "",
        download: "",
        style: { visibility: "" },
        click: clickSpy,
      } as any);

      downloadCSV("header\nrow", "test.csv");
      expect(clickSpy).toHaveBeenCalled();
    });
  });

  // ─── getStockHistoryStats ──────────────────────────────────────────

  describe("getStockHistoryStats", () => {
    it("returns stats with totalAdjustments, typeBreakdown, lastAdjustment", async () => {
      mockFetch
        .mockResolvedValueOnce(42) // total count
        .mockResolvedValueOnce([{ received: 10, sold: 20, returned: 5, damaged: 2, transferred: 3, adjustment: 2 }]) // type breakdown
        .mockResolvedValueOnce({
          _id: "last",
          adjustmentType: "sold",
          quantityChange: -1,
          previousStock: 10,
          newStock: 9,
          reason: "Order",
          notes: "",
          adjustmentDate: "2025-01-20T15:00:00Z",
          adjustedBy: null,
        }); // last adjustment

      const result = await getStockHistoryStats("product-1");
      expect(result.totalAdjustments).toBe(42);
      expect(result.typeBreakdown).toBeDefined();
      expect(result.typeBreakdown.received).toBe(10);
      expect(result.typeBreakdown.sold).toBe(20);
      expect(result.lastAdjustment).toBeDefined();
    });

    it("returns zero counts when no adjustments exist", async () => {
      mockFetch
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(null);

      const result = await getStockHistoryStats("product-empty");
      expect(result.totalAdjustments).toBe(0);
      expect(result.typeBreakdown.received).toBe(0);
      expect(result.typeBreakdown.sold).toBe(0);
      expect(result.lastAdjustment).toBeNull();
    });

    it("defaults missing type counts to 0", async () => {
      mockFetch
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce([{ received: 5 }]) // other keys missing
        .mockResolvedValueOnce(null);

      const result = await getStockHistoryStats("product-partial");
      expect(result.typeBreakdown.received).toBe(5);
      expect(result.typeBreakdown.sold).toBe(0);
      expect(result.typeBreakdown.damaged).toBe(0);
      expect(result.typeBreakdown.transferred).toBe(0);
      expect(result.typeBreakdown.adjustment).toBe(0);
      expect(result.typeBreakdown.returned).toBe(0);
    });
  });
});
