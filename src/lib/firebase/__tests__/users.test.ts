/**
 * FirebaseUserService Unit Tests
 *
 * Tests for profile picture persistence fix:
 * - createOrUpdateProfile preserves existing photoURL for existing profiles
 * - updateProfile always updates photoURL (explicit user action)
 * - New profiles get photoURL from auth provider
 * - getProfile returns stored photoURL correctly
 */

// Unmock users module to test real implementation
jest.unmock("@/lib/firebase/users");

// Mock Firestore SDK functions
const mockGetDoc = jest.fn();
const mockSetDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockDoc = jest.fn().mockReturnValue("mock-doc-ref");
const mockServerTimestamp = jest.fn().mockReturnValue("mock-timestamp");

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn().mockReturnValue("mock-db"),
  doc: (...args: unknown[]) => mockDoc(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
  serverTimestamp: () => mockServerTimestamp(),
  enableNetwork: jest.fn(),
  disableNetwork: jest.fn(),
}));

import { FirebaseUserService } from "../users";

describe("FirebaseUserService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetDoc.mockResolvedValue(undefined);
    mockUpdateDoc.mockResolvedValue(undefined);
  });

  describe("createOrUpdateProfile", () => {
    const baseInput = {
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      displayName: "Test User",
      provider: "google" as const,
      emailVerified: true,
    };

    describe("new profile creation", () => {
      it("should create profile with Google photoURL for new users", async () => {
        mockGetDoc.mockResolvedValue({
          exists: () => false,
        });

        const result = await FirebaseUserService.createOrUpdateProfile(
          "user-123",
          {
            ...baseInput,
            photoURL: "https://lh3.googleusercontent.com/photo.jpg",
          }
        );

        expect(mockSetDoc).toHaveBeenCalledWith(
          "mock-doc-ref",
          expect.objectContaining({
            photoURL: "https://lh3.googleusercontent.com/photo.jpg",
          })
        );
        expect(result.photoURL).toBe(
          "https://lh3.googleusercontent.com/photo.jpg"
        );
      });

      it("should create profile with null photoURL when not provided", async () => {
        mockGetDoc.mockResolvedValue({
          exists: () => false,
        });

        const result = await FirebaseUserService.createOrUpdateProfile(
          "user-123",
          baseInput
        );

        expect(mockSetDoc).toHaveBeenCalledWith(
          "mock-doc-ref",
          expect.objectContaining({
            photoURL: null,
          })
        );
        expect(result.photoURL).toBeNull();
      });
    });

    describe("existing profile - photoURL preservation", () => {
      it("should NOT overwrite existing photoURL with Google photo on re-login", async () => {
        const customDataUrl = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";

        mockGetDoc.mockResolvedValue({
          exists: () => true,
          data: () => ({
            id: "user-123",
            email: "test@example.com",
            firstName: "Test",
            lastName: "User",
            photoURL: customDataUrl,
            provider: "google",
          }),
        });

        const result = await FirebaseUserService.createOrUpdateProfile(
          "user-123",
          {
            ...baseInput,
            photoURL: "https://lh3.googleusercontent.com/photo.jpg",
          }
        );

        // updateDoc should NOT contain photoURL
        expect(mockUpdateDoc).toHaveBeenCalledWith(
          "mock-doc-ref",
          expect.not.objectContaining({
            photoURL: expect.anything(),
          })
        );

        // Return value should preserve existing custom photoURL
        expect(result.photoURL).toBe(customDataUrl);
      });

      it("should NOT overwrite existing Google photoURL with same Google photo", async () => {
        const googlePhotoUrl =
          "https://lh3.googleusercontent.com/existing-photo.jpg";

        mockGetDoc.mockResolvedValue({
          exists: () => true,
          data: () => ({
            id: "user-123",
            email: "test@example.com",
            photoURL: googlePhotoUrl,
            provider: "google",
          }),
        });

        const result = await FirebaseUserService.createOrUpdateProfile(
          "user-123",
          {
            ...baseInput,
            photoURL: "https://lh3.googleusercontent.com/new-photo.jpg",
          }
        );

        // Should preserve the existing photo
        expect(mockUpdateDoc).toHaveBeenCalledWith(
          "mock-doc-ref",
          expect.not.objectContaining({
            photoURL: expect.anything(),
          })
        );
        expect(result.photoURL).toBe(googlePhotoUrl);
      });

      it("should set photoURL when existing profile has no photo", async () => {
        mockGetDoc.mockResolvedValue({
          exists: () => true,
          data: () => ({
            id: "user-123",
            email: "test@example.com",
            photoURL: null,
            provider: "google",
          }),
        });

        const result = await FirebaseUserService.createOrUpdateProfile(
          "user-123",
          {
            ...baseInput,
            photoURL: "https://lh3.googleusercontent.com/photo.jpg",
          }
        );

        // Should set photoURL because existing is null
        expect(mockUpdateDoc).toHaveBeenCalledWith(
          "mock-doc-ref",
          expect.objectContaining({
            photoURL: "https://lh3.googleusercontent.com/photo.jpg",
          })
        );
        expect(result.photoURL).toBe(
          "https://lh3.googleusercontent.com/photo.jpg"
        );
      });

      it("should set photoURL when existing profile has undefined photo", async () => {
        mockGetDoc.mockResolvedValue({
          exists: () => true,
          data: () => ({
            id: "user-123",
            email: "test@example.com",
            provider: "email",
            // photoURL not set at all
          }),
        });

        const result = await FirebaseUserService.createOrUpdateProfile(
          "user-123",
          {
            ...baseInput,
            photoURL: "https://lh3.googleusercontent.com/photo.jpg",
          }
        );

        expect(mockUpdateDoc).toHaveBeenCalledWith(
          "mock-doc-ref",
          expect.objectContaining({
            photoURL: "https://lh3.googleusercontent.com/photo.jpg",
          })
        );
        expect(result.photoURL).toBe(
          "https://lh3.googleusercontent.com/photo.jpg"
        );
      });

      it("should NOT overwrite data URL photo with undefined", async () => {
        const customDataUrl = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";

        mockGetDoc.mockResolvedValue({
          exists: () => true,
          data: () => ({
            id: "user-123",
            email: "test@example.com",
            photoURL: customDataUrl,
          }),
        });

        const result = await FirebaseUserService.createOrUpdateProfile(
          "user-123",
          {
            ...baseInput,
            // photoURL not provided (undefined)
          }
        );

        // updateDoc should NOT contain photoURL
        expect(mockUpdateDoc).toHaveBeenCalledWith(
          "mock-doc-ref",
          expect.not.objectContaining({
            photoURL: expect.anything(),
          })
        );
        expect(result.photoURL).toBe(customDataUrl);
      });

      it("should update other fields while preserving photoURL", async () => {
        const customDataUrl = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";

        mockGetDoc.mockResolvedValue({
          exists: () => true,
          data: () => ({
            id: "user-123",
            email: "test@example.com",
            firstName: "Old",
            lastName: "Name",
            photoURL: customDataUrl,
          }),
        });

        const result = await FirebaseUserService.createOrUpdateProfile(
          "user-123",
          {
            ...baseInput,
            firstName: "New",
            lastName: "Name",
            photoURL: "https://lh3.googleusercontent.com/photo.jpg",
          }
        );

        // Should update name fields
        expect(mockUpdateDoc).toHaveBeenCalledWith(
          "mock-doc-ref",
          expect.objectContaining({
            firstName: "New",
            lastName: "Name",
          })
        );

        // Should NOT update photoURL
        expect(mockUpdateDoc).toHaveBeenCalledWith(
          "mock-doc-ref",
          expect.not.objectContaining({
            photoURL: expect.anything(),
          })
        );

        // Return should have preserved photoURL and updated name
        expect(result.photoURL).toBe(customDataUrl);
        expect(result.firstName).toBe("New");
      });
    });
  });

  describe("updateProfile", () => {
    it("should always update photoURL via explicit updateProfile", async () => {
      const newDataUrl = "data:image/jpeg;base64,/9j/newphoto==";

      mockSetDoc.mockResolvedValue(undefined);

      const result = await FirebaseUserService.updateProfile("user-123", {
        photoURL: newDataUrl,
      });

      // setDoc with merge:true should include photoURL
      expect(mockSetDoc).toHaveBeenCalledWith(
        "mock-doc-ref",
        expect.objectContaining({
          photoURL: newDataUrl,
        }),
        { merge: true }
      );
      expect(result).toBe(true);
    });

    it("should update photoURL back to Google URL via explicit updateProfile", async () => {
      const googleUrl = "https://lh3.googleusercontent.com/photo.jpg";

      mockSetDoc.mockResolvedValue(undefined);

      const result = await FirebaseUserService.updateProfile("user-123", {
        photoURL: googleUrl,
      });

      expect(mockSetDoc).toHaveBeenCalledWith(
        "mock-doc-ref",
        expect.objectContaining({
          photoURL: googleUrl,
        }),
        { merge: true }
      );
      expect(result).toBe(true);
    });

    it("should strip undefined values from update data", async () => {
      mockSetDoc.mockResolvedValue(undefined);

      await FirebaseUserService.updateProfile("user-123", {
        firstName: "Test",
        photoURL: undefined,
      });

      const setDocCall = mockSetDoc.mock.calls[0];
      const updateData = setDocCall[1];

      expect(updateData).not.toHaveProperty("photoURL");
      expect(updateData).toHaveProperty("firstName", "Test");
    });
  });

  describe("getProfile", () => {
    it("should return profile with custom photoURL", async () => {
      const customDataUrl = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        id: "user-123",
        data: () => ({
          email: "test@example.com",
          photoURL: customDataUrl,
          firstName: "Test",
        }),
      });

      const result = await FirebaseUserService.getProfile("user-123");

      expect(result).toBeDefined();
      expect(result?.photoURL).toBe(customDataUrl);
    });

    it("should return null for non-existent profile", async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      });

      const result = await FirebaseUserService.getProfile("missing-user");

      expect(result).toBeNull();
    });

    it("should handle offline error gracefully", async () => {
      mockGetDoc.mockRejectedValue({ code: "unavailable" });

      const result = await FirebaseUserService.getProfile("user-123");

      expect(result).toBeNull();
    });
  });
});
