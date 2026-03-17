/**
 * ReviewInsights Component Tests
 *
 * Tests seller-specific review analytics: rating trends, per-product
 * distribution, keyword analysis, declining rating alerts, and
 * platform average comparison.
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock recharts to avoid SVG rendering issues in jsdom
jest.mock("recharts", () => {
  const OrigReact = require("react");
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    LineChart: ({ children, data }: any) => (
      <div data-testid="line-chart" data-count={data?.length}>
        {children}
      </div>
    ),
    BarChart: ({ children, data }: any) => (
      <div data-testid="bar-chart" data-count={data?.length}>
        {children}
      </div>
    ),
    Line: () => <div data-testid="line" />,
    Bar: ({ children }: any) => <div data-testid="bar">{children}</div>,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Cell: () => <div data-testid="cell" />,
  };
});

// Mock FirebaseReviewService
const mockGetAllReviews = jest.fn();
jest.mock("@/lib/firebase/reviews", () => ({
  FirebaseReviewService: {
    get getAllReviews() {
      return mockGetAllReviews;
    },
  },
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Star: (props: any) => <span data-testid="star-icon" {...props} />,
  TrendingDown: (props: any) => (
    <span data-testid="trending-down-icon" {...props} />
  ),
  TrendingUp: (props: any) => (
    <span data-testid="trending-up-icon" {...props} />
  ),
  AlertTriangle: (props: any) => (
    <span data-testid="alert-triangle-icon" {...props} />
  ),
  Hash: (props: any) => <span data-testid="hash-icon" {...props} />,
  BarChart3: (props: any) => (
    <span data-testid="barchart3-icon" {...props} />
  ),
}));

import ReviewInsights from "@/components/seller/ReviewInsights";
import type { FirestoreReview } from "@/types/reviews";

// ---- Helpers ----

function makeReview(overrides: Partial<FirestoreReview> = {}): FirestoreReview {
  return {
    id: "rev-1",
    userId: "user-1",
    userName: "Test User",
    userPhotoURL: null,
    targetType: "product",
    targetId: "prod-1",
    targetName: "Oyster Mushroom",
    rating: 4,
    title: "Great mushroom product",
    content: "The quality of the mushroom was excellent. Fresh delivery.",
    images: [],
    helpfulVotes: [],
    flaggedBy: [],
    flagReasons: [],
    flagCount: 0,
    status: "approved",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  } as FirestoreReview;
}

function makeReviews(count: number, baseOverrides: Partial<FirestoreReview> = {}): FirestoreReview[] {
  return Array.from({ length: count }, (_, i) =>
    makeReview({
      id: `rev-${i}`,
      userId: `user-${i}`,
      userName: `User ${i}`,
      rating: (i % 5) + 1,
      targetId: `prod-${i % 3}`,
      targetName: [`Oyster Mushroom`, `Shiitake`, `King Trumpet`][i % 3],
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      ...baseOverrides,
    })
  );
}

describe("ReviewInsights", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllReviews.mockResolvedValue({ reviews: [] });
  });

  // =============================================
  // Empty State
  // =============================================

  describe("empty state", () => {
    it("shows empty message when no reviews are provided", () => {
      render(<ReviewInsights reviews={[]} sellerAvgRating={0} />);
      expect(
        screen.getByText("No review data available for insights yet.")
      ).toBeInTheDocument();
    });

    it("does not render charts when no reviews exist", () => {
      render(<ReviewInsights reviews={[]} sellerAvgRating={0} />);
      expect(screen.queryByTestId("line-chart")).not.toBeInTheDocument();
      expect(screen.queryByTestId("bar-chart")).not.toBeInTheDocument();
    });
  });

  // =============================================
  // Platform Comparison Section
  // =============================================

  describe("platform comparison", () => {
    it("displays seller average rating", () => {
      const reviews = makeReviews(5);
      render(<ReviewInsights reviews={reviews} sellerAvgRating={4.2} />);
      expect(screen.getByText("4.2")).toBeInTheDocument();
      expect(screen.getByText("Your Average")).toBeInTheDocument();
    });

    it("shows platform average when fetched", async () => {
      mockGetAllReviews.mockResolvedValue({
        reviews: makeReviews(10, { rating: 3 }),
      });
      const reviews = makeReviews(5);
      render(<ReviewInsights reviews={reviews} sellerAvgRating={4.5} />);

      await waitFor(() => {
        expect(screen.getByText("Platform Average")).toBeInTheDocument();
      });
    });

    it("shows -- when platform average is not available", () => {
      mockGetAllReviews.mockResolvedValue({ reviews: [] });
      const reviews = makeReviews(5);
      render(<ReviewInsights reviews={reviews} sellerAvgRating={4.0} />);
      // Initial render shows -- before fetch resolves
      expect(screen.getAllByText("--").length).toBeGreaterThanOrEqual(1);
    });

    it("displays review count", () => {
      const reviews = makeReviews(7);
      render(<ReviewInsights reviews={reviews} sellerAvgRating={3.8} />);
      expect(screen.getByText("7 reviews")).toBeInTheDocument();
    });

    it("shows difference label as above or below average", async () => {
      mockGetAllReviews.mockResolvedValue({
        reviews: [makeReview({ rating: 3 })],
      });
      const reviews = makeReviews(3);
      render(<ReviewInsights reviews={reviews} sellerAvgRating={4.5} />);

      await waitFor(() => {
        expect(screen.getByText("Difference")).toBeInTheDocument();
      });
    });
  });

  // =============================================
  // Rating Trend Section
  // =============================================

  describe("rating trend", () => {
    it("renders the rating trend card with title", () => {
      const reviews = makeReviews(10);
      render(<ReviewInsights reviews={reviews} sellerAvgRating={4.0} />);
      expect(
        screen.getByText("Rating Trend (Last 3 Months)")
      ).toBeInTheDocument();
    });

    it("renders a line chart when trend data exists", () => {
      const reviews = makeReviews(10);
      render(<ReviewInsights reviews={reviews} sellerAvgRating={4.0} />);
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("shows 'Not enough data' when no reviews within 3 months", () => {
      // All reviews are very old (>3 months ago)
      const oldDate = new Date();
      oldDate.setMonth(oldDate.getMonth() - 6);
      const reviews = makeReviews(5, { createdAt: oldDate.toISOString() });
      render(<ReviewInsights reviews={reviews} sellerAvgRating={3.0} />);
      expect(
        screen.getByText("Not enough data for trend analysis")
      ).toBeInTheDocument();
    });
  });

  // =============================================
  // Per-Product Rating Distribution
  // =============================================

  describe("per-product ratings", () => {
    it("renders the rating by product card", () => {
      const reviews = makeReviews(6);
      render(<ReviewInsights reviews={reviews} sellerAvgRating={3.5} />);
      expect(screen.getByText("Rating by Product")).toBeInTheDocument();
    });

    it("renders bar chart for product ratings", () => {
      const reviews = makeReviews(6);
      render(<ReviewInsights reviews={reviews} sellerAvgRating={3.5} />);
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });
  });

  // =============================================
  // Keywords Section
  // =============================================

  describe("top keywords", () => {
    it("renders the keywords card", () => {
      const reviews = makeReviews(5);
      render(<ReviewInsights reviews={reviews} sellerAvgRating={4.0} />);
      expect(
        screen.getByText("Top Keywords from Reviews")
      ).toBeInTheDocument();
    });

    it("shows keywords when reviews contain repeated words", () => {
      const reviews = [
        makeReview({
          id: "r1",
          title: "mushroom delivery",
          content: "Fresh mushroom with great delivery speed",
        }),
        makeReview({
          id: "r2",
          title: "mushroom quality",
          content: "The mushroom was fresh and delivery was fast",
        }),
        makeReview({
          id: "r3",
          title: "fast delivery",
          content: "Great fresh mushroom product, delivery on time",
        }),
      ];
      render(<ReviewInsights reviews={reviews} sellerAvgRating={4.0} />);
      // "mushroom", "delivery", and "fresh" should appear as keywords
      expect(screen.getByText(/mushroom/)).toBeInTheDocument();
    });

    it("shows fallback text when not enough keyword data", () => {
      const reviews = [
        makeReview({ id: "r1", title: "ok", content: "fine" }),
      ];
      render(<ReviewInsights reviews={reviews} sellerAvgRating={3.0} />);
      expect(
        screen.getByText(/Need more reviews for keyword analysis/)
      ).toBeInTheDocument();
    });
  });

  // =============================================
  // Declining Ratings Alert
  // =============================================

  describe("declining ratings alert", () => {
    it("does not show alert when no products are declining", () => {
      const reviews = makeReviews(5, { rating: 5 });
      render(<ReviewInsights reviews={reviews} sellerAvgRating={5.0} />);
      expect(
        screen.queryByText("Products with Declining Ratings")
      ).not.toBeInTheDocument();
    });

    it("shows alert when a product has declining ratings", () => {
      const now = Date.now();
      const thirtyDaysAgo = now - 31 * 86400000;
      const sixtyDaysAgo = now - 61 * 86400000;

      const reviews = [
        // Old reviews with high rating
        makeReview({
          id: "old1",
          targetId: "p1",
          targetName: "Oyster",
          rating: 5,
          createdAt: new Date(sixtyDaysAgo).toISOString(),
        }),
        makeReview({
          id: "old2",
          targetId: "p1",
          targetName: "Oyster",
          rating: 5,
          createdAt: new Date(sixtyDaysAgo + 86400000).toISOString(),
        }),
        // Recent reviews with low rating (drop > 0.5)
        makeReview({
          id: "new1",
          targetId: "p1",
          targetName: "Oyster",
          rating: 2,
          createdAt: new Date(now - 5 * 86400000).toISOString(),
        }),
      ];

      render(<ReviewInsights reviews={reviews} sellerAvgRating={3.0} />);
      expect(
        screen.getByText("Products with Declining Ratings")
      ).toBeInTheDocument();
    });
  });

  // =============================================
  // Section Headers
  // =============================================

  describe("section structure", () => {
    it("renders all major section headers", () => {
      const reviews = makeReviews(10);
      render(<ReviewInsights reviews={reviews} sellerAvgRating={4.0} />);

      expect(
        screen.getByText("Your Rating vs Platform Average")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Rating Trend (Last 3 Months)")
      ).toBeInTheDocument();
      expect(screen.getByText("Rating by Product")).toBeInTheDocument();
      expect(
        screen.getByText("Top Keywords from Reviews")
      ).toBeInTheDocument();
    });

    it("renders all products label for platform average", () => {
      const reviews = makeReviews(3);
      render(<ReviewInsights reviews={reviews} sellerAvgRating={4.0} />);
      expect(screen.getByText("all products")).toBeInTheDocument();
    });
  });
});
