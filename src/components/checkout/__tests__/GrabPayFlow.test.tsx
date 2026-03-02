import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { PaymentMethodSelector } from "../PaymentMethodSelector";
import { PaymentMethodInfoBox, getPaymentButtonLabel } from "../PaymentMethodInfoBox";
import {
  PaymentProcessingOverlay,
  CANCEL_DELAY,
} from "../PaymentProcessingOverlay";

/**
 * PAY-005: GrabPay Payment Flow - Frontend Integration
 *
 * End-to-end verification that all GrabPay UI components work together
 * to satisfy the acceptance criteria:
 * 1. GrabPay option shows logo and description
 * 2. On selection: show inline info box explaining redirect
 * 3. Button text changes to "Pay with GrabPay"
 * 4. Processing overlay: "Redirecting to GrabPay..."
 * 5. Handles success/failure redirect correctly (component support)
 * 6. Shares PaymentProcessingOverlay with GCash flow
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

describe("PAY-005: GrabPay Payment Flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // AC 1: GrabPay option shows logo and description
  // -----------------------------------------------------------------------

  describe("AC 1: GrabPay in PaymentMethodSelector", () => {
    it("should display GrabPay as a selectable payment option", () => {
      render(
        <PaymentMethodSelector value="cod" onChange={jest.fn()} />
      );
      expect(screen.getByText("GrabPay")).toBeInTheDocument();
    });

    it("should show GrabPay description", () => {
      render(
        <PaymentMethodSelector value="cod" onChange={jest.fn()} />
      );
      expect(
        screen.getByText("Pay using your GrabPay e-wallet")
      ).toBeInTheDocument();
    });

    it("should allow selecting GrabPay", () => {
      const onChange = jest.fn();
      render(
        <PaymentMethodSelector value="cod" onChange={onChange} />
      );
      const radios = screen.getAllByRole("radio");
      // grab_pay is the 3rd method (cod=0, gcash=1, grab_pay=2)
      fireEvent.click(radios[2]);
      expect(onChange).toHaveBeenCalledWith("grab_pay");
    });

    it("should visually indicate GrabPay when selected", () => {
      render(
        <PaymentMethodSelector value="grab_pay" onChange={jest.fn()} />
      );
      const radios = screen.getAllByRole("radio");
      expect(radios[2]).toHaveAttribute("aria-checked", "true");
    });
  });

  // -----------------------------------------------------------------------
  // AC 2: Info box explaining redirect to Grab app
  // -----------------------------------------------------------------------

  describe("AC 2: GrabPay info box on selection", () => {
    it("should show info box when GrabPay is selected", () => {
      render(<PaymentMethodInfoBox selectedMethod="grab_pay" />);
      expect(screen.getByRole("note")).toBeInTheDocument();
    });

    it("should display 'GrabPay Payment' title", () => {
      render(<PaymentMethodInfoBox selectedMethod="grab_pay" />);
      expect(screen.getByText("GrabPay Payment")).toBeInTheDocument();
    });

    it("should explain redirect to Grab", () => {
      render(<PaymentMethodInfoBox selectedMethod="grab_pay" />);
      expect(
        screen.getByText(/redirected to Grab to authorize the payment/i)
      ).toBeInTheDocument();
    });

    it("should mention returning to site after payment", () => {
      render(<PaymentMethodInfoBox selectedMethod="grab_pay" />);
      expect(
        screen.getByText(/returned to this site/i)
      ).toBeInTheDocument();
    });

    it("should show mobile deep link note for GrabPay", () => {
      render(<PaymentMethodInfoBox selectedMethod="grab_pay" />);
      expect(
        screen.getByText(/Grab app directly if installed/i)
      ).toBeInTheDocument();
    });

    it("should show do-not-close browser notice (redirect method)", () => {
      render(<PaymentMethodInfoBox selectedMethod="grab_pay" />);
      expect(
        screen.getByText(/do not close your browser/i)
      ).toBeInTheDocument();
    });

    it("should have accessible aria-label", () => {
      render(<PaymentMethodInfoBox selectedMethod="grab_pay" />);
      expect(screen.getByRole("note")).toHaveAttribute(
        "aria-label",
        "GrabPay Payment information"
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
  // AC 3: Button text changes to "Pay with GrabPay"
  // -----------------------------------------------------------------------

  describe("AC 3: Button label", () => {
    it("should return 'Pay with GrabPay' when not submitting", () => {
      expect(getPaymentButtonLabel("grab_pay", false)).toBe(
        "Pay with GrabPay"
      );
    });

    it("should return 'Redirecting to GrabPay...' when submitting", () => {
      expect(getPaymentButtonLabel("grab_pay", true)).toBe(
        "Redirecting to GrabPay..."
      );
    });

    it("should differ from COD button label", () => {
      const grabLabel = getPaymentButtonLabel("grab_pay", false);
      const codLabel = getPaymentButtonLabel("cod", false);
      expect(grabLabel).not.toBe(codLabel);
    });
  });

  // -----------------------------------------------------------------------
  // AC 4: Processing overlay shows "Redirecting to GrabPay..."
  // -----------------------------------------------------------------------

  describe("AC 4: Processing overlay", () => {
    it("should show initial processing step text", () => {
      render(
        <PaymentProcessingOverlay visible={true} paymentMethod="grab_pay" />
      );
      expect(
        screen.getByTestId("processing-step-text")
      ).toHaveTextContent("Creating your order...");
    });

    it("should show description about Grab redirect", () => {
      render(
        <PaymentProcessingOverlay visible={true} paymentMethod="grab_pay" />
      );
      expect(
        screen.getByText(/redirected to the Grab app/i)
      ).toBeInTheDocument();
    });

    it("should show do-not-close-window warning", () => {
      render(
        <PaymentProcessingOverlay visible={true} paymentMethod="grab_pay" />
      );
      expect(
        screen.getByText(/do not close this window/i)
      ).toBeInTheDocument();
    });

    it("should display spinner animation", () => {
      render(
        <PaymentProcessingOverlay visible={true} paymentMethod="grab_pay" />
      );
      expect(screen.getByTestId("spinner")).toBeInTheDocument();
    });

    it("should have accessible dialog role", () => {
      render(
        <PaymentProcessingOverlay visible={true} paymentMethod="grab_pay" />
      );
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog).toHaveAttribute(
        "aria-label",
        "Processing GrabPay payment"
      );
    });

    it("should show cancel button after delay and confirm cancellation", () => {
      jest.useFakeTimers();
      const onCancel = jest.fn();
      render(
        <PaymentProcessingOverlay
          visible={true}
          paymentMethod="grab_pay"
          onCancel={onCancel}
        />
      );
      // Cancel button hidden initially
      expect(screen.queryByTestId("cancel-button")).not.toBeInTheDocument();
      // Advance past cancel delay
      act(() => { jest.advanceTimersByTime(CANCEL_DELAY); });
      expect(screen.getByTestId("cancel-button")).toBeInTheDocument();
      // Click cancel opens confirmation dialog
      fireEvent.click(screen.getByTestId("cancel-button"));
      expect(screen.getByText("Cancel Payment?")).toBeInTheDocument();
      // Confirm cancellation
      fireEvent.click(screen.getByTestId("cancel-confirm-yes"));
      expect(onCancel).toHaveBeenCalledTimes(1);
      jest.useRealTimers();
    });

    it("should not show cancel button when onCancel is null", () => {
      jest.useFakeTimers();
      render(
        <PaymentProcessingOverlay
          visible={true}
          paymentMethod="grab_pay"
          onCancel={null}
        />
      );
      act(() => { jest.advanceTimersByTime(CANCEL_DELAY); });
      expect(
        screen.queryByTestId("cancel-button")
      ).not.toBeInTheDocument();
      jest.useRealTimers();
    });

    it("should not render when not visible", () => {
      const { container } = render(
        <PaymentProcessingOverlay visible={false} paymentMethod="grab_pay" />
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
        <PaymentProcessingOverlay visible={true} paymentMethod="grab_pay" />
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should allow cancellation after delay with confirmation", () => {
      jest.useFakeTimers();
      const onCancel = jest.fn();
      render(
        <PaymentProcessingOverlay
          visible={true}
          paymentMethod="grab_pay"
          onCancel={onCancel}
        />
      );
      act(() => { jest.advanceTimersByTime(CANCEL_DELAY); });
      fireEvent.click(screen.getByTestId("cancel-button"));
      fireEvent.click(screen.getByTestId("cancel-confirm-yes"));
      expect(onCancel).toHaveBeenCalled();
      jest.useRealTimers();
    });

    it("should hide cancel when redirect is in progress (onCancel=null)", () => {
      render(
        <PaymentProcessingOverlay
          visible={true}
          paymentMethod="grab_pay"
          onCancel={null}
        />
      );
      expect(
        screen.queryByRole("button", { name: /cancel/i })
      ).not.toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------------
  // AC 6: Shares PaymentProcessingOverlay with GCash
  // -----------------------------------------------------------------------

  describe("AC 6: Shared overlay component", () => {
    it("should use same overlay component for GrabPay and GCash", () => {
      // GrabPay overlay
      const { unmount } = render(
        <PaymentProcessingOverlay visible={true} paymentMethod="grab_pay" />
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      unmount();

      // GCash overlay uses the same component with different paymentMethod
      render(
        <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should show different descriptions for GrabPay vs GCash", () => {
      const { unmount } = render(
        <PaymentProcessingOverlay visible={true} paymentMethod="grab_pay" />
      );
      expect(
        screen.getByText(/redirected to the Grab app/i)
      ).toBeInTheDocument();
      unmount();

      render(
        <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
      );
      expect(
        screen.getByText(/redirected to the GCash app/i)
      ).toBeInTheDocument();
    });

    it("should show different descriptions for GrabPay vs GCash", () => {
      const { unmount } = render(
        <PaymentProcessingOverlay visible={true} paymentMethod="grab_pay" />
      );
      expect(
        screen.getByText(/redirected to the Grab app/i)
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
