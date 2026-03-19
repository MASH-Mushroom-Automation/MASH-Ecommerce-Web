"use client";

import type { LucideIcon } from "lucide-react";
import { Truck } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeliveryVehicleInfoProps {
  vehicleName: string;
  description: string;
  capacity: string;
  icon?: LucideIcon;
  priceRange?: string;
  variant?: "compact" | "full";
  className?: string;
}

export default function DeliveryVehicleInfo({
  vehicleName,
  description,
  capacity,
  icon: Icon = Truck,
  priceRange,
  variant = "full",
  className,
}: DeliveryVehicleInfoProps) {
  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "rounded-lg border border-emerald-200 bg-white shadow-sm",
        isCompact ? "p-3" : "p-4",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-100">
          <Icon className="h-5 w-5 text-emerald-700" aria-label="Vehicle type icon" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h3 className={cn("font-semibold text-emerald-900", isCompact ? "text-sm" : "text-base")}>
              {vehicleName}
            </h3>
            {priceRange && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                {priceRange}
              </span>
            )}
          </div>

          <p className={cn("text-gray-600", isCompact ? "text-xs" : "text-sm")}>
            {description}
          </p>

          <p className={cn("mt-2 font-medium text-gray-800", isCompact ? "text-xs" : "text-sm")}>
            Capacity: {capacity}
          </p>
        </div>
      </div>
    </div>
  );
}
