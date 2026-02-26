/**
 * Security Module - Barrel Export
 *
 * Centralized exports for rate limiting, abuse prevention,
 * and account flagging services.
 *
 * Usage:
 *   import { RateLimiter, RATE_LIMITS, getBackoffDelay } from "@/lib/security";
 */

// Rate limiter service (Firestore-backed)
export { RateLimiter } from "./rate-limiter";

// Rate limit configurations and helpers
export {
  RATE_LIMITS,
  getBackoffDelay,
  buildRateLimitKey,
} from "./rate-limit-config";

// Re-export config types from rate-limit-config (canonical source)
export type {
  RateLimitConfig,
  RateLimitRecord,
  RateLimitResult,
} from "./rate-limit-config";

// Phone change audit trail
export { logPhoneChange, getPhoneChangeHistory } from "./phone-change-audit";
export type { PhoneChangeMethod, PhoneChangeRecord } from "./phone-change-audit";
