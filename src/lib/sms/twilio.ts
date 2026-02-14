/**
 * Twilio SMS Service
 *
 * Service for sending SMS messages via Twilio API.
 * Used for phone verification OTP codes and 2FA authentication.
 * Includes rate limiting and error handling with exponential backoff retry.
 */

import { doc, getDoc, setDoc, increment, serverTimestamp, deleteDoc, getFirestore } from "firebase/firestore";
import { firebaseApp } from "@/lib/firebase/config";

const db = getFirestore(firebaseApp);

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

export interface SendSMSOptions {
  phoneNumber: string;
  message: string;
  userId?: string; // For rate limiting
}

export interface SendSMSResult {
  success: boolean;
  messageSid?: string;
  error?: string;
  rateLimited?: boolean;
}

export interface RateLimitInfo {
  phoneNumber: string;
  userId?: string;
  count: number;
  windowStart: number; // Timestamp
  ttl: number; // Expiry timestamp
}

// ============================================================================
// Configuration
// ============================================================================

/**
 * Check if Twilio is configured with required environment variables
 */
export function isTwilioConfigured(): boolean {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

  return !!(accountSid && authToken && phoneNumber);
}

/**
 * Get Twilio configuration from environment variables
 */
function getTwilioConfig(): TwilioConfig | null {
  if (!isTwilioConfigured()) {
    return null;
  }

  return {
    accountSid: process.env.TWILIO_ACCOUNT_SID!,
    authToken: process.env.TWILIO_AUTH_TOKEN!,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER!,
  };
}

// ============================================================================
// Rate Limiting (Firestore-based)
// ============================================================================

const RATE_LIMIT_PHONE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_PHONE_MAX = 3; // Max 3 SMS per phone per 15 min
const RATE_LIMIT_USER_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_USER_MAX = 5; // Max 5 SMS per user per hour

/**
 * Check rate limit for phone number
 */
async function checkPhoneRateLimit(phoneNumber: string): Promise<boolean> {
  const rateLimitRef = doc(db, "sms_rate_limits", `phone_${phoneNumber}`);
  const rateLimitDoc = await getDoc(rateLimitRef);

  if (!rateLimitDoc.exists()) {
    // First SMS for this phone - create rate limit doc
    await setDoc(rateLimitRef, {
      phoneNumber,
      count: 1,
      windowStart: Date.now(),
      ttl: Date.now() + RATE_LIMIT_PHONE_WINDOW_MS,
    } as RateLimitInfo);
    return true; // Allowed
  }

  const data = rateLimitDoc.data() as RateLimitInfo;
  const now = Date.now();

  // Check if window has expired
  if (now > data.ttl) {
    // Reset window
    await setDoc(rateLimitRef, {
      phoneNumber,
      count: 1,
      windowStart: now,
      ttl: now + RATE_LIMIT_PHONE_WINDOW_MS,
    } as RateLimitInfo);
    return true; // Allowed
  }

  // Check if limit exceeded
  if (data.count >= RATE_LIMIT_PHONE_MAX) {
    console.warn(`[Twilio] Rate limit exceeded for phone: ${phoneNumber}`);
    return false; // Rate limited
  }

  // Increment count
  await setDoc(
    rateLimitRef,
    {
      count: increment(1),
    },
    { merge: true }
  );

  return true; // Allowed
}

/**
 * Check rate limit for user ID
 */
async function checkUserRateLimit(userId: string): Promise<boolean> {
  const rateLimitRef = doc(db, "sms_rate_limits", `user_${userId}`);
  const rateLimitDoc = await getDoc(rateLimitRef);

  if (!rateLimitDoc.exists()) {
    // First SMS for this user - create rate limit doc
    await setDoc(rateLimitRef, {
      userId,
      count: 1,
      windowStart: Date.now(),
      ttl: Date.now() + RATE_LIMIT_USER_WINDOW_MS,
    } as RateLimitInfo);
    return true; // Allowed
  }

  const data = rateLimitDoc.data() as RateLimitInfo;
  const now = Date.now();

  // Check if window has expired
  if (now > data.ttl) {
    // Reset window
    await setDoc(rateLimitRef, {
      userId,
      count: 1,
      windowStart: now,
      ttl: now + RATE_LIMIT_USER_WINDOW_MS,
    } as RateLimitInfo);
    return true; // Allowed
  }

  // Check if limit exceeded
  if (data.count >= RATE_LIMIT_USER_MAX) {
    console.warn(`[Twilio] Rate limit exceeded for user: ${userId}`);
    return false; // Rate limited
  }

  // Increment count
  await setDoc(
    rateLimitRef,
    {
      count: increment(1),
    },
    { merge: true }
  );

  return true; // Allowed
}

