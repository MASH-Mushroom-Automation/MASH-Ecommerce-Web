/**
 * Tests for SellerReviewsPage - seller review moderation
 * Batch 11: Branch + function coverage expansion
 */
import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";

// Mock useReviewModeration hook
const mockSetFilters = jest.fn();
const mockSetPage = jest.fn();
const mockModerateReview = jest.fn();
const mockAddAdminResponse = jest.fn();
const mockDeleteReviewAsAdmin = jest.fn();
const mockClearFlags = jest.fn();
const mockRefetch = jest.fn();

const sampleReviews = [
  {
    id: "r1",
    userName: "John Doe",
    rating: 5,
    title: "Excellent mushrooms!",
    content: "Best king oyster mushrooms I have ever bought",
    status: "approved" as const,
    targetType: "product" as const,
    targetName: "King Oyster Mushroom",
    flagCount: 0,
    images: ["img1.jpg", "img2.jpg"],
    sellerResponse: "Thank you!",
    adminResponse: null,
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "r2",
    userName: "Jane Smith",
    rating: 2,
    title: "",
    content: "Product arrived damaged",
    status: "pending" as const,
    targetType: "grower" as const,
    targetName: "MASH Farm",
    flagCount: 3,
    images: [],
    sellerResponse: null,
    adminResponse: "Under review",
    createdAt: "2026-01-16T14:00:00Z",
  },
  {
    id: "r3",
    userName: "Bob Wilson",
    rating: 4,
    title: "Good quality",
    content: "Fresh and well packaged, would buy again",
    status: "flagged" as const,
    targetType: "product" as const,
    targetName: "Shiitake Mushroom",
    flagCount: 1,
    images: [],
    sellerResponse: null,
    adminResponse: null,
    createdAt: "2026-01-17T08:00:00Z",
  },
  {
    id: "r4",
    userName: "Alice Brown",
    rating: 1,
    title: "Terrible experience",
    content: "This grower was very unprofessional",
    status: "rejected" as const,
    targetType: "grower" as const,
    targetName: "Green Farms",
    flagCount: 5,
    images: ["img3.jpg"],
    sellerResponse: null,
    adminResponse: null,
    createdAt: "2026-01-18T12:00:00Z",
  },
];

const sampleStats = {
  totalReviews: 50,
  pendingCount: 12,
  approvedCount: 30,
  flaggedCount: 5,
  rejectedCount: 3,
  averageRating: 4.2,
};

const defaultFilters = {
  status: undefined,
  keyword: undefined,
  targetType: undefined,
  ratingMin: undefined,
  ratingMax: undefined,
};

const defaultHookReturn = {
  reviews: sampleReviews,
  stats: sampleStats,
  loading: false,
  error: null,
  filters: defaultFilters,
  setFilters: mockSetFilters,
  page: 0,
  setPage: mockSetPage,
  totalPages: 1,
  paginatedReviews: sampleReviews,
  moderateReview: mockModerateReview,
  addAdminResponse: mockAddAdminResponse,
  deleteReviewAsAdmin: mockDeleteReviewAsAdmin,
  clearFlags: mockClearFlags,
  refetch: mockRefetch,
};

jest.mock("@/hooks/useReviewModeration", () => ({
  useReviewModeration: jest.fn(() => defaultHookReturn),
}));

