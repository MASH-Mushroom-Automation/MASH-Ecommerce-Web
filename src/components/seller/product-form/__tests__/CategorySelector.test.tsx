/**
 * Tests for CategorySelector component
 * Targets: src/components/seller/product-form/CategorySelector.tsx (5fn, 5br)
 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

const mockCategories = [
  {
    _id: "cat1",
    name: "Fresh Mushrooms",
    slug: { current: "fresh" },
    subcategories: [
      { _id: "sub1", name: "Shiitake", slug: { current: "shiitake" } },
    ],
  },
  {
    _id: "cat2",
    name: "Dried Mushrooms",
    slug: { current: "dried" },
    subcategories: [],
  },
];

let mockFetchResult: any = mockCategories;
let mockFetchError = false;

jest.mock("@/lib/sanity/products", () => ({
  fetchCategories: jest.fn(() => {
    if (mockFetchError) return Promise.reject(new Error("Network error"));
    return Promise.resolve(mockFetchResult);
  }),
}));

jest.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

jest.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ className }: any) => <div data-testid="skeleton" className={className} />,
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select" data-value={value}>{children}</div>
  ),
  SelectTrigger: ({ children, className, id }: any) => (
    <div data-testid="select-trigger" className={className} id={id}>{children}</div>
  ),
  SelectValue: ({ placeholder }: any) => <span data-testid="select-value">{placeholder}</span>,
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value, className }: any) => (
    <div data-testid="select-item" data-value={value} className={className}>{children}</div>
  ),
}));

import { CategorySelector } from "../CategorySelector";

describe("CategorySelector", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchResult = mockCategories;
    mockFetchError = false;
  });

  it("shows loading skeleton initially", () => {
    render(<CategorySelector value="" onChange={mockOnChange} />);
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
    expect(screen.getByText("Category *")).toBeInTheDocument();
  });

  it("renders categories after loading", async () => {
    render(<CategorySelector value="" onChange={mockOnChange} />);
    await waitFor(() => {
      expect(screen.getByText("Fresh Mushrooms")).toBeInTheDocument();
    });
    expect(screen.getByText("Dried Mushrooms")).toBeInTheDocument();
  });

  it("renders subcategories", async () => {
    render(<CategorySelector value="" onChange={mockOnChange} />);
    await waitFor(() => {
      expect(screen.getByText(/Shiitake/)).toBeInTheDocument();
    });
  });

  it("renders select placeholder", async () => {
    render(<CategorySelector value="" onChange={mockOnChange} />);
    await waitFor(() => {
      expect(screen.getByTestId("select-value")).toHaveTextContent("Select a category");
    });
  });

  it("shows error message when error prop is provided", async () => {
    render(<CategorySelector value="" onChange={mockOnChange} error="Required field" />);
    await waitFor(() => {
      expect(screen.getByText("Required field")).toBeInTheDocument();
    });
  });

  it("applies error styles to trigger when error exists", async () => {
    render(<CategorySelector value="" onChange={mockOnChange} error="Error" />);
    await waitFor(() => {
      const trigger = screen.getByTestId("select-trigger");
      expect(trigger.className).toContain("border-destructive");
    });
  });

  it("handles fetch error gracefully", async () => {
    mockFetchError = true;
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    render(<CategorySelector value="" onChange={mockOnChange} />);
    await waitFor(() => {
      expect(screen.queryByTestId("skeleton")).not.toBeInTheDocument();
    });
    consoleSpy.mockRestore();
  });
});
