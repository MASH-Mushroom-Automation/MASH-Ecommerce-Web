/**
 * Security Audit Trail Service
 *
 * Logs and retrieves security events for the audit trail.
 * Events are stored in Firestore with a 90-day TTL for auto-cleanup.
 *
 * Collection: security_events/{eventId}
 *
 * Features:
 * - Logs all phone verification, 2FA, and OTP events
 * - Auto-masks phone numbers for privacy
 * - Auto-detects IP address and user agent on the client
 * - 90-day retention via Firestore TTL on _expiresAt field
 * - Retrieves recent events for the profile security view
 */

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit as firestoreLimit,
  Timestamp as FirestoreTimestamp,
} from "firebase/firestore";
import { firebaseApp } from "@/lib/firebase/config";
import { maskPhoneNumber } from "@/lib/phone-utils";
import type {
  SecurityEvent,
  SecurityEventType,
  LogSecurityEventInput,
} from "@/types/security";

// ============================================================================
// Constants
// ============================================================================

const COLLECTION_NAME = "security_events";

/** Retention period in days for security events */
const RETENTION_DAYS = 90;

/** Default limit for recent events query */
const DEFAULT_RECENT_LIMIT = 10;

// ============================================================================
// Firestore Instance
// ============================================================================

const db = getFirestore(firebaseApp);

// ============================================================================
// Client Environment Helpers
// ============================================================================

/**
 * Detect the client IP address.
 * In a browser environment this is not directly available, so we return
 * 'unknown'. Server-side callers should pass the IP explicitly.
 */
function detectIpAddress(): string {
  return "unknown";
}

/**
 * Detect the browser user agent string.
 * Returns 'unknown' in SSR / non-browser environments.
 */
function detectUserAgent(): string {
  if (typeof navigator !== "undefined" && navigator.userAgent) {
    return navigator.userAgent;
  }
  return "unknown";
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Log a security event to Firestore.
 *
 * Automatically populates:
 * - ipAddress (from client or fallback)
 * - userAgent (from navigator or fallback)
 * - phoneNumber (masked via maskPhoneNumber)
 * - createdAt (current timestamp)
 * - _expiresAt (createdAt + 90 days)
 *
 * @param input - Partial event data to log
 * @throws Error if userId or eventType is missing
 */
export async function logSecurityEvent(
  input: LogSecurityEventInput
): Promise<void> {
  if (!input.userId) {
    throw new Error("userId is required to log a security event");
  }
  if (!input.eventType) {
    throw new Error("eventType is required to log a security event");
  }

  const now = FirestoreTimestamp.now();
  const expiresAt = FirestoreTimestamp.fromMillis(
    now.toMillis() + RETENTION_DAYS * 24 * 60 * 60 * 1000
  );

  const docRef = doc(collection(db, COLLECTION_NAME));

  const event: SecurityEvent = {
    id: docRef.id,
    userId: input.userId,
    eventType: input.eventType as SecurityEventType,
    ipAddress: input.ipAddress ?? detectIpAddress(),
    userAgent: input.userAgent ?? detectUserAgent(),
    phoneNumber: input.phoneNumber ? maskPhoneNumber(input.phoneNumber) : "",
    success: input.success ?? true,
    metadata: input.metadata ?? {},
    createdAt: now,
    _expiresAt: expiresAt,
  };

  await setDoc(docRef, event);
}

/**
 * Retrieve recent security events for a user, ordered by most recent first.
 *
 * @param userId - Firebase Auth UID
 * @param eventLimit - Maximum number of events to return (default: 10)
 * @returns Array of SecurityEvent objects sorted newest-first
 */
export async function getRecentEvents(
  userId: string,
  eventLimit: number = DEFAULT_RECENT_LIMIT
): Promise<SecurityEvent[]> {
  if (!userId) {
    return [];
  }

  const eventsRef = collection(db, COLLECTION_NAME);
  const q = query(
    eventsRef,
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    firestoreLimit(eventLimit)
  );

  const snapshot = await getDocs(q);
  const events: SecurityEvent[] = [];

  snapshot.forEach((docSnap) => {
    events.push(docSnap.data() as SecurityEvent);
  });

  return events;
}
