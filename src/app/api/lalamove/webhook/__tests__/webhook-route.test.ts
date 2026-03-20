/**
 * Tests for POST/GET /api/lalamove/webhook
 * Covers: timing-safe signature verification, body size limit,
 *         malformed JSON, all webhook event types, Firestore order lookup
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
  process.env.LALAMOVE_HOST = "https://rest.sandbox.lalamove.com";
  process.env.LALAMOVE_API_SECRET = "test-secret";
});

/** Helper: compute valid HMAC sig for a given body string + secret */
function computeSignature(body: string, secret: string = "test-secret"): string {
  const crypto = require("crypto");
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

/** Helper: build a signed webhook request */
function createSignedRequest(payload: any, secret?: string) {
  const body = JSON.stringify(payload);
  const sig = computeSignature(body, secret);
  return {
    text: jest.fn().mockResolvedValue(body),
    headers: {
      get: jest.fn((name: string) => (name === "X-Lalamove-Signature" ? sig : "")),
      entries: jest.fn(() => [["X-Lalamove-Signature", sig]]),
    },
  } as any;
}

/** Helper: build an unsigned or custom-header webhook request */
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

/** Helper: build a raw-text webhook request */
function createRawRequest(rawBody: string, headers: Record<string, string> = {}) {
  return {
    text: jest.fn().mockResolvedValue(rawBody),
    headers: {
      get: jest.fn((name: string) => headers[name] || ""),
      entries: jest.fn(() => Object.entries(headers)),
    },
  } as any;
}

function mockFindOrder(orderId: string | null) {
  if (orderId) {
    mockGetDocs.mockResolvedValue({ empty: false, docs: [{ id: orderId }] });
  } else {
    mockGetDocs.mockResolvedValue({ empty: true, docs: [] });
  }
}

describe("POST /api/lalamove/webhook — Signature Verification", () => {
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

  it("should return 401 for missing signature header in sandbox mode", async () => {
    const payload = { event: "ORDER_STATUS_CHANGED", orderId: "LLM001", timestamp: "2026-01-01", data: { status: "ON_GOING" } };
    const req = createWebhookRequest(payload);
    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.message).toContain("Missing signature");
  });

  it("should return 401 for invalid signature in sandbox mode", async () => {
    const payload = { event: "ORDER_STATUS_CHANGED", orderId: "LLM001", timestamp: "2026-01-01", data: { status: "ON_GOING" } };
    const req = createWebhookRequest(payload, { "X-Lalamove-Signature": "bad-sig" });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should accept valid HMAC signature in sandbox mode", async () => {
    mockFindOrder("order-123");
    const payload = { event: "ORDER_STATUS_CHANGED", orderId: "LLM001", timestamp: "2026-01-01", data: { status: "PICKED_UP" } };
    const req = createSignedRequest(payload);
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it("should accept valid HMAC signature in production mode", async () => {
    process.env.LALAMOVE_HOST = "https://rest.lalamove.com";
    process.env.LALAMOVE_API_SECRET = "prod-secret";
    mockFindOrder("order-prod");
    const payload = { event: "ORDER_STATUS_CHANGED", orderId: "LLM-PROD", timestamp: "2026-01-01", data: { status: "ON_GOING" } };
    const req = createSignedRequest(payload, "prod-secret");
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith("order-prod", expect.objectContaining({ status: "ON_GOING" }));
  });
});

describe("POST /api/lalamove/webhook — Body Validation", () => {
  it("should return 413 when body exceeds 1 MB", async () => {
    const bigBody = "x".repeat(1024 * 1024 + 1);
    const sig = computeSignature(bigBody);
    const req = createRawRequest(bigBody, { "X-Lalamove-Signature": sig });
    const res = await POST(req);
    expect(res.status).toBe(413);
    const json = await res.json();
    expect(json.message).toContain("too large");
  });

  it("should return 400 for malformed JSON body", async () => {
    const rawBody = "not-valid-json{{{";
    const sig = computeSignature(rawBody);
    const req = createRawRequest(rawBody, { "X-Lalamove-Signature": sig });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toContain("Malformed JSON");
  });
});

describe("POST /api/lalamove/webhook — Event Handlers", () => {
  it("should handle ORDER_STATUS_CHANGED event", async () => {
    mockFindOrder("order-123");
    const payload = { event: "ORDER_STATUS_CHANGED", orderId: "LLM001", timestamp: "2026-01-01", data: { status: "ON_GOING" } };
    const req = createSignedRequest(payload);
    await POST(req);
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith("order-123", expect.objectContaining({ status: "ON_GOING" }));
  });

  it("should handle DRIVER_ASSIGNED event", async () => {
    mockFindOrder("order-456");
    const payload = {
      event: "DRIVER_ASSIGNED", orderId: "LLM002", timestamp: "2026-01-01",
      data: { driver: { id: "d1", name: "Juan", phone: "+639001234567", plateNumber: "ABC 123", photo: "img.jpg" } },
    };
    const req = createSignedRequest(payload);
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
    const req = createSignedRequest(payload);
    await POST(req);
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith("order-789", expect.objectContaining({
      driver: expect.objectContaining({ coordinates: expect.objectContaining({ lat: 14.5, lng: 121.0 }) }),
    }));
  });

  it("should handle DRIVER_ARRIVED_AT_PICKUP event", async () => {
    mockFindOrder("order-111");
    const payload = { event: "DRIVER_ARRIVED_AT_PICKUP", orderId: "LLM004", timestamp: "2026-01-01", data: {} };
    const req = createSignedRequest(payload);
    await POST(req);
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith("order-111", expect.objectContaining({ status: "ARRIVED_AT_PICKUP" }));
  });

  it("should handle DRIVER_PICKED_UP event and update order status", async () => {
    mockFindOrder("order-222");
    const payload = { event: "DRIVER_PICKED_UP", orderId: "LLM005", timestamp: "2026-01-01", data: { pickupTime: "2026-01-01T10:00:00Z", podImage: "pod.jpg" } };
    const req = createSignedRequest(payload);
    await POST(req);
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith("order-222", expect.objectContaining({ status: "PICKED_UP" }));
    expect(mockUpdateOrderStatus).toHaveBeenCalledWith("order-222", "shipped", "lalamove-webhook", expect.any(String));
  });

  it("should handle DRIVER_ARRIVED_AT_DROPOFF event", async () => {
    mockFindOrder("order-333");
    const payload = { event: "DRIVER_ARRIVED_AT_DROPOFF", orderId: "LLM006", timestamp: "2026-01-01", data: {} };
    const req = createSignedRequest(payload);
    await POST(req);
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith("order-333", expect.objectContaining({ status: "ARRIVED_AT_DROPOFF" }));
  });

  it("should handle ORDER_COMPLETED event and update order status to delivered", async () => {
    mockFindOrder("order-444");
    const payload = { event: "ORDER_COMPLETED", orderId: "LLM007", timestamp: "2026-01-01", data: { completionTime: "2026-01-01T12:00:00Z" } };
    const req = createSignedRequest(payload);
    await POST(req);
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith("order-444", expect.objectContaining({ status: "COMPLETED" }));
    expect(mockUpdateOrderStatus).toHaveBeenCalledWith("order-444", "delivered", "lalamove-webhook", expect.any(String));
  });

  it("should handle ORDER_CANCELLED event without cancelling order", async () => {
    mockFindOrder("order-555");
    const payload = { event: "ORDER_CANCELLED", orderId: "LLM008", timestamp: "2026-01-01", data: { reason: "Driver cancelled", cancelledBy: "driver" } };
    const req = createSignedRequest(payload);
    await POST(req);
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith("order-555", expect.objectContaining({ status: "CANCELLED" }));
    expect(mockUpdateOrderStatus).not.toHaveBeenCalled();
  });

  it("should handle unknown event type gracefully (return 200)", async () => {
    const payload = { event: "UNKNOWN_EVENT", orderId: "LLM009", timestamp: "2026-01-01", data: {} };
    const req = createSignedRequest(payload);
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});

describe("POST /api/lalamove/webhook — Order Not Found Paths", () => {
  it("should skip ORDER_STATUS_CHANGED update when Firestore order not found", async () => {
    mockFindOrder(null);
    const payload = { event: "ORDER_STATUS_CHANGED", orderId: "LLM-UNKNOWN", timestamp: "2026-01-01", data: { status: "ON_GOING" } };
    const req = createSignedRequest(payload);
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUpdateLalamoveTracking).not.toHaveBeenCalled();
  });

  it("should skip DRIVER_ASSIGNED update when order not found", async () => {
    mockFindOrder(null);
    const payload = {
      event: "DRIVER_ASSIGNED", orderId: "LLM-MISSING", timestamp: "2026-01-01",
      data: { driver: { id: "d1", name: "Juan", phone: "+639001234567", plateNumber: "ABC 123", photo: "img.jpg" } },
    };
    const req = createSignedRequest(payload);
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUpdateLalamoveTracking).not.toHaveBeenCalled();
  });

  it("should skip DRIVER_LOCATION_UPDATED update when order not found", async () => {
    mockFindOrder(null);
    const payload = {
      event: "DRIVER_LOCATION_UPDATED", orderId: "LLM-MISSING", timestamp: "2026-01-01",
      data: { coordinates: { lat: 14.5, lng: 121.0 }, driver: { id: "d1", name: "Juan", phone: "+639001234567", plateNumber: "ABC 123" } },
    };
    const req = createSignedRequest(payload);
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUpdateLalamoveTracking).not.toHaveBeenCalled();
  });

  it("should handle DRIVER_LOCATION_UPDATED with missing driver data", async () => {
    mockFindOrder("order-opt");
    const payload = {
      event: "DRIVER_LOCATION_UPDATED", orderId: "LLM-OPT", timestamp: "2026-01-01",
      data: { coordinates: { lat: 14.5, lng: 121.0 } },
    };
    const req = createSignedRequest(payload);
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith("order-opt", expect.objectContaining({
      driver: expect.objectContaining({ id: "", name: "", phone: "", plateNumber: "" }),
    }));
  });

  it("should skip DRIVER_ARRIVED_AT_PICKUP when order not found", async () => {
    mockFindOrder(null);
    const payload = { event: "DRIVER_ARRIVED_AT_PICKUP", orderId: "LLM-MISSING", timestamp: "2026-01-01", data: {} };
    const req = createSignedRequest(payload);
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUpdateLalamoveTracking).not.toHaveBeenCalled();
  });

  it("should skip DRIVER_PICKED_UP update when Firestore order not found", async () => {
    mockFindOrder(null);
    const payload = { event: "DRIVER_PICKED_UP", orderId: "LLM-MISSING", timestamp: "2026-01-01", data: { pickupTime: "2026-01-01T10:00:00Z" } };
    const req = createSignedRequest(payload);
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUpdateLalamoveTracking).not.toHaveBeenCalled();
    expect(mockUpdateOrderStatus).not.toHaveBeenCalled();
  });

  it("should skip DRIVER_ARRIVED_AT_DROPOFF update when Firestore order not found", async () => {
    mockFindOrder(null);
    const payload = { event: "DRIVER_ARRIVED_AT_DROPOFF", orderId: "LLM-MISSING", timestamp: "2026-01-01", data: {} };
    const req = createSignedRequest(payload);
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUpdateLalamoveTracking).not.toHaveBeenCalled();
  });

  it("should skip ORDER_COMPLETED update when Firestore order not found", async () => {
    mockFindOrder(null);
    const payload = { event: "ORDER_COMPLETED", orderId: "LLM-MISSING", timestamp: "2026-01-01", data: { completionTime: "2026-01-01T12:00:00Z" } };
    const req = createSignedRequest(payload);
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUpdateLalamoveTracking).not.toHaveBeenCalled();
    expect(mockUpdateOrderStatus).not.toHaveBeenCalled();
  });

  it("should skip ORDER_CANCELLED update when Firestore order not found", async () => {
    mockFindOrder(null);
    const payload = { event: "ORDER_CANCELLED", orderId: "LLM-MISSING", timestamp: "2026-01-01", data: { reason: "No driver", cancelledBy: "system" } };
    const req = createSignedRequest(payload);
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUpdateLalamoveTracking).not.toHaveBeenCalled();
  });

  it("should handle getDocs throwing an error in findOrderByLalamoveId", async () => {
    mockGetDocs.mockRejectedValue(new Error("Firestore unavailable"));
    const payload = { event: "ORDER_STATUS_CHANGED", orderId: "LLM-ERR", timestamp: "2026-01-01", data: { status: "ON_GOING" } };
    const req = createSignedRequest(payload);
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUpdateLalamoveTracking).not.toHaveBeenCalled();
  });

});

