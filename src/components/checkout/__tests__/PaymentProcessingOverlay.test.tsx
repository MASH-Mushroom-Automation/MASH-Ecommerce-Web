import { render, screen, fireEvent } from "@testing-library/react";
import { PaymentProcessingOverlay } from "../PaymentProcessingOverlay";
import type { PaymentMethod } from "@/types/payment";

describe("PaymentProcessingOverlay", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // Visibility
  // -----------------------------------------------------------------------

  it("should render nothing when visible is false", () => {
    const { container } = render(
      <PaymentProcessingOverlay visible={false} paymentMethod="gcash" />
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render the overlay when visible is true", () => {
    render(
      <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // GCash-specific content
  // -----------------------------------------------------------------------

  it("should show 'Redirecting to GCash...' for gcash method", () => {
    render(
      <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
    );
    expect(screen.getByText("Redirecting to GCash...")).toBeInTheDocument();
  });

  it("should show GCash description about redirect", () => {
    render(
      <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
    );
    expect(
      screen.getByText(/redirected to the GCash app/i)
    ).toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // All payment methods
  // -----------------------------------------------------------------------

  const methodMessages: [PaymentMethod, string][] = [
    ["cod", "Processing your order..."],
    ["gcash", "Redirecting to GCash..."],
    ["grab_pay", "Redirecting to GrabPay..."],
    ["card", "Processing card payment..."],
    ["paymaya", "Redirecting to Maya..."],
  ];

  it.each(methodMessages)(
    "should show correct message for %s method",
    (method, expectedMessage) => {
      render(
        <PaymentProcessingOverlay visible={true} paymentMethod={method} />
      );
      expect(screen.getByText(expectedMessage)).toBeInTheDocument();
    }
  );

  // -----------------------------------------------------------------------
  // Accessibility
  // -----------------------------------------------------------------------

  it("should have aria-modal attribute", () => {
    render(
      <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
    );
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("should have correct aria-label for payment method", () => {
    render(
      <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
    );
    expect(screen.getByRole("dialog")).toHaveAttribute(
      "aria-label",
      "Processing GCash payment"
    );
  });

  // -----------------------------------------------------------------------
  // Spinner
  // -----------------------------------------------------------------------

  it("should show a loading spinner", () => {
    render(
      <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
    );
    // Lucide Loader2 renders an svg element with the animate-spin class
    const svg = document.querySelector(".animate-spin");
    expect(svg).toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // Cancel button
  // -----------------------------------------------------------------------

  it("should show cancel button when onCancel is provided", () => {
    const onCancel = jest.fn();
    render(
      <PaymentProcessingOverlay
        visible={true}
        paymentMethod="gcash"
        onCancel={onCancel}
      />
    );
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("should call onCancel when cancel button is clicked", () => {
    const onCancel = jest.fn();
    render(
      <PaymentProcessingOverlay
        visible={true}
        paymentMethod="gcash"
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("should not show cancel button when onCancel is null", () => {
    render(
      <PaymentProcessingOverlay
        visible={true}
        paymentMethod="gcash"
        onCancel={null}
      />
    );
    expect(
      screen.queryByRole("button", { name: /cancel/i })
    ).not.toBeInTheDocument();
  });

  it("should not show cancel button when onCancel is omitted", () => {
    render(
      <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
    );
    expect(
      screen.queryByRole("button", { name: /cancel/i })
    ).not.toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // Custom className
  // -----------------------------------------------------------------------

  it("should apply custom className to overlay", () => {
    render(
      <PaymentProcessingOverlay
        visible={true}
        paymentMethod="gcash"
        className="test-custom-class"
      />
    );
    expect(screen.getByRole("dialog")).toHaveClass("test-custom-class");
  });
});
