/**
 * Security Event Types
 *
 * Type definitions for the security audit trail and event logging system.
 * Used to track phone verification, 2FA, and suspicious activity events.
 *
 * Collection: security_events/{eventId}
 * Retention: 90 days (Firestore TTL on _expiresAt field)
 */

import type { Timestamp } from "firebase/firestore";

/**
 * Types of security events tracked in the audit trail
 */
export enum SecurityEventType {
  /** Phone number successfully verified */
  PHONE_VERIFIED = "PHONE_VERIFIED",

  /** Phone number changed on account */
  PHONE_CHANGED = "PHONE_CHANGED",

  /** Two-factor authentication enabled */
  TWO_FA_ENABLED = "2FA_ENABLED",

  /** Two-factor authentication disabled */
  TWO_FA_DISABLED = "2FA_DISABLED",

  /** Successful 2FA login */
  TWO_FA_LOGIN_SUCCESS = "2FA_LOGIN_SUCCESS",

  /** Failed 2FA login attempt */
  TWO_FA_LOGIN_FAILED = "2FA_LOGIN_FAILED",

  /** OTP code sent to user */
  OTP_SENT = "OTP_SENT",

  /** OTP code verified successfully */
  OTP_VERIFIED = "OTP_VERIFIED",

  /** OTP verification failed */
  OTP_FAILED = "OTP_FAILED",

  /** Suspicious activity detected */
  SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
}

/**
 * Metadata attached to a security event for additional context
 */
export interface SecurityEventMetadata {
  /** OTP purpose (e.g., PHONE_VERIFICATION, 2FA_LOGIN) */
  purpose?: string;

  /** Previous phone number (masked) for phone change events */
  previousPhone?: string;

  /** New phone number (masked) for phone change events */
  newPhone?: string;

  /** Reason for failure or suspicious activity */
  reason?: string;

  /** Number of failed attempts */
  attemptCount?: number;

  /** Additional context key-value pairs */
  [key: string]: string | number | boolean | undefined;
}

/**
 * Security event document structure in Firestore
 * Collection: security_events/{eventId}
 */
export interface SecurityEvent {
  /** Firestore document ID */
  id: string;

  /** User ID (Firebase Auth UID) */
  userId: string;

  /** Type of security event */
  eventType: SecurityEventType;

  /** IP address of the client (or 'unknown') */
  ipAddress: string;

  /** User agent string of the client (or 'unknown') */
  userAgent: string;

  /** Masked phone number associated with the event */
  phoneNumber: string;

  /** Whether the action was successful */
  success: boolean;

  /** Additional event metadata */
  metadata: SecurityEventMetadata;

  /** When the event occurred */
  createdAt: Timestamp;

  /** TTL field for Firestore auto-cleanup (90 days after createdAt) */
  _expiresAt: Timestamp;
}

/**
 * Input data for logging a new security event.
 * Fields like ipAddress, userAgent, createdAt, and _expiresAt
 * are auto-populated by the audit trail service if omitted.
 */
export interface LogSecurityEventInput {
  /** User ID (Firebase Auth UID) - required */
  userId: string;

  /** Type of security event - required */
  eventType: SecurityEventType;

  /** Phone number (will be auto-masked) */
  phoneNumber?: string;

  /** Whether the action was successful (default: true) */
  success?: boolean;

  /** Additional event metadata */
  metadata?: SecurityEventMetadata;

  /** IP address override (auto-detected if omitted) */
  ipAddress?: string;

  /** User agent override (auto-detected if omitted) */
  userAgent?: string;
}

// ============================================================================
// Rate Limiting Types
// ============================================================================

/**
 * Supported rate limit actions when threshold is breached.
 * - "block": Reject the request with HTTP 429
 * - "flag": Allow the request but flag the account for admin review
 */
export type RateLimitAction = "block" | "flag";

