/**
 * Security Events Service
 *
 * Logs and retrieves security audit trail events for:
 * - Phone verification and changes
 * - 2FA enable/disable/login attempts
 * - Account recovery operations
 * - Backup code generation
 *
 * Events are stored in Firestore `security_events` collection
 * with a 90-day TTL via `_expiresAt` field.
 *
 * @module security-events
 */

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  Timestamp,
} from "firebase/firestore";
import { firebaseApp } from "@/lib/firebase/config";

// ============================================================================
// Types
// ============================================================================

/**
 * Types of security events tracked in the audit trail
 */
export type SecurityEventType =
  | "PHONE_VERIFIED"
  | "PHONE_CHANGED"
  | "2FA_ENABLED"
  | "2FA_DISABLED"
  | "2FA_LOGIN_SUCCESS"
  | "2FA_LOGIN_FAILED"
  | "ACCOUNT_RECOVERY_INITIATED"
  | "ACCOUNT_RECOVERY_COMPLETED"
  | "BACKUP_CODES_GENERATED";

/**
 * Security event record stored in Firestore security_events collection
 */
export interface SecurityEvent {
  /** Unique document ID */
  id: string;
  /** User who triggered the event */
  userId: string;
  /** Type of security event */
  eventType: SecurityEventType;
  /** IP address if available */
  ipAddress: string | null;
  /** User agent string if available */
  userAgent: string | null;
  /** Masked phone number if applicable */
  phoneNumber: string | null;
  /** Whether the operation succeeded */
  success: boolean;
  /** Additional event-specific data */
  metadata: Record<string, unknown>;
  /** When the event occurred (Firestore server timestamp) */
  createdAt: Timestamp | Date;
  /** TTL: auto-delete after 90 days */
  _expiresAt: Timestamp | Date;
}

/**
 * Data shape for the Firestore document (excludes id)
 */
interface SecurityEventDocumentData {
  userId: string;
  eventType: SecurityEventType;
  ipAddress: string | null;
  userAgent: string | null;
  phoneNumber: string | null;
  success: boolean;
  metadata: Record<string, unknown>;
  createdAt: ReturnType<typeof serverTimestamp>;
  _expiresAt: Timestamp;
}

/**
 * Options for logging a security event
 */
export interface LogSecurityEventOptions {
  userId: string;
  eventType: SecurityEventType;
  success?: boolean;
  phoneNumber?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

// ============================================================================
// Constants
// ============================================================================

const COLLECTION_NAME = "security_events";
const TTL_DAYS = 90;
const TTL_MS = TTL_DAYS * 24 * 60 * 60 * 1000;
const DEFAULT_MAX_RECORDS = 50;

// ============================================================================
// Firestore Helpers
// ============================================================================

function getDb() {
  return getFirestore(firebaseApp);
}

function getCollectionRef() {
  return collection(getDb(), COLLECTION_NAME);
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Log a security event to the Firestore audit trail.
 *
 * Creates a document in security_events with event details
 * and a 90-day TTL for automatic cleanup.
 *
 * @param options - Security event details to log
 * @returns The created document ID
 * @throws Error if userId is missing
 * @throws Error if eventType is missing
 *
 * @example
 * const eventId = await logSecurityEvent({
 *   userId: "user-123",
 *   eventType: "2FA_ENABLED",
 *   success: true,
 *   phoneNumber: "+63917***4567",
 *   metadata: { method: "sms" },
 * });
 */
export async function logSecurityEvent(
  options: LogSecurityEventOptions
): Promise<string> {
  const {
    userId,
    eventType,
    success = true,
    phoneNumber = null,
    metadata = {},
    ipAddress = null,
    userAgent = null,
  } = options;

  if (!userId) {
    throw new Error("userId is required for security event logging");
  }

  if (!eventType) {
    throw new Error("eventType is required for security event logging");
  }

  const colRef = getCollectionRef();
  const docRef = doc(colRef);

  const expiresAt = Timestamp.fromDate(new Date(Date.now() + TTL_MS));

  const data: SecurityEventDocumentData = {
    userId,
    eventType,
    ipAddress,
    userAgent,
    phoneNumber,
    success,
    metadata,
    createdAt: serverTimestamp(),
    _expiresAt: expiresAt,
  };

  await setDoc(docRef, data);

  return docRef.id;
}

/**
 * Retrieve security events for a user, ordered by most recent first.
 *
 * @param userId - Firebase user ID
 * @param maxRecords - Maximum records to return (default: 50)
 * @returns Array of security event records
 * @throws Error if userId is missing
 *
 * @example
 * const events = await getSecurityEvents("user-123", 10);
 * events.forEach(event => {
 *   console.log(`${event.eventType}: ${event.success ? "success" : "failed"}`);
 * });
 */
export async function getSecurityEvents(
  userId: string,
  maxRecords: number = DEFAULT_MAX_RECORDS
): Promise<SecurityEvent[]> {
  if (!userId) {
    throw new Error("userId is required to retrieve security events");
  }

  const colRef = getCollectionRef();
  const q = query(
    colRef,
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(maxRecords)
  );

  const snapshot = await getDocs(q);
  const events: SecurityEvent[] = [];

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    events.push({
      id: docSnap.id,
      userId: data.userId,
      eventType: data.eventType,
      ipAddress: data.ipAddress ?? null,
      userAgent: data.userAgent ?? null,
      phoneNumber: data.phoneNumber ?? null,
      success: data.success ?? true,
      metadata: data.metadata ?? {},
      createdAt:
        data.createdAt && typeof data.createdAt.toDate === "function"
          ? data.createdAt.toDate()
          : new Date(data.createdAt),
      _expiresAt:
        data._expiresAt && typeof data._expiresAt.toDate === "function"
          ? data._expiresAt.toDate()
          : new Date(data._expiresAt),
    });
  });

  return events;
}

/**
 * Retrieve security events for a user filtered by event type,
 * ordered by most recent first.
 *
 * @param userId - Firebase user ID
 * @param eventType - Type of security event to filter
 * @param maxRecords - Maximum records to return (default: 50)
 * @returns Array of filtered security event records
 * @throws Error if userId is missing
 * @throws Error if eventType is missing
 *
 * @example
 * const failedLogins = await getSecurityEventsByType("user-123", "2FA_LOGIN_FAILED", 5);
 */
export async function getSecurityEventsByType(
  userId: string,
  eventType: SecurityEventType,
  maxRecords: number = DEFAULT_MAX_RECORDS
): Promise<SecurityEvent[]> {
  if (!userId) {
    throw new Error("userId is required to retrieve security events");
  }

  if (!eventType) {
    throw new Error("eventType is required to filter security events");
  }

  const colRef = getCollectionRef();
  const q = query(
    colRef,
    where("userId", "==", userId),
    where("eventType", "==", eventType),
    orderBy("createdAt", "desc"),
    limit(maxRecords)
  );

  const snapshot = await getDocs(q);
  const events: SecurityEvent[] = [];

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    events.push({
      id: docSnap.id,
      userId: data.userId,
      eventType: data.eventType,
      ipAddress: data.ipAddress ?? null,
      userAgent: data.userAgent ?? null,
      phoneNumber: data.phoneNumber ?? null,
      success: data.success ?? true,
      metadata: data.metadata ?? {},
      createdAt:
        data.createdAt && typeof data.createdAt.toDate === "function"
          ? data.createdAt.toDate()
          : new Date(data.createdAt),
      _expiresAt:
        data._expiresAt && typeof data._expiresAt.toDate === "function"
          ? data._expiresAt.toDate()
          : new Date(data._expiresAt),
    });
  });

  return events;
}
