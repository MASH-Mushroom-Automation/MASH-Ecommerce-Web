"use client";

import { CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeliveryScheduleBannerProps {
  scheduledAt: Date | string;
  onReschedule?: () => void;
  className?: string;
}

function formatDateTime(input: Date): string {
  return input.toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getCountdownText(deltaMs: number): string {
  const totalMinutes = Math.max(0, Math.floor(deltaMs / 60000));

  if (totalMinutes < 60) {
    return `${totalMinutes} minute${totalMinutes === 1 ? "" : "s"} to pickup`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours} hour${hours === 1 ? "" : "s"} to pickup`;
  }

  return `${hours}h ${minutes}m to pickup`;
}

export default function DeliveryScheduleBanner({
  scheduledAt,
  onReschedule,
  className,
}: DeliveryScheduleBannerProps) {
  const scheduleDate = scheduledAt instanceof Date ? scheduledAt : new Date(scheduledAt);
  const isValidDate = !Number.isNaN(scheduleDate.getTime());

  if (!isValidDate) {
    return null;
  }

  const now = Date.now();
  const deltaMs = scheduleDate.getTime() - now;
  const isOverdue = deltaMs < 0;

  return (
    <div
      className={cn(
        "rounded-lg border border-emerald-200 bg-white p-4 shadow-sm",
        className
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-100">
            <CalendarClock className="h-5 w-5 text-emerald-700" aria-hidden="true" />
          </div>
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                Scheduled
              </span>
              {isOverdue && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                  Overdue
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-900">
              Scheduled for {formatDateTime(scheduleDate)}
            </p>
            <p className={cn("mt-1 text-xs font-medium", isOverdue ? "text-red-700" : "text-emerald-700")}>
              {isOverdue ? "Pickup is overdue" : getCountdownText(deltaMs)}
            </p>
          </div>
        </div>

        {onReschedule && (
          <button
            type="button"
            onClick={onReschedule}
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
          >
            Reschedule
          </button>
        )}
      </div>
    </div>
  );
}
