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
            <p className="text-muted-foreground">
              Loading contact information...
            </p>
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
            <p className="text-destructive mb-4">
              Error loading contact page: {error.message}
            </p>
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

  // Default fallback data when Sanity CMS is empty
  const defaultContactInfo = [
    {
      id: "email-1",
      type: "email" as const,
      title: "Email Us",
      value: "MASH.Mushroom.Automation@gmail.com",
      description: "We'll respond within 24 hours",
      isActive: true,
      displayOrder: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "phone-1",
      type: "phone" as const,
      title: "Call Us",
      value: "09272533969",
      description: "Mon-Fri 9AM-6PM",
      isActive: true,
      displayOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "address-1",
      type: "address" as const,
      title: "Visit Us",
      value: "University of Caloocan City, Philippines",
      description: "MASH Research Lab",
      isActive: true,
      displayOrder: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const defaultBusinessHours = [
    {
      id: "mon",
      dayOfWeek: "monday" as const,
      openTime: "9:00 AM",
      closeTime: "6:00 PM",
      isClosed: false,
      isActive: true,
      displayOrder: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "tue",
      dayOfWeek: "tuesday" as const,
      openTime: "9:00 AM",
      closeTime: "6:00 PM",
      isClosed: false,
      isActive: true,
      displayOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "wed",
      dayOfWeek: "wednesday" as const,
      openTime: "9:00 AM",
      closeTime: "6:00 PM",
      isClosed: false,
      isActive: true,
      displayOrder: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "thu",
      dayOfWeek: "thursday" as const,
      openTime: "9:00 AM",
      closeTime: "6:00 PM",
      isClosed: false,
      isActive: true,
      displayOrder: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "fri",
      dayOfWeek: "friday" as const,
      openTime: "9:00 AM",
      closeTime: "6:00 PM",
      isClosed: false,
      isActive: true,
      displayOrder: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "sat",
      dayOfWeek: "saturday" as const,
      openTime: "10:00 AM",
      closeTime: "4:00 PM",
      isClosed: false,
      isActive: true,
      displayOrder: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "sun",
      dayOfWeek: "sunday" as const,
      openTime: "",
      closeTime: "",
      isClosed: true,
      notes: "Closed",
      isActive: true,
      displayOrder: 6,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const defaultSocialLinks = [
    {
      id: "fb-1",
      platform: "facebook" as const,
      url: "https://www.facebook.com/MASHMarketPH",
      displayOrder: 0,
      isActive: true,
    },
    {
      id: "yt-1",
      platform: "youtube" as const,
      url: "https://www.youtube.com/@MASH-UCC",
      displayOrder: 1,
      isActive: true,
    },
    {
      id: "li-1",
      platform: "linkedin" as const,
      url: "https://www.linkedin.com/company/mash-mushroom-automation/",
      displayOrder: 2,
      isActive: true,
    },
  ];

  // Transform Sanity content to match CMSContactSection props
  // Only use Sanity contact methods if they exist AND have valid data
  const sanityContactInfo =
    content?.contactMethods
      ?.filter((method) => method.type && method.value) // Filter out invalid entries
      ?.map((method, index) => ({
        id: method._key,
        type: method.type as
          | "phone"
          | "email"
          | "address"
          | "whatsapp"
          | "telegram",
        title:
          method.label ||
          method.type.charAt(0).toUpperCase() + method.type.slice(1),
        value: method.value,
        description: method.description,
        isActive: true,
        displayOrder: method.displayOrder || index,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })) || [];

  // Check if Sanity has ALL required contact types (email, phone, address)
  const sanityHasEmail = sanityContactInfo.some((c) => c.type === "email");
  const sanityHasPhone = sanityContactInfo.some((c) => c.type === "phone");
  const sanityHasAddress = sanityContactInfo.some((c) => c.type === "address");
  const sanityHasAllContactTypes =
    sanityHasEmail && sanityHasPhone && sanityHasAddress;

  const sanityBusinessHours =
    content?.businessHours?.map((hour, index) => ({
      id: hour._key,
      dayOfWeek: hour.day as
        | "monday"
        | "tuesday"
        | "wednesday"
        | "thursday"
        | "friday"
        | "saturday"
        | "sunday",
      openTime: hour.openTime || "9:00 AM",
      closeTime: hour.closeTime || "6:00 PM",
      isClosed: hour.isClosed,
      notes: hour.note,
      isActive: true,
      displayOrder: index,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })) || [];

  const sanitySocialLinks =
    content?.socialLinks?.map((link, index) => ({
      id: link._key,
      platform: link.platform as
        | "facebook"
        | "twitter"
        | "instagram"
        | "linkedin"
        | "youtube"
        | "tiktok"
        | "github",
      url: link.url,
      displayOrder: link.displayOrder || index,
      isActive: true,
    })) || [];

  // Use Sanity data ONLY if it has ALL 3 required contact types (email, phone, address)
  // Otherwise use defaults to ensure complete contact info
  const contactInfo = sanityHasAllContactTypes
    ? sanityContactInfo
    : defaultContactInfo;
  const businessHours =
    sanityBusinessHours.length >= 7
      ? sanityBusinessHours
      : defaultBusinessHours;
  const socialLinks =
    sanitySocialLinks.length > 0 ? sanitySocialLinks : defaultSocialLinks;

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
