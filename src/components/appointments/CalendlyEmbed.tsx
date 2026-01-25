"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getCalApi } from "@calcom/embed-react";

interface CalComEmbedProps {
  /** Cal.com username (e.g., "mash-mushroom") */
  username: string;
  /** Event slug (e.g., "30min", "1-hour-meeting", "secret") */
  eventSlug?: string;
  /** Optional: Pre-fill product ID for tracking */
  productId?: string;
  /** Height of the embed widget */
  height?: string;
  /** Custom styles */
  className?: string;
}

/**
 * CalComEmbed - Inline Cal.com widget for dedicated booking pages
 * 
 * This component embeds the Cal.com scheduling calendar directly on the page,
 * providing a seamless booking experience for buyers.
 * 
 * Cal.com Profile: https://cal.com/mash-mushroom
 * 
 * Available Event Types:
 * - 1-hour-meeting (60 minutes)
 * - 30min (30 minutes)
 * - 15min (15 minutes)
 * - secret (15 minutes)
 * 
 * @example
 * ```tsx
 * <CalComEmbed 
 *   username="mash-mushroom" 
 *   eventSlug="30min" 
 * />
 * ```
 */
export function CalComEmbed({
  username,
  eventSlug = "30min",
  productId,
  height = "700px",
  className = "",
}: CalComEmbedProps) {
  const { user } = useAuth();

  useEffect(() => {
    (async function () {
      try {
        const cal = await getCalApi();

        // If the returned API is not a callable function, try common shapes or bail
        const callCal =
          typeof cal === 'function'
            ? cal
            : (cal && (cal.cal || cal.default || cal.getCal)) || null;

        if (!callCal) {
          /* eslint-disable no-console */
          console.warn('[CalComEmbed] getCalApi did not return a callable function, skipping UI/preload configuration');
          return;
        }

        // Configure Cal.com embed
        callCal('ui', {
          theme: 'light',
          styles: {
            branding: {
              brandColor: '#16a34a', // MASH green
            },
          },
          hideEventTypeDetails: false,
          layout: 'month_view',
        });

        // Pre-fill user data if logged in
        if (user?.email || user?.displayName) {
          callCal('preload', {
            email: user?.email || '',
            name: user?.displayName || '',
            metadata: productId
              ? {
                  productId: productId, // Track which product they're interested in
                }
              : undefined,
          });
        }
      } catch (err) {
        /* eslint-disable no-console */
        console.error('[CalComEmbed] Error initializing Cal API:', err);
      }
    })();
  }, [user, productId]);

  // Construct the Cal.com booking link
  const calLink = `${username}/${eventSlug}`;

  return (
    <div 
      className={`cal-embed-container ${className}`}
      style={{ 
        width: "100%", 
        height, 
        overflow: "scroll",
        minWidth: "320px",
      }}
    >
      <div
        data-cal-link={calLink}
        data-cal-config='{"layout":"month_view"}'
        style={{ width: "100%", height: "100%", overflow: "scroll" }}
      />
    </div>
  );
}

// Export as CalComEmbed for new naming convention
export { CalComEmbed as CalendlyEmbed };
export default CalComEmbed;
