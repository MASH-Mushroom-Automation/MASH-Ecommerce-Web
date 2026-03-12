"use client";

import {
  Package,
  Truck,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineEntry {
  status: string;
  timestamp: string;
  note?: string;
}

interface DeliveryHistoryTimelineProps {
  entries: TimelineEntry[];
  newestFirst?: boolean;
  className?: string;
}

const STATUS_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  ASSIGNING_DRIVER: Package,
  DRIVER_ASSIGNED: Truck,
  ON_GOING: Truck,
  PICKED_UP: MapPin,
  ARRIVED_AT_PICKUP: MapPin,
  ARRIVED_AT_DROPOFF: MapPin,
  COMPLETED: CheckCircle2,
  CANCELED: XCircle,
  REJECTED: AlertTriangle,
  EXPIRED: Clock,
};

const STATUS_DESCRIPTIONS: Record<string, string> = {
  ASSIGNING_DRIVER: "Looking for a nearby driver",
  DRIVER_ASSIGNED: "Driver has been assigned",
  ON_GOING: "Driver is on the way",
  PICKED_UP: "Package has been picked up",
  ARRIVED_AT_PICKUP: "Driver arrived at pickup location",
  ARRIVED_AT_DROPOFF: "Driver arrived at delivery location",
  COMPLETED: "Delivery completed successfully",
  CANCELED: "Delivery has been canceled",
  REJECTED: "Delivery was rejected",
  EXPIRED: "Delivery request expired",
};

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DeliveryHistoryTimeline({
  entries,
  newestFirst = false,
  className,
}: DeliveryHistoryTimelineProps) {
  if (!entries || entries.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-8 text-muted-foreground",
          className
        )}
      >
        <Clock className="h-8 w-8 mb-2" />
        <p className="text-sm">No delivery events yet</p>
      </div>
    );
  }

  const sortedEntries = newestFirst ? [...entries].reverse() : entries;

  return (
    <div className={cn("relative", className)}>
      <ul className="space-y-0">
        {sortedEntries.map((entry, index) => {
          const Icon = STATUS_ICONS[entry.status] || Clock;
          const description =
            entry.note || STATUS_DESCRIPTIONS[entry.status] || entry.status;
          const isLast = index === sortedEntries.length - 1;
          const isCompleted = entry.status === "COMPLETED";
          const isFailed = ["CANCELED", "REJECTED", "EXPIRED"].includes(
            entry.status
          );

          return (
            <li key={index} className="relative flex gap-3 pb-4 last:pb-0">
              {/* Connector line */}
              {!isLast && (
                <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
              )}

              {/* Icon */}
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  isCompleted && "bg-green-100",
                  isFailed && "bg-red-100",
                  !isCompleted && !isFailed && "bg-emerald-100"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isCompleted && "text-green-700",
                    isFailed && "text-red-700",
                    !isCompleted && !isFailed && "text-emerald-700"
                  )}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">
                    {entry.status.replace(/_/g, " ")}
                  </span>
                  <time className="text-xs text-muted-foreground shrink-0">
                    {formatTimestamp(entry.timestamp)}
                  </time>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {description}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
