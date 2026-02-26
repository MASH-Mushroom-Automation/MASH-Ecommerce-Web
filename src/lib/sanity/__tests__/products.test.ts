/**
 * Tests for src/lib/sanity/products.ts
 * Product CRUD operations, image upload, variant management, slug generation
 */

import { sanityClient } from "@/lib/sanity/client";

// Mock next-sanity createClient for getWriteClient
const mockWriteCreate = jest.fn();
const mockWritePatchSet = jest.fn().mockReturnThis();
const mockWritePatchCommit = jest.fn(() => Promise.resolve({}));
const mockWritePatch = jest.fn(() => ({
  set: mockWritePatchSet,
  commit: mockWritePatchCommit,
}));
const mockWriteFetch = jest.fn();
const mockWriteClient = {
  create: mockWriteCreate,
  patch: mockWritePatch,
  fetch: mockWriteFetch,
};

jest.mock("next-sanity", () => ({
  createClient: jest.fn(() => mockWriteClient),
}));

// Must import AFTER mocks
import {
  uploadImageToSanity,
  uploadProductImages,
  generateUniqueSlug,
  createProduct,
  fetchProductById,
  updateProduct,
  fetchCategories,
  fetchSellerProducts,
} from "../products";
import type { ProductFormData } from "../products";

// Setup env
const originalEnv = process.env;

beforeEach(() => {
  jest.clearAllMocks();
  process.env = {
    ...originalEnv,
    SANITY_API_WRITE_TOKEN: "test-write-token",
    NEXT_PUBLIC_SANITY_API_VERSION: "2024-11-26",
  };
});

afterAll(() => {
  process.env = originalEnv;
});

// ---- uploadImageToSanity ----
describe("uploadImageToSanity", () => {
  it("should throw when no write token is configured", async () => {
    delete process.env.SANITY_API_WRITE_TOKEN;
    delete process.env.SANITY_AUTH_TOKEN;
    delete process.env.NEXT_PUBLIC_SANITY_API_TOKEN;

    await expect(
      uploadImageToSanity(new File(["data"], "test.jpg", { type: "image/jpeg" }))
    ).rejects.toThrow("Failed to upload image");
  });

  it("should upload a File object and return asset data", async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        document: { _id: "image-abc-123", url: "https://cdn.sanity.io/images/test.jpg" },
      }),
    };
    jest.spyOn(global, "fetch").mockResolvedValueOnce(mockResponse as any);

    const file = new File(["imagedata"], "photo.jpg", { type: "image/jpeg" });
    const result = await uploadImageToSanity(file);

    expect(result._id).toBe("image-abc-123");
    expect(result.url).toBe("https://cdn.sanity.io/images/test.jpg");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("api.sanity.io"),
      expect.objectContaining({ method: "POST" })
    );

    (global.fetch as jest.Mock).mockRestore();
  });

  it("should upload a Buffer and return asset data", async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        document: { _id: "image-buf-456", url: "https://cdn.sanity.io/images/buf.jpg" },
      }),
    };
    jest.spyOn(global, "fetch").mockResolvedValueOnce(mockResponse as any);

    const buffer = Buffer.from("bufferdata");
    const result = await uploadImageToSanity(buffer, "buffer.jpg", "image/png");

    expect(result._id).toBe("image-buf-456");
    (global.fetch as jest.Mock).mockRestore();
  });

  it("should throw on non-OK response", async () => {
    const mockResponse = {
      ok: false,
      statusText: "Forbidden",
      text: jest.fn().mockResolvedValue("Access denied"),
    };
    jest.spyOn(global, "fetch").mockResolvedValueOnce(mockResponse as any);

    await expect(
      uploadImageToSanity(new File(["data"], "test.jpg"))
    ).rejects.toThrow("Failed to upload image");

    (global.fetch as jest.Mock).mockRestore();
  });
});

