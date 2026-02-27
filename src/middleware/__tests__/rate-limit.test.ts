/**
 * Rate Limit Middleware Tests (COV-001)
 * Tests: getCategoryForPath, checkRateLimit, applyRateLimit, resetRateLimit, getRateLimitStatus, RATE_LIMITS
 */

// Mock NextResponse to avoid edge runtime dependencies in jest
jest.mock("next/server", () => {
  class MockNextResponse {
    status: number;
    headers: Map<string, string>;
    body: string;

    constructor(body: string, init?: { status?: number; headers?: Record<string, string> }) {
      this.body = body;
      this.status = init?.status || 200;
      this.headers = new Map(Object.entries(init?.headers || {}));
    }

    json() {
      return Promise.resolve(JSON.parse(this.body));
    }
  }

  return {
    NextResponse: MockNextResponse,
    NextRequest: jest.fn(),
  };
});

import {
  RATE_LIMITS,
  checkRateLimit,
  getCategoryForPath,
  applyRateLimit,
  resetRateLimit,
  getRateLimitStatus,
} from "../rate-limit";

// Create a minimal mock that satisfies the NextRequest interface used by rate-limit
function createMockRequest(pathname: string, ip?: string) {
  const url = new URL(pathname, "http://localhost:3000");
  const headers = new Map<string, string>();
  if (ip) {
    headers.set("x-forwarded-for", ip);
  }

  return {
    ip: ip || undefined,
    headers: {
      get: (name: string) => headers.get(name) || null,
    },
    nextUrl: { pathname: url.pathname },
    url: url.toString(),
    cookies: { get: () => undefined },
  } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

describe("Rate Limit Middleware", () => {
  beforeEach(() => {
    // Reset all rate limit state between tests
    resetRateLimit("127.0.0.1", "auth-login");
    resetRateLimit("127.0.0.1", "auth-register");
    resetRateLimit("127.0.0.1", "auth-forgot-password");
    resetRateLimit("127.0.0.1", "auth-verify-email");
    resetRateLimit("127.0.0.1", "orders");
    resetRateLimit("127.0.0.1", "payments");
    resetRateLimit("127.0.0.1", "api-general");
    resetRateLimit("anonymous", "auth-login");
    resetRateLimit("anonymous", "api-general");
  });

  describe("RATE_LIMITS config", () => {
    it("should have all expected rate limit categories", () => {
      expect(RATE_LIMITS).toHaveProperty("auth-login");
      expect(RATE_LIMITS).toHaveProperty("auth-register");
      expect(RATE_LIMITS).toHaveProperty("auth-forgot-password");
      expect(RATE_LIMITS).toHaveProperty("auth-verify-email");
      expect(RATE_LIMITS).toHaveProperty("orders");
      expect(RATE_LIMITS).toHaveProperty("payments");
      expect(RATE_LIMITS).toHaveProperty("api-general");
    });

    it("should have strict limits for auth-login", () => {
      expect(RATE_LIMITS["auth-login"].maxRequests).toBe(5);
      expect(RATE_LIMITS["auth-login"].windowMs).toBe(15 * 60 * 1000);
    });

    it("should have strict limits for auth-register", () => {
      expect(RATE_LIMITS["auth-register"].maxRequests).toBe(3);
      expect(RATE_LIMITS["auth-register"].windowMs).toBe(60 * 60 * 1000);
    });

    it("should have generous limits for api-general", () => {
      expect(RATE_LIMITS["api-general"].maxRequests).toBe(100);
      expect(RATE_LIMITS["api-general"].windowMs).toBe(60 * 1000);
    });
  });

  describe("getCategoryForPath", () => {
    it("should return auth-login for login path", () => {
      expect(getCategoryForPath("/api/auth/login")).toBe("auth-login");
    });

    it("should return auth-register for register path", () => {
      expect(getCategoryForPath("/api/auth/register")).toBe("auth-register");
    });

    it("should return auth-forgot-password for forgot-password path", () => {
      expect(getCategoryForPath("/api/auth/forgot-password")).toBe(
        "auth-forgot-password"
      );
    });

    it("should return auth-verify-email for verify-email path", () => {
      expect(getCategoryForPath("/api/auth/verify-email")).toBe(
        "auth-verify-email"
      );
    });

    it("should return auth-verify-email for verify-otp path", () => {
      expect(getCategoryForPath("/api/auth/verify-otp")).toBe(
        "auth-verify-email"
      );
    });

    it("should return payments for payment path", () => {
      expect(getCategoryForPath("/api/payment/create-intent")).toBe("payments");
    });

    it("should return orders for orders path", () => {
      expect(getCategoryForPath("/api/orders")).toBe("orders");
      expect(getCategoryForPath("/api/orders/123/status")).toBe("orders");
    });

    it("should return api-general for unknown API paths", () => {
      expect(getCategoryForPath("/api/products")).toBe("api-general");
      expect(getCategoryForPath("/api/health")).toBe("api-general");
      expect(getCategoryForPath("/api/cms/faq")).toBe("api-general");
    });
  });

  describe("checkRateLimit", () => {
    it("should allow the first request", () => {
      const req = createMockRequest("/api/auth/login", "127.0.0.1");
      const result = checkRateLimit(req, "auth-login");
      expect(result).toBeNull();
    });

    it("should allow requests up to the limit", () => {
      for (let i = 0; i < RATE_LIMITS["auth-login"].maxRequests; i++) {
        const req = createMockRequest("/api/auth/login", "127.0.0.1");
        const result = checkRateLimit(req, "auth-login");
        if (i < RATE_LIMITS["auth-login"].maxRequests - 1) {
          expect(result).toBeNull();
        }
      }
    });

    it("should block requests after limit is exceeded", () => {
      // Exhaust the limit (5 for auth-login)
      for (let i = 0; i < RATE_LIMITS["auth-login"].maxRequests; i++) {
        const req = createMockRequest("/api/auth/login", "127.0.0.1");
        checkRateLimit(req, "auth-login");
      }

      // Next request should be blocked
      const req = createMockRequest("/api/auth/login", "127.0.0.1");
      const result = checkRateLimit(req, "auth-login");
      expect(result).not.toBeNull();
      expect(result!.status).toBe(429);
    });

    it("should return 429 with correct headers when rate limited", async () => {
      // Exhaust auth-login limit
      for (let i = 0; i < RATE_LIMITS["auth-login"].maxRequests; i++) {
        const req = createMockRequest("/api/auth/login", "127.0.0.1");
        checkRateLimit(req, "auth-login");
      }

      const req = createMockRequest("/api/auth/login", "127.0.0.1");
      const result = checkRateLimit(req, "auth-login")!;

      expect(result.status).toBe(429);
      expect(result.headers.get("Content-Type")).toBe("application/json");
      expect(result.headers.get("Retry-After")).toBeTruthy();
      expect(result.headers.get("X-RateLimit-Limit")).toBe("5");
      expect(result.headers.get("X-RateLimit-Remaining")).toBe("0");
      expect(result.headers.get("X-RateLimit-Reset")).toBeTruthy();

      const body = await result.json();
      expect(body.error).toBe("Too Many Requests");
      expect(body.retryAfter).toBeGreaterThan(0);
    });

    it("should track different IPs separately", () => {
      // Exhaust limit for IP 1
      for (let i = 0; i < RATE_LIMITS["auth-login"].maxRequests; i++) {
        const req = createMockRequest("/api/auth/login", "192.168.1.1");
        checkRateLimit(req, "auth-login");
      }

      // IP 2 should still be allowed
      const req2 = createMockRequest("/api/auth/login", "192.168.1.2");
      const result = checkRateLimit(req2, "auth-login");
      expect(result).toBeNull();

      // Clean up
      resetRateLimit("192.168.1.1", "auth-login");
      resetRateLimit("192.168.1.2", "auth-login");
    });

    it("should use api-general config for unknown categories", () => {
      const req = createMockRequest("/api/unknown", "127.0.0.1");
      const result = checkRateLimit(req, "nonexistent-category");
      expect(result).toBeNull(); // First request always allowed

      resetRateLimit("127.0.0.1", "nonexistent-category");
    });
  });

  describe("applyRateLimit", () => {
    it("should return null for non-API routes", () => {
      const req = createMockRequest("/shop", "127.0.0.1");
      const result = applyRateLimit(req);
      expect(result).toBeNull();
    });

    it("should return null for root path", () => {
      const req = createMockRequest("/", "127.0.0.1");
      const result = applyRateLimit(req);
      expect(result).toBeNull();
    });

    it("should apply rate limiting to API routes", () => {
      const req = createMockRequest("/api/auth/login", "127.0.0.1");
      const result = applyRateLimit(req);
      expect(result).toBeNull(); // First request allowed
    });

    it("should block API routes after limit exceeded", () => {
      for (let i = 0; i < RATE_LIMITS["auth-login"].maxRequests; i++) {
        const req = createMockRequest("/api/auth/login", "127.0.0.1");
        applyRateLimit(req);
      }

      const req = createMockRequest("/api/auth/login", "127.0.0.1");
      const result = applyRateLimit(req);
      expect(result).not.toBeNull();
      expect(result!.status).toBe(429);
    });
  });

  describe("resetRateLimit", () => {
    it("should clear rate limit for given IP and category", () => {
      // Exhaust the limit
      for (let i = 0; i < RATE_LIMITS["auth-login"].maxRequests; i++) {
        const req = createMockRequest("/api/auth/login", "127.0.0.1");
        checkRateLimit(req, "auth-login");
      }

      // Verify it's blocked
      let req = createMockRequest("/api/auth/login", "127.0.0.1");
      expect(checkRateLimit(req, "auth-login")).not.toBeNull();

      // Reset
      resetRateLimit("127.0.0.1", "auth-login");

      // Should be allowed again
      req = createMockRequest("/api/auth/login", "127.0.0.1");
      expect(checkRateLimit(req, "auth-login")).toBeNull();
    });
  });

  describe("getRateLimitStatus", () => {
    it("should return full remaining when no requests made", () => {
      const req = createMockRequest("/api/auth/login", "127.0.0.1");
      const status = getRateLimitStatus(req, "auth-login");

      expect(status.remaining).toBe(RATE_LIMITS["auth-login"].maxRequests);
      expect(status.total).toBe(RATE_LIMITS["auth-login"].maxRequests);
      expect(status.resetAt).toBeInstanceOf(Date);
    });

    it("should decrease remaining after requests", () => {
      const req = createMockRequest("/api/auth/login", "127.0.0.1");
      checkRateLimit(req, "auth-login"); // 1st request

      const status = getRateLimitStatus(req, "auth-login");
      expect(status.remaining).toBe(RATE_LIMITS["auth-login"].maxRequests - 1);
      expect(status.total).toBe(RATE_LIMITS["auth-login"].maxRequests);
    });

    it("should show 0 remaining when limit exhausted", () => {
      for (let i = 0; i < RATE_LIMITS["auth-login"].maxRequests; i++) {
        const req = createMockRequest("/api/auth/login", "127.0.0.1");
        checkRateLimit(req, "auth-login");
      }

      const req = createMockRequest("/api/auth/login", "127.0.0.1");
      const status = getRateLimitStatus(req, "auth-login");
      expect(status.remaining).toBe(0);
    });

    it("should use api-general defaults for unknown categories", () => {
      const req = createMockRequest("/api/whatever", "127.0.0.1");
      const status = getRateLimitStatus(req, "unknown-cat");
      expect(status.total).toBe(RATE_LIMITS["api-general"].maxRequests);
    });
  });
});
