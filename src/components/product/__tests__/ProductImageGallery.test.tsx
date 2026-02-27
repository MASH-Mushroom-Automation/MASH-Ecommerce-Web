/**
 * ProductImageGallery Component Tests
 *
 * Covers: main image rendering, thumbnails, navigation arrows, thumbnail click,
 * keyboard navigation, zoom indicators, lightbox, video items, empty state,
 * image counter, active thumbnail styling, and alt text.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductImageGallery } from "../ProductImageGallery";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    const { fill, priority, sizes, onLoad, ...rest } = props;
    return (
      // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
      <img
        {...rest}
        data-fill={fill ? "true" : undefined}
        data-priority={priority ? "true" : undefined}
        data-sizes={sizes}
        onLoad={onLoad}
      />
    );
  },
}));

// Mock Dialog to render children directly (avoids Radix portal issues in jsdom)
jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ open, children }: any) =>
    open ? <div data-testid="lightbox-dialog">{children}</div> : null,
  DialogContent: ({ children, className }: any) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface GalleryItem {
  type: "image" | "video";
  url: string;
  thumbnailUrl?: string;
  videoId?: string;
  videoSource?: "youtube" | "vimeo" | "file";
  alt?: string;
  title?: string;
  isPrimary?: boolean;
}

const PRODUCT_NAME = "Fresh Oyster Mushrooms";

/**
 * Items WITHOUT custom alt so the component uses its defaults:
 *   - Main image alt -> productName ("Fresh Oyster Mushrooms")
 *   - Thumbnail alt  -> `${productName} - Image ${idx+1}`
 * This avoids duplicate alt text collisions between main + thumbnail.
 */
const singleImage: GalleryItem[] = [
  { type: "image", url: "https://cdn.example.com/img1.jpg" },
];

const multipleImages: GalleryItem[] = [
  { type: "image", url: "https://cdn.example.com/img1.jpg" },
  { type: "image", url: "https://cdn.example.com/img2.jpg" },
  { type: "image", url: "https://cdn.example.com/img3.jpg" },
];

const mixedItems: GalleryItem[] = [
  { type: "image", url: "https://cdn.example.com/img1.jpg" },
  {
    type: "video",
    url: "https://cdn.example.com/video.mp4",
    videoSource: "youtube",
    videoId: "abc123",
    title: "Product Video",
    thumbnailUrl: "https://cdn.example.com/video-thumb.jpg",
  },
  { type: "image", url: "https://cdn.example.com/img2.jpg" },
];

