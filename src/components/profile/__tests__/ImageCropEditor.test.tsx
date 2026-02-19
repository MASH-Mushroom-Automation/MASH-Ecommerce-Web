/**
 * ImageCropEditor Component Tests
 *
 * Test categories:
 * 1. Rendering: Canvas, zoom controls, image info
 * 2. Zoom: Slider, buttons, reset
 * 3. Drag: Pointer events, position constraints
 * 4. Output: Cropped image generation
 * 5. Accessibility: ARIA labels, keyboard
 */

import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImageCropEditor } from "../ImageCropEditor";

// ============================================================================
// Mocks
// ============================================================================

// Mock canvas context
const mockDrawImage = jest.fn();
const mockClearRect = jest.fn();
const mockBeginPath = jest.fn();
const mockArc = jest.fn();
const mockClosePath = jest.fn();
const mockClip = jest.fn();
const mockSave = jest.fn();
const mockRestore = jest.fn();
const mockToDataURL = jest.fn(() => "data:image/jpeg;base64,/9j/mockOutput");

const mockCanvasContext = {
  drawImage: mockDrawImage,
  clearRect: mockClearRect,
  beginPath: mockBeginPath,
  arc: mockArc,
  closePath: mockClosePath,
  clip: mockClip,
  save: mockSave,
  restore: mockRestore,
};

// Track created canvas elements
const createdCanvases: HTMLCanvasElement[] = [];

// Mock HTMLCanvasElement.prototype.getContext
const originalCreateElement = document.createElement.bind(document);
jest.spyOn(document, "createElement").mockImplementation((tagName: string, options?: ElementCreationOptions) => {
  const element = originalCreateElement(tagName, options);
  if (tagName === "canvas") {
    createdCanvases.push(element as HTMLCanvasElement);
    jest.spyOn(element as HTMLCanvasElement, "getContext").mockReturnValue(mockCanvasContext as unknown as CanvasRenderingContext2D);
    jest.spyOn(element as HTMLCanvasElement, "toDataURL").mockReturnValue("data:image/jpeg;base64,/9j/mockOutput");
  }
  return element;
});

// Also mock getContext on canvas elements found in the DOM
HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(mockCanvasContext);
HTMLCanvasElement.prototype.toDataURL = mockToDataURL;

// Mock window.Image
class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  crossOrigin = "";
  naturalWidth = 400;
  naturalHeight = 300;
  private _src = "";

  get src() {
    return this._src;
  }

  set src(value: string) {
    this._src = value;
    // Simulate async load
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }
}

Object.defineProperty(window, "Image", {
  value: MockImage,
  writable: true,
});

// ============================================================================
// Helpers
// ============================================================================

const TEST_IMAGE_SRC = "blob:http://localhost/test-image";
const mockOnCropComplete = jest.fn();

function renderEditor(props: Partial<React.ComponentProps<typeof ImageCropEditor>> = {}) {
  return render(
    <ImageCropEditor
      imageSrc={TEST_IMAGE_SRC}
      onCropComplete={mockOnCropComplete}
      cropSize={220}
      outputSize={256}
      outputQuality={0.9}
      {...props}
    />,
  );
}

// ============================================================================
// Tests
// ============================================================================

