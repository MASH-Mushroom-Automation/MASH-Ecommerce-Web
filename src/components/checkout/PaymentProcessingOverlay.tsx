"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Loader2,
  CreditCard,
  Banknote,
  Smartphone,
  Wallet,
  CircleDollarSign,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types/payment";
import { PAYMENT_METHOD_LABELS } from "@/types/payment";

// ---------------------------------------------------------------------------
// Processing step definitions
// ---------------------------------------------------------------------------

export type ProcessingStep = "creating" | "connecting" | "redirecting";

const STEP_TEXT: Record<ProcessingStep, string> = {
  creating: "Creating your order...",
  connecting: "Connecting to payment...",
  redirecting: "Redirecting...",
};

const STEP_ORDER: ProcessingStep[] = ["creating", "connecting", "redirecting"];

// ---------------------------------------------------------------------------
// Timing constants (ms) -- exported for testing
// ---------------------------------------------------------------------------

/** Delay between auto-advancing processing steps (ms) */
export const STEP_ADVANCE_DELAY = 2000;

/** Delay before the cancel button appears (ms) */
export const CANCEL_DELAY = 30000;

/** Delay before the timeout warning appears (ms) */
export const TIMEOUT_DELAY = 60000;

// ---------------------------------------------------------------------------
// Payment method icon map
// ---------------------------------------------------------------------------

const METHOD_ICON_MAP: Record<PaymentMethod, React.ElementType> = {
  cod: Banknote,
  gcash: Smartphone,
  grab_pay: Wallet,
  card: CreditCard,
  paymaya: CircleDollarSign,
};

