// Batch 6 API Route Tests: Lalamove Webhook, Quotation, Reviews Sync-to-Sanity
// Location: src/app/api/__tests__/api-routes-batch6.test.ts

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
    async text() { return this._body || ""; }
  }
  return { NextResponse: MockNextResponse, NextRequest: MockNextRequest };
});

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn().mockResolvedValue({ docs: [], empty: true }),
}));
jest.mock("@/lib/firebase/config", () => ({ firebaseApp: {} }));
jest.mock("@/lib/firebase/orders", () => ({ FirebaseOrdersService: { updateOrderStatus: jest.fn() } }));
jest.mock("crypto", () => ({
  createHmac: jest.fn(() => ({ update: () => ({ digest: () => "validsig" }) })),
}));

jest.mock("@/lib/lalamove/client", () => ({
  getLalamoveClient: jest.fn(() => ({ getQuotation: jest.fn(() => Promise.resolve({ quotationId: "q-1", priceBreakdown: { total: 100, currency: "PHP" }, distance: { value: 5 }, stops: [], expiresAt: new Date().toISOString() })) })),
}));
jest.mock("@sanity/client", () => ({ createClient: jest.fn(() => ({ createOrReplace: jest.fn(() => Promise.resolve({ _id: "review-1" })), fetch: jest.fn(() => Promise.resolve(null)) })) }));

describe("POST /api/lalamove/webhook", () => {
  beforeAll(() => {
    process.env.LALAMOVE_API_SECRET = "secret";
    process.env.LALAMOVE_HOST = "sandbox";
  });
  it("should accept valid webhook and update order", async () => {
    const { POST } = require("../lalamove/webhook/route");
    const req = new (require("next/server").NextRequest)("http://localhost/api/lalamove/webhook", { body: JSON.stringify({ event: "DELIVERY_COMPLETE", orderId: "order-1", timestamp: "2024-01-01T00:00:00Z", data: {} }), headers: { "X-Lalamove-Signature": "validsig" } });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it("should reject invalid signature", async () => {
    process.env.LALAMOVE_HOST = "production";
    const { POST } = require("../lalamove/webhook/route");
    const req = new (require("next/server").NextRequest)("http://localhost/api/lalamove/webhook", { body: JSON.stringify({}), headers: { "X-Lalamove-Signature": "bad" } });
    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe("POST /api/lalamove/quotation", () => {
  it("should return price quote for valid request", async () => {
    const { POST } = require("../lalamove/quotation/route");
    const req = new (require("next/server").NextRequest)("http://localhost/api/lalamove/quotation", { body: JSON.stringify({ pickupLat: 14, pickupLng: 121, pickupAddress: "A", dropoffLat: 14, dropoffLng: 121, dropoffAddress: "B", serviceType: "MOTORCYCLE" }) });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.price).toBe(100);
  });
  it("should handle missing dropoff coordinates", async () => {
    const { POST } = require("../lalamove/quotation/route");
    const req = new (require("next/server").NextRequest)("http://localhost/api/lalamove/quotation", { body: JSON.stringify({ pickupLat: 14, pickupLng: 121 }) });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("POST /api/reviews/sync-to-sanity", () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = "pid";
    process.env.NEXT_PUBLIC_SANITY_DATASET = "ds";
    process.env.NEXT_PUBLIC_SANITY_API_VERSION = "2024-01-01";
    process.env.SANITY_API_WRITE_TOKEN = "token";
  });
  it("should sync review to sanity and return id", async () => {
    const { POST } = require("../reviews/sync-to-sanity/route");
    const req = new (require("next/server").NextRequest)("http://localhost/api/reviews/sync-to-sanity", { body: JSON.stringify({ reviewId: "review-1", reviewData: { targetType: "product", targetId: "prod-1", targetName: "Product", userId: "user-1", userName: "User", userEmail: "user@example.com", rating: 5, title: "Great!", content: "Nice", status: "approved", verifiedPurchase: true, helpfulCount: 0, flagCount: 0, createdAt: "2024-01-01" } }) });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.sanityId).toBe("review-1");
  });
  it("should handle missing reviewId", async () => {
    const { POST } = require("../reviews/sync-to-sanity/route");
    const req = new (require("next/server").NextRequest)("http://localhost/api/reviews/sync-to-sanity", { body: JSON.stringify({ reviewData: {} }) });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
