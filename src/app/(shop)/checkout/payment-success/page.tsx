"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendOrderConfirmationEmailViaAPI } from "@/lib/email/client";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [verifying, setVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<"success" | "pending" | "failed">("pending");
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderId) {
        setVerifying(false);
        return;
      }

      try {
        // Check if we have pending order info from checkout
        const pendingOrderStr = sessionStorage.getItem("pendingOrder");
        if (pendingOrderStr) {
          const pendingOrder = JSON.parse(pendingOrderStr);

          // Payment was successful if we reached this page
          setPaymentStatus("success");

          // Send confirmation email
          if (!emailSent && pendingOrder.customerEmail) {
            try {
              await sendOrderConfirmationEmailViaAPI(pendingOrder.customerEmail, {
                customerName: pendingOrder.customerName || "Valued Customer",
                orderNumber: pendingOrder.orderNumber,
                orderId: orderId,
                items: [],
                subtotal: 0,
                deliveryFee: 0,
                total: 0,
                paymentMethod: "gcash",
              });
              setEmailSent(true);
            } catch (error) {
              console.error("Failed to send confirmation email:", error);
            }
          }

          // Clear the pending order from storage
          sessionStorage.removeItem("pendingOrder");
        } else {
          // No pending order info - just show success
          setPaymentStatus("success");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        setPaymentStatus("pending");
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [orderId, emailSent]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Verifying Payment...</h2>
          <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Payment Successful!
        </h1>

        <p className="text-muted-foreground mb-6">
          Thank you for your order. Your payment has been processed successfully.
        </p>

        {orderId && (
          <div className="bg-muted/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-1">Order ID</p>
            <p className="font-mono font-medium text-foreground">
              {orderId.slice(-8).toUpperCase()}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href={orderId ? `/orders/${orderId}` : "/orders"}>
              <Package className="mr-2 h-4 w-4" />
              View Order Details
            </Link>
          </Button>

          <Button variant="outline" asChild className="w-full">
            <Link href="/shop">
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          A confirmation email has been sent to your email address.
        </p>
      </div>
    </div>
  );
}

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
