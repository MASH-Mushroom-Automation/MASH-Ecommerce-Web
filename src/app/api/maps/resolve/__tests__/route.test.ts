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

import { NextRequest } from "next/server";

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Dynamic import to allow fetch mock setup
const getHandlers = async () => {
  const mod = await import("../route");
  return mod;
};

describe("Maps Resolve API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST", () => {
    it("should return 400 when url is missing from body", async () => {
      const { POST } = await getHandlers();
      const request = new NextRequest("http://localhost:3000/api/maps/resolve", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe("Missing url");
    });

    it("should resolve Google Maps embed URL", async () => {
      const { POST } = await getHandlers();
      mockFetch.mockResolvedValueOnce({
        url: "https://www.google.com/maps/embed?pb=test123",
      });

      const request = new NextRequest("http://localhost:3000/api/maps/resolve", {
        method: "POST",
        body: JSON.stringify({ url: "https://maps.google.com/short" }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.embedUrl).toContain("/maps/embed");
    });

    it("should resolve Google Maps place URL", async () => {
      const { POST } = await getHandlers();
      mockFetch.mockResolvedValueOnce({
        url: "https://www.google.com/maps/place/Manila",
      });

      const request = new NextRequest("http://localhost:3000/api/maps/resolve", {
        method: "POST",
        body: JSON.stringify({ url: "https://maps.google.com/place" }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.embedUrl).toContain("/maps/place");
    });

    it("should resolve URL with pb parameter", async () => {
      const { POST } = await getHandlers();
      mockFetch.mockResolvedValueOnce({
        url: "https://www.google.com/maps?pb=!1m18",
      });

      const request = new NextRequest("http://localhost:3000/api/maps/resolve", {
        method: "POST",
        body: JSON.stringify({ url: "https://maps.google.com/link" }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.embedUrl).toContain("pb=");
    });

    it("should return null embedUrl for non-map URLs", async () => {
      const { POST } = await getHandlers();
      mockFetch.mockResolvedValueOnce({
        url: "https://www.example.com/not-a-map",
      });

      const request = new NextRequest("http://localhost:3000/api/maps/resolve", {
        method: "POST",
        body: JSON.stringify({ url: "https://example.com" }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.embedUrl).toBeNull();
    });

    it("should return 500 on fetch error", async () => {
      const { POST } = await getHandlers();
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const request = new NextRequest("http://localhost:3000/api/maps/resolve", {
        method: "POST",
        body: JSON.stringify({ url: "https://example.com" }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.embedUrl).toBeNull();
      expect(json.error).toBe("Network error");
    });

    it("should follow redirects", async () => {
      const { POST } = await getHandlers();
      mockFetch.mockResolvedValueOnce({
        url: "https://www.google.com/maps/embed?pb=final",
      });

      const request = new NextRequest("http://localhost:3000/api/maps/resolve", {
        method: "POST",
        body: JSON.stringify({ url: "https://goo.gl/maps/short" }),
      });

      await POST(request);

      expect(mockFetch).toHaveBeenCalledWith("https://goo.gl/maps/short", {
        redirect: "follow",
      });
    });
  });

  describe("GET", () => {
    it("should return ok status", async () => {
      const { GET } = await getHandlers();
      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.ok).toBe(true);
    });
  });
});
