/**
 * Tests for OTP API Client
 *
 * Coverage:
 * - Send OTP with success/error scenarios
 * - Verify OTP with success/error scenarios
 * - Resend OTP with success/error scenarios
 * - Error handling for rate limits, invalid codes, expired OTPs
 * - TypeScript type safety for request/response objects
 */

import { OTPApi, OTPErrorCode } from "../otp";
import { apiRequest } from "../../api-client";

// Mock api-client
jest.mock("../../api-client", () => ({
  apiRequest: jest.fn(),
}));

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

      (apiRequest as jest.Mock).mockResolvedValue(mockResponse);

      const result = await OTPApi.sendOTP(mockPhoneNumber);

      expect(apiRequest).toHaveBeenCalledWith("/otp/send", {
        method: "POST",
        body: JSON.stringify({
          phoneNumber: mockPhoneNumber,
          purpose: "PHONE_VERIFICATION",
        }),
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

      (apiRequest as jest.Mock).mockResolvedValue(mockResponse);

      await OTPApi.sendOTP(mockPhoneNumber, "2FA_LOGIN");

      expect(apiRequest).toHaveBeenCalledWith("/otp/send", {
        method: "POST",
        body: JSON.stringify({
          phoneNumber: mockPhoneNumber,
          purpose: "2FA_LOGIN",
        }),
      });
    });

    it("should handle rate limit error", async () => {
      const mockError = new Error("Rate limit exceeded");
      (mockError as any).statusCode = 429;
      (mockError as any).response = {
        data: {
          success: false,
          message: "Too many OTP requests. Please try again in 15 minutes.",
          errorCode: OTPErrorCode.RATE_LIMIT_EXCEEDED,
          cooldownUntil: "2026-02-14T15:15:00Z",
        },
      };

      (apiRequest as jest.Mock).mockRejectedValue(mockError);

      await expect(OTPApi.sendOTP(mockPhoneNumber)).rejects.toThrow(
        "Rate limit exceeded"
      );
    });

    it("should handle invalid phone format error", async () => {
      const mockError = new Error("Invalid phone number format");
      (mockError as any).statusCode = 400;
      (mockError as any).response = {
        data: {
          success: false,
          message:
            "Phone number must be in E.164 format (e.g., +639171234567)",
          errorCode: OTPErrorCode.INVALID_PHONE_FORMAT,
        },
      };

      (apiRequest as jest.Mock).mockRejectedValue(mockError);

      await expect(OTPApi.sendOTP("09171234567")).rejects.toThrow(
        "Invalid phone number format"
      );
    });

    it("should handle Twilio API failure", async () => {
      const mockError = new Error("Failed to send SMS via Twilio");
      (mockError as any).statusCode = 500;
      (mockError as any).response = {
        data: {
          success: false,
          message: "SMS delivery failed. Please try again.",
          errorCode: OTPErrorCode.TWILIO_ERROR,
        },
      };

      (apiRequest as jest.Mock).mockRejectedValue(mockError);

      await expect(OTPApi.sendOTP(mockPhoneNumber)).rejects.toThrow(
        "Failed to send SMS via Twilio"
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
          attemptsRemaining: 1, // Only 1 attempt left before rate limit
        },
      };

      (apiRequest as jest.Mock).mockResolvedValue(mockResponse);

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

      (apiRequest as jest.Mock).mockResolvedValue(mockResponse);

      const result = await OTPApi.verifyOTP(mockPhoneNumber, mockOTP);

      expect(apiRequest).toHaveBeenCalledWith("/otp/verify", {
        method: "POST",
        body: JSON.stringify({
          phoneNumber: mockPhoneNumber,
          code: mockOTP,
        }),
      });

      expect(result.success).toBe(true);
      expect(result.data.verified).toBe(true);
    });

    it("should handle invalid OTP code", async () => {
      const mockError = new Error("Invalid OTP code");
      (mockError as any).statusCode = 400;
      (mockError as any).response = {
        data: {
          success: false,
          verified: false,
          message: "Invalid OTP code",
          errorCode: OTPErrorCode.INVALID_OTP,
          attemptsRemaining: 2,
        },
      };

      (apiRequest as jest.Mock).mockRejectedValue(mockError);

      await expect(
        OTPApi.verifyOTP(mockPhoneNumber, "000000")
      ).rejects.toThrow("Invalid OTP code");
    });

    it("should handle expired OTP", async () => {
      const mockError = new Error("OTP has expired");
      (mockError as any).statusCode = 400;
      (mockError as any).response = {
        data: {
          success: false,
          verified: false,
          message: "OTP has expired. Please request a new one.",
          errorCode: OTPErrorCode.EXPIRED_OTP,
        },
      };

      (apiRequest as jest.Mock).mockRejectedValue(mockError);

      await expect(OTPApi.verifyOTP(mockPhoneNumber, mockOTP)).rejects.toThrow(
        "OTP has expired"
      );
    });

    it("should handle max attempts exceeded", async () => {
      const mockError = new Error("Maximum verification attempts exceeded");
      (mockError as any).statusCode = 429;
      (mockError as any).response = {
        data: {
          success: false,
          verified: false,
          message:
            "Too many failed attempts. Verification locked for 15 minutes.",
          errorCode: OTPErrorCode.MAX_ATTEMPTS_EXCEEDED,
          attemptsRemaining: 0,
          lockedUntil: "2026-02-14T15:15:00Z",
        },
      };

      (apiRequest as jest.Mock).mockRejectedValue(mockError);

      await expect(OTPApi.verifyOTP(mockPhoneNumber, mockOTP)).rejects.toThrow(
        "Maximum verification attempts exceeded"
      );
    });

    it("should handle OTP not found", async () => {
      const mockError = new Error("OTP not found");
      (mockError as any).statusCode = 404;
      (mockError as any).response = {
        data: {
          success: false,
          verified: false,
          message: "No OTP found for this phone number. Please request a new one.",
          errorCode: OTPErrorCode.OTP_NOT_FOUND,
        },
      };

      (apiRequest as jest.Mock).mockRejectedValue(mockError);

      await expect(OTPApi.verifyOTP(mockPhoneNumber, mockOTP)).rejects.toThrow(
        "OTP not found"
      );
    });

    it("should include attemptsRemaining in successful verification", async () => {
      const mockResponse = {
        success: true,
        data: {
          success: true,
          verified: true,
          message: "Phone number verified successfully",
          attemptsRemaining: 3, // Reset after successful verification
        },
      };

      (apiRequest as jest.Mock).mockResolvedValue(mockResponse);

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

      (apiRequest as jest.Mock).mockResolvedValue(mockResponse);

      const result = await OTPApi.resendOTP(mockPhoneNumber);

      expect(apiRequest).toHaveBeenCalledWith("/otp/resend", {
        method: "POST",
        body: JSON.stringify({
          phoneNumber: mockPhoneNumber,
        }),
      });

      expect(result.success).toBe(true);
      expect(result.data.message).toBe("OTP resent to +63 *** *** **67");
    });

    it("should handle cooldown period", async () => {
      const mockError = new Error("Cooldown active");
      (mockError as any).statusCode = 429;
      (mockError as any).response = {
        data: {
          success: false,
          message: "Please wait 60 seconds before requesting another OTP",
          errorCode: OTPErrorCode.COOLDOWN_ACTIVE,
          cooldownUntil: "2026-02-14T15:01:00Z",
        },
      };

      (apiRequest as jest.Mock).mockRejectedValue(mockError);

      await expect(OTPApi.resendOTP(mockPhoneNumber)).rejects.toThrow(
        "Cooldown active"
      );
    });

    it("should handle OTP not found error", async () => {
      const mockError = new Error("OTP not found");
      (mockError as any).statusCode = 404;
      (mockError as any).response = {
        data: {
          success: false,
          message:
            "No active OTP found. Please send a new OTP instead of resending.",
          errorCode: OTPErrorCode.OTP_NOT_FOUND,
        },
      };

      (apiRequest as jest.Mock).mockRejectedValue(mockError);

      await expect(OTPApi.resendOTP(mockPhoneNumber)).rejects.toThrow(
        "OTP not found"
      );
    });

    it("should handle rate limit exceeded", async () => {
      const mockError = new Error("Rate limit exceeded");
      (mockError as any).statusCode = 429;
      (mockError as any).response = {
        data: {
          success: false,
          message: "Too many resend attempts. Please try again later.",
          errorCode: OTPErrorCode.RATE_LIMIT_EXCEEDED,
        },
      };

      (apiRequest as jest.Mock).mockRejectedValue(mockError);

      await expect(OTPApi.resendOTP(mockPhoneNumber)).rejects.toThrow(
        "Rate limit exceeded"
      );
    });

    it("should handle Twilio API failure on resend", async () => {
      const mockError = new Error("Failed to send SMS via Twilio");
      (mockError as any).statusCode = 500;
      (mockError as any).response = {
        data: {
          success: false,
          message: "SMS delivery failed. Please try again.",
          errorCode: OTPErrorCode.TWILIO_ERROR,
        },
      };

      (apiRequest as jest.Mock).mockRejectedValue(mockError);

      await expect(OTPApi.resendOTP(mockPhoneNumber)).rejects.toThrow(
        "Failed to send SMS via Twilio"
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
          attemptsRemaining: 2, // 2 more resends allowed
        },
      };

      (apiRequest as jest.Mock).mockResolvedValue(mockResponse);

      const result = await OTPApi.resendOTP(mockPhoneNumber);

      expect(result.data.attemptsRemaining).toBe(2);
    });
  });

  // =========================================================================
  // Integration Tests (API client behavior)
  // =========================================================================

  describe("API client integration", () => {
    it("should pass correct headers and method to apiRequest", async () => {
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

      (apiRequest as jest.Mock).mockResolvedValue(mockResponse);

      await OTPApi.sendOTP(mockPhoneNumber);

      expect(apiRequest).toHaveBeenCalledWith(
        "/otp/send",
        expect.objectContaining({
          method: "POST",
          body: expect.any(String),
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

      (apiRequest as jest.Mock).mockResolvedValue(mockResponse);

      await OTPApi.verifyOTP(mockPhoneNumber, mockOTP);

      const callArgs = (apiRequest as jest.Mock).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body).toEqual({
        phoneNumber: mockPhoneNumber,
        code: mockOTP,
      });
    });

    it("should properly propagate errors from apiRequest", async () => {
      const mockError = new Error("Network error");
      (apiRequest as jest.Mock).mockRejectedValue(mockError);

      await expect(OTPApi.sendOTP(mockPhoneNumber)).rejects.toThrow(
        "Network error"
      );
    });

    it("should handle authentication errors (401)", async () => {
      const mockError = new Error("Unauthorized");
      (mockError as any).statusCode = 401;
      (mockError as any).response = {
        data: {
          success: false,
          message: "Authentication required",
        },
      };

      (apiRequest as jest.Mock).mockRejectedValue(mockError);

      await expect(OTPApi.sendOTP(mockPhoneNumber)).rejects.toThrow(
        "Unauthorized"
      );
    });

    it("should handle server errors (500)", async () => {
      const mockError = new Error("Internal server error");
      (mockError as any).statusCode = 500;
      (mockError as any).response = {
        data: {
          success: false,
          message: "An unexpected error occurred",
        },
      };

      (apiRequest as jest.Mock).mockRejectedValue(mockError);

      await expect(OTPApi.verifyOTP(mockPhoneNumber, mockOTP)).rejects.toThrow(
        "Internal server error"
      );
    });
  });
});
