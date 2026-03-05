/**
 * Firebase Module Exports
 *
 * Barrel export for Firebase utilities
 */

export { firebaseApp } from "./config";
export {
  auth,
  // Google OAuth
  signInWithGoogle,
  // Email/Password
  createUserWithEmail,
  signInWithEmail,
  sendPasswordReset,
  resendEmailVerification,
  // Email Link (Passwordless)
  sendSignInLink,
  isEmailSignInLink,
  completeSignInWithEmailLink,
  getStoredEmailForSignIn,
  // Common
  signOutFirebase,
  getCurrentUser,
  getFirebaseIdToken,
  onFirebaseAuthStateChanged,
  updateUserProfile,
  type FirebaseUser,
} from "./auth";

// Cart Service
export { FirebaseCartService, type FirestoreCart } from "./cart";

// Orders Service
export {
  FirebaseOrdersService,
  type FirestoreOrder,
  type FirestoreOrderItem,
  type OrderStatus,
  type StatusHistoryEntry,
  type PickupLocation,
  type DeliveryAddress,
  type CreateOrderData,
} from "./orders";

// Address Service (Phase 10)
export {
  FirebaseAddressService,
  type FirestoreAddress,
  type AddressInput,
  type AddressCoordinates,
  type DeliveryAddressData,
} from "./addresses";

// User Profile Service (Phase 20)
export {
  FirebaseUserService,
  type FirestoreUserProfile,
  type UserProfileInput,
} from "./users";

// Review Service
export {
  FirebaseReviewService,
  calculateRatingStats,
  type FirebaseRatingStats,
} from "./reviews";

// OTP Service (Phone Verification & 2FA)
export { OTPService } from "./otp-service";
export type {
  OTPVerification,
  OTPPurpose,
  CreateOTPVerificationInput,
  OTPVerificationResult,
  OTPVerificationQuery,
} from "@/types/otp";

// Firebase Phone Auth (SMS verification via Firebase)
export {
  sendFirebasePhoneVerification,
  verifyFirebasePhoneCode,
  clearRecaptchaVerifier,
  isFirebasePhoneAuthAvailable,
  getRecaptchaVerifier,
} from "./phone-auth";

// Profile Picture Storage
export {
  uploadProfilePicture,
  deleteProfilePicture,
  validateProfileImage,
  MAX_FILE_SIZE,
  ACCEPTED_IMAGE_TYPES,
} from "./storage";
export type { UploadProgress, UploadResult } from "./storage";

// Security Events Service (Audit Trail)
export {
  logSecurityEvent,
  getSecurityEvents,
  getSecurityEventsByType,
} from "./security-events";
export type {
  SecurityEvent as FirestoreSecurityEvent,
  LogSecurityEventOptions,
} from "./security-events";
