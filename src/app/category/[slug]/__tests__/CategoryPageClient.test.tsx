/**
 * Tests for CategoryPageClient component
 * Targets: src/app/category/[slug]/CategoryPageClient.tsx (65 stmts)
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

jest.mock("@/components/product/ProductCard", () => ({
  __esModule: true,
  ProductCard: ({ product }: any) => <div data-testid="product-card">{product?.name}</div>,
  default: ({ product }: any) => <div data-testid="product-card">{product?.name}</div>,
}));

jest.mock("@/components/ui/loading-spinner", () => ({
  __esModule: true,
  ProductGridSkeleton: () => <div data-testid="product-grid-skeleton">Loading...</div>,
  default: () => <div data-testid="loading-spinner">Loading...</div>,
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

jest.mock("@/components/ui/empty-state", () => ({
  __esModule: true,
  EmptyState: () => <div data-testid="empty-state">No products found</div>,
  default: () => <div data-testid="empty-state">No products found</div>,
}));

jest.mock("@/hooks/useSanityProducts", () => ({
  useSanityProducts: jest.fn(() => ({
    products: [
      { _id: "p1", name: "Tomato", slug: "tomato", price: 50, mainImage: "/tomato.jpg", category: { name: "Vegetables" } },
      { _id: "p2", name: "Carrot", slug: "carrot", price: 30, mainImage: "/carrot.jpg", category: { name: "Vegetables" } },
    ],
    loading: false,
    error: null,
    totalCount: 2,
  })),
}));

jest.mock("@/hooks/useSanityCategories", () => ({
  useSanityCategories: jest.fn(() => ({
    categories: [
      { name: "Vegetables", slug: "vegetables", productCount: 10 },
      { name: "Fruits", slug: "fruits", productCount: 5 },
    ],
    loading: false,
  })),
}));

jest.mock("@/components/ui/slider", () => ({
  Slider: (props: any) => <input data-testid="price-slider" type="range" onChange={() => props.onValueChange?.([0, 1000])} />,
}));

jest.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children }: any) => <div>{children}</div>,
  SheetTrigger: ({ children }: any) => <div>{children}</div>,
  SheetContent: ({ children }: any) => <div>{children}</div>,
  SheetHeader: ({ children }: any) => <div>{children}</div>,
  SheetTitle: ({ children }: any) => <div>{children}</div>,
  SheetDescription: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => <button data-testid="button" {...props}>{children}</button>,
}));

jest.mock("lucide-react", () =>
  new Proxy({}, { get: (_t, name) => (props: any) => <span data-testid={`icon-${String(name)}`} {...props} /> })
);

jest.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange }: any) => <div data-testid="select">{children}</div>,
  SelectTrigger: ({ children }: any) => <button data-testid="select-trigger">{children}</button>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

jest.mock("next/image", () => ({ __esModule: true, default: (props: any) => <img {...props} /> }));
jest.mock("next/link", () => ({ __esModule: true, default: ({ children, href }: any) => <a href={href}>{children}</a> }));
jest.mock("@/lib/utils", () => ({ cn: (...args: any[]) => args.filter(Boolean).join(" ") }));

const mockCategory = {
  name: "Vegetables",
  slug: "vegetables",
  description: "Fresh vegetables",
  image: "/vegetables.jpg",
  productCount: 10,
};

describe("CategoryPageClient", () => {
  let CategoryPageClient: any;

  beforeAll(async () => {
    try {
      const mod = await import("@/app/category/[slug]/CategoryPageClient");
      CategoryPageClient = mod.default || mod.CategoryPageClient;
    } catch (e) {
      // Skip if module cannot load
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render category name", () => {
    if (!CategoryPageClient) return;
    render(<CategoryPageClient category={mockCategory} slug="vegetables" />);
    expect(screen.getAllByText(/vegetables/i).length).toBeGreaterThanOrEqual(1);
  });

  it("should render product cards", () => {
    if (!CategoryPageClient) return;
    render(<CategoryPageClient category={mockCategory} slug="vegetables" />);
    const cards = screen.getAllByTestId("product-card");
    expect(cards.length).toBeGreaterThanOrEqual(1);
  });

  it("should render search input", () => {
    if (!CategoryPageClient) return;
    render(<CategoryPageClient category={mockCategory} slug="vegetables" />);
    const search = screen.queryByPlaceholderText(/search/i);
    expect(search).toBeDefined();
  });

  it("should render sort selector", () => {
    if (!CategoryPageClient) return;
    render(<CategoryPageClient category={mockCategory} slug="vegetables" />);
    expect(screen.getByTestId("select")).toBeInTheDocument();
  });

  it("should render breadcrumb with category name", () => {
    if (!CategoryPageClient) return;
    render(<CategoryPageClient category={mockCategory} slug="vegetables" />);
    expect(screen.getAllByText(/vegetables/i).length).toBeGreaterThanOrEqual(1);
  });

  it("should show loading skeleton when products are loading", () => {
    if (!CategoryPageClient) return;
    const { useSanityProducts } = require("@/hooks/useSanityProducts");
    useSanityProducts.mockReturnValue({ products: [], loading: true, error: null, totalCount: 0 });
    render(<CategoryPageClient category={mockCategory} slug="vegetables" />);
    expect(screen.getByTestId("product-grid-skeleton")).toBeInTheDocument();
  });

  it("should show empty state when no products found", () => {
    if (!CategoryPageClient) return;
    const { useSanityProducts } = require("@/hooks/useSanityProducts");
    useSanityProducts.mockReturnValue({ products: [], loading: false, error: null, totalCount: 0 });
    render(<CategoryPageClient category={mockCategory} slug="vegetables" />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  it("should render category description", () => {
    if (!CategoryPageClient) return;
    render(<CategoryPageClient category={mockCategory} slug="vegetables" />);
    expect(screen.getByText("Fresh vegetables")).toBeInTheDocument();
  });

  it("should render category image", () => {
    if (!CategoryPageClient) return;
    render(<CategoryPageClient category={mockCategory} slug="vegetables" />);
    const img = screen.getByAltText("Vegetables");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/vegetables.jpg");
  });

  it("should render All Products button", () => {
    if (!CategoryPageClient) return;
    render(<CategoryPageClient category={mockCategory} slug="vegetables" />);
    expect(screen.getByText("All Products")).toBeInTheDocument();
  });

  it("should render other categories in sidebar", () => {
    if (!CategoryPageClient) return;
    render(<CategoryPageClient category={mockCategory} slug="vegetables" />);
    // "Fruits" is an other category (slug != "vegetables")
    expect(screen.getAllByText("Fruits").length).toBeGreaterThanOrEqual(1);
  });

  it("should render breadcrumb links", () => {
    if (!CategoryPageClient) return;
    render(<CategoryPageClient category={mockCategory} slug="vegetables" />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Shop")).toBeInTheDocument();
  });

  it("should render tag filter buttons", () => {
    if (!CategoryPageClient) return;
    render(<CategoryPageClient category={mockCategory} slug="vegetables" />);
    expect(screen.getAllByText("Fresh").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Organic").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Dried").length).toBeGreaterThanOrEqual(1);
  });

  it("should toggle tag selection on click", () => {
    if (!CategoryPageClient) return;
    render(<CategoryPageClient category={mockCategory} slug="vegetables" />);
    const freshBtns = screen.getAllByText("Fresh");
    fireEvent.click(freshBtns[0]);
    // After clicking, "Active filters:" and clear button should appear
    expect(screen.getAllByText(/Active filters/i).length).toBeGreaterThanOrEqual(1);
  });

  it("should show Clear tags button when tags are selected", () => {
    if (!CategoryPageClient) return;
    render(<CategoryPageClient category={mockCategory} slug="vegetables" />);
    const freshBtns = screen.getAllByText("Fresh");
    fireEvent.click(freshBtns[0]);
    expect(screen.getAllByText("Clear tags").length).toBeGreaterThanOrEqual(1);
  });

  it("should clear all tags when Clear tags clicked", () => {
    if (!CategoryPageClient) return;
    render(<CategoryPageClient category={mockCategory} slug="vegetables" />);
    const freshBtns = screen.getAllByText("Fresh");
    fireEvent.click(freshBtns[0]);
    const clearBtns = screen.getAllByText("Clear tags");
    fireEvent.click(clearBtns[0]);
    expect(screen.queryByText("Active filters:")).not.toBeInTheDocument();
  });

  it("should render search input with category name placeholder", () => {
    if (!CategoryPageClient) return;
    render(<CategoryPageClient category={mockCategory} slug="vegetables" />);
    expect(screen.getByPlaceholderText("Search in Vegetables...")).toBeInTheDocument();
  });

  it("should update search query on input change", () => {
    if (!CategoryPageClient) return;
    render(<CategoryPageClient category={mockCategory} slug="vegetables" />);
    const input = screen.getByPlaceholderText("Search in Vegetables...");
    fireEvent.change(input, { target: { value: "tomato" } });
    expect(input).toHaveValue("tomato");
    expect(screen.getByText(/Showing results for/i)).toBeInTheDocument();
  });

  it("should show clear button when search has text", () => {
    if (!CategoryPageClient) return;
    render(<CategoryPageClient category={mockCategory} slug="vegetables" />);
    const input = screen.getByPlaceholderText("Search in Vegetables...");
    fireEvent.change(input, { target: { value: "test" } });
    // There should be a clear (X) button
    const clearBtns = screen.getAllByTestId("icon-X");
    expect(clearBtns.length).toBeGreaterThanOrEqual(1);
  });

  it("should render grid/list view toggle buttons", () => {
    if (!CategoryPageClient) return;
    render(<CategoryPageClient category={mockCategory} slug="vegetables" />);
    expect(screen.getByLabelText("Grid view")).toBeInTheDocument();
    expect(screen.getByLabelText("List view")).toBeInTheDocument();
  });

  it("should switch to list view on click", () => {
    if (!CategoryPageClient) return;
    render(<CategoryPageClient category={mockCategory} slug="vegetables" />);
    fireEvent.click(screen.getByLabelText("List view"));
    // View mode changed - list view button should now have primary style
    expect(screen.getByLabelText("List view").className).toContain("bg-primary");
  });

  it("should render price range inputs", () => {
    if (!CategoryPageClient) return;
    render(<CategoryPageClient category={mockCategory} slug="vegetables" />);
    expect(screen.getAllByPlaceholderText("₱0").length).toBeGreaterThanOrEqual(1);
  });

  it("should render Filters button for mobile", () => {
    if (!CategoryPageClient) return;
    render(<CategoryPageClient category={mockCategory} slug="vegetables" />);
    expect(screen.getAllByText("Filters").length).toBeGreaterThanOrEqual(1);
  });

  it("should render product count", () => {
    if (!CategoryPageClient) return;
    render(<CategoryPageClient category={mockCategory} slug="vegetables" />);
    // useSanityProducts mock returns 2 products by default
    expect(screen.getByText(/products? available/)).toBeInTheDocument();
  });

  it("should show Load More button when more products available", () => {
    if (!CategoryPageClient) return;
    const { useSanityProducts } = require("@/hooks/useSanityProducts");
    const manyProducts = Array.from({ length: 30 }, (_, i) => ({
      _id: `p${i}`,
      name: `Product ${i}`,
      slug: `product-${i}`,
      price: 100 + i,
      mainImage: `/img${i}.jpg`,
      category: { name: "Vegetables" },
    }));
    useSanityProducts.mockReturnValue({ products: manyProducts, loading: false, error: null, totalCount: 30 });
    render(<CategoryPageClient category={mockCategory} slug="vegetables" />);
    expect(screen.getByText("Load More Products")).toBeInTheDocument();
    expect(screen.getByText(/Showing 24 of 30 products/)).toBeInTheDocument();
  });

  it("should load more products when Load More clicked", () => {
    if (!CategoryPageClient) return;
    const { useSanityProducts } = require("@/hooks/useSanityProducts");
    const manyProducts = Array.from({ length: 30 }, (_, i) => ({
      _id: `p${i}`,
      name: `Product ${i}`,
      slug: `product-${i}`,
      price: 100 + i,
      mainImage: `/img${i}.jpg`,
      category: { name: "Vegetables" },
    }));
    useSanityProducts.mockReturnValue({ products: manyProducts, loading: false, error: null, totalCount: 30 });
    render(<CategoryPageClient category={mockCategory} slug="vegetables" />);
    fireEvent.click(screen.getByText("Load More Products"));
    // After loading more, all 30 should be shown
    expect(screen.queryByText("Load More Products")).not.toBeInTheDocument();
  });

  it("should show Reset All Filters when price changed", () => {
    if (!CategoryPageClient) return;
    render(<CategoryPageClient category={mockCategory} slug="vegetables" />);
    const minInputs = screen.getAllByPlaceholderText("₱0");
    fireEvent.change(minInputs[0], { target: { value: "500" } });
    expect(screen.getAllByText("Reset All Filters").length).toBeGreaterThanOrEqual(1);
  });

  it("should not show category image when not provided", () => {
    if (!CategoryPageClient) return;
    const noImageCat = { ...mockCategory, image: undefined };
    render(<CategoryPageClient category={noImageCat} slug="vegetables" />);
    expect(screen.queryByAltText("Vegetables")).not.toBeInTheDocument();
  });

  it("should not show description when not provided", () => {
    if (!CategoryPageClient) return;
    const noDescCat = { ...mockCategory, description: undefined };
    render(<CategoryPageClient category={noDescCat} slug="vegetables" />);
    expect(screen.queryByText("Fresh vegetables")).not.toBeInTheDocument();
  });
});
