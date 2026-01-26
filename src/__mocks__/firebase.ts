/**
 * Mock Firebase Services
 * Provides mock implementations for Firebase Auth and Firestore
 */

export const mockFirebaseAuth = {
  currentUser: null,
  signInWithPopup: jest.fn(() => Promise.resolve({
    user: {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: null,
      emailVerified: true,
    },
  })),
  signOut: jest.fn(() => Promise.resolve()),
  onAuthStateChanged: jest.fn((callback) => {
    callback(null);
    return jest.fn(); // Unsubscribe
  }),
};

export const mockFirestore = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({
        exists: () => true,
        data: () => ({}),
      })),
      set: jest.fn(() => Promise.resolve()),
      update: jest.fn(() => Promise.resolve()),
      delete: jest.fn(() => Promise.resolve()),
    })),
  })),
};

// Export mocked Firebase modules
export const getAuth = jest.fn(() => mockFirebaseAuth);
export const getFirestore = jest.fn(() => mockFirestore);
export const signInWithPopup = mockFirebaseAuth.signInWithPopup;
export const signOut = mockFirebaseAuth.signOut;
export const onAuthStateChanged = mockFirebaseAuth.onAuthStateChanged;
export const GoogleAuthProvider = jest.fn();
