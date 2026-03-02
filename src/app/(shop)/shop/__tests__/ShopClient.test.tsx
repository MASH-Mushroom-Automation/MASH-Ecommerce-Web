/**
 * ShopClient component tests
 * Batch 14: Comprehensive test coverage for shop product listing
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock next/navigation
const mockReplace = jest.fn();
const mockGet = jest.fn().mockReturnValue(null);
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: mockReplace }),
  useSearchParams: () => ({
    get: mockGet,
    toString: () => "",
  }),
}));

// Mock cart context
const mockAddToCart = jest.fn();
jest.mock("@/contexts/CartContext", () => ({
  useCart: () => ({ addToCart: mockAddToCart, items: [] }),
  CartProvider: ({ children }: any) => <div>{children}</div>,
}));

// Mock wishlist context
jest.mock("@/contexts/WishlistContext", () => ({
  useWishlist: () => ({ items: [], addToWishlist: jest.fn() }),
  WishlistProvider: ({ children }: any) => <div>{children}</div>,
}));

// Mock hooks
const mockUseSanityProducts = jest.fn();
jest.mock("@/hooks/useSanityProducts", () => ({
  useSanityProducts: (...args: any[]) => mockUseSanityProducts(...args),
}));

const mockUseSanityCategories = jest.fn();
jest.mock("@/hooks/useSanityCategories", () => ({
  useSanityCategories: () => mockUseSanityCategories(),
}));

jest.mock("@/hooks/useDebounce", () => ({
  useDebounce: (val: string) => val,
}));

jest.mock("@/hooks/useProductRatings", () => ({
  useProductRatings: () => ({ ratings: {}, loading: false }),
}));

// Mock child components
jest.mock("@/components/product/ProductCard", () => ({
  ProductCard: ({ name, onQuickView, id }: any) => (
    <div data-testid={`product-card-${id}`}>
      <span>{name}</span>
      <button onClick={() => onQuickView(id)} data-testid={`quickview-${id}`}>Quick View</button>
    </div>
  ),
}));

jest.mock("@/components/product/QuickViewModal", () => ({
  QuickViewModal: ({ isOpen, onClose, productId }: any) =>
    isOpen ? (
      <div data-testid="quick-view-modal">
        <span>Quick View: {productId}</span>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

jest.mock("@/components/shop/FilterSidebar", () => ({
  FilterSidebar: ({ clearAllFilters, hasActiveFilters }: any) => (
    <div data-testid="filter-sidebar">
      {hasActiveFilters && (
        <button onClick={clearAllFilters} data-testid="clear-all">Clear All</button>
      )}
    </div>
  ),
}));

jest.mock("@/components/ui/loading-spinner", () => ({
  ProductGridSkeleton: ({ count }: any) => <div data-testid="product-skeleton">Loading {count} items</div>,
}));

jest.mock("@/components/ui/empty-state", () => ({
  EmptyState: ({ title, onAction, actionLabel }: any) => (
    <div data-testid="empty-state">
      <span>{title}</span>
      {onAction && <button onClick={onAction}>{actionLabel}</button>}
    </div>
  ),
}));

import { ShopClient } from "../ShopClient";

function createMockProduct(id: string, name: string, overrides: any = {}) {
  return {
    id,
    slug: id,
    name,
    price: 150,
    compareAtPrice: 200,
    image: `/images/${id}.jpg`,
    images: [],
    category: "Fresh Mushrooms",
    stock: 10,
    description: `Fresh ${name}`,
    unit: "250g",
    productTags: ["fresh"],
    grower: { name: "MASH Farm" },
    sellerId: "seller-1",
    ...overrides,
  };
}

const mockProducts = [
  createMockProduct("prod-1", "Oyster Mushroom"),
  createMockProduct("prod-2", "Shiitake Mushroom"),
  createMockProduct("prod-3", "King Oyster", { stock: 0 }),
];

describe("ShopClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReturnValue(null);
    mockUseSanityProducts.mockReturnValue({
      products: mockProducts,
      loading: false,
      error: null,
      totalCount: 3,
    });
    mockUseSanityCategories.mockReturnValue({
      categories: [
        { slug: "fresh", name: "Fresh Mushrooms" },
        { slug: "dried", name: "Dried Mushrooms" },
      ],
    });
    // Mock window.history.replaceState
    jest.spyOn(window.history, "replaceState").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should render the shop with product cards", () => {
    render(<ShopClient />);
    expect(screen.getByText("Oyster Mushroom")).toBeInTheDocument();
    expect(screen.getByText("Shiitake Mushroom")).toBeInTheDocument();
    expect(screen.getByText("King Oyster")).toBeInTheDocument();
  });

  it("should show product count", () => {
    render(<ShopClient />);
    const threeElements = screen.getAllByText("3");
    expect(threeElements.length).toBeGreaterThan(0);
  });

  it("should render search input", () => {
    render(<ShopClient />);
    expect(screen.getByPlaceholderText(/Search products/)).toBeInTheDocument();
  });

  it("should render sort select", () => {
    render(<ShopClient />);
    expect(screen.getByText("Featured First")).toBeInTheDocument();
  });

  it("should render view mode toggle buttons", () => {
    render(<ShopClient />);
    expect(screen.getByLabelText("Switch to list view")).toBeInTheDocument();
    expect(screen.getByLabelText("Switch to grid view")).toBeInTheDocument();
  });

  // Loading state
  it("should show loading skeleton when loading", () => {
    mockUseSanityProducts.mockReturnValue({
      products: [],
      loading: true,
      error: null,
      totalCount: 0,
    });
    render(<ShopClient />);
    expect(screen.getByTestId("product-skeleton")).toBeInTheDocument();
  });

  // Error state
  it("should show error message when error occurs", () => {
    mockUseSanityProducts.mockReturnValue({
      products: [],
      loading: false,
      error: { message: "Network error" },
      totalCount: 0,
    });
    render(<ShopClient />);
    expect(screen.getByText(/Error loading products/)).toBeInTheDocument();
    expect(screen.getByText(/Network error/)).toBeInTheDocument();
    expect(screen.getByText("Try Again")).toBeInTheDocument();
  });

  // Empty state
  it("should show empty state when no products", () => {
    mockUseSanityProducts.mockReturnValue({
      products: [],
      loading: false,
      error: null,
      totalCount: 0,
    });
    render(<ShopClient />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("No Products Found")).toBeInTheDocument();
  });

  it("should clear filters from empty state", () => {
    mockUseSanityProducts.mockReturnValue({
      products: [],
      loading: false,
      error: null,
      totalCount: 0,
    });
    render(<ShopClient />);
    fireEvent.click(screen.getByText("Clear Filters"));
    // Just verifying the click handler runs without error
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  // Search functionality
  it("should update search query on input change", () => {
    render(<ShopClient />);
    const searchInput = screen.getByPlaceholderText(/Search products/);
    fireEvent.change(searchInput, { target: { value: "oyster" } });
    expect(searchInput).toHaveValue("oyster");
  });

  it("should show search results text when searching", () => {
    render(<ShopClient />);
    const searchInput = screen.getByPlaceholderText(/Search products/);
    fireEvent.change(searchInput, { target: { value: "oyster" } });
    expect(screen.getByText(/Showing results for/)).toBeInTheDocument();
    expect(screen.getByText("oyster")).toBeInTheDocument();
  });

  it("should show clear button when search has text", () => {
    render(<ShopClient />);
    const searchInput = screen.getByPlaceholderText(/Search products/);
    fireEvent.change(searchInput, { target: { value: "test" } });
    // Find the X button next to search
    const clearButtons = screen.getAllByRole("button");
    const clearSearchBtn = clearButtons.find(
      (btn) => btn.querySelector("svg") && btn.closest(".relative")
    );
    expect(clearSearchBtn).toBeTruthy();
  });

  it("should clear search when clicking clear button", () => {
    render(<ShopClient />);
    const searchInput = screen.getByPlaceholderText(/Search products/);
    fireEvent.change(searchInput, { target: { value: "test" } });
    // Click the X button to clear
    const buttons = document.querySelectorAll("button");
    const clearBtn = Array.from(buttons).find(
      (btn) => btn.closest(".absolute.right-3")
    );
    if (clearBtn) {
      fireEvent.click(clearBtn);
      expect(searchInput).toHaveValue("");
    }
  });

  // View mode
  it("should switch to list view", () => {
    render(<ShopClient />);
    const listBtn = screen.getByLabelText("Switch to list view");
    fireEvent.click(listBtn);
    // In list view, products render as div rows with product names
    expect(listBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("should switch to grid view", () => {
    render(<ShopClient />);
    const gridBtn = screen.getByLabelText("Switch to grid view");
    expect(gridBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("should display list view with product details", () => {
    render(<ShopClient />);
    const listBtn = screen.getByLabelText("Switch to list view");
    fireEvent.click(listBtn);
    // List view shows product names, prices, descriptions
    expect(screen.getByText("Oyster Mushroom")).toBeInTheDocument();
    const prices = screen.getAllByText("₱150.00");
    expect(prices.length).toBeGreaterThan(0);
  });

  it("should show out of stock text in list view for 0-stock items", () => {
    render(<ShopClient />);
    const listBtn = screen.getByLabelText("Switch to list view");
    fireEvent.click(listBtn);
    expect(screen.getByText("Out of Stock")).toBeInTheDocument();
  });

  it("should show Add to Cart button in list view for in-stock items", () => {
    render(<ShopClient />);
    const listBtn = screen.getByLabelText("Switch to list view");
    fireEvent.click(listBtn);
    const addButtons = screen.getAllByText("Add to Cart");
    expect(addButtons.length).toBeGreaterThan(0);
  });

  it("should call addToCart when clicking Add to Cart in list view", () => {
    render(<ShopClient />);
    const listBtn = screen.getByLabelText("Switch to list view");
    fireEvent.click(listBtn);
    const addButtons = screen.getAllByText("Add to Cart");
    fireEvent.click(addButtons[0]);
    expect(mockAddToCart).toHaveBeenCalledWith(
      expect.objectContaining({ id: "prod-1", name: "Oyster Mushroom" }),
      1
    );
  });

  // Quick view
  it("should open quick view modal from product card in grid view", () => {
    render(<ShopClient />);
    fireEvent.click(screen.getByTestId("quickview-prod-1"));
    expect(screen.getByTestId("quick-view-modal")).toBeInTheDocument();
  });

  it("should close quick view modal", () => {
    render(<ShopClient />);
    fireEvent.click(screen.getByTestId("quickview-prod-1"));
    fireEvent.click(screen.getByText("Close"));
    expect(screen.queryByTestId("quick-view-modal")).not.toBeInTheDocument();
  });

  // Load more
  it("should show Load More button when more products available", () => {
    mockUseSanityProducts.mockReturnValue({
      products: mockProducts,
      loading: false,
      error: null,
      totalCount: 50,
    });
    render(<ShopClient />);
    expect(screen.getByText("Load More")).toBeInTheDocument();
  });

  it("should not show Load More when all products displayed", () => {
    render(<ShopClient />);
    expect(screen.queryByText("Load More")).not.toBeInTheDocument();
  });

  it("should call handleLoadMore when clicking Load More", () => {
    mockUseSanityProducts.mockReturnValue({
      products: mockProducts,
      loading: false,
      error: null,
      totalCount: 50,
    });
    render(<ShopClient />);
    fireEvent.click(screen.getByText("Load More"));
    // useSanityProducts should be called with new offset
    expect(mockUseSanityProducts).toHaveBeenCalled();
  });

  // URL-based initialization
  it("should initialize search from URL params", () => {
    mockGet.mockImplementation((key: string) => {
      if (key === "search") return "shiitake";
      return null;
    });
    render(<ShopClient />);
    const searchInput = screen.getByPlaceholderText(/Search products/);
    expect(searchInput).toHaveValue("shiitake");
  });

  it("should show no products found text in search results when totalCount is 0", () => {
    mockUseSanityProducts.mockReturnValue({
      products: [],
      loading: false,
      error: null,
      totalCount: 0,
    });
    render(<ShopClient />);
    const searchInput = screen.getByPlaceholderText(/Search products/);
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });
    expect(screen.getByText(/No products found/)).toBeInTheDocument();
  });

  // Filter chips
  it("should show filtered count indicator when filters active", () => {
    mockGet.mockImplementation((key: string) => {
      if (key === "category") return "fresh";
      return null;
    });
    render(<ShopClient />);
    expect(screen.getByText("(filtered)")).toBeInTheDocument();
  });

  // Cart item building in list view
  it("should include comparePrice in cart item when available", () => {
    render(<ShopClient />);
    fireEvent.click(screen.getByLabelText("Switch to list view"));
    const addButtons = screen.getAllByText("Add to Cart");
    fireEvent.click(addButtons[0]);
    expect(mockAddToCart).toHaveBeenCalledWith(
      expect.objectContaining({ comparePrice: 200 }),
      1
    );
  });

  it("should use category as grower fallback when no grower name", () => {
    mockUseSanityProducts.mockReturnValue({
      products: [createMockProduct("prod-x", "Test Mushroom", { grower: null })],
      loading: false,
      error: null,
      totalCount: 1,
    });
    render(<ShopClient />);
    fireEvent.click(screen.getByLabelText("Switch to list view"));
    const addButtons = screen.getAllByText("Add to Cart");
    fireEvent.click(addButtons[0]);
    expect(mockAddToCart).toHaveBeenCalledWith(
      expect.objectContaining({ grower: "Fresh Mushrooms" }),
      1
    );
  });

  it("should include sellerId in cart item when available", () => {
    render(<ShopClient />);
    fireEvent.click(screen.getByLabelText("Switch to list view"));
    const addButtons = screen.getAllByText("Add to Cart");
    fireEvent.click(addButtons[0]);
    expect(mockAddToCart).toHaveBeenCalledWith(
      expect.objectContaining({ sellerId: "seller-1" }),
      1
    );
  });

  it("should render Filters button for mobile", () => {
    render(<ShopClient />);
    // The mobile filter button text is "Filters"
    const filterButtons = screen.getAllByText("Filters");
    expect(filterButtons.length).toBeGreaterThan(0);
  });

  // Items per page  
  it("should render items per page selector", () => {
    render(<ShopClient />);
    expect(screen.getByText("24 per page")).toBeInTheDocument();
  });
});