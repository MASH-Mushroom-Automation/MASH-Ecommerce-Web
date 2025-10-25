"use client";

import { CMSFAQSection } from "@/components/cms/FAQSection";
import { useFAQs } from "@/hooks/useCMS";

export default function FAQPage() {
  const { faqs, loading, error } = useFAQs();

  return <CMSFAQSection faqs={faqs} loading={loading} error={error} />;
}
