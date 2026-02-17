/**
 * Tests for Two-Factor Authentication API Client
 *
 * Coverage:
 * - Enable 2FA with success/error scenarios
 * - Disable 2FA with OTP confirmation
 * - Verify 2FA OTP during login
 * - Send OTP with success/error scenarios
 * - Error handling for invalid codes, expired tokens, rate limits
 */

import { TwoFactorApi } from "../two-factor";
import { apiRequest } from "../../api-client";

// Mock api-client
jest.mock("../../api-client", () => ({
  apiRequest: jest.fn(),
}));

const mockApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

interface MockError extends Error {
  statusCode?: number;
}

function createMockError(message: string, statusCode: number): MockError {
  const error: MockError = new Error(message);
  error.statusCode = statusCode;
  return error;
}

describe("TwoFactorApi", () => {
  const mockTempToken = "temp_jwt_token_abc123";
  const mockOTPCode = "123456";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // Enable 2FA
  // =========================================================================

  describe("enable", () => {
    it("should enable 2FA successfully", async () => {
      const mockResponse = { success: true, message: "2FA enabled" };
      mockApiRequest.mockResolvedValue(mockResponse);

      const result = await TwoFactorApi.enable();

      expect(mockApiRequest).toHaveBeenCalledWith("/auth/2fa/enable", {
        method: "POST",
      });
      expect(result.success).toBe(true);
    });

    it("should handle enable failure", async () => {
      mockApiRequest.mockRejectedValue(createMockError("Phone number not verified", 400));

      await expect(TwoFactorApi.enable()).rejects.toThrow(
        "Phone number not verified"
      );
    });

    it("should handle unauthorized error when not logged in", async () => {
      mockApiRequest.mockRejectedValue(createMockError("Unauthorized", 401));

      await expect(TwoFactorApi.enable()).rejects.toThrow("Unauthorized");
    });
  });

  // =========================================================================
  // Disable 2FA
  // =========================================================================

  describe("disable", () => {
    it("should disable 2FA with valid OTP code", async () => {
      const mockResponse = { success: true, message: "2FA disabled" };
      mockApiRequest.mockResolvedValue(mockResponse);

      const result = await TwoFactorApi.disable(mockOTPCode);

      expect(mockApiRequest).toHaveBeenCalledWith("/auth/2fa/disable", {
        method: "POST",
        body: JSON.stringify({ code: mockOTPCode }),
      });
      expect(result.success).toBe(true);
    });

    it("should handle invalid OTP code error", async () => {
      mockApiRequest.mockRejectedValue(createMockError("Invalid OTP code", 400));

      await expect(TwoFactorApi.disable("000000")).rejects.toThrow(
        "Invalid OTP code"
      );
    });

    it("should handle expired OTP error", async () => {
      mockApiRequest.mockRejectedValue(createMockError("OTP has expired", 410));

      await expect(TwoFactorApi.disable(mockOTPCode)).rejects.toThrow(
        "OTP has expired"
      );
    });
  });

  // =========================================================================
  // Verify 2FA OTP (Login Flow)
  // =========================================================================

  describe("verify", () => {
    it("should verify OTP and return auth tokens", async () => {
      const mockResponse = {
        success: true,
        data: {
          accessToken: "jwt_access_token",
          refreshToken: "jwt_refresh_token",
          expiresIn: 3600,
          tokenType: "Bearer",
          user: {
            id: "user-123",
            email: "test@example.com",
            firstName: "Test",
            lastName: "User",
            role: "BUYER",
            emailVerified: true,
          },
        },
      };
      mockApiRequest.mockResolvedValue(mockResponse);

      const result = await TwoFactorApi.verify(mockOTPCode, mockTempToken);

      expect(mockApiRequest).toHaveBeenCalledWith("/auth/2fa/verify", {
        method: "POST",
        body: JSON.stringify({
          code: mockOTPCode,
          tempToken: mockTempToken,
          rememberDevice: false,
        }),
      });
      expect(result.success).toBe(true);
      expect(result.data?.accessToken).toBe("jwt_access_token");
      expect(result.data?.user.email).toBe("test@example.com");
    });

    it("should pass rememberDevice flag when true", async () => {
      const mockResponse = { success: true, data: { accessToken: "token" } };
      mockApiRequest.mockResolvedValue(mockResponse);

      await TwoFactorApi.verify(mockOTPCode, mockTempToken, true);

      expect(mockApiRequest).toHaveBeenCalledWith("/auth/2fa/verify", {
        method: "POST",
        body: JSON.stringify({
          code: mockOTPCode,
          tempToken: mockTempToken,
          rememberDevice: true,
        }),
      });
    });

    it("should default rememberDevice to false", async () => {
      const mockResponse = { success: true, data: { accessToken: "token" } };
      mockApiRequest.mockResolvedValue(mockResponse);

      await TwoFactorApi.verify(mockOTPCode, mockTempToken);

      const callBody = JSON.parse(
        (mockApiRequest.mock.calls[0][1] as RequestInit).body as string
      );
      expect(callBody.rememberDevice).toBe(false);
    });

    it("should handle invalid OTP during verification", async () => {
      mockApiRequest.mockRejectedValue(createMockError("Invalid verification code", 401));

      await expect(
        TwoFactorApi.verify("000000", mockTempToken)
      ).rejects.toThrow("Invalid verification code");
    });

    it("should handle expired temp token", async () => {
      mockApiRequest.mockRejectedValue(createMockError("Token has expired", 401));

      await expect(
        TwoFactorApi.verify(mockOTPCode, "expired_token")
      ).rejects.toThrow("Token has expired");
    });

    it("should handle too many verification attempts", async () => {
      mockApiRequest.mockRejectedValue(createMockError("Too many attempts. Please try again later.", 429));

      await expect(
        TwoFactorApi.verify(mockOTPCode, mockTempToken)
      ).rejects.toThrow("Too many attempts");
    });
  });

  // =========================================================================
  // Send OTP
  // =========================================================================

  describe("sendOTP", () => {
    it("should send OTP successfully", async () => {
      const mockResponse = {
        success: true,
        message: "OTP sent",
        phoneNumber: "+63 *** *** **67",
        expiresIn: 300,
      };
      mockApiRequest.mockResolvedValue(mockResponse);

      const result = await TwoFactorApi.sendOTP(mockTempToken);

      expect(mockApiRequest).toHaveBeenCalledWith("/auth/2fa/send", {
        method: "POST",
        body: JSON.stringify({ tempToken: mockTempToken }),
      });
      expect(result.success).toBe(true);
      expect(result.message).toBe("OTP sent");
      expect(result.expiresIn).toBe(300);
    });

    it("should handle rate limit on OTP send", async () => {
      mockApiRequest.mockRejectedValue(createMockError("Rate limit exceeded. Try again in 60 seconds.", 429));

      await expect(TwoFactorApi.sendOTP(mockTempToken)).rejects.toThrow(
        "Rate limit exceeded"
      );
    });

    it("should handle invalid temp token on send", async () => {
      mockApiRequest.mockRejectedValue(createMockError("Invalid or expired token", 401));

      await expect(TwoFactorApi.sendOTP("bad_token")).rejects.toThrow(
        "Invalid or expired token"
      );
    });

    it("should handle server error on send", async () => {
      mockApiRequest.mockRejectedValue(createMockError("Internal server error", 500));

      await expect(TwoFactorApi.sendOTP(mockTempToken)).rejects.toThrow(
        "Internal server error"
      );
    });
  });
});
