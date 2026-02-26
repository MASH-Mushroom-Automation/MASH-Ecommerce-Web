/**
 * PhoneChangeFlow Component Tests
 *
 * Tests for the multi-step phone number change wizard.
 * Covers: step rendering, navigation, validation, 2FA flow,
 * confirmation display, success callback, cancel handling, and errors.
 */

import React from "react";
import { render, screen, fireEvent, waitFor, configure } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PhoneChangeFlow } from "../PhoneChangeFlow";
import type { PhoneChangeFlowProps } from "../PhoneChangeFlow";

// Increase default waitFor timeout to accommodate the 1s simulated password
// verification delay in handlePasswordSubmit (setTimeout 1000ms + React state updates)
configure({ asyncUtilTimeout: 3000 });

// ============================================================================
// Mocks
// ============================================================================

// Use the global sonner toast mock from jest.setupMocks.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockToast = (global as Record<string, unknown>).__mockToast as {
  success: jest.Mock;
  error: jest.Mock;
  info: jest.Mock;
  warning: jest.Mock;
};
const mockToastSuccess = mockToast.success;
const mockToastError = mockToast.error;

// Mock shadcn Dialog components
jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => (
    open !== false ? <div data-testid="dialog">{children}</div> : null
  ),
  DialogContent: ({ children, className, ...props }: { children: React.ReactNode; className?: string; "data-testid"?: string }) => (
    <div data-testid={props["data-testid"] || "dialog-content"} className={className}>{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => <h2 className={className}>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  DialogFooter: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>,
  DialogClose: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock phone-utils
jest.mock("@/lib/phone-utils", () => ({
  maskPhoneNumber: (phone: string) => {
    if (!phone) return "";
    const last2 = phone.slice(-2);
    return `+63 *** *** **${last2}`;
  },
  validatePhilippinePhoneNumber: (phone: string) => {
    return phone.length >= 10 && phone.includes("9");
  },
  formatPhoneNumber: (phone: string) => {
    if (!phone) return "";
    const digits = phone.replace(/[^\d]/g, "");
    if (digits.startsWith("63") && digits.length === 12) return `+${digits}`;
    if (digits.startsWith("09") && digits.length === 11) return `+63${digits.substring(1)}`;
    if (digits.startsWith("9") && digits.length === 10) return `+63${digits}`;
    return `+${digits}`;
  },
  normalizePhoneNumber: (phone: string) => phone.replace(/[^\d+]/g, ""),
}));

// Mock usePhoneVerification hook
const mockSendVerification = jest.fn().mockResolvedValue(undefined);
const mockResendCode = jest.fn().mockResolvedValue(undefined);
const mockReset = jest.fn();

// Store onSuccess callbacks so we can trigger them when verifyCode is called
let capturedCallbacks: { onSuccess?: (phone: string) => void }[] = [];

const mockVerifyCode = jest.fn().mockImplementation(async () => {
  // Find the most recent callback and call it
  const lastCallback = capturedCallbacks[capturedCallbacks.length - 1];
  if (lastCallback?.onSuccess) {
    lastCallback.onSuccess("+639181234567");
  }
  return true;
});

jest.mock("@/hooks/usePhoneVerification", () => ({
  usePhoneVerification: (options?: { onSuccess?: (phone: string) => void; onError?: (error: Error) => void; autoUpdateProfile?: boolean }) => {
    // Capture the callback for this hook instance
    if (options?.onSuccess) {
      capturedCallbacks.push({ onSuccess: options.onSuccess });
    }
    return {
      phoneNumber: null,
      setPhoneNumber: jest.fn(),
      state: "idle" as const,
      isVerified: false,
      isLoading: false,
      error: null,
      canResend: false,
      cooldownSeconds: 0,
      expirySeconds: 300,
      attempts: 0,
      attemptsRemaining: 3,
      sendVerification: mockSendVerification,
      verifyCode: mockVerifyCode,
      resendCode: mockResendCode,
      reset: mockReset,
    };
  },
}));

// Mock phone change audit
const mockLogPhoneChange = jest.fn().mockResolvedValue("audit-id-1");
jest.mock("@/lib/security/phone-change-audit", () => ({
  logPhoneChange: (...args: unknown[]) => mockLogPhoneChange(...args),
}));

// Mock PhoneNumberInput
jest.mock("@/components/profile/PhoneNumberInput", () => ({
  PhoneNumberInput: ({
    value,
    onChange,
    label,
  }: {
    value?: string;
    onChange?: (v: string) => void;
    label?: string;
    validationState?: string;
    placeholder?: string;
    required?: boolean;
  }) => (
    <div data-testid="phone-number-input">
      <label>{label}</label>
      <input
        data-testid="phone-input"
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        aria-label={label || "Phone Number"}
      />
    </div>
  ),
}));

// Mock OTPVerificationModal
jest.mock("@/components/profile/OTPVerificationModal", () => ({
  OTPVerificationModal: ({
    open,
    onClose,
    phoneNumber,
    onVerifySuccess,
  }: {
    open: boolean;
    onClose: () => void;
    phoneNumber: string;
    onVerifySuccess: (code: string) => void;
    onResendOTP: () => Promise<void>;
    errorMessage?: string;
    isVerifying?: boolean;
  }) => {
    if (!open) return null;
    return (
      <div data-testid="otp-modal">
        <span data-testid="otp-phone">{phoneNumber}</span>
        <button data-testid="otp-verify-btn" onClick={() => onVerifySuccess("123456")}>
          Verify OTP
        </button>
        <button data-testid="otp-close-btn" onClick={onClose}>
          Close OTP
        </button>
      </div>
    );
  },
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Phone: ({ className }: { className?: string }) => (
    <svg data-testid="phone-icon" className={className} />
  ),
  Shield: ({ className }: { className?: string }) => (
    <svg data-testid="shield-icon" className={className} />
  ),
  Lock: ({ className }: { className?: string }) => (
    <svg data-testid="lock-icon" className={className} />
  ),
  ArrowRight: ({ className }: { className?: string }) => (
    <svg data-testid="arrow-right-icon" className={className} />
  ),
  ArrowLeft: ({ className }: { className?: string }) => (
    <svg data-testid="arrow-left-icon" className={className} />
  ),
  CheckCircle2: ({ className }: { className?: string }) => (
    <svg data-testid="check-circle-icon" className={className} />
  ),
  AlertTriangle: ({ className }: { className?: string }) => (
    <svg data-testid="alert-icon" className={className} />
  ),
  Loader2: ({ className }: { className?: string }) => (
    <svg data-testid="loader-icon" className={className} />
  ),
}));

// ============================================================================
// Helpers
// ============================================================================

const defaultProps: PhoneChangeFlowProps = {
  currentPhoneNumber: "+639171234567",
  phoneVerified: true,
  twoFactorEnabled: false,
  onPhoneChanged: jest.fn(),
  onCancel: jest.fn(),
};

function renderFlow(overrides: Partial<PhoneChangeFlowProps> = {}) {
  const props = { ...defaultProps, ...overrides };
  return {
    ...render(<PhoneChangeFlow {...props} />),
    props,
  };
}

// ============================================================================
// Tests
// ============================================================================

describe("PhoneChangeFlow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedCallbacks = [];
  });

  // ==========================================================================
  // Step 1: Enter New Phone
  // ==========================================================================

  describe("Step 1 - Enter New Phone", () => {
    it("should render the enter phone step initially", () => {
      renderFlow();

      expect(screen.getByTestId("step-enter-phone")).toBeInTheDocument();
      expect(screen.getByText(/enter new phone number/i)).toBeInTheDocument();
      expect(screen.getByTestId("phone-number-input")).toBeInTheDocument();
    });

    it("should display masked current phone number", () => {
      renderFlow();

      expect(screen.getByText(/current:/i)).toBeInTheDocument();
      expect(screen.getByText(/\+63 \*\*\* \*\*\* \*\*67/)).toBeInTheDocument();
    });

    it("should show Cancel and Continue buttons", () => {
      renderFlow();

      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument();
    });

    it("should call onCancel when Cancel is clicked", async () => {
      const { props } = renderFlow();

      await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

      expect(props.onCancel).toHaveBeenCalled();
    });

    it("should show error toast when phone is empty and Continue is clicked", async () => {
      renderFlow();

      await userEvent.click(screen.getByRole("button", { name: /continue/i }));

      expect(mockToastError).toHaveBeenCalledWith("Please enter a phone number");
    });

    it("should advance to password step when valid phone is entered", async () => {
      renderFlow();

      const input = screen.getByTestId("phone-input");
      await userEvent.clear(input);
      await userEvent.type(input, "09181234567");

      await userEvent.click(screen.getByRole("button", { name: /continue/i }));

      expect(screen.getByTestId("step-confirm-password")).toBeInTheDocument();
    });

    it("should show error when new phone matches current phone", async () => {
      renderFlow();

      const input = screen.getByTestId("phone-input");
      await userEvent.clear(input);
      await userEvent.type(input, "+639171234567");

      await userEvent.click(screen.getByRole("button", { name: /continue/i }));

      expect(mockToastError).toHaveBeenCalledWith(
        "New phone number must be different from your current number"
      );
    });
  });

  // ==========================================================================
  // Step 2: Confirm Password
  // ==========================================================================

  describe("Step 2 - Confirm Password", () => {
    async function goToPasswordStep() {
      renderFlow();

      const input = screen.getByTestId("phone-input");
      await userEvent.clear(input);
      await userEvent.type(input, "09181234567");
      await userEvent.click(screen.getByRole("button", { name: /continue/i }));
    }

    it("should render the password confirmation step", async () => {
      await goToPasswordStep();

      expect(screen.getByTestId("step-confirm-password")).toBeInTheDocument();
      expect(screen.getByText(/confirm your password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    });

    it("should show error when password is empty", async () => {
      await goToPasswordStep();

      await userEvent.click(screen.getByRole("button", { name: /continue/i }));

      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    it("should show error when password is too short", async () => {
      await goToPasswordStep();

      await userEvent.type(screen.getByLabelText(/current password/i), "abc");
      await userEvent.click(screen.getByRole("button", { name: /continue/i }));

      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });

    it("should navigate back to phone step on Back click", async () => {
      await goToPasswordStep();

      await userEvent.click(screen.getByRole("button", { name: /back/i }));

      expect(screen.getByTestId("step-enter-phone")).toBeInTheDocument();
    });

    it("should proceed to verify-new-otp when password is valid (no 2FA)", async () => {
      await goToPasswordStep();

      await userEvent.type(screen.getByLabelText(/current password/i), "validpassword123");
      await userEvent.click(screen.getByRole("button", { name: /continue/i }));

      await waitFor(() => {
        expect(screen.getByTestId("step-verify-new-otp")).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // Step 3: Verify Old Phone OTP (2FA enabled)
  // ==========================================================================

  describe("Step 3 - Verify Old Phone OTP (2FA)", () => {
    async function goToOldOtpStep() {
      renderFlow({ twoFactorEnabled: true });

      // Step 1: enter phone
      const input = screen.getByTestId("phone-input");
      await userEvent.clear(input);
      await userEvent.type(input, "09181234567");
      await userEvent.click(screen.getByRole("button", { name: /continue/i }));

      // Step 2: enter password
      await userEvent.type(screen.getByLabelText(/current password/i), "validpassword123");
      await userEvent.click(screen.getByRole("button", { name: /continue/i }));

      await waitFor(() => {
        expect(screen.getByTestId("step-verify-old-otp")).toBeInTheDocument();
      });
    }

    it("should show old phone OTP step when 2FA is enabled", async () => {
      await goToOldOtpStep();

      expect(screen.getByText(/2fa verification required/i)).toBeInTheDocument();
    });

    it("should display the masked old phone number", async () => {
      await goToOldOtpStep();

      expect(screen.getByText(/\+63 \*\*\* \*\*\* \*\*67/)).toBeInTheDocument();
    });

    it("should send verification to old phone", async () => {
      await goToOldOtpStep();

      expect(mockSendVerification).toHaveBeenCalledWith("+639171234567");
    });
  });

  // ==========================================================================
  // Step 4: Verify New Phone OTP
  // ==========================================================================

  describe("Step 4 - Verify New Phone OTP", () => {
    async function goToNewOtpStep() {
      renderFlow();

      const input = screen.getByTestId("phone-input");
      await userEvent.clear(input);
      await userEvent.type(input, "09181234567");
      await userEvent.click(screen.getByRole("button", { name: /continue/i }));

      await userEvent.type(screen.getByLabelText(/current password/i), "validpassword123");
      await userEvent.click(screen.getByRole("button", { name: /continue/i }));

      await waitFor(() => {
        expect(screen.getByTestId("step-verify-new-otp")).toBeInTheDocument();
      });
    }

    it("should render the new phone OTP step", async () => {
      await goToNewOtpStep();

      expect(screen.getByText(/enter the verification code sent to your new phone/i)).toBeInTheDocument();
    });

    it("should display masked new phone number", async () => {
      await goToNewOtpStep();

      expect(screen.getByText(/\+63 \*\*\* \*\*\* \*\*67/)).toBeInTheDocument();
    });

    it("should send verification to new phone", async () => {
      await goToNewOtpStep();

      expect(mockSendVerification).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Step 5: Confirmation Dialog
  // ==========================================================================

  describe("Step 5 - Confirmation Dialog", () => {
    it("should display masked old and new numbers in confirmation", async () => {
      renderFlow();

      // Navigate through steps
      const input = screen.getByTestId("phone-input");
      await userEvent.clear(input);
      await userEvent.type(input, "09181234567");
      await userEvent.click(screen.getByRole("button", { name: /continue/i }));

      await userEvent.type(screen.getByLabelText(/current password/i), "validpassword123");
      await userEvent.click(screen.getByRole("button", { name: /continue/i }));

      // Wait for verify-new-otp step
      await waitFor(() => {
        expect(screen.getByTestId("step-verify-new-otp")).toBeInTheDocument();
      });

      // Simulate OTP verification (click verify in mock modal)
      const verifyBtn = screen.getByTestId("otp-verify-btn");
      await userEvent.click(verifyBtn);

      // Should now be on confirm step
      await waitFor(() => {
        expect(screen.getByTestId("step-confirm-change")).toBeInTheDocument();
      });

      expect(screen.getByText(/current phone:/i)).toBeInTheDocument();
      expect(screen.getByText(/new phone:/i)).toBeInTheDocument();
      expect(screen.getByTestId("confirmation-message")).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Step 6: Success
  // ==========================================================================

  describe("Step 6 - Success", () => {
    it("should call onPhoneChanged when Done is clicked on success step", async () => {
      const onPhoneChanged = jest.fn();
      render(
        <PhoneChangeFlow
          {...defaultProps}
          onPhoneChanged={onPhoneChanged}
        />
      );

      // Navigate to confirm step
      const input = screen.getByTestId("phone-input");
      await userEvent.clear(input);
      await userEvent.type(input, "09181234567");
      await userEvent.click(screen.getByRole("button", { name: /continue/i }));

      await userEvent.type(screen.getByLabelText(/current password/i), "validpassword123");
      await userEvent.click(screen.getByRole("button", { name: /continue/i }));

      await waitFor(() => {
        expect(screen.getByTestId("step-verify-new-otp")).toBeInTheDocument();
      });

      // Verify OTP
      await userEvent.click(screen.getByTestId("otp-verify-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("step-confirm-change")).toBeInTheDocument();
      });

      // Confirm change
      await userEvent.click(screen.getByRole("button", { name: /confirm change/i }));

      await waitFor(() => {
        expect(screen.getByTestId("step-success")).toBeInTheDocument();
      });

      expect(mockToastSuccess).toHaveBeenCalledWith("Phone number changed successfully!");
      expect(mockLogPhoneChange).toHaveBeenCalled();

      // Click Done
      await userEvent.click(screen.getByRole("button", { name: /done/i }));

      expect(onPhoneChanged).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Cancel Handling
  // ==========================================================================

  describe("Cancel / Close", () => {
    it("should call onCancel when Cancel button is clicked", async () => {
      const onCancel = jest.fn();
      render(<PhoneChangeFlow {...defaultProps} onCancel={onCancel} />);

      await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================================================
  // Error Handling
  // ==========================================================================

  describe("Error Handling", () => {
    it("should show toast error for invalid phone number", async () => {
      renderFlow();

      // Type an invalid phone (no 9, fails mock validation)
      const input = screen.getByTestId("phone-input");
      await userEvent.clear(input);
      await userEvent.type(input, "12345");
      await userEvent.click(screen.getByRole("button", { name: /continue/i }));

      expect(mockToastError).toHaveBeenCalledWith(
        "Please enter a valid Philippine mobile number"
      );
    });

    it("should show password error inline for missing password", async () => {
      renderFlow();

      // Go to password step
      const input = screen.getByTestId("phone-input");
      await userEvent.clear(input);
      await userEvent.type(input, "09181234567");
      await userEvent.click(screen.getByRole("button", { name: /continue/i }));

      // Click continue without entering password
      await userEvent.click(screen.getByRole("button", { name: /continue/i }));

      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // 2FA Flow: shows old phone OTP step
  // ==========================================================================

  describe("2FA Flow", () => {
    it("should show 5 steps when 2FA is enabled", () => {
      renderFlow({ twoFactorEnabled: true });

      // Step counter should show "Step 1 of 5"
      expect(screen.getByText(/step 1 of 5/i)).toBeInTheDocument();
    });

    it("should show 4 steps when 2FA is not enabled", () => {
      renderFlow({ twoFactorEnabled: false });

      // Step counter should show "Step 1 of 4"
      expect(screen.getByText(/step 1 of 4/i)).toBeInTheDocument();
    });

    it("should show 2FA active notice on success when 2FA was enabled", async () => {
      render(<PhoneChangeFlow {...defaultProps} twoFactorEnabled={true} />);

      // Navigate through all steps
      const input = screen.getByTestId("phone-input");
      await userEvent.clear(input);
      await userEvent.type(input, "09181234567");
      await userEvent.click(screen.getByRole("button", { name: /continue/i }));

      await userEvent.type(screen.getByLabelText(/current password/i), "validpassword123");
      await userEvent.click(screen.getByRole("button", { name: /continue/i }));

      // Wait for old OTP step
      await waitFor(() => {
        expect(screen.getByTestId("step-verify-old-otp")).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // Progress Bar
  // ==========================================================================

  describe("Progress Bar", () => {
    it("should render a progress bar", () => {
      renderFlow();

      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("should have correct aria attributes", () => {
      renderFlow();

      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveAttribute("aria-valuemin", "0");
      expect(progressBar).toHaveAttribute("aria-valuemax", "100");
    });
  });
});
