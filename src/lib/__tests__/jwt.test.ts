/**
 * Tests for src/lib/jwt.ts
 * JWT token decode and extraction utilities - pure logic, zero external deps
 */
import {
  decodeJWT,
  getUserIdFromToken,
  getEmailFromToken,
  getRoleFromToken,
  isTokenExpired,
} from "../jwt";

// Helper: create a fake JWT with given payload
function fakeJWT(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = "fake-signature";
  return `${header}.${body}.${sig}`;
}

describe("jwt utilities", () => {
  // -- decodeJWT --------------------------------------------------
  describe("decodeJWT", () => {
    it("decodes a valid JWT and returns the payload", () => {
      const token = fakeJWT({ sub: "user-1", email: "a@b.com", role: "ADMIN" });
      const decoded = decodeJWT(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.sub).toBe("user-1");
      expect(decoded?.email).toBe("a@b.com");
      expect(decoded?.role).toBe("ADMIN");
    });

    it("returns null for an empty string", () => {
      expect(decodeJWT("")).toBeNull();
    });

    it("returns null when the token has fewer than 3 parts", () => {
      expect(decodeJWT("only-one-part")).toBeNull();
      expect(decodeJWT("header.payload")).toBeNull();
    });

    it("returns null when the token has more than 3 parts", () => {
      expect(decodeJWT("a.b.c.d")).toBeNull();
    });

    it("returns null for a non-JSON payload", () => {
      const header = Buffer.from("{}").toString("base64url");
      const body = Buffer.from("not-json").toString("base64url");
      expect(decodeJWT(`${header}.${body}.sig`)).toBeNull();
    });

    it("handles payload with exp and iat timestamps", () => {
      const now = Math.floor(Date.now() / 1000);
      const token = fakeJWT({ iat: now, exp: now + 3600 });
      const decoded = decodeJWT(token);
      expect(decoded?.iat).toBe(now);
      expect(decoded?.exp).toBe(now + 3600);
    });

    it("handles payload with extra custom fields", () => {
      const token = fakeJWT({ sub: "1", custom: "value", nested: { a: 1 } });
      const decoded = decodeJWT(token);
      expect(decoded?.custom).toBe("value");
      expect(decoded?.nested).toEqual({ a: 1 });
    });

    it("handles base64url characters (+ / =) correctly", () => {
      const token = fakeJWT({ sub: "a+b/c=d" });
      const decoded = decodeJWT(token);
      expect(decoded?.sub).toBe("a+b/c=d");
    });

    it("handles unicode content in payload", () => {
      const token = fakeJWT({ name: "Jose Rizal" });
      const decoded = decodeJWT(token);
      expect(decoded?.name).toBe("Jose Rizal");
    });
  });

  // -- getUserIdFromToken -----------------------------------------
  describe("getUserIdFromToken", () => {
    it("extracts the sub field as user ID", () => {
      const token = fakeJWT({ sub: "user-abc-123" });
      expect(getUserIdFromToken(token)).toBe("user-abc-123");
    });

    it("returns null when sub is missing", () => {
      const token = fakeJWT({ email: "a@b.com" });
      expect(getUserIdFromToken(token)).toBeNull();
    });

    it("returns null for an invalid token", () => {
      expect(getUserIdFromToken("garbage")).toBeNull();
    });
  });

  // -- getEmailFromToken ------------------------------------------
  describe("getEmailFromToken", () => {
    it("extracts the email field", () => {
      const token = fakeJWT({ email: "test@mash.com" });
      expect(getEmailFromToken(token)).toBe("test@mash.com");
    });

    it("returns null when email is missing", () => {
      const token = fakeJWT({ sub: "1" });
      expect(getEmailFromToken(token)).toBeNull();
    });

    it("returns null for an invalid token", () => {
      expect(getEmailFromToken("bad.token")).toBeNull();
    });
  });

  // -- getRoleFromToken -------------------------------------------
  describe("getRoleFromToken", () => {
    it("extracts the role field", () => {
      const token = fakeJWT({ role: "SELLER" });
      expect(getRoleFromToken(token)).toBe("SELLER");
    });

    it("returns null when role is missing", () => {
      const token = fakeJWT({ sub: "1" });
      expect(getRoleFromToken(token)).toBeNull();
    });

    it("returns null for an invalid token", () => {
      expect(getRoleFromToken("")).toBeNull();
    });
  });

  // -- isTokenExpired ---------------------------------------------
  describe("isTokenExpired", () => {
    it("returns false for a token expiring in the future", () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const token = fakeJWT({ exp: futureExp });
      expect(isTokenExpired(token)).toBe(false);
    });

    it("returns true for a token that expired in the past", () => {
      const pastExp = Math.floor(Date.now() / 1000) - 60;
      const token = fakeJWT({ exp: pastExp });
      expect(isTokenExpired(token)).toBe(true);
    });

    it("returns true when there is no exp field", () => {
      const token = fakeJWT({ sub: "1" });
      expect(isTokenExpired(token)).toBe(true);
    });

    it("returns true for an invalid token", () => {
      expect(isTokenExpired("invalid")).toBe(true);
    });

    it("returns true when exp is exactly now (boundary)", () => {
      const nowSec = Math.floor(Date.now() / 1000);
      const token = fakeJWT({ exp: nowSec });
      expect(isTokenExpired(token)).toBe(true);
    });
  });
});
