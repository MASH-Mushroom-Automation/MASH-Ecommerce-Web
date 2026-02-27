/**
 * Grower Page render tests
 * COV-012: Page coverage batch
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock hooks
const mockUseSanityGrowers = jest.fn();
const mockUseGrowerRatings = jest.fn();
jest.mock("@/hooks/useSanityGrowers", () => ({
  useSanityGrowers: (opts: unknown) => mockUseSanityGrowers(opts),
}));
jest.mock("@/hooks/useGrowerRatings", () => ({
  useGrowerRatings: (ids: string[]) => mockUseGrowerRatings(ids),
}));
jest.mock("@/lib/auth", () => ({
  isAuthenticated: jest.fn(() => false),
}));

// Mock sub-components
jest.mock("@/components/ui/loading-spinner", () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading</div>,
}));
jest.mock("@/components/ui/empty-state", () => ({
  EmptyState: (props: Record<string, unknown>) => (
    <div data-testid="empty-state">{String(props.title || "empty")}</div>
  ),
}));
jest.mock("@/components/ui/skeleton-loaders", () => ({
  GrowerListSkeleton: () => <div data-testid="skeleton">Skeleton</div>,
}));
jest.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange }: { children: React.ReactNode; onValueChange?: (v: string) => void }) => (
    <div data-testid="select">{children}</div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <option value={value}>{children}</option>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
}));

import GrowersPage from "../page";

const mockGrower = {
  id: "grower-1",
  name: "Farm Fresh",
  slug: "farm-fresh",
  description: "Best mushrooms",
  location: "Manila, NCR",
  region: "NCR",
  phone: "09171234567",
  email: "farm@fresh.com",
  image: "https://example.com/farm.jpg",
  isActive: true,
  products: [],
  operatingHours: "9AM-5PM",
  socialMedia: {},
  _createdAt: "2024-01-01",
  _updatedAt: "2024-01-01",
};

const mockGrower2 = {
  ...mockGrower,
  id: "grower-2",
  name: "Mushroom Valley",
  slug: "mushroom-valley",
  location: "Cebu, Visayas",
  region: "Visayas",
};

describe("GrowersPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGrowerRatings.mockReturnValue({
      ratings: {},
      loading: false,
    });
  });

  it("renders loading state with skeleton", () => {
    mockUseSanityGrowers.mockReturnValue({
      growers: [],
      loading: true,
      error: null,
    });
    render(<GrowersPage />);
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
  });

  it("renders error state with retry button", () => {
    mockUseSanityGrowers.mockReturnValue({
      growers: [],
      loading: false,
      error: "Failed to load growers",
    });
    render(<GrowersPage />);
    expect(screen.getByText(/Failed to load growers/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /try again/i })
    ).toBeInTheDocument();
  });

  it("renders grower list with data", () => {
    mockUseSanityGrowers.mockReturnValue({
      growers: [mockGrower, mockGrower2],
      loading: false,
      error: null,
    });
    render(<GrowersPage />);
    expect(screen.getByText("Farm Fresh")).toBeInTheDocument();
  });

  it("renders empty state when no growers match search", () => {
    mockUseSanityGrowers.mockReturnValue({
      growers: [mockGrower],
      loading: false,
      error: null,
    });
    render(<GrowersPage />);

    // Search for non-existent grower
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });

    // Should show some empty/no results indicator
    expect(screen.queryByText("Farm Fresh")).not.toBeInTheDocument();
  });

  it("filters growers by search term", () => {
    mockUseSanityGrowers.mockReturnValue({
      growers: [mockGrower, mockGrower2],
      loading: false,
      error: null,
    });
    render(<GrowersPage />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: "Valley" } });

    expect(screen.queryByText("Farm Fresh")).not.toBeInTheDocument();
    expect(screen.getByText("Mushroom Valley")).toBeInTheDocument();
  });

  it("renders with grower ratings", () => {
    mockUseSanityGrowers.mockReturnValue({
      growers: [mockGrower],
      loading: false,
      error: null,
    });
    mockUseGrowerRatings.mockReturnValue({
      ratings: {
        "grower-1": { averageRating: 4.5, totalReviews: 10 },
      },
      loading: false,
    });
    render(<GrowersPage />);
    expect(screen.getByText("Farm Fresh")).toBeInTheDocument();
  });
});
