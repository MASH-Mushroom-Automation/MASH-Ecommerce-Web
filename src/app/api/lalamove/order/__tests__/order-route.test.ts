/**
 * Tests for POST/GET/DELETE /api/lalamove/order
 * Covers: validation, phone format, order placement, get details, cancel
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

const mockPlaceOrder = jest.fn();
const mockGetOrderDetails = jest.fn();
const mockCancelOrder = jest.fn();
jest.mock("@/lib/lalamove/client", () => ({
  getLalamoveClient: () => ({
    placeOrder: (...args: any[]) => mockPlaceOrder(...args),
    getOrderDetails: (...args: any[]) => mockGetOrderDetails(...args),
    cancelOrder: (...args: any[]) => mockCancelOrder(...args),
  }),
}));

let POST: any, GET: any, DELETE: any;

beforeAll(async () => {
  const mod = await import("@/app/api/lalamove/order/route");
  POST = mod.POST;
  GET = mod.GET;
  DELETE = mod.DELETE;
});

beforeEach(() => {
  jest.clearAllMocks();
});

function createRequest(options: { body?: any; searchParams?: Record<string, string>; method?: string } = {}) {
  const url = new URL("http://localhost/api/lalamove/order");
  if (options.searchParams) {
    Object.entries(options.searchParams).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return {
    method: options.method || "POST",
    json: jest.fn().mockResolvedValue(options.body || {}),
    nextUrl: { searchParams: url.searchParams },
    headers: { get: jest.fn().mockReturnValue("") },
  } as any;
}

describe("POST /api/lalamove/order", () => {
  const validBody = {
    quotationId: "quot-1",
    senderStopId: "stop-1",
    senderName: "MASH",
    senderPhone: "+639661692000",
    recipientStopId: "stop-2",
    recipientName: "John Doe",
    recipientPhone: "+639123456789",
    orderNumber: "MASH-20260101-001",
  };

  it("should return 400 when missing quotationId", async () => {
    const res = await POST(createRequest({ body: { ...validBody, quotationId: undefined } }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toContain("quotationId");
  });

  it("should return 400 when missing recipientStopId", async () => {
    const res = await POST(createRequest({ body: { ...validBody, recipientStopId: undefined } }));
    expect(res.status).toBe(400);
  });

  it("should return 400 when missing recipientName", async () => {
    const res = await POST(createRequest({ body: { ...validBody, recipientName: undefined } }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toContain("customer info");
  });

  it("should return 400 for invalid phone format", async () => {
    const res = await POST(createRequest({ body: { ...validBody, recipientPhone: "09123456789" } }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toContain("E.164");
  });

  it("should return 400 for phone without country code", async () => {
    const res = await POST(createRequest({ body: { ...validBody, recipientPhone: "1234567890" } }));
    expect(res.status).toBe(400);
  });

  it("should place order successfully", async () => {
    mockPlaceOrder.mockResolvedValue({
      orderId: "LLM-001",
      status: "ASSIGNING_DRIVER",
      driverId: null,
      shareLink: "https://lalamove.com/track/LLM-001",
      priceBreakdown: { total: "150" },
    });
    const res = await POST(createRequest({ body: validBody }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.orderId).toBe("LLM-001");
    expect(json.data.shareLink).toBeDefined();
  });

  it("should include COD payment in order", async () => {
    mockPlaceOrder.mockResolvedValue({ orderId: "LLM-002", status: "ASSIGNING_DRIVER" });
    const body = { ...validBody, payment: { method: "CASH", amount: 500 } };
    const res = await POST(createRequest({ body }));
    expect(res.status).toBe(200);
    expect(mockPlaceOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        recipients: expect.arrayContaining([
          expect.objectContaining({ payment: expect.objectContaining({ method: "CASH" }) }),
        ]),
      }),
    );
  });

  it("should use defaults for optional sender fields", async () => {
    mockPlaceOrder.mockResolvedValue({ orderId: "LLM-003", status: "ASSIGNING_DRIVER" });
    const body = { ...validBody, senderName: undefined, senderPhone: undefined };
    const res = await POST(createRequest({ body }));
    expect(res.status).toBe(200);
    expect(mockPlaceOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        sender: expect.objectContaining({ name: "MASH E-Commerce" }),
      }),
    );
  });

  it("should return 500 on placeOrder failure", async () => {
    mockPlaceOrder.mockRejectedValue(new Error("Lalamove API error"));
    const res = await POST(createRequest({ body: validBody }));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.message).toContain("Lalamove API error");
  });
});

describe("GET /api/lalamove/order", () => {
  it("should return 400 when no orderId", async () => {
    const res = await GET(createRequest({ searchParams: {} }));
    expect(res.status).toBe(400);
  });

  it("should return order details", async () => {
    mockGetOrderDetails.mockResolvedValue({ orderId: "LLM-001", status: "PICKED_UP" });
    const res = await GET(createRequest({ searchParams: { orderId: "LLM-001" } }));
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.status).toBe("PICKED_UP");
  });

  it("should return 500 on API failure", async () => {
    mockGetOrderDetails.mockRejectedValue(new Error("Not found"));
    const res = await GET(createRequest({ searchParams: { orderId: "LLM-BAD" } }));
    expect(res.status).toBe(500);
  });
});

describe("DELETE /api/lalamove/order", () => {
  it("should return 400 when no orderId", async () => {
    const res = await DELETE(createRequest({ searchParams: {} }));
    expect(res.status).toBe(400);
  });

  it("should cancel order successfully", async () => {
    mockCancelOrder.mockResolvedValue(undefined);
    const res = await DELETE(createRequest({ searchParams: { orderId: "LLM-001" } }));
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.message).toContain("cancelled");
  });

  it("should return 500 on cancel failure", async () => {
    mockCancelOrder.mockRejectedValue(new Error("Cannot cancel"));
    const res = await DELETE(createRequest({ searchParams: { orderId: "LLM-001" } }));
    expect(res.status).toBe(500);
  });
});
