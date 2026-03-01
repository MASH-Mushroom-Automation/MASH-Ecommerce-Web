/**
 * Tests for GET/PUT /api/user/profile
 * Covers: auth, Firebase profile fetch, backend proxy, 404 handling, PUT update
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

const mockGetProfile = jest.fn();
jest.mock("@/lib/firebase", () => ({
  FirebaseUserService: {
    getProfile: (...args: any[]) => mockGetProfile(...args),
  },
}));

let GET: any, PUT: any;

beforeAll(async () => {
  const mod = await import("@/app/api/user/profile/route");
  GET = mod.GET;
  PUT = mod.PUT;
});

beforeEach(() => {
  jest.clearAllMocks();
});

function createRequest(options: { body?: any; headers?: Record<string, string> } = {}) {
  return {
    json: jest.fn().mockResolvedValue(options.body || {}),
    headers: { get: jest.fn((name: string) => (options.headers || {})[name] || "") },
  } as any;
}

describe("GET /api/user/profile", () => {
  it("should return 401 when no token and no firebase cookie", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const res = await GET(createRequest());
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("should return profile from Firestore when firebase-auth cookie exists", async () => {
    mockCookieStore.get.mockImplementation((name: string) => {
      if (name === "auth-token") return undefined;
      if (name === "firebase-auth") return { value: "uid-123" };
      return undefined;
    });
    mockGetProfile.mockResolvedValue({ id: "uid-123", email: "test@example.com", displayName: "Test User" });
    const res = await GET(createRequest());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.email).toBe("test@example.com");
  });

  it("should return 404 when Firebase profile not found", async () => {
    mockCookieStore.get.mockImplementation((name: string) => {
      if (name === "auth-token") return undefined;
      if (name === "firebase-auth") return { value: "uid-missing" };
      return undefined;
    });
    mockGetProfile.mockResolvedValue(null);
    const res = await GET(createRequest());
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error.code).toBe("NOT_FOUND");
  });

  it("should return 500 when Firestore throws", async () => {
    mockCookieStore.get.mockImplementation((name: string) => {
      if (name === "auth-token") return undefined;
      if (name === "firebase-auth") return { value: "uid-error" };
      return undefined;
    });
    mockGetProfile.mockRejectedValue(new Error("Firestore unavailable"));
    const res = await GET(createRequest());
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.code).toBe("FETCH_ERROR");
  });

  it("should proxy to backend when auth-token exists", async () => {
    mockCookieStore.get.mockImplementation((name: string) => {
      if (name === "auth-token") return { value: "jwt-token" };
      return undefined;
    });
    mockApiRequest.mockResolvedValue({ success: true, data: { id: "1", email: "user@test.com" } });
    const res = await GET(createRequest({ headers: { cookie: "auth-token=jwt-token" } }));
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(mockApiRequest).toHaveBeenCalledWith("/users/profile", expect.objectContaining({ method: "GET" }));
  });

  it("should return 404 for backend User not found error", async () => {
    mockCookieStore.get.mockImplementation((name: string) => {
      if (name === "auth-token") return { value: "jwt-token" };
      return undefined;
    });
    mockApiRequest.mockRejectedValue(new Error("User not found"));
    const res = await GET(createRequest());
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error.code).toBe("NOT_FOUND");
  });

  it("should return 500 for other backend errors", async () => {
    mockCookieStore.get.mockImplementation((name: string) => {
      if (name === "auth-token") return { value: "jwt-token" };
      return undefined;
    });
    mockApiRequest.mockRejectedValue(new Error("Connection timeout"));
    const res = await GET(createRequest());
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.code).toBe("FETCH_ERROR");
  });
});

describe("PUT /api/user/profile", () => {
  it("should return 401 when no token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const res = await PUT(createRequest({ body: { firstName: "New" } }));
    expect(res.status).toBe(401);
  });

  it("should update profile via backend", async () => {
    mockCookieStore.get.mockImplementation((name: string) => {
      if (name === "auth-token") return { value: "jwt-token" };
      return undefined;
    });
    mockApiRequest.mockResolvedValue({ success: true, data: { id: "1", firstName: "New" } });
    const res = await PUT(createRequest({ body: { firstName: "New" } }));
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(mockApiRequest).toHaveBeenCalledWith("/users/profile", expect.objectContaining({ method: "PUT" }));
  });

  it("should return 500 on backend error", async () => {
    mockCookieStore.get.mockImplementation((name: string) => {
      if (name === "auth-token") return { value: "jwt-token" };
      return undefined;
    });
    mockApiRequest.mockRejectedValue(new Error("Update failed"));
    const res = await PUT(createRequest({ body: { firstName: "New" } }));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.code).toBe("UPDATE_ERROR");
  });
});
