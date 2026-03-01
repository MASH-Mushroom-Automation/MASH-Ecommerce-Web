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

// Mock MainApi
const mockGetHomePageData = jest.fn();
const mockGetAboutContent = jest.fn();
const mockGetFAQContent = jest.fn();
const mockGetGrowers = jest.fn();

jest.mock("@/lib/api/main", () => ({
  MainApi: {
    get getHomePageData() { return mockGetHomePageData; },
    get getAboutContent() { return mockGetAboutContent; },
    get getFAQContent() { return mockGetFAQContent; },
    get getGrowers() { return mockGetGrowers; },
  },
}));

describe("Main API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("/api/main/home", () => {
    it("should return home page data on success", async () => {
      const mockData = { hero: [], featured: [], categories: [] };
      mockGetHomePageData.mockResolvedValueOnce(mockData);

      const { GET } = require("@/app/api/main/home/route");
      const request = new NextRequest("http://localhost:3000/api/main/home");
      const response = await GET(request);
      const json = await response.json();

      expect(json).toEqual(mockData);
    });

    it("should return 500 on error", async () => {
      mockGetHomePageData.mockRejectedValueOnce(new Error("DB error"));

      const { GET } = require("@/app/api/main/home/route");
      const request = new NextRequest("http://localhost:3000/api/main/home");
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe("Failed to fetch home page data");
    });
  });

  describe("/api/main/about", () => {
    it("should return about content on success", async () => {
      const mockData = { mission: "Test mission", team: [] };
      mockGetAboutContent.mockResolvedValueOnce(mockData);

      const { GET } = require("@/app/api/main/about/route");
      const request = new NextRequest("http://localhost:3000/api/main/about");
      const response = await GET(request);
      const json = await response.json();

      expect(json).toEqual(mockData);
    });

    it("should return 500 on error", async () => {
      mockGetAboutContent.mockRejectedValueOnce(new Error("Failed"));

      const { GET } = require("@/app/api/main/about/route");
      const request = new NextRequest("http://localhost:3000/api/main/about");
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe("Failed to fetch about content");
    });
  });

  describe("/api/main/faq", () => {
    it("should return FAQ content on success", async () => {
      const mockData = [{ question: "Q1", answer: "A1" }];
      mockGetFAQContent.mockResolvedValueOnce(mockData);

      const { GET } = require("@/app/api/main/faq/route");
      const request = new NextRequest("http://localhost:3000/api/main/faq");
      const response = await GET(request);
      const json = await response.json();

      expect(json).toEqual(mockData);
    });

    it("should return 500 on error", async () => {
      mockGetFAQContent.mockRejectedValueOnce(new Error("Failed"));

      const { GET } = require("@/app/api/main/faq/route");
      const request = new NextRequest("http://localhost:3000/api/main/faq");
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe("Failed to fetch FAQ content");
    });
  });

  describe("/api/main/growers", () => {
    it("should return growers on success", async () => {
      const mockData = [{ id: "1", name: "Farm Fresh" }];
      mockGetGrowers.mockResolvedValueOnce(mockData);

      const { GET } = require("@/app/api/main/growers/route");
      const request = new NextRequest("http://localhost:3000/api/main/growers");
      const response = await GET(request);
      const json = await response.json();

      expect(json).toEqual(mockData);
    });

    it("should return 500 on error", async () => {
      mockGetGrowers.mockRejectedValueOnce(new Error("Failed"));

      const { GET } = require("@/app/api/main/growers/route");
      const request = new NextRequest("http://localhost:3000/api/main/growers");
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe("Failed to fetch growers");
    });
  });
});
