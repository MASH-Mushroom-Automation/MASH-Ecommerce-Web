"use client";

import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Banknote, MapPin, Truck } from "lucide-react";
import type { SelectedAddress } from "@/components/checkout";
import { PICKUP_LOCATIONS } from "@/components/checkout";
import type { Step1FormValues, Step2FormValues, Step3FormValues } from "./checkout-schemas";
import { useCallback } from "react";

interface CheckoutStep3PaymentProps {
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
}

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
}: CheckoutStep3PaymentProps) {
  const getSelectedPickupLocation = useCallback((locationId?: string) => {
    if (!locationId) return undefined;
    return PICKUP_LOCATIONS.find((loc) => loc.id === locationId);
  }, []);

  return (
    <>
      {/* Payment Method */}
      <section className="bg-card p-4 sm:p-6 rounded-lg shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
          Payment Method
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Cash payment only - Pay when you receive your order.
        </p>

        <Form {...form}>
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem className="mt-6 space-y-4">
                <label
                  className={cn(
                    "block border-2 rounded-lg p-4 cursor-pointer transition-colors",
                    "border-primary bg-primary/5"
                  )}
                >
                  <input
                    type="radio"
                    value="cod"
                    checked={true}
                    onChange={() => field.onChange("cod")}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Banknote className="h-5 w-5 text-primary" />
                      <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <div className="font-medium text-foreground">
                        {step1Data?.deliveryMethod === "pickup" ? "Cash on Pickup" : "Cash on Delivery"}
                      </div>
                    </div>
                    <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                      Default Payment
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 ml-7">
                    {step1Data?.deliveryMethod === "pickup"
                      ? "Pay when you pick up your order at the selected location"
                      : "Pay the rider when your order is delivered"
                    }
                  </p>
                </label>
              </FormItem>
            )}
          />
        </Form>
      </section>

      {/* Order Review */}
      <section className="bg-card p-4 sm:p-6 rounded-lg shadow-sm">
        <h3 className="text-base font-medium text-foreground mb-4">
          Order Review
        </h3>

        <div className="space-y-3">
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
          disabled={submitting || paymentProcessing}
        >
          Back
        </Button>
        <Button
          type="submit"
          className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary/90 font-semibold text-primary-foreground"
          disabled={submitting || paymentProcessing || itemCount === 0}
          onClick={form.handleSubmit(onSubmit)}
        >
          {submitting ? "Creating Order..." : "Place Order (Cash Payment)"}
        </Button>
      </div>
    </>
  );
}
