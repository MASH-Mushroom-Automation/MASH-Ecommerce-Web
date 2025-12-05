"use client";

import { CMSFAQSection } from "@/components/cms/FAQSection";
import { useSanityFAQs } from "@/hooks/useSanityFAQ";

export default function FAQPage() {
  // Phase 2: Using Sanity CMS for FAQ data
  const { faqs, loading, error } = useSanityFAQs();

  return <CMSFAQSection faqs={faqs} loading={loading} error={error} />;
}
