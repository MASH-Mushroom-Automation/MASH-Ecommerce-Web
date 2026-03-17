/**
 * Homepage render tests (Client Component)
 * COV-012: Page coverage batch
 */
import React from "react";
import { render, screen } from "@testing-library/react";

// Mock all heavy sub-components
jest.mock("@/components/hero/SanityHeroCarousel", () => ({
  SanityHeroCarousel: () => <div data-testid="hero-carousel">Hero</div>,
}));
jest.mock("@/components/cms/SanityFeatureSection", () => ({
  SanityFeatureSection: () => <div data-testid="feature-section">Features</div>,
}));
jest.mock("@/components/cms/TestimonialsSection", () => ({
  TestimonialsSection: () => <div data-testid="testimonials">Testimonials</div>,
}));
jest.mock("@/components/cms/HowItWorks", () => ({
  HowItWorks: () => <div data-testid="how-it-works">How It Works</div>,
}));
jest.mock("@/components/product/ProductCard", () => ({
  ProductCard: (props: Record<string, unknown>) => (
    <div data-testid="product-card">{String(props.name)}</div>
  ),
}));
jest.mock("@/components/ui/loading-spinner", () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));
jest.mock("@/components/ui/skeleton-loaders", () => ({
  ProductListSkeleton: () => <div data-testid="product-skeleton">Product Skeleton</div>,
  GrowerListSkeleton: () => <div data-testid="grower-skeleton">Grower Skeleton</div>,
}));
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => (
    <img src={String(props.src || "")} alt={String(props.alt || "")} />
  ),
}));

// Mock hooks
const mockUseSanityFeatures = jest.fn();
const mockUseSanityFeaturedProducts = jest.fn();
const mockUseSanityCategories = jest.fn();
const mockUseProductRatings = jest.fn();
const mockUseSanityGrowers = jest.fn();

jest.mock("@/hooks/useSanityFeatures", () => ({
  useSanityFeatures: () => mockUseSanityFeatures(),
}));
jest.mock("@/hooks/useSanityProducts", () => ({
  useSanityFeaturedProducts: () => mockUseSanityFeaturedProducts(),
}));
jest.mock("@/hooks/useSanityCategories", () => ({
  useSanityCategories: () => mockUseSanityCategories(),
}));
jest.mock("@/hooks/useProductRatings", () => ({
  useProductRatings: () => mockUseProductRatings(),
}));
jest.mock("@/hooks/useSanityGrowers", () => ({
  useSanityGrowers: () => mockUseSanityGrowers(),
}));

import Home from "../page";

describe("Home", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: everything loaded successfully with empty data
    mockUseSanityFeatures.mockReturnValue({ features: [], loading: false, error: null });
    mockUseSanityFeaturedProducts.mockReturnValue({ products: [], loading: false, error: null });
    mockUseSanityCategories.mockReturnValue({ categories: [], loading: false, error: null });
    mockUseProductRatings.mockReturnValue({ ratings: {} });
    mockUseSanityGrowers.mockReturnValue({ growers: [], loading: false, error: null });
  });

  it("renders all main sections", () => {
    render(<Home />);
    expect(screen.getByTestId("hero-carousel")).toBeInTheDocument();
    expect(screen.getByTestId("how-it-works")).toBeInTheDocument();
    expect(screen.getByTestId("testimonials")).toBeInTheDocument();
  });

  it("shows loading skeletons when data is loading", () => {
    mockUseSanityFeaturedProducts.mockReturnValue({ products: null, loading: true, error: null });
    mockUseSanityGrowers.mockReturnValue({ growers: null, loading: true, error: null });
    render(<Home />);
    expect(screen.getByTestId("product-skeleton")).toBeInTheDocument();
    expect(screen.getByTestId("grower-skeleton")).toBeInTheDocument();
  });

  it("shows features section when features exist", () => {
    mockUseSanityFeatures.mockReturnValue({
      features: [{ id: "f1", title: "Feature One" }],
      loading: false,
      error: null,
    });
    render(<Home />);
    expect(screen.getByTestId("feature-section")).toBeInTheDocument();
  });

  it("shows product cards when products exist", () => {
    mockUseSanityFeaturedProducts.mockReturnValue({
      products: [
        { id: "p1", slug: "mushroom-1", name: "King Oyster", price: 250, category: "Premium", unit: "kg", image: null, isAvailable: true },
        { id: "p2", slug: "mushroom-2", name: "Shiitake", price: 300, category: "Gourmet", unit: "kg", image: null, isAvailable: true },
      ],
      loading: false,
      error: null,
    });
    render(<Home />);
    expect(screen.getByText("Our Bestsellers")).toBeInTheDocument();
    expect(screen.getAllByTestId("product-card")).toHaveLength(2);
  });

  it("shows error state for featured products", () => {
    mockUseSanityFeaturedProducts.mockReturnValue({
      products: null,
      loading: false,
      error: new Error("Failed"),
    });
    render(<Home />);
    expect(screen.getByText(/error loading featured products/i)).toBeInTheDocument();
  });

  it("shows error state for features section", () => {
    mockUseSanityFeatures.mockReturnValue({
      features: [],
      loading: false,
      error: new Error("Feature load failed"),
    });
    render(<Home />);
    expect(screen.getByText(/feature load failed/i)).toBeInTheDocument();
  });
});
