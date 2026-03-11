"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface LalamoveTracking {
  status: string;
  driver?: {
    name: string;
    phone: string;
    plateNumber: string;
  };
  eta?: {
    minutes: number;
    distance: number;
  };
}

const STATUS_MESSAGES: Record<string, { title: string; description?: (tracking: LalamoveTracking) => string }> = {
  ASSIGNING_DRIVER: {
    title: "Looking for a driver",
    description: () => "Your delivery is being assigned to a nearby driver.",
  },
  DRIVER_ASSIGNED: {
    title: "Driver assigned",
    description: (t) =>
      t.driver ? `${t.driver.name} (${t.driver.plateNumber}) is heading to pick up your order.` : "A driver has been assigned to your delivery.",
  },
  ON_GOING: {
    title: "Delivery in progress",
    description: (t) =>
      t.eta ? `Estimated arrival in ${t.eta.minutes} minutes.` : "Your order is on the way.",
  },
  PICKED_UP: {
    title: "Order picked up",
    description: () => "The driver has picked up your order and is on the way.",
  },
  ARRIVED_AT_PICKUP: {
    title: "Driver at pickup",
    description: () => "The driver has arrived at the pickup location.",
  },
  ARRIVED_AT_DROPOFF: {
    title: "Driver arriving",
    description: () => "The driver has arrived at your delivery address.",
  },
  COMPLETED: {
    title: "Delivery complete",
    description: () => "Your order has been delivered successfully.",
  },
  CANCELLED: {
    title: "Delivery cancelled",
    description: () => "The delivery has been cancelled. Please contact support if needed.",
  },
  REJECTED: {
    title: "Delivery rejected",
    description: () => "The delivery request was rejected. Please try again.",
  },
  EXPIRED: {
    title: "Delivery expired",
    description: () => "No driver was found in time. Please create a new delivery request.",
  },
};

/**
 * Shows sonner toast notifications when Lalamove tracking status changes.
 * Uses useRef to track previous status and only fire on transitions.
 */
export function useDeliveryNotifications(tracking: LalamoveTracking | null | undefined) {
  const prevStatus = useRef<string | null>(null);

  useEffect(() => {
    if (!tracking) return;

    const currentStatus = tracking.status;
    if (currentStatus === prevStatus.current) return;

    const msg = STATUS_MESSAGES[currentStatus];
    if (msg) {
      const description = msg.description?.(tracking);
      if (currentStatus === "COMPLETED") {
        toast.success(msg.title, { description });
      } else if (currentStatus === "CANCELLED" || currentStatus === "REJECTED" || currentStatus === "EXPIRED") {
        toast.error(msg.title, { description });
      } else {
        toast.info(msg.title, { description });
      }
    }

    prevStatus.current = currentStatus;
  }, [tracking]);
}
