"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";

export default function PrivacyPolicyPage() {

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" aria-hidden onClick={close} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Privacy Policy"
        className="relative z-10 max-w-4xl w-full mx-4 bg-background rounded-lg shadow-lg overflow-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Privacy Policy</h1>
              <div className="mt-1">
                <Badge variant="secondary">Last Updated: January 2025</Badge>
              </div>
            </div>

            <div>
              <Button variant="ghost" size="sm" onClick={close} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Your privacy is important to us. This policy outlines how MASH
            collects, uses, and protects your personal information.
          </p>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary">1. Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                <p className="mb-3">We collect information that you provide directly to us, including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Personal Information:</strong> Name, email address, phone number, and delivery address when you create an account or place an order.
                  </li>
                  <li>
                    <strong>Payment Information:</strong> Payment method details (processed securely through third-party payment providers; we do not store complete credit card numbers).
                  </li>
                  <li>
                    <strong>Order History:</strong> Details of products purchased, order dates, and delivery information.
                  </li>
                  <li>
                    <strong>Communication Data:</strong> Records of your interactions with our customer service team.
                  </li>
                  <li>
                    <strong>Usage Data:</strong> Information about how you use our website, including pages visited, products viewed, and browsing behavior.
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary">2. How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                <p className="mb-3">We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Process and fulfill your orders, including delivery and payment processing</li>
                  <li>Communicate with you about your orders, account, and customer service inquiries</li>
                  <li>Send you promotional emails and marketing communications (with your consent)</li>
                  <li>Improve our website, products, and services based on user feedback and behavior</li>
                  <li>Detect and prevent fraud, security issues, and technical problems</li>
                  <li>Comply with legal obligations and enforce our terms of service</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary">3. Information Sharing and Disclosure</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                <p className="mb-3">We may share your information in the following circumstances:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Service Providers:</strong> With trusted third-party service providers who assist with order fulfillment, payment processing, delivery, and customer support.
                  </li>
                  <li>
                    <strong>Grower Partners:</strong> Basic order information (name, delivery address) is shared with our mushroom growers to facilitate product delivery.
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> When required by law, court order, or government regulation.
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new owner.
                  </li>
                </ul>
                <p className="mt-3"><strong>We never sell your personal information to third parties for marketing purposes.</strong></p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary">4. Cookies and Tracking Technologies</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                <p className="mb-3">We use cookies and similar tracking technologies to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Remember your preferences and settings</li>
                  <li>Keep you logged in to your account</li>
                  <li>Analyze website traffic and user behavior</li>
                  <li>Provide personalized content and recommendations</li>
                </ul>
                <p className="mt-3">You can control cookies through your browser settings. However, disabling cookies may affect your ability to use certain features of our website.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary">5. Data Security</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                <p>We implement industry-standard security measures to protect your personal information, including:</p>
                <ul className="list-disc pl-6 space-y-2 my-3">
                  <li>SSL/TLS encryption for data transmission</li>
                  <li>Secure servers with restricted access</li>
                  <li>Regular security audits and updates</li>
                  <li>Employee training on data protection practices</li>
                </ul>
                <p>While we strive to protect your information, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security but are committed to protecting your data.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary">6. Your Rights and Choices</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                <p className="mb-3">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                  <li><strong>Update:</strong> Correct or update your personal information through your account settings</li>
                  <li><strong>Delete:</strong> Request deletion of your account and personal data (subject to legal retention requirements)</li>
                  <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails at any time using the link in our emails</li>
                  <li><strong>Object:</strong> Object to certain processing of your data, such as marketing communications</li>
                </ul>
                <p className="mt-3">To exercise these rights, contact us at <strong className="text-primary">privacy@mash.ph</strong> or through your account settings.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary">7. Data Retention</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                <p>We retain your personal information for as long as necessary to:</p>
                <ul className="list-disc pl-6 space-y-2 my-3">
                  <li>Provide our services and maintain your account</li>
                  <li>Comply with legal, accounting, or reporting requirements</li>
                  <li>Resolve disputes and enforce our agreements</li>
                </ul>
                <p>After deletion, we may retain anonymized data for analytics and business purposes.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary">8. Children&apos;s Privacy</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                <p>Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary">9. Changes to This Policy</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the "Last Updated" date. Your continued use of our services after changes indicates your acceptance of the updated policy.</p>
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Questions About Privacy?</h3>
                <p className="text-primary-foreground/80 mb-4">If you have questions or concerns about our privacy practices, please contact our Data Protection Officer:</p>
                <div className="space-y-1 text-sm">
                  <p>Email: <strong>privacy@mash.ph</strong></p>
                  <p>Phone: <strong>+63 917 123 4567</strong></p>
                  <p>Address: <strong>Quezon City, Metro Manila, Philippines</strong></p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
