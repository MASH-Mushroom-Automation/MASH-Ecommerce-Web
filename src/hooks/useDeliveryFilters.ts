"use client";

import { useMemo, useState } from "react";
import type { FirestoreOrder } from "@/lib/firebase/orders";

type DeliveryStatusFilter =
  | "ALL"
  | "ASSIGNING_DRIVER"
  | "ON_GOING"
  | "PICKED_UP"
  | "COMPLETED"
  | "CANCELED"
  | "REJECTED"
  | "EXPIRED";

export interface DeliveryFiltersState {
  status: DeliveryStatusFilter;
  dateFrom: string;
  dateTo: string;
  search: string;
}

export const DEFAULT_DELIVERY_FILTERS: DeliveryFiltersState = {
  status: "ALL",
  dateFrom: "",
  dateTo: "",
  search: "",
};

type OrderWithTracking = Pick<
  FirestoreOrder,
  "id" | "orderNumber" | "lalamoveTracking"
>;

function toDate(value?: unknown): Date | null {
  if (!value) {
    return null;
  }

  const normalized = value instanceof Date ? value : new Date(value as string);
  return Number.isNaN(normalized.getTime()) ? null : normalized;
}

function withinDateRange(date: Date | null, from: string, to: string): boolean {
  if (!date) {
    return !from && !to;
  }

  if (!from && !to) {
    return true;
  }

  const current = new Date(date);

  if (from) {
    const fromDate = new Date(`${from}T00:00:00`);
    if (current < fromDate) {
      return false;
    }
  }

  if (to) {
    const toDate = new Date(`${to}T23:59:59.999`);
    if (current > toDate) {
      return false;
    }
  }

  return true;
}

export function useDeliveryFilters(orders: OrderWithTracking[]) {
  const [filters, setFilters] = useState<DeliveryFiltersState>(
    DEFAULT_DELIVERY_FILTERS
  );

  const filteredOrders = useMemo(() => {
    if (!orders || orders.length === 0) {
      return [];
    }

    const search = filters.search.trim().toLowerCase();

    return orders.filter((order) => {
      const status = order.lalamoveTracking?.status;

      if (filters.status !== "ALL" && status !== filters.status) {
        return false;
      }

      const trackingDate = toDate(order.lalamoveTracking?.lastUpdated);
      if (!withinDateRange(trackingDate, filters.dateFrom, filters.dateTo)) {
        return false;
      }

      if (!search) {
        return true;
      }

      const searchableId = order.id.toLowerCase();
      const searchableOrderNumber = (order.orderNumber ?? "").toLowerCase();
      return (
        searchableId.includes(search) || searchableOrderNumber.includes(search)
      );
    });
  }, [orders, filters]);

  const clearFilters = () => {
    setFilters(DEFAULT_DELIVERY_FILTERS);
  };

  return {
    filters,
    setFilters,
    clearFilters,
    filteredOrders,
  };
}
