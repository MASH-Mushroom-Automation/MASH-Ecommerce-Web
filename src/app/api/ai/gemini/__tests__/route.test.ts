import { POST, GET } from "@/app/api/ai/gemini/route";
jest.mock("next/server", () => {
  class MockNextResponse {
    body: unknown; status: number; headers: Map<string,string>;
    constructor(body: unknown, init?: {status?: number}) { this.body = body; this.status = init?.status || 200; this.headers = new Map(); }
    json() { return Promise.resolve(this.body); }
    static json(data: unknown, init?: {status?: number}) { return new MockNextResponse(data, init); }
  }
  class MockNextRequest {
    url: string; method: string; headers: Map<string,string>; private _body: string|undefined; nextUrl: {searchParams: URLSearchParams};
    constructor(url: string, init?: {method?: string; body?: string; headers?: Record<string,string>}) { this.url = url; this.method = init?.method || "GET"; this._body = init?.body; this.headers = new Map(Object.entries(init?.headers || {})); this.nextUrl = { searchParams: new URL(url).searchParams }; }
    async json() { return JSON.parse(this._body || "{}"); }
  }
  return { NextResponse: MockNextResponse, NextRequest: MockNextRequest };
});

global.fetch = jest.fn(async (url, opts) => {
  if (url.toString().includes("notfound")) {
    return { ok: false, status: 404, text: async () => "not found", json: async () => ({ error: "not found" }) };
  }
  return { ok: true, status: 200, json: async () => ({ result: "success" }) };
});

describe("Gemini API Route", () => {
  it("GET returns ok", async () => {
    const res = await GET();
    expect(res).toBeDefined();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("POST returns success for valid request", async () => {
    const req = { json: async () => ({ prompt: "hello" }) };
    const res = await POST(req);
    expect(res).toBeDefined();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.result).toBe("success");
  });

  it("POST handles fallback request", async () => {
    const req = { json: async () => ({ model: "notfound" }) };
    const res = await POST(req);
    expect(res).toBeDefined();
    expect(res.status).toBeDefined();
  });

  it("POST returns error if API key missing", async () => {
    process.env.GEMINI_API_KEY = "";
    process.env.NEXT_PUBLIC_GEMINI_API_KEY = "";
    const req = { json: async () => ({ prompt: "test" }) };
    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toContain("API key");
  });
});
