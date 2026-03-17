/**
 * OTP Verification Service
 *
 * Manages OTP (One-Time Password) verifications in Firestore.
 * Handles creation, verification, and cleanup of OTP records.
 *
 * Collection: otp_verifications/{verificationId}
 *
 * Security Features:
 * - OTP codes are hashed with bcrypt (never stored in plaintext)
 * - Maximum 3 verification attempts per OTP
 * - Auto-expiry after 5 minutes
 * - TTL auto-deletion after 10 minutes (Firestore TTL policy)
 * - Rate limiting enforced at API layer
 */

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  type Timestamp,
  Timestamp as FirestoreTimestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import { firebaseApp } from "./config";
import type {
  OTPVerification,
  CreateOTPVerificationInput,
  OTPVerificationResult,
  OTPVerificationQuery,
} from "@/types/otp";

// Initialize Firestore
const db = getFirestore(firebaseApp);

// ============================================================================
// Constants
// ============================================================================

const COLLECTION_NAME = "otp_verifications";
const DEFAULT_EXPIRY_MINUTES = 5;
const DEFAULT_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 3;

// ============================================================================
// OTP Verification Service
// ============================================================================

export const OTPService = {
  /**
   * Create a new OTP verification record
   * @param input - OTP verification data
   * @returns The created verification ID
   */
  async createVerification(
    input: CreateOTPVerificationInput
  ): Promise<string> {
    try {
      const verificationRef = doc(collection(db, COLLECTION_NAME));
      const now = new Date();
      
      // Calculate expiry timestamps
      const expiryMinutes = input.expiryMinutes || DEFAULT_EXPIRY_MINUTES;
      const ttlMinutes = input.ttlMinutes || DEFAULT_TTL_MINUTES;
      
      const expiresAt = new Date(now.getTime() + expiryMinutes * 60 * 1000);
      const ttlExpiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);
      
      const verificationData = {
        id: verificationRef.id,
        userId: input.userId,
        phoneNumber: input.phoneNumber,
        hashedCode: input.hashedCode,
        purpose: input.purpose,
        attempts: 0,
        maxAttempts: MAX_ATTEMPTS,
        verified: false,
        expiresAt: FirestoreTimestamp.fromDate(expiresAt),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        _expiresAt: FirestoreTimestamp.fromDate(ttlExpiresAt),
      };

      await setDoc(verificationRef, verificationData);
      
      console.log(`[OTPService] Created verification ${verificationRef.id} for user ${input.userId}`);
      return verificationRef.id;
    } catch (error) {
      console.error("[OTPService] Create verification error:", error);
      throw new Error("Failed to create OTP verification");
    }
  },

  /**
   * Get an OTP verification by ID
   * @param verificationId - The verification document ID
   * @returns The verification data or null if not found
   */
  async getVerification(
    verificationId: string
  ): Promise<OTPVerification | null> {
    try {
      const verificationRef = doc(db, COLLECTION_NAME, verificationId);
      const snapshot = await getDoc(verificationRef);

      if (!snapshot.exists()) {
        return null;
      }

      return snapshot.data() as OTPVerification;
    } catch (error) {
      console.error("[OTPService] Get verification error:", error);
      throw new Error("Failed to retrieve OTP verification");
    }
  },

  /**
   * Find OTP verifications matching query criteria
   * @param queryParams - Query filters
   * @returns Array of matching verifications
   */
  async findVerifications(
    queryParams: OTPVerificationQuery
  ): Promise<OTPVerification[]> {
    try {
      let q = query(collection(db, COLLECTION_NAME));

      // Apply filters
      if (queryParams.userId) {
        q = query(q, where("userId", "==", queryParams.userId));
      }
      if (queryParams.phoneNumber) {
        q = query(q, where("phoneNumber", "==", queryParams.phoneNumber));
      }
      if (queryParams.purpose) {
        q = query(q, where("purpose", "==", queryParams.purpose));
      }
      if (queryParams.verified !== undefined) {
        q = query(q, where("verified", "==", queryParams.verified));
      }

      // Order by creation date (newest first)
      q = query(q, orderBy("createdAt", "desc"));
      
      // Limit results
      q = query(q, limit(10));

      const snapshot = await getDocs(q);
      const verifications = snapshot.docs.map(
        (doc) => doc.data() as OTPVerification
      );

      // Filter out expired verifications if not explicitly requested
      if (!queryParams.includeExpired) {
        const now = new Date();
        return verifications.filter((v) => {
          const expiresAt = v.expiresAt.toDate();
          return expiresAt > now;
        });
      }

      return verifications;
    } catch (error) {
      console.error("[OTPService] Find verifications error:", error);
      throw new Error("Failed to find OTP verifications");
    }
  },

  /**
   * Get the latest unverified OTP for a user and purpose
   * @param userId - User ID
   * @param purpose - OTP purpose
   * @returns The latest verification or null
   */
  async getLatestVerification(
    userId: string,
    purpose: string
  ): Promise<OTPVerification | null> {
    try {
      const verifications = await this.findVerifications({
        userId,
        purpose: purpose as OTPVerification["purpose"],
        verified: false,
        includeExpired: false,
      });

      return verifications[0] || null;
    } catch (error) {
      console.error("[OTPService] Get latest verification error:", error);
      return null;
    }
  },

  /**
   * Increment failed verification attempts
   * @param verificationId - The verification document ID
   * @returns Updated verification data
   */
  async incrementAttempts(
    verificationId: string
  ): Promise<OTPVerification | null> {
    try {
      const verification = await this.getVerification(verificationId);
      if (!verification) {
        return null;
      }

      const newAttempts = verification.attempts + 1;
      const verificationRef = doc(db, COLLECTION_NAME, verificationId);

      await updateDoc(verificationRef, {
        attempts: newAttempts,
        updatedAt: serverTimestamp(),
      });

      return {
        ...verification,
        attempts: newAttempts,
      };
    } catch (error) {
      console.error("[OTPService] Increment attempts error:", error);
      throw new Error("Failed to update verification attempts");
    }
  },

  /**
   * Mark an OTP verification as verified
   * @param verificationId - The verification document ID
   * @returns Success status
   */
  async markAsVerified(verificationId: string): Promise<boolean> {
    try {
      const verificationRef = doc(db, COLLECTION_NAME, verificationId);
      
      await updateDoc(verificationRef, {
        verified: true,
        updatedAt: serverTimestamp(),
      });

      console.log(`[OTPService] Marked verification ${verificationId} as verified`);
      return true;
    } catch (error) {
      console.error("[OTPService] Mark verified error:", error);
      return false;
    }
  },

  /**
   * Delete an OTP verification (cleanup)
   * @param verificationId - The verification document ID
   * @returns Success status
   */
  async deleteVerification(verificationId: string): Promise<boolean> {
    try {
      const verificationRef = doc(db, COLLECTION_NAME, verificationId);
      await deleteDoc(verificationRef);
      
      console.log(`[OTPService] Deleted verification ${verificationId}`);
      return true;
    } catch (error) {
      console.error("[OTPService] Delete verification error:", error);
      return false;
    }
  },

  /**
   * Delete all verifications for a user (cleanup on user deletion)
   * @param userId - User ID
   * @returns Number of verifications deleted
   */
  async deleteUserVerifications(userId: string): Promise<number> {
    try {
      const verifications = await this.findVerifications({
        userId,
        includeExpired: true,
      });

      let deletedCount = 0;
      for (const verification of verifications) {
        const success = await this.deleteVerification(verification.id);
        if (success) deletedCount++;
      }

      console.log(`[OTPService] Deleted ${deletedCount} verifications for user ${userId}`);
      return deletedCount;
    } catch (error) {
      console.error("[OTPService] Delete user verifications error:", error);
      return 0;
    }
  },

  /**
   * Check if a verification is valid (not expired, not locked)
   * @param verification - The verification to check
   * @returns Validation result
   */
  isVerificationValid(verification: OTPVerification): OTPVerificationResult {
    const now = new Date();
    const expiresAt = verification.expiresAt.toDate();

    // Check expiry
    if (expiresAt < now) {
      return {
        success: false,
        message: "OTP has expired. Please request a new code.",
      };
    }

    // Check if locked due to too many attempts
    if (verification.attempts >= verification.maxAttempts) {
      return {
        success: false,
        message: "Too many failed attempts. Please request a new code.",
        locked: true,
        remainingAttempts: 0,
      };
    }

    // Check if already verified
    if (verification.verified) {
      return {
        success: false,
        message: "This OTP has already been used.",
      };
    }

    return {
      success: true,
      message: "Verification is valid",
      remainingAttempts: verification.maxAttempts - verification.attempts,
    };
  },
};

// Export for use in API routes and components
export default OTPService;
