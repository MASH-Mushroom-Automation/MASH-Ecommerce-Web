/**
 * Firebase Storage Service Tests
 *
 * Tests for profile picture upload, validation, and deletion.
 */

import {
  validateProfileImage,
  uploadProfilePicture,
  deleteProfilePicture,
  MAX_FILE_SIZE,
  ACCEPTED_IMAGE_TYPES,
} from "../storage";
import type { UploadProgress } from "../storage";

// ============================================================================
// Mocks
// ============================================================================

const mockUploadBytesResumable = jest.fn();
const mockGetDownloadURL = jest.fn();
const mockDeleteObject = jest.fn();
const mockRef = jest.fn();

jest.mock("../config", () => ({
  firebaseApp: {},
}));

jest.mock("firebase/storage", () => ({
  getStorage: jest.fn(() => ({})),
  ref: (...args: unknown[]) => mockRef(...args),
  uploadBytesResumable: (...args: unknown[]) =>
    mockUploadBytesResumable(...args),
  getDownloadURL: (...args: unknown[]) => mockGetDownloadURL(...args),
  deleteObject: (...args: unknown[]) => mockDeleteObject(...args),
}));

// ============================================================================
// Helpers
// ============================================================================

function createMockFile(
  name: string,
  size: number,
  type: string,
): File {
  const buffer = new ArrayBuffer(size);
  return new File([buffer], name, { type });
}

function createSuccessfulUploadTask(downloadURL: string) {
  return {
    on: jest.fn(
      (
        _event: string,
        onProgress: (snapshot: { bytesTransferred: number; totalBytes: number; state: string }) => void,
        _onError: (error: Error) => void,
        onComplete: () => void,
      ) => {
        // Simulate progress
        onProgress({
          bytesTransferred: 50,
          totalBytes: 100,
          state: "running",
        });
        onProgress({
          bytesTransferred: 100,
          totalBytes: 100,
          state: "running",
        });
        // Call complete
        onComplete();
      },
    ),
    snapshot: { ref: { fullPath: "profile-pictures/user1/avatar_123" } },
  };
}

function createFailedUploadTask(errorMessage: string) {
  return {
    on: jest.fn(
      (
        _event: string,
        _onProgress: unknown,
        onError: (error: Error) => void,
      ) => {
        onError(new Error(errorMessage));
      },
    ),
    snapshot: { ref: {} },
  };
}

// ============================================================================
// Tests
// ============================================================================

