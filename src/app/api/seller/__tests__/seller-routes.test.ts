/**
 * Tests for Seller API routes
 * COV-011: Seller dashboard, orders, products, profile, addresses,
 *          payment-info, password, notifications, sales-data, refunds,
 *          notification-preferences, inventory
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
    static json(data: unknown, init?: { status?: number }) {
      return new MockNextResponse(data, init);
    }
  }
  return { __esModule: true, NextResponse: MockNextResponse, NextRequest: jest.fn() };
});

// Mock next/headers
const mockCookieStore = { get: jest.fn(), set: jest.fn(), delete: jest.fn() };
jest.mock("next/headers", () => ({
  cookies: jest.fn().mockResolvedValue(mockCookieStore),
}));

// Mock api-client
const mockApiRequest = jest.fn();
jest.mock("@/lib/api-client", () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));

// Helper: mock request
function createReq(opts: {
  body?: object;
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
  url?: string;
  searchParams?: Record<string, string>;
}) {
  const url = opts.url || "http://localhost:3000/api/seller/test";
  const u = new URL(url);
  if (opts.searchParams) {
    Object.entries(opts.searchParams).forEach(([k, v]) => u.searchParams.set(k, v));
  }
  return {
    json: jest.fn().mockResolvedValue(opts.body || {}),
    text: jest.fn().mockResolvedValue(JSON.stringify(opts.body || {})),
    cookies: {
      get: (name: string) => {
        const value = opts.cookies?.[name];
        return value ? { value } : undefined;
      },
    },
    headers: {
      get: (name: string) => opts.headers?.[name] || null,
      entries: () => Object.entries(opts.headers || {})[Symbol.iterator](),
    },
    url: u.toString(),
    nextUrl: { searchParams: u.searchParams },
  };
}

const originalFetch = global.fetch;
afterAll(() => { global.fetch = originalFetch; });
beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
  mockCookieStore.get.mockReturnValue({ value: "valid-token" });
});

// ==================== DASHBOARD ====================
describe("GET /api/seller/dashboard", () => {
  let GET: Function;
  beforeAll(async () => { GET = (await import("@/app/api/seller/dashboard/route")).GET; });

  it("returns 401 when no token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const res = await GET(createReq({}));
    expect(res.status).toBe(401);
  });

  it("returns dashboard data when authenticated", async () => {
    mockApiRequest.mockResolvedValue({ success: true, data: { totalSales: 100 } });
    const res = await GET(createReq({ headers: { cookie: "auth-token=valid" } }));
    expect(res.body).toEqual(expect.objectContaining({ success: true }));
    expect(res.body.timestamp).toBeDefined();
  });

  it("returns 500 on API error", async () => {
    mockApiRequest.mockRejectedValue(new Error("Backend down"));
    const res = await GET(createReq({}));
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ==================== ORDERS ====================
describe("GET /api/seller/orders", () => {
  let GET: Function;
  beforeAll(async () => { GET = (await import("@/app/api/seller/orders/route")).GET; });

  it("returns 401 when no token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const res = await GET(createReq({}));
    expect(res.status).toBe(401);
  });

  it("returns orders with query params", async () => {
    mockApiRequest.mockResolvedValue({ success: true, data: [] });
    const res = await GET(createReq({
      url: "http://localhost:3000/api/seller/orders?page=1&limit=10&status=pending",
    }));
    expect(res.body.success).toBe(true);
    expect(mockApiRequest).toHaveBeenCalledWith(
      expect.stringContaining("/seller/orders"),
      expect.any(Object)
    );
  });

  it("returns 500 on error", async () => {
    mockApiRequest.mockRejectedValue(new Error("fail"));
    const res = await GET(createReq({}));
    expect(res.status).toBe(500);
  });
});

// ==================== PROFILE ====================
describe("Seller Profile routes", () => {
  let GET: Function, PUT: Function;
  beforeAll(async () => {
    const mod = await import("@/app/api/seller/profile/route");
    GET = mod.GET;
    PUT = mod.PUT;
  });

  it("GET returns 401 when no token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const res = await GET(createReq({}));
    expect(res.status).toBe(401);
  });

  it("GET returns profile data", async () => {
    mockApiRequest.mockResolvedValue({ success: true, data: { name: "Seller" } });
    const res = await GET(createReq({ headers: { cookie: "auth-token=x" } }));
    expect(res.body.success).toBe(true);
  });

  it("GET returns 500 on error", async () => {
    mockApiRequest.mockRejectedValue(new Error("fail"));
    const res = await GET(createReq({}));
    expect(res.status).toBe(500);
  });

  it("PUT returns 401 when no token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const res = await PUT(createReq({ body: { name: "New" } }));
    expect(res.status).toBe(401);
  });

  it("PUT updates profile", async () => {
    mockApiRequest.mockResolvedValue({ success: true, data: { name: "Updated" } });
    const res = await PUT(createReq({ body: { name: "Updated" } }));
    expect(res.body.success).toBe(true);
  });

  it("PUT returns 500 on error", async () => {
    mockApiRequest.mockRejectedValue(new Error("fail"));
    const res = await PUT(createReq({ body: {} }));
    expect(res.status).toBe(500);
  });
});

// ==================== ADDRESSES ====================
describe("Seller Addresses routes", () => {
  let GET: Function, POST: Function, PUT: Function, DELETE: Function;
  beforeAll(async () => {
    const mod = await import("@/app/api/seller/addresses/route");
    GET = mod.GET; POST = mod.POST; PUT = mod.PUT; DELETE = mod.DELETE;
  });

  it("GET returns 401 when no token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const res = await GET(createReq({}));
    expect(res.status).toBe(401);
  });

  it("GET returns addresses", async () => {
    mockApiRequest.mockResolvedValue({ success: true, data: [] });
    const res = await GET(createReq({}));
    expect(res.body.success).toBe(true);
  });

  it("POST returns 401 when no token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const res = await POST(createReq({ body: { street: "123 Main" } }));
    expect(res.status).toBe(401);
  });

  it("POST creates address", async () => {
    mockApiRequest.mockResolvedValue({ success: true, data: { id: "1" } });
    const res = await POST(createReq({ body: { street: "123 Main" } }));
    expect(res.body.success).toBe(true);
  });

  it("POST returns 500 on error", async () => {
    mockApiRequest.mockRejectedValue(new Error("fail"));
    const res = await POST(createReq({ body: {} }));
    expect(res.status).toBe(500);
  });

  it("PUT returns 401 when no token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const res = await PUT(createReq({ body: { id: "1", street: "456 Oak" } }));
    expect(res.status).toBe(401);
  });

  it("PUT updates address", async () => {
    mockApiRequest.mockResolvedValue({ success: true, data: { id: "1" } });
    const res = await PUT(createReq({ body: { id: "1", street: "456 Oak" } }));
    expect(res.body.success).toBe(true);
  });

  it("DELETE returns 401 when no token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const res = await DELETE(createReq({ url: "http://localhost:3000/api/seller/addresses?id=1" }));
    expect(res.status).toBe(401);
  });

  it("DELETE returns 400 when no id", async () => {
    const res = await DELETE(createReq({ url: "http://localhost:3000/api/seller/addresses" }));
    expect(res.status).toBe(400);
  });

  it("DELETE removes address", async () => {
    mockApiRequest.mockResolvedValue({ success: true });
    const res = await DELETE(createReq({ url: "http://localhost:3000/api/seller/addresses?id=1" }));
    expect(res.body.success).toBe(true);
  });

  it("DELETE returns 500 on error", async () => {
    mockApiRequest.mockRejectedValue(new Error("fail"));
    const res = await DELETE(createReq({ url: "http://localhost:3000/api/seller/addresses?id=1" }));
    expect(res.status).toBe(500);
  });
});

// ==================== PAYMENT INFO ====================
describe("Seller Payment Info routes", () => {
  let GET: Function, PUT: Function;
  beforeAll(async () => {
    const mod = await import("@/app/api/seller/payment-info/route");
    GET = mod.GET; PUT = mod.PUT;
  });

  it("GET returns 401 when no token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const res = await GET(createReq({}));
    expect(res.status).toBe(401);
  });

  it("GET returns payment info", async () => {
    mockApiRequest.mockResolvedValue({ success: true, data: { method: "gcash" } });
    const res = await GET(createReq({}));
    expect(res.body.success).toBe(true);
  });

  it("PUT returns 401 when no token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const res = await PUT(createReq({ body: {} }));
    expect(res.status).toBe(401);
  });

  it("PUT updates payment info", async () => {
    mockApiRequest.mockResolvedValue({ success: true });
    const res = await PUT(createReq({ body: { method: "bank" } }));
    expect(res.body.success).toBe(true);
  });
});

// ==================== PASSWORD ====================
describe("Seller Password routes", () => {
  let PUT: Function;
  beforeAll(async () => {
    PUT = (await import("@/app/api/seller/password/route")).PUT;
  });

  it("PUT returns 401 when no token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const res = await PUT(createReq({ body: { currentPassword: "old", newPassword: "new" } }));
    expect(res.status).toBe(401);
  });

  it("PUT changes password", async () => {
    mockApiRequest.mockResolvedValue({ success: true });
    const res = await PUT(createReq({ body: { currentPassword: "old", newPassword: "newpassword123" } }));
    expect(res.body.success).toBe(true);
  });

  it("PUT returns 400 on missing fields", async () => {
    const res = await PUT(createReq({ body: {} }));
    expect(res.status).toBe(400);
  });

  it("PUT returns 500 on apiRequest error", async () => {
    mockApiRequest.mockRejectedValue(new Error("fail"));
    const res = await PUT(createReq({ body: { currentPassword: "old", newPassword: "newpassword123" } }));
    expect(res.status).toBe(500);
  });
});

// ==================== NOTIFICATIONS ====================
describe("Seller Notifications routes", () => {
  let GET: Function;
  beforeAll(async () => {
    GET = (await import("@/app/api/seller/notifications/route")).GET;
  });

  it("GET returns 401 when no token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const res = await GET(createReq({}));
    expect(res.status).toBe(401);
  });

  it("GET returns notifications", async () => {
    mockApiRequest.mockResolvedValue({ success: true, data: [] });
    const res = await GET(createReq({}));
    expect(res.body.success).toBe(true);
  });

  it("GET returns 500 on error", async () => {
    mockApiRequest.mockRejectedValue(new Error("fail"));
    const res = await GET(createReq({}));
    expect(res.status).toBe(500);
  });
});

// ==================== NOTIFICATION PREFERENCES ====================
describe("Seller Notification Preferences routes", () => {
  let GET: Function, PUT: Function;
  beforeAll(async () => {
    const mod = await import("@/app/api/seller/notification-preferences/route");
    GET = mod.GET; PUT = mod.PUT;
  });

  it("GET returns 401 when no token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const res = await GET(createReq({}));
    expect(res.status).toBe(401);
  });

  it("GET returns preferences", async () => {
    mockApiRequest.mockResolvedValue({ success: true, data: { email: true } });
    const res = await GET(createReq({}));
    expect(res.body.success).toBe(true);
  });

  it("PUT updates preferences", async () => {
    mockApiRequest.mockResolvedValue({ success: true });
    const res = await PUT(createReq({ body: { email: false } }));
    expect(res.body.success).toBe(true);
  });
});

// ==================== SALES DATA ====================
describe("Seller Sales Data routes", () => {
  let GET: Function;
  beforeAll(async () => {
    GET = (await import("@/app/api/seller/sales-data/route")).GET;
  });

  it("GET returns 401 when no token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const res = await GET(createReq({}));
    expect(res.status).toBe(401);
  });

  it("GET returns sales data", async () => {
    mockApiRequest.mockResolvedValue({ success: true, data: { revenue: 5000 } });
    const res = await GET(createReq({}));
    expect(res.body.success).toBe(true);
  });

  it("GET returns 500 on error", async () => {
    mockApiRequest.mockRejectedValue(new Error("fail"));
    const res = await GET(createReq({}));
    expect(res.status).toBe(500);
  });
});

// ==================== REFUNDS ====================
describe("Seller Refunds routes", () => {
  let GET: Function;
  beforeAll(async () => {
    GET = (await import("@/app/api/seller/refunds/route")).GET;
  });

  it("GET returns 401 when no token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const res = await GET(createReq({}));
    expect(res.status).toBe(401);
  });

  it("GET returns refunds", async () => {
    mockApiRequest.mockResolvedValue({ success: true, data: [] });
    const res = await GET(createReq({}));
    expect(res.body.success).toBe(true);
  });

  it("GET returns 500 on error", async () => {
    mockApiRequest.mockRejectedValue(new Error("fail"));
    const res = await GET(createReq({}));
    expect(res.status).toBe(500);
  });
});

// ==================== INVENTORY ====================
describe("Seller Inventory routes", () => {
  let GET: Function;
  beforeAll(async () => {
    GET = (await import("@/app/api/seller/inventory/route")).GET;
  });

  it("GET returns 401 when no token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const res = await GET(createReq({}));
    expect(res.status).toBe(401);
  });

  it("GET returns inventory data", async () => {
    mockApiRequest.mockResolvedValue({ success: true, data: [] });
    const res = await GET(createReq({}));
    expect(res.body.success).toBe(true);
  });

  it("GET returns 500 on error", async () => {
    mockApiRequest.mockRejectedValue(new Error("fail"));
    const res = await GET(createReq({}));
    expect(res.status).toBe(500);
  });
});

// ==================== TOP PERFORMING PRODUCTS ====================
describe("Seller Top Performing Products", () => {
  let GET: Function;
  beforeAll(async () => {
    GET = (await import("@/app/api/seller/products/top-performing/route")).GET;
  });

  it("GET returns 401 when no token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const res = await GET(createReq({}));
    expect(res.status).toBe(401);
  });

  it("GET returns top products", async () => {
    mockApiRequest.mockResolvedValue({ success: true, data: [] });
    const res = await GET(createReq({}));
    expect(res.body.success).toBe(true);
  });

  it("GET returns 500 on error", async () => {
    mockApiRequest.mockRejectedValue(new Error("fail"));
    const res = await GET(createReq({}));
    expect(res.status).toBe(500);
  });
});
