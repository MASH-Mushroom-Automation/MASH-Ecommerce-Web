"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const FAQS = [
  {
    category: "Orders & Delivery",
    questions: [
      {
        q: "How quickly will my mushrooms be delivered?",
        a: "Orders placed before 10 AM are delivered the same day within Metro Manila. Other areas receive delivery within 24-48 hours.",
      },
      {
        q: "Do you offer free delivery?",
        a: "Yes! Orders over ₱500 qualify for free delivery within Metro Manila. A flat ₱50 fee applies to smaller orders.",
      },
      {
        q: "Can I track my order?",
        a: "Absolutely. You'll receive a tracking link via email and SMS once your order ships. You can also check status in your account.",
      },
    ],
  },
  {
    category: "Product Quality",
    questions: [
      {
        q: "How do I know mushrooms are fresh?",
        a: "All mushrooms are harvested within 24-48 hours of delivery. We guarantee freshness or we'll replace your order.",
      },
      {
        q: "What if I receive damaged or spoiled products?",
        a: "Contact us within 24 hours with photos. We'll arrange a replacement or full refund immediately.",
      },
      {
        q: "How should I store fresh mushrooms?",
        a: "Keep them refrigerated in a paper bag or breathable container. Most varieties last 5-7 days when stored properly.",
      },
    ],
  },
  {
    category: "Account & Payment",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept GCash, bank transfer, credit/debit cards, and cash on delivery (₱20 fee applies to COD).",
      },
      {
        q: "Do I need an account to order?",
        a: "You can checkout as a guest, but creating an account lets you track orders, save addresses, and earn loyalty points.",
      },
      {
        q: "Is my payment information secure?",
        a: "Yes, all transactions are encrypted and we never store your full payment details.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="flex flex-col gap-8 px-4 py-10 md:px-8 lg:px-16 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">
          Find answers to common questions about MASH
        </p>
      </div>

      <div className="space-y-8">
        {FAQS.map((section, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>{section.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {section.questions.map((item, j) => (
                  <AccordionItem key={j} value={`item-${i}-${j}`}>
                    <AccordionTrigger className="text-left">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="text-center bg-muted/50">
        <CardContent className="pt-8 pb-8 space-y-4">
          <MessageCircle className="size-12 mx-auto text-muted-foreground" />
          <div>
            <h2 className="text-xl font-semibold mb-2">
              Still have questions?
            </h2>
            <p className="text-muted-foreground text-sm">
              Our customer support team is here to help
            </p>
          </div>
          <Button>Contact support</Button>
        </CardContent>
      </Card>
    </div>
  );
}
