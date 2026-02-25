/**
 * Tests for src/hooks/useSanityCategories.ts
 * Hooks: useSanityCategories, useSanityCategory, useSanityParentCategories,
 *        useSanitySubcategories, useSanityProductsByCategory
 */

import { renderHook, waitFor, act } from "@testing-library/react";

const mockSanityClient =
  jest.requireMock("@/lib/sanity/client").sanityClient;
const mockListenSafe =
  jest.requireMock("@/lib/sanity/client").listenSafe;

import {
  useSanityCategories,
  useSanityCategory,
  useSanityParentCategories,
  useSanitySubcategories,
  useSanityProductsByCategory,
} from "../useSanityCategories";

// Sample data
const sampleCategory = {
  _id: "cat-1",
  _type: "category",
  name: "Oyster Mushrooms",
  slug: { current: "oyster" },
  description: "Delicious oyster varieties",
  image: { asset: { _ref: "image-cat1", url: "https://cdn.sanity.io/cat1.jpg" } },
  parent: null,
  order: 1,
  isActive: true,
  productCount: 8,
};

const sampleChildCategory = {
  _id: "cat-2",
  _type: "category",
  name: "Blue Oyster",
  slug: { current: "blue-oyster" },
  description: "Blue oyster mushroom variety",
  parent: { _ref: "cat-1" },
  order: 1,
  isActive: true,
  productCount: 3,
};

const sampleCategory3 = {
  _id: "cat-3",
  _type: "category",
  name: "Shiitake",
  slug: { current: "shiitake" },
  parent: null,
  order: 2,
  isActive: true,
  productCount: 5,
};

const sampleProduct = {
  _id: "prod-1",
  name: "King Oyster 500g",
  slug: { current: "king-oyster-500g" },
  price: 150,
  mainImage: "https://cdn.sanity.io/prod1.jpg",
  isAvailable: true,
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ---- useSanityCategories ----
describe("useSanityCategories", () => {
  it("should fetch all categories and set loading states", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([
      sampleCategory,
      sampleChildCategory,
      sampleCategory3,
    ]);

    const { result } = renderHook(() => useSanityCategories());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.categories).toHaveLength(3);
    expect(result.current.error).toBeNull();
  });

  it("should support limit filter", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([sampleCategory]);

    const { result } = renderHook(() =>
      useSanityCategories({ limit: 1 })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.categories).toHaveLength(1);
  });

  it("should support includeProductCount filter", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([
      { ...sampleCategory, productCount: 8 },
    ]);

    const { result } = renderHook(() =>
      useSanityCategories({ includeProductCount: true })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Query should include count() expression
    const query = mockSanityClient.fetch.mock.calls[0][0];
    expect(query).toContain("count(");
  });

  it("should handle fetch error", async () => {
    mockSanityClient.fetch.mockRejectedValueOnce(new Error("DB error"));

    const { result } = renderHook(() => useSanityCategories());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error?.message).toBe("DB error");
    expect(result.current.categories).toEqual([]);
  });

  it("should support refetch", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([sampleCategory]);

    const { result } = renderHook(() => useSanityCategories());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.categories).toHaveLength(1);

    // Refetch with new data
    mockSanityClient.fetch.mockResolvedValueOnce([
      sampleCategory,
      sampleCategory3,
    ]);

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.categories).toHaveLength(2));
  });

  it("should set up real-time listener", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([sampleCategory]);

    renderHook(() => useSanityCategories());

    await waitFor(() => {
      expect(mockListenSafe).toHaveBeenCalled();
    });
  });
});

