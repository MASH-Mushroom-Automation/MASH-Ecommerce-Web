/**
 * Tests for auth API routes: logout, me, session, 2fa/*
 * COV-011: Auth routes batch
 */

// Mock next/server
jest.mock("next/server", () => {
  class MockNextResponse {
    body: unknown;
    status: number;
    _cookies: Map<string, unknown>;
    headers: Map<string, string>;

    constructor(body: unknown, init?: { status?: number }) {
      this.body = body;
      this.status = init?.status || 200;
      this._cookies = new Map();
      this.headers = new Map();
    }

    static json(data: unknown, init?: { status?: number }) {
      return new MockNextResponse(data, init);
    }

    get cookies() {
      const c = this._cookies;
      return {
        set: (name: string, value: string, opts?: Record<string, unknown>) =>
          c.set(name, { name, value, ...opts }),
        delete: (name: string) => c.delete(name),
        get: (name: string) => c.get(name),
      };
    }
  }

  return {
    __esModule: true,
    NextResponse: MockNextResponse,
    NextRequest: jest.fn(),
  };
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

// Mock @/lib/api-client
const mockApiRequest = jest.fn();
jest.mock("@/lib/api-client", () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));

// Helper to create mock request objects
function createMockRequest(options: {
  body?: object;
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
  url?: string;
}) {
  return {
    json: jest.fn().mockResolvedValue(options.body || {}),
    text: jest.fn().mockResolvedValue(JSON.stringify(options.body || {})),
    cookies: {
      get: (name: string) => {
        const value = options.cookies?.[name];
        return value ? { value } : undefined;
      },
    },
    headers: {
      get: (name: string) => options.headers?.[name] || null,
      entries: () => Object.entries(options.headers || {})[Symbol.iterator](),
    },
    url: options.url || "http://localhost:3000/api/test",
  };
}

// Save/restore global.fetch
const originalFetch = global.fetch;
afterAll(() => {
  global.fetch = originalFetch;
});

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
});

// ============ auth/logout ============
describe("POST /api/auth/logout", () => {
  let POST: (req: unknown) => Promise<{ body: unknown; status: number; cookies: { delete: Function; set: Function } }>;

  beforeAll(async () => {
    const mod = await import("@/app/api/auth/logout/route");
    POST = mod.POST as unknown as typeof POST;
  });

  it("should return success and delete auth cookies", async () => {
    const req = createMockRequest({});
    const res = await POST(req);
    expect(res.body).toEqual(
      expect.objectContaining({ success: true, message: "Logged out successfully" })
    );
    expect(res.status).toBe(200);
  });

  it("should handle errors gracefully", async () => {
    // Force cookies() to throw
    const { cookies } = require("next/headers");
    cookies.mockRejectedValueOnce(new Error("Cookie error"));
    const req = createMockRequest({});
    const res = await POST(req);
    expect(res.status).toBe(500);
    expect(res.body).toEqual(expect.objectContaining({ success: false }));
  });
});

