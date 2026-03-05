/**
 * Tests for API auth route handlers (COV-007)
 * Tests: get-role, get-token, logout, set-cookie, set-token, clear-cookie, clear-tokens
 * Note: me/route.ts and session/route.ts need next/headers cookies() mock - handled separately
 */

// Mock next/server with self-contained factory (edge runtime compatibility)
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
        getAll: () => Array.from(self._cookies.entries()).map(([name, { value }]) => ({ name, value })),
      };
    }

    static json(data: unknown, init?: { status?: number; headers?: Record<string, string> }) {
      const resp = new MockNextResponse(JSON.stringify(data), init);
      return resp;
    }
  }

  return {
    NextResponse: MockNextResponse,
    NextRequest: jest.fn(),
  };
});

// Mock @/lib/jwt for get-role route
jest.mock("@/lib/jwt", () => ({
  getRoleFromToken: jest.fn(),
  isTokenExpired: jest.fn(),
}));

// Helper to create a mock request with cookies
function createMockRequest(options: {
  method?: string;
  cookies?: Record<string, string>;
  body?: unknown;
  url?: string;
} = {}) {
  const cookieMap = new Map(
    Object.entries(options.cookies ?? {}).map(([k, v]) => [k, { name: k, value: v }])
  );

  return {
    method: options.method ?? "GET",
    url: options.url ?? "http://localhost:3000/api/auth/test",
    cookies: {
      get: (name: string) => cookieMap.get(name),
      getAll: () => Array.from(cookieMap.values()),
      has: (name: string) => cookieMap.has(name),
    },
    json: jest.fn().mockResolvedValue(options.body ?? {}),
    headers: new Map(),
  };
}

// ============ GET /api/auth/get-role ============
describe("GET /api/auth/get-role", () => {
  let GET: (req: unknown) => Promise<unknown>;
  let getRoleFromToken: jest.Mock;
  let isTokenExpired: jest.Mock;

  beforeAll(async () => {
    const mod = await import("@/app/api/auth/get-role/route");
    GET = mod.GET as (req: unknown) => Promise<unknown>;
    const jwt = await import("@/lib/jwt");
    getRoleFromToken = jwt.getRoleFromToken as jest.Mock;
    isTokenExpired = jwt.isTokenExpired as jest.Mock;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return null role when no auth-token cookie", async () => {
    const req = createMockRequest({ cookies: {} });
    const res = await GET(req);
    const data = await (res as { json: () => Promise<Record<string, unknown>> }).json();
    expect(data.role).toBeNull();
    expect(data.authenticated).toBe(false);
  });

  it("should return null role with expired flag when token is expired", async () => {
    isTokenExpired.mockReturnValue(true);
    const req = createMockRequest({ cookies: { "auth-token": "expired-token" } });
    const res = await GET(req);
    const data = await (res as { json: () => Promise<Record<string, unknown>> }).json();
    expect(data.role).toBeNull();
    expect(data.expired).toBe(true);
    expect(data.authenticated).toBe(false);
  });

  it("should return role when token is valid", async () => {
    isTokenExpired.mockReturnValue(false);
    getRoleFromToken.mockReturnValue("SELLER");
    const req = createMockRequest({ cookies: { "auth-token": "valid-token" } });
    const res = await GET(req);
    const data = await (res as { json: () => Promise<Record<string, unknown>> }).json();
    expect(data.role).toBe("SELLER");
    expect(data.authenticated).toBe(true);
  });

  it("should return error response when jwt throws", async () => {
    isTokenExpired.mockImplementation(() => { throw new Error("JWT malformed"); });
    const req = createMockRequest({ cookies: { "auth-token": "bad-token" } });
    const res = await GET(req);
    const data = await (res as { json: () => Promise<Record<string, unknown>> }).json();
    expect(data.role).toBeNull();
    expect(data.authenticated).toBe(false);
  });
});

// ============ GET /api/auth/get-token ============
describe("GET /api/auth/get-token", () => {
  let GET: (req: unknown) => Promise<unknown>;

  beforeAll(async () => {
    const mod = await import("@/app/api/auth/get-token/route");
    GET = mod.GET as (req: unknown) => Promise<unknown>;
  });

  it("should return token status when tokens exist", async () => {
    const req = createMockRequest({
      cookies: { "auth-token": "abc123", "refresh-token": "def456" },
    });
    const res = await GET(req);
    const data = await (res as { json: () => Promise<Record<string, unknown>> }).json();
    expect(data.hasAuthToken).toBe(true);
    expect(data.hasRefreshToken).toBe(true);
  });

  it("should return false when no tokens present", async () => {
    const req = createMockRequest({ cookies: {} });
    const res = await GET(req);
    const data = await (res as { json: () => Promise<Record<string, unknown>> }).json();
    expect(data.hasAuthToken).toBe(false);
    expect(data.hasRefreshToken).toBe(false);
  });
});

