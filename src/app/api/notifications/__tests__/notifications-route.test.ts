/**
 * Tests for Notifications API route
 * Batch 7: Coverage improvement for GET/POST /api/notifications
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

function createReq(opts: { url?: string; body?: unknown }) {
  const url = opts.url || "http://localhost:3000/api/notifications";
  const parsedUrl = new URL(url);
  return {
    json: jest.fn().mockResolvedValue(opts.body || {}),
    url,
    nextUrl: { searchParams: parsedUrl.searchParams },
  };
}

describe("GET /api/notifications", () => {
  let GET: (req: unknown) => Promise<{ status: number; json: () => Promise<Record<string, unknown>> }>;

  beforeAll(async () => {
    const mod = await import("@/app/api/notifications/route");
    GET = mod.GET as typeof GET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockCookieStore.get.mockReturnValue({ value: "valid-token" });
  });

  it("should return 401 when no auth token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const req = createReq({});
    const res = await GET(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("should return all notifications with pagination", async () => {
    const req = createReq({});
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.pagination).toBeDefined();
    expect(body.pagination.page).toBe(1);
  });

  it("should filter by unread only", async () => {
    const req = createReq({ url: "http://localhost:3000/api/notifications?unread=true" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.every((n: { read: boolean }) => !n.read)).toBe(true);
  });

  it("should filter by type", async () => {
    const req = createReq({ url: "http://localhost:3000/api/notifications?type=order" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.every((n: { type: string }) => n.type === "order")).toBe(true);
  });

  it("should paginate results", async () => {
    const req = createReq({ url: "http://localhost:3000/api/notifications?page=1&limit=2" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.pagination.limit).toBe(2);
    expect(body.data.length).toBeLessThanOrEqual(2);
  });

  it("should sort notifications by date (newest first)", async () => {
    const req = createReq({});
    const res = await GET(req);
    const body = await res.json();
    const dates = body.data.map((n: { createdAt: string }) => new Date(n.createdAt).getTime());
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
    }
  });
});

describe("POST /api/notifications", () => {
  let POST: (req: unknown) => Promise<{ status: number; json: () => Promise<Record<string, unknown>> }>;

  beforeAll(async () => {
    const mod = await import("@/app/api/notifications/route");
    POST = mod.POST as typeof POST;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockCookieStore.get.mockReturnValue({ value: "valid-token" });
  });

  it("should return 401 when no auth token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const req = createReq({ body: {} });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should update notification preferences", async () => {
    const req = createReq({
      body: {
        email: true,
        push: true,
        sms: false,
        types: { orders: true, alerts: true, system: true, marketing: false, device: true },
        quiet: { enabled: true, startTime: "22:00", endTime: "08:00" },
      },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.email).toBe(true);
    expect(body.data.quiet.enabled).toBe(true);
  });

  it("should use defaults for missing preference fields", async () => {
    const req = createReq({ body: {} });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.email).toBe(true); // default
    expect(body.data.sms).toBe(false); // default
    expect(body.data.quiet.startTime).toBe("22:00"); // default
  });
});
