import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PaymentMethodSelector } from "../PaymentMethodSelector";

// Mock payment config
jest.mock("@/lib/payment/config", () => ({
  getAvailablePaymentMethods: jest.fn(() => [
    "cod",
    "gcash",
    "grab_pay",
    "card",
    "paymaya",
  ]),
}));

import { getAvailablePaymentMethods } from "@/lib/payment/config";

const mockGetAvailable = getAvailablePaymentMethods as jest.MockedFunction<
  typeof getAvailablePaymentMethods
>;

describe("PaymentMethodSelector", () => {
  const defaultProps = {
    value: "cod" as const,
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAvailable.mockReturnValue([
      "cod",
      "gcash",
      "grab_pay",
      "card",
      "paymaya",
    ]);
  });

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------

  it("should render all five payment methods", () => {
    render(<PaymentMethodSelector {...defaultProps} />);
    expect(screen.getByText("Cash on Delivery")).toBeInTheDocument();
    expect(screen.getByText("GCash")).toBeInTheDocument();
    expect(screen.getByText("GrabPay")).toBeInTheDocument();
    expect(screen.getByText("Credit / Debit Card")).toBeInTheDocument();
    expect(screen.getByText("PayMaya")).toBeInTheDocument();
  });

  it("should render descriptions for each method", () => {
    render(<PaymentMethodSelector {...defaultProps} />);
    expect(
      screen.getByText("Pay when you receive your order")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Pay using your GCash e-wallet")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Pay using your GrabPay e-wallet")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Visa, Mastercard, and other major cards")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Pay using your PayMaya e-wallet")
    ).toBeInTheDocument();
  });

  it("should have aria-label on the radiogroup", () => {
    render(<PaymentMethodSelector {...defaultProps} />);
    expect(
      screen.getByRole("radiogroup", { name: "Select payment method" })
    ).toBeInTheDocument();
  });

  it("should render 5 radio items", () => {
    render(<PaymentMethodSelector {...defaultProps} />);
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(5);
  });

  // ---------------------------------------------------------------------------
  // Selection
  // ---------------------------------------------------------------------------

  it("should mark current value as checked", () => {
    render(<PaymentMethodSelector {...defaultProps} value="gcash" />);
    const radios = screen.getAllByRole("radio");
    // GCash is the second method
    expect(radios[1]).toHaveAttribute("aria-checked", "true");
  });

  it("should call onChange when a method is clicked", () => {
    render(<PaymentMethodSelector {...defaultProps} />);
    const gcashRadio = screen.getAllByRole("radio")[1]; // gcash
    fireEvent.click(gcashRadio);
    expect(defaultProps.onChange).toHaveBeenCalledWith("gcash");
  });

  it("should not call onChange when a disabled method is clicked", () => {
    mockGetAvailable.mockReturnValue(["cod"]);
    render(<PaymentMethodSelector {...defaultProps} />);
    const gcashRadio = screen.getAllByRole("radio")[1]; // gcash - disabled
    fireEvent.click(gcashRadio);
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // COD-only mode (PayMongo not configured)
  // ---------------------------------------------------------------------------

  it("should disable online methods when PayMongo is off", () => {
    mockGetAvailable.mockReturnValue(["cod"]);
    render(<PaymentMethodSelector {...defaultProps} />);
    const radios = screen.getAllByRole("radio");
    // COD (index 0) should be enabled
    expect(radios[0]).not.toBeDisabled();
    // GCash, GrabPay, Card, PayMaya should be disabled
    expect(radios[1]).toBeDisabled();
    expect(radios[2]).toBeDisabled();
    expect(radios[3]).toBeDisabled();
    expect(radios[4]).toBeDisabled();
  });

  it("should show 'Coming Soon' badges for disabled methods", () => {
    mockGetAvailable.mockReturnValue(["cod"]);
    render(<PaymentMethodSelector {...defaultProps} />);
    const badges = screen.getAllByText("Coming Soon");
    expect(badges).toHaveLength(4); // 4 disabled methods
  });

  it("should COD always be enabled regardless of PayMongo config", () => {
    mockGetAvailable.mockReturnValue(["cod"]);
    render(<PaymentMethodSelector {...defaultProps} />);
    const codRadio = screen.getAllByRole("radio")[0];
    expect(codRadio).not.toBeDisabled();
    expect(screen.getByText("Cash on Delivery")).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Loading skeleton
  // ---------------------------------------------------------------------------

  it("should show loading skeleton when loading=true", () => {
    render(<PaymentMethodSelector {...defaultProps} loading={true} />);
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-label", "Loading payment methods");
  });

  it("should not show skeleton when loading=false", () => {
    render(<PaymentMethodSelector {...defaultProps} loading={false} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(5);
  });

  // ---------------------------------------------------------------------------
  // Responsive grid
  // ---------------------------------------------------------------------------

  it("should have responsive grid classes", () => {
    const { container } = render(
      <PaymentMethodSelector {...defaultProps} />
    );
    const grid = container.querySelector("[role='radiogroup']");
    expect(grid).toHaveClass("grid-cols-1");
    expect(grid).toHaveClass("md:grid-cols-2");
  });

  // ---------------------------------------------------------------------------
  // Custom className
  // ---------------------------------------------------------------------------

  it("should accept additional className", () => {
    const { container } = render(
      <PaymentMethodSelector {...defaultProps} className="custom-class" />
    );
    const grid = container.querySelector("[role='radiogroup']");
    expect(grid).toHaveClass("custom-class");
  });
});
