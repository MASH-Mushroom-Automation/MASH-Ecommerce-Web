/**
 * Tests for POST/GET /api/lalamove/webhook
 * Covers: signature verification, all webhook event types, Firestore order lookup
 */

jest.mock("next/server", () => {
  class MockNextResponse {
    public body: any;
    public status: number;
    constructor(body: any, init?: any) {
      this.body = body;
      this.status = init?.status || 200;
    }
    json() { return Promise.resolve(this.body); }
    static json(data: any, init?: any) { return new MockNextResponse(data, init); }
  }
  return { __esModule: true, NextResponse: MockNextResponse, NextRequest: jest.fn() };
});

const mockUpdateLalamoveTracking = jest.fn().mockResolvedValue(undefined);
const mockUpdateOrderStatus = jest.fn().mockResolvedValue(undefined);
jest.mock("@/lib/firebase/orders", () => ({
  FirebaseOrdersService: {
    updateLalamoveTracking: (...args: any[]) => mockUpdateLalamoveTracking(...args),
    updateOrderStatus: (...args: any[]) => mockUpdateOrderStatus(...args),
  },
}));

const mockGetDocs = jest.fn();
jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: (...args: any[]) => mockGetDocs(...args),
}));

jest.mock("@/lib/firebase/config", () => ({
  firebaseApp: {},
}));

let POST: any, GET: any;

beforeAll(async () => {
  const mod = await import("@/app/api/lalamove/webhook/route");
  POST = mod.POST;
  GET = mod.GET;
});

beforeEach(() => {
  jest.clearAllMocks();
  process.env.LALAMOVE_HOST = "https://sandbox.lalamove.com";
  process.env.LALAMOVE_API_SECRET = "test-secret";
});

function createWebhookRequest(payload: any, headers: Record<string, string> = {}) {
  const body = JSON.stringify(payload);
  return {
    text: jest.fn().mockResolvedValue(body),
    headers: {
      get: jest.fn((name: string) => headers[name] || ""),
      entries: jest.fn(() => Object.entries(headers)),
    },
  } as any;
}

function mockFindOrder(orderId: string | null) {
  if (orderId) {
    mockGetDocs.mockResolvedValue({
      empty: false,
      docs: [{ id: orderId }],
    });
  } else {
    mockGetDocs.mockResolvedValue({ empty: true, docs: [] });
  }
}

