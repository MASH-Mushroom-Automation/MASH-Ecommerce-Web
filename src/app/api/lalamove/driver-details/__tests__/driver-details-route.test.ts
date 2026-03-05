/**
 * Tests for GET /api/lalamove/driver-details
 * 
 * Fetches driver details directly using orderId + driverId.
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
const mockGetDriverDetails = jest.fn();

jest.mock("@/lib/lalamove/client", () => ({
  getLalamoveClient: () => ({
    getDriverDetails: mockGetDriverDetails,
  }),
}));

// Helper: create GET request mock with query params
function createGetReq(params: Record<string, string>) {
  const url = new URL("http://localhost:3000/api/lalamove/driver-details");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return {
    url: url.toString(),
    nextUrl: { searchParams: url.searchParams },
  } as any;
}

describe("GET /api/lalamove/driver-details", () => {
  let GET: (req: any) => Promise<any>;

  beforeAll(async () => {
    const mod = await import("@/app/api/lalamove/driver-details/route");
    GET = mod.GET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 when orderId is missing", async () => {
    const req = createGetReq({ driverId: "DRV-123" });
    const res = await GET(req);
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Missing");
  });

  it("should return 400 when driverId is missing", async () => {
    const req = createGetReq({ orderId: "LLM-123" });
    const res = await GET(req);
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Missing");
  });

  it("should return 400 when both params are missing", async () => {
    const req = createGetReq({});
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("should return driver details successfully", async () => {
    mockGetDriverDetails.mockResolvedValue({
      name: "Maria Driver",
      phone: "+639987654321",
      plateNumber: "XYZ-9876",
      photo: "https://example.com/maria.jpg",
      coordinates: { lat: 14.55, lng: 121.02 },
    });

    const req = createGetReq({ orderId: "LLM-456", driverId: "DRV-789" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Maria Driver");
    expect(res.body.data.plateNumber).toBe("XYZ-9876");
    expect(res.body.data.coordinates).toEqual({ lat: 14.55, lng: 121.02 });

    // Verify correct API call
    expect(mockGetDriverDetails).toHaveBeenCalledWith("LLM-456", "DRV-789");
  });

  it("should return driver without coordinates when not available", async () => {
    mockGetDriverDetails.mockResolvedValue({
      name: "Pedro Driver",
      phone: "+639111222333",
      plateNumber: "DEF-4567",
      coordinates: null,
    });

    const req = createGetReq({ orderId: "LLM-NC", driverId: "DRV-NC" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.coordinates).toBeNull();
  });

  it("should return 500 when getDriverDetails throws an error", async () => {
    mockGetDriverDetails.mockRejectedValue(new Error("Lalamove API error"));

    const req = createGetReq({ orderId: "LLM-ERR", driverId: "DRV-ERR" });
    const res = await GET(req);
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain("Lalamove API error");
  });

  it("should return 500 with fallback message when error has no message", async () => {
    mockGetDriverDetails.mockRejectedValue({});

    const req = createGetReq({ orderId: "LLM-BLANK", driverId: "DRV-BLANK" });
    const res = await GET(req);
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain("Failed to fetch driver details");
  });
});
