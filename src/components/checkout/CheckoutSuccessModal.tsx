"use client";

import { Button } from "@/components/ui/button";

interface CheckoutSuccessModalProps {
  vendorName: string | null;
  remainingVendors: string[];
  onViewOrders: () => void;
  onNextVendor: (vendor: string) => void;
  onContinueShopping: () => void;
}

export function CheckoutSuccessModal({
  vendorName,
  remainingVendors,
  onViewOrders,
  onNextVendor,
  onContinueShopping,
}: CheckoutSuccessModalProps) {
  const hasRemainingVendors = remainingVendors.length > 0;

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-md flex items-center justify-center z-50 px-4">
      <div className="bg-card rounded-2xl p-8 max-w-md w-full text-center shadow-xl border border-border/20">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Order placed successfully!
        </h2>
        <p className="text-muted-foreground mb-2">
          {vendorName && `Your order from ${vendorName} has been confirmed.`}
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          The seller will be notified about your new order!
        </p>

        {hasRemainingVendors && (
          <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm font-medium text-foreground mb-2">
              You still have items from {remainingVendors.length} other {remainingVendors.length === 1 ? "vendor" : "vendors"}
            </p>
            <p className="text-xs text-muted-foreground">
              {remainingVendors.join(", ")}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {hasRemainingVendors ? (
            <>
              <Button
                variant="outline"
                className="flex-1"
                onClick={onViewOrders}
              >
                View Orders
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => onNextVendor(remainingVendors[0])}
              >
                Checkout Next Vendor
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="flex-1"
                onClick={onContinueShopping}
              >
                Continue Shopping
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={onViewOrders}
              >
                View Orders
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
