/**
 * Tests for Sanity Stores Service
 * COVERAGE-008: Sanity Services - stores.ts
 *
 * Tests store fetching (fetchStores, fetchStoreBySlug, fetchFeaturedStores)
 * and the internal transformStore logic including helpers like buildImageUrl,
 * getDayOfWeek, checkIsOpenNow, full-address composition, and grower mapping.
 */

jest.mock("@/lib/sanity/client", () => ({
  sanityClient: { fetch: jest.fn() },
}));

import { sanityClient } from "@/lib/sanity/client";
import {
  fetchStores,
  fetchStoreBySlug,
  fetchFeaturedStores,
  type SanityStore,
  type TransformedStore,
} from "../stores";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSanityStore(overrides: Partial<SanityStore> = {}): SanityStore {
  return {
    _id: "store-1",
    _createdAt: "2025-01-01T00:00:00Z",
    _updatedAt: "2025-06-01T00:00:00Z",
    _type: "store",
    name: "MASH Main Store",
    slug: { current: "mash-main-store" },
    storeType: "main",
    description: "The primary MASH marketplace",
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
    address: {
      street: "123 Mushroom Rd",
      city: "Manila",
      state: "NCR",
      zipCode: "1000",
      country: "Philippines",
      landmark: "Near SM Mall",
    },
    coordinates: { lat: 14.5995, lng: 120.9842 },
    directionsUrl: "https://maps.google.com/some-link",
    operatingHours: {
      monday: "9:00 AM - 6:00 PM",
      tuesday: "9:00 AM - 6:00 PM",
      wednesday: "9:00 AM - 6:00 PM",
      thursday: "9:00 AM - 6:00 PM",
      friday: "9:00 AM - 6:00 PM",
      saturday: "10:00 AM - 4:00 PM",
      sunday: "Closed",
    },
    timezone: "Asia/Manila",
    hoursNote: "Closed on holidays",
    isOpen24Hours: false,
    phone: "+639171234567",
    email: "store@mashmarket.app",
    whatsapp: "+639171234567",
    messenger: "mashmushroom",
    services: ["shopping", "pickup", "same-day-delivery"],
    deliveryZones: ["Manila", "Makati", "Quezon City"],
    pickupInstructions: "Go to counter 3",
    image: {
      asset: { _ref: "image-abc123-800x600-jpg" },
      alt: "Main store front",
    },
    gallery: [
      { asset: { _ref: "image-def456-1200x900-png" }, alt: "Interior", caption: "Inside view" },
    ],
    growers: [
      {
        _id: "grower-1",
        name: "Farm Fresh",
        slug: { current: "farm-fresh" },
        tagline: "Quality mushrooms",
        isVerified: true,
        image: { asset: { _ref: "image-ghi789-400x400-webp" }, alt: "Farm logo" },
        specialties: ["oyster", "shiitake"],
        rating: 4.8,
        topProducts: [
          { _id: "prod-1", name: "Oyster Kit", slug: "oyster-kit", price: 350, mainImage: "https://cdn.example.com/img.jpg" },
        ],
      },
    ],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// fetchStores
// ---------------------------------------------------------------------------
describe("fetchStores", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns transformed stores on success", async () => {
    const raw = [makeSanityStore()];
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(raw);

    const result = await fetchStores();

    expect(sanityClient.fetch).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("store-1");
    expect(result[0].name).toBe("MASH Main Store");
    expect(result[0].slug).toBe("mash-main-store");
    expect(result[0].storeType).toBe("main");
    expect(result[0].storeTypeLabel).toBe("Main Store");
  });

  it("returns empty array when fetch returns null", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(null);
    const result = await fetchStores();
    expect(result).toEqual([]);
  });

  it("returns empty array on fetch error", async () => {
    (sanityClient.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
    const result = await fetchStores();
    expect(result).toEqual([]);
  });

  it("transforms multiple stores", async () => {
    const stores = [
      makeSanityStore({ _id: "s1", name: "Store 1" }),
      makeSanityStore({ _id: "s2", name: "Store 2", storeType: "pickup" }),
    ];
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(stores);

    const result = await fetchStores();
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("s1");
    expect(result[1].storeTypeLabel).toBe("Pickup Point");
  });
});

