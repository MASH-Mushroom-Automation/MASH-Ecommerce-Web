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
 * Sign in with Google using POPUP method (more reliable for development)
 */
export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  try {
    await setPersistence(auth, browserLocalPersistence);
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Firebase Auth Error:", error);
    throw error;
  }
}

/**
 * Get redirect result after Google sign-in
 */
export async function getGoogleRedirectResult() {
  console.log("🔵 [Firebase Auth] Checking for redirect result...");
  console.log("🔵 [Firebase Auth] Current URL:", window.location.href);
  console.log("🔵 [Firebase Auth] URL search params:", window.location.search);
  console.log("🔵 [Firebase Auth] URL hash:", window.location.hash);
  console.log(
    "🔵 [Firebase Auth] Current user before redirect check:",
    auth.currentUser
  );
  console.log(
    "🔵 [Firebase Auth] Auth domain:",
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  );

  // Check IndexedDB for pending operations
  console.log(
    "🔵 [Firebase Auth] Checking for pending auth operations in storage..."
  );

  try {
    const result = await getRedirectResult(auth);
    console.log("🔵 [Firebase Auth] getRedirectResult returned:", result);

    if (result) {
      console.log("🔵 [Firebase Auth] ✅ Redirect result received:", {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        providerData: result.user.providerData,
      });
    } else {
      console.log("🔵 [Firebase Auth] No redirect result (normal page load)");
      // Check if user is already signed in
      if (auth.currentUser) {
        console.log(
          "🔵 [Firebase Auth] But user is already signed in:",
          auth.currentUser.email
        );
      }
    }
    return result;
  } catch (error) {
    console.error("❌ [Firebase Auth] Error getting redirect result:", error);
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
