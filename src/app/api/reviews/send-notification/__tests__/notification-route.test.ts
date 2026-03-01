/**
 * Tests for POST /api/reviews/send-notification
 * Covers: all 4 notification types, validation, unknown type, error handling
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

const mockSendNew = jest.fn().mockResolvedValue(undefined);
const mockSendApproved = jest.fn().mockResolvedValue(undefined);
const mockSendResponse = jest.fn().mockResolvedValue(undefined);
const mockSendFlagged = jest.fn().mockResolvedValue(undefined);

jest.mock("@/lib/email/review-notifications", () => ({
  sendNewReviewNotification: (...args: any[]) => mockSendNew(...args),
  sendReviewApprovedNotification: (...args: any[]) => mockSendApproved(...args),
  sendResponseNotification: (...args: any[]) => mockSendResponse(...args),
  sendFlaggedReviewAlert: (...args: any[]) => mockSendFlagged(...args),
}));

let POST: any;

beforeAll(async () => {
  const mod = await import("@/app/api/reviews/send-notification/route");
  POST = mod.POST;
});

beforeEach(() => {
  jest.clearAllMocks();
});

const mockReview = {
  id: "rev-1",
  productId: "prod-1",
  userId: "user-1",
  rating: 5,
  title: "Great product",
  content: "Really enjoyed it",
  status: "approved",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  reviewerName: "Test User",
  reviewerEmail: "reviewer@test.com",
};

function makeRequest(body: any) {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as any;
}

describe("POST /api/reviews/send-notification", () => {
  it("should return 400 when missing type", async () => {
    const res = await POST(makeRequest({ review: mockReview }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("Missing required fields");
  });

  it("should return 400 when missing review", async () => {
    const res = await POST(makeRequest({ type: "review_submitted" }));
    expect(res.status).toBe(400);
  });

  it("should send review_submitted notification", async () => {
    const res = await POST(makeRequest({
      type: "review_submitted",
      review: mockReview,
      sellerEmail: "seller@test.com",
      sellerName: "Test Seller",
    }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.message).toContain("review_submitted");
    expect(mockSendNew).toHaveBeenCalledWith(mockReview, "seller@test.com", "Test Seller");
  });

  it("should return 400 for review_submitted missing sellerEmail", async () => {
    const res = await POST(makeRequest({
      type: "review_submitted",
      review: mockReview,
      sellerName: "Seller",
    }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("sellerEmail");
  });

  it("should send review_approved notification", async () => {
    const res = await POST(makeRequest({
      type: "review_approved",
      review: mockReview,
    }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(mockSendApproved).toHaveBeenCalledWith(mockReview);
  });

  it("should send review_response notification", async () => {
    const res = await POST(makeRequest({
      type: "review_response",
      review: mockReview,
      responderName: "Admin",
      responderRole: "admin",
      responseText: "Thank you for your review!",
    }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(mockSendResponse).toHaveBeenCalledWith(mockReview, "Admin", "admin", "Thank you for your review!");
  });

  it("should return 400 for review_response missing responderName", async () => {
    const res = await POST(makeRequest({
      type: "review_response",
      review: mockReview,
      responderRole: "admin",
      responseText: "Thanks",
    }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("responderName");
  });

  it("should send review_flagged notification", async () => {
    const res = await POST(makeRequest({
      type: "review_flagged",
      review: mockReview,
      flaggedBy: "user-2",
    }));
    expect(res.status).toBe(200);
    expect(mockSendFlagged).toHaveBeenCalledWith(mockReview, "user-2");
  });

  it("should use 'Unknown' when flaggedBy not provided", async () => {
    const res = await POST(makeRequest({
      type: "review_flagged",
      review: mockReview,
    }));
    expect(res.status).toBe(200);
    expect(mockSendFlagged).toHaveBeenCalledWith(mockReview, "Unknown");
  });

  it("should return 400 for unknown notification type", async () => {
    const res = await POST(makeRequest({
      type: "review_deleted",
      review: mockReview,
    }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("Unknown notification type");
  });

  it("should return 500 when request.json() throws", async () => {
    const req = { json: jest.fn().mockRejectedValue(new Error("Bad JSON")) } as any;
    const res = await POST(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("Internal server error");
  });
});
