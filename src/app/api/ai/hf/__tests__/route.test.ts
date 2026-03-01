/**
 * Hugging Face AI Proxy API Route Tests
 */
jest.mock("next/server", () => {
  class MockNextResponse {
    body: unknown; status: number; headers: Map<string,string>;
    constructor(body: unknown, init?: {status?: number}) {
      this.body = body; this.status = init?.status || 200; this.headers = new Map();
    }
    json() { return Promise.resolve(typeof this.body === 'string' ? JSON.parse(this.body) : this.body); }
    static json(data: unknown, init?: {status?: number}) { return new MockNextResponse(data, init); }
  }
  class MockNextRequest {
    url: string; method: string; headers: Map<string,string>; private _body: string|undefined;
    nextUrl: {searchParams: URLSearchParams};
    constructor(url: string, init?: {method?: string; body?: string; headers?: Record<string,string>}) {
      this.url = url; this.method = init?.method || "GET"; this._body = init?.body;
      this.headers = new Map(Object.entries(init?.headers || {}));
      this.nextUrl = { searchParams: new URL(url).searchParams };
    }
    async json() { return JSON.parse(this._body || "{}"); }
  }
  return { NextResponse: MockNextResponse, NextRequest: MockNextRequest };
});

jest.mock("@/lib/ai/config", () => ({
  HF_API_ENDPOINT: "https://api-inference.huggingface.co/models",
}));

import { NextRequest } from "next/server";

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("HuggingFace AI Proxy API", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env = { ...originalEnv, HF_API_KEY: "test-key-123" };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("POST", () => {
    it("should return 500 when API key not configured", async () => {
      process.env.HF_API_KEY = "";
      process.env.NEXT_PUBLIC_HF_API_KEY = "";
      const { POST } = await import("../route");
      const req = new (NextRequest as any)("http://localhost/api/ai/hf", {
        method: "POST",
        body: JSON.stringify({ inputs: "test" }),
      });
      const res = await POST(req);
      const json = await res.json();
      expect(res.status).toBe(500);
      expect(json.error).toContain("not configured");
    });

    it("should proxy request to HuggingFace API", async () => {
      mockFetch.mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve([{ generated_text: "Hello world" }]),
      });
      const { POST } = await import("../route");
      const req = new (NextRequest as any)("http://localhost/api/ai/hf", {
        method: "POST",
        body: JSON.stringify({ inputs: "Say hello" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("huggingface.co/models"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer test-key-123",
          }),
        })
      );
    });

    it("should use custom model when provided", async () => {
      mockFetch.mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve({ result: "ok" }),
      });
      const { POST } = await import("../route");
      const req = new (NextRequest as any)("http://localhost/api/ai/hf", {
        method: "POST",
        body: JSON.stringify({ model: "custom/model-v1", inputs: "test" }),
      });
      await POST(req);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("custom/model-v1"),
        expect.any(Object)
      );
    });

    it("should return 500 on proxy error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Connection refused"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const { POST } = await import("../route");
      const req = new (NextRequest as any)("http://localhost/api/ai/hf", {
        method: "POST",
        body: JSON.stringify({ inputs: "test" }),
      });
      const res = await POST(req);
      const json = await res.json();
      expect(res.status).toBe(500);
      expect(json.error).toBe("Proxy error");
      consoleSpy.mockRestore();
    });

    it("should handle non-JSON response gracefully", async () => {
      mockFetch.mockResolvedValueOnce({
        status: 503,
        json: () => Promise.reject(new Error("not JSON")),
      });
      const { POST } = await import("../route");
      const req = new (NextRequest as any)("http://localhost/api/ai/hf", {
        method: "POST",
        body: JSON.stringify({ inputs: "test" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(503);
    });
  });

  describe("GET", () => {
    it("should return health check", async () => {
      const { GET } = await import("../route");
      const res = await GET();
      const json = await res.json();
      expect(res.status).toBe(200);
      expect(json.ok).toBe(true);
    });
  });
});
