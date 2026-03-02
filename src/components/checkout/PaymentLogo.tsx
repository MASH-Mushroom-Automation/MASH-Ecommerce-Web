import Image from "next/image";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types/payment";

// ---------------------------------------------------------------------------
// Logo metadata -- maps each PaymentMethod to an optimized SVG asset
// ---------------------------------------------------------------------------

interface LogoMeta {
  /** Path relative to /public */
  src: string;
  /** Human-readable label for alt text */
  alt: string;
}

const LOGO_MAP: Record<PaymentMethod, LogoMeta> = {
  cod: { src: "/payment-logos/cod-icon.svg", alt: "Cash on Delivery" },
  gcash: { src: "/payment-logos/gcash.svg", alt: "GCash" },
  grab_pay: { src: "/payment-logos/grabpay.svg", alt: "GrabPay" },
  card: { src: "/payment-logos/visa.svg", alt: "Credit / Debit Card" },
  paymaya: { src: "/payment-logos/maya.svg", alt: "Maya" },
};

/**
 * Map of all card brand logos (rendered together for the "card" method in
 * footer or marketing contexts).
 */
export const CARD_BRAND_LOGOS = [
  { src: "/payment-logos/visa.svg", alt: "Visa" },
  { src: "/payment-logos/mastercard.svg", alt: "Mastercard" },
] as const;

// ---------------------------------------------------------------------------
// Size presets (width x height in px)
// ---------------------------------------------------------------------------

export type PaymentLogoSize = "sm" | "md" | "lg";

const SIZE_MAP: Record<PaymentLogoSize, { width: number; height: number }> = {
  sm: { width: 48, height: 16 },
  md: { width: 72, height: 24 },
  lg: { width: 96, height: 32 },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface PaymentLogoProps {
  /** Payment method whose logo to render */
  method: PaymentMethod;
  /** Size preset (default: "md") */
  size?: PaymentLogoSize;
  /** Additional class names for the wrapper */
  className?: string;
  /** Override alt text */
  alt?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders the brand logo SVG for a given payment method.
 *
 * - Uses optimised SVGs from `public/payment-logos/`
 * - Dark-mode compatible (neutral SVG colours / CSS-level inversion)
 * - Three size presets: `sm` (48x16), `md` (72x24), `lg` (96x32)
 */
export function PaymentLogo({
  method,
  size = "md",
  className,
  alt: altOverride,
}: PaymentLogoProps) {
  const logo = LOGO_MAP[method];
  const dimensions = SIZE_MAP[size];

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center shrink-0",
        // Subtle brightness inversion for dark mode keeps SVGs readable
        "dark:brightness-110 dark:contrast-90",
        className,
      )}
      data-testid={`payment-logo-${method}`}
    >
      <Image
        src={logo.src}
        alt={altOverride ?? logo.alt}
        width={dimensions.width}
        height={dimensions.height}
        className="h-auto w-auto object-contain"
        style={{
          maxWidth: `${dimensions.width}px`,
          maxHeight: `${dimensions.height}px`,
        }}
        // SVGs are tiny -- no need for lazy loading
        priority={false}
        unoptimized
      />
    </div>
  );
}
