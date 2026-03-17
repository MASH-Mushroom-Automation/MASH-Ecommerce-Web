"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import {
  Banknote,
  CreditCard,
  Smartphone,
  Wallet,
  CircleDollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types/payment";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_DESCRIPTIONS,
} from "@/types/payment";

// ---------------------------------------------------------------------------
// Icon Map
// ---------------------------------------------------------------------------

const METHOD_ICONS: Record<
  PaymentMethod,
  React.ComponentType<{ className?: string }>
> = {
  cod: Banknote,
  gcash: Smartphone,
  grab_pay: Wallet,
  card: CreditCard,
  paymaya: CircleDollarSign,
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface PaymentMethodCardProps {
  method: PaymentMethod;
  selected: boolean;
  disabled: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PaymentMethodCard({
  method,
  selected,
  disabled,
}: PaymentMethodCardProps) {
  const Icon = METHOD_ICONS[method];
  const label = PAYMENT_METHOD_LABELS[method];
  const description = PAYMENT_METHOD_DESCRIPTIONS[method];

  return (
    <RadioGroupPrimitive.Item
      value={method}
      disabled={disabled}
      className={cn(
        "relative flex items-start gap-3 sm:gap-4 rounded-lg border-2 p-4 text-left transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
        selected &&
          !disabled &&
          "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20",
        !selected &&
          !disabled &&
          "border-border hover:border-emerald-300 hover:bg-muted/30",
        disabled && "cursor-not-allowed opacity-60 border-border bg-muted/20"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          selected && !disabled
            ? "bg-emerald-100 dark:bg-emerald-900/30"
            : "bg-muted",
          disabled && "bg-muted/50"
        )}
      >
        <Icon
          className={cn(
            "h-5 w-5",
            selected && !disabled
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-muted-foreground",
            disabled && "text-muted-foreground/50"
          )}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{label}</span>
          {disabled && (
            <span className="text-[10px] font-medium uppercase tracking-wider bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
              Coming Soon
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
          {description}
        </p>
      </div>

      {/* Radio indicator */}
      <div
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          selected && !disabled
            ? "border-emerald-500"
            : "border-muted-foreground/30"
        )}
      >
        <RadioGroupPrimitive.Indicator asChild>
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </RadioGroupPrimitive.Indicator>
      </div>
    </RadioGroupPrimitive.Item>
  );
}
