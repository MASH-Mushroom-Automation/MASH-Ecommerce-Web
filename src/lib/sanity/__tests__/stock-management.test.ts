/**
 * Tests for Sanity Stock Management Mutations
 * COVERAGE-008: Sanity Services - mutations/stock-management.ts
 *
 * Tests ValidationError, StockAdjustmentError classes,
 * validateStockAdjustmentRequest (all validation paths),
 * productExists, getCurrentStock, adjustStock with retry/backoff,
 * createStockAdjustmentRecord and updateProductStockQuantity (server-only throws).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

jest.mock("@/lib/sanity/client", () => ({
  sanityClient: { fetch: jest.fn() },
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

import { sanityClient } from "@/lib/sanity/client";
import { toast } from "sonner";
import {
  ValidationError,
  StockAdjustmentError,
  validateStockAdjustmentRequest,
  productExists,
  getCurrentStock,
  adjustStock,
  createStockAdjustmentRecord,
  updateProductStockQuantity,
} from "../mutations/stock-management";

import type { StockAdjustmentRequest } from "@/types/stock-management";

// Minimal valid request factory
function makeRequest(
  overrides: Partial<StockAdjustmentRequest> = {}
): StockAdjustmentRequest {
  return {
    productId: "prod-123",
    adjustmentType: "received",
    quantityChange: 10,
    reason: "Delivery from supplier",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Error classes
// ---------------------------------------------------------------------------
describe("ValidationError", () => {
  it("is an instance of Error", () => {
    const err = new ValidationError("bad input");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ValidationError);
  });

  it("has name ValidationError", () => {
    const err = new ValidationError("msg");
    expect(err.name).toBe("ValidationError");
  });

  it("preserves message", () => {
    const err = new ValidationError("test message");
    expect(err.message).toBe("test message");
  });
});

describe("StockAdjustmentError", () => {
  it("is an instance of Error", () => {
    const err = new StockAdjustmentError("fail");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(StockAdjustmentError);
  });

  it("has name StockAdjustmentError", () => {
    const err = new StockAdjustmentError("msg");
    expect(err.name).toBe("StockAdjustmentError");
  });

  it("stores error code", () => {
    const err = new StockAdjustmentError("not found", "PRODUCT_NOT_FOUND");
    expect(err.code).toBe("PRODUCT_NOT_FOUND");
  });

  it("code is undefined when not provided", () => {
    const err = new StockAdjustmentError("generic");
    expect(err.code).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// validateStockAdjustmentRequest
// ---------------------------------------------------------------------------
describe("validateStockAdjustmentRequest", () => {
  it("passes with valid received request", () => {
    expect(() => validateStockAdjustmentRequest(makeRequest())).not.toThrow();
  });

  it("passes with valid returned request", () => {
    expect(() =>
      validateStockAdjustmentRequest(
        makeRequest({ adjustmentType: "returned", quantityChange: 5 })
      )
    ).not.toThrow();
  });

  it("passes with valid sold request (negative qty)", () => {
    expect(() =>
      validateStockAdjustmentRequest(
        makeRequest({ adjustmentType: "sold", quantityChange: -5 })
      )
    ).not.toThrow();
  });

  it("passes with valid adjustment type (positive)", () => {
    expect(() =>
      validateStockAdjustmentRequest(
        makeRequest({ adjustmentType: "adjustment", quantityChange: 3 })
      )
    ).not.toThrow();
  });

  it("passes with valid adjustment type (negative)", () => {
    expect(() =>
      validateStockAdjustmentRequest(
        makeRequest({ adjustmentType: "adjustment", quantityChange: -3 })
      )
    ).not.toThrow();
  });

  // Product ID validations
  it("throws for empty productId", () => {
    expect(() =>
      validateStockAdjustmentRequest(makeRequest({ productId: "" }))
    ).toThrow(ValidationError);
  });

  it("throws for whitespace-only productId", () => {
    expect(() =>
      validateStockAdjustmentRequest(makeRequest({ productId: "   " }))
    ).toThrow(ValidationError);
  });

  it("throws for invalid productId characters", () => {
    expect(() =>
      validateStockAdjustmentRequest(makeRequest({ productId: "prod 123!" }))
    ).toThrow(ValidationError);
  });

  // Adjustment type validations
  it("throws for invalid adjustment type", () => {
    expect(() =>
      validateStockAdjustmentRequest(
        makeRequest({ adjustmentType: "invalid" as any })
      )
    ).toThrow(ValidationError);
  });

  // Quantity validations
  it("throws for zero quantity", () => {
    expect(() =>
      validateStockAdjustmentRequest(makeRequest({ quantityChange: 0 }))
    ).toThrow(ValidationError);
  });

  it("throws for NaN quantity", () => {
    expect(() =>
      validateStockAdjustmentRequest(makeRequest({ quantityChange: NaN }))
    ).toThrow(ValidationError);
  });

  it("throws for decimal quantity", () => {
    expect(() =>
      validateStockAdjustmentRequest(makeRequest({ quantityChange: 2.5 }))
    ).toThrow(ValidationError);
  });

  it("throws when received has negative quantity", () => {
    expect(() =>
      validateStockAdjustmentRequest(makeRequest({ quantityChange: -5 }))
    ).toThrow(ValidationError);
  });

  it("throws when sold has positive quantity", () => {
    expect(() =>
      validateStockAdjustmentRequest(
        makeRequest({ adjustmentType: "sold", quantityChange: 5 })
      )
    ).toThrow(ValidationError);
  });

  it("throws when damaged has positive quantity", () => {
    expect(() =>
      validateStockAdjustmentRequest(
        makeRequest({ adjustmentType: "damaged", quantityChange: 5 })
      )
    ).toThrow(ValidationError);
  });

  it("throws when transferred has positive quantity", () => {
    expect(() =>
      validateStockAdjustmentRequest(
        makeRequest({ adjustmentType: "transferred", quantityChange: 5 })
      )
    ).toThrow(ValidationError);
  });

  it("throws when quantity exceeds 1,000,000", () => {
    expect(() =>
      validateStockAdjustmentRequest(
        makeRequest({ quantityChange: 1000001 })
      )
    ).toThrow(ValidationError);
  });

  it("throws when negative quantity exceeds -1,000,000", () => {
    expect(() =>
      validateStockAdjustmentRequest(
        makeRequest({ adjustmentType: "sold", quantityChange: -1000001 })
      )
    ).toThrow(ValidationError);
  });

  // Reason validations
  it("throws for empty reason", () => {
    expect(() =>
      validateStockAdjustmentRequest(makeRequest({ reason: "" }))
    ).toThrow(ValidationError);
  });

  it("throws for whitespace-only reason", () => {
    expect(() =>
      validateStockAdjustmentRequest(makeRequest({ reason: "   " }))
    ).toThrow(ValidationError);
  });

  it("throws for reason exceeding 100 chars", () => {
    expect(() =>
      validateStockAdjustmentRequest(
        makeRequest({ reason: "x".repeat(101) })
      )
    ).toThrow(ValidationError);
  });

  // Notes validations
  it("passes with valid notes", () => {
    expect(() =>
      validateStockAdjustmentRequest(makeRequest({ notes: "Some notes" }))
    ).not.toThrow();
  });

  it("throws for notes exceeding 500 chars", () => {
    expect(() =>
      validateStockAdjustmentRequest(makeRequest({ notes: "n".repeat(501) }))
    ).toThrow(ValidationError);
  });

  // AdjustedBy validations
  it("passes with valid adjustedBy", () => {
    expect(() =>
      validateStockAdjustmentRequest(makeRequest({ adjustedBy: "user-1" }))
    ).not.toThrow();
  });

  it("throws for empty adjustedBy string", () => {
    expect(() =>
      validateStockAdjustmentRequest(makeRequest({ adjustedBy: "   " }))
    ).toThrow(ValidationError);
  });
});

// ---------------------------------------------------------------------------
// productExists
// ---------------------------------------------------------------------------
describe("productExists", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns true when product found", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce({ _id: "prod-1" });
    const result = await productExists("prod-1");
    expect(result).toBe(true);
  });

  it("returns false when product not found", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(null);
    const result = await productExists("nonexistent");
    expect(result).toBe(false);
  });

  it("passes productId as query param", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(null);
    await productExists("prod-123");
    expect(sanityClient.fetch).toHaveBeenCalledWith(
      expect.stringContaining("$productId"),
      { productId: "prod-123" }
    );
  });

  it("throws StockAdjustmentError on fetch failure", async () => {
    (sanityClient.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("DB error")
    );
    await expect(productExists("prod-1")).rejects.toThrow(StockAdjustmentError);
  });

  it("includes original error message in thrown error", async () => {
    (sanityClient.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("DB error")
    );
    await expect(productExists("prod-1")).rejects.toThrow("DB error");
  });

  it("validates productId before query", async () => {
    await expect(productExists("")).rejects.toThrow(ValidationError);
    expect(sanityClient.fetch).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getCurrentStock
// ---------------------------------------------------------------------------
describe("getCurrentStock", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns stock quantity when product found", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce({
      stockQuantity: 42,
    });
    const result = await getCurrentStock("prod-1");
    expect(result).toBe(42);
  });

  it("returns 0 when stockQuantity is null/undefined", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce({
      stockQuantity: undefined,
    });
    const result = await getCurrentStock("prod-1");
    expect(result).toBe(0);
  });

  it("throws PRODUCT_NOT_FOUND when product missing", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(null);
    try {
      await getCurrentStock("prod-missing");
      fail("Should have thrown");
    } catch (error: any) {
      expect(error).toBeInstanceOf(StockAdjustmentError);
      expect(error.code).toBe("PRODUCT_NOT_FOUND");
    }
  });

  it("throws NETWORK_ERROR on fetch failure", async () => {
    (sanityClient.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("timeout")
    );
    try {
      await getCurrentStock("prod-1");
      fail("Should have thrown");
    } catch (error: any) {
      expect(error).toBeInstanceOf(StockAdjustmentError);
      expect(error.code).toBe("NETWORK_ERROR");
    }
  });

  it("validates productId before query", async () => {
    await expect(getCurrentStock("")).rejects.toThrow(ValidationError);
  });
});

// ---------------------------------------------------------------------------
// adjustStock
// ---------------------------------------------------------------------------
describe("adjustStock", () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Mock global fetch for API calls
    fetchSpy = jest
      .spyOn(global, "fetch")
      .mockImplementation(jest.fn() as any);
  });

  afterEach(() => {
    jest.useRealTimers();
    fetchSpy.mockRestore();
  });

  it("returns response on successful adjustment", async () => {
    // getCurrentStock call
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce({
      stockQuantity: 50,
    });

    // API response
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            adjustmentId: "adj-1",
            newStock: 60,
            previousStock: 50,
            quantityChange: 10,
          },
        }),
    } as any);

    const result = await adjustStock(makeRequest());
    expect(result.newStock).toBe(60);
    expect(result.previousStock).toBe(50);
    expect(toast.success).toHaveBeenCalled();
  });

  it("validates request before making API call", async () => {
    await expect(
      adjustStock(makeRequest({ productId: "" }))
    ).rejects.toThrow(ValidationError);

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("throws INSUFFICIENT_STOCK when result would be negative", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce({
      stockQuantity: 5,
    });

    await expect(
      adjustStock(
        makeRequest({ adjustmentType: "sold", quantityChange: -10 })
      )
    ).rejects.toThrow(StockAdjustmentError);

    await expect(
      (async () => {
        (sanityClient.fetch as jest.Mock).mockResolvedValueOnce({
          stockQuantity: 5,
        });
        await adjustStock(
          makeRequest({ adjustmentType: "sold", quantityChange: -10 })
        );
      })()
    ).rejects.toMatchObject({ code: "INSUFFICIENT_STOCK" });
  });

  it("throws PRODUCT_NOT_FOUND on 404 from API", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce({
      stockQuantity: 10,
    });

    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () =>
        Promise.resolve({
          success: false,
          message: "Product not found",
        }),
    } as any);

    try {
      await adjustStock(makeRequest());
      fail("Should have thrown");
    } catch (error: any) {
      expect(error).toBeInstanceOf(StockAdjustmentError);
      expect(error.code).toBe("PRODUCT_NOT_FOUND");
    }
  });

  it("throws RACE_CONDITION on 409 from API", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce({
      stockQuantity: 10,
    });

    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: () =>
        Promise.resolve({
          success: false,
          message: "Stock modified by another process",
        }),
    } as any);

    try {
      await adjustStock(makeRequest());
      fail("Should have thrown");
    } catch (error: any) {
      expect(error).toBeInstanceOf(StockAdjustmentError);
      expect(error.code).toBe("RACE_CONDITION");
    }
  });

  it("throws VALIDATION_ERROR on 400 from API", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce({
      stockQuantity: 10,
    });

    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () =>
        Promise.resolve({
          success: false,
          message: "Invalid request",
        }),
    } as any);

    try {
      await adjustStock(makeRequest());
      fail("Should have thrown");
    } catch (error: any) {
      expect(error).toBeInstanceOf(StockAdjustmentError);
      expect(error.code).toBe("VALIDATION_ERROR");
    }
  });

  it("shows success toast with added message for positive change", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce({
      stockQuantity: 50,
    });

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            adjustmentId: "adj-2",
            newStock: 60,
            previousStock: 50,
            quantityChange: 10,
          },
        }),
    } as any);

    await adjustStock(makeRequest());
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining("added")
    );
  });

  it("shows success toast with removed message for negative change", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce({
      stockQuantity: 50,
    });

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            adjustmentId: "adj-3",
            newStock: 45,
            previousStock: 50,
            quantityChange: -5,
          },
        }),
    } as any);

    await adjustStock(
      makeRequest({ adjustmentType: "sold", quantityChange: -5 })
    );
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining("removed")
    );
  });

  it("includes currentStock in API request for optimistic locking", async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce({
      stockQuantity: 25,
    });

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: { adjustmentId: "adj-4", newStock: 35 },
        }),
    } as any);

    await adjustStock(makeRequest());

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/seller/stock/adjust",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: expect.stringContaining('"currentStock":25'),
      })
    );
  });
});

// ---------------------------------------------------------------------------
// Server-only functions (immediate throws)
// ---------------------------------------------------------------------------
describe("createStockAdjustmentRecord", () => {
  it("throws StockAdjustmentError with VALIDATION_ERROR code", async () => {
    try {
      await createStockAdjustmentRecord({
        productId: "prod-1",
        adjustmentType: "received",
        quantityChange: 10,
        previousStock: 50,
        newStock: 60,
        reason: "Test",
        adjustmentDate: new Date().toISOString(),
      });
      fail("Should have thrown");
    } catch (error: any) {
      expect(error).toBeInstanceOf(StockAdjustmentError);
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.message).toContain("server-side API route only");
    }
  });
});

describe("updateProductStockQuantity", () => {
  it("throws StockAdjustmentError with VALIDATION_ERROR code", async () => {
    try {
      await updateProductStockQuantity("prod-1", 100);
      fail("Should have thrown");
    } catch (error: any) {
      expect(error).toBeInstanceOf(StockAdjustmentError);
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.message).toContain("server-side API route only");
    }
  });
});
