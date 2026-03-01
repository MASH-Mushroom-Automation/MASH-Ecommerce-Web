import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CheckoutSuccessModal } from "../CheckoutSuccessModal";

describe("CheckoutSuccessModal", () => {
  const defaultProps = {
    vendorName: "Mushroom Farm",
    remainingVendors: [] as string[],
    onViewOrders: jest.fn(),
    onNextVendor: jest.fn(),
    onContinueShopping: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render success message", () => {
    render(<CheckoutSuccessModal {...defaultProps} />);
    expect(screen.getByText("Order placed successfully!")).toBeInTheDocument();
  });

  it("should display vendor name in confirmation", () => {
    render(<CheckoutSuccessModal {...defaultProps} />);
    expect(
      screen.getByText("Your order from Mushroom Farm has been confirmed.")
    ).toBeInTheDocument();
  });

  it("should show seller notification message", () => {
    render(<CheckoutSuccessModal {...defaultProps} />);
    expect(
      screen.getByText("The seller will be notified about your new order!")
    ).toBeInTheDocument();
  });

  it("should render Continue Shopping and View Orders when no remaining vendors", () => {
    render(<CheckoutSuccessModal {...defaultProps} />);
    expect(screen.getByText("Continue Shopping")).toBeInTheDocument();
    expect(screen.getByText("View Orders")).toBeInTheDocument();
  });

  it("should call onContinueShopping when button clicked", () => {
    render(<CheckoutSuccessModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Continue Shopping"));
    expect(defaultProps.onContinueShopping).toHaveBeenCalledTimes(1);
  });

  it("should call onViewOrders when View Orders clicked (no remaining)", () => {
    render(<CheckoutSuccessModal {...defaultProps} />);
    fireEvent.click(screen.getByText("View Orders"));
    expect(defaultProps.onViewOrders).toHaveBeenCalledTimes(1);
  });

  it("should show remaining vendors section when vendors exist", () => {
    const props = {
      ...defaultProps,
      remainingVendors: ["Farm B", "Farm C"],
    };
    render(<CheckoutSuccessModal {...props} />);
    expect(
      screen.getByText("You still have items from 2 other vendors")
    ).toBeInTheDocument();
    expect(screen.getByText("Farm B, Farm C")).toBeInTheDocument();
  });

  it("should use singular vendor text for one remaining", () => {
    const props = {
      ...defaultProps,
      remainingVendors: ["Farm B"],
    };
    render(<CheckoutSuccessModal {...props} />);
    expect(
      screen.getByText("You still have items from 1 other vendor")
    ).toBeInTheDocument();
  });

  it("should show Checkout Next Vendor button when remaining vendors exist", () => {
    const props = {
      ...defaultProps,
      remainingVendors: ["Farm B"],
    };
    render(<CheckoutSuccessModal {...props} />);
    expect(screen.getByText("Checkout Next Vendor")).toBeInTheDocument();
    expect(screen.getByText("View Orders")).toBeInTheDocument();
  });

  it("should call onNextVendor with first remaining vendor", () => {
    const props = {
      ...defaultProps,
      remainingVendors: ["Farm B", "Farm C"],
    };
    render(<CheckoutSuccessModal {...props} />);
    fireEvent.click(screen.getByText("Checkout Next Vendor"));
    expect(props.onNextVendor).toHaveBeenCalledWith("Farm B");
  });

  it("should render checkmark icon", () => {
    render(<CheckoutSuccessModal {...defaultProps} />);
    const svg = document.querySelector('svg path[d="M5 13l4 4L19 7"]');
    expect(svg).toBeInTheDocument();
  });

  it("should not show vendor name when null", () => {
    const props = { ...defaultProps, vendorName: null };
    render(<CheckoutSuccessModal {...props} />);
    expect(screen.queryByText(/Your order from/)).not.toBeInTheDocument();
  });
});
