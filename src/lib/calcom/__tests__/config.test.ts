/**
 * Unit Tests for Cal.com Configuration
 *
 * Tests configuration constants, utility functions, and theme configuration.
 *
 * @see src/lib/calcom/config.ts
 */

import {
  CALCOM_USERNAME,
  CALCOM_BASE_URL,
  CALCOM_PROFILE_URL,
  CALCOM_DEFAULT_EVENT_SLUG,
  CALCOM_BRAND_COLOR,
  CALCOM_BRAND_COLOR_DARK,
  CALCOM_EVENT_TYPES,
  getCalComThemeConfig,
  getEventTypeBySlug,
  getDefaultEventType,
  getCalComBookingUrl,
  getCalComLink,
  isValidEventSlug,
  getAllEventSlugs,
  formatDuration,
  type CalComEventType,
} from "../config";

describe("Cal.com Configuration", () => {
  // ===============================================
  // Constants Tests
  // ===============================================

  describe("Constants", () => {
    it("should have correct Cal.com username", () => {
      expect(CALCOM_USERNAME).toBe("mash-mushroom");
    });

    it("should have correct Cal.com base URL", () => {
      expect(CALCOM_BASE_URL).toBe("https://cal.com");
    });

    it("should construct correct profile URL", () => {
      expect(CALCOM_PROFILE_URL).toBe("https://cal.com/mash-mushroom");
    });

    it("should have 30min as default event slug", () => {
      expect(CALCOM_DEFAULT_EVENT_SLUG).toBe("30min");
    });

    it("should have correct brand colors", () => {
      expect(CALCOM_BRAND_COLOR).toBe("#16a34a");
      expect(CALCOM_BRAND_COLOR_DARK).toBe("#22c55e");
    });
  });

  // ===============================================
  // Event Types Tests
  // ===============================================

  describe("Event Types", () => {
    it("should have all required event types", () => {
      const slugs = CALCOM_EVENT_TYPES.map((e) => e.slug);
      expect(slugs).toContain("1-hour-meeting");
      expect(slugs).toContain("30min");
      expect(slugs).toContain("15min");
      expect(slugs).toContain("secret");
    });

    it("should have exactly 4 event types", () => {
      expect(CALCOM_EVENT_TYPES).toHaveLength(4);
    });

    it("should have correct durations for each event", () => {
      const hourMeeting = CALCOM_EVENT_TYPES.find((e) => e.slug === "1-hour-meeting");
      const thirtyMin = CALCOM_EVENT_TYPES.find((e) => e.slug === "30min");
      const fifteenMin = CALCOM_EVENT_TYPES.find((e) => e.slug === "15min");
      const secret = CALCOM_EVENT_TYPES.find((e) => e.slug === "secret");

      expect(hourMeeting?.duration).toBe(60);
      expect(thirtyMin?.duration).toBe(30);
      expect(fifteenMin?.duration).toBe(15);
      expect(secret?.duration).toBe(15);
    });

    it("should have 30min as the default event", () => {
      const defaultEvent = CALCOM_EVENT_TYPES.find((e) => e.isDefault);
      expect(defaultEvent?.slug).toBe("30min");
    });

    it("should have only one default event", () => {
      const defaultEvents = CALCOM_EVENT_TYPES.filter((e) => e.isDefault);
      expect(defaultEvents).toHaveLength(1);
    });

    it("should have valid URLs for all events", () => {
      CALCOM_EVENT_TYPES.forEach((event) => {
        expect(event.url).toBe(`/${CALCOM_USERNAME}/${event.slug}`);
      });
    });

    it("should have valid meeting types", () => {
      const validTypes = ["online", "in-person", "phone"];
      CALCOM_EVENT_TYPES.forEach((event) => {
        expect(validTypes).toContain(event.meetingType);
      });
    });

    it("should have descriptions for all events", () => {
      CALCOM_EVENT_TYPES.forEach((event) => {
        expect(event.description).toBeDefined();
        expect(event.description?.length).toBeGreaterThan(0);
      });
    });
  });

  // ===============================================
  // Theme Configuration Tests
  // ===============================================

  describe("getCalComThemeConfig", () => {
    it("should return light theme config when theme is light", () => {
      const config = getCalComThemeConfig("light");
      expect(config.theme).toBe("light");
      expect(config.styles.branding.brandColor).toBe(CALCOM_BRAND_COLOR);
    });

    it("should return dark theme config when theme is dark", () => {
      const config = getCalComThemeConfig("dark");
      expect(config.theme).toBe("dark");
      expect(config.styles.branding.brandColor).toBe(CALCOM_BRAND_COLOR_DARK);
    });

    it("should resolve auto theme to light when system is light", () => {
      const config = getCalComThemeConfig("auto", "light");
      expect(config.theme).toBe("light");
      expect(config.styles.branding.brandColor).toBe(CALCOM_BRAND_COLOR);
    });

    it("should resolve auto theme to dark when system is dark", () => {
      const config = getCalComThemeConfig("auto", "dark");
      expect(config.theme).toBe("dark");
      expect(config.styles.branding.brandColor).toBe(CALCOM_BRAND_COLOR_DARK);
    });

    it("should default to light when auto and no system theme", () => {
      const config = getCalComThemeConfig("auto");
      expect(config.theme).toBe("light");
    });

    it("should have month_view layout by default", () => {
      const config = getCalComThemeConfig("light");
      expect(config.layout).toBe("month_view");
    });

    it("should not hide event type details", () => {
      const config = getCalComThemeConfig("light");
      expect(config.hideEventTypeDetails).toBe(false);
    });
  });

  // ===============================================
  // Utility Functions Tests
  // ===============================================

  describe("getEventTypeBySlug", () => {
    it("should return event type for valid slug", () => {
      const event = getEventTypeBySlug("30min");
      expect(event).toBeDefined();
      expect(event?.name).toBe("30 Min Meeting");
    });

    it("should return undefined for invalid slug", () => {
      const event = getEventTypeBySlug("invalid-slug");
      expect(event).toBeUndefined();
    });

    it("should return correct event for all slugs", () => {
      expect(getEventTypeBySlug("1-hour-meeting")?.duration).toBe(60);
      expect(getEventTypeBySlug("30min")?.duration).toBe(30);
      expect(getEventTypeBySlug("15min")?.duration).toBe(15);
      expect(getEventTypeBySlug("secret")?.duration).toBe(15);
    });
  });

  describe("getDefaultEventType", () => {
    it("should return the default event type", () => {
      const defaultEvent = getDefaultEventType();
      expect(defaultEvent.isDefault).toBe(true);
      expect(defaultEvent.slug).toBe("30min");
    });

    it("should always return an event (fallback to first)", () => {
      const defaultEvent = getDefaultEventType();
      expect(defaultEvent).toBeDefined();
    });
  });

  describe("getCalComBookingUrl", () => {
    it("should construct full booking URL with default username", () => {
      const url = getCalComBookingUrl("30min");
      expect(url).toBe("https://cal.com/mash-mushroom/30min");
    });

    it("should construct full booking URL with custom username", () => {
      const url = getCalComBookingUrl("1-hour-meeting", "custom-user");
      expect(url).toBe("https://cal.com/custom-user/1-hour-meeting");
    });

    it("should handle special event slugs", () => {
      expect(getCalComBookingUrl("secret")).toBe(
        "https://cal.com/mash-mushroom/secret"
      );
    });
  });

  describe("getCalComLink", () => {
    it("should return username/event format for embed", () => {
      const link = getCalComLink("30min");
      expect(link).toBe("mash-mushroom/30min");
    });

    it("should use custom username when provided", () => {
      const link = getCalComLink("15min", "other-user");
      expect(link).toBe("other-user/15min");
    });
  });

  describe("isValidEventSlug", () => {
    it("should return true for valid slugs", () => {
      expect(isValidEventSlug("30min")).toBe(true);
      expect(isValidEventSlug("15min")).toBe(true);
      expect(isValidEventSlug("1-hour-meeting")).toBe(true);
      expect(isValidEventSlug("secret")).toBe(true);
    });

    it("should return false for invalid slugs", () => {
      expect(isValidEventSlug("invalid")).toBe(false);
      expect(isValidEventSlug("")).toBe(false);
      expect(isValidEventSlug("45min")).toBe(false);
    });
  });

  describe("getAllEventSlugs", () => {
    it("should return all event slugs", () => {
      const slugs = getAllEventSlugs();
      expect(slugs).toContain("1-hour-meeting");
      expect(slugs).toContain("30min");
      expect(slugs).toContain("15min");
      expect(slugs).toContain("secret");
    });

    it("should return correct number of slugs", () => {
      expect(getAllEventSlugs()).toHaveLength(4);
    });
  });

  describe("formatDuration", () => {
    it("should format minutes correctly", () => {
      expect(formatDuration(15)).toBe("15 minutes");
      expect(formatDuration(30)).toBe("30 minutes");
      expect(formatDuration(45)).toBe("45 minutes");
    });

    it("should format hours correctly", () => {
      expect(formatDuration(60)).toBe("1 hour");
      expect(formatDuration(120)).toBe("2 hours");
    });

    it("should format hours and minutes correctly", () => {
      expect(formatDuration(90)).toBe("1h 30m");
      expect(formatDuration(75)).toBe("1h 15m");
    });
  });

  // ===============================================
  // Type Validation Tests
  // ===============================================

  describe("Type Validation", () => {
    it("should have all required fields in CalComEventType", () => {
      const event: CalComEventType = CALCOM_EVENT_TYPES[0];
      expect(event).toHaveProperty("name");
      expect(event).toHaveProperty("slug");
      expect(event).toHaveProperty("duration");
      expect(event).toHaveProperty("url");
      expect(event).toHaveProperty("meetingType");
    });

    it("should allow optional fields in CalComEventType", () => {
      const event: CalComEventType = CALCOM_EVENT_TYPES[0];
      // These should be defined in our config, but the type allows them to be optional
      expect("isDefault" in event).toBe(true);
      expect("description" in event).toBe(true);
    });
  });
});
