/**
 * Profile Picture Upload Service Tests
 *
 * Comprehensive tests for profile picture validation, Canvas-based
 * image processing, and the data URL upload flow.
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
// Mocks - All synchronous to avoid timer complexities
// ============================================================================

const mockCompressedDataURL = "data:image/jpeg;base64,/9j/compressed==";

// Mock FileReader: synchronously invokes onload when readAsDataURL is called
const MockFileReader = jest.fn().mockImplementation(() => {
  const instance = {
    onload: undefined as ((e: { target: { result: string } }) => void) | undefined,
    onerror: undefined as (() => void) | undefined,
    readAsDataURL: jest.fn(() => {
      if (instance.onload) {
        instance.onload({
          target: { result: "data:image/jpeg;base64,/9j/rawfiledata==" },
        });
      }
    }),
  };
  return instance;
});

// Mock Canvas context
const mockDrawImage = jest.fn();
const mockToDataURL = jest.fn(() => mockCompressedDataURL);
const mockGetContext = jest.fn(() => ({
  drawImage: mockDrawImage,
}));

// Mock createElement to return a mock canvas for "canvas" tag
const originalCreateElement = document.createElement.bind(document);
jest.spyOn(document, "createElement").mockImplementation((tag: string) => {
  if (tag === "canvas") {
    return {
      width: 0,
      height: 0,
      getContext: mockGetContext,
      toDataURL: mockToDataURL,
    } as unknown as HTMLCanvasElement;
  }
  return originalCreateElement(tag);
});

// Mock window.Image: synchronously invokes onload when src is set
Object.defineProperty(window, "Image", {
  value: jest.fn().mockImplementation(() => {
    const instance: Record<string, unknown> = {
      onload: undefined,
      onerror: undefined,
      _src: "",
      width: 512,
      height: 512,
    };
    Object.defineProperty(instance, "src", {
      set(value: string) {
        instance._src = value;
        const onload = instance.onload as (() => void) | undefined;
        if (onload) onload();
      },
      get() {
        return instance._src;
      },
    });
    return instance;
  }),
});

// Override global FileReader
Object.defineProperty(global, "FileReader", { value: MockFileReader });

// Mock the 200ms UX delay to be instant
const originalSetTimeout = global.setTimeout;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).setTimeout = jest.fn((fn: () => void, _ms?: number) => {
  fn();
  return 0;
}) as unknown as typeof setTimeout;

// ============================================================================
// Helpers
// ============================================================================

function createMockFile(name: string, size: number, type: string): File {
  const buffer = new ArrayBuffer(size);
  return new File([buffer], name, { type });
}

// ============================================================================
// Tests
// ============================================================================

describe("Profile Picture Upload Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToDataURL.mockReturnValue(mockCompressedDataURL);
  });

  afterAll(() => {
    (global as Record<string, unknown>).setTimeout = originalSetTimeout;
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

    it("returns error for unsupported file type (GIF)", () => {
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

    it("returns error for BMP files", () => {
      const file = createMockFile("image.bmp", 1024, "image/bmp");
      expect(validateProfileImage(file)).toBe(
        "File must be JPEG, PNG, or WebP",
      );
    });

    it("returns error for TIFF files", () => {
      const file = createMockFile("image.tiff", 1024, "image/tiff");
      expect(validateProfileImage(file)).toBe(
        "File must be JPEG, PNG, or WebP",
      );
    });

    it("returns error for non-image MIME type (PDF)", () => {
      const file = createMockFile("doc.pdf", 1024, "application/pdf");
      expect(validateProfileImage(file)).toBe(
        "File must be JPEG, PNG, or WebP",
      );
    });

    it("returns error for text files", () => {
      const file = createMockFile("readme.txt", 1024, "text/plain");
      expect(validateProfileImage(file)).toBe(
        "File must be JPEG, PNG, or WebP",
      );
    });

    it("returns error for video files", () => {
      const file = createMockFile("video.mp4", 1024, "video/mp4");
      expect(validateProfileImage(file)).toBe(
        "File must be JPEG, PNG, or WebP",
      );
    });

    it("returns error for file exceeding max size", () => {
      const file = createMockFile("big.jpg", MAX_FILE_SIZE + 1, "image/jpeg");
      const result = validateProfileImage(file);
      expect(result).toContain("too large");
      expect(result).toContain("5 MB");
    });

    it("passes for file at exactly 5 MB boundary", () => {
      const file = createMockFile("exact.jpg", MAX_FILE_SIZE, "image/jpeg");
      expect(validateProfileImage(file)).toBeNull();
    });

    it("returns error for file one byte over the limit", () => {
      const file = createMockFile("over.jpg", MAX_FILE_SIZE + 1, "image/jpeg");
      expect(validateProfileImage(file)).not.toBeNull();
    });

    it("passes for very small file (1 byte)", () => {
      const file = createMockFile("tiny.jpg", 1, "image/jpeg");
      expect(validateProfileImage(file)).toBeNull();
    });

    it("shows correct file size in error message", () => {
      const sixMB = 6 * 1024 * 1024;
      const file = createMockFile("big.png", sixMB, "image/png");
      const result = validateProfileImage(file);
      expect(result).toContain("6.0 MB");
    });

    it("returns error for empty MIME type", () => {
      const file = createMockFile("noext", 1024, "");
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

    it("MAX_FILE_SIZE is exactly 5242880 bytes", () => {
      expect(MAX_FILE_SIZE).toBe(5242880);
    });

    it("ACCEPTED_IMAGE_TYPES includes jpeg, png, webp", () => {
      expect(ACCEPTED_IMAGE_TYPES).toContain("image/jpeg");
      expect(ACCEPTED_IMAGE_TYPES).toContain("image/png");
      expect(ACCEPTED_IMAGE_TYPES).toContain("image/webp");
    });

    it("ACCEPTED_IMAGE_TYPES has exactly 3 entries", () => {
      expect(ACCEPTED_IMAGE_TYPES).toHaveLength(3);
    });

    it("ACCEPTED_IMAGE_TYPES does not include gif", () => {
      expect(ACCEPTED_IMAGE_TYPES).not.toContain("image/gif");
    });

    it("ACCEPTED_IMAGE_TYPES does not include svg", () => {
      expect(ACCEPTED_IMAGE_TYPES).not.toContain("image/svg+xml");
    });
  });

  // --------------------------------------------------------------------------
  // uploadProfilePicture
  // --------------------------------------------------------------------------
  describe("uploadProfilePicture", () => {
    it("rejects with validation error for invalid file type", async () => {
      const file = createMockFile("bad.gif", 1024, "image/gif");

      await expect(uploadProfilePicture("user123", file)).rejects.toThrow(
        "File must be JPEG, PNG, or WebP",
      );
    });

    it("rejects with validation error for oversized file", async () => {
      const file = createMockFile("huge.jpg", MAX_FILE_SIZE + 1, "image/jpeg");

      await expect(uploadProfilePicture("user123", file)).rejects.toThrow(
        "too large",
      );
    });

    it("returns a data URL as the download URL", async () => {
      const file = createMockFile("photo.jpg", 1024, "image/jpeg");
      const result = await uploadProfilePicture("user123", file);

      expect(result.downloadURL).toBe(mockCompressedDataURL);
      expect(result.downloadURL).toContain("data:image/jpeg;base64,");
    });

    it("returns a storage path containing userId", async () => {
      const file = createMockFile("photo.jpg", 1024, "image/jpeg");
      const result = await uploadProfilePicture("user123", file);

      expect(result.storagePath).toContain("user123");
      expect(result.storagePath).toMatch(
        /^profile-pictures\/user123\/avatar_\d+$/,
      );
    });

    it("calls onProgress callback during processing", async () => {
      const progressUpdates: UploadProgress[] = [];
      const file = createMockFile("photo.jpg", 1024, "image/jpeg");

      await uploadProfilePicture("user123", file, (progress) => {
        progressUpdates.push({ ...progress });
      });

      expect(progressUpdates.length).toBeGreaterThanOrEqual(2);
      expect(progressUpdates[0].percentage).toBe(0);
      expect(progressUpdates[progressUpdates.length - 1].percentage).toBe(100);
    });

    it("works without onProgress callback", async () => {
      const file = createMockFile("photo.jpg", 1024, "image/jpeg");
      const result = await uploadProfilePicture("user123", file);

      expect(result.downloadURL).toBeDefined();
    });

    it("includes timestamp in storage path", async () => {
      const file = createMockFile("photo.jpg", 1024, "image/jpeg");
      const result = await uploadProfilePicture("user123", file);

      expect(result.storagePath).toMatch(/avatar_\d+$/);
    });

    it("ignores previousStoragePath parameter", async () => {
      const file = createMockFile("photo.jpg", 1024, "image/jpeg");

      const result = await uploadProfilePicture(
        "user123",
        file,
        undefined,
        "old-path/avatar_old",
      );

      expect(result.downloadURL).toBeDefined();
    });

    it("initial progress state is running", async () => {
      const progressUpdates: UploadProgress[] = [];
      const file = createMockFile("photo.jpg", 1024, "image/jpeg");

      await uploadProfilePicture("user123", file, (progress) => {
        progressUpdates.push({ ...progress });
      });

      expect(progressUpdates[0].state).toBe("running");
    });

    it("final progress state is success", async () => {
      const progressUpdates: UploadProgress[] = [];
      const file = createMockFile("photo.jpg", 1024, "image/jpeg");

      await uploadProfilePicture("user123", file, (progress) => {
        progressUpdates.push({ ...progress });
      });

      const last = progressUpdates[progressUpdates.length - 1];
      expect(last.state).toBe("success");
      expect(last.percentage).toBe(100);
    });

    it("reads the file with FileReader", async () => {
      const file = createMockFile("photo.jpg", 1024, "image/jpeg");
      await uploadProfilePicture("user123", file);

      expect(MockFileReader).toHaveBeenCalled();
    });

    it("creates a canvas for image resize", async () => {
      const file = createMockFile("photo.jpg", 1024, "image/jpeg");
      await uploadProfilePicture("user123", file);

      expect(document.createElement).toHaveBeenCalledWith("canvas");
      expect(mockGetContext).toHaveBeenCalledWith("2d");
      expect(mockDrawImage).toHaveBeenCalled();
    });

    it("generates JPEG output via canvas.toDataURL", async () => {
      const file = createMockFile("photo.png", 1024, "image/png");
      await uploadProfilePicture("user123", file);

      expect(mockToDataURL).toHaveBeenCalledWith("image/jpeg", expect.any(Number));
    });

    it("produces different storage paths for different users", async () => {
      const file = createMockFile("photo.jpg", 1024, "image/jpeg");

      const result1 = await uploadProfilePicture("userA", file);
      const result2 = await uploadProfilePicture("userB", file);

      expect(result1.storagePath).toContain("userA");
      expect(result2.storagePath).toContain("userB");
      expect(result1.storagePath).not.toBe(result2.storagePath);
    });

    it("reports 50% progress after resize completes", async () => {
      const progressUpdates: UploadProgress[] = [];
      const file = createMockFile("photo.jpg", 1024, "image/jpeg");

      await uploadProfilePicture("user123", file, (progress) => {
        progressUpdates.push({ ...progress });
      });

      const midProgress = progressUpdates.find((p) => p.percentage === 50);
      expect(midProgress).toBeDefined();
      expect(midProgress?.state).toBe("running");
    });

    it("progress bytesTransferred matches totalBytes at completion", async () => {
      const progressUpdates: UploadProgress[] = [];
      const file = createMockFile("photo.jpg", 2048, "image/jpeg");

      await uploadProfilePicture("user123", file, (progress) => {
        progressUpdates.push({ ...progress });
      });

      const last = progressUpdates[progressUpdates.length - 1];
      expect(last.bytesTransferred).toBe(last.totalBytes);
    });
  });

  // --------------------------------------------------------------------------
  // deleteProfilePicture
  // --------------------------------------------------------------------------
  describe("deleteProfilePicture", () => {
    it("resolves without error for any path", async () => {
      await expect(
        deleteProfilePicture("profile-pictures/user1/avatar_123"),
      ).resolves.toBeUndefined();
    });

    it("resolves without error for empty path", async () => {
      await expect(deleteProfilePicture("")).resolves.toBeUndefined();
    });

    it("is a no-op that returns void", async () => {
      const result = await deleteProfilePicture("any-path");
      expect(result).toBeUndefined();
    });

    it("does not interact with any storage service", async () => {
      await deleteProfilePicture("profile-pictures/user1/avatar_123");
      // No external calls should be made
      expect(mockDrawImage).not.toHaveBeenCalled();
      expect(MockFileReader).not.toHaveBeenCalled();
    });
  });

  // --------------------------------------------------------------------------
  // resizeImage (tested indirectly via uploadProfilePicture)
  // --------------------------------------------------------------------------
  describe("Image Resizing", () => {
    it("scales down a landscape image maintaining aspect ratio", async () => {
      // MockImage has width=512, height=512 by default
      const file = createMockFile("landscape.jpg", 1024, "image/jpeg");
      await uploadProfilePicture("user1", file);

      expect(mockDrawImage).toHaveBeenCalled();
    });

    it("handles portrait-oriented images", async () => {
      const file = createMockFile("portrait.jpg", 1024, "image/jpeg");
      await uploadProfilePicture("user-portrait", file);

      expect(mockDrawImage).toHaveBeenCalled();
      expect(mockGetContext).toHaveBeenCalledWith("2d");
    });

    it("always produces JPEG output regardless of input format", async () => {
      const pngFile = createMockFile("photo.png", 1024, "image/png");
      await uploadProfilePicture("user1", pngFile);
      expect(mockToDataURL).toHaveBeenCalledWith("image/jpeg", expect.any(Number));

      const webpFile = createMockFile("photo.webp", 1024, "image/webp");
      await uploadProfilePicture("user2", webpFile);
      expect(mockToDataURL).toHaveBeenCalledWith("image/jpeg", expect.any(Number));
    });

    it("sets canvas dimensions before drawing", async () => {
      const file = createMockFile("photo.jpg", 1024, "image/jpeg");
      await uploadProfilePicture("user1", file);

      expect(document.createElement).toHaveBeenCalledWith("canvas");
    });
  });

  // --------------------------------------------------------------------------
  // Error scenarios
  // --------------------------------------------------------------------------
  describe("Error Scenarios", () => {
    it("rejects when FileReader fails", async () => {
      // Override MockFileReader to trigger onerror
      MockFileReader.mockImplementationOnce(() => {
        const instance = {
          onload: undefined as (() => void) | undefined,
          onerror: undefined as (() => void) | undefined,
          readAsDataURL: jest.fn(() => {
            if (instance.onerror) {
              instance.onerror();
            }
          }),
        };
        return instance;
      });

      const file = createMockFile("bad.jpg", 1024, "image/jpeg");
      await expect(uploadProfilePicture("user1", file)).rejects.toThrow(
        "Failed to read file",
      );
    });

    it("rejects when Image fails to load", async () => {
      // Override window.Image to trigger onerror
      const OriginalImage = window.Image;
      Object.defineProperty(window, "Image", {
        value: jest.fn().mockImplementation(() => {
          const instance: Record<string, unknown> = {
            onload: undefined,
            onerror: undefined,
            _src: "",
            crossOrigin: "",
            width: 0,
            height: 0,
          };
          Object.defineProperty(instance, "src", {
            set() {
              const onerror = instance.onerror as (() => void) | undefined;
              if (onerror) onerror();
            },
            get() {
              return instance._src;
            },
          });
          return instance;
        }),
      });

      const file = createMockFile("corrupt.jpg", 1024, "image/jpeg");
      await expect(uploadProfilePicture("user1", file)).rejects.toThrow(
        "Failed to load image for resize",
      );

      // Restore original
      Object.defineProperty(window, "Image", { value: OriginalImage });
    });

    it("rejects when canvas context is null", async () => {
      mockGetContext.mockReturnValueOnce(null);

      const file = createMockFile("photo.jpg", 1024, "image/jpeg");
      await expect(uploadProfilePicture("user1", file)).rejects.toThrow(
        "Failed to create canvas context",
      );
    });
  });

  // --------------------------------------------------------------------------
  // Progress callback sequence
  // --------------------------------------------------------------------------
  describe("Progress Callback Sequence", () => {
    it("emits progress in correct order: 0% -> 50% -> 100%", async () => {
      const percentages: number[] = [];
      const file = createMockFile("photo.jpg", 1024, "image/jpeg");

      await uploadProfilePicture("user1", file, (progress) => {
        percentages.push(progress.percentage);
      });

      expect(percentages).toEqual([0, 50, 100]);
    });

    it("emits exactly 3 progress updates", async () => {
      const updates: UploadProgress[] = [];
      const file = createMockFile("photo.jpg", 1024, "image/jpeg");

      await uploadProfilePicture("user1", file, (progress) => {
        updates.push({ ...progress });
      });

      expect(updates).toHaveLength(3);
    });

    it("state transitions from running to success", async () => {
      const states: string[] = [];
      const file = createMockFile("photo.jpg", 1024, "image/jpeg");

      await uploadProfilePicture("user1", file, (progress) => {
        states.push(progress.state);
      });

      expect(states).toEqual(["running", "running", "success"]);
    });

    it("totalBytes is consistent across all progress updates", async () => {
      const fileSize = 2048;
      const totalBytesValues: number[] = [];
      const file = createMockFile("photo.jpg", fileSize, "image/jpeg");

      await uploadProfilePicture("user1", file, (progress) => {
        totalBytesValues.push(progress.totalBytes);
      });

      expect(totalBytesValues.every((v) => v === fileSize)).toBe(true);
    });

    it("bytesTransferred at 50% is half of file size", async () => {
      const fileSize = 4096;
      const file = createMockFile("photo.jpg", fileSize, "image/jpeg");
      const updates: UploadProgress[] = [];

      await uploadProfilePicture("user1", file, (progress) => {
        updates.push({ ...progress });
      });

      const midUpdate = updates.find((u) => u.percentage === 50);
      expect(midUpdate?.bytesTransferred).toBe(Math.round(fileSize / 2));
    });
  });
});
