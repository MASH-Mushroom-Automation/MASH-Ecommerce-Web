/**
 * Tests for src/lib/token-refresh.ts
 * Token refresh service with decode, refresh deduplication, and interval checks
 */

// Mock the auth module BEFORE importing token-refresh
jest.mock("../auth", () => ({
  refreshToken: jest.fn(),
  logout: jest.fn(),
}));

import { decodeToken, refreshAccessToken, ensureValidToken, startTokenRefreshCheck, stopTokenRefreshCheck, getTokenInfo } from "../token-refresh";

// Get mocked auth functions
const mockRefreshToken = jest.requireMock("../auth").refreshToken as jest.Mock;

describe("decodeToken", () => {
  it("decodes a valid JWT payload", () => {
    const payload = { sub: "user-1", exp: 9999999999, iat: 1000000000 };
    const token = `header.${btoa(JSON.stringify(payload))}.sig`;
    const decoded = decodeToken(token);
    expect(decoded).toEqual(expect.objectContaining({ sub: "user-1" }));
    expect(decoded?.exp).toBe(9999999999);
  });

  it("returns null for token with wrong number of parts", () => {
    expect(decodeToken("nope")).toBeNull();
    expect(decodeToken("a.b")).toBeNull();
    expect(decodeToken("a.b.c.d")).toBeNull();
  });

  it("returns null for invalid base64 payload", () => {
    expect(decodeToken("a.!!!.c")).toBeNull();
  });

  it("returns null for non-JSON payload", () => {
    const nonJson = btoa("not-json");
    expect(decodeToken(`h.${nonJson}.s`)).toBeNull();
  });

  it("handles minimal payload", () => {
    const token = `h.${btoa(JSON.stringify({}))}.s`;
    const decoded = decodeToken(token);
    expect(decoded).toEqual({});
  });
});

describe("refreshAccessToken", () => {
  beforeEach(() => {
    mockRefreshToken.mockReset();
    // Need to clear the internal refreshPromise - we do this by ensuring tests don't leave dangling promises
  });

  it("calls auth.refreshToken and returns true on success", async () => {
    mockRefreshToken.mockResolvedValueOnce(true);
    const result = await refreshAccessToken();
    expect(result).toBe(true);
    expect(mockRefreshToken).toHaveBeenCalledTimes(1);
  });

  it("returns false when auth.refreshToken returns false", async () => {
    mockRefreshToken.mockResolvedValueOnce(false);
    const result = await refreshAccessToken();
    expect(result).toBe(false);
  });

  it("returns false when auth.refreshToken throws", async () => {
    mockRefreshToken.mockRejectedValueOnce(new Error("Network failure"));
    const result = await refreshAccessToken();
    expect(result).toBe(false);
  });

  it("deduplicates concurrent refresh calls", async () => {
    let resolveRefresh: (value: boolean) => void;
    mockRefreshToken.mockReturnValueOnce(
      new Promise<boolean>((resolve) => { resolveRefresh = resolve; })
    );

    // Fire two concurrent refresh calls
    const p1 = refreshAccessToken();
    const p2 = refreshAccessToken();

    // Only one actual refresh call should be made
    expect(mockRefreshToken).toHaveBeenCalledTimes(1);

    // Resolve the refresh
    resolveRefresh!(true);

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toBe(true);
    expect(r2).toBe(true);
  });
});

describe("ensureValidToken", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
  });

  it("returns true when API reports valid tokens", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ hasAuthToken: true }),
    });

    const result = await ensureValidToken();
    expect(result).toBe(true);
  });

  it("returns false when API reports no tokens", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ hasAuthToken: false }),
    });

    const result = await ensureValidToken();
    expect(result).toBe(false);
  });

  it("returns false when API call fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

    const result = await ensureValidToken();
    expect(result).toBe(false);
  });

  it("returns false when fetch throws", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    const result = await ensureValidToken();
    expect(result).toBe(false);
  });
});

describe("startTokenRefreshCheck / stopTokenRefreshCheck", () => {
  it("skips starting interval in test environment", () => {
    // NODE_ENV is 'test' by default in jest
    // startTokenRefreshCheck should be a no-op
    startTokenRefreshCheck();
    // No error thrown, interval is not started
    stopTokenRefreshCheck(); // safe no-op
  });
});

describe("getTokenInfo", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
  });

  it("returns token info on successful fetch", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ hasAuthToken: true, hasRefreshToken: true }),
    });

    const info = await getTokenInfo();
    expect(info.hasToken).toBe(true);
    expect(info.hasRefreshToken).toBe(true);
    expect(info.isExpired).toBe(false);
    expect(info.expiresIn).toBe("Unknown (HTTP-only)");
  });

  it("returns all false when API returns not ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

    const info = await getTokenInfo();
    expect(info.hasToken).toBe(false);
    expect(info.hasRefreshToken).toBe(false);
    expect(info.isExpired).toBe(true);
    expect(info.isExpiringSoon).toBe(true);
    expect(info.expiresIn).toBeNull();
  });

  it("returns no-token state when hasAuthToken is false", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ hasAuthToken: false, hasRefreshToken: false }),
    });

    const info = await getTokenInfo();
    expect(info.hasToken).toBe(false);
    expect(info.isExpired).toBe(true);
    expect(info.expiresIn).toBeNull();
  });

  it("returns all false when fetch throws", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network"));

    const info = await getTokenInfo();
    expect(info.hasToken).toBe(false);
    expect(info.isExpired).toBe(true);
  });
});
