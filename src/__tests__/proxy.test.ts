/**
 * Proxy Middleware Tests (COV-001)
 * Tests: proxy(), route protection, auth detection, security headers
 */

// Mock next/server to avoid edge runtime dependency (ResponseCookies)
// The factory function must be self-contained (no external references due to hoisting)
jest.mock("next/server", () => {
  const createMockResponse = (status: number, locationUrl?: string) => {
    const headers = new Map<string, string>();
    if (locationUrl) {
      headers.set("location", locationUrl);
    }
    return {
      status,
      headers: {
        set: (key: string, val: string) => headers.set(key, val),
        get: (key: string) => headers.get(key) || null,
      },
    };
  };

  return {
    NextResponse: {
      next: jest.fn(() => createMockResponse(200)),
      redirect: jest.fn((url: URL) => createMockResponse(307, url.toString())),
    },
  };
});

// Mock rate-limit
jest.mock("@/middleware/rate-limit", () => ({
  applyRateLimit: jest.fn().mockReturnValue(null),
}));

import { proxy, config } from "@/proxy";
import { applyRateLimit } from "@/middleware/rate-limit";

// Helper to create a minimal mock NextRequest
function createRequest(
  pathname: string,
  cookies?: Record<string, string>
) {
  const url = new URL(pathname, "http://localhost:3000");
  const cookieStore = new Map<string, { name: string; value: string }>();

  if (cookies) {
    for (const [name, value] of Object.entries(cookies)) {
      cookieStore.set(name, { name, value });
    }
  }

  return {
    nextUrl: url,
    url: url.toString(),
    cookies: {
      get: (name: string) => cookieStore.get(name),
      getAll: () => Array.from(cookieStore.values()),
      has: (name: string) => cookieStore.has(name),
      set: (name: string, value: string) =>
        cookieStore.set(name, { name, value }),
    },
    headers: {
      get: () => null,
    },
    ip: "127.0.0.1",
  } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

describe("Proxy Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Route Protection - Unauthenticated", () => {
    it("should redirect unauthenticated users from /checkout to /login", () => {
      const req = createRequest("/checkout");
      const res = proxy(req);

      expect(res.status).toBe(307); // redirect
      const location = res.headers.get("location");
      expect(location).toContain("/login");
      expect(location).toContain("redirect=%2Fcheckout");
    });

    it("should redirect unauthenticated users from /seller paths", () => {
      const req = createRequest("/seller/dashboard");
      const res = proxy(req);

      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/login");
    });

    it("should redirect unauthenticated users from /profile/my-information", () => {
      const req = createRequest("/profile/my-information");
      const res = proxy(req);

      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/login");
      expect(res.headers.get("location")).toContain(
        "redirect=%2Fprofile%2Fmy-information"
      );
    });

    it("should redirect unauthenticated users from /wishlist", () => {
      const req = createRequest("/wishlist");
      const res = proxy(req);

      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/login");
    });

    it("should redirect unauthenticated users from /start-selling", () => {
      const req = createRequest("/start-selling");
      const res = proxy(req);

      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/login");
    });
  });

  describe("Route Protection - Authenticated via auth-token", () => {
    it("should allow authenticated users to access /checkout", () => {
      const req = createRequest("/checkout", {
        "auth-token": "valid-jwt-token",
      });
      const res = proxy(req);

      // Should NOT redirect - should return next()
      expect(res.status).not.toBe(307);
    });

    it("should allow authenticated users to access /seller paths", () => {
      const req = createRequest("/seller/orders", {
        "auth-token": "valid-jwt-token",
      });
      const res = proxy(req);

      expect(res.status).not.toBe(307);
    });

    it("should allow authenticated users to access /profile/my-information", () => {
      const req = createRequest("/profile/my-information", {
        "auth-token": "valid-jwt-token",
      });
      const res = proxy(req);

      expect(res.status).not.toBe(307);
    });
  });

  describe("Route Protection - Authenticated via firebase-auth", () => {
    it("should allow Firebase-authenticated users to access protected routes", () => {
      const req = createRequest("/checkout", {
        "firebase-auth": "firebase-token",
      });
      const res = proxy(req);

      expect(res.status).not.toBe(307);
    });

    it("should allow Firebase-authenticated users to access /seller", () => {
      const req = createRequest("/seller", {
        "firebase-auth": "firebase-token",
      });
      const res = proxy(req);

      expect(res.status).not.toBe(307);
    });
  });

  describe("Public Routes", () => {
    const publicPaths = [
      "/",
      "/shop",
      "/product/some-slug",
      "/about",
      "/grower/123",
      "/contact",
      "/faq",
      "/privacy",
      "/terms",
    ];

    publicPaths.forEach((path) => {
      it(`should allow unauthenticated access to ${path}`, () => {
        const req = createRequest(path);
        const res = proxy(req);

        expect(res.status).not.toBe(307);
      });
    });
  });

  describe("Security Headers", () => {
    it("should add Content-Security-Policy header", () => {
      const req = createRequest("/");
      const res = proxy(req);

      const csp = res.headers.get("Content-Security-Policy");
      expect(csp).toBeTruthy();
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src");
      expect(csp).toContain("frame-ancestors 'none'");
    });

    it("should add X-Frame-Options header", () => {
      const req = createRequest("/");
      const res = proxy(req);

      expect(res.headers.get("X-Frame-Options")).toBe("DENY");
    });

    it("should add X-Content-Type-Options header", () => {
      const req = createRequest("/");
      const res = proxy(req);

      expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    });

    it("should add X-XSS-Protection header", () => {
      const req = createRequest("/");
      const res = proxy(req);

      expect(res.headers.get("X-XSS-Protection")).toBe("1; mode=block");
    });

    it("should add Referrer-Policy header", () => {
      const req = createRequest("/");
      const res = proxy(req);

      expect(res.headers.get("Referrer-Policy")).toBe(
        "strict-origin-when-cross-origin"
      );
    });

    it("should add Permissions-Policy header", () => {
      const req = createRequest("/");
      const res = proxy(req);

      const pp = res.headers.get("Permissions-Policy");
      expect(pp).toContain("geolocation=(self)");
      expect(pp).toContain("camera=()");
      expect(pp).toContain("microphone=()");
    });

    it("should add security headers to protected routes for authenticated users", () => {
      const req = createRequest("/checkout", {
        "auth-token": "valid-jwt",
      });
      const res = proxy(req);

      expect(res.headers.get("X-Frame-Options")).toBe("DENY");
      expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    });
  });

  describe("Rate Limiting Integration", () => {
    it("should call applyRateLimit for API routes", () => {
      const req = createRequest("/api/auth/login");
      proxy(req);

      expect(applyRateLimit).toHaveBeenCalledWith(req);
    });

    it("should not call applyRateLimit for non-API routes", () => {
      const req = createRequest("/shop");
      proxy(req);

      expect(applyRateLimit).not.toHaveBeenCalled();
    });

    it("should return 429 when rate limited", () => {
      const mockRateLimitResponse = { status: 429 };
      (applyRateLimit as jest.Mock).mockReturnValueOnce(mockRateLimitResponse);

      const req = createRequest("/api/auth/login");
      const res = proxy(req);

      expect(res.status).toBe(429);
    });
  });

  describe("Config", () => {
    it("should export a matcher config", () => {
      expect(config).toBeDefined();
      expect(config.matcher).toBeDefined();
      expect(Array.isArray(config.matcher)).toBe(true);
      expect(config.matcher.length).toBeGreaterThan(0);
    });
  });
});