describe("POST /api/lalamove/webhook — Lifecycle Contract Assertions", () => {
  it("should emit expected tracking status progression contract", async () => {
    mockFindOrder("order-flow-contract");

    const statusChangedReq = createSignedRequest({
      event: "ORDER_STATUS_CHANGED",
      orderId: "LLM-FLOW-1",
      timestamp: "2026-01-01",
      data: { status: "ON_GOING" },
    });

    const pickedUpReq = createSignedRequest({
      event: "DRIVER_PICKED_UP",
      orderId: "LLM-FLOW-1",
      timestamp: "2026-01-01",
      data: { pickupTime: "2026-01-01T10:00:00Z" },
    });

    const completedReq = createSignedRequest({
      event: "ORDER_COMPLETED",
      orderId: "LLM-FLOW-1",
      timestamp: "2026-01-01",
      data: { completionTime: "2026-01-01T12:00:00Z" },
    });

    await POST(statusChangedReq);
    await POST(pickedUpReq);
    await POST(completedReq);

    expect(mockUpdateLalamoveTracking).toHaveBeenNthCalledWith(
      1,
      "order-flow-contract",
      expect.objectContaining({ status: "ON_GOING", lastUpdated: expect.any(Date) })
    );
    expect(mockUpdateLalamoveTracking).toHaveBeenNthCalledWith(
      2,
      "order-flow-contract",
      expect.objectContaining({ status: "PICKED_UP", lastUpdated: expect.any(Date) })
    );
    expect(mockUpdateLalamoveTracking).toHaveBeenNthCalledWith(
      3,
      "order-flow-contract",
      expect.objectContaining({ status: "COMPLETED", lastUpdated: expect.any(Date) })
    );

    const payloads = mockUpdateLalamoveTracking.mock.calls.map((call) => call[1]);
    expect(payloads.every((p: Record<string, unknown>) => !("timeline" in p))).toBe(true);
  });

  it("should preserve driver identity across repeated DRIVER_LOCATION_UPDATED events", async () => {
    mockFindOrder("order-location-contract");

    const firstReq = createSignedRequest({
      event: "DRIVER_LOCATION_UPDATED",
      orderId: "LLM-LOC-1",
      timestamp: "2026-01-01",
      data: {
        coordinates: { lat: 14.55, lng: 120.99 },
        driver: { id: "drv-1", name: "Juan", phone: "+639171111111", plateNumber: "ABC 123" },
      },
    });

    const secondReq = createSignedRequest({
      event: "DRIVER_LOCATION_UPDATED",
      orderId: "LLM-LOC-1",
      timestamp: "2026-01-01",
      data: {
        coordinates: { lat: 14.56, lng: 121.01 },
        driver: { id: "drv-1", name: "Juan", phone: "+639171111111", plateNumber: "ABC 123" },
      },
    });

    await POST(firstReq);
    await POST(secondReq);

    expect(mockUpdateLalamoveTracking).toHaveBeenNthCalledWith(
      1,
      "order-location-contract",
      expect.objectContaining({
        driver: expect.objectContaining({
          id: "drv-1",
          name: "Juan",
          phone: "+639171111111",
          plateNumber: "ABC 123",
          coordinates: expect.objectContaining({ lat: 14.55, lng: 120.99 }),
        }),
      })
    );

    expect(mockUpdateLalamoveTracking).toHaveBeenNthCalledWith(
      2,
      "order-location-contract",
      expect.objectContaining({
        driver: expect.objectContaining({
          id: "drv-1",
          name: "Juan",
          phone: "+639171111111",
          plateNumber: "ABC 123",
          coordinates: expect.objectContaining({ lat: 14.56, lng: 121.01 }),
        }),
      })
    );
  });
});

