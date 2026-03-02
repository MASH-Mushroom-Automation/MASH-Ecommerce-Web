/**
 * Tests for Seller My Reviews Page
 * Target: src/app/(seller)/seller/my-reviews/page.tsx
 * Gap: UB=16, UF=15 — covers stats, filters, pagination, error/empty/loading states, review click, tabs
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock useSellerReviews hook
const mockSetSelectedProductId = jest.fn();
const mockSetRatingFilter = jest.fn();
const mockSetPage = jest.fn();

const mockStats = {
  averageRating: 4.2,
  totalReviews: 25,
  ratingDistribution: { 1: 1, 2: 2, 3: 3, 4: 9, 5: 10 },
};

const mockProducts = [
  { _id: "prod-1", name: "Oyster Mushroom", slug: "oyster-mushroom" },
  { _id: "prod-2", name: "Shiitake", slug: "shiitake" },
];

const mockReviews = [
  {
    id: "r1",
    userId: "u1",
    userName: "John Doe",
    rating: 5,
    title: "Excellent quality",
    content: "The mushrooms were fresh and amazing.",
    targetId: "prod-1",
    targetType: "product",
    targetName: "Oyster Mushroom",
    verifiedPurchase: true,
    createdAt: "2024-01-15T10:00:00Z",
    sellerResponse: null,
  },
  {
    id: "r2",
    userId: "u2",
    userName: "Jane Smith",
    rating: 3,
    title: "",
    content: "Decent product but packaging could be better.",
    targetId: "prod-2",
    targetType: "product",
    targetName: "Shiitake",
    verifiedPurchase: false,
    createdAt: "2024-01-10T10:00:00Z",
    sellerResponse: { text: "Thanks for the feedback!", respondedAt: "2024-01-11T10:00:00Z" },
  },
];

const defaultHookReturn = {
  reviews: mockReviews,
  stats: mockStats,
  products: mockProducts,
  loading: false,
  error: null,
  selectedProductId: null,
  setSelectedProductId: mockSetSelectedProductId,
  ratingFilter: null,
  setRatingFilter: mockSetRatingFilter,
  page: 0,
  setPage: mockSetPage,
  totalPages: 1,
  paginatedReviews: mockReviews,
  recentCount: 3,
};

jest.mock("@/hooks/useSellerReviews", () => ({
  useSellerReviews: jest.fn(() => defaultHookReturn),
}));

// Mock SellerResponseModal
jest.mock("@/components/seller/SellerResponseModal", () => ({
  SellerResponseModal: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? (
      <div data-testid="seller-response-modal">
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null,
}));

// Mock ReviewInsights
jest.mock("@/components/seller/ReviewInsights", () => ({
  __esModule: true,
  default: () => <div data-testid="review-insights">Insights Content</div>,
}));

// Mock recharts
jest.mock("recharts", () => ({
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  Cell: () => <div />,
}));

// Mock lucide-react
jest.mock("lucide-react", () =>
  new Proxy({}, { get: (_t, name) => (props: any) => <span data-testid={`icon-${String(name)}`} {...props} /> })
);

// Mock Select (Radix) — doesn't fire onValueChange in jsdom
jest.mock("@/components/ui/select", () => ({
  Select: ({ children }: any) => <div data-testid="select">{children}</div>,
  SelectTrigger: ({ children }: any) => <button data-testid="select-trigger">{children}</button>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

import Page from "../page";

describe("SellerMyReviewsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useSellerReviews } = require("@/hooks/useSellerReviews");
    useSellerReviews.mockReturnValue(defaultHookReturn);
  });

  // --- Page header ---
  it("renders page title", () => {
    render(<Page />);
    expect(screen.getByText("My Reviews")).toBeInTheDocument();
  });

  it("renders subtitle", () => {
    render(<Page />);
    expect(screen.getByText("Reviews and ratings for your products")).toBeInTheDocument();
  });

  // --- Tab navigation ---
  it("renders Reviews and Insights tab buttons", () => {
    render(<Page />);
    expect(screen.getByRole("button", { name: /Reviews/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Insights/i })).toBeInTheDocument();
  });

  it("shows ReviewInsights when Insights tab clicked", () => {
    render(<Page />);
    fireEvent.click(screen.getByRole("button", { name: /Insights/i }));
    expect(screen.getByTestId("review-insights")).toBeInTheDocument();
  });

  it("shows loading spinner on Insights tab when loading", () => {
    const { useSellerReviews } = require("@/hooks/useSellerReviews");
    useSellerReviews.mockReturnValue({ ...defaultHookReturn, loading: true });
    render(<Page />);
    fireEvent.click(screen.getByRole("button", { name: /Insights/i }));
    expect(screen.getByTestId("icon-Loader2")).toBeInTheDocument();
  });

  // --- Summary stats ---
  it("renders average rating stat card", () => {
    render(<Page />);
    expect(screen.getByText("Average Rating")).toBeInTheDocument();
    expect(screen.getByText("4.2")).toBeInTheDocument();
    expect(screen.getByText("out of 5")).toBeInTheDocument();
  });

  it("renders total reviews stat card", () => {
    render(<Page />);
    expect(screen.getByText("Total Reviews")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
  });

  it("renders recent 7d stat card", () => {
    render(<Page />);
    expect(screen.getByText("Recent (7d)")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("last 7 days")).toBeInTheDocument();
  });

  it("renders products stat card", () => {
    render(<Page />);
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("with reviews")).toBeInTheDocument();
  });

  // --- Rating distribution chart ---
  it("renders rating distribution chart", () => {
    render(<Page />);
    expect(screen.getByText("Rating Distribution")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("hides rating distribution chart when totalReviews is 0", () => {
    const { useSellerReviews } = require("@/hooks/useSellerReviews");
    useSellerReviews.mockReturnValue({
      ...defaultHookReturn,
      stats: { ...mockStats, totalReviews: 0 },
    });
    render(<Page />);
    expect(screen.queryByText("Rating Distribution")).not.toBeInTheDocument();
  });

  // --- Review list ---
  it("renders review cards with user names", () => {
    render(<Page />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("renders review content", () => {
    render(<Page />);
    expect(screen.getByText("The mushrooms were fresh and amazing.")).toBeInTheDocument();
  });

  it("renders review title when present", () => {
    render(<Page />);
    expect(screen.getByText("Excellent quality")).toBeInTheDocument();
  });

  it("shows Verified badge for verified purchase", () => {
    render(<Page />);
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });

  it("shows Responded badge for reviews with seller response", () => {
    render(<Page />);
    expect(screen.getByText("Responded")).toBeInTheDocument();
  });

  it("shows product name in review card", () => {
    render(<Page />);
    expect(screen.getAllByText("Oyster Mushroom").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Shiitake").length).toBeGreaterThanOrEqual(1);
  });

  // --- Review click opens modal ---
  it("opens SellerResponseModal when review card is clicked", () => {
    render(<Page />);
    expect(screen.queryByTestId("seller-response-modal")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("John Doe").closest("[class*='cursor-pointer']")!);
    expect(screen.getByTestId("seller-response-modal")).toBeInTheDocument();
  });

  it("closes modal on close button click", () => {
    render(<Page />);
    fireEvent.click(screen.getByText("John Doe").closest("[class*='cursor-pointer']")!);
    expect(screen.getByTestId("seller-response-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Close Modal"));
    expect(screen.queryByTestId("seller-response-modal")).not.toBeInTheDocument();
  });

  // --- Loading state ---
  it("shows loading spinner when reviews tab is loading", () => {
    const { useSellerReviews } = require("@/hooks/useSellerReviews");
    useSellerReviews.mockReturnValue({
      ...defaultHookReturn,
      loading: true,
      paginatedReviews: [],
    });
    render(<Page />);
    expect(screen.getByTestId("icon-Loader2")).toBeInTheDocument();
  });

  // --- Empty state ---
  it("shows empty state when no reviews and no filters", () => {
    const { useSellerReviews } = require("@/hooks/useSellerReviews");
    useSellerReviews.mockReturnValue({
      ...defaultHookReturn,
      paginatedReviews: [],
      reviews: [],
    });
    render(<Page />);
    expect(screen.getByText("No reviews found")).toBeInTheDocument();
    expect(screen.getByText("Your products don't have any reviews yet")).toBeInTheDocument();
  });

  it("shows filter hint in empty state when filters active", () => {
    const { useSellerReviews } = require("@/hooks/useSellerReviews");
    useSellerReviews.mockReturnValue({
      ...defaultHookReturn,
      paginatedReviews: [],
      reviews: [],
      selectedProductId: "prod-1",
    });
    render(<Page />);
    expect(screen.getByText("Try adjusting your filters")).toBeInTheDocument();
  });

  it("shows filter hint when ratingFilter is active", () => {
    const { useSellerReviews } = require("@/hooks/useSellerReviews");
    useSellerReviews.mockReturnValue({
      ...defaultHookReturn,
      paginatedReviews: [],
      reviews: [],
      ratingFilter: 5,
    });
    render(<Page />);
    expect(screen.getByText("Try adjusting your filters")).toBeInTheDocument();
  });

  // --- Error state ---
  it("renders error card when error is present", () => {
    const { useSellerReviews } = require("@/hooks/useSellerReviews");
    useSellerReviews.mockReturnValue({
      ...defaultHookReturn,
      error: "Something went wrong loading reviews",
    });
    render(<Page />);
    expect(screen.getByText("Error loading reviews")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong loading reviews")).toBeInTheDocument();
  });

  // --- Pagination ---
  it("renders pagination controls when totalPages > 1", () => {
    const { useSellerReviews } = require("@/hooks/useSellerReviews");
    useSellerReviews.mockReturnValue({
      ...defaultHookReturn,
      totalPages: 3,
      reviews: Array(45).fill(mockReviews[0]),
    });
    render(<Page />);
    expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Previous/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Next/i })).toBeInTheDocument();
  });

  it("disables Previous button on first page", () => {
    const { useSellerReviews } = require("@/hooks/useSellerReviews");
    useSellerReviews.mockReturnValue({
      ...defaultHookReturn,
      page: 0,
      totalPages: 3,
      reviews: Array(45).fill(mockReviews[0]),
    });
    render(<Page />);
    expect(screen.getByRole("button", { name: /Previous/i })).toBeDisabled();
  });

  it("disables Next button on last page", () => {
    const { useSellerReviews } = require("@/hooks/useSellerReviews");
    useSellerReviews.mockReturnValue({
      ...defaultHookReturn,
      page: 2,
      totalPages: 3,
      reviews: Array(45).fill(mockReviews[0]),
    });
    render(<Page />);
    expect(screen.getByRole("button", { name: /Next/i })).toBeDisabled();
  });

  it("calls setPage when Next button is clicked", () => {
    const { useSellerReviews } = require("@/hooks/useSellerReviews");
    useSellerReviews.mockReturnValue({
      ...defaultHookReturn,
      page: 0,
      totalPages: 3,
      reviews: Array(45).fill(mockReviews[0]),
    });
    render(<Page />);
    fireEvent.click(screen.getByRole("button", { name: /Next/i }));
    expect(mockSetPage).toHaveBeenCalledWith(1);
  });

  it("calls setPage when Previous button is clicked", () => {
    const { useSellerReviews } = require("@/hooks/useSellerReviews");
    useSellerReviews.mockReturnValue({
      ...defaultHookReturn,
      page: 1,
      totalPages: 3,
      reviews: Array(45).fill(mockReviews[0]),
    });
    render(<Page />);
    fireEvent.click(screen.getByRole("button", { name: /Previous/i }));
    expect(mockSetPage).toHaveBeenCalledWith(0);
  });

  it("hides pagination when only 1 page", () => {
    render(<Page />);
    expect(screen.queryByRole("button", { name: /Previous/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Next/i })).not.toBeInTheDocument();
  });

  // --- Filters ---
  it("renders product filter dropdown", () => {
    render(<Page />);
    const triggers = screen.getAllByTestId("select-trigger");
    expect(triggers.length).toBeGreaterThanOrEqual(1);
  });

  it("renders rating filter dropdown", () => {
    render(<Page />);
    const triggers = screen.getAllByTestId("select-trigger");
    expect(triggers.length).toBeGreaterThanOrEqual(2);
  });

  // --- RatingStars sub-component ---
  it("renders star icons for each review", () => {
    render(<Page />);
    // Each review has 5 stars = 10 star icons total for 2 reviews
    const stars = screen.getAllByTestId("icon-Star");
    expect(stars.length).toBeGreaterThanOrEqual(10);
  });
});
