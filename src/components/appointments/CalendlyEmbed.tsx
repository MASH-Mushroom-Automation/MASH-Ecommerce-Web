"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { getCalApi } from "@calcom/embed-react";
import {
  getCalComThemeConfig,
  type CalComTheme,
  CALCOM_DEFAULT_EVENT_SLUG,
} from "@/lib/calcom";

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
  /** Theme override: "light", "dark", or "auto" (follows system theme) */
  theme?: CalComTheme;
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
 * Features:
 * - Automatic dark/light mode adaptation
 * - Pre-fills user data when authenticated
 * - Product tracking via metadata
 * 
 * @example
 * ```tsx
 * // Auto theme (follows system/user preference)
 * <CalComEmbed 
 *   username="mash-mushroom" 
 *   eventSlug="30min" 
 * />
 * 
 * // Force dark mode
 * <CalComEmbed 
 *   username="mash-mushroom" 
 *   eventSlug="30min"
 *   theme="dark"
 * />
 * ```
 */
export function CalComEmbed({
  username,
  eventSlug = CALCOM_DEFAULT_EVENT_SLUG,
  productId,
  height = "700px",
  className = "",
  theme: themeProp = "auto",
}: CalComEmbedProps) {
  const { user } = useAuth();
  const { resolvedTheme, theme: nextTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoize the Cal API initialization
  const initCalApi = useCallback(async () => {
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

      // Get theme configuration with system theme awareness
      const systemTheme = mounted ? resolvedTheme : 'light';
      const themeConfig = getCalComThemeConfig(themeProp, systemTheme);

      // Configure Cal.com embed with theme-aware styling
      callCal('ui', themeConfig);

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
  }, [user, productId, themeProp, resolvedTheme, mounted]);

  // Re-initialize Cal API when theme changes
  useEffect(() => {
    if (mounted) {
      initCalApi();
    }
  }, [initCalApi, mounted]);

  // Construct the Cal.com booking link
  const calLink = `${username}/${eventSlug}`;

  // Determine the current theme for data attribute
  const currentTheme = themeProp === "auto" 
    ? (resolvedTheme || "light") 
    : themeProp;

  return (
    <div 
      className={`cal-embed-container ${className}`}
      style={{ 
        width: "100%", 
        height, 
        overflow: "scroll",
        minWidth: "320px",
      }}
      data-theme={currentTheme}
    >
      <div
        data-cal-link={calLink}
        data-cal-config={JSON.stringify({ layout: "month_view", theme: currentTheme })}
        style={{ width: "100%", height: "100%", overflow: "scroll" }}
      />
    </div>
  );
}

// Export as CalComEmbed for new naming convention
export { CalComEmbed as CalendlyEmbed };
export default CalComEmbed;
