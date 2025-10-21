"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem } from "@/components/ui/form";

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

  const subtotal: number = 400;
  const tax: number = 12;
  const shipping: number = 0;
  const total: number = subtotal + tax + shipping;

  return (
    <div className="px-4 py-8 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        <div className="mt-8 lg:flex lg:space-x-12">
          {/* Left: Form */}
          <div className="lg:w-3/5 w-full space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-800">
                Shipping Information
              </h2>
              <p className="text-gray-500 mt-1">
                We&apos;ll deliver your order to the address you provide here.
              </p>
            </section>

            {/* Delivery options */}
            <section>
              <h3 className="text-lg font-medium text-gray-800">
                Choose a delivery option
              </h3>
              <p className="text-gray-500 mt-1">
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
                            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              field.value === "delivery"
                                ? "border-[#354A3E] ring-2 ring-[#354A3E]"
                                : "border-gray-200"
                            }`}
                          >
                            <input
                              type="radio"
                              value="delivery"
                              checked={field.value === "delivery"}
                              onChange={() => field.onChange("delivery")}
                              className="sr-only"
                            />
                            Delivery
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
                            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              field.value === "pickup"
                                ? "border-[#354A3E] ring-2 ring-[#354A3E]"
                                : "border-gray-200"
                            }`}
                          >
                            <input
                              type="radio"
                              value="pickup"
                              checked={field.value === "pickup"}
                              onChange={() => field.onChange("pickup")}
                              className="sr-only"
                            />
                            Pick up
                          </label>
                        </FormItem>
                      )}
                    />
                  </div>
                </Form>
              </div>
            </section>

            {/* Address choice */}
            <section>
              <h3 className="text-lg font-medium text-gray-800">
                Choose delivery address
              </h3>
              <p className="text-gray-500 mt-1">
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
                          className={`block border-2 rounded-lg p-5 cursor-pointer ${
                            field.value === "address1"
                              ? "border-[#354A3E]"
                              : "border-gray-200"
                          }`}
                        >
                          <input
                            type="radio"
                            value="address1"
                            checked={field.value === "address1"}
                            onChange={() => field.onChange("address1")}
                            className="sr-only"
                          />
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-gray-800">
                              Use shipping address 1
                            </h4>
                          </div>
                          <div className="mt-3 text-gray-600 space-y-2">
                            <p>Juanito Dela Cruz · (+63) 956 955 2808</p>
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
                          className={`mt-4 block border-2 rounded-lg p-5 cursor-pointer ${
                            field.value === "add_new"
                              ? "border-[#354A3E]"
                              : "border-gray-200"
                          }`}
                        >
                          <input
                            type="radio"
                            value="add_new"
                            checked={field.value === "add_new"}
                            onChange={() => field.onChange("add_new")}
                            className="sr-only"
                          />
                          Add a new address
                        </label>
                      </FormItem>
                    )}
                  />
                </Form>
              </div>
            </section>

            {/* Nav buttons */}
            <div className="mt-2 flex flex-col sm:flex-row sm:justify-between items-center gap-4">
              <Button variant="outline" className="w-full sm:w-auto">
                Back
              </Button>
              <Button className="w-full sm:w-auto bg-[#354A3E] hover:bg-[#2A3A31]">
                Next
              </Button>
            </div>

            {/* Footer links */}
            <div className="mt-6 flex justify-center gap-6 text-sm text-gray-500">
              <a className="hover:underline" href="#">
                Refund Policy
              </a>
              <a className="hover:underline" href="#">
                Shipping Policy
              </a>
              <a className="hover:underline" href="#">
                Privacy Policy
              </a>
              <a className="hover:underline" href="#">
                Terms of Service
              </a>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="lg:w-2/5 w-full mt-10 lg:mt-0">
            <div className="bg-[#F5F2EC] rounded-lg p-6 lg:sticky lg:top-28">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-4">
                Summary
              </h2>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Image
                      src="/placeholder.png"
                      alt="White Oyster Mushrooms"
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-md object-cover"
                    />
                    <div className="ml-4">
                      <p className="font-medium text-gray-800">
                        Fresh White Oyster Mushrooms
                      </p>
                      <p className="text-sm text-gray-500">Quantity: 1</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">₱120.00</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Image
                      src="/placeholder.png"
                      alt="Pink Oyster Mushrooms"
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-md object-cover"
                    />
                    <div className="ml-4">
                      <p className="font-medium text-gray-800">
                        Vibrant Pink Oyster Mushrooms
                      </p>
                      <p className="text-sm text-gray-500">Quantity: 2</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">₱280.00</p>
                </div>
              </div>

              <div className="mt-6 border-t pt-4 space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <p>Subtotal (5)</p>
                  <p>₱{subtotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                  <p>Tax</p>
                  <p>₱{tax.toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                  <p>Shipping Fee</p>
                  <p>{shipping === 0 ? "Free" : `₱${shipping.toFixed(2)}`}</p>
                </div>
              </div>
              <div className="mt-4 border-t pt-4 flex justify-between items-center font-bold text-gray-900 text-lg">
                <p>Total Fee</p>
                <p>₱{total.toFixed(2)}</p>
              </div>
              <Button className="mt-6 w-full bg-[#354A3E] hover:bg-[#2A3A31]">
                Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
