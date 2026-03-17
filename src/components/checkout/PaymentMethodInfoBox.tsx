"use client";

import { Info, ExternalLink, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types/payment";
import { isRedirectMethod, isCodMethod } from "@/types/payment";

// ---------------------------------------------------------------------------
// Info content per payment method
// ---------------------------------------------------------------------------

interface MethodInfo {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  mobileNote?: string;
}

const METHOD_INFO: Partial<Record<PaymentMethod, MethodInfo>> = {
  gcash: {
    title: "GCash Payment",
    description:
      "You will be redirected to GCash to authorize the payment. After completing the payment in GCash, you will be returned to this site.",
    icon: Smartphone,
    mobileNote:
      "On mobile, this will open the GCash app directly if installed.",
  },
  grab_pay: {
    title: "GrabPay Payment",
    description:
      "You will be redirected to Grab to authorize the payment. After completing the payment, you will be returned to this site.",
    icon: ExternalLink,
    mobileNote:
      "On mobile, this will open the Grab app directly if installed.",
  },
  card: {
    title: "Card Payment",
    description:
      "Your card details are securely processed. You may be asked to verify with your bank via 3D Secure.",
    icon: Info,
  },
  paymaya: {
    title: "Maya Payment",
    description:
      "You will be redirected to Maya to authorize the payment. After completing the payment, you will be returned to this site.",
    icon: ExternalLink,
    mobileNote:
      "On mobile, this will open the Maya app directly if installed.",
  },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface PaymentMethodInfoBoxProps {
  /** The currently selected payment method */
  selectedMethod: PaymentMethod;
  /** Additional class names */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PaymentMethodInfoBox({
  selectedMethod,
  className,
}: PaymentMethodInfoBoxProps) {
  // Don't show info box for COD -- it's self-explanatory
  if (isCodMethod(selectedMethod)) return null;

  const info = METHOD_INFO[selectedMethod];
  if (!info) return null;

  const IconComponent = info.icon;
  const showRedirectNotice = isRedirectMethod(selectedMethod);

  return (
    <div
      className={cn(
        "rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20 p-4",
        className
      )}
      role="note"
      aria-label={`${info.title} information`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          <IconComponent className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-foreground">{info.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">
            {info.description}
          </p>

          {info.mobileNote && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1">
              <Smartphone className="h-3 w-3" />
              {info.mobileNote}
            </p>
          )}

          {showRedirectNotice && (
            <p className="text-xs text-muted-foreground mt-2">
              Please do not close your browser during the payment process.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Button Label Helper
// ---------------------------------------------------------------------------

/**
 * Returns the appropriate submit button label based on the selected payment method.
 */
export function getPaymentButtonLabel(
  method: PaymentMethod,
  isSubmitting: boolean
): string {
  if (isSubmitting) {
    switch (method) {
      case "gcash":
        return "Redirecting to GCash...";
      case "grab_pay":
        return "Redirecting to GrabPay...";
      case "card":
        return "Processing Payment...";
      case "paymaya":
        return "Redirecting to Maya...";
      default:
        return "Creating Order...";
    }
  }

  switch (method) {
    case "gcash":
      return "Pay with GCash";
    case "grab_pay":
      return "Pay with GrabPay";
    case "card":
      return "Pay with Card";
    case "paymaya":
      return "Pay with Maya";
    default:
      return "Place Order (Cash Payment)";
  }
}
