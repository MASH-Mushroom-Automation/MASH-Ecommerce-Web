"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { useCart } from "@/hooks/useCart";
import { useProducts } from "@/hooks/useProducts";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useState, useEffect } from "react";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email(),
  address: z.string().min(4, "Address is required"),
  city: z.string().min(2),
  postal: z.string().min(4),
  delivery: z.enum(["delivery", "pickup"]),
  addressChoice: z.enum(["address1", "add_new"]),
});

type FormValues = z.infer<typeof schema>;

export default function CheckoutPage() {
  const { items, summary, loading: cartLoading } = useCart();
  const [cartProducts, setCartProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      address: "",
      city: "",
      postal: "",
      delivery: "delivery",
      addressChoice: "address1",
    },
  });

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
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:py-8 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
          Checkout
        </h1>
        <div className="lg:flex lg:gap-8 xl:gap-12">
          {/* Left: Form */}
          <div className="lg:w-3/5 w-full space-y-6 sm:space-y-8 mb-8 lg:mb-0">
            <section className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Shipping Information
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mt-2">
                We&apos;ll deliver your order to the address you provide here.
              </p>
            </section>

            {/* Delivery options */}
            <section className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">
                Choose a delivery option
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mt-2">
                Select whether you&apos;d like your order delivered to your
                doorstep or picked up in-store.
              </p>
              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                <Form {...form}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="delivery"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <label
                            className={`flex items-center justify-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              field.value === "delivery"
                                ? "border-[#1E392A] bg-[#1E392A]/5"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                          >
                            <input
                              type="radio"
                              value="delivery"
                              checked={field.value === "delivery"}
                              onChange={() => field.onChange("delivery")}
                              className="sr-only"
                            />
                            <span className="text-sm sm:text-base font-medium">
                              Delivery
                            </span>
                          </label>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="delivery"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <label
                            className={`flex items-center justify-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              field.value === "pickup"
                                ? "border-[#1E392A] bg-[#1E392A]/5"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                          >
                            <input
                              type="radio"
                              value="pickup"
                              checked={field.value === "pickup"}
                              onChange={() => field.onChange("pickup")}
                              className="sr-only"
                            />
                            <span className="text-sm sm:text-base font-medium">
                              Pick up
                            </span>
                          </label>
                        </FormItem>
                      )}
                    />
                  </div>
                </Form>
              </div>
            </section>

            {/* Address choice */}
            <section className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">
                Choose delivery address
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mt-2">
                Please note that the discount will not be automatically applied
                upon checkout.
              </p>
              <div className="mt-4 space-y-4">
                <Form {...form}>
                  <FormField
                    control={form.control}
                    name="addressChoice"
                    render={({ field }) => (
                      <FormItem>
                        <label
                          className={`block border-2 rounded-lg p-4 sm:p-5 cursor-pointer transition-colors ${
                            field.value === "address1"
                              ? "border-[#1E392A] bg-[#1E392A]/5"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          <input
                            type="radio"
                            value="address1"
                            checked={field.value === "address1"}
                            onChange={() => field.onChange("address1")}
                            className="sr-only"
                          />
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                              Use shipping address 1
                            </h4>
                          </div>
                          <div className="text-gray-700 space-y-1 text-sm sm:text-base">
                            <p className="font-medium">
                              Juanito Dela Cruz · (+63) 956 955 2808
                            </p>
                            <p>
                              Brgy 176-D, Bagong Silang, Caloocan City METRO
                              MANILA 1428
                            </p>
                            <div>
                              <p className="font-medium text-gray-700">
                                Additional Description
                              </p>
                              <p>None</p>
                            </div>
                          </div>
                        </label>
                        <label
                          className={`mt-4 block border-2 rounded-lg p-4 sm:p-5 cursor-pointer transition-colors ${
                            field.value === "add_new"
                              ? "border-[#1E392A] bg-[#1E392A]/5"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          <input
                            type="radio"
                            value="add_new"
                            checked={field.value === "add_new"}
                            onChange={() => field.onChange("add_new")}
                            className="sr-only"
                          />
                          <span className="text-sm sm:text-base font-medium">
                            Add a new address
                          </span>
                        </label>
                      </FormItem>
                    )}
                  />
                </Form>
              </div>
            </section>

            {/* Nav buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-stretch sm:items-center gap-3 sm:gap-4">
              <Button
                variant="outline"
                className="w-full sm:w-auto px-8 py-3 border-gray-300"
              >
                Back
              </Button>
              <Button className="w-full sm:w-auto px-8 py-3 bg-[#1E392A] hover:bg-[#1E392A]/90 font-semibold">
                Next
              </Button>
            </div>

            {/* Footer links */}
            <div className="mt-6 flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600">
              <a className="hover:underline hover:text-gray-900" href="#">
                Refund Policy
              </a>
              <a className="hover:underline hover:text-gray-900" href="#">
                Shipping Policy
              </a>
              <a className="hover:underline hover:text-gray-900" href="#">
                Privacy Policy
              </a>
              <a className="hover:underline hover:text-gray-900" href="#">
                Terms of Service
              </a>
            </div>
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
                      <div key={product.id} className="flex items-start gap-3">
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
                  <p className="font-medium">₱{summary.subtotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                  <p>Tax</p>
                  <p className="font-medium">₱{summary.tax.toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                  <p>Shipping Fee</p>
                  <p className="font-medium text-green-600">
                    {summary.shipping === 0
                      ? "Free"
                      : `₱${summary.shipping.toFixed(2)}`}
                  </p>
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
  );
}
