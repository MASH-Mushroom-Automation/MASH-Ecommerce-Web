/**
 * Rate Limiter Tests
 *
 * Tests for the Firestore-backed rate limiter covering:
 * - Rate limit checking (within/exceeding limits)
 * - Attempt recording (new/existing window, window expiry)
 * - Exponential backoff calculation
 * - Account lockout detection
 * - Account review flagging
 * - Suspicious activity queries
 * - Key encoding and edge cases
 */

import { RateLimiter } from "../rate-limiter";
import {
  RATE_LIMITS,
  getBackoffDelay,
  buildRateLimitKey,
} from "../rate-limit-config";

// ============================================================================
// Mocks
// ============================================================================

jest.mock("@/lib/firebase/config", () => ({
  firebaseApp: {},
}));

jest.mock("firebase/firestore", () => {
  const mockModule = {
    getFirestore: jest.fn(() => ({})),
    doc: jest.fn(() => "mock-doc-ref"),
    getDoc: jest.fn(),
    setDoc: jest.fn().mockResolvedValue(undefined),
    updateDoc: jest.fn().mockResolvedValue(undefined),
    deleteDoc: jest.fn().mockResolvedValue(undefined),
    getDocs: jest.fn(),
    collection: jest.fn(() => "mock-collection-ref"),
    query: jest.fn(() => "mock-query-ref"),
    where: jest.fn(() => "mock-where-ref"),
    serverTimestamp: jest.fn(() => ({ _serverTimestamp: true })),
    Timestamp: {
      fromDate: (date: Date) => ({
        toDate: () => date,
        seconds: Math.floor(date.getTime() / 1000),
        nanoseconds: 0,
      }),
    },
  };
  return mockModule;
});

// ============================================================================
// Helpers
// ============================================================================

function getMocks() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const firestore = require("firebase/firestore");
  return {
    mockDoc: firestore.doc as jest.Mock,
    mockGetDoc: firestore.getDoc as jest.Mock,
    mockSetDoc: firestore.setDoc as jest.Mock,
    mockUpdateDoc: firestore.updateDoc as jest.Mock,
    mockDeleteDoc: firestore.deleteDoc as jest.Mock,
    mockGetDocs: firestore.getDocs as jest.Mock,
    mockCollection: firestore.collection as jest.Mock,
    mockQuery: firestore.query as jest.Mock,
    mockWhere: firestore.where as jest.Mock,
  };
}

function mockDocSnapshot(
  exists: boolean,
  data?: Record<string, unknown>
): { exists: () => boolean; data: () => Record<string, unknown> | undefined } {
  return {
    exists: () => exists,
    data: () => (exists ? data : undefined),
  };
}

function mockQuerySnapshot(
  docs: Array<{
    id: string;
    data: Record<string, unknown>;
  }>
): {
  docs: Array<{
    id: string;
    data: () => Record<string, unknown>;
  }>;
} {
  return {
    docs: docs.map((d) => ({
      id: d.id,
      data: () => d.data,
    })),
  };
}

// ============================================================================
// Tests
// ============================================================================

