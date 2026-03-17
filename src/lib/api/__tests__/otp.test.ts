/**
 * Tests for OTP API Client
 *
 * Coverage:
 * - Send OTP with success/error scenarios
 * - Verify OTP with success/error scenarios
 * - Resend OTP with success/error scenarios
 * - Error handling for rate limits, invalid codes, expired OTPs
 * - TypeScript type safety for request/response objects
 *
 * NOTE: OTP client now uses localApiRequest (plain fetch to /api/otp/*)
 *       instead of the backend apiRequest, so we mock global.fetch.
 */

import { OTPApi, OTPErrorCode } from "../otp";

// Mock global fetch (used by localApiRequest inside otp.ts)
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("OTP API Client", () => {
  const mockPhoneNumber = "+639171234567";
  const mockOTP = "123456";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper: create a mock Response for fetch
  function mockFetchResponse(data: unknown, ok = true, status = 200) {
    mockFetch.mockResolvedValueOnce({
      ok,
      status,
      json: () => Promise.resolve(data),
    });
  }

  // Helper: assert fetch was called with correct path + body
  function expectFetchCalledWith(
    path: string,
    bodyObj: Record<string, unknown>
  ) {
    expect(mockFetch).toHaveBeenCalledWith(
      path,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(bodyObj),
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      })
    );
  }

  // =========================================================================
  // Send OTP Tests
  // =========================================================================

  describe("sendOTP", () => {
    it("should send OTP successfully", async () => {
      const mockResponse = {
        success: true,
        data: {
          success: true,
          message: "OTP sent to +63 *** *** **67",
          phoneNumber: "+63 *** *** **67",
          expiresAt: "2026-02-14T15:05:00Z",
          expiresIn: 300,
        },
      };

      mockFetchResponse(mockResponse);

      const result = await OTPApi.sendOTP(mockPhoneNumber);

      expectFetchCalledWith("/api/otp/send", {
        phoneNumber: mockPhoneNumber,
        purpose: "PHONE_VERIFICATION",
      });

      expect(result.success).toBe(true);
      expect(result.data.message).toBe("OTP sent to +63 *** *** **67");
      expect(result.data.expiresIn).toBe(300);
    });

    it("should send OTP with custom purpose", async () => {
      const mockResponse = {
        success: true,
        data: {
          success: true,
          message: "OTP sent for 2FA login",
          phoneNumber: "+63 *** *** **67",
          expiresAt: "2026-02-14T15:05:00Z",
          expiresIn: 300,
        },
      };

      mockFetchResponse(mockResponse);

      await OTPApi.sendOTP(mockPhoneNumber, "2FA_LOGIN");

      expectFetchCalledWith("/api/otp/send", {
        phoneNumber: mockPhoneNumber,
        purpose: "2FA_LOGIN",
      });
    });

    it("should handle rate limit error", async () => {
      mockFetchResponse(
        {
          success: false,
          message: "Too many OTP requests. Please try again in 15 minutes.",
          data: {
            success: false,
            errorCode: OTPErrorCode.RATE_LIMIT_EXCEEDED,
            cooldownUntil: "2026-02-14T15:15:00Z",
          },
        },
        false,
        429
      );

      await expect(OTPApi.sendOTP(mockPhoneNumber)).rejects.toThrow(
        "Too many OTP requests"
      );
    });

    it("should handle invalid phone format error", async () => {
      mockFetchResponse(
        {
          success: false,
          message:
            "Phone number must be in E.164 format (e.g., +639171234567)",
          data: {
            success: false,
            errorCode: OTPErrorCode.INVALID_PHONE_FORMAT,
          },
        },
        false,
        400
      );

      await expect(OTPApi.sendOTP("09171234567")).rejects.toThrow(
        "Phone number must be in E.164 format"
      );
    });

    it("should handle Twilio API failure", async () => {
      mockFetchResponse(
        {
          success: false,
          message: "SMS delivery failed. Please try again.",
          data: {
            success: false,
            errorCode: OTPErrorCode.TWILIO_ERROR,
          },
        },
        false,
        500
      );

      await expect(OTPApi.sendOTP(mockPhoneNumber)).rejects.toThrow(
        "SMS delivery failed"
      );
    });

    it("should include attemptsRemaining when rate limit is approaching", async () => {
      const mockResponse = {
        success: true,
        data: {
          success: true,
          message: "OTP sent to +63 *** *** **67",
          phoneNumber: "+63 *** *** **67",
          expiresAt: "2026-02-14T15:05:00Z",
          expiresIn: 300,
          attemptsRemaining: 1,
        },
      };

      mockFetchResponse(mockResponse);

      const result = await OTPApi.sendOTP(mockPhoneNumber);

      expect(result.data.attemptsRemaining).toBe(1);
    });
  });

  // =========================================================================
  // Verify OTP Tests
  // =========================================================================

  describe("verifyOTP", () => {
    it("should verify OTP successfully", async () => {
      const mockResponse = {
        success: true,
        data: {
          success: true,
          verified: true,
          message: "Phone number verified successfully",
        },
      };

      mockFetchResponse(mockResponse);

      const result = await OTPApi.verifyOTP(mockPhoneNumber, mockOTP);

      expectFetchCalledWith("/api/otp/verify", {
        phoneNumber: mockPhoneNumber,
        code: mockOTP,
      });

      expect(result.success).toBe(true);
      expect(result.data.verified).toBe(true);
    });

    it("should handle invalid OTP code", async () => {
      mockFetchResponse(
        {
          success: false,
          message: "Invalid OTP code",
          data: {
            success: false,
            verified: false,
            errorCode: OTPErrorCode.INVALID_OTP,
            attemptsRemaining: 2,
          },
        },
        false,
        400
      );

      await expect(
        OTPApi.verifyOTP(mockPhoneNumber, "000000")
      ).rejects.toThrow("Invalid OTP code");
    });

    it("should handle expired OTP", async () => {
      mockFetchResponse(
        {
          success: false,
          message: "OTP has expired. Please request a new one.",
          data: {
            success: false,
            verified: false,
            errorCode: OTPErrorCode.EXPIRED_OTP,
          },
        },
        false,
        400
      );

      await expect(OTPApi.verifyOTP(mockPhoneNumber, mockOTP)).rejects.toThrow(
        "OTP has expired"
      );
    });

    it("should handle max attempts exceeded", async () => {
      mockFetchResponse(
        {
          success: false,
          message:
            "Too many failed attempts. Verification locked for 15 minutes.",
          data: {
            success: false,
            verified: false,
            errorCode: OTPErrorCode.MAX_ATTEMPTS_EXCEEDED,
            attemptsRemaining: 0,
            lockedUntil: "2026-02-14T15:15:00Z",
          },
        },
        false,
        429
      );

      await expect(OTPApi.verifyOTP(mockPhoneNumber, mockOTP)).rejects.toThrow(
        "Too many failed attempts"
      );
    });

    it("should handle OTP not found", async () => {
      mockFetchResponse(
        {
          success: false,
          message: "No OTP found for this phone number. Please request a new one.",
          data: {
            success: false,
            verified: false,
            errorCode: OTPErrorCode.OTP_NOT_FOUND,
          },
        },
        false,
        404
      );

      await expect(OTPApi.verifyOTP(mockPhoneNumber, mockOTP)).rejects.toThrow(
        "No OTP found"
      );
    });

    it("should include attemptsRemaining in successful verification", async () => {
      const mockResponse = {
        success: true,
        data: {
          success: true,
          verified: true,
          message: "Phone number verified successfully",
          attemptsRemaining: 3,
        },
      };

      mockFetchResponse(mockResponse);

      const result = await OTPApi.verifyOTP(mockPhoneNumber, mockOTP);

      expect(result.data.attemptsRemaining).toBe(3);
    });
  });

  // =========================================================================
  // Resend OTP Tests
  // =========================================================================

  describe("resendOTP", () => {
    it("should resend OTP successfully", async () => {
      const mockResponse = {
        success: true,
        data: {
          success: true,
          message: "OTP resent to +63 *** *** **67",
          phoneNumber: "+63 *** *** **67",
          expiresAt: "2026-02-14T15:05:00Z",
          expiresIn: 300,
        },
      };

      mockFetchResponse(mockResponse);

      const result = await OTPApi.resendOTP(mockPhoneNumber);

      expectFetchCalledWith("/api/otp/resend", {
        phoneNumber: mockPhoneNumber,
      });

      expect(result.success).toBe(true);
      expect(result.data.message).toBe("OTP resent to +63 *** *** **67");
    });

    it("should handle cooldown period", async () => {
      mockFetchResponse(
        {
          success: false,
          message: "Please wait 60 seconds before requesting another OTP",
          data: {
            success: false,
            errorCode: OTPErrorCode.COOLDOWN_ACTIVE,
            cooldownUntil: "2026-02-14T15:01:00Z",
          },
        },
        false,
        429
      );

      await expect(OTPApi.resendOTP(mockPhoneNumber)).rejects.toThrow(
        "Please wait 60 seconds"
      );
    });

    it("should handle OTP not found error", async () => {
      mockFetchResponse(
        {
          success: false,
          message:
            "No active OTP found. Please send a new OTP instead of resending.",
          data: {
            success: false,
            errorCode: OTPErrorCode.OTP_NOT_FOUND,
          },
        },
        false,
        404
      );

      await expect(OTPApi.resendOTP(mockPhoneNumber)).rejects.toThrow(
        "No active OTP found"
      );
    });

    it("should handle rate limit exceeded", async () => {
      mockFetchResponse(
        {
          success: false,
          message: "Too many resend attempts. Please try again later.",
          data: {
            success: false,
            errorCode: OTPErrorCode.RATE_LIMIT_EXCEEDED,
          },
        },
        false,
        429
      );

      await expect(OTPApi.resendOTP(mockPhoneNumber)).rejects.toThrow(
        "Too many resend attempts"
      );
    });

    it("should handle Twilio API failure on resend", async () => {
      mockFetchResponse(
        {
          success: false,
          message: "SMS delivery failed. Please try again.",
          data: {
            success: false,
            errorCode: OTPErrorCode.TWILIO_ERROR,
          },
        },
        false,
        500
      );

      await expect(OTPApi.resendOTP(mockPhoneNumber)).rejects.toThrow(
        "SMS delivery failed"
      );
    });

    it("should include attemptsRemaining in resend response", async () => {
      const mockResponse = {
        success: true,
        data: {
          success: true,
          message: "OTP resent to +63 *** *** **67",
          phoneNumber: "+63 *** *** **67",
          expiresAt: "2026-02-14T15:05:00Z",
          expiresIn: 300,
          attemptsRemaining: 2,
        },
      };

      mockFetchResponse(mockResponse);

      const result = await OTPApi.resendOTP(mockPhoneNumber);

      expect(result.data.attemptsRemaining).toBe(2);
    });
  });

  // =========================================================================
  // Integration Tests (API client behavior)
  // =========================================================================

  describe("API client integration", () => {
    it("should pass correct headers and method to fetch", async () => {
      const mockResponse = {
        success: true,
        data: {
          success: true,
          message: "OTP sent",
          phoneNumber: "+63 *** *** **67",
          expiresAt: "2026-02-14T15:05:00Z",
          expiresIn: 300,
        },
      };

      mockFetchResponse(mockResponse);

      await OTPApi.sendOTP(mockPhoneNumber);

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/otp/send",
        expect.objectContaining({
          method: "POST",
          body: expect.any(String),
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
    });

    it("should serialize request body as JSON", async () => {
      const mockResponse = {
        success: true,
        data: {
          success: true,
          verified: true,
          message: "Verified",
        },
      };

      mockFetchResponse(mockResponse);

      await OTPApi.verifyOTP(mockPhoneNumber, mockOTP);

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body).toEqual({
        phoneNumber: mockPhoneNumber,
        code: mockOTP,
      });
    });

    it("should properly propagate errors from fetch", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(OTPApi.sendOTP(mockPhoneNumber)).rejects.toThrow(
        "Network error"
      );
    });

    it("should handle authentication errors (401)", async () => {
      mockFetchResponse(
        {
          success: false,
          message: "Authentication required",
        },
        false,
        401
      );

      await expect(OTPApi.sendOTP(mockPhoneNumber)).rejects.toThrow(
        "Authentication required"
      );
    });

    it("should handle server errors (500)", async () => {
      mockFetchResponse(
        {
          success: false,
          message: "An unexpected error occurred",
        },
        false,
        500
      );

      await expect(OTPApi.verifyOTP(mockPhoneNumber, mockOTP)).rejects.toThrow(
        "An unexpected error occurred"
      );
    });
  });
});
