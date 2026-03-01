/**
 * FilterSidebar Component Tests
 * Tests the shop page filter panel (categories, price, tags).
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { FilterSidebar } from "../FilterSidebar";

// Mock shadcn components
jest.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({
    id,
    checked,
    onCheckedChange,
  }: {
    id?: string;
    checked?: boolean;
    onCheckedChange?: () => void;
  }) => (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onCheckedChange}
      data-testid={id}
    />
  ),
}));

jest.mock("@/components/ui/label", () => ({
  Label: ({
    htmlFor,
    children,
    className,
  }: {
    htmlFor?: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  ),
}));

jest.mock("@/components/ui/slider", () => ({
  Slider: ({
    value,
    onValueChange,
    min,
    max,
  }: {
    value: number[];
    onValueChange: (v: number[]) => void;
    min: number;
    max: number;
  }) => (
    <div data-testid="price-slider" data-min={min} data-max={max}>
      <span>{value[0]}-{value[1]}</span>
    </div>
  ),
}));

const MOCK_CATEGORIES = [
  { slug: "growing-kits", name: "Growing Kits" },
  { slug: "dried-mushrooms", name: "Dried Mushrooms" },
  { slug: "supplements", name: "Supplements" },
];

const MOCK_TAGS = [
  { label: "Organic", value: "organic" },
  { label: "Best Seller", value: "best-seller" },
  { label: "New", value: "new" },
];

const mockToggleCategory = jest.fn();
const mockClearCategories = jest.fn();
const mockToggleTag = jest.fn();
const mockClearTags = jest.fn();
const mockSetPriceRange = jest.fn();
const mockClearAllFilters = jest.fn();
const mockGetCategoryCount = jest.fn((name: string) => {
  const counts: Record<string, number> = {
    "Growing Kits": 15,
    "Dried Mushrooms": 8,
    "Supplements": 12,
  };
  return counts[name] || 0;
});

const baseProps = {
  categories: MOCK_CATEGORIES,
  selectedCategories: [] as string[],
  toggleCategory: mockToggleCategory,
  clearCategories: mockClearCategories,
  selectedTags: [] as string[],
  toggleTag: mockToggleTag,
  clearTags: mockClearTags,
  priceRange: [0, 12000],
  setPriceRange: mockSetPriceRange,
  totalCount: 35,
  hasActiveFilters: false,
  clearAllFilters: mockClearAllFilters,
  popularTags: MOCK_TAGS,
  variant: "desktop" as const,
  getCategoryCount: mockGetCategoryCount,
};

describe("FilterSidebar", () => {
  beforeEach(() => jest.clearAllMocks());

  // ── Desktop Variant ──

  it("renders filter header on desktop variant", () => {
    render(<FilterSidebar {...baseProps} />);
    expect(screen.getByText("Filters")).toBeInTheDocument();
  });

  it("does not render filter header on mobile variant", () => {
    render(<FilterSidebar {...baseProps} variant="mobile" />);
    expect(screen.queryByText("Filters")).not.toBeInTheDocument();
  });

  it("shows Clear All button when active filters exist", () => {
    render(<FilterSidebar {...baseProps} hasActiveFilters={true} />);
    const clearBtn = screen.getByText("Clear All");
    fireEvent.click(clearBtn);
    expect(mockClearAllFilters).toHaveBeenCalledTimes(1);
  });

  it("hides Clear All button when no active filters", () => {
    render(<FilterSidebar {...baseProps} hasActiveFilters={false} />);
    expect(screen.queryByText("Clear All")).not.toBeInTheDocument();
  });

  // ── Categories ──

  it("renders category section heading", () => {
    render(<FilterSidebar {...baseProps} />);
    expect(screen.getByText("Categories")).toBeInTheDocument();
  });

  it("renders All Products option", () => {
    render(<FilterSidebar {...baseProps} />);
    expect(screen.getByText("All Products")).toBeInTheDocument();
  });

  it("renders all categories", () => {
    render(<FilterSidebar {...baseProps} />);
    expect(screen.getByText("Growing Kits")).toBeInTheDocument();
    expect(screen.getByText("Dried Mushrooms")).toBeInTheDocument();
    expect(screen.getByText("Supplements")).toBeInTheDocument();
  });

  it("shows product counts on desktop", () => {
    render(<FilterSidebar {...baseProps} />);
    expect(screen.getByText("(35)")).toBeInTheDocument(); // All Products count
    expect(screen.getByText("(15)")).toBeInTheDocument(); // Growing Kits
    expect(screen.getByText("(8)")).toBeInTheDocument(); // Dried Mushrooms
  });

  it("calls toggleCategory when category checkbox is clicked", () => {
    render(<FilterSidebar {...baseProps} />);
    fireEvent.click(screen.getByTestId("category-growing-kits"));
    expect(mockToggleCategory).toHaveBeenCalledWith("growing-kits");
  });

  it("shows selected category count badge", () => {
    render(
      <FilterSidebar
        {...baseProps}
        selectedCategories={["growing-kits", "supplements"]}
      />
    );
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("checks All Products when no categories selected", () => {
    render(<FilterSidebar {...baseProps} selectedCategories={[]} />);
    const allCheckbox = screen.getByTestId("category-all") as HTMLInputElement;
    expect(allCheckbox.checked).toBe(true);
  });

  it("calls clearCategories when All Products is clicked", () => {
    render(
      <FilterSidebar {...baseProps} selectedCategories={["growing-kits"]} />
    );
    fireEvent.click(screen.getByTestId("category-all"));
    expect(mockClearCategories).toHaveBeenCalledTimes(1);
  });

  // ── Price Range ──

  it("renders price range section", () => {
    render(<FilterSidebar {...baseProps} />);
    expect(screen.getByText("Price Range")).toBeInTheDocument();
    expect(screen.getByTestId("price-slider")).toBeInTheDocument();
  });

  it("renders min and max price inputs", () => {
    render(<FilterSidebar {...baseProps} />);
    const inputs = screen.getAllByRole("spinbutton");
    expect(inputs.length).toBe(2);
  });

  it("shows reset price button when range is modified", () => {
    render(<FilterSidebar {...baseProps} priceRange={[100, 5000]} />);
    const resetBtn = screen.getByText("Reset price");
    expect(resetBtn).toBeInTheDocument();
    fireEvent.click(resetBtn);
    expect(mockSetPriceRange).toHaveBeenCalledWith([0, 12000]);
  });

  it("hides reset price button when range is default", () => {
    render(<FilterSidebar {...baseProps} priceRange={[0, 12000]} />);
    expect(screen.queryByText("Reset price")).not.toBeInTheDocument();
  });

  it("shows price range label on desktop when modified", () => {
    render(<FilterSidebar {...baseProps} priceRange={[500, 3000]} />);
    expect(screen.getByText(/₱500.*₱3,000/)).toBeInTheDocument();
  });

  // ── Tags ──

  it("renders quick tags section", () => {
    render(<FilterSidebar {...baseProps} />);
    expect(screen.getByText("Quick Tags")).toBeInTheDocument();
    expect(screen.getByText("Organic")).toBeInTheDocument();
    expect(screen.getByText("Best Seller")).toBeInTheDocument();
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("calls toggleTag when a tag is clicked", () => {
    render(<FilterSidebar {...baseProps} />);
    fireEvent.click(screen.getByText("Organic"));
    expect(mockToggleTag).toHaveBeenCalledWith("organic");
  });

  it("shows selected tag count badge", () => {
    render(<FilterSidebar {...baseProps} selectedTags={["organic"]} />);
    // "1" appears as badge count for selected tags
    const badges = screen.getAllByText("1");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it("shows clear tags button when tags are selected", () => {
    render(<FilterSidebar {...baseProps} selectedTags={["organic"]} />);
    const clearBtn = screen.getByText("Clear tags");
    fireEvent.click(clearBtn);
    expect(mockClearTags).toHaveBeenCalledTimes(1);
  });

  it("hides clear tags button when no tags are selected", () => {
    render(<FilterSidebar {...baseProps} selectedTags={[]} />);
    expect(screen.queryByText("Clear tags")).not.toBeInTheDocument();
  });

  it("highlights selected tag with primary styles", () => {
    render(<FilterSidebar {...baseProps} selectedTags={["organic"]} />);
    const organicBtn = screen.getByText("Organic");
    expect(organicBtn.className).toContain("bg-primary");
  });
});
