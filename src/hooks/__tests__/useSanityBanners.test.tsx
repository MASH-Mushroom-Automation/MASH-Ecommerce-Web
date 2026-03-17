/**
 * Tests for src/hooks/useSanityBanners.ts
 * Hooks: useSanityBanners, useBannersByPosition, useHomepageBanners, useAnnouncementBanner
 * Server fns: fetchBanners, fetchBannersByPosition, fetchHomepageBanners
 * Pure utils: getBannerHeightClass, getTextColorClass, getTextAlignmentClass,
 *             getButtonVariant, isBannerActive, getTimeRemaining
 *
 * Uses sanityClient.fetch(). All hooks return { loading, error }.
 */

import { renderHook, waitFor, act } from "@testing-library/react";

const sanityClient = jest.requireMock("@/lib/sanity/client").sanityClient;

import {
  useSanityBanners,
  useBannersByPosition,
  useHomepageBanners,
  useAnnouncementBanner,
  fetchBanners,
  fetchBannersByPosition,
  fetchHomepageBanners,
  getBannerHeightClass,
  getTextColorClass,
  getTextAlignmentClass,
  getButtonVariant,
  isBannerActive,
  getTimeRemaining,
} from "../useSanityBanners";

import type { TransformedBanner } from "../useSanityBanners";

// ─── Sample data (raw Sanity shape) ─────────────────────────────────

function makeBanner(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    _id: "banner-1",
    _createdAt: "2026-01-01T00:00:00Z",
    _updatedAt: "2026-01-02T00:00:00Z",
    title: "Summer Sale",
    headline: "50% Off",
    subheadline: "All mushrooms",
    description: "Limited time offer",
    promoCode: "SUMMER50",
    desktopImage: "https://cdn.sanity.io/images/test/desktop.jpg",
    desktopImageAlt: "Summer Sale Desktop",
    mobileImage: "https://cdn.sanity.io/images/test/mobile.jpg",
    mobileImageAlt: "Summer Sale Mobile",
    overlayOpacity: 0.5,
    backgroundColor: "#ff0000",
    textColor: "white",
    textAlignment: "center",
    bannerHeight: "medium",
    buttonText: "Shop Now",
    buttonLink: "/shop",
    buttonStyle: "primary",
    secondaryButtonText: "Learn More",
    secondaryButtonLink: "/about",
    position: "homepage-top",
    sortOrder: 1,
    isActive: true,
    showOnMobile: true,
    showOnDesktop: true,
    ...overrides,
  };
}

const pastDate = "2025-01-01T00:00:00Z";
const futureDate = "2030-12-31T23:59:59Z";

// ═════════════════════════════════════════════════════════════════════
// PURE UTILITY FUNCTIONS (no mocking needed)
// ═════════════════════════════════════════════════════════════════════

describe("getBannerHeightClass", () => {
  it("returns correct class for small", () => {
    expect(getBannerHeightClass("small")).toBe("h-[200px] md:h-[200px]");
  });

  it("returns correct class for medium", () => {
    expect(getBannerHeightClass("medium")).toBe("h-[250px] md:h-[300px]");
  });

  it("returns correct class for large", () => {
    expect(getBannerHeightClass("large")).toBe("h-[300px] md:h-[400px]");
  });

  it("returns correct class for full", () => {
    expect(getBannerHeightClass("full")).toBe("h-[400px] md:h-[600px]");
  });

  it("returns medium for unknown height", () => {
    expect(getBannerHeightClass("unknown" as any)).toBe("h-[250px] md:h-[300px]");
  });
});

describe("getTextColorClass", () => {
  it("returns correct class for white", () => {
    expect(getTextColorClass("white")).toBe("text-white");
  });

  it("returns correct class for black", () => {
    expect(getTextColorClass("black")).toBe("text-gray-900");
  });

  it("returns correct class for primary", () => {
    expect(getTextColorClass("primary")).toBe("text-primary");
  });

  it("returns correct class for accent", () => {
    expect(getTextColorClass("accent")).toBe("text-accent");
  });

  it("returns white for unknown color", () => {
    expect(getTextColorClass("unknown" as any)).toBe("text-white");
  });
});