// ---- uploadProductImages ----
describe("uploadProductImages", () => {
  it("should use existing sanityAssetId when available", async () => {
    const images = [
      { id: "1", sanityAssetId: "image-existing-ref", alt: "Test", preview: "" },
    ];

    const result = await uploadProductImages(images as any);

    expect(result).toHaveLength(1);
    expect(result[0]._type).toBe("image");
    expect(result[0].asset._ref).toBe("image-existing-ref");
    expect(result[0].alt).toBe("Test");
  });

  it("should upload file when no sanityAssetId is present", async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        document: { _id: "image-new-upload", url: "https://cdn/new.jpg" },
      }),
    };
    jest.spyOn(global, "fetch").mockResolvedValueOnce(mockResponse as any);

    const file = new File(["data"], "test.jpg");
    const images = [{ id: "1", file, alt: "Alt text", preview: "" }];

    const result = await uploadProductImages(images as any);

    expect(result).toHaveLength(1);
    expect(result[0].asset._ref).toBe("image-new-upload");

    (global.fetch as jest.Mock).mockRestore();
  });

  it("should throw when image has no file or sanityAssetId", async () => {
    const images = [{ id: "orphan-img", preview: "" }];

    await expect(uploadProductImages(images as any)).rejects.toThrow(
      'Image "orphan-img" has no file or asset ID'
    );
  });

  it("should process multiple images in parallel", async () => {
    const images = [
      { id: "1", sanityAssetId: "ref-1", alt: "First", preview: "" },
      { id: "2", sanityAssetId: "ref-2", alt: "Second", preview: "" },
      { id: "3", sanityAssetId: "ref-3", alt: "Third", preview: "" },
    ];

    const result = await uploadProductImages(images as any);
    expect(result).toHaveLength(3);
    expect(result[0].asset._ref).toBe("ref-1");
    expect(result[2].asset._ref).toBe("ref-3");
  });
});

// ---- generateUniqueSlug ----
describe("generateUniqueSlug", () => {
  it("should create slug from product name", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(null);

    const slug = await generateUniqueSlug("Golden Oyster Mushroom");
    expect(slug).toBe("golden-oyster-mushroom");
  });

  it("should strip special characters", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(null);

    const slug = await generateUniqueSlug("Lion's Mane (Premium)!");
    expect(slug).toBe("lions-mane-premium");
  });

  it("should add number suffix when slug exists", async () => {
    // First check - slug exists
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce({ _id: "existing" });
    // Second check with -1 - does not exist
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(null);

    const slug = await generateUniqueSlug("Shiitake");
    expect(slug).toBe("shiitake-1");
  });

  it("should increment suffix until unique", async () => {
    (sanityClient.fetch as jest.Mock)
      .mockResolvedValueOnce({ _id: "existing" }) // base slug exists
      .mockResolvedValueOnce({ _id: "existing" }) // -1 exists
      .mockResolvedValueOnce({ _id: "existing" }) // -2 exists
      .mockResolvedValueOnce(null); // -3 does not exist

    const slug = await generateUniqueSlug("Reishi");
    expect(slug).toBe("reishi-3");
  });

  it("should handle empty/whitespace names", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(null);

    const slug = await generateUniqueSlug("  Some  Product  ");
    expect(slug).toBe("some-product");
  });
});

// ---- createProduct ----
describe("createProduct", () => {
  const baseFormData: ProductFormData = {
    name: "Test Mushroom",
    description: "A test product",
    category: "cat-123",
    price: 299,
    compareAtPrice: 399,
    quantity: 50,
    trackInventory: true,
    hasVariants: false,
    images: [{ id: "1", sanityAssetId: "image-ref-1", alt: "Main", preview: "" } as any],
  };

  it("should create product document and return _id and slug", async () => {
    // generateUniqueSlug fetch
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(null);
    // writeClient.create
    mockWriteCreate.mockResolvedValueOnce({ _id: "prod-new-123" });

    const result = await createProduct(baseFormData);

    expect(result._id).toBe("prod-new-123");
    expect(result.slug).toBe("test-mushroom");
    expect(mockWriteCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        _type: "product",
        name: "Test Mushroom",
        price: 299,
      })
    );
  });

  it("should include sellerId when provided", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(null);
    mockWriteCreate.mockResolvedValueOnce({ _id: "prod-seller-1" });

    await createProduct(baseFormData, "seller-abc");

    expect(mockWriteCreate).toHaveBeenCalledWith(
      expect.objectContaining({ sellerId: "seller-abc" })
    );
  });

  it("should create variants when hasVariants is true", async () => {
    const dataWithVariants: ProductFormData = {
      ...baseFormData,
      hasVariants: true,
      variants: [
        {
          id: "v1",
          type: "weight",
          value: "500g",
          price: 299,
          quantityInStock: 20,
          isAvailable: true,
          sku: "MUSH-500",
        } as any,
      ],
    };

    // generateUniqueSlug for product
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(null);
    // create product
    mockWriteCreate.mockResolvedValueOnce({ _id: "prod-with-variants" });
    // generateUniqueSlug for variant
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(null);
    // create variant
    mockWriteCreate.mockResolvedValueOnce({ _id: "variant-1" });
    // patch product with variant refs
    mockWritePatchCommit.mockResolvedValueOnce({});

    const result = await createProduct(dataWithVariants);
    expect(result._id).toBe("prod-with-variants");
    // Should have created both product and variant
    expect(mockWriteCreate).toHaveBeenCalledTimes(2);
  });

  it("should throw on create failure", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(null);
    mockWriteCreate.mockRejectedValueOnce(new Error("Network error"));

    await expect(createProduct(baseFormData)).rejects.toThrow(
      "Failed to create product"
    );
  });

  it("should include SEO data when provided", async () => {
    const dataWithSeo: ProductFormData = {
      ...baseFormData,
      seo: { metaTitle: "Best Mushroom", metaDescription: "Buy fresh mushrooms" },
    };

    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(null);
    mockWriteCreate.mockResolvedValueOnce({ _id: "prod-seo" });

    await createProduct(dataWithSeo);

    expect(mockWriteCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        seo: expect.objectContaining({
          metaTitle: "Best Mushroom",
        }),
      })
    );
  });
});

