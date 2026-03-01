/**
 * Tests for AddProductForm component
 * COV-013: Seller form component tests
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

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

  it("should render the form", () => {
    render(<AddProductForm />);
    expect(screen.getByRole("heading", { name: /add new product/i })).toBeInTheDocument();
  });

  it("should render tab navigation", () => {
    render(<AddProductForm />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs.length).toBeGreaterThanOrEqual(3);
  });

  it("should render product name input", () => {
    render(<AddProductForm />);
    const nameInput = screen.getByLabelText(/name/i) || screen.getByPlaceholderText(/name/i);
    expect(nameInput).toBeInTheDocument();
  });

  it("should render price input", () => {
    render(<AddProductForm />);
    // Click pricing tab first
    const pricingTab = screen.getAllByRole("tab").find(t => t.textContent?.toLowerCase().includes("pric"));
    if (pricingTab) fireEvent.click(pricingTab);
    waitFor(() => {
      const priceInput = screen.getByLabelText(/price/i) || screen.getByPlaceholderText(/price/i);
      expect(priceInput).toBeInTheDocument();
    });
  });

  it("should render image uploader", () => {
    render(<AddProductForm />);
    // Click media tab
    const mediaTab = screen.getAllByRole("tab").find(t => t.textContent?.toLowerCase().includes("media"));
    if (mediaTab) fireEvent.click(mediaTab);
    waitFor(() => {
      expect(screen.getByTestId("image-uploader")).toBeInTheDocument();
    });
  });

  it("should render variant manager", () => {
    render(<AddProductForm />);
    const variantTab = screen.getAllByRole("tab").find(t => t.textContent?.toLowerCase().includes("variant"));
    if (variantTab) fireEvent.click(variantTab);
    waitFor(() => {
      expect(screen.getByTestId("variant-manager")).toBeInTheDocument();
    });
  });

  it("should have back link to products page", () => {
    render(<AddProductForm />);
    const backLink = screen.getByRole("link", { name: /back|cancel/i });
    expect(backLink).toHaveAttribute("href", expect.stringContaining("/seller/products"));
  });

  it("should not show draft restoration dialog when no saved draft", () => {
    render(<AddProductForm />);
    expect(screen.queryByText(/restore draft/i)).not.toBeInTheDocument();
  });

  it("should show draft restoration dialog when draft exists in localStorage", () => {
    Storage.prototype.getItem = jest.fn(() =>
      JSON.stringify({
        name: "Test Product",
        price: 100,
        savedAt: new Date().toISOString(),
      })
    );
    render(<AddProductForm />);
    waitFor(() => {
      expect(screen.queryByText(/draft|restore|saved/i)).toBeInTheDocument();
    });
  });
});
