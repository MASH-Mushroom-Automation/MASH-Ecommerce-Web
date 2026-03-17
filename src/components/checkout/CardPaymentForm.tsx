"use client";

import React, { useCallback, useRef, useState } from "react";
import { CreditCard, Lock, AlertCircle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

// ---------------------------------------------------------------------------
// Card Brand Detection
// ---------------------------------------------------------------------------

export type CardBrand = "visa" | "mastercard" | "unknown";

/** Detect card brand from the first digits of a card number. */
export function detectCardBrand(cardNumber: string): CardBrand {
  const digits = cardNumber.replace(/\s/g, "");
  if (/^4/.test(digits)) return "visa";
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return "mastercard";
  return "unknown";
}

// ---------------------------------------------------------------------------
// Formatting Helpers
// ---------------------------------------------------------------------------

/** Format card number with spaces every 4 digits. */
export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

/** Format expiry as MM/YY. */
export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) {
    return digits.slice(0, 2) + "/" + digits.slice(2);
  }
  return digits;
}

/** Strip non-digits and cap to maxLen. */
export function formatCvc(value: string, maxLen: number = 3): string {
  return value.replace(/\D/g, "").slice(0, maxLen);
}

// ---------------------------------------------------------------------------
// Validation Helpers
// ---------------------------------------------------------------------------

export interface CardValidation {
  cardNumber: string | null;
  expiry: string | null;
  cvc: string | null;
}

/** Validate card number using the Luhn algorithm. */
export function luhnCheck(number: string): boolean {
  const digits = number.replace(/\s/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

/** Validate expiry in MM/YY format. */
export function validateExpiry(expiry: string): string | null {
  if (!expiry || expiry.length < 4) return "Expiry date is required";
  const parts = expiry.includes("/") ? expiry.split("/") : [expiry.slice(0, 2), expiry.slice(2)];
  const month = parseInt(parts[0], 10);
  const year = parseInt(parts[1], 10);
  if (month < 1 || month > 12) return "Invalid month";
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return "Card has expired";
  }
  return null;
}

/** Full validation of all card fields. Returns errors object. */
export function validateCardFields(
  cardNumber: string,
  expiry: string,
  cvc: string,
  cvcLength: number = 3
): CardValidation {
  const errors: CardValidation = {
    cardNumber: null,
    expiry: null,
    cvc: null,
  };

  const cleanNumber = cardNumber.replace(/\s/g, "");
  if (!cleanNumber) {
    errors.cardNumber = "Card number is required";
  } else if (cleanNumber.length < 13) {
    errors.cardNumber = "Card number is too short";
  } else if (!luhnCheck(cleanNumber)) {
    errors.cardNumber = "Invalid card number";
  }

  errors.expiry = validateExpiry(expiry);

  const cleanCvc = cvc.replace(/\D/g, "");
  if (!cleanCvc) {
    errors.cvc = "CVC is required";
  } else if (cleanCvc.length < cvcLength) {
    errors.cvc = `CVC must be ${cvcLength} digits`;
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Card Brand Logo Component
// ---------------------------------------------------------------------------

function CardBrandIcon({
  brand,
  className,
}: {
  brand: CardBrand;
  className?: string;
}) {
  if (brand === "visa") {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center font-bold text-[11px] tracking-wide text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded px-1.5 py-0.5 select-none",
          className
        )}
        aria-label="Visa"
      >
        VISA
      </span>
    );
  }
  if (brand === "mastercard") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-0.5 select-none",
          className
        )}
        aria-label="Mastercard"
      >
        <span className="h-3 w-3 rounded-full bg-red-500 -mr-1" />
        <span className="h-3 w-3 rounded-full bg-yellow-400" />
      </span>
    );
  }
  return <CreditCard className={cn("h-4 w-4 text-muted-foreground", className)} aria-hidden="true" />;
}

// ---------------------------------------------------------------------------
// Field Error Component
// ---------------------------------------------------------------------------

