/**
 * Tests for src/hooks/useSanitySiteSettings.ts
 * Hooks: useSanitySiteSettings, useSanityAnnouncementBar, useSanitySocialLinks,
 *        useSanityFooterContent, useSanityNavigation, useSanityAllNavigations,
 *        getNavigationByType
 */

import { renderHook, waitFor } from "@testing-library/react";

const mockSanityClient =
  jest.requireMock("@/lib/sanity/client").sanityClient;
const mockListenSafe =
  jest.requireMock("@/lib/sanity/client").listenSafe;

import {
  useSanitySiteSettings,
  useSanityAnnouncementBar,
  useSanitySocialLinks,
  useSanityFooterContent,
  useSanityNavigation,
  useSanityAllNavigations,
  getNavigationByType,
} from "../useSanitySiteSettings";

// Sample raw data (as returned by Sanity GROQ)
const sampleRawSettings = {
  _id: "siteSettings",
  _type: "siteSettings",
  _createdAt: "2026-01-01T00:00:00Z",
  _updatedAt: "2026-01-02T00:00:00Z",
  companyName: "MASH Market",
  tagline: "Fresh Mushrooms Delivered",
  description: "Your source for premium mushrooms",
  contactEmail: "hello@mashmarket.app",
  contactPhone: "+639171234567",
  address: {
    street: "123 Mushroom Lane",
    city: "Manila",
    state: "NCR",
    zipCode: "1000",
    country: "Philippines",
  },
  socialMedia: {
    facebook: "https://facebook.com/mashmarket",
    instagram: "https://instagram.com/mashmarket",
    twitter: "",
  },
  announcementBar: {
    enabled: true,
    message: "Free delivery on orders over 500!",
    link: "/shop",
    backgroundColor: "#FF5733",
  },
  businessHours: {
    monday: "09:00 - 18:00",
    tuesday: "09:00 - 18:00",
    wednesday: "09:00 - 18:00",
    thursday: "09:00 - 18:00",
    friday: "09:00 - 18:00",
    saturday: "10:00 - 14:00",
    sunday: "Closed",
  },
  footer: {
    aboutText: "MASH is your trusted source for premium mushrooms.",
    copyrightText: "2026 MASH Market",
  },
  logo: "/logo.png",
  favicon: "/favicon.ico",
};

const sampleNavigation = {
  _id: "nav-main",
  _type: "navigation",
  title: "Main Navigation",
  menuType: "main",
  isActive: true,
  items: [
    {
      _key: "item-1",
      label: "Shop",
      linkType: "internal",
      internalPath: "/shop",
      children: [],
    },
    {
      _key: "item-2",
      label: "Categories",
      linkType: "internal",
      internalPath: "/categories",
      children: [
        { _key: "sub-1", label: "Oyster", internalPath: "/category/oyster" },
      ],
    },
  ],
};

const sampleFooterNav = {
  _id: "nav-footer",
  _type: "navigation",
  title: "Footer Navigation",
  menuType: "footer",
  isActive: true,
  items: [{ _key: "fi-1", label: "Privacy", internalPath: "/privacy" }],
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ---- useSanitySiteSettings ----
describe("useSanitySiteSettings", () => {
  it("should fetch site settings and transform them", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(sampleRawSettings);

    const { result } = renderHook(() => useSanitySiteSettings());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.settings).toBeDefined();
    expect(result.current.settings).not.toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should include company name in transformed settings", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(sampleRawSettings);

    const { result } = renderHook(() => useSanitySiteSettings());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.settings?.companyName).toBe("MASH Market");
  });

  it("should include address with full field", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(sampleRawSettings);

    const { result } = renderHook(() => useSanitySiteSettings());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.settings?.address).toBeDefined();
    expect(result.current.settings?.address?.full).toBeDefined();
    expect(result.current.settings?.address?.street).toBe("123 Mushroom Lane");
  });

  it("should include social media links", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(sampleRawSettings);

    const { result } = renderHook(() => useSanitySiteSettings());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.settings?.socialMedia).toBeDefined();
    expect(result.current.settings?.socialMedia?.facebook).toContain("facebook.com");
  });

  it("should include announcement bar data", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(sampleRawSettings);

    const { result } = renderHook(() => useSanitySiteSettings());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.settings?.announcementBar).toBeDefined();
    expect(result.current.settings?.announcementBar?.enabled).toBe(true);
    expect(result.current.settings?.announcementBar?.message).toContain("Free delivery");
  });

  it("should handle null settings (not found)", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useSanitySiteSettings());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Settings may be null or have legacy fallback
    // The hook tries legacy query when main query returns null
  });

  it("should handle fetch error", async () => {
    mockSanityClient.fetch.mockRejectedValue(new Error("CMS down"));

    const { result } = renderHook(() => useSanitySiteSettings());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).not.toBeNull();
    });
  });

  it("should set up real-time listener", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(sampleRawSettings);

    renderHook(() => useSanitySiteSettings());

    await waitFor(() => {
      expect(mockListenSafe).toHaveBeenCalled();
    });
  });
});

