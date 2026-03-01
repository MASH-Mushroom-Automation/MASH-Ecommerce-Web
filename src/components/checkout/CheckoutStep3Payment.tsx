"use client";

import { UseFormReturn } from "react-hook-form";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { AlertCircle, Banknote, CreditCard, RefreshCw, Smartphone, Wallet } from "lucide-react";
import type { SelectedAddress } from "@/components/checkout";
import { PICKUP_LOCATIONS } from "@/components/checkout";
import type { Step1FormValues, Step2FormValues, Step3FormValues } from "./checkout-schemas";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { PaymentMethodInfoBox, getPaymentButtonLabel } from "./PaymentMethodInfoBox";
import { CardPaymentForm } from "./CardPaymentForm";
import { PaymentProcessingOverlay } from "./PaymentProcessingOverlay";
import type { PaymentMethod } from "@/types/payment";
import { PAYMENT_METHOD_LABELS, isCardMethod, isCodMethod } from "@/types/payment";

// ---------------------------------------------------------------------------
// Payment method icon lookup
// ---------------------------------------------------------------------------

const PAYMENT_ICON_MAP: Record<PaymentMethod, React.ComponentType<{ className?: string }>> = {
  cod: Banknote,
  gcash: Smartphone,
  grab_pay: Wallet,
  card: CreditCard,
  paymaya: Smartphone,
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CheckoutStep3PaymentProps {
  form: UseFormReturn<Step3FormValues>;
  step1Data: Step1FormValues | null;
  step2Data: Step2FormValues | null;
  deliveryAddress: SelectedAddress | null;
  hasMultipleVendors: boolean;
  selectedVendor: string | null;
  submitting: boolean;
  paymentProcessing: boolean;
  itemCount: number;
  onSubmit: (data: Step3FormValues) => void;
  onBack: () => void;
  onEditStep: (step: number) => void;
  /** Optional payment error message to display */
  paymentError?: string | null;
  /** Optional retry callback for payment failures */
  onRetryPayment?: () => void;
  /** Optional loading message override (e.g. "Creating Order..." or "Processing Payment...") */
  loadingMessage?: string | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CheckoutStep3Payment({
  form,
  step1Data,
  step2Data,
  deliveryAddress,
  hasMultipleVendors,
  selectedVendor,
  submitting,
  paymentProcessing,
  itemCount,
  onSubmit,
  onBack,
  onEditStep,
  paymentError = null,
  onRetryPayment,
  loadingMessage = null,
}: CheckoutStep3PaymentProps) {
  const [cardValid, setCardValid] = useState(false);

  const selectedMethod = form.watch("paymentMethod") as PaymentMethod;
  const isProcessing = submitting || paymentProcessing;

  const getSelectedPickupLocation = useCallback((locationId?: string) => {
    if (!locationId) return undefined;
    return PICKUP_LOCATIONS.find((loc) => loc.id === locationId);
  }, []);

  const handlePaymentMethodChange = useCallback(
    (method: PaymentMethod) => {
      form.setValue("paymentMethod", method, { shouldValidate: true });
    },
    [form]
  );

  const SelectedIcon = PAYMENT_ICON_MAP[selectedMethod] ?? Banknote;
  const buttonLabel = loadingMessage || getPaymentButtonLabel(selectedMethod, isProcessing);

  // COD label adapts for pickup vs delivery
  const codLabel =
    step1Data?.deliveryMethod === "pickup" ? "Cash on Pickup" : "Cash on Delivery";

  return (
    <>
      {/* Payment Processing Overlay */}
      <PaymentProcessingOverlay
        visible={paymentProcessing}
        paymentMethod={selectedMethod}
        onCancel={!submitting ? onRetryPayment : undefined}
      />

      {/* Payment Method Selection */}
      <section className="bg-card p-4 sm:p-6 rounded-lg shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
          Payment Method
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mb-6">
          Select how you would like to pay for your order.
        </p>

        <Form {...form}>
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ fieldState }) => (
              <FormItem>
                <PaymentMethodSelector
                  value={selectedMethod}
                  onChange={handlePaymentMethodChange}
                  loading={false}
                />
                {fieldState.error && (
                  <FormMessage>{fieldState.error.message}</FormMessage>
                )}
              </FormItem>
            )}
          />
        </Form>

        {/* Dynamic content area with transitions */}
        <div className="mt-6 transition-all duration-200 ease-in-out">
          {/* COD info when COD selected */}
          {isCodMethod(selectedMethod) && (
            <div className="rounded-lg border border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20 p-4 transition-all duration-200">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <Banknote className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground">
                    {codLabel}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {step1Data?.deliveryMethod === "pickup"
                      ? "Pay when you pick up your order at the selected location. No online payment required."
                      : "Pay the rider when your order is delivered to your address. No online payment required."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Card form when card selected */}
          {isCardMethod(selectedMethod) && (
            <div className="transition-all duration-200">
              <PaymentMethodInfoBox selectedMethod={selectedMethod} className="mb-4" />
              <CardPaymentForm
                disabled={isProcessing}
                onChange={(data) => setCardValid(data.isValid)}
              />
            </div>
          )}

          {/* E-wallet info box for redirect methods */}
          {!isCodMethod(selectedMethod) && !isCardMethod(selectedMethod) && (
            <div className="transition-all duration-200">
              <PaymentMethodInfoBox selectedMethod={selectedMethod} />
            </div>
          )}
        </div>
      </section>

      {/* Payment Error Display */}
      {paymentError && (
        <section className="bg-destructive/5 border border-destructive/20 p-4 sm:p-6 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-destructive">
                Payment Failed
              </h3>
              <p className="text-sm text-destructive/80 mt-1">
                {paymentError}
              </p>
              {onRetryPayment && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={onRetryPayment}
                  disabled={isProcessing}
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Order Review */}
      <section className="bg-card p-4 sm:p-6 rounded-lg shadow-sm">
        <h3 className="text-base font-medium text-foreground mb-4">
          Order Review
        </h3>

        <div className="space-y-3">
          {/* Payment Method Summary */}
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <SelectedIcon className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Payment</p>
              <p className="text-sm text-muted-foreground">
                {isCodMethod(selectedMethod) ? codLabel : PAYMENT_METHOD_LABELS[selectedMethod]}
              </p>
            </div>
          </div>

          {/* Contact Summary */}
          <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium">Contact</p>
              <p className="text-sm text-muted-foreground">{step2Data?.name}</p>
              <p className="text-sm text-muted-foreground">{step2Data?.email}</p>
              <p className="text-sm text-muted-foreground">{step2Data?.phone}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(2)}
              disabled={isProcessing}
            >
              Edit
            </Button>
          </div>

          {/* Delivery Summary */}
          <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium">
                {step1Data?.deliveryMethod === "pickup" ? "Pickup Location" : "Delivery Address"}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                {step1Data?.deliveryMethod === "pickup"
                  ? getSelectedPickupLocation(step1Data?.pickupLocation)?.address
                  : deliveryAddress?.formattedAddress
                }
              </p>
              {step1Data?.deliveryMethod === "pickup" && hasMultipleVendors && selectedVendor && (
                <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-md">
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    <strong>Vendor:</strong> {selectedVendor} - Default MASH pickup location shown. Please coordinate with vendor for exact address.
                  </p>
                </div>
              )}
              {step1Data?.deliveryMethod === "pickup" && getSelectedPickupLocation(step1Data?.pickupLocation) && (
                <div className="mt-3">
                  <iframe
                    width="100%"
                    height="180"
                    frameBorder="0"
                    style={{ border: 0, borderRadius: "8px" }}
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(getSelectedPickupLocation(step1Data?.pickupLocation)?.address || "MASH Philippines")}&zoom=15`}
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(1)}
              disabled={isProcessing}
            >
              Edit
            </Button>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-stretch sm:items-center gap-3 sm:gap-4">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto px-8 py-3 border-border"
          onClick={onBack}
          disabled={isProcessing}
        >
          Back
        </Button>
        <Button
          type="submit"
          className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary/90 font-semibold text-primary-foreground"
          disabled={isProcessing || itemCount === 0}
          onClick={form.handleSubmit(onSubmit)}
        >
          {buttonLabel}
        </Button>
      </div>
    </>
  );
}
