// Test for seller/products/[id] API route
jest.mock("next/server", () => {
  class MockNextRequest {
    url: string;
    method: string;
    headers: Map<string, string>;
    private _body: any;

    constructor(url: string, init?: any) {
      this.url = url;
      this.method = init?.method || "GET";
      this.headers = new Map(Object.entries(init?.headers || {}));
      this._body = init?.body;
    }

    async json() {
      return typeof this._body === "string" ? JSON.parse(this._body) : this._body;
    }
  }

  return {
    NextRequest: MockNextRequest,
    NextResponse: {
      json: (data: any, init?: any) => ({
        status: init?.status || 200,
        json: async () => data,
        data,
      }),
    },
  };
});

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("@/lib/sanity/products", () => ({
  fetchProductById: jest.fn(),
  updateProduct: jest.fn(),
}));

jest.mock("@/lib/jwt", () => ({
  getUserIdFromToken: jest.fn(),
}));

import { GET, PUT } from "../[id]/route";
import { cookies } from "next/headers";
import { fetchProductById, updateProduct } from "@/lib/sanity/products";
import { getUserIdFromToken } from "@/lib/jwt";
import { NextRequest } from "next/server";

describe("GET /api/seller/products/[id]", () => {
  const mockCookies = { get: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (cookies as jest.Mock).mockResolvedValue(mockCookies);
    mockCookies.get.mockReturnValue({ value: "mock-token" });
    (getUserIdFromToken as jest.Mock).mockReturnValue("seller-123");
  });

  it("should return 401 when no auth token", async () => {
    mockCookies.get.mockReturnValue(undefined);
    const request = new NextRequest("http://localhost/api/seller/products/prod-1");
    const res = await GET(request, { params: Promise.resolve({ id: "prod-1" }) });
    const data = await res.json();
    expect(res.status).toBe(401);
    expect(data.error.code).toBe("UNAUTHORIZED");
  });

  it("should return 401 when user ID cannot be extracted", async () => {
    (getUserIdFromToken as jest.Mock).mockReturnValue(null);
    const request = new NextRequest("http://localhost/api/seller/products/prod-1");
    const res = await GET(request, { params: Promise.resolve({ id: "prod-1" }) });
    const data = await res.json();
    expect(res.status).toBe(401);
    expect(data.error.message).toContain("Unable to identify");
  });

  it("should return 404 when product not found", async () => {
    (fetchProductById as jest.Mock).mockResolvedValue(null);
    const request = new NextRequest("http://localhost/api/seller/products/prod-1");
    const res = await GET(request, { params: Promise.resolve({ id: "prod-1" }) });
    const data = await res.json();
    expect(res.status).toBe(404);
    expect(data.error.code).toBe("NOT_FOUND");
  });

  it("should return product data on success", async () => {
    const mockProduct = {
      _id: "prod-1",
      name: "Test Product",
      description: "A test product",
      category: "cat-1",
      price: 100,
      stock: 50,
      isAvailable: true,
      mainImage: "https://example.com/img.jpg",
      images: ["https://example.com/img.jpg"],
      slug: { current: "test-product" },
    };
    (fetchProductById as jest.Mock).mockResolvedValue(mockProduct);
    const request = new NextRequest("http://localhost/api/seller/products/prod-1");
    const res = await GET(request, { params: Promise.resolve({ id: "prod-1" }) });
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.name).toBe("Test Product");
    expect(data.data.id).toBe("prod-1");
  });

  it("should return 500 on internal error", async () => {
    (fetchProductById as jest.Mock).mockRejectedValue(new Error("DB error"));
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const request = new NextRequest("http://localhost/api/seller/products/prod-1");
    const res = await GET(request, { params: Promise.resolve({ id: "prod-1" }) });
    const data = await res.json();
    expect(res.status).toBe(500);
    expect(data.error.code).toBe("FETCH_ERROR");
    consoleSpy.mockRestore();
  });
});

describe("PUT /api/seller/products/[id]", () => {
  const mockCookies = { get: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (cookies as jest.Mock).mockResolvedValue(mockCookies);
    mockCookies.get.mockReturnValue({ value: "mock-token" });
    (getUserIdFromToken as jest.Mock).mockReturnValue("seller-123");
  });

  it("should return 401 when no auth token", async () => {
    mockCookies.get.mockReturnValue(undefined);
    const request = new NextRequest("http://localhost/api/seller/products/prod-1", {
      method: "PUT",
      body: JSON.stringify({ name: "Test" }),
    });
    const res = await PUT(request, { params: Promise.resolve({ id: "prod-1" }) });
    const data = await res.json();
    expect(res.status).toBe(401);
  });

  it("should return 400 on missing required fields", async () => {
    const request = new NextRequest("http://localhost/api/seller/products/prod-1", {
      method: "PUT",
      body: JSON.stringify({ name: "Test" }), // missing description, category, price
    });
    const res = await PUT(request, { params: Promise.resolve({ id: "prod-1" }) });
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });

  it("should update product successfully", async () => {
    (updateProduct as jest.Mock).mockResolvedValue({
      _id: "prod-1",
      slug: { current: "test-product" },
    });
    const request = new NextRequest("http://localhost/api/seller/products/prod-1", {
      method: "PUT",
      body: JSON.stringify({
        name: "Updated Product",
        description: "Updated description",
        category: "cat-1",
        price: 150,
      }),
    });
    const res = await PUT(request, { params: Promise.resolve({ id: "prod-1" }) });
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.message).toBe("Product updated successfully");
  });

  it("should return 401 when seller cannot be identified", async () => {
    (getUserIdFromToken as jest.Mock).mockReturnValue(null);
    const request = new NextRequest("http://localhost/api/seller/products/prod-1", {
      method: "PUT",
      body: JSON.stringify({
        name: "Test", description: "Test", category: "cat", price: 100,
      }),
    });
    const res = await PUT(request, { params: Promise.resolve({ id: "prod-1" }) });
    const data = await res.json();
    expect(res.status).toBe(401);
  });

  it("should return 500 on update error", async () => {
    (updateProduct as jest.Mock).mockRejectedValue(new Error("Update failed"));
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const request = new NextRequest("http://localhost/api/seller/products/prod-1", {
      method: "PUT",
      body: JSON.stringify({
        name: "Test", description: "Test", category: "cat", price: 100,
      }),
    });
    const res = await PUT(request, { params: Promise.resolve({ id: "prod-1" }) });
    const data = await res.json();
    expect(res.status).toBe(500);
    expect(data.error.code).toBe("UPDATE_ERROR");
    consoleSpy.mockRestore();
  });
});
