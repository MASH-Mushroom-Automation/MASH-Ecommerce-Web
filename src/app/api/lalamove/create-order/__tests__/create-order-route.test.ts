/**
 * Tests for POST /api/lalamove/create-order
 * 
 * Creates a Lalamove delivery order from quotation and updates Firestore.
 * Tests cover: validation, success flow, Firestore updates, error handling.
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
const mockGetQuotationDetails = jest.fn();
const mockPlaceOrder = jest.fn();

jest.mock("@/lib/lalamove/client", () => ({
  getLalamoveClient: () => ({
    getQuotationDetails: mockGetQuotationDetails,
    placeOrder: mockPlaceOrder,
  }),
}));

// Mock Firebase orders service
const mockUpdateLalamoveTracking = jest.fn().mockResolvedValue(undefined);
const mockSetLalamoveOrderId = jest.fn().mockResolvedValue(undefined);

jest.mock("@/lib/firebase/orders", () => ({
  FirebaseOrdersService: {
    updateLalamoveTracking: (...args: any[]) => mockUpdateLalamoveTracking(...args),
    setLalamoveOrderId: (...args: any[]) => mockSetLalamoveOrderId(...args),
  },
}));

// Helper
function createPostReq(body: Record<string, unknown>) {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as any;
}

describe("POST /api/lalamove/create-order", () => {
  let POST: (req: any) => Promise<any>;

  beforeAll(async () => {
    const mod = await import("@/app/api/lalamove/create-order/route");
    POST = mod.POST;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 when orderId is missing", async () => {
    const req = createPostReq({
      quotationId: "Q-123",
      sender: { name: "S", phone: "+63" },
      recipient: { name: "R", phone: "+63" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Missing required fields");
  });

  it("should return 400 when quotationId is missing", async () => {
    const req = createPostReq({
      orderId: "ORD-123",
      sender: { name: "S", phone: "+63" },
      recipient: { name: "R", phone: "+63" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 400 when sender is missing", async () => {
    const req = createPostReq({
      orderId: "ORD-123",
      quotationId: "Q-123",
      recipient: { name: "R", phone: "+63" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 400 when recipient is missing", async () => {
    const req = createPostReq({
      orderId: "ORD-123",
      quotationId: "Q-123",
      sender: { name: "S", phone: "+63" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 400 when quotation has no stops", async () => {
    mockGetQuotationDetails.mockResolvedValue({ stops: [] });

    const req = createPostReq({
      orderId: "ORD-123",
      quotationId: "Q-123",
      sender: { name: "Farm A", phone: "+639123456789" },
      recipient: { name: "Customer B", phone: "+639987654321" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Invalid quotation");
    expect(res.body.message).toContain("missing stops");
  });

  it("should return 400 when quotation has only one stop", async () => {
    mockGetQuotationDetails.mockResolvedValue({
      stops: [{ stopId: "stop-1" }],
    });

    const req = createPostReq({
      orderId: "ORD-123",
      quotationId: "Q-123",
      sender: { name: "Farm A", phone: "+639123456789" },
      recipient: { name: "Customer B", phone: "+639987654321" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Invalid quotation");
  });

  it("should return 400 when quotation is null", async () => {
    mockGetQuotationDetails.mockResolvedValue(null);

    const req = createPostReq({
      orderId: "ORD-123",
      quotationId: "Q-NULL",
      sender: { name: "Farm A", phone: "+639123456789" },
      recipient: { name: "Customer B", phone: "+639987654321" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should create order successfully and update Firestore", async () => {
    mockGetQuotationDetails.mockResolvedValue({
      stops: [
        { stopId: "stop-pickup" },
        { stopId: "stop-delivery" },
      ],
    });
    mockPlaceOrder.mockResolvedValue({
      orderId: "LLM-ORDER-999",
      status: "ASSIGNING_DRIVER",
      shareLink: "https://lalamove.com/share/LLM-ORDER-999",
      driverId: null,
    });

    const req = createPostReq({
      orderId: "ORD-FIRE-123",
      quotationId: "Q-VALID",
      sender: { name: "Farm A", phone: "+639123456789" },
      recipient: { name: "Customer B", phone: "+639987654321", notes: "Gate 2" },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.lalamoveOrderId).toBe("LLM-ORDER-999");
    expect(res.body.data.status).toBe("ASSIGNING_DRIVER");
    expect(res.body.data.shareLink).toBeDefined();

    // Verify Firestore updates
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith(
      "ORD-FIRE-123",
      expect.objectContaining({ status: "ASSIGNING_DRIVER" })
    );
    expect(mockSetLalamoveOrderId).toHaveBeenCalledWith(
      "ORD-FIRE-123",
      "LLM-ORDER-999",
      "https://lalamove.com/share/LLM-ORDER-999"
    );
  });

  it("should include driver info when driverId is available", async () => {
    mockGetQuotationDetails.mockResolvedValue({
      stops: [{ stopId: "s1" }, { stopId: "s2" }],
    });
    mockPlaceOrder.mockResolvedValue({
      orderId: "LLM-DRIVER",
      status: "ON_GOING",
      shareLink: "https://share.lalamove.com/LLM-DRIVER",
      driverId: "DRV-555",
    });

    const req = createPostReq({
      orderId: "ORD-DRV",
      quotationId: "Q-DRV",
      sender: { name: "S", phone: "+639111111111" },
      recipient: { name: "R", phone: "+639222222222" },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.body.data.driverId).toBe("DRV-555");

    // Verify tracking includes driver info
    expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith(
      "ORD-DRV",
      expect.objectContaining({
        driver: expect.objectContaining({ id: "DRV-555" }),
      })
    );
  });

  it("should pass recipient notes as remarks", async () => {
    mockGetQuotationDetails.mockResolvedValue({
      stops: [{ stopId: "s1" }, { stopId: "s2" }],
    });
    mockPlaceOrder.mockResolvedValue({
      orderId: "LLM-NOTES",
      status: "ASSIGNING_DRIVER",
      shareLink: "",
      driverId: null,
    });

    const req = createPostReq({
      orderId: "ORD-NOTES",
      quotationId: "Q-NOTES",
      sender: { name: "S", phone: "+639111111111" },
      recipient: { name: "R", phone: "+639222222222", notes: "Leave at door" },
    });

    await POST(req);

    // Verify placeOrder was called with notes as remarks
    expect(mockPlaceOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        recipients: [
          expect.objectContaining({ remarks: "Leave at door" }),
        ],
      })
    );
  });

  it("should use empty string for remarks when no notes provided", async () => {
    mockGetQuotationDetails.mockResolvedValue({
      stops: [{ stopId: "s1" }, { stopId: "s2" }],
    });
    mockPlaceOrder.mockResolvedValue({
      orderId: "LLM-NO-NOTES",
      status: "ASSIGNING_DRIVER",
      shareLink: "",
      driverId: null,
    });

    const req = createPostReq({
      orderId: "ORD-NO-NOTES",
      quotationId: "Q-NO-NOTES",
      sender: { name: "S", phone: "+639111111111" },
      recipient: { name: "R", phone: "+639222222222" },
    });

    await POST(req);

    expect(mockPlaceOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        recipients: [expect.objectContaining({ remarks: "" })],
      })
    );
  });

  it("should return 400 for quotation-related errors", async () => {
    mockGetQuotationDetails.mockRejectedValue(new Error("Invalid quotation: expired"));

    const req = createPostReq({
      orderId: "ORD-EXP",
      quotationId: "Q-EXPIRED",
      sender: { name: "S", phone: "+639111111111" },
      recipient: { name: "R", phone: "+639222222222" },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("quotation");
  });

  it("should return 400 for service area errors", async () => {
    mockGetQuotationDetails.mockResolvedValue({
      stops: [{ stopId: "s1" }, { stopId: "s2" }],
    });
    mockPlaceOrder.mockRejectedValue(new Error("Service area not supported"));

    const req = createPostReq({
      orderId: "ORD-AREA",
      quotationId: "Q-AREA",
      sender: { name: "S", phone: "+639111111111" },
      recipient: { name: "R", phone: "+639222222222" },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("service area");
  });

  it("should return 400 for phone-related errors", async () => {
    mockGetQuotationDetails.mockResolvedValue({
      stops: [{ stopId: "s1" }, { stopId: "s2" }],
    });
    mockPlaceOrder.mockRejectedValue(new Error("Invalid phone number"));

    const req = createPostReq({
      orderId: "ORD-PHONE",
      quotationId: "Q-PHONE",
      sender: { name: "S", phone: "invalid" },
      recipient: { name: "R", phone: "+639222222222" },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("phone");
  });

  it("should return 500 for generic errors", async () => {
    mockGetQuotationDetails.mockResolvedValue({
      stops: [{ stopId: "s1" }, { stopId: "s2" }],
    });
    mockPlaceOrder.mockRejectedValue(new Error("Internal server failure"));

    const req = createPostReq({
      orderId: "ORD-500",
      quotationId: "Q-500",
      sender: { name: "S", phone: "+639111111111" },
      recipient: { name: "R", phone: "+639222222222" },
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    expect(res.body.error).toContain("failed");
  });

  it("should return 500 with fallback message when error has no message", async () => {
    mockGetQuotationDetails.mockResolvedValue({
      stops: [{ stopId: "s1" }, { stopId: "s2" }],
    });
    mockPlaceOrder.mockRejectedValue({});

    const req = createPostReq({
      orderId: "ORD-BLANK",
      quotationId: "Q-BLANK",
      sender: { name: "S", phone: "+639111111111" },
      recipient: { name: "R", phone: "+639222222222" },
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});
