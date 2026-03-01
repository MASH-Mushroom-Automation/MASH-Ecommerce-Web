/**
 * Payment Success Page Tests (PAY-013)
 *
 * Tests the enhanced payment verification flow including:
 * - API-based payment verification on mount
 * - Order details display (order number, method, amount, delivery)
 * - Success animation rendering
 * - CTA buttons (View Order, Continue Shopping, Download Receipt)
 * - Cart clearing after verified payment
 * - Email sending if not already sent by webhook
 * - Polling for pending payments
 * - Failed verification state
 * - No orderId edge case
 * - Responsive layout
 */

import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import PaymentSuccessPage from "../page";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockClearCart = jest.fn();
const mockRemoveVendorItems = jest.fn();

jest.mock("@/contexts/CartContext", () => ({
  useCart: () => ({
    items: [],
    clearCart: mockClearCart,
    removeVendorItems: mockRemoveVendorItems,
  }),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock next/navigation
let mockSearchParams = new URLSearchParams();
jest.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

// Mock email client
const mockSendEmail = jest.fn().mockResolvedValue({ success: true });
jest.mock("@/lib/email/client", () => ({
  sendOrderConfirmationEmailViaAPI: (...args: unknown[]) => mockSendEmail(...args),
}));

// Mock Card component from shadcn
jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-content" className={className}>{children}</div>
  ),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setPendingOrder(data: Record<string, unknown>) {
  sessionStorage.setItem("pendingOrder", JSON.stringify(data));
}

function createPendingOrder(overrides: Record<string, unknown> = {}) {
  return {
    orderId: "order-abc-123",
    orderNumber: "MASH-0001",
    customerEmail: "test@example.com",
    customerName: "Test User",
    paymentMethod: "gcash",
    vendor: "Farm Fresh",
    timestamp: Date.now(),
    amount: 1500,
    subtotal: 1400,
    deliveryFee: 100,
    items: [
      { name: "Oyster Mushroom", quantity: 2, price: 700 },
    ],
    deliveryMethod: "lalamove",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  sessionStorage.clear();
  mockSearchParams = new URLSearchParams();

  // Default: fetch returns success
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ success: true, status: "succeeded", paid: true }),
  }) as jest.Mock;
});

