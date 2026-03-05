"use client";

import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { MapPin, Truck } from "lucide-react";
import type { SelectedAddress, LalamoveQuoteResult } from "@/components/checkout";
import type { Step1FormValues, Step2FormValues } from "./checkout-schemas";
import { useCallback } from "react";
import { PICKUP_LOCATIONS } from "@/components/checkout";

interface CheckoutStep2ContactProps {
  form: UseFormReturn<Step2FormValues>;
  userIsAuthenticated: boolean;
  userName?: string | null;
  step1Data: Step1FormValues | null;
  deliveryAddress: SelectedAddress | null;
  lalamoveQuote: LalamoveQuoteResult | null;
  lalamoveScheduleAt: string | undefined;
  onSubmit: (data: Step2FormValues) => void;
  onBack: () => void;
}

export function CheckoutStep2Contact({
  form,
  userIsAuthenticated,
  userName,
  step1Data,
  deliveryAddress,
  lalamoveQuote,
  lalamoveScheduleAt,
  onSubmit,
  onBack,
}: CheckoutStep2ContactProps) {
  const getSelectedPickupLocation = useCallback((locationId?: string) => {
    if (!locationId) return undefined;
    return PICKUP_LOCATIONS.find((loc) => loc.id === locationId);
  }, []);

  return (
    <>
      <section className="bg-card p-4 sm:p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">
            Contact Information
          </h2>
          {userIsAuthenticated && userName && (
            <span className="text-xs sm:text-sm text-green-600 font-medium">
              Auto-filled from profile
            </span>
          )}
        </div>
        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    {...field}
                    type="text"
                    placeholder="Juan Dela Cruz"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-background"
                  />
                  {fieldState.error && (
                    <p className="text-sm text-destructive mt-1">
                      {fieldState.error.message}
                    </p>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field, fieldState }) => (
                <FormItem>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Phone Number <span className="text-destructive">*</span>
                  </label>
                  <input
                    {...field}
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9+]*"
                    maxLength={15}
                    placeholder="09171234567"
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^0-9+\-\s()]/g, "");
                      field.onChange(cleaned);
                    }}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-background"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Format: 09XX XXX XXXX or +63 9XX XXX XXXX
                  </p>
                  {fieldState.error && (
                    <p className="text-sm text-destructive mt-1">
                      {fieldState.error.message}
                    </p>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <input
                    {...field}
                    type="email"
                    placeholder="juan.delacruz@example.com"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-background"
                  />
                  {fieldState.error && (
                    <p className="text-sm text-destructive mt-1">
                      {fieldState.error.message}
                    </p>
                  )}
                </FormItem>
              )}
            />
          </div>
        </Form>
      </section>

      {/* Delivery Method Summary */}
      <section className="bg-card p-4 sm:p-6 rounded-lg shadow-sm">
        <h3 className="text-base font-medium text-foreground mb-3">
          Delivery Method Selected
        </h3>
        <div className="p-4 bg-muted/30 rounded-lg">
          {step1Data?.deliveryMethod === "pickup" ? (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">
                  Pickup at {getSelectedPickupLocation(step1Data?.pickupLocation)?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {getSelectedPickupLocation(step1Data?.pickupLocation)?.address}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <Truck className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">
                  {lalamoveScheduleAt ? "Scheduled Delivery via Lalamove" : "Same-Day Delivery via Lalamove"}
                </p>
                <p className="text-sm text-muted-foreground">{deliveryAddress?.formattedAddress}</p>
                {lalamoveQuote && (
                  <p className="text-sm font-medium text-green-600 mt-1">
                    Delivery Fee: PHP {lalamoveQuote.price.toFixed(2)}
                  </p>
                )}
                {lalamoveScheduleAt && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Scheduled: {new Date(lalamoveScheduleAt).toLocaleString("en-PH", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Navigation */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-stretch sm:items-center gap-3 sm:gap-4">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto px-8 py-3 border-border"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          type="submit"
          className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary/90 font-semibold text-primary-foreground"
          onClick={form.handleSubmit(onSubmit)}
        >
          Continue to Payment
        </Button>
      </div>
    </>
  );
}
