"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

const FAQ_ITEMS = [
  {
    category: "Orders & Delivery",
    questions: [
      {
        q: "How long does delivery take?",
        a: "Standard delivery typically takes 2-3 business days within Metro Manila and 3-5 business days for provincial areas. Same-day delivery is available for selected areas when you order before 12 PM.",
      },
      {
        q: "What are the delivery fees?",
        a: "Delivery fees vary by location. Metro Manila deliveries start at ₱50, while provincial deliveries range from ₱100-200 depending on distance. Free delivery is available for orders above ₱500.",
      },
      {
        q: "Can I track my order?",
        a: "Yes! Once your order is shipped, you'll receive a tracking number via email and SMS. You can also track your order in the Order History section of your account.",
      },
      {
        q: "What if I'm not home during delivery?",
        a: "Our delivery partner will attempt to contact you. If you're unavailable, they'll leave a calling card and re-attempt delivery the next business day. You can also arrange for delivery to a neighbor or specify a safe drop-off location.",
      },
    ],
  },
  {
    category: "Products",
    questions: [
      {
        q: "How fresh are the mushrooms?",
        a: "All our mushrooms are harvested fresh from our partner growers within 24 hours of delivery. We guarantee peak freshness and quality in every order.",
      },
      {
        q: "How should I store fresh mushrooms?",
        a: "Store fresh mushrooms in a paper bag in the refrigerator. Avoid plastic bags as they trap moisture. Properly stored, they'll stay fresh for 5-7 days.",
      },
      {
        q: "Are the mushrooms organic?",
        a: "Many of our growers use organic farming methods. Look for the 'Organic' badge on product pages. We're working towards having all our products certified organic.",
      },
      {
        q: "Do you sell mushroom growing kits?",
        a: "Yes! We offer DIY mushroom growing kits perfect for beginners. Each kit includes substrate, mushroom spawn, and detailed instructions.",
      },
    ],
  },
  {
    category: "Payment & Pricing",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept GCash, Maya, credit/debit cards (Visa, Mastercard), and Cash on Delivery (COD). Online payments are processed securely through our payment partners.",
      },
      {
        q: "Is Cash on Delivery available?",
        a: "Yes, COD is available for all areas we deliver to. Please have exact change ready as our delivery partners may have limited change.",
      },
      {
        q: "Can I use promo codes?",
        a: "Yes! Enter your promo code at checkout. Promo codes cannot be combined and are subject to terms and conditions. Subscribe to our newsletter to receive exclusive promo codes.",
      },
      {
        q: "Do prices include taxes?",
        a: "All prices displayed are inclusive of VAT. There are no hidden charges except for delivery fees which are shown at checkout.",
      },
    ],
  },
  {
    category: "Returns & Refunds",
    questions: [
      {
        q: "What is your return policy?",
        a: "Due to the perishable nature of fresh mushrooms, we cannot accept returns. However, if you receive damaged or spoiled products, please contact us within 24 hours with photos for a full refund or replacement.",
      },
      {
        q: "How do I request a refund?",
        a: "Contact our customer service within 24 hours of delivery with your order number and photos of the issue. Refunds are processed within 5-7 business days to your original payment method.",
      },
      {
        q: "What if I received the wrong items?",
        a: "We apologize for any errors! Contact us immediately with your order number and photos. We'll arrange for the correct items to be delivered and you can keep the incorrect items.",
      },
    ],
  },
  {
    category: "Account & Security",
    questions: [
      {
        q: "How do I create an account?",
        a: "Click 'Login' in the top right corner, then select 'Create Account'. Fill in your details and verify your email address to complete registration.",
      },
      {
        q: "I forgot my password. What should I do?",
        a: "Click 'Login', then 'Forgot Password'. Enter your email address and we'll send you a link to reset your password.",
      },
      {
        q: "How do I update my delivery address?",
        a: "Log in to your account, go to 'My Profile', and update your address under 'Delivery Address'. You can save multiple addresses for convenience.",
      },
      {
        q: "Is my personal information secure?",
        a: "Yes! We use industry-standard encryption to protect your data. We never share your personal information with third parties without your consent. Read our Privacy Policy for more details.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about ordering, delivery, products,
            and more.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-6">
          {FAQ_ITEMS.map((category, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-xl text-[#1E392A]">
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((item, qIdx) => (
                    <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`}>
                      <AccordionTrigger className="text-left font-semibold text-gray-900">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact CTA */}
        <Card className="mt-8 bg-[#1E392A] text-white">
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Still have questions?</h2>
            <p className="text-gray-200 mb-6">
              Can&apos;t find the answer you&apos;re looking for? Our customer
              support team is here to help.
            </p>
            <Link href="/contact">
              <Button className="bg-white text-[#1E392A] hover:bg-gray-100">
                Contact Support
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
