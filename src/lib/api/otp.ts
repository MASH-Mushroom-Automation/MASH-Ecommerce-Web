import { ApiResponse } from "@/types/api";

/**
 * Local fetch helper – calls our own Next.js API routes (/api/otp/*)
 * instead of the backend, so no CSRF token is needed.
 */
async function localApiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    },
  });

  const data = await res.json();

  if (!res.ok && !data.success) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }

  return data as T;
}

// OTP Error Codes for typed error handling
export enum OTPErrorCode {
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  INVALID_OTP = "INVALID_OTP",
  EXPIRED_OTP = "EXPIRED_OTP",
  MAX_ATTEMPTS_EXCEEDED = "MAX_ATTEMPTS_EXCEEDED",
  PHONE_NOT_FOUND = "PHONE_NOT_FOUND",
  INVALID_PHONE_FORMAT = "INVALID_PHONE_FORMAT",
  TWILIO_ERROR = "TWILIO_ERROR",
  OTP_NOT_FOUND = "OTP_NOT_FOUND",
  VERIFICATION_LOCKED = "VERIFICATION_LOCKED",
  COOLDOWN_ACTIVE = "COOLDOWN_ACTIVE",
}

// Request Types
export interface SendOTPRequest {
  phoneNumber: string; // E.164 format: +63XXXXXXXXXX
  purpose?: "PHONE_VERIFICATION" | "2FA_LOGIN" | "PHONE_CHANGE"; // Default: PHONE_VERIFICATION
}

export interface VerifyOTPRequest {
  phoneNumber: string; // E.164 format: +63XXXXXXXXXX
  code: string; // 6-digit numeric code
}

export interface ResendOTPRequest {
  phoneNumber: string; // E.164 format: +63XXXXXXXXXX
}

// Response Types
export interface SendOTPData {
  success: boolean;
  message: string;
  phoneNumber: string; // Masked: +63 *** *** **34
  expiresAt: string; // ISO 8601 timestamp
  expiresIn: number; // Seconds until expiration (300 = 5 minutes)
  cooldownUntil?: string; // ISO 8601 timestamp - if rate limited
  attemptsRemaining?: number; // How many send attempts left in current window
}

export interface VerifyOTPData {
  success: boolean;
  verified: boolean;
  message: string;
  attemptsRemaining?: number; // How many verification attempts left before lock
  lockedUntil?: string; // ISO 8601 timestamp - if locked after 3 failed attempts
}

export interface ResendOTPData {
  success: boolean;
  message: string;
  phoneNumber: string; // Masked: +63 *** *** **34
  expiresAt: string; // ISO 8601 timestamp
  expiresIn: number; // Seconds until expiration (300 = 5 minutes)
  cooldownUntil?: string; // ISO 8601 timestamp - must wait before next resend
  attemptsRemaining?: number; // How many resend attempts left
}

// OTP API Response wrapper
export type SendOTPResponse = ApiResponse<SendOTPData>;
export type VerifyOTPResponse = ApiResponse<VerifyOTPData>;
export type ResendOTPResponse = ApiResponse<ResendOTPData>;

/**
 * OTP API Service
 * 
 * Frontend API client for OTP (One-Time Password) operations.
 * Backend endpoints handle OTP generation, Twilio SMS sending, verification, and rate limiting.
 * 
 * IMPORTANT: This is FRONTEND CLIENT ONLY. Backend implementation required in MASH-Backend repo.
 * 
 * Backend endpoints to implement:
 * - POST /api/v1/otp/send - Generate 6-digit OTP, hash with bcrypt, store in Firestore, send via Twilio
 * - POST /api/v1/otp/verify - Verify OTP code with bcrypt comparison, track attempts, lock after 3 failures
 * - POST /api/v1/otp/resend - Resend existing OTP (same code), enforce 60s cooldown between resends
 * 
 * Security features (backend responsibility):
 * - OTP storage: Hashed with bcrypt (cost factor 10), never plaintext
 * - Rate limiting: Max 3 sends per phone per 15min, max 5 per user per hour
 * - Attempt tracking: Lock verification after 3 failed attempts
 * - Expiration: OTPs expire after 5 minutes
 * - Firestore TTL: Auto-delete OTP documents after 10 minutes
 * - Cooldown: 60 seconds between resend requests
 */
