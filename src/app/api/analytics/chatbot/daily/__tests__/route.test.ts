/**
 * Daily Chatbot Analytics API Route Tests
 *
 * Uses jest.resetModules() + jest.doMock() to ensure the analytics mock
 * is applied fresh before each dynamic import of the route module.
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
    url: string; method: string; headers: Map<string,string>;
    nextUrl: {searchParams: URLSearchParams};
    constructor(url: string, init?: {method?: string}) {
      this.url = url; this.method = init?.method || "GET";
      this.headers = new Map();
      this.nextUrl = { searchParams: new URL(url).searchParams };
    }
  }
  return { NextResponse: MockNextResponse, NextRequest: MockNextRequest };
});

import { NextRequest } from "next/server";

describe("GET /api/analytics/chatbot/daily", () => {
  let mockGetDailyStats: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    mockGetDailyStats = jest.fn();
    jest.doMock("@/lib/analytics/chatbot-analytics", () => ({
      getDailyStats: mockGetDailyStats,
    }));
  });

  async function getHandler() {
    const mod = await import("../route");
    return mod.GET;
  }

  it("should return 400 when date param is missing", async () => {
    const GET = await getHandler();
    const req = new (NextRequest as any)("http://localhost/api/analytics/chatbot/daily");
    const res = await GET(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toContain("Date parameter required");
  });

  it("should return 400 for invalid date format", async () => {
    const GET = await getHandler();
    const req = new (NextRequest as any)("http://localhost/api/analytics/chatbot/daily?date=not-a-date");
    const res = await GET(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toContain("Invalid date format");
  });

  it("should return daily stats for valid date", async () => {
    const mockStats = { conversations: 42, messages: 156, date: "2025-01-15" };
    mockGetDailyStats.mockResolvedValueOnce(mockStats);

    const GET = await getHandler();
    const req = new (NextRequest as any)("http://localhost/api/analytics/chatbot/daily?date=2025-01-15");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual(mockStats);
    expect(mockGetDailyStats).toHaveBeenCalledWith(expect.any(Date));
  });

  it("should return 500 on analytics error", async () => {
    mockGetDailyStats.mockRejectedValueOnce(new Error("Firestore unavailable"));
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    const GET = await getHandler();
    const req = new (NextRequest as any)("http://localhost/api/analytics/chatbot/daily?date=2025-01-15");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toContain("Failed to fetch");
    consoleSpy.mockRestore();
  });
});
