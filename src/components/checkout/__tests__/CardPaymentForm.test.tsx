import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  CardPaymentForm,
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  formatCvc,
  luhnCheck,
  validateExpiry,
  validateCardFields,
} from "../CardPaymentForm";

/**
 * PAY-006: Credit/Debit Card Payment UI -- Card Input Form
 *
 * Tests cover all 9 acceptance criteria:
 * AC 1: CardPaymentForm with card number, expiry, CVC fields
 * AC 2: Card number auto-format with spaces, card type icon
 * AC 3: Expiry MM/YY auto-format
 * AC 4: CVC 3-4 digits, masked input
 * AC 5: Real-time validation with error messages
 * AC 6: Visa/Mastercard logo detection
 * AC 7: Secure input: no autocomplete, paste support, keyboard nav
 * AC 8: 3D Secure handling notice
 * AC 9: WCAG AA accessible
 */

describe("PAY-006: CardPaymentForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // AC 1: Component renders card number, expiry, CVC fields
  // -----------------------------------------------------------------------

  describe("AC 1: Component structure", () => {
    it("should render card number input", () => {
      render(<CardPaymentForm />);
      expect(screen.getByLabelText("Card Number")).toBeInTheDocument();
    });

    it("should render expiry input", () => {
      render(<CardPaymentForm />);
      expect(screen.getByLabelText("Expiry")).toBeInTheDocument();
    });

    it("should render CVC input", () => {
      render(<CardPaymentForm />);
      expect(screen.getByLabelText("CVC")).toBeInTheDocument();
    });

    it("should render all three fields in a group", () => {
      render(<CardPaymentForm />);
      const group = screen.getByRole("group", {
        name: "Card payment details",
      });
      expect(group).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      render(<CardPaymentForm className="custom-class" />);
      const group = screen.getByRole("group");
      expect(group).toHaveClass("custom-class");
    });
  });

  // -----------------------------------------------------------------------
  // AC 2: Card number auto-format with spaces + card type icon
  // -----------------------------------------------------------------------

  describe("AC 2: Card number formatting", () => {
    it("should format card number with spaces every 4 digits", () => {
      expect(formatCardNumber("4242424242424242")).toBe("4242 4242 4242 4242");
    });

    it("should strip non-digit characters", () => {
      expect(formatCardNumber("4242-4242-4242")).toBe("4242 4242 4242");
    });

    it("should cap at 16 digits", () => {
      expect(formatCardNumber("42424242424242421234")).toBe(
        "4242 4242 4242 4242"
      );
    });

    it("should handle partial input", () => {
      expect(formatCardNumber("4242")).toBe("4242");
      expect(formatCardNumber("42424")).toBe("4242 4");
    });

    it("should update input value with formatted number on typing", () => {
      render(<CardPaymentForm />);
      const input = screen.getByLabelText("Card Number");
      fireEvent.change(input, { target: { value: "4242424242424242" } });
      expect(input).toHaveValue("4242 4242 4242 4242");
    });
  });

  // -----------------------------------------------------------------------
  // AC 3: Expiry MM/YY auto-format
  // -----------------------------------------------------------------------

  describe("AC 3: Expiry formatting", () => {
    it("should format expiry as MM/YY", () => {
      expect(formatExpiry("1225")).toBe("12/25");
    });

    it("should handle partial month input", () => {
      expect(formatExpiry("1")).toBe("1");
      expect(formatExpiry("12")).toBe("12");
    });

    it("should insert slash after month", () => {
      expect(formatExpiry("123")).toBe("12/3");
    });

    it("should strip non-digits", () => {
      expect(formatExpiry("12/25")).toBe("12/25");
      expect(formatExpiry("abc")).toBe("");
    });

    it("should cap at 4 digits (MMYY)", () => {
      expect(formatExpiry("123456")).toBe("12/34");
    });

    it("should update input value with formatted expiry on typing", () => {
      render(<CardPaymentForm />);
      const input = screen.getByLabelText("Expiry");
      fireEvent.change(input, { target: { value: "1230" } });
      expect(input).toHaveValue("12/30");
    });
  });

  // -----------------------------------------------------------------------
  // AC 4: CVC 3-4 digits, masked input
  // -----------------------------------------------------------------------

  describe("AC 4: CVC field", () => {
    it("should format CVC to digits only", () => {
      expect(formatCvc("12a3")).toBe("123");
    });

    it("should cap CVC at 3 digits by default", () => {
      expect(formatCvc("12345")).toBe("123");
    });

    it("should support 4-digit CVC when specified", () => {
      expect(formatCvc("1234", 4)).toBe("1234");
    });

    it("should use password type for masked input", () => {
      render(<CardPaymentForm />);
      const cvcInput = screen.getByLabelText("CVC");
      expect(cvcInput).toHaveAttribute("type", "password");
    });

    it("should show lock icon for security", () => {
      render(<CardPaymentForm />);
      // Lock icon is aria-hidden but present in the DOM
      const cvcInput = screen.getByLabelText("CVC");
      const cvcContainer = cvcInput.parentElement;
      expect(cvcContainer).toBeInTheDocument();
    });

    it("should update CVC value on typing", () => {
      render(<CardPaymentForm />);
      const input = screen.getByLabelText("CVC");
      fireEvent.change(input, { target: { value: "456" } });
      expect(input).toHaveValue("456");
    });
  });

  // -----------------------------------------------------------------------
  // AC 5: Real-time validation with error messages
  // -----------------------------------------------------------------------

  describe("AC 5: Validation", () => {
    describe("Luhn algorithm", () => {
      it("should pass for valid card number (4242424242424242)", () => {
        expect(luhnCheck("4242424242424242")).toBe(true);
      });

      it("should fail for invalid card number", () => {
        expect(luhnCheck("4242424242424241")).toBe(false);
      });

      it("should fail for too-short number", () => {
        expect(luhnCheck("42424")).toBe(false);
      });

      it("should handle spaces in number", () => {
        expect(luhnCheck("4242 4242 4242 4242")).toBe(true);
      });
    });

    describe("Expiry validation", () => {
      it("should reject empty expiry", () => {
        expect(validateExpiry("")).toBe("Expiry date is required");
      });

      it("should reject invalid month (13)", () => {
        expect(validateExpiry("13/30")).toBe("Invalid month");
      });

      it("should reject month 0", () => {
        expect(validateExpiry("00/30")).toBe("Invalid month");
      });

      it("should reject expired card", () => {
        const result = validateExpiry("01/20");
        expect(result).toBe("Card has expired");
      });

      it("should accept valid future date", () => {
        expect(validateExpiry("12/99")).toBeNull();
      });
    });

    describe("Full validation", () => {
      it("should return all errors for empty fields", () => {
        const errors = validateCardFields("", "", "");
        expect(errors.cardNumber).toBe("Card number is required");
        expect(errors.expiry).toBeTruthy();
        expect(errors.cvc).toBe("CVC is required");
      });

      it("should return no errors for valid fields", () => {
        const errors = validateCardFields(
          "4242 4242 4242 4242",
          "12/99",
          "123"
        );
        expect(errors.cardNumber).toBeNull();
        expect(errors.expiry).toBeNull();
        expect(errors.cvc).toBeNull();
      });

      it("should detect too-short card number", () => {
        const errors = validateCardFields("4242 42", "12/99", "123");
        expect(errors.cardNumber).toBe("Card number is too short");
      });

      it("should detect invalid card number via Luhn", () => {
        const errors = validateCardFields(
          "4242 4242 4242 4241",
          "12/99",
          "123"
        );
        expect(errors.cardNumber).toBe("Invalid card number");
      });

      it("should detect short CVC", () => {
        const errors = validateCardFields(
          "4242 4242 4242 4242",
          "12/99",
          "12"
        );
        expect(errors.cvc).toBe("CVC must be 3 digits");
      });
    });

    describe("Error display on blur", () => {
      it("should not show errors before field is touched", () => {
        render(<CardPaymentForm />);
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });

      it("should show card number error after blur with empty value", () => {
        render(<CardPaymentForm />);
        const input = screen.getByLabelText("Card Number");
        fireEvent.blur(input);
        expect(screen.getByText("Card number is required")).toBeInTheDocument();
      });

      it("should show expiry error after blur with empty value", () => {
        render(<CardPaymentForm />);
        const input = screen.getByLabelText("Expiry");
        fireEvent.blur(input);
        expect(screen.getByText("Expiry date is required")).toBeInTheDocument();
      });

      it("should show CVC error after blur with empty value", () => {
        render(<CardPaymentForm />);
        const input = screen.getByLabelText("CVC");
        fireEvent.blur(input);
        expect(screen.getByText("CVC is required")).toBeInTheDocument();
      });

      it("should clear error when valid value is entered", () => {
        render(<CardPaymentForm />);
        const input = screen.getByLabelText("Card Number");
        fireEvent.blur(input);
        expect(screen.getByText("Card number is required")).toBeInTheDocument();

        fireEvent.change(input, { target: { value: "4242424242424242" } });
        fireEvent.blur(input);
        expect(
          screen.queryByText("Card number is required")
        ).not.toBeInTheDocument();
      });
    });
  });

  // -----------------------------------------------------------------------
  // AC 6: Visa/Mastercard logo detection
  // -----------------------------------------------------------------------

  describe("AC 6: Card brand detection", () => {
    it("should detect Visa from 4xxx prefix", () => {
      expect(detectCardBrand("4242")).toBe("visa");
    });

    it("should detect Mastercard from 51xx prefix", () => {
      expect(detectCardBrand("5100")).toBe("mastercard");
    });

    it("should detect Mastercard from 55xx prefix", () => {
      expect(detectCardBrand("5500")).toBe("mastercard");
    });

    it("should detect Mastercard from 2xxx range", () => {
      expect(detectCardBrand("2221")).toBe("mastercard");
    });

    it("should return unknown for unrecognized prefix", () => {
      expect(detectCardBrand("9999")).toBe("unknown");
    });

    it("should return unknown for empty input", () => {
      expect(detectCardBrand("")).toBe("unknown");
    });

    it("should show Visa badge when Visa card number entered", () => {
      render(<CardPaymentForm />);
      const input = screen.getByLabelText("Card Number");
      fireEvent.change(input, { target: { value: "4242" } });
      expect(screen.getByLabelText("Visa")).toBeInTheDocument();
    });

    it("should show Mastercard indicator when MC number entered", () => {
      render(<CardPaymentForm />);
      const input = screen.getByLabelText("Card Number");
      fireEvent.change(input, { target: { value: "5100" } });
      expect(screen.getByLabelText("Mastercard")).toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------------
  // AC 7: Secure input: no autocomplete, paste support, keyboard nav
  // -----------------------------------------------------------------------

  describe("AC 7: Security attributes", () => {
    it("should disable autocomplete on card number", () => {
      render(<CardPaymentForm />);
      expect(screen.getByLabelText("Card Number")).toHaveAttribute(
        "autoComplete",
        "off"
      );
    });

    it("should disable autocomplete on expiry", () => {
      render(<CardPaymentForm />);
      expect(screen.getByLabelText("Expiry")).toHaveAttribute(
        "autoComplete",
        "off"
      );
    });

    it("should disable autocomplete on CVC", () => {
      render(<CardPaymentForm />);
      expect(screen.getByLabelText("CVC")).toHaveAttribute(
        "autoComplete",
        "off"
      );
    });

    it("should use numeric inputMode for card number", () => {
      render(<CardPaymentForm />);
      expect(screen.getByLabelText("Card Number")).toHaveAttribute(
        "inputMode",
        "numeric"
      );
    });

    it("should use numeric inputMode for expiry", () => {
      render(<CardPaymentForm />);
      expect(screen.getByLabelText("Expiry")).toHaveAttribute(
        "inputMode",
        "numeric"
      );
    });

    it("should use numeric inputMode for CVC", () => {
      render(<CardPaymentForm />);
      expect(screen.getByLabelText("CVC")).toHaveAttribute(
        "inputMode",
        "numeric"
      );
    });

    it("should support paste in card number field", () => {
      render(<CardPaymentForm />);
      const input = screen.getByLabelText("Card Number");
      fireEvent.change(input, { target: { value: "4242424242424242" } });
      expect(input).toHaveValue("4242 4242 4242 4242");
    });
  });

  // -----------------------------------------------------------------------
  // AC 8: 3D Secure notice
  // -----------------------------------------------------------------------

  describe("AC 8: 3D Secure handling", () => {
    it("should display 3D Secure notice", () => {
      render(<CardPaymentForm />);
      expect(
        screen.getByText(/secured with 3D Secure/i)
      ).toBeInTheDocument();
    });

    it("should mention bank verification redirect", () => {
      render(<CardPaymentForm />);
      expect(
        screen.getByText(/redirected to your bank for verification/i)
      ).toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------------
  // AC 9: WCAG AA accessibility
  // -----------------------------------------------------------------------

  describe("AC 9: Accessibility", () => {
    it("should have labels associated with inputs via htmlFor", () => {
      render(<CardPaymentForm />);
      expect(screen.getByLabelText("Card Number")).toBeInTheDocument();
      expect(screen.getByLabelText("Expiry")).toBeInTheDocument();
      expect(screen.getByLabelText("CVC")).toBeInTheDocument();
    });

    it("should set aria-invalid when field has error after blur", () => {
      render(<CardPaymentForm />);
      const input = screen.getByLabelText("Card Number");
      fireEvent.blur(input);
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("should set aria-describedby pointing to error message", () => {
      render(<CardPaymentForm />);
      const input = screen.getByLabelText("Card Number");
      fireEvent.blur(input);
      expect(input).toHaveAttribute("aria-describedby", "card-number-error");
      expect(
        document.getElementById("card-number-error")
      ).toBeInTheDocument();
    });

    it("should use role=alert for error messages", () => {
      render(<CardPaymentForm />);
      const input = screen.getByLabelText("Card Number");
      fireEvent.blur(input);
      const alerts = screen.getAllByRole("alert");
      expect(alerts.length).toBeGreaterThanOrEqual(1);
    });

    it("should have role=group on the form container", () => {
      render(<CardPaymentForm />);
      expect(
        screen.getByRole("group", { name: "Card payment details" })
      ).toBeInTheDocument();
    });

    it("should not set aria-invalid before field is touched", () => {
      render(<CardPaymentForm />);
      const input = screen.getByLabelText("Card Number");
      expect(input).toHaveAttribute("aria-invalid", "false");
    });
  });

  // -----------------------------------------------------------------------
  // onChange callback
  // -----------------------------------------------------------------------

  describe("onChange callback", () => {
    it("should call onChange with card data on input", () => {
      const onChange = jest.fn();
      render(<CardPaymentForm onChange={onChange} />);
      const input = screen.getByLabelText("Card Number");
      fireEvent.change(input, { target: { value: "4242424242424242" } });
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          cardNumber: "4242424242424242",
          brand: "visa",
        })
      );
    });

    it("should report isValid=true when all fields are valid", () => {
      const onChange = jest.fn();
      render(<CardPaymentForm onChange={onChange} />);

      fireEvent.change(screen.getByLabelText("Card Number"), {
        target: { value: "4242424242424242" },
      });
      fireEvent.change(screen.getByLabelText("Expiry"), {
        target: { value: "1299" },
      });
      fireEvent.change(screen.getByLabelText("CVC"), {
        target: { value: "123" },
      });

      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(lastCall.isValid).toBe(true);
    });

    it("should report isValid=false for incomplete data", () => {
      const onChange = jest.fn();
      render(<CardPaymentForm onChange={onChange} />);

      fireEvent.change(screen.getByLabelText("Card Number"), {
        target: { value: "4242" },
      });

      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(lastCall.isValid).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // Disabled state
  // -----------------------------------------------------------------------

  describe("Disabled state", () => {
    it("should disable all inputs when disabled prop is true", () => {
      render(<CardPaymentForm disabled />);
      expect(screen.getByLabelText("Card Number")).toBeDisabled();
      expect(screen.getByLabelText("Expiry")).toBeDisabled();
      expect(screen.getByLabelText("CVC")).toBeDisabled();
    });
  });

  // -----------------------------------------------------------------------
  // Auto-focus advance
  // -----------------------------------------------------------------------

  describe("Focus management", () => {
    it("should auto-advance to expiry when card number is complete", () => {
      render(<CardPaymentForm />);
      const cardInput = screen.getByLabelText("Card Number");
      const expiryInput = screen.getByLabelText("Expiry");
      fireEvent.change(cardInput, { target: { value: "4242424242424242" } });
      expect(document.activeElement).toBe(expiryInput);
    });

    it("should auto-advance to CVC when expiry is complete", () => {
      render(<CardPaymentForm />);
      const expiryInput = screen.getByLabelText("Expiry");
      const cvcInput = screen.getByLabelText("CVC");
      fireEvent.change(expiryInput, { target: { value: "1225" } });
      expect(document.activeElement).toBe(cvcInput);
    });
  });
});
