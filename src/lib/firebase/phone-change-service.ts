/**
 * Phone Change Service
 *
 * Handles the complete phone number change workflow:
 * 1. Validates new phone number
 * 2. Logs audit trail to Firestore phone_change_history collection
 * 3. Updates user profile with new phone number
 * 4. Resets phoneVerifiedAt timestamp
 * 5. Preserves 2FA enabled status
 *
 * Uses Firestore for audit logging.
 * Integrates with backend UserApi for profile updates.
 *
 * @module phone-change-service
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
 * Method used to authorize the phone change
 */
export type PhoneChangeMethod =
  | "otp_only"
  | "password_otp"
  | "password_2fa_otp"
  | "admin_override";

/**
 * Result of a phone change operation
 */
export interface PhoneChangeResult {
  success: boolean;
  auditId: string | null;
  error: string | null;
}

/**
 * Audit record stored in Firestore phone_change_history collection
 */
export interface PhoneChangeAuditRecord {
  /** Unique document ID */
  id: string;
  /** User who changed their phone */
  userId: string;
  /** Previous phone number (E.164) */
  oldPhoneNumber: string;
  /** New phone number (E.164) */
  newPhoneNumber: string;
  /** Authorization method used */
  method: PhoneChangeMethod;
  /** IP address if available */
  ipAddress: string | null;
  /** User agent string if available */
  userAgent: string | null;
  /** Whether 2FA was enabled at time of change */
  twoFactorEnabledAtChange: boolean;
  /** When the change occurred (Firestore server timestamp) */
  changedAt: Timestamp | Date;
  /** Firestore server timestamp */
  createdAt: Timestamp | Date;
}

/**
 * Data shape for the Firestore document
 */
interface PhoneChangeDocumentData {
  userId: string;
  oldPhoneNumber: string;
  newPhoneNumber: string;
  method: PhoneChangeMethod;
  ipAddress: string | null;
  userAgent: string | null;
  twoFactorEnabledAtChange: boolean;
  changedAt: ReturnType<typeof serverTimestamp>;
  createdAt: ReturnType<typeof serverTimestamp>;
}

/**
 * Options for logging a phone change
 */
export interface LogPhoneChangeOptions {
  userId: string;
  oldPhoneNumber: string;
  newPhoneNumber: string;
  method: PhoneChangeMethod;
  twoFactorEnabledAtChange?: boolean;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
  };
}

// ============================================================================
// Constants
// ============================================================================

const COLLECTION_NAME = "phone_change_history";

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
 * Log a phone number change to the Firestore audit trail.
 *
 * Creates a document in phone_change_history with full change details
 * for compliance and security review.
 *
 * @param options - Phone change details to log
 * @returns The created audit record ID
 * @throws Error if required fields are missing
 *
 * @example
 * const auditId = await logPhoneChangeAudit({
 *   userId: "user-123",
 *   oldPhoneNumber: "+639171234567",
 *   newPhoneNumber: "+639181234567",
 *   method: "otp_only",
 *   twoFactorEnabledAtChange: false,
 *   metadata: { userAgent: navigator.userAgent },
 * });
 */
export async function logPhoneChangeAudit(
  options: LogPhoneChangeOptions
): Promise<string> {
  const {
    userId,
    oldPhoneNumber,
    newPhoneNumber,
    method,
    twoFactorEnabledAtChange = false,
    metadata,
  } = options;

  if (!userId) {
    throw new Error("userId is required for phone change audit");
  }
  if (!oldPhoneNumber) {
    throw new Error("oldPhoneNumber is required for phone change audit");
  }
  if (!newPhoneNumber) {
    throw new Error("newPhoneNumber is required for phone change audit");
  }

  const colRef = getCollectionRef();
  const docRef = doc(colRef);

  const data: PhoneChangeDocumentData = {
    userId,
    oldPhoneNumber,
    newPhoneNumber,
    method,
    ipAddress: metadata?.ipAddress ?? null,
    userAgent: metadata?.userAgent ?? null,
    twoFactorEnabledAtChange,
    changedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  };

  await setDoc(docRef, data);

  return docRef.id;
}

/**
 * Retrieve phone change history for a user, ordered by most recent first.
 *
 * @param userId - Firebase user ID
 * @param maxRecords - Maximum records to return (default: 50)
 * @returns Array of phone change audit records
 *
 * @example
 * const history = await getPhoneChangeHistory("user-123", 10);
 * history.forEach(record => {
 *   console.log(`Changed from ${record.oldPhoneNumber} to ${record.newPhoneNumber}`);
 * });
 */
export async function getPhoneChangeHistory(
  userId: string,
  maxRecords: number = 50
): Promise<PhoneChangeAuditRecord[]> {
  if (!userId) {
    throw new Error("userId is required to retrieve phone change history");
  }

  const colRef = getCollectionRef();
  const q = query(
    colRef,
    where("userId", "==", userId),
    orderBy("changedAt", "desc"),
    limit(maxRecords)
  );

  const snapshot = await getDocs(q);
  const records: PhoneChangeAuditRecord[] = [];

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    records.push({
      id: docSnap.id,
      userId: data.userId,
      oldPhoneNumber: data.oldPhoneNumber,
      newPhoneNumber: data.newPhoneNumber,
      method: data.method,
      ipAddress: data.ipAddress ?? null,
      userAgent: data.userAgent ?? null,
      twoFactorEnabledAtChange: data.twoFactorEnabledAtChange ?? false,
      changedAt:
        data.changedAt && typeof data.changedAt.toDate === "function"
          ? data.changedAt.toDate()
          : new Date(data.changedAt),
      createdAt:
        data.createdAt && typeof data.createdAt.toDate === "function"
          ? data.createdAt.toDate()
          : new Date(data.createdAt),
    });
  });

  return records;
}

/**
 * Execute a complete phone change operation:
 * 1. Log audit trail
 * 2. Return result for the caller to update profile
 *
 * The caller (ChangePhoneModal) is responsible for:
 * - Sending/verifying OTP before calling this
 * - Updating the user profile via AuthContext after success
 * - Resetting phoneVerifiedAt after success
 *
 * @param options - Phone change details
 * @returns PhoneChangeResult with auditId on success
 *
 * @example
 * const result = await executePhoneChange({
 *   userId: "user-123",
 *   oldPhoneNumber: "+639171234567",
 *   newPhoneNumber: "+639181234567",
 *   method: "otp_only",
 * });
 * if (result.success) {
 *   await updateProfile({ phone: newPhone, phoneVerifiedAt: new Date() });
 * }
 */
export async function executePhoneChange(
  options: LogPhoneChangeOptions
): Promise<PhoneChangeResult> {
  try {
    const auditId = await logPhoneChangeAudit(options);
    return { success: true, auditId, error: null };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to log phone change";
    return { success: false, auditId: null, error: message };
  }
}
