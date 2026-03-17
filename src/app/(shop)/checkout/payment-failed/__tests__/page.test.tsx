/**
 * Payment Failed Page Tests (PAY-014)
 *
 * Tests the enhanced payment failure recovery flow including:
 * - Clear error message display
 * - Order details display (order number, payment method, amount)
 * - Failure reason from URL params or default message
 * - CTA buttons: Try Again, Choose Different Method, Contact Support
 * - Try Again preserves order data (links back to checkout with orderId)
 * - Error icon with empathetic messaging
 * - FAQ/help section for common payment issues
 * - Responsive layout matching success page
 * - Edge cases: no orderId, no sessionStorage, partial data
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PaymentFailedPage from "../page";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

let mockSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    asChild,
    ...props
  }: {
    children: React.ReactNode;
    asChild?: boolean;
    [key: string]: unknown;
  }) => {
    if (asChild) {
      return <>{children}</>;
    }
    return <button {...props}>{children}</button>;
  },
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="card-content" {...props}>
      {children}
    </div>
  ),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createPendingOrder(overrides: Record<string, unknown> = {}) {
  return {
    orderId: "order-abc-12345678",
    orderNumber: "12345678",
    customerEmail: "test@example.com",
    customerName: "Test User",
    paymentMethod: "gcash",
    vendor: "MASH Vendor",
    timestamp: Date.now(),
    amount: 1250.0,
    subtotal: 1100.0,
    deliveryFee: 150.0,
    items: [
      { name: "Shiitake Mushrooms", quantity: 2, price: 550, image: "/img.jpg" },
    ],
    deliveryMethod: "delivery",
    ...overrides,
  };
}

function setPendingOrder(data: Record<string, unknown> = {}) {
  sessionStorage.setItem("pendingOrder", JSON.stringify(createPendingOrder(data)));
}

// ---------------------------------------------------------------------------
// Setup & Teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
  sessionStorage.clear();
  mockSearchParams = new URLSearchParams();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("PaymentFailedPage", () => {
  // -----------------------------------------------------------------------
  // Rendering & Error Message
  // -----------------------------------------------------------------------
  describe("Rendering", () => {
    it("should render the page with loading fallback initially", () => {
      render(<PaymentFailedPage />);
      expect(
        screen.getByText("Payment Was Not Successful")
      ).toBeInTheDocument();
    });

    it("should show the error icon", () => {
      render(<PaymentFailedPage />);
      const icon = screen.getByRole("img", { name: /payment failed/i });
      expect(icon).toBeInTheDocument();
    });

    it("should display empathetic error message", () => {
      render(<PaymentFailedPage />);
      expect(
        screen.getByText(/we are sorry/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/your order information has been saved/i)
      ).toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------------
  // Failure Reason Display
  // -----------------------------------------------------------------------
  describe("Failure Reason", () => {
    it("should show default failure reason when no error param", () => {
      render(<PaymentFailedPage />);
      expect(
        screen.getByText(/insufficient funds/i)
      ).toBeInTheDocument();
    });

    it("should show custom failure reason from URL error param", () => {
      mockSearchParams = new URLSearchParams({
        orderId: "order-123",
        error: "Your GCash balance is insufficient for this transaction.",
      });
      render(<PaymentFailedPage />);
      expect(
        screen.getByText("Your GCash balance is insufficient for this transaction.")
      ).toBeInTheDocument();
    });

    it("should render failure reason in an alert container", () => {
      render(<PaymentFailedPage />);
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent("What happened");
    });
  });

  // -----------------------------------------------------------------------
  // Order Details Display
  // -----------------------------------------------------------------------
  describe("Order Details", () => {
    it("should show order number from sessionStorage", () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-12345678" });
      setPendingOrder();
      render(<PaymentFailedPage />);
      expect(screen.getByText("12345678")).toBeInTheDocument();
    });

    it("should show order number derived from orderId when no sessionStorage", () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-DEADBEEF" });
      render(<PaymentFailedPage />);
      expect(screen.getByText("DEADBEEF")).toBeInTheDocument();
    });

    it("should show payment method attempted", () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-12345678" });
      setPendingOrder({ paymentMethod: "gcash" });
      render(<PaymentFailedPage />);
      expect(screen.getByText("GCash")).toBeInTheDocument();
      expect(screen.getByText("Payment Method Attempted")).toBeInTheDocument();
    });

    it("should show amount when available", () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-12345678" });
      setPendingOrder({ amount: 1250.0 });
      render(<PaymentFailedPage />);
      expect(screen.getByText("PHP 1,250.00")).toBeInTheDocument();
    });

    it("should not show amount when zero", () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-12345678" });
      setPendingOrder({ amount: 0 });
      render(<PaymentFailedPage />);
      expect(screen.queryByText("PHP 0.00")).not.toBeInTheDocument();
    });

    it("should show 'no payment charged' reassurance", () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-12345678" });
      setPendingOrder();
      render(<PaymentFailedPage />);
      expect(
        screen.getByText(/no payment has been charged/i)
      ).toBeInTheDocument();
    });

    it("should show card payment method label correctly", () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-test" });
      setPendingOrder({ paymentMethod: "card" });
      render(<PaymentFailedPage />);
      expect(screen.getByText("Credit / Debit Card")).toBeInTheDocument();
    });

    it("should show grab_pay payment method label correctly", () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-test" });
      setPendingOrder({ paymentMethod: "grab_pay" });
      render(<PaymentFailedPage />);
      expect(screen.getByText("GrabPay")).toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------------
  // CTA Buttons
  // -----------------------------------------------------------------------
  describe("CTA Buttons", () => {
    it("should render Try Again button linking to checkout", () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-xyz" });
      render(<PaymentFailedPage />);
      const tryAgainLink = screen.getByRole("link", { name: /try again/i });
      expect(tryAgainLink).toBeInTheDocument();
      expect(tryAgainLink).toHaveAttribute(
        "href",
        "/checkout?orderId=order-xyz"
      );
    });

    it("should render Choose Different Method button linking to checkout", () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-xyz" });
      render(<PaymentFailedPage />);
      const methodLink = screen.getByRole("link", {
        name: /choose different method/i,
      });
      expect(methodLink).toBeInTheDocument();
      expect(methodLink).toHaveAttribute(
        "href",
        "/checkout?orderId=order-xyz"
      );
    });

    it("should render Contact Support button", () => {
      render(<PaymentFailedPage />);
      const supportLink = screen.getByRole("link", {
        name: /contact support/i,
      });
      expect(supportLink).toBeInTheDocument();
      expect(supportLink).toHaveAttribute("href", "/contact");
    });

    it("should link to plain /checkout when no orderId", () => {
      render(<PaymentFailedPage />);
      const tryAgainLink = screen.getByRole("link", { name: /try again/i });
      expect(tryAgainLink).toHaveAttribute("href", "/checkout");
    });
  });

  // -----------------------------------------------------------------------
  // Order Data Preservation (Try Again)
  // -----------------------------------------------------------------------
  describe("Order Data Preservation", () => {
    it("should keep pending order in sessionStorage for retry", () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-12345678" });
      setPendingOrder();
      render(<PaymentFailedPage />);
      // The page does NOT clear sessionStorage -- data preserved for retry
      const stored = sessionStorage.getItem("pendingOrder");
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.orderId).toBe("order-abc-12345678");
    });

    it("should include orderId in retry link for checkout to pick up", () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-retry-test" });
      render(<PaymentFailedPage />);
      const links = screen.getAllByRole("link", { name: /try again|choose different/i });
      links.forEach((link) => {
        expect(link).toHaveAttribute(
          "href",
          expect.stringContaining("orderId=order-retry-test")
        );
      });
    });
  });

  // -----------------------------------------------------------------------
  // FAQ / Help Section
  // -----------------------------------------------------------------------
  describe("FAQ Section", () => {
    it("should render Common Payment Issues heading", () => {
      render(<PaymentFailedPage />);
      expect(
        screen.getByText("Common Payment Issues")
      ).toBeInTheDocument();
    });

    it("should render all 4 FAQ questions", () => {
      render(<PaymentFailedPage />);
      expect(
        screen.getByText("Why was my payment declined?")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Will I be charged if the payment failed?")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Can I use a different payment method?")
      ).toBeInTheDocument();
      expect(
        screen.getByText(/payment was deducted but the order still shows failed/i)
      ).toBeInTheDocument();
    });

    it("should expand FAQ answer when question is clicked", () => {
      render(<PaymentFailedPage />);
      const question = screen.getByText("Why was my payment declined?");
      const button = question.closest("button")!;
      expect(button).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(button);
      expect(button).toHaveAttribute("aria-expanded", "true");
      expect(
        screen.getByText(/insufficient balance/i)
      ).toBeInTheDocument();
    });

    it("should collapse FAQ answer when clicked again", () => {
      render(<PaymentFailedPage />);
      const question = screen.getByText("Why was my payment declined?");
      const button = question.closest("button")!;

      // Open
      fireEvent.click(button);
      expect(
        screen.getByText(/insufficient balance/i)
      ).toBeInTheDocument();

      // Close
      fireEvent.click(button);
      expect(
        screen.queryByText(/insufficient balance/i)
      ).not.toBeInTheDocument();
    });

    it("should render support link in FAQ footer", () => {
      render(<PaymentFailedPage />);
      const supportLink = screen.getByText(/get in touch with our support team/i);
      expect(supportLink).toBeInTheDocument();
      expect(supportLink.closest("a")).toHaveAttribute("href", "/contact");
    });
  });

  // -----------------------------------------------------------------------
  // Responsive Layout
  // -----------------------------------------------------------------------
  describe("Responsive Layout", () => {
    it("should use Card component matching success page pattern", () => {
      render(<PaymentFailedPage />);
      const cards = screen.getAllByTestId("card");
      // Two cards: main error card and FAQ card
      expect(cards.length).toBe(2);
    });

    it("should have min-h-screen container for full viewport", () => {
      const { container } = render(<PaymentFailedPage />);
      // The Suspense wrapper renders the content
      const outerDiv = container.querySelector(".min-h-screen");
      expect(outerDiv).toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------------
  // Edge Cases
  // -----------------------------------------------------------------------
  describe("Edge Cases", () => {
    it("should handle no orderId gracefully", () => {
      render(<PaymentFailedPage />);
      // Should still render the error page without order details section
      expect(
        screen.getByText("Payment Was Not Successful")
      ).toBeInTheDocument();
      // No order number shown
      expect(screen.queryByText("Order Number")).not.toBeInTheDocument();
    });

    it("should handle corrupted sessionStorage gracefully", () => {
      sessionStorage.setItem("pendingOrder", "NOT_VALID_JSON");
      mockSearchParams = new URLSearchParams({ orderId: "order-fallback" });
      render(<PaymentFailedPage />);
      // Should still render using orderId fallback
      expect(screen.getByText("FALLBACK")).not.toBeNull;
      expect(
        screen.getByText("Payment Was Not Successful")
      ).toBeInTheDocument();
    });

    it("should handle sessionStorage with minimal data", () => {
      sessionStorage.setItem(
        "pendingOrder",
        JSON.stringify({ orderId: "min-order", orderNumber: "MINIMAL" })
      );
      mockSearchParams = new URLSearchParams({ orderId: "min-order" });
      render(<PaymentFailedPage />);
      expect(screen.getByText("MINIMAL")).toBeInTheDocument();
      // No payment method or amount shown
      expect(
        screen.queryByText("Payment Method Attempted")
      ).not.toBeInTheDocument();
    });

    it("should handle paymaya payment method label", () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-py" });
      setPendingOrder({ paymentMethod: "paymaya" });
      render(<PaymentFailedPage />);
      expect(screen.getByText("PayMaya")).toBeInTheDocument();
    });

    it("should show COD label for cod payment method", () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-cod" });
      setPendingOrder({ paymentMethod: "cod" });
      render(<PaymentFailedPage />);
      expect(screen.getByText("Cash on Delivery")).toBeInTheDocument();
    });
  });
});
