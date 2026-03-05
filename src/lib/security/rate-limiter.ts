/**
 * Rate Limiter Service
 *
 * Firestore-backed rate limiter for OTP, 2FA, and login operations.
 * Tracks attempt counts per key with configurable time windows.
 *
 * Collection: rate_limits/{documentId}
 *
 * Features:
 * - Sliding window rate limiting
 * - Exponential backoff for OTP resend
 * - Account lockout on excessive failures
 * - Admin review flagging for suspicious activity
 * - TTL-based auto-cleanup (application-level check; Firestore TTL policy set separately)
 *
 * Usage:
 *   import { RateLimiter } from "@/lib/security/rate-limiter";
 *   import { RATE_LIMITS } from "@/lib/security/rate-limit-config";
 *
 *   const result = await RateLimiter.checkLimit(
 *     RATE_LIMITS.OTP_SEND_PHONE,
 *     "+639171234567"
 *   );
 *   if (!result.allowed) {
 *     return Response.json(
 *       { error: "Too many requests" },
 *       { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } }
 *     );
 *   }
 *   await RateLimiter.recordAttempt(RATE_LIMITS.OTP_SEND_PHONE, "+639171234567");
 */

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp as FirestoreTimestamp,
} from "firebase/firestore";
import { firebaseApp } from "@/lib/firebase/config";
import {
  type RateLimitConfig,
  type RateLimitRecord,
  type RateLimitResult,
  getBackoffDelay,
  buildRateLimitKey,
} from "./rate-limit-config";

// ============================================================================
// Firestore Initialization
// ============================================================================

const db = getFirestore(firebaseApp);

/** Firestore collection name for rate limit records */
const COLLECTION_NAME = "rate_limits";

/** Firestore collection name for flagged accounts */
const FLAGS_COLLECTION_NAME = "account_flags";

// ============================================================================
// Rate Limiter Class
// ============================================================================

/**
 * Rate limiter using Firestore for persistence.
 *
 * All methods are static for easy import/use in API routes.
 */
export class RateLimiter {
  // ==========================================================================
  // Core Rate Limiting
  // ==========================================================================