// ============ POST /api/auth/set-cookie ============
describe("POST /api/auth/set-cookie", () => {
  let POST: (req: unknown) => Promise<unknown>;

  beforeAll(async () => {
    const mod = await import("@/app/api/auth/set-cookie/route");
    POST = mod.POST as (req: unknown) => Promise<unknown>;
  });

  it("should set cookie successfully for allowed name", async () => {
    const req = createMockRequest({
      method: "POST",
      body: { name: "auth-token", value: "test-token-value" },
    });
    const res = await POST(req);
    const data = await (res as { json: () => Promise<Record<string, unknown>> }).json();
    expect(data.message).toContain("success");
  });

  it("should reject when name is missing", async () => {
    const req = createMockRequest({
      method: "POST",
      body: { value: "test" },
    });
    const res = await POST(req);
    const status = (res as { status: number }).status;
    expect(status).toBe(400);
  });

  it("should reject when value is missing", async () => {
    const req = createMockRequest({
      method: "POST",
      body: { name: "auth-token" },
    });
    const res = await POST(req);
    const status = (res as { status: number }).status;
    expect(status).toBe(400);
  });

  it("should reject forbidden cookie names", async () => {
    const req = createMockRequest({
      method: "POST",
      body: { name: "evil-cookie", value: "hacker" },
    });
    const res = await POST(req);
    const status = (res as { status: number }).status;
    expect(status).toBe(403);
  });
});

// ============ POST /api/auth/set-token ============
describe("POST /api/auth/set-token", () => {
  let POST: (req: unknown) => Promise<unknown>;

  beforeAll(async () => {
    const mod = await import("@/app/api/auth/set-token/route");
    POST = mod.POST as (req: unknown) => Promise<unknown>;
  });

  it("should set tokens successfully", async () => {
    const req = createMockRequest({
      method: "POST",
      body: { accessToken: "access-abc", refreshToken: "refresh-def" },
    });
    const res = await POST(req);
    const data = await (res as { json: () => Promise<Record<string, unknown>> }).json();
    expect(data.message).toContain("success");
  });

  it("should reject when accessToken is missing", async () => {
    const req = createMockRequest({
      method: "POST",
      body: { refreshToken: "refresh-only" },
    });
    const res = await POST(req);
    const status = (res as { status: number }).status;
    expect(status).toBe(400);
  });

  it("should work without refreshToken", async () => {
    const req = createMockRequest({
      method: "POST",
      body: { accessToken: "access-only" },
    });
    const res = await POST(req);
    const data = await (res as { json: () => Promise<Record<string, unknown>> }).json();
    expect(data.message).toContain("success");
  });

  it("should accept rememberMe flag", async () => {
    const req = createMockRequest({
      method: "POST",
      body: { accessToken: "abc", refreshToken: "def", rememberMe: true },
    });
    const res = await POST(req);
    const data = await (res as { json: () => Promise<Record<string, unknown>> }).json();
    expect(data.message).toContain("success");
  });
});

// ============ POST /api/auth/clear-cookie ============
describe("POST /api/auth/clear-cookie", () => {
  let POST: (req: unknown) => Promise<unknown>;

  beforeAll(async () => {
    const mod = await import("@/app/api/auth/clear-cookie/route");
    POST = mod.POST as (req: unknown) => Promise<unknown>;
  });

  it("should clear allowed cookie", async () => {
    const req = createMockRequest({
      method: "POST",
      body: { name: "auth-token" },
    });
    const res = await POST(req);
    const data = await (res as { json: () => Promise<Record<string, unknown>> }).json();
    expect(data.message).toContain("cleared");
  });

  it("should reject when name is missing", async () => {
    const req = createMockRequest({
      method: "POST",
      body: {},
    });
    const res = await POST(req);
    const status = (res as { status: number }).status;
    expect(status).toBe(400);
  });

  it("should reject forbidden cookie names", async () => {
    const req = createMockRequest({
      method: "POST",
      body: { name: "session-id" },
    });
    const res = await POST(req);
    const status = (res as { status: number }).status;
    expect(status).toBe(403);
  });
});

// ============ POST /api/auth/clear-tokens ============
describe("POST /api/auth/clear-tokens", () => {
  let POST: (req: unknown) => Promise<unknown>;

  beforeAll(async () => {
    const mod = await import("@/app/api/auth/clear-tokens/route");
    POST = mod.POST as (req: unknown) => Promise<unknown>;
  });

  it("should clear both tokens successfully", async () => {
    const req = createMockRequest({ method: "POST" });
    const res = await POST(req);
    const data = await (res as { json: () => Promise<Record<string, unknown>> }).json();
    expect(data.message).toContain("cleared");
  });
});
