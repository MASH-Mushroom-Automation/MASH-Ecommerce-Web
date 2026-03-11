"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronUp,
  GripHorizontal,
  Phone,
  Truck,
  User,
} from "lucide-react";
import StatusTimeline from "@/components/delivery/StatusTimeline";
import ETACountdown from "@/components/delivery/ETACountdown";
import { useLalamoveTracking } from "@/hooks/useLalamoveTracking";
import { cn } from "@/lib/utils";

type SheetState = "collapsed" | "half" | "full";

const STATUS_LABELS: Record<string, string> = {
  ASSIGNING_DRIVER: "Finding Driver",
  ON_GOING: "Driver En Route",
  PICKED_UP: "Picked Up",
  COMPLETED: "Delivered",
  CANCELED: "Canceled",
};

const STATUS_COLORS: Record<string, string> = {
  ASSIGNING_DRIVER: "bg-yellow-100 text-yellow-800",
  ON_GOING: "bg-blue-100 text-blue-800",
  PICKED_UP: "bg-indigo-100 text-indigo-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELED: "bg-red-100 text-red-800",
};

interface MobileTrackingSheetProps {
  orderId: string;
}

export default function MobileTrackingSheet({
  orderId,
}: MobileTrackingSheetProps) {
  const { tracking, loading, error } = useLalamoveTracking(orderId);
  const [sheetState, setSheetState] = useState<SheetState>("collapsed");
  const touchStartY = useRef<number>(0);
  const isDragging = useRef(false);

  const status = (tracking?.status || "ASSIGNING_DRIVER") as string;
  const driver = tracking?.driver;
  const eta = tracking?.eta ?? null;

  const timelineStatus = (
    ["ASSIGNING_DRIVER", "ON_GOING", "PICKED_UP", "COMPLETED", "CANCELED"].includes(status)
      ? status
      : "ASSIGNING_DRIVER"
  ) as "ASSIGNING_DRIVER" | "ON_GOING" | "PICKED_UP" | "COMPLETED" | "CANCELED";

  // Touch handlers for swipe gesture
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = true;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;

      const deltaY = touchStartY.current - e.changedTouches[0].clientY;
      const threshold = 50;

      if (deltaY > threshold) {
        // Swipe up
        setSheetState((prev) =>
          prev === "collapsed" ? "half" : prev === "half" ? "full" : "full"
        );
      } else if (deltaY < -threshold) {
        // Swipe down
        setSheetState((prev) =>
          prev === "full" ? "half" : prev === "half" ? "collapsed" : "collapsed"
        );
      }
    },
    []
  );

  const toggleExpand = useCallback(() => {
    setSheetState((prev) =>
      prev === "collapsed" ? "half" : prev === "half" ? "full" : "collapsed"
    );
  }, []);

  // Desktop: render as standard Card
  const desktopContent = (
    <Card className="hidden md:block border-emerald-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-emerald-600" />
            Delivery Tracking
          </span>
          {!loading && tracking && (
            <Badge
              variant="outline"
              className={cn("border", STATUS_COLORS[status])}
            >
              {STATUS_LABELS[status] || status}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && (
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-20 w-full rounded bg-muted" />
          </div>
        )}
        {error && (
          <p className="text-sm text-muted-foreground">
            Failed to load tracking data.
          </p>
        )}
        {tracking && (
          <>
            <ETACountdown eta={eta} />
            <StatusTimeline currentStatus={timelineStatus} />
            {driver && (
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                  <User className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{driver.name}</p>
                  {driver.plateNumber && (
                    <p className="text-xs text-muted-foreground">
                      {driver.plateNumber}
                    </p>
                  )}
                </div>
                {driver.phone && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`tel:${driver.phone}`, "_self")}
                  >
                    <Phone className="h-3.5 w-3.5 mr-1" />
                    Call
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  // Mobile: bottom sheet
  const sheetHeight =
    sheetState === "collapsed"
      ? "h-[100px]"
      : sheetState === "half"
        ? "h-[320px]"
        : "h-[520px]";

  const mobileContent = (
    <div
      className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-emerald-200 rounded-t-2xl shadow-lg transition-[height] duration-300 overflow-hidden",
        sheetHeight
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Drag Handle */}
      <div
        className="flex justify-center py-2 cursor-pointer"
        onClick={toggleExpand}
        role="button"
        aria-label="Toggle tracking details"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") toggleExpand();
        }}
      >
        <GripHorizontal className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="px-4 pb-4 space-y-3 overflow-y-auto" style={{ maxHeight: "calc(100% - 36px)" }}>
        {/* Collapsed: status + ETA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium">Delivery</span>
          </div>
          {tracking && (
            <Badge
              variant="outline"
              className={cn("text-xs", STATUS_COLORS[status])}
            >
              {STATUS_LABELS[status] || status}
            </Badge>
          )}
          {!tracking && !loading && (
            <span className="text-xs text-muted-foreground">No data</span>
          )}
        </div>

        {tracking && <ETACountdown eta={eta} />}

        {/* Half: + driver info + timeline */}
        {(sheetState === "half" || sheetState === "full") && tracking && (
          <>
            {driver && (
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                  <User className="h-4 w-4 text-emerald-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{driver.name}</p>
                  {driver.plateNumber && (
                    <p className="text-xs text-muted-foreground">
                      {driver.plateNumber}
                    </p>
                  )}
                </div>
                {driver.phone && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`tel:${driver.phone}`, "_self")}
                    className="h-8"
                  >
                    <Phone className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            )}
            <StatusTimeline currentStatus={timelineStatus} />
          </>
        )}

        {/* Full: + share link + expand hint */}
        {sheetState === "full" && tracking && (
          <>
            {tracking.shareLink && (
              <Button
                size="sm"
                variant="outline"
                className="w-full border-emerald-300 text-emerald-700"
                onClick={() => window.open(tracking.shareLink, "_blank")}
              >
                Track on Lalamove
              </Button>
            )}
          </>
        )}

        {loading && (
          <div className="animate-pulse space-y-2">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-12 w-full rounded bg-muted" />
          </div>
        )}

        {!loading && sheetState === "collapsed" && (
          <button
            onClick={toggleExpand}
            className="flex items-center gap-1 text-xs text-emerald-600 w-full justify-center"
          >
            <ChevronUp className="h-3.5 w-3.5" />
            Swipe up for details
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {desktopContent}
      {mobileContent}
    </>
  );
}
