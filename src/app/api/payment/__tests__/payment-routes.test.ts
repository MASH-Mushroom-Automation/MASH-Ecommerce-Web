/**
 * Tests for Payment API routes
 * COV-011: Payment webhook, create-intent, status
 */

// Mock next/server
jest.mock("next/server", () => {
  class MockNextResponse {
    body: unknown;
    status: number;
    headers: Map<string, string>;
    constructor(body: unknown, init?: { status?: number }) {
      this.body = body;
      this.status = init?.status || 200;
      this.headers = new Map();
    }
    static json(data: unknown, init?: { status?: number }) {
      return new MockNextResponse(data, init);
    }
  }
  return { __esModule: true, NextResponse: MockNextResponse, NextRequest: jest.fn() };
});

// Mock payment libs
const mockVerifyWebhookSignature = jest.fn().mockReturnValue(true);
const mockCreatePaymentFromSource = jest.fn().mockResolvedValue({ success: true, paymentId: "pay_123" });
const mockIsPayMongoConfigured = jest.fn().mockReturnValue(true);
const mockCreateCardPaymentIntent = jest.fn();
const mockCreateEWalletPayment = jest.fn();
const mockGetPublicKey = jest.fn().mockReturnValue("pk_test_123");
const mockGetSourceStatus = jest.fn();
const mockGetPaymentIntentStatus = jest.fn();

jest.mock("@/lib/payment", () => ({
  verifyWebhookSignature: (...args: unknown[]) => mockVerifyWebhookSignature(...args),
  createPaymentFromSource: (...args: unknown[]) => mockCreatePaymentFromSource(...args),
  isPayMongoConfigured: () => mockIsPayMongoConfigured(),
  createCardPaymentIntent: (...args: unknown[]) => mockCreateCardPaymentIntent(...args),
  createEWalletPayment: (...args: unknown[]) => mockCreateEWalletPayment(...args),
  getPublicKey: () => mockGetPublicKey(),
  getSourceStatus: (...args: unknown[]) => mockGetSourceStatus(...args),
  getPaymentIntentStatus: (...args: unknown[]) => mockGetPaymentIntentStatus(...args),
}));

// Mock firebase orders
const mockUpdateOrderPaymentStatus = jest.fn().mockResolvedValue(undefined);
jest.mock("@/lib/firebase/orders", () => ({
  updateOrderPaymentStatus: (...args: unknown[]) => mockUpdateOrderPaymentStatus(...args),
  FirebaseOrdersService: jest.fn(),
}));

// Mock firebase/firestore
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn().mockResolvedValue({ docs: [] }),
  getFirestore: jest.fn(),
}));

// Helper - lazy JSON parse to avoid crash on non-JSON strings
function createReq(opts: {
  body?: string | object;
  headers?: Record<string, string>;
  url?: string;
}) {
  const url = opts.url || "http://localhost:3000/api/payment/test";
  const u = new URL(url);
  const rawText = typeof opts.body === "string" ? opts.body : JSON.stringify(opts.body || {});
  let parsedBody: unknown;
  try { parsedBody = JSON.parse(rawText); } catch { parsedBody = {}; }
  return {
    json: jest.fn().mockResolvedValue(parsedBody),
    text: jest.fn().mockResolvedValue(rawText),
    headers: {
      get: (name: string) => opts.headers?.[name] || null,
      entries: () => Object.entries(opts.headers || {})[Symbol.iterator](),
    },
    url: u.toString(),
    nextUrl: { searchParams: u.searchParams },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockIsPayMongoConfigured.mockReturnValue(true);
});