describe("getTextAlignmentClass", () => {
  it("returns correct class for left", () => {
    expect(getTextAlignmentClass("left")).toBe("text-left items-start");
  });

  it("returns correct class for center", () => {
    expect(getTextAlignmentClass("center")).toBe("text-center items-center");
  });

  it("returns correct class for right", () => {
    expect(getTextAlignmentClass("right")).toBe("text-right items-end");
  });

  it("returns center for unknown alignment", () => {
    expect(getTextAlignmentClass("unknown" as any)).toBe("text-center items-center");
  });
});

describe("getButtonVariant", () => {
  it("returns default for primary", () => {
    expect(getButtonVariant("primary")).toBe("default");
  });

  it("returns outline for outline", () => {
    expect(getButtonVariant("outline")).toBe("outline");
  });

  it("returns secondary for secondary", () => {
    expect(getButtonVariant("secondary")).toBe("secondary");
  });

  it("returns default for accent", () => {
    expect(getButtonVariant("accent")).toBe("default");
  });

  it("returns default for unknown style", () => {
    expect(getButtonVariant("unknown" as any)).toBe("default");
  });
});

describe("isBannerActive", () => {
  it("returns true for active, non-scheduled, non-expired banner", () => {
    const banner: TransformedBanner = {
      id: "b1",
      title: "Test",
      position: "homepage-top",
      sortOrder: 1,
      isActive: true,
      showOnMobile: true,
      showOnDesktop: true,
      isScheduled: false,
      isExpired: false,
      overlayOpacity: 0.3,
      textColor: "white",
      textAlignment: "center",
      bannerHeight: "medium",
      buttonStyle: "primary",
    };
    expect(isBannerActive(banner)).toBe(true);
  });

  it("returns false for inactive banner", () => {
    const banner = {
      isActive: false,
      isScheduled: false,
      isExpired: false,
    } as TransformedBanner;
    expect(isBannerActive(banner)).toBe(false);
  });

  it("returns false for scheduled banner", () => {
    const banner = {
      isActive: true,
      isScheduled: true,
      isExpired: false,
    } as TransformedBanner;
    expect(isBannerActive(banner)).toBe(false);
  });

  it("returns false for expired banner", () => {
    const banner = {
      isActive: true,
      isScheduled: false,
      isExpired: true,
    } as TransformedBanner;
    expect(isBannerActive(banner)).toBe(false);
  });
});

describe("getTimeRemaining", () => {
  it("returns null for undefined endDate", () => {
    expect(getTimeRemaining(undefined)).toBeNull();
  });

  it("returns 'Expired' for past date", () => {
    expect(getTimeRemaining(pastDate)).toBe("Expired");
  });

  it("returns days remaining for future date > 1 day away", () => {
    const inThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const result = getTimeRemaining(inThreeDays);
    expect(result).toMatch(/\d+ days? left/);
  });

  it("returns hours remaining for future date < 1 day away", () => {
    const inFiveHours = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString();
    const result = getTimeRemaining(inFiveHours);
    expect(result).toMatch(/\d+ hours? left/);
  });

  it("returns 'Ending soon' for future date < 1 hour away", () => {
    const inThirtyMin = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    expect(getTimeRemaining(inThirtyMin)).toBe("Ending soon");
  });

  it("returns '1 day left' for singular day", () => {
    const inOneDay = new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000).toISOString();
    const result = getTimeRemaining(inOneDay);
    expect(result).toBe("1 day left");
  });

  it("returns '1 hour left' for singular hour", () => {
    const inOneHour = new Date(Date.now() + 1.5 * 60 * 60 * 1000).toISOString();
    const result = getTimeRemaining(inOneHour);
    expect(result).toBe("1 hour left");
  });
});

// ═════════════════════════════════════════════════════════════════════
// useSanityBanners (main hook)
// ═════════════════════════════════════════════════════════════════════

