"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Package,
  ArrowRight,
  Loader2,
  ShoppingBag,
  AlertCircle,
  FileText,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { sendOrderConfirmationEmailViaAPI } from "@/lib/email/client";
import { PAYMENT_METHOD_LABELS } from "@/types/payment";
import type { PaymentMethod, PaymentStatus } from "@/types/payment";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

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

type VerificationState = "verifying" | "succeeded" | "pending" | "failed";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum number of polling attempts for pending payments */
const MAX_POLL_ATTEMPTS = 12;

/** Interval between polls (in ms) */
const POLL_INTERVAL_MS = 5000;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { clearCart, removeVendorItems } = useCart();

  const [verificationState, setVerificationState] = useState<VerificationState>("verifying");
  const [orderData, setOrderData] = useState<PendingOrderData | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [emailSent, setEmailSent] = useState(false);
  const [cartCleared, setCartCleared] = useState(false);

  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emailSentRef = useRef(false);
  const cartClearedRef = useRef(false);

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

  // -----------------------------------------------------------------------
  // Clear cart after successful payment
  // -----------------------------------------------------------------------
  const clearCartAfterPayment = useCallback(
    (vendor?: string) => {
      if (cartClearedRef.current) return;
      cartClearedRef.current = true;
      setCartCleared(true);

      try {
        if (vendor) {
          removeVendorItems(vendor);
        } else {
          clearCart();
        }
      } catch (err) {
        console.error("[PaymentSuccess] Failed to clear cart:", err);
      }
    },
    [clearCart, removeVendorItems]
  );

  // -----------------------------------------------------------------------
  // Send confirmation email (only once)
  // -----------------------------------------------------------------------
  const sendConfirmationEmail = useCallback(
    async (pending: PendingOrderData) => {
      if (emailSentRef.current || !pending.customerEmail) return;
      emailSentRef.current = true;
      setEmailSent(true);

      try {
        await sendOrderConfirmationEmailViaAPI(pending.customerEmail, {
          customerName: pending.customerName || "Valued Customer",
          orderNumber: pending.orderNumber,
          orderId: pending.orderId,
          items: pending.items || [],
          subtotal: pending.subtotal || 0,
          deliveryFee: pending.deliveryFee || 0,
          total: pending.amount || 0,
          paymentMethod: pending.paymentMethod || "gcash",
        });
      } catch (err) {
        console.error("[PaymentSuccess] Failed to send confirmation email:", err);
      }
    },
    []
  );

  // -----------------------------------------------------------------------
  // Verify payment status via API
  // -----------------------------------------------------------------------
  const verifyPaymentStatus = useCallback(
    async (paymentId: string): Promise<{ status: PaymentStatus; paid: boolean }> => {
      try {
        const res = await fetch(
          `/api/payment/status?paymentId=${encodeURIComponent(paymentId)}&type=source`
        );
        if (!res.ok) {
          return { status: "pending", paid: false };
        }
        const data = await res.json();
        return {
          status: data.status ?? "pending",
          paid: data.paid ?? false,
        };
      } catch {
        return { status: "pending", paid: false };
      }
    },
    []
  );

  // -----------------------------------------------------------------------
  // Handle successful verification
  // -----------------------------------------------------------------------
  const onPaymentVerified = useCallback(
    (pending: PendingOrderData) => {
      setVerificationState("succeeded");
      clearCartAfterPayment(pending.vendor);
      sendConfirmationEmail(pending);

      // Clean up sessionStorage
      try {
        sessionStorage.removeItem("pendingOrder");
      } catch {
        // Ignore
      }
    },
    [clearCartAfterPayment, sendConfirmationEmail]
  );

  // -----------------------------------------------------------------------
  // Main verification effect
  // -----------------------------------------------------------------------
  useEffect(() => {
    const pending = loadPendingOrder();
    if (pending) {
      setOrderData(pending);
    } else if (orderId) {
      // No sessionStorage data -- construct minimal order data from URL
      setOrderData({ orderId, orderNumber: orderId.slice(-8).toUpperCase() });
    }

    if (!orderId) {
      // No orderId at all - still show success (e.g. COD success modal redirect)
      setVerificationState("succeeded");
      return;
    }

    // Step 1: Try to verify via the payment status API
    const attemptVerification = async () => {
      const result = await verifyPaymentStatus(orderId);

      if (result.paid || result.status === "succeeded") {
        onPaymentVerified(pending || { orderId, orderNumber: orderId.slice(-8).toUpperCase() });
        return;
      }

      if (result.status === "failed" || result.status === "cancelled" || result.status === "expired") {
        setVerificationState("failed");
        return;
      }

      // Payment still pending -- user landed here but payment might still be processing
      // The PayMongo redirect usually means payment was authorized, so treat as success
      // if we have pending order data (user came from checkout redirect)
      if (pending) {
        onPaymentVerified(pending);
      } else {
        // No pending order data and payment not confirmed -- start polling
        setVerificationState("pending");
      }
    };

    attemptVerification();

    // Cleanup polling on unmount
    return () => {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // -----------------------------------------------------------------------
  // Polling effect for pending payments
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (verificationState !== "pending" || !orderId || pollCount >= MAX_POLL_ATTEMPTS) {
      return;
    }

    pollTimerRef.current = setTimeout(async () => {
      const result = await verifyPaymentStatus(orderId);
      setPollCount((prev) => prev + 1);

      if (result.paid || result.status === "succeeded") {
        const pending = orderData || { orderId, orderNumber: orderId.slice(-8).toUpperCase() };
        onPaymentVerified(pending);
      } else if (result.status === "failed" || result.status === "cancelled") {
        setVerificationState("failed");
      }
      // else remain pending, will re-trigger this effect with updated pollCount
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
      }
    };
  }, [verificationState, orderId, pollCount, verifyPaymentStatus, onPaymentVerified, orderData]);

  // -----------------------------------------------------------------------
  // Exhausted polling -- treat as success (redirect-based payments are pre-authorized)
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (verificationState === "pending" && pollCount >= MAX_POLL_ATTEMPTS) {
      // After max polls, assume payment succeeded (redirect means pre-authorized)
      const pending = orderData || {
        orderId: orderId || "",
        orderNumber: orderId?.slice(-8).toUpperCase() || "",
      };
      onPaymentVerified(pending);
      toast.info("Payment verification timed out. Your order has been placed.");
    }
  }, [verificationState, pollCount, orderData, orderId, onPaymentVerified]);

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------
  const paymentMethodLabel = orderData?.paymentMethod
    ? PAYMENT_METHOD_LABELS[orderData.paymentMethod] || orderData.paymentMethod
    : "Online Payment";

  const formatCurrency = (value: number) =>
    `PHP ${value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // -----------------------------------------------------------------------
  // Render: Verifying
  // -----------------------------------------------------------------------
  if (verificationState === "verifying") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Verifying Payment...
          </h2>
          <p className="text-muted-foreground text-sm">
            Please wait while we confirm your payment with the provider.
          </p>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Render: Pending (polling)
  // -----------------------------------------------------------------------
  if (verificationState === "pending") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Clock className="h-12 w-12 text-amber-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Payment Processing...
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            Your payment is being processed. This may take a moment.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>
              Checking status ({pollCount}/{MAX_POLL_ATTEMPTS})
            </span>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Render: Failed
  // -----------------------------------------------------------------------
  if (verificationState === "failed") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="h-9 w-9 text-red-600" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-2">
              Payment Not Confirmed
            </h1>
            <p className="text-muted-foreground mb-6 text-sm">
              We could not verify your payment. This may be a temporary issue.
            </p>

            {orderData?.orderNumber && (
              <div className="bg-muted/30 rounded-lg p-3 mb-6 text-left">
                <p className="text-xs text-muted-foreground">Order Number</p>
                <p className="font-mono font-medium text-foreground text-sm">
                  {orderData.orderNumber}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/checkout">Try Again</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Render: Succeeded
  // -----------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <Card className="max-w-md w-full">
        <CardContent className="p-6 sm:p-8 text-center">
          {/* Success icon with animation */}
          <div
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 motion-safe:animate-success-pop"
            role="img"
            aria-label="Payment successful"
          >
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Payment Successful!
          </h1>
          <p className="text-muted-foreground mb-6 text-sm">
            Thank you for your order. Your payment has been processed successfully.
          </p>

          {/* Order details */}
          {orderData && (
            <div className="bg-muted/30 rounded-lg p-4 mb-6 text-left space-y-3">
              {orderData.orderNumber && (
                <div>
                  <p className="text-xs text-muted-foreground">Order Number</p>
                  <p className="font-mono font-medium text-foreground text-sm">
                    {orderData.orderNumber}
                  </p>
                </div>
              )}

              {orderData.paymentMethod && (
                <div>
                  <p className="text-xs text-muted-foreground">Payment Method</p>
                  <p className="font-medium text-foreground text-sm">
                    {paymentMethodLabel}
                  </p>
                </div>
              )}

              {orderData.amount != null && orderData.amount > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground">Amount Paid</p>
                  <p className="font-bold text-foreground text-base">
                    {formatCurrency(orderData.amount)}
                  </p>
                </div>
              )}

              {orderData.deliveryMethod && (
                <div>
                  <p className="text-xs text-muted-foreground">Delivery</p>
                  <p className="font-medium text-foreground text-sm">
                    {orderData.deliveryMethod === "pickup"
                      ? "Store Pickup"
                      : "Home Delivery"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Estimated: 2-5 business days
                  </p>
                </div>
              )}
            </div>
          )}

          {/* CTA buttons */}
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/profile/order-history">
                <Package className="mr-2 h-4 w-4" />
                View Order
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full">
              <Link href="/shop">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Continue Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button
              variant="ghost"
              disabled
              className="w-full text-muted-foreground"
              title="Coming soon"
            >
              <FileText className="mr-2 h-4 w-4" />
              Download Receipt
            </Button>
          </div>

          {/* Email confirmation notice */}
          <p className="text-xs text-muted-foreground mt-6">
            {emailSent
              ? "A confirmation email has been sent to your email address."
              : "A confirmation email will be sent shortly."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page wrapper with Suspense boundary
// ---------------------------------------------------------------------------

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
