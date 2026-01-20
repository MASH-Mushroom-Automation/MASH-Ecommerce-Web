"use client";

import React from "react";
import { InlineWidget } from "react-calendly";
import { useAuth } from "@/contexts/AuthContext";

interface CalendlyEmbedProps {
  /** Calendly username (e.g., "mash-mushroom-automation") */
  username: string;
  /** Event slug (e.g., "30min", "store-visit") */
  eventSlug?: string;
  /** Optional: Pre-fill product ID for tracking */
  productId?: string;
  /** Height of the embed widget */
  height?: string;
  /** Custom styles */
  className?: string;
}

/**
 * CalendlyEmbed - Inline Calendly widget for dedicated booking pages
 * 
 * This component embeds the Calendly scheduling calendar directly on the page,
 * providing a seamless booking experience for buyers.
 * 
 * Live Example: https://calendly.com/mash-mushroom-automation/30min
 * 
 * @example
 * ```tsx
 * <CalendlyEmbed 
 *   username="mash-mushroom-automation" 
 *   eventSlug="30min" 
 * />
 * ```
 */
export function CalendlyEmbed({
  username,
  eventSlug = "30min",
  productId,
  height = "700px",
  className = "",
}: CalendlyEmbedProps) {
  const { user } = useAuth();

  // Construct the Calendly URL
  const calendlyUrl = `https://calendly.com/${username}/${eventSlug}`;

  // Pre-fill user data if logged in
  const prefill = {
    email: user?.email || "",
    name: user?.displayName || "",
    customAnswers: productId
      ? {
          a1: productId, // Track which product they're interested in
        }
      : undefined,
  };

  // Page styling to match MASH branding
  const pageSettings = {
    backgroundColor: "ffffff",
    hideEventTypeDetails: false,
    hideLandingPageDetails: false,
    primaryColor: "16a34a", // MASH green
    textColor: "1f2937",
  };

  return (
    <div className={`calendly-embed-container ${className}`}>
      <InlineWidget
        url={calendlyUrl}
        prefill={prefill}
        pageSettings={pageSettings}
        styles={{
          height,
          minWidth: "320px",
          width: "100%",
        }}
      />
    </div>
  );
}

export default CalendlyEmbed;
