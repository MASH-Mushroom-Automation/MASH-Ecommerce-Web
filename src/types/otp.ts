/**
 * OTP Verification Types
 *
 * Type definitions for OTP (One-Time Password) verification system.
 * Used for phone number verification, 2FA login, and phone number changes.
 */

import type { Timestamp } from "firebase/firestore";

/**
 * Purpose of the OTP verification
 */
export type OTPPurpose = 
  | "PHONE_VERIFICATION"  // Initial phone number verification
  | "2FA_LOGIN"           // Two-factor authentication during login
  | "PHONE_CHANGE";       // Changing existing phone number

/**
 * OTP Verification document structure in Firestore
 * Collection: otp_verifications/{verificationId}
 */
export interface OTPVerification {
  /** Firestore document ID */
  id: string;
  
  /** User ID (Firebase Auth UID) */
  userId: string;
  
  /** Phone number in E.164 format (+63XXXXXXXXXX) */
  phoneNumber: string;
  
  /** Hashed OTP code (bcrypt) - NEVER store plaintext */
  hashedCode: string;
  
  /** Purpose of this verification */
  purpose: OTPPurpose;
  
  /** Number of failed verification attempts */
  attempts: number;
  
  /** Maximum allowed attempts before locking */
  maxAttempts: number;
  
  /** Whether the OTP has been verified */
  verified: boolean;
  
  /** When the OTP expires (5 minutes from creation) */
  expiresAt: Timestamp;
  
  /** When the document was created */
  createdAt: Timestamp;
  
  /** When the document was last updated */
  updatedAt: Timestamp;
  
  /** TTL field for Firestore auto-cleanup (10 minutes) */
  _expiresAt: Timestamp;
}

/**
 * Input data for creating a new OTP verification
 */
export interface CreateOTPVerificationInput {
  /** User ID (Firebase Auth UID) */
  userId: string;
  
  /** Phone number in E.164 format */
  phoneNumber: string;
  
  /** Hashed OTP code (bcrypt) */
  hashedCode: string;
  
  /** Purpose of this verification */
  purpose: OTPPurpose;
  
  /** OTP expiry time in minutes (default: 5) */
  expiryMinutes?: number;
  
  /** TTL expiry time in minutes (default: 10) */
  ttlMinutes?: number;
}

/**
 * Result of OTP verification attempt
 */
export interface OTPVerificationResult {
  /** Whether verification was successful */
  success: boolean;
  
  /** Message describing the result */
  message: string;
  
  /** Whether verification is locked due to too many attempts */
  locked?: boolean;
  
  /** Remaining attempts before lock */
  remainingAttempts?: number;
}

/**
 * Query filters for finding OTP verifications
 */
export interface OTPVerificationQuery {
  /** Filter by user ID */
  userId?: string;
  
  /** Filter by phone number */
  phoneNumber?: string;
  
  /** Filter by purpose */
  purpose?: OTPPurpose;
  
  /** Filter by verified status */
  verified?: boolean;
  
  /** Include expired verifications (default: false) */
  includeExpired?: boolean;
}
