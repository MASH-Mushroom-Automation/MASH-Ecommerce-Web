/**
 * Tests for POST & GET /api/lalamove/chat/send
 * 
 * POST: SMS relay to driver (simulation mode)
 * GET: Chat history for an order
 */

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

// Helper: create POST request mock
function createPostReq(body: Record<string, unknown>) {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as any;
}

// Helper: create GET request mock with query params
function createGetReq(params: Record<string, string>) {
  const url = new URL("http://localhost:3000/api/lalamove/chat/send");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return {
    url: url.toString(),
    nextUrl: { searchParams: url.searchParams },
  } as any;
}

describe("POST /api/lalamove/chat/send", () => {
  let POST: (req: any) => Promise<any>;

  beforeAll(async () => {
    const mod = await import("@/app/api/lalamove/chat/send/route");
    POST = mod.POST;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 when orderId is missing", async () => {
    const req = createPostReq({
      message: "Hello",
      driverPhone: "+639123456789",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("required");
  });

  it("should return 400 when message is missing", async () => {
    const req = createPostReq({
      orderId: "LLM-123",
      driverPhone: "+639123456789",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 when driverPhone is missing", async () => {
    const req = createPostReq({
      orderId: "LLM-123",
      message: "Hello driver",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 when phone format is invalid (no +63 prefix)", async () => {
    const req = createPostReq({
      orderId: "LLM-123",
      message: "Hello",
      driverPhone: "09123456789",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("E.164");
  });

  it("should return 400 when phone format is invalid (too short)", async () => {
    const req = createPostReq({
      orderId: "LLM-123",
      message: "Hello",
      driverPhone: "+63912345",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("E.164");
  });

  it("should return 400 when phone format is invalid (wrong country code)", async () => {
    const req = createPostReq({
      orderId: "LLM-123",
      message: "Hello",
      driverPhone: "+11234567890",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 400 when message exceeds 160 characters", async () => {
    const req = createPostReq({
      orderId: "LLM-123",
      message: "A".repeat(161),
      driverPhone: "+639123456789",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("160 characters");
  });

  it("should accept message of exactly 160 characters", async () => {
    const req = createPostReq({
      orderId: "LLM-123",
      message: "A".repeat(160),
      driverPhone: "+639123456789",
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should send message successfully in simulation mode", async () => {
    const req = createPostReq({
      orderId: "LLM-123",
      message: "Hello, I am at the lobby",
      driverPhone: "+639123456789",
      customerName: "Juan Cruz",
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.messageId).toBeDefined();
    expect(res.body.data.messageId).toMatch(/^sim_/);
    expect(res.body.data.status).toBe("sent");
    expect(res.body.data.sentAt).toBeDefined();
    expect(res.body.data.message).toContain("simulated");
    expect(res.body.data.cost).toContain("simulation");
  });

  it("should use 'Customer' as default name when customerName is not provided", async () => {
    const req = createPostReq({
      orderId: "LLM-123",
      message: "Hello",
      driverPhone: "+639123456789",
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should return 500 when json parsing fails", async () => {
    const req = {
      json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
    } as any;
    const res = await POST(req);
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Invalid JSON");
  });
});

describe("GET /api/lalamove/chat/send", () => {
  let GET: (req: any) => Promise<any>;

  beforeAll(async () => {
    const mod = await import("@/app/api/lalamove/chat/send/route");
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
    expect(res.body.message).toContain("Order ID");
  });

  it("should return mock chat messages for valid orderId", async () => {
    const req = createGetReq({ orderId: "LLM-123" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderId).toBe("LLM-123");
    expect(res.body.data.messages).toBeDefined();
    expect(Array.isArray(res.body.data.messages)).toBe(true);
    expect(res.body.data.messages.length).toBe(3);
    expect(res.body.data.totalMessages).toBe(3);
    expect(res.body.data.note).toContain("Mock data");
  });

  it("should return messages with correct structure", async () => {
    const req = createGetReq({ orderId: "LLM-456" });
    const res = await GET(req);
    const messages = res.body.data.messages;
    
    // Check each message has required fields
    for (const msg of messages) {
      expect(msg.id).toBeDefined();
      expect(msg.orderId).toBe("LLM-456");
      expect(msg.sender).toBeDefined();
      expect(msg.message).toBeDefined();
      expect(msg.timestamp).toBeDefined();
      expect(msg.status).toBeDefined();
    }

    // Verify message senders include system, customer, and driver
    const senders = messages.map((m: any) => m.sender);
    expect(senders).toContain("system");
    expect(senders).toContain("customer");
    expect(senders).toContain("driver");
  });
});
