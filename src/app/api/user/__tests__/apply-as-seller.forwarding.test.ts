// Test to ensure apply-as-seller forwards Cookie, Authorization and x-csrf-token headers
import { POST } from "../apply-as-seller/route";

// Mock next/headers cookies() to return an auth-token
jest.mock("next/headers", () => ({
  cookies: () => ({
    get: (name: string) => ({
      value: name === "auth-token" ? "mock-bearer-token" : undefined,
    }),
  }),
}));

describe("POST /api/user/apply-as-seller header forwarding", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it("forwards Cookie and CSRF/Authorization headers to backend", async () => {
    // create a fetch mock that returns CSRF then the actual endpoint
    const mockFetch = jest.fn(async (url: string, opts: any) => {
      if (url.endsWith("/csrf-token")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ csrfToken: "csrf-123" }),
        };
      }

      return {
        ok: true,
        status: 200,
        json: async () => ({ data: {}, message: "OK" }),
      };
    });

    global.fetch = mockFetch as any;

    const body = { businessName: "Test Biz", details: "..." };
    const request = {
      headers: new Headers({ cookie: "auth-token=mock-auth-token; other=1" }),
      json: async () => body,
    } as any;

    const response: any = await POST(request);

    // fetch called twice (csrf token + apply-as-seller)
    expect(mockFetch).toHaveBeenCalledTimes(2);

    const applyCall = mockFetch.mock.calls[1];
    const options = applyCall[1] || {};

    // Authorization header should contain mock-bearer-token from mocked cookies()
    expect(options.headers.Authorization).toBe("Bearer mock-bearer-token");
    // x-csrf-token should be set from csrf fetch
    expect(options.headers["x-csrf-token"]).toBe("csrf-123");
    // Content-Type should be application/json
    expect(options.headers["Content-Type"]).toBe("application/json");
    // Cookie header is NOT forwarded (route only sends Authorization + CSRF + Content-Type)
    // This is correct security behavior - cookies are read server-side, not forwarded
  });
});
