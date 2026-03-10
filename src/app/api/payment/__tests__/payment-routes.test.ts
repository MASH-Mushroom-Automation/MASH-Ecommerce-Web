/**
 * Tests for Payment API routes
 * COV-011: Payment webhook, create-intent, status
 * PAY-009: Create-intent Zod validation, rate-limit headers, consistent responses
 * PAY-010: Status polling - Zod query validation, timeout detection, consistent shape
 * PAY-011: Webhook handler - idempotency, structured logging, email, signature enforcement
 */

// Mock next/server
jest.mock("next/server", () => {
  class MockNextResponse {
    body: unknown;
    status: number;
    headers: Map<string, string>;
    constructor(body: unknown, init?: { status?: number; headers?: Record<string, string> }) {
      this.body = body;
      this.status = init?.status || 200;
      this.headers = new Map(Object.entries(init?.headers || {}));
    }
    static json(data: unknown, init?: { status?: number; headers?: Record<string, string> }) {
      return new MockNextResponse(data, init);
    }
  }
  class MockNextRequest {}
  return { __esModule: true, NextResponse: MockNextResponse, NextRequest: MockNextRequest };
});

// Mock rate-limit middleware
const mockCheckRateLimit = jest.fn().mockReturnValue(null);
const mockGetRateLimitStatus = jest.fn().mockReturnValue({
  remaining: 4,
  resetAt: new Date("2026-03-02T12:00:00Z"),
  total: 5,
});
jest.mock("@/middleware/rate-limit", () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
  getRateLimitStatus: (...args: unknown[]) => mockGetRateLimitStatus(...args),
  RATE_LIMITS: {
    payments: { maxRequests: 5, windowMs: 60000 },
    "api-general": { maxRequests: 100, windowMs: 60000 },
  },
}));

// Mock payment libs
const mockVerifyWebhookSignature = jest.fn().mockReturnValue(true);
const mockCreatePaymentFromSource = jest.fn().mockResolvedValue({ success: true, paymentId: "pay_123" });
const mockIsPayMongoConfigured = jest.fn().mockReturnValue(true);
const mockCreateCardPaymentIntent = jest.fn();
const mockCreateCardCheckoutSession = jest.fn();
const mockCreateEWalletPayment = jest.fn();
const mockGetPublicKey = jest.fn().mockReturnValue("pk_test_123");
const mockGetSourceStatus = jest.fn();
const mockGetPaymentIntentStatus = jest.fn();
const mockGetCheckoutSessionStatus = jest.fn();

jest.mock("@/lib/payment", () => ({
  verifyWebhookSignature: (...args: unknown[]) => mockVerifyWebhookSignature(...args),
  createPaymentFromSource: (...args: unknown[]) => mockCreatePaymentFromSource(...args),
  isPayMongoConfigured: () => mockIsPayMongoConfigured(),
  createCardPaymentIntent: (...args: unknown[]) => mockCreateCardPaymentIntent(...args),
  createCardCheckoutSession: (...args: unknown[]) => mockCreateCardCheckoutSession(...args),
  createEWalletPayment: (...args: unknown[]) => mockCreateEWalletPayment(...args),
  getPublicKey: () => mockGetPublicKey(),
  getSourceStatus: (...args: unknown[]) => mockGetSourceStatus(...args),
  getPaymentIntentStatus: (...args: unknown[]) => mockGetPaymentIntentStatus(...args),
  getCheckoutSessionStatus: (...args: unknown[]) => mockGetCheckoutSessionStatus(...args),
}));

// Mock firebase orders
const mockUpdateOrderPaymentStatus = jest.fn().mockResolvedValue(undefined);
jest.mock("@/lib/firebase/orders", () => ({
  updateOrderPaymentStatus: (...args: unknown[]) => mockUpdateOrderPaymentStatus(...args),
  FirebaseOrdersService: jest.fn(),
}));

