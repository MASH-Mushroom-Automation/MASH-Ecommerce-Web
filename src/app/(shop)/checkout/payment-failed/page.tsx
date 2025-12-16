"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { XCircle, RefreshCcw, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");

  const handleRetry = () => {
    // Go back to checkout to retry payment
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="h-12 w-12 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Payment Failed
        </h1>

        <p className="text-muted-foreground mb-6">
          We were unable to process your payment. This could be due to insufficient funds,
          a cancelled transaction, or a temporary issue with the payment provider.
        </p>

        {orderId && (
          <div className="bg-muted/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-1">Order Reference</p>
            <p className="font-mono font-medium text-foreground">
              {orderId.slice(-8).toUpperCase()}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Your order has been saved. You can retry the payment below.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Button onClick={handleRetry} className="w-full">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>

          <Button variant="outline" asChild className="w-full">
            <Link href="/cart">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Cart
            </Link>
          </Button>
        </div>

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Need help?</strong> If the problem persists, please contact our support team
            or try a different payment method.
          </p>
        </div>
      </div>
    </div>
  );
}

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
