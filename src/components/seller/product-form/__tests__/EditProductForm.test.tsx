/**
 * Tests for EditProductForm component
 * Batch 12: Expanded coverage for branches + functions
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

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
});
