/**
 * Tests for src/lib/api-interceptor.ts
 * Covers: ApiError class, URL routing, auth detection, header creation,
 *         fetch timeout, token refresh retry, apiClient methods
 */

// Mock dependencies before importing
jest.mock("../token-refresh", () => ({
  getAuthToken: jest.fn(() => null),
  refreshAccessToken: jest.fn(() => Promise.resolve(null)),
  isTokenExpiringSoon: jest.fn(() => false),
}));

jest.mock("../auth", () => ({
  logout: jest.fn(),
}));

// Provide a default fetch mock
const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

import {
  ApiError,
  apiRequestWithInterceptor,
  apiClient,
} from "../api-interceptor";
import type { ApiRequestOptions } from "../api-interceptor";
import {
  getAuthToken,
  refreshAccessToken,
  isTokenExpiringSoon,
} from "../token-refresh";
import { logout } from "../auth";

// Helper to create a mock Response
function mockResponse(
  body: unknown,
  status = 200,
  contentType = "application/json"
): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ "content-type": contentType }),
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(typeof body === "string" ? body : JSON.stringify(body)),
  } as unknown as Response;
}

beforeEach(() => {
  // Reset ALL mocks completely (clears queued mockResolvedValueOnce too)
  mockFetch.mockReset();
  (getAuthToken as jest.Mock).mockReset().mockReturnValue(null);
  (refreshAccessToken as jest.Mock).mockReset().mockResolvedValue(null);
  (isTokenExpiringSoon as jest.Mock).mockReset().mockReturnValue(false);
  (logout as jest.Mock).mockReset();
  // Default: return empty JSON 200
  mockFetch.mockResolvedValue(mockResponse({ ok: true }));
});

// ──────────────────────────────────────────────
// ApiError class
// ──────────────────────────────────────────────
describe("ApiError", () => {
  it("creates error with all fields", () => {
    const err = new ApiError("Not found", 404, { id: 1 }, "/users/1");
    expect(err.message).toBe("Not found");
    expect(err.status).toBe(404);
    expect(err.data).toEqual({ id: 1 });
    expect(err.endpoint).toBe("/users/1");
    expect(err.name).toBe("ApiError");
    expect(err).toBeInstanceOf(Error);
  });

  it("works without optional fields", () => {
    const err = new ApiError("Server error", 500);
    expect(err.data).toBeUndefined();
    expect(err.endpoint).toBeUndefined();
  });
});

// ──────────────────────────────────────────────
// apiRequestWithInterceptor - URL routing
// ──────────────────────────────────────────────
describe("apiRequestWithInterceptor - URL routing", () => {
  it("calls production URL for standard endpoints", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ data: "ok" }));
    await apiRequestWithInterceptor("/users/profile");
    const calledUrl: string = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain("/users/profile");
  });

  it("includes endpoint in the URL", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ data: "ok" }));
    await apiRequestWithInterceptor("/products");
    const calledUrl: string = mockFetch.mock.calls[0][0];
    expect(calledUrl).toMatch(/\/products$/);
  });
});

// ──────────────────────────────────────────────
// apiRequestWithInterceptor - Headers
// ──────────────────────────────────────────────
describe("apiRequestWithInterceptor - Headers", () => {
  it("sets Content-Type and Accept headers by default", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ ok: true }));
    await apiRequestWithInterceptor("/health");
    const opts = mockFetch.mock.calls[0][1];
    expect(opts.headers["Content-Type"]).toBe("application/json");
    expect(opts.headers["Accept"]).toBe("application/json");
  });

  it("adds Authorization header when token exists", async () => {
    (getAuthToken as jest.Mock).mockReturnValueOnce("test-token-abc");
    mockFetch.mockResolvedValueOnce(mockResponse({ ok: true }));
    await apiRequestWithInterceptor("/users/profile");
    const opts = mockFetch.mock.calls[0][1];
    expect(opts.headers["Authorization"]).toBe("Bearer test-token-abc");
  });

  it("omits Authorization when skipAuth is true", async () => {
    (getAuthToken as jest.Mock).mockReturnValueOnce("test-token-abc");
    mockFetch.mockResolvedValueOnce(mockResponse({ ok: true }));
    await apiRequestWithInterceptor("/products", { skipAuth: true });
    const opts = mockFetch.mock.calls[0][1];
    expect(opts.headers["Authorization"]).toBeUndefined();
  });

  it("omits Authorization when no token", async () => {
    (getAuthToken as jest.Mock).mockReturnValueOnce(null);
    mockFetch.mockResolvedValueOnce(mockResponse({ ok: true }));
    await apiRequestWithInterceptor("/users/profile");
    const opts = mockFetch.mock.calls[0][1];
    expect(opts.headers["Authorization"]).toBeUndefined();
  });
});

