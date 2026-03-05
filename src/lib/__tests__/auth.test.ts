/**
 * Tests for src/lib/auth.ts
 *
 * Covers every exported function:
 *   isAuthenticated, isAuthenticatedSync, getAuthTokenInfo,
 *   setAuthToken, logout, logoutEverywhere, refreshToken
 */

// ---------------------------------------------------------------------------
// Module mocks (hoisted by Jest before imports)
// ---------------------------------------------------------------------------

jest.mock("@/lib/firebase", () => ({
  signOutFirebase: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/api/user", () => ({
  UserApi: { clearCache: jest.fn() },
}));

jest.mock("@/lib/cookies", () => ({
  removeCookie: jest.fn(),
  clearAllCookies: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import {
  isAuthenticated,
  isAuthenticatedSync,
  getAuthTokenInfo,
  setAuthToken,
  logout,
  logoutEverywhere,
  refreshToken,
} from "@/lib/auth";

import { signOutFirebase } from "@/lib/firebase";
import { UserApi } from "@/lib/api/user";
import { removeCookie, clearAllCookies } from "@/lib/cookies";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal Response-like object for mocking fetch */
function ok(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
    text: jest.fn().mockResolvedValue(JSON.stringify(body)),
    headers: new Headers(),
  } as unknown as Response;
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe("src/lib/auth", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
    // Reset document.cookie between tests
    Object.defineProperty(document, "cookie", { writable: true, value: "" });
    jest.clearAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  // ----- isAuthenticated ---------------------------------------------------

  describe("isAuthenticated()", () => {
    it("returns true when API reports hasAuthToken", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        ok({ hasAuthToken: true }),
      );
      expect(await isAuthenticated()).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith("/api/auth/get-token");
    });

    it("returns false when API reports hasAuthToken: false", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        ok({ hasAuthToken: false }),
      );
      expect(await isAuthenticated()).toBe(false);
    });

    it("returns false when API responds with non-ok status", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(ok({}, 401));
      expect(await isAuthenticated()).toBe(false);
    });

    it("returns false when fetch throws (network error)", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("offline"));
      expect(await isAuthenticated()).toBe(false);
    });

    it("returns false when response body has no hasAuthToken field", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(ok({}));
      expect(await isAuthenticated()).toBe(false);
    });
  });

  // ----- isAuthenticatedSync -----------------------------------------------

  describe("isAuthenticatedSync()", () => {
    it("returns true when document.cookie contains auth-token=", () => {
      Object.defineProperty(document, "cookie", {
        writable: true,
        value: "auth-token=abc123; theme=dark",
      });
      expect(isAuthenticatedSync()).toBe(true);
    });

    it("returns false when document.cookie is empty", () => {
      Object.defineProperty(document, "cookie", { writable: true, value: "" });
      expect(isAuthenticatedSync()).toBe(false);
    });

    it("returns false when other cookies exist but not auth-token", () => {
      Object.defineProperty(document, "cookie", {
        writable: true,
        value: "refreshToken=xyz; user=john",
      });
      expect(isAuthenticatedSync()).toBe(false);
    });
  });

  // ----- getAuthTokenInfo --------------------------------------------------

  describe("getAuthTokenInfo()", () => {
    it("returns correct token info from API", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        ok({ hasAuthToken: true, hasRefreshToken: true }),
      );
      expect(await getAuthTokenInfo()).toEqual({
        hasAuthToken: true,
        hasRefreshToken: true,
      });
    });

    it("returns both false when API is not ok", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(ok({}, 500));
      expect(await getAuthTokenInfo()).toEqual({
        hasAuthToken: false,
        hasRefreshToken: false,
      });
    });

    it("returns both false on network error", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("timeout"));
      expect(await getAuthTokenInfo()).toEqual({
        hasAuthToken: false,
        hasRefreshToken: false,
      });
    });

    it("defaults missing hasRefreshToken to false", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        ok({ hasAuthToken: true }),
      );
      expect(await getAuthTokenInfo()).toEqual({
        hasAuthToken: true,
        hasRefreshToken: false,
      });
    });
  });

  // ----- setAuthToken ------------------------------------------------------

  describe("setAuthToken()", () => {
    it("sends correct payload and returns true on success", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(ok({ success: true }));

      const result = await setAuthToken("access-123", "refresh-456", true);

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith("/api/auth/set-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: "access-123",
          refreshToken: "refresh-456",
          rememberMe: true,
        }),
        credentials: "include",
      });
    });

    it("defaults rememberMe to false and omits refreshToken when not provided", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(ok({}));
      await setAuthToken("tok");

      const body = JSON.parse(
        (global.fetch as jest.Mock).mock.calls[0][1].body,
      );
      expect(body.rememberMe).toBe(false);
      expect(body.refreshToken).toBeUndefined();
    });

    it("returns false when API responds with error status", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(ok({}, 500));
      expect(await setAuthToken("tok")).toBe(false);
    });

    it("returns false when fetch throws", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("net"));
      expect(await setAuthToken("tok")).toBe(false);
    });
  });

  // ----- logout ------------------------------------------------------------

  describe("logout()", () => {
    beforeEach(() => {
      // Default: all fetch calls succeed
      (global.fetch as jest.Mock).mockResolvedValue(ok({}));
    });

    it("calls clear-tokens API route", async () => {
      await logout();
      expect(global.fetch).toHaveBeenCalledWith("/api/auth/clear-tokens", {
        method: "POST",
        credentials: "include",
      });
    });

    it("calls removeCookie for each client-side cookie", async () => {
      await logout();
      expect(removeCookie).toHaveBeenCalledWith("refreshToken");
      expect(removeCookie).toHaveBeenCalledWith("user");
      expect(removeCookie).toHaveBeenCalledWith("mash-wishlist");
      expect(removeCookie).toHaveBeenCalledWith("cart");
      expect(removeCookie).toHaveBeenCalledWith("mash-cart");
      expect(removeCookie).toHaveBeenCalledWith("google_auth_redirect");
    });

    it("calls clearAllCookies for full cleanup", async () => {
      await logout();
      expect(clearAllCookies).toHaveBeenCalled();
    });

    it("calls signOutFirebase", async () => {
      await logout();
      expect(signOutFirebase).toHaveBeenCalled();
    });

    it("calls UserApi.clearCache", async () => {
      await logout();
      expect(UserApi.clearCache).toHaveBeenCalled();
    });

    it("does not throw when clear-tokens API fails", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("API down"));
      await expect(logout()).resolves.toBeUndefined();
    });

    it("does not throw when signOutFirebase rejects", async () => {
      (signOutFirebase as jest.Mock).mockRejectedValue(
        new Error("Firebase err"),
      );
      await expect(logout()).resolves.toBeUndefined();
    });

    it("does not throw when UserApi.clearCache throws", async () => {
      (UserApi.clearCache as jest.Mock).mockImplementation(() => {
        throw new Error("cache err");
      });
      await expect(logout()).resolves.toBeUndefined();
    });
  });

  // ----- logoutEverywhere --------------------------------------------------

  describe("logoutEverywhere()", () => {
    it("calls backend /auth/logout with logoutAll and returns true", async () => {
      (global.fetch as jest.Mock).mockResolvedValue(ok({}));

      const result = await logoutEverywhere();

      expect(result).toBe(true);

      // Verify backend call
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/auth/logout"),
        expect.objectContaining({
          method: "POST",
          credentials: "include",
          body: JSON.stringify({ logoutAll: true }),
        }),
      );
    });

    it("returns false but still runs local logout when backend returns error", async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (typeof url === "string" && url.includes("/auth/logout")) {
          return Promise.resolve(ok({}, 500));
        }
        return Promise.resolve(ok({}));
      });

      expect(await logoutEverywhere()).toBe(false);
      // local logout evidence
      expect(clearAllCookies).toHaveBeenCalled();
    });

    it("returns false but still runs local logout when backend throws", async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (typeof url === "string" && url.includes("/auth/logout")) {
          return Promise.reject(new Error("network"));
        }
        return Promise.resolve(ok({}));
      });

      expect(await logoutEverywhere()).toBe(false);
      expect(clearAllCookies).toHaveBeenCalled();
    });
  });

  // ----- refreshToken ------------------------------------------------------

  describe("refreshToken()", () => {
    it("refreshes successfully and sets new tokens", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(
          ok({ data: { accessToken: "new-at", refreshToken: "new-rt" } }),
        )
        .mockResolvedValueOnce(ok({})); // setAuthToken internal

      expect(await refreshToken()).toBe(true);

      // Verify refresh call
      const refreshCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(refreshCall[0]).toContain("/auth/refresh-token");
      expect(refreshCall[1].method).toBe("POST");
      expect(refreshCall[1].credentials).toBe("include");

      // Verify setAuthToken was called
      const setTokenBody = JSON.parse(
        (global.fetch as jest.Mock).mock.calls[1][1].body,
      );
      expect(setTokenBody.accessToken).toBe("new-at");
      expect(setTokenBody.refreshToken).toBe("new-rt");
    });

    it("handles flat response format (no data wrapper)", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(
          ok({ accessToken: "flat-at", refreshToken: "flat-rt" }),
        )
        .mockResolvedValueOnce(ok({}));

      expect(await refreshToken()).toBe(true);
      const body = JSON.parse(
        (global.fetch as jest.Mock).mock.calls[1][1].body,
      );
      expect(body.accessToken).toBe("flat-at");
    });

    it("returns false and triggers logout on 401", async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (typeof url === "string" && url.includes("/auth/refresh-token"))
          return Promise.resolve(ok({}, 401));
        return Promise.resolve(ok({}));
      });

      expect(await refreshToken()).toBe(false);
      expect(clearAllCookies).toHaveBeenCalled(); // logout was called
    });

    it("returns false and triggers logout on 403", async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (typeof url === "string" && url.includes("/auth/refresh-token"))
          return Promise.resolve(ok({}, 403));
        return Promise.resolve(ok({}));
      });

      expect(await refreshToken()).toBe(false);
      expect(clearAllCookies).toHaveBeenCalled();
    });

    it("returns false on network error without triggering logout", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("offline"));

      expect(await refreshToken()).toBe(false);
      expect(clearAllCookies).not.toHaveBeenCalled();
    });

    it("returns false when response has no accessToken", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(ok({ data: {} }));
      expect(await refreshToken()).toBe(false);
    });

    it("returns false when setAuthToken fails", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(
          ok({ data: { accessToken: "t", refreshToken: "r" } }),
        )
        .mockResolvedValueOnce(ok({}, 500)); // setAuthToken fails

      expect(await refreshToken()).toBe(false);
    });
  });
});