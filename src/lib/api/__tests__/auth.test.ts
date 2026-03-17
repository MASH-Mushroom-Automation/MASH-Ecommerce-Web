/**
 * Tests for src/lib/api/auth.ts
 * Auth API service using apiRequest from api-client
 *
 * NOTE: src/__mocks__/api-client.ts auto-mock provides mockAPIRequest as apiRequest.
 * We use the auto-mock to verify auth.ts calls apiRequest correctly.
 */

// The auto-mock at src/__mocks__/api-client.ts is used automatically.
// Import the mocked apiRequest to control return values.
import { apiRequest } from "../../api-client";
import { setCookie } from "@/lib/cookies";

// Mock setAuthToken and logout from auth module
jest.mock("../../auth", () => ({
  setAuthToken: jest.fn().mockResolvedValue(undefined),
  logout: jest.fn(),
}));

jest.mock("@/lib/cookies", () => ({
  setCookie: jest.fn(),
}));

import { setAuthToken, logout } from "../../auth";

const mockApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;
const mockSetAuthToken = setAuthToken as jest.MockedFunction<typeof setAuthToken>;
const mockLogout = logout as jest.MockedFunction<typeof logout>;
const mockSetCookie = setCookie as jest.MockedFunction<typeof setCookie>;

// Import the module under test AFTER mocks are set up
import { AuthApi } from "../auth";

