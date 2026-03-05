/**
 * Tests for GET /api/lalamove/driver
 * 
 * Fetches driver details by first getting order details (to get driverId),
 * then fetching driver details.
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
const mockGetDriverDetails = jest.fn();

jest.mock("@/lib/lalamove/client", () => ({
  getLalamoveClient: () => ({
    getOrderDetails: mockGetOrderDetails,
    getDriverDetails: mockGetDriverDetails,
  }),
}));

// Helper: create GET request mock with query params
function createGetReq(params: Record<string, string>) {
  const url = new URL("http://localhost:3000/api/lalamove/driver");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return {
    url: url.toString(),
    nextUrl: { searchParams: url.searchParams },
  } as any;
}

describe("GET /api/lalamove/driver", () => {
  let GET: (req: any) => Promise<any>;

  beforeAll(async () => {
    const mod = await import("@/app/api/lalamove/driver/route");
    GET = mod.GET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 when orderId is missing", async () => {
    const req = createGetReq({});
    const res = await GET(req);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("orderId");
  });

  it("should return 404 when no driver is assigned yet", async () => {
    mockGetOrderDetails.mockResolvedValue({
      orderId: "LLM-123",
      status: "ASSIGNING_DRIVER",
      driverId: null,
    });

    const req = createGetReq({ orderId: "LLM-123" });
    const res = await GET(req);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("No driver assigned");
  });

  it("should return 404 when driverId is empty string", async () => {
    mockGetOrderDetails.mockResolvedValue({
      orderId: "LLM-123",
      status: "ASSIGNING_DRIVER",
      driverId: "",
    });

    const req = createGetReq({ orderId: "LLM-123" });
    const res = await GET(req);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("should return driver details when driver is assigned", async () => {
    mockGetOrderDetails.mockResolvedValue({
      orderId: "LLM-456",
      status: "ON_GOING",
      driverId: "DRV-789",
    });
    mockGetDriverDetails.mockResolvedValue({
      name: "Juan Driver",
      phone: "+639123456789",
      plateNumber: "ABC-1234",
      photo: "https://example.com/photo.jpg",
      coordinates: { lat: 14.5, lng: 121.0 },
    });

    const req = createGetReq({ orderId: "LLM-456" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Juan Driver");
    expect(res.body.data.phone).toBe("+639123456789");
    expect(res.body.data.plateNumber).toBe("ABC-1234");

    // Verify correct API calls
    expect(mockGetOrderDetails).toHaveBeenCalledWith("LLM-456");
    expect(mockGetDriverDetails).toHaveBeenCalledWith("LLM-456", "DRV-789");
  });

  it("should return 500 when getOrderDetails throws", async () => {
    mockGetOrderDetails.mockRejectedValue(new Error("Order not found on Lalamove"));

    const req = createGetReq({ orderId: "LLM-NOTFOUND" });
    const res = await GET(req);
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Failed to fetch driver details");
    expect(res.body.error).toContain("Order not found on Lalamove");
  });

  it("should return 500 when getDriverDetails throws", async () => {
    mockGetOrderDetails.mockResolvedValue({
      orderId: "LLM-ERR",
      driverId: "DRV-ERR",
    });
    mockGetDriverDetails.mockRejectedValue(new Error("Driver API unavailable"));

    const req = createGetReq({ orderId: "LLM-ERR" });
    const res = await GET(req);
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain("Driver API unavailable");
  });

  it("should handle non-Error thrown objects gracefully", async () => {
    mockGetOrderDetails.mockRejectedValue("string error");

    const req = createGetReq({ orderId: "LLM-STR" });
    const res = await GET(req);
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Failed to fetch driver details");
    expect(res.body.error).toBe("Unknown error");
  });
});