// ==================== WEBHOOK ====================
describe("POST /api/payment/webhook", () => {
  let POST: Function;
  let GET: Function;
  beforeAll(async () => {
    const mod = await import("@/app/api/payment/webhook/route");
    POST = mod.POST;
    GET = mod.GET;
  });

  it("returns received:true for configured PayMongo", async () => {
    const body = JSON.stringify({
      data: {
        id: "evt_1",
        attributes: {
          type: "payment.paid",
          data: {
            id: "pay_1",
            attributes: {
              source: { metadata: { orderId: "order-1" } },
              metadata: { orderId: "order-1" },
            },
          },
        },
      },
    });
    const req = createReq({ body, headers: {} });
    const res = await POST(req);
    expect(res.body).toEqual(expect.objectContaining({ received: true }));
  });

  it("returns received:true when PayMongo not configured", async () => {
    mockIsPayMongoConfigured.mockReturnValue(false);
    const req = createReq({ body: "{}" });
    const res = await POST(req);
    expect(res.body).toEqual({ received: true });
  });

  it("handles source.chargeable event", async () => {
    const body = JSON.stringify({
      data: {
        id: "evt_2",
        attributes: {
          type: "source.chargeable",
          data: {
            id: "src_1",
            attributes: {
              amount: 10000,
              metadata: { orderId: "order-2", orderNumber: "ORD-002" },
            },
          },
        },
      },
    });
    const req = createReq({ body });
    const res = await POST(req);
    expect(res.body.received).toBe(true);
    expect(mockCreatePaymentFromSource).toHaveBeenCalledWith("src_1", 100, expect.any(String));
  });

  it("handles payment.paid event", async () => {
    const body = JSON.stringify({
      data: {
        id: "evt_paid",
        attributes: {
          type: "payment.paid",
          data: {
            id: "pay_1",
            attributes: {
              source: { metadata: { orderId: "order-paid" } },
              metadata: { orderId: "order-paid" },
            },
          },
        },
      },
    });
    const req = createReq({ body });
    const res = await POST(req);
    expect(res.body.received).toBe(true);
    expect(mockUpdateOrderPaymentStatus).toHaveBeenCalledWith(
      "order-paid",
      expect.objectContaining({ status: "paid" })
    );
  });

  it("handles payment.failed event", async () => {
    const body = JSON.stringify({
      data: {
        id: "evt_3",
        attributes: {
          type: "payment.failed",
          data: {
            id: "pay_fail",
            attributes: {
              source: { metadata: { orderId: "order-3" } },
            },
          },
        },
      },
    });
    const req = createReq({ body });
    const res = await POST(req);
    expect(res.body.received).toBe(true);
    expect(mockUpdateOrderPaymentStatus).toHaveBeenCalledWith(
      "order-3",
      expect.objectContaining({ status: "failed" })
    );
  });

  it("handles payment_intent.succeeded event", async () => {
    const body = JSON.stringify({
      data: {
        id: "evt_4",
        attributes: {
          type: "payment_intent.succeeded",
          data: {
            id: "pi_1",
            attributes: { metadata: { orderId: "order-4" } },
          },
        },
      },
    });
    const req = createReq({ body });
    const res = await POST(req);
    expect(res.body.received).toBe(true);
    expect(mockUpdateOrderPaymentStatus).toHaveBeenCalledWith(
      "order-4",
      expect.objectContaining({ status: "paid" })
    );
  });

  it("handles unrecognized event types", async () => {
    const body = JSON.stringify({
      data: { id: "evt_5", attributes: { type: "unknown.event", data: {} } },
    });
    const req = createReq({ body });
    const res = await POST(req);
    expect(res.body.received).toBe(true);
  });

  it("handles JSON parse errors gracefully", async () => {
    const req = createReq({ body: "not-json" });
    // Override text mock to return non-JSON text (webhook uses .text())
    req.text.mockResolvedValue("not-json");
    const res = await POST(req);
    // Should return 200 even on error to prevent retries
    expect(res.body.received).toBe(true);
  });

  it("GET returns webhook status", async () => {
    const res = await GET();
    expect(res.body).toEqual(expect.objectContaining({ configured: true }));
  });
});

