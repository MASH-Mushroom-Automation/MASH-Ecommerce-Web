/**
 * Tests for src/lib/sanity/mutations/inventory.ts
 * ValidationError, MutationError, updateProductStock (with retries),
 * batchUpdateProductStock, adjustProductStock, setOutOfStock, productExists
 */

// The module uses sanityClient from @/lib/sanity/client (globally mocked in jest.setup.js)
// and fetch for API calls

import {
  ValidationError,
  MutationError,
  updateProductStock,
  batchUpdateProductStock,
  adjustProductStock,
  setOutOfStock,
  productExists,
} from "../inventory";

// Get the global sanityClient mock
const mockSanityClient = jest.requireMock("@/lib/sanity/client").sanityClient;

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

// ---- Error Classes ----
describe("ValidationError", () => {
  it("should be an instance of Error", () => {
    const err = new ValidationError("test");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ValidationError);
  });

  it("should have name ValidationError", () => {
    const err = new ValidationError("bad input");
    expect(err.name).toBe("ValidationError");
    expect(err.message).toBe("bad input");
  });
});

describe("MutationError", () => {
  it("should be an instance of Error", () => {
    const err = new MutationError("mutation failed");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(MutationError);
  });

  it("should have name MutationError", () => {
    const err = new MutationError("failed");
    expect(err.name).toBe("MutationError");
  });

  it("should store attemptNumber", () => {
    const err = new MutationError("failed on attempt 3", 3);
    expect(err.attemptNumber).toBe(3);
  });
});

// ---- updateProductStock ----
describe("updateProductStock", () => {
  const successResponse = {
    success: true,
    data: {
      success: true,
      productId: "prod-123",
      oldQuantity: 10,
      newQuantity: 50,
      updatedAt: "2026-01-01T00:00:00Z",
    },
  };

  describe("validation", () => {
    it("should throw ValidationError for empty productId", async () => {
      await expect(updateProductStock("", 10)).rejects.toThrow(ValidationError);
      await expect(updateProductStock("", 10)).rejects.toThrow(
        "Product ID is required"
      );
    });

    it("should throw ValidationError for whitespace productId", async () => {
      await expect(updateProductStock("   ", 10)).rejects.toThrow(
        ValidationError
      );
    });

    it("should throw ValidationError for invalid characters in productId", async () => {
      await expect(updateProductStock("prod@123", 10)).rejects.toThrow(
        "Invalid product ID format"
      );
    });

    it("should throw ValidationError for negative quantity", async () => {
      await expect(updateProductStock("prod-123", -1)).rejects.toThrow(
        "Stock quantity cannot be negative"
      );
    });

    it("should throw ValidationError for NaN quantity", async () => {
      await expect(updateProductStock("prod-123", NaN)).rejects.toThrow(
        "Stock quantity must be a number"
      );
    });

    it("should throw ValidationError for decimal quantity", async () => {
      await expect(updateProductStock("prod-123", 10.5)).rejects.toThrow(
        "Stock quantity must be a whole number"
      );
    });

    it("should throw ValidationError for quantity exceeding max", async () => {
      await expect(
        updateProductStock("prod-123", 1000001)
      ).rejects.toThrow("Stock quantity exceeds maximum");
    });
  });

  describe("successful update", () => {
    it("should call API and return result", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(successResponse),
      });

      const resultPromise = updateProductStock("prod-123", 50);
      
      // No timers needed for success on first attempt
      const result = await resultPromise;

      expect(result).toEqual(successResponse.data);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/seller/inventory/update",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: "prod-123", newQuantity: 50 }),
        })
      );
    });

    it("should accept zero quantity", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { ...successResponse.data, newQuantity: 0 },
          }),
      });

      const result = await updateProductStock("prod-123", 0);
      expect(result.newQuantity).toBe(0);
    });
  });

  describe("retry logic", () => {
    it("should retry on failure and succeed on second attempt", async () => {
      // First attempt fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: "Server error" }),
      });

      // Second attempt succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(successResponse),
      });

      const resultPromise = updateProductStock("prod-123", 50);

      // Advance past backoff delay (1000ms for attempt 1)
      await jest.advanceTimersByTimeAsync(1000);

      const result = await resultPromise;

      expect(result).toEqual(successResponse.data);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("should throw MutationError after all retries exhausted", async () => {
      // All 3 attempts fail
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: "Server error" }),
      });

      const resultPromise = updateProductStock("prod-123", 50, 3);

      // Advance past all backoff delays (1s + 2s + buffer)
      await jest.advanceTimersByTimeAsync(5000);

      await expect(resultPromise).rejects.toThrow(MutationError);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    }, 15000);

    it("should use exponential backoff delays", async () => {
      // Track setTimeout calls for backoff
      const setTimeoutSpy = jest.spyOn(global, "setTimeout");

      // All attempts fail
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: "Server error" }),
      });

      const resultPromise = updateProductStock("prod-123", 50, 3);

      // Advance through all retries
      await jest.advanceTimersByTimeAsync(10000);

      try {
        await resultPromise;
      } catch {
        // Expected to throw
      }

      // Verify exponential: 1s for attempt 1, 2s for attempt 2
      const timeoutCalls = setTimeoutSpy.mock.calls
        .map((call) => call[1])
        .filter((ms) => ms === 1000 || ms === 2000);

      expect(timeoutCalls).toContain(1000);
      expect(timeoutCalls).toContain(2000);

      setTimeoutSpy.mockRestore();
    });

    it("should respect custom maxRetries", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: "Server error" }),
      });

      const resultPromise = updateProductStock("prod-123", 50, 1);

      // Only 1 attempt, no backoff
      await expect(resultPromise).rejects.toThrow(MutationError);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});

