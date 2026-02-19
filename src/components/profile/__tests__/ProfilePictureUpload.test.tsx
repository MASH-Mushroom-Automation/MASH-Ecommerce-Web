/**
 * ProfilePictureUpload Component Tests
 *
 * Test categories:
 * 1. Rendering: Avatar display, camera button, overlay
 * 2. Dialog: Open/close, tabs, steps
 * 3. File selection: Valid files, invalid files, drag and drop
 * 4. Crop step: Image crop editor, preview comparison
 * 5. Upload: Progress, success, failure
 * 6. Remove photo: Custom photo removal
 * 7. Accessibility: ARIA labels, keyboard navigation
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfilePictureUpload } from "../ProfilePictureUpload";
import type { AvatarUser } from "@/lib/avatar";

// ============================================================================
// Mocks
// ============================================================================

// Mock Firebase Storage
const mockUploadProfilePicture = jest.fn();
const mockValidateProfileImage = jest.fn();

jest.mock("@/lib/firebase", () => ({
  uploadProfilePicture: (...args: unknown[]) =>
    mockUploadProfilePicture(...args),
  validateProfileImage: (...args: unknown[]) =>
    mockValidateProfileImage(...args),
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  ACCEPTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
}));

// Mock avatar utility
jest.mock("@/lib/avatar", () => ({
  getProfileAvatar: jest.fn(
    (user: AvatarUser | null) =>
      user?.photoURL || "/profile_placeholder.png",
  ),
  isDiceBearAvatar: jest.fn((url: string) => url.includes("dicebear.com")),
}));

// Mock ImageCropEditor - calls onCropComplete with a fake data URL
const MOCK_CROPPED_URL = "data:image/jpeg;base64,/9j/mockCroppedImage";
jest.mock("../ImageCropEditor", () => ({
  ImageCropEditor: ({ onCropComplete }: { onCropComplete: (url: string) => void }) => {
    // Simulate crop completion on mount
    React.useEffect(() => {
      onCropComplete(MOCK_CROPPED_URL);
    }, [onCropComplete]);
    return <div data-testid="image-crop-editor">Mock Crop Editor</div>;
  },
}));

// Mock Next.js Image
jest.mock("next/image", () => ({
  __esModule: true,
  default: function MockImage(props: Record<string, unknown>) {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Use global toast mock from jest.setupMocks.js
const mockToast = (globalThis as Record<string, unknown>).__mockToast as {
  success: jest.Mock;
  error: jest.Mock;
};

// Mock URL.createObjectURL / revokeObjectURL
const mockCreateObjectURL = jest.fn(() => "blob:http://localhost/test-blob");
const mockRevokeObjectURL = jest.fn();
Object.defineProperty(global, "URL", {
  value: {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  },
  writable: true,
});

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

const mockUser: AvatarUser = {
  id: "user123",
  email: "test@example.com",
  displayName: "Test User",
  firstName: "Test",
  photoURL: null,
};

const mockOnUploadComplete = jest.fn();

function renderComponent(
  user: AvatarUser | null = mockUser,
  onUploadComplete = mockOnUploadComplete,
) {
  return render(
    <ProfilePictureUpload
      user={user}
      onUploadComplete={onUploadComplete}
    />,
  );
}

// Helper to open dialog, select a file, and reach the crop step
async function openDialogAndSelectFile(
  file?: File,
): Promise<void> {
  await userEvent.click(screen.getByTestId("profile-picture-camera-btn"));
  const inputFile = file || createMockFile("photo.jpg", 1024, "image/jpeg");
  const input = screen.getByTestId("profile-picture-file-input");
  fireEvent.change(input, { target: { files: [inputFile] } });
}

// ============================================================================
// Tests
// ============================================================================

describe("ProfilePictureUpload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockValidateProfileImage.mockReturnValue(null);
  });

  // --------------------------------------------------------------------------
  // Rendering
  // --------------------------------------------------------------------------
  describe("Rendering", () => {
    it("renders the avatar image", () => {
      renderComponent();

      const img = screen.getByAltText("Test User profile picture");
      expect(img).toBeInTheDocument();
    });

    it("renders the camera button", () => {
      renderComponent();

      const btn = screen.getByTestId("profile-picture-camera-btn");
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveAttribute("aria-label", "Change profile picture");
    });

    it("renders fallback avatar for null user", () => {
      renderComponent(null);

      const img = screen.getByAltText("User profile picture");
      expect(img).toHaveAttribute("src", "/profile_placeholder.png");
    });

    it("renders the hover overlay for profile picture", () => {
      renderComponent();

      const overlay = screen.getByTestId("profile-picture-overlay");
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveAttribute("aria-label", "Change profile picture");
    });
  });

  // --------------------------------------------------------------------------
  // Dialog
  // --------------------------------------------------------------------------
  describe("Dialog", () => {
    it("opens dialog when camera button is clicked", async () => {
      renderComponent();

      const btn = screen.getByTestId("profile-picture-camera-btn");
      await userEvent.click(btn);

      expect(screen.getByText("Update Profile Picture")).toBeInTheDocument();
      expect(screen.getByTestId("profile-picture-dropzone")).toBeInTheDocument();
    });

    it("opens dialog when overlay is clicked", async () => {
      renderComponent();

      const overlay = screen.getByTestId("profile-picture-overlay");
      await userEvent.click(overlay);

      expect(screen.getByText("Update Profile Picture")).toBeInTheDocument();
    });

    it("closes dialog when Cancel is clicked", async () => {
      renderComponent();

      await userEvent.click(screen.getByTestId("profile-picture-camera-btn"));
      expect(screen.getByText("Update Profile Picture")).toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

      await waitFor(() => {
        expect(
          screen.queryByText("Update Profile Picture"),
        ).not.toBeInTheDocument();
      });
    });

    it("shows tabs for Upload New and Current Photo", async () => {
      renderComponent();

      await userEvent.click(screen.getByTestId("profile-picture-camera-btn"));

      expect(screen.getByText("Upload New")).toBeInTheDocument();
      expect(screen.getByText("Current Photo")).toBeInTheDocument();
    });

    it("shows accepted formats and max size in description", async () => {
      renderComponent();

      await userEvent.click(screen.getByTestId("profile-picture-camera-btn"));

      expect(screen.getByText(/JPEG, PNG, WebP/)).toBeInTheDocument();
      expect(screen.getByText(/Max size: 5 MB/)).toBeInTheDocument();
    });

    it("shows current photo tab content with auto-generated message for no custom photo", async () => {
      renderComponent();

      await userEvent.click(screen.getByTestId("profile-picture-camera-btn"));
      await userEvent.click(screen.getByText("Current Photo"));

      expect(screen.getByText("Auto-generated avatar based on your profile")).toBeInTheDocument();
    });

    it("shows remove button when user has custom photo", async () => {
      renderComponent({
        ...mockUser,
        photoURL: "data:image/jpeg;base64,/9j/customPhoto",
      });

      await userEvent.click(screen.getByTestId("profile-picture-camera-btn"));
      await userEvent.click(screen.getByText("Current Photo"));

      expect(screen.getByTestId("remove-photo-btn")).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // File Selection
  // --------------------------------------------------------------------------
  describe("File Selection", () => {
    it("transitions to crop step after selecting a valid file", async () => {
      renderComponent();

      await openDialogAndSelectFile();

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(screen.getByText("Adjust Your Photo")).toBeInTheDocument();
      expect(screen.getByTestId("image-crop-editor")).toBeInTheDocument();
    });

    it("shows error for invalid file type", async () => {
      mockValidateProfileImage.mockReturnValue("File must be JPEG, PNG, or WebP");

      renderComponent();
      await userEvent.click(screen.getByTestId("profile-picture-camera-btn"));

      const file = createMockFile("photo.gif", 1024, "image/gif");
      const input = screen.getByTestId("profile-picture-file-input");
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByTestId("profile-picture-error")).toBeInTheDocument();
        expect(
          screen.getByText("File must be JPEG, PNG, or WebP"),
        ).toBeInTheDocument();
      });
    });

    it("shows error for oversized file", async () => {
      mockValidateProfileImage.mockReturnValue(
        "File is too large (6.0 MB). Maximum size is 5 MB",
      );

      renderComponent();
      await userEvent.click(screen.getByTestId("profile-picture-camera-btn"));

      const file = createMockFile("big.jpg", 6 * 1024 * 1024, "image/jpeg");
      const input = screen.getByTestId("profile-picture-file-input");
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByTestId("profile-picture-error")).toBeInTheDocument();
      });
    });

    it("allows choosing a different file via back button in crop step", async () => {
      renderComponent();

      await openDialogAndSelectFile();

      expect(screen.getByText("Adjust Your Photo")).toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: /choose different/i }));

      expect(screen.getByText("Update Profile Picture")).toBeInTheDocument();
      expect(screen.getByTestId("profile-picture-dropzone")).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // Drag and Drop
  // --------------------------------------------------------------------------
  describe("Drag and Drop", () => {
    it("shows drag state on dragover", async () => {
      renderComponent();

      await userEvent.click(screen.getByTestId("profile-picture-camera-btn"));

      const dropzone = screen.getByTestId("profile-picture-dropzone");

      fireEvent.dragOver(dropzone, {
        dataTransfer: { files: [] },
      });

      expect(screen.getByText("Drop your image here")).toBeInTheDocument();
    });

    it("removes drag state on dragleave", async () => {
      renderComponent();

      await userEvent.click(screen.getByTestId("profile-picture-camera-btn"));

      const dropzone = screen.getByTestId("profile-picture-dropzone");

      fireEvent.dragOver(dropzone, {
        dataTransfer: { files: [] },
      });
      expect(screen.getByText("Drop your image here")).toBeInTheDocument();

      fireEvent.dragLeave(dropzone, {
        dataTransfer: { files: [] },
      });
      expect(
        screen.getByText("Click to browse or drag an image"),
      ).toBeInTheDocument();
    });

    it("processes file on drop and transitions to crop step", async () => {
      renderComponent();

      await userEvent.click(screen.getByTestId("profile-picture-camera-btn"));

      const dropzone = screen.getByTestId("profile-picture-dropzone");
      const file = createMockFile("photo.jpg", 1024, "image/jpeg");

      fireEvent.drop(dropzone, {
        dataTransfer: { files: [file] },
      });

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(screen.getByText("Adjust Your Photo")).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // Crop Step
  // --------------------------------------------------------------------------
  describe("Crop Step", () => {
    it("shows image crop editor in crop step", async () => {
      renderComponent();

      await openDialogAndSelectFile();

      expect(screen.getByTestId("image-crop-editor")).toBeInTheDocument();
      expect(screen.getByText("Mock Crop Editor")).toBeInTheDocument();
    });

    it("shows crop preview comparison", async () => {
      renderComponent();

      await openDialogAndSelectFile();

      await waitFor(() => {
        expect(screen.getByTestId("crop-preview-comparison")).toBeInTheDocument();
      });
    });

    it("shows Save Photo button in crop step", async () => {
      renderComponent();

      await openDialogAndSelectFile();

      const saveBtn = screen.getByTestId("profile-picture-upload-btn");
      expect(saveBtn).toBeInTheDocument();
      expect(saveBtn).toHaveTextContent("Save Photo");
    });

    it("shows description about adjusting photo", async () => {
      renderComponent();

      await openDialogAndSelectFile();

      expect(screen.getByText(/Zoom and drag to adjust/)).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // Upload
  // --------------------------------------------------------------------------
  describe("Upload", () => {
    it("uploads file and calls onUploadComplete with cropped URL", async () => {
      const downloadURL =
        "https://firebasestorage.googleapis.com/uploaded.jpg";
      mockUploadProfilePicture.mockResolvedValue({
        downloadURL,
        storagePath: "profile-pictures/user123/avatar_123",
      });
      mockOnUploadComplete.mockResolvedValue(undefined);

      renderComponent();

      await openDialogAndSelectFile();

      const uploadBtn = screen.getByTestId("profile-picture-upload-btn");
      await userEvent.click(uploadBtn);

      await waitFor(() => {
        expect(mockUploadProfilePicture).toHaveBeenCalledWith(
          "user123",
          expect.any(File),
          expect.any(Function),
        );
        // Should use cropped URL, not raw download URL
        expect(mockOnUploadComplete).toHaveBeenCalledWith(MOCK_CROPPED_URL);
        expect(mockToast.success).toHaveBeenCalledWith(
          "Profile picture updated successfully!",
        );
      });
    });

    it("shows error toast on upload failure", async () => {
      mockUploadProfilePicture.mockRejectedValue(
        new Error("Storage quota exceeded"),
      );

      renderComponent();

      await openDialogAndSelectFile();

      const uploadBtn = screen.getByTestId("profile-picture-upload-btn");
      await userEvent.click(uploadBtn);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Storage quota exceeded");
      });
    });

    it("returns to crop step on upload failure", async () => {
      mockUploadProfilePicture.mockRejectedValue(
        new Error("Upload failed"),
      );

      renderComponent();

      await openDialogAndSelectFile();

      const uploadBtn = screen.getByTestId("profile-picture-upload-btn");
      await userEvent.click(uploadBtn);

      await waitFor(() => {
        expect(screen.getByText("Adjust Your Photo")).toBeInTheDocument();
        expect(screen.getByTestId("profile-picture-error")).toBeInTheDocument();
      });
    });
  });

  // --------------------------------------------------------------------------
  // Upload - edge cases
  // --------------------------------------------------------------------------
  describe("Upload Edge Cases", () => {
    it("does nothing when user is null", async () => {
      renderComponent(null);

      await openDialogAndSelectFile();

      const uploadBtn = screen.getByTestId("profile-picture-upload-btn");
      await userEvent.click(uploadBtn);

      expect(mockUploadProfilePicture).not.toHaveBeenCalled();
    });

    it("clears error when new valid file is selected", async () => {
      mockValidateProfileImage
        .mockReturnValueOnce("File must be JPEG, PNG, or WebP")
        .mockReturnValueOnce(null);

      renderComponent();
      await userEvent.click(screen.getByTestId("profile-picture-camera-btn"));

      const badFile = createMockFile("photo.gif", 1024, "image/gif");
      const input = screen.getByTestId("profile-picture-file-input");
      fireEvent.change(input, { target: { files: [badFile] } });

      await waitFor(() => {
        expect(screen.getByTestId("profile-picture-error")).toBeInTheDocument();
      });

      const goodFile = createMockFile("photo.jpg", 1024, "image/jpeg");
      fireEvent.change(input, { target: { files: [goodFile] } });

      await waitFor(() => {
        expect(screen.queryByTestId("profile-picture-error")).not.toBeInTheDocument();
      });
    });

    it("revokes old preview URL when new file is selected", async () => {
      renderComponent();
      await userEvent.click(screen.getByTestId("profile-picture-camera-btn"));

      const file1 = createMockFile("photo1.jpg", 1024, "image/jpeg");
      const input = screen.getByTestId("profile-picture-file-input");
      fireEvent.change(input, { target: { files: [file1] } });

      expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);

      // Go back and select new file
      await userEvent.click(screen.getByRole("button", { name: /choose different/i }));

      const file2 = createMockFile("photo2.jpg", 1024, "image/jpeg");
      fireEvent.change(input, { target: { files: [file2] } });

      expect(mockRevokeObjectURL).toHaveBeenCalled();
      expect(mockCreateObjectURL).toHaveBeenCalledTimes(2);
    });

    it("handles generic non-Error rejection during upload", async () => {
      mockUploadProfilePicture.mockRejectedValue("string error");

      renderComponent();

      await openDialogAndSelectFile();

      const uploadBtn = screen.getByTestId("profile-picture-upload-btn");
      await userEvent.click(uploadBtn);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          "Upload failed. Please try again.",
        );
      });
    });

    it("resets to select step after dialog is closed and reopened", async () => {
      renderComponent();

      await openDialogAndSelectFile();

      expect(screen.getByText("Adjust Your Photo")).toBeInTheDocument();

      // Close by choosing different then cancelling
      await userEvent.click(screen.getByRole("button", { name: /choose different/i }));
      await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

      await waitFor(() => {
        expect(screen.queryByText("Update Profile Picture")).not.toBeInTheDocument();
      });

      // Reopen dialog - should be fresh
      await userEvent.click(screen.getByTestId("profile-picture-camera-btn"));

      expect(screen.getByText("Update Profile Picture")).toBeInTheDocument();
      expect(screen.getByTestId("profile-picture-dropzone")).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // Remove Photo
  // --------------------------------------------------------------------------
  describe("Remove Photo", () => {
    it("calls onUploadComplete with empty string to remove photo", async () => {
      mockOnUploadComplete.mockResolvedValue(undefined);

      renderComponent({
        ...mockUser,
        photoURL: "data:image/jpeg;base64,/9j/customPhoto",
      });

      await userEvent.click(screen.getByTestId("profile-picture-camera-btn"));
      await userEvent.click(screen.getByText("Current Photo"));

      const removeBtn = screen.getByTestId("remove-photo-btn");
      await userEvent.click(removeBtn);

      await waitFor(() => {
        expect(mockOnUploadComplete).toHaveBeenCalledWith("");
        expect(mockToast.success).toHaveBeenCalledWith("Profile picture removed.");
      });
    });

    it("shows error toast when remove fails", async () => {
      mockOnUploadComplete.mockRejectedValue(new Error("Failed"));

      renderComponent({
        ...mockUser,
        photoURL: "data:image/jpeg;base64,/9j/customPhoto",
      });

      await userEvent.click(screen.getByTestId("profile-picture-camera-btn"));
      await userEvent.click(screen.getByText("Current Photo"));

      const removeBtn = screen.getByTestId("remove-photo-btn");
      await userEvent.click(removeBtn);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Failed to remove profile picture.");
      });
    });

    it("does not show remove button when user has no custom photo", async () => {
      renderComponent(mockUser);

      await userEvent.click(screen.getByTestId("profile-picture-camera-btn"));
      await userEvent.click(screen.getByText("Current Photo"));

      expect(screen.queryByTestId("remove-photo-btn")).not.toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // User avatar display
  // --------------------------------------------------------------------------
  describe("User Avatar", () => {
    it("shows user displayName in alt text", () => {
      renderComponent({
        ...mockUser,
        displayName: "Jane Doe",
      });

      const img = screen.getByAltText("Jane Doe profile picture");
      expect(img).toBeInTheDocument();
    });

    it("falls back to firstName when displayName is missing", () => {
      renderComponent({
        ...mockUser,
        displayName: undefined as unknown as string,
        firstName: "Jane",
      });

      const img = screen.getByAltText("Jane profile picture");
      expect(img).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // Accessibility
  // --------------------------------------------------------------------------
  describe("Accessibility", () => {
    it("camera button has aria-label", () => {
      renderComponent();

      const btn = screen.getByTestId("profile-picture-camera-btn");
      expect(btn).toHaveAttribute("aria-label", "Change profile picture");
    });

    it("overlay has aria-label and keyboard accessibility", () => {
      renderComponent();

      const overlay = screen.getByTestId("profile-picture-overlay");
      expect(overlay).toHaveAttribute("aria-label", "Change profile picture");
      expect(overlay).toHaveAttribute("role", "button");
      expect(overlay).toHaveAttribute("tabIndex", "0");
    });

    it("drop zone is keyboard accessible", async () => {
      renderComponent();

      await userEvent.click(screen.getByTestId("profile-picture-camera-btn"));

      const dropzone = screen.getByTestId("profile-picture-dropzone");
      expect(dropzone).toHaveAttribute("role", "button");
      expect(dropzone).toHaveAttribute("tabIndex", "0");
    });

    it("error message has alert role", async () => {
      mockValidateProfileImage.mockReturnValue("Invalid file");

      renderComponent();
      await userEvent.click(screen.getByTestId("profile-picture-camera-btn"));

      const file = createMockFile("bad.gif", 1024, "image/gif");
      const input = screen.getByTestId("profile-picture-file-input");
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        const err = screen.getByTestId("profile-picture-error");
        expect(err).toHaveAttribute("role", "alert");
      });
    });

    it("dialog has descriptive title and description", async () => {
      renderComponent();
      await userEvent.click(screen.getByTestId("profile-picture-camera-btn"));

      expect(screen.getByText("Update Profile Picture")).toBeInTheDocument();
      expect(screen.getByText(/Max size: 5 MB/)).toBeInTheDocument();
    });

    it("file input is hidden", async () => {
      renderComponent();
      await userEvent.click(screen.getByTestId("profile-picture-camera-btn"));

      const input = screen.getByTestId("profile-picture-file-input");
      expect(input).toHaveClass("hidden");
    });
  });
});