/** Helper: get the main (large) image rendered in the top display area. */
function getMainImage() {
  // The main image has data-sizes="(max-width: 768px) 100vw, 50vw" and data-priority
  const images = screen.getAllByRole("img");
  return images.find(
    (img) => img.getAttribute("data-sizes") === "(max-width: 768px) 100vw, 50vw"
  )!;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ProductImageGallery", () => {
  // 1. Main image renders with correct src
  it("renders the main image with the correct src", () => {
    render(
      <ProductImageGallery items={singleImage} productName={PRODUCT_NAME} />
    );

    const mainImg = getMainImage();
    expect(mainImg).toBeInTheDocument();
    expect(mainImg).toHaveAttribute("src", "https://cdn.example.com/img1.jpg");
  });

  // 2. Main image uses productName as alt when item.alt is not set
  it("uses productName as alt text when item.alt is not provided", () => {
    render(
      <ProductImageGallery items={singleImage} productName={PRODUCT_NAME} />
    );

    const mainImg = getMainImage();
    expect(mainImg).toHaveAttribute("alt", PRODUCT_NAME);
  });

  // 3. Main image uses custom alt when item.alt IS set
  it("uses item.alt as main image alt text when provided", () => {
    const items: GalleryItem[] = [
      { type: "image", url: "https://cdn.example.com/img1.jpg", alt: "Custom Alt" },
    ];
    render(
      <ProductImageGallery items={items} productName={PRODUCT_NAME} />
    );

    const mainImg = getMainImage();
    expect(mainImg).toHaveAttribute("alt", "Custom Alt");
  });

  // 4. Renders thumbnail images when multiple items
  it("renders thumbnail buttons for each item when multiple items provided", () => {
    render(
      <ProductImageGallery items={multipleImages} productName={PRODUCT_NAME} />
    );

    // Thumbnails use alt format: `${productName} - Image ${idx+1}`
    expect(
      screen.getByAltText(`${PRODUCT_NAME} - Image 1`)
    ).toBeInTheDocument();
    expect(
      screen.getByAltText(`${PRODUCT_NAME} - Image 2`)
    ).toBeInTheDocument();
    expect(
      screen.getByAltText(`${PRODUCT_NAME} - Image 3`)
    ).toBeInTheDocument();
  });

  // 5. No thumbnails rendered for a single image
  it("does not render thumbnails when only one item is provided", () => {
    render(
      <ProductImageGallery items={singleImage} productName={PRODUCT_NAME} />
    );

    // Only the main image should exist - no thumbnail row
    const allImages = screen.getAllByRole("img");
    expect(allImages).toHaveLength(1);
  });

  // 6. Clicking a thumbnail changes the main image
  it("changes the main image when a thumbnail is clicked", () => {
    render(
      <ProductImageGallery items={multipleImages} productName={PRODUCT_NAME} />
    );

    // Initially, main image src should be img1
    expect(getMainImage()).toHaveAttribute(
      "src",
      "https://cdn.example.com/img1.jpg"
    );

    // Click the second thumbnail
    const thumb2 = screen.getByAltText(`${PRODUCT_NAME} - Image 2`);
    fireEvent.click(thumb2.closest("button")!);

    // Now the main image should show img2
    expect(getMainImage()).toHaveAttribute(
      "src",
      "https://cdn.example.com/img2.jpg"
    );
  });

  // 7. Empty items shows fallback
  it('displays "No Image Available" fallback when items array is empty', () => {
    render(<ProductImageGallery items={[]} productName={PRODUCT_NAME} />);

    expect(screen.getByText("No Image Available")).toBeInTheDocument();
  });

  // 8. Navigation arrows present when multiple images
  it("shows previous and next navigation arrows when multiple items exist", () => {
    render(
      <ProductImageGallery items={multipleImages} productName={PRODUCT_NAME} />
    );

    expect(screen.getByLabelText("Previous image")).toBeInTheDocument();
    expect(screen.getByLabelText("Next image")).toBeInTheDocument();
  });

  // 9. No navigation arrows with a single image
  it("does not show navigation arrows when only one item exists", () => {
    render(
      <ProductImageGallery items={singleImage} productName={PRODUCT_NAME} />
    );

    expect(screen.queryByLabelText("Previous image")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Next image")).not.toBeInTheDocument();
  });

  // 10. Next arrow advances to next image
  it("advances to the next image when the next arrow is clicked", () => {
    render(
      <ProductImageGallery items={multipleImages} productName={PRODUCT_NAME} />
    );

    fireEvent.click(screen.getByLabelText("Next image"));

    expect(getMainImage()).toHaveAttribute(
      "src",
      "https://cdn.example.com/img2.jpg"
    );
  });

  // 11. Prev arrow wraps to last image when on first
  it("wraps to the last image when previous is clicked on the first image", () => {
    render(
      <ProductImageGallery items={multipleImages} productName={PRODUCT_NAME} />
    );

    fireEvent.click(screen.getByLabelText("Previous image"));

    expect(getMainImage()).toHaveAttribute(
      "src",
      "https://cdn.example.com/img3.jpg"
    );
  });

  // 12. Keyboard navigation (ArrowRight / ArrowLeft)
  it("navigates images via ArrowLeft and ArrowRight keyboard keys", () => {
    render(
      <ProductImageGallery items={multipleImages} productName={PRODUCT_NAME} />
    );

    // ArrowRight -> advance to img2
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(getMainImage()).toHaveAttribute(
      "src",
      "https://cdn.example.com/img2.jpg"
    );

    // ArrowLeft -> back to img1
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(getMainImage()).toHaveAttribute(
      "src",
      "https://cdn.example.com/img1.jpg"
    );
  });

  // 13. Active thumbnail has distinct styling (border-primary + ring)
  it("applies active styling to the selected thumbnail", () => {
    render(
      <ProductImageGallery items={multipleImages} productName={PRODUCT_NAME} />
    );

    // First thumbnail (index 0) should be active
    const firstThumbImg = screen.getByAltText(`${PRODUCT_NAME} - Image 1`);
    const firstThumbButton = firstThumbImg.closest("button")!;
    expect(firstThumbButton.className).toContain("border-primary");
    expect(firstThumbButton.className).toContain("ring-2");

    // Second thumbnail should NOT have active styling
    const secondThumbImg = screen.getByAltText(`${PRODUCT_NAME} - Image 2`);
    const secondThumbButton = secondThumbImg.closest("button")!;
    expect(secondThumbButton.className).toContain("border-transparent");
    expect(secondThumbButton.className).not.toContain("ring-2");
  });

  // 14. Image counter displays correctly
  it("displays image counter showing current position and total", () => {
    render(
      <ProductImageGallery items={multipleImages} productName={PRODUCT_NAME} />
    );

    expect(screen.getByText("1 / 3")).toBeInTheDocument();

    // Navigate to next
    fireEvent.click(screen.getByLabelText("Next image"));
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
  });

  // 15. No image counter for single image
  it("does not display an image counter for a single item", () => {
    render(
      <ProductImageGallery items={singleImage} productName={PRODUCT_NAME} />
    );

    expect(screen.queryByText(/\d+ \/ \d+/)).not.toBeInTheDocument();
  });

  // 16. Video item renders thumbnail with play overlay
  it("renders a video thumbnail with its thumbnailUrl", () => {
    render(
      <ProductImageGallery items={mixedItems} productName={PRODUCT_NAME} />
    );

    // The video thumbnail (index 1) should use its thumbnailUrl and title as alt
    const videoThumb = screen.getByAltText("Product Video");
    expect(videoThumb).toHaveAttribute(
      "src",
      "https://cdn.example.com/video-thumb.jpg"
    );
  });

  // 17. Video item renders YouTube iframe when active
  it("renders a YouTube iframe when a YouTube video is the active item", () => {
    render(
      <ProductImageGallery items={mixedItems} productName={PRODUCT_NAME} />
    );

    // Click the video thumbnail button to make it active
    const videoThumb = screen.getByAltText("Product Video");
    fireEvent.click(videoThumb.closest("button")!);

    const iframe = document.querySelector("iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe!.getAttribute("src")).toContain("youtube.com/embed/abc123");
    expect(iframe!.getAttribute("title")).toBe("Product Video");
  });

  // 18. Fullscreen button opens lightbox dialog
  it("opens the lightbox dialog when fullscreen button is clicked", () => {
    render(
      <ProductImageGallery items={singleImage} productName={PRODUCT_NAME} />
    );

    // Fullscreen button should be present with correct aria-label
    const fullscreenBtn = screen.getByLabelText("View fullscreen");
    expect(fullscreenBtn).toBeInTheDocument();

    // Lightbox should not be open initially
    expect(screen.queryByTestId("lightbox-dialog")).not.toBeInTheDocument();

    // Click fullscreen button
    fireEvent.click(fullscreenBtn);

    // Lightbox dialog should now be visible
    expect(screen.getByTestId("lightbox-dialog")).toBeInTheDocument();
  });
});
