"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Calendar, 
  Clock, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle,
  Phone,
  Video,
  MapPin
} from "lucide-react";

// Constants
const CALCOM_BASE_URL = "https://cal.com";
const CAL_EMBED_SCRIPT_URL = "https://app.cal.com/embed/embed.js";

// Theme configuration helper
const getCalComThemeConfig = (
  themeProp: "light" | "dark" | "auto",
  resolvedTheme: string | undefined
): { theme: "light" | "dark" } => {
  if (themeProp === "auto") {
    return { theme: resolvedTheme === "dark" ? "dark" : "light" };
  }
  return { theme: themeProp };
};

// Generate unique embed ID
let embedCounter = 0;
const generateEmbedId = (): string => {
  return `cal-embed-${++embedCounter}-${Date.now()}`;
};

export interface CalComEmbedProps {
  /** Cal.com username (e.g., "mash-mushroom") */
  username: string;
  /** Event type slug (e.g., "30min") */
  eventSlug?: string;
  /** Optional product ID for tracking */
  productId?: string;
  /** Height of the embed container */
  height?: string;
  /** Additional CSS classes */
  className?: string;
  /** Theme override */
  theme?: "light" | "dark" | "auto";
  /** Brand color for the embed */
  brandColor?: string;
  /** Event title to display above calendar */
  eventTitle?: string;
  /** Duration in minutes */
  duration?: number;
  /** Show event selector (for test compatibility) */
  showEventSelector?: boolean;
}

type LoadingStatus = "loading" | "loaded" | "error";

interface LoadingState {
  status: LoadingStatus;
  message: string;
}

/**
 * Cal.com Inline Embed Component
 * 
 * Uses the official Cal.com embed pattern with immediate queue-based calls.
 * No complex waiting logic needed - Cal.com's snippet queues calls until script loads.
 */
export function CalComEmbed({
  username,
  eventSlug = "30min",
  productId,
  height = "700px",
  className,
  theme: themeProp = "auto",
  brandColor = "#10b981",
  eventTitle,
  duration,
  showEventSelector,
}: CalComEmbedProps) {
  const { resolvedTheme, theme: systemTheme } = useTheme();
  const { user } = useAuth();
  
  // State
  const [loadingState, setLoadingState] = useState<LoadingState>({
    status: "loading",
    message: "Loading booking calendar...",
  });
  const [mounted, setMounted] = useState(false);
  
  // Refs
  const embedIdRef = useRef<string>(generateEmbedId());
  const initAttemptedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Computed values
  const calLink = useMemo(() => `${username}/${eventSlug}`, [username, eventSlug]);
  const calUrl = useMemo(() => `${CALCOM_BASE_URL}/${calLink}`, [calLink]);
  const currentTheme = themeProp === "auto" 
    ? (resolvedTheme === "dark" ? "dark" : "light")
    : themeProp;

  // Mount effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize Cal.com embed using the OFFICIAL snippet pattern
  useEffect(() => {
    if (!mounted || typeof window === "undefined" || initAttemptedRef.current) {
      return;
    }

    const embedId = embedIdRef.current;
    initAttemptedRef.current = true;

    console.log(`[CalComEmbed] Initializing embed for #${embedId}`);

    try {
      // Official Cal.com IIFE snippet - this creates a queue that stores calls
      // until the script loads, then processes them
      (function (C: Window & { Cal?: any }, A: string, L: string) {
        const p = function (a: any, ar: any) { a.q.push(ar); };
        const d = C.document;
        C.Cal = C.Cal || function () {
          const cal = C.Cal;
          const ar = arguments;
          if (!cal.loaded) {
            cal.ns = {};
            cal.q = cal.q || [];
            d.head.appendChild(d.createElement("script")).src = A;
            cal.loaded = true;
          }
          if (ar[0] === L) {
            const api = function () { p(api, arguments); };
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
      })(window as any, CAL_EMBED_SCRIPT_URL, "init");

      const Cal = (window as any).Cal;

      // These calls are QUEUED and execute when script loads
      Cal("init", { origin: CALCOM_BASE_URL });

      // Configure UI with theme
      const themeConfig = getCalComThemeConfig(themeProp, resolvedTheme);
      Cal("ui", {
        ...themeConfig,
        cssVarsPerTheme: {
          light: { "cal-brand": brandColor },
          dark: { "cal-brand": brandColor },
        },
        hideEventTypeDetails: false,
        layout: "month_view",
      });

      // Create the inline embed
      Cal("inline", {
        elementOrSelector: `#${embedId}`,
        calLink: calLink,
        layout: "month_view",
        config: {
          theme: currentTheme,
          ...(productId && { metadata: { productId } }),
        },
      });

      // Pre-fill user data if logged in
      if (user?.email || user?.displayName) {
        Cal("preload", {
          calLink: calLink,
        });
      }

      console.log("[CalComEmbed] Queued Cal.com initialization calls");
      
      // Mark as loaded - Cal.com handles the rest via its queue
      setLoadingState({
        status: "loaded",
        message: "Calendar loaded successfully",
      });

    } catch (err) {
      console.error("[CalComEmbed] Initialization error:", err);
      setLoadingState({
        status: "error",
        message: err instanceof Error ? err.message : "Failed to load booking calendar",
      });
    }
  }, [mounted, calLink, currentTheme, themeProp, resolvedTheme, brandColor, productId, user]);

  // Update theme when it changes (if already loaded)
  useEffect(() => {
    if (!mounted || loadingState.status !== "loaded" || typeof window === "undefined") {
      return;
    }

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
  }, [currentTheme, themeProp, resolvedTheme, brandColor, mounted, loadingState.status]);

  // Retry handler - full cleanup and reinitialize
  const handleRetry = () => {
    // Reset state
    initAttemptedRef.current = false;
    embedIdRef.current = generateEmbedId();
    
    // Clean up existing Cal state
    if (typeof window !== "undefined") {
      // Remove existing Cal script tags
      const scripts = document.querySelectorAll(`script[src*="cal.com/embed"]`);
      scripts.forEach(s => s.remove());
      // Clear Cal from window for fresh start
      delete (window as any).Cal;
    }
    
    // Reset loading state to trigger re-initialization
    setLoadingState({
      status: "loading",
      message: "Retrying...",
    });
    
    // Force re-run of initialization effect
    setMounted(false);
    setTimeout(() => setMounted(true), 100);
  };

  // Loading state UI
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
      </div>
    );
  }

  // Error state UI
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

  // Loaded state - show the embed container
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

      {/* Cal.com inline embed container */}
      <div
        id={embedIdRef.current}
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
          overflow: "auto",
        }}
      />
    </div>
  );
}

// Export as CalendlyEmbed for backwards compatibility
export { CalComEmbed as CalendlyEmbed };
export default CalComEmbed;
