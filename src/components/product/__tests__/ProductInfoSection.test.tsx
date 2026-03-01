/**
 * ProductInfoSection Component Tests
 * Tests for the main product "buy box" - price, stock, quantity, add to cart.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductInfo } from "../ProductInfoSection";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

jest.mock("@/components/product/GrowerCard", () => ({
  __esModule: true,
  default: ({ grower }: { grower: { name: string } }) => (
    <div data-testid="grower-card">{grower.name}</div>
  ),
}));

const mockSetQuantity = jest.fn();
const mockOnAddToCart = jest.fn();
const mockOnQuickChat = jest.fn();
const mockRef = { current: null };

const baseProduct = {
  id: "p1",
  name: "Oyster Mushroom Growing Kit",
  price: 299,
  unit: "500g",
  stock: 25,
  description: "Premium oyster mushroom growing kit, farm-fresh quality.",
  category: "Growing Kits",
  categorySlug: "growing-kits",
};

const defaultProps = {
  product: baseProduct,
  dynamicStock: 25,
  quantity: 1,
  setQuantity: mockSetQuantity,
  discountPercent: 0,
  onAddToCart: mockOnAddToCart,
  onQuickChat: mockOnQuickChat,
  addToCartRef: mockRef as React.RefObject<HTMLDivElement | null>,
};

describe("ProductInfo", () => {
  beforeEach(() => jest.clearAllMocks());

  // ── Rendering ──

  it("renders product name as heading", () => {
    render(<ProductInfo {...defaultProps} />);
    expect(
      screen.getByRole("heading", { name: "Oyster Mushroom Growing Kit" })
    ).toBeInTheDocument();
  });

  it("renders product price in peso format", () => {
    render(<ProductInfo {...defaultProps} />);
    expect(screen.getByText("₱299.00")).toBeInTheDocument();
  });

  it("renders unit when provided", () => {
    render(<ProductInfo {...defaultProps} />);
    expect(screen.getByText("/ 500g")).toBeInTheDocument();
  });

  it("renders category as a link", () => {
    render(<ProductInfo {...defaultProps} />);
    const catLink = screen.getByText("Growing Kits");
    expect(catLink.closest("a")).toHaveAttribute(
      "href",
      "/shop?category=growing-kits"
    );
  });

  it("renders product description", () => {
    render(<ProductInfo {...defaultProps} />);
    expect(
      screen.getByText(
        "Premium oyster mushroom growing kit, farm-fresh quality."
      )
    ).toBeInTheDocument();
  });

  // ── Stock Status ──

  it("shows In Stock when dynamicStock > 0", () => {
    render(<ProductInfo {...defaultProps} dynamicStock={10} />);
    expect(screen.getByText("In Stock")).toBeInTheDocument();
    expect(screen.getByText("(10 available)")).toBeInTheDocument();
  });

  it("shows Out of Stock when dynamicStock is 0", () => {
    render(<ProductInfo {...defaultProps} dynamicStock={0} />);
    const outOfStockTexts = screen.getAllByText("Out of Stock");
    expect(outOfStockTexts.length).toBeGreaterThanOrEqual(1);
  });

  // ── Compare at Price / Discount ──

  it("renders compare-at price with strikethrough", () => {
    render(
      <ProductInfo
        {...defaultProps}
        product={{ ...baseProduct, compareAtPrice: 399 }}
        discountPercent={25}
      />
    );
    expect(screen.getByText("₱399.00")).toBeInTheDocument();
    expect(screen.getByText("Save 25%")).toBeInTheDocument();
  });

  it("does not show discount badge when discountPercent is 0", () => {
    render(<ProductInfo {...defaultProps} discountPercent={0} />);
    expect(screen.queryByText(/Save/)).not.toBeInTheDocument();
  });

  // ── Quantity Controls ──

  it("calls setQuantity when plus button is clicked", () => {
    render(<ProductInfo {...defaultProps} quantity={1} />);
    const buttons = screen.getAllByRole("button");
    const plusBtn = buttons.find((btn) =>
      btn.querySelector(".lucide-plus")
    );
    if (plusBtn) fireEvent.click(plusBtn);
    expect(mockSetQuantity).toHaveBeenCalledWith(2);
  });

  it("calls setQuantity when minus button is clicked", () => {
    render(<ProductInfo {...defaultProps} quantity={3} />);
    const buttons = screen.getAllByRole("button");
    const minusBtn = buttons.find((btn) =>
      btn.querySelector(".lucide-minus")
    );
    if (minusBtn) fireEvent.click(minusBtn);
    expect(mockSetQuantity).toHaveBeenCalledWith(2);
  });

  it("does not decrease quantity below 1", () => {
    render(<ProductInfo {...defaultProps} quantity={1} />);
    const buttons = screen.getAllByRole("button");
    const minusBtn = buttons.find((btn) =>
      btn.querySelector(".lucide-minus")
    );
    if (minusBtn) fireEvent.click(minusBtn);
    expect(mockSetQuantity).toHaveBeenCalledWith(1);
  });

  it("renders quantity input with current value", () => {
    render(<ProductInfo {...defaultProps} quantity={5} />);
    const input = screen.getByRole("spinbutton");
    expect(input).toHaveValue(5);
  });

  it("shows subtotal hint when quantity > 1", () => {
    render(<ProductInfo {...defaultProps} quantity={3} />);
    expect(screen.getByText("₱897.00")).toBeInTheDocument();
  });

  it("does not show subtotal hint for quantity 1", () => {
    render(<ProductInfo {...defaultProps} quantity={1} />);
    expect(screen.queryByText(/Subtotal:/)).not.toBeInTheDocument();
  });

  // ── Add to Cart Button ──

  it("calls onAddToCart when Add to Cart button is clicked", () => {
    render(<ProductInfo {...defaultProps} />);
    fireEvent.click(screen.getByText("Add to Cart"));
    expect(mockOnAddToCart).toHaveBeenCalledTimes(1);
  });

  it("shows Out of Stock button text when stock is 0", () => {
    render(<ProductInfo {...defaultProps} dynamicStock={0} />);
    const btn = screen.getByRole("button", { name: /Out of Stock/i });
    expect(btn).toBeDisabled();
  });

  it("disables quantity controls when out of stock", () => {
    render(<ProductInfo {...defaultProps} dynamicStock={0} />);
    const spinbutton = screen.getByRole("spinbutton");
    expect(spinbutton).toBeDisabled();
  });

  // ── Grower Info ──

  it("renders grower name with link", () => {
    render(
      <ProductInfo
        {...defaultProps}
        product={{
          ...baseProduct,
          grower: {
            name: "Kuya Bert Farm",
            slug: "kuya-bert",
            image: "/grower.jpg",
            location: "Quezon City",
            isVerified: true,
          },
        }}
      />
    );
    const growerNames = screen.getAllByText("Kuya Bert Farm");
    expect(growerNames.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Quezon City")).toBeInTheDocument();
  });

  it("shows verified grower badge", () => {
    render(
      <ProductInfo
        {...defaultProps}
        product={{
          ...baseProduct,
          grower: {
            name: "Verified Farm",
            slug: "verified-farm",
            isVerified: true,
          },
        }}
      />
    );
    const badges = screen.getAllByText("Verified Grower");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  // ── Trust Badges ──

  it("renders trust badges", () => {
    render(<ProductInfo {...defaultProps} />);
    expect(screen.getByText("Fast Delivery")).toBeInTheDocument();
    expect(screen.getByText("Farm Fresh")).toBeInTheDocument();
    expect(screen.getByText("Quality Guaranteed")).toBeInTheDocument();
  });

  // ── Rich Product Info ──

  it("renders freshness pills when available", () => {
    render(
      <ProductInfo
        {...defaultProps}
        product={{
          ...baseProduct,
          freshnessInfo: {
            harvestWindow: "24 hours",
            shelfLife: "5 days",
          },
        }}
      />
    );
    expect(screen.getByText(/Harvest: 24 hours/)).toBeInTheDocument();
    expect(screen.getByText(/Shelf Life: 5 days/)).toBeInTheDocument();
  });

  it("renders cooking info pills when available", () => {
    render(
      <ProductInfo
        {...defaultProps}
        product={{
          ...baseProduct,
          preparationInfo: {
            cookingTime: "15 min",
            difficultyLevel: "easy",
          },
        }}
      />
    );
    expect(screen.getByText(/Cook: 15 min/)).toBeInTheDocument();
    expect(screen.getByText("Easy")).toBeInTheDocument();
  });

  it("renders delivery pills when applicable", () => {
    render(
      <ProductInfo
        {...defaultProps}
        product={{
          ...baseProduct,
          deliveryOptions: {
            sameDayDeliveryEligible: true,
            perishable: true,
          },
        }}
      />
    );
    expect(screen.getByText("Same-Day Delivery")).toBeInTheDocument();
    expect(screen.getByText("Perishable")).toBeInTheDocument();
  });
});
