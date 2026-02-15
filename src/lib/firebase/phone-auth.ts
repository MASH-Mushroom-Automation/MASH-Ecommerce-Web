/**
 * Firebase Phone Authentication Service
 *
 * Uses Firebase's built-in Phone Auth to send SMS verification codes.
 * This replaces Twilio for OTP delivery -- Firebase handles SMS sending
 * through Google's infrastructure.
 *
 * Approach:
 *   1. RecaptchaVerifier renders an invisible reCAPTCHA widget
 *   2. PhoneAuthProvider.verifyPhoneNumber() sends the SMS
 *   3. PhoneAuthProvider.credential() creates a credential from the code
 *   4. linkWithCredential() / updatePhoneNumber() verifies the code
 *      server-side and links/updates the phone on the Firebase user
 *
 * Free tier: 10 SMS verifications/day (Spark plan, no billing required).
 * Blaze plan: 1,000 SMS/day default quota (configurable).
 *
 * Prerequisites:
 *   - Firebase Console > Authentication > Sign-in method > Phone > Enable
 *   - CSP must allow https://www.google.com in script-src (for reCAPTCHA)
 *
 * @module firebase/phone-auth
 */

import {
  RecaptchaVerifier,
  PhoneAuthProvider,
  linkWithCredential,
  updatePhoneNumber,
  signInWithCredential,
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
 * Ensure a hidden DOM container exists for the invisible reCAPTCHA widget.
 */
function ensureRecaptchaContainer(): HTMLElement {
  let container = document.getElementById("recaptcha-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "recaptcha-container";
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Initialize an invisible reCAPTCHA verifier and pre-render it.
 * Firebase Phone Auth requires reCAPTCHA to prevent SMS abuse.
 * The invisible variant shows no UI -- it auto-solves in the background.
 *
 * Pre-rendering avoids timing issues where verifyPhoneNumber() calls
 * the verifier before it's ready.
 */
export async function getRecaptchaVerifier(): Promise<RecaptchaVerifier> {
  // Clear any existing verifier to avoid stale state
  clearRecaptchaVerifier();

  ensureRecaptchaContainer();

  recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
    size: "invisible",
    callback: () => {
      console.log("[PhoneAuth] reCAPTCHA solved automatically");
    },
    "expired-callback": () => {
      console.warn("[PhoneAuth] reCAPTCHA expired, will re-initialise on next send");
      clearRecaptchaVerifier();
    },
  });

  // Pre-render so the widget is ready before verifyPhoneNumber() needs it
  await recaptchaVerifier.render();
  console.log("[PhoneAuth] reCAPTCHA verifier rendered");

  return recaptchaVerifier;
}

/**
 * Clean up reCAPTCHA verifier and stored verification state.
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
  // Do NOT clear storedVerificationId here -- it's needed for code verification.
  // Only clearRecaptchaVerifier's own state.
}

// ============================================================================
// Phone Verification Flow
// ============================================================================

/**
 * Send a verification SMS to the given phone number using Firebase Phone Auth.
 *
 * Uses PhoneAuthProvider.verifyPhoneNumber() which sends the SMS without
 * signing in or linking -- the verification step is handled separately.
 *
 * @param phoneNumber - Phone number (any Philippine format, auto-converted to E.164)
 * @returns The verification ID needed to verify the code later
 * @throws Error if Firebase Phone Auth is not enabled or quota exceeded
 */
export async function sendFirebasePhoneVerification(
  phoneNumber: string,
): Promise<string> {
  const e164Phone = ensureE164(phoneNumber);
  console.log("[PhoneAuth] Sending verification to:", e164Phone);

  const verifier = await getRecaptchaVerifier();

  const provider = new PhoneAuthProvider(auth);
  storedVerificationId = await provider.verifyPhoneNumber(e164Phone, verifier);

  console.log(
    "[PhoneAuth] SMS sent, verificationId:",
    storedVerificationId.slice(0, 10) + "...",
  );
  return storedVerificationId;
}

/**
 * Verify the SMS code the user received.
 *
 * Creates a PhoneAuthCredential and attempts to link/update the phone number
 * on the Firebase user account. This validates the code server-side.
 *
 * @param code - 6-digit verification code
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
    // No signed-in user (e.g. 2FA login flow) -- sign in with phone
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
