/**
 * Tests for API order and product route handlers (COV-008)
 * Tests: orders/route, orders/[id]/route, orders/[id]/status/route, products/route, products/[id]/route
 */

// Mock next/server
jest.mock("next/server", () => {
  class MockNextResponse {
    body: string | null;
    status: number;
    headers: Map<string, string>;
    _cookies: Map<string, { value: string; options: Record<string, unknown> }>;

    constructor(body?: string | null, init?: { status?: number; headers?: Record<string, string> }) {
      this.body = body ?? null;
      this.status = init?.status ?? 200;
      this.headers = new Map(Object.entries(init?.headers ?? {}));
      this._cookies = new Map();
    }

    async json() {
      return JSON.parse(this.body || "{}");
    }

    get cookies() {
      const self = this;
      return {
        set: (name: string, value: string, options?: Record<string, unknown>) => {
          self._cookies.set(name, { value, options: options ?? {} });
        },
        get: (name: string) => self._cookies.get(name),
      };
    }

    static json(data: unknown, init?: { status?: number; headers?: Record<string, string> }) {
      return new MockNextResponse(JSON.stringify(data), init);
    }
  }

  return { NextResponse: MockNextResponse, NextRequest: jest.fn() };
});

// Mock next/headers cookies()
const mockCookieStore = {
  get: jest.fn(),
  getAll: jest.fn().mockReturnValue([]),
  has: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
};

jest.mock("next/headers", () => ({
  cookies: jest.fn().mockResolvedValue(mockCookieStore),
}));

// Mock apiRequest
const mockApiRequest = jest.fn();
jest.mock("@/lib/api-client", () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));

// Helper to create mock request
function createMockRequest(options: {
  method?: string;
  cookies?: Record<string, string>;
  body?: unknown;
  url?: string;
  searchParams?: Record<string, string>;
} = {}) {
  const search = new URLSearchParams(options.searchParams ?? {});
  const url = options.url ?? `http://localhost:3000/api/test?${search.toString()}`;
  const cookieMap = new Map(
    Object.entries(options.cookies ?? {}).map(([k, v]) => [k, { name: k, value: v }])
  );

  return {
    method: options.method ?? "GET",
    url,
    cookies: {
      get: (name: string) => cookieMap.get(name),
      getAll: () => Array.from(cookieMap.values()),
      has: (name: string) => cookieMap.has(name),
    },
    json: jest.fn().mockResolvedValue(options.body ?? {}),
    headers: {
      get: jest.fn().mockReturnValue(null),
    },
    nextUrl: {
      searchParams: search,
    },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCookieStore.get.mockReturnValue(undefined);
});

// ============ Orders Route ============
describe("GET /api/orders", () => {
  it("should return 401 when no auth token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const { GET } = await import("@/app/api/orders/route");
    const req = createMockRequest();
    const res = await GET(req as never);
    expect((res as { status: number }).status).toBe(401);
  });

  it("should forward orders from backend when authenticated", async () => {
    mockCookieStore.get.mockReturnValue({ name: "auth-token", value: "valid-token" });
    mockApiRequest.mockResolvedValue({ success: true, data: [{ id: "order-1" }] });
    const { GET } = await import("@/app/api/orders/route");
    const req = createMockRequest();
    const res = await GET(req as never);
    const data = await (res as { json: () => Promise<Record<string, unknown>> }).json();
    expect(data.success).toBe(true);
  });
});

describe("POST /api/orders", () => {
  it("should return 401 when no auth token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const { POST } = await import("@/app/api/orders/route");
    const req = createMockRequest({ method: "POST", body: { items: [] } });
    const res = await POST(req as never);
    expect((res as { status: number }).status).toBe(401);
  });

  it("should create order when authenticated", async () => {
    mockCookieStore.get.mockReturnValue({ name: "auth-token", value: "valid-token" });
    mockApiRequest.mockResolvedValue({ success: true, data: { id: "new-order" } });
    const { POST } = await import("@/app/api/orders/route");
    const req = createMockRequest({ method: "POST", body: { items: [{ productId: "p1", quantity: 1 }] } });
    const res = await POST(req as never);
    const data = await (res as { json: () => Promise<Record<string, unknown>> }).json();
    expect(data.success).toBe(true);
  });
});