describe("Rate Limit Config", () => {
  // ==========================================================================
  // getBackoffDelay
  // ==========================================================================

  describe("getBackoffDelay", () => {
    it("returns 0 for first attempt (attempts = 0)", () => {
      expect(getBackoffDelay(0)).toBe(0);
    });

    it("returns 30s for second send (attempts = 1)", () => {
      expect(getBackoffDelay(1)).toBe(30);
    });

    it("returns 60s for third send (attempts = 2)", () => {
      expect(getBackoffDelay(2)).toBe(60);
    });

    it("returns 120s for fourth send (attempts = 3)", () => {
      expect(getBackoffDelay(3)).toBe(120);
    });

    it("returns 240s for fifth send (attempts = 4)", () => {
      expect(getBackoffDelay(4)).toBe(240);
    });

    it("caps at 300s (5 minutes) for high attempt counts", () => {
      expect(getBackoffDelay(5)).toBe(300);
      expect(getBackoffDelay(10)).toBe(300);
      expect(getBackoffDelay(100)).toBe(300);
    });

    it("returns 0 for negative attempts", () => {
      expect(getBackoffDelay(-1)).toBe(0);
      expect(getBackoffDelay(-100)).toBe(0);
    });
  });

  // ==========================================================================
  // buildRateLimitKey
  // ==========================================================================

  describe("buildRateLimitKey", () => {
    it("builds key for OTP_SEND_PHONE", () => {
      const key = buildRateLimitKey(
        RATE_LIMITS.OTP_SEND_PHONE,
        "+639171234567"
      );
      expect(key).toBe("otp_send:phone:+639171234567");
    });

    it("builds key for OTP_SEND_USER", () => {
      const key = buildRateLimitKey(RATE_LIMITS.OTP_SEND_USER, "user-abc-123");
      expect(key).toBe("otp_send:user:user-abc-123");
    });

    it("builds key for OTP_VERIFY", () => {
      const key = buildRateLimitKey(RATE_LIMITS.OTP_VERIFY, "otp-id-456");
      expect(key).toBe("otp_verify:otp-id-456");
    });

    it("builds key for TWO_FA_LOGIN_HOURLY", () => {
      const key = buildRateLimitKey(
        RATE_LIMITS.TWO_FA_LOGIN_HOURLY,
        "user-xyz"
      );
      expect(key).toBe("2fa_login:user-xyz");
    });

    it("builds key for TWO_FA_LOGIN_DAILY", () => {
      const key = buildRateLimitKey(
        RATE_LIMITS.TWO_FA_LOGIN_DAILY,
        "user-xyz"
      );
      expect(key).toBe("2fa_login_daily:user-xyz");
    });
  });

  // ==========================================================================
  // Rate Limit Configs
  // ==========================================================================

  describe("RATE_LIMITS configurations", () => {
    it("OTP_SEND_PHONE allows 3 attempts in 15 minutes", () => {
      expect(RATE_LIMITS.OTP_SEND_PHONE.maxAttempts).toBe(3);
      expect(RATE_LIMITS.OTP_SEND_PHONE.windowMs).toBe(15 * 60 * 1000);
      expect(RATE_LIMITS.OTP_SEND_PHONE.useBackoff).toBe(true);
    });

    it("OTP_SEND_USER allows 5 attempts in 1 hour", () => {
      expect(RATE_LIMITS.OTP_SEND_USER.maxAttempts).toBe(5);
      expect(RATE_LIMITS.OTP_SEND_USER.windowMs).toBe(60 * 60 * 1000);
      expect(RATE_LIMITS.OTP_SEND_USER.useBackoff).toBe(true);
    });

    it("OTP_VERIFY allows 3 attempts in 10 minutes", () => {
      expect(RATE_LIMITS.OTP_VERIFY.maxAttempts).toBe(3);
      expect(RATE_LIMITS.OTP_VERIFY.windowMs).toBe(10 * 60 * 1000);
      expect(RATE_LIMITS.OTP_VERIFY.useBackoff).toBe(false);
    });

    it("TWO_FA_LOGIN_HOURLY allows 5 attempts with 1h lockout", () => {
      expect(RATE_LIMITS.TWO_FA_LOGIN_HOURLY.maxAttempts).toBe(5);
      expect(RATE_LIMITS.TWO_FA_LOGIN_HOURLY.windowMs).toBe(60 * 60 * 1000);
      expect(RATE_LIMITS.TWO_FA_LOGIN_HOURLY.lockoutMs).toBe(60 * 60 * 1000);
      expect(RATE_LIMITS.TWO_FA_LOGIN_HOURLY.action).toBe("block");
    });

    it("TWO_FA_LOGIN_DAILY allows 10 attempts with flag action", () => {
      expect(RATE_LIMITS.TWO_FA_LOGIN_DAILY.maxAttempts).toBe(10);
      expect(RATE_LIMITS.TWO_FA_LOGIN_DAILY.windowMs).toBe(
        24 * 60 * 60 * 1000
      );
      expect(RATE_LIMITS.TWO_FA_LOGIN_DAILY.action).toBe("flag");
    });
  });
});

