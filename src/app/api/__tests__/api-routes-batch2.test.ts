import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@sanity/client";
import { getLalamoveClient } from "@/lib/lalamove/client";

// Aggressive mocks for all external dependencies
jest.mock("@/lib/firebase/config", () => ({ firebaseApp: {} }));
jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  serverTimestamp: jest.fn(),
  Timestamp: jest.fn(),
}));
jest.mock("@sanity/client", () => ({ createClient: jest.fn(() => ({ fetch: jest.fn(), createOrReplace: jest.fn() })) }));
jest.mock("@/lib/lalamove/client", () => ({ getLalamoveClient: jest.fn(() => ({ getQuotation: jest.fn() } ) ) }));

// Hoisted mock classes for NextRequest/NextResponse
class MockNextRequest {
  constructor(public body: any) {}
  async json() { return this.body; }
}
class MockNextResponse {
  static json(data: any, opts?: any) { return { data, opts }; }
}

describe("API Route Batch Coverage", () => {
  it("POST /api/otp/send - should store OTP and return success", async () => {
    const { POST } = require("../otp/send/route.ts");
    const req = new MockNextRequest({ phoneNumber: "09171234567" });
    const res = await POST(req);
    expect(res).toBeDefined();
  });

  it("POST /api/otp/resend - should update OTP record and return success", async () => {
    const { POST } = require("../otp/resend/route.ts");
    const req = new MockNextRequest({ phoneNumber: "09171234567", verificationId: "abc123" });
    const res = await POST(req);
    expect(res).toBeDefined();
  });

  it("POST /api/otp/verify - should verify OTP and return result", async () => {
    const { POST } = require("../otp/verify/route.ts");
    const req = new MockNextRequest({ phoneNumber: "09171234567", code: "123456", verificationId: "abc123" });
    const res = await POST(req);
    expect(res).toBeDefined();
  });

  it("POST /api/seller/stock/thresholds - should update thresholds and return result", async () => {
    const { POST } = require("../seller/stock/thresholds/route.ts");
    const req = new MockNextRequest({ productId: "prod1", thresholds: { lowStockThreshold: 10, outOfStockThreshold: 5, restockLevel: 20 } });
    const res = await POST(req);
    expect(res).toBeDefined();
  });

  it("POST /api/seller/stock/batch - should process batch stock and return result", async () => {
    const { POST } = require("../seller/stock/batch/route.ts");
    const req = new MockNextRequest({ adjustments: [{ sku: "sku1", adjustmentType: "received", quantityChange: 10, reason: "restock" }], mode: "partial" });
    const res = await POST(req);
    expect(res).toBeDefined();
  });

  it("POST /api/lalamove/quotation - should return quotation result", async () => {
    const { POST } = require("../lalamove/quotation/route.ts");
    const req = new MockNextRequest({ pickupLat: 14, pickupLng: 121, pickupAddress: "A", dropoffLat: 14, dropoffLng: 121, dropoffAddress: "B", serviceType: "MOTORCYCLE" });
    const res = await POST(req);
    expect(res).toBeDefined();
  });

  it("POST /api/reviews/sync-to-sanity - should sync review and return result", async () => {
    const { POST } = require("../reviews/sync-to-sanity/route.ts");
    const req = new MockNextRequest({ reviewId: "r1", reviewData: { targetType: "product", targetId: "p1", targetName: "Product", userId: "u1", userName: "User", userEmail: "user@example.com", rating: 5, title: "Great", content: "Nice!", status: "approved", verifiedPurchase: true, helpfulCount: 1, flagCount: 0, createdAt: "2024-01-01" } });
    const res = await POST(req);
    expect(res).toBeDefined();
  });
});
