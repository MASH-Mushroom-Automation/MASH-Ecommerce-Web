import { renderHook } from "@testing-library/react";
import { useDeliveryAnalytics } from "../useDeliveryAnalytics";
import type { FirestoreOrder } from "@/lib/firebase/orders";

type OrderSlice = Pick<FirestoreOrder, "lalamoveTracking">;

function makeOrder(
  status: string,
  createdAt?: Date,
  lastUpdated?: Date
): OrderSlice {
  return {
    lalamoveTracking: {
      orderId: "LLM-001",
      quotationId: "QUO-001",
      status,
      createdAt: createdAt ?? new Date("2024-01-01T10:00:00Z"),
      lastUpdated: lastUpdated ?? new Date("2024-01-01T11:00:00Z"),
      timeline: [],
    },
  };
}

describe("useDeliveryAnalytics", () => {
  it("should return zeroes for empty array", () => {
    const { result } = renderHook(() => useDeliveryAnalytics([]));
    expect(result.current).toEqual({
      totalDeliveries: 0,
      completedCount: 0,
      canceledCount: 0,
      avgDeliveryMinutes: 0,
      completionRate: 0,
    });
  });

  it("should count completed deliveries", () => {
    const orders: OrderSlice[] = [
      makeOrder("COMPLETED"),
      makeOrder("COMPLETED"),
      makeOrder("ON_GOING"),
    ];
    const { result } = renderHook(() => useDeliveryAnalytics(orders));
    expect(result.current.completedCount).toBe(2);
    expect(result.current.totalDeliveries).toBe(3);
  });

  it("should count canceled deliveries (CANCELED, REJECTED, EXPIRED)", () => {
    const orders: OrderSlice[] = [
      makeOrder("CANCELED"),
      makeOrder("REJECTED"),
      makeOrder("EXPIRED"),
    ];
    const { result } = renderHook(() => useDeliveryAnalytics(orders));
    expect(result.current.canceledCount).toBe(3);
  });

  it("should calculate completion rate as percentage", () => {
    const orders: OrderSlice[] = [
      makeOrder("COMPLETED"),
      makeOrder("COMPLETED"),
      makeOrder("CANCELED"),
      makeOrder("ON_GOING"),
    ];
    const { result } = renderHook(() => useDeliveryAnalytics(orders));
    // 2 completed out of 4 total = 50%
    expect(result.current.completionRate).toBe(50);
  });

  it("should calculate average delivery time in minutes", () => {
    // 60 min delivery
    const order1 = makeOrder(
      "COMPLETED",
      new Date("2024-01-01T10:00:00Z"),
      new Date("2024-01-01T11:00:00Z")
    );
    // 30 min delivery
    const order2 = makeOrder(
      "COMPLETED",
      new Date("2024-01-01T10:00:00Z"),
      new Date("2024-01-01T10:30:00Z")
    );
    const { result } = renderHook(() =>
      useDeliveryAnalytics([order1, order2])
    );
    // (60 + 30) / 2 = 45
    expect(result.current.avgDeliveryMinutes).toBe(45);
  });

  it("should handle null tracking data gracefully", () => {
    const orders: OrderSlice[] = [
      { lalamoveTracking: undefined },
      makeOrder("COMPLETED"),
      { lalamoveTracking: undefined },
    ];
    const { result } = renderHook(() => useDeliveryAnalytics(orders));
    expect(result.current.totalDeliveries).toBe(1);
    expect(result.current.completedCount).toBe(1);
  });

  it("should handle mixed statuses correctly", () => {
    const orders: OrderSlice[] = [
      makeOrder("COMPLETED"),
      makeOrder("CANCELED"),
      makeOrder("ON_GOING"),
      makeOrder("ASSIGNING_DRIVER"),
      makeOrder("PICKED_UP"),
      makeOrder("REJECTED"),
    ];
    const { result } = renderHook(() => useDeliveryAnalytics(orders));
    expect(result.current.totalDeliveries).toBe(6);
    expect(result.current.completedCount).toBe(1);
    expect(result.current.canceledCount).toBe(2);
    // completion rate: 1/6 ~ 17%
    expect(result.current.completionRate).toBe(17);
  });

  it("should return zero avg when no completed deliveries have valid times", () => {
    const orders: OrderSlice[] = [makeOrder("CANCELED"), makeOrder("ON_GOING")];
    const { result } = renderHook(() => useDeliveryAnalytics(orders));
    expect(result.current.avgDeliveryMinutes).toBe(0);
  });

  it("should handle all orders having null tracking", () => {
    const orders: OrderSlice[] = [
      { lalamoveTracking: undefined },
      { lalamoveTracking: undefined },
    ];
    const { result } = renderHook(() => useDeliveryAnalytics(orders));
    expect(result.current.totalDeliveries).toBe(0);
    expect(result.current.completionRate).toBe(0);
  });
});