// ---- fetchProductById ----
describe("fetchProductById", () => {
  it("should return product when found", async () => {
    const mockProduct = {
      _id: "prod-1",
      name: "Shiitake",
      price: 199,
      stock: 100,
      slug: "shiitake",
    };
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(mockProduct);

    const result = await fetchProductById("prod-1");
    expect(result).toEqual(mockProduct);
  });

  it("should return null when product not found", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(null);

    const result = await fetchProductById("prod-nonexistent");
    expect(result).toBeNull();
  });

  it("should filter by sellerId when provided", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(null);

    await fetchProductById("prod-1", "seller-xyz");

    expect(sanityClient.fetch).toHaveBeenCalledWith(
      expect.stringContaining("sellerId == $sellerId"),
      expect.objectContaining({ sellerId: "seller-xyz" })
    );
  });

  it("should throw on fetch error", async () => {
    (sanityClient.fetch as jest.Mock).mockRejectedValueOnce(new Error("API error"));

    await expect(fetchProductById("prod-1")).rejects.toThrow(
      "Failed to fetch product"
    );
  });
});

// ---- updateProduct ----
describe("updateProduct", () => {
  const updateData: ProductFormData = {
    name: "Updated Mushroom",
    description: "Updated description",
    category: "cat-456",
    price: 349,
    quantity: 75,
    trackInventory: true,
    hasVariants: false,
    images: [{ id: "1", sanityAssetId: "image-updated", alt: "New", preview: "" } as any],
  };

  it("should update product with new data", async () => {
    mockWritePatchCommit.mockResolvedValueOnce({});
    mockWriteFetch.mockResolvedValueOnce({ slug: { current: "updated-mushroom" } });

    const result = await updateProduct("prod-1", updateData);

    expect(result._id).toBe("prod-1");
    expect(mockWritePatch).toHaveBeenCalledWith("prod-1");
    expect(mockWritePatchSet).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Updated Mushroom", price: 349 })
    );
  });

  it("should verify seller ownership when sellerId provided", async () => {
    // fetchProductById returns null (not owned)
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(null);

    await expect(
      updateProduct("prod-1", updateData, "wrong-seller")
    ).rejects.toThrow("Failed to update product");
  });

  it("should succeed when seller owns product", async () => {
    // fetchProductById for ownership check
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce({
      _id: "prod-1",
      name: "Old Name",
      sellerId: "seller-1",
    });
    mockWritePatchCommit.mockResolvedValueOnce({});
    mockWriteFetch.mockResolvedValueOnce({ slug: { current: "test-slug" } });

    const result = await updateProduct("prod-1", updateData, "seller-1");
    expect(result.slug).toBe("test-slug");
  });

  it("should return empty slug when product has no slug", async () => {
    mockWritePatchCommit.mockResolvedValueOnce({});
    mockWriteFetch.mockResolvedValueOnce(null);

    const result = await updateProduct("prod-1", updateData);
    expect(result.slug).toBe("");
  });
});

// ---- fetchCategories ----
describe("fetchCategories", () => {
  it("should fetch categories with subcategories", async () => {
    const mockCategories = [
      { _id: "cat-1", name: "Mushrooms", slug: "mushrooms", subcategories: [] },
    ];
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(mockCategories);

    const result = await fetchCategories();
    expect(result).toEqual(mockCategories);
  });
});

