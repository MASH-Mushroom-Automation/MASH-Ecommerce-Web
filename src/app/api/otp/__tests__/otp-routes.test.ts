/**
 * Tests for OTP API routes (send, verify, resend)
 * Batch 7: Coverage improvement for OTP route handlers
 */

// Mock next/server
jest.mock("next/server", () => {
  class MockNextResponse {
    body: unknown;
    status: number;
    headers: Map<string, string>;
    constructor(body: unknown, init?: { status?: number }) {
      this.body = body;
      this.status = init?.status || 200;
      this.headers = new Map();
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

// Mock firebase config
jest.mock("@/lib/firebase/config", () => ({
  firebaseApp: {},
}));

// Firestore mock state
const mockDocs: Array<{
  id: string;
  ref: { id: string };
  exists: () => boolean;
  data: () => Record<string, unknown>;
}> = [];

const mockSetDoc = jest.fn().mockResolvedValue(undefined);
const mockUpdateDoc = jest.fn().mockResolvedValue(undefined);
const mockGetDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockServerTimestamp = jest.fn().mockReturnValue({ _type: "serverTimestamp" });
const mockTimestampFromDate = jest.fn((d: Date) => ({ toDate: () => d, seconds: Math.floor(d.getTime() / 1000) }));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn().mockReturnValue({}),
  collection: jest.fn().mockReturnValue("otp_verifications_col"),
  query: jest.fn().mockReturnValue("mock_query"),
  where: jest.fn().mockReturnValue("mock_where"),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  doc: jest.fn((_db: unknown, _col?: string, _id?: string) => ({
    id: _id || "mock-verification-id",
  })),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
  serverTimestamp: () => mockServerTimestamp(),
  Timestamp: { fromDate: (d: Date) => mockTimestampFromDate(d) },
}));

// Helper to create mock request
function createMockRequest(body: unknown) {
  return {
    json: jest.fn().mockResolvedValue(body),
    url: "http://localhost:3000/api/otp/test",
    nextUrl: { searchParams: new URLSearchParams() },
    headers: new Map(),
  };
}

// Helper: simulate Firestore getDocs result
function mockGetDocsResult(docs: Array<{ data: Record<string, unknown>; id?: string }>) {
  const result: typeof mockDocs = [];
  docs.forEach((d) => {
    const id = d.id || `doc_${Math.random().toString(36).slice(2)}`;
    result.push({
      id,
      ref: { id },
      exists: () => true,
      data: () => d.data,
    });
  });
  mockGetDocs.mockResolvedValue({
    docs: result,
    forEach: (cb: (doc: (typeof result)[0]) => void) => result.forEach(cb),
    size: result.length,
    empty: result.length === 0,
  });
}

// ==================== OTP SEND ====================
describe("POST /api/otp/send", () => {
  let POST: (req: unknown) => Promise<{ status: number; json: () => Promise<Record<string, unknown>> }>;

  beforeAll(async () => {
    const mod = await import("@/app/api/otp/send/route");
    POST = mod.POST as typeof POST;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDocsResult([]); // no rate-limit docs by default
  });

  it("should return 400 when phone number is missing", async () => {
    const req = createMockRequest({});
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain("Phone number is required");
  });

  it("should return 400 for invalid Philippine phone number", async () => {
    const req = createMockRequest({ phoneNumber: "12345" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toContain("Invalid Philippine phone number");
  });

  it("should normalise phone starting with 0", async () => {
    const req = createMockRequest({ phoneNumber: "09171234567" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it("should normalise phone starting with 63", async () => {
    const req = createMockRequest({ phoneNumber: "639171234567" });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it("should normalise phone without prefix", async () => {
    const req = createMockRequest({ phoneNumber: "9171234567" });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it("should accept valid +63 phone number", async () => {
    const req = createMockRequest({ phoneNumber: "+639171234567" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.data.verificationId).toBeDefined();
    expect(body.data.expiresIn).toBe(300);
    expect(mockSetDoc).toHaveBeenCalledTimes(1);
  });

  it("should return 429 when rate limited", async () => {
    // Simulate 3 recent OTP docs within 15 minutes
    const recent = Date.now() - 5 * 60 * 1000;
    mockGetDocsResult([
      { data: { phoneNumber: "+639171234567", createdAt: { toDate: () => new Date(recent) } } },
      { data: { phoneNumber: "+639171234567", createdAt: { toDate: () => new Date(recent) } } },
      { data: { phoneNumber: "+639171234567", createdAt: { toDate: () => new Date(recent) } } },
    ]);

    const req = createMockRequest({ phoneNumber: "+639171234567" });
    const res = await POST(req);
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.message).toContain("Too many OTP requests");
  });

  it("should handle purpose parameter", async () => {
    const req = createMockRequest({ phoneNumber: "+639171234567", purpose: "TWO_FACTOR" });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it("should handle errors gracefully", async () => {
    mockGetDocs.mockRejectedValueOnce(new Error("Firestore error"));
    const req = createMockRequest({ phoneNumber: "+639171234567" });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.message).toContain("Firestore error");
  });
});

// ==================== OTP VERIFY ====================
describe("POST /api/otp/verify", () => {
  let POST: (req: unknown) => Promise<{ status: number; json: () => Promise<Record<string, unknown>> }>;

  beforeAll(async () => {
    const mod = await import("@/app/api/otp/verify/route");
    POST = mod.POST as typeof POST;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 for missing code", async () => {
    const req = createMockRequest({});
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toContain("6-digit code");
  });

  it("should return 400 for non-digit code", async () => {
    const req = createMockRequest({ code: "abcdef" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 400 for short code", async () => {
    const req = createMockRequest({ code: "123" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 404 when no verification found by ID", async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false, data: () => null });
    const req = createMockRequest({ code: "123456", verificationId: "nonexistent" });
    const res = await POST(req);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.message).toContain("No pending OTP found");
  });

  it("should return 410 when OTP has expired", async () => {
    const expired = new Date(Date.now() - 10 * 60 * 1000); // 10 min ago
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        hashedCode: "somehash",
        phoneNumber: "+639171234567",
        attempts: 0,
        maxAttempts: 3,
        verified: false,
        expiresAt: { toDate: () => expired },
      }),
    });

    const req = createMockRequest({ code: "123456", verificationId: "test-id" });
    const res = await POST(req);
    expect(res.status).toBe(410);
    const body = await res.json();
    expect(body.message).toContain("expired");
  });

  it("should return 429 when max attempts exceeded", async () => {
    const future = new Date(Date.now() + 5 * 60 * 1000);
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        hashedCode: "somehash",
        phoneNumber: "+639171234567",
        attempts: 3,
        maxAttempts: 3,
        verified: false,
        expiresAt: { toDate: () => future },
      }),
    });

    const req = createMockRequest({ code: "123456", verificationId: "test-id" });
    const res = await POST(req);
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.message).toContain("Too many failed attempts");
  });

  it("should handle wrong code and increment attempts", async () => {
    const future = new Date(Date.now() + 5 * 60 * 1000);
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        hashedCode: "wrong_hash_that_wont_match",
        phoneNumber: "+639171234567",
        attempts: 0,
        maxAttempts: 3,
        verified: false,
        expiresAt: { toDate: () => future },
      }),
    });

    const req = createMockRequest({ code: "999999", verificationId: "test-id" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.verified).toBe(false);
    expect(body.data.attemptsRemaining).toBeDefined();
    expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
  });

  it("should verify correct code and mark as verified", async () => {
    // Generate SHA-256 of "123456" to match
    const crypto = require("crypto");
    const correctHash = crypto.createHash("sha256").update("123456").digest("hex");
    const future = new Date(Date.now() + 5 * 60 * 1000);

    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        id: "test-verif-id",
        hashedCode: correctHash,
        phoneNumber: "+639171234567",
        attempts: 0,
        maxAttempts: 3,
        verified: false,
        expiresAt: { toDate: () => future },
      }),
    });

    const req = createMockRequest({ code: "123456", verificationId: "test-id" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.verified).toBe(true);
    expect(body.data.success).toBe(true);
    expect(mockUpdateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ verified: true })
    );
  });

  it("should find verification by phone number when no ID given", async () => {
    const future = new Date(Date.now() + 5 * 60 * 1000);
    const now = Date.now();
    mockGetDoc.mockResolvedValue({ exists: () => false });
    mockGetDocsResult([
      {
        data: {
          hashedCode: "wrong_hash",
          phoneNumber: "+639171234567",
          attempts: 0,
          maxAttempts: 3,
          verified: false,
          expiresAt: { toDate: () => future },
          createdAt: { toDate: () => new Date(now) },
        },
      },
    ]);

    const req = createMockRequest({ code: "999999", phoneNumber: "09171234567" });
    const res = await POST(req);
    // Should find the unverified doc and attempt verification
    expect(res.status).toBe(200);
  });

  it("should handle errors gracefully", async () => {
    mockGetDoc.mockRejectedValueOnce(new Error("Firestore down"));
    const req = createMockRequest({ code: "123456", verificationId: "test-id" });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.message).toContain("Firestore down");
  });
});

