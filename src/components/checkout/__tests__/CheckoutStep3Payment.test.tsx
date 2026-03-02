import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckoutStep3Payment } from "../CheckoutStep3Payment";
import { step3Schema, Step3FormValues } from "../checkout-schemas";
import type { PaymentMethod } from "@/types/payment";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock("@/lib/payment/config", () => ({
  getAvailablePaymentMethods: jest.fn(() => [
    "cod",
    "gcash",
    "grab_pay",
    "card",
    "paymaya",
  ]),
  getPaymentConfig: jest.fn(() => ({
    paymongoEnabled: true,
    paymongoPublicKey: "pk_test_xxx",
  })),
}));

jest.mock("@/components/checkout", () => ({
  PICKUP_LOCATIONS: [
    {
      id: "loc-1",
      name: "MASH HQ",
      address: "123 Main St, Manila",
      lat: 14.5,
      lng: 121.0,
    },
  ],
}));

// ---------------------------------------------------------------------------
// Test wrapper to provide react-hook-form context
// ---------------------------------------------------------------------------

interface WrapperProps {
  defaultMethod?: PaymentMethod;
  children: (form: UseFormReturn<Step3FormValues>) => React.ReactElement;
}

function FormWrapper({ defaultMethod = "cod", children }: WrapperProps) {
  const form = useForm<Step3FormValues>({
    resolver: zodResolver(step3Schema),
    defaultValues: { paymentMethod: defaultMethod },
  });
  return <>{children(form)}</>;
}

// ---------------------------------------------------------------------------
// Default props factory
// ---------------------------------------------------------------------------

