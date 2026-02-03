/**
 * Cal.com Configuration
 *
 * Centralized configuration for Cal.com booking integration.
 * Profile: https://cal.com/mash-mushroom
 *
 * @see src/components/appointments/CalendlyEmbed.tsx
 * @see studio/src/schemaTypes/documents/grower.ts
 */

// ===============================================
// Cal.com Account Configuration
// ===============================================

/** Default Cal.com username for MASH */
export const CALCOM_USERNAME = "mash-mushroom";

/** Cal.com base URL */
export const CALCOM_BASE_URL = "https://cal.com";

/** Full profile URL */
export const CALCOM_PROFILE_URL = `${CALCOM_BASE_URL}/${CALCOM_USERNAME}`;

// ===============================================
// Event Types
// ===============================================

export interface CalComEventType {
  /** Display name for the event */
  name: string;
  /** URL slug (e.g., "30min", "1-hour-meeting") */
  slug: string;
  /** Duration in minutes */
  duration: number;
  /** Full URL path (e.g., "/mash-mushroom/30min") */
  url: string;
  /** Meeting type */
  meetingType: "online" | "in-person" | "phone";
  /** Whether this is the default event */
  isDefault?: boolean;
  /** Description for users */
  description?: string;
}

/**
 * Available Cal.com event types for MASH
 * These match the events configured in Cal.com dashboard
 */
export const CALCOM_EVENT_TYPES: CalComEventType[] = [
  {
    name: "1 Hour Meeting",
    slug: "1-hour-meeting",
    duration: 60,
    url: `/${CALCOM_USERNAME}/1-hour-meeting`,
    meetingType: "online",
    isDefault: false,
    description: "Extended consultation for detailed product discussions or farm tours",
  },
  {
    name: "30 Min Meeting",
    slug: "30min",
    duration: 30,
    url: `/${CALCOM_USERNAME}/30min`,
    meetingType: "online",
    isDefault: true,
    description: "Standard consultation for product inquiries and bulk orders",
  },
  {
    name: "15 Min Meeting",
    slug: "15min",
    duration: 15,
    url: `/${CALCOM_USERNAME}/15min`,
    meetingType: "online",
    isDefault: false,
    description: "Quick call for simple questions or follow-ups",
  },
  {
    name: "Secret Meeting",
    slug: "secret",
    duration: 15,
    url: `/${CALCOM_USERNAME}/secret`,
    meetingType: "online",
    isDefault: false,
    description: "Private consultation (invite-only)",
  },
];

/** Default event slug to use when none specified */
export const CALCOM_DEFAULT_EVENT_SLUG = "30min";

// ===============================================
// Theme Configuration
// ===============================================

export type CalComTheme = "light" | "dark" | "auto";

export interface CalComThemeConfig {
  theme: "light" | "dark";
  styles: {
    branding: {
      brandColor: string;
    };
  };
  hideEventTypeDetails: boolean;
  layout: "month_view" | "week_view" | "column_view";
}

/** MASH brand color (green) */
export const CALCOM_BRAND_COLOR = "#16a34a";

/** Dark mode brand color (slightly brighter for dark backgrounds) */
export const CALCOM_BRAND_COLOR_DARK = "#22c55e";

/**
 * Get Cal.com UI configuration based on theme
 */
export function getCalComThemeConfig(theme: CalComTheme, systemTheme?: string): CalComThemeConfig {
  const resolvedTheme = theme === "auto" 
    ? (systemTheme === "dark" ? "dark" : "light")
    : theme;
  
  return {
    theme: resolvedTheme,
    styles: {
      branding: {
        brandColor: resolvedTheme === "dark" ? CALCOM_BRAND_COLOR_DARK : CALCOM_BRAND_COLOR,
      },
    },
    hideEventTypeDetails: false,
    layout: "month_view",
  };
}

// ===============================================
// Utility Functions
// ===============================================

/**
 * Get an event type by slug
 */
export function getEventTypeBySlug(slug: string): CalComEventType | undefined {
  return CALCOM_EVENT_TYPES.find((event) => event.slug === slug);
}

/**
 * Get the default event type
 */
export function getDefaultEventType(): CalComEventType {
  return (
    CALCOM_EVENT_TYPES.find((event) => event.isDefault) ||
    CALCOM_EVENT_TYPES[0]
  );
}

/**
 * Construct full Cal.com booking URL
 */
export function getCalComBookingUrl(
  eventSlug: string,
  username: string = CALCOM_USERNAME
): string {
  return `${CALCOM_BASE_URL}/${username}/${eventSlug}`;
}

/**
 * Construct Cal.com link for embed (username/event format)
 */
export function getCalComLink(
  eventSlug: string,
  username: string = CALCOM_USERNAME
): string {
  return `${username}/${eventSlug}`;
}

/**
 * Validate if an event slug exists
 */
export function isValidEventSlug(slug: string): boolean {
  return CALCOM_EVENT_TYPES.some((event) => event.slug === slug);
}

/**
 * Get all event slugs
 */
export function getAllEventSlugs(): string[] {
  return CALCOM_EVENT_TYPES.map((event) => event.slug);
}

/**
 * Format duration for display
 */
export function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}`;
    }
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes} minutes`;
}

// ===============================================
// Export Types
// ===============================================

export type { CalComEventType as EventType };