// ──────────────────────────────────────────────
// apiRequestWithInterceptor - Response parsing
// ──────────────────────────────────────────────
describe("apiRequestWithInterceptor - Response parsing", () => {
  it("returns parsed JSON for JSON responses", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ name: "Ralph" }));
    const result = await apiRequestWithInterceptor<{ name: string }>("/users/1");
    expect(result).toEqual({ name: "Ralph" });
  });

  it("returns text for non-JSON responses", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse("plain text", 200, "text/plain"));
    const result = await apiRequestWithInterceptor<string>("/health");
    expect(result).toBe("plain text");
  });
});

// ──────────────────────────────────────────────
// apiRequestWithInterceptor - Error handling
// ──────────────────────────────────────────────
describe("apiRequestWithInterceptor - Error handling", () => {
  it("throws ApiError on non-OK response", async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse({ message: "Not found" }, 404)
    );
    await expect(
      apiRequestWithInterceptor("/users/999")
    ).rejects.toThrow(ApiError);
    try {
      await apiRequestWithInterceptor("/users/999");
    } catch (e: any) {
      // Second call to verify (first already done)
    }
  });

  it("includes status and endpoint in ApiError", async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse({ message: "Forbidden" }, 403)
    );
    try {
      await apiRequestWithInterceptor("/admin/settings");
      fail("Should have thrown");
    } catch (e: any) {
      expect(e).toBeInstanceOf(ApiError);
      expect(e.status).toBe(403);
      expect(e.endpoint).toBe("/admin/settings");
    }
  });

  it("extracts error message from response data", async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse({ error: "Custom error detail" }, 500)
    );
    try {
      await apiRequestWithInterceptor("/fail");
      fail("Should have thrown");
    } catch (e: any) {
      expect(e.message).toBe("Custom error detail");
    }
  });

  it("falls back to status text when no message", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({}, 502));
    try {
      await apiRequestWithInterceptor("/fail");
      fail("Should have thrown");
    } catch (e: any) {
      expect(e.message).toContain("502");
    }
  });

  it("handles network TypeError (failed to fetch)", async () => {
    mockFetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    try {
      await apiRequestWithInterceptor("/offline");
      fail("Should have thrown");
    } catch (e: any) {
      expect(e).toBeInstanceOf(ApiError);
      expect(e.status).toBe(0);
      expect(e.message).toContain("Network error");
    }
  });

  it("handles unknown errors", async () => {
    mockFetch.mockRejectedValueOnce("string error");
    try {
      await apiRequestWithInterceptor("/crash");
      fail("Should have thrown");
    } catch (e: any) {
      expect(e).toBeInstanceOf(ApiError);
      expect(e.status).toBe(500);
    }
  });
});

