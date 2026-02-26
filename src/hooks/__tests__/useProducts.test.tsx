/**
 * useProducts Hook Tests - COVERAGE-016
 *
 * Tests for useProducts, useProduct, useProductCategories,
 * useProductGrowers, and useProductSearch hooks.
 *
 * Hook source: src/hooks/useProducts.ts
 * API module: src/lib/api/products.ts (ProductsApi static class)
 *
 * Mock strategy: jest.mock with inline factory + jest.requireMock
 * Response format: ApiResponse { data: T, success?: boolean, message?: string, pagination?: ... }
 */

import { renderHook, act, waitFor } from "@testing-library/react";

// --- Mock ProductsApi with inline factory (avoids hoisting issue) ---
jest.mock("@/lib/api/products", () => ({
  ProductsApi: {
    getProducts: jest.fn(),
    getProductById: jest.fn(),
    getCategories: jest.fn(),
    getGrowers: jest.fn(),
    searchProducts: jest.fn(),
  },
}));

const { ProductsApi } = jest.requireMock("@/lib/api/products") as {
  ProductsApi: {
    getProducts: jest.Mock;
    getProductById: jest.Mock;
    getCategories: jest.Mock;
    getGrowers: jest.Mock;
    searchProducts: jest.Mock;
  };
};

import {
  useProducts,
  useProduct,
  useProductCategories,
  useProductGrowers,
  useProductSearch,
} from "../useProducts";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockProduct = {
  id: "prod-1",
  name: "Organic Mango",
  price: 150,
  slug: "organic-mango",
  category: "fruits",
};

const mockProduct2 = {
  id: "prod-2",
  name: "Fresh Basil",
  price: 50,
  slug: "fresh-basil",
  category: "herbs",
};

const mockPagination = {
  page: 1,
  limit: 10,
  total: 25,
  totalPages: 3,
};

// ============================================================================
// useProducts
// ============================================================================

describe("useProducts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should start in loading state", () => {
    ProductsApi.getProducts.mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useProducts());
    expect(result.current.loading).toBe(true);
    expect(result.current.products).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.pagination).toBeNull();
  });

  it("should fetch products and return data with pagination", async () => {
    ProductsApi.getProducts.mockResolvedValueOnce({
      data: [mockProduct, mockProduct2],
      pagination: mockPagination,
    });

    const { result } = renderHook(() => useProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.products).toEqual([mockProduct, mockProduct2]);
    expect(result.current.pagination).toEqual(mockPagination);
    expect(result.current.error).toBeNull();
    expect(ProductsApi.getProducts).toHaveBeenCalledWith({});
  });

  it("should pass initial params to API", async () => {
    ProductsApi.getProducts.mockResolvedValueOnce({
      data: [mockProduct],
      pagination: { page: 2, limit: 5, total: 10, totalPages: 2 },
    });

    const { result } = renderHook(() =>
      useProducts({ page: 2, limit: 5, category: "fruits" })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(ProductsApi.getProducts).toHaveBeenCalledWith({
      page: 2,
      limit: 5,
      category: "fruits",
    });
  });

  it("should handle error from API", async () => {
    ProductsApi.getProducts.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Network error");
    expect(result.current.products).toEqual([]);
    expect(result.current.pagination).toBeNull();
  });

  it("should handle non-Error exceptions", async () => {
    ProductsApi.getProducts.mockRejectedValueOnce("string error");

    const { result } = renderHook(() => useProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Failed to fetch products");
  });

  it("should handle missing pagination gracefully", async () => {
    ProductsApi.getProducts.mockResolvedValueOnce({
      data: [mockProduct],
    });

    const { result } = renderHook(() => useProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.pagination).toBeNull();
  });

  it("should refetch when calling refetch()", async () => {
    ProductsApi.getProducts
      .mockResolvedValueOnce({ data: [mockProduct] })
      .mockResolvedValueOnce({ data: [mockProduct, mockProduct2] });

    const { result } = renderHook(() => useProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.products).toHaveLength(1);

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() =>
      expect(result.current.products).toHaveLength(2)
    );
  });

  it("should refetch when params change via setParams", async () => {
    ProductsApi.getProducts
      .mockResolvedValueOnce({ data: [mockProduct] })
      .mockResolvedValueOnce({ data: [mockProduct2] });

    const { result } = renderHook(() => useProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.setParams({ category: "herbs" });
    });

    await waitFor(() =>
      expect(ProductsApi.getProducts).toHaveBeenCalledWith({
        category: "herbs",
      })
    );

    await waitFor(() =>
      expect(result.current.products).toEqual([mockProduct2])
    );
  });
});

// ============================================================================
// useProduct
// ============================================================================