// ---- useSanityCategory (single) ----
describe("useSanityCategory", () => {
  it("should fetch category by slug", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(sampleCategory);

    const { result } = renderHook(() => useSanityCategory("oyster"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.category).toBeDefined();
    expect(result.current.category?.name).toBe("Oyster Mushrooms");
    expect(result.current.error).toBeNull();
    expect(mockSanityClient.fetch).toHaveBeenCalledWith(
      expect.any(String),
      { slug: "oyster" }
    );
  });

  it("should return null for non-existent slug", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useSanityCategory("nonexistent"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.category).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should not fetch when slug is empty", async () => {
    renderHook(() => useSanityCategory(""));

    expect(mockSanityClient.fetch).not.toHaveBeenCalled();
  });

  it("should handle fetch error", async () => {
    mockSanityClient.fetch.mockRejectedValueOnce(new Error("Not found"));

    const { result } = renderHook(() => useSanityCategory("oyster"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error?.message).toBe("Not found");
    expect(result.current.category).toBeNull();
  });
});

// ---- useSanityParentCategories ----
describe("useSanityParentCategories", () => {
  it("should fetch only parent (root) categories", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([
      sampleCategory,
      sampleCategory3,
    ]);

    const { result } = renderHook(() => useSanityParentCategories());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.categories).toHaveLength(2);
    // Query should filter for parent == null
    const query = mockSanityClient.fetch.mock.calls[0][0];
    expect(query).toContain("parent");
  });

  it("should return empty on error", async () => {
    mockSanityClient.fetch.mockRejectedValueOnce(new Error("Fail"));

    const { result } = renderHook(() => useSanityParentCategories());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.categories).toEqual([]);
    expect(result.current.error).toBeDefined();
  });
});

// ---- useSanitySubcategories ----
describe("useSanitySubcategories", () => {
  it("should fetch subcategories for a parent", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([sampleChildCategory]);

    const { result } = renderHook(() => useSanitySubcategories("cat-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.categories).toHaveLength(1);
    expect(result.current.categories[0].name).toBe("Blue Oyster");
    expect(mockSanityClient.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ parentId: "cat-1" })
    );
  });

  it("should return empty when no parentId", async () => {
    const { result } = renderHook(() => useSanitySubcategories(""));

    // Hook has loading initially true, useEffect returns early for empty parentId
    // but fetchSubcategories is NOT called from useEffect, so loading stays true
    // The categories remain at initial empty array
    expect(result.current.categories).toEqual([]);
    expect(mockSanityClient.fetch).not.toHaveBeenCalled();
  });

  it("should handle fetch error", async () => {
    mockSanityClient.fetch.mockRejectedValueOnce(new Error("Error"));

    const { result } = renderHook(() => useSanitySubcategories("cat-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.categories).toEqual([]);
    expect(result.current.error).toBeDefined();
  });
});

// ---- useSanityProductsByCategory ----
describe("useSanityProductsByCategory", () => {
  it("should fetch products for a category slug", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([sampleProduct]);

    const { result } = renderHook(() =>
      useSanityProductsByCategory("oyster")
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.products).toHaveLength(1);
    expect(result.current.products[0].name).toBe("King Oyster 500g");
    expect(result.current.error).toBeNull();
  });

  it("should support limit parameter", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([sampleProduct]);

    renderHook(() => useSanityProductsByCategory("oyster", 5));

    await waitFor(() => {
      const query = mockSanityClient.fetch.mock.calls[0][0];
      expect(query).toContain("[0...");
    });
  });

  it("should not fetch when slug is empty", async () => {
    const { result } = renderHook(() => useSanityProductsByCategory(""));

    // Hook has loading initially true, useEffect returns early for empty slug
    // without calling fetchProducts, so loading stays true
    expect(result.current.products).toEqual([]);
    expect(mockSanityClient.fetch).not.toHaveBeenCalled();
  });

  it("should handle fetch error", async () => {
    mockSanityClient.fetch.mockRejectedValueOnce(new Error("Timeout"));

    const { result } = renderHook(() =>
      useSanityProductsByCategory("oyster")
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.products).toEqual([]);
    expect(result.current.error?.message).toBe("Timeout");
  });

  it("should return empty for nonexistent category", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce([]);

    const { result } = renderHook(() =>
      useSanityProductsByCategory("fake-category")
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.products).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
