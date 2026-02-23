import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Package, MapPin, Clock, Shield } from "lucide-react";

export default function ShippingInfoPage() {
  return (
    <div className="bg-muted min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Shipping Information
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Fast, reliable delivery of fresh mushrooms directly from our growers
            to your doorstep.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Truck className="h-8 w-8 text-accent mx-auto mb-2" />
              <h3 className="font-semibold text-foreground mb-1">
                Fast Delivery
              </h3>
              <p className="text-sm text-muted-foreground">2-5 business days</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Package className="h-8 w-8 text-accent mx-auto mb-2" />
              <h3 className="font-semibold text-foreground mb-1">
                Safe Packaging
              </h3>
              <p className="text-sm text-muted-foreground">
                Specially designed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="h-8 w-8 text-accent mx-auto mb-2" />
              <h3 className="font-semibold text-foreground mb-1">
                Freshness Guarantee
              </h3>
              <p className="text-sm text-muted-foreground">100% satisfaction</p>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-primary">
                <Clock className="h-5 w-5" />
                Delivery Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-4 border-accent pl-4">
                <div className="flex items-start gap-3">
                  <Badge className="bg-accent text-accent-foreground mt-1">
                    Metro Manila
                  </Badge>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      2-3 Business Days
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Same-day delivery available for orders placed before 12 PM
                      (selected areas only)
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-accent pl-4">
                <div className="flex items-start gap-3">
                  <Badge className="bg-accent text-accent-foreground mt-1">
                    Luzon
                  </Badge>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      3-5 Business Days
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Covers all provinces in Luzon including Cavite, Laguna,
                      Bulacan, Pampanga, and more
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-border pl-4">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">
                    Visayas & Mindanao
                  </Badge>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      4-7 Business Days
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Currently expanding delivery coverage. Contact us for
                      availability in your area.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 text-sm">
                <p className="text-blue-800 dark:text-blue-300">
                  <strong>Note:</strong> Delivery times are estimates and may
                  vary due to weather conditions, holidays, or unforeseen
                  circumstances. We&apos;ll keep you updated via SMS and email.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-primary">
                <MapPin className="h-5 w-5" />
                Delivery Fees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-muted-foreground">Metro Manila</span>
                  <span className="font-semibold text-foreground">₱50</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-muted-foreground">
                    Nearby Provinces (Cavite, Laguna, Rizal, Bulacan)
                  </span>
                  <span className="font-semibold text-foreground">₱100</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-muted-foreground">
                    Other Luzon Areas
                  </span>
                  <span className="font-semibold text-foreground">
                    ₱150-200
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Visayas & Mindanao
                  </span>
                  <span className="font-semibold text-foreground">
                    Contact Us
                  </span>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4 mt-4">
                <p className="text-green-800 dark:text-green-300 font-semibold mb-1">
                  🎉 FREE DELIVERY on orders ₱500 and above!
                </p>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Automatically applied at checkout for eligible areas.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-primary">
                <Package className="h-5 w-5" />
                Packaging & Handling
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-muted-foreground">
              <p className="mb-3">
                We take special care to ensure your mushrooms arrive fresh and
                in perfect condition:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Breathable Packaging:</strong> Mushrooms are packed in
                  ventilated containers to maintain freshness and prevent
                  moisture buildup
                </li>
                <li>
                  <strong>Insulated Boxes:</strong> For longer deliveries, we
                  use insulated packaging to regulate temperature
                </li>
                <li>
                  <strong>Ice Packs:</strong> Ice packs are included during hot
                  weather to keep products cool
                </li>
                <li>
                  <strong>Secure Wrapping:</strong> Each product is individually
                  wrapped and cushioned to prevent damage during transit
                </li>
                <li>
                  <strong>Eco-Friendly Materials:</strong> We use recyclable and
                  biodegradable packaging materials whenever possible
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-primary">
                Order Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-muted-foreground">
              <p className="mb-3">Stay updated on your order&apos;s journey:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  <strong>Order Confirmation:</strong> You&apos;ll receive an
                  email and SMS immediately after placing your order
                </li>
                <li>
                  <strong>Order Processing:</strong> Our team prepares your
                  order with our grower partners (usually within 24 hours)
                </li>
                <li>
                  <strong>Out for Delivery:</strong> You&apos;ll receive a
                  tracking number and delivery partner details
                </li>
                <li>
                  <strong>Real-Time Tracking:</strong> Track your order in the
                  &quot;Order History&quot; section of your account
                </li>
                <li>
                  <strong>Delivery Attempt:</strong> Our delivery partner will
                  call you 30 minutes before arrival
                </li>
                <li>
                  <strong>Delivered:</strong> Confirm receipt and enjoy your
                  fresh mushrooms!
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-primary">
                Delivery Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-muted-foreground">
              <p className="mb-3">
                <strong>What to expect on delivery day:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Our delivery partner will call you 30 minutes before arrival
                </li>
                <li>Please be available to receive your order personally</li>
                <li>Inspect the package before signing for delivery</li>
                <li>
                  Report any visible damage immediately to the delivery partner
                </li>
                <li>
                  If you&apos;re not available, you can authorize someone to
                  receive on your behalf
                </li>
              </ul>
              <p className="mt-3">
                <strong>Special delivery instructions:</strong> You can add
                delivery notes at checkout (e.g., gate code, building floor,
                safe drop-off location).
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-primary">
                Failed Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-muted-foreground">
              <p className="mb-3">
                If delivery fails due to incorrect address or recipient
                unavailability:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  The delivery partner will leave a calling card with contact
                  details
                </li>
                <li>Re-delivery will be attempted the next business day</li>
                <li>Additional delivery fees may apply for re-delivery</li>
                <li>You can contact us to reschedule delivery</li>
                <li>
                  Orders not claimed within 3 days will be canceled with no
                  refund
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-primary">
                Holidays & Peak Seasons
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-muted-foreground">
              <p>
                During holidays (Christmas, New Year, etc.) and peak seasons,
                delivery times may be extended by 1-2 business days. We
                recommend ordering in advance during these periods. Check our
                website for holiday delivery schedules.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-2">
                Questions About Shipping?
              </h3>
              <p className="text-primary-foreground/80 mb-4">
                Need help with your delivery? Our customer support team is here
                to assist you.
              </p>
              <div className="space-y-1 text-sm">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