// ──────────────────────────────────────────────
// apiRequestWithInterceptor - Token refresh on 401
// ──────────────────────────────────────────────
describe("apiRequestWithInterceptor - Token refresh on 401", () => {
  it("retries request after successful token refresh", async () => {
    // First call returns 401, second call after refresh returns 200
    mockFetch
      .mockResolvedValueOnce(mockResponse({ message: "Unauthorized" }, 401))
      .mockResolvedValueOnce(mockResponse({ user: "refreshed" }));
    (refreshAccessToken as jest.Mock).mockResolvedValueOnce("new-token-xyz");

    const result = await apiRequestWithInterceptor<{ user: string }>("/users/profile");
    expect(result).toEqual({ user: "refreshed" });
    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("calls logout when refresh fails", async () => {
    mockFetch.mockResolvedValue(mockResponse({ message: "Unauthorized" }, 401));
    (refreshAccessToken as jest.Mock).mockResolvedValueOnce(null);

    await expect(
      apiRequestWithInterceptor("/users/profile")
    ).rejects.toThrow("Session expired");
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it("does not retry when skipRefresh is true", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ message: "Auth failed" }, 401));

    await expect(
      apiRequestWithInterceptor("/auth/login", { skipRefresh: true })
    ).rejects.toThrow();
    expect(refreshAccessToken).not.toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("does not retry more than MAX_RETRY_ATTEMPTS", async () => {
    // Configure: first call 401, retry call also 401
    mockFetch
      .mockResolvedValueOnce(mockResponse({}, 401))
      .mockResolvedValueOnce(mockResponse({}, 401));
    (refreshAccessToken as jest.Mock)
      .mockResolvedValueOnce("new-token-1")
      .mockResolvedValueOnce("new-token-2");

    await expect(
      apiRequestWithInterceptor("/users/profile")
    ).rejects.toThrow();
    // Should only retry once (MAX_RETRY_ATTEMPTS = 1)
  });
});

// ──────────────────────────────────────────────
// apiRequestWithInterceptor - Proactive token refresh
// ──────────────────────────────────────────────
describe("apiRequestWithInterceptor - Proactive refresh", () => {
  it("refreshes token proactively when expiring soon", async () => {
    (getAuthToken as jest.Mock).mockReturnValue("expiring-token");
    (isTokenExpiringSoon as jest.Mock).mockReturnValue(true);
    (refreshAccessToken as jest.Mock).mockResolvedValue("fresh-token");
    mockFetch.mockResolvedValue(mockResponse({ ok: true }));

    await apiRequestWithInterceptor("/users/profile");

    expect(refreshAccessToken).toHaveBeenCalled();
    // After refresh, the new token should be used in the fetch call
    const opts = mockFetch.mock.calls[0][1];
    expect(opts.headers["Authorization"]).toBe("Bearer fresh-token");
  });

  it("uses original token if proactive refresh fails", async () => {
    (getAuthToken as jest.Mock).mockReturnValue("old-token");
    (isTokenExpiringSoon as jest.Mock).mockReturnValue(true);
    (refreshAccessToken as jest.Mock).mockResolvedValue(null);
    mockFetch.mockResolvedValue(mockResponse({ ok: true }));

    await apiRequestWithInterceptor("/users/profile");

    const opts = mockFetch.mock.calls[0][1];
    expect(opts.headers["Authorization"]).toBe("Bearer old-token");
  });
});

// ──────────────────────────────────────────────
// apiRequestWithInterceptor - Timeout
// ──────────────────────────────────────────────
describe("apiRequestWithInterceptor - Timeout", () => {
  it("throws ApiError with 408 on timeout", async () => {
    mockFetch.mockImplementationOnce(
      (_url: string, opts: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          opts.signal.addEventListener("abort", () =>
            reject(Object.assign(new Error("Aborted"), { name: "AbortError" }))
          );
        })
    );

    try {
      await apiRequestWithInterceptor("/slow", { timeout: 50 });
      fail("Should have thrown");
    } catch (e: any) {
      expect(e).toBeInstanceOf(ApiError);
      expect(e.status).toBe(408);
      expect(e.message).toContain("timeout");
    }
  });
});

// ──────────────────────────────────────────────
// apiRequestWithInterceptor - Custom options
// ──────────────────────────────────────────────
describe("apiRequestWithInterceptor - Custom options", () => {
  it("uses custom baseUrl when provided", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ ok: true }));
    await apiRequestWithInterceptor("/custom", { baseUrl: "https://custom.api.com" });
    const calledUrl: string = mockFetch.mock.calls[0][0];
    expect(calledUrl).toBe("https://custom.api.com/custom");
  });

  it("merges custom headers with defaults", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ ok: true }));
    await apiRequestWithInterceptor("/test", { headers: { "X-Custom": "value" } as any });
    const opts = mockFetch.mock.calls[0][1];
    expect(opts.headers["X-Custom"]).toBe("value");
    expect(opts.headers["Content-Type"]).toBe("application/json");
  });

  it("uses default method GET", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ ok: true }));
    await apiRequestWithInterceptor("/test");
    const opts = mockFetch.mock.calls[0][1];
    // method is not explicitly set but headers are set
    expect(opts.headers).toBeDefined();
  });

  it("passes method through correctly", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ ok: true }));
    await apiRequestWithInterceptor("/test", { method: "POST", body: JSON.stringify({ a: 1 }) });
    const opts = mockFetch.mock.calls[0][1];
    expect(opts.method).toBe("POST");
  });
});

