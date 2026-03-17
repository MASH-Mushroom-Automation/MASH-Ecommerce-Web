/**
 * Shared Legal Content Components
 *
 * Single source of truth for Terms of Service and Privacy Policy content.
 * Used by both standalone pages (/terms, /privacy) and the LegalModal component.
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface SectionProps {
  title: string;
  children: React.ReactNode;
  variant?: "default" | "compact";
}

export function LegalSection({ title, children, variant = "default" }: SectionProps) {
  if (variant === "compact") {
    return (
      <Card className="shadow-sm">
        <CardHeader className="py-2 sm:py-3 px-3 sm:px-4">
          <CardTitle className="text-sm sm:text-base text-primary leading-tight">{title}</CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-3 sm:px-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {children}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="prose prose-sm max-w-none text-muted-foreground">
        {children}
      </CardContent>
    </Card>
  );
}

interface LegalContentProps {
  variant?: "default" | "compact";
  showContactCard?: boolean;
}

export function TermsContent({ variant = "default", showContactCard = true }: LegalContentProps) {
  return (
    <div className={variant === "compact" ? "space-y-2 sm:space-y-3" : "space-y-6"}>
      {variant === "compact" && (
        <Alert className="mb-2 sm:mb-4 py-2 sm:py-3">
          <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
          <AlertDescription className="text-xs sm:text-sm leading-relaxed">
            By accessing and using MASH&apos;s website and services, you agree to
            be bound by these Terms of Service. If you do not agree, please do not
            use our services.
          </AlertDescription>
        </Alert>
      )}

      <LegalSection title="1. Acceptance of Terms" variant={variant}>
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your access to and
          use of MASH&apos;s website, mobile applications, and related services
          (collectively, the &quot;Services&quot;). By creating an account,
          placing an order, or accessing our Services, you agree to comply with
          these Terms and all applicable laws and regulations.
        </p>
      </LegalSection>

      <LegalSection title="2. Eligibility" variant={variant}>
        <p className={variant === "compact" ? "mb-2 sm:mb-3" : "mb-3"}>To use our Services, you must:</p>
        <ul className={variant === "compact" ? "list-disc pl-4 sm:pl-5 space-y-0.5 sm:space-y-1" : "list-disc pl-6 space-y-2"}>
          <li>Be at least 18 years of age or have parental/guardian consent</li>
          <li>Have the legal capacity to enter into binding contracts</li>
          <li>Provide accurate and complete registration information</li>
          <li>Not be prohibited from using our Services under Philippine law</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. User Accounts" variant={variant}>
        <p className="mb-3">
          <strong>Account Creation:</strong> You must create an account to
          access certain features and place orders. You are responsible for:
        </p>
        <ul className={variant === "compact" ? "list-disc pl-5 space-y-1" : "list-disc pl-6 space-y-2"}>
          <li>Maintaining the confidentiality of your account credentials</li>
          <li>All activities that occur under your account</li>
          <li>Notifying us immediately of any unauthorized access</li>
          <li>Ensuring your account information is accurate and up-to-date</li>
        </ul>
        <p className="mt-3">
          <strong>Account Termination:</strong> We reserve the right to suspend
          or terminate your account if you violate these Terms or engage in
          fraudulent, abusive, or illegal activities.
        </p>
      </LegalSection>

      <LegalSection title="4. Orders and Payment" variant={variant}>
        <p className="mb-3">
          <strong>Order Placement:</strong> When you place an order, you are
          making an offer to purchase products. We reserve the right to accept
          or reject any order for any reason, including product availability,
          pricing errors, or suspected fraud.
        </p>
        <p className="mb-3">
          <strong>Pricing:</strong> All prices are in Philippine Pesos (₱) and
          include applicable taxes. Prices are subject to change without notice.
          We strive for accuracy but are not responsible for typographical
          errors.
        </p>
        <p className="mb-3">
          <strong>Payment:</strong> Payment is due at the time of order
          placement (except for Cash on Delivery). We accept:
        </p>
        <ul className={variant === "compact" ? "list-disc pl-5 space-y-1" : "list-disc pl-6 space-y-1"}>
          <li>GCash and Maya (e-wallet)</li>
          <li>Cash on Delivery (COD)</li>
        </ul>
        <p className="mt-3">
          <strong>Order Confirmation:</strong> You will receive an email
          confirmation once your order is successfully placed. This confirmation
          does not guarantee acceptance of your order.
        </p>
      </LegalSection>

      <LegalSection title="5. Delivery" variant={variant}>
        <p className="mb-3">
          <strong>Delivery Times:</strong> Estimated delivery times are provided
          at checkout and may vary based on location and product availability.
          We are not liable for delays caused by circumstances beyond our
          control (e.g., weather, traffic, force majeure).
        </p>
        <p className="mb-3">
          <strong>Delivery Address:</strong> You are responsible for providing
          an accurate delivery address. If delivery fails due to incorrect
          address information, additional fees may apply for re-delivery.
        </p>
        <p>
          <strong>Inspection:</strong> Please inspect products upon delivery.
          Report any damage or discrepancies within 24 hours.
        </p>
      </LegalSection>

      <LegalSection title="6. Returns and Refunds" variant={variant}>
        <p className="mb-3">
          Due to the perishable nature of fresh mushrooms, we cannot accept
          returns for change of mind. However, we offer refunds or replacements
          if:
        </p>
        <ul className={variant === "compact" ? "list-disc pl-5 space-y-1" : "list-disc pl-6 space-y-2"}>
          <li>Products are damaged, spoiled, or defective upon delivery</li>
          <li>You receive incorrect items</li>
          <li>Products do not match the description</li>
        </ul>
        <p className="mt-3">
          <strong>Refund Process:</strong> Contact us within 24 hours of
          delivery with photos and your order number. Approved refunds are
          processed within 5-7 business days to your original payment method.
        </p>
      </LegalSection>

      <LegalSection title="7. Product Information" variant={variant}>
        <p>
          We strive to provide accurate product descriptions, images, and
          information. However, we do not guarantee that descriptions are
          error-free or complete. Product colors may vary due to monitor
          settings. If a product is not as described, your remedy is limited to
          return and refund in accordance with our Returns Policy.
        </p>
      </LegalSection>

      <LegalSection title="8. Intellectual Property" variant={variant}>
        <p className="mb-3">
          All content on MASH, including text, graphics, logos, images, and
          software, is the property of MASH or its licensors and is protected by
          intellectual property laws. You may not:
        </p>
        <ul className={variant === "compact" ? "list-disc pl-5 space-y-1" : "list-disc pl-6 space-y-2"}>
          <li>Copy, reproduce, or distribute our content without permission</li>
          <li>Use our trademarks or branding without authorization</li>
          <li>Reverse engineer or attempt to access our source code</li>
          <li>Use automated systems (bots, scrapers) to access our Services</li>
        </ul>
      </LegalSection>

      <LegalSection title="9. Prohibited Conduct" variant={variant}>
        <p className="mb-3">You agree not to:</p>
        <ul className={variant === "compact" ? "list-disc pl-5 space-y-1" : "list-disc pl-6 space-y-2"}>
          <li>Violate any laws or regulations</li>
          <li>Provide false or misleading information</li>
          <li>Impersonate another person or entity</li>
          <li>Interfere with or disrupt our Services</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Use our Services for fraudulent purposes</li>
          <li>Harass, abuse, or harm other users or our staff</li>
        </ul>
      </LegalSection>

      <LegalSection title="10. Limitation of Liability" variant={variant}>
        <p>
          To the fullest extent permitted by law, MASH shall not be liable for
          any indirect, incidental, special, consequential, or punitive damages,
          including loss of profits, data, or goodwill, arising from your use of
          our Services. Our total liability shall not exceed the amount you paid
          for the order in question.
        </p>
      </LegalSection>

      <LegalSection title="11. Disclaimer of Warranties" variant={variant}>
        <p>
          Our Services are provided &quot;as is&quot; and &quot;as
          available&quot; without warranties of any kind, either express or
          implied. We do not guarantee uninterrupted, timely, secure, or
          error-free operation. You use our Services at your own risk.
        </p>
      </LegalSection>

      <LegalSection title="12. Dispute Resolution" variant={variant}>
        <p className="mb-3">
          <strong>Informal Resolution:</strong> If you have a dispute, please
          contact our customer service first. We will work in good faith to
          resolve the issue.
        </p>
        <p>
          <strong>Governing Law:</strong> These Terms are governed by the laws
          of the Republic of the Philippines. Any disputes shall be subject to
          the exclusive jurisdiction of the courts of Metro Manila.
        </p>
      </LegalSection>

      <LegalSection title="13. Changes to Terms" variant={variant}>
        <p>
          We reserve the right to modify these Terms at any time. Changes will
          be effective upon posting to our website. Your continued use of our
          Services after changes constitutes acceptance of the modified Terms.
          We encourage you to review these Terms periodically.
        </p>
      </LegalSection>

      <LegalSection title="14. Severability" variant={variant}>
        <p>
          If any provision of these Terms is found to be invalid or
          unenforceable, the remaining provisions shall continue in full force
          and effect.
        </p>
      </LegalSection>

      {showContactCard && <LegalContactCard title="Contact Us" description="If you have questions about these Terms of Service, please contact us:" />}
    </div>
  );
}

export function PrivacyContent({ variant = "default", showContactCard = true }: LegalContentProps) {
  return (
    <div className={variant === "compact" ? "space-y-2 sm:space-y-3" : "space-y-6"}>
      {variant === "compact" && (
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Your privacy is important to us. This policy outlines how MASH collects,
          uses, and protects your personal information.
        </p>
      )}

      <LegalSection title="1. Information We Collect" variant={variant}>
        <p className="mb-3">
          We collect information that you provide directly to us, including:
        </p>
        <ul className={variant === "compact" ? "list-disc pl-5 space-y-1" : "list-disc pl-6 space-y-2"}>
          <li>
            <strong>Personal Information:</strong> Name, email address, phone
            number, and delivery address when you create an account or place an
            order.
          </li>
          <li>
            <strong>Payment Information:</strong> Payment method details
            (processed securely through third-party payment providers; we do not
            store complete credit card numbers).
          </li>
          <li>
            <strong>Order History:</strong> Details of products purchased, order
            dates, and delivery information.
          </li>
          <li>
            <strong>Communication Data:</strong> Records of your interactions
            with our customer service team.
          </li>
          <li>
            <strong>Usage Data:</strong> Information about how you use our
            website, including pages visited, products viewed, and browsing
            behavior.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. How We Use Your Information" variant={variant}>
        <p className="mb-3">We use the information we collect to:</p>
        <ul className={variant === "compact" ? "list-disc pl-5 space-y-1" : "list-disc pl-6 space-y-2"}>
          <li>
            Process and fulfill your orders, including delivery and payment
            processing
          </li>
          <li>
            Communicate with you about your orders, account, and customer
            service inquiries
          </li>
          <li>
            Send you promotional emails and marketing communications (with your
            consent)
          </li>
          <li>
            Improve our website, products, and services based on user feedback
            and behavior
          </li>
          <li>
            Detect and prevent fraud, security issues, and technical problems
          </li>
          <li>
            Comply with legal obligations and enforce our terms of service
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Information Sharing and Disclosure" variant={variant}>
        <p className="mb-3">
          We may share your information in the following circumstances:
        </p>
        <ul className={variant === "compact" ? "list-disc pl-5 space-y-1" : "list-disc pl-6 space-y-2"}>
          <li>
            <strong>Service Providers:</strong> With trusted third-party service
            providers who assist with order fulfillment, payment processing,
            delivery, and customer support.
          </li>
          <li>
            <strong>Grower Partners:</strong> Basic order information (name,
            delivery address) is shared with our mushroom growers to facilitate
            product delivery.
          </li>
          <li>
            <strong>Legal Requirements:</strong> When required by law, court
            order, or government regulation.
          </li>
          <li>
            <strong>Business Transfers:</strong> In the event of a merger,
            acquisition, or sale of assets, your information may be transferred
            to the new owner.
          </li>
        </ul>
        <p className="mt-3">
          <strong>
            We never sell your personal information to third parties for
            marketing purposes.
          </strong>
        </p>
      </LegalSection>

      <LegalSection title="4. Cookies and Tracking Technologies" variant={variant}>
        <p className="mb-3">
          We use cookies and similar tracking technologies to:
        </p>
        <ul className={variant === "compact" ? "list-disc pl-5 space-y-1" : "list-disc pl-6 space-y-2"}>
          <li>Remember your preferences and settings</li>
          <li>Keep you logged in to your account</li>
          <li>Analyze website traffic and user behavior</li>
          <li>Provide personalized content and recommendations</li>
        </ul>
        <p className="mt-3">
          You can control cookies through your browser settings. However,
          disabling cookies may affect your ability to use certain features of
          our website.
        </p>
      </LegalSection>

      <LegalSection title="5. Data Security" variant={variant}>
        <p>
          We implement industry-standard security measures to protect your
          personal information, including:
        </p>
        <ul className={variant === "compact" ? "list-disc pl-5 space-y-1 my-3" : "list-disc pl-6 space-y-2 my-3"}>
          <li>SSL/TLS encryption for data transmission</li>
          <li>Secure servers with restricted access</li>
          <li>Regular security audits and updates</li>
          <li>Employee training on data protection practices</li>
        </ul>
        <p>
          While we strive to protect your information, no method of transmission
          over the internet is 100% secure. We cannot guarantee absolute
          security but are committed to protecting your data.
        </p>
      </LegalSection>

      <LegalSection title="6. Your Rights and Choices" variant={variant}>
        <p className="mb-3">You have the right to:</p>
        <ul className={variant === "compact" ? "list-disc pl-5 space-y-1" : "list-disc pl-6 space-y-2"}>
          <li>
            <strong>Access:</strong> Request a copy of the personal information
            we hold about you
          </li>
          <li>
            <strong>Update:</strong> Correct or update your personal information
            through your account settings
          </li>
          <li>
            <strong>Delete:</strong> Request deletion of your account and
            personal data (subject to legal retention requirements)
          </li>
          <li>
            <strong>Opt-Out:</strong> Unsubscribe from marketing emails at any
            time using the link in our emails
          </li>
          <li>
            <strong>Object:</strong> Object to certain processing of your data,
            such as marketing communications
          </li>
        </ul>
        <p className="mt-3">
          To exercise these rights, contact us at{" "}
          <strong className="text-primary">privacy@mash.ph</strong> or through
          your account settings.
        </p>
      </LegalSection>

      <LegalSection title="7. Data Retention" variant={variant}>
        <p>
          We retain your personal information for as long as necessary to:
        </p>
        <ul className={variant === "compact" ? "list-disc pl-5 space-y-1 my-3" : "list-disc pl-6 space-y-2 my-3"}>
          <li>Provide our services and maintain your account</li>
          <li>Comply with legal, accounting, or reporting requirements</li>
          <li>Resolve disputes and enforce our agreements</li>
        </ul>
        <p>
          After deletion, we may retain anonymized data for analytics and
          business purposes.
        </p>
      </LegalSection>

      <LegalSection title="8. Children's Privacy" variant={variant}>
        <p>
          Our services are not intended for children under 13 years of age. We
          do not knowingly collect personal information from children. If you
          believe we have collected information from a child, please contact us
          immediately.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes to This Policy" variant={variant}>
        <p>
          We may update this Privacy Policy from time to time. We will notify
          you of significant changes by posting the new policy on this page and
          updating the &quot;Last Updated&quot; date. Your continued use of our
          services after changes indicates your acceptance of the updated
          policy.
        </p>
      </LegalSection>

      {showContactCard && (
        <LegalContactCard
          title="Questions About Privacy?"
          description="If you have questions or concerns about our privacy practices, please contact our Data Protection Officer:"
        />
      )}
    </div>
  );
}

interface LegalContactCardProps {
  title: string;
  description: string;
}

export function LegalContactCard({ title, description }: LegalContactCardProps) {
  return (
    <Card className="bg-primary text-primary-foreground">
      <CardContent className="p-6">
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-primary-foreground/80 mb-4">{description}</p>
        <div className="space-y-1 text-sm">
          <p>
            Email: <strong>MASH.Mushroom.Automation@gmail.com</strong>
          </p>
          <p>
            Phone: <strong>09272533969</strong>
          </p>
          <p>
            Address: <strong>University of Caloocan City, Philippines</strong>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
