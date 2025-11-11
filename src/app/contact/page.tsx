"use client";

import { CMSContactSection } from "@/components/cms/ContactSection";
import { useContactContent } from "@/hooks/useCMS";

export default function ContactPage() {
  const { content, loading, error } = useContactContent();

  if (!content) {
    return (
      <div className="bg-background min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading contact information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CMSContactSection
      contactInfo={content.contactInfo}
      businessHours={content.businessHours}
      socialLinks={content.socialLinks}
      loading={loading}
      error={error}
    />
  );
}
