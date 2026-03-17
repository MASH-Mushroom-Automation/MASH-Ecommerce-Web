import Image from "next/image";
import { cn } from "@/lib/utils";
import { PaymentLogo, CARD_BRAND_LOGOS } from "@/components/checkout/PaymentLogo";
import type { PaymentMethod } from "@/types/payment";

// ---------------------------------------------------------------------------
// E-wallet / redirect methods to show individual logos for
// ---------------------------------------------------------------------------

const E_WALLET_METHODS: PaymentMethod[] = ["gcash", "grab_pay", "paymaya"];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface FooterPaymentMethodsProps {
  /** Additional class names */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Horizontal strip displaying all accepted payment method logos.
 *
 * Renders in the site footer above the copyright bar. Shows:
 * - E-wallet logos (GCash, GrabPay, Maya)
 * - Card brand logos (Visa, Mastercard)
 * - COD badge
 *
 * Grayscale by default with colour on hover for subtle visual treatment.
 */
export function FooterPaymentMethods({ className }: FooterPaymentMethodsProps) {
  return (
    <div
      className={cn("border-t border-border py-4", className)}
      data-testid="footer-payment-methods"
    >
      <p className="text-xs text-muted-foreground text-center mb-3">
        Accepted Payment Methods
      </p>

      <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
        {/* E-wallet logos */}
        {E_WALLET_METHODS.map((method) => (
          <div
            key={method}
            className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-200"
          >
            <PaymentLogo method={method} size="sm" />
          </div>
        ))}

        {/* Card brand logos (Visa + Mastercard) */}
        {CARD_BRAND_LOGOS.map((brand) => (
          <div
            key={brand.alt}
            className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-200"
          >
            <Image
              src={brand.src}
              alt={brand.alt}
              width={48}
              height={16}
              className="h-4 w-auto object-contain"
              style={{ width: "auto", height: "16px" }}
              unoptimized
            />
          </div>
        ))}

        {/* COD text badge */}
        <div className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-200">
          <PaymentLogo method="cod" size="sm" />
        </div>
      </div>
    </div>
  );
}
