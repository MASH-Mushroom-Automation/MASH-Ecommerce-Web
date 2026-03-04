/**
 * Tests for SeoFields component
 * Targets: src/components/seller/product-form/SeoFields.tsx (3fn, 10br)
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

jest.mock("@/components/ui/input", () => ({
  Input: React.forwardRef((props: any, ref: any) => <input ref={ref} {...props} />),
}));
jest.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));
jest.mock("@/components/ui/textarea", () => ({
  Textarea: React.forwardRef((props: any, ref: any) => <textarea ref={ref} {...props} />),
}));
jest.mock("lucide-react", () => ({
  Info: () => <svg data-testid="info-icon" />,
}));

import { SeoFields } from "../SeoFields";

describe("SeoFields", () => {
  const defaultProps = {
    metaTitle: "",
    metaDescription: "",
    onMetaTitleChange: jest.fn(),
    onMetaDescriptionChange: jest.fn(),
    productName: "Test Product",
  };

  beforeEach(() => jest.clearAllMocks());

  it("renders SEO info banner", () => {
    render(<SeoFields {...defaultProps} />);
    expect(screen.getByText(/SEO fields help your product/)).toBeInTheDocument();
  });

  it("renders Meta Title input with placeholder", () => {
    render(<SeoFields {...defaultProps} />);
    expect(screen.getByPlaceholderText("Test Product")).toBeInTheDocument();
  });

  it("renders Meta Description textarea", () => {
    render(<SeoFields {...defaultProps} />);
    expect(screen.getByPlaceholderText("Brief description for search engines...")).toBeInTheDocument();
  });

  it("calls onMetaTitleChange on input", () => {
    render(<SeoFields {...defaultProps} />);
    const input = screen.getByPlaceholderText("Test Product");
    fireEvent.change(input, { target: { value: "New Title" } });
    expect(defaultProps.onMetaTitleChange).toHaveBeenCalledWith("New Title");
  });

  it("calls onMetaDescriptionChange on textarea", () => {
    render(<SeoFields {...defaultProps} />);
    const textarea = screen.getByPlaceholderText("Brief description for search engines...");
    fireEvent.change(textarea, { target: { value: "New desc" } });
    expect(defaultProps.onMetaDescriptionChange).toHaveBeenCalledWith("New desc");
  });

  it("shows character count for title", () => {
    render(<SeoFields {...defaultProps} metaTitle="Hello" />);
    expect(screen.getByText("5 / 60 characters")).toBeInTheDocument();
  });

  it("shows title warning when > 60 chars", () => {
    const longTitle = "A".repeat(61);
    render(<SeoFields {...defaultProps} metaTitle={longTitle} />);
    expect(screen.getByText(/too long/)).toBeInTheDocument();
  });

  it("shows no warning when title <= 60 chars", () => {
    render(<SeoFields {...defaultProps} metaTitle="Short" />);
    expect(screen.queryByText(/too long/)).not.toBeInTheDocument();
  });

  it("shows description warning when > 160 chars", () => {
    const longDesc = "B".repeat(161);
    render(<SeoFields {...defaultProps} metaDescription={longDesc} />);
    // Should have "too long" text for description
    const tooLongTexts = screen.getAllByText(/too long/);
    expect(tooLongTexts.length).toBeGreaterThanOrEqual(1);
  });

  it("shows desc count without warning for short text", () => {
    render(<SeoFields {...defaultProps} metaDescription="Short desc" />);
    expect(screen.getByText("10 / 160 characters")).toBeInTheDocument();
  });

  it("uses empty productName as placeholder fallback", () => {
    render(<SeoFields {...defaultProps} productName="" />);
    expect(screen.getByPlaceholderText("Product name will be used")).toBeInTheDocument();
  });
});
