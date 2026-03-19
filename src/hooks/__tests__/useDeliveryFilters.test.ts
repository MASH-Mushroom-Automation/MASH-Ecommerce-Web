import { renderHook, act } from "@testing-library/react";
import { useDeliveryFilters } from "../useDeliveryFilters";

const now = new Date("2026-03-19T10:00:00Z");

const mockOrders = [
  {
    id: "order-1",
    orderNumber: "MASH-001",
    lalamoveTracking: {
      status: "COMPLETED",
      lastUpdated: new Date("2026-03-18T10:00:00Z"),
    },
  },
  {
    id: "order-2",
    orderNumber: "MASH-002",
    lalamoveTracking: {
      status: "ON_GOING",
      lastUpdated: now,
    },
  },
  {
    id: "special-order",
    orderNumber: "MASH-ABC",
    lalamoveTracking: {
      status: "CANCELED",
      lastUpdated: new Date("2026-03-16T10:00:00Z"),
    },
  },
] as const;

describe("useDeliveryFilters", () => {
  it("should return all orders with default filters", () => {
    const { result } = renderHook(() => useDeliveryFilters([...mockOrders]));
    expect(result.current.filteredOrders).toHaveLength(3);
  });

  it("should filter by status", () => {
    const { result } = renderHook(() => useDeliveryFilters([...mockOrders]));

    act(() => {
      result.current.setFilters((prev) => ({ ...prev, status: "ON_GOING" }));
    });

    expect(result.current.filteredOrders).toHaveLength(1);
    expect(result.current.filteredOrders[0].id).toBe("order-2");
  });

  it("should filter by date range", () => {
    const { result } = renderHook(() => useDeliveryFilters([...mockOrders]));

    act(() => {
      result.current.setFilters((prev) => ({
        ...prev,
        dateFrom: "2026-03-18",
        dateTo: "2026-03-19",
      }));
    });

    expect(result.current.filteredOrders).toHaveLength(2);
  });

  it("should filter by search term", () => {
    const { result } = renderHook(() => useDeliveryFilters([...mockOrders]));

    act(() => {
      result.current.setFilters((prev) => ({ ...prev, search: "special" }));
    });

    expect(result.current.filteredOrders).toHaveLength(1);
    expect(result.current.filteredOrders[0].id).toBe("special-order");
  });

  it("should apply combined filters", () => {
    const { result } = renderHook(() => useDeliveryFilters([...mockOrders]));

    act(() => {
      result.current.setFilters({
        status: "CANCELED",
        dateFrom: "2026-03-16",
        dateTo: "2026-03-17",
        search: "abc",
      });
    });

    expect(result.current.filteredOrders).toHaveLength(1);
    expect(result.current.filteredOrders[0].orderNumber).toBe("MASH-ABC");
  });

  it("should clear filters", () => {
    const { result } = renderHook(() => useDeliveryFilters([...mockOrders]));

    act(() => {
      result.current.setFilters({
        status: "ON_GOING",
        dateFrom: "2026-03-19",
        dateTo: "2026-03-19",
        search: "order",
      });
    });

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filters.status).toBe("ALL");
    expect(result.current.filters.search).toBe("");
    expect(result.current.filteredOrders).toHaveLength(3);
  });

  it("should handle empty orders array", () => {
    const { result } = renderHook(() => useDeliveryFilters([]));
    expect(result.current.filteredOrders).toEqual([]);
  });
});
