/**
 * Tests for src/lib/ai/sanity-rag.ts
 * RAG system: fetch functions, SanityRAGCache, getAllRAGData
 */

// Override the global mock from jest.setupMocks.js to test the REAL module
jest.unmock("@/lib/ai/sanity-rag");

// sanityClient is globally mocked via jest.setup.js
// next-sanity (including groq) is globally mocked via jest.setup.js

import {
  fetchAllProducts,
  fetchAllCategories,
  fetchAllRecipes,
  fetchAllGrowers,
  fetchProductByIdentifier,
  fetchProductsByCategory,
  fetchProductsByGrower,
  ragCache,
  getAllRAGData,
} from "../sanity-rag";

const mockSanityClient = jest.requireMock("@/lib/sanity/client").sanityClient;

beforeEach(() => {
  jest.clearAllMocks();
  ragCache.clear();
});

// ---- Sample Data ----
const sampleProducts = [
  {
    _id: "prod-1",
    name: "Organic Mango",
    slug: "organic-mango",
    description: "Fresh organic mango",
    price: 150,
    image: "https://cdn.sanity.io/images/mango.jpg",
    category: "Fruits",
    inStock: true,
    grower: { name: "Farm Fresh", _id: "grower-1" },
    tags: ["organic", "fruit"],
    benefits: ["Vitamin C"],
  },
  {
    _id: "prod-2",
    name: "Local Honey",
    slug: "local-honey",
    description: "Raw local honey",
    price: 300,
    image: "https://cdn.sanity.io/images/honey.jpg",
    category: "Pantry",
    inStock: true,
    grower: { name: "Bee Happy", _id: "grower-2" },
    tags: ["natural", "sweetener"],
  },
];

const sampleCategories = [
  { _id: "cat-1", title: "Fruits", slug: "fruits", description: "Fresh fruits" },
  { _id: "cat-2", title: "Pantry", slug: "pantry" },
];

const sampleRecipes = [
  {
    _id: "recipe-1",
    title: "Mango Smoothie",
    slug: "mango-smoothie",
    description: "Refreshing smoothie",
    ingredients: ["mango", "milk", "ice"],
    cookingTime: 5,
  },
];

const sampleGrowers = [
  {
    _id: "grower-1",
    name: "Farm Fresh",
    slug: "farm-fresh",
    bio: "Family farm",
    specialties: ["Mangoes", "Papayas"],
    location: "Laguna",
  },
];

// ---- Fetch Functions ----
describe("fetchAllProducts", () => {
  it("should return products from Sanity", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(sampleProducts);

    const products = await fetchAllProducts();

    expect(products).toEqual(sampleProducts);
    expect(products).toHaveLength(2);
    expect(mockSanityClient.fetch).toHaveBeenCalledTimes(1);
  });

  it("should return empty array on null response", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(null);

    const products = await fetchAllProducts();
    expect(products).toEqual([]);
  });

  it("should return empty array on error", async () => {
    mockSanityClient.fetch.mockRejectedValueOnce(new Error("Connection failed"));

    const products = await fetchAllProducts();
    expect(products).toEqual([]);
  });
});

describe("fetchAllCategories", () => {
  it("should return categories from Sanity", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(sampleCategories);

    const categories = await fetchAllCategories();

    expect(categories).toEqual(sampleCategories);
    expect(categories).toHaveLength(2);
  });

  it("should return empty array on null", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(null);
    expect(await fetchAllCategories()).toEqual([]);
  });

  it("should return empty array on error", async () => {
    mockSanityClient.fetch.mockRejectedValueOnce(new Error("Timeout"));
    expect(await fetchAllCategories()).toEqual([]);
  });
});

describe("fetchAllRecipes", () => {
  it("should return recipes from Sanity", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(sampleRecipes);

    const recipes = await fetchAllRecipes();

    expect(recipes).toEqual(sampleRecipes);
    expect(recipes).toHaveLength(1);
  });

  it("should return empty array on null", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(null);
    expect(await fetchAllRecipes()).toEqual([]);
  });

  it("should return empty array on error", async () => {
    mockSanityClient.fetch.mockRejectedValueOnce(new Error("Error"));
    expect(await fetchAllRecipes()).toEqual([]);
  });
});

