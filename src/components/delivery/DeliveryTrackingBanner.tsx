"use client";

import Link from "next/link";
import { MapPin, Clock, ChevronRight } from "lucide-react";
import DeliveryStatusBadge from "./DeliveryStatusBadge";
import { cn } from "@/lib/utils";

interface LalamoveTrackingData {
  status: string;
  driver?: {
    name?: string;
    phone?: string;
    plateNumber?: string;
  };
  eta?: {
    minutes?: number;
  };
}

interface DeliveryTrackingBannerProps {
  orderId: string;
  tracking: LalamoveTrackingData | null;
  className?: string;
}

export default function DeliveryTrackingBanner({
  orderId,
  tracking,
  className,
}: DeliveryTrackingBannerProps) {
  if (!tracking) return null;

  const isActive = !["COMPLETED", "CANCELED", "REJECTED", "EXPIRED"].includes(
    tracking.status
  );

  return (
    <Link
      href={`/profile/orders/${orderId}/track`}
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors hover:bg-muted/50",
        isActive && "border-emerald-200 bg-emerald-50/50",
        className
      )}
    >
      <MapPin
        className={cn(
          "h-4 w-4 shrink-0",
          isActive ? "text-emerald-600" : "text-muted-foreground"
        )}
      />

      <DeliveryStatusBadge status={tracking.status} className="shrink-0" />

      {tracking.driver?.name && (
        <span className="text-sm text-muted-foreground truncate hidden sm:inline">
          {tracking.driver.name}
        </span>
      )}

      {tracking.eta?.minutes != null && isActive && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          <Clock className="h-3 w-3" />
          {tracking.eta.minutes}m
        </span>
      )}

      <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
    </Link>
  );
}
