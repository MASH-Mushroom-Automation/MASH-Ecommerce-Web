"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        aria-hidden
        onClick={close}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Terms of Service"
        className="relative z-10 max-w-4xl w-full mx-4 bg-background rounded-lg shadow-lg overflow-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Terms of Service
              </h1>
              <div className="mt-1">
                <Badge variant="secondary">Effective: January 2025</Badge>
              </div>
            </div>

            <div>
              <Button variant="ghost" size="sm" onClick={close} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Please read these terms carefully before using MASH e-commerce
            platform.
          </p>

          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              By accessing and using MASH&apos;s website and services, you agree
              to be bound by these Terms of Service. If you do not agree, please
              do not use our services.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary">
                  1. Acceptance of Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                <p>
                  These Terms of Service (&quot;Terms&quot;) govern your access to
                  and use of MASH&apos;s website, mobile applications, and related
                  services (collectively, the &quot;Services&quot;). By creating
                  an account, placing an order, or accessing our Services, you
                  agree to comply with these Terms and all applicable laws and
                  regulations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary">
                  2. Eligibility
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                <p className="mb-3">To use our Services, you must:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Be at least 18 years of age or have parental/guardian consent
                  </li>
                  <li>Have the legal capacity to enter into binding contracts</li>
                  <li>Provide accurate and complete registration information</li>
                  <li>
                    Not be prohibited from using our Services under Philippine law
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary">
                  3. User Accounts
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                <p className="mb-3">
                  <strong>Account Creation:</strong> You must create an account to
                  access certain features and place orders. You are responsible
                  for:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Maintaining the confidentiality of your account credentials
                  </li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized access</li>
                  <li>
                    Ensuring your account information is accurate and up-to-date
                  </li>
                </ul>
                <p className="mt-3">
                  <strong>Account Termination:</strong> We reserve the right to
                  suspend or terminate your account if you violate these Terms or
                  engage in fraudulent, abusive, or illegal activities.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary">
                  4. Orders and Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                <p className="mb-3">
                  <strong>Order Placement:</strong> When you place an order, you
                  are making an offer to purchase products. We reserve the right
                  to accept or reject any order for any reason, including product
                  availability, pricing errors, or suspected fraud.
                </p>
                <p className="mb-3">
                  <strong>Pricing:</strong> All prices are in Philippine Pesos (₱)
                  and include applicable taxes. Prices are subject to change
                  without notice. We strive for accuracy but are not responsible
                  for typographical errors.
                </p>
                <p className="mb-3">
                  <strong>Payment:</strong> Payment is due at the time of order
                  placement (except for Cash on Delivery). We accept:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>GCash and Maya (e-wallet)</li>
                  <li>Credit/Debit cards (Visa, Mastercard)</li>
                  <li>Cash on Delivery (COD)</li>
                </ul>
                <p className="mt-3">
                  <strong>Order Confirmation:</strong> You will receive an email
                  confirmation once your order is successfully placed. This
                  confirmation does not guarantee acceptance of your order.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary">
                  5. Delivery
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                <p className="mb-3">
                  <strong>Delivery Times:</strong> Estimated delivery times are
                  provided at checkout and may vary based on location and product
                  availability. We are not liable for delays caused by
                  circumstances beyond our control (e.g., weather, traffic, force
                  majeure).
                </p>
                <p className="mb-3">
                  <strong>Delivery Address:</strong> You are responsible for
                  providing an accurate delivery address. If delivery fails due to
                  incorrect address information, additional fees may apply for
                  re-delivery.
                </p>
                <p>
                  <strong>Inspection:</strong> Please inspect products upon
                  delivery. Report any damage or discrepancies within 24 hours.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary">
                  6. Returns and Refunds
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                <p className="mb-3">
                  Due to the perishable nature of fresh mushrooms, we cannot
                  accept returns for change of mind. However, we offer refunds or
                  replacements if:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Products are damaged, spoiled, or defective upon delivery
                  </li>
                  <li>You receive incorrect items</li>
                  <li>Products do not match the description</li>
                </ul>
                <p className="mt-3">
                  <strong>Refund Process:</strong> Contact us within 24 hours of
                  delivery with photos and your order number. Approved refunds are
                  processed within 5-7 business days to your original payment
                  method.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary">
                  7. Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                <p>
                  We strive to provide accurate product descriptions, images, and
                  information. However, we do not guarantee that descriptions are
                  error-free or complete. Product colors may vary due to monitor
                  settings. If a product is not as described, your remedy is
                  limited to return and refund in accordance with our Returns
                  Policy.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary">
                  8. Intellectual Property
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                <p className="mb-3">
                  All content on MASH, including text, graphics, logos, images,
                  and software, is the property of MASH or its licensors and is
                  protected by intellectual property laws. You may not:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Copy, reproduce, or distribute our content without permission
                  </li>
                  <li>Use our trademarks or branding without authorization</li>
                  <li>Reverse engineer or attempt to access our source code</li>
                  <li>
                    Use automated systems (bots, scrapers) to access our Services
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary">
                  9. Prohibited Conduct
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                <p className="mb-3">You agree not to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Violate any laws or regulations</li>
                  <li>Provide false or misleading information</li>
                  <li>Impersonate another person or entity</li>
                  <li>Interfere with or disrupt our Services</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Use our Services for fraudulent purposes</li>
                  <li>Harass, abuse, or harm other users or our staff</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary">
                  10. Limitation of Liability
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                <p>
                  To the fullest extent permitted by law, MASH shall not be liable
                  for any indirect, incidental, special, consequential, or
                  punitive damages, including loss of profits, data, or goodwill,
                  arising from your use of our Services. Our total liability shall
                  not exceed the amount you paid for the order in question.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary">
                  11. Disclaimer of Warranties
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                <p>
                  Our Services are provided &quot;as is&quot; and &quot;as
                  available&quot; without warranties of any kind, either express
                  or implied. We do not guarantee uninterrupted, timely, secure,
                  or error-free operation. You use our Services at your own risk.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary">
                  12. Dispute Resolution
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                <p className="mb-3">
                  <strong>Informal Resolution:</strong> If you have a dispute,
                  please contact our customer service first. We will work in good
                  faith to resolve the issue.
                </p>
                <p>
                  <strong>Governing Law:</strong> These Terms are governed by the
                  laws of the Republic of the Philippines. Any disputes shall be
                  subject to the exclusive jurisdiction of the courts of Metro
                  Manila.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary">
                  13. Changes to Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                <p>
                  We reserve the right to modify these Terms at any time. Changes
                  will be effective upon posting to our website. Your continued
                  use of our Services after changes constitutes acceptance of the
                  modified Terms. We encourage you to review these Terms
                  periodically.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary">
                  14. Severability
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                <p>
                  If any provision of these Terms is found to be invalid or
                  unenforceable, the remaining provisions shall continue in full
                  force and effect.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Contact Us</h3>
                <p className="text-primary-foreground/80 mb-4">
                  If you have questions about these Terms of Service, please
                  contact us:
                </p>
                <div className="space-y-1 text-sm">
                  <p>
                    Email: <strong>legal@mash.ph</strong>
                  </p>
                  <p>
                    Phone: <strong>+63 917 123 4567</strong>
                  </p>
                  <p>
                    Address: <strong>Quezon City, Metro Manila, Philippines</strong>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