export const OTPApi = {
  /**
   * Send OTP to phone number via Twilio SMS
   * 
   * Backend generates 6-digit OTP (100000-999999), hashes it with bcrypt,
   * stores in Firestore otp_verifications collection, and sends via Twilio.
   * 
   * @param phoneNumber - Phone number in E.164 format (+63XXXXXXXXXX)
   * @param purpose - Purpose of OTP (default: PHONE_VERIFICATION)
   * @returns Promise<SendOTPResponse> with masked phone number and expiration
   * 
   * @throws {Error} Rate limit exceeded (3 sends per 15min per phone)
   * @throws {Error} Invalid phone format (must be E.164: +63XXXXXXXXXX)
   * @throws {Error} Twilio API failure
   * 
   * @example
   * const result = await OTPApi.sendOTP("+639171234567");
   * console.log(result.data.message); // "OTP sent to +63 *** *** **67"
   * console.log(result.data.expiresIn); // 300 (5 minutes)
   */
  sendOTP: async (
    phoneNumber: string,
    purpose: SendOTPRequest["purpose"] = "PHONE_VERIFICATION"
  ): Promise<SendOTPResponse> => {
    return localApiRequest<SendOTPResponse>("/api/otp/send", {
      method: "POST",
      body: JSON.stringify({ phoneNumber, purpose }),
    });
  },

  /**
   * Verify OTP code for phone number
   * 
   * Backend compares provided code with hashed OTP using bcrypt.compare().
   * Tracks verification attempts and locks after 3 failed attempts.
   * 
   * @param phoneNumber - Phone number in E.164 format (+63XXXXXXXXXX)
   * @param code - 6-digit OTP code received via SMS
   * @returns Promise<VerifyOTPResponse> with verification status
   * 
   * @throws {Error} Invalid OTP code
   * @throws {Error} Expired OTP (> 5 minutes old)
   * @throws {Error} Max attempts exceeded (3 failures = locked)
   * @throws {Error} Verification locked (must wait or request new OTP)
   * @throws {Error} OTP not found (expired or never sent)
   * 
   * @example
   * const result = await OTPApi.verifyOTP("+639171234567", "123456");
   * if (result.data.verified) {
   *   console.log("Phone verified!");
   * } else {
   *   console.log(`${result.data.attemptsRemaining} attempts remaining`);
   * }
   */
  verifyOTP: async (
    phoneNumber: string,
    code: string
  ): Promise<VerifyOTPResponse> => {
    return localApiRequest<VerifyOTPResponse>("/api/otp/verify", {
      method: "POST",
      body: JSON.stringify({ phoneNumber, code }),
    });
  },

  /**
   * Resend OTP to phone number (same code, new SMS)
   * 
   * Backend resends the SAME OTP code (not a new one) via Twilio.
   * Enforces 60-second cooldown between resend requests to prevent abuse.
   * 
   * @param phoneNumber - Phone number in E.164 format (+63XXXXXXXXXX)
   * @returns Promise<ResendOTPResponse> with new expiration time
   * 
   * @throws {Error} Cooldown active (must wait 60s between resends)
   * @throws {Error} OTP not found (expired or never sent)
   * @throws {Error} Rate limit exceeded
   * @throws {Error} Twilio API failure
   * 
   * @example
   * const result = await OTPApi.resendOTP("+639171234567");
   * if (result.success) {
   *   console.log("OTP resent successfully");
   * } else if (result.data.cooldownUntil) {
   *   console.log(`Wait until ${result.data.cooldownUntil} to resend`);
   * }
   */
  resendOTP: async (phoneNumber: string): Promise<ResendOTPResponse> => {
    return localApiRequest<ResendOTPResponse>("/api/otp/resend", {
      method: "POST",
      body: JSON.stringify({ phoneNumber }),
    });
  },
};