// ============ Orders [id] Status Route ============
describe("PUT /api/orders/[id]/status", () => {
  let PUT: (req: unknown, ctx: { params: Promise<{ id: string }> }) => Promise<unknown>;

  beforeAll(async () => {
    const mod = await import("@/app/api/orders/[id]/status/route");
    PUT = mod.PUT as typeof PUT;
  });

  it("should return 401 when no auth token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const req = createMockRequest({ method: "PUT", body: { status: "shipped" } });
    const res = await PUT(req, { params: Promise.resolve({ id: "order-1" }) });
    expect((res as { status: number }).status).toBe(401);
  });

  it("should return 400 when status is missing", async () => {
    mockCookieStore.get.mockReturnValue({ name: "auth-token", value: "token" });
    const req = createMockRequest({ method: "PUT", body: {} });
    const res = await PUT(req, { params: Promise.resolve({ id: "order-1" }) });
    expect((res as { status: number }).status).toBe(400);
  });

  it("should return 400 for invalid status value", async () => {
    mockCookieStore.get.mockReturnValue({ name: "auth-token", value: "token" });
    const req = createMockRequest({ method: "PUT", body: { status: "invalid-status" } });
    const res = await PUT(req, { params: Promise.resolve({ id: "order-1" }) });
    expect((res as { status: number }).status).toBe(400);
  });

  it("should update status for valid status value", async () => {
    mockCookieStore.get.mockReturnValue({ name: "auth-token", value: "token" });
    const req = createMockRequest({ method: "PUT", body: { status: "shipped" } });
    const res = await PUT(req, { params: Promise.resolve({ id: "order-1" }) });
    const data = await (res as { json: () => Promise<Record<string, unknown>> }).json();
    expect((res as { status: number }).status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("should accept all valid status values", async () => {
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    mockCookieStore.get.mockReturnValue({ name: "auth-token", value: "token" });

    for (const status of validStatuses) {
      const req = createMockRequest({ method: "PUT", body: { status } });
      const res = await PUT(req, { params: Promise.resolve({ id: "order-1" }) });
      expect((res as { status: number }).status).toBe(200);
    }
  });
});

// ============ Products Route ============
describe("GET /api/products", () => {
  it("should return products without auth", async () => {
    mockApiRequest.mockResolvedValue({ success: true, data: [{ id: "p1" }] });
    const { GET } = await import("@/app/api/products/route");
    const req = createMockRequest();
    const res = await GET(req as never);
    const data = await (res as { json: () => Promise<Record<string, unknown>> }).json();
    expect(data.success).toBe(true);
  });

  it("should handle backend errors", async () => {
    mockApiRequest.mockRejectedValue(new Error("Backend down"));
    const { GET } = await import("@/app/api/products/route");
    const req = createMockRequest();
    const res = await GET(req as never);
    expect((res as { status: number }).status).toBe(500);
  });
});

describe("POST /api/products", () => {
  it("should return 401 when no auth token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const { POST } = await import("@/app/api/products/route");
    const req = createMockRequest({ method: "POST", body: { name: "Test Product" } });
    const res = await POST(req as never);
    expect((res as { status: number }).status).toBe(401);
  });
});

// ============ Products [id] Route ============
describe("GET /api/products/[id]", () => {
  it("should return product by id without auth", async () => {
    mockApiRequest.mockResolvedValue({ success: true, data: { id: "p1", name: "Test" } });
    const { GET } = await import("@/app/api/products/[id]/route");
    const req = createMockRequest();
    const res = await GET(req as never, { params: Promise.resolve({ id: "p1" }) });
    const data = await (res as { json: () => Promise<Record<string, unknown>> }).json();
    expect(data.success).toBe(true);
  });
});

describe("DELETE /api/products/[id]", () => {
  it("should return 401 when no auth token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const { DELETE } = await import("@/app/api/products/[id]/route");
    const req = createMockRequest({ method: "DELETE" });
    const res = await DELETE(req as never, { params: Promise.resolve({ id: "p1" }) });
    expect((res as { status: number }).status).toBe(401);
  });

  it("should delete product when authenticated", async () => {
    mockCookieStore.get.mockReturnValue({ name: "auth-token", value: "token" });
    mockApiRequest.mockResolvedValue({ success: true });
    const { DELETE } = await import("@/app/api/products/[id]/route");
    const req = createMockRequest({ method: "DELETE" });
    const res = await DELETE(req as never, { params: Promise.resolve({ id: "p1" }) });
    const data = await (res as { json: () => Promise<Record<string, unknown>> }).json();
    expect(data.success).toBe(true);
  });
});
