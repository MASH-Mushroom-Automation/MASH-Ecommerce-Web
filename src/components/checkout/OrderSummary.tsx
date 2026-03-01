"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Banknote,
  ChevronDown,
  CreditCard,
  CircleDollarSign,
  ShieldCheck,
  Smartphone,
  Tag,
  Wallet,
} from "lucide-react";
import type { PaymentMethod } from "@/types/payment";
import { PAYMENT_METHOD_LABELS } from "@/types/payment";
import { isCodMethod } from "@/types/payment";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PLACEHOLDER_IMAGE = "/mushroom-placeholder.png";

/** Lucide icon map – mirrors PaymentMethodCard but kept local to avoid coupling */
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
// Currency helper
// ---------------------------------------------------------------------------

/** Format a number as Philippine Peso (PHP) with 2 decimal places */
function formatPHP(amount: number): string {
  return `PHP ${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  /** Optional service fee line (future-ready, defaults to 0) */
  serviceFee?: number;
  total: number;
  deliveryMethod: string;
  vendorName?: string | null;
  hasMultipleVendors: boolean;
  loading: boolean;
  /** Currently selected payment method – shown with icon when provided */
  paymentMethod?: PaymentMethod | null;
  /** Optional promotional banner content (future-ready slot) */
  promotionalBanner?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Payment method row with icon and label */
function PaymentMethodDisplay({
  method,
}: {
  method: PaymentMethod;
}) {
  const Icon = METHOD_ICONS[method];
  const label = PAYMENT_METHOD_LABELS[method];

  return (
    <div className="flex items-center gap-2" data-testid="payment-method-display">
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
          "bg-emerald-100 dark:bg-emerald-900/30"
        )}
      >
        <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      </div>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </div>
  );
}

/** Security badge for digital (non-COD) payments */
function PayMongoSecurityBadge() {
  return (
    <div
      className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400"
      data-testid="paymongo-security-badge"
    >
      <ShieldCheck className="h-4 w-4" />
      <span>Secured by PayMongo</span>
    </div>
  );
}

/** Future-ready promotional banner slot */
function PromotionalBannerSlot({
  children,
}: {
  children?: React.ReactNode;
}) {
  if (!children) return null;

  return (
    <div
      className="mt-3 flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/30 p-3"
      data-testid="promotional-banner"
    >
      <Tag className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
      <div className="text-xs text-emerald-700 dark:text-emerald-300">
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function OrderSummary({
  items,
  subtotal,
  deliveryFee,
  serviceFee = 0,
  total,
  deliveryMethod,
  vendorName,
  hasMultipleVendors,
  loading,
  paymentMethod,
  promotionalBanner,
}: OrderSummaryProps) {
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const itemQuantityTotal = items.reduce((sum, item) => sum + item.quantity, 0);

  const isDigitalPayment = paymentMethod ? !isCodMethod(paymentMethod) : false;

  return (
    <div className="lg:w-2/5 w-full">
      <div className="bg-card rounded-lg p-4 sm:p-6 shadow-sm lg:sticky lg:top-24">
        {/* Mobile: collapsible header */}
        <button
          type="button"
          className="lg:hidden w-full flex items-center justify-between"
          onClick={() => setMobileExpanded((prev) => !prev)}
          aria-expanded={mobileExpanded}
        >
          <h2 className="text-lg font-bold text-foreground">
            Order Summary ({itemQuantityTotal}{" "}
            {itemQuantityTotal === 1 ? "item" : "items"})
          </h2>
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">
              {formatPHP(total)}
            </span>
            <ChevronDown
              className={cn(
                "h-5 w-5 text-muted-foreground transition-transform",
                mobileExpanded && "rotate-180"
              )}
            />
          </div>
        </button>

        {/* Desktop: always-visible header */}
        <h2 className="hidden lg:block text-lg sm:text-xl font-bold text-foreground border-b border-border pb-3 sm:pb-4">
          Summary
          {hasMultipleVendors && vendorName && (
            <span className="block text-sm font-normal text-muted-foreground mt-1">
              Checking out: {vendorName}
            </span>
          )}
        </h2>

        {/* Collapsible content: hidden on mobile by default, always shown on desktop */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 lg:!max-h-none lg:!opacity-100 lg:!mt-0",
            mobileExpanded
              ? "max-h-[2000px] opacity-100 mt-4 border-t border-border pt-4 lg:border-0 lg:pt-0"
              : "max-h-0 opacity-0 lg:max-h-none lg:opacity-100"
          )}
        >
          {/* Vendor label on mobile when expanded */}
          {hasMultipleVendors && vendorName && (
            <p className="lg:hidden text-sm text-muted-foreground mb-3">
              Checking out: {vendorName}
            </p>
          )}

          {/* Item list */}
          <div className="mt-0 lg:mt-4 space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <LoadingSpinner className="mx-auto mb-4" />
                <p className="text-muted-foreground">Loading cart items...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No items for this vendor
                </p>
              </div>
            ) : (
              <>
                {items.map((item) => (
                  <div key={item.productId} className="flex items-start gap-3">
                    <Image
                      src={item.image || PLACEHOLDER_IMAGE}
                      alt={item.name}
                      width={56}
                      height={56}
                      className={cn(
                        "w-12 h-12 sm:w-14 sm:h-14 rounded-md flex-shrink-0",
                        item.image
                          ? "object-cover"
                          : "object-contain bg-muted p-1"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm sm:text-base line-clamp-2">
                        {item.name}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-foreground text-sm sm:text-base flex-shrink-0">
                      {formatPHP(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Price breakdown */}
          <div className="mt-6 border-t border-border pt-4 space-y-2 text-sm sm:text-base text-muted-foreground">
            <div className="flex justify-between">
              <p>Subtotal ({itemQuantityTotal} items)</p>
              <p className="font-medium">{formatPHP(subtotal)}</p>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between">
                <p>Delivery (Lalamove)</p>
                <p className="font-medium">{formatPHP(deliveryFee)}</p>
              </div>
            )}
            {deliveryMethod === "pickup" && (
              <div className="flex justify-between">
                <p>Pickup</p>
                <p className="font-medium text-green-600">Free</p>
              </div>
            )}
            {serviceFee > 0 && (
              <div className="flex justify-between">
                <p>Service Fee</p>
                <p className="font-medium">{formatPHP(serviceFee)}</p>
              </div>
            )}
          </div>

          {/* Payment method display */}
          {paymentMethod && (
            <div className="mt-4 border-t border-border pt-4 space-y-2">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Payment Method
              </p>
              <PaymentMethodDisplay method={paymentMethod} />
              {isDigitalPayment && <PayMongoSecurityBadge />}
            </div>
          )}

          {/* Total */}
          <div className="mt-4 border-t border-border pt-4 flex justify-between items-center font-bold text-foreground text-base sm:text-lg">
            <p>Total</p>
            <p>{formatPHP(total)}</p>
          </div>

          {/* Promotional banner slot */}
          <PromotionalBannerSlot>{promotionalBanner}</PromotionalBannerSlot>
        </div>
      </div>
    </div>
  );
}
