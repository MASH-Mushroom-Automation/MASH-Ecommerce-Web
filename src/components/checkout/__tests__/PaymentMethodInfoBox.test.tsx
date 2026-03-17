import { render, screen } from "@testing-library/react";
import {
  PaymentMethodInfoBox,
  getPaymentButtonLabel,
} from "../PaymentMethodInfoBox";
import type { PaymentMethod } from "@/types/payment";

describe("PaymentMethodInfoBox", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // Visibility rules
  // -----------------------------------------------------------------------

  it("should render nothing for COD", () => {
    const { container } = render(
      <PaymentMethodInfoBox selectedMethod="cod" />
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render info box for GCash", () => {
    render(<PaymentMethodInfoBox selectedMethod="gcash" />);
    expect(screen.getByRole("note")).toBeInTheDocument();
  });

  it("should render info box for GrabPay", () => {
    render(<PaymentMethodInfoBox selectedMethod="grab_pay" />);
    expect(screen.getByRole("note")).toBeInTheDocument();
  });

  it("should render info box for card", () => {
    render(<PaymentMethodInfoBox selectedMethod="card" />);
    expect(screen.getByRole("note")).toBeInTheDocument();
  });

  it("should render info box for PayMaya", () => {
    render(<PaymentMethodInfoBox selectedMethod="paymaya" />);
    expect(screen.getByRole("note")).toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // GCash-specific content
  // -----------------------------------------------------------------------

  it("should show GCash Payment title when gcash selected", () => {
    render(<PaymentMethodInfoBox selectedMethod="gcash" />);
    expect(screen.getByText("GCash Payment")).toBeInTheDocument();
  });

  it("should show redirect explanation for GCash", () => {
    render(<PaymentMethodInfoBox selectedMethod="gcash" />);
    expect(
      screen.getByText(/redirected to GCash to authorize/i)
    ).toBeInTheDocument();
  });

  it("should show mobile deep link note for GCash", () => {
    render(<PaymentMethodInfoBox selectedMethod="gcash" />);
    expect(screen.getByText(/GCash app directly/i)).toBeInTheDocument();
  });

  it("should show do-not-close notice for GCash (redirect method)", () => {
    render(<PaymentMethodInfoBox selectedMethod="gcash" />);
    expect(
      screen.getByText(/do not close your browser/i)
    ).toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // GrabPay content
  // -----------------------------------------------------------------------

  it("should show GrabPay Payment title", () => {
    render(<PaymentMethodInfoBox selectedMethod="grab_pay" />);
    expect(screen.getByText("GrabPay Payment")).toBeInTheDocument();
  });

  it("should show redirect explanation for GrabPay", () => {
    render(<PaymentMethodInfoBox selectedMethod="grab_pay" />);
    expect(
      screen.getByText(/redirected to Grab to authorize/i)
    ).toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // Card content
  // -----------------------------------------------------------------------

  it("should show Card Payment title", () => {
    render(<PaymentMethodInfoBox selectedMethod="card" />);
    expect(screen.getByText("Card Payment")).toBeInTheDocument();
  });

  it("should mention 3D Secure for card", () => {
    render(<PaymentMethodInfoBox selectedMethod="card" />);
    expect(screen.getByText(/3D Secure/i)).toBeInTheDocument();
  });

  it("should not show mobile note for card (no deep link)", () => {
    render(<PaymentMethodInfoBox selectedMethod="card" />);
    expect(
      screen.queryByText(/app directly/i)
    ).not.toBeInTheDocument();
  });

  it("should not show do-not-close notice for card (not a redirect method)", () => {
    render(<PaymentMethodInfoBox selectedMethod="card" />);
    expect(
      screen.queryByText(/do not close your browser/i)
    ).not.toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // PayMaya content
  // -----------------------------------------------------------------------

  it("should show Maya Payment title", () => {
    render(<PaymentMethodInfoBox selectedMethod="paymaya" />);
    expect(screen.getByText("Maya Payment")).toBeInTheDocument();
  });

  it("should show mobile note for Maya", () => {
    render(<PaymentMethodInfoBox selectedMethod="paymaya" />);
    expect(screen.getByText(/Maya app directly/i)).toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // Accessibility
  // -----------------------------------------------------------------------

  it("should have correct aria-label for GCash info box", () => {
    render(<PaymentMethodInfoBox selectedMethod="gcash" />);
    expect(screen.getByRole("note")).toHaveAttribute(
      "aria-label",
      "GCash Payment information"
    );
  });

  // -----------------------------------------------------------------------
  // Custom className
  // -----------------------------------------------------------------------

  it("should apply custom className", () => {
    render(
      <PaymentMethodInfoBox selectedMethod="gcash" className="test-class" />
    );
    expect(screen.getByRole("note")).toHaveClass("test-class");
  });
});

// ---------------------------------------------------------------------------
// getPaymentButtonLabel
// ---------------------------------------------------------------------------

describe("getPaymentButtonLabel", () => {
  // Non-submitting state
  const buttonLabels: [PaymentMethod, string][] = [
    ["cod", "Place Order (Cash Payment)"],
    ["gcash", "Pay with GCash"],
    ["grab_pay", "Pay with GrabPay"],
    ["card", "Pay with Card"],
    ["paymaya", "Pay with Maya"],
  ];

  it.each(buttonLabels)(
    "should return '%s' button label as '%s' when not submitting",
    (method, expected) => {
      expect(getPaymentButtonLabel(method, false)).toBe(expected);
    }
  );

  // Submitting state
  const submittingLabels: [PaymentMethod, string][] = [
    ["cod", "Creating Order..."],
    ["gcash", "Redirecting to GCash..."],
    ["grab_pay", "Redirecting to GrabPay..."],
    ["card", "Processing Payment..."],
    ["paymaya", "Redirecting to Maya..."],
  ];

  it.each(submittingLabels)(
    "should return '%s' submitting label as '%s'",
    (method, expected) => {
      expect(getPaymentButtonLabel(method, true)).toBe(expected);
    }
  );
});
