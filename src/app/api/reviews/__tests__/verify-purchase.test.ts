/**
 * Verify Purchase API Route Tests
 *
 * Tests the GET /api/reviews/verify-purchase endpoint.
 * Mocks fetch to simulate backend order API responses.
 */

// Re-setup global.fetch as jest.fn before import so the route module gets a mock
beforeAll(() => {
  (global.fetch as jest.Mock) = jest.fn();
});

// Import the route handler
import { GET } from "../verify-purchase/route";

/**
 * Create a minimal request-like object with a URL.
 * We avoid `new NextRequest()` because the jest.setupMocks.js Request polyfill
 * uses a setter for `url` while NextRequest expects a getter-only property.
 */
function makeRequest(params: Record<string, string>) {
  const url = new URL("http://localhost:3000/api/reviews/verify-purchase");
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  // The handler only accesses request.url, so a plain object is sufficient
  return { url: url.toString() } as Parameters<typeof GET>[0];
}

describe("GET /api/reviews/verify-purchase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Re-setup fetch mock after clearAllMocks
    (global.fetch as jest.Mock) = jest.fn();
  });

  it("returns 400 when userId is missing", async () => {
    const request = makeRequest({ productId: "product-1" });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("Missing required");
    expect(data.verified).toBe(false);
  });

  it("returns 400 when productId is missing", async () => {
    const request = makeRequest({ userId: "user-1" });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("Missing required");
    expect(data.verified).toBe(false);
  });

  it("returns verified: true when user has delivered order with matching product", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            {
              items: [{ productId: "product-1" }],
            },
          ],
        }),
    });

    const request = makeRequest({ userId: "user-1", productId: "product-1" });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.verified).toBe(true);
  });

  it("returns verified: true when matching via sanityId", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            {
              items: [{ sanityId: "product-1" }],
            },
          ],
        }),
    });

    const request = makeRequest({ userId: "user-1", productId: "product-1" });
    const response = await GET(request);
    const data = await response.json();

    expect(data.verified).toBe(true);
  });

  it("returns verified: false when no matching orders", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            {
              items: [{ productId: "other-product" }],
            },
          ],
        }),
    });

    const request = makeRequest({ userId: "user-1", productId: "product-1" });
    const response = await GET(request);
    const data = await response.json();

    expect(data.verified).toBe(false);
  });

  it("returns verified: false when backend returns non-ok status", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

    const request = makeRequest({ userId: "user-1", productId: "product-1" });
    const response = await GET(request);
    const data = await response.json();

    expect(data.verified).toBe(false);
    consoleSpy.mockRestore();
  });

  it("returns verified: false when backend is unreachable", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

    const request = makeRequest({ userId: "user-1", productId: "product-1" });
    const response = await GET(request);
    const data = await response.json();

    expect(data.verified).toBe(false);
    consoleSpy.mockRestore();
  });

  it("handles array response format (no data wrapper)", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            items: [{ productId: "product-1" }],
          },
        ]),
    });

    const request = makeRequest({ userId: "user-1", productId: "product-1" });
    const response = await GET(request);
    const data = await response.json();

    expect(data.verified).toBe(true);
  });
});
