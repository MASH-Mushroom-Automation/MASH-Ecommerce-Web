/**
 * Tests for Contact Form API route
 * Batch 7: Coverage improvement for POST/GET /api/contact
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
const mockSendRawEmail = jest.fn();
const mockIsGmailConfigured = jest.fn();
jest.mock("@/lib/email", () => ({
  sendRawEmail: (...args: unknown[]) => mockSendRawEmail(...args),
  isGmailConfigured: () => mockIsGmailConfigured(),
  GMAIL_CONFIG: { user: "test@gmail.com", host: "smtp.gmail.com", port: 587 },
}));

function createReq(body: unknown) {
  return { json: jest.fn().mockResolvedValue(body) };
}

describe("POST /api/contact", () => {
  let POST: (req: unknown) => Promise<{ status: number; json: () => Promise<Record<string, unknown>> }>;

  beforeAll(async () => {
    const mod = await import("@/app/api/contact/route");
    POST = mod.POST as typeof POST;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsGmailConfigured.mockReturnValue(true);
    mockSendRawEmail.mockResolvedValue({ success: true, messageId: "msg-123" });
  });

  it("should return 400 for invalid form data (missing name)", async () => {
    const req = createReq({ email: "test@example.com", subject: "order", message: "Hello there" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.errors).toBeDefined();
  });

  it("should return 400 for invalid email", async () => {
    const req = createReq({ name: "John", email: "not-valid", subject: "order", message: "Hello world" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 400 for invalid subject", async () => {
    const req = createReq({ name: "John", email: "test@example.com", subject: "invalid-subject", message: "Hello world" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 400 for message too short", async () => {
    const req = createReq({ name: "John", email: "test@example.com", subject: "order", message: "Hi" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should succeed when email is not configured (logs only)", async () => {
    mockIsGmailConfigured.mockReturnValue(false);
    const req = createReq({ name: "John Doe", email: "john@example.com", subject: "product", message: "I have a question about mushrooms" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.note).toContain("being set up");
    expect(mockSendRawEmail).not.toHaveBeenCalled();
  });

  it("should send both support and customer emails on valid submission", async () => {
    const req = createReq({ name: "Jane Doe", email: "jane@example.com", subject: "delivery", message: "My delivery is late, please help me track it" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.emailSent).toBe(true);
    expect(mockSendRawEmail).toHaveBeenCalledTimes(2);
  });

  it("should handle all subject types", async () => {
    const subjects = ["order", "delivery", "product", "refund", "partnership", "other"];
    for (const subject of subjects) {
      const req = createReq({ name: "Test User", email: "test@example.com", subject, message: "This is a test message with enough length" });
      const res = await POST(req);
      expect(res.status).toBe(200);
    }
  });

  it("should handle email send failure gracefully", async () => {
    mockSendRawEmail.mockResolvedValue({ success: false, error: "SMTP error" });
    const req = createReq({ name: "John", email: "j@example.com", subject: "other", message: "This is my detailed message" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.emailSent).toBe(false);
  });

  it("should handle errors gracefully", async () => {
    const req = { json: jest.fn().mockRejectedValue(new Error("Parse error")) };
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});

describe("GET /api/contact", () => {
  let GET: () => Promise<{ status: number; json: () => Promise<Record<string, unknown>> }>;

  beforeAll(async () => {
    const mod = await import("@/app/api/contact/route");
    GET = mod.GET as typeof GET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return health check info", async () => {
    mockIsGmailConfigured.mockReturnValue(true);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.emailConfigured).toBe(true);
    expect(body.supportEmail).toBe("test@gmail.com");
  });

  it("should show unconfigured when email not set up", async () => {
    mockIsGmailConfigured.mockReturnValue(false);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.emailConfigured).toBe(false);
    expect(body.supportEmail).toBeNull();
  });
});
