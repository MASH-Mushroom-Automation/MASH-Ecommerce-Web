import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

/* ================================================================
 * Mock ALL dependencies before any component import
 * ================================================================ */

// lucide-react icons
jest.mock("lucide-react", () => {
  const icons = ["Star", "Tag", "ChevronRight", "Heart", "Share2", "ShoppingCart", "Minus", "Plus", "Check", "X", "Loader2", "Package", "Truck", "Shield", "Clock"];
  const mocks: Record<string, unknown> = {};
  icons.forEach((name) => {
    mocks[name] = (props: Record<string, unknown>) =>
      React.createElement("span", { "data-testid": `icon-${name}`, ...props });
  });
  return { __esModule: true, ...mocks };
});

// Mock hooks
const mockProduct = {
  id: "prod-1",
  name: "Test Mushrooms",
  slug: "test-mushrooms",
  price: 120,
  compareAtPrice: 150,
  images: ["/img1.jpg", "/img2.jpg"],
  image: "/img1.jpg",
  stock: 10,
  category: "Mushrooms",
  categorySlug: "mushrooms",
  description: "Delicious test mushrooms",
  isPromo: false,
  unit: "kg",
  sku: "MUSH-001",
  weight: "500g",
  productTags: ["organic", "fresh"],
  sellerId: "seller-1",
  grower: { id: "g1", slug: "grower-1", name: "Good Grower" },
  freshnessInfo: { harvestWindow: "24h", shelfLife: "7 days", storageInstructions: "Refrigerate", qualityIndicators: ["Firm"] },
  preparationInfo: { difficultyLevel: "beginner", cookingTime: "15 min", preparationTips: ["Wash"], recipeIdeas: ["Soup"] },
  nutritionalHighlights: ["High protein"],
};

const mockUseSanityProduct = jest.fn(() => ({
  product: mockProduct,
  loading: false,
  error: null,
}));

const mockUseSanitySuggestedProducts = jest.fn(() => ({
  suggestedProducts: [
    { id: "s1", name: "Suggested A", slug: "suggested-a", price: 80, image: "/s1.png", isAvailable: true },
  ],
  loading: false,
}));

jest.mock("@/hooks/useSanityProducts", () => ({
  useSanityProduct: (...args: unknown[]) => mockUseSanityProduct(...args),
  useSanitySuggestedProducts: (...args: unknown[]) => mockUseSanitySuggestedProducts(...args),
}));

jest.mock("@/hooks/useSanityReviews", () => ({
  useSanityReviews: () => ({ reviews: [], rating: 4.5, loading: false }),
}));

jest.mock("@/hooks/useStockSync", () => ({
  useStockSync: (_id: string, stock: number) => stock,
}));

jest.mock("@/hooks/useRecentlyViewed", () => ({
  useRecentlyViewed: () => ({ trackView: jest.fn() }),
}));

jest.mock("@/lib/analytics", () => ({
  trackProductView: jest.fn(),
  trackAddToCart: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  isAuthenticated: jest.fn(() => true),
}));

// Context mocks
const mockAddToCart = jest.fn(() => true);
jest.mock("@/contexts/CartContext", () => ({
  useCart: () => ({ addToCart: mockAddToCart }),
}));

const mockIsInWishlist = jest.fn(() => false);
const mockAddToWishlist = jest.fn();
const mockRemoveFromWishlist = jest.fn();
jest.mock("@/contexts/WishlistContext", () => ({
  useWishlist: () => ({
    isInWishlist: mockIsInWishlist,
    addToWishlist: mockAddToWishlist,
    removeFromWishlist: mockRemoveFromWishlist,
  }),
}));

jest.mock("@/contexts/ChatContext", () => ({
  useChat: () => ({ setIsOpen: jest.fn(), sendMessage: jest.fn() }),
}));

// Mock all child components as simple stubs
jest.mock("@/components/product/ProductGallery", () => ({
  ProductGallery: (props: Record<string, unknown>) =>
    React.createElement("div", { "data-testid": "product-gallery" }, `Gallery: ${props.productName}`),
  buildGallery: (product: Record<string, unknown>) => {
    const images = (product.images as string[]) || [];
    return images.length > 0 ? images.map((img: string) => ({ type: "image", src: img })) : [{ type: "image", src: product.image }];
  },
}));

