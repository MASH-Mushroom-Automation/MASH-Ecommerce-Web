/**
 * Tests for POST /api/lalamove/orders
 * 
 * This route uses raw Node.js `https` module (NOT getLalamoveClient).
 * Tests cover: validation, success flow, and error handling.
 */

import { NextResponse } from "next/server";

// Mock NextResponse
const mockJsonResponse = { json: jest.fn(), status: 200 };
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

// Mock crypto
jest.mock("crypto", () => ({
  createHmac: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue({
      digest: jest.fn().mockReturnValue("test-signature-hex"),
    }),
  }),
}));

// Mock https - we need to capture the callbacks
const mockReqOn = jest.fn();
const mockReqWrite = jest.fn();
const mockReqEnd = jest.fn();
const mockHttpsRequest = jest.fn();

jest.mock("https", () => ({
  request: (...args: any[]) => mockHttpsRequest(...args),
}));

// Env vars
process.env.LALAMOVE_API_SECRET = "test-secret";
process.env.LALAMOVE_API_KEY = "test-key";
process.env.LALAMOVE_HOST = "https://rest.sandbox.lalamove.com";
process.env.LALAMOVE_MARKET = "PH";

// Helper: create a POST request mock
function createPostReq(body: Record<string, unknown>) {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as any;
}

// Helper: simulate a successful https response
function setupHttpsSuccess(responseBody: any, statusCode = 200) {
  mockHttpsRequest.mockImplementation((_options: any, callback: any) => {
    const mockRes = {
      statusCode,
      on: jest.fn((event: string, handler: (data?: any) => void) => {
        if (event === "data") {
          handler(JSON.stringify(responseBody));
        }
        if (event === "end") {
          handler();
        }
        return mockRes;
      }),
    };
    callback(mockRes);
    return {
      on: mockReqOn,
      write: mockReqWrite,
      end: mockReqEnd,
    };
  });
}

// Helper: simulate an https error
function setupHttpsError(errorMessage: string) {
  mockHttpsRequest.mockImplementation((_options: any, _callback: any) => {
    const reqObj = {
      on: jest.fn((event: string, handler: (err?: any) => void) => {
        if (event === "error") {
          handler(new Error(errorMessage));
        }
        return reqObj;
      }),
      write: mockReqWrite,
      end: mockReqEnd,
    };
    return reqObj;
  });
}

// Helper: simulate an API error response
function setupHttpsApiError(message: string, statusCode = 400) {
  mockHttpsRequest.mockImplementation((_options: any, callback: any) => {
    const mockRes = {
      statusCode,
      on: jest.fn((event: string, handler: (data?: any) => void) => {
        if (event === "data") {
          handler(JSON.stringify({ message }));
        }
        if (event === "end") {
          handler();
        }
        return mockRes;
      }),
    };
    callback(mockRes);
    return {
      on: jest.fn(),
      write: mockReqWrite,
      end: mockReqEnd,
    };
  });
}