describe("RateLimiter", () => {
  let mocks: ReturnType<typeof getMocks>;

  beforeEach(() => {
    jest.clearAllMocks();
    mocks = getMocks();
    mocks.mockDoc.mockReturnValue("mock-doc-ref");
    mocks.mockCollection.mockReturnValue("mock-collection-ref");
    mocks.mockQuery.mockReturnValue("mock-query-ref");
    mocks.mockWhere.mockReturnValue("mock-where-ref");
    mocks.mockSetDoc.mockResolvedValue(undefined);
    mocks.mockUpdateDoc.mockResolvedValue(undefined);
    mocks.mockDeleteDoc.mockResolvedValue(undefined);
  });

  // ==========================================================================
  // checkLimit
  // ==========================================================================

  describe("checkLimit", () => {
    it("allows first attempt when no record exists", async () => {
      mocks.mockGetDoc.mockResolvedValue(mockDocSnapshot(false));

      const result = await RateLimiter.checkLimit(
        RATE_LIMITS.OTP_SEND_PHONE,
        "+639171234567"
      );

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(3);
      expect(result.currentCount).toBe(0);
      expect(result.locked).toBe(false);
      expect(result.retryAfterSeconds).toBe(0);
    });

    it("allows attempt when under the limit", async () => {
      const now = Date.now();
      mocks.mockGetDoc.mockResolvedValue(
        mockDocSnapshot(true, {
          key: "otp_send:phone:+639171234567",
          count: 1,
          windowStart: now - 60 * 1000, // 1 minute ago
          expiresAt: now + 14 * 60 * 1000,
          flaggedForReview: false,
          lastAttemptAt: new Date(now - 60 * 1000).toISOString(),
        })
      );

      const result = await RateLimiter.checkLimit(
        RATE_LIMITS.OTP_SEND_PHONE,
        "+639171234567"
      );

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
      expect(result.currentCount).toBe(1);
    });

    it("blocks when limit is exceeded", async () => {
      const now = Date.now();
      mocks.mockGetDoc.mockResolvedValue(
        mockDocSnapshot(true, {
          key: "otp_send:phone:+639171234567",
          count: 3,
          windowStart: now - 5 * 60 * 1000, // 5 minutes ago
          expiresAt: now + 10 * 60 * 1000,
          flaggedForReview: false,
          lastAttemptAt: new Date(now - 60 * 1000).toISOString(),
        })
      );

      const result = await RateLimiter.checkLimit(
        RATE_LIMITS.OTP_SEND_PHONE,
        "+639171234567"
      );

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.currentCount).toBe(3);
      expect(result.retryAfterSeconds).toBeGreaterThan(0);
    });

    it("allows attempt when window has expired", async () => {
      const now = Date.now();
      mocks.mockGetDoc.mockResolvedValue(
        mockDocSnapshot(true, {
          key: "otp_send:phone:+639171234567",
          count: 3,
          windowStart: now - 20 * 60 * 1000, // 20 minutes ago (window is 15 min)
          expiresAt: now - 5 * 60 * 1000,
          flaggedForReview: false,
          lastAttemptAt: new Date(now - 20 * 60 * 1000).toISOString(),
        })
      );

      const result = await RateLimiter.checkLimit(
        RATE_LIMITS.OTP_SEND_PHONE,
        "+639171234567"
      );

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(3);
      expect(result.currentCount).toBe(0);
    });

    it("detects lockout for 2FA login hourly", async () => {
      const now = Date.now();
      mocks.mockGetDoc.mockResolvedValue(
        mockDocSnapshot(true, {
          key: "2fa_login:user-123",
          count: 5,
          windowStart: now - 30 * 60 * 1000, // 30 min ago
          expiresAt: now + 90 * 60 * 1000,
          flaggedForReview: false,
          lastAttemptAt: new Date(now - 5 * 60 * 1000).toISOString(),
        })
      );

      const result = await RateLimiter.checkLimit(
        RATE_LIMITS.TWO_FA_LOGIN_HOURLY,
        "user-123"
      );

      expect(result.allowed).toBe(false);
      expect(result.locked).toBe(true);
      expect(result.retryAfterSeconds).toBeGreaterThan(0);
    });

    it("enforces backoff delay for OTP resend", async () => {
      const now = Date.now();
      // User sent 1 OTP, backoff is 30s, last attempt was 10s ago
      mocks.mockGetDoc.mockResolvedValue(
        mockDocSnapshot(true, {
          key: "otp_send:phone:+639171234567",
          count: 1,
          windowStart: now - 20 * 1000, // 20 seconds ago
          expiresAt: now + 15 * 60 * 1000,
          flaggedForReview: false,
          lastAttemptAt: new Date(now - 10 * 1000).toISOString(),
        })
      );

      const result = await RateLimiter.checkLimit(
        RATE_LIMITS.OTP_SEND_PHONE,
        "+639171234567"
      );

      // 30s backoff, 10s elapsed = 20s remaining
      expect(result.allowed).toBe(false);
      expect(result.backoffSeconds).toBeGreaterThan(0);
      expect(result.remaining).toBe(2); // still has attempts left
    });

    it("allows after backoff delay has elapsed", async () => {
      const now = Date.now();
      // User sent 1 OTP, backoff is 30s, last attempt was 35s ago
      mocks.mockGetDoc.mockResolvedValue(
        mockDocSnapshot(true, {
          key: "otp_send:phone:+639171234567",
          count: 1,
          windowStart: now - 60 * 1000,
          expiresAt: now + 14 * 60 * 1000,
          flaggedForReview: false,
          lastAttemptAt: new Date(now - 35 * 1000).toISOString(),
        })
      );

      const result = await RateLimiter.checkLimit(
        RATE_LIMITS.OTP_SEND_PHONE,
        "+639171234567"
      );

      expect(result.allowed).toBe(true);
      expect(result.backoffSeconds).toBe(0);
    });

    it("allows action on Firestore error (fail-open)", async () => {
      mocks.mockGetDoc.mockRejectedValue(new Error("Firestore unavailable"));

      const result = await RateLimiter.checkLimit(
        RATE_LIMITS.OTP_SEND_PHONE,
        "+639171234567"
      );

      expect(result.allowed).toBe(true);
    });
  });

  // ==========================================================================
  // recordAttempt
  // ==========================================================================

  describe("recordAttempt", () => {
    it("creates new record for first attempt", async () => {
      mocks.mockGetDoc.mockResolvedValue(mockDocSnapshot(false));

      await RateLimiter.recordAttempt(
        RATE_LIMITS.OTP_SEND_PHONE,
        "+639171234567"
      );

      expect(mocks.mockSetDoc).toHaveBeenCalledTimes(1);
      const savedRecord = mocks.mockSetDoc.mock.calls[0][1];
      expect(savedRecord.count).toBe(1);
      expect(savedRecord.key).toBe("otp_send:phone:+639171234567");
      expect(savedRecord.flaggedForReview).toBe(false);
    });

    it("increments count for existing record within window", async () => {
      const now = Date.now();
      mocks.mockGetDoc.mockResolvedValue(
        mockDocSnapshot(true, {
          key: "otp_send:phone:+639171234567",
          count: 1,
          windowStart: now - 60 * 1000,
          expiresAt: now + 14 * 60 * 1000,
          flaggedForReview: false,
          lastAttemptAt: new Date(now - 60 * 1000).toISOString(),
        })
      );

      await RateLimiter.recordAttempt(
        RATE_LIMITS.OTP_SEND_PHONE,
        "+639171234567"
      );

      expect(mocks.mockUpdateDoc).toHaveBeenCalledTimes(1);
      const updateArgs = mocks.mockUpdateDoc.mock.calls[0][1];
      expect(updateArgs.count).toBe(2);
    });

    it("resets counter when window has expired", async () => {
      const now = Date.now();
      mocks.mockGetDoc.mockResolvedValue(
        mockDocSnapshot(true, {
          key: "otp_send:phone:+639171234567",
          count: 3,
          windowStart: now - 20 * 60 * 1000, // 20 min ago, window is 15 min
          expiresAt: now - 5 * 60 * 1000,
          flaggedForReview: false,
          lastAttemptAt: new Date(now - 20 * 60 * 1000).toISOString(),
        })
      );

      await RateLimiter.recordAttempt(
        RATE_LIMITS.OTP_SEND_PHONE,
        "+639171234567"
      );

      expect(mocks.mockSetDoc).toHaveBeenCalledTimes(1);
      const savedRecord = mocks.mockSetDoc.mock.calls[0][1];
      expect(savedRecord.count).toBe(1); // Reset to 1
    });

    it("stores userId when provided", async () => {
      mocks.mockGetDoc.mockResolvedValue(mockDocSnapshot(false));

      await RateLimiter.recordAttempt(
        RATE_LIMITS.OTP_SEND_USER,
        "user-123",
        "user-123"
      );

      const savedRecord = mocks.mockSetDoc.mock.calls[0][1];
      expect(savedRecord.userId).toBe("user-123");
    });

    it("triggers flagForReview when daily limit reached", async () => {
      const now = Date.now();
      // Mock: the rate limit record about to hit the daily threshold
      mocks.mockGetDoc
        .mockResolvedValueOnce(
          // First getDoc in recordAttempt
          mockDocSnapshot(true, {
            key: "2fa_login_daily:user-123",
            count: 9, // Will become 10 (= maxAttempts)
            windowStart: now - 60 * 60 * 1000,
            expiresAt: now + 23 * 60 * 60 * 1000,
            flaggedForReview: false,
            userId: "user-123",
            lastAttemptAt: new Date(now - 60 * 1000).toISOString(),
          })
        )
        .mockResolvedValueOnce(
          // getDoc in flagForReview (account_flags)
          mockDocSnapshot(false)
        )
        .mockResolvedValueOnce(
          // getDoc in flagForReview (rate_limits)
          mockDocSnapshot(true, { flaggedForReview: false })
        );

      await RateLimiter.recordAttempt(
        RATE_LIMITS.TWO_FA_LOGIN_DAILY,
        "user-123",
        "user-123"
      );

      // updateDoc for count increment + setDoc for new flag + updateDoc for rl flaggedForReview
      expect(mocks.mockUpdateDoc).toHaveBeenCalled();
      expect(mocks.mockSetDoc).toHaveBeenCalled();
    });

    it("does not throw on Firestore error", async () => {
      mocks.mockGetDoc.mockRejectedValue(new Error("Firestore unavailable"));

      await expect(
        RateLimiter.recordAttempt(
          RATE_LIMITS.OTP_SEND_PHONE,
          "+639171234567"
        )
      ).resolves.toBeUndefined();
    });
  });

  // ==========================================================================
  // isLocked
  // ==========================================================================

  describe("isLocked", () => {
    it("returns false when no record exists", async () => {
      mocks.mockGetDoc.mockResolvedValue(mockDocSnapshot(false));

      const locked = await RateLimiter.isLocked("user-123");
      expect(locked).toBe(false);
    });

    it("returns true when count exceeds hourly max within lockout window", async () => {
      const now = Date.now();
      mocks.mockGetDoc.mockResolvedValue(
        mockDocSnapshot(true, {
          key: "2fa_login:user-123",
          count: 5,
          windowStart: now - 30 * 60 * 1000, // 30 minutes ago
          expiresAt: now + 90 * 60 * 1000,
          flaggedForReview: false,
        })
      );

      const locked = await RateLimiter.isLocked("user-123");
      expect(locked).toBe(true);
    });

    it("returns false when count is below hourly max", async () => {
      const now = Date.now();
      mocks.mockGetDoc.mockResolvedValue(
        mockDocSnapshot(true, {
          key: "2fa_login:user-123",
          count: 3,
          windowStart: now - 30 * 60 * 1000,
          expiresAt: now + 30 * 60 * 1000,
          flaggedForReview: false,
        })
      );

      const locked = await RateLimiter.isLocked("user-123");
      expect(locked).toBe(false);
    });

    it("returns false when lockout period has expired", async () => {
      const now = Date.now();
      mocks.mockGetDoc.mockResolvedValue(
        mockDocSnapshot(true, {
          key: "2fa_login:user-123",
          count: 5,
          windowStart: now - 3 * 60 * 60 * 1000, // 3 hours ago (window + lockout expired)
          expiresAt: now - 60 * 60 * 1000,
          flaggedForReview: false,
        })
      );

      const locked = await RateLimiter.isLocked("user-123");
      expect(locked).toBe(false);
    });

    it("returns false on Firestore error", async () => {
      mocks.mockGetDoc.mockRejectedValue(new Error("Firestore unavailable"));

      const locked = await RateLimiter.isLocked("user-123");
      expect(locked).toBe(false);
    });
  });

  // ==========================================================================
  // flagForReview
  // ==========================================================================

  describe("flagForReview", () => {
    it("creates new flag document for unflagged user", async () => {
      mocks.mockGetDoc
        .mockResolvedValueOnce(mockDocSnapshot(false)) // account_flags doc
        .mockResolvedValueOnce(mockDocSnapshot(true, {})); // rate_limits doc

      await RateLimiter.flagForReview(
        "user-123",
        "2FA Login (Daily)",
        "2fa_login_daily:user-123"
      );

      expect(mocks.mockSetDoc).toHaveBeenCalledTimes(1);
      const flagData = mocks.mockSetDoc.mock.calls[0][1];
      expect(flagData.userId).toBe("user-123");
      expect(flagData.flaggedForReview).toBe(true);
      expect(flagData.resolved).toBe(false);
      expect(flagData.incidents).toHaveLength(1);
      expect(flagData.incidents[0].reason).toBe("2FA Login (Daily)");
    });

    it("appends incident to existing flag document", async () => {
      mocks.mockGetDoc
        .mockResolvedValueOnce(
          mockDocSnapshot(true, {
            userId: "user-123",
            flaggedForReview: true,
            incidents: [
              {
                reason: "Previous incident",
                rateLimitKey: "old_key",
                timestamp: "2026-02-13T00:00:00Z",
              },
            ],
          })
        )
        .mockResolvedValueOnce(mockDocSnapshot(true, {})); // rate_limits doc

      await RateLimiter.flagForReview(
        "user-123",
        "2FA Login (Daily)",
        "2fa_login_daily:user-123"
      );

      expect(mocks.mockUpdateDoc).toHaveBeenCalled();
      const updateArgs = mocks.mockUpdateDoc.mock.calls[0][1];
      expect(updateArgs.incidents).toHaveLength(2);
    });

    it("updates rate limit record flaggedForReview field", async () => {
      mocks.mockGetDoc
        .mockResolvedValueOnce(mockDocSnapshot(false)) // account_flags
        .mockResolvedValueOnce(
          mockDocSnapshot(true, { flaggedForReview: false })
        ); // rate_limits

      await RateLimiter.flagForReview(
        "user-123",
        "2FA Login (Daily)",
        "2fa_login_daily:user-123"
      );

      // setDoc for new flag + updateDoc for rate_limits flaggedForReview
      expect(mocks.mockSetDoc).toHaveBeenCalledTimes(1);
      expect(mocks.mockUpdateDoc).toHaveBeenCalledWith("mock-doc-ref", {
        flaggedForReview: true,
      });
    });

    it("does not throw on Firestore error", async () => {
      mocks.mockGetDoc.mockRejectedValue(new Error("Firestore unavailable"));

      await expect(
        RateLimiter.flagForReview("user-123", "test", "test_key")
      ).resolves.toBeUndefined();
    });
  });

  // ==========================================================================
  // getFlaggedAccounts
  // ==========================================================================

  describe("getFlaggedAccounts", () => {
    it("returns flagged accounts from Firestore", async () => {
      mocks.mockGetDocs.mockResolvedValue(
        mockQuerySnapshot([
          {
            id: "user-123",
            data: {
              userId: "user-123",
              flaggedForReview: true,
              firstFlaggedAt: "2026-02-14T10:00:00Z",
              lastFlaggedAt: "2026-02-14T12:00:00Z",
              incidents: [
                {
                  reason: "2FA Login (Daily)",
                  rateLimitKey: "2fa_login_daily:user-123",
                  timestamp: "2026-02-14T12:00:00Z",
                },
              ],
              resolved: false,
            },
          },
        ])
      );

      const accounts = await RateLimiter.getFlaggedAccounts();

      expect(accounts).toHaveLength(1);
      expect(accounts[0].userId).toBe("user-123");
      expect(accounts[0].flaggedForReview).toBe(true);
      expect(accounts[0].incidents).toHaveLength(1);
      expect(accounts[0].resolved).toBe(false);
    });

    it("returns empty array when no flagged accounts", async () => {
      mocks.mockGetDocs.mockResolvedValue(mockQuerySnapshot([]));

      const accounts = await RateLimiter.getFlaggedAccounts();
      expect(accounts).toEqual([]);
    });

    it("returns empty array on Firestore error", async () => {
      mocks.mockGetDocs.mockRejectedValue(new Error("Firestore unavailable"));

      const accounts = await RateLimiter.getFlaggedAccounts();
      expect(accounts).toEqual([]);
    });
  });

  // ==========================================================================
  // resolveFlag
  // ==========================================================================

  describe("resolveFlag", () => {
    it("marks flagged account as resolved", async () => {
      await RateLimiter.resolveFlag("user-123");

      expect(mocks.mockUpdateDoc).toHaveBeenCalledTimes(1);
      const updateArgs = mocks.mockUpdateDoc.mock.calls[0][1];
      expect(updateArgs.resolved).toBe(true);
      expect(updateArgs.resolvedAt).toBeDefined();
    });

    it("does not throw on Firestore error", async () => {
      mocks.mockUpdateDoc.mockRejectedValue(
        new Error("Firestore unavailable")
      );

      await expect(
        RateLimiter.resolveFlag("user-123")
      ).resolves.toBeUndefined();
    });
  });

  // ==========================================================================
  // resetLimit
  // ==========================================================================

  describe("resetLimit", () => {
    it("deletes the rate limit document", async () => {
      await RateLimiter.resetLimit(
        RATE_LIMITS.OTP_SEND_PHONE,
        "+639171234567"
      );

      expect(mocks.mockDeleteDoc).toHaveBeenCalledTimes(1);
    });

    it("does not throw on Firestore error", async () => {
      mocks.mockDeleteDoc.mockRejectedValue(
        new Error("Firestore unavailable")
      );

      await expect(
        RateLimiter.resetLimit(RATE_LIMITS.OTP_SEND_PHONE, "+639171234567")
      ).resolves.toBeUndefined();
    });
  });
});
