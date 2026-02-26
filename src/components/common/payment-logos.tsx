import Image from "next/image";

const PAYMENT_METHODS = [
  { name: "GCash", src: "/payment-logos/gcash-logo.png", width: 60, height: 24 },
  { name: "Maya", src: "/payment-logos/Maya_logo.svg", width: 60, height: 24 },
  { name: "Visa", src: "/payment-logos/visa-logo.png", width: 48, height: 16 },
  { name: "Mastercard", src: "/payment-logos/mastercard-logo.png", width: 40, height: 24 },
] as const;

/**
 * Row of accepted payment method logos for the footer.
 * Grayscale by default, color on hover.
 */
export function PaymentLogos() {
  return (
    <div className="border-t border-border py-4">
      <p className="text-xs text-muted-foreground text-center mb-3">
        Accepted Payment Methods
      </p>
      <div className="flex items-center justify-center gap-6 flex-wrap">
        {PAYMENT_METHODS.map((method) => (
          <div
            key={method.name}
            className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-200"
            title={method.name}
          >
            <Image
              src={method.src}
              alt={method.name}
              width={method.width}
              height={method.height}
              className="h-6 w-auto object-contain"
              style={{ width: "auto", height: "24px" }}
            />
          </div>
        ))}
        <span className="text-xs font-medium text-muted-foreground border border-border rounded px-2 py-1 hover:text-foreground transition-colors">
          COD
        </span>
      </div>
    </div>
  );
}
