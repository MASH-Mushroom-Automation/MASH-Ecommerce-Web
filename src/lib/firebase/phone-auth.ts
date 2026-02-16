/**
 * Firebase Phone Authentication Service
 *
 * Uses Firebase's built-in Phone Auth to send SMS verification codes.
 * This replaces Twilio for OTP delivery -- Firebase handles SMS sending
 * through Google's infrastructure.
 *
 * Approach:
 *   1. signInWithPhoneNumber() sends the SMS and returns a ConfirmationResult
 *   2. ConfirmationResult.verificationId + code => PhoneAuthCredential
 *   3. linkWithCredential() / updatePhoneNumber() verifies the code and
 *      links/updates the phone on the Firebase user (no auth state change)
 *
 * reCAPTCHA: Only enforced in production. In development mode,
 *   Firebase's appVerificationDisabledForTesting flag is set to true,
 *   which skips the reCAPTCHA challenge while still using the full
 *   Firebase Phone Auth flow (real signInWithPhoneNumber calls).
 *   Configure test phone numbers in Firebase Console to avoid SMS charges
 *   during development.
 *
 * Prerequisites (Production only):
 *   - Firebase Console > Authentication > Sign-in method > Phone > Enable
 *   - Firebase Console > Authentication > Settings > Authorized domains
 *     must include your domain (localhost is included by default)
 *   - Google Cloud Console > Identity Toolkit API must be enabled
 *   - Project must be on Blaze plan for SMS delivery
 *
 * @module firebase/phone-auth
 */

import {
  RecaptchaVerifier,
  PhoneAuthProvider,
  signInWithPhoneNumber,
  linkWithCredential,
  updatePhoneNumber,
  signInWithCredential,
  type ConfirmationResult,
} from "firebase/auth";
import { auth } from "./auth";

// ============================================================================
// Environment Detection
// ============================================================================

function isDevMode(): boolean {
  return process.env.NODE_ENV === "development";
}

// ============================================================================
// State
// ============================================================================

let recaptchaVerifier: RecaptchaVerifier | null = null;
let storedVerificationId: string | null = null;

// ============================================================================
// Phone Number Normalisation
// ============================================================================

/**
 * Ensure phone number is in E.164 format (+63XXXXXXXXXX).
 * Firebase requires E.164 for phone verification.
 */
function ensureE164(phone: string): string {
  let n = phone.replace(/[\s\-()]/g, "");
  if (n.startsWith("0")) {
    n = "+63" + n.slice(1);
  } else if (n.startsWith("63") && !n.startsWith("+63")) {
    n = "+" + n;
  } else if (!n.startsWith("+")) {
    n = "+63" + n;
  }
  return n;
}

// ============================================================================
// reCAPTCHA Management
// ============================================================================

/**
 * Create a fresh invisible reCAPTCHA verifier.
 *
 * The invisible reCAPTCHA auto-solves without user interaction.
 * signInWithPhoneNumber() triggers rendering internally -- we do NOT
 * call render() ourselves because pre-rendering can cause stale-widget
 * errors on retries.
 */
export function getRecaptchaVerifier(): RecaptchaVerifier {
  // Tear down any previous verifier AND DOM element to avoid
  // "reCAPTCHA has already been rendered in this element" errors.
  clearRecaptchaVerifier();

  // Always create a FRESH container -- Google's reCAPTCHA API tags DOM
  // elements as "rendered" and refuses to re-use them even after clear().
  const container = document.createElement("div");
  container.id = "recaptcha-container-" + Date.now();
  document.body.appendChild(container);

  recaptchaVerifier = new RecaptchaVerifier(auth, container, {
    size: "invisible",
    callback: () => {
      // reCAPTCHA solved
    },
    "expired-callback": () => {
      clearRecaptchaVerifier();
    },
  });

  return recaptchaVerifier;
}

/**
 * Clean up reCAPTCHA verifier.
 * Does NOT reset storedVerificationId (needed for code verification).
 */
export function clearRecaptchaVerifier(): void {
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch {
      // Ignore -- already cleared or DOM was detached
    }
    recaptchaVerifier = null;
  }
  // Remove ALL reCAPTCHA container elements from the DOM.
  // Google's API tags elements as "rendered" permanently, so we must
  // destroy the DOM node to allow a fresh reCAPTCHA on retry.
  document
    .querySelectorAll('[id^="recaptcha-container"]')
    .forEach((el) => el.remove());
}

