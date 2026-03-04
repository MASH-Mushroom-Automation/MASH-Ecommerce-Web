/**
 * Tests for EditProductForm component
 * Batch 12: Expanded coverage for branches + functions
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock sonner
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
}));

// Mock child components
jest.mock("@/components/seller/product-form/RichTextEditor", () => ({
  RichTextEditor: (props: any) => <textarea data-testid="rich-text-editor" defaultValue={props.value} onChange={(e: any) => props.onChange?.(e.target.value)} />,
}));

jest.mock("@/components/seller/product-form/ImageUploader", () => ({
  ImageUploader: (props: any) => <div data-testid="image-uploader">Image Uploader ({props.images?.length || 0} images)</div>,
}));

jest.mock("@/components/seller/product-form/VariantManager", () => ({
  VariantManager: (props: any) => <div data-testid="variant-manager">Variant Manager</div>,
}));

jest.mock("@/components/seller/product-form/CategorySelector", () => ({
  __esModule: true,
  default: (props: any) => <select data-testid="category-selector" value={props.value} onChange={(e: any) => props.onChange?.(e.target.value)}><option value="">Select</option><option value="oyster">Oyster</option></select>,
  CategorySelector: (props: any) => <select data-testid="category-selector" value={props.value} onChange={(e: any) => props.onChange?.(e.target.value)}><option value="">Select</option><option value="oyster">Oyster</option></select>,
}));

jest.mock("@/components/seller/product-form/SeoFields", () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="seo-fields">SEO Fields</div>,
  SeoFields: (props: any) => <div data-testid="seo-fields">SEO Fields</div>,
}));

jest.mock("@/lib/sanity/products", () => ({
  ProductFormData: {},
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: any) => <a href={href} {...rest}>{children}</a>,
}));

// Override next/navigation to capture router calls
const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack, replace: jest.fn(), refresh: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => "/seller/products/prod-1/edit",
  useSearchParams: () => new URLSearchParams(),
}));

import { EditProductForm } from "../EditProductForm";
import { toast } from "sonner";

const mockProduct = {
  _id: "prod-1",
  name: "King Oyster Mushroom",
  description: "Delicious mushrooms with rich umami flavor",
  category: "oyster",
  price: 120,
  compareAtPrice: 150,
  stock: 50,
  isAvailable: true,
  image: "https://example.com/main.jpg",
  images: ["https://example.com/extra.jpg"],
  variants: [],
  sku: "KOM-001",
  weight: 500,
  hasVariants: false,
  seo: { metaTitle: "King Oyster", metaDescription: "Best mushrooms" },
};

function mockFetchSuccess() {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: mockProduct }),
    })
  ) as jest.Mock;
}

function mockFetchError(message = "Product not found") {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: false,
      json: () => Promise.resolve({ error: { message } }),
    })
  ) as jest.Mock;
}

describe("EditProductForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchSuccess();
    mockPush.mockClear();
    mockBack.mockClear();
  });

  // --- Loading state ---

  it("should show loading state initially", () => {
    render(<EditProductForm productId="prod-1" />);
    expect(screen.getByText(/loading product/i)).toBeInTheDocument();
  });

  it("should show spinner during loading", () => {
    const { container } = render(<EditProductForm productId="prod-1" />);
    expect(container.querySelector('[class*="animate-spin"]')).toBeTruthy();
  });

  // --- Data fetch ---

  it("should fetch product data on mount", async () => {
    render(<EditProductForm productId="prod-1" />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/seller/products/prod-1")
      );
    });
  });

  // --- Form populated after load ---

  it("should show Edit Product heading after load", async () => {
    render(<EditProductForm productId="prod-1" />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /edit product/i })).toBeInTheDocument();
    });
  });

  it("should populate product name input after load", async () => {
    render(<EditProductForm productId="prod-1" />);
    await waitFor(() => {
      expect(screen.getByDisplayValue("King Oyster Mushroom")).toBeInTheDocument();
    });
  });

  it("should populate SKU input after load", async () => {
    render(<EditProductForm productId="prod-1" />);
    await waitFor(() => {
      expect(screen.getByDisplayValue("KOM-001")).toBeInTheDocument();
    });
  });

  it("should populate weight input after load", async () => {
    render(<EditProductForm productId="prod-1" />);
    await waitFor(() => {
      expect(screen.getByDisplayValue("500")).toBeInTheDocument();
    });
  });

  // --- Form structure ---

  it("should render 5 tabs after load", async () => {
    render(<EditProductForm productId="prod-1" />);
    await waitFor(() => {
      const tabs = screen.getAllByRole("tab");
      expect(tabs.length).toBe(5);
    });
  });

  it("should render tab labels correctly", async () => {
    render(<EditProductForm productId="prod-1" />);
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /basic info/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /pricing/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /media/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /variants/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /seo/i })).toBeInTheDocument();
    });
  });

  it("should render Update Product submit button", async () => {
    render(<EditProductForm productId="prod-1" />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /update product/i })).toBeInTheDocument();
    });
  });

  it("should have back link to seller products", async () => {
    render(<EditProductForm productId="prod-1" />);
    await waitFor(() => {
      const backLink = screen.getByRole("link");
      expect(backLink).toHaveAttribute("href", "/seller/products");
    });
  });

  // --- Error state ---

  it("should show error message when fetch fails", async () => {
    mockFetchError("Product not found");
    render(<EditProductForm productId="bad-id" />);
    await waitFor(() => {
      expect(screen.getByText("Product not found")).toBeInTheDocument();
    });
  });

  it("should show Go Back button in error state", async () => {
    mockFetchError("Not found");
    render(<EditProductForm productId="bad-id" />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /go back/i })).toBeInTheDocument();
    });
  });

  it("should show alert icon in error state", async () => {
    mockFetchError();
    render(<EditProductForm productId="bad-id" />);
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  // --- Tab navigation ---

  it("should have product description label", async () => {
    render(<EditProductForm productId="prod-1" />);
    await waitFor(() => {
      expect(screen.getByText(/product description/i)).toBeInTheDocument();
    });
  });

  it("should show update info text", async () => {
    render(<EditProductForm productId="prod-1" />);
    await waitFor(() => {
      expect(screen.getByText(/update your product information/i)).toBeInTheDocument();
    });
  });

  it("should render rich text editor in basic tab", async () => {
    render(<EditProductForm productId="prod-1" />);
    await waitFor(() => {
      expect(screen.getByTestId("rich-text-editor")).toBeInTheDocument();
    });
  });

  it("should render category selector in basic tab", async () => {
    render(<EditProductForm productId="prod-1" />);
    await waitFor(() => {
      expect(screen.getByTestId("category-selector")).toBeInTheDocument();
    });
  });

  // --- Submit flow: success ---

  it("should submit and redirect on successful update", async () => {
    render(<EditProductForm productId="prod-1" />);
    await waitFor(() => screen.getByDisplayValue("King Oyster Mushroom"));

    // Mock PUT response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockProduct }),
    });

    fireEvent.click(screen.getByRole("button", { name: /update product/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Product updated successfully!",
        expect.anything(),
      );
      expect(mockPush).toHaveBeenCalledWith("/seller/products");
    });
  });

  // --- Submit flow: no images ---

  it("should show error when submitting with no images", async () => {
    const productNoImages = { ...mockProduct, image: null, images: [] };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: productNoImages }),
    });

    render(<EditProductForm productId="prod-1" />);
    await waitFor(() => screen.getByDisplayValue("King Oyster Mushroom"));

    fireEvent.click(screen.getByRole("button", { name: /update product/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Please add at least one product image",
      );
    });
  });

  // --- Submit flow: hasVariants but no variants ---

  it("should show error when variants enabled but none added", async () => {
    const productWithVariants = { ...mockProduct, hasVariants: true, variants: [] };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: productWithVariants }),
    });

    render(<EditProductForm productId="prod-1" />);
    await waitFor(() => screen.getByDisplayValue("King Oyster Mushroom"));

    fireEvent.click(screen.getByRole("button", { name: /update product/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Please add at least one variant or disable variants",
      );
    });
  });

  // --- Submit flow: PUT failure ---

  it("should show error toast when PUT request fails", async () => {
    render(<EditProductForm productId="prod-1" />);
    await waitFor(() => screen.getByDisplayValue("King Oyster Mushroom"));

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: { message: "Server error" } }),
    });

    fireEvent.click(screen.getByRole("button", { name: /update product/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to update product",
        expect.anything(),
      );
    });
  });

  // --- Submit flow: network error ---

  it("should show error toast when submit throws network error", async () => {
    render(<EditProductForm productId="prod-1" />);
    await waitFor(() => screen.getByDisplayValue("King Oyster Mushroom"));

    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network failure"));

    fireEvent.click(screen.getByRole("button", { name: /update product/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to update product",
        expect.objectContaining({ description: "Network failure" }),
      );
    });
  });

  // --- Go Back button in error state ---

  it("should call router.back() when Go Back is clicked in error state", async () => {
    mockFetchError("Not found");
    render(<EditProductForm productId="bad-id" />);
    await waitFor(() => screen.getByRole("button", { name: /go back/i }));

    fireEvent.click(screen.getByRole("button", { name: /go back/i }));
    expect(mockBack).toHaveBeenCalled();
  });

  // --- isSubmitting state ---

  it("should show Updating... text while submitting", async () => {
    render(<EditProductForm productId="prod-1" />);
    await waitFor(() => screen.getByDisplayValue("King Oyster Mushroom"));

    // Make PUT hang
    (global.fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {}));

    fireEvent.click(screen.getByRole("button", { name: /update product/i }));

    await waitFor(() => {
      expect(screen.getByText("Updating...")).toBeInTheDocument();
    });
  });

  // --- Form validation errors display ---

  it("should display validation error summary when name is empty", async () => {
    render(<EditProductForm productId="prod-1" />);
    await waitFor(() => screen.getByDisplayValue("King Oyster Mushroom"));

    // Clear name field
    fireEvent.change(screen.getByDisplayValue("King Oyster Mushroom"), {
      target: { value: "" },
    });

    fireEvent.click(screen.getByRole("button", { name: /update product/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/please fix the following errors/i),
      ).toBeInTheDocument();
    });
  });

  // --- Product with no images shows 0 in image uploader ---

  it("should show 0 images in uploader when product has no images", async () => {
    const user = userEvent.setup();
    const productNoImages = { ...mockProduct, image: undefined, images: undefined };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: productNoImages }),
    });

    render(<EditProductForm productId="prod-1" />);
    await waitFor(() => screen.getByDisplayValue("King Oyster Mushroom"));

    // Switch to Media tab to render ImageUploader (need full pointer event chain for controlled Radix Tabs)
    await user.click(screen.getByRole("tab", { name: /media/i }));
    await waitFor(() => {
      expect(screen.getByTestId("image-uploader")).toHaveTextContent("0 images");
    });
  });

  // --- Product with main + extra images shows correct count ---

  it("should populate image uploader with loaded images", async () => {
    const user = userEvent.setup();
    render(<EditProductForm productId="prod-1" />);
    await waitFor(() => screen.getByDisplayValue("King Oyster Mushroom"));

    // Switch to Media tab (need full pointer event chain for controlled Radix Tabs)
    await user.click(screen.getByRole("tab", { name: /media/i }));
    await waitFor(() => {
      // mockProduct has 1 main image + 1 extra = 2
      expect(screen.getByTestId("image-uploader")).toHaveTextContent("2 images");
    });
  });

  // --- Network error with non-Error object during load ---

  it("should handle non-Error thrown during load", async () => {
    (global.fetch as jest.Mock).mockRejectedValue("string error");
    render(<EditProductForm productId="prod-1" />);
    await waitFor(() => {
      expect(screen.getByText("Failed to load product")).toBeInTheDocument();
    });
  });

  // --- productId falsy guard ---

  it("should not fetch when productId is empty", () => {
    render(<EditProductForm productId="" />);
    // No fetch call should happen for empty productId
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
