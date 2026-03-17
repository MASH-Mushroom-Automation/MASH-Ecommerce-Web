/**
 * Tests for Sanity Growers Service
 * COVERAGE-008: Sanity Services - growers.ts
 *
 * Tests grower fetching (fetchGrowers, fetchGrowerBySlug, fetchFeaturedGrowers,
 * fetchGrowerSlugs, fetchGrowerForMetadata) and transformation logic including
 * specialty/certification labels, buildImageUrl, google maps URL, product mapping.
 */

jest.mock("@/lib/sanity/client", () => ({
  sanityClient: { fetch: jest.fn() },
}));

import { sanityClient } from "@/lib/sanity/client";
import {
  fetchGrowers,
  fetchGrowerBySlug,
  fetchFeaturedGrowers,
  fetchGrowerSlugs,
  fetchGrowerForMetadata,
  type SanityGrower,
} from "../growers";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSanityGrower(overrides: Partial<SanityGrower> = {}): SanityGrower {
  return {
    _id: "grower-1",
    _createdAt: "2025-01-15T00:00:00Z",
    _updatedAt: "2025-06-15T00:00:00Z",
    _type: "grower",
    name: "Farm Fresh Mushrooms",
    slug: { current: "farm-fresh-mushrooms" },
    tagline: "Quality since 2020",
    description: "We grow the finest mushrooms in the Philippines",
    bio: "Founded by local farmers passionate about mushrooms.",
    location: "Manila, Philippines",
    region: "NCR",
    logo: {
      asset: { _ref: "image-logo123-400x400-png" },
      alt: "Farm Fresh logo",
    },
    coverImage: {
      asset: { _ref: "image-cover456-1200x600-jpg" },
      alt: "Farm cover photo",
    },
    phone: "+639171234567",
    email: "info@farmfresh.ph",
    operatingHours: "Mon-Fri 9AM-5PM",
    coordinates: { lat: 14.5, lng: 121.0 },
    deliveryZones: ["Manila", "Makati"],
    specialties: ["oyster", "shiitake", "lions-mane"],
    certifications: ["organic", "gap"],
    socialLinks: {
      facebook: "https://facebook.com/farmfresh",
      instagram: "https://instagram.com/farmfresh",
      tiktok: "https://tiktok.com/@farmfresh",
      website: "https://farmfresh.ph",
    },
    isActive: true,
    isVerified: true,
    isFeatured: true,
    sortOrder: 1,
    joinedDate: "2020-06-01",
    products: [
      {
        _id: "prod-1",
        name: "Oyster Mushroom Kit",
        slug: { current: "oyster-mushroom-kit" },
        price: 350,
        mainImage: "https://cdn.example.com/oyster.jpg",
      },
      {
        _id: "prod-2",
        name: "Shiitake Log",
        slug: { current: "shiitake-log" },
        price: 500,
        mainImage: undefined,
      },
    ],
    suppliesTo: [
      {
        _id: "store-1",
        name: "MASH Main Store",
        slug: { current: "mash-main" },
        storeType: "main",
        address: { city: "Manila", state: "NCR" },
      },
    ],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// fetchGrowers
// ---------------------------------------------------------------------------
describe("fetchGrowers", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns transformed growers on success", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([makeSanityGrower()]);
    const result = await fetchGrowers();

    expect(sanityClient.fetch).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("grower-1");
    expect(result[0].name).toBe("Farm Fresh Mushrooms");
    expect(result[0].slug).toBe("farm-fresh-mushrooms");
  });

  it("returns empty array on error", async () => {
    (sanityClient.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network"));
    const result = await fetchGrowers();
    expect(result).toEqual([]);
  });

  it("uses revalidate cache option", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([]);
    await fetchGrowers();

    expect(sanityClient.fetch).toHaveBeenCalledWith(
      expect.any(String),
      {},
      { next: { revalidate: 300 } }
    );
  });
});