/**
 * HTTP 429 response body structure for rate-limited requests.
 * Use this type when returning rate limit errors from API routes.
 *
 * @example
 * ```ts
 * return Response.json(
 *   { error: "Too many requests", code: "RATE_LIMIT_EXCEEDED", retryAfterSeconds: 120, remaining: 0, locked: false },
 *   { status: 429, headers: { "Retry-After": "120" } }
 * );
 * ```
 */
export interface RateLimitErrorResponse {
  /** Error message describing the rate limit */
  error: string;
  /** Error code for client-side handling */
  code: "RATE_LIMIT_EXCEEDED" | "ACCOUNT_LOCKED" | "COOLDOWN_ACTIVE";
  /** Seconds until the client can retry (maps to Retry-After header) */
  retryAfterSeconds: number;
  /** Number of remaining attempts (0 when blocked) */
  remaining: number;
  /** Whether the account is locked out */
  locked: boolean;
}

/**
 * Reason why an account was flagged for admin review.
 */
export type AccountFlagReason =
  | "EXCESSIVE_OTP_REQUESTS"
  | "EXCESSIVE_2FA_FAILURES"
  | "SUSPICIOUS_PHONE_CHANGE"
  | "MULTIPLE_FAILED_LOGINS"
  | "UNUSUAL_ACTIVITY";

/**
 * Individual suspicious activity incident record.
 */
export interface SecurityIncident {
  /** Reason for the flag */
  reason: string;
  /** The rate limit key that triggered the incident */
  rateLimitKey: string;
  /** ISO 8601 timestamp when the incident occurred */
  timestamp: string;
}

/**
 * Account flag document in Firestore.
 * Collection: account_flags/{userId}
 */
export interface AccountFlag {
  /** User ID (Firebase Auth UID) */
  userId: string;
  /** Whether the account is currently flagged */
  flaggedForReview: boolean;
  /** ISO 8601 timestamp of first flag */
  firstFlaggedAt: string;
  /** ISO 8601 timestamp of most recent flag */
  lastFlaggedAt: string;
  /** List of incidents that triggered flagging */
  incidents: SecurityIncident[];
  /** Whether an admin has reviewed and resolved the flag */
  resolved: boolean;
  /** ISO 8601 timestamp when resolved (if applicable) */
  resolvedAt?: string;
  /** Admin user ID who resolved the flag */
  resolvedBy?: string;
  /** Admin notes on resolution */
  resolutionNotes?: string;
  /** Firestore server timestamp */
  updatedAt: unknown;
}

/**
 * Cooldown information for OTP resend with exponential backoff.
 *
 * Backoff sequence: 30s -> 60s -> 120s -> 240s -> 300s (cap)
 */
export interface ResendCooldown {
  /** Number of OTP sends so far */
  attemptNumber: number;
  /** Cooldown delay in seconds before next resend is allowed */
  cooldownSeconds: number;
  /** ISO 8601 timestamp when cooldown expires */
  cooldownUntil: string;
  /** Whether the user can resend now */
  canResend: boolean;
}

/**
 * Summary of flagged accounts for admin dashboard display.
 */
export interface FlaggedAccountSummary {
  /** User ID */
  userId: string;
  /** User display name (if available) */
  displayName?: string;
  /** User email (if available) */
  email?: string;
  /** Whether the account is currently flagged */
  flaggedForReview: boolean;
  /** ISO 8601 timestamp of first flag */
  firstFlaggedAt: string;
  /** ISO 8601 timestamp of most recent flag */
  lastFlaggedAt: string;
  /** Total number of incidents */
  incidentCount: number;
  /** List of incident details */
  incidents: SecurityIncident[];
  /** Whether resolved by admin */
  resolved: boolean;
}

/**
 * Filter options for querying flagged accounts in admin dashboard.
 */
export interface FlaggedAccountFilter {
  /** Filter by resolved status */
  resolved?: boolean;
  /** Filter by flag reason */
  reason?: AccountFlagReason;
  /** Filter by date range start (ISO 8601) */
  fromDate?: string;
  /** Filter by date range end (ISO 8601) */
  toDate?: string;
  /** Pagination: number of results per page */
  limit?: number;
  /** Pagination: offset */
  offset?: number;
}
