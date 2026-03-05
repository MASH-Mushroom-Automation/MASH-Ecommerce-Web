/**
 * Tests for POST /api/lalamove/priority
 * 
 * Adds priority fee (P50-P100) to a Lalamove order for faster driver assignment.
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
const mockAddPriorityFee = jest.fn();

jest.mock("@/lib/lalamove/client", () => ({
  getLalamoveClient: () => ({
    addPriorityFee: mockAddPriorityFee,
  }),
}));

// Helper
function createPostReq(body: Record<string, unknown>) {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as any;
}

describe("POST /api/lalamove/priority", () => {
  let POST: (req: any) => Promise<any>;

  beforeAll(async () => {
    const mod = await import("@/app/api/lalamove/priority/route");
    POST = mod.POST;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 when orderId is missing", async () => {
    const req = createPostReq({ priorityFee: 50 });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Order ID");
  });

  it("should return 400 when fee is below minimum (P50)", async () => {
    const req = createPostReq({ orderId: "LLM-123", priorityFee: "30" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("50");
    expect(res.body.message).toContain("100");
  });

  it("should return 400 when fee is above maximum (P100)", async () => {
    const req = createPostReq({ orderId: "LLM-123", priorityFee: "150" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("50");
    expect(res.body.message).toContain("100");
  });

  it("should return 400 when fee is not a number", async () => {
    const req = createPostReq({ orderId: "LLM-123", priorityFee: "abc" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should default fee to P50 when no fee provided", async () => {
    mockAddPriorityFee.mockResolvedValue({
      orderId: "LLM-DEFAULT",
      status: "ASSIGNING_DRIVER",
      priceBreakdown: {
        total: "200",
        priorityFee: "50",
        base: "150",
      },
    });

    const req = createPostReq({ orderId: "LLM-DEFAULT" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify addPriorityFee was called with default fee of "50"
    expect(mockAddPriorityFee).toHaveBeenCalledWith("LLM-DEFAULT", "50");
  });

  it("should add priority fee successfully with P75", async () => {
    mockAddPriorityFee.mockResolvedValue({
      orderId: "LLM-75",
      status: "ASSIGNING_DRIVER",
      priceBreakdown: {
        total: "225",
        priorityFee: "75",
        base: "150",
      },
    });

    const req = createPostReq({ orderId: "LLM-75", priorityFee: "75" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderId).toBe("LLM-75");
    expect(res.body.data.priceBreakdown.priorityFee).toBe("75");
    expect(res.body.data.message).toContain("+");
    expect(res.body.data.message).toContain("75");
  });

  it("should accept P50 (minimum boundary)", async () => {
    mockAddPriorityFee.mockResolvedValue({
      orderId: "LLM-MIN",
      status: "ASSIGNING_DRIVER",
      priceBreakdown: { total: "200", priorityFee: "50" },
    });

    const req = createPostReq({ orderId: "LLM-MIN", priorityFee: "50" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should accept P100 (maximum boundary)", async () => {
    mockAddPriorityFee.mockResolvedValue({
      orderId: "LLM-MAX",
      status: "ASSIGNING_DRIVER",
      priceBreakdown: { total: "250", priorityFee: "100" },
    });

    const req = createPostReq({ orderId: "LLM-MAX", priorityFee: "100" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should return 400 when driver is already assigned", async () => {
    mockAddPriorityFee.mockRejectedValue(
      new Error("Order already has a driver assigned")
    );

    const req = createPostReq({ orderId: "LLM-ASSIGNED", priorityFee: "50" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("driver already assigned");
  });

  it("should return 404 when order is not found", async () => {
    mockAddPriorityFee.mockRejectedValue(
      new Error("Order not found")
    );

    const req = createPostReq({ orderId: "LLM-NOTFOUND", priorityFee: "50" });
    const res = await POST(req);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("not found");
  });

  it("should return 500 for generic API errors", async () => {
    mockAddPriorityFee.mockRejectedValue(new Error("Internal Lalamove error"));

    const req = createPostReq({ orderId: "LLM-500", priorityFee: "50" });
    const res = await POST(req);
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Internal Lalamove error");
  });

  it("should return 500 with fallback when error has no message", async () => {
    mockAddPriorityFee.mockRejectedValue({});

    const req = createPostReq({ orderId: "LLM-EMPTY", priorityFee: "50" });
    const res = await POST(req);
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe("GET /api/lalamove/priority", () => {
  let GET: () => Promise<any>;

  beforeAll(async () => {
    const mod = await import("@/app/api/lalamove/priority/route");
    GET = mod.GET;
  });

  it("should return priority fee options", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.priorityFeeOptions).toHaveLength(3);
    expect(res.body.data.defaultFee).toBe("50");
    expect(res.body.data.minFee).toBe(50);
    expect(res.body.data.maxFee).toBe(100);
    expect(res.body.data.currency).toBe("PHP");
  });

  it("should include Express, Priority, and VIP options", async () => {
    const res = await GET();
    const options = res.body.data.priorityFeeOptions;
    const values = options.map((o: any) => o.value);
    expect(values).toEqual(["50", "75", "100"]);
    expect(options[0].label).toContain("Express");
    expect(options[1].label).toContain("Priority");
    expect(options[2].label).toContain("VIP");
  });
});
