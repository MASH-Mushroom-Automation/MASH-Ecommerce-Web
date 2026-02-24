/**
 * Tests for src/lib/api-client.ts
 * Covers: apiRequest headers, credentials, error handling (400/401),
 * token refresh, redirect logic, and api convenience methods.
 *
 * IMPORTANT: Must unmock api-client because src/__mocks__/api-client.ts
 * provides an auto-mock that Jest uses by default.
 */

// Force Jest to use the REAL module, not the auto-mock in src/__mocks__/
jest.unmock("../api-client");

// Assign mock fetch BEFORE import
const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

import { apiRequest, api } from "../api-client";

beforeEach(() => {
  mockFetch.mockReset();

  // Default successful response
  mockFetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ data: "ok" }),
  });

  // Clear cookie
  Object.defineProperty(document, "cookie", {
    writable: true,
    value: "",
    configurable: true,
  });
});

function mockJsonResponse(data: unknown, status = 200, ok?: boolean) {
  return {
    ok: ok !== undefined ? ok : status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  };
}

describe("api-client", () => {
  describe("URL construction", () => {
    it("constructs URL with base URL + endpoint", async () => {
      await apiRequest("/products");
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const url: string = mockFetch.mock.calls[0][0];
      expect(url).toContain("/products");
      expect(url).toContain("api/v1");
    });

    it("constructs URL for auth endpoints", async () => {
      await apiRequest("/auth/register", { method: "POST", body: "{}" });
      const url: string = mockFetch.mock.calls[0][0];
      expect(url).toContain("/auth/register");
    });

    it("constructs URL for nested endpoints", async () => {
      await apiRequest("/users/profile");
      const url: string = mockFetch.mock.calls[0][0];
      expect(url).toContain("/users/profile");
    });
  });

  describe("request headers", () => {
    it("includes Content-Type and Accept JSON headers", async () => {
      await apiRequest("/products");
      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers["Content-Type"]).toBe("application/json");
      expect(headers["Accept"]).toBe("application/json");
    });

    it("allows custom headers to override defaults", async () => {
      await apiRequest("/products", {
        headers: { "Content-Type": "text/plain" },
      });
      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers["Content-Type"]).toBe("text/plain");
    });

    it("merges custom headers with defaults", async () => {
      await apiRequest("/products", {
        headers: { "X-Custom": "value" },
      });
      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers["Content-Type"]).toBe("application/json");
      expect(headers["X-Custom"]).toBe("value");
    });
  });

  describe("auth token from cookie", () => {
    it("sends Authorization header when auth-token cookie exists", async () => {
      Object.defineProperty(document, "cookie", {
        writable: true,
        value: "auth-token=my-jwt-token; other=val",
        configurable: true,
      });

      await apiRequest("/users/profile");
      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers["Authorization"]).toBe("Bearer my-jwt-token");
    });

    it("does not send Authorization when no auth-token cookie", async () => {
      Object.defineProperty(document, "cookie", {
        writable: true,
        value: "other=val",
        configurable: true,
      });

      await apiRequest("/products");
      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers["Authorization"]).toBeUndefined();
    });

    it("does not send Authorization when cookie string is empty", async () => {
      await apiRequest("/products");
      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers["Authorization"]).toBeUndefined();
    });

    it("decodes URI-encoded auth token", async () => {
      Object.defineProperty(document, "cookie", {
        writable: true,
        value: "auth-token=token%20with%20spaces",
        configurable: true,
      });

      await apiRequest("/orders");
      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers["Authorization"]).toBe("Bearer token with spaces");
    });
  });

  describe("credentials handling", () => {
    it("does not include credentials for public auth/login endpoint", async () => {
      await apiRequest("/auth/login", { method: "POST", body: "{}" });
      expect(mockFetch.mock.calls[0][1].credentials).toBeUndefined();
    });

    it("does not include credentials for /auth/register", async () => {
      await apiRequest("/auth/register", { method: "POST", body: "{}" });
      expect(mockFetch.mock.calls[0][1].credentials).toBeUndefined();
    });

    it("does not include credentials for /health", async () => {
      await apiRequest("/health");
      expect(mockFetch.mock.calls[0][1].credentials).toBeUndefined();
    });

    it("includes credentials for non-public endpoints without auth token", async () => {
      await apiRequest("/orders");
      expect(mockFetch.mock.calls[0][1].credentials).toBe("include");
    });

    it("does not set credentials when Authorization header is present", async () => {
      Object.defineProperty(document, "cookie", {
        writable: true,
        value: "auth-token=my-token",
        configurable: true,
      });

      await apiRequest("/orders");
      expect(mockFetch.mock.calls[0][1].credentials).toBeUndefined();
    });
  });

  describe("successful responses", () => {
    it("returns parsed JSON data", async () => {
      mockFetch.mockResolvedValueOnce(
        mockJsonResponse({ products: [{ id: 1 }] })
      );
      const result = await apiRequest("/products");
      expect(result).toEqual({ products: [{ id: 1 }] });
    });

    it("passes method and body through to fetch", async () => {
      await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "a@b.com" }),
      });
      const opts = mockFetch.mock.calls[0][1];
      expect(opts.method).toBe("POST");
      expect(opts.body).toBe(JSON.stringify({ email: "a@b.com" }));
    });

    it("passes through additional options", async () => {
      const controller = new AbortController();
      await apiRequest("/products", { signal: controller.signal });
      expect(mockFetch.mock.calls[0][1].signal).toBeDefined();
    });
  });

  describe("400 error handling", () => {
    it("throws enriched error for auth register on 400", async () => {
      mockFetch.mockResolvedValueOnce(
        mockJsonResponse(
          { error: { message: "Email already exists" }, statusCode: 400 },
          400
        )
      );

      await expect(
        apiRequest("/auth/register", { method: "POST" })
      ).rejects.toThrow("Email already exists");
    });

    it("includes statusCode and response on 400 auth error", async () => {
      mockFetch.mockResolvedValueOnce(
        mockJsonResponse(
          { error: { message: "Invalid email", type: "ValidationError" }, statusCode: 400 },
          400
        )
      );

      try {
        await apiRequest("/auth/login", { method: "POST" });
        throw new Error("Should not reach");
      } catch (err: unknown) {
        const e = err as { message: string; statusCode: number; response: { status: number; data: { message: string; error: string } } };
        if (e.message === "Should not reach") throw err;
        expect(e.statusCode).toBe(400);
        expect(e.response.status).toBe(400);
        expect(e.response.data.message).toBe("Invalid email");
        // ...data spread in source overwrites error field with full object
        expect(e.response.data.error).toEqual({ message: "Invalid email", type: "ValidationError" });
      }
    });

    it("JSON.stringifies non-string error messages", async () => {
      mockFetch.mockResolvedValueOnce(
        mockJsonResponse(
          { error: { message: { nested: "object" } } },
          400
        )
      );

      try {
        await apiRequest("/auth/register", { method: "POST" });
        throw new Error("Should not reach");
      } catch (err: unknown) {
        const e = err as Error;
        if (e.message === "Should not reach") throw err;
        expect(e.message).toContain("nested");
      }
    });

    it("uses data.message fallback for 400 auth error", async () => {
      mockFetch.mockResolvedValueOnce(
        mockJsonResponse({ message: "Bad request data" }, 400)
      );

      await expect(
        apiRequest("/auth/verify-email-code")
      ).rejects.toThrow("Bad request data");
    });

    it("uses 'Validation failed' fallback when no message exists", async () => {
      mockFetch.mockResolvedValueOnce(mockJsonResponse({}, 400));

      await expect(
        apiRequest("/auth/login", { method: "POST" })
      ).rejects.toThrow("Validation failed");
    });

    it("falls through to generic error for non-auth 400", async () => {
      mockFetch.mockResolvedValueOnce(
        mockJsonResponse({ message: "Bad params" }, 400)
      );

      try {
        await apiRequest("/products", { method: "POST" });
        throw new Error("Should not reach");
      } catch (err: unknown) {
        const e = err as { message: string; statusCode: number };
        if (e.message === "Should not reach") throw err;
        expect(e.message).toBe("Bad params");
        expect(e.statusCode).toBe(400);
      }
    });
  });

  describe("401 error handling", () => {
    it("throws immediately for auth login on 401", async () => {
      mockFetch.mockResolvedValueOnce(
        mockJsonResponse(
          { error: { message: "Invalid credentials" } },
          401
        )
      );

      await expect(
        apiRequest("/auth/login", { method: "POST" })
      ).rejects.toThrow("Invalid credentials");
    });

    it("includes enriched response for 401 auth error", async () => {
      mockFetch.mockResolvedValueOnce(
        mockJsonResponse(
          { error: { message: "Wrong password", code: "INVALID_CREDS" } },
          401
        )
      );

      try {
        await apiRequest("/auth/login", { method: "POST" });
        throw new Error("Should not reach");
      } catch (err: unknown) {
        const e = err as { message: string; statusCode: number; response: { data: { error: string } } };
        if (e.message === "Should not reach") throw err;
        expect(e.statusCode).toBe(401);
        // ...data spread in source overwrites error field with full object
        expect(e.response.data.error).toEqual({ message: "Wrong password", code: "INVALID_CREDS" });
      }
    });

    it("attempts token refresh for non-auth 401 endpoints", async () => {
      // First call: 401
      mockFetch.mockResolvedValueOnce(
        mockJsonResponse({ error: "Unauthorized" }, 401)
      );
      // Refresh call: success
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });
      // Retry call: success
      mockFetch.mockResolvedValueOnce(
        mockJsonResponse({ data: "refreshed" })
      );

      const result = await apiRequest("/orders");
      expect(result).toEqual({ data: "refreshed" });

      // Should have called: original, refresh, retry
      expect(mockFetch).toHaveBeenCalledTimes(3);
      // Second call should be the refresh endpoint
      expect(mockFetch.mock.calls[1][0]).toContain("/auth/refresh-token");
      expect(mockFetch.mock.calls[1][1].credentials).toBe("include");
    });

    it("redirects to login when refresh fails for non-auth endpoint", async () => {
      // First call: 401
      mockFetch.mockResolvedValueOnce(
        mockJsonResponse({ error: "Unauthorized" }, 401)
      );
      // Refresh call: fail
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({}),
      });
      // Clear-tokens call + any other calls
      mockFetch.mockResolvedValue({ ok: true });

      // The code sets window.location.href = "/login" which navigates in jsdom.
      // We can't easily mock location in jsdom, but we can verify:
      // 1. The error is thrown
      // 2. The refresh was attempted
      // 3. A clear-tokens call was made
      await expect(apiRequest("/orders")).rejects.toThrow("Unauthorized");

      // Should have called: original 401, refresh attempt, then clear-tokens
      expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(3);
      expect(mockFetch.mock.calls[1][0]).toContain("/auth/refresh-token");
    });
  });

  describe("generic error handling", () => {
    it("throws with message and statusCode for 404", async () => {
      mockFetch.mockResolvedValueOnce(
        mockJsonResponse({ message: "Not found" }, 404)
      );

      try {
        await apiRequest("/products/999");
        throw new Error("Should not reach");
      } catch (err: unknown) {
        const e = err as { message: string; statusCode: number };
        if (e.message === "Should not reach") throw err;
        expect(e.message).toBe("Not found");
        expect(e.statusCode).toBe(404);
      }
    });

    it("uses fallback error message for 500 with no message", async () => {
      mockFetch.mockResolvedValueOnce(mockJsonResponse({}, 500));

      try {
        await apiRequest("/products");
        throw new Error("Should not reach");
      } catch (err: unknown) {
        const e = err as Error;
        if (e.message === "Should not reach") throw err;
        expect(e.message).toContain("API Error: 500");
      }
    });

    it("uses error.message from response data", async () => {
      mockFetch.mockResolvedValueOnce(
        mockJsonResponse({ error: { message: "Server crashed" } }, 500)
      );

      try {
        await apiRequest("/products");
        throw new Error("Should not reach");
      } catch (err: unknown) {
        const e = err as Error;
        if (e.message === "Should not reach") throw err;
        expect(e.message).toBe("Server crashed");
      }
    });

    it("attaches response data to error", async () => {
      mockFetch.mockResolvedValueOnce(
        mockJsonResponse({ errorCode: "ERR_123", extra: "info" }, 422)
      );

      try {
        await apiRequest("/products");
        throw new Error("Should not reach");
      } catch (err: unknown) {
        const e = err as { message: string; response: unknown };
        if (e.message === "Should not reach") throw err;
        expect(e.response).toBeDefined();
      }
    });
  });

  describe("api convenience methods", () => {
    it("api.login sends POST to /auth/login with credentials", async () => {
      await api.login("user@test.com", "pass123");
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain("/auth/login");
      expect(opts.method).toBe("POST");
      expect(JSON.parse(opts.body)).toEqual({
        email: "user@test.com",
        password: "pass123",
      });
    });

    it("api.logout sends POST to /auth/logout", async () => {
      await api.logout();
      expect(mockFetch.mock.calls[0][0]).toContain("/auth/logout");
      expect(mockFetch.mock.calls[0][1].method).toBe("POST");
    });

    it("api.refreshToken sends POST with refreshToken body", async () => {
      await api.refreshToken("rt-123");
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain("/auth/refresh");
      expect(opts.method).toBe("POST");
      expect(JSON.parse(opts.body)).toEqual({ refreshToken: "rt-123" });
    });

    it("api.getProfile sends GET to /users/profile", async () => {
      await api.getProfile();
      expect(mockFetch.mock.calls[0][0]).toContain("/users/profile");
      expect(mockFetch.mock.calls[0][1].method).toBe("GET");
    });

    it("api.updateProfile sends PUT with data", async () => {
      await api.updateProfile({ name: "New Name" });
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain("/users/profile");
      expect(opts.method).toBe("PUT");
      expect(JSON.parse(opts.body)).toEqual({ name: "New Name" });
    });

    it("api.getProducts builds query string from params", async () => {
      await api.getProducts({ page: 1, limit: 10 });
      const url: string = mockFetch.mock.calls[0][0];
      expect(url).toContain("/products?");
      expect(url).toContain("page=1");
      expect(url).toContain("limit=10");
    });

    it("api.getProducts works without params", async () => {
      await api.getProducts();
      const url: string = mockFetch.mock.calls[0][0];
      expect(url).toContain("/products");
      expect(url).not.toContain("?");
    });

    it("api.getProduct fetches specific product by ID", async () => {
      await api.getProduct("abc-123");
      expect(mockFetch.mock.calls[0][0]).toContain("/products/abc-123");
    });
  });
});