/**
 * Combined rate limit check
 */
async function checkRateLimits(
  phoneNumber: string,
  userId?: string
): Promise<{ allowed: boolean; reason?: string }> {
  // Check phone rate limit
  const phoneAllowed = await checkPhoneRateLimit(phoneNumber);
  if (!phoneAllowed) {
    return {
      allowed: false,
      reason: `Too many SMS sent to this number. Please try again in 15 minutes.`,
    };
  }

  // Check user rate limit (if userId provided)
  if (userId) {
    const userAllowed = await checkUserRateLimit(userId);
    if (!userAllowed) {
      return {
        allowed: false,
        reason: `Too many SMS sent. Please try again in 1 hour.`,
      };
    }
  }

  return { allowed: true };
}

// ============================================================================
// Twilio API Integration
// ============================================================================

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Send SMS via Twilio API with exponential backoff retry
 */
async function twilioApiCall(
  config: TwilioConfig,
  to: string,
  body: string,
  retryCount = 0
): Promise<SendSMSResult> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;
  const auth = Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64");

  const formData = new URLSearchParams({
    To: to,
    From: config.phoneNumber,
    Body: body,
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${auth}`,
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      // Twilio API error
      console.error("[Twilio] API Error:", data);

      // Retry on server errors (5xx) or rate limits (429)
      if ((response.status >= 500 || response.status === 429) && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
        console.log(`[Twilio] Retrying after ${delay}ms (attempt ${retryCount + 1}/3)...`);
        await sleep(delay);
        return twilioApiCall(config, to, body, retryCount + 1);
      }

      return {
        success: false,
        error: data.message || `Twilio API error: ${response.status}`,
      };
    }

    // Success
    console.log(`[Twilio] SMS sent successfully to ${to}, SID: ${data.sid}`);
    return {
      success: true,
      messageSid: data.sid,
    };
  } catch (error) {
    console.error("[Twilio] Network Error:", error);

    // Retry on network errors
    if (retryCount < 3) {
      const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
      console.log(`[Twilio] Retrying after ${delay}ms (attempt ${retryCount + 1}/3)...`);
      await sleep(delay);
      return twilioApiCall(config, to, body, retryCount + 1);
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Send SMS message via Twilio
 *
 * @param options - SMS options (phone number, message, user ID)
 * @returns Promise<SendSMSResult>
 *
 * @example
 * const result = await sendSMS({
 *   phoneNumber: '+639171234567',
 *   message: 'Your OTP code is: 123456',
 *   userId: 'user123'
 * });
 */
export async function sendSMS(options: SendSMSOptions): Promise<SendSMSResult> {
  const { phoneNumber, message, userId } = options;

  // Check if Twilio is configured
  const config = getTwilioConfig();
  if (!config) {
    console.warn("[Twilio] SMS service not configured, skipping send");
    return {
      success: false,
      error: "SMS service not configured",
    };
  }

  // Check rate limits
  const rateLimitCheck = await checkRateLimits(phoneNumber, userId);
  if (!rateLimitCheck.allowed) {
    return {
      success: false,
      error: rateLimitCheck.reason,
      rateLimited: true,
    };
  }

  // Send SMS via Twilio API
  return twilioApiCall(config, phoneNumber, message);
}

/**
 * Send OTP code via SMS
 *
 * @param phoneNumber - Phone number in E.164 format (+63...)
 * @param code - 6-digit OTP code
 * @param userId - Optional user ID for rate limiting
 * @returns Promise<SendSMSResult>
 *
 * @example
 * const result = await sendOTP('+639171234567', '123456', 'user123');
 */
export async function sendOTP(
  phoneNumber: string,
  code: string,
  userId?: string
): Promise<SendSMSResult> {
  const message = `Your MASH verification code is: ${code}\n\nDo not share this code with anyone. It expires in 5 minutes.`;

  return sendSMS({
    phoneNumber,
    message,
    userId,
  });
}

/**
 * Log SMS count for billing monitoring
 * (Firestore function, can be called after successful sends)
 */
export async function logSMSSend(userId?: string): Promise<void> {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const logRef = doc(db, "sms_logs", today);

  await setDoc(
    logRef,
    {
      date: today,
      count: increment(1),
      lastUpdated: serverTimestamp(),
    },
    { merge: true }
  );

  console.log(`[Twilio] SMS count logged for ${today}`);
}
