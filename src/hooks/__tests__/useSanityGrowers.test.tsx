/**
 * useSanityGrowers Hook Tests - COVERAGE-011
 *
 * Tests 5 hooks from src/hooks/useSanityGrowers.ts:
 * - useSanityGrowers(filters?): Fetches all growers with real-time updates
 * - useSanityGrower(slug): Fetches single grower by slug
 * - useSanityGrowerProducts(growerId, limit?): Fetches products for a grower
 * - useSanityActiveGrowers(limit?): Convenience wrapper for active growers
 * - useSanityGrowersByRegion(region, limit?): Convenience wrapper for region filter
 *
 * Key: Uses sanityClient.fetch() from global jest.setup.js mock
 * Uses listenSafe for real-time subscriptions
 * Error type: Error | null
 * Loading property: loading (not isLoading)
 */

import { renderHook, waitFor, act } from "@testing-library/react";
import {
  useSanityGrowers,
  useSanityGrower,
  useSanityGrowerProducts,
  useSanityActiveGrowers,
  useSanityGrowersByRegion,
} from "../useSanityGrowers";

// Access the globally mocked sanityClient
const { sanityClient } = jest.requireMock("@/lib/sanity/client");

// ============================================================================
// MOCK DATA
// ============================================================================

function makeSanityGrower(overrides?: Partial<any>) {
  return {
    _id: "grower-1",
    _createdAt: "2026-01-01T00:00:00Z",
    _updatedAt: "2026-01-15T00:00:00Z",
    name: "Manila Urban Farm",
    slug: { current: "manila-urban-farm", _type: "slug" },
    bio: "Urban mushroom farm",
    tagline: "Fresh from the city",
    description: "A sustainable mushroom farm",
    location: "Manila",
    region: "Metro Manila",
    image: "https://cdn.sanity.io/images/test/production/grower1.jpg",
    coverImage: "https://cdn.sanity.io/images/test/production/cover1.jpg",
    farmImages: ["https://cdn.sanity.io/images/test/production/farm1.jpg"],
    specialties: ["Oyster", "Shiitake"],
    certifications: ["Organic"],
    contactEmail: "farm@test.com",
    contactPhone: "+63912345678",
    phone: "+63912345678",
    email: "farm@test.com",
    operatingHours: "9AM-5PM",
    coordinates: { lat: 14.5, lng: 121.0 },
    isActive: true,
    isVerified: true,
    isFeatured: false,
    rating: 4.5,
    totalReviews: 10,
    joinedDate: "2025-01-01",
    socialLinks: {
      facebook: "https://fb.com/farm",
      instagram: "https://ig.com/farm",
    },
    productCount: 5,
    availableAtStores: [
      {
        _id: "store-1",
        name: "Manila Store",
        slug: { current: "manila-store" },
        storeType: "main",
        address: { city: "Manila", state: "NCR" },
        image: null,
      },
    ],
    ...overrides,
  };
}

function makeSanityGrower2() {
  return makeSanityGrower({
    _id: "grower-2",
    name: "Batangas Mushroom Co",
    slug: { current: "batangas-mushroom", _type: "slug" },
    region: "Calabarzon",
    isActive: false,
  });
}

const mockGrowerProduct = {
  _id: "product-1",
  _createdAt: "2026-01-01T00:00:00Z",
  _updatedAt: "2026-01-15T00:00:00Z",
  name: "Oyster Mushroom 500g",
  slug: { current: "oyster-mushroom-500g" },
  description: "Fresh oyster mushroom pack",
  price: 150,
  mainImage: "https://cdn.sanity.io/images/test/production/product1.jpg",
  images: ["https://cdn.sanity.io/images/test/production/img1.jpg"],
  category: { _id: "cat-1", name: "Fresh Mushrooms", slug: { current: "fresh" } },
  inStock: true,
  featured: false,
  unit: "pack",
  weight: "500g",
};

// ============================================================================
// useSanityGrowers
// ============================================================================

