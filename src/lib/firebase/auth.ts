/**
 * Firebase Authentication Service
 *
 * Provides multiple authentication methods:
 * - Google Sign-In (OAuth)
 * - Email/Password (Traditional)
 * - Email Link (Passwordless)
 *
 * For buyers/users only - Firebase Auth handles all user authentication.
 */

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  sendPasswordResetEmail,
  updateProfile,
  type User as FirebaseUser,
  type ActionCodeSettings,
} from "firebase/auth";
import { firebaseApp } from "./config";

// Initialize Firebase Auth
const auth = getAuth(firebaseApp);

// Configure Google Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("email");
googleProvider.addScope("profile");

// Set custom parameters for better UX
googleProvider.setCustomParameters({
  prompt: "select_account", // Always show account selector
});

// ============================================================================
// EMAIL/PASSWORD AUTHENTICATION
// ============================================================================

/**
 * Create a new user with email and password
 * @param email - User's email address
 * @param password - User's password (min 6 characters for Firebase)
 * @param displayName - Optional display name
 * @returns Firebase user object
 */
export async function createUserWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<FirebaseUser> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name if provided
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    // Send email verification
    await sendEmailVerification(user, {
      url: `${getBaseUrl()}/login?verified=true`,
      handleCodeInApp: false,
    });

    return user;
  } catch (error) {
    console.error("Firebase create user error:", error);
    throw error;
  }
}

/**
 * Sign in with email and password
 * @param email - User's email address
 * @param password - User's password
 * @returns Firebase user object
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<FirebaseUser> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Firebase sign-in error:", error);
    throw error;
  }
}

/**
 * Send password reset email
 * @param email - User's email address
 */
export async function sendPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email, {
      url: `${getBaseUrl()}/login`,
      handleCodeInApp: false,
    });
  } catch (error) {
    console.error("Firebase password reset error:", error);
    throw error;
  }
}

/**
 * Resend email verification to current user
 */
export async function resendEmailVerification(): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user signed in");
  }

  try {
    await sendEmailVerification(user, {
      url: `${getBaseUrl()}/login?verified=true`,
      handleCodeInApp: false,
    });
  } catch (error) {
    console.error("Firebase resend verification error:", error);
    throw error;
  }
}

// ============================================================================
// EMAIL LINK (PASSWORDLESS) AUTHENTICATION
// ============================================================================

/**
 * Action code settings for email link authentication
 */
function getEmailLinkSettings(): ActionCodeSettings {
  return {
    url: `${getBaseUrl()}/login/email-link`, // Redirect URL after clicking link
    handleCodeInApp: true, // Must be true for email link sign-in
    // iOS and Android settings (optional, for mobile deep linking)
    // iOS: { bundleId: 'com.mash.app' },
    // android: { packageName: 'com.mash.app', installApp: true, minimumVersion: '12' },
    dynamicLinkDomain: undefined, // Use Firebase default
  };
}

/**
 * Send sign-in link to email (passwordless authentication)
 * @param email - User's email address
 */
export async function sendSignInLink(email: string): Promise<void> {
  try {
    const actionCodeSettings = getEmailLinkSettings();
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    
    // Store email locally to complete sign-in after user clicks link
    if (typeof window !== "undefined") {
      window.localStorage.setItem("emailForSignIn", email);
    }
  } catch (error) {
    console.error("Firebase send sign-in link error:", error);
    throw error;
  }
}

/**
 * Check if the current URL is a sign-in link
 * @param url - Current URL (window.location.href)
 * @returns boolean
 */
export function isEmailSignInLink(url: string): boolean {
  return isSignInWithEmailLink(auth, url);
}

/**
 * Complete sign-in with email link
 * @param email - User's email address
 * @param url - The full URL from the email link
 * @returns Firebase user object
 */
export async function completeSignInWithEmailLink(
  email: string,
  url: string
): Promise<FirebaseUser> {
  try {
    const result = await signInWithEmailLink(auth, email, url);
    
    // Clear the email from storage
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("emailForSignIn");
    }
    
    return result.user;
  } catch (error) {
    console.error("Firebase email link sign-in error:", error);
    throw error;
  }
}

/**
 * Get stored email for sign-in link completion
 */
export function getStoredEmailForSignIn(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("emailForSignIn");
}

// ============================================================================
// GOOGLE OAUTH AUTHENTICATION (Firebase Only - No Backend Sync)
// ============================================================================

/**
 * Sign in with Google using Firebase Authentication
 * - Uses POPUP for both development and production (reliable, no sessionStorage issues)
 * - Popup is more reliable than redirect and avoids "missing initial state" errors
 * - Authentication is handled 100% by Firebase - no backend synchronization
 * - User profile is stored in Firestore for maximum reliability
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  try {
    console.log("🔵 [Firebase Auth] Starting Google sign-in with popup...");
    
    // Set persistence to local (survives browser restart)
    await setPersistence(auth, browserLocalPersistence);

    // Use popup for all environments (more reliable than redirect)
    const result = await signInWithPopup(auth, googleProvider);
    
    console.log("🟢 [Firebase Auth] Google sign-in successful:", {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
    });
    
    return result.user;
  } catch (error) {
    console.error("❌ [Firebase Auth] Google sign-in error:", error);
    throw error;
  }
}

// ============================================================================
// COMMON UTILITIES
// ============================================================================

/**
 * Get base URL for action code settings
 */
function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  // Fallback for server-side
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

/**
 * Sign out from Firebase
 */
export async function signOutFirebase(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Get current Firebase user
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

/**
 * Get Firebase ID token for backend verification
 */
export async function getFirebaseIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

/**
 * Subscribe to auth state changes
 */
export function onFirebaseAuthStateChanged(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  displayName?: string,
  photoURL?: string
): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user signed in");
  }

  const updates: { displayName?: string; photoURL?: string } = {};
  if (displayName !== undefined) updates.displayName = displayName;
  if (photoURL !== undefined) updates.photoURL = photoURL;

  await updateProfile(user, updates);
}

export { auth, type FirebaseUser };
