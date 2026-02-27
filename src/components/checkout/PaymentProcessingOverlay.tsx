"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types/payment";
import { PAYMENT_METHOD_LABELS } from "@/types/payment";

// ---------------------------------------------------------------------------
// Processing messages per payment method
// ---------------------------------------------------------------------------

const PROCESSING_MESSAGES: Record<PaymentMethod, string> = {
  cod: "Processing your order...",
  gcash: "Redirecting to GCash...",
  grab_pay: "Redirecting to GrabPay...",
  card: "Processing card payment...",
  paymaya: "Redirecting to Maya...",
};

const PROCESSING_DESCRIPTIONS: Record<PaymentMethod, string> = {
  cod: "Please wait while we confirm your order.",
  gcash:
    "You will be redirected to the GCash app to complete your payment. Please do not close this window.",
  grab_pay:
    "You will be redirected to the Grab app to complete your payment. Please do not close this window.",
  card: "Securely processing your card details. Please do not close this window.",
  paymaya:
    "You will be redirected to the Maya app to complete your payment. Please do not close this window.",
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface PaymentProcessingOverlayProps {
  /** Whether the overlay is visible */
  visible: boolean;
  /** The payment method being processed */
  paymentMethod: PaymentMethod;
  /** Optional callback to cancel (only available before redirect) */
  onCancel?: (() => void) | null;
  /** Additional class names */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PaymentProcessingOverlay({
  visible,
  paymentMethod,
  onCancel,
  className,
}: PaymentProcessingOverlayProps) {
  if (!visible) return null;

  const message = PROCESSING_MESSAGES[paymentMethod];
  const description = PROCESSING_DESCRIPTIONS[paymentMethod];
  const methodLabel = PAYMENT_METHOD_LABELS[paymentMethod];

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm",
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-label={`Processing ${methodLabel} payment`}
    >
      <div className="bg-card rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-xl border border-border/20">
        {/* Spinner */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-lg font-semibold text-foreground mb-2">
          {message}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">{description}</p>

        {/* Cancel Button (only shown before redirect) */}
        {onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