describe("POST /api/lalamove/webhook — Replay and Out-of-Order Assertions", () => {
  it("replays duplicate DRIVER_PICKED_UP events with stable payload contract", async () => {
    mockFindOrder("order-replay-picked-up");

    const payload = {
      event: "DRIVER_PICKED_UP",
      orderId: "LLM-REPLAY-PU-1",
      timestamp: "2026-01-01",
      data: { pickupTime: "2026-01-01T10:00:00Z", podImage: "pod-1.jpg" },
    };

    await POST(createSignedRequest(payload));
    await POST(createSignedRequest(payload));

    expect(mockUpdateLalamoveTracking).toHaveBeenNthCalledWith(
      1,
      "order-replay-picked-up",
      expect.objectContaining({ status: "PICKED_UP" })
    );
    expect(mockUpdateLalamoveTracking).toHaveBeenNthCalledWith(
      2,
      "order-replay-picked-up",
      expect.objectContaining({ status: "PICKED_UP" })
    );
    expect(mockUpdateOrderStatus).toHaveBeenCalledTimes(2);
    expect(mockUpdateOrderStatus).toHaveBeenNthCalledWith(
      1,
      "order-replay-picked-up",
      "shipped",
      "lalamove-webhook",
      expect.any(String)
    );
    expect(mockUpdateOrderStatus).toHaveBeenNthCalledWith(
      2,
      "order-replay-picked-up",
      "shipped",
      "lalamove-webhook",
      expect.any(String)
    );
  });

  it("replays duplicate ORDER_COMPLETED events with stable terminal payload contract", async () => {
    mockFindOrder("order-replay-completed");

    const payload = {
      event: "ORDER_COMPLETED",
      orderId: "LLM-REPLAY-COMP-1",
      timestamp: "2026-01-01",
      data: { completionTime: "2026-01-01T12:00:00Z", signature: "sig-a" },
    };

    await POST(createSignedRequest(payload));
    await POST(createSignedRequest(payload));

    expect(mockUpdateLalamoveTracking).toHaveBeenNthCalledWith(
      1,
      "order-replay-completed",
      expect.objectContaining({ status: "COMPLETED" })
    );
    expect(mockUpdateLalamoveTracking).toHaveBeenNthCalledWith(
      2,
      "order-replay-completed",
      expect.objectContaining({ status: "COMPLETED" })
    );
    expect(mockUpdateOrderStatus).toHaveBeenCalledTimes(2);
    expect(mockUpdateOrderStatus).toHaveBeenNthCalledWith(
      1,
      "order-replay-completed",
      "delivered",
      "lalamove-webhook",
      expect.any(String)
    );
    expect(mockUpdateOrderStatus).toHaveBeenNthCalledWith(
      2,
      "order-replay-completed",
      "delivered",
      "lalamove-webhook",
      expect.any(String)
    );
  });

  it("handles out-of-order COMPLETED then PICKED_UP by preserving per-event contracts", async () => {
    mockFindOrder("order-out-of-order-1");

    const completedPayload = {
      event: "ORDER_COMPLETED",
      orderId: "LLM-OOO-1",
      timestamp: "2026-01-01",
      data: { completionTime: "2026-01-01T12:00:00Z" },
    };
    const pickedUpPayload = {
      event: "DRIVER_PICKED_UP",
      orderId: "LLM-OOO-1",
      timestamp: "2026-01-01",
      data: { pickupTime: "2026-01-01T10:00:00Z" },
    };

    await POST(createSignedRequest(completedPayload));
    await POST(createSignedRequest(pickedUpPayload));

    expect(mockUpdateLalamoveTracking).toHaveBeenNthCalledWith(
      1,
      "order-out-of-order-1",
      expect.objectContaining({ status: "COMPLETED" })
    );
    expect(mockUpdateLalamoveTracking).toHaveBeenNthCalledWith(
      2,
      "order-out-of-order-1",
      expect.objectContaining({ status: "PICKED_UP" })
    );
    expect(mockUpdateOrderStatus).toHaveBeenNthCalledWith(
      1,
      "order-out-of-order-1",
      "delivered",
      "lalamove-webhook",
      expect.any(String)
    );
    expect(mockUpdateOrderStatus).toHaveBeenNthCalledWith(
      2,
      "order-out-of-order-1",
      "shipped",
      "lalamove-webhook",
      expect.any(String)
    );
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
