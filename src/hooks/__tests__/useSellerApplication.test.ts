import { submitSellerApplication } from "../useSellerApplication"; // import the function directly

describe("submitSellerApplication uses proxy route", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.NEXT_PUBLIC_API_URL;
    jest.clearAllMocks();
  });

  it("always calls the internal proxy '/api/user/apply-as-seller'", async () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.mashmarket.app";

    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    global.fetch = mockFetch as any;

    await submitSellerApplication({ businessName: "x" } as any);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const callUrl = mockFetch.mock.calls[0][0];
    const options = mockFetch.mock.calls[0][1] || {};

    expect(callUrl).toBe("/api/user/apply-as-seller");
    expect(options.method).toBe("POST");
    expect(options.credentials).toBe("include");
    expect(options.headers["Content-Type"]).toBe("application/json");
  });

  it("works even when NEXT_PUBLIC_API_URL includes /api/v1", async () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.mashmarket.app/api/v1";

    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    global.fetch = mockFetch as any;

    await submitSellerApplication({ businessName: "x" } as any);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const callUrl = mockFetch.mock.calls[0][0];
    const options = mockFetch.mock.calls[0][1] || {};

    expect(callUrl).toBe("/api/user/apply-as-seller");
    expect(options.method).toBe("POST");
    expect(options.credentials).toBe("include");
  });

  it("still uses proxy route when env is missing", async () => {
    delete process.env.NEXT_PUBLIC_API_URL;

    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    global.fetch = mockFetch as any;

    await submitSellerApplication({ businessName: "x" } as any);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const callUrl = mockFetch.mock.calls[0][0];
    expect(callUrl).toBe("/api/user/apply-as-seller");
  });
});
