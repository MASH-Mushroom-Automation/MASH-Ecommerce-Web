"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Package, MapPin } from "lucide-react";

export default function CheckoutSuccessPage() {
  const orderNumber =
    "MASH-" + Math.random().toString(36).substr(2, 9).toUpperCase();

  return (
    <div className="flex flex-col gap-8 px-4 py-8 md:px-8 lg:px-16 max-w-3xl mx-auto">
      <Card className="text-center">
        <CardContent className="pt-12 pb-8 space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <CheckCircle2 className="size-12 text-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Order confirmed!</h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. Your fresh mushrooms are on the way.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
            <span className="text-sm text-muted-foreground">Order number:</span>
            <Badge variant="secondary" className="font-mono">
              {orderNumber}
            </Badge>
          </div>

          <div className="grid gap-4 pt-4 text-left">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="size-4" />
                  Order details
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items</span>
                  <span>3 products</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold">₱640.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment</span>
                  <Badge variant="outline">GCash</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="size-4" />
                  Delivery address
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>Juan Dela Cruz</p>
                <p>123 Mabini Street, San Isidro</p>
                <p>Quezon City, Metro Manila 1100</p>
              </CardContent>
            </Card>
          </div>

          <p className="text-sm text-muted-foreground">
            We&apos;ve sent a confirmation email with tracking details to your
            registered email.
          </p>

          <div className="flex flex-wrap gap-3 justify-center pt-4">
            <Button variant="outline" asChild>
              <Link href="/account/orders">View order history</Link>
            </Button>
            <Button asChild>
              <Link href="/products">Continue shopping</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
