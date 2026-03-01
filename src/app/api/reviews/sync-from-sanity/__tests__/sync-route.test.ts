/**
 * Tests for POST /api/reviews/sync-from-sanity + extractSyncableFields
 * Covers: validation, draft skipping, Sanity fetch, Firestore sync, timestamp conflict, error handling
 */

jest.mock("next/server", () => {
  class MockNextResponse {
    public body: any;
    public status: number;
    constructor(body: any, init?: any) {
      this.body = body;
      this.status = init?.status || 200;
    }
    json() { return Promise.resolve(this.body); }
    static json(data: any, init?: any) { return new MockNextResponse(data, init); }
  }
  return { __esModule: true, NextResponse: MockNextResponse, NextRequest: jest.fn() };
});

const mockSanityFetch = jest.fn();
jest.mock("@sanity/client", () => ({
  createClient: jest.fn(() => ({ fetch: (...args: any[]) => mockSanityFetch(...args) })),
}));

const mockGetDoc = jest.fn();
const mockUpdateDoc = jest.fn().mockResolvedValue(undefined);
const mockDoc = jest.fn();
jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  doc: (...args: any[]) => mockDoc(...args),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
}));

jest.mock("@/lib/firebase/config", () => ({ firebaseApp: {} }));

let POST: any, extractSyncableFields: any;

beforeAll(async () => {
  const mod = await import("@/app/api/reviews/sync-from-sanity/route");
  POST = mod.POST;
  extractSyncableFields = mod.extractSyncableFields;
});

beforeEach(() => {
  jest.clearAllMocks();
});

function makeRequest(body: any) {
  return { json: jest.fn().mockResolvedValue(body) } as any;
}

describe("extractSyncableFields", () => {
  it("should extract status field", () => {
    const { fieldsToUpdate, fieldNames } = extractSyncableFields({ status: "approved" });
    expect(fieldsToUpdate.status).toBe("approved");
    expect(fieldNames).toContain("status");
  });

  it("should extract admin response fields", () => {
    const { fieldsToUpdate, fieldNames } = extractSyncableFields({
      adminResponse: "Thanks",
      adminResponseDate: "2024-01-01",
    });
    expect(fieldsToUpdate.adminResponse).toBe("Thanks");
    expect(fieldNames).toContain("adminResponse");
    expect(fieldNames).toContain("adminResponseDate");
  });

  it("should extract moderation fields", () => {
    const { fieldsToUpdate, fieldNames } = extractSyncableFields({
      moderatedBy: "admin-1",
      moderatedAt: "2024-01-02",
    });
    expect(fieldNames).toContain("moderatedBy");
    expect(fieldNames).toContain("moderatedAt");
  });

  it("should extract flag fields", () => {
    const { fieldsToUpdate, fieldNames } = extractSyncableFields({
      flagCount: 3,
      flagReasons: ["spam", "inappropriate"],
    });
    expect(fieldsToUpdate.flagCount).toBe(3);
    expect(fieldsToUpdate.flagReasons).toEqual(["spam", "inappropriate"]);
  });

  it("should return empty when no syncable fields", () => {
    const { fieldNames } = extractSyncableFields({ title: "No sync", rating: 5 });
    expect(fieldNames).toHaveLength(0);
  });
});

describe("POST /api/reviews/sync-from-sanity", () => {
  it("should return 400 when no sanityId or _id", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("Missing sanityId");
  });

  it("should skip draft documents", async () => {
    const res = await POST(makeRequest({ sanityId: "drafts.abc123" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.skipped).toBe(true);
    expect(json.reason).toContain("Draft");
  });

  it("should accept _id field from webhook payload", async () => {
    mockSanityFetch.mockResolvedValue(null);
    const res = await POST(makeRequest({ _id: "review-123" }));
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toContain("Sanity review not found");
  });

  it("should return 404 when Sanity doc not found", async () => {
    mockSanityFetch.mockResolvedValue(null);
    const res = await POST(makeRequest({ sanityId: "nonexistent" }));
    expect(res.status).toBe(404);
  });

  it("should skip when no firebaseReviewId on Sanity doc", async () => {
    mockSanityFetch.mockResolvedValue({ _id: "s-123", status: "approved" });
    const res = await POST(makeRequest({ sanityId: "s-123" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.skipped).toBe(true);
    expect(json.reason).toContain("No firebaseReviewId");
  });

  it("should skip when Firestore doc not found", async () => {
    mockSanityFetch.mockResolvedValue({ _id: "s-123", firebaseReviewId: "fb-123", status: "approved" });
    mockGetDoc.mockResolvedValue({ exists: () => false });
    const res = await POST(makeRequest({ sanityId: "s-123" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.skipped).toBe(true);
    expect(json.reason).toContain("not found");
  });

  it("should skip when Firebase doc is newer (last-write-wins)", async () => {
    mockSanityFetch.mockResolvedValue({
      _id: "s-123",
      firebaseReviewId: "fb-123",
      _updatedAt: "2024-01-01T00:00:00Z",
      status: "approved",
    });
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ updatedAt: "2024-06-01T00:00:00Z" }),
    });
    const res = await POST(makeRequest({ sanityId: "s-123" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.skipped).toBe(true);
    expect(json.reason).toContain("newer");
  });

  it("should skip when no syncable fields changed", async () => {
    mockSanityFetch.mockResolvedValue({
      _id: "s-123",
      firebaseReviewId: "fb-123",
      _updatedAt: "2024-06-01T00:00:00Z",
      title: "Not a syncable field",
    });
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ updatedAt: "2024-01-01T00:00:00Z" }),
    });
    const res = await POST(makeRequest({ sanityId: "s-123" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.skipped).toBe(true);
    expect(json.reason).toContain("No syncable fields");
  });

  it("should sync fields from Sanity to Firestore", async () => {
    mockSanityFetch.mockResolvedValue({
      _id: "s-123",
      firebaseReviewId: "fb-123",
      _updatedAt: "2024-06-01T00:00:00Z",
      status: "approved",
      moderatedBy: "admin-1",
    });
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ updatedAt: "2024-01-01T00:00:00Z" }),
    });
    const res = await POST(makeRequest({ sanityId: "s-123" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.firebaseId).toBe("fb-123");
    expect(json.fieldsUpdated).toContain("status");
    expect(json.fieldsUpdated).toContain("moderatedBy");
    expect(mockUpdateDoc).toHaveBeenCalled();
  });

  it("should return 500 on unexpected error", async () => {
    mockSanityFetch.mockRejectedValue(new Error("Sanity unavailable"));
    const res = await POST(makeRequest({ sanityId: "s-123" }));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("Sanity unavailable");
  });
});
