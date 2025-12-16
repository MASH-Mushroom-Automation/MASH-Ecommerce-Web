"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { MapPin, Truck, Package } from "lucide-react";
import {
  AddressPicker,
  AddressSelector,
  LalamoveQuote,
  MASH_PICKUP_LOCATION,
  PICKUP_LOCATIONS,
  type SelectedAddress,
  type LalamoveQuoteResult,
} from "@/components/checkout";
import { useFirebaseAddresses } from "@/hooks/useFirebaseAddresses";
import {
  FirebaseOrdersService,
  type CreateOrderData,
} from "@/lib/firebase/orders";

const PLACEHOLDER_IMAGE = "/mushroom-placeholder.png";

const step1Schema = z.object({
  deliveryMethod: z.enum(["pickup", "lalamove"]),
  pickupLocation: z.string().optional(),
});

const step2Schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      /^(\+63|0)?[0-9]{10,11}$/,
      "Please enter a valid Philippine phone number (e.g., 09171234567 or +639171234567)"
    )
    .transform((val) => val.replace(/[\s\-()]/g, "")), // Remove spaces, dashes, parentheses
});

const step3Schema = z.object({
  paymentMethod: z.enum(["cod", "gcash", "card"]),
});

type Step1FormValues = z.infer<typeof step1Schema>;
type Step2FormValues = z.infer<typeof step2Schema>;
type Step3FormValues = z.infer<typeof step3Schema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, summary, clearCart } = useCart();
  const { user, isAuthenticated: userIsAuthenticated } = useAuth();
  const { addresses: savedAddresses, defaultAddress, loading: addressesLoading } = useFirebaseAddresses();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<SelectedAddress | null>(null);
  const [lalamoveQuote, setLalamoveQuote] = useState<LalamoveQuoteResult | null>(null);
  const [step1Data, setStep1Data] = useState<Step1FormValues | null>(null);
  const [step2Data, setStep2Data] = useState<Step2FormValues | null>(null);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);

  const step1Form = useForm<Step1FormValues>({
    resolver: zodResolver(step1Schema),
    defaultValues: { deliveryMethod: "pickup", pickupLocation: "main" },
  });

  const step2Form = useForm<Step2FormValues>({
    resolver: zodResolver(step2Schema),
    defaultValues: { name: "", email: "", phone: "" },
  });

  const step3Form = useForm<Step3FormValues>({
    resolver: zodResolver(step3Schema),
    defaultValues: { paymentMethod: "cod" },
  });

  const watchDeliveryMethod = step1Form.watch("deliveryMethod");

  useEffect(() => {
    if (userIsAuthenticated && user) {
      step2Form.reset({
        name: user.displayName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "",
        email: user.email || "",
        phone: "",
      });
    }
  }, [userIsAuthenticated, user, step2Form]);

  // Auto-select default address when Lalamove is selected and user has saved addresses
  useEffect(() => {
    if (
      watchDeliveryMethod === "lalamove" &&
      defaultAddress &&
      !selectedSavedAddressId &&
      !useNewAddress &&
      !addressesLoading
    ) {
      handleSavedAddressSelect(defaultAddress.id);
    }
  }, [watchDeliveryMethod, defaultAddress, selectedSavedAddressId, useNewAddress, addressesLoading, handleSavedAddressSelect]);

  const getSelectedPickupLocation = useCallback((locationId?: string) => {
    if (!locationId) return undefined;
    return PICKUP_LOCATIONS.find((loc) => loc.id === locationId);
  }, []);

  const handleSavedAddressSelect = useCallback((addressId: string) => {
    setSelectedSavedAddressId(addressId);
    setUseNewAddress(false);
    // Find the saved address and convert to SelectedAddress format
    const savedAddress = savedAddresses.find((a) => a.id === addressId);
    if (savedAddress) {
      setDeliveryAddress({
        lat: savedAddress.lat,
        lng: savedAddress.lng,
        formattedAddress: savedAddress.formattedAddress,
      });
    }
  }, [savedAddresses]);

  const handleAddressSelect = useCallback((address: SelectedAddress) => {
    setDeliveryAddress(address);
    setSelectedSavedAddressId(null);
    setUseNewAddress(true);
  }, []);

  const handleAddNewAddressClick = useCallback(() => {
    setSelectedSavedAddressId(null);
    setUseNewAddress(true);
    setDeliveryAddress(null);
    setLalamoveQuote(null);
  }, []);

  const handleQuoteReceived = useCallback((quote: LalamoveQuoteResult | null) => {
    setLalamoveQuote(quote);
  }, []);

  const deliveryFee = watchDeliveryMethod === "lalamove" ? (lalamoveQuote?.price || 0) : 0;
  const totalWithDelivery = summary.total + deliveryFee;

  const onStep1Submit = (data: Step1FormValues) => {
    if (data.deliveryMethod === "lalamove") {
      if (!deliveryAddress) {
        setError("Please enter a delivery address");
        return;
      }
      if (!lalamoveQuote) {
        setError("Please wait for delivery quote");
        return;
      }
    }
    setStep1Data(data);
    setError(null);
    setCurrentStep(2);
  };

  const onStep2Submit = (data: Step2FormValues) => {
    setStep2Data(data);
    setError(null);
    setCurrentStep(3);
  };

  const onStep3Submit = async (data: Step3FormValues) => {
    if (!step1Data || !step2Data) return;
    if (!userIsAuthenticated || !user?.id) {
      setError("Please log in to place an order");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const selectedPickupLocation = step1Data.deliveryMethod === "pickup"
        ? PICKUP_LOCATIONS.find(loc => loc.id === step1Data.pickupLocation)
        : undefined;

      const orderData: CreateOrderData = {
        userId: user.id,
        userEmail: step2Data.email,
        userName: step2Data.name,
        userPhone: step2Data.phone,
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          grower: item.grower,
          unit: item.unit,
        })),
        subtotal: summary.subtotal,
        tax: summary.tax,
        deliveryFee: deliveryFee,
        total: totalWithDelivery,
        deliveryMethod: step1Data.deliveryMethod,
        pickupLocation: selectedPickupLocation,
        deliveryAddress: step1Data.deliveryMethod === "lalamove" && deliveryAddress
          ? {
              address: deliveryAddress.formattedAddress,
              lat: deliveryAddress.lat,
              lng: deliveryAddress.lng,
              name: step2Data.name,
              phone: step2Data.phone,
            }
          : undefined,
        lalamoveQuotationId: lalamoveQuote?.quotationId,
        paymentMethod: data.paymentMethod,
      };

      const newOrderId = await FirebaseOrdersService.createOrder(orderData);
      setOrderId(newOrderId);
      clearCart();
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Order submission failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      router.back();
    }
  };

  const isCartEmpty = items.length === 0;

  return (
    <>
      <div className="min-h-screen bg-background px-4 py-6 sm:py-8 md:px-6 lg:px-12 xl:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              {currentStep === 1 && "Delivery Method"}
              {currentStep === 2 && "Contact Information"}
              {currentStep === 3 && "Payment & Review"}
            </h1>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      currentStep >= step
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={cn(
                        "w-12 h-1 rounded",
                        currentStep > step ? "bg-primary" : "bg-muted"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {isCartEmpty && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-4">
                Add some products to your cart before checking out.
              </p>
              <Button onClick={() => router.push("/shop")}>
                Continue Shopping
              </Button>
            </div>
          )}

          {!isCartEmpty && (
            <div className="lg:flex lg:gap-8 xl:gap-12">
              <div className="lg:w-3/5 w-full space-y-6 sm:space-y-8 mb-8 lg:mb-0">
                
                {currentStep === 1 && (
                  <>
                    <Form {...step1Form}>
                      <FormField
                        control={step1Form.control}
                        name="deliveryMethod"
                        render={({ field }) => (
                          <FormItem className="space-y-4">
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
                                    control={step1Form.control}
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
                                  {/* Saved Addresses Section */}
                                  {userIsAuthenticated && savedAddresses.length > 0 && !useNewAddress && (
                                    <div className="space-y-3">
                                      <h4 className="text-sm font-medium text-muted-foreground">
                                        Select a saved address:
                                      </h4>
                                      <AddressSelector
                                        onSelect={handleSavedAddressSelect}
                                        selectedId={selectedSavedAddressId || undefined}
                                        showAddNew={false}
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddNewAddressClick}
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
                                            onClick={() => {
                                              setUseNewAddress(false);
                                              setDeliveryAddress(null);
                                              setLalamoveQuote(null);
                                              // Re-select default if available
                                              if (defaultAddress) {
                                                handleSavedAddressSelect(defaultAddress.id);
                                              }
                                            }}
                                          >
                                            Use saved address
                                          </Button>
                                        </div>
                                      )}
                                      <AddressPicker
                                        onAddressSelect={handleAddressSelect}
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
                                      onQuoteReceived={handleQuoteReceived}
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
                      <Button variant="outline" onClick={handleBack}>
                        Back to Cart
                      </Button>
                      <Button
                        onClick={step1Form.handleSubmit(onStep1Submit)}
                        disabled={
                          watchDeliveryMethod === "lalamove" &&
                          (!deliveryAddress || !lalamoveQuote)
                        }
                      >
                        Continue to Contact Info
                      </Button>
                    </div>
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <section className="bg-card p-4 sm:p-6 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                          Contact Information
                        </h2>
                        {userIsAuthenticated && user && (
                          <span className="text-xs sm:text-sm text-green-600 font-medium">
                            Auto-filled from profile
                          </span>
                        )}
                      </div>
                      <Form {...step2Form}>
                        <div className="space-y-4">
                          <FormField
                            control={step2Form.control}
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
                            control={step2Form.control}
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
                                    // Only allow numbers, +, and common phone formatting characters
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
                            control={step2Form.control}
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
                              <p className="font-medium">Same-Day Delivery via Lalamove</p>
                              <p className="text-sm text-muted-foreground">{deliveryAddress?.formattedAddress}</p>
                              {lalamoveQuote && (
                                <p className="text-sm font-medium text-green-600 mt-1">
                                  Delivery Fee: PHP {lalamoveQuote.price.toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </section>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-stretch sm:items-center gap-3 sm:gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto px-8 py-3 border-border"
                        onClick={handleBack}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary/90 font-semibold text-primary-foreground"
                        onClick={step2Form.handleSubmit(onStep2Submit)}
                      >
                        Continue to Payment
                      </Button>
                    </div>
                  </>
                )}

                {currentStep === 3 && (
                  <>
                    <section className="bg-card p-4 sm:p-6 rounded-lg shadow-sm">
                      <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                        Payment Method
                      </h2>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        Select how you would like to pay for your order.
                      </p>

                      <Form {...step3Form}>
                        <FormField
                          control={step3Form.control}
                          name="paymentMethod"
                          render={({ field }) => (
                            <FormItem className="mt-6 space-y-4">
                              <label
                                className={cn(
                                  "block border-2 rounded-lg p-4 cursor-pointer transition-colors",
                                  field.value === "cod"
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                )}
                              >
                                <input
                                  type="radio"
                                  value="cod"
                                  checked={field.value === "cod"}
                                  onChange={() => field.onChange("cod")}
                                  className="sr-only"
                                />
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                      field.value === "cod" ? "border-primary" : "border-muted-foreground"
                                    )}>
                                      {field.value === "cod" && (
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                      )}
                                    </div>
                                    <div className="font-medium text-foreground">
                                      {step1Data?.deliveryMethod === "pickup" ? "Cash on Pickup" : "Cash on Delivery"}
                                    </div>
                                  </div>
                                  <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                                    Available
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2 ml-7">
                                  {step1Data?.deliveryMethod === "pickup" 
                                    ? "Pay when you pick up your order at the selected location"
                                    : "Pay the rider when your order is delivered"
                                  }
                                </p>
                              </label>

                              <div className="block border-2 rounded-lg p-4 cursor-not-allowed transition-colors border-border bg-muted/30 opacity-60">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/50" />
                                    <div className="font-medium text-muted-foreground">GCash</div>
                                  </div>
                                  <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded">
                                    Coming Soon
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground/70 mt-2 ml-7">
                                  Pay using your GCash e-wallet
                                </p>
                              </div>

                              <div className="block border-2 rounded-lg p-4 cursor-not-allowed transition-colors border-border bg-muted/30 opacity-60">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/50" />
                                    <div className="font-medium text-muted-foreground">Credit/Debit Cards</div>
                                  </div>
                                  <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded">
                                    Coming Soon
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground/70 mt-2 ml-7">
                                  Pay using Visa, Mastercard, or other cards
                                </p>
                              </div>
                            </FormItem>
                          )}
                        />
                      </Form>
                    </section>

                    <section className="bg-card p-4 sm:p-6 rounded-lg shadow-sm">
                      <h3 className="text-base font-medium text-foreground mb-4">
                        Order Review
                      </h3>
                      
                      <div className="space-y-3">
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
                            onClick={() => setCurrentStep(2)}
                          >
                            Edit
                          </Button>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {step1Data?.deliveryMethod === "pickup" ? "Pickup Location" : "Delivery Address"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {step1Data?.deliveryMethod === "pickup"
                                ? getSelectedPickupLocation(step1Data?.pickupLocation)?.address
                                : deliveryAddress?.formattedAddress
                              }
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentStep(1)}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </section>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-stretch sm:items-center gap-3 sm:gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto px-8 py-3 border-border"
                        onClick={handleBack}
                        disabled={submitting}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary/90 font-semibold text-primary-foreground"
                        disabled={submitting || items.length === 0}
                        onClick={step3Form.handleSubmit(onStep3Submit)}
                      >
                        {submitting ? "Processing..." : "Place Order"}
                      </Button>
                    </div>
                  </>
                )}
              </div>

              <div className="lg:w-2/5 w-full">
                <div className="bg-card rounded-lg p-4 sm:p-6 shadow-sm lg:sticky lg:top-24">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground border-b border-border pb-3 sm:pb-4">
                    Summary
                  </h2>
                  <div className="mt-4 space-y-4">
                    {loading ? (
                      <div className="text-center py-8">
                        <LoadingSpinner className="mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading cart items...</p>
                      </div>
                    ) : items.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Your cart is empty</p>
                      </div>
                    ) : (
                      items.map((item) => (
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
                      ))
                    )}
                  </div>

                  <div className="mt-6 border-t border-border pt-4 space-y-2 text-sm sm:text-base text-muted-foreground">
                    <div className="flex justify-between">
                      <p>
                        Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)})
                      </p>
                      <p className="font-medium">PHP {summary.subtotal.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p>Tax</p>
                      <p className="font-medium">PHP {summary.tax.toFixed(2)}</p>
                    </div>
                    {deliveryFee > 0 && (
                      <div className="flex justify-between">
                        <p>Delivery (Lalamove)</p>
                        <p className="font-medium">PHP {deliveryFee.toFixed(2)}</p>
                      </div>
                    )}
                    {watchDeliveryMethod === "pickup" && (
                      <div className="flex justify-between">
                        <p>Pickup</p>
                        <p className="font-medium text-green-600">Free</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 border-t border-border pt-4 flex justify-between items-center font-bold text-foreground text-base sm:text-lg">
                    <p>Total</p>
                    <p>PHP {totalWithDelivery.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-card rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
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
              Checkout successful!
            </h2>
            <p className="text-muted-foreground mb-6">
              The seller(s) will be notified with your new order!
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push("/shop");
                }}
              >
                Continue Shopping
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push("/profile/orders");
                }}
              >
                View Orders
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