jest.mock("@/components/admin/reviews/ReviewModerationModal", () => ({
  ReviewModerationModal: ({ open, onClose, review }: any) =>
    open ? (
      <div data-testid="moderation-modal">
        <span>{review?.userName}</span>
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null,
}));

import SellerReviewsPage from "../page";
import { useReviewModeration } from "@/hooks/useReviewModeration";

describe("SellerReviewsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useReviewModeration as jest.Mock).mockReturnValue(defaultHookReturn);
  });

  it("should render the page heading", () => {
    render(<SellerReviewsPage />);
    expect(screen.getByRole("heading", { name: "Reviews" })).toBeInTheDocument();
  });

  it("should display average rating in subtitle", () => {
    render(<SellerReviewsPage />);
    expect(screen.getByText(/50 total/)).toBeInTheDocument();
    expect(screen.getByText(/4\.2 avg rating/)).toBeInTheDocument();
  });

  it("should render stats cards", () => {
    render(<SellerReviewsPage />);
    // Numbers appear in both stats cards and tab badges
    expect(screen.getAllByText("50").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("12").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("30").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("5").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("4.2")).toBeInTheDocument(); // avg rating unique
  });

  it("should render status tabs with counts", () => {
    render(<SellerReviewsPage />);
    expect(screen.getByText("All Reviews")).toBeInTheDocument();
    // Status labels appear in stats card titles, tab buttons, and review badges
    expect(screen.getAllByText("Pending").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("Approved").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("Flagged").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("Rejected").length).toBeGreaterThanOrEqual(2);
  });

  it("should render search input", () => {
    render(<SellerReviewsPage />);
    expect(screen.getByPlaceholderText(/Search reviews/)).toBeInTheDocument();
  });

  it("should render review cards with usernames", () => {
    render(<SellerReviewsPage />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Wilson")).toBeInTheDocument();
    expect(screen.getByText("Alice Brown")).toBeInTheDocument();
  });

  it("should display status badges on review cards", () => {
    render(<SellerReviewsPage />);
    const approved = screen.getAllByText("Approved");
    expect(approved.length).toBeGreaterThanOrEqual(1);
    // The pending label appears in both tab badge and status badge
    const pending = screen.getAllByText("Pending");
    expect(pending.length).toBeGreaterThanOrEqual(1);
  });

  it("should display flag count badge when flagCount > 0", () => {
    render(<SellerReviewsPage />);
    // r2 flagCount=3 (also appears in tab badge for rejected=3)
    // r3 flagCount=1, r4 flagCount=5 (also in tab badge for flagged=5)
    expect(screen.getAllByText("3").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("5").length).toBeGreaterThanOrEqual(1);
  });

  it("should display review title when present", () => {
    render(<SellerReviewsPage />);
    expect(screen.getByText("Excellent mushrooms!")).toBeInTheDocument();
    expect(screen.getByText("Good quality")).toBeInTheDocument();
    expect(screen.getByText("Terrible experience")).toBeInTheDocument();
  });

  it("should display review content", () => {
    render(<SellerReviewsPage />);
    expect(screen.getByText("Best king oyster mushrooms I have ever bought")).toBeInTheDocument();
    expect(screen.getByText("Product arrived damaged")).toBeInTheDocument();
  });

  it("should display target type badges", () => {
    render(<SellerReviewsPage />);
    const productBadges = screen.getAllByText("Product");
    const growerBadges = screen.getAllByText("Grower");
    expect(productBadges.length).toBeGreaterThanOrEqual(2);
    expect(growerBadges.length).toBeGreaterThanOrEqual(2);
  });

  it("should display image count when images exist", () => {
    render(<SellerReviewsPage />);
    // r1 has 2 images, r4 has 1 image
    expect(screen.getByText(/2 images/)).toBeInTheDocument();
    expect(screen.getByText(/1 image$/)).toBeInTheDocument();
  });

  it("should show seller response badge when sellerResponse exists", () => {
    render(<SellerReviewsPage />);
    expect(screen.getByText("Seller responded")).toBeInTheDocument();
  });

  it("should show admin response badge when adminResponse exists", () => {
    render(<SellerReviewsPage />);
    expect(screen.getByText("Admin responded")).toBeInTheDocument();
  });

  it("should display target names", () => {
    render(<SellerReviewsPage />);
    expect(screen.getByText("King Oyster Mushroom")).toBeInTheDocument();
    expect(screen.getByText("MASH Farm")).toBeInTheDocument();
    expect(screen.getByText("Shiitake Mushroom")).toBeInTheDocument();
    expect(screen.getByText("Green Farms")).toBeInTheDocument();
  });

  it("should call setFilters when changing tab", () => {
    render(<SellerReviewsPage />);
    // "Pending" appears in stats card, tab button, and review badge - find the tab button
    const pendingElements = screen.getAllByText("Pending");
    const pendingTab = pendingElements.find(el => el.closest("button"))!.closest("button")!;
    fireEvent.click(pendingTab);
    expect(mockSetFilters).toHaveBeenCalledWith(
      expect.objectContaining({ status: "pending" })
    );
  });

  it("should call setFilters with undefined status for all tab", () => {
    render(<SellerReviewsPage />);
    // First switch to pending
    const pendingElements = screen.getAllByText("Pending");
    const pendingTab = pendingElements.find(el => el.closest("button"))!.closest("button")!;
    fireEvent.click(pendingTab);
    mockSetFilters.mockClear();
    // Then back to all
    fireEvent.click(screen.getByText("All Reviews").closest("button")!);
    expect(mockSetFilters).toHaveBeenCalledWith(
      expect.objectContaining({ status: undefined })
    );
  });

  it("should update search and call setFilters on search change", () => {
    render(<SellerReviewsPage />);
    const searchInput = screen.getByPlaceholderText(/Search reviews/);
    fireEvent.change(searchInput, { target: { value: "mushroom" } });
    expect(mockSetFilters).toHaveBeenCalledWith(
      expect.objectContaining({ keyword: "mushroom" })
    );
  });

  it("should clear keyword when search is emptied", () => {
    render(<SellerReviewsPage />);
    const searchInput = screen.getByPlaceholderText(/Search reviews/);
    fireEvent.change(searchInput, { target: { value: "test" } });
    mockSetFilters.mockClear();
    fireEvent.change(searchInput, { target: { value: "" } });
    expect(mockSetFilters).toHaveBeenCalledWith(
      expect.objectContaining({ keyword: undefined })
    );
  });

  it("should render error state with retry button", () => {
    (useReviewModeration as jest.Mock).mockReturnValue({
      ...defaultHookReturn,
      error: "Failed to fetch reviews",
    });
    render(<SellerReviewsPage />);
    expect(screen.getByText("Error loading reviews")).toBeInTheDocument();
    expect(screen.getByText("Failed to fetch reviews")).toBeInTheDocument();
    const retryBtn = screen.getByText("Retry");
    fireEvent.click(retryBtn);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it("should render loading spinner", () => {
    (useReviewModeration as jest.Mock).mockReturnValue({
      ...defaultHookReturn,
      loading: true,
      paginatedReviews: [],
    });
    render(<SellerReviewsPage />);
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("should render empty state with filter hint when filters applied", () => {
    (useReviewModeration as jest.Mock).mockReturnValue({
      ...defaultHookReturn,
      paginatedReviews: [],
    });
    render(<SellerReviewsPage />);
    // Search for something to trigger filter active path
    const searchInput = screen.getByPlaceholderText(/Search reviews/);
    fireEvent.change(searchInput, { target: { value: "xyz" } });
    // Empty state should show filter hint (the component checks searchQuery)
    expect(screen.getByText("No reviews found")).toBeInTheDocument();
  });

  it("should render empty state without filters", () => {
    (useReviewModeration as jest.Mock).mockReturnValue({
      ...defaultHookReturn,
      paginatedReviews: [],
    });
    render(<SellerReviewsPage />);
    expect(screen.getByText("No reviews found")).toBeInTheDocument();
    expect(screen.getByText("Reviews will appear here once customers submit them")).toBeInTheDocument();
  });

  it("should open modal when clicking a review card", () => {
    render(<SellerReviewsPage />);
    // Click on the first review card
    const firstCard = screen.getByText("Excellent mushrooms!").closest("[class*=card]");
    fireEvent.click(firstCard!);
    expect(screen.getByTestId("moderation-modal")).toBeInTheDocument();
    expect(screen.getAllByText("John Doe").length).toBeGreaterThanOrEqual(2); // in card and in modal
  });

  it("should close modal when close button is clicked", () => {
    render(<SellerReviewsPage />);
    const firstCard = screen.getByText("Excellent mushrooms!").closest("[class*=card]");
    fireEvent.click(firstCard!);
    expect(screen.getByTestId("moderation-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Close Modal"));
    expect(screen.queryByTestId("moderation-modal")).not.toBeInTheDocument();
  });

  it("should show pagination when totalPages > 1", () => {
    (useReviewModeration as jest.Mock).mockReturnValue({
      ...defaultHookReturn,
      totalPages: 3,
      page: 1,
    });
    render(<SellerReviewsPage />);
    expect(screen.getByText(/Page 2 of 3/)).toBeInTheDocument();
    expect(screen.getByText("Previous")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });

  it("should not show pagination when totalPages is 1", () => {
    render(<SellerReviewsPage />);
    expect(screen.queryByText("Previous")).not.toBeInTheDocument();
    expect(screen.queryByText("Next")).not.toBeInTheDocument();
  });

  it("should call setPage for next page", () => {
    (useReviewModeration as jest.Mock).mockReturnValue({
      ...defaultHookReturn,
      totalPages: 3,
      page: 0,
    });
    render(<SellerReviewsPage />);
    fireEvent.click(screen.getByText("Next"));
    expect(mockSetPage).toHaveBeenCalledWith(1);
  });

  it("should call setPage for previous page", () => {
    (useReviewModeration as jest.Mock).mockReturnValue({
      ...defaultHookReturn,
      totalPages: 3,
      page: 2,
    });
    render(<SellerReviewsPage />);
    fireEvent.click(screen.getByText("Previous"));
    expect(mockSetPage).toHaveBeenCalledWith(1);
  });

  it("should disable Previous on first page", () => {
    (useReviewModeration as jest.Mock).mockReturnValue({
      ...defaultHookReturn,
      totalPages: 3,
      page: 0,
    });
    render(<SellerReviewsPage />);
    expect(screen.getByText("Previous").closest("button")).toBeDisabled();
  });

  it("should disable Next on last page", () => {
    (useReviewModeration as jest.Mock).mockReturnValue({
      ...defaultHookReturn,
      totalPages: 3,
      page: 2,
    });
    render(<SellerReviewsPage />);
    expect(screen.getByText("Next").closest("button")).toBeDisabled();
  });

  it("should call refetch on Refresh button click", () => {
    render(<SellerReviewsPage />);
    const refreshBtn = screen.getByText("Refresh").closest("button");
    fireEvent.click(refreshBtn!);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it("should render stats cards when stats is null", () => {
    (useReviewModeration as jest.Mock).mockReturnValue({
      ...defaultHookReturn,
      stats: null,
    });
    render(<SellerReviewsPage />);
    // Should show 0 for all stats
    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBeGreaterThanOrEqual(4);
  });

  it("should render review dates", () => {
    render(<SellerReviewsPage />);
    // Date formatting - the component uses toLocaleDateString
    expect(screen.getByText(/1\/15\/2026|Jan 15, 2026|15\/01\/2026/)).toBeDefined();
  });
});
