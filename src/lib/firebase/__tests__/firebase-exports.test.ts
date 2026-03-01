import * as exports from '../index';

jest.mock('firebase/app', () => ({ initializeApp: jest.fn() }));
jest.mock('firebase/auth', () => ({ getAuth: jest.fn() }));
jest.mock('firebase/firestore', () => ({ getFirestore: jest.fn() }));

describe('Firebase Exports', () => {
  it('should export firebaseApp', () => {
    expect(exports.firebaseApp).toBeDefined();
  });
  it('should export auth functions', () => {
    expect(exports.auth).toBeDefined();
    expect(exports.signInWithGoogle).toBeDefined();
    expect(exports.createUserWithEmail).toBeDefined();
    expect(exports.signInWithEmail).toBeDefined();
    expect(exports.sendPasswordReset).toBeDefined();
    expect(exports.resendEmailVerification).toBeDefined();
    expect(exports.sendSignInLink).toBeDefined();
    expect(exports.isEmailSignInLink).toBeDefined();
    expect(exports.completeSignInWithEmailLink).toBeDefined();
    expect(exports.getStoredEmailForSignIn).toBeDefined();
    expect(exports.signOutFirebase).toBeDefined();
    expect(exports.getCurrentUser).toBeDefined();
    expect(exports.getFirebaseIdToken).toBeDefined();
    expect(exports.onFirebaseAuthStateChanged).toBeDefined();
    expect(exports.updateUserProfile).toBeDefined();
  });
  it('should export cart, orders, address, user services', () => {
    expect(exports.FirebaseCartService).toBeDefined();
    expect(exports.FirebaseOrdersService).toBeDefined();
    expect(exports.FirebaseAddressService).toBeDefined();
    expect(exports.FirebaseUserService).toBeDefined();
  });
});
