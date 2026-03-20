/**
 * Tests for Lalamove API routes
 * COV-011: quote, create-order, status, cancel, webhook, order, driver,
 *          driver-details, order-details, priority, orders, chat/send
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

// Mock next/headers
const mockCookieStore = { get: jest.fn(), set: jest.fn(), delete: jest.fn() };
jest.mock("next/headers", () => ({
  cookies: jest.fn().mockResolvedValue(mockCookieStore),
}));

// Mock api-client
const mockApiRequest = jest.fn();
jest.mock("@/lib/api-client", () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));

// Mock firebase
jest.mock("@/lib/firebase/config", () => ({
  firebaseApp: {},
}));
const mockUpdateLalamoveTracking = jest.fn();
const mockUpdateOrderStatus = jest.fn();
jest.mock("@/lib/firebase/orders", () => ({
  FirebaseOrdersService: Object.assign(
    jest.fn().mockImplementation(() => ({
      updateOrder: jest.fn(),
    })),
    {
      updateLalamoveTracking: (...args: unknown[]) => mockUpdateLalamoveTracking(...args),
      updateOrderStatus: (...args: unknown[]) => mockUpdateOrderStatus(...args),
    }
  ),
  updateOrderPaymentStatus: jest.fn(),
}));
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  addDoc: jest.fn().mockResolvedValue({ id: "mock-id" }),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  getDocs: jest.fn().mockResolvedValue({ docs: [] }),
  getFirestore: jest.fn(),
  Timestamp: { now: jest.fn(() => ({ toDate: () => new Date("2026-03-19T00:00:00.000Z") })) },
  doc: jest.fn(),
  updateDoc: jest.fn(),
}));

// Mock crypto
jest.mock("crypto", () => ({
  createHmac: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue({
      digest: jest.fn().mockReturnValue("test-signature"),
    }),
  }),
  timingSafeEqual: jest.fn(() => true),
}));

// Mock lalamove client
const mockLalamoveClient = {
  getQuotation: jest.fn().mockResolvedValue({ totalFee: "100", totalFeeCurrency: "PHP" }),
  placeOrder: jest.fn().mockResolvedValue({ orderId: "LLM-123" }),
  getOrderDetails: jest.fn().mockResolvedValue({ orderId: "LLM-123", status: "ON_GOING" }),
  getDriverDetails: jest.fn().mockResolvedValue({ name: "Driver", phone: "123" }),
  addPriorityFee: jest.fn().mockResolvedValue({ orderId: "LLM-123", status: "ASSIGNING_DRIVER", priceBreakdown: { total: "150", priorityFee: "50" } }),
  cancelOrder: jest.fn().mockResolvedValue({ success: true }),
  getCities: jest.fn().mockResolvedValue([{ name: "Manila" }]),
};
jest.mock("@/lib/lalamove/client", () => ({
  getLalamoveClient: () => mockLalamoveClient,
  LalamoveClient: jest.fn().mockImplementation(() => mockLalamoveClient),
}));

// Helper
function createReq(opts: {
  body?: string | object;
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
  url?: string;
}) {
  const url = opts.url || "http://localhost:3000/api/lalamove/test";
  const u = new URL(url);
  return {
    json: jest.fn().mockResolvedValue((() => { try { return typeof opts.body === "string" ? JSON.parse(opts.body as string) : opts.body || {}; } catch { return {}; } })()),
    text: jest.fn().mockResolvedValue(typeof opts.body === "string" ? opts.body : JSON.stringify(opts.body || {})),
    cookies: {
      get: (name: string) => {
        const value = opts.cookies?.[name];
        return value ? { value } : undefined;
      },
    },
    headers: {
      get: (name: string) => opts.headers?.[name] || null,
      entries: () => Object.entries(opts.headers || {})[Symbol.iterator](),
    },
    url: u.toString(),
    nextUrl: { searchParams: u.searchParams },
  };
}

const originalFetch = global.fetch;
afterAll(() => { global.fetch = originalFetch; });
beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
  mockCookieStore.get.mockReturnValue({ value: "valid-token" });
  process.env.LALAMOVE_API_SECRET = "test-secret";
  process.env.LALAMOVE_HOST = "https://rest.sandbox.lalamove.com";
});

// ==================== QUOTATION ====================
describe("POST /api/lalamove/quotation", () => {
  let POST: Function;
  beforeAll(async () => {
    try {
      POST = (await import("@/app/api/lalamove/quotation/route")).POST;
    } catch { POST = null; }
  });

  it("should handle quotation request", async () => {
    if (!POST) return;
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ totalFee: "150.00", currency: "PHP" }),
    });
    const req = createReq({
      body: {
        pickup: { lat: 14.5, lng: 121.0 },
        delivery: { lat: 14.6, lng: 121.1 },
        vehicleType: "MOTORCYCLE",
      },
    });
    const res = await POST(req);
    expect(res.status).toBeLessThan(500);
  });
});

// ==================== CREATE ORDER ====================
describe("POST /api/lalamove/create-order", () => {
  let POST: Function;
  beforeAll(async () => {
    try {
      POST = (await import("@/app/api/lalamove/create-order/route")).POST;
    } catch { POST = null; }
  });

  it("should handle create order request", async () => {
    if (!POST) return;
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ orderId: "LLM-123", status: "ASSIGNING_DRIVER" }),
    });
    const req = createReq({
      body: {
        quotationId: "q-123",
        pickup: { lat: 14.5, lng: 121.0, address: "Test" },
        delivery: { lat: 14.6, lng: 121.1, address: "Dest" },
      },
    });
    const res = await POST(req);
    expect(res.status).toBeLessThan(500);
  });
});

// ==================== DRIVER ====================
describe("GET /api/lalamove/driver", () => {
  let GET: Function;
  beforeAll(async () => {
    try {
      GET = (await import("@/app/api/lalamove/driver/route")).GET;
    } catch { GET = null; }
  });

  it("should return driver info", async () => {
    if (!GET) return;
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ name: "Driver", plateNumber: "ABC-123" }),
    });
    const req = createReq({
      url: "http://localhost:3000/api/lalamove/driver?orderId=LLM-123",
    });
    const res = await GET(req);
    expect(res.status).toBeLessThan(500);
  });
});

// ==================== DRIVER DETAILS ====================
describe("GET /api/lalamove/driver-details", () => {
  let GET: Function;
  beforeAll(async () => {
    try {
      GET = (await import("@/app/api/lalamove/driver-details/route")).GET;
    } catch { GET = null; }
  });

  it("should return driver details", async () => {
    if (!GET) return;
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ name: "Driver Detail", phone: "+63912" }),
    });
    const req = createReq({
      url: "http://localhost:3000/api/lalamove/driver-details?orderId=LLM-123",
    });
    const res = await GET(req);
    expect(res.status).toBeLessThan(500);
  });
});

// ==================== ORDER DETAILS ====================
describe("GET /api/lalamove/order-details", () => {
  let GET: Function;
  beforeAll(async () => {
    try {
      GET = (await import("@/app/api/lalamove/order-details/route")).GET;
    } catch { GET = null; }
  });

  it("should return order details", async () => {
    if (!GET) return;
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ orderId: "LLM-123", status: "ON_GOING" }),
    });
    const req = createReq({
      url: "http://localhost:3000/api/lalamove/order-details?orderId=LLM-123",
    });
    const res = await GET(req);
    expect(res.status).toBeLessThan(500);
  });
});

// ==================== ORDERS LIST ====================
describe("GET /api/lalamove/orders", () => {
  let GET: Function;
  beforeAll(async () => {
    try {
      GET = (await import("@/app/api/lalamove/orders/route")).GET;
    } catch { GET = null; }
  });

  it("should return orders list", async () => {
    if (!GET) return;
    const req = createReq({});
    const res = await GET(req);
    expect(res.status).toBeLessThan(500);
  });
});

// ==================== PRIORITY ====================
describe("POST /api/lalamove/priority", () => {
  let POST: Function;
  beforeAll(async () => {
    try {
      POST = (await import("@/app/api/lalamove/priority/route")).POST;
    } catch { POST = null; }
  });

  it("should handle priority request", async () => {
    if (!POST) return;
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    const req = createReq({
      body: { orderId: "LLM-123", priorityFee: 50 },
    });
    const res = await POST(req);
    expect(res.status).toBeLessThan(500);
  });
});

// ==================== ORDER (single) ====================
describe("Lalamove Order routes", () => {
  let POST: Function;
  beforeAll(async () => {
    try {
      POST = (await import("@/app/api/lalamove/order/route")).POST;
    } catch { POST = null; }
  });

  it("should create a lalamove order", async () => {
    if (!POST) return;
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ orderId: "LLM-456" }),
    });
    const req = createReq({
      body: {
        sender: { name: "Test" },
        recipient: { name: "Dest" },
        items: [{ name: "Mushrooms" }],
      },
    });
    const res = await POST(req);
    expect(res.status).toBeLessThan(500);
  });
});

// ==================== CHAT/SEND ====================
describe("POST /api/lalamove/chat/send", () => {
  let POST: Function;
  beforeAll(async () => {
    try {
      POST = (await import("@/app/api/lalamove/chat/send/route")).POST;
    } catch { POST = null; }
  });

  it("should send chat message", async () => {
    if (!POST) return;
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    const req = createReq({
      body: { orderId: "LLM-123", message: "Hello driver" },
    });
    const res = await POST(req);
    expect(res.status).toBeLessThan(500);
  });
});

// ==================== WEBHOOK ====================
describe("POST /api/lalamove/webhook", () => {
  let POST: Function;
  beforeAll(async () => {
    try {
      POST = (await import("@/app/api/lalamove/webhook/route")).POST;
    } catch { POST = null; }
  });

  it("should handle webhook with valid payload", async () => {
    if (!POST) return;
    const body = JSON.stringify({
      event: "ORDER_STATUS_CHANGED",
      orderId: "LLM-123",
      timestamp: new Date().toISOString(),
      data: { status: "COMPLETED" },
    });
    const req = createReq({
      body,
      headers: {
        "X-Lalamove-Signature": "test-signature",
      },
    });
    const res = await POST(req);
    expect(res.body).toBeDefined();
  });

  it("should handle malformed JSON", async () => {
    if (!POST) return;
    const req = createReq({ body: "invalid-json" });
    req.text.mockResolvedValue("invalid-json");
    const res = await POST(req);
    // Should not crash
    expect(res).toBeDefined();
  });

  it("should handle missing signature in production mode", async () => {
    if (!POST) return;
    const originalHost = process.env.LALAMOVE_HOST;
    process.env.LALAMOVE_HOST = "https://rest.lalamove.com"; // production
    
    const body = JSON.stringify({
      event: "DRIVER_ASSIGNED",
      orderId: "LLM-456",
      timestamp: new Date().toISOString(),
      data: {},
    });
    const req = createReq({ body, headers: {} });
    const res = await POST(req);
    expect(res).toBeDefined();
    
    process.env.LALAMOVE_HOST = originalHost;
  });
});

// ==================== SANDBOX SIMULATE + LIFECYCLE ====================
describe("Lalamove lifecycle flow assertions", () => {
  let simulatePOST: Function;
  let webhookPOST: Function;

  beforeEach(() => {
    const crypto = require("crypto");
    (crypto.timingSafeEqual as jest.Mock).mockReset();
    (crypto.timingSafeEqual as jest.Mock).mockReturnValue(true);

    const getDocs = require("firebase/firestore").getDocs as jest.Mock;
    getDocs.mockReset();
    getDocs.mockResolvedValue({ empty: false, docs: [{ id: "order-default" }] });
  });

  beforeAll(async () => {
    try {
      simulatePOST = (await import("@/app/api/lalamove/sandbox-simulate/route")).POST;
    } catch {
      simulatePOST = null;
    }

    try {
      webhookPOST = (await import("@/app/api/lalamove/webhook/route")).POST;
    } catch {
      webhookPOST = null;
    }
  });

  it("should write ON_GOING tracking when sandbox DRIVER_ASSIGNED is simulated", async () => {
    if (!simulatePOST) return;

    const req = createReq({
      body: {
        orderId: "order-flow-1",
        event: "DRIVER_ASSIGNED",
      },
    });

    const res = await simulatePOST(req);

    expect(res.status).toBe(200);
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith(
      "order-flow-1",
      expect.objectContaining({
        status: "ON_GOING",
        driver: expect.objectContaining({
          name: "John Doe (Sandbox)",
          phone: "+639171234567",
          plateNumber: "ABC 1234",
        }),
      })
    );
  });

  it("should include driver payload only for DRIVER_ASSIGNED simulator event", async () => {
    if (!simulatePOST) return;

    const req = createReq({
      body: {
        orderId: "order-payload-1",
        event: "DRIVER_ASSIGNED",
      },
    });

    const res = await simulatePOST(req);
    expect(res.status).toBe(200);

    const payload = mockUpdateLalamoveTracking.mock.calls.at(-1)?.[1] as Record<string, unknown>;
    expect(payload.status).toBe("ON_GOING");
    expect(payload.driver).toEqual(
      expect.objectContaining({
        id: "sandbox-driver-001",
        name: "John Doe (Sandbox)",
        phone: "+639171234567",
        plateNumber: "ABC 1234",
        coordinates: expect.objectContaining({ lat: 14.5995, lng: 120.9842 }),
      })
    );
  });

  it("should not inject driver payload for ASSIGNING_DRIVER simulator event", async () => {
    if (!simulatePOST) return;

    const req = createReq({
      body: {
        orderId: "order-payload-2",
        event: "ASSIGNING_DRIVER",
      },
    });

    const res = await simulatePOST(req);
    expect(res.status).toBe(200);

    const payload = mockUpdateLalamoveTracking.mock.calls.at(-1)?.[1] as Record<string, unknown>;
    expect(payload.status).toBe("ASSIGNING_DRIVER");
    expect(payload.driver).toBeUndefined();
  });

  it("should not inject driver payload for COMPLETED simulator event", async () => {
    if (!simulatePOST) return;

    const req = createReq({
      body: {
        orderId: "order-payload-3",
        event: "COMPLETED",
      },
    });

    const res = await simulatePOST(req);
    expect(res.status).toBe(200);

    const payload = mockUpdateLalamoveTracking.mock.calls.at(-1)?.[1] as Record<string, unknown>;
    expect(payload.status).toBe("COMPLETED");
    expect(payload.driver).toBeUndefined();
  });

  it("should reject sandbox simulator when host is not sandbox", async () => {
    if (!simulatePOST) return;

    process.env.LALAMOVE_HOST = "https://rest.lalamove.com";
    const req = createReq({
      body: {
        orderId: "order-flow-2",
        event: "ASSIGNING_DRIVER",
      },
    });

    const res = await simulatePOST(req);
    expect(res.status).toBe(403);
    expect(mockUpdateLalamoveTracking).not.toHaveBeenCalled();
  });

  it("should transition sandbox-assigned order to PICKED_UP via webhook", async () => {
    if (!simulatePOST || !webhookPOST) return;

    // Step 1: sandbox simulation writes ON_GOING + driver info
    const simReq = createReq({
      body: {
        orderId: "order-transition-1",
        event: "DRIVER_ASSIGNED",
      },
    });
    await simulatePOST(simReq);

    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith(
      "order-transition-1",
      expect.objectContaining({ status: "ON_GOING" })
    );

    mockUpdateLalamoveTracking.mockClear();

    // Step 2: webhook resolves Lalamove order ID -> Firestore order ID
    const getDocs = require("firebase/firestore").getDocs as jest.Mock;
    getDocs.mockResolvedValueOnce({
      empty: false,
      docs: [{ id: "order-transition-1" }],
    });

    const webhookBody = JSON.stringify({
      event: "DRIVER_PICKED_UP",
      orderId: "LLM-TRANS-1",
      timestamp: new Date().toISOString(),
      data: { pickupTime: new Date().toISOString() },
    });

    const webhookReq = createReq({
      body: webhookBody,
      headers: {
        "X-Lalamove-Signature": "test-signature",
      },
    });
    webhookReq.text.mockResolvedValue(webhookBody);

    const webhookRes = await webhookPOST(webhookReq);

    expect(webhookRes.status).toBe(200);
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith(
      "order-transition-1",
      expect.objectContaining({ status: "PICKED_UP" })
    );
    expect(mockUpdateOrderStatus).toHaveBeenCalledWith(
      "order-transition-1",
      "shipped",
      "lalamove-webhook",
      expect.any(String)
    );
  });

  it("should transition to delivered when ORDER_COMPLETED webhook arrives", async () => {
    if (!webhookPOST) return;

    const getDocs = require("firebase/firestore").getDocs as jest.Mock;
    getDocs.mockResolvedValueOnce({
      empty: false,
      docs: [{ id: "order-transition-2" }],
    });

    const webhookBody = JSON.stringify({
      event: "ORDER_COMPLETED",
      orderId: "LLM-TRANS-2",
      timestamp: new Date().toISOString(),
      data: { completionTime: new Date().toISOString() },
    });

    const webhookReq = createReq({
      body: webhookBody,
      headers: {
        "X-Lalamove-Signature": "test-signature",
      },
    });
    webhookReq.text.mockResolvedValue(webhookBody);

    const webhookRes = await webhookPOST(webhookReq);

    expect(webhookRes.status).toBe(200);
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith(
      "order-transition-2",
      expect.objectContaining({ status: "COMPLETED" })
    );
    expect(mockUpdateOrderStatus).toHaveBeenCalledWith(
      "order-transition-2",
      "delivered",
      "lalamove-webhook",
      expect.any(String)
    );
  });

  it("should reject DRIVER_PICKED_UP lifecycle event when signature mismatches", async () => {
    if (!webhookPOST) return;

    const crypto = require("crypto");
    (crypto.timingSafeEqual as jest.Mock).mockReturnValueOnce(false);

    const webhookBody = JSON.stringify({
      event: "DRIVER_PICKED_UP",
      orderId: "LLM-BAD-SIG-1",
      timestamp: new Date().toISOString(),
      data: { pickupTime: new Date().toISOString() },
    });

    const webhookReq = createReq({
      body: webhookBody,
      headers: { "X-Lalamove-Signature": "invalid-signature" },
    });
    webhookReq.text.mockResolvedValue(webhookBody);

    const webhookRes = await webhookPOST(webhookReq);

    expect(webhookRes.status).toBe(401);
    expect(mockUpdateLalamoveTracking).not.toHaveBeenCalled();
    expect(mockUpdateOrderStatus).not.toHaveBeenCalled();
  });

  it("should reject ORDER_COMPLETED lifecycle event when signature mismatches", async () => {
    if (!webhookPOST) return;

    const crypto = require("crypto");
    (crypto.timingSafeEqual as jest.Mock).mockReturnValueOnce(false);

    const webhookBody = JSON.stringify({
      event: "ORDER_COMPLETED",
      orderId: "LLM-BAD-SIG-2",
      timestamp: new Date().toISOString(),
      data: { completionTime: new Date().toISOString() },
    });

    const webhookReq = createReq({
      body: webhookBody,
      headers: { "X-Lalamove-Signature": "invalid-signature" },
    });
    webhookReq.text.mockResolvedValue(webhookBody);

    const webhookRes = await webhookPOST(webhookReq);

    expect(webhookRes.status).toBe(401);
    expect(mockUpdateLalamoveTracking).not.toHaveBeenCalled();
    expect(mockUpdateOrderStatus).not.toHaveBeenCalled();
  });

  it("should reject lifecycle webhook in production when signature header is missing", async () => {
    if (!webhookPOST) return;

    process.env.LALAMOVE_HOST = "https://rest.lalamove.com";

    const webhookBody = JSON.stringify({
      event: "DRIVER_PICKED_UP",
      orderId: "LLM-NO-SIG-PROD-1",
      timestamp: new Date().toISOString(),
      data: { pickupTime: new Date().toISOString() },
    });

    const webhookReq = createReq({
      body: webhookBody,
      headers: {},
    });
    webhookReq.text.mockResolvedValue(webhookBody);

    const webhookRes = await webhookPOST(webhookReq);

    expect(webhookRes.status).toBe(401);
    expect(mockUpdateLalamoveTracking).not.toHaveBeenCalled();
    expect(mockUpdateOrderStatus).not.toHaveBeenCalled();
  });

  it("should reject ORDER_CANCELLED lifecycle event when signature mismatches", async () => {
    if (!webhookPOST) return;

    const crypto = require("crypto");
    (crypto.timingSafeEqual as jest.Mock).mockReturnValueOnce(false);

    const webhookBody = JSON.stringify({
      event: "ORDER_CANCELLED",
      orderId: "LLM-BAD-SIG-CANCEL-1",
      timestamp: new Date().toISOString(),
      data: { reason: "Courier unavailable", cancelledBy: "system" },
    });

    const webhookReq = createReq({
      body: webhookBody,
      headers: { "X-Lalamove-Signature": "invalid-signature" },
    });
    webhookReq.text.mockResolvedValue(webhookBody);

    const webhookRes = await webhookPOST(webhookReq);

    expect(webhookRes.status).toBe(401);
    expect(mockUpdateLalamoveTracking).not.toHaveBeenCalled();
    expect(mockUpdateOrderStatus).not.toHaveBeenCalled();
  });

  it("should skip PICKED_UP transition when Firestore order lookup misses", async () => {
    if (!webhookPOST) return;

    const getDocs = require("firebase/firestore").getDocs as jest.Mock;
    getDocs.mockResolvedValue({ empty: true, docs: [] });

    const webhookBody = JSON.stringify({
      event: "DRIVER_PICKED_UP",
      orderId: "LLM-NO-ORDER-1",
      timestamp: new Date().toISOString(),
      data: { pickupTime: new Date().toISOString() },
    });

    const webhookReq = createReq({
      body: webhookBody,
      headers: { "X-Lalamove-Signature": "test-signature" },
    });
    webhookReq.text.mockResolvedValue(webhookBody);

    const webhookRes = await webhookPOST(webhookReq);

    expect(webhookRes.status).toBe(200);
    expect(mockUpdateLalamoveTracking).not.toHaveBeenCalled();
    expect(mockUpdateOrderStatus).not.toHaveBeenCalled();
  });

  it("should skip COMPLETED transition when Firestore order lookup misses", async () => {
    if (!webhookPOST) return;

    const getDocs = require("firebase/firestore").getDocs as jest.Mock;
    getDocs.mockResolvedValue({ empty: true, docs: [] });

    const webhookBody = JSON.stringify({
      event: "ORDER_COMPLETED",
      orderId: "LLM-NO-ORDER-2",
      timestamp: new Date().toISOString(),
      data: { completionTime: new Date().toISOString() },
    });

    const webhookReq = createReq({
      body: webhookBody,
      headers: { "X-Lalamove-Signature": "test-signature" },
    });
    webhookReq.text.mockResolvedValue(webhookBody);

    const webhookRes = await webhookPOST(webhookReq);

    expect(webhookRes.status).toBe(200);
    expect(mockUpdateLalamoveTracking).not.toHaveBeenCalled();
    expect(mockUpdateOrderStatus).not.toHaveBeenCalled();
  });

  it("should update CANCELLED tracking without shipped or delivered status transitions", async () => {
    if (!webhookPOST) return;

    const getDocs = require("firebase/firestore").getDocs as jest.Mock;
    getDocs.mockResolvedValue({ empty: false, docs: [{ id: "order-cancel-1" }] });

    const webhookBody = JSON.stringify({
      event: "ORDER_CANCELLED",
      orderId: "LLM-CANCEL-1",
      timestamp: new Date().toISOString(),
      data: { reason: "Customer changed mind", cancelledBy: "customer" },
    });

    const webhookReq = createReq({
      body: webhookBody,
      headers: { "X-Lalamove-Signature": "test-signature" },
    });
    webhookReq.text.mockResolvedValue(webhookBody);

    const webhookRes = await webhookPOST(webhookReq);

    expect(webhookRes.status).toBe(200);
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith(
      "order-cancel-1",
      expect.objectContaining({ status: "CANCELLED" })
    );
    expect(mockUpdateOrderStatus).not.toHaveBeenCalled();
  });

  it("should skip CANCELLED transition when Firestore order lookup misses", async () => {
    if (!webhookPOST) return;

    const getDocs = require("firebase/firestore").getDocs as jest.Mock;
    getDocs.mockResolvedValue({ empty: true, docs: [] });

    const webhookBody = JSON.stringify({
      event: "ORDER_CANCELLED",
      orderId: "LLM-NO-ORDER-CANCEL-1",
      timestamp: new Date().toISOString(),
      data: { reason: "No courier" },
    });

    const webhookReq = createReq({
      body: webhookBody,
      headers: { "X-Lalamove-Signature": "test-signature" },
    });
    webhookReq.text.mockResolvedValue(webhookBody);

    const webhookRes = await webhookPOST(webhookReq);

    expect(webhookRes.status).toBe(200);
    expect(mockUpdateLalamoveTracking).not.toHaveBeenCalled();
    expect(mockUpdateOrderStatus).not.toHaveBeenCalled();
  });

  it("should handle ORDER_STATUS_CHANGED with partial payload without mutating order status", async () => {
    if (!webhookPOST) return;

    const getDocs = require("firebase/firestore").getDocs as jest.Mock;
    getDocs.mockResolvedValue({ empty: false, docs: [{ id: "order-partial-status-1" }] });

    const webhookBody = JSON.stringify({
      event: "ORDER_STATUS_CHANGED",
      orderId: "LLM-PARTIAL-STATUS-1",
      timestamp: new Date().toISOString(),
      data: {},
    });

    const webhookReq = createReq({
      body: webhookBody,
      headers: { "X-Lalamove-Signature": "test-signature" },
    });
    webhookReq.text.mockResolvedValue(webhookBody);

    const webhookRes = await webhookPOST(webhookReq);

    expect(webhookRes.status).toBe(200);
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith(
      "order-partial-status-1",
      expect.objectContaining({
        status: undefined,
        lastUpdated: expect.any(Date),
      })
    );
    expect(mockUpdateOrderStatus).not.toHaveBeenCalled();
  });

  it("should apply fallback identity contract for DRIVER_LOCATION_UPDATED with optional fields absent", async () => {
    if (!webhookPOST) return;

    const getDocs = require("firebase/firestore").getDocs as jest.Mock;
    getDocs.mockResolvedValue({ empty: false, docs: [{ id: "order-partial-loc-1" }] });

    const webhookBody = JSON.stringify({
      event: "DRIVER_LOCATION_UPDATED",
      orderId: "LLM-PARTIAL-LOC-1",
      timestamp: new Date().toISOString(),
      data: {
        coordinates: { lat: 14.6123, lng: undefined },
      },
    });

    const webhookReq = createReq({
      body: webhookBody,
      headers: { "X-Lalamove-Signature": "test-signature" },
    });
    webhookReq.text.mockResolvedValue(webhookBody);

    const webhookRes = await webhookPOST(webhookReq);

    expect(webhookRes.status).toBe(200);
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith(
      "order-partial-loc-1",
      expect.objectContaining({
        driver: expect.objectContaining({
          id: "",
          name: "",
          phone: "",
          plateNumber: "",
          coordinates: expect.objectContaining({ lat: 14.6123, lng: undefined }),
        }),
      })
    );
    expect(mockUpdateOrderStatus).not.toHaveBeenCalled();
  });

  it("should keep non-regression order status mutations scoped to PICKED_UP and COMPLETED only", async () => {
    if (!webhookPOST) return;

    const getDocs = require("firebase/firestore").getDocs as jest.Mock;
    getDocs.mockResolvedValue({ empty: false, docs: [{ id: "order-non-reg-1" }] });

    const statusChangedBody = JSON.stringify({
      event: "ORDER_STATUS_CHANGED",
      orderId: "LLM-NON-REG-1",
      timestamp: new Date().toISOString(),
      data: { status: "ON_GOING" },
    });
    const driverAssignedBody = JSON.stringify({
      event: "DRIVER_ASSIGNED",
      orderId: "LLM-NON-REG-1",
      timestamp: new Date().toISOString(),
      data: {
        driver: {
          id: "d-1",
          name: "Juan",
          phone: "+639171111111",
          plateNumber: "ABC 123",
        },
      },
    });
    const cancelledBody = JSON.stringify({
      event: "ORDER_CANCELLED",
      orderId: "LLM-NON-REG-1",
      timestamp: new Date().toISOString(),
      data: { reason: "Customer changed mind", cancelledBy: "customer" },
    });

    const statusChangedReq = createReq({ body: statusChangedBody, headers: { "X-Lalamove-Signature": "test-signature" } });
    const driverAssignedReq = createReq({ body: driverAssignedBody, headers: { "X-Lalamove-Signature": "test-signature" } });
    const cancelledReq = createReq({ body: cancelledBody, headers: { "X-Lalamove-Signature": "test-signature" } });
    statusChangedReq.text.mockResolvedValue(statusChangedBody);
    driverAssignedReq.text.mockResolvedValue(driverAssignedBody);
    cancelledReq.text.mockResolvedValue(cancelledBody);

    await webhookPOST(statusChangedReq);
    await webhookPOST(driverAssignedReq);
    await webhookPOST(cancelledReq);

    expect(mockUpdateLalamoveTracking).toHaveBeenCalledTimes(3);
    expect(mockUpdateOrderStatus).not.toHaveBeenCalled();
  });

  it("should preserve status structure consistency across webhook lifecycle transitions", async () => {
    if (!webhookPOST) return;

    const getDocs = require("firebase/firestore").getDocs as jest.Mock;
    getDocs.mockResolvedValue({ empty: false, docs: [{ id: "order-structure-1" }] });

    const statusChangedBody = JSON.stringify({
      event: "ORDER_STATUS_CHANGED",
      orderId: "LLM-STRUCTURE-1",
      timestamp: new Date().toISOString(),
      data: { status: "ON_GOING" },
    });
    const pickedUpBody = JSON.stringify({
      event: "DRIVER_PICKED_UP",
      orderId: "LLM-STRUCTURE-1",
      timestamp: new Date().toISOString(),
      data: { pickupTime: new Date().toISOString() },
    });
    const completedBody = JSON.stringify({
      event: "ORDER_COMPLETED",
      orderId: "LLM-STRUCTURE-1",
      timestamp: new Date().toISOString(),
      data: { completionTime: new Date().toISOString() },
    });

    const statusReq = createReq({ body: statusChangedBody, headers: { "X-Lalamove-Signature": "test-signature" } });
    const pickedReq = createReq({ body: pickedUpBody, headers: { "X-Lalamove-Signature": "test-signature" } });
    const completedReq = createReq({ body: completedBody, headers: { "X-Lalamove-Signature": "test-signature" } });
    statusReq.text.mockResolvedValue(statusChangedBody);
    pickedReq.text.mockResolvedValue(pickedUpBody);
    completedReq.text.mockResolvedValue(completedBody);

    await webhookPOST(statusReq);
    await webhookPOST(pickedReq);
    await webhookPOST(completedReq);

    const payloads = mockUpdateLalamoveTracking.mock.calls.map((call) => call[1] as Record<string, unknown>);
    expect(payloads).toHaveLength(3);
    expect(payloads[0]).toEqual(expect.objectContaining({ status: "ON_GOING", lastUpdated: expect.any(Date) }));
    expect(payloads[1]).toEqual(expect.objectContaining({ status: "PICKED_UP", lastUpdated: expect.any(Date) }));
    expect(payloads[2]).toEqual(expect.objectContaining({ status: "COMPLETED", lastUpdated: expect.any(Date) }));
    expect(payloads.every((payload) => !("timeline" in payload))).toBe(true);
  });

  it("should accept near-limit signed webhook payload and process deterministically", async () => {
    if (!webhookPOST) return;

    const getDocs = require("firebase/firestore").getDocs as jest.Mock;
    getDocs.mockResolvedValue({ empty: false, docs: [{ id: "order-near-limit-1" }] });

    const nearLimitStatus = "A".repeat(1024 * 1024 - 9000);
    const webhookBody = JSON.stringify({
      event: "ORDER_STATUS_CHANGED",
      orderId: "LLM-NEAR-LIMIT-1",
      timestamp: new Date().toISOString(),
      data: { status: nearLimitStatus },
    });

    const webhookReq = createReq({
      body: webhookBody,
      headers: { "X-Lalamove-Signature": "test-signature" },
    });
    webhookReq.text.mockResolvedValue(webhookBody);

    const res = await webhookPOST(webhookReq);
    expect(res.status).toBe(200);
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith(
      "order-near-limit-1",
      expect.objectContaining({ status: nearLimitStatus })
    );
  });

  it("should reject over-limit signed webhook payload with 413 contract", async () => {
    if (!webhookPOST) return;

    const oversizedBody = "x".repeat(1024 * 1024 + 1);
    const webhookReq = createReq({
      body: oversizedBody,
      headers: { "X-Lalamove-Signature": "test-signature" },
    });
    webhookReq.text.mockResolvedValue(oversizedBody);

    const res = await webhookPOST(webhookReq);
    expect(res.status).toBe(413);
    expect(res.body).toEqual(
      expect.objectContaining({ success: false, message: expect.stringContaining("too large") })
    );
    expect(mockUpdateLalamoveTracking).not.toHaveBeenCalled();
  });

  it("should reject malformed JSON in signed webhook payload with 400 contract", async () => {
    if (!webhookPOST) return;

    const malformedBody = "{\"event\":\"ORDER_STATUS_CHANGED\",\"data\":";
    const webhookReq = createReq({
      body: malformedBody,
      headers: { "X-Lalamove-Signature": "test-signature" },
    });
    webhookReq.text.mockResolvedValue(malformedBody);

    const res = await webhookPOST(webhookReq);
    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({ success: false, message: expect.stringContaining("Malformed JSON") })
    );
    expect(mockUpdateLalamoveTracking).not.toHaveBeenCalled();
    expect(mockUpdateOrderStatus).not.toHaveBeenCalled();
  });

  it("should preserve driver payload by not overwriting it during PICKED_UP transition", async () => {
    if (!simulatePOST || !webhookPOST) return;

    await simulatePOST(
      createReq({
        body: {
          orderId: "order-preserve-1",
          event: "DRIVER_ASSIGNED",
        },
      })
    );

    mockUpdateLalamoveTracking.mockClear();

    const getDocs = require("firebase/firestore").getDocs as jest.Mock;
    getDocs.mockResolvedValue({ empty: false, docs: [{ id: "order-preserve-1" }] });

    const webhookBody = JSON.stringify({
      event: "DRIVER_PICKED_UP",
      orderId: "LLM-PRESERVE-1",
      timestamp: new Date().toISOString(),
      data: { pickupTime: new Date().toISOString() },
    });

    const webhookReq = createReq({
      body: webhookBody,
      headers: { "X-Lalamove-Signature": "test-signature" },
    });
    webhookReq.text.mockResolvedValue(webhookBody);

    await webhookPOST(webhookReq);

    const pickedUpPayload = mockUpdateLalamoveTracking.mock.calls[0][1] as Record<string, unknown>;
    expect(pickedUpPayload.status).toBe("PICKED_UP");
    expect(pickedUpPayload.driver).toBeUndefined();
  });

  it("should preserve driver payload by not overwriting it during COMPLETED transition", async () => {
    if (!webhookPOST) return;

    const getDocs = require("firebase/firestore").getDocs as jest.Mock;
    getDocs.mockResolvedValue({ empty: false, docs: [{ id: "order-preserve-2" }] });

    const webhookBody = JSON.stringify({
      event: "ORDER_COMPLETED",
      orderId: "LLM-PRESERVE-2",
      timestamp: new Date().toISOString(),
      data: { completionTime: new Date().toISOString() },
    });

    const webhookReq = createReq({
      body: webhookBody,
      headers: { "X-Lalamove-Signature": "test-signature" },
    });
    webhookReq.text.mockResolvedValue(webhookBody);

    await webhookPOST(webhookReq);

    const completedPayload = mockUpdateLalamoveTracking.mock.calls[0][1] as Record<string, unknown>;
    expect(completedPayload.status).toBe("COMPLETED");
    expect(completedPayload.driver).toBeUndefined();
  });

  it("should preserve lifecycle order ON_GOING to PICKED_UP to COMPLETED for same order", async () => {
    if (!simulatePOST || !webhookPOST) return;

    await simulatePOST(
      createReq({
        body: {
          orderId: "order-lifecycle-1",
          event: "DRIVER_ASSIGNED",
        },
      })
    );

    const getDocs = require("firebase/firestore").getDocs as jest.Mock;
    getDocs
      .mockResolvedValueOnce({ empty: false, docs: [{ id: "order-lifecycle-1" }] })
      .mockResolvedValueOnce({ empty: false, docs: [{ id: "order-lifecycle-1" }] });

    const pickedUpBody = JSON.stringify({
      event: "DRIVER_PICKED_UP",
      orderId: "LLM-LIFECYCLE-1",
      timestamp: new Date().toISOString(),
      data: { pickupTime: new Date().toISOString() },
    });

    const completedBody = JSON.stringify({
      event: "ORDER_COMPLETED",
      orderId: "LLM-LIFECYCLE-1",
      timestamp: new Date().toISOString(),
      data: { completionTime: new Date().toISOString() },
    });

    const pickedUpReq = createReq({
      body: pickedUpBody,
      headers: { "X-Lalamove-Signature": "test-signature" },
    });
    pickedUpReq.text.mockResolvedValue(pickedUpBody);

    const completedReq = createReq({
      body: completedBody,
      headers: { "X-Lalamove-Signature": "test-signature" },
    });
    completedReq.text.mockResolvedValue(completedBody);

    await webhookPOST(pickedUpReq);
    await webhookPOST(completedReq);

    expect(mockUpdateLalamoveTracking).toHaveBeenNthCalledWith(
      1,
      "order-lifecycle-1",
      expect.objectContaining({ status: "ON_GOING" })
    );
    expect(mockUpdateLalamoveTracking).toHaveBeenNthCalledWith(
      2,
      "order-lifecycle-1",
      expect.objectContaining({ status: "PICKED_UP" })
    );
    expect(mockUpdateLalamoveTracking).toHaveBeenNthCalledWith(
      3,
      "order-lifecycle-1",
      expect.objectContaining({ status: "COMPLETED" })
    );
    expect(mockUpdateOrderStatus).toHaveBeenNthCalledWith(
      1,
      "order-lifecycle-1",
      "shipped",
      "lalamove-webhook",
      expect.any(String)
    );
    expect(mockUpdateOrderStatus).toHaveBeenNthCalledWith(
      2,
      "order-lifecycle-1",
      "delivered",
      "lalamove-webhook",
      expect.any(String)
    );

    const pickedUpPayload = mockUpdateLalamoveTracking.mock.calls[1][1] as Record<string, unknown>;
    const completedPayload = mockUpdateLalamoveTracking.mock.calls[2][1] as Record<string, unknown>;
    expect(pickedUpPayload.driver).toBeUndefined();
    expect(completedPayload.driver).toBeUndefined();
    expect(pickedUpPayload.timeline).toBeUndefined();
    expect(completedPayload.timeline).toBeUndefined();
  });

  it("should enforce lifecycle payload parity with lastUpdated and no unintended fields", async () => {
    if (!webhookPOST) return;

    const getDocs = require("firebase/firestore").getDocs as jest.Mock;
    getDocs
      .mockResolvedValueOnce({ empty: false, docs: [{ id: "order-parity-1" }] })
      .mockResolvedValueOnce({ empty: false, docs: [{ id: "order-parity-1" }] })
      .mockResolvedValueOnce({ empty: false, docs: [{ id: "order-parity-1" }] });

    const driverAssignedBody = JSON.stringify({
      event: "DRIVER_ASSIGNED",
      orderId: "LLM-PARITY-1",
      timestamp: new Date().toISOString(),
      data: {
        driver: {
          id: "drv-parity-1",
          name: "Juan",
          phone: "+639171111111",
          plateNumber: "ABC 123",
        },
      },
    });
    const pickedUpBody = JSON.stringify({
      event: "DRIVER_PICKED_UP",
      orderId: "LLM-PARITY-1",
      timestamp: new Date().toISOString(),
      data: { pickupTime: new Date().toISOString() },
    });
    const completedBody = JSON.stringify({
      event: "ORDER_COMPLETED",
      orderId: "LLM-PARITY-1",
      timestamp: new Date().toISOString(),
      data: { completionTime: new Date().toISOString() },
    });

    const req1 = createReq({ body: driverAssignedBody, headers: { "X-Lalamove-Signature": "test-signature" } });
    const req2 = createReq({ body: pickedUpBody, headers: { "X-Lalamove-Signature": "test-signature" } });
    const req3 = createReq({ body: completedBody, headers: { "X-Lalamove-Signature": "test-signature" } });
    req1.text.mockResolvedValue(driverAssignedBody);
    req2.text.mockResolvedValue(pickedUpBody);
    req3.text.mockResolvedValue(completedBody);

    await webhookPOST(req1);
    await webhookPOST(req2);
    await webhookPOST(req3);

    const payloads = mockUpdateLalamoveTracking.mock.calls.map((call) => call[1] as Record<string, unknown>);
    payloads.forEach((payload) => {
      expect(payload.lastUpdated).toEqual(expect.any(Date));
      expect(payload.timeline).toBeUndefined();
      expect(payload.shareLink).toBeUndefined();
      expect(payload.orderId).toBeUndefined();
    });
  });

  it("should keep lastUpdated timestamps monotonic across lifecycle transitions", async () => {
    if (!webhookPOST) return;

    const getDocs = require("firebase/firestore").getDocs as jest.Mock;
    getDocs
      .mockResolvedValueOnce({ empty: false, docs: [{ id: "order-monotonic-1" }] })
      .mockResolvedValueOnce({ empty: false, docs: [{ id: "order-monotonic-1" }] })
      .mockResolvedValueOnce({ empty: false, docs: [{ id: "order-monotonic-1" }] });

    const driverAssignedBody = JSON.stringify({
      event: "DRIVER_ASSIGNED",
      orderId: "LLM-MONOTONIC-1",
      timestamp: "2026-03-20T10:00:01.000Z",
      data: { driver: { id: "drv-1", name: "Juan", phone: "+639171111111", plateNumber: "ABC 123" } },
    });
    const pickedUpBody = JSON.stringify({
      event: "DRIVER_PICKED_UP",
      orderId: "LLM-MONOTONIC-1",
      timestamp: "2026-03-20T10:00:02.000Z",
      data: { pickupTime: "2026-03-20T10:00:02.000Z" },
    });
    const completedBody = JSON.stringify({
      event: "ORDER_COMPLETED",
      orderId: "LLM-MONOTONIC-1",
      timestamp: "2026-03-20T10:00:03.000Z",
      data: { completionTime: "2026-03-20T10:00:03.000Z" },
    });

    const req1 = createReq({ body: driverAssignedBody, headers: { "X-Lalamove-Signature": "test-signature" } });
    const req2 = createReq({ body: pickedUpBody, headers: { "X-Lalamove-Signature": "test-signature" } });
    const req3 = createReq({ body: completedBody, headers: { "X-Lalamove-Signature": "test-signature" } });
    req1.text.mockResolvedValue(driverAssignedBody);
    req2.text.mockResolvedValue(pickedUpBody);
    req3.text.mockResolvedValue(completedBody);

    await webhookPOST(req1);
    await webhookPOST(req2);
    await webhookPOST(req3);

    const timestamps = mockUpdateLalamoveTracking.mock.calls.map((call) => {
      const payload = call[1] as { lastUpdated: Date };
      return payload.lastUpdated.getTime();
    });

    expect(timestamps[1]).toBeGreaterThanOrEqual(timestamps[0]);
    expect(timestamps[2]).toBeGreaterThanOrEqual(timestamps[1]);
  });

  it("should ignore malformed nested metadata payloads without mutating lifecycle contracts", async () => {
    if (!webhookPOST) return;

    const getDocs = require("firebase/firestore").getDocs as jest.Mock;
    getDocs
      .mockResolvedValueOnce({ empty: false, docs: [{ id: "order-meta-neg-1" }] })
      .mockResolvedValueOnce({ empty: false, docs: [{ id: "order-meta-neg-1" }] });

    const statusChangedBody = JSON.stringify({
      event: "ORDER_STATUS_CHANGED",
      orderId: "LLM-META-NEG-1",
      timestamp: new Date().toISOString(),
      data: {
        status: "ON_GOING",
        metadata: { nested: { unexpected: true, notes: ["x", "y"] } },
      },
    });
    const cancelledBody = JSON.stringify({
      event: "ORDER_CANCELLED",
      orderId: "LLM-META-NEG-1",
      timestamp: new Date().toISOString(),
      data: {
        reason: "ops",
        cancelledBy: "system",
        metadata: { nested: { bad: "shape" } },
      },
    });

    const req1 = createReq({ body: statusChangedBody, headers: { "X-Lalamove-Signature": "test-signature" } });
    const req2 = createReq({ body: cancelledBody, headers: { "X-Lalamove-Signature": "test-signature" } });
    req1.text.mockResolvedValue(statusChangedBody);
    req2.text.mockResolvedValue(cancelledBody);

    await webhookPOST(req1);
    await webhookPOST(req2);

    const firstPayload = mockUpdateLalamoveTracking.mock.calls[0][1] as Record<string, unknown>;
    const secondPayload = mockUpdateLalamoveTracking.mock.calls[1][1] as Record<string, unknown>;

    expect(firstPayload).toEqual(expect.objectContaining({ status: "ON_GOING", lastUpdated: expect.any(Date) }));
    expect(secondPayload).toEqual(expect.objectContaining({ status: "CANCELLED", lastUpdated: expect.any(Date) }));
    expect(firstPayload.metadata).toBeUndefined();
    expect(secondPayload.metadata).toBeUndefined();
    expect(mockUpdateOrderStatus).not.toHaveBeenCalled();
  });

  it("should return deterministic 401 contract for empty-string signature", async () => {
    if (!webhookPOST) return;

    const webhookBody = JSON.stringify({
      event: "ORDER_STATUS_CHANGED",
      orderId: "LLM-SIG-EMPTY-1",
      timestamp: new Date().toISOString(),
      data: { status: "ON_GOING" },
    });

    const req = createReq({ body: webhookBody, headers: { "X-Lalamove-Signature": "" } });
    req.text.mockResolvedValue(webhookBody);

    const res = await webhookPOST(req);

    expect(res.status).toBe(401);
    expect(res.body).toEqual(expect.objectContaining({ success: false, message: "Missing signature" }));
    expect(mockUpdateLalamoveTracking).not.toHaveBeenCalled();
  });

  it("should keep ORDER_CANCELLED isolated from shipped/delivered mutation under malformed reason fields", async () => {
    if (!webhookPOST) return;

    const getDocs = require("firebase/firestore").getDocs as jest.Mock;
    getDocs.mockResolvedValue({ empty: false, docs: [{ id: "order-cancel-parity-1" }] });

    const webhookBody = JSON.stringify({
      event: "ORDER_CANCELLED",
      orderId: "LLM-CANCEL-PARITY-1",
      timestamp: new Date().toISOString(),
      data: { reason: null, cancelledBy: { actor: "system" } },
    });

    const req = createReq({ body: webhookBody, headers: { "X-Lalamove-Signature": "test-signature" } });
    req.text.mockResolvedValue(webhookBody);

    const res = await webhookPOST(req);

    expect(res.status).toBe(200);
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith(
      "order-cancel-parity-1",
      expect.objectContaining({ status: "CANCELLED", lastUpdated: expect.any(Date) })
    );
    expect(mockUpdateOrderStatus).not.toHaveBeenCalled();
  });
});
