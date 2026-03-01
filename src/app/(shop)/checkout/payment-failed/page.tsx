"use client";

import { Suspense, useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  XCircle,
  RefreshCcw,
  CreditCard,
  HelpCircle,
  MessageCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PAYMENT_METHOD_LABELS } from "@/types/payment";
import type { PaymentMethod } from "@/types/payment";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PendingOrderData {
  orderId: string;
  orderNumber: string;
  customerEmail?: string;
  customerName?: string;
  paymentMethod?: PaymentMethod;
  vendor?: string;
  timestamp?: number;
  amount?: number;
  subtotal?: number;
  deliveryFee?: number;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  deliveryMethod?: string;
}

// ---------------------------------------------------------------------------
// FAQ Data
// ---------------------------------------------------------------------------

const PAYMENT_FAQ = [
  {
    question: "Why was my payment declined?",
    answer:
      "Common reasons include insufficient balance, daily transaction limits, " +
      "expired card details, or a temporary issue with the payment provider. " +
      "Please check your account and try again.",
  },
  {
    question: "Will I be charged if the payment failed?",
    answer:
      "No. If your payment was not successful, no amount will be deducted " +
      "from your account. If you see a pending charge, it will be reversed " +
      "automatically within 1-3 business days.",
  },
  {
    question: "Can I use a different payment method?",
    answer:
      "Yes! Click 'Choose Different Method' below to go back to checkout " +
      "and select another payment option such as GCash, GrabPay, Card, " +
      "PayMaya, or Cash on Delivery.",
  },
  {
    question: "My payment was deducted but the order still shows failed.",
    answer:
      "This can happen occasionally due to network delays. Please wait " +
      "15-30 minutes and check your order history. If the issue persists, " +
      "contact our support team with your order number for assistance.",
  },
];

// ---------------------------------------------------------------------------
// Sub-Components
// ---------------------------------------------------------------------------

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-border rounded-lg">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted/30 transition-colors duration-200 rounded-lg"
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-3 text-sm text-muted-foreground leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const errorParam = searchParams.get("error");

  // -----------------------------------------------------------------------
  // Load pending order from sessionStorage
  // -----------------------------------------------------------------------
  const loadPendingOrder = useCallback((): PendingOrderData | null => {
    try {
      const raw = sessionStorage.getItem("pendingOrder");
      if (!raw) return null;
      return JSON.parse(raw) as PendingOrderData;
    } catch {
      return null;
    }
  }, []);

  const pendingOrder = loadPendingOrder();

  // Resolve display values from pending order or search params
  const orderNumber =
    pendingOrder?.orderNumber ||
    (orderId ? orderId.slice(-8).toUpperCase() : null);

  const paymentMethodLabel = pendingOrder?.paymentMethod
    ? PAYMENT_METHOD_LABELS[pendingOrder.paymentMethod] || pendingOrder.paymentMethod
    : null;

  const amount = pendingOrder?.amount;

  // Build the failure reason string
  const failureReason =
    errorParam ||
    "The payment could not be completed. This may be due to insufficient funds, a cancelled transaction, or a temporary issue with the payment provider.";

  const formatCurrency = (value: number) =>
    `PHP ${value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Build retry URL that preserves the order context
  const retryUrl = orderId ? `/checkout?orderId=${encodeURIComponent(orderId)}` : "/checkout";

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-6">
        {/* Main Error Card */}
        <Card>
          <CardContent className="p-6 sm:p-8 text-center">
            {/* Error icon */}
            <div
              className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
              role="img"
              aria-label="Payment failed"
            >
              <XCircle className="h-12 w-12 text-red-600" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-2">
              Payment Was Not Successful
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              We are sorry -- your payment could not be processed. Do not worry, your order
              information has been saved and you can try again.
            </p>

            {/* Failure reason */}
            <div
              className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left"
              role="alert"
            >
              <p className="text-sm text-red-800 font-medium mb-1">What happened</p>
              <p className="text-sm text-red-700">{failureReason}</p>
            </div>

            {/* Order details (if available) */}
            {(orderNumber || paymentMethodLabel || amount) && (
              <div className="bg-muted/30 rounded-lg p-4 mb-6 text-left space-y-3">
                {orderNumber && (
                  <div>
                    <p className="text-xs text-muted-foreground">Order Number</p>
                    <p className="font-mono font-medium text-foreground text-sm">
                      {orderNumber}
                    </p>
                  </div>
                )}

                {paymentMethodLabel && (
                  <div>
                    <p className="text-xs text-muted-foreground">Payment Method Attempted</p>
                    <p className="font-medium text-foreground text-sm">
                      {paymentMethodLabel}
                    </p>
                  </div>
                )}

                {amount != null && amount > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="font-bold text-foreground text-base">
                      {formatCurrency(amount)}
                    </p>
                  </div>
                )}

                <p className="text-xs text-muted-foreground pt-1">
                  Your order has been saved. No payment has been charged.
                </p>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href={retryUrl}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Try Again
                </Link>
              </Button>

              <Button variant="outline" asChild className="w-full">
                <Link href={retryUrl}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Choose Different Method
                </Link>
              </Button>

              <Button variant="ghost" asChild className="w-full">
                <Link href="/contact">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact Support
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* FAQ / Help Section */}
        <Card>
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">
                Common Payment Issues
              </h2>
            </div>

            <div className="space-y-2">
              {PAYMENT_FAQ.map((faq) => (
                <FAQItem
                  key={faq.question}
                  question={faq.question}
                  answer={faq.answer}
                />
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Still having trouble?{" "}
                <Link
                  href="/contact"
                  className="text-primary hover:underline font-medium"
                >
                  Get in touch with our support team
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page wrapper with Suspense boundary
// ---------------------------------------------------------------------------

export default function PaymentFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <PaymentFailedContent />
    </Suspense>
  );
}
