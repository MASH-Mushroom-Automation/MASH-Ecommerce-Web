"use client";

import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { MapPin, Truck } from "lucide-react";
import {
  AddressPicker,
  LalamoveQuote,
  MASH_PICKUP_LOCATION,
  PICKUP_LOCATIONS,
  type SelectedAddress,
  type LalamoveQuoteResult,
} from "@/components/checkout";
import type { FirestoreAddress } from "@/hooks/useFirebaseAddresses";
import type { Step1FormValues } from "./checkout-schemas";

interface CheckoutStep1DeliveryProps {
  form: UseFormReturn<Step1FormValues>;
  watchDeliveryMethod: string;
  userIsAuthenticated: boolean;
  savedAddresses: FirestoreAddress[];
  selectedSavedAddressId: string | null;
  useNewAddress: boolean;
  deliveryAddress: SelectedAddress | null;
  lalamoveQuote: LalamoveQuoteResult | null;
  lalamoveServiceType: string;
  lalamoveScheduleAt: string | undefined;
  defaultAddress: FirestoreAddress | null;
  onSavedAddressSelect: (id: string) => void;
  onAddNewAddressClick: () => void;
  onAddressSelect: (addr: SelectedAddress) => void;
  onQuoteReceived: (quote: LalamoveQuoteResult | null) => void;
  onServiceTypeChange: (type: string) => void;
  onScheduleChange: (schedule: string | undefined) => void;
  onUseSavedAddress: () => void;
  onSubmit: (data: Step1FormValues) => void;
  onBack: () => void;
}

export function CheckoutStep1Delivery({
  form,
  watchDeliveryMethod,
  userIsAuthenticated,
  savedAddresses,
  selectedSavedAddressId,
  useNewAddress,
  deliveryAddress,
  lalamoveQuote,
  lalamoveServiceType,
  lalamoveScheduleAt,
  defaultAddress,
  onSavedAddressSelect,
  onAddNewAddressClick,
  onAddressSelect,
  onQuoteReceived,
  onServiceTypeChange,
  onScheduleChange,
  onUseSavedAddress,
  onSubmit,
  onBack,
}: CheckoutStep1DeliveryProps) {
  return (
    <>
      <Form {...form}>
        <FormField
          control={form.control}
          name="deliveryMethod"
          render={({ field }) => (
            <FormItem className="space-y-4">
              {/* ---- Pickup Option ---- */}
              <div
                className={cn(
                  "bg-card p-4 sm:p-6 rounded-lg shadow-sm border-2 cursor-pointer transition-all",
                  field.value === "pickup"
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent hover:border-primary/30"
                )}
                onClick={() => field.onChange("pickup")}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Pickup (Free)</h3>
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                          field.value === "pickup"
                            ? "border-primary"
                            : "border-muted-foreground"
                        )}
                      >
                        {field.value === "pickup" && (
                          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pick up your order at one of our locations
                    </p>
                  </div>
                </div>

                {field.value === "pickup" && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <FormField
                      control={form.control}
                      name="pickupLocation"
                      render={({ field: pickupField }) => (
                        <FormItem>
                          {PICKUP_LOCATIONS.map((location) => (
                            <label
                              key={location.id}
                              className={cn(
                                "block p-4 rounded-lg border cursor-pointer transition-colors",
                                pickupField.value === location.id
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              )}
                            >
                              <input
                                type="radio"
                                value={location.id}
                                checked={pickupField.value === location.id}
                                onChange={() => pickupField.onChange(location.id)}
                                className="sr-only"
                              />
                              <div className="font-medium">{location.name}</div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {location.address}
                              </div>
                            </label>
                          ))}
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* ---- Lalamove Delivery Option ---- */}
              <div
                className={cn(
                  "bg-card p-4 sm:p-6 rounded-lg shadow-sm border-2 cursor-pointer transition-all",
                  field.value === "lalamove"
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent hover:border-primary/30"
                )}
                onClick={() => field.onChange("lalamove")}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Truck className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Same-Day Delivery</h3>
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                          field.value === "lalamove"
                            ? "border-primary"
                            : "border-muted-foreground"
                        )}
                      >
                        {field.value === "lalamove" && (
                          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Get it delivered via Lalamove (Metro Manila only)
                    </p>
                  </div>
                </div>

                {field.value === "lalamove" && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    {/* Saved Addresses */}
                    {userIsAuthenticated && savedAddresses.length > 0 && !useNewAddress && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Select a saved address:
                        </h4>
                        <div className="space-y-2">
                          {savedAddresses.map((addr) => (
                            <label
                              key={addr.id}
                              className={cn(
                                "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                                selectedSavedAddressId === addr.id
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              )}
                            >
                              <input
                                type="radio"
                                name="savedAddress"
                                checked={selectedSavedAddressId === addr.id}
                                onChange={() => onSavedAddressSelect(addr.id)}
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{addr.label}</span>
                                  {addr.isDefault && (
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground truncate">
                                  {addr.formattedAddress}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={onAddNewAddressClick}
                          className="w-full"
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Use a different address
                        </Button>
                      </div>
                    )}

                    {/* New Address Input */}
                    {(useNewAddress || savedAddresses.length === 0 || !userIsAuthenticated) && (
                      <div className="space-y-3">
                        {savedAddresses.length > 0 && userIsAuthenticated && (
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-muted-foreground">
                              Enter a new address:
                            </h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={onUseSavedAddress}
                            >
                              Use saved address
                            </Button>
                          </div>
                        )}
                        <AddressPicker
                          onAddressSelect={onAddressSelect}
                          placeholder="Enter your delivery address in Metro Manila..."
                        />
                      </div>
                    )}

                    {deliveryAddress && (
                      <LalamoveQuote
                        pickupAddress={MASH_PICKUP_LOCATION}
                        deliveryAddress={{
                          ...deliveryAddress,
                          lat: deliveryAddress.lat,
                          lng: deliveryAddress.lng,
                          address: deliveryAddress.formattedAddress,
                        }}
                        onQuoteReceived={onQuoteReceived}
                        serviceType={lalamoveServiceType}
                        onServiceTypeChange={onServiceTypeChange}
                        scheduleAt={lalamoveScheduleAt}
                        onScheduleChange={onScheduleChange}
                      />
                    )}
                  </div>
                )}
              </div>
            </FormItem>
          )}
        />
      </Form>

      <div className="flex justify-between items-center pt-4">
        <Button variant="outline" onClick={onBack}>
          Back to Cart
        </Button>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={
            watchDeliveryMethod === "lalamove" &&
            (!deliveryAddress || !lalamoveQuote)
          }
        >
          Continue to Contact Info
        </Button>
      </div>
    </>
  );
}
