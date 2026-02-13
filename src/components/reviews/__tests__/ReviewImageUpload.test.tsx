/**
 * ReviewImageUpload Component Tests
 *
 * Tests the Cloudinary drag-and-drop image upload component.
 * Covers file validation, upload flow, remove, and error states.
 */

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewImageUpload } from "../ReviewImageUpload";

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />;
  },
}));

const { toast } = jest.requireMock("sonner");

describe("ReviewImageUpload", () => {
  const onChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset fetch mock for each test (polyfilled by jest.setupMocks.js)
    if (global.fetch && typeof (global.fetch as jest.Mock).mockReset === "function") {
      (global.fetch as jest.Mock).mockReset();
    }
    // Re-setup fetch mock
    (global.fetch as jest.Mock) = jest.fn();
    // Mock URL.createObjectURL / revokeObjectURL (not available in jsdom)
    global.URL.createObjectURL = jest.fn(() => "blob:mock-preview-url");
    global.URL.revokeObjectURL = jest.fn();
  });

  function renderUpload(
    images: string[] = [],
    disabled = false,
  ) {
    return render(
      <ReviewImageUpload
        images={images}
        onChange={onChange}
        disabled={disabled}
      />,
    );
  }

  describe("rendering", () => {
    it("shows drop zone when no images and not disabled", () => {
      renderUpload();
      expect(screen.getByText(/drag & drop photos/i)).toBeInTheDocument();
      expect(screen.getByText(/max 5 images/i)).toBeInTheDocument();
    });

    it("shows file input with correct accept types", () => {
      renderUpload();
      const input = screen.getByLabelText(/upload review images/i);
      expect(input).toHaveAttribute("accept", "image/jpeg,image/png,image/webp");
    });

    it("hides drop zone when disabled", () => {
      renderUpload([], true);
      expect(screen.queryByText(/drag & drop photos/i)).not.toBeInTheDocument();
    });

    it("shows uploaded image count", () => {
      renderUpload(["https://example.com/img1.jpg", "https://example.com/img2.jpg"]);
      expect(screen.getByText("2/5 photos uploaded")).toBeInTheDocument();
    });

    it("hides drop zone when max images reached", () => {
      const fiveImages = Array.from({ length: 5 }, (_, i) => `https://example.com/img${i}.jpg`);
      renderUpload(fiveImages);
      expect(screen.queryByText(/drag & drop photos/i)).not.toBeInTheDocument();
    });

    it("renders uploaded image thumbnails", () => {
      renderUpload(["https://example.com/img1.jpg"]);
      const img = screen.getByAltText("Review photo 1");
      expect(img).toBeInTheDocument();
    });

    it("shows remove button on uploaded images", () => {
      renderUpload(["https://example.com/img1.jpg"]);
      expect(screen.getByLabelText("Remove image 1")).toBeInTheDocument();
    });
  });

  describe("remove image", () => {
    it("calls onChange without the removed image", async () => {
      const user = userEvent.setup();
      renderUpload(["https://example.com/img1.jpg", "https://example.com/img2.jpg"]);

      await user.click(screen.getByLabelText("Remove image 1"));

      expect(onChange).toHaveBeenCalledWith(["https://example.com/img2.jpg"]);
    });
  });

  describe("file validation", () => {
    it("rejects files that exceed 2MB", async () => {
      const user = userEvent.setup();
      renderUpload();

      const largeFile = new File(["a".repeat(3 * 1024 * 1024)], "large.jpg", {
        type: "image/jpeg",
      });

      const input = screen.getByLabelText(/upload review images/i);
      await user.upload(input, largeFile);

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining("under 2MB"),
      );
    });

    it("rejects unsupported file types", async () => {
      renderUpload();

      const gifFile = new File(["gif content"], "image.gif", {
        type: "image/gif",
      });

      // Use fireEvent.change directly because userEvent.upload respects the
      // accept attribute and silently filters non-matching files in jsdom
      const input = screen.getByLabelText(/upload review images/i);
      fireEvent.change(input, { target: { files: [gifFile] } });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining("Only JPG, PNG, and WebP"),
        );
      });
    });

    it("rejects when exceeding remaining slots", async () => {
      const user = userEvent.setup();
      renderUpload(["https://example.com/img1.jpg", "https://example.com/img2.jpg", "https://example.com/img3.jpg", "https://example.com/img4.jpg"]);

      const file1 = new File(["a"], "a.jpg", { type: "image/jpeg" });
      const file2 = new File(["b"], "b.jpg", { type: "image/jpeg" });

      const input = screen.getByLabelText(/upload review images/i);
      await user.upload(input, [file1, file2]);

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining("1 more image"),
      );
    });
  });

  describe("upload flow", () => {
    it("uploads valid file to Cloudinary", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ secure_url: "https://cloudinary.com/uploaded.jpg" }),
      });

      renderUpload();

      const file = new File(["image data"], "photo.jpg", { type: "image/jpeg" });
      const input = screen.getByLabelText(/upload review images/i);
      await user.upload(input, file);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("cloudinary.com"),
          expect.objectContaining({ method: "POST" }),
        );
      });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(["https://cloudinary.com/uploaded.jpg"]);
      });
    });
  });
});
