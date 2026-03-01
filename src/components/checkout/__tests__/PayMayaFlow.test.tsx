import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PaymentMethodSelector } from "../PaymentMethodSelector";
import { PaymentMethodInfoBox, getPaymentButtonLabel } from "../PaymentMethodInfoBox";
import { PaymentProcessingOverlay } from "../PaymentProcessingOverlay";

/**
 * PAY-007: PayMaya Payment Flow - Frontend Integration
 *
 * End-to-end verification that all PayMaya/Maya UI components work together
 * to satisfy the acceptance criteria:
 * 1. PayMaya option in PaymentMethodSelector shows PayMaya logo
 * 2. On selection: info box explaining redirect to Maya app
 * 3. Button text: "Pay with Maya"
 * 4. Processing overlay: "Redirecting to Maya..."
 * 5. Handles success/failure redirect correctly
 * 6. Shares PaymentProcessingOverlay with e-wallet flows
 */

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

describe("PAY-007: PayMaya Payment Flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // AC 1: PayMaya option in PaymentMethodSelector shows PayMaya logo
  // -----------------------------------------------------------------------

  describe("AC 1: PayMaya in PaymentMethodSelector", () => {
    it("should display PayMaya as a selectable payment option", () => {
      render(
        <PaymentMethodSelector value="cod" onChange={jest.fn()} />
      );
      expect(screen.getByText("PayMaya")).toBeInTheDocument();
    });

    it("should show PayMaya e-wallet description", () => {
      render(
        <PaymentMethodSelector value="cod" onChange={jest.fn()} />
      );
      expect(
        screen.getByText("Pay using your PayMaya e-wallet")
      ).toBeInTheDocument();
    });

    it("should allow selecting PayMaya", () => {
      const onChange = jest.fn();
      render(
        <PaymentMethodSelector value="cod" onChange={onChange} />
      );
      const radios = screen.getAllByRole("radio");
      // paymaya is the 5th method (cod=0, gcash=1, grab_pay=2, card=3, paymaya=4)
      fireEvent.click(radios[4]);
      expect(onChange).toHaveBeenCalledWith("paymaya");
    });

    it("should visually indicate PayMaya when selected", () => {
      render(
        <PaymentMethodSelector value="paymaya" onChange={jest.fn()} />
      );
      const radios = screen.getAllByRole("radio");
      expect(radios[4]).toHaveAttribute("aria-checked", "true");
    });
  });

  // -----------------------------------------------------------------------
  // AC 2: On selection: info box explaining redirect to Maya app
  // -----------------------------------------------------------------------

  describe("AC 2: PayMaya info box on selection", () => {
    it("should show info box when PayMaya is selected", () => {
      render(<PaymentMethodInfoBox selectedMethod="paymaya" />);
      expect(screen.getByRole("note")).toBeInTheDocument();
    });

    it("should display 'Maya Payment' title", () => {
      render(<PaymentMethodInfoBox selectedMethod="paymaya" />);
      expect(screen.getByText("Maya Payment")).toBeInTheDocument();
    });

    it("should explain redirect to Maya", () => {
      render(<PaymentMethodInfoBox selectedMethod="paymaya" />);
      expect(
        screen.getByText(/redirected to Maya to authorize the payment/i)
      ).toBeInTheDocument();
    });

    it("should mention returning to site after payment", () => {
      render(<PaymentMethodInfoBox selectedMethod="paymaya" />);
      expect(
        screen.getByText(/returned to this site/i)
      ).toBeInTheDocument();
    });

    it("should show mobile deep link note for Maya", () => {
      render(<PaymentMethodInfoBox selectedMethod="paymaya" />);
      expect(
        screen.getByText(/Maya app directly if installed/i)
      ).toBeInTheDocument();
    });

    it("should show do-not-close browser notice (redirect method)", () => {
      render(<PaymentMethodInfoBox selectedMethod="paymaya" />);
      expect(
        screen.getByText(/do not close your browser/i)
      ).toBeInTheDocument();
    });

    it("should have accessible aria-label", () => {
      render(<PaymentMethodInfoBox selectedMethod="paymaya" />);
      expect(screen.getByRole("note")).toHaveAttribute(
        "aria-label",
        "Maya Payment information"
      );
    });

    it("should not show info box for COD", () => {
      const { container } = render(
        <PaymentMethodInfoBox selectedMethod="cod" />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // AC 3: Button text: "Pay with Maya"
  // -----------------------------------------------------------------------

  describe("AC 3: Button label", () => {
    it("should return 'Pay with Maya' when not submitting", () => {
      expect(getPaymentButtonLabel("paymaya", false)).toBe(
        "Pay with Maya"
      );
    });

    it("should return 'Redirecting to Maya...' when submitting", () => {
      expect(getPaymentButtonLabel("paymaya", true)).toBe(
        "Redirecting to Maya..."
      );
    });

    it("should differ from COD button label", () => {
      const mayaLabel = getPaymentButtonLabel("paymaya", false);
      const codLabel = getPaymentButtonLabel("cod", false);
      expect(mayaLabel).not.toBe(codLabel);
    });
  });

  // -----------------------------------------------------------------------
  // AC 4: Processing overlay: "Redirecting to Maya..."
  // -----------------------------------------------------------------------

  describe("AC 4: Processing overlay", () => {
    it("should show 'Redirecting to Maya...' message", () => {
      render(
        <PaymentProcessingOverlay visible={true} paymentMethod="paymaya" />
      );
      expect(
        screen.getByText("Redirecting to Maya...")
      ).toBeInTheDocument();
    });

    it("should show description about Maya redirect", () => {
      render(
        <PaymentProcessingOverlay visible={true} paymentMethod="paymaya" />
      );
      expect(
        screen.getByText(/redirected to the Maya app/i)
      ).toBeInTheDocument();
    });

    it("should show do-not-close-window warning", () => {
      render(
        <PaymentProcessingOverlay visible={true} paymentMethod="paymaya" />
      );
      expect(
        screen.getByText(/do not close this window/i)
      ).toBeInTheDocument();
    });

    it("should display spinner animation", () => {
      render(
        <PaymentProcessingOverlay visible={true} paymentMethod="paymaya" />
      );
      const spinner = document.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    it("should have accessible dialog role", () => {
      render(
        <PaymentProcessingOverlay visible={true} paymentMethod="paymaya" />
      );
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog).toHaveAttribute(
        "aria-label",
        "Processing PayMaya payment"
      );
    });

    it("should show cancel button when onCancel provided", () => {
      const onCancel = jest.fn();
      render(
        <PaymentProcessingOverlay
          visible={true}
          paymentMethod="paymaya"
          onCancel={onCancel}
        />
      );
      const cancelBtn = screen.getByRole("button", { name: /cancel/i });
      expect(cancelBtn).toBeInTheDocument();
      fireEvent.click(cancelBtn);
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("should not show cancel button when onCancel is null", () => {
      render(
        <PaymentProcessingOverlay
          visible={true}
          paymentMethod="paymaya"
          onCancel={null}
        />
      );
      expect(
        screen.queryByRole("button", { name: /cancel/i })
      ).not.toBeInTheDocument();
    });

    it("should not render when not visible", () => {
      const { container } = render(
        <PaymentProcessingOverlay visible={false} paymentMethod="paymaya" />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // AC 5: Handles success/failure redirect correctly
  // -----------------------------------------------------------------------

  describe("AC 5: Redirect handling support", () => {
    it("should show processing overlay during redirect phase", () => {
      render(
        <PaymentProcessingOverlay visible={true} paymentMethod="paymaya" />
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should allow cancellation before redirect starts", () => {
      const onCancel = jest.fn();
      render(
        <PaymentProcessingOverlay
          visible={true}
          paymentMethod="paymaya"
          onCancel={onCancel}
        />
      );
      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
      expect(onCancel).toHaveBeenCalled();
    });

    it("should hide cancel when redirect is in progress (onCancel=null)", () => {
      render(
        <PaymentProcessingOverlay
          visible={true}
          paymentMethod="paymaya"
          onCancel={null}
        />
      );
      expect(
        screen.queryByRole("button", { name: /cancel/i })
      ).not.toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------------
  // AC 6: Shares PaymentProcessingOverlay with e-wallet flows
  // -----------------------------------------------------------------------

  describe("AC 6: Shared overlay component", () => {
    it("should use same overlay component for PayMaya and GCash", () => {
      const { unmount } = render(
        <PaymentProcessingOverlay visible={true} paymentMethod="paymaya" />
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      unmount();

      render(
        <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should use same overlay component for PayMaya and GrabPay", () => {
      const { unmount } = render(
        <PaymentProcessingOverlay visible={true} paymentMethod="paymaya" />
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      unmount();

      render(
        <PaymentProcessingOverlay visible={true} paymentMethod="grab_pay" />
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should show different messages for PayMaya vs GCash", () => {
      const { unmount } = render(
        <PaymentProcessingOverlay visible={true} paymentMethod="paymaya" />
      );
      expect(
        screen.getByText("Redirecting to Maya...")
      ).toBeInTheDocument();
      unmount();

      render(
        <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
      );
      expect(
        screen.getByText("Redirecting to GCash...")
      ).toBeInTheDocument();
    });

    it("should show different messages for PayMaya vs GrabPay", () => {
      const { unmount } = render(
        <PaymentProcessingOverlay visible={true} paymentMethod="paymaya" />
      );
      expect(
        screen.getByText("Redirecting to Maya...")
      ).toBeInTheDocument();
      unmount();

      render(
        <PaymentProcessingOverlay visible={true} paymentMethod="grab_pay" />
      );
      expect(
        screen.getByText("Redirecting to GrabPay...")
      ).toBeInTheDocument();
    });

    it("should show different descriptions for PayMaya vs GCash", () => {
      const { unmount } = render(
        <PaymentProcessingOverlay visible={true} paymentMethod="paymaya" />
      );
      expect(
        screen.getByText(/redirected to the Maya app/i)
      ).toBeInTheDocument();
      unmount();

      render(
        <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
      );
      expect(
        screen.getByText(/redirected to the GCash app/i)
      ).toBeInTheDocument();
    });
  });
});