// ---------------------------------------------------------------------------
// fetchGrowerBySlug
// ---------------------------------------------------------------------------
describe("fetchGrowerBySlug", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns transformed grower when found", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(makeSanityGrower());
    const result = await fetchGrowerBySlug("farm-fresh-mushrooms");

    expect(result).not.toBeNull();
    expect(result!.slug).toBe("farm-fresh-mushrooms");
    expect(result!.tagline).toBe("Quality since 2020");
  });

  it("passes slug parameter to query", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(null);
    await fetchGrowerBySlug("test-slug");

    expect(sanityClient.fetch).toHaveBeenCalledWith(
      expect.any(String),
      { slug: "test-slug" },
      expect.anything()
    );
  });

  it("returns null when grower not found", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(null);
    const result = await fetchGrowerBySlug("nonexistent");
    expect(result).toBeNull();
  });

  it("returns null on error", async () => {
    (sanityClient.fetch as jest.Mock).mockRejectedValueOnce(new Error("Fail"));
    const result = await fetchGrowerBySlug("test");
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// fetchFeaturedGrowers
// ---------------------------------------------------------------------------
describe("fetchFeaturedGrowers", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns featured growers", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([
      makeSanityGrower({ isFeatured: true }),
    ]);
    const result = await fetchFeaturedGrowers();
    expect(result).toHaveLength(1);
    expect(result[0].isFeatured).toBe(true);
  });

  it("returns empty array on error", async () => {
    (sanityClient.fetch as jest.Mock).mockRejectedValueOnce(new Error("err"));
    const result = await fetchFeaturedGrowers();
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// fetchGrowerSlugs
// ---------------------------------------------------------------------------
describe("fetchGrowerSlugs", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns array of slug strings", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([
      { slug: "grower-a" },
      { slug: "grower-b" },
    ]);
    const result = await fetchGrowerSlugs();
    expect(result).toEqual(["grower-a", "grower-b"]);
  });

  it("filters out falsy slugs", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([
      { slug: "grower-a" },
      { slug: "" },
      { slug: null },
    ]);
    const result = await fetchGrowerSlugs();
    expect(result).toEqual(["grower-a"]);
  });

  it("returns empty array on error", async () => {
    (sanityClient.fetch as jest.Mock).mockRejectedValueOnce(new Error("err"));
    const result = await fetchGrowerSlugs();
    expect(result).toEqual([]);
  });

  it("uses long revalidation (1 hour)", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([]);
    await fetchGrowerSlugs();

    expect(sanityClient.fetch).toHaveBeenCalledWith(
      expect.any(String),
      {},
      { next: { revalidate: 3600 } }
    );
  });
});

