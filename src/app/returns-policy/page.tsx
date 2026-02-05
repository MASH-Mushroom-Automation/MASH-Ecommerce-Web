import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Package, Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ReturnsPolicyPage() {
  return (
    <div className="bg-muted min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Returns & Refunds Policy
            </h1>
            <Badge variant="secondary">Updated: January 2025</Badge>
          </div>
          <p className="text-lg text-muted-foreground">
            Your satisfaction is our priority. Learn about our returns and
            refunds policy for fresh mushroom products.
          </p>
        </div>

        <Alert className="mb-6 border-yellow-300 bg-yellow-50">
          <Package className="h-4 w-4 text-yellow-800" />
          <AlertDescription className="text-yellow-800">
            <strong>Important Notice:</strong> Due to the perishable nature of
            fresh mushrooms, we have specific return conditions to ensure
            product quality and food safety.
          </AlertDescription>
        </Alert>

        {/* Content */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-primary">
                Our Freshness Guarantee
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-muted-foreground">
              <p>
                We are committed to delivering the freshest, highest-quality
                mushrooms to your doorstep. All our mushrooms are harvested
                within 24 hours of delivery from our trusted grower partners. If
                you&apos;re not completely satisfied with your purchase,
                we&apos;re here to help.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-green-800">
                  <CheckCircle2 className="h-5 w-5" />
                  Eligible for Return/Refund
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Products arrived damaged, spoiled, or rotten</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Wrong items delivered</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Missing items from your order</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Product quality does not match description</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Packaging was opened or tampered with</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-red-800">
                  <XCircle className="h-5 w-5" />
                  Not Eligible for Return/Refund
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Change of mind or no longer needed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Products stored improperly after delivery</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Damage due to mishandling by customer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Complaints made after 24-hour window</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Products used or partially consumed</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-primary">
                <Clock className="h-5 w-5" />
                Return Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-800 font-semibold mb-2">
                  ⏰ Report Issues Within 24 Hours
                </p>
                <p className="text-sm text-orange-700">
                  You must report any issues with your order within 24 hours of
                  delivery. Claims made after this period cannot be processed.
                </p>
              </div>

              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex gap-4">
                  <div className="bg-accent text-accent-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      Inspect Upon Delivery
                    </h4>
                    <p>
                      Check your order as soon as you receive it. Report any
                      visible damage immediately to the delivery partner.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-accent text-accent-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      Contact Us Within 24 Hours
                    </h4>
                    <p>
                      If you discover any issues, contact our customer service
                      team immediately with photos and your order number.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-accent text-accent-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      Review & Resolution
                    </h4>
                    <p>
                      Our team will review your claim within 4 hours and offer a
                      refund or replacement.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-primary">
                How to Request a Refund or Replacement
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-muted-foreground">
              <p className="mb-4">
                To request a refund or replacement, you&apos;ll need to:
              </p>

              <ol className="list-decimal pl-6 space-y-3">
                <li>
                  <strong>Take clear photos</strong> of the damaged, spoiled, or
                  incorrect items. Include photos of:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>The product showing the issue</li>
                    <li>The packaging/label</li>
                    <li>The overall condition of the delivery box</li>
                  </ul>
                </li>
                <li>
                  <strong>Contact us</strong> via one of these methods:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>
                      Email:{" "}
                      <strong className="text-primary">
                        MASH.Mushroom.Automation@gmail.com
                      </strong>
                    </li>
                    <li>
                      Phone:{" "}
                      <strong className="text-primary">09272533969</strong>
                    </li>
                    <li>
                      Contact Form:{" "}
                      <Link
                        href="/contact"
                        className="text-accent hover:underline"
                      >
                        Visit Contact Page
                      </Link>
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>Provide the following information:</strong>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Your order number</li>
                    <li>Delivery date and time</li>
                    <li>Description of the issue</li>
                    <li>Photos as evidence</li>
                  </ul>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-primary">
                Refund Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Once your return request is approved, you can choose from the
                following options:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-border rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">
                    Full Refund
                  </h4>
                  <p className="text-sm mb-3">
                    Receive a full refund to your original payment method within
                    5-7 business days.
                  </p>
                  <Badge className="bg-green-100 text-green-800">
                    Recommended for major issues
                  </Badge>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">
                    Product Replacement
                  </h4>
                  <p className="text-sm mb-3">
                    Get a replacement of the same product delivered within 2-3
                    business days at no additional cost.
                  </p>
                  <Badge className="bg-blue-100 text-blue-800">
                    Fastest resolution
                  </Badge>
                </div>
              </div>

              <div className="bg-muted border border-border rounded-lg p-4 text-sm">
                <p className="font-semibold text-foreground mb-2">
                  Refund Processing Times:
                </p>
                <ul className="space-y-1">
                  <li>• GCash/Maya: 1-3 business days</li>
                  <li>• Credit/Debit Card: 5-7 business days</li>
                  <li>
                    • Cash on Delivery: Store credit or bank transfer within 5-7
                    business days
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-primary">
                Cancellation Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-muted-foreground">
              <p className="mb-3">
                <strong>Before Order is Processed:</strong> You can cancel your
                order free of charge if it hasn&apos;t been processed yet.
                Contact us immediately after placing the order.
              </p>
              <p className="mb-3">
                <strong>After Order is Processed:</strong> Once your order is
                with our grower partner or out for delivery, cancellation may
                not be possible. Contact our customer service team to check if
                cancellation is still available.
              </p>
              <p>
                <strong>Refund for Cancellations:</strong> Approved
                cancellations receive a full refund within 5-7 business days.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-primary">
                Special Circumstances
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-muted-foreground">
              <p className="mb-3">
                <strong>Delivery Delays:</strong> If your order is significantly
                delayed beyond the estimated delivery time, you may be eligible
                for a refund or credit. Contact us to discuss options.
              </p>
              <p className="mb-3">
                <strong>Force Majeure:</strong> We are not liable for delays or
                non-delivery caused by events beyond our control (natural
                disasters, severe weather, government restrictions, etc.). We
                will work with you to find the best solution.
              </p>
              <p>
                <strong>Incorrect Orders:</strong> If we sent you the wrong
                items, we&apos;ll send the correct items at no charge and you
                can keep or dispose of the incorrect items.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Mail className="h-8 w-8 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Need Help with a Return?
                  </h3>
                  <p className="text-primary-foreground/80 mb-4">
                    Our customer service team is ready to assist you with any
                    return or refund requests. We respond within 4 hours during
                    business hours.
                  </p>
                  <div className="space-y-2 text-sm mb-4">
                    <p>
                      Email: <strong>MASH.Mushroom.Automation@gmail.com</strong>
                    </p>
                    <p>
                      Phone: <strong>09272533969</strong>
                    </p>
                    <p>
                      Hours: <strong>Monday-Saturday, 9AM-6PM</strong>
                    </p>
                  </div>
                  <Link href="/contact">
                    <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                      Contact Support
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