function FieldError({ id, message }: { id: string; message: string | null }) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1"
    >
      <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CardPaymentFormProps {
  /** Callback when card data changes. Provides raw values and validation state. */
  onChange?: (data: {
    cardNumber: string;
    expiry: string;
    cvc: string;
    brand: CardBrand;
    isValid: boolean;
  }) => void;
  /** Whether the form is disabled (e.g., during processing). */
  disabled?: boolean;
  /** Additional class names. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CardPaymentForm({
  onChange,
  disabled = false,
  className,
}: CardPaymentFormProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [touched, setTouched] = useState({
    cardNumber: false,
    expiry: false,
    cvc: false,
  });

  const expiryRef = useRef<HTMLInputElement>(null);
  const cvcRef = useRef<HTMLInputElement>(null);

  const brand = detectCardBrand(cardNumber);
  const cvcLength = brand === "unknown" ? 3 : 3; // AMEX would be 4, but we only support Visa/MC

  const errors = validateCardFields(cardNumber, expiry, cvc, cvcLength);
  const isValid = !errors.cardNumber && !errors.expiry && !errors.cvc;

  const emitChange = useCallback(
    (cn: string, ex: string, cv: string) => {
      const b = detectCardBrand(cn);
      const cLen = 3;
      const errs = validateCardFields(cn, ex, cv, cLen);
      onChange?.({
        cardNumber: cn.replace(/\s/g, ""),
        expiry: ex,
        cvc: cv,
        brand: b,
        isValid: !errs.cardNumber && !errs.expiry && !errs.cvc,
      });
    },
    [onChange]
  );

  // ---- Card Number Handler ----
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
    // Auto-advance to expiry when card number is complete
    if (formatted.replace(/\s/g, "").length === 16) {
      expiryRef.current?.focus();
    }
    emitChange(formatted, expiry, cvc);
  };

  // ---- Expiry Handler ----
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    setExpiry(formatted);
    // Auto-advance to CVC when expiry is complete
    if (formatted.length === 5) {
      cvcRef.current?.focus();
    }
    emitChange(cardNumber, formatted, cvc);
  };

  // ---- CVC Handler ----
  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCvc(e.target.value, cvcLength);
    setCvc(formatted);
    emitChange(cardNumber, expiry, formatted);
  };

  // ---- Blur handlers ----
  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Shared input class
  const inputClass = (hasError: boolean) =>
    cn(
      "w-full rounded-lg border bg-background px-3 py-2.5 text-base text-foreground tabular-nums",
      "placeholder:text-muted-foreground/60",
      "transition-colors duration-200",
      "focus:outline-none focus:ring-2 focus:ring-offset-2",
      hasError
        ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
        : "border-border focus:border-emerald-500 focus:ring-emerald-500/20",
      disabled && "cursor-not-allowed opacity-50 bg-muted"
    );

  return (
    <div
      className={cn("space-y-4", className)}
      role="group"
      aria-label="Card payment details"
    >
      {/* Card Number */}
      <div>
        <Label htmlFor="card-number" className="mb-1.5">
          Card Number
        </Label>
        <div className="relative">
          <input
            id="card-number"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="4242 4242 4242 4242"
            value={cardNumber}
            onChange={handleCardNumberChange}
            onBlur={() => handleBlur("cardNumber")}
            disabled={disabled}
            aria-invalid={touched.cardNumber && !!errors.cardNumber}
            aria-describedby={
              touched.cardNumber && errors.cardNumber
                ? "card-number-error"
                : undefined
            }
            className={cn(
              inputClass(touched.cardNumber && !!errors.cardNumber),
              "pr-16"
            )}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            <CardBrandIcon brand={brand} />
          </div>
        </div>
        <FieldError
          id="card-number-error"
          message={touched.cardNumber ? errors.cardNumber : null}
        />
      </div>

      {/* Expiry + CVC row */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Expiry */}
        <div>
          <Label htmlFor="card-expiry" className="mb-1.5">
            Expiry
          </Label>
          <input
            ref={expiryRef}
            id="card-expiry"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="MM/YY"
            value={expiry}
            onChange={handleExpiryChange}
            onBlur={() => handleBlur("expiry")}
            disabled={disabled}
            aria-invalid={touched.expiry && !!errors.expiry}
            aria-describedby={
              touched.expiry && errors.expiry ? "card-expiry-error" : undefined
            }
            className={inputClass(touched.expiry && !!errors.expiry)}
          />
          <FieldError
            id="card-expiry-error"
            message={touched.expiry ? errors.expiry : null}
          />
        </div>

        {/* CVC */}
        <div>
          <Label htmlFor="card-cvc" className="mb-1.5">
            CVC
          </Label>
          <div className="relative">
            <input
              ref={cvcRef}
              id="card-cvc"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              placeholder="123"
              maxLength={cvcLength}
              value={cvc}
              onChange={handleCvcChange}
              onBlur={() => handleBlur("cvc")}
              disabled={disabled}
              aria-invalid={touched.cvc && !!errors.cvc}
              aria-describedby={
                touched.cvc && errors.cvc ? "card-cvc-error" : undefined
              }
              className={cn(inputClass(touched.cvc && !!errors.cvc), "pr-9")}
            />
            <Lock
              className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <FieldError
            id="card-cvc-error"
            message={touched.cvc ? errors.cvc : null}
          />
        </div>
      </div>

      {/* 3D Secure Notice */}
      <div
        className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground"
        aria-label="3D Secure information"
      >
        <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        <p>
          Your payment is secured with 3D Secure. You may be redirected to your
          bank for verification before the payment is completed.
        </p>
      </div>
    </div>
  );
}
