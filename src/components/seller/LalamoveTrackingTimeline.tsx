"use client";

/**
 * LalamoveTrackingTimeline Component
 * 
 * Displays real-time delivery tracking status with visual timeline.
 * Shows driver info, ETA, and delivery progress.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Clock,
  Loader2,
  Truck,
  Package,
  MapPin,
  Phone,
  ExternalLink,
  User,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

// Lalamove status types
type LalamoveStatus =
  | "CREATED"
  | "ASSIGNING_DRIVER"
  | "ON_GOING"
  | "PICKED_UP"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED"
  | "EXPIRED";

interface LalamoveDriver {
  id: string;
  name: string;
  phone: string;
  plateNumber: string;
  photo?: string;
  coordinates?: {
    lat: number;
    lng: number;
    updatedAt: Date;
  };
}

interface LalamoveTracking {
  orderId: string;
  quotationId: string;
  status: LalamoveStatus;
  shareLink: string;
  driver?: LalamoveDriver;
  eta?: {
    minutes: number;
    distance: number; // in km
  };
  timeline?: Array<{
    status: string;
    timestamp: Date;
    note?: string;
  }>;
  createdAt: Date;
  lastUpdated: Date;
}

interface LalamoveTrackingTimelineProps {
  tracking: LalamoveTracking;
  onRefresh?: () => Promise<void>;
}

// Status configuration with icons and colors
const STATUS_CONFIG: Record<
  LalamoveStatus,
  {
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    isActive: boolean;
  }
> = {
  CREATED: {
    label: "Order Created",
    description: "Delivery order has been created",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200",
    isActive: false,
  },
  ASSIGNING_DRIVER: {
    label: "Finding Rider",
    description: "Searching for available rider nearby",
    icon: Loader2,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 border-yellow-200",
    isActive: true,
  },
  ON_GOING: {
    label: "Rider Assigned",
    description: "Rider is on the way to pickup location",
    icon: Truck,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
    isActive: true,
  },
  PICKED_UP: {
    label: "Package Collected",
    description: "Rider has picked up the package",
    icon: Package,
    color: "text-orange-600",
    bgColor: "bg-orange-50 border-orange-200",
    isActive: true,
  },
  COMPLETED: {
    label: "Delivered",
    description: "Package has been delivered successfully",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200",
    isActive: false,
  },
  CANCELLED: {
    label: "Cancelled",
    description: "Delivery has been cancelled",
    icon: Package,
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-200",
    isActive: false,
  },
  REJECTED: {
    label: "Rejected",
    description: "Delivery request was rejected",
    icon: Package,
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-200",
    isActive: false,
  },
  EXPIRED: {
    label: "Expired",
    description: "Delivery order has expired",
    icon: Clock,
    color: "text-gray-600",
    bgColor: "bg-gray-50 border-gray-200",
    isActive: false,
  },
};

// Status order for timeline
const STATUS_ORDER: LalamoveStatus[] = [
  "CREATED",
  "ASSIGNING_DRIVER",
  "ON_GOING",
  "PICKED_UP",
  "COMPLETED",
];

export default function LalamoveTrackingTimeline({
  tracking,
  onRefresh,
}: LalamoveTrackingTimelineProps) {
  const [refreshing, setRefreshing] = useState(false);

  const currentStatus = tracking.status;
  const currentConfig = STATUS_CONFIG[currentStatus];
  const StatusIcon = currentConfig.icon;

  // Get current status index for progress
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const isCompleted = currentStatus === "COMPLETED";
  const isCancelled = ["CANCELLED", "REJECTED", "EXPIRED"].includes(currentStatus);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
      toast.success("Tracking info updated");
    } catch (error) {
      toast.error("Failed to refresh tracking");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Lalamove Delivery Tracking
          </CardTitle>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status Badge */}
        <div className="flex items-center justify-between p-4 rounded-lg border-2 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${currentConfig.bgColor}`}>
              <StatusIcon
                className={`h-6 w-6 ${currentConfig.color} ${
                  currentConfig.isActive ? "animate-pulse" : ""
                }`}
              />
            </div>
            <div>
              <h4 className="font-semibold text-lg">{currentConfig.label}</h4>
              <p className="text-sm text-muted-foreground">
                {currentConfig.description}
              </p>
            </div>
          </div>
          {currentConfig.isActive && (
            <Badge variant="outline" className="text-yellow-700 border-yellow-300">
              <Clock className="h-3 w-3 mr-1" />
              In Progress
            </Badge>
          )}
        </div>

        {/* Driver Information (if assigned) */}
        {tracking.driver && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Rider Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  {tracking.driver.photo ? (
                    <img
                      src={tracking.driver.photo}
                      alt={tracking.driver.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {tracking.driver.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {tracking.driver.plateNumber}
                    </p>
                  </div>
                </div>

                <a
                  href={`tel:${tracking.driver.phone}`}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <p className="font-medium">{tracking.driver.phone}</p>
                  </div>
                </a>
              </div>
            </div>
          </>
        )}

        {/* ETA Information (if available) */}
        {tracking.eta && !isCompleted && !isCancelled && (
          <>
            <Separator />
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-900">
                      ETA: ~{tracking.eta.minutes} minutes
                    </p>
                    <p className="text-sm text-blue-700">
                      {tracking.eta.distance.toFixed(1)} km remaining
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Truck className="h-3 w-3 mr-1" />
                  En Route
                </Badge>
              </div>
            </div>
          </>
        )}

        {/* Timeline Progress */}
        {!isCancelled && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Delivery Progress
              </h4>
              <div className="space-y-3">
                {STATUS_ORDER.map((status, index) => {
                  const config = STATUS_CONFIG[status];
                  const Icon = config.icon;
                  const isPast = index <= currentIndex;
                  const isCurrent = index === currentIndex;
                  const isLast = index === STATUS_ORDER.length - 1;

                  // Find timestamp from timeline
                  const timelineEntry = tracking.timeline?.find(
                    (entry) => entry.status === status
                  );

                  return (
                    <div key={status} className="flex gap-4">
                      {/* Icon & Line */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`
                          w-10 h-10 rounded-full flex items-center justify-center border-2
                          ${
                            isPast
                              ? "bg-primary border-primary"
                              : "bg-muted border-muted-foreground/20"
                          }
                          ${isCurrent ? "ring-4 ring-primary/20" : ""}
                        `}
                        >
                          <Icon
                            className={`h-5 w-5 ${
                              isPast ? "text-primary-foreground" : "text-muted-foreground"
                            } ${isCurrent && config.isActive ? "animate-pulse" : ""}`}
                          />
                        </div>
                        {!isLast && (
                          <div
                            className={`w-0.5 h-12 ${
                              isPast ? "bg-primary" : "bg-muted-foreground/20"
                            }`}
                          />
                        )}
                      </div>

                      {/* Status Info */}
                      <div className="flex-1 pb-4">
                        <p
                          className={`font-medium ${
                            isPast ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {config.label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {config.description}
                        </p>
                        {timelineEntry && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(
                              timelineEntry.timestamp,
                              "MMM dd, yyyy 'at' hh:mm a"
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Cancelled Status */}
        {isCancelled && (
          <>
            <Separator />
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-900">
                This delivery has been {currentStatus.toLowerCase()}.
                {tracking.timeline?.find((e) => e.status === currentStatus)?.note &&
                  ` Reason: ${
                    tracking.timeline.find((e) => e.status === currentStatus)?.note
                  }`}
              </p>
            </div>
          </>
        )}

        {/* External Tracking Link */}
        {tracking.shareLink && (
          <>
            <Separator />
            <Button
              variant="outline"
              className="w-full"
              asChild
            >
              <a
                href={tracking.shareLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Live Tracking on Lalamove
              </a>
            </Button>
          </>
        )}

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground text-center">
          Last updated:{" "}
          {format(tracking.lastUpdated, "MMM dd, yyyy 'at' hh:mm a")}
        </div>
      </CardContent>
    </Card>
  );
}
