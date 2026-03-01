/**
 * Tests for POST/GET /api/seller/products
 * Covers: auth, validation, product creation, seller products listing
 */

jest.mock("next/server", () => {
  class MockNextResponse {
    public body: any;
    public status: number;
    constructor(body: any, init?: any) {
      this.body = body;
      this.status = init?.status || 200;
    }
    json() { return Promise.resolve(this.body); }
    static json(data: any, init?: any) { return new MockNextResponse(data, init); }
  }
  return { __esModule: true, NextResponse: MockNextResponse, NextRequest: jest.fn() };
});

const mockCookieStore = { get: jest.fn() };
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => Promise.resolve(mockCookieStore)),
}));

const mockGetUserIdFromToken = jest.fn();
jest.mock("@/lib/jwt", () => ({
  getUserIdFromToken: (...args: any[]) => mockGetUserIdFromToken(...args),
}));

const mockCreateProduct = jest.fn();
const mockFetchSellerProducts = jest.fn();
jest.mock("@/lib/sanity/products", () => ({
  createProduct: (...args: any[]) => mockCreateProduct(...args),
  fetchSellerProducts: (...args: any[]) => mockFetchSellerProducts(...args),
}));

let POST: any, GET: any;

beforeAll(async () => {
  const mod = await import("@/app/api/seller/products/route");
  POST = mod.POST;
  GET = mod.GET;
});

beforeEach(() => {
  jest.clearAllMocks();
});

function createMockRequest(options: {
  method?: string;
  body?: any;
  url?: string;
} = {}) {
  return {
    method: options.method || "POST",
    json: jest.fn().mockResolvedValue(options.body || {}),
    url: options.url || "http://localhost/api/seller/products",
    headers: { get: jest.fn().mockReturnValue("") },
  } as any;
}

describe("POST /api/seller/products", () => {
  it("should return 401 when no auth token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const res = await POST(createMockRequest({ body: {} }));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("should return 401 when sellerId cannot be determined", async () => {
    mockCookieStore.get.mockReturnValue({ value: "token123" });
    mockGetUserIdFromToken.mockReturnValue(null);
    const res = await POST(createMockRequest({ body: {} }));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error.message).toContain("identify seller");
  });

  it("should return 400 when missing required fields (no name)", async () => {
    mockCookieStore.get.mockReturnValue({ value: "token123" });
    mockGetUserIdFromToken.mockReturnValue("seller-1");
    const res = await POST(createMockRequest({
      body: { description: "test", category: "Fresh", price: 100, images: [{ url: "a.jpg" }] },
    }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return 400 when no images provided", async () => {
    mockCookieStore.get.mockReturnValue({ value: "token123" });
    mockGetUserIdFromToken.mockReturnValue("seller-1");
    const res = await POST(createMockRequest({
      body: { name: "Test", description: "test", category: "Fresh", price: 100, images: [] },
    }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.message).toContain("image is required");
  });

  it("should return 400 when hasVariants true but no variants", async () => {
    mockCookieStore.get.mockReturnValue({ value: "token123" });
    mockGetUserIdFromToken.mockReturnValue("seller-1");
    const res = await POST(createMockRequest({
      body: {
        name: "Test", description: "test", category: "Fresh", price: 100,
        images: [{ url: "a.jpg" }], hasVariants: true, variants: [],
      },
    }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.message).toContain("variant is required");
  });

  it("should create product successfully", async () => {
    mockCookieStore.get.mockReturnValue({ value: "token123" });
    mockGetUserIdFromToken.mockReturnValue("seller-1");
    mockCreateProduct.mockResolvedValue({ _id: "prod-1", slug: "test-product" });
    const res = await POST(createMockRequest({
      body: {
        name: "Test Product", description: "A great product", category: "Fresh",
        price: 150, images: [{ url: "img.jpg" }], quantity: 10,
      },
    }));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.id).toBe("prod-1");
    expect(json.data.slug).toBe("test-product");
    expect(mockCreateProduct).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Test Product", price: 150 }),
      "seller-1",
    );
  });

  it("should handle variants when hasVariants is true", async () => {
    mockCookieStore.get.mockReturnValue({ value: "token123" });
    mockGetUserIdFromToken.mockReturnValue("seller-1");
    mockCreateProduct.mockResolvedValue({ _id: "prod-2", slug: "variant-product" });
    const res = await POST(createMockRequest({
      body: {
        name: "Variant Product", description: "desc", category: "Kits",
        price: 300, images: [{ url: "img.jpg" }],
        hasVariants: true, variants: [{ name: "Small", price: 250 }],
      },
    }));
    expect(res.status).toBe(201);
    expect(mockCreateProduct).toHaveBeenCalledWith(
      expect.objectContaining({ hasVariants: true, variants: [{ name: "Small", price: 250 }] }),
      "seller-1",
    );
  });

  it("should return 500 when createProduct throws", async () => {
    mockCookieStore.get.mockReturnValue({ value: "token123" });
    mockGetUserIdFromToken.mockReturnValue("seller-1");
    mockCreateProduct.mockRejectedValue(new Error("Sanity write failed"));
    const res = await POST(createMockRequest({
      body: {
        name: "Test", description: "desc", category: "Fresh",
        price: 100, images: [{ url: "img.jpg" }],
      },
    }));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.message).toContain("Sanity write failed");
  });
});