// ---------------------------------------------------------------------------
// fetchStoreBySlug
// ---------------------------------------------------------------------------
describe("fetchStoreBySlug", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns transformed store when found", async () => {
    const raw = makeSanityStore();
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(raw);

    const result = await fetchStoreBySlug("mash-main-store");

    expect(sanityClient.fetch).toHaveBeenCalledWith(
      expect.any(String),
      { slug: "mash-main-store" }
    );
    expect(result).not.toBeNull();
    expect(result!.slug).toBe("mash-main-store");
  });

  it("returns null when store not found", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(null);
    const result = await fetchStoreBySlug("nonexistent");
    expect(result).toBeNull();
  });

  it("returns null on fetch error", async () => {
    (sanityClient.fetch as jest.Mock).mockRejectedValueOnce(new Error("fail"));
    const result = await fetchStoreBySlug("test");
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// fetchFeaturedStores
// ---------------------------------------------------------------------------
describe("fetchFeaturedStores", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns transformed featured stores", async () => {
    const raw = [makeSanityStore({ isFeatured: true })];
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(raw);

    const result = await fetchFeaturedStores();
    expect(result).toHaveLength(1);
    expect(result[0].isFeatured).toBe(true);
  });

  it("returns empty array when none featured", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([]);
    const result = await fetchFeaturedStores();
    expect(result).toEqual([]);
  });

  it("returns empty array on error", async () => {
    (sanityClient.fetch as jest.Mock).mockRejectedValueOnce(new Error("err"));
    const result = await fetchFeaturedStores();
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Transform logic (tested via fetchStores)
// ---------------------------------------------------------------------------
describe("Store transformation", () => {
  beforeEach(() => jest.clearAllMocks());

  it("builds full address from parts", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([makeSanityStore()]);
    const [store] = await fetchStores();

    expect(store.address?.full).toBe(
      "123 Mushroom Rd, Manila, NCR, 1000, Philippines"
    );
  });

  it("handles missing address gracefully", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([
      makeSanityStore({ address: undefined }),
    ]);
    const [store] = await fetchStores();
    expect(store.address).toBeUndefined();
  });

  it("generates google maps URL from coordinates", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([makeSanityStore()]);
    const [store] = await fetchStores();
    expect(store.googleMapsUrl).toContain("14.5995");
    expect(store.googleMapsUrl).toContain("120.9842");
  });

  it("omits googleMapsUrl when no coordinates", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([
      makeSanityStore({ coordinates: undefined }),
    ]);
    const [store] = await fetchStores();
    expect(store.googleMapsUrl).toBeUndefined();
  });

  it("generates whatsapp URL", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([makeSanityStore()]);
    const [store] = await fetchStores();
    expect(store.whatsappUrl).toBe("https://wa.me/639171234567");
  });

  it("omits whatsappUrl when no whatsapp number", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([
      makeSanityStore({ whatsapp: undefined }),
    ]);
    const [store] = await fetchStores();
    expect(store.whatsappUrl).toBeUndefined();
  });

  it("formats services with labels", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([makeSanityStore()]);
    const [store] = await fetchStores();
    expect(store.servicesFormatted).toContain("In-Store Shopping");
    expect(store.servicesFormatted).toContain("In-Store Pickup");
    expect(store.servicesFormatted).toContain("Same-Day Delivery (Lalamove)");
  });

  it("falls back to raw service name for unknown service", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([
      makeSanityStore({ services: ["custom-service"] }),
    ]);
    const [store] = await fetchStores();
    expect(store.servicesFormatted).toEqual(["custom-service"]);
  });

  it("builds image URL from asset ref", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([makeSanityStore()]);
    const [store] = await fetchStores();
    expect(store.imageUrl).toContain("cdn.sanity.io");
    expect(store.imageUrl).toContain("abc123");
    expect(store.imageUrl).toContain(".jpg");
    expect(store.imageAlt).toBe("Main store front");
  });

  it("handles missing image gracefully", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([
      makeSanityStore({ image: undefined }),
    ]);
    const [store] = await fetchStores();
    expect(store.imageUrl).toBeUndefined();
  });

  it("transforms gallery items", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([makeSanityStore()]);
    const [store] = await fetchStores();
    expect(store.gallery).toHaveLength(1);
    expect(store.gallery![0].alt).toBe("Interior");
    expect(store.gallery![0].caption).toBe("Inside view");
    expect(store.gallery![0].url).toContain("def456");
  });

  it("filters out gallery items with invalid refs", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([
      makeSanityStore({
        gallery: [
          { asset: { _ref: "invalid" }, alt: "Bad" }, // invalid ref (less than 3 parts)
        ],
      }),
    ]);
    const [store] = await fetchStores();
    expect(store.gallery).toHaveLength(0);
  });

  it("transforms grower data", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([makeSanityStore()]);
    const [store] = await fetchStores();
    expect(store.growers).toHaveLength(1);
    expect(store.growers![0].id).toBe("grower-1");
    expect(store.growers![0].name).toBe("Farm Fresh");
    expect(store.growers![0].slug).toBe("farm-fresh");
    expect(store.growers![0].isVerified).toBe(true);
    expect(store.growers![0].rating).toBe(4.8);
  });

  it("sets isVerified to false by default for growers", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([
      makeSanityStore({
        growers: [
          {
            _id: "g1",
            name: "Test",
            slug: { current: "test" },
            isVerified: undefined,
          },
        ],
      }),
    ]);
    const [store] = await fetchStores();
    expect(store.growers![0].isVerified).toBe(false);
  });

  it("transforms grower top products", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([makeSanityStore()]);
    const [store] = await fetchStores();
    const topProducts = store.growers![0].topProducts!;
    expect(topProducts).toHaveLength(1);
    expect(topProducts[0].id).toBe("prod-1");
    expect(topProducts[0].name).toBe("Oyster Kit");
    expect(topProducts[0].price).toBe(350);
  });

  it("preserves isOpen24Hours flag", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([
      makeSanityStore({ isOpen24Hours: true }),
    ]);
    const [store] = await fetchStores();
    expect(store.isOpen24Hours).toBe(true);
    expect(store.isOpenNow).toBe(true);
  });

  it("detects closed status when today is Closed", async () => {
    // Force a Sunday-like scenario by setting all days to Closed
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([
      makeSanityStore({
        isOpen24Hours: false,
        operatingHours: {
          monday: "Closed",
          tuesday: "Closed",
          wednesday: "Closed",
          thursday: "Closed",
          friday: "Closed",
          saturday: "Closed",
          sunday: "Closed",
        },
      }),
    ]);
    const [store] = await fetchStores();
    expect(store.isOpenNow).toBe(false);
  });

  it("handles store with no operating hours", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([
      makeSanityStore({ operatingHours: undefined }),
    ]);
    const [store] = await fetchStores();
    expect(store.operatingHours).toBeUndefined();
    expect(store.isOpenNow).toBe(false);
  });

  it("handles store type labels for all types", async () => {
    const types: Array<SanityStore["storeType"]> = ["main", "pickup", "partner", "distribution"];
    const stores = types.map((t, i) =>
      makeSanityStore({ _id: `s-${i}`, storeType: t })
    );
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(stores);
    const result = await fetchStores();

    expect(result[0].storeTypeLabel).toBe("Main Store");
    expect(result[1].storeTypeLabel).toBe("Pickup Point");
    expect(result[2].storeTypeLabel).toBe("Partner Store");
    expect(result[3].storeTypeLabel).toBe("Distribution Center");
  });

  it("defaults isActive to true and isFeatured to false", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([
      makeSanityStore({
        isActive: undefined as unknown as boolean,
        isFeatured: undefined as unknown as boolean,
      }),
    ]);
    const [store] = await fetchStores();
    expect(store.isActive).toBe(true);
    expect(store.isFeatured).toBe(false);
  });

  it("defaults sortOrder to 0", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([
      makeSanityStore({ sortOrder: undefined as unknown as number }),
    ]);
    const [store] = await fetchStores();
    expect(store.sortOrder).toBe(0);
  });

  it("preserves timestamps", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([makeSanityStore()]);
    const [store] = await fetchStores();
    expect(store.createdAt).toBe("2025-01-01T00:00:00Z");
    expect(store.updatedAt).toBe("2025-06-01T00:00:00Z");
  });

  it("handles missing slug gracefully", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([
      makeSanityStore({ slug: undefined as unknown as { current: string } }),
    ]);
    const [store] = await fetchStores();
    expect(store.slug).toBe("");
  });
});
