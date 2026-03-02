/**
 * Tests for AddProductForm component
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
  RichTextEditor: (props: any) => <textarea data-testid="rich-text-editor" onChange={(e: any) => props.onChange?.(e.target.value)} />,
}));

jest.mock("@/components/seller/product-form/ImageUploader", () => ({
  ImageUploader: (props: any) => <div data-testid="image-uploader">Image Uploader ({props.images?.length || 0} images)</div>,
}));

jest.mock("@/components/seller/product-form/VariantManager", () => ({
  VariantManager: (props: any) => <div data-testid="variant-manager">Variant Manager</div>,
}));

jest.mock("@/components/seller/product-form/CategorySelector", () => ({
  __esModule: true,
  default: (props: any) => <select data-testid="category-selector"><option value="">Select</option></select>,
  CategorySelector: (props: any) => <select data-testid="category-selector"><option value="">Select</option></select>,
}));

jest.mock("@/components/seller/product-form/SeoFields", () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="seo-fields">SEO Fields</div>,
  SeoFields: (props: any) => <div data-testid="seo-fields">SEO Fields</div>,
}));

// Mock sanity products
jest.mock("@/lib/sanity/products", () => ({
  ProductFormData: {},
}));

// Mock next/link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: any) => <a href={href} {...rest}>{children}</a>,
}));

import { AddProductForm } from "../AddProductForm";
import { toast } from "sonner";

describe("AddProductForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => null);
    Storage.prototype.setItem = jest.fn();
    Storage.prototype.removeItem = jest.fn();
    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, product: { _id: "new-prod" } }),
      })
    ) as jest.Mock;
  });

  // --- Basic rendering ---

  it("should render the form heading", () => {
    render(<AddProductForm />);
    expect(screen.getByRole("heading", { name: /add new product/i })).toBeInTheDocument();
  });

  it("should render tab navigation with 5 tabs", () => {
    render(<AddProductForm />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs.length).toBe(5);
  });

  it("should render product name input", () => {
    render(<AddProductForm />);
    expect(screen.getByLabelText(/product name/i)).toBeInTheDocument();
  });

  it("should render rich text editor in basic tab", () => {
    render(<AddProductForm />);
    expect(screen.getByTestId("rich-text-editor")).toBeInTheDocument();
  });

  it("should render category selector in basic tab", () => {
    render(<AddProductForm />);
    expect(screen.getByTestId("category-selector")).toBeInTheDocument();
  });

  it("should have back link to products page", () => {
    render(<AddProductForm />);
    const backLink = screen.getByRole("link", { name: /back/i });
    expect(backLink).toHaveAttribute("href", "/seller/products");
  });

  it("should render Save Draft button", () => {
    render(<AddProductForm />);
    const draftBtns = screen.getAllByRole("button").filter(btn =>
      btn.textContent?.toLowerCase().includes("draft") || btn.textContent?.toLowerCase().includes("save draft")
    );
    expect(draftBtns.length).toBeGreaterThanOrEqual(1);
  });

  it("should render Create Product submit button", () => {
    render(<AddProductForm />);
    const createBtns = screen.getAllByRole("button").filter(btn =>
      btn.textContent?.toLowerCase().includes("create")
    );
    expect(createBtns.length).toBeGreaterThanOrEqual(1);
  });

  // --- Tab navigation ---

  it("should render tab for pricing", () => {
    render(<AddProductForm />);
    expect(screen.getByRole("tab", { name: /pricing/i })).toBeInTheDocument();
  });

  it("should render tab for media", () => {
    render(<AddProductForm />);
    expect(screen.getByRole("tab", { name: /media/i })).toBeInTheDocument();
  });

  it("should render tab for variants", () => {
    render(<AddProductForm />);
    const variantTab = screen.getAllByRole("tab").find(t => t.textContent?.toLowerCase().includes("variant"));
    expect(variantTab).toBeTruthy();
  });

  it("should render tab for SEO", () => {
    render(<AddProductForm />);
    expect(screen.getByRole("tab", { name: /seo/i })).toBeInTheDocument();
  });

  // --- Draft dialog ---

  it("should not show draft dialog when no saved draft", () => {
    render(<AddProductForm />);
    expect(screen.queryByText(/unsaved draft found/i)).not.toBeInTheDocument();
  });

  it("should show draft dialog when draft exists in localStorage", async () => {
    Storage.prototype.getItem = jest.fn(() =>
      JSON.stringify({
        name: "Test Product",
        description: "Test description here",
        price: 100,
        category: "oyster",
        quantity: 10,
        trackInventory: true,
        hasVariants: false,
        isAvailable: true,
      })
    );
    render(<AddProductForm />);
    await waitFor(() => {
      expect(screen.getByText(/unsaved draft found/i)).toBeInTheDocument();
    });
  });

  it("should show Restore Draft and Discard Draft buttons", async () => {
    Storage.prototype.getItem = jest.fn(() =>
      JSON.stringify({ name: "Draft", price: 50 })
    );
    render(<AddProductForm />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /restore draft/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /discard draft/i })).toBeInTheDocument();
    });
  });

  it("should restore draft data on Restore Draft click", async () => {
    Storage.prototype.getItem = jest.fn(() =>
      JSON.stringify({
        name: "Restored Mushroom",
        description: "Test description for restore",
        price: 200,
        category: "oyster",
        quantity: 25,
        trackInventory: true,
        hasVariants: false,
        isAvailable: true,
      })
    );
    render(<AddProductForm />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /restore draft/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /restore draft/i }));
    await waitFor(() => {
      expect(screen.queryByText(/unsaved draft found/i)).not.toBeInTheDocument();
    });
    expect(toast.info).toHaveBeenCalledWith("Draft restored successfully");
  });

  it("should discard draft on Discard Draft click", async () => {
    Storage.prototype.getItem = jest.fn(() =>
      JSON.stringify({ name: "Old Draft", price: 50 })
    );
    render(<AddProductForm />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /discard draft/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /discard draft/i }));
    await waitFor(() => {
      expect(screen.queryByText(/unsaved draft found/i)).not.toBeInTheDocument();
    });
    expect(Storage.prototype.removeItem).toHaveBeenCalledWith("product-form-draft");
  });

  // --- Save draft ---

  it("should save draft to localStorage on Save Draft click", () => {
    render(<AddProductForm />);
    const draftBtn = screen.getAllByRole("button").find(btn =>
      btn.textContent?.toLowerCase().includes("draft") || btn.textContent?.toLowerCase().includes("save draft")
    );
    expect(draftBtn).toBeTruthy();
    if (draftBtn) fireEvent.click(draftBtn);
    expect(Storage.prototype.setItem).toHaveBeenCalledWith(
      "product-form-draft",
      expect.any(String)
    );
    expect(toast.success).toHaveBeenCalledWith("Draft saved");
  });

  it("should show last saved timestamp after save draft", async () => {
    render(<AddProductForm />);
    const draftBtn = screen.getAllByRole("button").find(btn =>
      btn.textContent?.toLowerCase().includes("draft") || btn.textContent?.toLowerCase().includes("save draft")
    );
    if (draftBtn) fireEvent.click(draftBtn);
    await waitFor(() => {
      expect(screen.getByText(/last saved:/i)).toBeInTheDocument();
    });
  });

  // --- Form fields ---

  it("should have SKU and weight inputs in basic tab", () => {
    render(<AddProductForm />);
    expect(screen.getByLabelText(/sku/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/weight/i)).toBeInTheDocument();
  });

  it("should show description label", () => {
    render(<AddProductForm />);
    expect(screen.getByText(/product description/i)).toBeInTheDocument();
  });
});