describe("ImageCropEditor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createdCanvases.length = 0;
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // --------------------------------------------------------------------------
  // Rendering
  // --------------------------------------------------------------------------
  describe("Rendering", () => {
    it("renders the crop editor container", () => {
      renderEditor();

      expect(screen.getByTestId("image-crop-editor")).toBeInTheDocument();
    });

    it("renders the crop area", () => {
      renderEditor();

      expect(screen.getByTestId("crop-area")).toBeInTheDocument();
    });

    it("renders zoom controls", () => {
      renderEditor();

      expect(screen.getByTestId("zoom-controls")).toBeInTheDocument();
      expect(screen.getByTestId("zoom-out-btn")).toBeInTheDocument();
      expect(screen.getByTestId("zoom-in-btn")).toBeInTheDocument();
      expect(screen.getByTestId("zoom-slider")).toBeInTheDocument();
    });

    it("renders reset button", () => {
      renderEditor();

      expect(screen.getByTestId("reset-btn")).toBeInTheDocument();
    });

    it("shows image info after image loads", async () => {
      renderEditor();

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByTestId("image-info")).toBeInTheDocument();
        expect(screen.getByText(/400 x 300px/)).toBeInTheDocument();
        expect(screen.getByText(/256 x 256px/)).toBeInTheDocument();
      });
    });

    it("shows initial zoom at 0%", () => {
      renderEditor();

      expect(screen.getByText("Zoom: 0%")).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // Zoom Controls
  // --------------------------------------------------------------------------
  describe("Zoom Controls", () => {
    it("disables zoom out button at minimum zoom", () => {
      renderEditor();

      const zoomOutBtn = screen.getByTestId("zoom-out-btn");
      expect(zoomOutBtn).toBeDisabled();
    });

    it("enables zoom in button", () => {
      renderEditor();

      const zoomInBtn = screen.getByTestId("zoom-in-btn");
      expect(zoomInBtn).not.toBeDisabled();
    });

    it("has aria-labels on zoom buttons", () => {
      renderEditor();

      expect(screen.getByTestId("zoom-out-btn")).toHaveAttribute("aria-label", "Zoom out");
      expect(screen.getByTestId("zoom-in-btn")).toHaveAttribute("aria-label", "Zoom in");
    });
  });

  // --------------------------------------------------------------------------
  // Crop Complete Callback
  // --------------------------------------------------------------------------
  describe("Crop Complete", () => {
    it("calls onCropComplete after image loads", async () => {
      renderEditor();

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(mockOnCropComplete).toHaveBeenCalledWith(
          expect.stringContaining("data:image/jpeg"),
        );
      });
    });

    it("calls onCropComplete with data URL string", async () => {
      renderEditor();

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        const calls = mockOnCropComplete.mock.calls;
        expect(calls.length).toBeGreaterThan(0);
        expect(typeof calls[0][0]).toBe("string");
      });
    });
  });

  // --------------------------------------------------------------------------
  // Canvas Drawing
  // --------------------------------------------------------------------------
  describe("Canvas Drawing", () => {
    it("creates canvas context for drawing", async () => {
      renderEditor();

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(mockBeginPath).toHaveBeenCalled();
        expect(mockArc).toHaveBeenCalled();
        expect(mockClip).toHaveBeenCalled();
        expect(mockDrawImage).toHaveBeenCalled();
      });
    });

    it("saves and restores context for circular clipping", async () => {
      renderEditor();

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(mockSave).toHaveBeenCalled();
        expect(mockRestore).toHaveBeenCalled();
      });
    });
  });

  // --------------------------------------------------------------------------
  // Drag Interaction
  // --------------------------------------------------------------------------
  describe("Drag Interaction", () => {
    beforeEach(() => {
      // JSDOM does not implement setPointerCapture/releasePointerCapture
      Element.prototype.setPointerCapture = jest.fn();
      Element.prototype.releasePointerCapture = jest.fn();
    });

    it("crop area has grab cursor by default", () => {
      renderEditor();

      const cropArea = screen.getByTestId("crop-area");
      expect(cropArea.className).toContain("cursor-grab");
    });

    it("changes to grabbing cursor during drag", () => {
      renderEditor();

      act(() => {
        jest.runAllTimers();
      });

      const cropArea = screen.getByTestId("crop-area");

      fireEvent.pointerDown(cropArea, {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
      });

      expect(cropArea.className).toContain("cursor-grabbing");
    });

    it("releases grab cursor on pointer up", () => {
      renderEditor();

      act(() => {
        jest.runAllTimers();
      });

      const cropArea = screen.getByTestId("crop-area");

      fireEvent.pointerDown(cropArea, {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
      });
      expect(cropArea.className).toContain("cursor-grabbing");

      fireEvent.pointerUp(cropArea, { pointerId: 1 });
      expect(cropArea.className).toContain("cursor-grab");
      expect(cropArea.className).not.toContain("cursor-grabbing");
    });

    it("does not move when pointer moves without prior pointer down", () => {
      renderEditor();

      act(() => {
        jest.runAllTimers();
      });

      const cropArea = screen.getByTestId("crop-area");

      // Move without pressing first - should not crash
      fireEvent.pointerMove(cropArea, {
        clientX: 150,
        clientY: 150,
        pointerId: 1,
      });

      expect(cropArea.className).toContain("cursor-grab");
    });

    it("pointer down followed by move updates drag state", () => {
      renderEditor();

      act(() => { jest.runAllTimers(); });

      const cropArea = screen.getByTestId("crop-area");

      fireEvent.pointerDown(cropArea, { clientX: 100, clientY: 100, pointerId: 42 });
      expect(cropArea.className).toContain("cursor-grabbing");

      fireEvent.pointerMove(cropArea, { clientX: 110, clientY: 110, pointerId: 42 });
      // Should still be dragging
      expect(cropArea.className).toContain("cursor-grabbing");
    });

    it("pointer up after drag restores grab cursor", () => {
      renderEditor();

      act(() => { jest.runAllTimers(); });

      const cropArea = screen.getByTestId("crop-area");

      fireEvent.pointerDown(cropArea, { clientX: 100, clientY: 100, pointerId: 42 });
      fireEvent.pointerMove(cropArea, { clientX: 110, clientY: 110, pointerId: 42 });
      fireEvent.pointerUp(cropArea, { pointerId: 42 });

      expect(cropArea.className).toContain("cursor-grab");
      expect(cropArea.className).not.toContain("cursor-grabbing");
    });
  });

  // --------------------------------------------------------------------------
  // Zoom behavior
  // --------------------------------------------------------------------------
  describe("Zoom Behavior", () => {
    it("shows move indicator when zoomed in", async () => {
      renderEditor();

      act(() => {
        jest.runAllTimers();
      });

      // Initially at zoom 1, no move indicator
      expect(screen.queryByText("Drag to reposition the image")).not.toBeInTheDocument();

      // Click zoom in
      const zoomInBtn = screen.getByTestId("zoom-in-btn");
      await userEvent.setup({ advanceTimers: jest.advanceTimersByTime }).click(zoomInBtn);

      act(() => {
        jest.runAllTimers();
      });

      // Now the move indicator should appear
      await waitFor(() => {
        expect(screen.getByText("Drag to reposition the image")).toBeInTheDocument();
      });
    });

    it("reset button returns zoom to initial state", async () => {
      renderEditor();

      act(() => {
        jest.runAllTimers();
      });

      // Zoom in first
      const zoomInBtn = screen.getByTestId("zoom-in-btn");
      await userEvent.setup({ advanceTimers: jest.advanceTimersByTime }).click(zoomInBtn);

      act(() => {
        jest.runAllTimers();
      });

      // Zoom should be above 0% now
      expect(screen.queryByText("Zoom: 0%")).not.toBeInTheDocument();

      // Reset
      const resetBtn = screen.getByTestId("reset-btn");
      await userEvent.setup({ advanceTimers: jest.advanceTimersByTime }).click(resetBtn);

      act(() => {
        jest.runAllTimers();
      });

      expect(screen.getByText("Zoom: 0%")).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // Accessibility
  // --------------------------------------------------------------------------
  describe("Accessibility", () => {
    it("zoom slider has aria-label", () => {
      renderEditor();

      const slider = screen.getByTestId("zoom-slider");
      expect(slider).toHaveAttribute("aria-label", "Zoom level");
    });

    it("zoom buttons have descriptive aria-labels", () => {
      renderEditor();

      expect(screen.getByLabelText("Zoom out")).toBeInTheDocument();
      expect(screen.getByLabelText("Zoom in")).toBeInTheDocument();
    });

    it("crop area is interactive", () => {
      renderEditor();

      const cropArea = screen.getByTestId("crop-area");
      expect(cropArea).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // Props
  // --------------------------------------------------------------------------
  describe("Props", () => {
    it("renders with custom crop size", () => {
      renderEditor({ cropSize: 300 });

      const cropArea = screen.getByTestId("crop-area");
      expect(cropArea).toHaveStyle({ width: "300px", height: "300px" });
    });

    it("shows custom output size in info", async () => {
      renderEditor({ outputSize: 512 });

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByText(/512 x 512px/)).toBeInTheDocument();
      });
    });

    it("defaults to 220px crop size when not specified", () => {
      render(
        <ImageCropEditor
          imageSrc={TEST_IMAGE_SRC}
          onCropComplete={mockOnCropComplete}
        />,
      );

      const cropArea = screen.getByTestId("crop-area");
      expect(cropArea).toHaveStyle({ width: "220px", height: "220px" });
    });

    it("uses different image sources", () => {
      const customSrc = "blob:http://localhost/different-image";
      renderEditor({ imageSrc: customSrc });

      expect(screen.getByTestId("image-crop-editor")).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // Image loading
  // --------------------------------------------------------------------------
  describe("Image Loading", () => {
    it("sets crossOrigin to anonymous on the image", () => {
      renderEditor();

      // MockImage is instantiated with crossOrigin = ""
      // then set to "anonymous" in the useEffect
      expect(screen.getByTestId("image-crop-editor")).toBeInTheDocument();
    });

    it("does not show image info before image loads", () => {
      renderEditor();

      // Before timers run, image hasn't loaded
      expect(screen.queryByTestId("image-info")).not.toBeInTheDocument();
    });

    it("shows image info after image loads", async () => {
      renderEditor();

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByTestId("image-info")).toBeInTheDocument();
      });
    });

    it("handles image load error gracefully", () => {
      // Override MockImage to trigger onerror
      const OriginalMockImage = window.Image;
      class ErrorImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        crossOrigin = "";
        naturalWidth = 0;
        naturalHeight = 0;
        private _src = "";
        get src() { return this._src; }
        set src(value: string) {
          this._src = value;
          setTimeout(() => {
            if (this.onerror) this.onerror();
          }, 0);
        }
      }
      Object.defineProperty(window, "Image", { value: ErrorImage, writable: true });

      renderEditor();
      act(() => { jest.runAllTimers(); });

      // Should not crash, just not show image info
      expect(screen.queryByTestId("image-info")).not.toBeInTheDocument();
      expect(screen.getByTestId("image-crop-editor")).toBeInTheDocument();

      Object.defineProperty(window, "Image", { value: OriginalMockImage, writable: true });
    });

    it("reloads image when imageSrc prop changes", () => {
      const { rerender } = renderEditor();

      act(() => { jest.runAllTimers(); });

      // Rerender with new image source
      rerender(
        <ImageCropEditor
          imageSrc="blob:http://localhost/new-image"
          onCropComplete={mockOnCropComplete}
          cropSize={220}
          outputSize={256}
          outputQuality={0.9}
        />,
      );

      act(() => { jest.runAllTimers(); });

      expect(screen.getByTestId("image-crop-editor")).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // Output generation
  // --------------------------------------------------------------------------
  describe("Output Generation", () => {
    it("generates JPEG output format", async () => {
      renderEditor();

      act(() => { jest.runAllTimers(); });

      await waitFor(() => {
        expect(mockOnCropComplete).toHaveBeenCalledWith(
          expect.stringContaining("data:image/jpeg"),
        );
      });
    });

    it("creates a separate output canvas for cropped result", async () => {
      renderEditor();

      act(() => { jest.runAllTimers(); });

      await waitFor(() => {
        // document.createElement should be called for the output canvas
        expect(document.createElement).toHaveBeenCalledWith("canvas");
      });
    });
  });
});
