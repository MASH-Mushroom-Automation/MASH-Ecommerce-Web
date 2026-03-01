jest.mock("next/server", () => {
  class MockNextResponse {
    body: unknown; status: number; headers: Map<string,string>;
    constructor(body: unknown, init?: {status?: number}) {
      this.body = body; this.status = init?.status || 200; this.headers = new Map();
    }
    json() { return Promise.resolve(typeof this.body === 'string' ? JSON.parse(this.body) : this.body); }
    static json(data: unknown, init?: {status?: number}) { return new MockNextResponse(data, init); }
  }
  return { NextResponse: MockNextResponse };
});

import { GET, HEAD } from "../route";

describe("Health Check API", () => {
  it("should return healthy status on GET", async () => {
    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe("healthy");
    expect(json.timestamp).toBeDefined();
    expect(json.environment).toBeDefined();
  });

  it("should include ISO timestamp", async () => {
    const response = await GET();
    const json = await response.json();

    const date = new Date(json.timestamp);
    expect(date.getTime()).not.toBeNaN();
  });

  it("should include environment field", async () => {
    const response = await GET();
    const json = await response.json();

    expect(typeof json.environment).toBe("string");
  });

  it("should return 200 on HEAD request", async () => {
    const response = await HEAD();
    expect(response.status).toBe(200);
  });

  it("should return null body on HEAD request", async () => {
    const response = await HEAD();
    expect(response.body).toBeNull();
  });
});
