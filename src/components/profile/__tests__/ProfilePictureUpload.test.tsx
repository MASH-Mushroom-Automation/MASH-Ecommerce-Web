/**
 * ProfilePictureUpload Component Tests
 *
 * Test categories:
 * 1. Rendering: Avatar display, camera button
 * 2. Dialog: Open/close, drop zone, preview
 * 3. File selection: Valid files, invalid files, drag and drop
 * 4. Upload: Progress, success, failure
 * 5. Accessibility: ARIA labels, keyboard navigation
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

// Mock Next.js Image
jest.mock("next/image", () => ({
  __esModule: true,
  default: function MockImage(props: Record<string, unknown>) {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock sonner
const mockToastSuccess = jest.fn();
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

    it("shows accepted formats and max size in description", async () => {
      renderComponent();

      await userEvent.click(screen.getByTestId("profile-picture-camera-btn"));

      expect(screen.getByText(/JPEG, PNG, WebP/)).toBeInTheDocument();
      expect(screen.getByText(/Max size: 5 MB/)).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // File Selection
  // --------------------------------------------------------------------------
  describe("File Selection", () => {
    it("shows preview after selecting a valid file", async () => {
      renderComponent();

      await userEvent.click(screen.getByTestId("profile-picture-camera-btn"));

      const file = createMockFile("photo.jpg", 1024, "image/jpeg");
      const input = screen.getByTestId("profile-picture-file-input");

      fireEvent.change(input, { target: { files: [file] } });

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(screen.getByAltText("Preview")).toBeInTheDocument();
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

    it("allows removing selected file", async () => {
      renderComponent();

      await userEvent.click(screen.getByTestId("profile-picture-camera-btn"));

      const file = createMockFile("photo.jpg", 1024, "image/jpeg");
      const input = screen.getByTestId("profile-picture-file-input");
      fireEvent.change(input, { target: { files: [file] } });

      expect(screen.getByAltText("Preview")).toBeInTheDocument();

      const removeBtn = screen.getByTestId("profile-picture-remove-btn");
      await userEvent.click(removeBtn);

      expect(screen.queryByAltText("Preview")).not.toBeInTheDocument();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
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

      expect(screen.getByText("Drop image here")).toBeInTheDocument();
    });

    it("removes drag state on dragleave", async () => {
      renderComponent();

      await userEvent.click(screen.getByTestId("profile-picture-camera-btn"));

      const dropzone = screen.getByTestId("profile-picture-dropzone");

      fireEvent.dragOver(dropzone, {
        dataTransfer: { files: [] },
      });
      expect(screen.getByText("Drop image here")).toBeInTheDocument();

      fireEvent.dragLeave(dropzone, {
        dataTransfer: { files: [] },
      });
      expect(
        screen.getByText("Click or drag an image here"),
      ).toBeInTheDocument();
    });

    it("processes file on drop", async () => {
      renderComponent();

      await userEvent.click(screen.getByTestId("profile-picture-camera-btn"));

      const dropzone = screen.getByTestId("profile-picture-dropzone");
      const file = createMockFile("photo.jpg", 1024, "image/jpeg");

      fireEvent.drop(dropzone, {
        dataTransfer: { files: [file] },
      });

      expect(mockCreateObjectURL).toHaveBeenCalled();
    });
  });

  // --------------------------------------------------------------------------
  // Upload
  // --------------------------------------------------------------------------
  describe("Upload", () => {
    it("uploads file and calls onUploadComplete on success", async () => {
      const downloadURL =
        "https://firebasestorage.googleapis.com/uploaded.jpg";
      mockUploadProfilePicture.mockResolvedValue({
        downloadURL,
        storagePath: "profile-pictures/user123/avatar_123",
      });
      mockOnUploadComplete.mockResolvedValue(undefined);

      renderComponent();

      await userEvent.click(screen.getByTestId("profile-picture-camera-btn"));

      const file = createMockFile("photo.jpg", 1024, "image/jpeg");
      const input = screen.getByTestId("profile-picture-file-input");
      fireEvent.change(input, { target: { files: [file] } });

      const uploadBtn = screen.getByTestId("profile-picture-upload-btn");
      await userEvent.click(uploadBtn);

      await waitFor(() => {
        expect(mockUploadProfilePicture).toHaveBeenCalledWith(
          "user123",
          file,
          expect.any(Function),
        );
        expect(mockOnUploadComplete).toHaveBeenCalledWith(downloadURL);
        expect(mockToast.success).toHaveBeenCalledWith(
          "Profile picture updated!",
        );
      });
    });

    it("shows error toast on upload failure", async () => {
      mockUploadProfilePicture.mockRejectedValue(
        new Error("Storage quota exceeded"),
      );

      renderComponent();

      await userEvent.click(screen.getByTestId("profile-picture-camera-btn"));

      const file = createMockFile("photo.jpg", 1024, "image/jpeg");
      const input = screen.getByTestId("profile-picture-file-input");
      fireEvent.change(input, { target: { files: [file] } });

      const uploadBtn = screen.getByTestId("profile-picture-upload-btn");
      await userEvent.click(uploadBtn);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Storage quota exceeded");
      });
    });

    it("disables upload button when no file is selected", async () => {
      renderComponent();

      await userEvent.click(screen.getByTestId("profile-picture-camera-btn"));

      const uploadBtn = screen.getByTestId("profile-picture-upload-btn");
      expect(uploadBtn).toBeDisabled();
    });

    it("disables buttons during upload", async () => {
      // Make upload hang indefinitely
      mockUploadProfilePicture.mockReturnValue(new Promise(() => {}));

      renderComponent();

      await userEvent.click(screen.getByTestId("profile-picture-camera-btn"));

      const file = createMockFile("photo.jpg", 1024, "image/jpeg");
      const input = screen.getByTestId("profile-picture-file-input");
      fireEvent.change(input, { target: { files: [file] } });

      const uploadBtn = screen.getByTestId("profile-picture-upload-btn");
      await userEvent.click(uploadBtn);

      await waitFor(() => {
        expect(uploadBtn).toBeDisabled();
        expect(screen.getByText("Uploading...")).toBeInTheDocument();
      });
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
  });
});
