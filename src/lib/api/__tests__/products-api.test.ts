/**
 * Tests for ProductsApi class (src/lib/api/products.ts)
 * Covers: mock data filtering, sorting, pagination, real API calls, error fallback, convertBackendProduct
 */

// Mock apiClient before importing
const mockGet = jest.fn();
jest.mock("../client", () => ({
  __esModule: true,
  default: { get: (...args: any[]) => mockGet(...args) },
}));

describe("ProductsApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  async function loadWithMock(useMock: boolean) {
    if (useMock) {
      process.env.NEXT_PUBLIC_USE_MOCK_DATA = "true";
    } else {
      delete process.env.NEXT_PUBLIC_USE_MOCK_DATA;
    }
    jest.resetModules();
    return await import("../products");
  }

  describe("Mock data mode", () => {
    it("should return all mock products with default params", async () => {
      const { ProductsApi } = await loadWithMock(true);
      const result = await ProductsApi.getProducts();
      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.pagination).toBeDefined();
      expect(result.pagination!.page).toBe(1);
    });

    it("should filter by category", async () => {
      const { ProductsApi } = await loadWithMock(true);
      const result = await ProductsApi.getProducts({ category: "Growing Kits" });
      expect(result.success).toBe(true);
      result.data.forEach((p: any) => expect(p.category).toBe("Growing Kits"));
    });

    it("should filter by grower", async () => {
      const { ProductsApi } = await loadWithMock(true);
      const result = await ProductsApi.getProducts({ grower: "KingFarms" });
      expect(result.success).toBe(true);
      result.data.forEach((p: any) => expect(p.grower).toBe("KingFarms"));
    });

    it("should filter by minPrice", async () => {
      const { ProductsApi } = await loadWithMock(true);
      const result = await ProductsApi.getProducts({ minPrice: 350 });
      expect(result.success).toBe(true);
      result.data.forEach((p: any) => expect(p.price).toBeGreaterThanOrEqual(350));
    });

    it("should filter by maxPrice", async () => {
      const { ProductsApi } = await loadWithMock(true);
      const result = await ProductsApi.getProducts({ maxPrice: 150 });
      expect(result.success).toBe(true);
      result.data.forEach((p: any) => expect(p.price).toBeLessThanOrEqual(150));
    });

    it("should filter by search term in name", async () => {
      const { ProductsApi } = await loadWithMock(true);
      const result = await ProductsApi.getProducts({ search: "blue" });
      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it("should filter by search term in description", async () => {
      const { ProductsApi } = await loadWithMock(true);
      const result = await ProductsApi.getProducts({ search: "umami" });
      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it("should sort by price ascending", async () => {
      const { ProductsApi } = await loadWithMock(true);
      const result = await ProductsApi.getProducts({ sortBy: "price", sortOrder: "asc" });
      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i].price).toBeGreaterThanOrEqual(result.data[i - 1].price);
      }
    });

    it("should sort by price descending", async () => {
      const { ProductsApi } = await loadWithMock(true);
      const result = await ProductsApi.getProducts({ sortBy: "price", sortOrder: "desc" });
      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i].price).toBeLessThanOrEqual(result.data[i - 1].price);
      }
    });

    it("should sort by name ascending (string field)", async () => {
      const { ProductsApi } = await loadWithMock(true);
      const result = await ProductsApi.getProducts({ sortBy: "name", sortOrder: "asc" });
      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i].name.localeCompare(result.data[i - 1].name)).toBeGreaterThanOrEqual(0);
      }
    });

    it("should sort by name descending", async () => {
      const { ProductsApi } = await loadWithMock(true);
      const result = await ProductsApi.getProducts({ sortBy: "name", sortOrder: "desc" });
      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i].name.localeCompare(result.data[i - 1].name)).toBeLessThanOrEqual(0);
      }
    });

    it("should paginate results", async () => {
      const { ProductsApi } = await loadWithMock(true);
      const result = await ProductsApi.getProducts({ page: 1, limit: 3 });
      expect(result.data.length).toBeLessThanOrEqual(3);
      expect(result.pagination!.page).toBe(1);
      expect(result.pagination!.limit).toBe(3);
      expect(result.pagination!.totalPages).toBeGreaterThan(1);
    });

    it("should return correct page 2", async () => {
      const { ProductsApi } = await loadWithMock(true);
      const page1 = await ProductsApi.getProducts({ page: 1, limit: 3 });
      const page2 = await ProductsApi.getProducts({ page: 2, limit: 3 });
      expect(page2.pagination!.page).toBe(2);
      if (page1.data.length > 0 && page2.data.length > 0) {
        expect(page2.data[0].id).not.toBe(page1.data[0].id);
      }
    });

    it("should combine filters and pagination", async () => {
      const { ProductsApi } = await loadWithMock(true);
      const result = await ProductsApi.getProducts({
        category: "Growing Kits",
        page: 1,
        limit: 2,
      });
      expect(result.success).toBe(true);
      expect(result.data.length).toBeLessThanOrEqual(2);
      result.data.forEach((p: any) => expect(p.category).toBe("Growing Kits"));
    });
  });

  describe("getProductById - mock mode", () => {
    it("should find existing product", async () => {
      const { ProductsApi } = await loadWithMock(true);
      const result = await ProductsApi.getProductById("1");
      expect(result.success).toBe(true);
      expect(result.data).not.toBeNull();
      expect(result.data!.id).toBe("1");
    });

    it("should return null for non-existent product", async () => {
      const { ProductsApi } = await loadWithMock(true);
      const result = await ProductsApi.getProductById("999");
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toBe("Product not found");
    });
  });

  describe("getCategories", () => {
    it("should return unique categories", async () => {
      const { ProductsApi } = await loadWithMock(true);
      const result = await ProductsApi.getCategories();
      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      const unique = new Set(result.data);
      expect(unique.size).toBe(result.data.length);
    });
  });

  describe("getGrowers", () => {
    it("should return unique growers", async () => {
      const { ProductsApi } = await loadWithMock(true);
      const result = await ProductsApi.getGrowers();
      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      const unique = new Set(result.data);
      expect(unique.size).toBe(result.data.length);
    });
  });

  describe("searchProducts", () => {
    it("should search by name", async () => {
      const { ProductsApi } = await loadWithMock(true);
      const result = await ProductsApi.searchProducts("oyster");
      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it("should search by description", async () => {
      const { ProductsApi } = await loadWithMock(true);
      const result = await ProductsApi.searchProducts("umami");
      expect(result.data.length).toBeGreaterThan(0);
    });

    it("should search by category", async () => {
      const { ProductsApi } = await loadWithMock(true);
      const result = await ProductsApi.searchProducts("Growing Kits");
      expect(result.data.length).toBeGreaterThan(0);
    });

    it("should respect limit", async () => {
      const { ProductsApi } = await loadWithMock(true);
      const result = await ProductsApi.searchProducts("mushroom", 2);
      expect(result.data.length).toBeLessThanOrEqual(2);
    });

    it("should return empty for no match", async () => {
      const { ProductsApi } = await loadWithMock(true);
      const result = await ProductsApi.searchProducts("xyznonexistent999");
      expect(result.data).toEqual([]);
    });
  });

  describe("Real API mode", () => {
    it("should call backend for getProducts", async () => {
      const { ProductsApi } = await loadWithMock(false);
      mockGet.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            data: [
              { id: "b1", name: "Backend Product", slug: "bp", price: "99.50", stock: 10, images: ["/img.jpg"] },
            ],
            meta: { total: 1, page: 1, limit: 12, totalPages: 1 },
          },
        },
      });
      const result = await ProductsApi.getProducts({ search: "test", category: "cat1", sortBy: "name", sortOrder: "asc", minPrice: 10, maxPrice: 200 });
      expect(result.success).toBe(true);
      expect(result.data[0].name).toBe("Backend Product");
      expect(result.data[0].price).toBe(99.5);
      expect(result.data[0].image).toBe("/img.jpg");
    });

    it("should handle no images in backend product", async () => {
      const { ProductsApi } = await loadWithMock(false);
      mockGet.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            data: [
              { id: "b2", name: "No Image", slug: "ni", price: "50", stock: 0, images: [] },
            ],
            meta: { total: 1, page: 1, limit: 12, totalPages: 1 },
          },
        },
      });
      const result = await ProductsApi.getProducts();
      expect(result.data[0].image).toBe("/placeholder.jpg");
      expect(result.data[0].inStock).toBe(false);
    });

    it("should handle backend product with comparePrice and costPrice", async () => {
      const { ProductsApi } = await loadWithMock(false);
      mockGet.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            data: [
              { id: "b3", name: "Priced", slug: "p", price: "100", comparePrice: "150", costPrice: "60", stock: 5, images: ["/a.jpg"], sku: "SKU-1", minStock: 3, weight: "200g" },
            ],
            meta: { total: 1, page: 1, limit: 12, totalPages: 1 },
          },
        },
      });
      const result = await ProductsApi.getProducts();
      expect(result.data[0].comparePrice).toBe(150);
      expect(result.data[0].costPrice).toBe(60);
      expect(result.data[0].sku).toBe("SKU-1");
      expect(result.data[0].minStock).toBe(3);
      expect(result.data[0].weight).toBe("200g");
    });

    it("should fallback on API error for getProducts", async () => {
      const { ProductsApi } = await loadWithMock(false);
      mockGet.mockRejectedValueOnce(new Error("Network error"));
      const result = await ProductsApi.getProducts();
      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
      expect(result.message).toBe("Failed to fetch products");
    });

    it("should call backend for getProductById", async () => {
      const { ProductsApi } = await loadWithMock(false);
      mockGet.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            data: { id: "b1", name: "Single Product", slug: "sp", price: "200", stock: 5, images: ["/x.jpg"] },
          },
        },
      });
      const result = await ProductsApi.getProductById("b1");
      expect(result.success).toBe(true);
      expect(result.data!.name).toBe("Single Product");
    });

    it("should fallback on API error for getProductById", async () => {
      const { ProductsApi } = await loadWithMock(false);
      mockGet.mockRejectedValueOnce(new Error("Not found"));
      const result = await ProductsApi.getProductById("missing");
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
    });
  });
});