afterEach(() => {
  jest.useRealTimers();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("PaymentSuccessPage", () => {
  // -----------------------------------------------------------------------
  // Rendering & Structure
  // -----------------------------------------------------------------------

  describe("Rendering", () => {
    it("should render the Suspense fallback with a spinner initially", () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });
      const { container } = render(<PaymentSuccessPage />);
      // Suspense fallback or verifying state renders a spinner
      expect(container.querySelector(".animate-spin")).toBeTruthy();
    });

    it("should show verifying state when orderId is present", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });

      // Delay fetch so we can see the verifying state
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // never resolves
      );

      render(<PaymentSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText("Verifying Payment...")).toBeInTheDocument();
      });
    });

    it("should show success immediately when no orderId is present", async () => {
      mockSearchParams = new URLSearchParams();

      render(<PaymentSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText("Payment Successful!")).toBeInTheDocument();
      });
    });
  });

  // -----------------------------------------------------------------------
  // Payment Verification via API
  // -----------------------------------------------------------------------

  describe("Payment Verification", () => {
    it("should call /api/payment/status on mount with orderId", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });

      render(<PaymentSuccessPage />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/api/payment/status?paymentId=order-abc-123")
        );
      });
    });

    it("should show success when API returns paid=true", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });
      const pending = createPendingOrder();
      setPendingOrder(pending);

      render(<PaymentSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText("Payment Successful!")).toBeInTheDocument();
      });
    });

    it("should show success when API returns status=succeeded", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, status: "succeeded", paid: false }),
      });

      render(<PaymentSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText("Payment Successful!")).toBeInTheDocument();
      });
    });

    it("should show failed state when API returns status=failed", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, status: "failed", paid: false }),
      });

      render(<PaymentSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText("Payment Not Confirmed")).toBeInTheDocument();
      });
    });

    it("should show failed state when API returns status=cancelled", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, status: "cancelled", paid: false }),
      });

      render(<PaymentSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText("Payment Not Confirmed")).toBeInTheDocument();
      });
    });

    it("should treat as success when pending order exists and API returns pending", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });
      const pending = createPendingOrder();
      setPendingOrder(pending);

      // API says pending but we have sessionStorage data
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, status: "pending", paid: false }),
      });

      render(<PaymentSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText("Payment Successful!")).toBeInTheDocument();
      });
    });

    it("should handle API fetch failure gracefully", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });
      const pending = createPendingOrder();
      setPendingOrder(pending);

      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      render(<PaymentSuccessPage />);

      // With pending order data and fetch error (returns pending), still show success
      await waitFor(() => {
        expect(screen.getByText("Payment Successful!")).toBeInTheDocument();
      });
    });
  });

  // -----------------------------------------------------------------------
  // Order Details Display
  // -----------------------------------------------------------------------

  describe("Order Details Display", () => {
    it("should display order number from pending order", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });
      const pending = createPendingOrder({ orderNumber: "MASH-5678" });
      setPendingOrder(pending);

      render(<PaymentSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText("MASH-5678")).toBeInTheDocument();
      });
    });

    it("should display payment method label", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });
      const pending = createPendingOrder({ paymentMethod: "gcash" });
      setPendingOrder(pending);

      render(<PaymentSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText("GCash")).toBeInTheDocument();
      });
    });

    it("should display amount paid", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });
      const pending = createPendingOrder({ amount: 1500 });
      setPendingOrder(pending);

      render(<PaymentSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText(/PHP.*1,500\.00/)).toBeInTheDocument();
      });
    });

    it("should display delivery method", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });
      const pending = createPendingOrder({ deliveryMethod: "lalamove" });
      setPendingOrder(pending);

      render(<PaymentSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText("Home Delivery")).toBeInTheDocument();
      });
    });

    it("should display Store Pickup when delivery method is pickup", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });
      const pending = createPendingOrder({ deliveryMethod: "pickup" });
      setPendingOrder(pending);

      render(<PaymentSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText("Store Pickup")).toBeInTheDocument();
      });
    });

    it("should display estimated delivery text", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });
      const pending = createPendingOrder({ deliveryMethod: "lalamove" });
      setPendingOrder(pending);

      render(<PaymentSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText("Estimated: 2-5 business days")).toBeInTheDocument();
      });
    });
  });

  // -----------------------------------------------------------------------
  // Success Animation
  // -----------------------------------------------------------------------

  describe("Success Animation", () => {
    it("should render success icon with animation class", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });
      setPendingOrder(createPendingOrder());

      render(<PaymentSuccessPage />);

      await waitFor(() => {
        const iconContainer = screen.getByRole("img", { name: "Payment successful" });
        expect(iconContainer).toHaveClass("motion-safe:animate-success-pop");
      });
    });
  });

  // -----------------------------------------------------------------------
  // CTA Buttons
  // -----------------------------------------------------------------------

  describe("CTA Buttons", () => {
    it("should render View Order link to order history", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });
      setPendingOrder(createPendingOrder());

      render(<PaymentSuccessPage />);

      await waitFor(() => {
        const viewOrderLink = screen.getByRole("link", { name: /View Order/i });
        expect(viewOrderLink).toHaveAttribute("href", "/profile/order-history");
      });
    });

    it("should render Continue Shopping link to /shop", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });
      setPendingOrder(createPendingOrder());

      render(<PaymentSuccessPage />);

      await waitFor(() => {
        const shopLink = screen.getByRole("link", { name: /Continue Shopping/i });
        expect(shopLink).toHaveAttribute("href", "/shop");
      });
    });

    it("should render disabled Download Receipt button", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });
      setPendingOrder(createPendingOrder());

      render(<PaymentSuccessPage />);

      await waitFor(() => {
        const receiptBtn = screen.getByRole("button", { name: /Download Receipt/i });
        expect(receiptBtn).toBeDisabled();
      });
    });
  });

  // -----------------------------------------------------------------------
  // Cart Clearing
  // -----------------------------------------------------------------------

  describe("Cart Clearing", () => {
    it("should clear vendor items when vendor is specified", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });
      setPendingOrder(createPendingOrder({ vendor: "Farm Fresh" }));

      render(<PaymentSuccessPage />);

      await waitFor(() => {
        expect(mockRemoveVendorItems).toHaveBeenCalledWith("Farm Fresh");
      });
    });

    it("should clear entire cart when no vendor is specified", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });
      setPendingOrder(createPendingOrder({ vendor: undefined }));

      render(<PaymentSuccessPage />);

      await waitFor(() => {
        expect(mockClearCart).toHaveBeenCalled();
      });
    });

    it("should only clear cart once even if rerendered", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });
      setPendingOrder(createPendingOrder());

      const { rerender } = render(<PaymentSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText("Payment Successful!")).toBeInTheDocument();
      });

      rerender(<PaymentSuccessPage />);

      // Should still only be called once
      const totalCartCalls = mockRemoveVendorItems.mock.calls.length + mockClearCart.mock.calls.length;
      expect(totalCartCalls).toBe(1);
    });
  });

  // -----------------------------------------------------------------------
  // Email Sending
  // -----------------------------------------------------------------------

  describe("Email Sending", () => {
    it("should send confirmation email with correct data", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });
      const pending = createPendingOrder();
      setPendingOrder(pending);

      render(<PaymentSuccessPage />);

      await waitFor(() => {
        expect(mockSendEmail).toHaveBeenCalledWith(
          "test@example.com",
          expect.objectContaining({
            customerName: "Test User",
            orderNumber: "MASH-0001",
            orderId: "order-abc-123",
            total: 1500,
            paymentMethod: "gcash",
          })
        );
      });
    });

    it("should not send email if no customer email in pending order", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });
      setPendingOrder(createPendingOrder({ customerEmail: undefined }));

      render(<PaymentSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText("Payment Successful!")).toBeInTheDocument();
      });

      expect(mockSendEmail).not.toHaveBeenCalled();
    });

    it("should handle email send failure gracefully", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });
      setPendingOrder(createPendingOrder());

      mockSendEmail.mockRejectedValue(new Error("Email service down"));

      render(<PaymentSuccessPage />);

      // Should still show success even if email fails
      await waitFor(() => {
        expect(screen.getByText("Payment Successful!")).toBeInTheDocument();
      });
    });

    it("should show email sent text when email succeeds", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });
      setPendingOrder(createPendingOrder());

      render(<PaymentSuccessPage />);

      await waitFor(() => {
        expect(
          screen.getByText("A confirmation email has been sent to your email address.")
        ).toBeInTheDocument();
      });
    });
  });

  // -----------------------------------------------------------------------
  // SessionStorage Cleanup
  // -----------------------------------------------------------------------

  describe("SessionStorage", () => {
    it("should clear pendingOrder from sessionStorage after success", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });
      setPendingOrder(createPendingOrder());

      render(<PaymentSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText("Payment Successful!")).toBeInTheDocument();
      });

      expect(sessionStorage.getItem("pendingOrder")).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // Polling for Pending Payments
  // -----------------------------------------------------------------------

  describe("Polling", () => {
    it("should start polling when payment is pending and no sessionStorage", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });
      // No sessionStorage data set

      // First call returns pending
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, status: "pending", paid: false }),
      });

      render(<PaymentSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText("Payment Processing...")).toBeInTheDocument();
      });
    });

    it("should show poll count during polling", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, status: "pending", paid: false }),
      });

      render(<PaymentSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText(/Checking status/)).toBeInTheDocument();
      });
    });

    it("should transition to success when poll returns paid=true", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });

      // First call: pending (no sessionStorage), then success on poll
      let callCount = 0;
      (global.fetch as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, status: "pending", paid: false }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, status: "succeeded", paid: true }),
        });
      });

      render(<PaymentSuccessPage />);

      // First: pending
      await waitFor(() => {
        expect(screen.getByText("Payment Processing...")).toBeInTheDocument();
      });

      // Advance timer to trigger poll
      await act(async () => {
        jest.advanceTimersByTime(5000);
      });

      // Second fetch resolves to succeeded
      await waitFor(() => {
        expect(screen.getByText("Payment Successful!")).toBeInTheDocument();
      });
    });

    it("should transition to failed when poll returns status=failed", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });

      let callCount = 0;
      (global.fetch as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, status: "pending", paid: false }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, status: "failed", paid: false }),
        });
      });

      render(<PaymentSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText("Payment Processing...")).toBeInTheDocument();
      });

      await act(async () => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(screen.getByText("Payment Not Confirmed")).toBeInTheDocument();
      });
    });
  });

  // -----------------------------------------------------------------------
  // Failed State UI
  // -----------------------------------------------------------------------

  describe("Failed State", () => {
    it("should show Try Again link to /checkout", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, status: "failed", paid: false }),
      });

      render(<PaymentSuccessPage />);

      await waitFor(() => {
        const tryAgainLink = screen.getByRole("link", { name: /Try Again/i });
        expect(tryAgainLink).toHaveAttribute("href", "/checkout");
      });
    });

    it("should show Continue Shopping link in failed state", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, status: "failed", paid: false }),
      });

      render(<PaymentSuccessPage />);

      await waitFor(() => {
        const shopLink = screen.getByRole("link", { name: /Continue Shopping/i });
        expect(shopLink).toHaveAttribute("href", "/shop");
      });
    });

    it("should display order number in failed state when available", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });
      setPendingOrder(createPendingOrder({ orderNumber: "MASH-9999" }));

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, status: "failed", paid: false }),
      });

      render(<PaymentSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText("MASH-9999")).toBeInTheDocument();
      });
    });
  });

  // -----------------------------------------------------------------------
  // Edge Cases
  // -----------------------------------------------------------------------

  describe("Edge Cases", () => {
    it("should handle invalid JSON in sessionStorage gracefully", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });
      sessionStorage.setItem("pendingOrder", "not-valid-json");

      render(<PaymentSuccessPage />);

      // Should still render (falls back to orderId-based data)
      await waitFor(() => {
        expect(screen.getByText("Payment Successful!")).toBeInTheDocument();
      });
    });

    it("should not display amount when amount is 0", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });
      setPendingOrder(createPendingOrder({ amount: 0 }));

      render(<PaymentSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText("Payment Successful!")).toBeInTheDocument();
      });

      expect(screen.queryByText("Amount Paid")).not.toBeInTheDocument();
    });

    it("should handle non-ok API response gracefully", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });
      setPendingOrder(createPendingOrder());

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: "Server error" }),
      });

      render(<PaymentSuccessPage />);

      // Should still show success when pending order exists
      await waitFor(() => {
        expect(screen.getByText("Payment Successful!")).toBeInTheDocument();
      });
    });

    it("should show GrabPay label when payment method is grab_pay", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });
      setPendingOrder(createPendingOrder({ paymentMethod: "grab_pay" }));

      render(<PaymentSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText("GrabPay")).toBeInTheDocument();
      });
    });

    it("should show Credit / Debit Card label for card payment", async () => {
      mockSearchParams = new URLSearchParams({ orderId: "order-abc-123" });
      setPendingOrder(createPendingOrder({ paymentMethod: "card" }));

      render(<PaymentSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText("Credit / Debit Card")).toBeInTheDocument();
      });
    });
  });
});
