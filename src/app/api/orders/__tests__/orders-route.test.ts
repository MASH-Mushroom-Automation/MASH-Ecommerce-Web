/**
 * Tests for Orders API route
 * Batch 7: Coverage improvement for GET/POST /api/orders
 */

// Mock next/server
jest.mock("next/server", () => {
  class MockNextResponse {
    body: unknown;
    status: number;
    constructor(body: unknown, init?: { status?: number }) {
      this.body = body;
      this.status = init?.status || 200;
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

// Mock next/headers
const mockCookieStore = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
};
jest.mock("next/headers", () => ({
  cookies: jest.fn().mockResolvedValue(mockCookieStore),
}));

// Mock api-client
const mockApiRequest = jest.fn();
jest.mock("@/lib/api-client", () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));

function createReq(opts: { url?: string; body?: unknown; headers?: Record<string, string> }) {
  const url = opts.url || "http://localhost:3000/api/orders";
  const parsedUrl = new URL(url);
  return {
    json: jest.fn().mockResolvedValue(opts.body || {}),
    url,
    nextUrl: { searchParams: parsedUrl.searchParams },
    headers: {
      get: (name: string) => opts.headers?.[name] || null,
    },
  };
}

describe("GET /api/orders", () => {
  let GET: (req: unknown) => Promise<{ status: number; json: () => Promise<Record<string, unknown>> }>;

  beforeAll(async () => {
    const mod = await import("@/app/api/orders/route");
    GET = mod.GET as typeof GET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockCookieStore.get.mockReturnValue({ value: "valid-token" });
    mockApiRequest.mockResolvedValue({ success: true, data: [] });
  });

  it("should return 401 when no auth token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const req = createReq({});
    const res = await GET(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("should fetch orders successfully", async () => {
    mockApiRequest.mockResolvedValue({
      success: true,
      data: [{ id: "ord_001", status: "processing" }],
    });
    const req = createReq({});
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.timestamp).toBeDefined();
    expect(mockApiRequest).toHaveBeenCalledWith("/api/orders", expect.objectContaining({ method: "GET" }));
  });

  it("should forward query parameters to backend", async () => {
    const req = createReq({ url: "http://localhost:3000/api/orders?page=2&limit=10&status=delivered&sortBy=createdAt&sortOrder=desc" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(mockApiRequest).toHaveBeenCalledWith(
      expect.stringContaining("page=2"),
      expect.anything()
    );
  });

  it("should handle backend API errors", async () => {
    mockApiRequest.mockRejectedValue(new Error("Backend unavailable"));
    const req = createReq({});
    const res = await GET(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.code).toBe("FETCH_ERROR");
  });
});

describe("POST /api/orders", () => {
  let POST: (req: unknown) => Promise<{ status: number; json: () => Promise<Record<string, unknown>> }>;

  beforeAll(async () => {
    const mod = await import("@/app/api/orders/route");
    POST = mod.POST as typeof POST;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockCookieStore.get.mockReturnValue({ value: "valid-token" });
    mockApiRequest.mockResolvedValue({ success: true, data: { id: "ord_new" } });
  });

  it("should return 401 when no auth token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const req = createReq({ body: { items: [] } });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should create order successfully", async () => {
    const req = createReq({
      body: { items: [{ productId: "1", quantity: 2 }], shippingAddress: { city: "Quezon City" } },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(mockApiRequest).toHaveBeenCalledWith("/api/orders", expect.objectContaining({ method: "POST" }));
  });

  it("should handle backend errors on order creation", async () => {
    mockApiRequest.mockRejectedValue(new Error("Payment failed"));
    const req = createReq({ body: { items: [{ productId: "1", quantity: 1 }] } });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.code).toBe("CREATE_ERROR");
    expect(body.error.message).toContain("Payment failed");
  });
});