describe("POST /api/lalamove/webhook", () => {
  it("should return 401 for invalid signature in production mode", async () => {
    process.env.LALAMOVE_HOST = "https://rest.lalamove.com";
    const payload = { event: "ORDER_STATUS_CHANGED", orderId: "LLM001", timestamp: "2026-01-01", data: { status: "PICKED_UP" } };
    const req = createWebhookRequest(payload, { "X-Lalamove-Signature": "invalid-sig" });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should return 401 for missing signature header in production mode", async () => {
    process.env.LALAMOVE_HOST = "https://rest.lalamove.com";
    const payload = { event: "ORDER_STATUS_CHANGED", orderId: "LLM001", timestamp: "2026-01-01", data: { status: "ON_GOING" } };
    const req = createWebhookRequest(payload);
    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.message).toContain("Missing signature");
  });

  it("should accept webhook in sandbox mode without signature", async () => {
    mockFindOrder("order-123");
    const payload = { event: "ORDER_STATUS_CHANGED", orderId: "LLM001", timestamp: "2026-01-01", data: { status: "PICKED_UP" } };
    const req = createWebhookRequest(payload);
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it("should handle ORDER_STATUS_CHANGED event", async () => {
    mockFindOrder("order-123");
    const payload = { event: "ORDER_STATUS_CHANGED", orderId: "LLM001", timestamp: "2026-01-01", data: { status: "ON_GOING" } };
    const req = createWebhookRequest(payload);
    await POST(req);
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith("order-123", expect.objectContaining({ status: "ON_GOING" }));
  });

  it("should handle DRIVER_ASSIGNED event", async () => {
    mockFindOrder("order-456");
    const payload = {
      event: "DRIVER_ASSIGNED", orderId: "LLM002", timestamp: "2026-01-01",
      data: { driver: { id: "d1", name: "Juan", phone: "+639001234567", plateNumber: "ABC 123", photo: "img.jpg" } },
    };
    const req = createWebhookRequest(payload);
    await POST(req);
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith("order-456", expect.objectContaining({
      status: "DRIVER_ASSIGNED",
      driver: expect.objectContaining({ id: "d1", name: "Juan" }),
    }));
  });

  it("should handle DRIVER_LOCATION_UPDATED event", async () => {
    mockFindOrder("order-789");
    const payload = {
      event: "DRIVER_LOCATION_UPDATED", orderId: "LLM003", timestamp: "2026-01-01",
      data: { coordinates: { lat: 14.5, lng: 121.0 }, driver: { id: "d1", name: "Juan", phone: "+639001234567", plateNumber: "ABC 123" } },
    };
    const req = createWebhookRequest(payload);
    await POST(req);
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith("order-789", expect.objectContaining({
      driver: expect.objectContaining({ coordinates: expect.objectContaining({ lat: 14.5, lng: 121.0 }) }),
    }));
  });

  it("should handle DRIVER_ARRIVED_AT_PICKUP event", async () => {
    mockFindOrder("order-111");
    const payload = { event: "DRIVER_ARRIVED_AT_PICKUP", orderId: "LLM004", timestamp: "2026-01-01", data: {} };
    const req = createWebhookRequest(payload);
    await POST(req);
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith("order-111", expect.objectContaining({ status: "ARRIVED_AT_PICKUP" }));
  });

  it("should handle DRIVER_PICKED_UP event and update order status", async () => {
    mockFindOrder("order-222");
    const payload = { event: "DRIVER_PICKED_UP", orderId: "LLM005", timestamp: "2026-01-01", data: { pickupTime: "2026-01-01T10:00:00Z", podImage: "pod.jpg" } };
    const req = createWebhookRequest(payload);
    await POST(req);
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith("order-222", expect.objectContaining({ status: "PICKED_UP" }));
    expect(mockUpdateOrderStatus).toHaveBeenCalledWith("order-222", "shipped", "lalamove-webhook", expect.any(String));
  });

  it("should handle DRIVER_ARRIVED_AT_DROPOFF event", async () => {
    mockFindOrder("order-333");
    const payload = { event: "DRIVER_ARRIVED_AT_DROPOFF", orderId: "LLM006", timestamp: "2026-01-01", data: {} };
    const req = createWebhookRequest(payload);
    await POST(req);
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith("order-333", expect.objectContaining({ status: "ARRIVED_AT_DROPOFF" }));
  });

  it("should handle ORDER_COMPLETED event and update order status to delivered", async () => {
    mockFindOrder("order-444");
    const payload = { event: "ORDER_COMPLETED", orderId: "LLM007", timestamp: "2026-01-01", data: { completionTime: "2026-01-01T12:00:00Z" } };
    const req = createWebhookRequest(payload);
    await POST(req);
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith("order-444", expect.objectContaining({ status: "COMPLETED" }));
    expect(mockUpdateOrderStatus).toHaveBeenCalledWith("order-444", "delivered", "lalamove-webhook", expect.any(String));
  });

  it("should handle ORDER_CANCELLED event without cancelling order", async () => {
    mockFindOrder("order-555");
    const payload = { event: "ORDER_CANCELLED", orderId: "LLM008", timestamp: "2026-01-01", data: { reason: "Driver cancelled", cancelledBy: "driver" } };
    const req = createWebhookRequest(payload);
    await POST(req);
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith("order-555", expect.objectContaining({ status: "CANCELLED" }));
    expect(mockUpdateOrderStatus).not.toHaveBeenCalled();
  });

  it("should skip update when Firestore order not found", async () => {
    mockFindOrder(null);
    const payload = { event: "ORDER_STATUS_CHANGED", orderId: "LLM-UNKNOWN", timestamp: "2026-01-01", data: { status: "ON_GOING" } };
    const req = createWebhookRequest(payload);
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUpdateLalamoveTracking).not.toHaveBeenCalled();
  });

  it("should handle unknown event type gracefully", async () => {
    const payload = { event: "UNKNOWN_EVENT", orderId: "LLM009", timestamp: "2026-01-01", data: {} };
    const req = createWebhookRequest(payload);
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it("should return 200 even on errors to prevent retries", async () => {
    const req = { text: jest.fn().mockResolvedValue("invalid-json{"), headers: { get: jest.fn().mockReturnValue(""), entries: jest.fn(() => []) } } as any;
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  // --- Null-order early-return paths for each handler ---

  it("should skip DRIVER_ASSIGNED update when Firestore order not found", async () => {
    mockFindOrder(null);
    const payload = {
      event: "DRIVER_ASSIGNED", orderId: "LLM-MISSING", timestamp: "2026-01-01",
      data: { driver: { id: "d1", name: "Juan", phone: "+639001234567", plateNumber: "ABC 123", photo: "img.jpg" } },
    };
    const req = createWebhookRequest(payload);
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUpdateLalamoveTracking).not.toHaveBeenCalled();
  });

  it("should skip DRIVER_LOCATION_UPDATED update when Firestore order not found", async () => {
    mockFindOrder(null);
    const payload = {
      event: "DRIVER_LOCATION_UPDATED", orderId: "LLM-MISSING", timestamp: "2026-01-01",
      data: { coordinates: { lat: 14.5, lng: 121.0 }, driver: { id: "d1", name: "Juan", phone: "+639001234567", plateNumber: "ABC 123" } },
    };
    const req = createWebhookRequest(payload);
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUpdateLalamoveTracking).not.toHaveBeenCalled();
  });

  it("should handle DRIVER_LOCATION_UPDATED with missing driver data (optional chaining)", async () => {
    mockFindOrder("order-opt");
    const payload = {
      event: "DRIVER_LOCATION_UPDATED", orderId: "LLM-OPT", timestamp: "2026-01-01",
      data: { coordinates: { lat: 14.5, lng: 121.0 } },
    };
    const req = createWebhookRequest(payload);
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith("order-opt", expect.objectContaining({
      driver: expect.objectContaining({ id: "", name: "", phone: "", plateNumber: "" }),
    }));
  });

  it("should skip DRIVER_ARRIVED_AT_PICKUP update when Firestore order not found", async () => {
    mockFindOrder(null);
    const payload = { event: "DRIVER_ARRIVED_AT_PICKUP", orderId: "LLM-MISSING", timestamp: "2026-01-01", data: {} };
    const req = createWebhookRequest(payload);
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUpdateLalamoveTracking).not.toHaveBeenCalled();
  });

  it("should skip DRIVER_PICKED_UP update when Firestore order not found", async () => {
    mockFindOrder(null);
    const payload = { event: "DRIVER_PICKED_UP", orderId: "LLM-MISSING", timestamp: "2026-01-01", data: { pickupTime: "2026-01-01T10:00:00Z" } };
    const req = createWebhookRequest(payload);
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUpdateLalamoveTracking).not.toHaveBeenCalled();
    expect(mockUpdateOrderStatus).not.toHaveBeenCalled();
  });

  it("should skip DRIVER_ARRIVED_AT_DROPOFF update when Firestore order not found", async () => {
    mockFindOrder(null);
    const payload = { event: "DRIVER_ARRIVED_AT_DROPOFF", orderId: "LLM-MISSING", timestamp: "2026-01-01", data: {} };
    const req = createWebhookRequest(payload);
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUpdateLalamoveTracking).not.toHaveBeenCalled();
  });

  it("should skip ORDER_COMPLETED update when Firestore order not found", async () => {
    mockFindOrder(null);
    const payload = { event: "ORDER_COMPLETED", orderId: "LLM-MISSING", timestamp: "2026-01-01", data: { completionTime: "2026-01-01T12:00:00Z" } };
    const req = createWebhookRequest(payload);
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUpdateLalamoveTracking).not.toHaveBeenCalled();
    expect(mockUpdateOrderStatus).not.toHaveBeenCalled();
  });

  it("should skip ORDER_CANCELLED update when Firestore order not found", async () => {
    mockFindOrder(null);
    const payload = { event: "ORDER_CANCELLED", orderId: "LLM-MISSING", timestamp: "2026-01-01", data: { reason: "No driver", cancelledBy: "system" } };
    const req = createWebhookRequest(payload);
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUpdateLalamoveTracking).not.toHaveBeenCalled();
  });

  it("should handle getDocs throwing an error in findOrderByLalamoveId", async () => {
    mockGetDocs.mockRejectedValue(new Error("Firestore unavailable"));
    const payload = { event: "ORDER_STATUS_CHANGED", orderId: "LLM-ERR", timestamp: "2026-01-01", data: { status: "ON_GOING" } };
    const req = createWebhookRequest(payload);
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUpdateLalamoveTracking).not.toHaveBeenCalled();
  });

  it("should accept valid HMAC signature in production mode", async () => {
    process.env.LALAMOVE_HOST = "https://rest.lalamove.com";
    process.env.LALAMOVE_API_SECRET = "prod-secret";
    mockFindOrder("order-prod");

    const payload = { event: "ORDER_STATUS_CHANGED", orderId: "LLM-PROD", timestamp: "2026-01-01", data: { status: "ON_GOING" } };
    const bodyStr = JSON.stringify(payload);
    const crypto = require("crypto");
    const validSig = crypto.createHmac("sha256", "prod-secret").update(bodyStr).digest("hex");

    const req = createWebhookRequest(payload, { "X-Lalamove-Signature": validSig });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith("order-prod", expect.objectContaining({ status: "ON_GOING" }));
  });
});

describe("GET /api/lalamove/webhook", () => {
  it("should return success message", async () => {
    const res = await GET();
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.message).toContain("active");
  });
});
