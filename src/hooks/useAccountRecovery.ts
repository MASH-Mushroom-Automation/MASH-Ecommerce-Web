"use client";

/**
 * useAccountRecovery Hook
 *
 * Manages the account recovery flow when a user cannot access their phone
 * for 2FA verification. The flow:
 *
 * 1. User clicks "Can't access your phone?" link
 * 2. System sends a verification code to the user's email
 * 3. User enters the email code
 * 4. On success, 2FA is temporarily disabled (7-day grace period)
 * 5. Backup codes are generated and shown to the user
 * 6. Security event is logged to the audit trail
 */

import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { logSecurityEvent } from "@/lib/security/audit-trail";
import { SecurityEventType } from "@/types/security";
import {
  generateBackupCodes,
  hashAllBackupCodes,
} from "@/lib/security/backup-codes";
import {
  getFirestore,
  doc,
  updateDoc,
  Timestamp as FirestoreTimestamp,
} from "firebase/firestore";
import { firebaseApp } from "@/lib/firebase/config";
import { apiRequest } from "@/lib/api-client";

// ============================================================================
// Types
// ============================================================================

/** Steps in the account recovery flow */
export type RecoveryStep =
  | "idle"
  | "email-sent"
  | "verifying"
  | "codes-generated"
  | "complete";

/** Return value of the useAccountRecovery hook */
export interface UseAccountRecoveryReturn {
  /** Current step in the recovery flow */
  recoveryStep: RecoveryStep;
  /** Whether an async operation is in progress */
  isLoading: boolean;
  /** Error message from the last failed operation, or null */
  error: string | null;
  /** Generated backup codes (available after disableTwoFactorViaRecovery) */
  backupCodes: string[];
  /** Send a recovery verification code to the user's email */
  sendRecoveryEmail: (email: string) => Promise<void>;
  /** Verify the code the user received via email */
  verifyRecoveryCode: (code: string) => Promise<boolean>;
  /** Disable 2FA via recovery, log event, and return backup codes */
  disableTwoFactorViaRecovery: () => Promise<string[]>;
  /** Generate and store a fresh set of backup codes */
  generateAndStoreBackupCodes: () => Promise<string[]>;
  /** Reset the flow back to idle */
  reset: () => void;
}

// ============================================================================
// Constants
// ============================================================================

/** Grace period in days before the user must re-enable 2FA */
const GRACE_PERIOD_DAYS = 7;

// ============================================================================
// Hook
// ============================================================================

export function useAccountRecovery(): UseAccountRecoveryReturn {
  const { user, disable2FA } = useAuth();

  const [recoveryStep, setRecoveryStep] = useState<RecoveryStep>("idle");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  // ---------- Firestore instance ----------
  const db = getFirestore(firebaseApp);

  // ---------- Send recovery email ----------
  const sendRecoveryEmail = useCallback(
    async (email: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await apiRequest("/auth/recovery/send-code", {
          method: "POST",
          body: JSON.stringify({ email }),
        });

        setRecoveryStep("email-sent");
        toast.success("Recovery code sent to your email");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to send recovery email";
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // ---------- Verify recovery code ----------
  const verifyRecoveryCode = useCallback(
    async (code: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        setRecoveryStep("verifying");

        const response = await apiRequest<{ verified: boolean }>(
          "/auth/recovery/verify-code",
          {
            method: "POST",
            body: JSON.stringify({ code, email: user?.email }),
          },
        );

        if (response.verified) {
          toast.success("Recovery code verified");
          return true;
        }

        setError("Invalid or expired recovery code");
        setRecoveryStep("email-sent");
        toast.error("Invalid or expired recovery code");
        return false;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to verify recovery code";
        setError(message);
        setRecoveryStep("email-sent");
        toast.error(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.email],
  );

  // ---------- Generate & store backup codes ----------
  const generateAndStoreBackupCodes = useCallback(async (): Promise<
    string[]
  > => {
    if (!user?.id) throw new Error("User must be authenticated");

    const codes = generateBackupCodes();
    const hashes = await hashAllBackupCodes(codes);

    // Store hashed codes in Firestore user profile
    const userRef = doc(db, "users", user.id);
    await updateDoc(userRef, {
      backupCodes: hashes,
      backupCodesGeneratedAt: FirestoreTimestamp.now(),
    });

    setBackupCodes(codes);
    return codes;
  }, [user?.id, db]);

  // ---------- Disable 2FA via recovery flow ----------
  const disableTwoFactorViaRecovery = useCallback(async (): Promise<
    string[]
  > => {
    if (!user?.id) throw new Error("User must be authenticated");

    setIsLoading(true);
    setError(null);

    try {
      // 1. Disable 2FA through the auth context
      await disable2FA();

      // 2. Set 7-day grace period in Firestore
      const gracePeriodEnd = new Date();
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + GRACE_PERIOD_DAYS);

      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        twoFactorDisabledViaRecovery: true,
        twoFactorGracePeriodEnd: FirestoreTimestamp.fromDate(gracePeriodEnd),
      });

      // 3. Log security event
      await logSecurityEvent({
        userId: user.id,
        eventType: SecurityEventType.TWO_FA_DISABLED,
        success: true,
        metadata: {
          reason: "Account recovery - phone inaccessible",
          method: "email_verification",
          gracePeriodDays: GRACE_PERIOD_DAYS,
          gracePeriodEnd: gracePeriodEnd.toISOString(),
        },
      });

      // 4. Generate backup codes for future emergencies
      const codes = await generateAndStoreBackupCodes();

      setRecoveryStep("codes-generated");
      toast.success("Two-factor authentication temporarily disabled");

      return codes;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to disable 2FA";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, disable2FA, db, generateAndStoreBackupCodes]);

  // ---------- Reset ----------
  const reset = useCallback(() => {
    setRecoveryStep("idle");
    setIsLoading(false);
    setError(null);
    setBackupCodes([]);
  }, []);

  return {
    recoveryStep,
    isLoading,
    error,
    backupCodes,
    sendRecoveryEmail,
    verifyRecoveryCode,
    disableTwoFactorViaRecovery,
    generateAndStoreBackupCodes,
    reset,
  };
}
