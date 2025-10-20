"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Package, RefreshCw } from "lucide-react";

export default function ReturnsPolicyPage() {
  return (
    <div className="flex flex-col gap-8 px-4 py-10 md:px-8 lg:px-16 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Return & Refund Policy</h1>
        <p className="text-muted-foreground">
          Our freshness guarantee and what to do if you&apos;re not satisfied
        </p>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="size-6 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold">100% Freshness Guarantee</h3>
              <p className="text-sm text-muted-foreground mt-1">
                We stand behind the quality of every mushroom. If you&apos;re
                not completely satisfied, we&apos;ll make it right.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-5" />
            Eligible returns
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">
              You can request a return or refund if:
            </h4>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Mushrooms arrive spoiled, damaged, or not fresh</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Wrong items or quantities delivered</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>
                  Order arrives significantly late (beyond promised window)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Packaging is compromised during delivery</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="size-5" />
            How to request a return
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="space-y-4 text-sm">
            {[
              {
                title: "Contact us within 24 hours",
                desc: "Email support@mash.ph or use the chat feature with your order number",
              },
              {
                title: "Provide photos",
                desc: "Send clear photos of the product and packaging to help us understand the issue",
              },
              {
                title: "Choose your resolution",
                desc: "We'll offer a full refund, replacement order, or store credit—your choice",
              },
              {
                title: "Fast processing",
                desc: "Refunds processed within 3-5 business days. Replacements ship next day",
              },
            ].map((step, i) => (
              <li key={i} className="flex gap-4">
                <Badge
                  variant="secondary"
                  className="size-6 flex items-center justify-center rounded-full shrink-0"
                >
                  {i + 1}
                </Badge>
                <div>
                  <h4 className="font-medium">{step.title}</h4>
                  <p className="text-muted-foreground text-sm mt-1">
                    {step.desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="size-5" />
            Important notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            • <strong>No return shipping needed:</strong> Due to the perishable
            nature, we don&apos;t require you to ship items back. Just provide
            photos for verification.
          </p>
          <p>
            • <strong>Proper storage:</strong> Mushrooms must have been stored
            according to our care instructions (refrigerated, in breathable
            packaging).
          </p>
          <p>
            • <strong>Grower support:</strong> We work directly with growers to
            ensure quality. Your feedback helps us maintain our freshness
            standards.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