describe("useSanityBanners", () => {
  it("should fetch and transform banners", async () => {
    sanityClient.fetch.mockResolvedValueOnce([makeBanner()]);

    const { result } = renderHook(() => useSanityBanners());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.banners).toHaveLength(1);
    expect(result.current.banners[0].id).toBe("banner-1");
    expect(result.current.banners[0].title).toBe("Summer Sale");
    expect(result.current.banners[0].headline).toBe("50% Off");
    expect(result.current.banners[0].promoCode).toBe("SUMMER50");
    expect(result.current.error).toBeNull();
  });

  it("should apply default values during transformation", async () => {
    sanityClient.fetch.mockResolvedValueOnce([
      makeBanner({
        overlayOpacity: undefined,
        textColor: undefined,
        textAlignment: undefined,
        bannerHeight: undefined,
        buttonStyle: undefined,
        showOnMobile: undefined,
        showOnDesktop: undefined,
      }),
    ]);

    const { result } = renderHook(() => useSanityBanners());

    await waitFor(() => expect(result.current.loading).toBe(false));

    const banner = result.current.banners[0];
    expect(banner.overlayOpacity).toBe(0.3);
    expect(banner.textColor).toBe("white");
    expect(banner.textAlignment).toBe("center");
    expect(banner.bannerHeight).toBe("medium");
    expect(banner.buttonStyle).toBe("primary");
    expect(banner.showOnMobile).toBe(true);
    expect(banner.showOnDesktop).toBe(true);
  });

  it("should filter out scheduled banners by default", async () => {
    sanityClient.fetch.mockResolvedValueOnce([
      makeBanner({ _id: "current", startDate: pastDate }),
      makeBanner({ _id: "scheduled", startDate: futureDate }),
    ]);

    const { result } = renderHook(() => useSanityBanners());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.banners).toHaveLength(1);
    expect(result.current.banners[0].id).toBe("current");
  });

  it("should filter out expired banners by default", async () => {
    sanityClient.fetch.mockResolvedValueOnce([
      makeBanner({ _id: "active" }),
      makeBanner({ _id: "expired", endDate: pastDate }),
    ]);

    const { result } = renderHook(() => useSanityBanners());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.banners).toHaveLength(1);
    expect(result.current.banners[0].id).toBe("active");
  });

  it("should include scheduled banners when filter allows", async () => {
    sanityClient.fetch.mockResolvedValueOnce([
      makeBanner({ _id: "scheduled", startDate: futureDate }),
    ]);

    const { result } = renderHook(() =>
      useSanityBanners({ includeScheduled: true })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.banners).toHaveLength(1);
  });

  it("should filter mobile-only banners", async () => {
    sanityClient.fetch.mockResolvedValueOnce([
      makeBanner({ _id: "mobile", showOnMobile: true }),
      makeBanner({ _id: "desktop-only", showOnMobile: false }),
    ]);

    const { result } = renderHook(() =>
      useSanityBanners({ mobileOnly: true })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.banners).toHaveLength(1);
    expect(result.current.banners[0].id).toBe("mobile");
  });

  it("should handle empty response", async () => {
    sanityClient.fetch.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useSanityBanners());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.banners).toEqual([]);
  });

  it("should handle null response", async () => {
    sanityClient.fetch.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useSanityBanners());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.banners).toEqual([]);
  });

  it("should handle fetch error", async () => {
    sanityClient.fetch.mockRejectedValueOnce(new Error("Banners failed"));

    const { result } = renderHook(() => useSanityBanners());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error?.message).toBe("Banners failed");
    expect(result.current.banners).toEqual([]);
  });

  it("should provide refetch function", async () => {
    sanityClient.fetch.mockResolvedValue([makeBanner()]);

    const { result } = renderHook(() => useSanityBanners());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(sanityClient.fetch).toHaveBeenCalledTimes(2);
  });

  it("should use position-specific query when filter has position", async () => {
    sanityClient.fetch.mockResolvedValueOnce([]);

    const { result } = renderHook(() =>
      useSanityBanners({ position: "shop-top" })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(sanityClient.fetch).toHaveBeenCalledWith(
      expect.stringContaining("$position"),
      expect.objectContaining({ position: "shop-top" })
    );
  });
});

