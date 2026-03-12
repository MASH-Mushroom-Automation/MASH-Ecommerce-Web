"use client";

import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface DeliveryMetricsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: {
    direction: "up" | "down";
    label: string;
  };
  loading?: boolean;
  className?: string;
}

export default function DeliveryMetricsCard({
  icon: Icon,
  label,
  value,
  trend,
  loading = false,
  className,
}: DeliveryMetricsCardProps) {
  if (loading) {
    return (
      <div
        className={cn(
          "rounded-lg border border-gray-200 bg-white p-4 shadow-sm",
          className
        )}
        data-testid="metrics-card-skeleton"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-md bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-6 w-16 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white p-4 shadow-sm",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50">
          <Icon className="h-5 w-5 text-emerald-600" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
      {trend && (
        <div
          className={cn(
            "mt-3 flex items-center gap-1 text-xs font-medium",
            trend.direction === "up" ? "text-green-600" : "text-red-600"
          )}
        >
          {trend.direction === "up" ? (
            <ArrowUp className="h-3.5 w-3.5" aria-label="Trend up" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5" aria-label="Trend down" />
          )}
          <span>{trend.label}</span>
        </div>
      )}
    </div>
  );
}