describe("GET /api/seller/products", () => {
  it("should return 401 when no auth token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const req = createMockRequest({ url: "http://localhost/api/seller/products" });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("should return 401 when sellerId cannot be determined", async () => {
    mockCookieStore.get.mockReturnValue({ value: "token123" });
    mockGetUserIdFromToken.mockReturnValue(null);
    const req = createMockRequest({ url: "http://localhost/api/seller/products" });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("should return products for seller", async () => {
    mockCookieStore.get.mockReturnValue({ value: "token123" });
    mockGetUserIdFromToken.mockReturnValue("seller-1");
    mockFetchSellerProducts.mockResolvedValue({
      products: [{ id: "p1", name: "Product 1" }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
    const req = {
      ...createMockRequest({ url: "http://localhost/api/seller/products?page=1&limit=10" }),
      url: "http://localhost/api/seller/products?page=1&limit=10",
      headers: { get: jest.fn().mockReturnValue("") },
    };
    const res = await GET(req);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(1);
    expect(mockFetchSellerProducts).toHaveBeenCalledWith(
      expect.objectContaining({ sellerId: "seller-1" }),
    );
  });

  it("should forward search params", async () => {
    mockCookieStore.get.mockReturnValue({ value: "token123" });
    mockGetUserIdFromToken.mockReturnValue("seller-1");
    mockFetchSellerProducts.mockResolvedValue({ products: [], pagination: {} });
    const req = {
      ...createMockRequest({ url: "http://localhost/api/seller/products?page=2&limit=5&search=oyster" }),
      url: "http://localhost/api/seller/products?page=2&limit=5&search=oyster",
      headers: { get: jest.fn().mockReturnValue("") },
    };
    const res = await GET(req);
    expect(mockFetchSellerProducts).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, limit: 5, search: "oyster", sellerId: "seller-1" }),
    );
  });

  it("should return 500 when fetchSellerProducts throws", async () => {
    mockCookieStore.get.mockReturnValue({ value: "token123" });
    mockGetUserIdFromToken.mockReturnValue("seller-1");
    mockFetchSellerProducts.mockRejectedValue(new Error("Sanity fetch failed"));
    const req = {
      ...createMockRequest({ url: "http://localhost/api/seller/products" }),
      url: "http://localhost/api/seller/products",
      headers: { get: jest.fn().mockReturnValue("") },
    };
    const res = await GET(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.code).toBe("FETCH_ERROR");
  });
});