// ============ auth/me ============
describe("GET /api/auth/me", () => {
  let GET: (req: unknown) => Promise<{ body: unknown; status: number }>;
  let PUT: (req: unknown) => Promise<{ body: unknown; status: number }>;

  beforeAll(async () => {
    const mod = await import("@/app/api/auth/me/route");
    GET = mod.GET as unknown as typeof GET;
    PUT = mod.PUT as unknown as typeof PUT;
  });

  it("should return 401 when no auth token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const req = createMockRequest({});
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("should return user data when authenticated", async () => {
    mockCookieStore.get.mockReturnValue({ value: "valid-token" });
    mockApiRequest.mockResolvedValue({ success: true, data: { id: "1", name: "Test" } });
    const req = createMockRequest({});
    const res = await GET(req);
    expect(res.body).toEqual(expect.objectContaining({ success: true }));
  });

  it("should return 500 on API error", async () => {
    mockCookieStore.get.mockReturnValue({ value: "valid-token" });
    mockApiRequest.mockRejectedValue(new Error("API failed"));
    const req = createMockRequest({});
    const res = await GET(req);
    expect(res.status).toBe(500);
  });
});

describe("PUT /api/auth/me", () => {
  let PUT: (req: unknown) => Promise<{ body: unknown; status: number }>;

  beforeAll(async () => {
    const mod = await import("@/app/api/auth/me/route");
    PUT = mod.PUT as unknown as typeof PUT;
  });

  it("should return 401 when no auth token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const req = createMockRequest({ body: { name: "New Name" } });
    const res = await PUT(req);
    expect(res.status).toBe(401);
  });

  it("should update profile when authenticated", async () => {
    mockCookieStore.get.mockReturnValue({ value: "valid-token" });
    mockApiRequest.mockResolvedValue({ success: true, data: { name: "Updated" } });
    const req = createMockRequest({ body: { name: "Updated" } });
    const res = await PUT(req);
    expect(res.body).toEqual(expect.objectContaining({ success: true }));
  });

  it("should return 500 on error", async () => {
    mockCookieStore.get.mockReturnValue({ value: "valid-token" });
    mockApiRequest.mockRejectedValue(new Error("fail"));
    const req = createMockRequest({ body: {} });
    const res = await PUT(req);
    expect(res.status).toBe(500);
  });
});

// ============ auth/session ============
describe("GET /api/auth/session", () => {
  let GET: (req: unknown) => Promise<{ body: unknown; status: number }>;

  beforeAll(async () => {
    const mod = await import("@/app/api/auth/session/route");
    GET = mod.GET as unknown as typeof GET;
  });

  it("should return 401 when no session token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const req = createMockRequest({});
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("should return session when authenticated", async () => {
    mockCookieStore.get.mockReturnValue({ value: "valid-token" });
    mockApiRequest.mockResolvedValue({ success: true, data: { userId: "1" } });
    const req = createMockRequest({});
    const res = await GET(req);
    expect(res.body).toEqual(expect.objectContaining({ success: true }));
  });

  it("should return 500 on error", async () => {
    mockCookieStore.get.mockReturnValue({ value: "valid-token" });
    mockApiRequest.mockRejectedValue(new Error("Session error"));
    const req = createMockRequest({});
    const res = await GET(req);
    expect(res.status).toBe(500);
  });
});

describe("POST /api/auth/session (refresh)", () => {
  let SPOST: (req: unknown) => Promise<{ body: unknown; status: number; cookies: { set: Function } }>;

  beforeAll(async () => {
    const mod = await import("@/app/api/auth/session/route");
    SPOST = mod.POST as unknown as typeof SPOST;
  });

  it("should return 401 when no refresh token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const req = createMockRequest({});
    const res = await SPOST(req);
    expect(res.status).toBe(401);
  });

  it("should refresh session with valid refresh token", async () => {
    mockCookieStore.get.mockReturnValue({ value: "refresh-token-123" });
    mockApiRequest.mockResolvedValue({
      success: true,
      data: { accessToken: "new-access", refreshToken: "new-refresh" },
    });
    const req = createMockRequest({});
    const res = await SPOST(req);
    expect(res.body).toEqual(expect.objectContaining({ success: true }));
  });

  it("should return 401 on refresh failure", async () => {
    mockCookieStore.get.mockReturnValue({ value: "expired-refresh" });
    mockApiRequest.mockResolvedValue({ success: false, data: null });
    const req = createMockRequest({});
    const res = await SPOST(req);
    expect(res.status).toBe(401);
  });

  it("should return 500 on error", async () => {
    mockCookieStore.get.mockReturnValue({ value: "refresh-token" });
    mockApiRequest.mockRejectedValue(new Error("Network error"));
    const req = createMockRequest({});
    const res = await SPOST(req);
    expect(res.status).toBe(500);
  });
});

