"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUser";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";
import {
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
import { sendOrderConfirmationEmailViaAPI } from "@/lib/email/client";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  type Step1FormValues,
  type Step2FormValues,
  type Step3FormValues,
} from "@/components/checkout/checkout-schemas";
import { CheckoutProgress } from "@/components/checkout/CheckoutProgress";
import { CheckoutStep1Delivery } from "@/components/checkout/CheckoutStep1Delivery";
import { CheckoutStep2Contact } from "@/components/checkout/CheckoutStep2Contact";
import { CheckoutStep3Payment } from "@/components/checkout/CheckoutStep3Payment";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { CheckoutSuccessModal } from "@/components/checkout/CheckoutSuccessModal";

// Payment configuration - check if PayMongo is available
const PAYMONGO_ENABLED = !!process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, summary, clearCart, removeVendorItems } = useCart();
  const { user, isAuthenticated: userIsAuthenticated } = useAuth();
  const { profile } = useUserProfile(); // Get full profile for phone number
  const { addresses: savedAddresses, defaultAddress, loading: addressesLoading } = useFirebaseAddresses();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<SelectedAddress | null>(null);
  const [lalamoveQuote, setLalamoveQuote] = useState<LalamoveQuoteResult | null>(null);
  const [lalamoveServiceType, setLalamoveServiceType] = useState<string>("MOTORCYCLE");
  const [lalamoveScheduleAt, setLalamoveScheduleAt] = useState<string | undefined>(undefined);
  const [step1Data, setStep1Data] = useState<Step1FormValues | null>(null);
  const [step2Data, setStep2Data] = useState<Step2FormValues | null>(null);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);

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

  // Pre-fill contact information from user profile
  useEffect(() => {
    if (userIsAuthenticated && user) {
      // Get phone from profile (if available) or user object
      const phoneNumber = profile?.phone || user.phone || "";

      step2Form.reset({
        name: user.displayName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "",
        email: user.email || "",
        phone: phoneNumber,
      });
    }
  }, [userIsAuthenticated, user, profile, step2Form]);

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
        lat: savedAddress.coordinates.lat,
        lng: savedAddress.coordinates.lng,
        formattedAddress: savedAddress.formattedAddress,
        components: {
          street: savedAddress.street,
          city: savedAddress.city,
          state: savedAddress.stateProvince,
          zipCode: savedAddress.zipPostal,
        },
      });
    }
  }, [savedAddresses]);

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

  /**
   * Process payment via PayMongo
   */
  const processPayment = async (
    paymentMethod: "gcash" | "card",
    orderId: string,
    orderNumber: string,
    amount: number
  ): Promise<{ success: boolean; checkoutUrl?: string; error?: string }> => {
    try {
      const response = await fetch("/api/payment/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod,
          amount,
          orderId,
          orderNumber,
          customerEmail: step2Data?.email,
          customerName: step2Data?.name,
          customerPhone: step2Data?.phone,
          description: `MASH Order ${orderNumber}`,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return { success: false, error: data.error || "Payment failed" };
      }

      return {
        success: true,
        checkoutUrl: data.checkoutUrl,
      };
    } catch (error) {
      console.error("Payment processing error:", error);
      return { success: false, error: "Payment service unavailable" };
    }
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

      // Derive sellerId: use the first item's sellerId from the current vendor's items
      const vendorItems = selectedVendor ? itemsByVendor[selectedVendor] || [] : items;
      const orderSellerId = vendorItems[0]?.sellerId || undefined;

      const orderData: CreateOrderData = {
        userId: user.id,
        userEmail: step2Data.email,
        userName: step2Data.name,
        userPhone: step2Data.phone,
        items: vendorItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          grower: item.grower,
          unit: item.unit,
          sellerId: item.sellerId, // Include sellerId per item for order routing
        })),
        subtotal: currentVendorSubtotal,
        tax: summary.tax,
        deliveryFee: deliveryFee,
        total: currentVendorSubtotal + summary.tax + deliveryFee,
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
        lalamoveScheduleAt: lalamoveScheduleAt || undefined,
        lalamoveVehicleType: lalamoveServiceType || undefined,
        lalamoveDistance: lalamoveQuote?.distance || undefined,
        paymentMethod: data.paymentMethod,
        sellerId: orderSellerId, // Top-level sellerId for easy seller-based querying
      };

      // Create the order first
      const newOrderId = await FirebaseOrdersService.createOrder(orderData);
      setOrderId(newOrderId);
      const orderNumber = newOrderId.slice(-8).toUpperCase();

      // For COD orders, send confirmation email and show success
      sendOrderConfirmationEmailViaAPI(step2Data.email, {
        customerName: step2Data.name,
        orderNumber: orderNumber,
        orderId: newOrderId,
        items: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price * item.quantity,
          image: item.image,
        })),
        subtotal: summary.subtotal,
        deliveryFee: deliveryFee,
        total: totalWithDelivery,
        deliveryMethod: step1Data.deliveryMethod,
        deliveryAddress: deliveryAddress?.formattedAddress,
        pickupLocation: selectedPickupLocation?.name,
        paymentMethod: data.paymentMethod,
      }).catch((err) => {
        console.error("Failed to send confirmation email:", err);
        // Don't fail the order if email fails
      });

      // Remove only this vendor's items from cart
      if (selectedVendor) {
        removeVendorItems(selectedVendor);
      } else {
        clearCart();
      }
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
      setPaymentProcessing(false);
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

  // Group items by vendor/grower
  const itemsByVendor = items.reduce((acc, item) => {
    const vendor = item.grower || "MASH";
    if (!acc[vendor]) {
      acc[vendor] = [];
    }
    acc[vendor].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  const vendorNames = Object.keys(itemsByVendor);
  const hasMultipleVendors = vendorNames.length > 1;

  // Auto-select first vendor if none selected
  useEffect(() => {
    if (hasMultipleVendors && !selectedVendor && vendorNames.length > 0) {
      setSelectedVendor(vendorNames[0]);
    } else if (!hasMultipleVendors && vendorNames.length === 1) {
      setSelectedVendor(vendorNames[0]);
    }
  }, [hasMultipleVendors, selectedVendor, vendorNames]);

  // Get items for currently selected vendor
  const currentVendorItems = selectedVendor ? itemsByVendor[selectedVendor] || [] : items;
  const currentVendorSubtotal = currentVendorItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleUseSavedAddress = useCallback(() => {
    setUseNewAddress(false);
    setDeliveryAddress(null);
    setLalamoveQuote(null);
    if (defaultAddress) {
      handleSavedAddressSelect(defaultAddress.id);
    }
  }, [defaultAddress, handleSavedAddressSelect]);

  const remainingVendors = Object.keys(itemsByVendor).filter(v => v !== selectedVendor);

  return (
    <>
      <div className="min-h-screen bg-background px-4 py-6 sm:py-8 md:px-6 lg:px-12 xl:px-16">
        <div className="max-w-7xl mx-auto">
          <CheckoutProgress currentStep={currentStep} />

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* Multi-Vendor Banner */}
          {hasMultipleVendors && (
            <div className="mb-6 p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-xl shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-2">
                    Multiple Vendors Detected ({vendorNames.length} stores)
                  </h3>
                  <p className="text-sm text-amber-800 dark:text-amber-200 mb-4">
                    Your cart contains products from <strong>{vendorNames.length} different vendors</strong>.
                    {watchDeliveryMethod === "pickup" && (
                      <> Each vendor has a different pickup location - you&apos;ll need to pick up from each location separately.</>
                    )}
                    {watchDeliveryMethod === "lalamove" && (
                      <> We recommend checking out separately for each vendor to ensure accurate delivery.</>
                    )}
                  </p>
                  <div className="bg-card rounded-lg p-4 border border-amber-200 dark:border-amber-700">
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-3">
                      Select vendor to checkout:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {vendorNames.map((vendor) => {
                        const vendorItemCount = itemsByVendor[vendor].length;
                        const vendorTotal = itemsByVendor[vendor].reduce(
                          (sum, item) => sum + item.price * item.quantity,
                          0
                        );
                        return (
                          <button
                            key={vendor}
                            onClick={() => setSelectedVendor(vendor)}
                            className={cn(
                              "text-left p-3 rounded-lg border-2 transition-all",
                              selectedVendor === vendor
                                ? "border-primary bg-primary/5 shadow-md"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                  selectedVendor === vendor ? "border-primary" : "border-muted-foreground"
                                )}>
                                  {selectedVendor === vendor && (
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                  )}
                                </div>
                                <span className="font-medium text-foreground">{vendor}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {vendorItemCount} item{vendorItemCount !== 1 ? "s" : ""}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 ml-6">
                              Total: PHP {vendorTotal.toFixed(2)}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-3 flex items-start gap-2">
                      <span className="font-bold">Tip:</span>
                      <span>You can checkout other vendors after completing this order.</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty Cart */}
          {isCartEmpty && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-4">
                Add some products to your cart before checking out.
              </p>
              <Button onClick={() => router.push("/shop")}>Continue Shopping</Button>
            </div>
          )}

          {/* Main Content */}
          {!isCartEmpty && (
            <div className="lg:flex lg:gap-8 xl:gap-12">
              <div className="lg:w-3/5 w-full space-y-6 sm:space-y-8 mb-8 lg:mb-0">
                {currentStep === 1 && (
                  <CheckoutStep1Delivery
                    form={step1Form}
                    watchDeliveryMethod={watchDeliveryMethod}
                    userIsAuthenticated={userIsAuthenticated}
                    savedAddresses={savedAddresses}
                    selectedSavedAddressId={selectedSavedAddressId}
                    useNewAddress={useNewAddress}
                    deliveryAddress={deliveryAddress}
                    lalamoveQuote={lalamoveQuote}
                    lalamoveServiceType={lalamoveServiceType}
                    lalamoveScheduleAt={lalamoveScheduleAt}
                    defaultAddress={defaultAddress}
                    onSavedAddressSelect={handleSavedAddressSelect}
                    onAddNewAddressClick={handleAddNewAddressClick}
                    onAddressSelect={handleAddressSelect}
                    onQuoteReceived={handleQuoteReceived}
                    onServiceTypeChange={setLalamoveServiceType}
                    onScheduleChange={setLalamoveScheduleAt}
                    onUseSavedAddress={handleUseSavedAddress}
                    onSubmit={onStep1Submit}
                    onBack={handleBack}
                  />
                )}

                {currentStep === 2 && (
                  <CheckoutStep2Contact
                    form={step2Form}
                    userIsAuthenticated={userIsAuthenticated}
                    userName={user?.displayName}
                    step1Data={step1Data}
                    deliveryAddress={deliveryAddress}
                    lalamoveQuote={lalamoveQuote}
                    lalamoveScheduleAt={lalamoveScheduleAt}
                    onSubmit={onStep2Submit}
                    onBack={handleBack}
                  />
                )}

                {currentStep === 3 && (
                  <CheckoutStep3Payment
                    form={step3Form}
                    step1Data={step1Data}
                    step2Data={step2Data}
                    deliveryAddress={deliveryAddress}
                    hasMultipleVendors={hasMultipleVendors}
                    selectedVendor={selectedVendor}
                    submitting={submitting}
                    paymentProcessing={paymentProcessing}
                    itemCount={items.length}
                    onSubmit={onStep3Submit}
                    onBack={handleBack}
                    onEditStep={setCurrentStep}
                  />
                )}
              </div>

              <OrderSummary
                items={currentVendorItems}
                subtotal={currentVendorSubtotal}
                deliveryFee={deliveryFee}
                total={totalWithDelivery}
                deliveryMethod={watchDeliveryMethod}
                vendorName={selectedVendor}
                hasMultipleVendors={hasMultipleVendors}
                loading={loading}
              />
            </div>
          )}
        </div>
      </div>

      {showSuccessModal && (
        <CheckoutSuccessModal
          vendorName={selectedVendor}
          remainingVendors={remainingVendors}
          onViewOrders={() => {
            setShowSuccessModal(false);
            router.push("/profile/order-history");
          }}
          onNextVendor={(vendor) => {
            setShowSuccessModal(false);
            setSelectedVendor(vendor);
            setCurrentStep(1);
          }}
          onContinueShopping={() => {
            setShowSuccessModal(false);
            router.push("/shop");
          }}
        />
      )}
    </>
  );
}
