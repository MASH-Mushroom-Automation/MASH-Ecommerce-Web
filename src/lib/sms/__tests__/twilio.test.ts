/**
 * Tests for Twilio SMS Service
 *
 * Coverage:
 * - Configuration check
 * - SMS sending with success/failure
 * - Rate limiting (phone and user)
 * - Exponential backoff retry logic
 * - OTP code formatting
 * - SMS logging
 */

import { sendSMS, sendOTP, isTwilioConfigured, logSMSSend } from "../twilio";
import { doc, getDoc, setDoc, increment, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

// Mock Firestore
jest.mock("@/lib/firebase/config", () => ({
  db: {},
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  increment: jest.fn((val) => ({ __increment: val })),
  serverTimestamp: jest.fn(() => ({ __serverTimestamp: true })),
  deleteDoc: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe("Twilio SMS Service", () => {
  const mockPhoneNumber = "+639171234567";
  const mockUserId = "user123";
  const mockOTP = "123456";

  beforeEach(() => {
    jest.clearAllMocks();

    // Set environment variables
    process.env.TWILIO_ACCOUNT_SID = "ACtest123";
    process.env.TWILIO_AUTH_TOKEN = "test_token";
    process.env.TWILIO_PHONE_NUMBER = "+15005550006";
  });

  afterEach(() => {
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;
    delete process.env.TWILIO_PHONE_NUMBER;
  });

  // =========================================================================
  // Configuration Tests
  // =========================================================================

  describe("isTwilioConfigured", () => {
    it("should return true when all env vars are set", () => {
      expect(isTwilioConfigured()).toBe(true);
    });

    it("should return false when accountSid is missing", () => {
      delete process.env.TWILIO_ACCOUNT_SID;
      expect(isTwilioConfigured()).toBe(false);
    });

    it("should return false when authToken is missing", () => {
      delete process.env.TWILIO_AUTH_TOKEN;
      expect(isTwilioConfigured()).toBe(false);
    });

    it("should return false when phoneNumber is missing", () => {
      delete process.env.TWILIO_PHONE_NUMBER;
      expect(isTwilioConfigured()).toBe(false);
    });
  });

  // =========================================================================
  // SMS Sending Tests
  // =========================================================================

  describe("sendSMS", () => {
    it("should send SMS successfully", async () => {
      // Mock Firestore rate limit check (not rate limited)
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      // Mock Twilio API success
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ sid: "mock_message_sid" }),
      });

      const result = await sendSMS({
        phoneNumber: mockPhoneNumber,
        message: "Test message",
        userId: mockUserId,
      });

      expect(result.success).toBe(true);
      expect(result.messageSid).toBe("mock_message_sid");
      expect(result.error).toBeUndefined();
    });

    it("should return error when Twilio not configured", async () => {
      delete process.env.TWILIO_ACCOUNT_SID;

      const result = await sendSMS({
        phoneNumber: mockPhoneNumber,
        message: "Test message",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("SMS service not configured");
    });

    it("should handle Twilio API error", async () => {
      // Mock rate limit check (allowed)
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      // Mock Twilio API error
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ message: "Invalid phone number" }),
      });

      const result = await sendSMS({
        phoneNumber: "invalid",
        message: "Test message",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid phone number");
    });

    it("should retry on 429 rate limit", async () => {
      // Mock rate limit check (allowed)
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      let attemptCount = 0;
      (global.fetch as jest.Mock).mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 2) {
          return Promise.resolve({
            ok: false,
            status: 429,
            json: async () => ({ message: "Too many requests" }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ sid: "mock_sid_retry" }),
        });
      });

      const result = await sendSMS({
        phoneNumber: mockPhoneNumber,
        message: "Test message",
      });

      expect(attemptCount).toBe(2); // 1 failed + 1 success
      expect(result.success).toBe(true);
      expect(result.messageSid).toBe("mock_sid_retry");
    });

    it("should retry on 500 server error", async () => {
      // Mock rate limit check (allowed)
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      let attemptCount = 0;
      (global.fetch as jest.Mock).mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 2) {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: async () => ({ message: "Internal server error" }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ sid: "mock_sid_retry" }),
        });
      });

      const result = await sendSMS({
        phoneNumber: mockPhoneNumber,
        message: "Test message",
      });

      expect(attemptCount).toBe(2);
      expect(result.success).toBe(true);
    });

    it("should fail after 3 retry attempts", async () => {
      jest.useFakeTimers();

      // Mock rate limit check (allowed)
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      // Always return 500 error
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ message: "Persistent error" }),
      });

      const resultPromise = sendSMS({
        phoneNumber: mockPhoneNumber,
        message: "Test message",
      });

      // Advance through all exponential backoff delays (1s, 2s, 4s) instantly
      await jest.runAllTimersAsync();

      const result = await resultPromise;

      expect(result.success).toBe(false);
      expect(result.error).toContain("Persistent error");
      expect(global.fetch).toHaveBeenCalledTimes(4); // Initial attempt + 3 retries

      jest.useRealTimers();
    });
 });

  // =========================================================================
  // Rate Limiting Tests
  // =========================================================================

  describe("Rate Limiting", () => {
    it("should allow first SMS to phone number", async () => {
      // Mock Firestore: no existing rate limit doc
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ sid: "mock_sid" }),
      });

      const result = await sendSMS({
        phoneNumber: mockPhoneNumber,
        message: "Test",
      });

      expect(result.success).toBe(true);
      expect(setDoc).toHaveBeenCalled(); // Rate limit doc created
    });

    it("should block SMS when phone rate limit exceeded", async () => {
      // Mock Firestore: rate limit doc exists with count = 3 (max)
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({
          phoneNumber: mockPhoneNumber,
          count: 3,
          windowStart: Date.now(),
          ttl: Date.now() + 15 * 60 * 1000, // 15 min from now
        }),
      });

      const result = await sendSMS({
        phoneNumber: mockPhoneNumber,
        message: "Test",
      });

      expect(result.success).toBe(false);
      expect(result.rateLimited).toBe(true);
      expect(result.error).toContain("15 minutes");
    });

    it("should block SMS when user rate limit exceeded", async () => {
      // Mock phone rate limit (allowed)
      ( getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => false,
      });

      // Mock user rate limit (exceeded)
      (getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          userId: mockUserId,
          count: 5,
          windowStart: Date.now(),
          ttl: Date.now() + 60 * 60 * 1000, // 1 hour from now
        }),
      });

      const result = await sendSMS({
        phoneNumber: mockPhoneNumber,
        message: "Test",
        userId: mockUserId,
      });

      expect(result.success).toBe(false);
      expect(result.rateLimited).toBe(true);
      expect(result.error).toContain("1 hour");
    });

    it("should reset rate limit after TTL expires", async () => {
      // Mock expired rate limit doc - windowStart is older than the 15-minute window
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({
          phoneNumber: mockPhoneNumber,
          count: 3,
          windowStart: Date.now() - 20 * 60 * 1000, // 20 min ago (beyond 15-min window)
          ttl: Date.now() - 5 * 60 * 1000, // Expired 5 min ago
        }),
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ sid: "mock_sid" }),
      });

      const result = await sendSMS({
        phoneNumber: mockPhoneNumber,
        message: "Test",
      });

      // The expired rate limit doc gets cleaned up: either deleted, or a new doc is created with count 1
      // In either case, the SMS should be sent successfully
      expect(result.success).toBe(true);
    });
  });

  // =========================================================================
  // OTP Tests
  // =========================================================================

  describe("sendOTP", () => {
    it("should format OTP message correctly", async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ sid: "mock_sid" }),
      });

      const result = await sendOTP(mockPhoneNumber, mockOTP, mockUserId);

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining("123456"),
        })
      );
    });

    it("should include security warning in OTP message", async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      let requestBody = "";
      (global.fetch as jest.Mock).mockImplementation((_url, options) => {
        requestBody = options.body;
        return Promise.resolve({
          ok: true,
          json: async () => ({ sid: "mock_sid" }),
        });
      });

      await sendOTP(mockPhoneNumber, mockOTP);

      // URL-encoded body uses + for spaces, decode both %XX and + signs
      const decodedBody = decodeURIComponent(requestBody.replace(/\+/g, " "));
      expect(decodedBody).toContain("Do not share this code");
      expect(decodedBody).toContain("expires in 5 minutes");
    });
  });

  // =========================================================================
  // SMS Logging Tests
  // =========================================================================

  describe("logSMSSend", () => {
    it("should log SMS count to Firestore", async () => {
      await logSMSSend();

      // doc() returns undefined from mock, setDoc receives (undefined, data, options)
      expect(setDoc).toHaveBeenCalledTimes(1);
      const callArgs = (setDoc as jest.Mock).mock.calls[0];
      expect(callArgs[1]).toEqual(
        expect.objectContaining({
          date: expect.any(String),
        })
      );
      expect(callArgs[2]).toEqual({ merge: true });
    });
  });
});
