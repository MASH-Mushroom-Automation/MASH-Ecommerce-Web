/**
 * Tests for src/lib/api/products.ts
 * ProductsApi - backend API + mock-only methods (getCategories, getGrowers, searchProducts)
 *
 * USE_MOCK_DATA is false by default so getProducts/getProductById hit apiClient.
 * We mock apiClient.get to return backend-shaped responses.
 * Methods without a USE_MOCK_DATA guard always use built-in mock data.
 */

// Mock apiClient (axios) before the module loads
jest.mock("../client", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import { ProductsApi } from "../products";
import apiClient from "../client";

const mockGet = apiClient.get as jest.Mock;

describe("ProductsApi", () => {
  /** Helper: create a backend-shaped response for apiClient.get */
  function backendResponse(
    products: Array<{
      id: string;
      name: string;
      slug: string;
      price: string;
      stock: number;
      images: string[];
    }>,
    meta = { total: 1, page: 1, limit: 12, totalPages: 1 }
  ) {
    return {
      data: {
        success: true,
        statusCode: 200,
        data: { data: products, meta },
        timestamp: new Date().toISOString(),
        path: "/products",
        correlationId: "test",
      },
    };
  }

  const sampleProduct = {
    id: "p-1",
    name: "White Oyster",
    slug: "white-oyster",
    price: "120.00",
    stock: 45,
    images: ["/white.jpg"],
  };

  beforeEach(() => {
    mockGet.mockReset();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ─── getProducts (backend path) ──────────────────────────────────────

  describe("getProducts", () => {
    it("returns products from backend", async () => {
      mockGet.mockResolvedValueOnce(
        backendResponse([sampleProduct], {
          total: 1,
          page: 1,
          limit: 12,
          totalPages: 1,
        })
      );
      const result = await ProductsApi.getProducts();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data![0].name).toBe("White Oyster");
    });

    it("converts backend price string to number", async () => {
      mockGet.mockResolvedValueOnce(backendResponse([sampleProduct]));
      const result = await ProductsApi.getProducts();
      expect(typeof result.data![0].price).toBe("number");
      expect(result.data![0].price).toBe(120);
    });

    it("returns pagination from meta", async () => {
      mockGet.mockResolvedValueOnce(
        backendResponse([sampleProduct], {
          total: 50,
          page: 2,
          limit: 10,
          totalPages: 5,
        })
      );
      const result = await ProductsApi.getProducts({ page: 2, limit: 10 });
      expect(result.pagination!.page).toBe(2);
      expect(result.pagination!.limit).toBe(10);
      expect(result.pagination!.total).toBe(50);
      expect(result.pagination!.totalPages).toBe(5);
    });

    it("passes search param to backend", async () => {
      mockGet.mockResolvedValueOnce(backendResponse([]));
      await ProductsApi.getProducts({ search: "oyster" });
      expect(mockGet).toHaveBeenCalledWith(
        "/products",
        expect.objectContaining({
          params: expect.objectContaining({ search: "oyster" }),
        })
      );
    });

    it("passes category as categoryId", async () => {
      mockGet.mockResolvedValueOnce(backendResponse([]));
      await ProductsApi.getProducts({ category: "Fresh Mushroom" });
      expect(mockGet).toHaveBeenCalledWith(
        "/products",
        expect.objectContaining({
          params: expect.objectContaining({
            categoryId: "Fresh Mushroom",
          }),
        })
      );
    });

    it("passes sortBy and sortOrder", async () => {
      mockGet.mockResolvedValueOnce(backendResponse([]));
      await ProductsApi.getProducts({
        sortBy: "price",
        sortOrder: "desc",
      });
      expect(mockGet).toHaveBeenCalledWith(
        "/products",
        expect.objectContaining({
          params: expect.objectContaining({
            sortBy: "price",
            sortOrder: "desc",
          }),
        })
      );
    });

    it("passes minPrice and maxPrice", async () => {
      mockGet.mockResolvedValueOnce(backendResponse([]));
      await ProductsApi.getProducts({ minPrice: 100, maxPrice: 500 });
      expect(mockGet).toHaveBeenCalledWith(
        "/products",
        expect.objectContaining({
          params: expect.objectContaining({
            minPrice: 100,
            maxPrice: 500,
          }),
        })
      );
    });

    it("returns error response on backend failure", async () => {
      mockGet.mockRejectedValueOnce(new Error("Network error"));
      const result = await ProductsApi.getProducts();
      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
      expect(result.message).toBe("Failed to fetch products");
    });

    it("uses default page=1 and limit=12", async () => {
      mockGet.mockResolvedValueOnce(backendResponse([]));
      await ProductsApi.getProducts();
      expect(mockGet).toHaveBeenCalledWith(
        "/products",
        expect.objectContaining({
          params: expect.objectContaining({ page: 1, limit: 12 }),
        })
      );
    });

    it("sets inStock based on stock > 0", async () => {
      mockGet.mockResolvedValueOnce(
        backendResponse([
          { ...sampleProduct, stock: 0 },
          { ...sampleProduct, id: "p-2", stock: 10 },
        ])
      );
      const result = await ProductsApi.getProducts();
      expect(result.data![0].inStock).toBe(false);
      expect(result.data![1].inStock).toBe(true);
    });

    it("uses first image as fallback image", async () => {
      mockGet.mockResolvedValueOnce(backendResponse([sampleProduct]));
      const result = await ProductsApi.getProducts();
      expect(result.data![0].image).toBe("/white.jpg");
    });
  });

  // ─── getProductById (backend path) ──────────────────────────────────

  describe("getProductById", () => {
    it("returns product for valid ID", async () => {
      mockGet.mockResolvedValueOnce({
        data: {
          success: true,
          statusCode: 200,
          data: { data: sampleProduct },
          timestamp: new Date().toISOString(),
          path: "/products/p-1",
          correlationId: "test",
        },
      });
      const result = await ProductsApi.getProductById("p-1");
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.name).toBe("White Oyster");
    });

    it("returns error for unknown ID", async () => {
      mockGet.mockRejectedValueOnce(new Error("Not found"));
      const result = await ProductsApi.getProductById("missing");
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
    });
  });

  // ─── getCategories ──────────────────────────────────────────────────

  describe("getCategories", () => {
    it("returns unique category strings", async () => {
      const result = await ProductsApi.getCategories();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      // Should be unique
      const unique = new Set(result.data!);
      expect(unique.size).toBe(result.data!.length);
    });

    it("contains expected categories", async () => {
      const result = await ProductsApi.getCategories();
      expect(result.data!).toContain("Fresh Mushroom");
      expect(result.data!).toContain("Growing Kits");
    });
  });

  // ─── getGrowers ─────────────────────────────────────────────────────

  describe("getGrowers", () => {
    it("returns unique grower strings", async () => {
      const result = await ProductsApi.getGrowers();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      const unique = new Set(result.data!);
      expect(unique.size).toBe(result.data!.length);
    });

    it("contains known growers", async () => {
      const result = await ProductsApi.getGrowers();
      expect(result.data!).toContain("FungiFreshFarms");
    });
  });

  // ─── searchProducts ─────────────────────────────────────────────────

  describe("searchProducts", () => {
    it("returns matching products", async () => {
      const result = await ProductsApi.searchProducts("Mushroom");
      expect(result.success).toBe(true);
      expect(result.data!.length).toBeGreaterThan(0);
    });

    it("respects custom limit", async () => {
      const result = await ProductsApi.searchProducts("Mushroom", 2);
      expect(result.data!.length).toBeLessThanOrEqual(2);
    });

    it("returns empty array for no match", async () => {
      const result = await ProductsApi.searchProducts("zzzznonexistent");
      expect(result.data).toHaveLength(0);
    });

    it("searches across name, description and category", async () => {
      const result = await ProductsApi.searchProducts("Kit");
      expect(result.success).toBe(true);
      result.data!.forEach((p) => {
        const match =
          p.name.toLowerCase().includes("kit") ||
          p.description?.toLowerCase().includes("kit") ||
          p.category.toLowerCase().includes("kit");
        expect(match).toBe(true);
      });
    });

    it("uses default limit of 10", async () => {
      const result = await ProductsApi.searchProducts("Mushroom");
      expect(result.data!.length).toBeLessThanOrEqual(10);
    });
  });
});
