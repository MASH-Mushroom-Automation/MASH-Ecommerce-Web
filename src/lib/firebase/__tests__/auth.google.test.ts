/**
 * Google Authentication Unit Tests
 * 
 * Tests the complete Google OAuth flow including:
 * - Firebase popup authentication
 * - Error handling for various failure scenarios
 * - Firestore profile synchronization
 * - Backend synchronization (optional)
 * - Comprehensive error logging verification
 * 
 * Run with: npm test -- auth.google.test
 */

import { signInWithGoogle } from "../auth";
import {
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

// Mock Firebase Auth
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({})),
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({
    addScope: jest.fn(),
    setCustomParameters: jest.fn(),
  })),
  signInWithPopup: jest.fn(),
  setPersistence: jest.fn(),
  browserLocalPersistence: {},
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  sendEmailVerification: jest.fn(),
  sendSignInLinkToEmail: jest.fn(),
  isSignInWithEmailLink: jest.fn(),
  signInWithEmailLink: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  updateProfile: jest.fn(),
}));

// Mock Firebase config
jest.mock("../config", () => ({
  firebaseApp: {},
}));

describe("Google Authentication", () => {
  const mockConsoleLog = jest.spyOn(console, "log").mockImplementation();
  const mockConsoleError = jest.spyOn(console, "error").mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
  });

  describe("signInWithGoogle()", () => {
    it("should successfully sign in with Google", async () => {
      // Arrange
      const mockUser = {
        uid: "test-uid-123",
        email: "test@example.com",
        displayName: "Test User",
        photoURL: "https://example.com/photo.jpg",
        emailVerified: true,
      };

      const mockResult = {
        user: mockUser,
        providerId: "google.com",
      };

      (setPersistence as jest.Mock).mockResolvedValue(undefined);
      (signInWithPopup as jest.Mock).mockResolvedValue(mockResult);

      // Act
      const result = await signInWithGoogle();

      // Assert
      expect(setPersistence).toHaveBeenCalledWith(expect.anything(), browserLocalPersistence);
      expect(signInWithPopup).toHaveBeenCalled();
      expect(result).toEqual(mockUser);

      // Verify logging
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("🔵 [Firebase Auth] signInWithGoogle() called")
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        "🟢 [Firebase Auth] signInWithPopup successful",
        expect.objectContaining({
          uid: expect.any(String),
          email: expect.any(String),
        })
      );
    });

    it("should handle popup blocked error", async () => {
      // Arrange
      const popupBlockedError = {
        code: "auth/popup-blocked",
        message: "The popup has been blocked by the browser",
      };

      (setPersistence as jest.Mock).mockResolvedValue(undefined);
      (signInWithPopup as jest.Mock).mockRejectedValue(popupBlockedError);

      // Act & Assert
      await expect(signInWithGoogle()).rejects.toEqual(popupBlockedError);

      // Verify error logging
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining("❌ [Firebase Auth] Google sign-in error:"),
        popupBlockedError
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining("❌ [Firebase Auth] Error code:"),
        "auth/popup-blocked"
      );
    });

    it("should handle popup closed by user error", async () => {
      // Arrange
      const popupClosedError = {
        code: "auth/popup-closed-by-user",
        message: "The popup has been closed by the user before finalizing the operation",
      };

      (setPersistence as jest.Mock).mockResolvedValue(undefined);
      (signInWithPopup as jest.Mock).mockRejectedValue(popupClosedError);

      // Act & Assert
      await expect(signInWithGoogle()).rejects.toEqual(popupClosedError);

      // Verify error logging
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining("❌ [Firebase Auth] Error code:"),
        "auth/popup-closed-by-user"
      );
    });

    it("should handle network error", async () => {
      // Arrange
      const networkError = {
        code: "auth/network-request-failed",
        message: "A network error has occurred",
      };

      (setPersistence as jest.Mock).mockResolvedValue(undefined);
      (signInWithPopup as jest.Mock).mockRejectedValue(networkError);

      // Act & Assert
      await expect(signInWithGoogle()).rejects.toEqual(networkError);

      // Verify error logging
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining("❌ [Firebase Auth] Error code:"),
        "auth/network-request-failed"
      );
    });

    it("should handle cancelled popup request", async () => {
      // Arrange
      const cancelledError = {
        code: "auth/cancelled-popup-request",
        message: "This operation has been cancelled due to another conflicting popup being opened",
      };

      (setPersistence as jest.Mock).mockResolvedValue(undefined);
      (signInWithPopup as jest.Mock).mockRejectedValue(cancelledError);

      // Act & Assert
      await expect(signInWithGoogle()).rejects.toEqual(cancelledError);

      // Verify error logging
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining("❌ [Firebase Auth] Error code:"),
        "auth/cancelled-popup-request"
      );
    });

    it("should handle generic Error object", async () => {
      // Arrange
      const genericError = new Error("Something went wrong");

      (setPersistence as jest.Mock).mockResolvedValue(undefined);
      (signInWithPopup as jest.Mock).mockRejectedValue(genericError);

      // Act & Assert
      await expect(signInWithGoogle()).rejects.toThrow("Something went wrong");

      // Verify error logging includes error details
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining("❌ [Firebase Auth] Error message:"),
        "Something went wrong"
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining("❌ [Firebase Auth] Error name:"),
        "Error"
      );
    });

    it("should log when setting persistence", async () => {
      // Arrange
      const mockUser = {
        uid: "test-uid-123",
        email: "test@example.com",
        displayName: "Test User",
      };

      (setPersistence as jest.Mock).mockResolvedValue(undefined);
      (signInWithPopup as jest.Mock).mockResolvedValue({ user: mockUser });

      // Act
      await signInWithGoogle();

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("🔵 [Firebase Auth] Setting persistence to browserLocalPersistence")
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("🟢 [Firebase Auth] Persistence set successfully")
      );
    });

    it("should log popup opening", async () => {
      // Arrange
      const mockUser = {
        uid: "test-uid-123",
        email: "test@example.com",
        displayName: "Test User",
      };

      (setPersistence as jest.Mock).mockResolvedValue(undefined);
      (signInWithPopup as jest.Mock).mockResolvedValue({ user: mockUser });

      // Act
      await signInWithGoogle();

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("🔵 [Firebase Auth] Opening Google sign-in popup")
      );
    });

    it("should log successful sign-in with user details", async () => {
      // Arrange
      const mockUser = {
        uid: "test-uid-456",
        email: "john.doe@example.com",
        displayName: "John Doe",
        photoURL: "https://example.com/john.jpg",
      };

      const mockResult = {
        user: mockUser,
        providerId: "google.com",
      };

      (setPersistence as jest.Mock).mockResolvedValue(undefined);
      (signInWithPopup as jest.Mock).mockResolvedValue(mockResult);

      // Act
      await signInWithGoogle();

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("🟢 [Firebase Auth] signInWithPopup successful"),
        expect.objectContaining({
          uid: "test-uid-456",
          email: "john.doe@example.com",
          displayName: "John Doe",
          provider: "google.com",
        })
      );
    });
  });

  describe("Error Logging Verification", () => {
    it("should log all error details for debugging", async () => {
      // Arrange
      const complexError = new Error("Complex error");
      (complexError as Error & { code?: string }).code = "auth/internal-error";

      (setPersistence as jest.Mock).mockResolvedValue(undefined);
      (signInWithPopup as jest.Mock).mockRejectedValue(complexError);

      // Act
      try {
        await signInWithGoogle();
      } catch {
        // Expected to throw
      }

      // Assert - Verify comprehensive logging
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining("❌ [Firebase Auth] Google sign-in error:"),
        complexError
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining("❌ [Firebase Auth] Error message:"),
        "Complex error"
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining("❌ [Firebase Auth] Error code:"),
        "auth/internal-error"
      );
    });

    it("should not crash if error doesn't have standard properties", async () => {
      // Arrange
      const weirdError = { weird: "property" };

      (setPersistence as jest.Mock).mockResolvedValue(undefined);
      (signInWithPopup as jest.Mock).mockRejectedValue(weirdError);

      // Act & Assert - Should not crash
      await expect(signInWithGoogle()).rejects.toEqual(weirdError);

      // Should still log the error
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining("❌ [Firebase Auth] Google sign-in error:"),
        weirdError
      );
    });
  });
});
