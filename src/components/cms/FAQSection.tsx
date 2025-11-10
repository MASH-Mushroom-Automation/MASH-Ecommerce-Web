// CMS-based FAQ Component
// src/components/cms/FAQSection.tsx

import React from "react";
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
import { FAQGroup } from "@/hooks/useCMS";

interface CMSFAQSectionProps {
  faqs: FAQGroup[];
  loading?: boolean;
  error?: string | null;
}

export const CMSFAQSection: React.FC<CMSFAQSectionProps> = ({ faqs, loading, error }) => {
  if (loading) {
    return (
      <div className="bg-background min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Header Skeleton */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-80 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-96 mx-auto"></div>
            </div>
          </div>

          {/* FAQ Categories Skeleton */}
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="animate-pulse">
                    <div className="h-6 bg-muted rounded w-48 mb-2"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-full mb-2"></div>
                        <div className="h-3 bg-muted rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <p className="text-destructive mb-4">Error: {error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  if (faqs.length === 0) {
    return (
      <div className="bg-background min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about ordering, delivery, products,
              and more.
            </p>
          </div>

          <div className="text-center">
            <p className="text-lg text-muted-foreground">No FAQ content available.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about ordering, delivery, products,
            and more.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-6">
          {faqs
            .filter(category => category.isActive)
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="text-xl text-primary">
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions
                      .filter(question => question.isActive)
                      .sort((a, b) => a.displayOrder - b.displayOrder)
                      .map((item) => (
                        <AccordionItem key={item.id} value={`item-${category.id}-${item.id}`}>
                          <AccordionTrigger className="text-left font-semibold text-foreground">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Contact CTA */}
        <Card className="mt-8 bg-primary text-primary-foreground">
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Still have questions?</h2>
            <p className="text-primary-foreground/80 mb-6">
              Can&apos;t find the answer you&apos;re looking for? Our customer
              support team is here to help.
            </p>
            <Link href="/contact">
              <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                Contact Support
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
