// Batch 7 API Route Tests: Seller Stock Batch, Thresholds
// Location: src/app/api/__tests__/api-routes-batch7.test.ts

jest.mock("next/server", () => {
  class MockNextResponse {
    body; status; headers;
    constructor(body, init) {
      this.body = body; this.status = init?.status || 200; this.headers = new Map();
    }
    json() { return Promise.resolve(this.body); }
    static json(data, init) { return new MockNextResponse(data, init); }
  }
  class MockNextRequest {
    url; method; headers; _body;
    nextUrl;
    constructor(url, init) {
      this.url = url; this.method = init?.method || "POST"; this._body = init?.body;
      this.headers = new Map(Object.entries(init?.headers || {}));
      this.nextUrl = { searchParams: new URL(url).searchParams };
    }
    async json() { return JSON.parse(this._body || "{}") }
  }
  return { NextResponse: MockNextResponse, NextRequest: MockNextRequest };
});

jest.mock("@sanity/client", () => ({
  createClient: jest.fn(() => ({
    createOrReplace: jest.fn(() => Promise.resolve({ _id: "prod-1" })),
    fetch: jest.fn(() => Promise.resolve({ _id: "prod-1", _rev: "rev-1", stockQuantity: 50 })),
    create: jest.fn(() => Promise.resolve({ _id: "adj-1" })),
    patch: jest.fn(() => ({ ifRevisionID: jest.fn().mockReturnThis(), set: jest.fn().mockReturnThis(), commit: jest.fn(() => Promise.resolve({ _id: "prod-1" })) })),
  }))
}));

describe("POST /api/seller/stock/batch", () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = "pid";
    process.env.NEXT_PUBLIC_SANITY_DATASET = "ds";
    process.env.NEXT_PUBLIC_SANITY_API_VERSION = "2024-01-01";
    process.env.SANITY_API_WRITE_TOKEN = "token";
  });
  it("should process valid batch and return success", async () => {
    const { POST } = require("../seller/stock/batch/route");
    const req = new (require("next/server").NextRequest)("http://localhost/api/seller/stock/batch", { body: JSON.stringify({ adjustments: [{ sku: "sku-1", adjustmentType: "received", quantityChange: 10, reason: "restock" }], mode: "partial" }) });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it("should handle missing adjustments", async () => {
    const { POST } = require("../seller/stock/batch/route");
    const req = new (require("next/server").NextRequest)("http://localhost/api/seller/stock/batch", { body: JSON.stringify({}) });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

describe("POST /api/seller/stock/thresholds", () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = "pid";
    process.env.NEXT_PUBLIC_SANITY_DATASET = "ds";
    process.env.NEXT_PUBLIC_SANITY_API_VERSION = "2024-01-01";
    process.env.SANITY_API_WRITE_TOKEN = "token";
  });
  it("should update threshold for valid product", async () => {
    const { POST } = require("../seller/stock/thresholds/route");
    const req = new (require("next/server").NextRequest)("http://localhost/api/seller/stock/thresholds", { body: JSON.stringify({ productId: "prod-1", thresholds: { lowStockThreshold: 10, outOfStockThreshold: 5, restockLevel: 20 } }) });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it("should handle missing productId", async () => {
    const { POST } = require("../seller/stock/thresholds/route");
    const req = new (require("next/server").NextRequest)("http://localhost/api/seller/stock/thresholds", { body: JSON.stringify({ thresholds: { lowStockThreshold: 10, outOfStockThreshold: 5, restockLevel: 20 } }) });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});