describe("fetchAllGrowers", () => {
  it("should return growers from Sanity", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(sampleGrowers);

    const growers = await fetchAllGrowers();

    expect(growers).toEqual(sampleGrowers);
    expect(growers).toHaveLength(1);
  });

  it("should return empty array on null", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(null);
    expect(await fetchAllGrowers()).toEqual([]);
  });

  it("should return empty array on error", async () => {
    mockSanityClient.fetch.mockRejectedValueOnce(new Error("Error"));
    expect(await fetchAllGrowers()).toEqual([]);
  });
});

describe("fetchProductByIdentifier", () => {
  it("should return product by ID", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(sampleProducts[0]);

    const product = await fetchProductByIdentifier("prod-1");

    expect(product).toEqual(sampleProducts[0]);
    expect(mockSanityClient.fetch).toHaveBeenCalledWith(
      expect.any(String),
      { id: "prod-1", slug: "prod-1" }
    );
  });

  it("should return product by slug", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(sampleProducts[0]);

    const product = await fetchProductByIdentifier("organic-mango");

    expect(product).toEqual(sampleProducts[0]);
    expect(mockSanityClient.fetch).toHaveBeenCalledWith(
      expect.any(String),
      { id: "organic-mango", slug: "organic-mango" }
    );
  });

  it("should return null if not found", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(null);

    const product = await fetchProductByIdentifier("nonexistent");
    expect(product).toBeNull();
  });

  it("should return null on error", async () => {
    mockSanityClient.fetch.mockRejectedValueOnce(new Error("Error"));

    const product = await fetchProductByIdentifier("prod-1");
    expect(product).toBeNull();
  });
});

describe("fetchProductsByCategory", () => {
  it("should return products filtered by category slug", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([sampleProducts[0]]);

    const products = await fetchProductsByCategory("fruits");

    expect(products).toHaveLength(1);
    expect(products[0].category).toBe("Fruits");
    expect(mockSanityClient.fetch).toHaveBeenCalledWith(
      expect.any(String),
      { categorySlug: "fruits" }
    );
  });

  it("should return empty array for unknown category", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([]);

    const products = await fetchProductsByCategory("nonexistent");
    expect(products).toEqual([]);
  });

  it("should return empty array on error", async () => {
    mockSanityClient.fetch.mockRejectedValueOnce(new Error("Error"));

    const products = await fetchProductsByCategory("fruits");
    expect(products).toEqual([]);
  });
});

describe("fetchProductsByGrower", () => {
  it("should return products filtered by grower ID", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([sampleProducts[0]]);

    const products = await fetchProductsByGrower("grower-1");

    expect(products).toHaveLength(1);
    expect(mockSanityClient.fetch).toHaveBeenCalledWith(
      expect.any(String),
      { growerId: "grower-1" }
    );
  });

  it("should return empty array for unknown grower", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(null);

    const products = await fetchProductsByGrower("nonexistent");
    expect(products).toEqual([]);
  });

  it("should return empty array on error", async () => {
    mockSanityClient.fetch.mockRejectedValueOnce(new Error("Error"));

    const products = await fetchProductsByGrower("grower-1");
    expect(products).toEqual([]);
  });
});

