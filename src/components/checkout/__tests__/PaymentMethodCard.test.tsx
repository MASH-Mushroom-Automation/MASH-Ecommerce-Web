import React from "react";
import { render, screen } from "@testing-library/react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { PaymentMethodCard } from "../PaymentMethodCard";

// Wrap PaymentMethodCard in RadioGroup.Root for Radix context
function renderCard(
  props: Partial<React.ComponentProps<typeof PaymentMethodCard>> = {}
) {
  const defaultProps = {
    method: "cod" as const,
    selected: false,
    disabled: false,
    ...props,
  };

  return render(
    <RadioGroupPrimitive.Root value={defaultProps.selected ? defaultProps.method : ""}>
      <PaymentMethodCard {...defaultProps} />
    </RadioGroupPrimitive.Root>
  );
}

describe("PaymentMethodCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the method label correctly", () => {
    renderCard({ method: "cod" });
    expect(screen.getByText("Cash on Delivery")).toBeInTheDocument();
  });

  it("should render the method description", () => {
    renderCard({ method: "gcash" });
    expect(
      screen.getByText("Pay using your GCash e-wallet")
    ).toBeInTheDocument();
  });

  it("should render all five payment method labels", () => {
    const methods = ["cod", "gcash", "grab_pay", "card", "paymaya"] as const;
    const labels = [
      "Cash on Delivery",
      "GCash",
      "GrabPay",
      "Credit / Debit Card",
      "PayMaya",
    ];

    methods.forEach((method, i) => {
      const { unmount } = renderCard({ method });
      expect(screen.getByText(labels[i])).toBeInTheDocument();
      unmount();
    });
  });

  it("should show 'Coming Soon' badge when disabled", () => {
    renderCard({ method: "gcash", disabled: true });
    expect(screen.getByText("Coming Soon")).toBeInTheDocument();
  });

  it("should NOT show 'Coming Soon' badge when enabled", () => {
    renderCard({ method: "gcash", disabled: false });
    expect(screen.queryByText("Coming Soon")).not.toBeInTheDocument();
  });

  it("should apply emerald border classes when selected", () => {
    const { container } = renderCard({ method: "cod", selected: true });
    const card = container.querySelector("[data-radix-collection-item]");
    expect(card).toHaveClass("border-emerald-500");
  });

  it("should apply disabled styling when disabled", () => {
    const { container } = renderCard({ method: "gcash", disabled: true });
    const card = container.querySelector("[data-radix-collection-item]");
    expect(card).toHaveClass("cursor-not-allowed");
    expect(card).toHaveClass("opacity-60");
  });

  it("should have role=radio via Radix primitive", () => {
    renderCard({ method: "cod" });
    expect(screen.getByRole("radio")).toBeInTheDocument();
  });

  it("should set aria-checked when selected", () => {
    renderCard({ method: "cod", selected: true });
    const radio = screen.getByRole("radio");
    expect(radio).toHaveAttribute("aria-checked", "true");
  });

  it("should set aria-checked=false when not selected", () => {
    renderCard({ method: "cod", selected: false });
    const radio = screen.getByRole("radio");
    expect(radio).toHaveAttribute("aria-checked", "false");
  });

  it("should set disabled attribute when disabled", () => {
    renderCard({ method: "gcash", disabled: true });
    const radio = screen.getByRole("radio");
    expect(radio).toBeDisabled();
  });
});
