"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type DeliveryStatus =
  | "ASSIGNING_DRIVER"
  | "ON_GOING"
  | "PICKED_UP"
  | "COMPLETED"
  | "CANCELED"
  | "REJECTED"
  | "EXPIRED";

const STATUS_LABELS: Record<DeliveryStatus, string> = {
  ASSIGNING_DRIVER: "Finding Driver",
  ON_GOING: "Driver En Route",
  PICKED_UP: "Picked Up",
  COMPLETED: "Delivered",
  CANCELED: "Canceled",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
};

const STATUS_COLORS: Record<DeliveryStatus, string> = {
  ASSIGNING_DRIVER: "bg-yellow-100 text-yellow-800 border-yellow-300",
  ON_GOING: "bg-blue-100 text-blue-800 border-blue-300",
  PICKED_UP: "bg-indigo-100 text-indigo-800 border-indigo-300",
  COMPLETED: "bg-green-100 text-green-800 border-green-300",
  CANCELED: "bg-red-100 text-red-800 border-red-300",
  REJECTED: "bg-red-100 text-red-800 border-red-300",
  EXPIRED: "bg-gray-100 text-gray-800 border-gray-300",
};

interface DeliveryStatusBadgeProps {
  status: string;
  className?: string;
}

export default function DeliveryStatusBadge({
  status,
  className,
}: DeliveryStatusBadgeProps) {
  const deliveryStatus = status as DeliveryStatus;
  const label = STATUS_LABELS[deliveryStatus] || status;
  const colorClass = STATUS_COLORS[deliveryStatus] || "bg-gray-100 text-gray-800 border-gray-300";

  return (
    <Badge
      variant="outline"
      className={cn("border", colorClass, className)}
    >
      {label}
    </Badge>
  );
}

export { STATUS_LABELS, STATUS_COLORS };
