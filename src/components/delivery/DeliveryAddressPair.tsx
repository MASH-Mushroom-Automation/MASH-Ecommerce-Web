"use client";

import { MapPin, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeliveryAddressPairProps {
  pickupAddress: string;
  dropoffAddress: string;
  distance?: string;
  variant?: "compact" | "expanded";
  className?: string;
}

export default function DeliveryAddressPair({
  pickupAddress,
  dropoffAddress,
  distance,
  variant = "expanded",
  className,
}: DeliveryAddressPairProps) {
  const isCompact = variant === "compact";

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Pickup */}
      <div className="flex items-start gap-2">
        <div className="flex flex-col items-center">
          <div
            className={cn(
              "flex items-center justify-center rounded-full bg-emerald-100",
              isCompact ? "h-6 w-6" : "h-8 w-8"
            )}
          >
            <MapPin
              className={cn(
                "text-emerald-600",
                isCompact ? "h-3.5 w-3.5" : "h-4 w-4"
              )}
              aria-hidden="true"
            />
          </div>
          {/* Connector line */}
          <div
            className={cn(
              "w-0.5 bg-gray-300",
              isCompact ? "h-4" : "h-6"
            )}
            aria-hidden="true"
          />
        </div>
        <div className={cn("pt-0.5", isCompact ? "text-xs" : "text-sm")}>
          <p className="font-medium text-gray-500">Pickup</p>
          <p className="text-gray-900">{pickupAddress}</p>
        </div>
      </div>

      {/* Distance label */}
      {distance && (
        <div className="ml-3 flex items-center">
          <span className="text-xs font-medium text-gray-400">{distance}</span>
        </div>
      )}

      {/* Dropoff */}
      <div className="flex items-start gap-2">
        <div className="flex flex-col items-center">
          <div
            className={cn(
              "flex items-center justify-center rounded-full bg-blue-100",
              isCompact ? "h-6 w-6" : "h-8 w-8"
            )}
          >
            <Navigation
              className={cn(
                "text-blue-600",
                isCompact ? "h-3.5 w-3.5" : "h-4 w-4"
              )}
              aria-hidden="true"
            />
          </div>
        </div>
        <div className={cn("pt-0.5", isCompact ? "text-xs" : "text-sm")}>
          <p className="font-medium text-gray-500">Dropoff</p>
          <p className="text-gray-900">{dropoffAddress}</p>
        </div>
      </div>
    </div>
  );
}
