/**
 * Tests for Email Send API route
 * Batch 7: Coverage improvement for POST/GET /api/email/send
 */

// Mock next/server
jest.mock("next/server", () => {
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
  return { __esModule: true, NextResponse: MockNextResponse, NextRequest: jest.fn() };
});

// Mock email lib
const mockSendEmail = jest.fn();
const mockIsEmailConfigured = jest.fn();
const mockVerifyConnection = jest.fn();

jest.mock("@/lib/email", () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
  isEmailConfigured: () => mockIsEmailConfigured(),
  verifyConnection: () => mockVerifyConnection(),
  GMAIL_CONFIG: { user: "test@gmail.com", host: "smtp.gmail.com", port: 587 },
}));

function createReq(body: unknown) {
  return { json: jest.fn().mockResolvedValue(body) };
}

describe("POST /api/email/send", () => {
  let POST: (req: unknown) => Promise<{ status: number; json: () => Promise<Record<string, unknown>> }>;

  beforeAll(async () => {
    const mod = await import("@/app/api/email/send/route");
    POST = mod.POST as typeof POST;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockSendEmail.mockResolvedValue({ success: true, messageId: "email-123" });
  });

  it("should return 400 for missing required fields", async () => {
    const req = createReq({ to: "test@example.com" }); // missing type and data
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Missing required fields");
  });

  it("should return 400 for missing to field", async () => {
    const req = createReq({ type: "order_confirmation", data: { customerName: "John", orderNumber: "123" } });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 400 for invalid email type", async () => {
    const req = createReq({
      to: "test@example.com",
      type: "invalid_type",
      data: { customerName: "John", orderNumber: "123" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Invalid email type");
  });

  it("should return 400 for missing data fields", async () => {
    const req = createReq({
      to: "test@example.com",
      type: "order_confirmation",
      data: { customerName: "John" }, // missing orderNumber
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Missing required data fields");
  });

  it("should send email successfully for order_confirmation", async () => {
    const req = createReq({
      to: "customer@example.com",
      type: "order_confirmation",
      data: { customerName: "John", orderNumber: "#12345" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.messageId).toBe("email-123");
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "customer@example.com", type: "order_confirmation" })
    );
  });

  it("should handle all valid email types", async () => {
    const types = ["order_confirmation", "order_approved", "order_rejected", "order_shipped", "order_delivered", "driver_assigned", "welcome"];
    for (const type of types) {
      const req = createReq({
        to: "test@example.com",
        type,
        data: { customerName: "Test", orderNumber: "ORD-1" },
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
    }
    expect(mockSendEmail).toHaveBeenCalledTimes(types.length);
  });

  it("should return 500 when email sending fails", async () => {
    mockSendEmail.mockResolvedValue({ success: false, error: "SMTP connection failed" });
    const req = createReq({
      to: "test@example.com",
      type: "order_confirmation",
      data: { customerName: "John", orderNumber: "ORD-1" },
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toContain("SMTP connection failed");
  });

  it("should handle unexpected errors", async () => {
    const req = { json: jest.fn().mockRejectedValue(new Error("Parse error")) };
    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toContain("Parse error");
  });
});

describe("GET /api/email/send", () => {
  let GET: () => Promise<{ status: number; json: () => Promise<Record<string, unknown>> }>;

  beforeAll(async () => {
    const mod = await import("@/app/api/email/send/route");
    GET = mod.GET as typeof GET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return configured status when email is set up", async () => {
    mockIsEmailConfigured.mockReturnValue(true);
    mockVerifyConnection.mockResolvedValue(true);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.configured).toBe(true);
    expect(body.connectionVerified).toBe(true);
  });

  it("should return unconfigured status", async () => {
    mockIsEmailConfigured.mockReturnValue(false);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.configured).toBe(false);
    expect(body.message).toContain("not configured");
  });

  it("should handle connection verification failure", async () => {
    mockIsEmailConfigured.mockReturnValue(true);
    mockVerifyConnection.mockRejectedValue(new Error("Connection refused"));
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.configured).toBe(true);
    expect(body.connectionVerified).toBe(false);
    expect(body.verificationError).toContain("Connection refused");
  });
});
