/**
 * Firebase Authentication Service
 *
 * Provides Google Sign-In with redirect method.
 * Handles auth state changes and token management.
 */

import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  type User as FirebaseUser,
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

/**
 * Sign in with Google
 * - Uses POPUP in development (reliable, bypasses localhost persistence issues)
 * - Uses REDIRECT in production (secure, better UX, required by security policy)
 */
export async function signInWithGoogle(): Promise<FirebaseUser | void> {
  const isDevelopment = process.env.NODE_ENV === "development";

  try {
    if (isDevelopment) {
      // DEVELOPMENT: Use popup (works reliably on localhost)
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } else {
      // PRODUCTION: Use redirect (secure, better UX)
      await setPersistence(auth, browserLocalPersistence);

      // Wait for auth to be fully initialized
      await new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, () => {
          unsubscribe();
          resolve(true);
        });
      });

      // Mark redirect intent
      sessionStorage.setItem("google_auth_redirect", "true");
      localStorage.setItem("google_auth_redirect", "true");

      await new Promise((resolve) => setTimeout(resolve, 100));

      await signInWithRedirect(auth, googleProvider);
    }
  } catch (error) {
    console.error("Firebase Auth Error:", error);
    sessionStorage.removeItem("google_auth_redirect");
    localStorage.removeItem("google_auth_redirect");
    throw error;
  }
}

/**
 * Get redirect result after Google sign-in
 */
export async function getGoogleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    return result;
  } catch (error) {
    console.error("Firebase Auth redirect error:", error);
    throw error;
  }
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

export { auth, type FirebaseUser };
