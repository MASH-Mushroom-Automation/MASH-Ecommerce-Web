/**
 * Tests for POST /api/orders/approve route
 */

// Mock Firebase modules
const mockApproveOrder = jest.fn();
const mockGetDoc = jest.fn();
const mockDoc = jest.fn(() => "mock-doc-ref");

jest.mock("@/lib/firebase/orders", () => ({
  FirebaseOrdersService: {
    approveOrder: (...args: unknown[]) => mockApproveOrder(...args),
  },
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(() => "mock-db"),
  doc: (...args: unknown[]) => mockDoc(...args),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
}));

jest.mock("@/lib/firebase/config", () => ({
  firebaseApp: "mock-app",
}));

// Mock next/server to avoid Request polyfill conflicts
jest.mock("next/server", () => {
  class MockNextRequest {
    private _body: string;
    nextUrl: { origin: string };
    constructor(url: string, init?: { method?: string; body?: string }) {
      this._body = init?.body || "{}";
      this.nextUrl = { origin: new URL(url).origin };
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

// Import after mocks
import { POST } from "../route";
import { NextRequest } from "next/server";

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost:3000/api/orders/approve", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/orders/approve", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: approveOrder succeeds, order exists but not lalamove
    mockApproveOrder.mockResolvedValue(undefined);
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ deliveryMethod: "standard" }),
    });
  });

  it("should return 400 when orderId is missing", async () => {
    const req = makeRequest({ sellerId: "seller-1" });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.message).toContain("orderId and sellerId are required");
  });

  it("should return 400 when sellerId is missing", async () => {
    const req = makeRequest({ orderId: "order-1" });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it("should approve order successfully for non-lalamove delivery", async () => {
    const req = makeRequest({ orderId: "order-1", sellerId: "seller-1" });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.message).toBe("Order approved");
    expect(mockApproveOrder).toHaveBeenCalledWith("order-1", "seller-1");
  });

  it("should handle order not found after approval", async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => false,
      data: () => null,
    });

    const req = makeRequest({ orderId: "order-1", sellerId: "seller-1" });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.message).toContain("could not read order");
  });

  it("should auto-create Lalamove delivery when deliveryMethod is lalamove", async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        deliveryMethod: "lalamove",
        lalamoveQuotationId: "quot-123",
        userName: "Test User",
        userPhone: "+639170001111",
      }),
    });

    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ orderId: "lala-order-456" }),
    } as Response);

    const req = makeRequest({ orderId: "order-1", sellerId: "seller-1" });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.lalamoveOrderId).toBe("lala-order-456");
    expect(json.message).toContain("Lalamove delivery created");
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/api/lalamove/create-order"),
      expect.objectContaining({ method: "POST" })
    );

    fetchSpy.mockRestore();
  });

  it("should handle Lalamove delivery creation failure gracefully", async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        deliveryMethod: "lalamove",
        lalamoveQuotationId: "quot-123",
      }),
    });

    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: "Quotation expired" }),
    } as Response);

    const req = makeRequest({ orderId: "order-1", sellerId: "seller-1" });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.message).toContain("delivery creation failed");
    expect(json.deliveryError).toBe("Quotation expired");

    fetchSpy.mockRestore();
  });

  it("should handle network error during Lalamove creation", async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        deliveryMethod: "lalamove",
        lalamoveQuotationId: "quot-123",
      }),
    });

    const fetchSpy = jest.spyOn(global, "fetch").mockRejectedValue(new Error("Network error"));

    const req = makeRequest({ orderId: "order-1", sellerId: "seller-1" });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.deliveryError).toBe("Network error");

    fetchSpy.mockRestore();
  });

  it("should skip Lalamove creation if lalamoveOrderId already exists", async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        deliveryMethod: "lalamove",
        lalamoveQuotationId: "quot-123",
        lalamoveOrderId: "already-exists",
      }),
    });

    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({} as Response);

    const req = makeRequest({ orderId: "order-1", sellerId: "seller-1" });
    const res = await POST(req);
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.message).toBe("Order approved");
    expect(fetchSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
  });

  it("should return 500 when approveOrder throws", async () => {
    mockApproveOrder.mockRejectedValue(new Error("Firestore write failed"));

    const req = makeRequest({ orderId: "order-1", sellerId: "seller-1" });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.message).toBe("Firestore write failed");
  });

  it("should include recipient info from delivery address", async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        deliveryMethod: "lalamove",
        lalamoveQuotationId: "quot-789",
        deliveryAddress: {
          name: "Maria Cruz",
          phone: "+639180001234",
          notes: "Gate 2",
        },
      }),
    });

    let capturedBody: string | undefined;
    const savedFetch = global.fetch;
    global.fetch = jest.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      capturedBody = init?.body as string;
      return { ok: true, json: () => Promise.resolve({ orderId: "lala-999" }) } as Response;
    });

    const req = makeRequest({ orderId: "order-1", sellerId: "seller-1" });
    await POST(req);

    expect(capturedBody).toBeDefined();
    const body = JSON.parse(capturedBody!);
    expect(body.recipient.name).toBe("Maria Cruz");
    expect(body.recipient.phone).toBe("+639180001234");
    expect(body.recipient.notes).toBe("Gate 2");

    global.fetch = savedFetch;
  });
});
