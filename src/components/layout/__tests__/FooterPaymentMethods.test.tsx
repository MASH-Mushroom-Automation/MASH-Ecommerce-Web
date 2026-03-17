import { render, screen } from "@testing-library/react";
import { FooterPaymentMethods } from "../FooterPaymentMethods";

describe("FooterPaymentMethods", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // AC5: Footer payment methods strip
  // -----------------------------------------------------------------------

  it("should render the footer payment methods strip", () => {
    render(<FooterPaymentMethods />);
    expect(screen.getByTestId("footer-payment-methods")).toBeInTheDocument();
  });

  it("should show 'Accepted Payment Methods' heading", () => {
    render(<FooterPaymentMethods />);
    expect(
      screen.getByText("Accepted Payment Methods"),
    ).toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // E-wallet logos
  // -----------------------------------------------------------------------

  it("should render GCash logo", () => {
    render(<FooterPaymentMethods />);
    expect(screen.getByTestId("payment-logo-gcash")).toBeInTheDocument();
  });

  it("should render GrabPay logo", () => {
    render(<FooterPaymentMethods />);
    expect(screen.getByTestId("payment-logo-grab_pay")).toBeInTheDocument();
  });

  it("should render Maya logo", () => {
    render(<FooterPaymentMethods />);
    expect(screen.getByTestId("payment-logo-paymaya")).toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // Card brand logos (Visa, Mastercard)
  // -----------------------------------------------------------------------

  it("should render Visa logo", () => {
    render(<FooterPaymentMethods />);
    expect(screen.getByAltText("Visa")).toBeInTheDocument();
  });

  it("should render Mastercard logo", () => {
    render(<FooterPaymentMethods />);
    expect(screen.getByAltText("Mastercard")).toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // COD badge
  // -----------------------------------------------------------------------

  it("should render COD logo", () => {
    render(<FooterPaymentMethods />);
    expect(screen.getByTestId("payment-logo-cod")).toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // Custom className
  // -----------------------------------------------------------------------

  it("should apply custom className", () => {
    render(<FooterPaymentMethods className="my-custom" />);
    expect(screen.getByTestId("footer-payment-methods")).toHaveClass(
      "my-custom",
    );
  });

  // -----------------------------------------------------------------------
  // Grayscale hover effect
  // -----------------------------------------------------------------------

  it("should have grayscale wrappers for visual treatment", () => {
    const { container } = render(<FooterPaymentMethods />);
    const grayscaleElements = container.querySelectorAll(".grayscale");
    // 3 e-wallets + 2 card brands + 1 COD = 6
    expect(grayscaleElements.length).toBe(6);
  });

  // -----------------------------------------------------------------------
  // Border and spacing
  // -----------------------------------------------------------------------

  it("should have border-t for visual separation", () => {
    render(<FooterPaymentMethods />);
    expect(screen.getByTestId("footer-payment-methods")).toHaveClass(
      "border-t",
    );
  });
});
