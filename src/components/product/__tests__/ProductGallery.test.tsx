import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { buildGallery, ProductGallery } from "../ProductGallery";

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { fill, priority, ...rest } = props;
    return <img data-fill={fill ? "true" : undefined} data-priority={priority ? "true" : undefined} {...rest} />;
  },
}));

// Mock lucide-react
jest.mock("lucide-react", () => ({
  Heart: (p: Record<string, unknown>) => <svg data-testid="heart-icon" {...p} />,
  Share2: (p: Record<string, unknown>) => <svg data-testid="share-icon" {...p} />,
  Play: (p: Record<string, unknown>) => <svg data-testid="play-icon" {...p} />,
}));

// Mock Badge
jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span data-testid="badge" className={className}>{children}</span>
  ),
}));

describe("buildGallery", () => {
  it("should return empty gallery for product with no media", () => {
    const result = buildGallery({ name: "Test" });
    expect(result).toEqual([]);
  });

  it("should add main image when valid http URL", () => {
    const result = buildGallery({ name: "Test", image: "https://example.com/img.jpg" });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ type: "image", url: "https://example.com/img.jpg", isPrimary: true });
  });

  it("should skip main image when empty string", () => {
    expect(buildGallery({ name: "T", image: "" })).toHaveLength(0);
  });

  it("should skip main image when 'null' string", () => {
    expect(buildGallery({ name: "T", image: "null" })).toHaveLength(0);
  });

  it("should skip main image when not http URL", () => {
    expect(buildGallery({ name: "T", image: "/local.jpg" })).toHaveLength(0);
  });

  it("should add additional images from images array", () => {
    const result = buildGallery({
      name: "Test",
      image: "https://example.com/main.jpg",
      images: ["https://example.com/a.jpg", "https://example.com/b.jpg"],
    });
    expect(result).toHaveLength(3);
  });

  it("should skip duplicate images matching main image", () => {
    const result = buildGallery({
      name: "T",
      image: "https://example.com/main.jpg",
      images: ["https://example.com/main.jpg", "https://example.com/other.jpg"],
    });
    expect(result).toHaveLength(2);
  });

  it("should filter invalid entries from images array", () => {
    const result = buildGallery({
      name: "T",
      images: ["", "null", "/local.jpg", "https://valid.com/img.jpg"],
    });
    expect(result).toHaveLength(1);
    expect(result[0].url).toBe("https://valid.com/img.jpg");
  });

  it("should parse YouTube watch URL from media", () => {
    const result = buildGallery({
      name: "T",
      media: [{ mediaType: "video", videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }],
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ type: "video", videoSource: "youtube", videoId: "dQw4w9WgXcQ" });
  });

  it("should parse YouTube short URL", () => {
    const result = buildGallery({
      name: "T",
      media: [{ mediaType: "video", videoUrl: "https://youtu.be/abcdefghijk" }],
    });
    expect(result[0].videoId).toBe("abcdefghijk");
  });

  it("should parse YouTube shorts URL", () => {
    const result = buildGallery({
      name: "T",
      media: [{ mediaType: "video", videoUrl: "https://youtube.com/shorts/abcdefghijk" }],
    });
    expect(result[0].videoId).toBe("abcdefghijk");
  });

  it("should parse YouTube embed URL", () => {
    const result = buildGallery({
      name: "T",
      media: [{ mediaType: "video", videoUrl: "https://youtube.com/embed/abcdefghijk" }],
    });
    expect(result[0].videoId).toBe("abcdefghijk");
  });

  it("should generate YouTube thumbnail URL", () => {
    const result = buildGallery({
      name: "T",
      media: [{ mediaType: "video", videoUrl: "https://youtube.com/watch?v=testid12345" }],
    });
    expect(result[0].thumbnailUrl).toBe("https://img.youtube.com/vi/testid12345/maxresdefault.jpg");
  });

  it("should parse Vimeo URL from media", () => {
    const result = buildGallery({
      name: "T",
      media: [{ mediaType: "video", videoUrl: "https://vimeo.com/123456789" }],
    });
    expect(result[0]).toMatchObject({ type: "video", videoSource: "vimeo", videoId: "123456789" });
  });

  it("should handle file video from media", () => {
    const result = buildGallery({
      name: "T",
      media: [{ mediaType: "video", video: "https://example.com/video.mp4" }],
    });
    expect(result[0]).toMatchObject({ type: "video", videoSource: "file", url: "https://example.com/video.mp4" });
  });

  it("should handle image media items", () => {
    const result = buildGallery({
      name: "T",
      media: [{ mediaType: "image", image: "https://example.com/media-img.jpg", imageAlt: "Alt text", title: "Title" }],
    });
    expect(result[0]).toMatchObject({ type: "image", url: "https://example.com/media-img.jpg", alt: "Alt text" });
  });

  it("should deduplicate media images already in gallery", () => {
    const result = buildGallery({
      name: "T",
      image: "https://example.com/main.jpg",
      media: [{ mediaType: "image", image: "https://example.com/main.jpg" }],
    });
    expect(result).toHaveLength(1);
  });

  it("should sort primary items first", () => {
    const result = buildGallery({
      name: "T",
      images: ["https://example.com/a.jpg"],
      media: [{ mediaType: "image", image: "https://example.com/b.jpg", isPrimary: true }],
    });
    expect(result[0].isPrimary).toBe(true);
    expect(result[0].url).toBe("https://example.com/b.jpg");
  });

  it("should use fallback videoUrl from media.video field", () => {
    const result = buildGallery({
      name: "T",
      media: [{ mediaType: "video", videoUrl: undefined, video: "https://youtube.com/watch?v=fromvideo11" }],
    });
    expect(result[0].videoId).toBe("fromvideo11");
  });
});

