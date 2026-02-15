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
 * reCAPTCHA: Invisible reCAPTCHA runs automatically on all environments.
 *   Firebase requires reCAPTCHA to prevent abuse. The invisible widget
 *   auto-solves without user interaction.
 *
 * IMPORTANT: Do NOT set appVerificationDisabledForTesting = true.
 *   That flag causes Firebase to return 200/sessionInfo but SKIP sending
 *   the actual SMS. It's only for automated test suites, not development.
 *
 * Prerequisites:
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
 * signInWithPhoneNumber() will trigger its rendering internally.
 *
 * We call render() here to pre-initialize the widget. This ensures the
 * reCAPTCHA is ready when signInWithPhoneNumber() needs it, avoiding
 * race conditions that cause auth/internal-error.
 */
export async function getRecaptchaVerifier(): Promise<RecaptchaVerifier> {
  // Tear down any previous verifier to avoid stale-widget errors
  clearRecaptchaVerifier();

  // Ensure DOM container exists
  let container = document.getElementById("recaptcha-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "recaptcha-container";
    container.style.display = "none";
    document.body.appendChild(container);
  }

  recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
    size: "invisible",
    callback: () => {
      console.log("[PhoneAuth] reCAPTCHA solved");
    },
    "expired-callback": () => {
      console.log("[PhoneAuth] reCAPTCHA expired, will refresh on next send");
      clearRecaptchaVerifier();
    },
  });

  // Pre-render so the widget is ready before signInWithPhoneNumber
  await recaptchaVerifier.render();
  console.log("[PhoneAuth] reCAPTCHA widget rendered");

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
 * IMPORTANT: signInWithPhoneNumber() does NOT change auth state until
 * confirmResult.confirm() is called. We never call confirm() -- instead we
 * use PhoneAuthProvider.credential() + linkWithCredential() so the existing
 * user session (e.g. Google sign-in) is preserved.
 *
 * @param phoneNumber - Phone number (any PH format, auto-converted to E.164)
 * @returns The verification ID
 * @throws Error if Phone Auth is not enabled, quota exceeded, or reCAPTCHA fails
 */
export async function sendFirebasePhoneVerification(
  phoneNumber: string,
): Promise<string> {
  const e164Phone = ensureE164(phoneNumber);
  console.log("[PhoneAuth] Sending verification to:", e164Phone);

  const verifier = await getRecaptchaVerifier();

  const confirmResult: ConfirmationResult = await signInWithPhoneNumber(
    auth,
    e164Phone,
    verifier,
  );

  storedVerificationId = confirmResult.verificationId;
  console.log(
    "[PhoneAuth] SMS sent, verificationId:",
    storedVerificationId.slice(0, 10) + "...",
  );
  return storedVerificationId;
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

  console.log("[PhoneAuth] Verifying code...");
  const credential = PhoneAuthProvider.credential(storedVerificationId, code);

  const currentUser = auth.currentUser;

  if (currentUser) {
    // Signed-in user: link phone to their account or update existing phone.
    try {
      await linkWithCredential(currentUser, credential);
      console.log("[PhoneAuth] Phone linked to account");
    } catch (err: unknown) {
      const fbErr = err as { code?: string };
      if (fbErr.code === "auth/provider-already-linked") {
        // Phone provider already linked -- update the number instead
        try {
          await updatePhoneNumber(currentUser, credential);
          console.log("[PhoneAuth] Phone number updated");
        } catch (updateErr: unknown) {
          const uErr = updateErr as { code?: string };
          if (uErr.code === "auth/credential-already-in-use") {
            // Code verified but number belongs to another Firebase account.
            // Still counts as verification for profile purposes.
            console.warn(
              "[PhoneAuth] Phone verified but in use by another account",
            );
          } else {
            throw updateErr;
          }
        }
      } else if (fbErr.code === "auth/credential-already-in-use") {
        // Code was correct but phone belongs to another account
        console.warn(
          "[PhoneAuth] Phone verified but in use by another account",
        );
      } else {
        throw err;
      }
    }
  } else {
    // No signed-in user (e.g. 2FA login flow) -- sign in with phone credential
    await signInWithCredential(auth, credential);
    console.log("[PhoneAuth] Signed in with phone credential");
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
