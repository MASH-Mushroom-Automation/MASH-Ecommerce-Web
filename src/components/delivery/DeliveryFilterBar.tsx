"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DeliveryStatus } from "./DeliveryStatusBadge";

export interface DeliveryFilters {
  status: DeliveryStatus | "ALL";
  dateFrom: string;
  dateTo: string;
  search: string;
}

const EMPTY_FILTERS: DeliveryFilters = {
  status: "ALL",
  dateFrom: "",
  dateTo: "",
  search: "",
};

const STATUS_OPTIONS: { value: DeliveryStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "ASSIGNING_DRIVER", label: "Finding Driver" },
  { value: "ON_GOING", label: "Driver En Route" },
  { value: "PICKED_UP", label: "Picked Up" },
  { value: "COMPLETED", label: "Delivered" },
  { value: "CANCELED", label: "Canceled" },
  { value: "REJECTED", label: "Rejected" },
  { value: "EXPIRED", label: "Expired" },
];

interface DeliveryFilterBarProps {
  filters: DeliveryFilters;
  onChange: (filters: DeliveryFilters) => void;
  className?: string;
}

export default function DeliveryFilterBar({
  filters,
  onChange,
  className,
}: DeliveryFilterBarProps) {
  const hasActiveFilters =
    filters.status !== "ALL" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== "" ||
    filters.search !== "";

  const updateFilter = <K extends keyof DeliveryFilters>(
    key: K,
    value: DeliveryFilters[K]
  ) => {
    onChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onChange(EMPTY_FILTERS);
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:flex-wrap",
        className
      )}
    >
      {/* Status dropdown */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="delivery-status-filter"
          className="text-xs font-medium text-gray-600"
        >
          Status
        </label>
        <select
          id="delivery-status-filter"
          value={filters.status}
          onChange={(e) =>
            updateFilter("status", e.target.value as DeliveryFilters["status"])
          }
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Date from */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="delivery-date-from"
          className="text-xs font-medium text-gray-600"
        >
          From
        </label>
        <input
          id="delivery-date-from"
          type="date"
          value={filters.dateFrom}
          onChange={(e) => updateFilter("dateFrom", e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Date to */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="delivery-date-to"
          className="text-xs font-medium text-gray-600"
        >
          To
        </label>
        <input
          id="delivery-date-to"
          type="date"
          value={filters.dateTo}
          onChange={(e) => updateFilter("dateTo", e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Search by order ID */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="delivery-search"
          className="text-xs font-medium text-gray-600"
        >
          Order ID
        </label>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <input
            id="delivery-search"
            type="text"
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="rounded-md border border-gray-300 bg-white py-2 pl-8 pr-3 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
        >
          <X className="h-4 w-4" />
          Clear Filters
        </button>
      )}
    </div>
  );
}
