/**
 * Admin Config Tests (COV-003)
 * Tests: ADMIN_CONFIG shape, defaults, error codes, type exports
 */

import { ADMIN_CONFIG } from "../../config/admin";
import type { AdminConfig, AdminErrorCode } from "../../config/admin";

describe("ADMIN_CONFIG", () => {
  it("should have a dashboardUrl", () => {
    expect(typeof ADMIN_CONFIG.dashboardUrl).toBe("string");
    expect(ADMIN_CONFIG.dashboardUrl.length).toBeGreaterThan(0);
  });

  it("should have API configuration", () => {
    expect(ADMIN_CONFIG.api).toBeDefined();
    expect(ADMIN_CONFIG.api.version).toBe("v1");
    expect(ADMIN_CONFIG.api.timeout).toBe(30000);
    expect(typeof ADMIN_CONFIG.api.baseUrl).toBe("string");
  });

  it("should have WebSocket configuration", () => {
    expect(ADMIN_CONFIG.websocket).toBeDefined();
    expect(ADMIN_CONFIG.websocket.reconnectInterval).toBe(3000);
    expect(ADMIN_CONFIG.websocket.maxReconnectAttempts).toBe(5);
    expect(typeof ADMIN_CONFIG.websocket.url).toBe("string");
  });

  it("should have CORS configuration", () => {
    expect(ADMIN_CONFIG.cors).toBeDefined();
    expect(ADMIN_CONFIG.cors.methods).toEqual(["GET", "POST", "PUT", "DELETE"]);
    expect(ADMIN_CONFIG.cors.maxAge).toBe(86400);
    expect(ADMIN_CONFIG.cors.allowedHeaders).toContain("Authorization");
    expect(ADMIN_CONFIG.cors.allowedHeaders).toContain("Content-Type");
  });

  it("should have rate limit configuration", () => {
    expect(ADMIN_CONFIG.rateLimit).toBeDefined();
    expect(ADMIN_CONFIG.rateLimit.windowMs).toBe(60 * 1000);
    expect(typeof ADMIN_CONFIG.rateLimit.max).toBe("number");
    expect(ADMIN_CONFIG.rateLimit.max).toBeGreaterThan(0);
    expect(ADMIN_CONFIG.rateLimit.message).toBe(
      "Too many requests from admin dashboard"
    );
  });

  it("should have auth configuration", () => {
    expect(ADMIN_CONFIG.auth).toBeDefined();
    expect(ADMIN_CONFIG.auth.tokenKey).toBe("admin_token");
    expect(ADMIN_CONFIG.auth.refreshTokenKey).toBe("admin_refresh_token");
    expect(ADMIN_CONFIG.auth.tokenExpiry).toBe(3600);
    expect(ADMIN_CONFIG.auth.refreshTokenExpiry).toBe(604800);
  });

  it("should have feature flags", () => {
    expect(ADMIN_CONFIG.features).toBeDefined();
    expect(typeof ADMIN_CONFIG.features.enableWebSocket).toBe("boolean");
    expect(typeof ADMIN_CONFIG.features.enableAnalytics).toBe("boolean");
    expect(typeof ADMIN_CONFIG.features.enableActivityLogging).toBe("boolean");
    expect(typeof ADMIN_CONFIG.features.enableHealthCheck).toBe("boolean");
  });

  it("should have all 6 error codes", () => {
    const errorCodes = ADMIN_CONFIG.errorCodes;
    expect(Object.keys(errorCodes)).toHaveLength(6);
    expect(errorCodes.ADMIN001).toBe("Authentication failed");
    expect(errorCodes.ADMIN002).toBe("Invalid permissions");
    expect(errorCodes.ADMIN003).toBe("Rate limit exceeded");
    expect(errorCodes.ADMIN004).toBe("Invalid request data");
    expect(errorCodes.ADMIN005).toBe("Resource not found");
    expect(errorCodes.ADMIN006).toBe("Action not allowed");
  });

  it("should have analytics configuration", () => {
    expect(ADMIN_CONFIG.analytics).toBeDefined();
    expect(ADMIN_CONFIG.analytics.enabled).toBe(true);
    expect(ADMIN_CONFIG.analytics.sampleRate).toBe(1.0);
    expect(ADMIN_CONFIG.analytics.errorTracking).toBe(true);
  });

  it("should have monitoring configuration", () => {
    expect(ADMIN_CONFIG.monitoring).toBeDefined();
    expect(typeof ADMIN_CONFIG.monitoring.logLevel).toBe("string");
    // In test environment, should be 'debug' (not production)
    expect(ADMIN_CONFIG.monitoring.logLevel).toBe("debug");
  });

  it("should parse rate limit from env or use default 100", () => {
    // Default is 100 when env var is not set
    expect(ADMIN_CONFIG.rateLimit.max).toBe(100);
  });
});

describe("Type exports", () => {
  it("should have AdminConfig type matching ADMIN_CONFIG shape", () => {
    // Type assertion - would fail at compile time if types don't match
    const config: AdminConfig = ADMIN_CONFIG;
    expect(config).toBe(ADMIN_CONFIG);
  });

  it("should have AdminErrorCode as valid error code key", () => {
    const code: AdminErrorCode = "ADMIN001";
    expect(ADMIN_CONFIG.errorCodes[code]).toBeDefined();
  });
});