// ---- batchUpdateProductStock ----
describe("batchUpdateProductStock", () => {
  it("should update multiple products", async () => {
    const mockResult = {
      success: true,
      data: {
        success: true,
        productId: "prod-1",
        oldQuantity: 5,
        newQuantity: 20,
        updatedAt: "2026-01-01T00:00:00Z",
      },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResult),
    });

    const updates = [
      { productId: "prod-1", newQuantity: 20 },
      { productId: "prod-2", newQuantity: 30 },
    ];

    const results = await batchUpdateProductStock(updates);

    expect(results).toHaveLength(2);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("should continue on individual failures", async () => {
    // First succeeds, second fails validation
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            success: true,
            productId: "prod-1",
            oldQuantity: 5,
            newQuantity: 20,
            updatedAt: "2026-01-01T00:00:00Z",
          },
        }),
    });

    const updates = [
      { productId: "prod-1", newQuantity: 20 },
      { productId: "", newQuantity: 30 }, // Invalid - empty productId
    ];

    const results = await batchUpdateProductStock(updates);

    expect(results).toHaveLength(2);
    expect(results[0].success).toBe(true);
    expect(results[1].success).toBe(false);
    expect(results[1].error).toBeDefined();
  });

  it("should handle empty updates array", async () => {
    const results = await batchUpdateProductStock([]);
    expect(results).toHaveLength(0);
  });
});

// ---- adjustProductStock ----
describe("adjustProductStock", () => {
  it("should add stock (positive delta)", async () => {
    // getCurrentStock fetch
    mockSanityClient.fetch.mockResolvedValueOnce({ stockQuantity: 10 });

    // updateProductStock API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            success: true,
            productId: "prod-123",
            oldQuantity: 10,
            newQuantity: 15,
            updatedAt: "2026-01-01T00:00:00Z",
          },
        }),
    });

    const result = await adjustProductStock("prod-123", 5);

    expect(result.newQuantity).toBe(15);
  });

  it("should subtract stock (negative delta)", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce({ stockQuantity: 20 });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            success: true,
            productId: "prod-123",
            oldQuantity: 20,
            newQuantity: 15,
            updatedAt: "2026-01-01T00:00:00Z",
          },
        }),
    });

    const result = await adjustProductStock("prod-123", -5);

    expect(result.newQuantity).toBe(15);
  });

  it("should throw ValidationError if resulting quantity is negative", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce({ stockQuantity: 3 });

    await expect(adjustProductStock("prod-123", -10)).rejects.toThrow(
      ValidationError
    );
  });

  it("should throw ValidationError for non-number delta", async () => {
    await expect(
      adjustProductStock("prod-123", "five" as unknown as number)
    ).rejects.toThrow("Delta must be a number");
  });

  it("should throw MutationError if product not found", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(null);

    await expect(adjustProductStock("prod-123", 5)).rejects.toThrow(
      MutationError
    );
  });
});

// ---- setOutOfStock ----
describe("setOutOfStock", () => {
  it("should set quantity to 0", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            success: true,
            productId: "prod-123",
            oldQuantity: 50,
            newQuantity: 0,
            updatedAt: "2026-01-01T00:00:00Z",
          },
        }),
    });

    const result = await setOutOfStock("prod-123");

    expect(result.newQuantity).toBe(0);
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/seller/inventory/update",
      expect.objectContaining({
        body: JSON.stringify({ productId: "prod-123", newQuantity: 0 }),
      })
    );
  });

  it("should validate productId", async () => {
    await expect(setOutOfStock("")).rejects.toThrow(ValidationError);
  });
});

// ---- productExists ----
describe("productExists", () => {
  it("should return true if product found", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce({ _id: "prod-123" });

    const exists = await productExists("prod-123");
    expect(exists).toBe(true);
  });

  it("should return false if product not found", async () => {
    mockSanityClient.fetch.mockResolvedValueOnce(null);

    const exists = await productExists("nonexistent");
    expect(exists).toBe(false);
  });

  it("should return false on fetch error", async () => {
    mockSanityClient.fetch.mockRejectedValueOnce(new Error("Network error"));

    const exists = await productExists("prod-123");
    expect(exists).toBe(false);
  });

  it("should validate productId", async () => {
    await expect(productExists("")).rejects.toThrow(ValidationError);
  });

  it("should reject invalid format", async () => {
    await expect(productExists("prod@bad!")).rejects.toThrow(
      "Invalid product ID format"
    );
  });
});
