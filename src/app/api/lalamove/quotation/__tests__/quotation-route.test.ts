/**
 * Lalamove Quotation Route Tests
 * Tests POST /api/lalamove/quotation and GET /api/lalamove/quotation
 */
import { POST, GET } from "../route";

// Mock the Lalamove client
const mockGetQuotation = jest.fn();
const mockGetQuotationDetails = jest.fn();

jest.mock("@/lib/lalamove/client", () => ({
  getLalamoveClient: () => ({
    getQuotation: mockGetQuotation,
    getQuotationDetails: mockGetQuotationDetails,
  }),
}));

function createPostRequest(body: Record<string, unknown>) {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as any;
}

function createGetRequest(params: Record<string, string> = {}) {
  const url = new URL("http://localhost:3000/api/lalamove/quotation");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return {
    nextUrl: { searchParams: url.searchParams },
  } as any;
}

const validBody = {
  pickupLat: 14.6549,
  pickupLng: 121.042,
  pickupAddress: "MASH Store, Caloocan",
  dropoffLat: 14.6507,
  dropoffLng: 121.0497,
  dropoffAddress: "SM North EDSA, QC",
  serviceType: "MOTORCYCLE",
};

const mockQuotationResponse = {
  quotationId: "q-test-123",
  priceBreakdown: { total: "89.00", currency: "PHP" },
  distance: { value: "5.2", unit: "km" },
  expiresAt: "2099-01-01T00:00:00Z",
  stops: [
    { stopId: "stop1", coordinates: { lat: "14.6549", lng: "121.042" } },
    { stopId: "stop2", coordinates: { lat: "14.6507", lng: "121.0497" } },
  ],
};

describe("POST /api/lalamove/quotation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetQuotation.mockResolvedValue(mockQuotationResponse);
  });

  it("returns quotation data on valid request", async () => {
    const req = createPostRequest(validBody);
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.quotationId).toBe("q-test-123");
    expect(data.data.price).toBe("89.00");
    expect(data.data.distance).toEqual({ value: "5.2", unit: "km" });
  });

  it("returns 400 when dropoff coordinates are missing", async () => {
    const req = createPostRequest({ ...validBody, dropoffLat: undefined, dropoffLng: undefined });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toContain("Delivery address coordinates");
  });

  it("returns 400 when pickup coordinates are missing", async () => {
    const req = createPostRequest({ ...validBody, pickupLat: undefined, pickupLng: undefined });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toContain("Pickup location");
  });

  it("returns 400 for invalid dropoff coordinate ranges", async () => {
    const req = createPostRequest({ ...validBody, dropoffLat: 100 });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toContain("Invalid delivery location");
  });

  it("returns 400 for invalid pickup coordinate ranges", async () => {
    const req = createPostRequest({ ...validBody, pickupLng: 200 });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toContain("Invalid pickup location");
  });

  it("defaults serviceType to MOTORCYCLE when not provided", async () => {
    const req = createPostRequest({ ...validBody, serviceType: undefined });
    await POST(req);

    expect(mockGetQuotation).toHaveBeenCalledWith(
      expect.objectContaining({ serviceType: "MOTORCYCLE" })
    );
  });

  it("passes scheduleAt when provided", async () => {
    const scheduleAt = "2025-06-15T14:00:00.000Z";
    const req = createPostRequest({ ...validBody, scheduleAt });
    await POST(req);

    expect(mockGetQuotation).toHaveBeenCalledWith(
      expect.objectContaining({ scheduleAt })
    );
  });

  it("constructs stops with correct coordinates", async () => {
    const req = createPostRequest(validBody);
    await POST(req);

    const call = mockGetQuotation.mock.calls[0][0];
    expect(call.stops).toHaveLength(2);
    expect(call.stops[0].coordinates).toEqual({ lat: "14.6549", lng: "121.042" });
    expect(call.stops[1].coordinates).toEqual({ lat: "14.6507", lng: "121.0497" });
  });

  it("includes FOOD_DELIVERY category and KEEP_UPRIGHT handling", async () => {
    const req = createPostRequest(validBody);
    await POST(req);

    const call = mockGetQuotation.mock.calls[0][0];
    expect(call.item.categories).toContain("FOOD_DELIVERY");
    expect(call.item.handlingInstructions).toContain("KEEP_UPRIGHT");
  });

  it("handles Lalamove API errors with parsed error messages", async () => {
    mockGetQuotation.mockRejectedValue({
      response: {
        status: 422,
        data: { errors: [{ message: "Outside service area" }] },
      },
    });

    const req = createPostRequest(validBody);
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(422);
    expect(data.message).toContain("Outside service area");
  });

  it("handles 'outside service area' in error.message path with 422", async () => {
    mockGetQuotation.mockRejectedValue(new Error("Address is outside service area"));

    const req = createPostRequest(validBody);
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(422);
    expect(data.message).toContain("outside the service area");
  });

  it("handles 'invalid coordinates' in error.message path with 400", async () => {
    mockGetQuotation.mockRejectedValue(new Error("Invalid coordinates for stop 2"));

    const req = createPostRequest(validBody);
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toContain("Invalid location coordinates");
  });

  it("handles timeout errors with 504", async () => {
    mockGetQuotation.mockRejectedValue(new Error("Request timeout"));

    const req = createPostRequest(validBody);
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(504);
    expect(data.message).toContain("timed out");
  });

  it("handles network errors with 503", async () => {
    mockGetQuotation.mockRejectedValue(new Error("Network connection failed"));

    const req = createPostRequest(validBody);
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(503);
    expect(data.message).toContain("Network error");
  });

  it("handles generic errors with 500", async () => {
    mockGetQuotation.mockRejectedValue(new Error("Unknown error"));

    const req = createPostRequest(validBody);
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.success).toBe(false);
  });
});

describe("GET /api/lalamove/quotation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetQuotationDetails.mockResolvedValue(mockQuotationResponse);
  });

  it("returns quotation details for valid quotationId", async () => {
    const req = createGetRequest({ quotationId: "q-test-123" });
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockQuotationResponse);
    expect(mockGetQuotationDetails).toHaveBeenCalledWith("q-test-123");
  });

  it("returns 400 when quotationId is missing", async () => {
    const req = createGetRequest({});
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe("quotationId required");
  });

  it("returns 500 when Lalamove client throws", async () => {
    mockGetQuotationDetails.mockRejectedValue(new Error("Not found"));

    const req = createGetRequest({ quotationId: "invalid-id" });
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.message).toBe("Not found");
  });
});