describe("Firebase Storage Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRef.mockReturnValue({ fullPath: "mock-path" });
  });

  // --------------------------------------------------------------------------
  // validateProfileImage
  // --------------------------------------------------------------------------
  describe("validateProfileImage", () => {
    it("returns null for valid JPEG file", () => {
      const file = createMockFile("photo.jpg", 1024 * 1024, "image/jpeg");
      expect(validateProfileImage(file)).toBeNull();
    });

    it("returns null for valid PNG file", () => {
      const file = createMockFile("photo.png", 2 * 1024 * 1024, "image/png");
      expect(validateProfileImage(file)).toBeNull();
    });

    it("returns null for valid WebP file", () => {
      const file = createMockFile("photo.webp", 500 * 1024, "image/webp");
      expect(validateProfileImage(file)).toBeNull();
    });

    it("returns error for unsupported file type", () => {
      const file = createMockFile("photo.gif", 1024, "image/gif");
      expect(validateProfileImage(file)).toBe(
        "File must be JPEG, PNG, or WebP",
      );
    });

    it("returns error for SVG files", () => {
      const file = createMockFile("image.svg", 1024, "image/svg+xml");
      expect(validateProfileImage(file)).toBe(
        "File must be JPEG, PNG, or WebP",
      );
    });

    it("returns error for file exceeding max size", () => {
      const file = createMockFile(
        "big.jpg",
        MAX_FILE_SIZE + 1,
        "image/jpeg",
      );
      const result = validateProfileImage(file);
      expect(result).toContain("too large");
      expect(result).toContain("5 MB");
    });

    it("returns error for file at exactly 5 MB boundary", () => {
      // Exactly at the limit should pass
      const file = createMockFile("exact.jpg", MAX_FILE_SIZE, "image/jpeg");
      expect(validateProfileImage(file)).toBeNull();
    });

    it("returns error for non-image MIME type", () => {
      const file = createMockFile("doc.pdf", 1024, "application/pdf");
      expect(validateProfileImage(file)).toBe(
        "File must be JPEG, PNG, or WebP",
      );
    });
  });

  // --------------------------------------------------------------------------
  // Constants
  // --------------------------------------------------------------------------
  describe("Constants", () => {
    it("MAX_FILE_SIZE is 5 MB", () => {
      expect(MAX_FILE_SIZE).toBe(5 * 1024 * 1024);
    });

    it("ACCEPTED_IMAGE_TYPES includes jpeg, png, webp", () => {
      expect(ACCEPTED_IMAGE_TYPES).toContain("image/jpeg");
      expect(ACCEPTED_IMAGE_TYPES).toContain("image/png");
      expect(ACCEPTED_IMAGE_TYPES).toContain("image/webp");
      expect(ACCEPTED_IMAGE_TYPES).toHaveLength(3);
    });
  });

  // --------------------------------------------------------------------------
  // uploadProfilePicture
  // --------------------------------------------------------------------------
  describe("uploadProfilePicture", () => {
    it("uploads file and returns download URL", async () => {
      const downloadURL = "https://firebasestorage.googleapis.com/test.jpg";
      const task = createSuccessfulUploadTask(downloadURL);
      mockUploadBytesResumable.mockReturnValue(task);
      mockGetDownloadURL.mockResolvedValue(downloadURL);

      const file = createMockFile("photo.jpg", 1024, "image/jpeg");
      const result = await uploadProfilePicture("user123", file);

      expect(result.downloadURL).toBe(downloadURL);
      expect(result.storagePath).toContain("profile-pictures/user123/avatar_");
      expect(mockRef).toHaveBeenCalled();
      expect(mockUploadBytesResumable).toHaveBeenCalled();
    });

    it("calls onProgress callback during upload", async () => {
      const downloadURL = "https://firebasestorage.googleapis.com/test.jpg";
      const task = createSuccessfulUploadTask(downloadURL);
      mockUploadBytesResumable.mockReturnValue(task);
      mockGetDownloadURL.mockResolvedValue(downloadURL);

      const progressUpdates: UploadProgress[] = [];
      const file = createMockFile("photo.jpg", 1024, "image/jpeg");

      await uploadProfilePicture("user123", file, (progress) => {
        progressUpdates.push({ ...progress });
      });

      expect(progressUpdates.length).toBe(2);
      expect(progressUpdates[0].percentage).toBe(50);
      expect(progressUpdates[1].percentage).toBe(100);
    });

    it("rejects with validation error for invalid file", async () => {
      const file = createMockFile("bad.gif", 1024, "image/gif");

      await expect(uploadProfilePicture("user123", file)).rejects.toThrow(
        "File must be JPEG, PNG, or WebP",
      );
      expect(mockUploadBytesResumable).not.toHaveBeenCalled();
    });

    it("rejects with validation error for oversized file", async () => {
      const file = createMockFile(
        "huge.jpg",
        MAX_FILE_SIZE + 1,
        "image/jpeg",
      );

      await expect(uploadProfilePicture("user123", file)).rejects.toThrow(
        "too large",
      );
    });

    it("handles upload failure", async () => {
      const task = createFailedUploadTask("network error");
      mockUploadBytesResumable.mockReturnValue(task);

      const file = createMockFile("photo.jpg", 1024, "image/jpeg");

      await expect(uploadProfilePicture("user123", file)).rejects.toThrow(
        "Upload failed: network error",
      );
    });

    it("handles getDownloadURL failure", async () => {
      const task = {
        on: jest.fn(
          (
            _event: string,
            _onProgress: unknown,
            _onError: unknown,
            onComplete: () => void,
          ) => {
            onComplete();
          },
        ),
        snapshot: { ref: { fullPath: "mock-path" } },
      };
      mockUploadBytesResumable.mockReturnValue(task);
      mockGetDownloadURL.mockRejectedValue(new Error("URL fetch failed"));

      const file = createMockFile("photo.jpg", 1024, "image/jpeg");

      await expect(uploadProfilePicture("user123", file)).rejects.toThrow(
        "Failed to get download URL",
      );
    });

    it("passes correct metadata with file", async () => {
      const downloadURL = "https://firebasestorage.googleapis.com/test.jpg";
      const task = createSuccessfulUploadTask(downloadURL);
      mockUploadBytesResumable.mockReturnValue(task);
      mockGetDownloadURL.mockResolvedValue(downloadURL);

      const file = createMockFile("photo.png", 2048, "image/png");
      await uploadProfilePicture("user456", file);

      const callArgs = mockUploadBytesResumable.mock.calls[0];
      const metadata = callArgs[2];
      expect(metadata.contentType).toBe("image/png");
      expect(metadata.customMetadata.userId).toBe("user456");
      expect(metadata.customMetadata.uploadedAt).toBeDefined();
    });
  });

  // --------------------------------------------------------------------------
  // deleteProfilePicture
  // --------------------------------------------------------------------------
  describe("deleteProfilePicture", () => {
    it("deletes file at given storage path", async () => {
      mockDeleteObject.mockResolvedValue(undefined);

      await deleteProfilePicture("profile-pictures/user1/avatar_123");

      expect(mockRef).toHaveBeenCalled();
      expect(mockDeleteObject).toHaveBeenCalled();
    });

    it("does nothing when path is empty", async () => {
      await deleteProfilePicture("");

      expect(mockDeleteObject).not.toHaveBeenCalled();
    });

    it("ignores object-not-found errors", async () => {
      const error = new Error("Object not found") as Error & { code: string };
      error.code = "storage/object-not-found";
      mockDeleteObject.mockRejectedValue(error);

      // Should not throw
      await expect(
        deleteProfilePicture("profile-pictures/user1/avatar_123"),
      ).resolves.toBeUndefined();
    });

    it("rethrows non-object-not-found errors", async () => {
      mockDeleteObject.mockRejectedValue(new Error("permission denied"));

      await expect(
        deleteProfilePicture("profile-pictures/user1/avatar_123"),
      ).rejects.toThrow("permission denied");
    });
  });
});