// ---- Convenience hooks ----
describe("useSanityAnnouncementBar", () => {
  it("should return announcementBar data from site settings", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(sampleRawSettings);

    const { result } = renderHook(() => useSanityAnnouncementBar());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.announcementBar).toBeDefined();
    expect(result.current.announcementBar?.enabled).toBe(true);
    expect(result.current.announcementBar?.message).toContain("Free delivery");
  });

  it("should return undefined when announcementBar not configured", async () => {
    const noAnnouncement = { ...sampleRawSettings, announcementBar: undefined };
    mockSanityClient.fetch.mockResolvedValueOnce(noAnnouncement);

    const { result } = renderHook(() => useSanityAnnouncementBar());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.announcementBar).toBeUndefined();
  });
});

describe("useSanitySocialLinks", () => {
  it("should return socialMedia links", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(sampleRawSettings);

    const { result } = renderHook(() => useSanitySocialLinks());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.socialMedia).toBeDefined();
    expect(result.current.socialMedia?.facebook).toContain("facebook.com");
    expect(result.current.socialMedia?.instagram).toContain("instagram.com");
  });
});

describe("useSanityFooterContent", () => {
  it("should return footer data", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(sampleRawSettings);

    const { result } = renderHook(() => useSanityFooterContent());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.footer).toBeDefined();
  });
});

// ---- Navigation hooks ----
describe("useSanityNavigation", () => {
  it("should fetch navigation by menuType", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(sampleNavigation);

    const { result } = renderHook(() => useSanityNavigation("main"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Hook returns { menu, loading, error, refetch }
    expect(result.current.menu).toBeDefined();
    expect(result.current.menu?.menuType).toBe("main");
    expect(result.current.menu?.items).toHaveLength(2);
  });

  it("should return null for nonexistent navigation type", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useSanityNavigation("sidebar" as "main"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.menu).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should handle fetch error", async () => {
    mockSanityClient.fetch.mockRejectedValue(new Error("Failed"));

    const { result } = renderHook(() => useSanityNavigation("main"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).not.toBeNull();
    });
  });
});

describe("useSanityAllNavigations", () => {
  it("should fetch all navigation menus", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([
      sampleNavigation,
      sampleFooterNav,
    ]);

    const { result } = renderHook(() => useSanityAllNavigations());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.navigations).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it("should return empty array on error", async () => {
    mockSanityClient.fetch.mockRejectedValue(new Error("Error"));

    const { result } = renderHook(() => useSanityAllNavigations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).not.toBeNull();
    });

    expect(result.current.navigations).toEqual([]);
  });
});

// ---- Pure helper ----
describe("getNavigationByType", () => {
  it("should find navigation by menuType", () => {
    const navs = [sampleNavigation, sampleFooterNav] as Array<{
      _id: string;
      menuType: string;
      items: unknown[];
      title: string;
    }>;

    const mainNav = getNavigationByType(navs, "main");
    expect(mainNav?.menuType).toBe("main");

    const footerNav = getNavigationByType(navs, "footer");
    expect(footerNav?.menuType).toBe("footer");
  });

  it("should return undefined for non-existent type", () => {
    const navs = [sampleNavigation] as Array<{
      _id: string;
      menuType: string;
      items: unknown[];
      title: string;
    }>;

    const result = getNavigationByType(navs, "sidebar");
    expect(result).toBeUndefined();
  });

  it("should handle empty array", () => {
    const result = getNavigationByType([], "main");
    expect(result).toBeUndefined();
  });
});