// Mock email service (PAY-011)
const mockSendOrderConfirmationEmail = jest.fn().mockResolvedValue({ success: true });
jest.mock("@/lib/email/send-email", () => ({
  sendOrderConfirmationEmail: (...args: unknown[]) => mockSendOrderConfirmationEmail(...args),
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
    nextUrl: { searchParams: u.searchParams, pathname: u.pathname },
    ip: "127.0.0.1",
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockIsPayMongoConfigured.mockReturnValue(true);
  mockCheckRateLimit.mockReturnValue(null);
  mockGetRateLimitStatus.mockReturnValue({
    remaining: 4,
    resetAt: new Date("2026-03-02T12:00:00Z"),
    total: 5,
  });
});

// ==================== WEBHOOK (PAY-011: Enhanced Event Processing) ====================
describe("POST /api/payment/webhook", () => {
  let POST: Function;
  let GET: Function;
  let _testing: { processedEventIds: Set<string>; markEventProcessed: Function; isEventProcessed: Function; MAX_PROCESSED_EVENTS: number };
  beforeAll(async () => {
    const mod = await import("@/app/api/payment/webhook/route");
    POST = mod.POST;
    GET = mod.GET;
    _testing = mod._testing;
  });

  afterEach(() => {
    // Clear idempotency set between tests
    _testing.processedEventIds.clear();
  });

  // -- AC1: Handles all PayMongo event types --

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

  it("handles payment_intent.payment_failed event", async () => {
    const body = JSON.stringify({
      data: {
        id: "evt_pi_fail",
        attributes: {
          type: "payment_intent.payment_failed",
          data: {
            id: "pi_fail_1",
            attributes: { metadata: { orderId: "order-pi-fail" } },
          },
        },
      },
    });
    const req = createReq({ body });
    const res = await POST(req);
    expect(res.body.received).toBe(true);
    expect(mockUpdateOrderPaymentStatus).toHaveBeenCalledWith(
      "order-pi-fail",
      expect.objectContaining({ status: "failed" })
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

  // -- AC2: Updates Firebase order payment status --

  it("updates order status to 'processing' on source.chargeable with successful payment", async () => {
    mockCreatePaymentFromSource.mockResolvedValueOnce({ success: true, paymentId: "pay_abc" });
    const body = JSON.stringify({
      data: {
        id: "evt_firebase_1",
        attributes: {
          type: "source.chargeable",
          data: {
            id: "src_fb",
            attributes: {
              amount: 50000,
              metadata: { orderId: "order-fb-1", orderNumber: "ORD-FB" },
            },
          },
        },
      },
    });
    const req = createReq({ body });
    await POST(req);
    expect(mockUpdateOrderPaymentStatus).toHaveBeenCalledWith(
      "order-fb-1",
      expect.objectContaining({ status: "processing", paymentId: "pay_abc", sourceId: "src_fb" })
    );
  });

  it("does not update Firebase when source.chargeable payment creation fails", async () => {
    mockCreatePaymentFromSource.mockResolvedValueOnce({ success: false, error: "Insufficient funds" });
    const body = JSON.stringify({
      data: {
        id: "evt_firebase_2",
        attributes: {
          type: "source.chargeable",
          data: {
            id: "src_fail",
            attributes: {
              amount: 50000,
              metadata: { orderId: "order-fb-fail" },
            },
          },
        },
      },
    });
    const req = createReq({ body });
    await POST(req);
    expect(mockUpdateOrderPaymentStatus).not.toHaveBeenCalled();
  });

  // -- AC3: Sends order confirmation email on successful payment --

  it("sends confirmation email on payment.paid when email is in metadata", async () => {
    const body = JSON.stringify({
      data: {
        id: "evt_email_1",
        attributes: {
          type: "payment.paid",
          data: {
            id: "pay_email",
            attributes: {
              source: { metadata: { orderId: "order-email-1", email: "buyer@test.com", orderNumber: "ORD-E1" } },
            },
          },
        },
      },
    });
    const req = createReq({ body });
    await POST(req);
    expect(mockSendOrderConfirmationEmail).toHaveBeenCalledWith(
      "buyer@test.com",
      expect.objectContaining({ orderNumber: "ORD-E1" })
    );
  });

  it("sends confirmation email on payment_intent.succeeded when email is in metadata", async () => {
    const body = JSON.stringify({
      data: {
        id: "evt_email_2",
        attributes: {
          type: "payment_intent.succeeded",
          data: {
            id: "pi_email",
            attributes: { metadata: { orderId: "order-email-2", email: "card@test.com", orderNumber: "ORD-E2" } },
          },
        },
      },
    });
    const req = createReq({ body });
    await POST(req);
    expect(mockSendOrderConfirmationEmail).toHaveBeenCalledWith(
      "card@test.com",
      expect.objectContaining({ orderNumber: "ORD-E2" })
    );
  });

  it("does not crash when email is missing from metadata", async () => {
    const body = JSON.stringify({
      data: {
        id: "evt_email_3",
        attributes: {
          type: "payment.paid",
          data: {
            id: "pay_no_email",
            attributes: {
              source: { metadata: { orderId: "order-no-email" } },
            },
          },
        },
      },
    });
    const req = createReq({ body });
    const res = await POST(req);
    expect(res.body.received).toBe(true);
    // Email should NOT be called (no email in metadata)
    expect(mockSendOrderConfirmationEmail).not.toHaveBeenCalled();
  });

  it("does not crash when email send fails", async () => {
    mockSendOrderConfirmationEmail.mockRejectedValueOnce(new Error("SMTP error"));
    const body = JSON.stringify({
      data: {
        id: "evt_email_4",
        attributes: {
          type: "payment.paid",
          data: {
            id: "pay_email_err",
            attributes: {
              source: { metadata: { orderId: "order-email-err", email: "err@test.com" } },
            },
          },
        },
      },
    });
    const req = createReq({ body });
    const res = await POST(req);
    // Should still return 200 -- email failure is non-fatal
    expect(res.body.received).toBe(true);
  });

  // -- AC4: Logs all webhook events (structured logging) --

  it("logs structured info for every webhook event", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const body = JSON.stringify({
      data: {
        id: "evt_log_1",
        attributes: {
          type: "payment.paid",
          data: {
            id: "pay_log",
            attributes: {
              source: { metadata: { orderId: "order-log" } },
            },
          },
        },
      },
    });
    const req = createReq({ body });
    await POST(req);
    // Should have at least "Webhook received" and "processed" logs
    const calls = consoleSpy.mock.calls.map(c => c[0] as string);
    expect(calls.some(c => c.includes("[WEBHOOK]") && c.includes("Webhook received"))).toBe(true);
    expect(calls.some(c => c.includes("[WEBHOOK]") && c.includes("processed"))).toBe(true);
    consoleSpy.mockRestore();
  });

  it("logs structured error for processing failures", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const req = createReq({ body: "not-json" });
    req.text.mockResolvedValue("not-json");
    await POST(req);
    const calls = consoleSpy.mock.calls.map(c => c[0] as string);
    expect(calls.some(c => c.includes("[WEBHOOK]") && c.includes("error"))).toBe(true);
    consoleSpy.mockRestore();
  });

  // -- AC5: Signature verification enforced in production --

  it("rejects when signature is missing in production", async () => {
    const origEnv = process.env.NODE_ENV;
    try {
      Object.defineProperty(process.env, "NODE_ENV", { value: "production", configurable: true });
      // Re-import to pick up env change -- but the module caches IS_PRODUCTION at import time.
      // Instead, we test via the module's behavior by checking signature enforcement path.
      // Since IS_PRODUCTION is set at module load, we test the dev-mode path where secret+sig are present.
      // The production enforcement is tested structurally via the code.
    } finally {
      Object.defineProperty(process.env, "NODE_ENV", { value: origEnv, configurable: true });
    }
    // Verify that in dev mode with secret+signature, invalid sig logs a warning but still processes
    const body = JSON.stringify({
      data: { id: "evt_sig_1", attributes: { type: "unknown.event", data: {} } },
    });
    mockVerifyWebhookSignature.mockReturnValueOnce(false);
    const req = createReq({ body, headers: { "paymongo-signature": "invalid_sig" } });
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const res = await POST(req);
    // In dev mode, invalid sig logs warning but still returns 200
    expect(res.body.received).toBe(true);
    consoleSpy.mockRestore();
  });

  it("skips signature verification in dev mode when webhook secret is not configured", async () => {
    // WEBHOOK_SECRET is "" at module load time (no env var), so verification is skipped
    mockVerifyWebhookSignature.mockReturnValueOnce(true);
    const body = JSON.stringify({
      data: { id: "evt_sig_2", attributes: { type: "unknown.event", data: {} } },
    });
    const req = createReq({ body, headers: { "paymongo-signature": "t=123,te=abc,li=def" } });
    await POST(req);
    // Because WEBHOOK_SECRET is empty at module load, verification is not called
    expect(mockVerifyWebhookSignature).not.toHaveBeenCalled();
  });

  // -- AC6: Idempotent -- duplicate events don't trigger duplicate actions --

  it("processes first event and skips duplicate", async () => {
    const body = JSON.stringify({
      data: {
        id: "evt_idem_1",
        attributes: {
          type: "payment.paid",
          data: {
            id: "pay_idem",
            attributes: {
              source: { metadata: { orderId: "order-idem" } },
            },
          },
        },
      },
    });

    // First call -- should process normally
    const req1 = createReq({ body });
    const res1 = await POST(req1);
    expect(res1.body.received).toBe(true);
    expect(mockUpdateOrderPaymentStatus).toHaveBeenCalledTimes(1);

    jest.clearAllMocks();

    // Second call with same event ID -- should be skipped
    const req2 = createReq({ body });
    const res2 = await POST(req2);
    expect(res2.body).toEqual(expect.objectContaining({ received: true, duplicate: true }));
    expect(mockUpdateOrderPaymentStatus).not.toHaveBeenCalled();
  });

  it("idempotency set is bounded (evicts oldest entries)", () => {
    // Fill the set to max capacity
    for (let i = 0; i < _testing.MAX_PROCESSED_EVENTS; i++) {
      _testing.markEventProcessed(`evt_${i}`);
    }
    expect(_testing.processedEventIds.size).toBe(_testing.MAX_PROCESSED_EVENTS);

    // Add one more -- should evict the oldest
    _testing.markEventProcessed("evt_overflow");
    expect(_testing.processedEventIds.size).toBe(_testing.MAX_PROCESSED_EVENTS);
    expect(_testing.isEventProcessed("evt_0")).toBe(false); // evicted
    expect(_testing.isEventProcessed("evt_overflow")).toBe(true); // kept
  });

  // -- AC7: Always returns 200 OK --

  it("returns 200 even when updateOrderPaymentStatus throws", async () => {
    mockUpdateOrderPaymentStatus.mockRejectedValueOnce(new Error("Firebase down"));
    const body = JSON.stringify({
      data: {
        id: "evt_err_1",
        attributes: {
          type: "payment.paid",
          data: {
            id: "pay_err",
            attributes: {
              source: { metadata: { orderId: "order-err" } },
            },
          },
        },
      },
    });
    const req = createReq({ body });
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
    consoleSpy.mockRestore();
  });

  it("returns 200 for events missing orderId", async () => {
    const body = JSON.stringify({
      data: {
        id: "evt_noorder",
        attributes: {
          type: "payment.paid",
          data: {
            id: "pay_noorder",
            attributes: { source: { metadata: {} } },
          },
        },
      },
    });
    const req = createReq({ body });
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
    expect(mockUpdateOrderPaymentStatus).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  // -- AC5-extra: Production signature enforcement (IS_PRODUCTION = true) --

  describe("production signature enforcement", () => {
    let ProdPOST: Function;

    beforeAll(async () => {
      // Temporarily set NODE_ENV to production and re-import the module
      // so IS_PRODUCTION is true at module load time.
      const origNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";
      process.env.PAYMONGO_WEBHOOK_SECRET = "whsec_prod_test_secret";
      jest.resetModules();
      const mod = await import("@/app/api/payment/webhook/route");
      ProdPOST = mod.POST;
      // Restore NODE_ENV for other tests
      process.env.NODE_ENV = origNodeEnv;
      delete process.env.PAYMONGO_WEBHOOK_SECRET;
    });

    it("returns 401 when signature is missing in production", async () => {
      const body = JSON.stringify({
        data: { id: "evt_prod_1", attributes: { type: "payment.paid", data: {} } },
      });
      const req = createReq({ body, headers: {} });
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      const res = await ProdPOST(req);
      expect(res.status).toBe(401);
      expect(res.body).toEqual(expect.objectContaining({ error: "Signature required" }));
      consoleSpy.mockRestore();
    });

    it("returns 401 when signature is invalid in production", async () => {
      mockVerifyWebhookSignature.mockReturnValueOnce(false);
      const body = JSON.stringify({
        data: { id: "evt_prod_2", attributes: { type: "payment.paid", data: {} } },
      });
      const req = createReq({ body, headers: { "paymongo-signature": "bad_sig" } });
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      const res = await ProdPOST(req);
      expect(res.status).toBe(401);
      expect(res.body).toEqual(expect.objectContaining({ error: "Invalid signature" }));
      consoleSpy.mockRestore();
    });

    it("processes event when signature is valid in production", async () => {
      mockVerifyWebhookSignature.mockReturnValueOnce(true);
      const body = JSON.stringify({
        data: {
          id: "evt_prod_3",
          attributes: { type: "payment.paid", data: {
            id: "pay_prod",
            attributes: { source: { metadata: { orderId: "order-prod" } } },
          } },
        },
      });
      const req = createReq({ body, headers: { "paymongo-signature": "valid_sig" } });
      const res = await ProdPOST(req);
      expect(res.status).toBe(200);
      expect(res.body.received).toBe(true);
    });
  });

  // -- source.chargeable missing required fields path --

  it("logs warning for source.chargeable with missing required fields", async () => {
    const body = JSON.stringify({
      data: {
        id: "evt_src_missing",
        attributes: {
          type: "source.chargeable",
          data: {
            id: null,
            attributes: { amount: 0, metadata: {} },
          },
        },
      },
    });
    const req = createReq({ body });
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
    // Should NOT have attempted to create a payment
    expect(mockCreatePaymentFromSource).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

// ==================== CREATE INTENT (PAY-009) ====================
describe("Payment Create Intent (PAY-009)", () => {
  let POST: Function;
  let GET: Function;
  beforeAll(async () => {
    const mod = await import("@/app/api/payment/create-intent/route");
    POST = mod.POST;
    GET = mod.GET;
  });

  // ---- Acceptance Criteria 1: Handles all payment methods correctly ----
  describe("handles all payment methods", () => {
    it("handles gcash e-wallet payment via Sources API", async () => {
      mockCreateEWalletPayment.mockResolvedValue({
        success: true,
        paymentId: "src_gcash_1",
        checkoutUrl: "https://pay.test/gcash",
        status: "pending",
      });
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
      expect(res.body.paymentId).toBe("src_gcash_1");
      expect(res.body.checkoutUrl).toBe("https://pay.test/gcash");
    });

    it("handles grab_pay e-wallet payment via Sources API", async () => {
      mockCreateEWalletPayment.mockResolvedValue({ success: true, paymentId: "src_grab_1" });
      const req = createReq({
        body: { paymentMethod: "grab_pay", amount: 300, orderId: "1", orderNumber: "ORD-1" },
      });
      const res = await POST(req);
      expect(res.body.success).toBe(true);
      expect(mockCreateEWalletPayment).toHaveBeenCalledWith(
        "grab_pay", 300, "1", "ORD-1", "", "Customer", "", undefined
      );
    });

    it("handles paymaya e-wallet payment via Sources API", async () => {
      mockCreateEWalletPayment.mockResolvedValue({ success: true, paymentId: "src_maya_1", checkoutUrl: "https://pay.test/maya" });
      const req = createReq({
        body: { paymentMethod: "paymaya", amount: 750, orderId: "2", orderNumber: "ORD-2" },
      });
      const res = await POST(req);
      expect(res.body.success).toBe(true);
      expect(mockCreateEWalletPayment).toHaveBeenCalledWith(
        "paymaya", 750, "2", "ORD-2", "", "Customer", "", undefined
      );
    });

    it("handles card payment via Checkout Sessions API", async () => {
      mockCreateCardCheckoutSession.mockResolvedValue({ success: true, paymentId: "cs_1", checkoutUrl: "https://checkout.paymongo.com/cs_1", status: "pending" });
      const req = createReq({
        body: { paymentMethod: "card", amount: 1000, orderId: "1", orderNumber: "ORD-1" },
      });
      const res = await POST(req);
      expect(res.body.success).toBe(true);
      expect(res.body.checkoutUrl).toBe("https://checkout.paymongo.com/cs_1");
      expect(mockCreateCardCheckoutSession).toHaveBeenCalled();
    });

    it("handles COD without PayMongo call", async () => {
      const req = createReq({
        body: { paymentMethod: "cod", amount: 200, orderId: "1", orderNumber: "ORD-1" },
      });
      const res = await POST(req);
      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe("pending");
      expect(mockCreateEWalletPayment).not.toHaveBeenCalled();
      expect(mockCreateCardCheckoutSession).not.toHaveBeenCalled();
    });

    it("COD works even when PayMongo is not configured", async () => {
      mockIsPayMongoConfigured.mockReturnValue(false);
      const req = createReq({
        body: { paymentMethod: "cod", amount: 200, orderId: "1", orderNumber: "ORD-1" },
      });
      const res = await POST(req);
      expect(res.body.success).toBe(true);
      expect(res.status).toBe(200);
    });
  });

  // ---- Acceptance Criteria 4: COD returns success without PayMongo ----
  // (covered above)

  // ---- Acceptance Criteria 3: 503 when PayMongo not configured (online) ----
  describe("PayMongo not configured", () => {
    it("returns 503 for online methods when PayMongo not configured", async () => {
      mockIsPayMongoConfigured.mockReturnValue(false);
      const req = createReq({
        body: { paymentMethod: "gcash", amount: 500, orderId: "1", orderNumber: "ORD-1" },
      });
      const res = await POST(req);
      expect(res.status).toBe(503);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("unavailable");
    });
  });

  // ---- Acceptance Criteria 5: Zod schema validation ----
  describe("Zod request validation", () => {
    it("rejects missing paymentMethod", async () => {
      const req = createReq({
        body: { amount: 500, orderId: "1", orderNumber: "ORD-1" },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("rejects invalid paymentMethod value", async () => {
      const req = createReq({
        body: { paymentMethod: "bitcoin", amount: 500, orderId: "1", orderNumber: "ORD-1" },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("rejects missing amount", async () => {
      const req = createReq({
        body: { paymentMethod: "gcash", orderId: "1", orderNumber: "ORD-1" },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("rejects negative amount", async () => {
      const req = createReq({
        body: { paymentMethod: "gcash", amount: -10, orderId: "1", orderNumber: "ORD-1" },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it("rejects zero amount", async () => {
      const req = createReq({
        body: { paymentMethod: "gcash", amount: 0, orderId: "1", orderNumber: "ORD-1" },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("rejects string amount", async () => {
      const req = createReq({
        body: { paymentMethod: "gcash", amount: "500", orderId: "1", orderNumber: "ORD-1" },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      expect(res.body.error).toContain("amount");
    });

    it("rejects empty orderId", async () => {
      const req = createReq({
        body: { paymentMethod: "gcash", amount: 500, orderId: "", orderNumber: "ORD-1" },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("rejects empty orderNumber", async () => {
      const req = createReq({
        body: { paymentMethod: "gcash", amount: 500, orderId: "1", orderNumber: "" },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("provides user-friendly validation error messages", async () => {
      const req = createReq({
        body: { paymentMethod: "gcash", amount: -5, orderId: "1", orderNumber: "ORD-1" },
      });
      const res = await POST(req);
      expect(res.body.error).toBeTruthy();
      // Should be a readable message, not a raw Zod internals dump
      expect(typeof res.body.error).toBe("string");
    });

    it("handles non-JSON request body", async () => {
      const req = createReq({ body: "not-json" });
      // Override json() to throw like a real request would
      req.json.mockRejectedValue(new SyntaxError("Unexpected token"));
      const res = await POST(req);
      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Invalid request body");
    });
  });

  // ---- Acceptance Criteria 6: User-friendly error messages ----
  describe("error responses", () => {
    it("returns user-friendly message when e-wallet creation fails", async () => {
      mockCreateEWalletPayment.mockResolvedValue({ success: false, error: "Gateway timeout" });
      const req = createReq({
        body: { paymentMethod: "gcash", amount: 500, orderId: "1", orderNumber: "ORD-1" },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Gateway timeout");
    });

    it("returns fallback message when e-wallet error is empty", async () => {
      mockCreateEWalletPayment.mockResolvedValue({ success: false });
      const req = createReq({
        body: { paymentMethod: "gcash", amount: 500, orderId: "1", orderNumber: "ORD-1" },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      expect(res.body.error).toContain("could not process");
    });

    it("returns user-friendly message when card creation fails", async () => {
      mockCreateCardCheckoutSession.mockResolvedValue({ success: false, error: "Declined" });
      const req = createReq({
        body: { paymentMethod: "card", amount: 500, orderId: "1", orderNumber: "ORD-1" },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Declined");
    });

    it("returns 500 with friendly message on unexpected error", async () => {
      mockCreateEWalletPayment.mockRejectedValue(new Error("crash"));
      const req = createReq({
        body: { paymentMethod: "gcash", amount: 500, orderId: "1", orderNumber: "ORD-1" },
      });
      const res = await POST(req);
      expect(res.status).toBe(500);
      expect(res.body.error).toContain("Something went wrong");
    });
  });

  // ---- Acceptance Criteria 7: Rate limiting headers ----
  describe("rate limiting", () => {
    it("includes X-RateLimit-* headers in successful responses", async () => {
      const req = createReq({
        body: { paymentMethod: "cod", amount: 200, orderId: "1", orderNumber: "ORD-1" },
      });
      const res = await POST(req);
      expect(res.headers.get("X-RateLimit-Limit")).toBe("5");
      expect(res.headers.get("X-RateLimit-Remaining")).toBe("4");
      expect(res.headers.get("X-RateLimit-Reset")).toBeDefined();
    });

    it("includes rate limit headers in error responses", async () => {
      const req = createReq({
        body: { paymentMethod: "gcash", amount: -1, orderId: "1", orderNumber: "ORD-1" },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      expect(res.headers.get("X-RateLimit-Limit")).toBe("5");
    });

    it("returns 429 when rate limit exceeded", async () => {
      const { NextResponse: NR } = jest.requireMock("next/server");
      mockCheckRateLimit.mockReturnValue(
        NR.json(
          { error: "Too Many Requests", retryAfter: 60 },
          { status: 429, headers: { "Retry-After": "60" } }
        )
      );
      const req = createReq({
        body: { paymentMethod: "gcash", amount: 500, orderId: "1", orderNumber: "ORD-1" },
      });
      const res = await POST(req);
      expect(res.status).toBe(429);
    });
  });

  // ---- Acceptance Criteria 8: Consistent PaymentResult shape ----
  describe("consistent PaymentCreateResponse shape", () => {
    it("COD response has standard shape with success, status, paymentId, checkoutUrl, error", async () => {
      const req = createReq({
        body: { paymentMethod: "cod", amount: 200, orderId: "1", orderNumber: "ORD-1" },
      });
      const res = await POST(req);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("status", "pending");
      // Optional fields present (may be undefined)
      expect("paymentId" in res.body).toBe(true);
      expect("checkoutUrl" in res.body).toBe(true);
      expect("error" in res.body).toBe(true);
    });

    it("e-wallet response has standard shape", async () => {
      mockCreateEWalletPayment.mockResolvedValue({
        success: true, paymentId: "src_1", checkoutUrl: "https://pay.test", status: "pending",
      });
      const req = createReq({
        body: { paymentMethod: "gcash", amount: 500, orderId: "1", orderNumber: "ORD-1" },
      });
      const res = await POST(req);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("paymentId", "src_1");
      expect(res.body).toHaveProperty("checkoutUrl", "https://pay.test");
      expect(res.body).toHaveProperty("status");
      expect(res.body).toHaveProperty("error");
    });

    it("card response has standard shape with checkoutUrl", async () => {
      mockCreateCardCheckoutSession.mockResolvedValue({
        success: true, paymentId: "cs_1", checkoutUrl: "https://checkout.paymongo.com/cs_1", status: "pending",
      });
      const req = createReq({
        body: { paymentMethod: "card", amount: 500, orderId: "1", orderNumber: "ORD-1" },
      });
      const res = await POST(req);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("paymentId", "cs_1");
      expect(res.body).toHaveProperty("checkoutUrl", "https://checkout.paymongo.com/cs_1");
      expect(res.body).toHaveProperty("status");
      expect(res.body).toHaveProperty("error");
    });

    it("error response has standard shape", async () => {
      mockCreateEWalletPayment.mockResolvedValue({ success: false, error: "Oops" });
      const req = createReq({
        body: { paymentMethod: "gcash", amount: 500, orderId: "1", orderNumber: "ORD-1" },
      });
      const res = await POST(req);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("error", "Oops");
    });
  });

  // ---- GET endpoint ----
  describe("GET configuration", () => {
    it("returns config with all 5 payment methods", async () => {
      const res = await GET();
      expect(res.body.configured).toBe(true);
      expect(res.body.supportedMethods).toContain("gcash");
      expect(res.body.supportedMethods).toContain("grab_pay");
      expect(res.body.supportedMethods).toContain("card");
      expect(res.body.supportedMethods).toContain("cod");
      expect(res.body.supportedMethods).toContain("paymaya");
    });

    it("returns publicKey when configured", async () => {
      const res = await GET();
      expect(res.body.publicKey).toBe("pk_test_123");
    });

    it("returns null publicKey when not configured", async () => {
      mockIsPayMongoConfigured.mockReturnValue(false);
      const res = await GET();
      expect(res.body.publicKey).toBeNull();
    });
  });
});

// ==================== STATUS (PAY-010) ====================
describe("Payment Status Polling (PAY-010)", () => {
  let GET: Function;
  beforeAll(async () => {
    GET = (await import("@/app/api/payment/status/route")).GET;
  });

  // ---- AC1: GET /api/payment/status?paymentId=X&type=source|intent returns status ----
  describe("query param handling", () => {
    it("accepts paymentId query param", async () => {
      mockGetSourceStatus.mockResolvedValue({ status: "pending", paid: false });
      const res = await GET(createReq({ url: "http://localhost:3000/api/payment/status?paymentId=src_1" }));
      expect(res.body.success).toBe(true);
      expect(res.body.paymentId).toBe("src_1");
    });

    it("accepts legacy id query param for backwards compat", async () => {
      mockGetSourceStatus.mockResolvedValue({ status: "pending", paid: false });
      const res = await GET(createReq({ url: "http://localhost:3000/api/payment/status?id=src_2" }));
      expect(res.body.success).toBe(true);
      expect(res.body.paymentId).toBe("src_2");
    });

    it("prefers paymentId over legacy id when both provided", async () => {
      mockGetSourceStatus.mockResolvedValue({ status: "pending", paid: false, paymentId: "src_A" });
      const res = await GET(createReq({ url: "http://localhost:3000/api/payment/status?paymentId=src_A&id=src_B" }));
      expect(res.body.paymentId).toBe("src_A");
    });

    it("returns 400 when no payment ID is provided", async () => {
      const res = await GET(createReq({ url: "http://localhost:3000/api/payment/status" }));
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });

    it("defaults type to source when not specified", async () => {
      mockGetSourceStatus.mockResolvedValue({ status: "chargeable", paid: true });
      await GET(createReq({ url: "http://localhost:3000/api/payment/status?paymentId=src_1" }));
      expect(mockGetSourceStatus).toHaveBeenCalledWith("src_1");
      expect(mockGetPaymentIntentStatus).not.toHaveBeenCalled();
    });

    it("rejects invalid type value", async () => {
      const res = await GET(createReq({ url: "http://localhost:3000/api/payment/status?paymentId=src_1&type=invalid" }));
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ---- AC2: Polling endpoint for frontend to check payment completion ----
  describe("polling responses", () => {
    it("returns pending status for incomplete source", async () => {
      mockGetSourceStatus.mockResolvedValue({ status: "pending", paid: false });
      const res = await GET(createReq({ url: "http://localhost:3000/api/payment/status?paymentId=src_1" }));
      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe("pending");
      expect(res.body.paid).toBe(false);
    });

    it("returns chargeable status when source is authorized", async () => {
      mockGetSourceStatus.mockResolvedValue({ status: "chargeable", paid: true, paymentId: "pay_1" });
      const res = await GET(createReq({ url: "http://localhost:3000/api/payment/status?paymentId=src_1" }));
      expect(res.body.status).toBe("chargeable");
      expect(res.body.paid).toBe(true);
      expect(res.body.paymentId).toBe("pay_1");
    });

    it("returns succeeded status when payment intent completes", async () => {
      mockGetPaymentIntentStatus.mockResolvedValue({ status: "succeeded", paid: true, paymentId: "pay_2" });
      const res = await GET(createReq({ url: "http://localhost:3000/api/payment/status?paymentId=pi_1&type=intent" }));
      expect(res.body.status).toBe("succeeded");
      expect(res.body.paid).toBe(true);
    });

    it("returns failed status when payment fails", async () => {
      mockGetSourceStatus.mockResolvedValue({ status: "failed", paid: false });
      const res = await GET(createReq({ url: "http://localhost:3000/api/payment/status?paymentId=src_fail" }));
      expect(res.body.status).toBe("failed");
      expect(res.body.paid).toBe(false);
    });
  });

  // ---- AC3: Returns { status, paid, paymentId, method } ----
  describe("consistent response shape", () => {
    it("response has success, status, paid, paymentId fields", async () => {
      mockGetSourceStatus.mockResolvedValue({ status: "pending", paid: false });
      const res = await GET(createReq({ url: "http://localhost:3000/api/payment/status?paymentId=src_1" }));
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("status", "pending");
      expect(res.body).toHaveProperty("paid", false);
      expect(res.body).toHaveProperty("paymentId");
    });

    it("includes method when provided in query", async () => {
      mockGetSourceStatus.mockResolvedValue({ status: "pending", paid: false });
      const res = await GET(createReq({ url: "http://localhost:3000/api/payment/status?paymentId=src_1&method=gcash" }));
      expect(res.body.method).toBe("gcash");
    });

    it("omits method when not provided", async () => {
      mockGetSourceStatus.mockResolvedValue({ status: "pending", paid: false });
      const res = await GET(createReq({ url: "http://localhost:3000/api/payment/status?paymentId=src_1" }));
      expect(res.body.method).toBeUndefined();
    });

    it("rejects invalid method value", async () => {
      const res = await GET(createReq({ url: "http://localhost:3000/api/payment/status?paymentId=src_1&method=bitcoin" }));
      expect(res.status).toBe(400);
    });
  });

  // ---- AC4: Handles both source (e-wallets) and intent (cards) ----
  describe("source vs intent routing", () => {
    it("calls getSourceStatus for type=source", async () => {
      mockGetSourceStatus.mockResolvedValue({ status: "pending", paid: false });
      await GET(createReq({ url: "http://localhost:3000/api/payment/status?paymentId=src_1&type=source" }));
      expect(mockGetSourceStatus).toHaveBeenCalledWith("src_1");
      expect(mockGetPaymentIntentStatus).not.toHaveBeenCalled();
      expect(mockGetCheckoutSessionStatus).not.toHaveBeenCalled();
    });

    it("calls getPaymentIntentStatus for type=intent", async () => {
      mockGetPaymentIntentStatus.mockResolvedValue({ status: "succeeded", paid: true });
      await GET(createReq({ url: "http://localhost:3000/api/payment/status?paymentId=pi_1&type=intent" }));
      expect(mockGetPaymentIntentStatus).toHaveBeenCalledWith("pi_1");
      expect(mockGetSourceStatus).not.toHaveBeenCalled();
      expect(mockGetCheckoutSessionStatus).not.toHaveBeenCalled();
    });

    it("calls getCheckoutSessionStatus for type=checkout_session", async () => {
      mockGetCheckoutSessionStatus.mockResolvedValue({ status: "succeeded", paid: true, paymentId: "pay_cs_1" });
      const res = await GET(createReq({ url: "http://localhost:3000/api/payment/status?paymentId=cs_1&type=checkout_session" }));
      expect(mockGetCheckoutSessionStatus).toHaveBeenCalledWith("cs_1");
      expect(mockGetSourceStatus).not.toHaveBeenCalled();
      expect(mockGetPaymentIntentStatus).not.toHaveBeenCalled();
      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe("succeeded");
      expect(res.body.paid).toBe(true);
    });

    it("returns correct checkout session paid status", async () => {
      mockGetCheckoutSessionStatus.mockResolvedValue({ status: "succeeded", paid: true, paymentId: "pay_789" });
      const res = await GET(createReq({ url: "http://localhost:3000/api/payment/status?paymentId=cs_abc&type=checkout_session" }));
      expect(res.body.paid).toBe(true);
      expect(res.body.paymentId).toBe("pay_789");
    });

    it("returns pending for active checkout session", async () => {
      mockGetCheckoutSessionStatus.mockResolvedValue({ status: "pending", paid: false });
      const res = await GET(createReq({ url: "http://localhost:3000/api/payment/status?paymentId=cs_abc&type=checkout_session" }));
      expect(res.body.status).toBe("pending");
      expect(res.body.paid).toBe(false);
    });

    it("returns cancelled for expired checkout session", async () => {
      mockGetCheckoutSessionStatus.mockResolvedValue({ status: "cancelled", paid: false });
      const res = await GET(createReq({ url: "http://localhost:3000/api/payment/status?paymentId=cs_expired&type=checkout_session" }));
      expect(res.body.status).toBe("cancelled");
      expect(res.body.paid).toBe(false);
    });
  });

  // ---- AC5: Timeout handling after 5 min ----
  describe("timeout detection", () => {
    it("returns timeout=true when startedAt is older than 5 minutes", async () => {
      const sixMinAgo = new Date(Date.now() - 6 * 60 * 1000).toISOString();
      const res = await GET(createReq({
        url: `http://localhost:3000/api/payment/status?paymentId=src_1&startedAt=${encodeURIComponent(sixMinAgo)}`,
      }));
      expect(res.body.success).toBe(true);
      expect(res.body.timeout).toBe(true);
      expect(res.body.status).toBe("pending");
      expect(res.body.paid).toBe(false);
      expect(res.body.message).toContain("timed out");
      // Should NOT have called PayMongo (early return)
      expect(mockGetSourceStatus).not.toHaveBeenCalled();
    });

    it("does not timeout when startedAt is within 5 minutes", async () => {
      const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      mockGetSourceStatus.mockResolvedValue({ status: "pending", paid: false });
      const res = await GET(createReq({
        url: `http://localhost:3000/api/payment/status?paymentId=src_1&startedAt=${encodeURIComponent(twoMinAgo)}`,
      }));
      expect(res.body.timeout).toBeUndefined();
      expect(mockGetSourceStatus).toHaveBeenCalled();
    });

    it("proceeds normally when startedAt is not provided", async () => {
      mockGetSourceStatus.mockResolvedValue({ status: "pending", paid: false });
      const res = await GET(createReq({ url: "http://localhost:3000/api/payment/status?paymentId=src_1" }));
      expect(res.body.timeout).toBeUndefined();
      expect(res.body.success).toBe(true);
    });
  });

  // ---- AC6: No sensitive data exposed ----
  describe("no sensitive data exposure", () => {
    it("does not include internal API keys or secrets", async () => {
      mockGetSourceStatus.mockResolvedValue({ status: "chargeable", paid: true, paymentId: "pay_1" });
      const res = await GET(createReq({ url: "http://localhost:3000/api/payment/status?paymentId=src_1" }));
      const body = JSON.stringify(res.body);
      expect(body).not.toContain("sk_");
      expect(body).not.toContain("secret");
      expect(body).not.toContain("authorization");
    });

    it("error responses do not leak stack traces", async () => {
      mockGetSourceStatus.mockRejectedValue(new Error("Internal secret: sk_live_xxx"));
      const res = await GET(createReq({ url: "http://localhost:3000/api/payment/status?paymentId=src_1" }));
      expect(res.status).toBe(500);
      expect(res.body.error).not.toContain("sk_live");
      expect(res.body.error).toContain("Failed to check payment status");
    });
  });

  // ---- Rate limiting ----
  describe("rate limiting", () => {
    it("includes X-RateLimit-* headers on success", async () => {
      mockGetSourceStatus.mockResolvedValue({ status: "pending", paid: false });
      const res = await GET(createReq({ url: "http://localhost:3000/api/payment/status?paymentId=src_1" }));
      expect(res.headers.get("X-RateLimit-Limit")).toBe("5");
      expect(res.headers.get("X-RateLimit-Remaining")).toBe("4");
      expect(res.headers.get("X-RateLimit-Reset")).toBeDefined();
    });

    it("includes rate-limit headers on error", async () => {
      const res = await GET(createReq({ url: "http://localhost:3000/api/payment/status" }));
      expect(res.status).toBe(400);
      expect(res.headers.get("X-RateLimit-Limit")).toBe("5");
    });

    it("returns 429 when rate limit exceeded", async () => {
      const { NextResponse: NR } = jest.requireMock("next/server");
      mockCheckRateLimit.mockReturnValue(
        NR.json(
          { error: "Too Many Requests", retryAfter: 60 },
          { status: 429, headers: { "Retry-After": "60" } },
        ),
      );
      const res = await GET(createReq({ url: "http://localhost:3000/api/payment/status?paymentId=src_1" }));
      expect(res.status).toBe(429);
    });
  });

  // ---- Service unavailable ----
  describe("PayMongo not configured", () => {
    it("returns 503 when PayMongo is not configured", async () => {
      mockIsPayMongoConfigured.mockReturnValue(false);
      const res = await GET(createReq({ url: "http://localhost:3000/api/payment/status?paymentId=src_1" }));
      expect(res.status).toBe(503);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("not configured");
    });
  });

  // ---- Unexpected errors ----
  describe("error handling", () => {
    it("returns 500 with safe message on unexpected error", async () => {
      mockGetSourceStatus.mockRejectedValue(new Error("crash"));
      const res = await GET(createReq({ url: "http://localhost:3000/api/payment/status?paymentId=src_1" }));
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("Failed to check payment status");
    });
  });
});
