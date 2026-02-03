"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import {
  getCalComThemeConfig,
  type CalComTheme,
  CALCOM_DEFAULT_EVENT_SLUG,
  CALCOM_BRAND_COLOR,
  CALCOM_BRAND_COLOR_DARK,
} from "@/lib/calcom";
import { Loader2, Calendar, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Cal.com embed script URL (correct URL without 'app' subdomain)
const CAL_EMBED_SCRIPT_URL = "https://cal.com/embed/embed.js";

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
 * - Loading and error states
 * - Retry functionality
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
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const initAttempted = useRef(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine the current theme
  const currentTheme = themeProp === "auto" 
    ? (resolvedTheme === "dark" ? "dark" : "light") 
    : themeProp;

  // Get theme-aware brand color
  const brandColor = currentTheme === "dark" ? CALCOM_BRAND_COLOR_DARK : CALCOM_BRAND_COLOR;

  // Load Cal.com embed script
  const loadCalScript = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      // Check if script already loaded
      if (typeof window !== "undefined" && (window as any).Cal) {
        resolve();
        return;
      }

      // Check if script tag already exists
      const existingScript = document.querySelector(`script[src="${CAL_EMBED_SCRIPT_URL}"]`);
      if (existingScript) {
        // Wait for it to load
        existingScript.addEventListener("load", () => resolve());
        existingScript.addEventListener("error", () => reject(new Error("Cal.com script failed to load")));
        // If already loaded
        if ((window as any).Cal) {
          resolve();
        }
        return;
      }

      // Create and load script
      const script = document.createElement("script");
      script.src = CAL_EMBED_SCRIPT_URL;
      script.async = true;
      script.onload = () => {
        setScriptLoaded(true);
        resolve();
      };
      script.onerror = () => {
        reject(new Error("Failed to load Cal.com booking system"));
      };
      document.head.appendChild(script);
    });
  }, []);

  // Initialize Cal.com embed
  const initializeEmbed = useCallback(async () => {
    if (!mounted || typeof window === "undefined") return;
    
    setLoading(true);
    setError(null);

    try {
      await loadCalScript();

      // Wait a bit for Cal to initialize
      await new Promise(resolve => setTimeout(resolve, 100));

      const Cal = (window as any).Cal;
      if (!Cal) {
        throw new Error("Cal.com not available");
      }

      // Initialize Cal with namespace
      Cal("init", "booking", { origin: "https://cal.com" });

      // Configure UI with theme
      const themeConfig = getCalComThemeConfig(themeProp, resolvedTheme);
      Cal("ui", {
        ...themeConfig,
        cssVarsPerTheme: {
          light: { "cal-brand": brandColor },
          dark: { "cal-brand": brandColor },
        },
      });

      // Pre-fill user data if logged in
      if (user?.email || user?.displayName) {
        Cal("preload", {
          calLink: `${username}/${eventSlug}`,
          ...(user?.email && { email: user.email }),
          ...(user?.displayName && { name: user.displayName }),
        });
      }

      setLoading(false);
      initAttempted.current = true;
    } catch (err) {
      console.error("[CalComEmbed] Initialization error:", err);
      setError(err instanceof Error ? err.message : "Failed to load booking calendar");
      setLoading(false);
    }
  }, [mounted, loadCalScript, themeProp, resolvedTheme, brandColor, user, username, eventSlug]);

  // Initialize on mount and when dependencies change
  useEffect(() => {
    if (mounted && !initAttempted.current) {
      initializeEmbed();
    }
  }, [mounted, initializeEmbed]);

  // Re-initialize when theme changes (if already loaded)
  useEffect(() => {
    if (mounted && scriptLoaded && typeof window !== "undefined" && (window as any).Cal) {
      const Cal = (window as any).Cal;
      const themeConfig = getCalComThemeConfig(themeProp, resolvedTheme);
      Cal("ui", {
        ...themeConfig,
        cssVarsPerTheme: {
          light: { "cal-brand": brandColor },
          dark: { "cal-brand": brandColor },
        },
      });
    }
  }, [currentTheme, themeProp, resolvedTheme, brandColor, mounted, scriptLoaded]);

  // Construct the Cal.com booking link
  const calLink = `${username}/${eventSlug}`;

  // Retry handler
  const handleRetry = () => {
    initAttempted.current = false;
    initializeEmbed();
  };

  // Loading state
  if (loading && !error) {
    return (
      <div 
        className={`cal-embed-container flex flex-col items-center justify-center bg-muted/30 rounded-lg ${className}`}
        style={{ width: "100%", height, minWidth: "320px" }}
      >
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-sm text-muted-foreground">Loading booking calendar...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div 
        className={`cal-embed-container flex flex-col items-center justify-center bg-muted/30 rounded-lg p-8 ${className}`}
        style={{ width: "100%", height, minWidth: "320px" }}
      >
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="font-semibold text-foreground mb-2">Unable to Load Calendar</h3>
        <p className="text-sm text-muted-foreground text-center mb-4 max-w-sm">
          {error}
        </p>
        <div className="flex gap-3">
          <Button onClick={handleRetry} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button asChild>
            <a 
              href={`https://cal.com/${calLink}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="gap-2"
            >
              <Calendar className="w-4 h-4" />
              Book on Cal.com
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`cal-embed-container ${className}`}
      style={{ 
        width: "100%", 
        height, 
        overflow: "auto",
        minWidth: "320px",
      }}
      data-theme={currentTheme}
    >
      {/* Cal.com inline embed using data attributes */}
      <div
        data-cal-link={calLink}
        data-cal-namespace="booking"
        data-cal-config={JSON.stringify({ 
          layout: "month_view", 
          theme: currentTheme,
          ...(productId && { metadata: { productId } }),
        })}
        style={{ 
          width: "100%", 
          height: "100%", 
          overflow: "auto",
          minHeight: "600px",
        }}
      />
    </div>
  );
}

// Export as CalComEmbed for new naming convention
export { CalComEmbed as CalendlyEmbed };
export default CalComEmbed;