// ---- fetchSellerProducts ----
describe("fetchSellerProducts", () => {
  it("should return paginated products with default params", async () => {
    const mockProducts = [
      {
        _id: "prod-1",
        _createdAt: "2026-01-01T00:00:00Z",
        _updatedAt: "2026-01-02T00:00:00Z",
        name: "Oyster Mushroom",
        price: 150,
        stock: 50,
        isAvailable: true,
        mainImage: "https://cdn/oyster.jpg",
        category: { _id: "cat-1", name: "Fresh", slug: "fresh" },
      },
    ];
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(mockProducts);

    const result = await fetchSellerProducts();

    expect(result.products).toHaveLength(1);
    expect(result.products[0].id).toBe("prod-1");
    expect(result.products[0].name).toBe("Oyster Mushroom");
    expect(result.products[0].status).toBe("Active");
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(10);
    expect(result.pagination.total).toBe(1);
  });

  it("should determine status correctly", async () => {
    const mockProducts = [
      {
        _id: "p1",
        _createdAt: "2026-01-01",
        _updatedAt: "2026-01-01",
        name: "Active",
        price: 100,
        stock: 10,
        isAvailable: true,
        category: null,
      },
      {
        _id: "p2",
        _createdAt: "2026-01-01",
        _updatedAt: "2026-01-01",
        name: "Out of Stock",
        price: 100,
        stock: 0,
        isAvailable: true,
        category: null,
      },
      {
        _id: "p3",
        _createdAt: "2026-01-01",
        _updatedAt: "2026-01-01",
        name: "Inactive",
        price: 100,
        stock: 10,
        isAvailable: false,
        category: null,
      },
    ];
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(mockProducts);

    const result = await fetchSellerProducts();

    expect(result.products[0].status).toBe("Active");
    expect(result.products[1].status).toBe("Out of Stock");
    expect(result.products[2].status).toBe("Inactive");
  });

  it("should filter by sellerId when provided", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([]);

    await fetchSellerProducts({ sellerId: "seller-xyz" });

    expect(sanityClient.fetch).toHaveBeenCalledWith(
      expect.stringContaining("sellerId == $sellerId"),
      expect.objectContaining({ sellerId: "seller-xyz" })
    );
  });

  it("should apply search filter", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce([]);

    await fetchSellerProducts({ search: "oyster" });

    expect(sanityClient.fetch).toHaveBeenCalledWith(
      expect.stringContaining("name match $search"),
      expect.objectContaining({ search: "*oyster*" })
    );
  });

  it("should paginate results correctly", async () => {
    const products = Array.from({ length: 25 }, (_, i) => ({
      _id: `prod-${i}`,
      _createdAt: "2026-01-01",
      _updatedAt: "2026-01-01",
      name: `Product ${i}`,
      price: 100,
      stock: 10,
      isAvailable: true,
      category: null,
    }));
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(products);

    const result = await fetchSellerProducts({ page: 2, limit: 10 });

    expect(result.products).toHaveLength(10);
    expect(result.products[0].name).toBe("Product 10");
    expect(result.pagination.page).toBe(2);
    expect(result.pagination.totalPages).toBe(3);
    expect(result.pagination.total).toBe(25);
  });

  it("should use placeholder image when no image available", async () => {
    const mockProducts = [
      {
        _id: "p1",
        _createdAt: "2026-01-01",
        _updatedAt: "2026-01-01",
        name: "No Image",
        price: 100,
        stock: 10,
        isAvailable: true,
        mainImage: null,
        images: null,
        category: null,
      },
    ];
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(mockProducts);

    const result = await fetchSellerProducts();
    expect(result.products[0].image).toBe("/placeholder-product.jpg");
  });

  it("should use category name or Uncategorized", async () => {
    const mockProducts = [
      {
        _id: "p1",
        _createdAt: "2026-01-01",
        _updatedAt: "2026-01-01",
        name: "With Category",
        price: 100,
        stock: 10,
        isAvailable: true,
        category: { _id: "c1", name: "Fresh Mushrooms", slug: "fresh" },
      },
      {
        _id: "p2",
        _createdAt: "2026-01-01",
        _updatedAt: "2026-01-01",
        name: "No Category",
        price: 100,
        stock: 10,
        isAvailable: true,
        category: null,
      },
    ];
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(mockProducts);

    const result = await fetchSellerProducts();
    expect(result.products[0].category).toBe("Fresh Mushrooms");
    expect(result.products[1].category).toBe("Uncategorized");
  });

  it("should format weight with g suffix", async () => {
    const mockProducts = [
      {
        _id: "p1",
        _createdAt: "2026-01-01",
        _updatedAt: "2026-01-01",
        name: "Heavy",
        price: 100,
        stock: 10,
        isAvailable: true,
        weight: 500,
        category: null,
      },
    ];
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(mockProducts);

    const result = await fetchSellerProducts();
    expect(result.products[0].weight).toBe("500g");
  });
});