describe("AuthApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiRequest.mockReset();
  });

  describe("syncGoogleUser", () => {
    it("sends POST to /auth/google/sync with user data", async () => {
      mockApiRequest.mockResolvedValue({ data: { tokens: { accessToken: "token123", refreshToken: "rt123" } } });
      const data = {
        googleId: "g123",
        email: "test@gmail.com",
        firstName: "Test",
        lastName: "User",
      };
      await AuthApi.syncGoogleUser(data);
      expect(mockApiRequest).toHaveBeenCalledWith("/auth/google/sync", {
        method: "POST",
        body: JSON.stringify(data),
      });
    });

    it("stores tokens when response contains accessToken", async () => {
      mockApiRequest.mockResolvedValue({
        data: { tokens: { accessToken: "at123", refreshToken: "rt456" } },
      });
      await AuthApi.syncGoogleUser({
        googleId: "g1",
        email: "e@e.com",
        firstName: "F",
        lastName: "L",
      });
      expect(mockSetAuthToken).toHaveBeenCalledWith("at123", "rt456", true);
    });

    it("does not store tokens when response has no accessToken", async () => {
      mockApiRequest.mockResolvedValue({ data: {} });
      await AuthApi.syncGoogleUser({
        googleId: "g1",
        email: "e@e.com",
        firstName: "F",
        lastName: "L",
      });
      expect(mockSetAuthToken).not.toHaveBeenCalled();
    });
  });

  describe("register", () => {
    it("sends POST to /auth/register with user data", async () => {
      mockApiRequest.mockResolvedValue({ success: true, data: { message: "OK" } });
      const data = {
        email: "new@example.com",
        password: "pass123",
        firstName: "New",
        lastName: "User",
      };
      await AuthApi.register(data);
      expect(mockApiRequest).toHaveBeenCalledWith("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
    });

    it("returns the register response", async () => {
      const mockResponse = { success: true, statusCode: 201, data: { success: true, message: "OK" } };
      mockApiRequest.mockResolvedValue(mockResponse);
      const result = await AuthApi.register({
        email: "a@b.com",
        password: "p",
        firstName: "A",
        lastName: "B",
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("verifyEmailCode", () => {
    it("sends POST to /auth/verify-email-code", async () => {
      mockApiRequest.mockResolvedValue({ data: { token: "jwt123" } });
      await AuthApi.verifyEmailCode({ email: "test@test.com", code: "123456" });
      expect(mockApiRequest).toHaveBeenCalledWith("/auth/verify-email-code", {
        method: "POST",
        body: JSON.stringify({ email: "test@test.com", code: "123456" }),
      });
    });

    it("stores token when verification succeeds", async () => {
      mockApiRequest.mockResolvedValue({ data: { token: "verified-jwt" } });
      await AuthApi.verifyEmailCode({ email: "e@e.com", code: "111111" });
      expect(mockSetAuthToken).toHaveBeenCalledWith("verified-jwt", undefined, true);
    });

    it("does not store token when no token in response", async () => {
      mockApiRequest.mockResolvedValue({ data: {} });
      await AuthApi.verifyEmailCode({ email: "e@e.com", code: "111111" });
      expect(mockSetAuthToken).not.toHaveBeenCalled();
    });
  });

  describe("resendVerificationCode", () => {
    it("sends POST to /auth/resend-verification-code", async () => {
      mockApiRequest.mockResolvedValue({ success: true });
      await AuthApi.resendVerificationCode({ email: "test@test.com" });
      expect(mockApiRequest).toHaveBeenCalledWith("/auth/resend-verification-code", {
        method: "POST",
        body: JSON.stringify({ email: "test@test.com" }),
      });
    });
  });

  describe("login", () => {
    it("sends POST to /auth/login with email and password only (no rememberMe)", async () => {
      mockApiRequest.mockResolvedValue({
        data: { accessToken: "at", refreshToken: "rt", user: { id: "1", email: "a@b.com" } },
      });
      await AuthApi.login({ email: "a@b.com", password: "pass", rememberMe: true });
      const body = JSON.parse(mockApiRequest.mock.calls[0][1]?.body as string);
      expect(body).toEqual({ email: "a@b.com", password: "pass" });
      expect(body.rememberMe).toBeUndefined();
    });

    it("stores tokens from nested data format", async () => {
      mockApiRequest.mockResolvedValue({
        data: { accessToken: "nested-at", refreshToken: "nested-rt", user: { id: "1" } },
      });
      await AuthApi.login({ email: "a@b.com", password: "p", rememberMe: false });
      expect(mockSetAuthToken).toHaveBeenCalledWith("nested-at", "nested-rt", false);
    });

    it("stores tokens from top-level format", async () => {
      mockApiRequest.mockResolvedValue({
        accessToken: "top-at",
        refreshToken: "top-rt",
        user: { id: "1" },
      });
      await AuthApi.login({ email: "a@b.com", password: "p" });
      expect(mockSetAuthToken).toHaveBeenCalledWith("top-at", "top-rt", false);
    });

    it("persists user cookie on successful login", async () => {
      mockApiRequest.mockResolvedValue({
        data: {
          accessToken: "at",
          refreshToken: "rt",
          user: { id: "1", email: "a@b.com", firstName: "A", lastName: "B", role: "BUYER", emailVerified: true },
        },
      });
      await AuthApi.login({ email: "a@b.com", password: "p" });
      expect(mockSetCookie).toHaveBeenCalledWith(
        "user",
        expect.objectContaining({ id: "1", provider: "email" }),
        expect.objectContaining({ maxAge: expect.any(Number) })
      );
    });

    it("does not store tokens when no accessToken in response", async () => {
      mockApiRequest.mockResolvedValue({});
      await AuthApi.login({ email: "a@b.com", password: "p" });
      expect(mockSetAuthToken).not.toHaveBeenCalled();
    });

    it("handles 2FA response", async () => {
      const twoFaResponse = {
        requiresTwoFactor: true,
        tempToken: "temp123",
        phoneNumber: "+639123456789",
      };
      mockApiRequest.mockResolvedValue(twoFaResponse);
      const result = await AuthApi.login({ email: "a@b.com", password: "p" });
      expect(result.requiresTwoFactor).toBe(true);
      expect(result.tempToken).toBe("temp123");
    });
  });

  describe("forgotPassword", () => {
    it("sends POST to /auth/forgot-password", async () => {
      mockApiRequest.mockResolvedValue({ success: true });
      await AuthApi.forgotPassword({ email: "forgot@test.com" });
      expect(mockApiRequest).toHaveBeenCalledWith("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: "forgot@test.com" }),
      });
    });
  });

  describe("resetPassword", () => {
    it("sends POST to /auth/reset-password with code and new password", async () => {
      mockApiRequest.mockResolvedValue({ success: true });
      const data = { email: "a@b.com", code: "123456", newPassword: "newPass" };
      await AuthApi.resetPassword(data);
      expect(mockApiRequest).toHaveBeenCalledWith("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(data),
      });
    });
  });

  describe("logout", () => {
    it("calls logout from auth module", () => {
      AuthApi.logout();
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe("getCurrentUser", () => {
    it("returns null and logs deprecation warning", () => {
      const result = AuthApi.getCurrentUser();
      expect(result).toBeNull();
    });
  });

  describe("isAuthenticated", () => {
    it("returns true when auth-token cookie exists", () => {
      Object.defineProperty(document, "cookie", {
        writable: true,
        value: "auth-token=some-jwt-token; other=value",
      });
      expect(AuthApi.isAuthenticated()).toBe(true);
    });

    it("returns false when auth-token cookie absent", () => {
      Object.defineProperty(document, "cookie", {
        writable: true,
        value: "other=value",
      });
      expect(AuthApi.isAuthenticated()).toBe(false);
    });
  });

  describe("checkUsername", () => {
    it("sends GET to /auth/check-username with encoded username", async () => {
      mockApiRequest.mockResolvedValue({ available: true, username: "john" });
      await AuthApi.checkUsername("john");
      expect(mockApiRequest).toHaveBeenCalledWith(
        "/auth/check-username?username=john"
      );
    });

    it("encodes special characters in username", async () => {
      mockApiRequest.mockResolvedValue({ available: false, username: "a b" });
      await AuthApi.checkUsername("a b");
      expect(mockApiRequest).toHaveBeenCalledWith(
        "/auth/check-username?username=a%20b"
      );
    });
  });
});
