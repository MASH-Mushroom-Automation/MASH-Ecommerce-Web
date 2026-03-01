/**
 * Tests for Seller Stock Thresholds API route
 * Batch 7: Coverage improvement for POST/GET /api/seller/stock/thresholds
 */

// Mock next/server
jest.mock("next/server", () => {
  class MockNextResponse {
    body: unknown;
    status: number;
    headers: Map<string, string>;
    constructor(body: unknown, init?: { status?: number }) {
      this.body = body;
      this.status = init?.status || 200;
      this.headers = new Map();
    }
    async json() {
      return this.body;
    }
    static json(data: unknown, init?: { status?: number }) {
      return new MockNextResponse(data, init);
    }
  }
  return { __esModule: true, NextResponse: MockNextResponse, NextRequest: jest.fn() };
});

// Mock Sanity client
const mockFetch = jest.fn();
const mockPatch = jest.fn().mockReturnValue({
  set: jest.fn().mockReturnValue({
    commit: jest.fn().mockResolvedValue({}),
  }),
});

jest.mock("@sanity/client", () => ({
  createClient: jest.fn().mockReturnValue({
    fetch: (...args: unknown[]) => mockFetch(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
  }),
}));

// Helper to create mock request
function createReq(opts: {
  body?: unknown;
  url?: string;
  headers?: Record<string, string>;
  method?: string;
}) {
  const url = opts.url || "http://localhost:3000/api/seller/stock/thresholds";
  const parsedUrl = new URL(url);
  return {
    json: jest.fn().mockResolvedValue(opts.body || {}),
    url,
    nextUrl: { searchParams: parsedUrl.searchParams },
    headers: {
      get: (name: string) => opts.headers?.[name] || null,
    },
    method: opts.method || "POST",
  };
}

describe("POST /api/seller/stock/thresholds", () => {
  let POST: (req: unknown) => Promise<{ status: number; json: () => Promise<Record<string, unknown>> }>;

  beforeAll(async () => {
    const mod = await import("@/app/api/seller/stock/thresholds/route");
    POST = mod.POST as typeof POST;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({ _id: "product-1" }); // product exists by default
  });

  it("should return 400 for invalid JSON", async () => {
    const req = {
      json: jest.fn().mockRejectedValue(new SyntaxError("Unexpected token")),
      headers: { get: () => null },
    };
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Invalid JSON");
  });

  it("should return 400 for invalid validation (missing productId)", async () => {
    const req = createReq({
      body: { thresholds: { lowStockThreshold: 10, outOfStockThreshold: 0, restockLevel: 20 } },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Validation failed");
  });

  it("should return 400 when lowStock <= outOfStock", async () => {
    const req = createReq({
      body: {
        productId: "product-1",
        thresholds: { lowStockThreshold: 5, outOfStockThreshold: 10, restockLevel: 20 },
      },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.details).toBeDefined();
  });

  it("should return 400 for negative threshold values", async () => {
    const req = createReq({
      body: {
        productId: "product-1",
        thresholds: { lowStockThreshold: -1, outOfStockThreshold: 0, restockLevel: 20 },
      },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should update single product threshold successfully", async () => {
    const req = createReq({
      body: {
        productId: "product-1",
        thresholds: { lowStockThreshold: 10, outOfStockThreshold: 0, restockLevel: 20 },
      },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toContain("updated successfully");
    expect(mockPatch).toHaveBeenCalledWith("product-1");
  });

  it("should return 404 when product not found", async () => {
    mockFetch.mockResolvedValueOnce(null); // product not found
    const req = createReq({
      body: {
        productId: "nonexistent",
        thresholds: { lowStockThreshold: 10, outOfStockThreshold: 0, restockLevel: 20 },
      },
    });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("should handle batch update for multiple products", async () => {
    const req = createReq({
      body: {
        products: [
          { productId: "product-1", thresholds: { lowStockThreshold: 10, outOfStockThreshold: 0, restockLevel: 20 } },
          { productId: "product-2", thresholds: { lowStockThreshold: 15, outOfStockThreshold: 2, restockLevel: 30 } },
        ],
      },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.results.total).toBe(2);
    expect(body.results.succeeded).toBe(2);
  });

  it("should handle partial batch failure", async () => {
    mockFetch
      .mockResolvedValueOnce({ _id: "product-1" }) // first product exists
      .mockResolvedValueOnce(null); // second product not found
    const req = createReq({
      body: {
        products: [
          { productId: "product-1", thresholds: { lowStockThreshold: 10, outOfStockThreshold: 0, restockLevel: 20 } },
          { productId: "missing", thresholds: { lowStockThreshold: 10, outOfStockThreshold: 0, restockLevel: 20 } },
        ],
      },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.results.succeeded).toBe(1);
    expect(body.results.failed).toBe(1);
  });

  it("should enforce rate limiting", async () => {
    // Make 21 rapid requests (limit is 20/min)
    for (let i = 0; i < 20; i++) {
      const req = createReq({
        body: {
          productId: `prod-${i}`,
          thresholds: { lowStockThreshold: 10, outOfStockThreshold: 0, restockLevel: 20 },
        },
        headers: { "x-user-id": "rate-limit-test-user" },
      });
      await POST(req);
    }
    const req = createReq({
      body: {
        productId: "prod-extra",
        thresholds: { lowStockThreshold: 10, outOfStockThreshold: 0, restockLevel: 20 },
      },
      headers: { "x-user-id": "rate-limit-test-user" },
    });
    const res = await POST(req);
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toContain("Rate limit");
  });

  it("should handle Sanity errors gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Sanity unavailable"));
    const req = createReq({
      body: {
        productId: "product-1",
        thresholds: { lowStockThreshold: 10, outOfStockThreshold: 0, restockLevel: 20 },
      },
    });
    const res = await POST(req);
    // The updateProductThreshold function catches errors and returns { success: false }
    expect(res.status).toBe(500);
  });
});

describe("GET /api/seller/stock/thresholds", () => {
  let GET: (req: unknown) => Promise<{ status: number; json: () => Promise<Record<string, unknown>> }>;

  beforeAll(async () => {
    const mod = await import("@/app/api/seller/stock/thresholds/route");
    GET = mod.GET as typeof GET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 when productId is missing", async () => {
    const req = createReq({ url: "http://localhost:3000/api/seller/stock/thresholds" });
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Product ID is required");
  });

  it("should return 404 when product not found", async () => {
    mockFetch.mockResolvedValueOnce(null);
    const req = createReq({ url: "http://localhost:3000/api/seller/stock/thresholds?productId=missing" });
    const res = await GET(req);
    expect(res.status).toBe(404);
  });

  it("should return thresholds for existing product", async () => {
    mockFetch.mockResolvedValueOnce({
      _id: "product-1",
      lowStockThreshold: 15,
      outOfStockThreshold: 3,
      restockLevel: 25,
    });
    const req = createReq({ url: "http://localhost:3000/api/seller/stock/thresholds?productId=product-1" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.productId).toBe("product-1");
    expect(body.thresholds.lowStockThreshold).toBe(15);
  });

  it("should return default thresholds when product has null values", async () => {
    mockFetch.mockResolvedValueOnce({
      _id: "product-2",
      lowStockThreshold: null,
      outOfStockThreshold: null,
      restockLevel: null,
    });
    const req = createReq({ url: "http://localhost:3000/api/seller/stock/thresholds?productId=product-2" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.thresholds.lowStockThreshold).toBe(10); // default
    expect(body.thresholds.outOfStockThreshold).toBe(0); // default
    expect(body.thresholds.restockLevel).toBe(20); // default
  });

  it("should handle Sanity errors", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Sanity error"));
    const req = createReq({ url: "http://localhost:3000/api/seller/stock/thresholds?productId=product-1" });
    const res = await GET(req);
    expect(res.status).toBe(500);
  });
});
