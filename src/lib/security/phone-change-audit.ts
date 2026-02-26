/**
 * Phone Change Audit Service
 *
 * Firestore-backed audit logging for phone number changes.
 * Stores full history in phone_change_history collection for compliance
 * and security review.
 *
 * Collection: phone_change_history/{documentId}
 *
 * Usage:
 *   import { logPhoneChange, getPhoneChangeHistory } from "@/lib/security/phone-change-audit";
 *
 *   await logPhoneChange(userId, oldPhone, newPhone, "password_otp");
 *   const history = await getPhoneChangeHistory(userId);
 */

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { firebaseApp } from "@/lib/firebase/config";

// ============================================================================
// Types
// ============================================================================

/**
 * Method used to authorize the phone change
 */
export type PhoneChangeMethod =
  | "password_otp"
  | "password_2fa_otp"
  | "admin_override";

/**
 * Audit record for a phone number change
 */
export interface PhoneChangeRecord {
  /** Unique record ID */
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
  /** When the change occurred */
  changedAt: Date;
  /** Firestore server timestamp */
  createdAt: Date;
}

/**
 * Input for creating a phone change record (Firestore document shape)
 */
interface PhoneChangeDocumentData {
  userId: string;
  oldPhoneNumber: string;
  newPhoneNumber: string;
  method: PhoneChangeMethod;
  ipAddress: string | null;
  userAgent: string | null;
  changedAt: ReturnType<typeof serverTimestamp>;
  createdAt: ReturnType<typeof serverTimestamp>;
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
 * Log a phone number change to the audit trail.
 *
 * Creates a new document in phone_change_history with full details
 * of the change for compliance and security review.
 *
 * @param userId - Firebase user ID
 * @param oldPhoneNumber - Previous phone number (E.164 format)
 * @param newPhoneNumber - New phone number (E.164 format)
 * @param method - Authorization method used for the change
 * @param metadata - Optional metadata (IP address, user agent)
 * @returns The created audit record ID
 *
 * @example
 * const recordId = await logPhoneChange(
 *   "user123",
 *   "+639171234567",
 *   "+639181234567",
 *   "password_otp"
 * );
 */
export async function logPhoneChange(
  userId: string,
  oldPhoneNumber: string,
  newPhoneNumber: string,
  method: PhoneChangeMethod,
  metadata?: { ipAddress?: string; userAgent?: string }
): Promise<string> {
  if (!userId) {
    throw new Error("userId is required for phone change audit");
  }
  if (!oldPhoneNumber || !newPhoneNumber) {
    throw new Error("Both old and new phone numbers are required");
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
 * @param limitCount - Maximum records to return (default: 50)
 * @returns Array of phone change audit records
 *
 * @example
 * const history = await getPhoneChangeHistory("user123");
 * history.forEach(record => {
 *   console.log(`Changed from ${record.oldPhoneNumber} to ${record.newPhoneNumber}`);
 * });
 */
export async function getPhoneChangeHistory(
  userId: string,
  limitCount: number = 50
): Promise<PhoneChangeRecord[]> {
  if (!userId) {
    throw new Error("userId is required to retrieve phone change history");
  }

  const colRef = getCollectionRef();
  const q = query(
    colRef,
    where("userId", "==", userId),
    orderBy("changedAt", "desc")
  );

  const snapshot = await getDocs(q);
  const records: PhoneChangeRecord[] = [];

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
      changedAt: data.changedAt && typeof data.changedAt.toDate === "function"
        ? data.changedAt.toDate()
        : new Date(data.changedAt),
      createdAt: data.createdAt && typeof data.createdAt.toDate === "function"
        ? data.createdAt.toDate()
        : new Date(data.createdAt),
    });
  });

  // Apply client-side limit (Firestore limit() combined with orderBy
  // can sometimes behave unexpectedly with composite indexes)
  return records.slice(0, limitCount);
}