// ============================================================================
// Phone Verification Flow
// ============================================================================

/**
 * Send a verification SMS to the given phone number using Firebase Phone Auth.
 *
 * Uses signInWithPhoneNumber() which is the standard, best-supported Firebase
 * API for phone verification. The returned ConfirmationResult's verificationId
 * is stored for the subsequent verify step.
 *
 * Works on both localhost and production. Firebase includes localhost in
 * authorized domains by default. The invisible reCAPTCHA handles bot
 * detection automatically.
 *
 * @param phoneNumber - Phone number (any PH format, auto-converted to E.164)
 * @returns The verification ID
 * @throws Error if Phone Auth is not enabled, quota exceeded, or reCAPTCHA fails
 */
export async function sendFirebasePhoneVerification(
  phoneNumber: string,
): Promise<string> {
  const e164Phone = ensureE164(phoneNumber);

  // NOTE: Do NOT call initializeRecaptchaConfig(auth) here.
  // That function enables reCAPTCHA Enterprise mode which requires separate
  // Google Cloud Console setup. Without it, calling initializeRecaptchaConfig
  // corrupts the auth instance's internal state, causing signInWithPhoneNumber
  // to fail with auth/internal-error. Standard reCAPTCHA v2 works without it.

  // In development mode, disable app verification (reCAPTCHA) so the
  // phone auth flow works without reCAPTCHA challenges. Firebase will
  // still process signInWithPhoneNumber normally -- it just skips the
  // reCAPTCHA check. For test phone numbers configured in Firebase
  // Console > Authentication > Phone > Phone numbers for testing,
  // a preset verification code is returned without sending a real SMS.
  if (isDevMode()) {
    auth.settings.appVerificationDisabledForTesting = true;
  }

  const verifier = getRecaptchaVerifier();

  try {
    const confirmResult: ConfirmationResult = await signInWithPhoneNumber(
      auth,
      e164Phone,
      verifier,
    );

    storedVerificationId = confirmResult.verificationId;
    return storedVerificationId;
  } catch (sendErr: unknown) {
    // Clean up reCAPTCHA on failure so a fresh one is created on retry
    clearRecaptchaVerifier();
    const fbErr = sendErr as { code?: string; message?: string; customData?: unknown };
    console.error(
      "[PhoneAuth] signInWithPhoneNumber FAILED",
      "\n  code:", fbErr.code,
      "\n  message:", fbErr.message,
      "\n  customData:", fbErr.customData,
    );
    throw sendErr;
  }
}

/**
 * Verify the SMS code the user received.
 *
 * Creates a PhoneAuthCredential from the stored verificationId + user code,
 * then links or updates the phone on the current Firebase user. This validates
 * the code server-side WITHOUT calling confirmResult.confirm(), so the
 * existing auth session is preserved.
 *
 * @param code - 6-digit verification code from SMS
 * @returns true if verification succeeded
 * @throws Error if code is invalid or expired
 */
export async function verifyFirebasePhoneCode(
  code: string,
): Promise<boolean> {
  if (!storedVerificationId) {
    throw new Error("No verification in progress. Send a code first.");
  }

  const credential = PhoneAuthProvider.credential(storedVerificationId, code);

  const currentUser = auth.currentUser;

  if (currentUser) {
    // Signed-in user: link phone to their account or update existing phone.
    try {
      await linkWithCredential(currentUser, credential);
    } catch (err: unknown) {
      const fbErr = err as { code?: string };
      if (fbErr.code === "auth/provider-already-linked") {
        // Phone provider already linked -- update the number instead
        try {
          await updatePhoneNumber(currentUser, credential);
        } catch (updateErr: unknown) {
          const uErr = updateErr as { code?: string };
          if (uErr.code === "auth/credential-already-in-use") {
            // Code verified but number belongs to another Firebase account.
            // Still counts as verification for profile purposes.

          } else {
            throw updateErr;
          }
        }
      } else if (fbErr.code === "auth/credential-already-in-use") {
        // Code was correct but phone belongs to another account

      } else {
        throw err;
      }
    }
  } else {
    // No signed-in user (e.g. 2FA login flow) -- sign in with phone credential
    await signInWithCredential(auth, credential);
  }

  storedVerificationId = null;
  clearRecaptchaVerifier();
  return true;
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
