/**
 * Tests for GET/PUT/POST /api/user/onboarding
 * Covers: auth check, backend proxy for GET/PUT/POST, error handling
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

const mockApiRequest = jest.fn();
jest.mock("@/lib/api-client", () => ({
  apiRequest: (...args: any[]) => mockApiRequest(...args),
}));

let GET: any, PUT: any, POST: any;

beforeAll(async () => {
  const mod = await import("@/app/api/user/onboarding/route");
  GET = mod.GET;
  PUT = mod.PUT;
  POST = mod.POST;
});

beforeEach(() => {
  jest.clearAllMocks();
});

function makeRequest(body?: any) {
  return {
    json: jest.fn().mockResolvedValue(body || {}),
    headers: { get: jest.fn().mockReturnValue("auth-token=jwt-123") },
  } as any;
}

describe("GET /api/user/onboarding", () => {
  it("should return 401 when no auth token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("should proxy to backend and return onboarding data", async () => {
    mockCookieStore.get.mockReturnValue({ value: "jwt-123" });
    mockApiRequest.mockResolvedValue({ success: true, data: { step: 2, completed: false } });
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.timestamp).toBeDefined();
    expect(mockApiRequest).toHaveBeenCalledWith("/api/users/onboarding", expect.objectContaining({ method: "GET" }));
  });

  it("should return 500 on backend error", async () => {
    mockCookieStore.get.mockReturnValue({ value: "jwt-123" });
    mockApiRequest.mockRejectedValue(new Error("Backend down"));
    const res = await GET(makeRequest());
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.code).toBe("FETCH_ERROR");
    expect(json.error.message).toBe("Backend down");
  });
});

describe("PUT /api/user/onboarding", () => {
  it("should return 401 when no auth token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const res = await PUT(makeRequest({ step: 3 }));
    expect(res.status).toBe(401);
  });

  it("should proxy update to backend", async () => {
    mockCookieStore.get.mockReturnValue({ value: "jwt-123" });
    mockApiRequest.mockResolvedValue({ success: true, data: { step: 3 } });
    const res = await PUT(makeRequest({ step: 3 }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(mockApiRequest).toHaveBeenCalledWith("/api/users/onboarding", expect.objectContaining({
      method: "PUT",
      body: JSON.stringify({ step: 3 }),
    }));
  });

  it("should return 500 on update error", async () => {
    mockCookieStore.get.mockReturnValue({ value: "jwt-123" });
    mockApiRequest.mockRejectedValue(new Error("Update failed"));
    const res = await PUT(makeRequest({ step: 3 }));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.code).toBe("UPDATE_ERROR");
  });
});

describe("POST /api/user/onboarding (complete)", () => {
  it("should return 401 when no auth token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const res = await POST(makeRequest());
    expect(res.status).toBe(401);
  });

  it("should complete onboarding via backend", async () => {
    mockCookieStore.get.mockReturnValue({ value: "jwt-123" });
    mockApiRequest.mockResolvedValue({ success: true, data: { completed: true } });
    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(mockApiRequest).toHaveBeenCalledWith("/api/users/onboarding/complete", expect.objectContaining({ method: "POST" }));
  });

  it("should return 500 on complete error", async () => {
    mockCookieStore.get.mockReturnValue({ value: "jwt-123" });
    mockApiRequest.mockRejectedValue(new Error("Complete failed"));
    const res = await POST(makeRequest());
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.code).toBe("COMPLETE_ERROR");
  });
});