jest.mock("@/components/product/ProductInfoSection", () => ({
  ProductInfo: (props: Record<string, unknown>) =>
    React.createElement("div", { "data-testid": "product-info" }, [
      React.createElement("span", { key: "name" }, String((props.product as Record<string, unknown>)?.name || "")),
      React.createElement("button", { key: "add", onClick: props.onAddToCart as () => void }, "Add to Cart"),
    ]),
}));

jest.mock("@/components/product/ProductDetailCards", () => ({
  ProductDetailCards: () => React.createElement("div", { "data-testid": "detail-cards" }, "Product Details"),
}));

jest.mock("@/components/product/SuggestedProducts", () => ({
  SuggestedProducts: (props: Record<string, unknown>) =>
    React.createElement("div", { "data-testid": "suggested-products" }, `Suggestions: ${(props.products as unknown[])?.length || 0}`),
}));

jest.mock("@/components/reviews/FirebaseReviewSection", () => ({
  FirebaseReviewSection: () => React.createElement("div", { "data-testid": "reviews" }, "Reviews Section"),
}));

jest.mock("@/components/products/RecentlyViewed", () => ({
  RecentlyViewed: () => React.createElement("div", { "data-testid": "recently-viewed" }, "Recently Viewed"),
}));

jest.mock("@/components/product/StickyAddToCartBar", () => ({
  StickyAddToCartBar: () => React.createElement("div", { "data-testid": "sticky-bar" }, "Sticky Bar"),
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, ...props }: { children: React.ReactNode }) =>
    React.createElement("span", { "data-testid": "badge", ...props }, children),
}));

/* ================================================================ */

describe("ProductDetailClient", () => {
  let ProductDetailClient: React.FC<{ slug: string }>;

  beforeAll(() => {
    // Dynamic require to ensure all mocks are set up first
    const mod = require("../ProductDetailClient");
    ProductDetailClient = mod.ProductDetailClient;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSanityProduct.mockReturnValue({ product: mockProduct, loading: false, error: null });
    mockUseSanitySuggestedProducts.mockReturnValue({ suggestedProducts: [{ id: "s1", name: "Suggested A", slug: "suggested-a", price: 80 }], loading: false });
    mockIsInWishlist.mockReturnValue(false);
    mockAddToCart.mockReturnValue(true);
  });

  it("renders product name and key sections when loaded", () => {
    render(<ProductDetailClient slug="test-mushrooms" />);
    expect(screen.getAllByText("Test Mushrooms").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId("product-gallery")).toBeInTheDocument();
    expect(screen.getByTestId("product-info")).toBeInTheDocument();
    expect(screen.getByTestId("detail-cards")).toBeInTheDocument();
    expect(screen.getByTestId("reviews")).toBeInTheDocument();
    expect(screen.getByTestId("recently-viewed")).toBeInTheDocument();
    expect(screen.getByTestId("sticky-bar")).toBeInTheDocument();
  });

  it("renders loading state when product is loading", () => {
    mockUseSanityProduct.mockReturnValue({ product: null, loading: true, error: null });
    render(<ProductDetailClient slug="test-mushrooms" />);
    expect(screen.getByText("Loading product...")).toBeInTheDocument();
    expect(screen.queryByTestId("product-gallery")).not.toBeInTheDocument();
  });

  it("calls notFound when product has error", () => {
    const notFound = require("next/navigation").notFound;
    mockUseSanityProduct.mockReturnValue({ product: null, loading: false, error: "Not found" });
    expect(() => render(<ProductDetailClient slug="bad-slug" />)).toThrow();
  });

  it("renders breadcrumb with category link", () => {
    render(<ProductDetailClient slug="test-mushrooms" />);
    expect(screen.getByText("Shop")).toBeInTheDocument();
    expect(screen.getByText("Mushrooms")).toBeInTheDocument();
  });

  it("renders product tags as badges", () => {
    render(<ProductDetailClient slug="test-mushrooms" />);
    const badges = screen.getAllByTestId("badge");
    expect(badges.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("#organic")).toBeInTheDocument();
    expect(screen.getByText("#fresh")).toBeInTheDocument();
  });

  it("renders suggested products section", () => {
    render(<ProductDetailClient slug="test-mushrooms" />);
    expect(screen.getByTestId("suggested-products")).toBeInTheDocument();
    expect(screen.getByText("Suggestions: 1")).toBeInTheDocument();
  });

  it("handles add to cart via ProductInfo stub", () => {
    render(<ProductDetailClient slug="test-mushrooms" />);
    fireEvent.click(screen.getByText("Add to Cart"));
    expect(mockAddToCart).toHaveBeenCalled();
  });
});
