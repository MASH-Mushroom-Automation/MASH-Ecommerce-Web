/**
 * Firebase Phone Authentication Service
 *
 * Uses Firebase's built-in Phone Auth to send SMS verification codes.
 * This replaces Twilio for OTP delivery -- Firebase handles SMS sending
 * through Google's infrastructure.
 *
 * Free tier (Spark plan): Up to 10 SMS verifications/day for testing.
 * Blaze plan: First 10K verifications/month free.
 *
 * When Firebase Phone Auth fails (quota exceeded, not enabled, etc.),
 * the system falls back to the existing API routes which show the OTP
 * code directly in the UI via dev mode.
 *
 * @module firebase/phone-auth
 */

import {
  RecaptchaVerifier,
  PhoneAuthProvider,
  signInWithPhoneNumber,
  linkWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import { auth } from "./auth";

// ============================================================================
// State
// ============================================================================

let recaptchaVerifier: RecaptchaVerifier | null = null;
let confirmationResult: ConfirmationResult | null = null;

// ============================================================================
// reCAPTCHA Management
// ============================================================================

/**
 * Initialize an invisible reCAPTCHA verifier.
 * Firebase Phone Auth requires reCAPTCHA to prevent SMS abuse.
 * The invisible variant shows no UI -- it auto-solves in the background.
 */
export function getRecaptchaVerifier(): RecaptchaVerifier {
  // Clear any existing verifier to avoid stale state
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch {
      // Ignore clear errors
    }
    recaptchaVerifier = null;
  }

  // Ensure the container element exists
  let container = document.getElementById("recaptcha-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "recaptcha-container";
    container.style.display = "none";
    document.body.appendChild(container);
  }

  recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
    size: "invisible",
  });

  return recaptchaVerifier;
}

/**
 * Clean up reCAPTCHA verifier (call on unmount or after use)
 */
export function clearRecaptchaVerifier(): void {
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch {
      // Ignore
    }
    recaptchaVerifier = null;
  }
}

// ============================================================================
// Phone Verification Flow
// ============================================================================

/**
 * Send a verification SMS to the given phone number using Firebase Phone Auth.
 *
 * @param phoneNumber - Phone number in E.164 format (+63XXXXXXXXXX)
 * @returns The ConfirmationResult to verify the code later
 * @throws Error if Firebase Phone Auth is not enabled or quota exceeded
 */
export async function sendFirebasePhoneVerification(
  phoneNumber: string,
): Promise<ConfirmationResult> {
  const verifier = getRecaptchaVerifier();

  // If user is signed in, try linking the phone to their account.
  // If not signed in (e.g. 2FA login), use signInWithPhoneNumber.
  const currentUser = auth.currentUser;

  if (currentUser) {
    confirmationResult = await linkWithPhoneNumber(
      currentUser,
      phoneNumber,
      verifier,
    );
  } else {
    confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      verifier,
    );
  }

  return confirmationResult;
}

/**
 * Verify the SMS code the user received.
 *
 * @param code - 6-digit verification code
 * @returns true if verification succeeded
 * @throws Error if code is invalid or expired
 */
export async function verifyFirebasePhoneCode(
  code: string,
): Promise<boolean> {
  if (!confirmationResult) {
    throw new Error("No verification in progress. Send a code first.");
  }

  const credential = PhoneAuthProvider.credential(
    confirmationResult.verificationId,
    code,
  );

  // Confirm the code -- this links the phone to the Firebase account
  // or signs in the user depending on the initial call
  await confirmationResult.confirm(code);

  // Reset state
  confirmationResult = null;
  clearRecaptchaVerifier();

  return true;
}

/**
 * Get the current confirmation result (for resend scenarios)
 */
export function getConfirmationResult(): ConfirmationResult | null {
  return confirmationResult;
}

/**
 * Check if Firebase Phone Auth is available.
 * Returns false if we're in a server environment or if auth is not initialized.
 */
export function isFirebasePhoneAuthAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !!auth;
  } catch {
    return false;
  }
}
