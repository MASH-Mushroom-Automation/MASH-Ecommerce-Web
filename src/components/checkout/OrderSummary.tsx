"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ChevronDown } from "lucide-react";

const PLACEHOLDER_IMAGE = "/mushroom-placeholder.png";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryMethod: string;
  vendorName?: string | null;
  hasMultipleVendors: boolean;
  loading: boolean;
}

export function OrderSummary({
  items,
  subtotal,
  deliveryFee,
  total,
  deliveryMethod,
  vendorName,
  hasMultipleVendors,
  loading,
}: OrderSummaryProps) {
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const itemQuantityTotal = items.reduce((sum, item) => sum + item.quantity, 0);

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
            Order Summary ({itemQuantityTotal} {itemQuantityTotal === 1 ? "item" : "items"})
          </h2>
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">PHP {total.toFixed(2)}</span>
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

          <div className="mt-0 lg:mt-4 space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <LoadingSpinner className="mx-auto mb-4" />
                <p className="text-muted-foreground">Loading cart items...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No items for this vendor</p>
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
                        item.image ? "object-cover" : "object-contain bg-muted p-1"
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
                      PHP {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="mt-6 border-t border-border pt-4 space-y-2 text-sm sm:text-base text-muted-foreground">
            <div className="flex justify-between">
              <p>Subtotal ({itemQuantityTotal} items)</p>
              <p className="font-medium">PHP {subtotal.toFixed(2)}</p>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between">
                <p>Delivery (Lalamove)</p>
                <p className="font-medium">PHP {deliveryFee.toFixed(2)}</p>
              </div>
            )}
            {deliveryMethod === "pickup" && (
              <div className="flex justify-between">
                <p>Pickup</p>
                <p className="font-medium text-green-600">Free</p>
              </div>
            )}
          </div>
          <div className="mt-4 border-t border-border pt-4 flex justify-between items-center font-bold text-foreground text-base sm:text-lg">
            <p>Total</p>
            <p>PHP {total.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
