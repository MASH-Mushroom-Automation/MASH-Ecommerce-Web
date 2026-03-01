/**
 * Seller Products Upload-Image API Route Tests
 */
jest.mock("next/server", () => {
  class MockNextResponse {
    body: unknown; status: number; headers: Map<string,string>;
    constructor(body: unknown, init?: {status?: number}) {
      this.body = body; this.status = init?.status || 200; this.headers = new Map();
    }
    json() { return Promise.resolve(typeof this.body === 'string' ? JSON.parse(this.body) : this.body); }
    static json(data: unknown, init?: {status?: number}) { return new MockNextResponse(data, init); }
  }
  class MockNextRequest {
    url: string; method: string; headers: Map<string,string>; private _formData: any;
    nextUrl: {searchParams: URLSearchParams};
    constructor(url: string, init?: {method?: string; formData?: any; headers?: Record<string,string>}) {
      this.url = url; this.method = init?.method || "POST";
      this._formData = init?.formData;
      this.headers = new Map(Object.entries(init?.headers || {}));
      this.nextUrl = { searchParams: new URL(url).searchParams };
    }
    async formData() { return this._formData; }
  }
  return { NextResponse: MockNextResponse, NextRequest: MockNextRequest };
});

const mockCookieStore = {
  get: jest.fn(),
};
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => Promise.resolve(mockCookieStore)),
}));

const mockUpload = jest.fn();
jest.mock("next-sanity", () => ({
  createClient: jest.fn(() => ({
    assets: { upload: mockUpload },
  })),
}));

jest.mock("@/lib/sanity/client", () => ({
  projectId: "test-project",
  dataset: "production",
}));

import { NextRequest } from "next/server";

describe("POST /api/seller/products/upload-image", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, SANITY_API_WRITE_TOKEN: "write-token-123" };
    mockCookieStore.get.mockReturnValue({ value: "auth-token-value" });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should return 401 when not authenticated", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const { POST } = await import("../route");
    const formData = new FormData();
    const req = new (NextRequest as any)("http://localhost/api/seller/products/upload-image", {
      method: "POST",
      formData,
    });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("should return 500 when write token not configured", async () => {
    process.env.SANITY_API_WRITE_TOKEN = "";
    process.env.SANITY_AUTH_TOKEN = "";
    const { POST } = require("../route");
    const formData = new FormData();
    const req = new (NextRequest as any)("http://localhost/api/seller/products/upload-image", {
      method: "POST",
      formData,
    });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(500);
    expect(json.error.code).toBe("CONFIG_ERROR");
  });

  it("should return 400 when no file provided", async () => {
    const { POST } = require("../route");
    const formData = new FormData();
    const req = new (NextRequest as any)("http://localhost/api/seller/products/upload-image", {
      method: "POST",
      formData,
    });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("should upload image successfully", async () => {
    mockUpload.mockResolvedValueOnce({
      _id: "image-asset-123",
      url: "https://cdn.sanity.io/images/test/production/image.jpg",
    });

    const { POST } = require("../route");
    // Use mock file with arrayBuffer (jsdom File doesn't support arrayBuffer())
    const mockFile = {
      name: "test.jpg",
      type: "image/jpeg",
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
    };
    const formData = {
      get: jest.fn((key: string) => {
        if (key === "file") return mockFile;
        if (key === "alt") return "Test image";
        return null;
      }),
    };

    const req = new (NextRequest as any)("http://localhost/api/seller/products/upload-image", {
      method: "POST",
      formData,
    });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.assetId).toBe("image-asset-123");
    expect(json.data.alt).toBe("Test image");
  });

  it("should return 500 on upload error", async () => {
    mockUpload.mockRejectedValueOnce(new Error("Upload failed"));
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    const { POST } = require("../route");
    const mockFile = {
      name: "test.jpg",
      type: "image/jpeg",
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
    };
    const formData = {
      get: jest.fn((key: string) => key === "file" ? mockFile : null),
    };

    const req = new (NextRequest as any)("http://localhost/api/seller/products/upload-image", {
      method: "POST",
      formData,
    });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error.code).toBe("UPLOAD_ERROR");
    expect(json.error.message).toBe("Upload failed");
    consoleSpy.mockRestore();
  });
});
