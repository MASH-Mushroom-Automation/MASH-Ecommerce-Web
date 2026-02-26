/**
 * Tests for Sanity Site Settings Service
 * COVERAGE-008: Sanity Services - siteSettings.ts
 *
 * Tests getSiteSettingsForMetadata and getFullSiteSettings functions
 * with success, null, and error scenarios.
 */

jest.mock("@/lib/sanity/client", () => ({
  sanityClient: { fetch: jest.fn() },
}));

import { sanityClient } from "@/lib/sanity/client";
import {
  getSiteSettingsForMetadata,
  getFullSiteSettings,
} from "../siteSettings";

// ---------------------------------------------------------------------------
// getSiteSettingsForMetadata
// ---------------------------------------------------------------------------
describe("getSiteSettingsForMetadata", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns site settings on success", async () => {
    const mockSettings = {
      companyName: "MASH",
      tagline: "Premium Mushroom Marketplace",
      description: "The finest mushrooms in the Philippines",
      logo: "https://cdn.sanity.io/images/logo.png",
      favicon: "https://cdn.sanity.io/images/favicon.ico",
      seo: {
        metaTitle: "MASH Market",
        metaDescription: "Buy fresh mushrooms",
        keywords: ["mushrooms", "organic"],
        ogImage: "https://cdn.sanity.io/images/og.jpg",
      },
    };

    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(mockSettings);
    const result = await getSiteSettingsForMetadata();

    expect(result).toEqual(mockSettings);
    expect(result!.companyName).toBe("MASH");
    expect(result!.seo?.metaTitle).toBe("MASH Market");
  });

  it("passes revalidate: 300 cache option", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(null);
    await getSiteSettingsForMetadata();

    expect(sanityClient.fetch).toHaveBeenCalledWith(
      expect.stringContaining("siteSettings"),
      {},
      { next: { revalidate: 300 } }
    );
  });

  it("queries _type == siteSettings", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(null);
    await getSiteSettingsForMetadata();

    const query = (sanityClient.fetch as jest.Mock).mock.calls[0][0];
    expect(query).toContain('_type == "siteSettings"');
  });

  it("returns null when no settings exist", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(null);
    const result = await getSiteSettingsForMetadata();
    expect(result).toBeNull();
  });

  it("returns null on error", async () => {
    (sanityClient.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Sanity unavailable")
    );
    const result = await getSiteSettingsForMetadata();
    expect(result).toBeNull();
  });

  it("projects expected fields (logo, favicon, seo)", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(null);
    await getSiteSettingsForMetadata();

    const query = (sanityClient.fetch as jest.Mock).mock.calls[0][0];
    expect(query).toContain("companyName");
    expect(query).toContain("tagline");
    expect(query).toContain("logo");
    expect(query).toContain("favicon");
    expect(query).toContain("seo");
    expect(query).toContain("ogImage");
  });
});

// ---------------------------------------------------------------------------
// getFullSiteSettings
// ---------------------------------------------------------------------------
describe("getFullSiteSettings", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns full settings on success", async () => {
    const mockFull = {
      _id: "siteSettings-1",
      companyName: "MASH",
      tagline: "Premium Marketplace",
      description: "Full description here",
      logo: "https://cdn.sanity.io/logo.png",
      contactEmail: "info@mashmarket.app",
      contactPhone: "+639171234567",
      address: {
        street: "123 Mushroom Lane",
        city: "Manila",
        state: "NCR",
        zipCode: "1000",
        country: "Philippines",
      },
      socialMedia: {
        facebook: "https://facebook.com/mash",
        instagram: "https://instagram.com/mash",
      },
      announcementBar: {
        enabled: true,
        message: "Free shipping over 1000!",
      },
      footer: {
        aboutText: "We are MASH",
        copyrightText: "2025 MASH",
      },
      seo: {
        metaTitle: "MASH",
        metaDescription: "Mushroom marketplace",
      },
      businessHours: {
        monday: "9AM-5PM",
        timezone: "Asia/Manila",
      },
      features: {
        enableBlog: true,
        enableShop: true,
        enableGrowerProfiles: true,
      },
    };

    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(mockFull);
    const result = await getFullSiteSettings();

    expect(result).toEqual(mockFull);
    expect(result.companyName).toBe("MASH");
    expect(result.address.city).toBe("Manila");
    expect(result.features.enableBlog).toBe(true);
  });

  it("queries siteSettings with full projection", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(null);
    await getFullSiteSettings();

    const query = (sanityClient.fetch as jest.Mock).mock.calls[0][0];
    expect(query).toContain('_type == "siteSettings"');
    expect(query).toContain("contactEmail");
    expect(query).toContain("contactPhone");
    expect(query).toContain("address");
    expect(query).toContain("socialMedia");
    expect(query).toContain("announcementBar");
    expect(query).toContain("footer");
    expect(query).toContain("businessHours");
    expect(query).toContain("features");
  });

  it("uses same revalidate: 300 option", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(null);
    await getFullSiteSettings();

    expect(sanityClient.fetch).toHaveBeenCalledWith(
      expect.any(String),
      {},
      { next: { revalidate: 300 } }
    );
  });

  it("returns null when no settings exist", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(null);
    const result = await getFullSiteSettings();
    expect(result).toBeNull();
  });

  it("returns null on error", async () => {
    (sanityClient.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error")
    );
    const result = await getFullSiteSettings();
    expect(result).toBeNull();
  });
});
