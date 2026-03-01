/**
 * OrderSummary Component Tests
 * Tests for the checkout order summary showing items, totals, and delivery info.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { OrderSummary } from "../OrderSummary";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

jest.mock("@/components/ui/loading-spinner", () => ({
  LoadingSpinner: ({ className }: { className?: string }) => (
    <div data-testid="loading-spinner" className={className} />
  ),
}));

const MOCK_ITEMS = [
  {
    productId: "p1",
    name: "Oyster Mushroom Kit",
    price: 299,
    quantity: 2,
    image: "/img1.jpg",
  },
  {
    productId: "p2",
    name: "Shiitake Dried",
    price: 450,
    quantity: 1,
    image: undefined,
  },
];

const defaultProps = {
  items: MOCK_ITEMS,
  subtotal: 1048,
  deliveryFee: 150,
  total: 1198,
  deliveryMethod: "lalamove",
  vendorName: null,
  hasMultipleVendors: false,
  loading: false,
};

describe("OrderSummary", () => {
  it("renders item names and quantities", () => {
    render(<OrderSummary {...defaultProps} />);
    expect(screen.getByText("Oyster Mushroom Kit")).toBeInTheDocument();
    expect(screen.getByText("Shiitake Dried")).toBeInTheDocument();
    expect(screen.getByText("Quantity: 2")).toBeInTheDocument();
    expect(screen.getByText("Quantity: 1")).toBeInTheDocument();
  });

  it("renders item prices (price x quantity)", () => {
    render(<OrderSummary {...defaultProps} />);
    expect(screen.getByText("PHP 598.00")).toBeInTheDocument(); // 299*2
    expect(screen.getByText("PHP 450.00")).toBeInTheDocument(); // 450*1
  });

  it("renders subtotal correctly", () => {
    render(<OrderSummary {...defaultProps} />);
    expect(screen.getByText("PHP 1048.00")).toBeInTheDocument();
  });

  it("renders delivery fee for lalamove", () => {
    render(<OrderSummary {...defaultProps} />);
    expect(screen.getByText("Delivery (Lalamove)")).toBeInTheDocument();
    expect(screen.getByText("PHP 150.00")).toBeInTheDocument();
  });

  it("renders total correctly", () => {
    render(<OrderSummary {...defaultProps} />);
    const totals = screen.getAllByText("PHP 1198.00");
    expect(totals.length).toBeGreaterThanOrEqual(1);
  });

  it("shows free pickup when deliveryMethod is pickup", () => {
    render(<OrderSummary {...defaultProps} deliveryMethod="pickup" deliveryFee={0} total={1048} />);
    expect(screen.getByText("Pickup")).toBeInTheDocument();
    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  it("renders loading state", () => {
    render(<OrderSummary {...defaultProps} loading={true} items={[]} />);
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    expect(screen.getByText("Loading cart items...")).toBeInTheDocument();
  });

  it("renders empty state when no items", () => {
    render(<OrderSummary {...defaultProps} loading={false} items={[]} />);
    expect(screen.getByText("No items for this vendor")).toBeInTheDocument();
  });

  it("shows vendor name when hasMultipleVendors is true", () => {
    render(
      <OrderSummary
        {...defaultProps}
        hasMultipleVendors={true}
        vendorName="Farm Fresh Manila"
      />
    );
    const vendorTexts = screen.getAllByText(/Checking out: Farm Fresh Manila/);
    expect(vendorTexts.length).toBeGreaterThanOrEqual(1);
  });

  it("displays correct item count in mobile header", () => {
    render(<OrderSummary {...defaultProps} />);
    // Total quantity is 3 items (2+1)
    expect(screen.getByText(/Order Summary \(3 items\)/)).toBeInTheDocument();
  });

  it("displays singular 'item' for single quantity", () => {
    render(
      <OrderSummary
        {...defaultProps}
        items={[{ productId: "p1", name: "Test", price: 100, quantity: 1 }]}
      />
    );
    expect(screen.getByText(/Order Summary \(1 item\)/)).toBeInTheDocument();
  });

  it("toggles mobile expanded state on button click", () => {
    render(<OrderSummary {...defaultProps} />);
    const toggleBtn = screen.getByRole("button", {
      name: /Order Summary/,
    });
    expect(toggleBtn).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute("aria-expanded", "false");
  });

  it("renders product images", () => {
    const { container } = render(<OrderSummary {...defaultProps} />);
    const images = container.querySelectorAll("img");
    expect(images.length).toBeGreaterThanOrEqual(1);
  });

  it("shows subtotal label with item count", () => {
    render(<OrderSummary {...defaultProps} />);
    expect(screen.getByText("Subtotal (3 items)")).toBeInTheDocument();
  });
});