// ---------------------------------------------------------------------------
// Processing messages per payment method (used for description below title)
// ---------------------------------------------------------------------------

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
  /** Override the current processing step (when omitted, auto-advances) */
  step?: ProcessingStep;
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
  step: stepOverride,
  className,
}: PaymentProcessingOverlayProps) {
  // -- local state -----------------------------------------------------------
  const [autoStep, setAutoStep] = useState<number>(0);
  const [showCancel, setShowCancel] = useState(false);
  const [showTimeout, setShowTimeout] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // sr-only live region text
  const [announcement, setAnnouncement] = useState("");

  // refs for timers so we can clean up
  const stepTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // -- derived values --------------------------------------------------------
  const currentStepIndex = stepOverride
    ? STEP_ORDER.indexOf(stepOverride)
    : autoStep;
  const currentStep =
    STEP_ORDER[Math.min(currentStepIndex, STEP_ORDER.length - 1)];
  const stepText = showTimeout
    ? "Taking longer than expected..."
    : STEP_TEXT[currentStep];
  const description = PROCESSING_DESCRIPTIONS[paymentMethod];
  const methodLabel = PAYMENT_METHOD_LABELS[paymentMethod];
  const MethodIcon = METHOD_ICON_MAP[paymentMethod];

  // -- reset state when overlay hides/shows ----------------------------------
  useEffect(() => {
    if (visible) {
      setAutoStep(0);
      setShowCancel(false);
      setShowTimeout(false);
      setConfirmOpen(false);
      setAnnouncement(STEP_TEXT.creating);
    }
    return () => {
      // Cleanup all timers on unmount / visibility change
      if (stepTimer.current) clearTimeout(stepTimer.current);
      if (cancelTimer.current) clearTimeout(cancelTimer.current);
      if (timeoutTimer.current) clearTimeout(timeoutTimer.current);
    };
  }, [visible]);

  // -- auto-advance step (only when no stepOverride) -------------------------
  useEffect(() => {
    if (!visible || stepOverride) return;
    if (autoStep >= STEP_ORDER.length - 1) return; // already at last step

    stepTimer.current = setTimeout(() => {
      const nextIndex = Math.min(autoStep + 1, STEP_ORDER.length - 1);
      setAutoStep(nextIndex);
      setAnnouncement(STEP_TEXT[STEP_ORDER[nextIndex]]);
    }, STEP_ADVANCE_DELAY);

    return () => {
      if (stepTimer.current) clearTimeout(stepTimer.current);
    };
  }, [visible, autoStep, stepOverride]);

  // -- show cancel button after CANCEL_DELAY ---------------------------------
  useEffect(() => {
    if (!visible || !onCancel) return;

    cancelTimer.current = setTimeout(() => {
      setShowCancel(true);
      setAnnouncement("You can now cancel the payment if needed.");
    }, CANCEL_DELAY);

    return () => {
      if (cancelTimer.current) clearTimeout(cancelTimer.current);
    };
  }, [visible, onCancel]);

  // -- show timeout warning after TIMEOUT_DELAY ------------------------------
  useEffect(() => {
    if (!visible) return;

    timeoutTimer.current = setTimeout(() => {
      setShowTimeout(true);
      setAnnouncement("Taking longer than expected. You may cancel and try again.");
    }, TIMEOUT_DELAY);

    return () => {
      if (timeoutTimer.current) clearTimeout(timeoutTimer.current);
    };
  }, [visible]);

  // -- beforeunload prevention -----------------------------------------------
  useEffect(() => {
    if (!visible) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Modern browsers ignore custom returnValue but still show a prompt
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [visible]);

  // -- cancel handler (opens confirm dialog) ---------------------------------
  const handleCancelClick = useCallback(() => {
    setConfirmOpen(true);
  }, []);

  const handleConfirmCancel = useCallback(() => {
    setConfirmOpen(false);
    onCancel?.();
  }, [onCancel]);

  // -- render ----------------------------------------------------------------
  if (!visible) return null;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm",
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-label={`Processing ${methodLabel} payment`}
        data-testid="payment-processing-overlay"
      >
        <div className="bg-card rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-xl border border-border/20">
          {/* Payment method icon + spinner */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                {showTimeout ? (
                  <AlertTriangle
                    className="h-8 w-8 text-amber-500"
                    data-testid="timeout-icon"
                  />
                ) : (
                  <MethodIcon
                    className="h-8 w-8 text-emerald-600 dark:text-emerald-400"
                    data-testid="method-icon"
                  />
                )}
              </div>
              {/* Animated spinning ring around the icon */}
              {!showTimeout && (
                <Loader2
                  className="absolute -inset-1 h-[4.5rem] w-[4.5rem] text-emerald-500/40 animate-spin"
                  data-testid="spinner"
                  aria-hidden="true"
                />
              )}
            </div>
          </div>

          {/* Progress step text */}
          <h2
            className="text-lg font-semibold text-foreground mb-2"
            data-testid="processing-step-text"
          >
            {stepText}
          </h2>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-2">{description}</p>

          {/* Step indicator dots */}
          <div
            className="flex items-center justify-center gap-2 mb-6"
            data-testid="step-indicators"
            aria-hidden="true"
          >
            {STEP_ORDER.map((s, i) => (
              <div
                key={s}
                className={cn(
                  "h-2 w-2 rounded-full transition-colors duration-300",
                  i <= currentStepIndex
                    ? "bg-emerald-500"
                    : "bg-muted-foreground/30",
                )}
              />
            ))}
          </div>

          {/* Timeout message */}
          {showTimeout && (
            <p
              className="text-sm text-amber-600 dark:text-amber-400 mb-4"
              data-testid="timeout-message"
            >
              This is taking longer than usual. You can wait or cancel and try
              again.
            </p>
          )}

          {/* Cancel Button -- appears after CANCEL_DELAY or on timeout */}
          {onCancel && (showCancel || showTimeout) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelClick}
              className="text-muted-foreground hover:text-foreground"
              data-testid="cancel-button"
            >
              Cancel Payment
            </Button>
          )}
        </div>

        {/* sr-only live region for screen reader announcements */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
          data-testid="sr-live-region"
        >
          {announcement}
        </div>
      </div>

      {/* Cancel confirmation dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent data-testid="cancel-confirm-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Payment?</AlertDialogTitle>
            <AlertDialogDescription>
              Your payment is still being processed. Are you sure you want to
              cancel? You can retry the payment afterwards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-confirm-stay">
              Keep Waiting
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="cancel-confirm-yes"
            >
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
