import { render, screen } from "@testing-library/react";
import { PaymentLogo, CARD_BRAND_LOGOS } from "../PaymentLogo";
import type { PaymentMethod } from "@/types/payment";
import { PAYMENT_METHODS } from "@/types/payment";

describe("PaymentLogo", () => {
  // -----------------------------------------------------------------------
  // AC3: Renders correct logo per payment method
  // -----------------------------------------------------------------------

  it.each<PaymentMethod>(PAYMENT_METHODS)(
    "should render logo for %s method",
    (method) => {
      render(<PaymentLogo method={method} />);
      const wrapper = screen.getByTestId(`payment-logo-${method}`);
      expect(wrapper).toBeInTheDocument();
      // Should contain an img tag
      const img = wrapper.querySelector("img");
      expect(img).toBeInTheDocument();
    },
  );

  it("should render GCash logo with correct alt text", () => {
    render(<PaymentLogo method="gcash" />);
    expect(screen.getByAltText("GCash")).toBeInTheDocument();
  });

  it("should render GrabPay logo with correct alt text", () => {
    render(<PaymentLogo method="grab_pay" />);
    expect(screen.getByAltText("GrabPay")).toBeInTheDocument();
  });

  it("should render COD logo with correct alt text", () => {
    render(<PaymentLogo method="cod" />);
    expect(screen.getByAltText("Cash on Delivery")).toBeInTheDocument();
  });

  it("should render card logo with correct alt text", () => {
    render(<PaymentLogo method="card" />);
    expect(screen.getByAltText("Credit / Debit Card")).toBeInTheDocument();
  });

  it("should render Maya logo with correct alt text", () => {
    render(<PaymentLogo method="paymaya" />);
    expect(screen.getByAltText("Maya")).toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // Alt text override
  // -----------------------------------------------------------------------

  it("should allow alt text override", () => {
    render(<PaymentLogo method="gcash" alt="Custom Alt" />);
    expect(screen.getByAltText("Custom Alt")).toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // Size presets
  // -----------------------------------------------------------------------

  it("should use md size by default", () => {
    render(<PaymentLogo method="gcash" />);
    const img = screen.getByAltText("GCash");
    expect(img).toHaveAttribute("width", "72");
    expect(img).toHaveAttribute("height", "24");
  });

  it("should use sm size when specified", () => {
    render(<PaymentLogo method="gcash" size="sm" />);
    const img = screen.getByAltText("GCash");
    expect(img).toHaveAttribute("width", "48");
    expect(img).toHaveAttribute("height", "16");
  });

  it("should use lg size when specified", () => {
    render(<PaymentLogo method="gcash" size="lg" />);
    const img = screen.getByAltText("GCash");
    expect(img).toHaveAttribute("width", "96");
    expect(img).toHaveAttribute("height", "32");
  });

  // -----------------------------------------------------------------------
  // Custom className
  // -----------------------------------------------------------------------

  it("should apply custom className", () => {
    render(<PaymentLogo method="gcash" className="my-custom-class" />);
    const wrapper = screen.getByTestId("payment-logo-gcash");
    expect(wrapper).toHaveClass("my-custom-class");
  });

  // -----------------------------------------------------------------------
  // AC4: Dark mode compatibility
  // -----------------------------------------------------------------------

  it("should have dark mode brightness/contrast classes", () => {
    render(<PaymentLogo method="gcash" />);
    const wrapper = screen.getByTestId("payment-logo-gcash");
    expect(wrapper.className).toContain("dark:brightness-110");
    expect(wrapper.className).toContain("dark:contrast-90");
  });

  // -----------------------------------------------------------------------
  // SVG source paths
  // -----------------------------------------------------------------------

  it("should use correct SVG source for gcash", () => {
    render(<PaymentLogo method="gcash" />);
    const img = screen.getByAltText("GCash");
    expect(img).toHaveAttribute("src", "/payment-logos/gcash.svg");
  });

  it("should use correct SVG source for grab_pay", () => {
    render(<PaymentLogo method="grab_pay" />);
    const img = screen.getByAltText("GrabPay");
    expect(img).toHaveAttribute("src", "/payment-logos/grabpay.svg");
  });

  it("should use correct SVG source for cod", () => {
    render(<PaymentLogo method="cod" />);
    const img = screen.getByAltText("Cash on Delivery");
    expect(img).toHaveAttribute("src", "/payment-logos/cod-icon.svg");
  });

  it("should use correct SVG source for card", () => {
    render(<PaymentLogo method="card" />);
    const img = screen.getByAltText("Credit / Debit Card");
    expect(img).toHaveAttribute("src", "/payment-logos/visa.svg");
  });

  it("should use correct SVG source for paymaya", () => {
    render(<PaymentLogo method="paymaya" />);
    const img = screen.getByAltText("Maya");
    expect(img).toHaveAttribute("src", "/payment-logos/maya.svg");
  });

  // -----------------------------------------------------------------------
  // CARD_BRAND_LOGOS export
  // -----------------------------------------------------------------------

  it("should export CARD_BRAND_LOGOS with visa and mastercard", () => {
    expect(CARD_BRAND_LOGOS).toHaveLength(2);
    expect(CARD_BRAND_LOGOS[0].alt).toBe("Visa");
    expect(CARD_BRAND_LOGOS[1].alt).toBe("Mastercard");
  });

  // -----------------------------------------------------------------------
  // Unoptimized flag (for SVGs)
  // -----------------------------------------------------------------------

  it("should render with unoptimized attribute for SVGs", () => {
    render(<PaymentLogo method="gcash" />);
    const img = screen.getByAltText("GCash");
    // unoptimized SVGs use src directly (not /_next/image)
    expect(img.getAttribute("src")).not.toContain("/_next/image");
  });
});
