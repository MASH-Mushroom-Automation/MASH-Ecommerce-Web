"use client";

import { useMemo } from "react";
import type { FirestoreOrder } from "@/lib/firebase/orders";

export interface DeliveryAnalytics {
  totalDeliveries: number;
  completedCount: number;
  canceledCount: number;
  avgDeliveryMinutes: number;
  completionRate: number;
}

const COMPLETED_STATUS = "COMPLETED";
const CANCELED_STATUSES = new Set(["CANCELED", "REJECTED", "EXPIRED"]);

/**
 * Pure computation hook that aggregates delivery metrics
 * from an array of orders with lalamoveTracking data.
 */
export function useDeliveryAnalytics(
  orders: Pick<FirestoreOrder, "lalamoveTracking">[]
): DeliveryAnalytics {
  return useMemo(() => {
    if (!orders || orders.length === 0) {
      return {
        totalDeliveries: 0,
        completedCount: 0,
        canceledCount: 0,
        avgDeliveryMinutes: 0,
        completionRate: 0,
      };
    }

    const tracked = orders.filter((o) => o.lalamoveTracking != null);
    const totalDeliveries = tracked.length;

    if (totalDeliveries === 0) {
      return {
        totalDeliveries: 0,
        completedCount: 0,
        canceledCount: 0,
        avgDeliveryMinutes: 0,
        completionRate: 0,
      };
    }

    let completedCount = 0;
    let canceledCount = 0;
    let totalMinutes = 0;
    let minutesSamples = 0;

    for (const order of tracked) {
      const tracking = order.lalamoveTracking!;
      const status = tracking.status;

      if (status === COMPLETED_STATUS) {
        completedCount++;

        // Calculate delivery time from createdAt to lastUpdated
        const created = tracking.createdAt;
        const updated = tracking.lastUpdated;
        if (created && updated) {
          const createdMs =
            created instanceof Date ? created.getTime() : new Date(created).getTime();
          const updatedMs =
            updated instanceof Date ? updated.getTime() : new Date(updated).getTime();
          if (!isNaN(createdMs) && !isNaN(updatedMs) && updatedMs > createdMs) {
            totalMinutes += (updatedMs - createdMs) / 60000;
            minutesSamples++;
          }
        }
      } else if (CANCELED_STATUSES.has(status)) {
        canceledCount++;
      }
    }

    const avgDeliveryMinutes =
      minutesSamples > 0 ? Math.round(totalMinutes / minutesSamples) : 0;
    const completionRate =
      totalDeliveries > 0
        ? Math.round((completedCount / totalDeliveries) * 100)
        : 0;

    return {
      totalDeliveries,
      completedCount,
      canceledCount,
      avgDeliveryMinutes,
      completionRate,
    };
  }, [orders]);
}