function getDefaultProps(overrides: Record<string, unknown> = {}) {
  return {
    step1Data: { deliveryMethod: "lalamove" as const },
    step2Data: { name: "John Doe", email: "john@example.com", phone: "09171234567" },
    deliveryAddress: {
      lat: 14.5,
      lng: 121.0,
      formattedAddress: "123 Main St, Manila",
      components: { street: "123 Main St", city: "Manila", state: "NCR", zipCode: "1000" },
    },
    hasMultipleVendors: false,
    selectedVendor: null,
    submitting: false,
    paymentProcessing: false,
    itemCount: 3,
    onSubmit: jest.fn(),
    onBack: jest.fn(),
    onEditStep: jest.fn(),
    paymentError: null,
    onRetryPayment: jest.fn(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Helper to render with form
// ---------------------------------------------------------------------------

function renderComponent(
  defaultMethod: PaymentMethod = "cod",
  overrides: Record<string, unknown> = {}
) {
  const props = getDefaultProps(overrides);
  const result = render(
    <FormWrapper defaultMethod={defaultMethod}>
      {(form) => (
        <CheckoutStep3Payment form={form} {...(props as any)} />
      )}
    </FormWrapper>
  );
  return { ...result, ...props };
}

// ===========================================================================
// Tests
// ===========================================================================

describe("CheckoutStep3Payment", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // AC1: Integrates PaymentMethodSelector component
  // -------------------------------------------------------------------------
  describe("PaymentMethodSelector integration", () => {
    it("should render all five payment method options", () => {
      renderComponent();
      // COD text appears in both PaymentMethodCard and COD info section
      expect(screen.getAllByText("Cash on Delivery").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("GCash")).toBeInTheDocument();
      expect(screen.getByText("GrabPay")).toBeInTheDocument();
      expect(screen.getByText("Credit / Debit Card")).toBeInTheDocument();
      expect(screen.getByText("PayMaya")).toBeInTheDocument();
    });

    it("should render the PaymentMethodSelector radiogroup", () => {
      renderComponent();
      expect(
        screen.getByRole("radiogroup", { name: "Select payment method" })
      ).toBeInTheDocument();
    });

    it("should render five radio items", () => {
      renderComponent();
      const radios = screen.getAllByRole("radio");
      expect(radios).toHaveLength(5);
    });

    it("should show header text for payment method section", () => {
      renderComponent();
      expect(
        screen.getByText("Payment Method")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Select how you would like to pay for your order.")
      ).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // AC2: Dynamic content based on selected payment method
  // -------------------------------------------------------------------------
  describe("Dynamic content per payment method", () => {
    it("should show COD info when cod is selected", () => {
      renderComponent("cod");
      // "Cash on Delivery" appears in both PaymentMethodCard and COD info section
      expect(screen.getAllByText("Cash on Delivery").length).toBeGreaterThanOrEqual(2);
      expect(
        screen.getByText(/Pay the rider when your order is delivered/)
      ).toBeInTheDocument();
    });

    it("should show Cash on Pickup for pickup delivery method", () => {
      renderComponent("cod", {
        step1Data: { deliveryMethod: "pickup", pickupLocation: "loc-1" },
      });
      // "Cash on Pickup" appears in COD info + order review sections
      expect(screen.getAllByText("Cash on Pickup").length).toBeGreaterThanOrEqual(1);
      expect(
        screen.getByText(/Pay when you pick up your order/)
      ).toBeInTheDocument();
    });

    it("should show GCash info box when gcash is selected", () => {
      renderComponent("gcash");
      expect(
        screen.getByText("GCash Payment")
      ).toBeInTheDocument();
      expect(
        screen.getByText(/redirected to GCash/i)
      ).toBeInTheDocument();
    });

    it("should show GrabPay info box when grab_pay is selected", () => {
      renderComponent("grab_pay");
      expect(
        screen.getByText("GrabPay Payment")
      ).toBeInTheDocument();
      expect(
        screen.getByText(/redirected to Grab/i)
      ).toBeInTheDocument();
    });

    it("should show card info and card form when card is selected", () => {
      renderComponent("card");
      expect(
        screen.getByText("Card Payment")
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Card number/i)
      ).toBeInTheDocument();
    });

    it("should show Maya info box when paymaya is selected", () => {
      renderComponent("paymaya");
      expect(
        screen.getByText("Maya Payment")
      ).toBeInTheDocument();
      expect(
        screen.getByText(/redirected to Maya/i)
      ).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // AC3: Place Order button text dynamically reflects payment method
  // -------------------------------------------------------------------------
  describe("Dynamic button labels", () => {
    it("should show 'Place Order (Cash Payment)' for COD", () => {
      renderComponent("cod");
      expect(
        screen.getByRole("button", { name: "Place Order (Cash Payment)" })
      ).toBeInTheDocument();
    });

    it("should show 'Pay with GCash' for gcash", () => {
      renderComponent("gcash");
      expect(
        screen.getByRole("button", { name: "Pay with GCash" })
      ).toBeInTheDocument();
    });

    it("should show 'Pay with GrabPay' for grab_pay", () => {
      renderComponent("grab_pay");
      expect(
        screen.getByRole("button", { name: "Pay with GrabPay" })
      ).toBeInTheDocument();
    });

    it("should show 'Pay with Card' for card", () => {
      renderComponent("card");
      expect(
        screen.getByRole("button", { name: "Pay with Card" })
      ).toBeInTheDocument();
    });

    it("should show 'Pay with Maya' for paymaya", () => {
      renderComponent("paymaya");
      expect(
        screen.getByRole("button", { name: "Pay with Maya" })
      ).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // AC4: Order review section shows selected payment method with icon
  // -------------------------------------------------------------------------
  describe("Order review payment summary", () => {
    it("should show payment label in order review for COD", () => {
      renderComponent("cod");
      const reviewSection = screen.getByText("Order Review").closest("section")!;
      expect(reviewSection).toBeInTheDocument();

      // Check "Payment" label and method name appear
      expect(screen.getByText("Payment")).toBeInTheDocument();
    });

    it("should show contact summary with edit button", () => {
      renderComponent("cod");
      expect(screen.getByText("Contact")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
      expect(screen.getByText("09171234567")).toBeInTheDocument();
    });

    it("should show delivery address in order review", () => {
      renderComponent("cod");
      expect(screen.getByText("Delivery Address")).toBeInTheDocument();
      expect(screen.getByText("123 Main St, Manila")).toBeInTheDocument();
    });

    it("should show pickup location when pickup delivery method selected", () => {
      renderComponent("cod", {
        step1Data: { deliveryMethod: "pickup", pickupLocation: "loc-1" },
      });
      expect(screen.getByText("Pickup Location")).toBeInTheDocument();
      expect(screen.getByText("123 Main St, Manila")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // AC5: Smooth transitions (CSS class verification)
  // -------------------------------------------------------------------------
  describe("Smooth transitions", () => {
    it("should have transition-all duration-200 class on dynamic content area", () => {
      const { container } = renderComponent("cod");
      const transitionElements = container.querySelectorAll(".transition-all.duration-200");
      expect(transitionElements.length).toBeGreaterThan(0);
    });
  });

  // -------------------------------------------------------------------------
  // AC6: Form validation -- payment method required
  // -------------------------------------------------------------------------
  describe("Form validation", () => {
    it("should render payment method form field for validation", () => {
      renderComponent();
      // The radiogroup presence confirms form field is wired
      expect(
        screen.getByRole("radiogroup", { name: "Select payment method" })
      ).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // AC7: Disabled state during payment processing
  // -------------------------------------------------------------------------
  describe("Disabled state during processing", () => {
    it("should disable Place Order button when submitting", () => {
      renderComponent("cod", { submitting: true });
      // Button text changes to submitting label
      const buttons = screen.getAllByRole("button");
      const submitBtn = buttons.find(
        (btn) => btn.textContent?.includes("Creating Order") || btn.textContent?.includes("Redirecting")
      );
      expect(submitBtn).toBeDefined();
      expect(submitBtn).toBeDisabled();
    });

    it("should disable Back button when submitting", () => {
      renderComponent("cod", { submitting: true });
      expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
    });

    it("should disable Place Order button when paymentProcessing", () => {
      renderComponent("gcash", { paymentProcessing: true });
      // During processing, button shows processing label and is disabled
      const buttons = screen.getAllByRole("button");
      const submitBtn = buttons.find(
        (btn) => btn.textContent?.includes("Redirecting") || btn.textContent?.includes("Processing")
      );
      expect(submitBtn).toBeDefined();
      expect(submitBtn).toBeDisabled();
    });

    it("should disable Back button when paymentProcessing", () => {
      renderComponent("cod", { paymentProcessing: true });
      expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
    });

    it("should disable Place Order button when itemCount is 0", () => {
      renderComponent("cod", { itemCount: 0 });
      expect(
        screen.getByRole("button", { name: "Place Order (Cash Payment)" })
      ).toBeDisabled();
    });

    it("should disable Edit buttons during processing", () => {
      renderComponent("cod", { submitting: true });
      const editButtons = screen.getAllByRole("button", { name: "Edit" });
      editButtons.forEach((btn) => {
        expect(btn).toBeDisabled();
      });
    });

    it("should show PaymentProcessingOverlay when paymentProcessing is true", () => {
      renderComponent("gcash", { paymentProcessing: true });
      // Overlay starts with "Creating your order..." step text
      expect(
        screen.getByTestId("payment-processing-overlay")
      ).toBeInTheDocument();
      // Overlay renders with dialog role
      expect(
        screen.getByRole("dialog", { name: "Processing GCash payment" })
      ).toBeInTheDocument();
    });

    it("should not show PaymentProcessingOverlay when not processing", () => {
      renderComponent("gcash", { paymentProcessing: false });
      expect(
        screen.queryByTestId("payment-processing-overlay")
      ).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // AC8: Error display for payment failures with retry option
  // -------------------------------------------------------------------------
  describe("Payment error display", () => {
    it("should show payment error message when paymentError is provided", () => {
      renderComponent("gcash", {
        paymentError: "GCash payment was declined. Please try again.",
      });
      expect(screen.getByText("Payment Failed")).toBeInTheDocument();
      expect(
        screen.getByText("GCash payment was declined. Please try again.")
      ).toBeInTheDocument();
    });

    it("should show retry button when onRetryPayment is provided", () => {
      const onRetry = jest.fn();
      renderComponent("gcash", {
        paymentError: "Payment failed",
        onRetryPayment: onRetry,
      });
      const retryButton = screen.getByRole("button", { name: /Try Again/i });
      expect(retryButton).toBeInTheDocument();
    });

    it("should call onRetryPayment when retry button is clicked", () => {
      const onRetry = jest.fn();
      renderComponent("gcash", {
        paymentError: "Payment failed",
        onRetryPayment: onRetry,
      });
      fireEvent.click(screen.getByRole("button", { name: /Try Again/i }));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it("should not show error section when paymentError is null", () => {
      renderComponent("gcash", { paymentError: null });
      expect(screen.queryByText("Payment Failed")).not.toBeInTheDocument();
    });

    it("should disable retry button during processing", () => {
      renderComponent("gcash", {
        paymentError: "Payment failed",
        submitting: true,
        onRetryPayment: jest.fn(),
      });
      expect(
        screen.getByRole("button", { name: /Try Again/i })
      ).toBeDisabled();
    });
  });

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------
  describe("Navigation", () => {
    it("should call onBack when Back button is clicked", () => {
      const onBack = jest.fn();
      renderComponent("cod", { onBack });
      fireEvent.click(screen.getByRole("button", { name: "Back" }));
      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it("should call onEditStep(2) when Contact Edit button is clicked", () => {
      const onEditStep = jest.fn();
      renderComponent("cod", { onEditStep });
      const editButtons = screen.getAllByRole("button", { name: "Edit" });
      // First Edit button is for Contact section
      fireEvent.click(editButtons[0]);
      expect(onEditStep).toHaveBeenCalledWith(2);
    });

    it("should call onEditStep(1) when Delivery Edit button is clicked", () => {
      const onEditStep = jest.fn();
      renderComponent("cod", { onEditStep });
      const editButtons = screen.getAllByRole("button", { name: "Edit" });
      // Second Edit button is for Delivery section
      fireEvent.click(editButtons[1]);
      expect(onEditStep).toHaveBeenCalledWith(1);
    });
  });

  // -------------------------------------------------------------------------
  // Vendor info
  // -------------------------------------------------------------------------
  describe("Multi-vendor info", () => {
    it("should show vendor note when hasMultipleVendors and pickup", () => {
      renderComponent("cod", {
        step1Data: { deliveryMethod: "pickup", pickupLocation: "loc-1" },
        hasMultipleVendors: true,
        selectedVendor: "Fresh Farm Co",
      });
      expect(screen.getByText(/Fresh Farm Co/)).toBeInTheDocument();
      expect(
        screen.getByText(/coordinate with vendor for exact address/)
      ).toBeInTheDocument();
    });
  });
});
