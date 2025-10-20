"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Wallet, Banknote } from "lucide-react";

const PAYMENT_METHODS = [
  {
    id: "gcash",
    name: "GCash",
    icon: Wallet,
    description: "Pay via GCash mobile wallet",
  },
  {
    id: "bank",
    name: "Bank Transfer",
    icon: CreditCard,
    description: "Online or OTC bank transfer",
  },
  {
    id: "cod",
    name: "Cash on Delivery",
    icon: Banknote,
    description: "Pay when you receive",
  },
];

export default function CheckoutPaymentPage() {
  const [selected, setSelected] = useState("gcash");

  const handleSubmit = () => {
    // Simulate payment processing
    window.location.href = "/checkout/success";
  };

  return (
    <div className="flex flex-col gap-8 px-4 py-8 md:px-8 lg:px-16 max-w-3xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <p className="text-sm text-muted-foreground">
          Step 2 of 3: Payment method
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select payment method</CardTitle>
          <CardDescription>
            Choose how you&apos;d like to pay for your order
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              return (
                <Card
                  key={method.id}
                  className={`cursor-pointer transition-all ${
                    selected === method.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelected(method.id)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <input
                      type="radio"
                      checked={selected === method.id}
                      onChange={() => setSelected(method.id)}
                      className="size-4"
                    />
                    <Icon className="size-6 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">{method.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {method.description}
                      </p>
                    </div>
                    {method.id === "cod" && (
                      <Badge variant="secondary">+₱20 fee</Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-base">Order total</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₱640.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <Badge variant="secondary">Free</Badge>
              </div>
              {selected === "cod" && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">COD fee</span>
                  <span>₱20.00</span>
                </div>
              )}
              <div className="border-t pt-2 flex items-center justify-between font-semibold">
                <span>Total</span>
                <span>₱{selected === "cod" ? "660.00" : "640.00"}</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" asChild>
              <a href="/checkout/shipping">Back</a>
            </Button>
            <Button className="flex-1" onClick={handleSubmit}>
              Place order
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
