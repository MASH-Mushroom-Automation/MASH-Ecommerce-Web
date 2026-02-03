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

// Cal.com embed script URL - official embed script
const CAL_EMBED_SCRIPT_URL = "https://app.cal.com/embed/embed.js";

// Max retries for script loading
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

// Generate a unique ID for each embed instance
let embedCounter = 0;
const generateEmbedId = () => `cal-embed-${++embedCounter}-${Date.now()}`;

/**
 * Initialize Cal.com using the OFFICIAL embed snippet pattern.
 * This is the exact IIFE pattern from Cal.com's documentation.
 * CRITICAL: Do NOT pre-create window.Cal - let this snippet handle it.
 */
const initCalWithOfficialSnippet = (scriptUrl: string): void => {
  if (typeof window === "undefined") return;

  // Official Cal.com embed snippet - DO NOT MODIFY
  // Source: https://cal.com/docs/core-features/embed
  (function (C: Window & { Cal?: any }, A: string, L: string) {
    const p = function (a: any, ar: any) {
      a.q.push(ar);
    };
    const d = C.document;
    
    // Only create Cal if it doesn't exist - this is critical
    C.Cal =
      C.Cal ||
      function (...args: any[]) {
        const cal = C.Cal;
        const ar = args;
        if (!cal.loaded) {
          cal.ns = {};
          cal.q = cal.q || [];
          // Load the script only once
          const scriptEl = d.createElement("script");
          scriptEl.src = A;
          scriptEl.async = true;
          d.head.appendChild(scriptEl);
          cal.loaded = true;
        }
        if (ar[0] === L) {
          // Handle namespace initialization ("init" call)
          const api = function (...innerArgs: any[]) {
            p(api, innerArgs);
          };
          const namespace = ar[1];
          api.q = api.q || [];
          if (typeof namespace === "string") {
            cal.ns[namespace] = api;
            p(api, ar);
          } else {
            p(cal, ar);
          }
          return;
        }
        p(cal, ar);
      };
  })(window as any, scriptUrl, "init");
};

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
  const embedElementRef = useRef<HTMLDivElement>(null);
  const initAttempted = useRef(false);
  const scriptLoadPromise = useRef<Promise<void> | null>(null);
  
  // Generate a unique ID for this embed instance
  const embedIdRef = useRef<string>(generateEmbedId());

  // Determine the current theme FIRST (needed for brandColor calculation)
  const currentTheme = themeProp === "auto" 
    ? (resolvedTheme === "dark" ? "dark" : "light") 
    : themeProp;

  // Get theme-aware brand color (must be before refs that use it)
  const brandColor = currentTheme === "dark" ? CALCOM_BRAND_COLOR_DARK : CALCOM_BRAND_COLOR;

  // Construct the Cal.com booking link (must be before refs that use it)
  const calLink = `${username}/${eventSlug}`;
  const calUrl = `${CALCOM_BASE_URL}/${calLink}`;
  
  // Store props in refs for stable callback references (AFTER values are defined)
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

  // Wait for Cal global to be available with polling
  // Cal.com's embed.js sets Cal.loaded = true when ready
  const waitForCal = useCallback((maxWaitMs = 15000, pollIntervalMs = 100): Promise<void> => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkCal = () => {
        const Cal = (window as any).Cal;
        
        // Cal is ready when it's a function with loaded = true
        // The official snippet sets this when the script loads
        if (typeof Cal === "function" && Cal.loaded === true) {
          console.log("[CalComEmbed] Cal.com fully initialized");
          resolve();
          return;
        }
        
        // Check timeout
        if (Date.now() - startTime > maxWaitMs) {
          reject(new Error("Cal.com initialization timeout - please refresh and try again"));
          return;
        }
        
        // Keep polling
        setTimeout(checkCal, pollIntervalMs);
      };
      
      checkCal();
    });
  }, []);

  // Wait for the embed element to exist in DOM
  const waitForElement = useCallback((elementId: string, maxWaitMs = 5000, pollIntervalMs = 50): Promise<HTMLElement> => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkElement = () => {
        const element = document.getElementById(elementId);
        
        if (element) {
          console.log(`[CalComEmbed] Element #${elementId} found in DOM`);
          resolve(element);
          return;
        }
        
        if (Date.now() - startTime > maxWaitMs) {
          reject(new Error(`Element #${elementId} not found in DOM after ${maxWaitMs}ms`));
          return;
        }
        
        setTimeout(checkElement, pollIntervalMs);
      };
      
      checkElement();
    });
  }, []);

  // Load Cal.com embed script with retry logic
  const loadCalScript = useCallback(async (): Promise<void> => {
    // If we have a pending promise, return it
    if (scriptLoadPromise.current) {
      return scriptLoadPromise.current;
    }

    // Check if Cal is already fully loaded
    if (typeof window !== "undefined") {
      const Cal = (window as any).Cal;
      if (typeof Cal === "function" && Cal.loaded === true) {
        console.log("[CalComEmbed] Cal.com already fully loaded");
        return Promise.resolve();
      }
    }

    // Create the load promise
    scriptLoadPromise.current = new Promise<void>((resolve, reject) => {
      // Use the OFFICIAL Cal.com snippet to initialize
      // This snippet handles script loading internally
      initCalWithOfficialSnippet(CAL_EMBED_SCRIPT_URL);
      
      // Wait for Cal to become fully available
      waitForCal()
        .then(resolve)
        .catch(reject);
    });

    return scriptLoadPromise.current;
  }, [waitForCal]);

  // Initialize Cal.com embed
  const initializeEmbed = useCallback(async (retryCount = 0) => {
    if (!mounted || typeof window === "undefined") return;
    
    const embedId = embedIdRef.current;
    
    setLoadingState({
      status: "loading",
      message: retryCount > 0 
        ? `Retrying... (attempt ${retryCount + 1}/${MAX_RETRIES})`
        : "Loading booking calendar...",
      retryCount,
    });

    try {
      // Step 1: Load the Cal.com script using official pattern
      await loadCalScript();

      const Cal = (window as any).Cal;
      if (typeof Cal !== "function") {
        throw new Error("Cal.com not available after script load");
      }

      // Step 2: Wait for the target element to exist in DOM
      console.log(`[CalComEmbed] Waiting for element #${embedId}...`);
      await waitForElement(embedId);

      // Step 3: Get current theme values
      const currentResolvedTheme = resolvedThemeRef.current;
      const currentThemeProp = themeRef.current;
      const effectiveTheme = currentThemeProp === "auto" 
        ? (currentResolvedTheme === "dark" ? "dark" : "light")
        : currentThemeProp;

      // Step 4: Initialize namespace FIRST (required before inline call)
      // Using the default namespace for simpler initialization
      Cal("init", { origin: CALCOM_BASE_URL });

      // Step 5: Configure global UI settings
      const themeConfig = getCalComThemeConfig(currentThemeProp, currentResolvedTheme);
      Cal("ui", {
        ...themeConfig,
        cssVarsPerTheme: {
          light: { "cal-brand": brandColorRef.current },
          dark: { "cal-brand": brandColorRef.current },
        },
        hideEventTypeDetails: false,
        layout: "month_view",
      });

      // Step 6: Create the inline embed
      console.log(`[CalComEmbed] Creating inline embed for #${embedId} with calLink: ${calLinkRef.current}`);
      
      Cal("inline", {
        elementOrSelector: `#${embedId}`,
        calLink: calLinkRef.current,
        layout: "month_view",
        config: {
          theme: effectiveTheme,
        },
      });

      // Step 7: Pre-fill user data if logged in
      const currentUser = userRef.current;
      if (currentUser?.email || currentUser?.displayName) {
        Cal("prefill", {
          email: currentUser?.email || "",
          name: currentUser?.displayName || "",
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
  }, [mounted, loadCalScript, waitForElement]);

  // Initialize on mount
  useEffect(() => {
    if (mounted && !initAttempted.current) {
      initializeEmbed();
    }
  }, [mounted, initializeEmbed]);

  // Re-initialize theme when it changes (if already loaded)
  useEffect(() => {
    if (mounted && loadingState.status === "loaded" && typeof window !== "undefined") {
      const Cal = (window as any).Cal;
      if (typeof Cal === "function") {
        try {
          const themeConfig = getCalComThemeConfig(themeProp, resolvedTheme);
          Cal("ui", {
            ...themeConfig,
            cssVarsPerTheme: {
              light: { "cal-brand": brandColor },
              dark: { "cal-brand": brandColor },
            },
          });
        } catch (err) {
          console.warn("[CalComEmbed] Theme update failed:", err);
        }
      }
    }
  }, [currentTheme, themeProp, resolvedTheme, brandColor, mounted, loadingState.status]);

  // Retry handler
  const handleRetry = () => {
    initAttempted.current = false;
    scriptLoadPromise.current = null;
    // Generate a new embed ID for fresh retry
    embedIdRef.current = generateEmbedId();
    // Reset Cal state for fresh retry - remove any existing Cal
    if (typeof window !== "undefined") {
      // Remove existing Cal script tags
      const scripts = document.querySelectorAll(`script[src*="cal.com/embed"]`);
      scripts.forEach(s => s.remove());
      // Clear Cal from window
      delete (window as any).Cal;
    }
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

      {/* Cal.com inline embed container - uses unique ID for reliable targeting */}
      <div
        id={embedIdRef.current}
        ref={embedElementRef}
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