describe("useProduct", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should start in loading state", () => {
    ProductsApi.getProductById.mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useProduct("prod-1"));
    expect(result.current.loading).toBe(true);
    expect(result.current.product).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should not fetch when id is empty string", async () => {
    const { result } = renderHook(() => useProduct(""));

    // When id is empty, the effect returns early without calling setLoading(false),
    // so loading stays at the initial value of true. The API is never called.
    expect(ProductsApi.getProductById).not.toHaveBeenCalled();
    expect(result.current.product).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it("should fetch product by id", async () => {
    ProductsApi.getProductById.mockResolvedValueOnce({
      success: true,
      data: mockProduct,
    });

    const { result } = renderHook(() => useProduct("prod-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.product).toEqual(mockProduct);
    expect(result.current.error).toBeNull();
    expect(ProductsApi.getProductById).toHaveBeenCalledWith("prod-1");
  });

  it("should set error when response.success is false", async () => {
    ProductsApi.getProductById.mockResolvedValueOnce({
      success: false,
      data: null,
      message: "Product not found",
    });

    const { result } = renderHook(() => useProduct("prod-999"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Product not found");
  });

  it("should use default error message when success is false and no message", async () => {
    ProductsApi.getProductById.mockResolvedValueOnce({
      success: false,
      data: null,
    });

    const { result } = renderHook(() => useProduct("prod-999"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Product not found");
  });

  it("should handle API rejection", async () => {
    ProductsApi.getProductById.mockRejectedValueOnce(new Error("Server down"));

    const { result } = renderHook(() => useProduct("prod-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Server down");
  });

  it("should handle non-Error rejection", async () => {
    ProductsApi.getProductById.mockRejectedValueOnce(42);

    const { result } = renderHook(() => useProduct("prod-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Failed to fetch product");
  });
});

// ============================================================================
// useProductCategories
// ============================================================================

describe("useProductCategories", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should start in loading state", () => {
    ProductsApi.getCategories.mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useProductCategories());
    expect(result.current.loading).toBe(true);
    expect(result.current.categories).toEqual([]);
  });

  it("should fetch and return categories", async () => {
    ProductsApi.getCategories.mockResolvedValueOnce({
      data: ["fruits", "vegetables", "herbs"],
    });

    const { result } = renderHook(() => useProductCategories());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.categories).toEqual([
      "fruits",
      "vegetables",
      "herbs",
    ]);
    expect(result.current.error).toBeNull();
  });

  it("should handle error", async () => {
    ProductsApi.getCategories.mockRejectedValueOnce(
      new Error("Category fetch failed")
    );

    const { result } = renderHook(() => useProductCategories());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Category fetch failed");
  });

  it("should handle non-Error exception", async () => {
    ProductsApi.getCategories.mockRejectedValueOnce(undefined);
    const { result } = renderHook(() => useProductCategories());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Failed to fetch categories");
  });
});

// ============================================================================
// useProductGrowers
// ============================================================================

describe("useProductGrowers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should start in loading state", () => {
    ProductsApi.getGrowers.mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useProductGrowers());
    expect(result.current.loading).toBe(true);
    expect(result.current.growers).toEqual([]);
  });

  it("should fetch and return growers", async () => {
    ProductsApi.getGrowers.mockResolvedValueOnce({
      data: ["Grower A", "Grower B"],
    });

    const { result } = renderHook(() => useProductGrowers());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.growers).toEqual(["Grower A", "Grower B"]);
    expect(result.current.error).toBeNull();
  });

  it("should handle error", async () => {
    ProductsApi.getGrowers.mockRejectedValueOnce(
      new Error("Grower fetch failed")
    );

    const { result } = renderHook(() => useProductGrowers());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Grower fetch failed");
  });

  it("should handle non-Error exception", async () => {
    ProductsApi.getGrowers.mockRejectedValueOnce(null);
    const { result } = renderHook(() => useProductGrowers());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Failed to fetch growers");
  });
});

// ============================================================================
// useProductSearch
// ============================================================================

describe("useProductSearch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should start idle (not loading, no results)", () => {
    const { result } = renderHook(() => useProductSearch());
    expect(result.current.loading).toBe(false);
    expect(result.current.searchResults).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("should search and return results", async () => {
    ProductsApi.searchProducts.mockResolvedValueOnce({
      data: [mockProduct],
    });

    const { result } = renderHook(() => useProductSearch());

    await act(async () => {
      await result.current.search("mango");
    });

    expect(result.current.searchResults).toEqual([mockProduct]);
    expect(result.current.loading).toBe(false);
    expect(ProductsApi.searchProducts).toHaveBeenCalledWith("mango", 10);
  });

  it("should pass custom limit", async () => {
    ProductsApi.searchProducts.mockResolvedValueOnce({ data: [] });

    const { result } = renderHook(() => useProductSearch());

    await act(async () => {
      await result.current.search("basil", 5);
    });

    expect(ProductsApi.searchProducts).toHaveBeenCalledWith("basil", 5);
  });

  it("should clear results when query is empty", async () => {
    const { result } = renderHook(() => useProductSearch());

    await act(async () => {
      await result.current.search("");
    });

    expect(result.current.searchResults).toEqual([]);
    expect(ProductsApi.searchProducts).not.toHaveBeenCalled();
  });

  it("should clear results when query is whitespace only", async () => {
    const { result } = renderHook(() => useProductSearch());

    await act(async () => {
      await result.current.search("   ");
    });

    expect(result.current.searchResults).toEqual([]);
    expect(ProductsApi.searchProducts).not.toHaveBeenCalled();
  });

  it("should handle search error", async () => {
    ProductsApi.searchProducts.mockRejectedValueOnce(
      new Error("Search timeout")
    );

    const { result } = renderHook(() => useProductSearch());

    await act(async () => {
      await result.current.search("mango");
    });

    expect(result.current.error).toBe("Search timeout");
    expect(result.current.searchResults).toEqual([]);
  });

  it("should handle non-Error search exception", async () => {
    ProductsApi.searchProducts.mockRejectedValueOnce("oops");

    const { result } = renderHook(() => useProductSearch());

    await act(async () => {
      await result.current.search("mango");
    });

    expect(result.current.error).toBe("Search failed");
  });
});