// ═════════════════════════════════════════════════════════════════════
// useBannersByPosition
// ═════════════════════════════════════════════════════════════════════

describe("useBannersByPosition", () => {
  it("should fetch banners for specific position", async () => {
    sanityClient.fetch.mockResolvedValueOnce([
      makeBanner({ position: "cart-top" }),
    ]);

    const { result } = renderHook(() => useBannersByPosition("cart-top"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.banners).toHaveLength(1);
  });
});

// ═════════════════════════════════════════════════════════════════════
// useHomepageBanners
// ═════════════════════════════════════════════════════════════════════

describe("useHomepageBanners", () => {
  it("should split banners by homepage position", async () => {
    sanityClient.fetch.mockResolvedValueOnce([
      makeBanner({ _id: "top", position: "homepage-top" }),
      makeBanner({ _id: "mid", position: "homepage-middle" }),
      makeBanner({ _id: "bot", position: "homepage-bottom" }),
      makeBanner({ _id: "other", position: "shop-top" }),
    ]);

    const { result } = renderHook(() => useHomepageBanners());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.topBanners).toHaveLength(1);
    expect(result.current.topBanners[0].id).toBe("top");
    expect(result.current.middleBanners).toHaveLength(1);
    expect(result.current.middleBanners[0].id).toBe("mid");
    expect(result.current.bottomBanners).toHaveLength(1);
    expect(result.current.bottomBanners[0].id).toBe("bot");
  });
});

// ═════════════════════════════════════════════════════════════════════
// useAnnouncementBanner
// ═════════════════════════════════════════════════════════════════════

describe("useAnnouncementBanner", () => {
  it("should return first announcement banner", async () => {
    sanityClient.fetch.mockResolvedValueOnce([
      makeBanner({ _id: "ann1", position: "announcement", title: "Flash Sale" }),
    ]);

    const { result } = renderHook(() => useAnnouncementBanner());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.banner).not.toBeNull();
    expect(result.current.banner?.title).toBe("Flash Sale");
  });

  it("should return null when no announcement banners", async () => {
    sanityClient.fetch.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useAnnouncementBanner());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.banner).toBeNull();
  });
});

// ═════════════════════════════════════════════════════════════════════
// Server-side functions
// ═════════════════════════════════════════════════════════════════════

describe("fetchBanners (server-side)", () => {
  it("should fetch and transform banners", async () => {
    sanityClient.fetch.mockResolvedValueOnce([makeBanner()]);

    const banners = await fetchBanners();

    expect(banners).toHaveLength(1);
    expect(banners[0].id).toBe("banner-1");
    expect(banners[0].title).toBe("Summer Sale");
  });

  it("should filter by position when provided", async () => {
    sanityClient.fetch.mockResolvedValueOnce([]);

    await fetchBanners({ position: "shop-sidebar" });

    expect(sanityClient.fetch).toHaveBeenCalledWith(
      expect.stringContaining("$position"),
      expect.objectContaining({ position: "shop-sidebar" })
    );
  });

  it("should return empty array on error", async () => {
    sanityClient.fetch.mockRejectedValueOnce(new Error("Server error"));

    const banners = await fetchBanners();

    expect(banners).toEqual([]);
  });
});

describe("fetchBannersByPosition (server-side)", () => {
  it("should fetch banners by position", async () => {
    sanityClient.fetch.mockResolvedValueOnce([
      makeBanner({ position: "product-bottom" }),
    ]);

    const banners = await fetchBannersByPosition("product-bottom");

    expect(banners).toHaveLength(1);
  });
});

describe("fetchHomepageBanners (server-side)", () => {
  it("should return grouped homepage banners", async () => {
    sanityClient.fetch.mockResolvedValueOnce([
      makeBanner({ _id: "t", position: "homepage-top" }),
      makeBanner({ _id: "m", position: "homepage-middle" }),
      makeBanner({ _id: "b2", position: "homepage-bottom" }),
    ]);

    const result = await fetchHomepageBanners();

    expect(result.topBanners).toHaveLength(1);
    expect(result.middleBanners).toHaveLength(1);
    expect(result.bottomBanners).toHaveLength(1);
  });
});