  /**
   * Check if an action is allowed under the given rate limit configuration.
   *
   * Does NOT record the attempt. Call `recordAttempt()` separately after
   * the action succeeds (or unconditionally, depending on your flow).
   *
   * @param config - Rate limit configuration to check against
   * @param identifier - Unique identifier (phone number, user ID, etc.)
   * @returns RateLimitResult with allowed status and metadata
   */
  static async checkLimit(
    config: RateLimitConfig,
    identifier: string
  ): Promise<RateLimitResult> {
    const key = buildRateLimitKey(config, identifier);
    const now = Date.now();

    try {
      const docRef = doc(db, COLLECTION_NAME, encodeKey(key));
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // No record exists - action is allowed
        return createAllowedResult(config, 0);
      }

      const record = docSnap.data() as RateLimitRecord;

      // Check if the window has expired
      if (now > record.windowStart + config.windowMs) {
        // Window expired - reset is allowed
        return createAllowedResult(config, 0);
      }

      // Check if lockout is active
      if (config.lockoutMs && record.count >= config.maxAttempts) {
        const lockoutEnd = record.windowStart + config.windowMs + config.lockoutMs;
        if (now < lockoutEnd) {
          const retryAfterSeconds = Math.ceil((lockoutEnd - now) / 1000);
          return {
            allowed: false,
            remaining: 0,
            retryAfterSeconds,
            currentCount: record.count,
            maxAttempts: config.maxAttempts,
            locked: true,
            backoffSeconds: 0,
          };
        }
        // Lockout expired
        return createAllowedResult(config, 0);
      }

      // Check if limit exceeded
      if (record.count >= config.maxAttempts) {
        const windowEnd = record.windowStart + config.windowMs;
        const retryAfterSeconds = Math.ceil((windowEnd - now) / 1000);
        return {
          allowed: false,
          remaining: 0,
          retryAfterSeconds: Math.max(0, retryAfterSeconds),
          currentCount: record.count,
          maxAttempts: config.maxAttempts,
          locked: false,
          backoffSeconds: 0,
        };
      }

      // Under the limit - calculate backoff if applicable
      const backoffSeconds = config.useBackoff
        ? getBackoffDelay(record.count)
        : 0;

      // Check if backoff period has elapsed
      if (backoffSeconds > 0 && record.lastAttemptAt) {
        const lastAttemptTime = new Date(record.lastAttemptAt).getTime();
        const backoffEnd = lastAttemptTime + backoffSeconds * 1000;
        if (now < backoffEnd) {
          const waitSeconds = Math.ceil((backoffEnd - now) / 1000);
          return {
            allowed: false,
            remaining: config.maxAttempts - record.count,
            retryAfterSeconds: waitSeconds,
            currentCount: record.count,
            maxAttempts: config.maxAttempts,
            locked: false,
            backoffSeconds: waitSeconds,
          };
        }
      }

      return createAllowedResult(config, record.count);
    } catch (error) {
      // On Firestore errors, allow the action but log
      console.error("[RateLimiter] checkLimit error:", error);
      return createAllowedResult(config, 0);
    }
  }

  /**
   * Record an attempt for the given rate limit key.
   *
   * Creates or updates the rate limit record in Firestore.
   * If the window has expired, resets the counter.
   *
   * @param config - Rate limit configuration
   * @param identifier - Unique identifier (phone number, user ID, etc.)
   * @param userId - Optional user ID to associate with the record
   */
  static async recordAttempt(
    config: RateLimitConfig,
    identifier: string,
    userId?: string
  ): Promise<void> {
    const key = buildRateLimitKey(config, identifier);
    const now = Date.now();

    try {
      const docRef = doc(db, COLLECTION_NAME, encodeKey(key));
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Create new record
        const newRecord: RateLimitRecord = {
          key,
          count: 1,
          windowStart: now,
          expiresAt: now + config.windowMs + (config.lockoutMs ?? 0),
          flaggedForReview: false,
          lastAttemptAt: new Date(now).toISOString(),
          updatedAt: serverTimestamp() as RateLimitRecord["updatedAt"],
          ...(userId && { userId }),
        };
        await setDoc(docRef, newRecord);
        return;
      }

      const record = docSnap.data() as RateLimitRecord;

      // Check if window expired - reset counter
      if (now > record.windowStart + config.windowMs) {
        const resetRecord: RateLimitRecord = {
          key,
          count: 1,
          windowStart: now,
          expiresAt: now + config.windowMs + (config.lockoutMs ?? 0),
          flaggedForReview: record.flaggedForReview,
          lastAttemptAt: new Date(now).toISOString(),
          updatedAt: serverTimestamp() as RateLimitRecord["updatedAt"],
          ...(userId && { userId }),
        };
        await setDoc(docRef, resetRecord);
        return;
      }

      // Increment counter within window
      const newCount = record.count + 1;
      await updateDoc(docRef, {
        count: newCount,
        lastAttemptAt: new Date(now).toISOString(),
        updatedAt: serverTimestamp(),
      });

      // Check if the "flag" action threshold is reached
      if (config.action === "flag" && newCount >= config.maxAttempts) {
        const targetUserId = userId ?? record.userId;
        if (targetUserId) {
          await RateLimiter.flagForReview(targetUserId, config.name, key);
        }
      }
    } catch (error) {
      console.error("[RateLimiter] recordAttempt error:", error);
      // Do not throw - rate limiting failures should not block the user action
    }
  }

  // ==========================================================================
  // Lockout Management
  // ==========================================================================

  /**
   * Check if a user is currently locked out from 2FA login.
   *
   * A user is locked when they have exceeded the hourly 2FA login limit
   * and the lockout period has not yet expired.
   *
   * @param userId - The user ID to check
   * @returns true if the user is locked out
   */
  static async isLocked(userId: string): Promise<boolean> {
    const key = buildRateLimitKey(
      { keyPrefix: "2fa_login" } as RateLimitConfig,
      userId
    );
    const now = Date.now();

    try {
      const docRef = doc(db, COLLECTION_NAME, encodeKey(key));
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) return false;

      const record = docSnap.data() as RateLimitRecord;

      // Check if within the window AND count exceeds max
      const hourlyMax = 5;
      const windowMs = 60 * 60 * 1000; // 1 hour
      const lockoutMs = 60 * 60 * 1000; // 1 hour lockout

      if (record.count >= hourlyMax) {
        const lockoutEnd = record.windowStart + windowMs + lockoutMs;
        return now < lockoutEnd;
      }

      return false;
    } catch (error) {
      console.error("[RateLimiter] isLocked error:", error);
      return false;
    }
  }

  // ==========================================================================
  // Account Review Flagging
  // ==========================================================================

  /**
   * Flag a user account for admin review due to suspicious activity.
   *
   * Creates or updates a document in the account_flags collection.
   *
   * @param userId - The user ID to flag
   * @param reason - Reason for flagging (e.g., "2FA Login (Daily)")
   * @param rateLimitKey - The rate limit key that triggered the flag
   */
  static async flagForReview(
    userId: string,
    reason: string,
    rateLimitKey: string
  ): Promise<void> {
    try {
      const flagRef = doc(db, FLAGS_COLLECTION_NAME, userId);
      const flagSnap = await getDoc(flagRef);

      if (flagSnap.exists()) {
        const existing = flagSnap.data();
        const incidents = Array.isArray(existing.incidents)
          ? existing.incidents
          : [];
        await updateDoc(flagRef, {
          flaggedForReview: true,
          lastFlaggedAt: new Date().toISOString(),
          incidents: [
            ...incidents,
            {
              reason,
              rateLimitKey,
              timestamp: new Date().toISOString(),
            },
          ],
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(flagRef, {
          userId,
          flaggedForReview: true,
          firstFlaggedAt: new Date().toISOString(),
          lastFlaggedAt: new Date().toISOString(),
          incidents: [
            {
              reason,
              rateLimitKey,
              timestamp: new Date().toISOString(),
            },
          ],
          resolved: false,
          updatedAt: serverTimestamp(),
        });
      }

      // Also update the rate limit record itself
      const rlDocRef = doc(db, COLLECTION_NAME, encodeKey(rateLimitKey));
      const rlSnap = await getDoc(rlDocRef);
      if (rlSnap.exists()) {
        await updateDoc(rlDocRef, { flaggedForReview: true });
      }

      console.warn(
        `[RateLimiter] Account flagged for review: userId=${userId}, reason=${reason}`
      );
    } catch (error) {
      console.error("[RateLimiter] flagForReview error:", error);
    }
  }

  // ==========================================================================
  // Suspicious Activity Queries
  // ==========================================================================

  /**
   * Get all accounts flagged for review.
   *
   * Used by admin dashboard to display accounts with suspicious activity.
   *
   * @returns Array of flagged account records
   */
  static async getFlaggedAccounts(): Promise<
    Array<{
      userId: string;
      flaggedForReview: boolean;
      firstFlaggedAt: string;
      lastFlaggedAt: string;
      incidents: Array<{
        reason: string;
        rateLimitKey: string;
        timestamp: string;
      }>;
      resolved: boolean;
    }>
  > {
    try {
      const flagsRef = collection(db, FLAGS_COLLECTION_NAME);
      const q = query(flagsRef, where("resolved", "==", false));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          userId: data.userId ?? docSnap.id,
          flaggedForReview: data.flaggedForReview ?? true,
          firstFlaggedAt: data.firstFlaggedAt ?? "",
          lastFlaggedAt: data.lastFlaggedAt ?? "",
          incidents: data.incidents ?? [],
          resolved: data.resolved ?? false,
        };
      });
    } catch (error) {
      console.error("[RateLimiter] getFlaggedAccounts error:", error);
      return [];
    }
  }

  /**
   * Resolve a flagged account (mark as reviewed by admin).
   *
   * @param userId - The user ID to resolve
   */
  static async resolveFlag(userId: string): Promise<void> {
    try {
      const flagRef = doc(db, FLAGS_COLLECTION_NAME, userId);
      await updateDoc(flagRef, {
        resolved: true,
        resolvedAt: new Date().toISOString(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("[RateLimiter] resolveFlag error:", error);
    }
  }

  // ==========================================================================
  // Cleanup
  // ==========================================================================

  /**
   * Reset a specific rate limit record.
   *
   * Useful after successful authentication or admin override.
   *
   * @param config - Rate limit configuration
   * @param identifier - Unique identifier
   */
  static async resetLimit(
    config: RateLimitConfig,
    identifier: string
  ): Promise<void> {
    const key = buildRateLimitKey(config, identifier);

    try {
      const docRef = doc(db, COLLECTION_NAME, encodeKey(key));
      await deleteDoc(docRef);
    } catch (error) {
      console.error("[RateLimiter] resetLimit error:", error);
    }
  }
}

// ============================================================================
// Internal Helpers
// ============================================================================

/**
 * Encode a rate limit key for use as a Firestore document ID.
 * Firestore doc IDs cannot contain "/" so we replace problematic characters.
 */
function encodeKey(key: string): string {
  return key.replace(/\//g, "_").replace(/\+/g, "p");
}

/**
 * Create an "allowed" RateLimitResult.
 */
function createAllowedResult(
  config: RateLimitConfig,
  currentCount: number
): RateLimitResult {
  return {
    allowed: true,
    remaining: config.maxAttempts - currentCount,
    retryAfterSeconds: 0,
    currentCount,
    maxAttempts: config.maxAttempts,
    locked: false,
    backoffSeconds: 0,
  };
}
