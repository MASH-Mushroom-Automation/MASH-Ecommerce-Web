"use client";

import { AlertTriangle, RefreshCw, Headphones, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type FailedDeliveryStatus = "CANCELED" | "REJECTED" | "EXPIRED";

interface DeliveryRecoveryModalProps {
  open: boolean;
  status: FailedDeliveryStatus;
  failureReason?: string;
  onRetry: () => void;
  onContactSupport: () => void;
  onDismiss: () => void;
  className?: string;
}

const STATUS_LABELS: Record<FailedDeliveryStatus, string> = {
  CANCELED: "Delivery Canceled",
  REJECTED: "Delivery Rejected",
  EXPIRED: "Delivery Expired",
};

const STATUS_DESCRIPTIONS: Record<FailedDeliveryStatus, string> = {
  CANCELED: "This delivery was canceled. You can try again with a new quotation.",
  REJECTED: "This delivery was rejected by the driver or system. Please retry or contact support.",
  EXPIRED: "This delivery quotation has expired. Please request a new delivery quote.",
};

export default function DeliveryRecoveryModal({
  open,
  status,
  failureReason,
  onRetry,
  onContactSupport,
  onDismiss,
  className,
}: DeliveryRecoveryModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label="Delivery recovery options"
      onClick={(e) => {
        if (e.target === e.currentTarget) onDismiss();
      }}
    >
      <div
        className={cn(
          "mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl",
          className
        )}
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {STATUS_LABELS[status]}
            </h3>
          </div>
          <button
            onClick={onDismiss}
            aria-label="Close dialog"
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-2 text-sm text-gray-600">
          {STATUS_DESCRIPTIONS[status]}
        </p>

        {failureReason && (
          <div className="mb-4 rounded-md bg-red-50 p-3">
            <p className="text-sm font-medium text-red-800">Reason</p>
            <p className="mt-0.5 text-sm text-red-700">{failureReason}</p>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2">
          <button
            onClick={onRetry}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <button
            onClick={onContactSupport}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <Headphones className="h-4 w-4" />
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
