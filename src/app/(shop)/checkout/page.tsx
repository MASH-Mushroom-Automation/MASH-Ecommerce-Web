"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { useCart } from "@/contexts/CartContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useState, useEffect } from "react";
import { ProductApiResponse, UserProfile } from "@/types/api";
import { isAuthenticated } from "@/lib/auth";

const step1Schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  pickupLocation: z.enum(["main", "bgc"]),
});

const step2Schema = z.object({
  paymentMethod: z.enum(["cod", "gcash", "card"]),
  // Card fields (optional, only if card is selected)
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvc: z.string().optional(),
});

type Step1FormValues = z.infer<typeof step1Schema>;
type Step2FormValues = z.infer<typeof step2Schema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, summary, clearCart } = useCart();
  const userIsAuthenticated = isAuthenticated();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [cartProducts, setCartProducts] = useState<ProductApiResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1FormValues | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Fetch user profile directly using UserApi
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userIsAuthenticated) {
        setProfileLoading(false);
        return;
      }

      try {
        const { UserApi } = await import("@/lib/api/user");
        const response = await UserApi.getProfile();

        console.log("Profile fetched:", response);

        if (response.success && response.data) {
          setProfile(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [userIsAuthenticated]);

  const step1Form = useForm<Step1FormValues>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      pickupLocation: "main",
    },
  });

  // Auto-fill form when user profile loads (if authenticated)
  useEffect(() => {
    // Wait for profile to finish loading
    if (profileLoading) {
      console.log("Profile still loading...");
      return;
    }

    if (profile && userIsAuthenticated) {
      const fullName = `${profile.firstName || ""} ${
        profile.lastName || ""
      }`.trim();

      console.log("✅ Auto-filling checkout form:", {
        fullName,
        email: profile.email,
        phone: profile.phone,
      });

      // Use reset to update all values at once
      step1Form.reset({
        name: fullName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        pickupLocation: "main",
      });
    } else {
      console.log("❌ Cannot auto-fill:", {
        isAuthenticated: userIsAuthenticated,
        hasProfile: !!profile,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, userIsAuthenticated, profileLoading]);

  const step2Form = useForm<Step2FormValues>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      paymentMethod: "cod",
      cardNumber: "",
      cardExpiry: "",
      cardCvc: "",
    },
  });

  // Handle Step 1 submission (go to Step 2)
  const onStep1Submit = (data: Step1FormValues) => {
    setStep1Data(data);
    setCurrentStep(2);
  };

  // Handle Step 2 submission (complete order)
  const onStep2Submit = async (data: Step2FormValues) => {
    if (!step1Data) return;

    setSubmitting(true);
    try {
      // TODO: Implement actual order submission to backend
      console.log("Order submitted:", {
        ...step1Data,
        ...data,
        items,
        summary,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Clear cart after successful order
      clearCart();

      // Show success modal
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Order submission failed:", err);
      setError("Failed to submit order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      router.back(); // Goes back to previous page (catalog or cart)
    }
  };

  // Fetch product details for cart items
  useEffect(() => {
    const fetchCartProducts = async () => {
      if (items.length === 0) {
        setCartProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { ProductsApi } = await import("@/lib/api/products");
        const productPromises = items.map((item) =>
          ProductsApi.getProductById(item.productId)
        );
        const responses = await Promise.all(productPromises);
        const products = responses
          .filter((response) => response.success && response.data)
          .map((response) => response.data!);

        setCartProducts(products);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load cart items"
        );
        setCartProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCartProducts();
  }, [items]);

  return (
    <>
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:py-8 md:px-6 lg:px-12 xl:px-16">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
            {currentStep === 1 ? "Checkout" : "Payment Method"}
          </h1>
          <div className="lg:flex lg:gap-8 xl:gap-12">
            {/* Left: Form */}
            <div className="lg:w-3/5 w-full space-y-6 sm:space-y-8 mb-8 lg:mb-0">
              {currentStep === 1 ? (
                <>
                  {/* Step 1: Contact & Pickup Information */}
                  <section className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                      Pickup Information
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 mt-2">
                      Your order will be ready for pickup at your selected
                      location.
                    </p>
                  </section>

                  {/* Contact Information Form */}
                  <section className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900">
                        Contact Information
                      </h3>
                      {userIsAuthenticated && profile && (
                        <span className="text-xs sm:text-sm text-green-600 font-medium">
                          ✓ Auto-filled from profile
                        </span>
                      )}
                    </div>
                    <Form {...step1Form}>
                      <div className="space-y-4">
                        <FormField
                          control={step1Form.control}
                          name="name"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                {...field}
                                type="text"
                                placeholder="Juan Dela Cruz"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6A994E] focus:border-[#6A994E] outline-none"
                              />
                              {fieldState.error && (
                                <p className="text-sm text-red-600 mt-1">
                                  {fieldState.error.message}
                                </p>
                              )}
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={step1Form.control}
                          name="phone"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                {...field}
                                type="tel"
                                placeholder="(+63) 956 955 2808"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6A994E] focus:border-[#6A994E] outline-none"
                              />
                              {fieldState.error && (
                                <p className="text-sm text-red-600 mt-1">
                                  {fieldState.error.message}
                                </p>
                              )}
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={step1Form.control}
                          name="email"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                {...field}
                                type="email"
                                placeholder="juan.delacruz@example.com"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6A994E] focus:border-[#6A994E] outline-none"
                              />
                              {fieldState.error && (
                                <p className="text-sm text-red-600 mt-1">
                                  {fieldState.error.message}
                                </p>
                              )}
                            </FormItem>
                          )}
                        />
                      </div>
                    </Form>
                  </section>

                  {/* Pickup Location Choice */}
                  <section className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900">
                      Choose Pickup Location
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mt-2">
                      Select a convenient pickup location for your order.
                    </p>
                    <div className="mt-4 space-y-4">
                      <Form {...step1Form}>
                        <FormField
                          control={step1Form.control}
                          name="pickupLocation"
                          render={({ field }) => (
                            <FormItem>
                              <label
                                className={`block border-2 rounded-lg p-4 sm:p-5 cursor-pointer transition-colors ${
                                  field.value === "main"
                                    ? "border-[#1E392A] bg-[#1E392A]/5"
                                    : "border-gray-300 hover:border-gray-400"
                                }`}
                              >
                                <input
                                  type="radio"
                                  value="main"
                                  checked={field.value === "main"}
                                  onChange={() => field.onChange("main")}
                                  className="sr-only"
                                />
                                <div className="flex justify-between items-start mb-3">
                                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                                    MASH Main Pickup Center
                                  </h4>
                                </div>
                                <div className="text-gray-700 space-y-1 text-sm sm:text-base">
                                  <p className="font-medium">
                                    Contact: (+63) 956 955 2808
                                  </p>
                                  <p>
                                    Brgy 176-D, Bagong Silang, Caloocan City
                                    METRO MANILA 1428
                                  </p>
                                  <div className="mt-2">
                                    <p className="font-medium text-gray-700">
                                      Operating Hours
                                    </p>
                                    <p>Monday - Saturday: 9:00 AM - 6:00 PM</p>
                                  </div>
                                </div>
                              </label>
                              <label
                                className={`mt-4 block border-2 rounded-lg p-4 sm:p-5 cursor-pointer transition-colors ${
                                  field.value === "bgc"
                                    ? "border-[#1E392A] bg-[#1E392A]/5"
                                    : "border-gray-300 hover:border-gray-400"
                                }`}
                              >
                                <input
                                  type="radio"
                                  value="bgc"
                                  checked={field.value === "bgc"}
                                  onChange={() => field.onChange("bgc")}
                                  className="sr-only"
                                />
                                <div className="flex justify-between items-start mb-3">
                                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                                    MASH BGC Pickup Point
                                  </h4>
                                </div>
                                <div className="text-gray-700 space-y-1 text-sm sm:text-base">
                                  <p className="font-medium">
                                    Contact: (+63) 917 123 4567
                                  </p>
                                  <p>
                                    5th Avenue, Bonifacio Global City, Taguig
                                    METRO MANILA 1634
                                  </p>
                                  <div className="mt-2">
                                    <p className="font-medium text-gray-700">
                                      Operating Hours
                                    </p>
                                    <p>Monday - Sunday: 10:00 AM - 8:00 PM</p>
                                  </div>
                                </div>
                              </label>
                            </FormItem>
                          )}
                        />
                      </Form>
                    </div>
                  </section>

                  {/* Step 1 Nav buttons */}
                  <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-stretch sm:items-center gap-3 sm:gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto px-8 py-3 border-gray-300"
                      onClick={handleBack}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-3 bg-[#1E392A] hover:bg-[#1E392A]/90 font-semibold"
                      disabled={cartProducts.length === 0}
                      onClick={step1Form.handleSubmit(onStep1Submit)}
                    >
                      Next
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Step 2: Payment Method */}
                  <section className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                      Payment Method
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600">
                      Select how you would like to pay for your order.
                    </p>

                    <Form {...step2Form}>
                      <FormField
                        control={step2Form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem className="mt-6 space-y-4">
                            {/* Cash on Pickup */}
                            <label
                              className={`block border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                                field.value === "cod"
                                  ? "border-[#1E392A] bg-[#1E392A]/5"
                                  : "border-gray-300 hover:border-gray-400"
                              }`}
                            >
                              <input
                                type="radio"
                                value="cod"
                                checked={field.value === "cod"}
                                onChange={() => field.onChange("cod")}
                                className="sr-only"
                              />
                              <div className="flex items-center gap-3">
                                <div className="font-medium text-gray-900">
                                  Cash on Pickup
                                </div>
                              </div>
                            </label>

                            {/* Gcash */}
                            <label
                              className={`block border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                                field.value === "gcash"
                                  ? "border-[#1E392A] bg-[#1E392A]/5"
                                  : "border-gray-300 hover:border-gray-400"
                              }`}
                            >
                              <input
                                type="radio"
                                value="gcash"
                                checked={field.value === "gcash"}
                                onChange={() => field.onChange("gcash")}
                                className="sr-only"
                              />
                              <div className="flex items-center gap-3">
                                <div className="font-medium text-gray-900">
                                  Gcash
                                </div>
                              </div>
                            </label>

                            {/* Credit/Debit Card */}
                            <label
                              className={`block border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                                field.value === "card"
                                  ? "border-[#1E392A] bg-[#1E392A]/5"
                                  : "border-gray-300 hover:border-gray-400"
                              }`}
                            >
                              <input
                                type="radio"
                                value="card"
                                checked={field.value === "card"}
                                onChange={() => field.onChange("card")}
                                className="sr-only"
                              />
                              <div className="font-medium text-gray-900 mb-4">
                                Credit/Debit Cards and E-wallets
                              </div>

                              {field.value === "card" && (
                                <div className="space-y-3 mt-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Card Number
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="1234 5678 9012 3456"
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6A994E] focus:border-[#6A994E] outline-none"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        MM/YY
                                      </label>
                                      <input
                                        type="text"
                                        placeholder="12/25"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6A994E] focus:border-[#6A994E] outline-none"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        CVC/CVV
                                      </label>
                                      <input
                                        type="text"
                                        placeholder="123"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6A994E] focus:border-[#6A994E] outline-none"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </label>
                          </FormItem>
                        )}
                      />
                    </Form>
                  </section>

                  {/* Step 2 Nav buttons */}
                  <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-stretch sm:items-center gap-3 sm:gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto px-8 py-3 border-gray-300"
                      onClick={handleBack}
                      disabled={submitting}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-3 bg-[#1E392A] hover:bg-[#1E392A]/90 font-semibold"
                      disabled={submitting || cartProducts.length === 0}
                      onClick={step2Form.handleSubmit(onStep2Submit)}
                    >
                      {submitting ? "Processing..." : "Complete Purchase"}
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Right: Summary */}
            <div className="lg:w-2/5 w-full">
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm lg:sticky lg:top-24">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 border-b border-gray-200 pb-3 sm:pb-4">
                  Summary
                </h2>
                <div className="mt-4 space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <LoadingSpinner className="mx-auto mb-4" />
                      <p className="text-gray-600">Loading cart items...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <p className="text-red-600 mb-4">Error: {error}</p>
                      <Button onClick={() => window.location.reload()}>
                        Try Again
                      </Button>
                    </div>
                  ) : cartProducts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">Your cart is empty</p>
                    </div>
                  ) : (
                    cartProducts.map((product) => {
                      const cartItem = items.find(
                        (item) => item.productId === product.id
                      );
                      if (!cartItem) return null;

                      return (
                        <div
                          key={product.id}
                          className="flex items-start gap-3"
                        >
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={56}
                            height={56}
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-md object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm sm:text-base line-clamp-2">
                              {product.name}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">
                              Quantity: {cartItem.quantity}
                            </p>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm sm:text-base flex-shrink-0">
                            ₱{(product.price * cartItem.quantity).toFixed(2)}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="mt-6 border-t border-gray-200 pt-4 space-y-2 text-sm sm:text-base text-gray-700">
                  <div className="flex justify-between">
                    <p>
                      Subtotal (
                      {summary.items.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                      )}
                      )
                    </p>
                    <p className="font-medium">
                      ₱{summary.subtotal.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p>Tax</p>
                    <p className="font-medium">₱{summary.tax.toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-4 border-t border-gray-200 pt-4 flex justify-between items-center font-bold text-gray-900 text-base sm:text-lg">
                  <p>Total Fee</p>
                  <p>₱{summary.total.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Checkout successful!
            </h2>
            <p className="text-gray-600 mb-6">
              The seller(s) will be notified with your new order!
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push("/catalog");
                }}
              >
                Continue Shopping
              </Button>
              <Button
                className="flex-1 bg-[#1E392A] hover:bg-[#1E392A]/90"
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
