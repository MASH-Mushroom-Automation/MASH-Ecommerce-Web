/**
 * Tests for POST & GET /api/lalamove/chat/send
 * 
 * POST: SMS relay to driver (simulation mode)
 * GET: Chat history for an order
 */

jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((body: unknown, init?: { status?: number }) => ({
      json: () => Promise.resolve(body),
      status: init?.status || 200,
      body,
    })),
  },
}));

const mockAddDoc = jest.fn().mockResolvedValue({ id: "mock-id" });
const mockGetDocs = jest.fn();

class MockTimestamp {
  private value: Date;

  constructor(value?: Date) {
    this.value = value ?? new Date("2026-03-19T00:00:00.000Z");
  }

  toDate() {
    return this.value;
  }

  static now() {
    return new MockTimestamp(new Date("2026-03-19T00:00:00.000Z"));
  }
}

jest.mock("@/lib/firebase/config", () => ({
  firebaseApp: {},
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(() => "chatMessagesRef"),
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  orderBy: jest.fn(() => "orderByTimestamp"),
  query: jest.fn(() => "chatQuery"),
  Timestamp: MockTimestamp,
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
  let POST: (req: unknown) => Promise<{ status: number; body: Record<string, unknown> }>;

  beforeAll(async () => {
    const mod = await import("@/app/api/lalamove/chat/send/route");
    POST = mod.POST;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockAddDoc.mockResolvedValue({ id: "mock-id" });
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
    expect(res.body.data.messageId).toBe("mock-id");
    expect(res.body.data.status).toBe("sent");
    expect(res.body.data.sentAt).toBeDefined();
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
  let GET: (req: unknown) => Promise<{ status: number; body: Record<string, unknown> }>;

  beforeAll(async () => {
    const mod = await import("@/app/api/lalamove/chat/send/route");
    GET = mod.GET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDocs.mockResolvedValue({ docs: [] });
  });

  it("should return 400 when orderId is missing", async () => {
    const req = createGetReq({});
    const res = await GET(req);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Order ID");
  });

  it("should return chat messages for valid orderId", async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        {
          id: "m1",
          data: () => ({
            sender: "system",
            message: "Preparing delivery",
            timestamp: new MockTimestamp(new Date("2026-03-19T00:00:00.000Z")),
            status: "sent",
          }),
        },
        {
          id: "m2",
          data: () => ({
            sender: "customer",
            message: "I am near the gate",
            timestamp: new MockTimestamp(new Date("2026-03-19T00:05:00.000Z")),
            status: "sent",
          }),
        },
        {
          id: "m3",
          data: () => ({
            sender: "driver",
            message: "Arriving in 2 mins",
            timestamp: new MockTimestamp(new Date("2026-03-19T00:06:00.000Z")),
            status: "sent",
          }),
        },
      ],
    });

    const req = createGetReq({ orderId: "LLM-123" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderId).toBe("LLM-123");
    expect(res.body.data.messages).toBeDefined();
    expect(Array.isArray(res.body.data.messages)).toBe(true);
    expect(res.body.data.messages.length).toBe(3);
    expect(res.body.data.totalMessages).toBe(3);
  });

  it("should return messages with correct structure", async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        {
          id: "m1",
          data: () => ({
            sender: "system",
            message: "Ready",
            timestamp: new MockTimestamp(new Date("2026-03-19T01:00:00.000Z")),
            status: "sent",
          }),
        },
        {
          id: "m2",
          data: () => ({
            sender: "customer",
            message: "Ok",
            timestamp: new MockTimestamp(new Date("2026-03-19T01:01:00.000Z")),
            status: "sent",
          }),
        },
        {
          id: "m3",
          data: () => ({
            sender: "driver",
            message: "ETA 1 min",
            timestamp: new MockTimestamp(new Date("2026-03-19T01:02:00.000Z")),
            status: "sent",
          }),
        },
      ],
    });

    const req = createGetReq({ orderId: "LLM-456" });
    const res = await GET(req);
    const messages = res.body.data.messages as Array<Record<string, unknown>>;
    
    // Check each message has required fields
    for (const msg of messages) {
      expect(msg.id).toBeDefined();
      expect(msg.sender).toBeDefined();
      expect(msg.message).toBeDefined();
      expect(msg.timestamp).toBeDefined();
      expect(msg.status).toBeDefined();
    }

    // Verify message senders include system, customer, and driver
    const senders = messages.map((m) => m.sender);
    expect(senders).toContain("system");
    expect(senders).toContain("customer");
    expect(senders).toContain("driver");
  });
});
