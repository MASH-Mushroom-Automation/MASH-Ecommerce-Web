/**
 * Firebase Module Exports
 * 
 * Barrel export for Firebase utilities
 */

export { firebaseApp } from './config';
export {
  auth,
  signInWithGoogle,
  getGoogleRedirectResult,
  signOutFirebase,
  getCurrentUser,
  getFirebaseIdToken,
  onFirebaseAuthStateChanged,
  type FirebaseUser,
} from './auth';
