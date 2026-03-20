/**
 * Tests for Lalamove Sandbox Simulate Route
 * LAMA-009: Validates production guard, event validation, and Firestore writes
 */

// ─── Mock FirebaseOrdersService ────────────────────────────────
const mockUpdateLalamoveTracking = jest.fn().mockResolvedValue(undefined);

jest.mock("@/lib/firebase/orders", () => ({
  FirebaseOrdersService: {
    updateLalamoveTracking: (...args: unknown[]) =>
      mockUpdateLalamoveTracking(...args),
  },
}));

// ─── Mock NextRequest and NextResponse ─────────────────────────

jest.mock("next/server", () => {
  class MockNextRequest {
    private _body: string;
    constructor(_url: string, init?: { method?: string; body?: string }) {
      this._body = init?.body || "{}";
    }
    async json() {
      return JSON.parse(this._body);
    }
  }

  class MockNextResponse {
    body: unknown;
    status: number;
    constructor(body: unknown, init?: { status?: number }) {
      this.body = body;
      this.status = init?.status || 200;
    }
    async json() {
      return this.body;
    }
    static json(data: unknown, init?: { status?: number }) {
      return new MockNextResponse(data, init);
    }
  }

  return {
    __esModule: true,
    NextResponse: MockNextResponse,
    NextRequest: MockNextRequest,
  };
});

// ─── Import route after mocks ──────────────────────────────────
import { POST } from "../route";
import { NextRequest } from "next/server";

// ─── Helpers ───────────────────────────────────────────────────

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest(
    "http://localhost:3000/api/lalamove/sandbox-simulate",
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
}

// ─── Tests ─────────────────────────────────────────────────────