describe("useSanityGrowers", () => {
  beforeEach(() => {
    sanityClient.fetch.mockReset();
    sanityClient.fetch.mockResolvedValue([]);
  });

  it("should fetch growers and transform them", async () => {
    sanityClient.fetch.mockResolvedValueOnce([makeSanityGrower()]);

    const { result } = renderHook(() => useSanityGrowers());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.growers).toHaveLength(1);
    expect(result.current.growers[0].id).toBe("grower-1");
    expect(result.current.growers[0].name).toBe("Manila Urban Farm");
    expect(result.current.growers[0].slug).toBe("manila-urban-farm");
    expect(result.current.error).toBeNull();
  });

  it("should transform grower fields correctly", async () => {
    sanityClient.fetch.mockResolvedValueOnce([makeSanityGrower()]);

    const { result } = renderHook(() => useSanityGrowers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const grower = result.current.growers[0];
    expect(grower.id).toBe("grower-1");
    expect(grower.image).toBe("https://cdn.sanity.io/images/test/production/grower1.jpg");
    expect(grower.logo).toBe(grower.image); // logo is alias for image
    expect(grower.specialties).toEqual(["Oyster", "Shiitake"]);
    expect(grower.isActive).toBe(true);
    expect(grower.rating).toBe(4.5);
    expect(grower.productCount).toBe(5);
    expect(grower.createdAt).toBe("2026-01-01T00:00:00Z");
    expect(grower.updatedAt).toBe("2026-01-15T00:00:00Z");
  });

  it("should transform linked stores", async () => {
    sanityClient.fetch.mockResolvedValueOnce([makeSanityGrower()]);

    const { result } = renderHook(() => useSanityGrowers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const stores = result.current.growers[0].availableAtStores;
    expect(stores).toHaveLength(1);
    expect(stores![0].id).toBe("store-1");
    expect(stores![0].name).toBe("Manila Store");
    expect(stores![0].slug).toBe("manila-store");
    expect(stores![0].storeType).toBe("main");
  });

  it("should handle default values for missing fields", async () => {
    sanityClient.fetch.mockResolvedValueOnce([
      makeSanityGrower({
        image: null,
        farmImages: null,
        specialties: null,
        certifications: null,
        rating: null,
        totalReviews: null,
        productCount: null,
        isVerified: null,
        isFeatured: null,
      }),
    ]);

    const { result } = renderHook(() => useSanityGrowers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const grower = result.current.growers[0];
    expect(grower.image).toBe("/images/default-grower.jpg");
    expect(grower.farmImages).toEqual([]);
    expect(grower.specialties).toEqual([]);
    expect(grower.certifications).toEqual([]);
    expect(grower.rating).toBe(0);
    expect(grower.totalReviews).toBe(0);
    expect(grower.productCount).toBe(0);
    expect(grower.isVerified).toBe(false);
    expect(grower.isFeatured).toBe(false);
  });

  it("should handle fetch error", async () => {
    sanityClient.fetch.mockRejectedValueOnce(new Error("GROQ query failed"));

    const { result } = renderHook(() => useSanityGrowers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.growers).toEqual([]);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("GROQ query failed");
  });

  it("should provide refetch function", async () => {
    sanityClient.fetch.mockResolvedValue([]);

    const { result } = renderHook(() => useSanityGrowers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe("function");
  });
});

// ============================================================================
// useSanityGrower (single grower by slug)
// ============================================================================

describe("useSanityGrower", () => {
  beforeEach(() => {
    sanityClient.fetch.mockReset();
    sanityClient.fetch.mockResolvedValue(null);
  });

  it("should fetch single grower by slug", async () => {
    sanityClient.fetch.mockResolvedValueOnce(makeSanityGrower());

    const { result } = renderHook(() => useSanityGrower("manila-urban-farm"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.grower).not.toBeNull();
    expect(result.current.grower?.id).toBe("grower-1");
    expect(result.current.grower?.name).toBe("Manila Urban Farm");
    expect(result.current.error).toBeNull();
  });

  it("should return null for non-existent grower", async () => {
    sanityClient.fetch.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useSanityGrower("non-existent"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.grower).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should handle empty slug by not fetching", () => {
    const { result } = renderHook(() => useSanityGrower(""));

    // Empty slug: useEffect early-returns without calling fetchGrower.
    // loading stays at initial useState(true). No fetch should be called.
    expect(result.current.loading).toBe(true);
    expect(result.current.grower).toBeNull();
    expect(sanityClient.fetch).not.toHaveBeenCalled();
  });

  it("should handle fetch error", async () => {
    sanityClient.fetch.mockRejectedValueOnce(new Error("Sanity down"));

    const { result } = renderHook(() => useSanityGrower("some-slug"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("Sanity down");
  });
});

// ============================================================================
// useSanityGrowerProducts
// ============================================================================

describe("useSanityGrowerProducts", () => {
  beforeEach(() => {
    sanityClient.fetch.mockReset();
    sanityClient.fetch.mockResolvedValue([]);
  });

  it("should fetch products for a grower", async () => {
    sanityClient.fetch.mockResolvedValueOnce([mockGrowerProduct]);

    const { result } = renderHook(() => useSanityGrowerProducts("grower-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.products).toHaveLength(1);
    expect(result.current.products[0].name).toBe("Oyster Mushroom 500g");
    expect(result.current.products[0].price).toBe(150);
    expect(result.current.error).toBeNull();
  });

  it("should handle empty growerId by not fetching", () => {
    const { result } = renderHook(() => useSanityGrowerProducts(""));

    // Empty growerId: useEffect early-returns without calling fetchProducts.
    // loading stays at initial useState(true). No fetch should be called.
    expect(result.current.loading).toBe(true);
    expect(result.current.products).toEqual([]);
    expect(sanityClient.fetch).not.toHaveBeenCalled();
  });

  it("should handle fetch error", async () => {
    sanityClient.fetch.mockRejectedValueOnce(new Error("Products query failed"));

    const { result } = renderHook(() => useSanityGrowerProducts("grower-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error?.message).toBe("Products query failed");
  });

  it("should provide refetch function", async () => {
    sanityClient.fetch.mockResolvedValue([]);

    const { result } = renderHook(() => useSanityGrowerProducts("grower-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe("function");
  });
});

// ============================================================================
// useSanityActiveGrowers (convenience wrapper)
// ============================================================================

describe("useSanityActiveGrowers", () => {
  beforeEach(() => {
    sanityClient.fetch.mockReset();
    sanityClient.fetch.mockResolvedValue([]);
  });

  it("should fetch only active growers", async () => {
    sanityClient.fetch.mockResolvedValueOnce([makeSanityGrower()]);

    const { result } = renderHook(() => useSanityActiveGrowers(10));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify sanityClient.fetch was called (the filter is applied in GROQ query string)
    expect(sanityClient.fetch).toHaveBeenCalled();
    expect(result.current.growers).toHaveLength(1);
  });
});

// ============================================================================
// useSanityGrowersByRegion (convenience wrapper)
// ============================================================================

describe("useSanityGrowersByRegion", () => {
  beforeEach(() => {
    sanityClient.fetch.mockReset();
    sanityClient.fetch.mockResolvedValue([]);
  });

  it("should fetch growers by region", async () => {
    sanityClient.fetch.mockResolvedValueOnce([makeSanityGrower()]);

    const { result } = renderHook(() => useSanityGrowersByRegion("Metro Manila"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(sanityClient.fetch).toHaveBeenCalled();
    expect(result.current.growers).toHaveLength(1);
  });
});
