/**
 * OrderSummary Component Tests (PAY-015)
 *
 * Tests for the enhanced Order Summary component that displays
 * payment method with icon, PHP currency formatting, collapsible
 * mobile item list, PayMongo security badge, and promotional banner slot.
 */

import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { OrderSummary, type OrderSummaryProps } from "../OrderSummary";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { fill, priority, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...rest} data-fill={fill ? "true" : undefined} />;
  },
}));

jest.mock("@/components/ui/loading-spinner", () => ({
  LoadingSpinner: ({ className }: { className?: string }) => (
    <div data-testid="loading-spinner" className={className} />
  ),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockItems = [
  {
    productId: "p1",
    name: "Golden Oyster Mushroom",
    price: 250,
    quantity: 2,
    image: "/products/golden-oyster.jpg",
  },
  {
    productId: "p2",
    name: "Shiitake Mushroom Premium",
    price: 350,
    quantity: 1,
  },
];

const defaultProps: OrderSummaryProps = {
  items: mockItems,
  subtotal: 850,
  deliveryFee: 150,
  total: 1000,
  deliveryMethod: "delivery",
  vendorName: null,
  hasMultipleVendors: false,
  loading: false,
};

function renderOrderSummary(overrides: Partial<OrderSummaryProps> = {}) {
  return render(<OrderSummary {...defaultProps} {...overrides} />);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("OrderSummary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // Basic Rendering
  // =========================================================================

  describe("Basic rendering", () => {
    it("should render the Summary heading on desktop", () => {
      renderOrderSummary();
      expect(screen.getByText("Summary")).toBeInTheDocument();
    });

    it("should render item count in mobile header", () => {
      renderOrderSummary();
      expect(
        screen.getByText(/Order Summary \(3 items\)/)
      ).toBeInTheDocument();
    });

    it("should display singular 'item' for quantity of 1", () => {
      renderOrderSummary({
        items: [{ productId: "p1", name: "Test", price: 100, quantity: 1 }],
      });
      expect(
        screen.getByText(/Order Summary \(1 item\)/)
      ).toBeInTheDocument();
    });

    it("should render all cart item names", () => {
      renderOrderSummary();
      expect(screen.getByText("Golden Oyster Mushroom")).toBeInTheDocument();
      expect(
        screen.getByText("Shiitake Mushroom Premium")
      ).toBeInTheDocument();
    });

    it("should render item quantities", () => {
      renderOrderSummary();
      expect(screen.getByText("Quantity: 2")).toBeInTheDocument();
      expect(screen.getByText("Quantity: 1")).toBeInTheDocument();
    });

    it("should render item images with correct src", () => {
      renderOrderSummary();
      const images = screen.getAllByRole("img");
      expect(images[0]).toHaveAttribute("src", "/products/golden-oyster.jpg");
    });

    it("should use placeholder image when item has no image", () => {
      renderOrderSummary();
      const images = screen.getAllByRole("img");
      expect(images[1]).toHaveAttribute("src", "/mushroom-placeholder.png");
    });
  });

  // =========================================================================
  // PHP Currency Formatting (Acceptance Criteria #3)
  // =========================================================================

  describe("PHP currency formatting", () => {
    it("should format subtotal with PHP prefix and 2 decimals", () => {
      renderOrderSummary();
      // The subtotal uses formatPHP which produces locale formatted output
      expect(screen.getByText(/Subtotal/)).toBeInTheDocument();
      // Check that the value next to subtotal is present with PHP prefix
      const subtotalRow = screen.getByText(/Subtotal/).closest("div");
      expect(subtotalRow).toHaveTextContent("PHP");
      expect(subtotalRow).toHaveTextContent("850");
    });

    it("should format delivery fee with PHP prefix", () => {
      renderOrderSummary();
      const deliveryRow = screen.getByText("Delivery (Lalamove)").closest("div");
      expect(deliveryRow).toHaveTextContent("PHP");
      expect(deliveryRow).toHaveTextContent("150");
    });

    it("should format total with PHP prefix", () => {
      renderOrderSummary();
      const totalElements = screen.getAllByText(/Total/);
      // There are multiple "Total" elements; the bold total row
      const totalRow = totalElements.find(
        (el) => el.closest(".font-bold") !== null
      );
      expect(totalRow?.closest("div")).toHaveTextContent("PHP");
      expect(totalRow?.closest("div")).toHaveTextContent("1,000");
    });

    it("should format item prices with PHP prefix", () => {
      renderOrderSummary();
      // Item 1: 250 * 2 = 500
      expect(screen.getByText(/PHP.*500/)).toBeInTheDocument();
      // Item 2: 350 * 1 = 350
      expect(screen.getByText(/PHP.*350/)).toBeInTheDocument();
    });

    it("should format mobile header total with PHP prefix", () => {
      renderOrderSummary();
      // Mobile header shows total
      const mobileButton = screen.getByRole("button");
      expect(mobileButton).toHaveTextContent("PHP");
      expect(mobileButton).toHaveTextContent("1,000");
    });
  });

  // =========================================================================
  // Price Breakdown
  // =========================================================================

  describe("Price breakdown", () => {
    it("should show delivery fee when > 0", () => {
      renderOrderSummary({ deliveryFee: 200 });
      expect(screen.getByText("Delivery (Lalamove)")).toBeInTheDocument();
    });

    it("should hide delivery fee when 0", () => {
      renderOrderSummary({ deliveryFee: 0 });
      expect(
        screen.queryByText("Delivery (Lalamove)")
      ).not.toBeInTheDocument();
    });

    it("should show free pickup when delivery method is pickup", () => {
      renderOrderSummary({ deliveryMethod: "pickup", deliveryFee: 0 });
      expect(screen.getByText("Pickup")).toBeInTheDocument();
      expect(screen.getByText("Free")).toBeInTheDocument();
    });

    it("should show service fee when > 0", () => {
      renderOrderSummary({ serviceFee: 25 });
      expect(screen.getByText("Service Fee")).toBeInTheDocument();
    });

    it("should hide service fee when 0 (default)", () => {
      renderOrderSummary();
      expect(screen.queryByText("Service Fee")).not.toBeInTheDocument();
    });

    it("should hide service fee when not provided", () => {
      renderOrderSummary({ serviceFee: undefined });
      expect(screen.queryByText("Service Fee")).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // Collapsible Mobile Behavior (Acceptance Criteria #4)
  // =========================================================================

  describe("Collapsible mobile behavior", () => {
    it("should have a toggle button with aria-expanded", () => {
      renderOrderSummary();
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("should toggle aria-expanded on click", () => {
      renderOrderSummary();
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(button);
      expect(button).toHaveAttribute("aria-expanded", "true");

      fireEvent.click(button);
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("should toggle chevron rotation class on expand/collapse", () => {
      renderOrderSummary();
      const button = screen.getByRole("button");
      // ChevronDown icon is inside the button
      const chevron = button.querySelector("svg");
      expect(chevron).toBeDefined();

      // Initially collapsed
      expect(chevron?.classList.contains("rotate-180")).toBe(false);

      fireEvent.click(button);
      expect(chevron?.classList.contains("rotate-180")).toBe(true);

      fireEvent.click(button);
      expect(chevron?.classList.contains("rotate-180")).toBe(false);
    });
  });

  // =========================================================================
  // Payment Method Display (Acceptance Criteria #1 & #2)
  // =========================================================================

  describe("Payment method display", () => {
    it("should not show payment method section when paymentMethod is null", () => {
      renderOrderSummary({ paymentMethod: null });
      expect(
        screen.queryByTestId("payment-method-display")
      ).not.toBeInTheDocument();
      expect(screen.queryByText("Payment Method")).not.toBeInTheDocument();
    });

    it("should not show payment method section when paymentMethod is undefined", () => {
      renderOrderSummary({ paymentMethod: undefined });
      expect(
        screen.queryByTestId("payment-method-display")
      ).not.toBeInTheDocument();
    });

    it("should show COD payment method with correct label", () => {
      renderOrderSummary({ paymentMethod: "cod" });
      expect(screen.getByText("Payment Method")).toBeInTheDocument();
      expect(
        screen.getByTestId("payment-method-display")
      ).toBeInTheDocument();
      expect(screen.getByText("Cash on Delivery")).toBeInTheDocument();
    });

    it("should show GCash payment method with correct label", () => {
      renderOrderSummary({ paymentMethod: "gcash" });
      expect(screen.getByText("GCash")).toBeInTheDocument();
    });

    it("should show GrabPay payment method with correct label", () => {
      renderOrderSummary({ paymentMethod: "grab_pay" });
      expect(screen.getByText("GrabPay")).toBeInTheDocument();
    });

    it("should show Credit/Debit Card payment method with correct label", () => {
      renderOrderSummary({ paymentMethod: "card" });
      expect(screen.getByText("Credit / Debit Card")).toBeInTheDocument();
    });

    it("should show PayMaya payment method with correct label", () => {
      renderOrderSummary({ paymentMethod: "paymaya" });
      expect(screen.getByText("PayMaya")).toBeInTheDocument();
    });

    it("should render icon container inside payment method display", () => {
      renderOrderSummary({ paymentMethod: "gcash" });
      const display = screen.getByTestId("payment-method-display");
      // Icon container is a div with rounded-md
      const iconContainer = display.querySelector(".rounded-md");
      expect(iconContainer).toBeInTheDocument();
    });
  });

  // =========================================================================
  // PayMongo Security Badge (Acceptance Criteria #5)
  // =========================================================================

  describe("PayMongo security badge", () => {
    it("should show security badge for GCash (digital payment)", () => {
      renderOrderSummary({ paymentMethod: "gcash" });
      expect(
        screen.getByTestId("paymongo-security-badge")
      ).toBeInTheDocument();
      expect(screen.getByText("Secured by PayMongo")).toBeInTheDocument();
    });

    it("should show security badge for GrabPay", () => {
      renderOrderSummary({ paymentMethod: "grab_pay" });
      expect(
        screen.getByTestId("paymongo-security-badge")
      ).toBeInTheDocument();
    });

    it("should show security badge for Card payments", () => {
      renderOrderSummary({ paymentMethod: "card" });
      expect(
        screen.getByTestId("paymongo-security-badge")
      ).toBeInTheDocument();
    });

    it("should show security badge for PayMaya", () => {
      renderOrderSummary({ paymentMethod: "paymaya" });
      expect(
        screen.getByTestId("paymongo-security-badge")
      ).toBeInTheDocument();
    });

    it("should NOT show security badge for COD", () => {
      renderOrderSummary({ paymentMethod: "cod" });
      expect(
        screen.queryByTestId("paymongo-security-badge")
      ).not.toBeInTheDocument();
    });

    it("should NOT show security badge when no payment method selected", () => {
      renderOrderSummary({ paymentMethod: null });
      expect(
        screen.queryByTestId("paymongo-security-badge")
      ).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // Promotional Banner Slot (Acceptance Criteria #6)
  // =========================================================================

  describe("Promotional banner slot", () => {
    it("should NOT render banner when no content provided", () => {
      renderOrderSummary();
      expect(
        screen.queryByTestId("promotional-banner")
      ).not.toBeInTheDocument();
    });

    it("should NOT render banner when promotionalBanner is undefined", () => {
      renderOrderSummary({ promotionalBanner: undefined });
      expect(
        screen.queryByTestId("promotional-banner")
      ).not.toBeInTheDocument();
    });

    it("should NOT render banner when promotionalBanner is null", () => {
      renderOrderSummary({ promotionalBanner: null });
      expect(
        screen.queryByTestId("promotional-banner")
      ).not.toBeInTheDocument();
    });

    it("should render string promotional banner content", () => {
      renderOrderSummary({
        promotionalBanner: "Get 5% off with GCash!",
      });
      expect(screen.getByTestId("promotional-banner")).toBeInTheDocument();
      expect(
        screen.getByText("Get 5% off with GCash!")
      ).toBeInTheDocument();
    });

    it("should render JSX promotional banner content", () => {
      renderOrderSummary({
        promotionalBanner: (
          <span data-testid="custom-promo">Special Offer!</span>
        ),
      });
      expect(screen.getByTestId("promotional-banner")).toBeInTheDocument();
      expect(screen.getByTestId("custom-promo")).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Loading State
  // =========================================================================

  describe("Loading state", () => {
    it("should show loading spinner when loading is true", () => {
      renderOrderSummary({ loading: true });
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
      expect(screen.getByText("Loading cart items...")).toBeInTheDocument();
    });

    it("should not render items when loading", () => {
      renderOrderSummary({ loading: true });
      expect(
        screen.queryByText("Golden Oyster Mushroom")
      ).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // Empty State
  // =========================================================================

  describe("Empty state", () => {
    it("should show empty message when no items", () => {
      renderOrderSummary({ items: [] });
      expect(
        screen.getByText("No items for this vendor")
      ).toBeInTheDocument();
    });

    it("should show 0 items in mobile header when empty", () => {
      renderOrderSummary({ items: [] });
      expect(
        screen.getByText(/Order Summary \(0 items\)/)
      ).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Multi-Vendor Support
  // =========================================================================

  describe("Multi-vendor support", () => {
    it("should show vendor name in desktop heading when multi-vendor", () => {
      renderOrderSummary({
        hasMultipleVendors: true,
        vendorName: "Farm Fresh Co.",
      });
      // Appears in both desktop header and mobile expanded section
      const vendorLabels = screen.getAllByText(/Checking out: Farm Fresh Co\./);
      expect(vendorLabels.length).toBeGreaterThanOrEqual(1);
    });

    it("should not show vendor name when single vendor", () => {
      renderOrderSummary({
        hasMultipleVendors: false,
        vendorName: "Farm Fresh Co.",
      });
      expect(
        screen.queryByText(/Checking out:/)
      ).not.toBeInTheDocument();
    });

    it("should not show vendor name when null", () => {
      renderOrderSummary({
        hasMultipleVendors: true,
        vendorName: null,
      });
      expect(
        screen.queryByText(/Checking out:/)
      ).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // Integration: Payment + Badge + Promo Together
  // =========================================================================

  describe("Integration scenarios", () => {
    it("should render payment method, security badge, and promo banner together for GCash", () => {
      renderOrderSummary({
        paymentMethod: "gcash",
        promotionalBanner: "Save 5% with GCash!",
      });
      expect(screen.getByText("GCash")).toBeInTheDocument();
      expect(screen.getByText("Secured by PayMongo")).toBeInTheDocument();
      expect(screen.getByText("Save 5% with GCash!")).toBeInTheDocument();
    });

    it("should render payment method without badge for COD, plus promo banner", () => {
      renderOrderSummary({
        paymentMethod: "cod",
        promotionalBanner: "Free delivery for orders over PHP 1,000!",
      });
      expect(screen.getByText("Cash on Delivery")).toBeInTheDocument();
      expect(
        screen.queryByTestId("paymongo-security-badge")
      ).not.toBeInTheDocument();
      expect(
        screen.getByText("Free delivery for orders over PHP 1,000!")
      ).toBeInTheDocument();
    });

    it("should render all price breakdown lines simultaneously", () => {
      renderOrderSummary({
        deliveryFee: 100,
        serviceFee: 25,
        deliveryMethod: "delivery",
      });
      expect(screen.getByText(/Subtotal/)).toBeInTheDocument();
      expect(screen.getByText("Delivery (Lalamove)")).toBeInTheDocument();
      expect(screen.getByText("Service Fee")).toBeInTheDocument();
    });

    it("should show expanded content after click with payment method visible", () => {
      renderOrderSummary({ paymentMethod: "card" });
      const button = screen.getByRole("button");

      // Expand on mobile
      fireEvent.click(button);
      expect(button).toHaveAttribute("aria-expanded", "true");

      // Payment method should be in the DOM (visible on desktop always)
      expect(screen.getByText("Credit / Debit Card")).toBeInTheDocument();
      expect(screen.getByText("Secured by PayMongo")).toBeInTheDocument();
    });

    it("should handle all payment methods with full price breakdown and promo", () => {
      const methods = ["cod", "gcash", "grab_pay", "card", "paymaya"] as const;
      const labels = [
        "Cash on Delivery",
        "GCash",
        "GrabPay",
        "Credit / Debit Card",
        "PayMaya",
      ];

      methods.forEach((method, index) => {
        const { unmount } = renderOrderSummary({
          paymentMethod: method,
          serviceFee: 10,
          promotionalBanner: "Promo!",
        });

        expect(screen.getByText(labels[index])).toBeInTheDocument();
        expect(screen.getByText("Service Fee")).toBeInTheDocument();
        expect(screen.getByTestId("promotional-banner")).toBeInTheDocument();

        if (method === "cod") {
          expect(
            screen.queryByTestId("paymongo-security-badge")
          ).not.toBeInTheDocument();
        } else {
          expect(
            screen.getByTestId("paymongo-security-badge")
          ).toBeInTheDocument();
        }

        unmount();
      });
    });
  });
});
