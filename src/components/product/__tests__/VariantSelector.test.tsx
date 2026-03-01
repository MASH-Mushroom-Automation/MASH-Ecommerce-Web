/**
 * VariantSelector Component Tests
 * Tests variant selection for products (size, color, weight).
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { VariantSelector, CompactVariantDisplay } from "../VariantSelector";

// Mock the useSanityVariants hook
const mockSelectVariantById = jest.fn();
const mockGetStockStatus = jest.fn();

let mockHookReturn: Record<string, unknown> = {};

jest.mock("@/hooks/useSanityVariants", () => ({
  useSanityVariants: () => mockHookReturn,
}));

const MOCK_VARIANTS = [
  {
    id: "v1",
    variantName: "Small White",
    size: "small",
    color: "white",
    weight: null,
    price: 199,
    compareAtPrice: null,
    stockQuantity: 10,
    sku: "OMK-SM-W",
  },
  {
    id: "v2",
    variantName: "Large White",
    size: "large",
    color: "white",
    weight: null,
    price: 399,
    compareAtPrice: 499,
    stockQuantity: 5,
    sku: "OMK-LG-W",
  },
  {
    id: "v3",
    variantName: "Large Brown",
    size: "large",
    color: "brown",
    weight: null,
    price: 349,
    compareAtPrice: null,
    stockQuantity: 0,
    sku: "OMK-LG-B",
  },
];

const MOCK_SUMMARY = {
  totalVariants: 3,
  availableVariants: 2,
  priceRange: "₱199 - ₱399",
};

function setupMock(overrides: Partial<typeof mockHookReturn> = {}) {
  mockHookReturn = {
    variants: MOCK_VARIANTS,
    summary: MOCK_SUMMARY,
    selectedVariant: null,
    loading: false,
    error: null,
    selectVariantById: mockSelectVariantById,
    getStockStatus: mockGetStockStatus,
    ...overrides,
  };
}

describe("VariantSelector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMock();
  });

  // ── Loading State ──

  it("shows loading spinner when loading", () => {
    setupMock({ loading: true });
    render(<VariantSelector productId="p1" />);
    expect(screen.getByText("Loading variants...")).toBeInTheDocument();
  });

  // ── Error State ──

  it("shows error message on error", () => {
    setupMock({ error: "Network error" });
    render(<VariantSelector productId="p1" />);
    expect(screen.getByText("Error loading variants")).toBeInTheDocument();
  });

  // ── Empty State ──

  it("renders nothing when no variants exist", () => {
    setupMock({ variants: [], summary: null });
    const { container } = render(<VariantSelector productId="p1" />);
    expect(container.innerHTML).toBe("");
  });

  // ── Price Range ──

  it("displays price range from summary", () => {
    render(<VariantSelector productId="p1" />);
    expect(screen.getByText("₱199 - ₱399")).toBeInTheDocument();
  });

  it("displays options count badge", () => {
    render(<VariantSelector productId="p1" />);
    expect(screen.getByText("3 options")).toBeInTheDocument();
  });

  // ── Size Selection ──

  it("renders size buttons", () => {
    render(<VariantSelector productId="p1" />);
    expect(screen.getByText("Size")).toBeInTheDocument();
    expect(screen.getByText("SMALL")).toBeInTheDocument();
    expect(screen.getByText("LARGE")).toBeInTheDocument();
  });

  it("calls selectVariantById when size button is clicked", () => {
    render(<VariantSelector productId="p1" />);
    fireEvent.click(screen.getByText("SMALL"));
    expect(mockSelectVariantById).toHaveBeenCalledWith("v1");
  });

  // ── Color Selection ──

  it("renders color buttons", () => {
    render(<VariantSelector productId="p1" />);
    expect(screen.getByText("Color")).toBeInTheDocument();
    expect(screen.getByText("white")).toBeInTheDocument();
    expect(screen.getByText("brown")).toBeInTheDocument();
  });

  // ── Out of Stock Variants ──

  it("disables buttons for out-of-stock colors", () => {
    render(<VariantSelector productId="p1" />);
    const brownBtn = screen.getByText("brown").closest("button");
    // Brown has only v3 with stockQuantity: 0
    expect(brownBtn).toBeDisabled();
  });

  // ── Selected Variant Details ──

  it("renders selected variant detail card", () => {
    setupMock({ selectedVariant: MOCK_VARIANTS[1] });
    mockGetStockStatus.mockReturnValue("in-stock");

    render(<VariantSelector productId="p1" />);
    expect(screen.getByText("Large White")).toBeInTheDocument();
    expect(screen.getByText("₱399.00")).toBeInTheDocument();
    expect(screen.getByText("SKU: OMK-LG-W")).toBeInTheDocument();
  });

  it("shows compare-at price with discount for selected variant", () => {
    setupMock({ selectedVariant: MOCK_VARIANTS[1] });
    mockGetStockStatus.mockReturnValue("in-stock");

    render(<VariantSelector productId="p1" />);
    expect(screen.getByText("₱499.00")).toBeInTheDocument();
    expect(screen.getByText(/20.*OFF/)).toBeInTheDocument();
  });

  it("shows in-stock badge for selected variant", () => {
    setupMock({ selectedVariant: MOCK_VARIANTS[0] });
    mockGetStockStatus.mockReturnValue("in-stock");

    render(<VariantSelector productId="p1" />);
    expect(screen.getByText(/In Stock.*10/)).toBeInTheDocument();
  });

  it("shows low-stock badge when appropriate", () => {
    setupMock({ selectedVariant: MOCK_VARIANTS[0] });
    mockGetStockStatus.mockReturnValue("low-stock");

    render(<VariantSelector productId="p1" />);
    expect(screen.getByText(/Low Stock/)).toBeInTheDocument();
  });

  it("shows out-of-stock badge when appropriate", () => {
    setupMock({ selectedVariant: MOCK_VARIANTS[2] });
    mockGetStockStatus.mockReturnValue("out-of-stock");

    render(<VariantSelector productId="p1" />);
    expect(screen.getByText(/Out of Stock/)).toBeInTheDocument();
  });

  // ── Availability Summary ──

  it("displays availability summary text", () => {
    render(<VariantSelector productId="p1" />);
    expect(screen.getByText("2 of 3 variants available")).toBeInTheDocument();
  });

  // ── Callback ──

  it("calls onVariantChange when selectedVariant changes", () => {
    const onVariantChange = jest.fn();
    setupMock({ selectedVariant: MOCK_VARIANTS[0] });

    render(<VariantSelector productId="p1" onVariantChange={onVariantChange} />);
    expect(onVariantChange).toHaveBeenCalledWith(MOCK_VARIANTS[0]);
  });
});

describe("CompactVariantDisplay", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders options count and price range", () => {
    setupMock();
    render(<CompactVariantDisplay productId="p1" />);
    expect(screen.getByText("3 options")).toBeInTheDocument();
    expect(screen.getByText("₱199 - ₱399")).toBeInTheDocument();
  });

  it("renders nothing when loading", () => {
    setupMock({ loading: true, summary: null });
    const { container } = render(<CompactVariantDisplay productId="p1" />);
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when no summary", () => {
    setupMock({ summary: null });
    const { container } = render(<CompactVariantDisplay productId="p1" />);
    expect(container.innerHTML).toBe("");
  });
});
