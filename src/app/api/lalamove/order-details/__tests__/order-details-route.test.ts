/**
 * Tests for GET /api/lalamove/order-details
 * 
 * Fetches latest delivery status from Lalamove API.
 * Focuses on branch coverage (error handling path).
 */

// Mock NextResponse
jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((body: any, init?: any) => ({
      json: () => Promise.resolve(body),
      status: init?.status || 200,
      body,
    })),
  },
}));

// Mock Lalamove client
const mockGetOrderDetails = jest.fn();

jest.mock("@/lib/lalamove/client", () => ({
  getLalamoveClient: () => ({
    getOrderDetails: mockGetOrderDetails,
  }),
}));

// Helper: create GET request mock with query params
function createGetReq(params: Record<string, string>) {
  const url = new URL("http://localhost:3000/api/lalamove/order-details");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return {
    url: url.toString(),
    nextUrl: { searchParams: url.searchParams },
  } as any;
}

describe("GET /api/lalamove/order-details", () => {
  let GET: (req: any) => Promise<any>;

  beforeAll(async () => {
    const mod = await import("@/app/api/lalamove/order-details/route");
    GET = mod.GET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 when orderId is missing", async () => {
    const req = createGetReq({});
    const res = await GET(req);
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Missing orderId");
  });

  it("should return order details successfully", async () => {
    mockGetOrderDetails.mockResolvedValue({
      orderId: "LLM-DET-123",
      status: "ON_GOING",
      driverId: "DRV-456",
      shareLink: "https://lalamove.com/share/LLM-DET-123",
      stops: [
        { coordinates: { lat: 14.5, lng: 121.0 }, address: "Pickup" },
        { coordinates: { lat: 14.6, lng: 121.1 }, address: "Delivery" },
      ],
    });

    const req = createGetReq({ orderId: "LLM-DET-123" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderId).toBe("LLM-DET-123");
    expect(res.body.data.status).toBe("ON_GOING");
    expect(res.body.data.driverId).toBe("DRV-456");
    expect(mockGetOrderDetails).toHaveBeenCalledWith("LLM-DET-123");
  });

  it("should return completed order details", async () => {
    mockGetOrderDetails.mockResolvedValue({
      orderId: "LLM-COMPLETE",
      status: "COMPLETED",
      driverId: "DRV-DONE",
    });

    const req = createGetReq({ orderId: "LLM-COMPLETE" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("COMPLETED");
  });

  it("should return 500 when getOrderDetails throws an Error", async () => {
    mockGetOrderDetails.mockRejectedValue(new Error("Order not found on Lalamove"));

    const req = createGetReq({ orderId: "LLM-MISSING" });
    const res = await GET(req);
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain("Order not found on Lalamove");
  });

  it("should return 500 with fallback message when error has no message", async () => {
    mockGetOrderDetails.mockRejectedValue({});

    const req = createGetReq({ orderId: "LLM-BLANK" });
    const res = await GET(req);
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain("Failed to fetch Lalamove order details");
  });

  it("should return 500 when network timeout occurs", async () => {
    mockGetOrderDetails.mockRejectedValue(new Error("ETIMEDOUT"));

    const req = createGetReq({ orderId: "LLM-TIMEOUT" });
    const res = await GET(req);
    expect(res.status).toBe(500);
    expect(res.body.error).toContain("ETIMEDOUT");
  });

  it("should handle assigning_driver status correctly", async () => {
    mockGetOrderDetails.mockResolvedValue({
      orderId: "LLM-ASSIGNING",
      status: "ASSIGNING_DRIVER",
      driverId: null,
    });

    const req = createGetReq({ orderId: "LLM-ASSIGNING" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("ASSIGNING_DRIVER");
    expect(res.body.data.driverId).toBeNull();
  });
});