// ---------------------------------------------------------------------------
// fetchGrowerForMetadata
// ---------------------------------------------------------------------------
describe("fetchGrowerForMetadata", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns metadata with name and description", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce({
      name: "Farm Fresh",
      description: "Quality mushrooms",
      tagline: "Since 2020",
      logo: { asset: { _ref: "image-abc-100x100-png" } },
    });
    const result = await fetchGrowerForMetadata("farm-fresh");

    expect(result).not.toBeNull();
    expect(result!.name).toBe("Farm Fresh");
    expect(result!.description).toBe("Quality mushrooms");
  });

  it("falls back to tagline when description is missing", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce({
      name: "Farm",
      description: undefined,
      tagline: "The best",
      logo: null,
    });
    const result = await fetchGrowerForMetadata("farm");
    expect(result!.description).toBe("The best");
  });

  it("builds image URL from logo ref", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce({
      name: "Farm",
      description: "Desc",
      logo: { asset: { _ref: "image-xyz-200x200-webp" } },
    });
    const result = await fetchGrowerForMetadata("farm");
    expect(result!.image).toContain("cdn.sanity.io");
    expect(result!.image).toContain("xyz");
  });

  it("returns null when grower not found", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(null);
    const result = await fetchGrowerForMetadata("nonexistent");
    expect(result).toBeNull();
  });

  it("returns null on error", async () => {
    (sanityClient.fetch as jest.Mock).mockRejectedValueOnce(new Error("fail"));
    const result = await fetchGrowerForMetadata("test");
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Grower transformation logic
// ---------------------------------------------------------------------------
describe("Grower transformation", () => {
  beforeEach(() => jest.clearAllMocks());

  it("maps specialty keys to human-readable labels", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([makeSanityGrower()]);
    const [grower] = await fetchGrowers();

    expect(grower.specialtiesFormatted).toContain("Oyster Mushrooms");
    expect(grower.specialtiesFormatted).toContain("Shiitake");
    expect(grower.specialtiesFormatted).toContain("Lion's Mane");
  });

  it("falls back to raw specialty name for unknown key", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([
      makeSanityGrower({ specialties: ["custom-shroom"] }),
    ]);
    const [grower] = await fetchGrowers();
    expect(grower.specialtiesFormatted).toEqual(["custom-shroom"]);
  });

  it("maps certification keys to labels", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([makeSanityGrower()]);
    const [grower] = await fetchGrowers();

    expect(grower.certificationsFormatted).toContain("Organic Certified");
    expect(grower.certificationsFormatted).toContain("GAP Certified");
  });

  it("falls back to raw certification name for unknown key", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([
      makeSanityGrower({ certifications: ["custom-cert"] }),
    ]);
    const [grower] = await fetchGrowers();
    expect(grower.certificationsFormatted).toEqual(["custom-cert"]);
  });

  it("generates google maps URL from coordinates", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([makeSanityGrower()]);
    const [grower] = await fetchGrowers();
    expect(grower.googleMapsUrl).toContain("14.5");
    expect(grower.googleMapsUrl).toContain("121");
    expect(grower.googleMapsUrl).toContain("google.com/maps");
  });

  it("omits google maps URL when no coordinates", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([
      makeSanityGrower({ coordinates: undefined }),
    ]);
    const [grower] = await fetchGrowers();
    expect(grower.googleMapsUrl).toBeUndefined();
  });

  it("builds logo image URL from ref", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([makeSanityGrower()]);
    const [grower] = await fetchGrowers();
    expect(grower.imageUrl).toContain("cdn.sanity.io");
    expect(grower.imageUrl).toContain("logo123");
    expect(grower.imageAlt).toBe("Farm Fresh logo");
  });

  it("builds cover image URL from ref", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([makeSanityGrower()]);
    const [grower] = await fetchGrowers();
    expect(grower.coverImageUrl).toContain("cdn.sanity.io");
    expect(grower.coverImageUrl).toContain("cover456");
    expect(grower.coverImageAlt).toBe("Farm cover photo");
  });

  it("handles missing logo gracefully", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([
      makeSanityGrower({ logo: undefined }),
    ]);
    const [grower] = await fetchGrowers();
    expect(grower.imageUrl).toBeUndefined();
  });

  it("transforms products array", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([makeSanityGrower()]);
    const [grower] = await fetchGrowers();
    expect(grower.products).toHaveLength(2);
    expect(grower.products![0].id).toBe("prod-1");
    expect(grower.products![0].name).toBe("Oyster Mushroom Kit");
    expect(grower.products![0].price).toBe(350);
    expect(grower.products![0].imageUrl).toBe("https://cdn.example.com/oyster.jpg");
  });

  it("handles product with missing mainImage", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([makeSanityGrower()]);
    const [grower] = await fetchGrowers();
    expect(grower.products![1].imageUrl).toBeUndefined();
  });

  it("counts products via productCount", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([makeSanityGrower()]);
    const [grower] = await fetchGrowers();
    expect(grower.productCount).toBe(2);
  });

  it("sets productCount to 0 when no products", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([
      makeSanityGrower({ products: undefined }),
    ]);
    const [grower] = await fetchGrowers();
    expect(grower.productCount).toBe(0);
  });

  it("transforms suppliesTo array", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([makeSanityGrower()]);
    const [grower] = await fetchGrowers();
    expect(grower.suppliesTo).toHaveLength(1);
    expect(grower.suppliesTo![0].id).toBe("store-1");
    expect(grower.suppliesTo![0].name).toBe("MASH Main Store");
    expect(grower.suppliesTo![0].storeType).toBe("main");
    expect(grower.suppliesTo![0].city).toBe("Manila");
  });

  it("defaults isActive, isVerified, isFeatured, sortOrder", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([
      makeSanityGrower({
        isActive: undefined as unknown as boolean,
        isVerified: undefined as unknown as boolean,
        isFeatured: undefined as unknown as boolean,
        sortOrder: undefined as unknown as number,
      }),
    ]);
    const [grower] = await fetchGrowers();
    expect(grower.isActive).toBe(true);
    expect(grower.isVerified).toBe(false);
    expect(grower.isFeatured).toBe(false);
    expect(grower.sortOrder).toBe(0);
  });

  it("handles missing slug gracefully", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([
      makeSanityGrower({ slug: undefined as unknown as { current: string } }),
    ]);
    const [grower] = await fetchGrowers();
    expect(grower.slug).toBe("");
  });

  it("preserves social links", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([makeSanityGrower()]);
    const [grower] = await fetchGrowers();
    expect(grower.socialLinks?.facebook).toBe("https://facebook.com/farmfresh");
    expect(grower.socialLinks?.instagram).toBe("https://instagram.com/farmfresh");
    expect(grower.socialLinks?.tiktok).toBe("https://tiktok.com/@farmfresh");
    expect(grower.socialLinks?.website).toBe("https://farmfresh.ph");
  });

  it("preserves timestamps and joinedDate", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([makeSanityGrower()]);
    const [grower] = await fetchGrowers();
    expect(grower.createdAt).toBe("2025-01-15T00:00:00Z");
    expect(grower.updatedAt).toBe("2025-06-15T00:00:00Z");
    expect(grower.joinedDate).toBe("2020-06-01");
  });

  it("handles invalid image ref (less than 3 parts)", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([
      makeSanityGrower({
        logo: { asset: { _ref: "image-short" }, alt: "Bad ref" },
      }),
    ]);
    const [grower] = await fetchGrowers();
    expect(grower.imageUrl).toBeUndefined();
  });
});