// ============ auth/2fa/enable ============
describe("POST /api/auth/2fa/enable", () => {
  let POST: (req: unknown) => Promise<{ body: unknown; status: number }>;

  beforeAll(async () => {
    const mod = await import("@/app/api/auth/2fa/enable/route");
    POST = mod.POST as unknown as typeof POST;
  });

  it("should return 401 when no token", async () => {
    const req = createMockRequest({ cookies: {}, headers: {} });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should enable 2FA with cookie token", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    const req = createMockRequest({ cookies: { "auth-token": "valid-token" } });
    const res = await POST(req);
    expect(res.body).toEqual(expect.objectContaining({ success: true }));
  });

  it("should enable 2FA with Authorization header", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    const req = createMockRequest({ headers: { Authorization: "Bearer header-token" } });
    const res = await POST(req);
    expect(res.body).toEqual(expect.objectContaining({ success: true }));
  });

  it("should return backend error status", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: "2FA already enabled" }),
    });
    const req = createMockRequest({ cookies: { "auth-token": "valid" } });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 500 on network error", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));
    const req = createMockRequest({ cookies: { "auth-token": "valid" } });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});

// ============ auth/2fa/disable ============
describe("POST /api/auth/2fa/disable", () => {
  let POST: (req: unknown) => Promise<{ body: unknown; status: number }>;

  beforeAll(async () => {
    const mod = await import("@/app/api/auth/2fa/disable/route");
    POST = mod.POST as unknown as typeof POST;
  });

  it("should return 401 when no token", async () => {
    const req = createMockRequest({ body: { code: "123456" }, cookies: {}, headers: {} });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should return 400 when no code provided", async () => {
    const req = createMockRequest({
      body: {},
      cookies: { "auth-token": "valid" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should disable 2FA with valid code", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    const req = createMockRequest({
      body: { code: "123456" },
      cookies: { "auth-token": "valid-token" },
    });
    const res = await POST(req);
    expect(res.body).toEqual(expect.objectContaining({ success: true }));
  });

  it("should return backend error", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 403,
      json: () => Promise.resolve({ message: "Invalid code" }),
    });
    const req = createMockRequest({
      body: { code: "000000" },
      cookies: { "auth-token": "valid" },
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("should return 500 on error", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("fail"));
    const req = createMockRequest({
      body: { code: "123456" },
      cookies: { "auth-token": "valid" },
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});

// ============ auth/2fa/send ============
describe("POST /api/auth/2fa/send", () => {
  let POST: (req: unknown) => Promise<{ body: unknown; status: number }>;

  beforeAll(async () => {
    const mod = await import("@/app/api/auth/2fa/send/route");
    POST = mod.POST as unknown as typeof POST;
  });

  it("should return 400 when no tempToken", async () => {
    const req = createMockRequest({ body: {} });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should send OTP with valid tempToken", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, message: "OTP sent" }),
    });
    const req = createMockRequest({ body: { tempToken: "temp-123" } });
    const res = await POST(req);
    expect(res.body).toEqual(expect.objectContaining({ success: true }));
  });

  it("should return backend error", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 429,
      json: () => Promise.resolve({ message: "Rate limited" }),
    });
    const req = createMockRequest({ body: { tempToken: "temp-123" } });
    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it("should return 500 on error", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("fail"));
    const req = createMockRequest({ body: { tempToken: "temp-123" } });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});

// ============ auth/2fa/verify ============
describe("POST /api/auth/2fa/verify", () => {
  let POST: (req: unknown) => Promise<{ body: unknown; status: number }>;

  beforeAll(async () => {
    const mod = await import("@/app/api/auth/2fa/verify/route");
    POST = mod.POST as unknown as typeof POST;
  });

  it("should return 400 when no code", async () => {
    const req = createMockRequest({ body: { tempToken: "temp" } });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 400 when no tempToken", async () => {
    const req = createMockRequest({ body: { code: "123456" } });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should verify 2FA with valid code and token", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ accessToken: "access", refreshToken: "refresh", user: { id: "1" } }),
    });
    const req = createMockRequest({
      body: { code: "123456", tempToken: "temp-token", rememberDevice: true },
    });
    const res = await POST(req);
    expect(res.body).toEqual(expect.objectContaining({ accessToken: "access" }));
  });

  it("should return backend error status", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: "Invalid 2FA code" }),
    });
    const req = createMockRequest({
      body: { code: "000000", tempToken: "temp" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should return 500 on error", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("fail"));
    const req = createMockRequest({
      body: { code: "123456", tempToken: "temp" },
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});
