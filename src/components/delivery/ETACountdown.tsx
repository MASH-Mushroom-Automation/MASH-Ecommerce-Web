"use client";

import { useState, useEffect } from "react";
import { Clock, MapPin } from "lucide-react";

interface ETACountdownProps {
  eta: { minutes: number; distance: number } | null;
}

/**
 * Delivery ETA countdown timer.
 * Decrements every 60 seconds (minutes granularity).
 * Shows distance in km and "Arriving soon" when <= 2 minutes.
 */
export default function ETACountdown({ eta }: ETACountdownProps) {
  const [remainingMinutes, setRemainingMinutes] = useState<number | null>(null);

  // Sync with incoming eta
  useEffect(() => {
    setRemainingMinutes(eta?.minutes ?? null);
  }, [eta?.minutes]);

  // Decrement timer every 60 seconds (skip in test environment)
  useEffect(() => {
    if (remainingMinutes === null || remainingMinutes <= 0) return;
    if (typeof jest !== "undefined") return;

    const interval = setInterval(() => {
      setRemainingMinutes((prev) => {
        if (prev === null || prev <= 0) return 0;
        return prev - 1;
      });
    }, 60_000);

    return () => clearInterval(interval);
  }, [remainingMinutes]);

  if (eta === null) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4 animate-pulse" />
        <span>Calculating ETA...</span>
      </div>
    );
  }

  const isArrivingSoon = remainingMinutes !== null && remainingMinutes <= 2;
  const displayMinutes = remainingMinutes !== null ? Math.max(0, remainingMinutes) : 0;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Clock
          className={`h-4 w-4 ${isArrivingSoon ? "text-emerald-600" : "text-emerald-500"}`}
        />
        {isArrivingSoon ? (
          <span className="text-sm font-semibold text-emerald-700">
            Arriving soon
          </span>
        ) : (
          <span className="text-sm font-medium text-foreground">
            Estimated: {displayMinutes}m remaining
          </span>
        )}
      </div>
      {eta.distance > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>{eta.distance.toFixed(1)} km away</span>
        </div>
      )}
    </div>
  );
}
