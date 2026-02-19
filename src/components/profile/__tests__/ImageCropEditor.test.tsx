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
    it("crop area has grab cursor by default", () => {
      renderEditor();

      const cropArea = screen.getByTestId("crop-area");
      expect(cropArea.className).toContain("cursor-grab");
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
  });
});
