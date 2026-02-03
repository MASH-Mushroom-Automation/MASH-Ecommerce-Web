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
  CALCOM_BASE_URL,
} from "@/lib/calcom";
import { Loader2, Calendar, RefreshCw, AlertCircle, ExternalLink, Clock, Video, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Cal.com embed script URL (correct URL without 'app' subdomain)
const CAL_EMBED_SCRIPT_URL = "https://cal.com/embed/embed.js";

// Max retries for script loading
const MAX_RETRIES = 3;
const RETRY_DELAY = 1500;

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
  /** Event duration in minutes (for display) */
  duration?: number;
  /** Event title (for display) */
  eventTitle?: string;
  /** Show quick event selector */
  showEventSelector?: boolean;
}

interface LoadingState {
  status: "loading" | "loaded" | "error";
  message: string;
  retryCount: number;
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
 * - Loading and error states with retry
 * - Graceful fallback to direct Cal.com link
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
  duration,
  eventTitle,
}: CalComEmbedProps) {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    status: "loading",
    message: "Preparing booking calendar...",
    retryCount: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const initAttempted = useRef(false);
  const scriptLoadPromise = useRef<Promise<void> | null>(null);
  
  // Store props in refs for stable callback references
  const themeRef = useRef(themeProp);
  const resolvedThemeRef = useRef(resolvedTheme);
  const brandColorRef = useRef(brandColor);
  const userRef = useRef(user);
  const calLinkRef = useRef(calLink);
  
  // Update refs when values change
  useEffect(() => {
    themeRef.current = themeProp;
    resolvedThemeRef.current = resolvedTheme;
    brandColorRef.current = brandColor;
    userRef.current = user;
    calLinkRef.current = calLink;
  }, [themeProp, resolvedTheme, brandColor, user, calLink]);

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

  // Construct the Cal.com booking link
  const calLink = `${username}/${eventSlug}`;
  const calUrl = `${CALCOM_BASE_URL}/${calLink}`;

  // Load Cal.com embed script with retry logic
  const loadCalScript = useCallback(async (): Promise<void> => {
    // If we have a pending promise, return it
    if (scriptLoadPromise.current) {
      return scriptLoadPromise.current;
    }

    // Check if Cal is already available
    if (typeof window !== "undefined" && (window as any).Cal) {
      console.log("[CalComEmbed] Cal.com already loaded");
      return Promise.resolve();
    }

    // Create the load promise
    scriptLoadPromise.current = new Promise<void>((resolve, reject) => {
      // Check for existing script
      const existingScript = document.querySelector(`script[src="${CAL_EMBED_SCRIPT_URL}"]`);
      
      if (existingScript) {
        // Wait for existing script to load
        const checkLoaded = () => {
          if ((window as any).Cal) {
            resolve();
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
        return;
      }

      // Create new script element
      const script = document.createElement("script");
      script.src = CAL_EMBED_SCRIPT_URL;
      script.async = true;
      script.crossOrigin = "anonymous";
      
      script.onload = () => {
        console.log("[CalComEmbed] Script loaded successfully");
        // Give Cal.com some time to initialize
        setTimeout(() => {
          if ((window as any).Cal) {
            resolve();
          } else {
            reject(new Error("Cal.com loaded but not initialized"));
          }
        }, 200);
      };

      script.onerror = (e) => {
        console.error("[CalComEmbed] Script load error:", e);
        // Remove failed script so we can retry
        script.remove();
        scriptLoadPromise.current = null;
        reject(new Error("Failed to load Cal.com booking system. Please check your internet connection."));
      };

      document.head.appendChild(script);
    });

    return scriptLoadPromise.current;
  }, []);

  // Initialize Cal.com embed
  const initializeEmbed = useCallback(async (retryCount = 0) => {
    if (!mounted || typeof window === "undefined") return;
    
    setLoadingState({
      status: "loading",
      message: retryCount > 0 
        ? `Retrying... (attempt ${retryCount + 1}/${MAX_RETRIES})`
        : "Loading booking calendar...",
      retryCount,
    });

    try {
      await loadCalScript();

      const Cal = (window as any).Cal;
      if (!Cal) {
        throw new Error("Cal.com not available after script load");
      }

      // Initialize Cal with namespace
      Cal("init", "booking", { origin: CALCOM_BASE_URL });

      // Configure UI with theme - use refs for current values
      const themeConfig = getCalComThemeConfig(themeRef.current, resolvedThemeRef.current);
      Cal("ui", {
        ...themeConfig,
        cssVarsPerTheme: {
          light: { "cal-brand": brandColorRef.current },
          dark: { "cal-brand": brandColorRef.current },
        },
        hideEventTypeDetails: false,
        layout: "month_view",
      });

      // Pre-fill user data if logged in - use ref for current user
      const currentUser = userRef.current;
      if (currentUser?.email || currentUser?.displayName) {
        Cal("preload", {
          calLink: calLinkRef.current,
          ...(currentUser?.email && { email: currentUser.email }),
          ...(currentUser?.displayName && { name: currentUser.displayName }),
        });
      }

      setLoadingState({
        status: "loaded",
        message: "Calendar loaded successfully",
        retryCount,
      });
      initAttempted.current = true;
      console.log("[CalComEmbed] Initialized successfully");

    } catch (err) {
      console.error("[CalComEmbed] Initialization error:", err);
      
      const errorMessage = err instanceof Error ? err.message : "Failed to load booking calendar";

      // Retry logic
      if (retryCount < MAX_RETRIES - 1) {
        console.log(`[CalComEmbed] Retrying in ${RETRY_DELAY}ms... (${retryCount + 1}/${MAX_RETRIES})`);
        scriptLoadPromise.current = null; // Reset for retry
        setTimeout(() => initializeEmbed(retryCount + 1), RETRY_DELAY);
      } else {
        setLoadingState({
          status: "error",
          message: errorMessage,
          retryCount,
        });
      }
    }
  }, [mounted, loadCalScript]); // Reduced dependencies - use refs for dynamic values

  // Initialize on mount
  useEffect(() => {
    if (mounted && !initAttempted.current) {
      initializeEmbed();
    }
  }, [mounted, initializeEmbed]);

  // Re-initialize theme when it changes (if already loaded)
  useEffect(() => {
    if (mounted && loadingState.status === "loaded" && typeof window !== "undefined" && (window as any).Cal) {
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
  }, [currentTheme, themeProp, resolvedTheme, brandColor, mounted, loadingState.status]);

  // Retry handler
  const handleRetry = () => {
    initAttempted.current = false;
    scriptLoadPromise.current = null;
    initializeEmbed();
  };

  // Loading state
  if (loadingState.status === "loading") {
    return (
      <div 
        className={cn(
          "cal-embed-container flex flex-col items-center justify-center rounded-xl border",
          currentTheme === "dark" 
            ? "bg-zinc-900/50 border-zinc-800" 
            : "bg-slate-50/50 border-slate-200",
          className
        )}
        style={{ width: "100%", height, minWidth: "320px" }}
        data-testid="calcom-loading"
      >
        <div className="relative">
          <div className={cn(
            "absolute inset-0 rounded-full blur-xl opacity-20",
            currentTheme === "dark" ? "bg-primary" : "bg-primary/50"
          )} />
          <Loader2 className="w-12 h-12 text-primary animate-spin relative z-10" />
        </div>
        <p className={cn(
          "text-sm mt-4 animate-pulse",
          currentTheme === "dark" ? "text-zinc-400" : "text-slate-600"
        )}>
          {loadingState.message}
        </p>
        {loadingState.retryCount > 0 && (
          <p className={cn(
            "text-xs mt-2",
            currentTheme === "dark" ? "text-zinc-500" : "text-slate-500"
          )}>
            Attempt {loadingState.retryCount + 1} of {MAX_RETRIES}
          </p>
        )}
      </div>
    );
  }

  // Error state with beautiful fallback
  if (loadingState.status === "error") {
    return (
      <div 
        className={cn(
          "cal-embed-container flex flex-col items-center justify-center rounded-xl border p-8",
          currentTheme === "dark" 
            ? "bg-zinc-900/50 border-zinc-800" 
            : "bg-slate-50/50 border-slate-200",
          className
        )}
        style={{ width: "100%", height, minWidth: "320px" }}
        data-testid="calcom-error"
      >
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mb-4",
          currentTheme === "dark" ? "bg-red-950/50" : "bg-red-100"
        )}>
          <AlertCircle className={cn(
            "w-8 h-8",
            currentTheme === "dark" ? "text-red-400" : "text-red-600"
          )} />
        </div>
        
        <h3 className={cn(
          "font-semibold text-lg mb-2",
          currentTheme === "dark" ? "text-zinc-100" : "text-slate-900"
        )}>
          Unable to Load Calendar
        </h3>
        
        <p className={cn(
          "text-sm text-center mb-6 max-w-md",
          currentTheme === "dark" ? "text-zinc-400" : "text-slate-600"
        )}>
          {loadingState.message}. You can try again or book directly on Cal.com.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          <Button 
            onClick={handleRetry} 
            variant="outline" 
            className={cn(
              "flex-1 gap-2",
              currentTheme === "dark" && "border-zinc-700 hover:bg-zinc-800"
            )}
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button 
            asChild 
            className="flex-1 gap-2"
          >
            <a 
              href={calUrl} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4" />
              Book on Cal.com
            </a>
          </Button>
        </div>

        {/* Quick info about available slots */}
        <div className={cn(
          "mt-8 p-4 rounded-lg w-full max-w-md",
          currentTheme === "dark" ? "bg-zinc-800/50" : "bg-white"
        )}>
          <p className={cn(
            "text-xs font-medium mb-3",
            currentTheme === "dark" ? "text-zinc-300" : "text-slate-700"
          )}>
            Available Meeting Types:
          </p>
          <div className="space-y-2">
            {[
              { icon: Phone, label: "15 Min Quick Chat", slug: "15min" },
              { icon: Video, label: "30 Min Meeting", slug: "30min" },
              { icon: MapPin, label: "1 Hour Meeting", slug: "1-hour-meeting" },
            ].map(({ icon: Icon, label, slug }) => (
              <a
                key={slug}
                href={`${CALCOM_BASE_URL}/${username}/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-3 p-2 rounded-md transition-colors",
                  currentTheme === "dark" 
                    ? "hover:bg-zinc-700/50 text-zinc-300" 
                    : "hover:bg-slate-100 text-slate-600"
                )}
              >
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-sm">{label}</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Loaded state - show the embed
  return (
    <div 
      ref={containerRef}
      className={cn(
        "cal-embed-container rounded-xl overflow-hidden",
        currentTheme === "dark" ? "bg-zinc-900" : "bg-white",
        className
      )}
      style={{ 
        width: "100%", 
        height, 
        minWidth: "320px",
      }}
      data-theme={currentTheme}
      data-testid="calcom-loaded"
    >
      {/* Event info header */}
      {(eventTitle || duration) && (
        <div className={cn(
          "px-4 py-3 border-b flex items-center gap-3",
          currentTheme === "dark" ? "border-zinc-800 bg-zinc-900" : "border-slate-200 bg-slate-50"
        )}>
          <Calendar className="w-5 h-5 text-primary" />
          <div>
            {eventTitle && (
              <p className={cn(
                "font-medium",
                currentTheme === "dark" ? "text-zinc-100" : "text-slate-900"
              )}>
                {eventTitle}
              </p>
            )}
            {duration && (
              <p className={cn(
                "text-sm flex items-center gap-1",
                currentTheme === "dark" ? "text-zinc-400" : "text-slate-600"
              )}>
                <Clock className="w-3.5 h-3.5" />
                {duration} minutes
              </p>
            )}
          </div>
        </div>
      )}

      {/* Cal.com inline embed using data attributes */}
      <div
        data-cal-link={calLink}
        data-cal-namespace="booking"
        data-cal-config={JSON.stringify({ 
          layout: "month_view", 
          theme: currentTheme,
          ...(productId && { metadata: { productId } }),
        })}
        className={cn(
          "cal-inline-embed",
          currentTheme === "dark" ? "[&_*]:!bg-zinc-900" : ""
        )}
        style={{ 
          width: "100%", 
          height: eventTitle || duration ? `calc(${height} - 56px)` : "100%",
          minHeight: "600px",
        }}
      />
    </div>
  );
}

// Export as CalComEmbed for new naming convention
export { CalComEmbed as CalendlyEmbed };
export default CalComEmbed;