// ==================== CREATE INTENT ====================
describe("Payment Create Intent", () => {
  let POST: Function;
  let GET: Function;
  beforeAll(async () => {
    const mod = await import("@/app/api/payment/create-intent/route");
    POST = mod.POST;
    GET = mod.GET;
  });

  it("returns 503 when PayMongo not configured", async () => {
    mockIsPayMongoConfigured.mockReturnValue(false);
    const req = createReq({ body: {} });
    const res = await POST(req);
    expect(res.status).toBe(503);
  });

  it("returns 400 when missing required fields", async () => {
    const req = createReq({ body: { paymentMethod: "gcash" } });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid amount", async () => {
    const req = createReq({
      body: { paymentMethod: "gcash", amount: -10, orderId: "1", orderNumber: "ORD-1" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("handles gcash e-wallet payment", async () => {
    mockCreateEWalletPayment.mockResolvedValue({ success: true, checkoutUrl: "https://pay.test" });
    const req = createReq({
      body: {
        paymentMethod: "gcash",
        amount: 500,
        orderId: "order-1",
        orderNumber: "ORD-001",
      },
    });
    const res = await POST(req);
    expect(res.body.success).toBe(true);
  });

  it("handles grab_pay e-wallet payment", async () => {
    mockCreateEWalletPayment.mockResolvedValue({ success: true });
    const req = createReq({
      body: { paymentMethod: "grab_pay", amount: 300, orderId: "1", orderNumber: "ORD-1" },
    });
    const res = await POST(req);
    expect(res.body.success).toBe(true);
  });

  it("handles card payment", async () => {
    mockCreateCardPaymentIntent.mockResolvedValue({ success: true, clientSecret: "cs_123" });
    const req = createReq({
      body: { paymentMethod: "card", amount: 1000, orderId: "1", orderNumber: "ORD-1" },
    });
    const res = await POST(req);
    expect(res.body.success).toBe(true);
    expect(res.body.publicKey).toBeDefined();
  });

  it("handles COD payment", async () => {
    const req = createReq({
      body: { paymentMethod: "cod", amount: 200, orderId: "1", orderNumber: "ORD-1" },
    });
    const res = await POST(req);
    expect(res.body.success).toBe(true);
    expect(res.body.paymentMethod).toBe("cod");
  });

  it("returns 400 for unsupported payment method", async () => {
    const req = createReq({
      body: { paymentMethod: "bitcoin", amount: 500, orderId: "1", orderNumber: "ORD-1" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when e-wallet creation fails", async () => {
    mockCreateEWalletPayment.mockResolvedValue({ success: false, error: "Failed" });
    const req = createReq({
      body: { paymentMethod: "gcash", amount: 500, orderId: "1", orderNumber: "ORD-1" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 500 on unexpected error", async () => {
    mockCreateEWalletPayment.mockRejectedValue(new Error("crash"));
    const req = createReq({
      body: { paymentMethod: "gcash", amount: 500, orderId: "1", orderNumber: "ORD-1" },
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it("GET returns config status", async () => {
    const res = await GET();
    expect(res.body.configured).toBe(true);
    expect(res.body.supportedMethods).toContain("gcash");
  });
});

// ==================== STATUS ====================
describe("GET /api/payment/status", () => {
  let GET: Function;
  beforeAll(async () => {
    GET = (await import("@/app/api/payment/status/route")).GET;
  });

  it("returns 503 when not configured", async () => {
    mockIsPayMongoConfigured.mockReturnValue(false);
    const res = await GET(createReq({ url: "http://localhost:3000/api/payment/status?id=src_1" }));
    expect(res.status).toBe(503);
  });

  it("returns 400 when no payment ID", async () => {
    const res = await GET(createReq({ url: "http://localhost:3000/api/payment/status" }));
    expect(res.status).toBe(400);
  });

  it("returns source status", async () => {
    mockGetSourceStatus.mockResolvedValue({ status: "chargeable" });
    const res = await GET(createReq({ url: "http://localhost:3000/api/payment/status?id=src_1" }));
    expect(res.body.success).toBe(true);
  });

  it("returns intent status", async () => {
    mockGetPaymentIntentStatus.mockResolvedValue({ status: "succeeded" });
    const res = await GET(createReq({ url: "http://localhost:3000/api/payment/status?id=pi_1&type=intent" }));
    expect(res.body.success).toBe(true);
  });

  it("returns 500 on error", async () => {
    mockGetSourceStatus.mockRejectedValue(new Error("fail"));
    const res = await GET(createReq({ url: "http://localhost:3000/api/payment/status?id=src_1" }));
    expect(res.status).toBe(500);
  });
});