// ==================== OTP RESEND ====================
describe("POST /api/otp/resend", () => {
  let POST: (req: unknown) => Promise<{ status: number; json: () => Promise<Record<string, unknown>> }>;

  beforeAll(async () => {
    const mod = await import("@/app/api/otp/resend/route");
    POST = mod.POST as typeof POST;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 404 when no pending OTP found by ID", async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false });
    mockGetDocsResult([]);
    const req = createMockRequest({ verificationId: "nonexistent" });
    const res = await POST(req);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.message).toContain("No pending OTP found");
  });

  it("should return 429 during cooldown period", async () => {
    const recentUpdate = new Date(Date.now() - 10 * 1000); // 10 seconds ago (within 60s cooldown)
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        id: "verif-id",
        phoneNumber: "+639171234567",
        verified: false,
        updatedAt: { toDate: () => recentUpdate },
      }),
    });

    const req = createMockRequest({ verificationId: "verif-id" });
    const res = await POST(req);
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.message).toContain("wait");
  });

  it("should resend OTP successfully after cooldown", async () => {
    const oldUpdate = new Date(Date.now() - 2 * 60 * 1000); // 2 min ago
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        id: "verif-id",
        phoneNumber: "+639171234567",
        verified: false,
        updatedAt: { toDate: () => oldUpdate },
      }),
    });

    const req = createMockRequest({ verificationId: "verif-id" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.expiresIn).toBe(300);
    expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
  });

  it("should find verification by phone number", async () => {
    const oldUpdate = new Date(Date.now() - 2 * 60 * 1000);
    const now = Date.now();
    mockGetDoc.mockResolvedValue({ exists: () => false });
    mockGetDocsResult([
      {
        data: {
          id: "phone-verif",
          phoneNumber: "+639171234567",
          verified: false,
          updatedAt: { toDate: () => oldUpdate },
          createdAt: { toDate: () => new Date(now) },
        },
      },
    ]);

    const req = createMockRequest({ phoneNumber: "09171234567" });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it("should handle errors gracefully", async () => {
    mockGetDoc.mockRejectedValueOnce(new Error("DB error"));
    const req = createMockRequest({ verificationId: "id" });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.message).toContain("DB error");
  });
});
