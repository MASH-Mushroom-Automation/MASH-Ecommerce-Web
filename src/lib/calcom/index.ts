/**
 * Cal.com Integration Library
 *
 * Exports configuration, utilities, and types for Cal.com booking integration.
 *
 * @see https://cal.com/mash-mushroom
 */

export {
  // Configuration
  CALCOM_USERNAME,
  CALCOM_BASE_URL,
  CALCOM_PROFILE_URL,
  CALCOM_DEFAULT_EVENT_SLUG,
  CALCOM_BRAND_COLOR,
  CALCOM_BRAND_COLOR_DARK,
  CALCOM_EVENT_TYPES,
  // Functions
  getCalComThemeConfig,
  getEventTypeBySlug,
  getDefaultEventType,
  getCalComBookingUrl,
  getCalComLink,
  isValidEventSlug,
  getAllEventSlugs,
  formatDuration,
  // Types
  type CalComEventType,
  type CalComTheme,
  type CalComThemeConfig,
  type EventType,
} from "./config";
