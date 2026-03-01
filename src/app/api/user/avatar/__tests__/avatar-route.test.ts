/**
 * Tests for POST /api/user/avatar
 * Covers: auth, formData forwarding, success, backend errors, network errors
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

let POST: any;
const originalFetch = global.fetch;

beforeAll(async () => {
  const mod = await import("@/app/api/user/avatar/route");
  POST = mod.POST;
});

afterAll(() => {
  global.fetch = originalFetch;
});

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
});

function makeRequest(opts: { formData?: any; cookie?: string } = {}) {
  return {
    formData: jest.fn().mockResolvedValue(opts.formData || new FormData()),
    headers: { get: jest.fn().mockReturnValue(opts.cookie || "") },
  } as any;
}

describe("POST /api/user/avatar", () => {
  it("should return 401 when no auth token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const res = await POST(makeRequest());
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("should upload avatar successfully", async () => {
    mockCookieStore.get.mockReturnValue({ value: "jwt-token" });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: { avatarUrl: "https://cdn.example.com/avatar.jpg" } }),
    });
    const res = await POST(makeRequest({ cookie: "auth-token=jwt-token" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.avatarUrl).toBe("https://cdn.example.com/avatar.jpg");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/users/avatar"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("should handle backend non-ok response", async () => {
    mockCookieStore.get.mockReturnValue({ value: "jwt-token" });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 413,
      json: () => Promise.resolve({ message: "File too large" }),
    });
    const res = await POST(makeRequest());
    expect(res.status).toBe(413);
    const json = await res.json();
    expect(json.error.code).toBe("UPLOAD_FAILED");
  });

  it("should handle backend JSON parse failure", async () => {
    mockCookieStore.get.mockReturnValue({ value: "jwt-token" });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error("Invalid JSON")),
    });
    const res = await POST(makeRequest());
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.code).toBe("UPLOAD_FAILED");
  });

  it("should handle response with flat JSON (no .data wrapper)", async () => {
    mockCookieStore.get.mockReturnValue({ value: "jwt-token" });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ url: "https://cdn.example.com/avatar2.jpg" }),
    });
    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.url).toBe("https://cdn.example.com/avatar2.jpg");
  });

  it("should return 500 on network error", async () => {
    mockCookieStore.get.mockReturnValue({ value: "jwt-token" });
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));
    const res = await POST(makeRequest());
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.code).toBe("UPLOAD_ERROR");
    expect(json.error.message).toBe("Network error");
  });
});
