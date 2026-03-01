// Batch 5 API Route Tests: OTP Send, Verify, Resend
// Location: src/app/api/__tests__/api-routes-batch5.test.ts

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

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(() => "collection-ref"),
  doc: jest.fn(() => ({ id: "otp-1" })),
  addDoc: jest.fn().mockResolvedValue({ id: "otp-1" }),
  setDoc: jest.fn().mockResolvedValue(undefined),
  updateDoc: jest.fn().mockResolvedValue(undefined),
  getDoc: jest.fn().mockResolvedValue({ exists: () => true, data: () => ({ codeHash: "hash", hashedCode: "hash", phoneNumber: "+631234567890", failedAttempts: 0, attempts: 0, maxAttempts: 3, verified: false }), id: "otp-1" }),
  getDocs: jest.fn().mockResolvedValue({ docs: [], empty: true, forEach(fn: (doc: unknown) => void) { this.docs.forEach(fn); }, size: 0 }),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
  Timestamp: { fromDate: jest.fn((d: unknown) => d), now: jest.fn(() => new Date()) },
}));

jest.mock("@/lib/firebase/config", () => ({ firebaseApp: {} }));

jest.mock("crypto", () => ({
  randomInt: jest.fn(() => 123456),
  createHash: jest.fn(() => ({ update: () => ({ digest: () => "hash" }) })),
}));

describe("POST /api/otp/send", () => {
  it("should store OTP and return masked phone", async () => {
    const { POST } = require("../otp/send/route");
    const req = new (require("next/server").NextRequest)("http://localhost/api/otp/send", { body: JSON.stringify({ phoneNumber: "1234567890" }) });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.phoneNumber).toContain("***");
  });
  it("should handle missing phoneNumber", async () => {
    const { POST } = require("../otp/send/route");
    const req = new (require("next/server").NextRequest)("http://localhost/api/otp/send", { body: JSON.stringify({}) });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("POST /api/otp/verify", () => {
  it("should verify OTP and return success", async () => {
    const { POST } = require("../otp/verify/route");
    const req = new (require("next/server").NextRequest)("http://localhost/api/otp/verify", { body: JSON.stringify({ phoneNumber: "1234567890", code: "123456", verificationId: "otp-1" }) });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it("should handle invalid code format", async () => {
    const { POST } = require("../otp/verify/route");
    const req = new (require("next/server").NextRequest)("http://localhost/api/otp/verify", { body: JSON.stringify({ code: "abc" }) });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("POST /api/otp/resend", () => {
  it("should update OTP record and return success", async () => {
    const { POST } = require("../otp/resend/route");
    const req = new (require("next/server").NextRequest)("http://localhost/api/otp/resend", { body: JSON.stringify({ phoneNumber: "1234567890", verificationId: "otp-1" }) });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it("should handle missing verificationId", async () => {
    const { POST } = require("../otp/resend/route");
    const req = new (require("next/server").NextRequest)("http://localhost/api/otp/resend", { body: JSON.stringify({ phoneNumber: "1234567890" }) });
    const res = await POST(req);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
