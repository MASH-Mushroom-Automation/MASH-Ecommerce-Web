"use client";

import { CMSContactSection } from "@/components/cms/ContactSection";
import { useSanityContactPage } from "@/hooks/useSanityContactPage";

/**
 * Contact Page - Phase 8
 * 
 * Now powered by Sanity CMS using the contactPage singleton.
 * Content is managed in Sanity Studio under Settings → Contact Page.
 * 
 * Features:
 * - Contact methods (phone, email, address, WhatsApp, etc.)
 * - Business hours with day-specific schedules
 * - Social media links
 * - Location with map coordinates
 * - Contact form settings
 */
export default function ContactPage() {
  const { content, loading, error } = useSanityContactPage();

  if (loading) {
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

  if (error) {
    return (
      <div className="bg-background min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <p className="text-destructive mb-4">Error loading contact page: {error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Transform Sanity content to match CMSContactSection props
  const contactInfo = content?.contactMethods?.map((method) => ({
    id: method._key,
    type: method.type,
    label: method.label || method.type,
    value: method.value,
    link: method.link,
    icon: method.icon,
  })) || [];

  const businessHours = content?.businessHours?.map((hour) => ({
    id: hour._key,
    day: hour.dayLabel,
    hours: hour.displayTime,
    isClosed: hour.isClosed,
    note: hour.note,
  })) || [];

  const socialLinks = content?.socialLinks?.map((link) => ({
    id: link._key,
    platform: link.platform,
    url: link.url,
    label: link.label,
    icon: link.icon,
  })) || [];

  return (
    <CMSContactSection
      contactInfo={contactInfo}
      businessHours={businessHours}
      socialLinks={socialLinks}
      loading={loading}
      error={error?.message}
    />
  );
}