// ---- SanityRAGCache ----
describe("SanityRAGCache (ragCache)", () => {
  it("should fetch products on first call", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(sampleProducts);

    const products = await ragCache.getProducts();

    expect(products).toEqual(sampleProducts);
    expect(mockSanityClient.fetch).toHaveBeenCalledTimes(1);
  });

  it("should return cached products on second call", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(sampleProducts);

    await ragCache.getProducts();
    const products = await ragCache.getProducts();

    expect(products).toEqual(sampleProducts);
    // Only 1 fetch (second call hits cache)
    expect(mockSanityClient.fetch).toHaveBeenCalledTimes(1);
  });

  it("should refresh after TTL expires", async () => {
    const now = Date.now();
    jest.spyOn(Date, "now")
      .mockReturnValueOnce(now) // First shouldRefresh check
      .mockReturnValueOnce(now) // lastFetchTime set
      .mockReturnValueOnce(now + 6 * 60 * 1000) // Second shouldRefresh check (6 min later, past 5-min TTL)
      .mockReturnValueOnce(now + 6 * 60 * 1000); // lastFetchTime update

    mockSanityClient.fetch
      .mockResolvedValueOnce(sampleProducts)
      .mockResolvedValueOnce([sampleProducts[0]]); // Updated data

    await ragCache.getProducts();

    // After TTL expiry, should fetch again
    const refreshed = await ragCache.getProducts();

    expect(mockSanityClient.fetch).toHaveBeenCalledTimes(2);
    expect(refreshed).toHaveLength(1);

    jest.restoreAllMocks();
  });

  it("should clear all cached data", async () => {
    mockSanityClient.fetch.mockResolvedValue(sampleProducts);

    await ragCache.getProducts();
    ragCache.clear();

    // After clear, should fetch again
    await ragCache.getProducts();
    expect(mockSanityClient.fetch).toHaveBeenCalledTimes(2);
  });

  it("should cache categories separately", async () => {
    mockSanityClient.fetch
      .mockResolvedValueOnce(sampleProducts)
      .mockResolvedValueOnce(sampleCategories);

    const products = await ragCache.getProducts();
    const categories = await ragCache.getCategories();

    expect(products).toEqual(sampleProducts);
    expect(categories).toEqual(sampleCategories);
    expect(mockSanityClient.fetch).toHaveBeenCalledTimes(2);
  });

  it("should cache recipes and growers", async () => {
    mockSanityClient.fetch
      .mockResolvedValueOnce(sampleRecipes)
      .mockResolvedValueOnce(sampleGrowers);

    const recipes = await ragCache.getRecipes();
    const growers = await ragCache.getGrowers();

    expect(recipes).toEqual(sampleRecipes);
    expect(growers).toEqual(sampleGrowers);
  });
});

// ---- getAllRAGData ----
describe("getAllRAGData", () => {
  it("should return all data types", async () => {
    // getAllRAGData calls ragCache which calls Sanity
    // Since cache was cleared in beforeEach, all 4 fetches will trigger
    mockSanityClient.fetch
      .mockResolvedValueOnce(sampleProducts) // products
      .mockResolvedValueOnce(sampleCategories) // categories
      .mockResolvedValueOnce(sampleRecipes) // recipes
      .mockResolvedValueOnce(sampleGrowers); // growers

    const data = await getAllRAGData();

    expect(data.products).toEqual(sampleProducts);
    expect(data.categories).toEqual(sampleCategories);
    expect(data.recipes).toEqual(sampleRecipes);
    expect(data.growers).toEqual(sampleGrowers);
  });

  it("should use cached data on second call", async () => {
    mockSanityClient.fetch
      .mockResolvedValueOnce(sampleProducts)
      .mockResolvedValueOnce(sampleCategories)
      .mockResolvedValueOnce(sampleRecipes)
      .mockResolvedValueOnce(sampleGrowers);

    await getAllRAGData();
    const data = await getAllRAGData();

    // Should not have additional fetches (using cache)
    expect(mockSanityClient.fetch).toHaveBeenCalledTimes(4);
    expect(data.products).toEqual(sampleProducts);
  });

  it("should propagate errors", async () => {
    mockSanityClient.fetch.mockRejectedValue(new Error("Fatal error"));

    // getAllRAGData wraps errors but ragCache functions swallow them and return []
    // So it should still succeed but with empty arrays
    const data = await getAllRAGData();
    expect(data.products).toEqual([]);
    expect(data.categories).toEqual([]);
  });
});
