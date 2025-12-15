/**
 * Firebase Module Exports
 *
 * Barrel export for Firebase utilities
 */

export { firebaseApp } from "./config";
export {
  auth,
  signInWithGoogle,
  getGoogleRedirectResult,
  signOutFirebase,
  getCurrentUser,
  getFirebaseIdToken,
  onFirebaseAuthStateChanged,
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
