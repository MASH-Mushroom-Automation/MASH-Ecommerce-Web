"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentMethodCard } from "@/components/checkout/PaymentMethodCard";
import {
  PAYMENT_METHODS,
  type PaymentMethod,
} from "@/types/payment";
import { getAvailablePaymentMethods } from "@/lib/payment/config";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface PaymentMethodSelectorProps {
  /** Currently selected payment method */
  value: PaymentMethod;
  /** Called when user selects a different method */
  onChange: (method: PaymentMethod) => void;
  /** Show loading skeleton */
  loading?: boolean;
  /** Additional class names */
  className?: string;
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function PaymentMethodSelectorSkeleton() {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 gap-3"
      role="status"
      aria-label="Loading payment methods"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-4 rounded-lg border-2 border-border p-4"
        >
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-full" />
          </div>
          <Skeleton className="h-5 w-5 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PaymentMethodSelector({
  value,
  onChange,
  loading = false,
  className,
}: PaymentMethodSelectorProps) {
  if (loading) {
    return <PaymentMethodSelectorSkeleton />;
  }

  const availableMethods = getAvailablePaymentMethods();

  return (
    <RadioGroupPrimitive.Root
      value={value}
      onValueChange={(v) => onChange(v as PaymentMethod)}
      className={cn("grid grid-cols-1 md:grid-cols-2 gap-3", className)}
      aria-label="Select payment method"
    >
      {PAYMENT_METHODS.map((method) => (
        <PaymentMethodCard
          key={method}
          method={method}
          selected={value === method}
          disabled={!availableMethods.includes(method)}
        />
      ))}
    </RadioGroupPrimitive.Root>
  );
}
