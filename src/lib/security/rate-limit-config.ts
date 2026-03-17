/**
 * Rate Limit Configuration
 *
 * Predefined rate limit configurations for OTP, 2FA, and login operations.
 * Includes exponential backoff calculator for resend delays.
 *
 * Usage:
 *   import { RATE_LIMITS, getBackoffDelay } from "@/lib/security/rate-limit-config";
 *   const config = RATE_LIMITS.OTP_SEND_PHONE;
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Configuration for a rate limit rule.
 */
export interface RateLimitConfig {
  /** Unique identifier for this rate limit type */
  readonly name: string;
  /** Maximum number of attempts allowed within the window */
  readonly maxAttempts: number;
  /** Time window in milliseconds */
  readonly windowMs: number;
  /** Action to take when limit is exceeded: "block" rejects, "flag" marks for review */
  readonly action: "block" | "flag";
  /** Key prefix used in Firestore document IDs */
  readonly keyPrefix: string;
  /** Whether to apply exponential backoff on resend */
  readonly useBackoff: boolean;
  /** Optional lockout duration in milliseconds (applied on limit breach) */
  readonly lockoutMs?: number;
}

/**
 * Represents a stored rate limit record in Firestore.
 */
export interface RateLimitRecord {
  /** Composite key: e.g. "otp_send:phone:+639171234567" */
  key: string;
  /** Number of attempts recorded in current window */
  count: number;
  /** Timestamp when the current window started */
  windowStart: number;
  /** Timestamp when this record expires (for TTL cleanup) */
  expiresAt: number;
  /** Whether this record has been flagged for admin review */
  flaggedForReview: boolean;
  /** User ID associated with this record (if applicable) */
  userId?: string;
  /** ISO timestamp of last attempt */
  lastAttemptAt: string;
  /** Firestore server timestamp for ordering */
  updatedAt: ReturnType<typeof import("firebase/firestore").serverTimestamp>;
}

/**
 * Result of a rate limit check.
 */
export interface RateLimitResult {
  /** Whether the action is allowed */
  allowed: boolean;
  /** Number of remaining attempts in the current window */
  remaining: number;
  /** Seconds until the rate limit window resets */
  retryAfterSeconds: number;
  /** Current attempt count in this window */
  currentCount: number;
  /** Maximum attempts allowed */
  maxAttempts: number;
  /** Whether the user is locked out */
  locked: boolean;
  /** Backoff delay in seconds (0 if backoff not applicable) */
  backoffSeconds: number;
}

// ============================================================================
// Predefined Rate Limit Configurations
// ============================================================================

/**
 * OTP send rate limit per phone number.
 * Max 3 sends per phone per 15 minutes.
 */
const OTP_SEND_PHONE: RateLimitConfig = {
  name: "OTP Send (Phone)",
  maxAttempts: 3,
  windowMs: 15 * 60 * 1000, // 15 minutes
  action: "block",
  keyPrefix: "otp_send:phone",
  useBackoff: true,
} as const;

/**
 * OTP send rate limit per user.
 * Max 5 sends per user per hour.
 */
const OTP_SEND_USER: RateLimitConfig = {
  name: "OTP Send (User)",
  maxAttempts: 5,
  windowMs: 60 * 60 * 1000, // 1 hour
  action: "block",
  keyPrefix: "otp_send:user",
  useBackoff: true,
} as const;

/**
 * OTP verification attempt limit.
 * Max 3 attempts per OTP code.
 */
const OTP_VERIFY: RateLimitConfig = {
  name: "OTP Verify",
  maxAttempts: 3,
  windowMs: 10 * 60 * 1000, // 10 minutes (OTP lifetime)
  action: "block",
  keyPrefix: "otp_verify",
  useBackoff: false,
} as const;

/**
 * 2FA login attempt limit (hourly).
 * Max 5 failed 2FA attempts per hour -> 1 hour lock.
 */
const TWO_FA_LOGIN_HOURLY: RateLimitConfig = {
  name: "2FA Login (Hourly)",
  maxAttempts: 5,
  windowMs: 60 * 60 * 1000, // 1 hour
  action: "block",
  keyPrefix: "2fa_login",
  useBackoff: false,
  lockoutMs: 60 * 60 * 1000, // 1 hour lockout
} as const;

/**
 * 2FA login attempt limit (daily).
 * Max 10 failed 2FA attempts per day -> account review flag.
 */
const TWO_FA_LOGIN_DAILY: RateLimitConfig = {
  name: "2FA Login (Daily)",
  maxAttempts: 10,
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  action: "flag",
  keyPrefix: "2fa_login_daily",
  useBackoff: false,
} as const;

/**
 * All predefined rate limit configurations.
 */
export const RATE_LIMITS = {
  OTP_SEND_PHONE,
  OTP_SEND_USER,
  OTP_VERIFY,
  TWO_FA_LOGIN_HOURLY,
  TWO_FA_LOGIN_DAILY,
} as const;

// ============================================================================
// Exponential Backoff
// ============================================================================

/**
 * Base delay for exponential backoff in seconds.
 * Sequence: 30s -> 60s -> 120s -> 240s ...
 */
const BACKOFF_BASE_SECONDS = 30;

/**
 * Maximum backoff delay in seconds (cap at 5 minutes).
 */
const BACKOFF_MAX_SECONDS = 300;

/**
 * Calculate exponential backoff delay based on attempt count.
 *
 * Implements doubling backoff: 30s -> 60s -> 120s -> 240s -> 300s (cap)
 *
 * @param attempts - Number of attempts made (1-indexed; first attempt = 0 delay)
 * @returns Backoff delay in seconds (0 for first attempt)
 *
 * @example
 * ```ts
 * getBackoffDelay(0); // 0  (first send, no delay)
 * getBackoffDelay(1); // 30 (second send)
 * getBackoffDelay(2); // 60 (third send)
 * getBackoffDelay(3); // 120
 * getBackoffDelay(4); // 240
 * getBackoffDelay(5); // 300 (capped)
 * ```
 */
export function getBackoffDelay(attempts: number): number {
  if (attempts <= 0) return 0;
  const delay = BACKOFF_BASE_SECONDS * Math.pow(2, attempts - 1);
  return Math.min(delay, BACKOFF_MAX_SECONDS);
}

/**
 * Build a rate limit key from the config prefix and identifier.
 *
 * @param config - The rate limit configuration
 * @param identifier - Unique identifier (phone number, user ID, OTP ID)
 * @returns Composite key string
 *
 * @example
 * ```ts
 * buildRateLimitKey(RATE_LIMITS.OTP_SEND_PHONE, "+639171234567");
 * // => "otp_send:phone:+639171234567"
 * ```
 */
export function buildRateLimitKey(
  config: RateLimitConfig,
  identifier: string
): string {
  return `${config.keyPrefix}:${identifier}`;
}