describe("POST /api/lalamove/orders", () => {
  let POST: (req: any) => Promise<any>;

  beforeAll(async () => {
    const mod = await import("@/app/api/lalamove/orders/route");
    POST = mod.POST;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 when quotationId is missing", async () => {
    const req = createPostReq({
      sender: { name: "Test Sender" },
      recipients: [{ name: "Recipient" }],
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Missing required fields");
  });

  it("should return 400 when sender is missing", async () => {
    const req = createPostReq({
      quotationId: "Q-123",
      recipients: [{ name: "Recipient" }],
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 when recipients is missing", async () => {
    const req = createPostReq({
      quotationId: "Q-123",
      sender: { name: "Test Sender" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 400 when recipients is empty array", async () => {
    const req = createPostReq({
      quotationId: "Q-123",
      sender: { name: "Test Sender" },
      recipients: [],
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should place order successfully with COD", async () => {
    setupHttpsSuccess({
      data: {
        orderId: "LLM-ORDER-456",
        status: "ASSIGNING_DRIVER",
        shareLink: "https://www.lalamove.com/share/LLM-ORDER-456",
      },
    });

    const req = createPostReq({
      quotationId: "Q-123",
      sender: { name: "MASH Farm", phone: "+639123456789" },
      recipients: [
        {
          name: "Customer",
          phone: "+639987654321",
          payment: { amount: "500", method: "COD" },
        },
      ],
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.order.orderId).toBe("LLM-ORDER-456");
    expect(res.body.order.status).toBe("ASSIGNING_DRIVER");
    expect(res.body.order.shareLink).toBeDefined();
    expect(res.body.order.trackingUrl).toContain("LLM-ORDER-456");
  });

  it("should place order successfully without COD", async () => {
    setupHttpsSuccess({
      data: {
        orderId: "LLM-ORDER-789",
        status: "ASSIGNING_DRIVER",
        shareLink: "https://share.lalamove.com/LLM-ORDER-789",
      },
    });

    const req = createPostReq({
      quotationId: "Q-789",
      sender: { name: "Farm A" },
      recipients: [{ name: "Customer B" }],
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.order.orderId).toBe("LLM-ORDER-789");
  });

  it("should include metadata with source and testDate in request body", async () => {
    setupHttpsSuccess({
      data: { orderId: "LLM-META", status: "ASSIGNING_DRIVER", shareLink: "" },
    });

    const req = createPostReq({
      quotationId: "Q-META",
      sender: { name: "Sender" },
      recipients: [{ name: "Recipient" }],
    });

    await POST(req);

    // Verify the request body was written with metadata
    expect(mockReqWrite).toHaveBeenCalled();
    const writtenBody = JSON.parse(mockReqWrite.mock.calls[0][0]);
    expect(writtenBody.data.metadata.source).toBe("MASH-Test-Page");
    expect(writtenBody.data.metadata.testDate).toBeDefined();
    expect(writtenBody.data.isPODEnabled).toBe(true);
  });

  it("should return 500 when Lalamove API returns error status", async () => {
    setupHttpsApiError("Invalid quotation ID", 400);

    const req = createPostReq({
      quotationId: "INVALID-Q",
      sender: { name: "Sender" },
      recipients: [{ name: "Recipient" }],
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Invalid quotation ID");
  });

  it("should return 500 when network error occurs", async () => {
    setupHttpsError("ECONNREFUSED");

    const req = createPostReq({
      quotationId: "Q-NET-ERR",
      sender: { name: "Sender" },
      recipients: [{ name: "Recipient" }],
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("ECONNREFUSED");
  });

  it("should return 500 when response is unparseable JSON", async () => {
    mockHttpsRequest.mockImplementation((_options: any, callback: any) => {
      const mockRes = {
        statusCode: 200,
        on: jest.fn((event: string, handler: (data?: any) => void) => {
          if (event === "data") {
            handler("NOT_VALID_JSON{{{");
          }
          if (event === "end") {
            handler();
          }
          return mockRes;
        }),
      };
      callback(mockRes);
      return {
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
      };
    });

    const req = createPostReq({
      quotationId: "Q-BAD-JSON",
      sender: { name: "Sender" },
      recipients: [{ name: "Recipient" }],
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Failed to parse response");
  });

  it("should set correct authorization headers", async () => {
    setupHttpsSuccess({
      data: { orderId: "LLM-HDR", status: "ASSIGNING_DRIVER", shareLink: "" },
    });

    const req = createPostReq({
      quotationId: "Q-HDR",
      sender: { name: "Sender" },
      recipients: [{ name: "Recipient" }],
    });

    await POST(req);

    // Verify https.request was called with correct options
    expect(mockHttpsRequest).toHaveBeenCalled();
    const options = mockHttpsRequest.mock.calls[0][0];
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.headers.Authorization).toContain("hmac test-key:");
    expect(options.headers.Market).toBe("PH");
  });
});