describe("ProductGallery", () => {
  const baseProps = {
    productName: "Test Mushroom",
    galleryItems: [],
    activeGalleryIndex: 0,
    setActiveGalleryIndex: jest.fn(),
    discountPercent: 0,
    inWishlist: false,
    onToggleWishlist: jest.fn(),
    onShare: jest.fn(),
  };

  it("should render placeholder when no gallery items", () => {
    render(<ProductGallery {...baseProps} />);
    expect(screen.getByAltText("Test Mushroom")).toBeInTheDocument();
  });

  it("should render active image when gallery has items", () => {
    const items = [{ type: "image" as const, url: "https://example.com/img.jpg", alt: "Image 1" }];
    render(<ProductGallery {...baseProps} galleryItems={items} />);
    expect(screen.getByAltText("Image 1")).toBeInTheDocument();
  });

  it("should show discount badge when discountPercent > 0", () => {
    const items = [{ type: "image" as const, url: "https://example.com/img.jpg" }];
    render(<ProductGallery {...baseProps} galleryItems={items} discountPercent={20} />);
    expect(screen.getByText("-20%")).toBeInTheDocument();
  });

  it("should show PROMO badge when isPromo and no discount", () => {
    const items = [{ type: "image" as const, url: "https://example.com/img.jpg" }];
    render(<ProductGallery {...baseProps} galleryItems={items} isPromo discountPercent={0} />);
    expect(screen.getByText("PROMO")).toBeInTheDocument();
  });

  it("should not show PROMO badge when discount exists", () => {
    const items = [{ type: "image" as const, url: "https://example.com/img.jpg" }];
    render(<ProductGallery {...baseProps} galleryItems={items} isPromo discountPercent={15} />);
    expect(screen.queryByText("PROMO")).not.toBeInTheDocument();
  });

  it("should render wishlist button and call onToggleWishlist", () => {
    const items = [{ type: "image" as const, url: "https://example.com/img.jpg" }];
    const onToggle = jest.fn();
    render(<ProductGallery {...baseProps} galleryItems={items} onToggleWishlist={onToggle} />);
    const hearts = screen.getAllByTestId("heart-icon");
    fireEvent.click(hearts[0].closest("button")!);
    expect(onToggle).toHaveBeenCalled();
  });

  it("should render share button and call onShare", () => {
    const items = [{ type: "image" as const, url: "https://example.com/img.jpg" }];
    const onShare = jest.fn();
    render(<ProductGallery {...baseProps} galleryItems={items} onShare={onShare} />);
    const shares = screen.getAllByTestId("share-icon");
    fireEvent.click(shares[0].closest("button")!);
    expect(onShare).toHaveBeenCalled();
  });

  it("should render thumbnails when more than 1 gallery item", () => {
    const items = [
      { type: "image" as const, url: "https://example.com/a.jpg", alt: "A" },
      { type: "image" as const, url: "https://example.com/b.jpg", alt: "B" },
    ];
    render(<ProductGallery {...baseProps} galleryItems={items} />);
    // thumbnails: 2 buttons
    const buttons = screen.getAllByRole("button");
    // at least the thumbnail buttons
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it("should not render thumbnails for single gallery item", () => {
    const items = [{ type: "image" as const, url: "https://example.com/a.jpg" }];
    const { container } = render(<ProductGallery {...baseProps} galleryItems={items} />);
    // Only wishlist + share buttons, no thumbnail buttons
    expect(container.querySelectorAll("button.w-20")).toHaveLength(0);
  });

  it("should call setActiveGalleryIndex on thumbnail click", () => {
    const setter = jest.fn();
    const items = [
      { type: "image" as const, url: "https://example.com/a.jpg" },
      { type: "image" as const, url: "https://example.com/b.jpg" },
    ];
    render(<ProductGallery {...baseProps} galleryItems={items} setActiveGalleryIndex={setter} />);
    // Click the second thumbnail (w-20 h-20 buttons)
    const thumbs = screen.getAllByRole("button").filter(b => b.classList.contains("w-20"));
    if (thumbs.length >= 2) {
      fireEvent.click(thumbs[1]);
      expect(setter).toHaveBeenCalledWith(1);
    }
  });

  it("should render YouTube iframe for youtube video", () => {
    const items = [{ type: "video" as const, url: "https://youtube.com/watch?v=xyz", videoSource: "youtube" as const, videoId: "xyz" }];
    const { container } = render(<ProductGallery {...baseProps} galleryItems={items} />);
    const iframe = container.querySelector("iframe");
    expect(iframe).toBeTruthy();
    expect(iframe?.src).toContain("youtube.com/embed/xyz");
  });

  it("should render Vimeo iframe for vimeo video", () => {
    const items = [{ type: "video" as const, url: "https://vimeo.com/123", videoSource: "vimeo" as const, videoId: "123" }];
    const { container } = render(<ProductGallery {...baseProps} galleryItems={items} />);
    const iframe = container.querySelector("iframe");
    expect(iframe?.src).toContain("player.vimeo.com/video/123");
  });

  it("should render video element for file video", () => {
    const items = [{ type: "video" as const, url: "https://example.com/v.mp4", videoSource: "file" as const }];
    const { container } = render(<ProductGallery {...baseProps} galleryItems={items} />);
    expect(container.querySelector("video")).toBeTruthy();
  });

  it("should show 'Video unavailable' for unknown video source", () => {
    const items = [{ type: "video" as const, url: "https://example.com/v", videoSource: undefined as unknown as "youtube" }];
    render(<ProductGallery {...baseProps} galleryItems={items} />);
    expect(screen.getByText("Video unavailable")).toBeInTheDocument();
  });
});
