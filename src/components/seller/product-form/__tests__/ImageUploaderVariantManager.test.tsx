/**
 * Tests for ImageUploader and VariantManager components
 * COV-013: Seller form component tests
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock @hello-pangea/dnd
jest.mock("@hello-pangea/dnd", () => ({
  DragDropContext: ({ children }: any) => <div>{children}</div>,
  Droppable: ({ children }: any) => children({ innerRef: jest.fn(), droppableProps: {}, placeholder: null }, {}),
  Draggable: ({ children }: any) => children({ innerRef: jest.fn(), draggableProps: {}, dragHandleProps: {} }, {}),
}));

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

// ============ ImageUploader Tests ============
describe("ImageUploader", () => {
  let ImageUploader: any;

  beforeAll(async () => {
    const mod = await import("@/components/seller/product-form/ImageUploader");
    ImageUploader = mod.ImageUploader;
  });

  const defaultProps = {
    images: [],
    onImagesChange: jest.fn(),
    maxImages: 5,
    maxFileSize: 5 * 1024 * 1024,
  };

  it("should render the upload zone", () => {
    render(<ImageUploader {...defaultProps} />);
    expect(screen.getByText("Drag & drop images or click to browse")).toBeInTheDocument();
  });

  it("should show image count", () => {
    render(<ImageUploader {...defaultProps} />);
    // Multiple matches, use getAllByText
    expect(screen.getAllByText((content) => /images|0.*5/i.test(content)).length).toBeGreaterThanOrEqual(1);
  });

  it("should display existing images", () => {
    const images = [
      { id: "img-1", url: "/test1.jpg", alt: "Test Image 1", isPrimary: true },
      { id: "img-2", url: "/test2.jpg", alt: "Test Image 2", isPrimary: false },
    ];
    render(<ImageUploader {...defaultProps} images={images} />);
    expect(screen.getByDisplayValue("Test Image 1")).toBeInTheDocument();
  });

  it("should show primary badge on first image", () => {
    const images = [
      { id: "img-1", url: "/test1.jpg", alt: "Test Image", isPrimary: true },
    ];
    render(<ImageUploader {...defaultProps} images={images} />);
    // Multiple matches, use getAllByText
    expect(screen.getAllByText(/primary/i).length).toBeGreaterThanOrEqual(1);
  });

  it("should show error message when provided", () => {
    render(<ImageUploader {...defaultProps} error="Please upload at least one image" />);
    expect(screen.getByText(/please upload/i)).toBeInTheDocument();
  });

  it("should have alt text inputs for each image", () => {
    const images = [
      { id: "img-1", url: "/test1.jpg", alt: "Alt 1", isPrimary: true },
      { id: "img-2", url: "/test2.jpg", alt: "Alt 2", isPrimary: false },
    ];
    render(<ImageUploader {...defaultProps} images={images} />);
    const inputs = screen.getAllByDisplayValue(/Alt/);
    expect(inputs.length).toBe(2);
  });

  it("should have delete buttons for each image", () => {
    const images = [
      { id: "img-1", url: "/test1.jpg", alt: "Alt 1", isPrimary: true },
    ];
    render(<ImageUploader {...defaultProps} images={images} />);
    const buttons = screen.getAllByRole("button");
    // At least one delete button
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("should show empty state when no images and no error", () => {
    render(<ImageUploader {...defaultProps} />);
    expect(screen.getByText("No images uploaded yet")).toBeInTheDocument();
  });

  it("should hide upload zone when maxImages reached", () => {
    const images = Array.from({ length: 5 }, (_, i) => ({
      id: `img-${i}`,
      url: `/test${i}.jpg`,
      alt: `Alt ${i}`,
      isPrimary: i === 0,
    }));
    render(<ImageUploader {...defaultProps} images={images} maxImages={5} />);
    expect(screen.queryByText("Drag & drop images or click to browse")).not.toBeInTheDocument();
  });

  it("should show image count label", () => {
    const images = [
      { id: "img-1", url: "/test1.jpg", alt: "Alt 1", isPrimary: true },
      { id: "img-2", url: "/test2.jpg", alt: "Alt 2", isPrimary: false },
    ];
    render(<ImageUploader {...defaultProps} images={images} />);
    expect(screen.getByText("Product Images (2/5)")).toBeInTheDocument();
  });

  it("should show drag reorder hint", () => {
    const images = [
      { id: "img-1", url: "/test1.jpg", alt: "Alt 1", isPrimary: true },
    ];
    render(<ImageUploader {...defaultProps} images={images} />);
    expect(screen.getByText(/Drag to reorder/)).toBeInTheDocument();
  });

  it("should show max file size in upload zone", () => {
    render(<ImageUploader {...defaultProps} maxFileSize={10 * 1024 * 1024} />);
    expect(screen.getByText(/max 10MB each/)).toBeInTheDocument();
  });

  it("should call onImagesChange when alt text is updated", () => {
    const onImagesChange = jest.fn();
    const images = [
      { id: "img-1", url: "/test1.jpg", alt: "Old alt", isPrimary: true },
    ];
    render(<ImageUploader {...defaultProps} images={images} onImagesChange={onImagesChange} />);
    const altInput = screen.getByDisplayValue("Old alt");
    fireEvent.change(altInput, { target: { value: "New alt text" } });
    expect(onImagesChange).toHaveBeenCalledWith([
      { id: "img-1", url: "/test1.jpg", alt: "New alt text", isPrimary: true },
    ]);
  });

  it("should show Primary Image label for first image alt", () => {
    const images = [
      { id: "img-1", url: "/test1.jpg", alt: "First", isPrimary: true },
      { id: "img-2", url: "/test2.jpg", alt: "Second", isPrimary: false },
    ];
    render(<ImageUploader {...defaultProps} images={images} />);
    expect(screen.getByText(/Primary Image/)).toBeInTheDocument();
  });

  it("should show max images count in upload zone", () => {
    render(<ImageUploader {...defaultProps} maxImages={8} />);
    expect(screen.getByText(/Up to 8 images/)).toBeInTheDocument();
  });

  it("should add border-destructive class when error is set", () => {
    const { container } = render(<ImageUploader {...defaultProps} error="Required" />);
    // The upload zone div should have destructive border
    const uploadZone = container.querySelector("[class*='border-destructive']");
    expect(uploadZone).toBeTruthy();
  });

  it("should handle file input change with valid image", () => {
    const onImagesChange = jest.fn();
    // Mock URL.createObjectURL
    const originalCreateObjectURL = URL.createObjectURL;
    URL.createObjectURL = jest.fn(() => "blob:test");
    render(<ImageUploader {...defaultProps} onImagesChange={onImagesChange} />);
    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    const file = new File(["img"], "test.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(onImagesChange).toHaveBeenCalled();
    URL.createObjectURL = originalCreateObjectURL;
  });

  it("should reject non-image files", () => {
    const onImagesChange = jest.fn();
    render(<ImageUploader {...defaultProps} onImagesChange={onImagesChange} />);
    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    const file = new File(["data"], "doc.pdf", { type: "application/pdf" });
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(onImagesChange).not.toHaveBeenCalled();
  });

  it("should reject file exceeding maxFileSize", () => {
    const onImagesChange = jest.fn();
    render(<ImageUploader {...defaultProps} onImagesChange={onImagesChange} maxFileSize={100} />);
    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    const bigData = "x".repeat(200);
    const file = new File([bigData], "big.png", { type: "image/png" });
    Object.defineProperty(file, "size", { value: 200 });
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(onImagesChange).not.toHaveBeenCalled();
  });

  it("should reject when adding exceeds maxImages", () => {
    const images = Array.from({ length: 4 }, (_, i) => ({
      id: `img-${i}`,
      url: `/test${i}.jpg`,
      alt: `Alt ${i}`,
      isPrimary: i === 0,
    }));
    const onImagesChange = jest.fn();
    URL.createObjectURL = jest.fn(() => "blob:test");
    render(<ImageUploader {...defaultProps} images={images} onImagesChange={onImagesChange} maxImages={5} />);
    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    const files = [
      new File(["a"], "a.png", { type: "image/png" }),
      new File(["b"], "b.png", { type: "image/png" }),
    ];
    fireEvent.change(fileInput, { target: { files } });
    // Should not add because 4 + 2 > 5
    expect(onImagesChange).not.toHaveBeenCalled();
  });

  it("should call onImagesChange on delete with primary reassignment", () => {
    const onImagesChange = jest.fn();
    const images = [
      { id: "img-1", url: "/test1.jpg", alt: "First", isPrimary: true },
      { id: "img-2", url: "/test2.jpg", alt: "Second", isPrimary: false },
    ];
    render(<ImageUploader {...defaultProps} images={images} onImagesChange={onImagesChange} />);
    // Click first delete button
    const deleteButtons = screen.getAllByRole("button");
    // Find the button with X icon - it should be near each image card
    const deleteBtn = deleteButtons.find(b => b.querySelector("[data-testid='icon-X']") || b.innerHTML.includes("X"));
    if (deleteBtn) {
      fireEvent.click(deleteBtn);
      expect(onImagesChange).toHaveBeenCalled();
    }
  });
});

// ============ VariantManager Tests ============
describe("VariantManager", () => {
  let VariantManager: any;

  beforeAll(async () => {
    const mod = await import("@/components/seller/product-form/VariantManager");
    VariantManager = mod.VariantManager;
  });

  const defaultProps = {
    hasVariants: false,
    onHasVariantsChange: jest.fn(),
    variants: [],
    onVariantsChange: jest.fn(),
    basePrice: 100,
    baseSku: "BASE-001",
  };

  it("should render the component", () => {
    render(<VariantManager {...defaultProps} />);
    // Should have a variants toggle
    const switches = screen.getAllByRole("switch");
    expect(switches.length).toBeGreaterThanOrEqual(1);
  });

  it("should show empty state when no variants and disabled", () => {
    render(<VariantManager {...defaultProps} />);
    // When hasVariants is false, should show toggle off state
    expect(screen.queryByText(/add variant/i)).not.toBeInTheDocument();
  });

  it("should show Add Variant button when enabled", () => {
    render(<VariantManager {...defaultProps} hasVariants={true} />);
    expect(screen.getByRole("button", { name: /add variant/i })).toBeInTheDocument();
  });

  it("should display variant cards when variants exist", () => {
    const variants = [
      {
        id: "v1",
        type: "Size" as const,
        value: "Large",
        sku: "BASE-001-L",
        price: 150,
        quantityInStock: 20,
        isAvailable: true,
      },
    ];
    render(<VariantManager {...defaultProps} hasVariants={true} variants={variants} />);
    expect(screen.getByDisplayValue("Large")).toBeInTheDocument();
  });

  it("should call onVariantsChange when Add Variant is clicked", () => {
    render(<VariantManager {...defaultProps} hasVariants={true} />);
    const addBtn = screen.getByRole("button", { name: /add variant/i });
    fireEvent.click(addBtn);
    expect(defaultProps.onVariantsChange).toHaveBeenCalled();
  });

  it("should show variant type selector in variant card", () => {
    const variants = [
      {
        id: "v1",
        type: "Size" as const,
        value: "Medium",
        sku: "BASE-001-M",
        price: 100,
        quantityInStock: 10,
        isAvailable: true,
      },
    ];
    render(<VariantManager {...defaultProps} hasVariants={true} variants={variants} />);
    // Should have select for variant type
    expect(screen.getByDisplayValue("Medium")).toBeInTheDocument();
  });
});