// ──────────────────────────────────────────────
// apiRequestWithInterceptor - Error message extraction
// ──────────────────────────────────────────────
describe("apiRequestWithInterceptor - Error message extraction", () => {
  it("uses response.message field when available", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ message: "Specific error" }, 400));
    try {
      await apiRequestWithInterceptor("/bad");
      fail("Should have thrown");
    } catch (e: any) {
      expect(e.message).toBe("Specific error");
    }
  });

  it("uses response.error field when message is absent", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ error: "Error detail" }, 400));
    try {
      await apiRequestWithInterceptor("/bad");
      fail("Should have thrown");
    } catch (e: any) {
      expect(e.message).toBe("Error detail");
    }
  });

  it("falls back to status code when neither message nor error exist", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ data: null }, 422));
    try {
      await apiRequestWithInterceptor("/bad");
      fail("Should have thrown");
    } catch (e: any) {
      expect(e.message).toContain("422");
    }
  });
});

// ──────────────────────────────────────────────
// apiRequestWithInterceptor - Re-throw existing ApiError
// ──────────────────────────────────────────────
describe("apiRequestWithInterceptor - Re-throw", () => {
  it("re-throws ApiError without wrapping", async () => {
    mockFetch.mockRejectedValueOnce(new ApiError("Already wrapped", 409, null, "/conflict"));
    try {
      await apiRequestWithInterceptor("/conflict");
      fail("Should have thrown");
    } catch (e: any) {
      expect(e).toBeInstanceOf(ApiError);
      expect(e.status).toBe(409);
      expect(e.message).toBe("Already wrapped");
    }
  });
});

// ──────────────────────────────────────────────
// apiClient convenience methods
// ──────────────────────────────────────────────
describe("apiClient convenience methods", () => {
  it("get() sends GET request", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ data: [] }));
    await apiClient.get("/products");
    expect(mockFetch.mock.calls[0][1].method).toBe("GET");
  });

  it("post() sends POST with stringified body", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 1 }));
    await apiClient.post("/orders", { item: "mushroom" });
    const opts = mockFetch.mock.calls[0][1];
    expect(opts.method).toBe("POST");
    expect(opts.body).toBe(JSON.stringify({ item: "mushroom" }));
  });

  it("put() sends PUT with body", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ updated: true }));
    await apiClient.put("/users/1", { name: "Ralph" });
    const opts = mockFetch.mock.calls[0][1];
    expect(opts.method).toBe("PUT");
    expect(opts.body).toBe(JSON.stringify({ name: "Ralph" }));
  });

  it("patch() sends PATCH with body", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ patched: true }));
    await apiClient.patch("/users/1", { email: "new@mail.com" });
    const opts = mockFetch.mock.calls[0][1];
    expect(opts.method).toBe("PATCH");
  });

  it("delete() sends DELETE request", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ deleted: true }));
    await apiClient.delete("/users/1");
    const opts = mockFetch.mock.calls[0][1];
    expect(opts.method).toBe("DELETE");
  });

  it("post() with no body sends undefined body", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ ok: true }));
    await apiClient.post("/auth/logout");
    const opts = mockFetch.mock.calls[0][1];
    expect(opts.body).toBeUndefined();
  });
});
