/**
 * Tests for src/hooks/useSanityStores.ts
 * Hooks: useSanityStores, useSanityStore, useFeaturedStores, useStoresByType
 * Server functions: fetchStores, fetchStoreBySlug, fetchFeaturedStores
 */

import { renderHook, waitFor } from "@testing-library/react";

const mockSanityClient =
  jest.requireMock("@/lib/sanity/client").sanityClient;

import {
  useSanityStores,
  useSanityStore,
  useFeaturedStores,
  useStoresByType,
  fetchStores,
  fetchStoreBySlug,
  fetchFeaturedStores,
} from "../useSanityStores";

// Sample raw Sanity store data (SanityStore shape)
const sampleStore = {
  _id: "store-1",
  _type: "store",
  _createdAt: "2026-01-01T00:00:00Z",
  _updatedAt: "2026-01-02T00:00:00Z",
  name: "MASH Main Store",
  slug: { current: "mash-main" },
  description: "Our flagship store",
  storeType: "main",
  isFeatured: true,
  isActive: true,
  sortOrder: 1,
  address: {
    street: "123 Mushroom Blvd",
    city: "Manila",
    state: "NCR",
    zipCode: "1000",
    country: "Philippines",
  },
  coordinates: { lat: 14.5995, lng: 120.9842 },
  phone: "+639171234567",
  email: "main@mashmarket.app",
  whatsapp: "+639171234567",
  operatingHours: {
    monday: "09:00 - 18:00",
    tuesday: "09:00 - 18:00",
    wednesday: "09:00 - 18:00",
    thursday: "09:00 - 18:00",
    friday: "09:00 - 18:00",
    saturday: "10:00 - 14:00",
    sunday: "Closed",
  },
  services: ["delivery", "pickup"],
  image: null,
};

const samplePickupPoint = {
  _id: "store-2",
  _type: "store",
  _createdAt: "2026-01-01T00:00:00Z",
  _updatedAt: "2026-01-02T00:00:00Z",
  name: "MASH Pickup Point BGC",
  slug: { current: "mash-bgc" },
  storeType: "pickup",
  isFeatured: false,
  isActive: true,
  sortOrder: 2,
  address: {
    street: "456 BGC Lane",
    city: "Taguig",
    state: "NCR",
  },
  image: null,
};

const samplePartnerStore = {
  _id: "store-3",
  _type: "store",
  _createdAt: "2026-01-01T00:00:00Z",
  _updatedAt: "2026-01-02T00:00:00Z",
  name: "Partner Farm Store",
  slug: { current: "partner-farm" },
  storeType: "partner",
  isFeatured: true,
  isActive: true,
  sortOrder: 3,
  image: null,
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ---- useSanityStores ----
describe("useSanityStores", () => {
  it("should fetch all stores and set loading states", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([
      sampleStore,
      samplePickupPoint,
      samplePartnerStore,
    ]);

    const { result } = renderHook(() => useSanityStores());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.stores).toHaveLength(3);
    expect(result.current.error).toBeNull();
  });

  it("should categorize stores by type", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([
      sampleStore,
      samplePickupPoint,
      samplePartnerStore,
    ]);

    const { result } = renderHook(() => useSanityStores());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.mainStores).toHaveLength(1);
    expect(result.current.pickupPoints).toHaveLength(1);
    expect(result.current.partnerStores).toHaveLength(1);
  });

  it("should return featured stores subset", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([
      sampleStore,       // featured
      samplePickupPoint, // NOT featured
      samplePartnerStore, // featured
    ]);

    const { result } = renderHook(() => useSanityStores());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // sampleStore + samplePartnerStore are featured
    expect(result.current.featuredStores).toHaveLength(2);
  });

  it("should handle fetch error", async () => {
    mockSanityClient.fetch.mockRejectedValue(new Error("Connection refused"));

    const { result } = renderHook(() => useSanityStores());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).not.toBeNull();
    });

    expect(result.current.stores).toEqual([]);
  });

  it("should transform store with google maps URL", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([sampleStore]);

    const { result } = renderHook(() => useSanityStores());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const store = result.current.stores[0];
    expect(store.googleMapsUrl).toContain("google.com/maps");
    expect(store.googleMapsUrl).toContain("14.5995");
  });

  it("should transform store with whatsapp URL", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([sampleStore]);

    const { result } = renderHook(() => useSanityStores());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const store = result.current.stores[0];
    expect(store.whatsappUrl).toContain("wa.me");
  });
});

// ---- useSanityStore (single) ----
describe("useSanityStore", () => {
  it("should fetch a single store by slug", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(sampleStore);

    const { result } = renderHook(() => useSanityStore("mash-main"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.store).toBeDefined();
    expect(result.current.store?.name).toBe("MASH Main Store");
    expect(result.current.error).toBeNull();
  });

  it("should return null when store not found", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useSanityStore("nonexistent"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.store).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should not fetch when slug is empty", async () => {
    const { result } = renderHook(() => useSanityStore(""));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockSanityClient.fetch).not.toHaveBeenCalled();
  });

  it("should handle fetch error", async () => {
    mockSanityClient.fetch.mockRejectedValue(new Error("Timeout"));

    const { result } = renderHook(() => useSanityStore("mash-main"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).not.toBeNull();
    });

    expect(result.current.store).toBeNull();
  });
});

// ---- useFeaturedStores ----
describe("useFeaturedStores", () => {
  it("should fetch featured stores", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([
      sampleStore,
      samplePartnerStore,
    ]);

    const { result } = renderHook(() => useFeaturedStores());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.stores).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it("should return empty on fetch failure", async () => {
    mockSanityClient.fetch.mockRejectedValue(new Error("Error"));

    const { result } = renderHook(() => useFeaturedStores());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).not.toBeNull();
    });

    expect(result.current.stores).toEqual([]);
  });
});

// ---- useStoresByType ----
describe("useStoresByType", () => {
  it("should fetch stores filtered by type", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([samplePickupPoint]);

    const { result } = renderHook(() => useStoresByType("pickup"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.stores).toHaveLength(1);
    expect(mockSanityClient.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ storeType: "pickup" })
    );
  });

  it("should handle empty results", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useStoresByType("distribution"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.stores).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});

// ---- Server functions ----
describe("fetchStores (server function)", () => {
  it("should fetch all stores directly", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([sampleStore]);

    const stores = await fetchStores();

    expect(stores).toHaveLength(1);
    expect(stores[0].name).toBe("MASH Main Store");
  });

  it("should return empty array on error", async () => {
    mockSanityClient.fetch.mockRejectedValueOnce(new Error("Error"));

    const stores = await fetchStores();

    expect(stores).toEqual([]);
  });
});

describe("fetchStoreBySlug (server function)", () => {
  it("should fetch store by slug", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(sampleStore);

    const store = await fetchStoreBySlug("mash-main");

    expect(store).toBeDefined();
    expect(store?.name).toBe("MASH Main Store");
  });

  it("should return null for non-existent slug", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(null);

    const store = await fetchStoreBySlug("nope");

    expect(store).toBeNull();
  });
});

describe("fetchFeaturedStores (server function)", () => {
  it("should fetch featured stores", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([sampleStore, samplePartnerStore]);

    const stores = await fetchFeaturedStores();

    expect(stores).toHaveLength(2);
  });

  it("should return empty array on error", async () => {
    mockSanityClient.fetch.mockRejectedValueOnce(new Error("Error"));

    const stores = await fetchFeaturedStores();

    expect(stores).toEqual([]);
  });
});