describe("POST /api/lalamove/sandbox-simulate", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, LALAMOVE_HOST: "https://rest.sandbox.lalamove.com" };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  // ── Production Guard ──────────────────────────────────────

  it("returns 403 when LALAMOVE_HOST is production", async () => {
    process.env.LALAMOVE_HOST = "https://rest.lalamove.com";

    const res = await POST(makeRequest({ orderId: "o-1", event: "COMPLETED" }));
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.success).toBe(false);
    expect(json.message).toContain("sandbox");
  });

  it("returns 403 when LALAMOVE_HOST is empty", async () => {
    process.env.LALAMOVE_HOST = "";

    const res = await POST(makeRequest({ orderId: "o-1", event: "COMPLETED" }));
    expect(res.status).toBe(403);
  });

  // ── Validation ────────────────────────────────────────────

  it("returns 400 when orderId is missing", async () => {
    const res = await POST(makeRequest({ event: "COMPLETED" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it("returns 400 when event is missing", async () => {
    const res = await POST(makeRequest({ orderId: "o-1" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it("returns 400 for invalid event type", async () => {
    const res = await POST(
      makeRequest({ orderId: "o-1", event: "INVALID_EVENT" })
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.message).toContain("Invalid event");
  });

  // ── Successful Events ─────────────────────────────────────

  it("handles ASSIGNING_DRIVER event", async () => {
    const res = await POST(
      makeRequest({ orderId: "o-1", event: "ASSIGNING_DRIVER" })
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.event).toBe("ASSIGNING_DRIVER");
    expect(json.orderId).toBe("o-1");
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith(
      "o-1",
      expect.objectContaining({ status: "ASSIGNING_DRIVER" })
    );
  });

  it("handles DRIVER_ASSIGNED event with mock driver data", async () => {
    const res = await POST(
      makeRequest({ orderId: "o-1", event: "DRIVER_ASSIGNED" })
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith(
      "o-1",
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

  it("keeps simulator payload event-specific by including driver only for in-transit events", async () => {
    await POST(makeRequest({ orderId: "o-shape-1", event: "DRIVER_ASSIGNED" }));
    await POST(makeRequest({ orderId: "o-shape-1", event: "PICKED_UP" }));

    const assignedPayload = mockUpdateLalamoveTracking.mock.calls[0][1] as Record<string, unknown>;
    const pickedUpPayload = mockUpdateLalamoveTracking.mock.calls[1][1] as Record<string, unknown>;

    expect(assignedPayload.driver).toEqual(
      expect.objectContaining({
        id: "sandbox-driver-001",
        name: "John Doe (Sandbox)",
      })
    );
    expect(pickedUpPayload.driver).toEqual(
      expect.objectContaining({
        id: "sandbox-driver-001",
        name: "John Doe (Sandbox)",
      })
    );
  });

  it("handles PICKED_UP event with updated coordinates", async () => {
    const res = await POST(
      makeRequest({ orderId: "o-1", event: "PICKED_UP" })
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith(
      "o-1",
      expect.objectContaining({ status: "PICKED_UP" })
    );
  });

  it("handles COMPLETED event", async () => {
    const res = await POST(
      makeRequest({ orderId: "o-1", event: "COMPLETED" })
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.updatedAt).toBeDefined();
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith(
      "o-1",
      expect.objectContaining({ status: "COMPLETED" })
    );
  });

  it("handles CANCELED event", async () => {
    const res = await POST(
      makeRequest({ orderId: "o-1", event: "CANCELED" })
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith(
      "o-1",
      expect.objectContaining({ status: "CANCELED" })
    );
  });

  it("writes minimum event-specific payload contracts for all simulator events", async () => {
    const orderId = "o-contract-matrix-1";
    const matrix: Array<{
      event: "ASSIGNING_DRIVER" | "DRIVER_ASSIGNED" | "PICKED_UP" | "COMPLETED" | "CANCELED";
      expectedStatus: string;
      expectsDriver: boolean;
    }> = [
      { event: "ASSIGNING_DRIVER", expectedStatus: "ASSIGNING_DRIVER", expectsDriver: false },
      { event: "DRIVER_ASSIGNED", expectedStatus: "ON_GOING", expectsDriver: true },
      { event: "PICKED_UP", expectedStatus: "PICKED_UP", expectsDriver: true },
      { event: "COMPLETED", expectedStatus: "COMPLETED", expectsDriver: false },
      { event: "CANCELED", expectedStatus: "CANCELED", expectsDriver: false },
    ];

    for (const row of matrix) {
      const res = await POST(makeRequest({ orderId, event: row.event }));
      expect(res.status).toBe(200);
    }

    const payloads = mockUpdateLalamoveTracking.mock.calls.map(
      (call) => call[1] as Record<string, unknown>
    );

    matrix.forEach((row, index) => {
      const payload = payloads[index];
      expect(payload).toEqual(
        expect.objectContaining({
          status: row.expectedStatus,
          lastUpdated: expect.any(Date),
        })
      );
      if (row.expectsDriver) {
        expect(payload.driver).toEqual(
          expect.objectContaining({
            id: "sandbox-driver-001",
            name: "John Doe (Sandbox)",
          })
        );
      } else {
        expect(payload.driver).toBeUndefined();
      }
    });
  });

  it("does not include driver payload for terminal events COMPLETED and CANCELED", async () => {
    await POST(makeRequest({ orderId: "o-shape-2", event: "COMPLETED" }));
    await POST(makeRequest({ orderId: "o-shape-2", event: "CANCELED" }));

    const completedPayload = mockUpdateLalamoveTracking.mock.calls[0][1] as Record<string, unknown>;
    const canceledPayload = mockUpdateLalamoveTracking.mock.calls[1][1] as Record<string, unknown>;

    expect(completedPayload.status).toBe("COMPLETED");
    expect(canceledPayload.status).toBe("CANCELED");
    expect(completedPayload.driver).toBeUndefined();
    expect(canceledPayload.driver).toBeUndefined();
  });

  it("handles full lifecycle progression on the same orderId", async () => {
    const orderId = "o-seq-1";

    await POST(makeRequest({ orderId, event: "ASSIGNING_DRIVER" }));
    await POST(makeRequest({ orderId, event: "DRIVER_ASSIGNED" }));
    await POST(makeRequest({ orderId, event: "PICKED_UP" }));
    await POST(makeRequest({ orderId, event: "COMPLETED" }));

    expect(mockUpdateLalamoveTracking).toHaveBeenNthCalledWith(
      1,
      orderId,
      expect.objectContaining({ status: "ASSIGNING_DRIVER" })
    );
    expect(mockUpdateLalamoveTracking).toHaveBeenNthCalledWith(
      2,
      orderId,
      expect.objectContaining({ status: "ON_GOING" })
    );
    expect(mockUpdateLalamoveTracking).toHaveBeenNthCalledWith(
      3,
      orderId,
      expect.objectContaining({ status: "PICKED_UP" })
    );
    expect(mockUpdateLalamoveTracking).toHaveBeenNthCalledWith(
      4,
      orderId,
      expect.objectContaining({ status: "COMPLETED" })
    );
  });

  it("keeps canceled branch isolated from completed status side effects", async () => {
    const orderId = "o-cancel-iso-1";
    await POST(makeRequest({ orderId, event: "CANCELED" }));

    expect(mockUpdateLalamoveTracking).toHaveBeenCalledTimes(1);
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith(
      orderId,
      expect.objectContaining({ status: "CANCELED" })
    );

    const statuses = mockUpdateLalamoveTracking.mock.calls.map(
      (call) => (call[1] as Record<string, unknown>).status
    );
    expect(statuses).not.toContain("COMPLETED");
    expect(statuses).not.toContain("PICKED_UP");
  });

  // ── Error handling ────────────────────────────────────────

  it("returns 500 when updateLalamoveTracking throws", async () => {
    mockUpdateLalamoveTracking.mockRejectedValueOnce(
      new Error("Firestore offline")
    );

    const res = await POST(
      makeRequest({ orderId: "o-1", event: "COMPLETED" })
    );
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.message).toBe("Firestore offline");
  });

  it("returns deterministic 500 envelope on transient DRIVER_ASSIGNED write failure", async () => {
    mockUpdateLalamoveTracking.mockRejectedValueOnce(new Error("Transient firestore write failure"));

    const res = await POST(makeRequest({ orderId: "o-transient-1", event: "DRIVER_ASSIGNED" }));
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json).toEqual({ success: false, message: "Transient firestore write failure" });
  });

  it("keeps invalid and missing-event payloads on a consistent error envelope shape", async () => {
    const missingEventRes = await POST(makeRequest({ orderId: "o-envelope-1" }));
    const invalidEventRes = await POST(makeRequest({ orderId: "o-envelope-1", event: "NOT_VALID" }));

    const missingEventJson = await missingEventRes.json();
    const invalidEventJson = await invalidEventRes.json();

    expect(missingEventRes.status).toBe(400);
    expect(invalidEventRes.status).toBe(400);

    expect(missingEventJson).toEqual(expect.objectContaining({ success: false, message: expect.any(String) }));
    expect(invalidEventJson).toEqual(expect.objectContaining({ success: false, message: expect.any(String) }));

    expect(Object.keys(missingEventJson).sort()).toEqual(["message", "success"]);
    expect(Object.keys(invalidEventJson).sort()).toEqual(["message", "success"]);
  });

  it("keeps repeated ASSIGNING_DRIVER and repeated CANCELED payloads idempotent without driver leakage", async () => {
    const orderId = "o-idempotent-shape-1";

    await POST(makeRequest({ orderId, event: "ASSIGNING_DRIVER" }));
    await POST(makeRequest({ orderId, event: "ASSIGNING_DRIVER" }));
    await POST(makeRequest({ orderId, event: "CANCELED" }));
    await POST(makeRequest({ orderId, event: "CANCELED" }));

    const payloads = mockUpdateLalamoveTracking.mock.calls.map((call) => call[1] as Record<string, unknown>);
    expect(payloads).toHaveLength(4);

    expect(payloads[0]).toEqual(expect.objectContaining({ status: "ASSIGNING_DRIVER", lastUpdated: expect.any(Date) }));
    expect(payloads[1]).toEqual(expect.objectContaining({ status: "ASSIGNING_DRIVER", lastUpdated: expect.any(Date) }));
    expect(payloads[2]).toEqual(expect.objectContaining({ status: "CANCELED", lastUpdated: expect.any(Date) }));
    expect(payloads[3]).toEqual(expect.objectContaining({ status: "CANCELED", lastUpdated: expect.any(Date) }));

    payloads.forEach((payload) => {
      expect(payload.driver).toBeUndefined();
    });
  });

  it("returns deterministic 500 envelope on transient PICKED_UP write failure", async () => {
    mockUpdateLalamoveTracking.mockRejectedValueOnce(new Error("Transient picked-up write failure"));

    const res = await POST(makeRequest({ orderId: "o-transient-2", event: "PICKED_UP" }));
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json).toEqual({ success: false, message: "Transient picked-up write failure" });
  });
});
