/**
 * Tests for Firebase Authentication Service
 * COVERAGE-007: Firebase Services - auth.ts
 */

jest.unmock("@/lib/firebase/auth");

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithPopup,
  setPersistence,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { signOut as firebaseSignOut } from "firebase/auth";
import {
  createUserWithEmail,
  signInWithEmail,
  sendPasswordReset,
  resendEmailVerification,
  sendSignInLink,
  isEmailSignInLink,
  completeSignInWithEmailLink,
  getStoredEmailForSignIn,
  signInWithGoogle,
  signOutFirebase,
  getCurrentUser,
  getFirebaseIdToken,
  onFirebaseAuthStateChanged,
  updateUserProfile,
  auth,
} from "@/lib/firebase/auth";

// ---------------------------------------------------------------------------
// Mock user helper
// ---------------------------------------------------------------------------
function makeMockUser(overrides: Record<string, unknown> = {}) {
  return {
    uid: "uid-123",
    email: "test@example.com",
    displayName: "Test User",
    emailVerified: false,
    getIdToken: jest.fn().mockResolvedValue("mock-token-abc"),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------
describe("Firebase Auth Service", () => {
  let cookieValue: string;
  const originalCookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, "cookie") ||
    Object.getOwnPropertyDescriptor(document, "cookie");

  beforeEach(() => {
    jest.clearAllMocks();
    cookieValue = "";
    // Mock document.cookie for cookie-based tests
    Object.defineProperty(document, "cookie", {
      get: () => cookieValue,
      set: (v: string) => { cookieValue = v; },
      configurable: true,
    });
  });

  afterEach(() => {
    // Restore original document.cookie
    if (originalCookieDescriptor) {
      Object.defineProperty(document, "cookie", originalCookieDescriptor);
    }
  });

  // ========================================================================
  // createUserWithEmail
  // ========================================================================
  describe("createUserWithEmail", () => {
    it("creates user and sends verification email", async () => {
      const mockUser = makeMockUser();
      jest.mocked(createUserWithEmailAndPassword).mockResolvedValueOnce({
        user: mockUser,
      } as any);
      jest.mocked(sendEmailVerification).mockResolvedValueOnce(undefined);

      const result = await createUserWithEmail("a@b.com", "pass123");

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        "a@b.com",
        "pass123"
      );
      expect(sendEmailVerification).toHaveBeenCalledWith(mockUser, expect.objectContaining({
        handleCodeInApp: false,
      }));
      expect(result).toBe(mockUser);
    });

    it("updates profile when displayName is provided", async () => {
      const mockUser = makeMockUser();
      jest.mocked(createUserWithEmailAndPassword).mockResolvedValueOnce({
        user: mockUser,
      } as any);
      jest.mocked(updateProfile).mockResolvedValueOnce(undefined);
      jest.mocked(sendEmailVerification).mockResolvedValueOnce(undefined);

      await createUserWithEmail("a@b.com", "pass123", "John");

      expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName: "John" });
    });

    it("skips updateProfile when no displayName", async () => {
      const mockUser = makeMockUser();
      jest.mocked(createUserWithEmailAndPassword).mockResolvedValueOnce({
        user: mockUser,
      } as any);
      jest.mocked(sendEmailVerification).mockResolvedValueOnce(undefined);

      await createUserWithEmail("a@b.com", "pass123");

      expect(updateProfile).not.toHaveBeenCalled();
    });

    it("throws on Firebase error", async () => {
      jest.mocked(createUserWithEmailAndPassword).mockRejectedValueOnce(
        new Error("email-already-in-use")
      );

      await expect(createUserWithEmail("a@b.com", "p")).rejects.toThrow("email-already-in-use");
    });
  });

  // ========================================================================
  // signInWithEmail
  // ========================================================================
  describe("signInWithEmail", () => {
    it("signs in and returns user", async () => {
      const mockUser = makeMockUser();
      jest.mocked(signInWithEmailAndPassword).mockResolvedValueOnce({
        user: mockUser,
      } as any);

      const result = await signInWithEmail("a@b.com", "pass");
      expect(result).toBe(mockUser);
    });

    it("throws on invalid credentials", async () => {
      jest.mocked(signInWithEmailAndPassword).mockRejectedValueOnce(
        new Error("wrong-password")
      );

      await expect(signInWithEmail("a@b.com", "bad")).rejects.toThrow("wrong-password");
    });
  });

  // ========================================================================
  // sendPasswordReset
  // ========================================================================
  describe("sendPasswordReset", () => {
    it("sends password reset email", async () => {
      jest.mocked(sendPasswordResetEmail).mockResolvedValueOnce(undefined);

      await sendPasswordReset("a@b.com");

      expect(sendPasswordResetEmail).toHaveBeenCalledWith(
        expect.anything(),
        "a@b.com",
        expect.objectContaining({ handleCodeInApp: false })
      );
    });

    it("throws on error", async () => {
      jest.mocked(sendPasswordResetEmail).mockRejectedValueOnce(new Error("user-not-found"));

      await expect(sendPasswordReset("no@user.com")).rejects.toThrow("user-not-found");
    });
  });

  // ========================================================================
  // resendEmailVerification
  // ========================================================================
  describe("resendEmailVerification", () => {
    it("throws when no current user", async () => {
      // auth.currentUser is null by default from mock
      await expect(resendEmailVerification()).rejects.toThrow("No user signed in");
    });

    it("sends verification when user is signed in", async () => {
      const mockUser = makeMockUser();
      (auth as any).currentUser = mockUser;
      jest.mocked(sendEmailVerification).mockResolvedValueOnce(undefined);

      await resendEmailVerification();

      expect(sendEmailVerification).toHaveBeenCalledWith(
        mockUser,
        expect.objectContaining({ handleCodeInApp: false })
      );

      // Restore
      (auth as any).currentUser = null;
    });
  });

  // ========================================================================
  // Email Link (passwordless) auth
  // ========================================================================
  describe("sendSignInLink", () => {
    it("sends link and stores email in cookie", async () => {
      jest.mocked(sendSignInLinkToEmail).mockResolvedValueOnce(undefined);

      await sendSignInLink("test@test.com");

      expect(sendSignInLinkToEmail).toHaveBeenCalledWith(
        expect.anything(),
        "test@test.com",
        expect.objectContaining({ handleCodeInApp: true })
      );
      expect(cookieValue).toContain("emailForSignIn=");
    });
  });

  describe("isEmailSignInLink", () => {
    it("delegates to Firebase isSignInWithEmailLink", () => {
      jest.mocked(isSignInWithEmailLink).mockReturnValueOnce(true);

      const result = isEmailSignInLink("https://example.com?mode=signIn");
      expect(result).toBe(true);
      expect(isSignInWithEmailLink).toHaveBeenCalledWith(expect.anything(), "https://example.com?mode=signIn");
    });
  });

  describe("completeSignInWithEmailLink", () => {
    it("completes sign-in and clears cookie", async () => {
      const mockUser = makeMockUser();
      jest.mocked(signInWithEmailLink).mockResolvedValueOnce({
        user: mockUser,
      } as any);

      const result = await completeSignInWithEmailLink("a@b.com", "https://link");

      expect(result).toBe(mockUser);
      expect(signInWithEmailLink).toHaveBeenCalledWith(expect.anything(), "a@b.com", "https://link");
      // Cookie should be cleared (max-age=0)
      expect(cookieValue).toContain("Max-Age=0");
    });
  });

  describe("getStoredEmailForSignIn", () => {
    it("returns email from cookie", () => {
      cookieValue = "other=val; emailForSignIn=test%40test.com; another=x";
      const result = getStoredEmailForSignIn();
      expect(result).toBe("test@test.com");
    });

    it("returns null when cookie is absent", () => {
      cookieValue = "other=val";
      const result = getStoredEmailForSignIn();
      expect(result).toBeNull();
    });
  });

  // ========================================================================
  // signInWithGoogle
  // ========================================================================
  describe("signInWithGoogle", () => {
    it("sets persistence and signs in with popup", async () => {
      const mockUser = makeMockUser();
      jest.mocked(setPersistence).mockResolvedValueOnce(undefined);
      jest.mocked(signInWithPopup).mockResolvedValueOnce({
        user: mockUser,
      } as any);

      const result = await signInWithGoogle();

      expect(setPersistence).toHaveBeenCalled();
      expect(signInWithPopup).toHaveBeenCalled();
      expect(result).toBe(mockUser);
    });

    it("throws on popup error", async () => {
      jest.mocked(setPersistence).mockResolvedValueOnce(undefined);
      jest.mocked(signInWithPopup).mockRejectedValueOnce(new Error("popup-closed"));

      await expect(signInWithGoogle()).rejects.toThrow("popup-closed");
    });
  });

  // ========================================================================
  // Utilities
  // ========================================================================
  describe("signOutFirebase", () => {
    it("calls firebaseSignOut", async () => {
      jest.mocked(firebaseSignOut).mockResolvedValueOnce(undefined);

      await signOutFirebase();

      expect(firebaseSignOut).toHaveBeenCalledWith(expect.anything());
    });
  });

  describe("getCurrentUser", () => {
    it("returns null when no user", () => {
      (auth as any).currentUser = null;
      expect(getCurrentUser()).toBeNull();
    });

    it("returns current user when signed in", () => {
      const mockUser = makeMockUser();
      (auth as any).currentUser = mockUser;

      expect(getCurrentUser()).toBe(mockUser);

      (auth as any).currentUser = null;
    });
  });

  describe("getFirebaseIdToken", () => {
    it("returns null when no user", async () => {
      (auth as any).currentUser = null;
      const result = await getFirebaseIdToken();
      expect(result).toBeNull();
    });

    it("returns token when user is signed in", async () => {
      const mockUser = makeMockUser();
      (auth as any).currentUser = mockUser;

      const result = await getFirebaseIdToken();
      expect(result).toBe("mock-token-abc");
      expect(mockUser.getIdToken).toHaveBeenCalled();

      (auth as any).currentUser = null;
    });
  });

  describe("onFirebaseAuthStateChanged", () => {
    it("subscribes to auth state changes", () => {
      const callback = jest.fn();
      const mockUnsub = jest.fn();
      jest.mocked(onAuthStateChanged).mockReturnValueOnce(mockUnsub);

      const unsub = onFirebaseAuthStateChanged(callback);

      expect(onAuthStateChanged).toHaveBeenCalledWith(expect.anything(), callback);
      expect(unsub).toBe(mockUnsub);
    });
  });

  describe("updateUserProfile", () => {
    it("throws when no current user", async () => {
      (auth as any).currentUser = null;
      await expect(updateUserProfile("New Name")).rejects.toThrow("No user signed in");
    });

    it("updates displayName only", async () => {
      const mockUser = makeMockUser();
      (auth as any).currentUser = mockUser;
      jest.mocked(updateProfile).mockResolvedValueOnce(undefined);

      await updateUserProfile("New Name");

      expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName: "New Name" });
      (auth as any).currentUser = null;
    });

    it("updates photoURL only", async () => {
      const mockUser = makeMockUser();
      (auth as any).currentUser = mockUser;
      jest.mocked(updateProfile).mockResolvedValueOnce(undefined);

      await updateUserProfile(undefined, "https://photo.jpg");

      expect(updateProfile).toHaveBeenCalledWith(mockUser, { photoURL: "https://photo.jpg" });
      (auth as any).currentUser = null;
    });
  });
});
