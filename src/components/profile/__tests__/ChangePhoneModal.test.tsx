/**
 * ChangePhoneModal Component Tests
 *
 * Tests for the phone number change modal with OTP verification.
 * Covers: step rendering, step transitions, confirmation dialog,
 * OTP flow, success callback, error handling, and loading states.
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChangePhoneModal } from "../ChangePhoneModal";
import type { ChangePhoneModalProps } from "../ChangePhoneModal";

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

// Mock shadcn Dialog - render children directly when open
jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }) => (open !== false ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    "data-testid"?: string;
  }) => (
    <div
      data-testid={props["data-testid"] || "dialog-content"}
      className={className}
    >
      {children}
    </div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <h2 className={className}>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  DialogFooter: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
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
    if (digits.startsWith("63") && digits.length === 12)
      return `+${digits}`;
    if (digits.startsWith("09") && digits.length === 11)
      return `+63${digits.substring(1)}`;
    if (digits.startsWith("9") && digits.length === 10)
      return `+63${digits}`;
    return `+${digits}`;
  },
  normalizePhoneNumber: (phone: string) => phone.replace(/[^\d+]/g, ""),
}));

// Mock usePhoneVerification hook
const mockSendVerification = jest.fn().mockResolvedValue(undefined);
const mockVerifyCode = jest.fn().mockResolvedValue(true);
const mockResendCode = jest.fn().mockResolvedValue(undefined);
const mockReset = jest.fn();

// Store onSuccess callbacks so we can trigger them from tests
let capturedOnSuccess: ((phone: string) => void) | null = null;
let capturedOnError: ((error: Error) => void) | null = null;

jest.mock("@/hooks/usePhoneVerification", () => ({
  usePhoneVerification: (options?: {
    onSuccess?: (phone: string) => void;
    onError?: (error: Error) => void;
    autoUpdateProfile?: boolean;
  }) => {
    if (options?.onSuccess) {
      capturedOnSuccess = options.onSuccess;
    }
    if (options?.onError) {
      capturedOnError = options.onError;
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

// Mock phone change audit service
const mockLogPhoneChangeAudit = jest.fn().mockResolvedValue("audit-record-1");
jest.mock("@/lib/firebase/phone-change-service", () => ({
  logPhoneChangeAudit: (...args: unknown[]) =>
    mockLogPhoneChangeAudit(...args),
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
    isVerifying,
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
        {isVerifying && <span data-testid="otp-verifying">Verifying...</span>}
        <button
          data-testid="otp-verify-btn"
          onClick={() => onVerifySuccess("123456")}
        >
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
  ArrowRight: ({ className }: { className?: string }) => (
    <svg data-testid="arrow-right-icon" className={className} />
  ),
  Shield: ({ className }: { className?: string }) => (
    <svg data-testid="shield-icon" className={className} />
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

const defaultProps: ChangePhoneModalProps = {
  open: true,
  onClose: jest.fn(),
  currentPhone: "+639171234567",
  onPhoneChanged: jest.fn(),
  userId: "user-test-123",
};

function renderModal(overrides: Partial<ChangePhoneModalProps> = {}) {
  const props = { ...defaultProps, ...overrides };
  return {
    ...render(<ChangePhoneModal {...props} />),
    props,
  };
}

// ============================================================================
// Tests
// ============================================================================

describe("ChangePhoneModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedOnSuccess = null;
    capturedOnError = null;
  });

  // ==========================================================================
  // Rendering
  // ==========================================================================

  describe("Rendering", () => {
    it("should render when open is true", () => {
      renderModal();
      expect(screen.getByTestId("change-phone-modal")).toBeInTheDocument();
    });

    it("should not render when open is false", () => {
      renderModal({ open: false });
      expect(screen.queryByTestId("change-phone-modal")).not.toBeInTheDocument();
    });

    it("should show the modal title", () => {
      renderModal();
      expect(screen.getByText("Change Phone Number")).toBeInTheDocument();
    });

    it("should show a progress bar", () => {
      renderModal();
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("should show step indicator", () => {
      renderModal();
      expect(screen.getByText(/Step 1 of 3/)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Step 1: Enter New Phone
  // ==========================================================================

  describe("Step 1 - Enter New Phone", () => {
    it("should render the enter phone step initially", () => {
      renderModal();
      expect(screen.getByTestId("step-enter-phone")).toBeInTheDocument();
      expect(screen.getByTestId("phone-number-input")).toBeInTheDocument();
    });

    it("should display masked current phone number", () => {
      renderModal();
      expect(screen.getByText(/Current:/)).toBeInTheDocument();
      expect(screen.getByTestId("current-phone-masked")).toHaveTextContent(
        "+63 *** *** **67"
      );
    });

    it("should show Cancel and Continue buttons", () => {
      renderModal();
      expect(
        screen.getByRole("button", { name: /cancel/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /continue/i })
      ).toBeInTheDocument();
    });

    it("should call onClose when Cancel is clicked", async () => {
      const { props } = renderModal();
      await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
      expect(props.onClose).toHaveBeenCalled();
    });

    it("should show error toast when phone is empty", async () => {
      renderModal();
      await userEvent.click(screen.getByRole("button", { name: /continue/i }));
      expect(mockToastError).toHaveBeenCalledWith(
        "Please enter a phone number"
      );
    });

    it("should show error for invalid Philippine number", async () => {
      renderModal();
      const input = screen.getByTestId("phone-input");
      await userEvent.clear(input);
      await userEvent.type(input, "12345");
      await userEvent.click(screen.getByRole("button", { name: /continue/i }));
      expect(mockToastError).toHaveBeenCalledWith(
        "Please enter a valid Philippine mobile number"
      );
    });

    it("should show error when new phone matches current phone", async () => {
      renderModal();
      const input = screen.getByTestId("phone-input");
      await userEvent.clear(input);
      await userEvent.type(input, "+639171234567");
      await userEvent.click(screen.getByRole("button", { name: /continue/i }));
      expect(mockToastError).toHaveBeenCalledWith(
        "New phone number must be different from your current number"
      );
    });

    it("should advance to confirm step with valid new phone", async () => {
      renderModal();
      const input = screen.getByTestId("phone-input");
      await userEvent.clear(input);
      await userEvent.type(input, "09181234567");
      await userEvent.click(screen.getByRole("button", { name: /continue/i }));
      expect(screen.getByTestId("step-confirm")).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Step 2: Confirmation Dialog
  // ==========================================================================

  describe("Step 2 - Confirmation Dialog", () => {
    async function goToConfirmStep() {
      renderModal();
      const input = screen.getByTestId("phone-input");
      await userEvent.clear(input);
      await userEvent.type(input, "09181234567");
      await userEvent.click(screen.getByRole("button", { name: /continue/i }));
    }

    it("should display masked old and new numbers", async () => {
      await goToConfirmStep();
      expect(screen.getByTestId("confirm-old-phone")).toHaveTextContent(
        "+63 *** *** **67"
      );
      expect(screen.getByTestId("confirm-new-phone")).toHaveTextContent(
        "+63 *** *** **67"
      );
    });

    it("should display confirmation message", async () => {
      await goToConfirmStep();
      expect(screen.getByTestId("confirmation-message")).toBeInTheDocument();
      expect(screen.getByTestId("confirmation-message")).toHaveTextContent(
        /Change phone from/
      );
    });

    it("should show step 2 of 3", async () => {
      await goToConfirmStep();
      expect(screen.getByText(/Step 2 of 3/)).toBeInTheDocument();
    });

    it("should have Back and Send Verification Code buttons", async () => {
      await goToConfirmStep();
      expect(
        screen.getByRole("button", { name: /back/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /send verification code/i })
      ).toBeInTheDocument();
    });

    it("should go back to step 1 when Back is clicked", async () => {
      await goToConfirmStep();
      await userEvent.click(screen.getByRole("button", { name: /back/i }));
      expect(screen.getByTestId("step-enter-phone")).toBeInTheDocument();
    });

    it("should send OTP and advance to verify step", async () => {
      await goToConfirmStep();
      await userEvent.click(
        screen.getByRole("button", { name: /send verification code/i })
      );
      await waitFor(() => {
        expect(mockSendVerification).toHaveBeenCalled();
      });
      await waitFor(() => {
        expect(screen.getByTestId("step-verify-otp")).toBeInTheDocument();
      });
    });

    it("should show error if OTP sending fails", async () => {
      mockSendVerification.mockRejectedValueOnce(
        new Error("SMS service unavailable")
      );
      await goToConfirmStep();
      await userEvent.click(
        screen.getByRole("button", { name: /send verification code/i })
      );
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith("SMS service unavailable");
      });
    });
  });

  // ==========================================================================
  // Step 3: OTP Verification
  // ==========================================================================

  describe("Step 3 - OTP Verification", () => {
    async function goToOtpStep() {
      renderModal();
      const input = screen.getByTestId("phone-input");
      await userEvent.clear(input);
      await userEvent.type(input, "09181234567");
      await userEvent.click(screen.getByRole("button", { name: /continue/i }));
      await userEvent.click(
        screen.getByRole("button", { name: /send verification code/i })
      );
      await waitFor(() => {
        expect(screen.getByTestId("step-verify-otp")).toBeInTheDocument();
      });
    }

    it("should render the OTP verification step", async () => {
      await goToOtpStep();
      expect(screen.getByTestId("step-verify-otp")).toBeInTheDocument();
      expect(screen.getByTestId("otp-modal")).toBeInTheDocument();
    });

    it("should show masked new phone in OTP step", async () => {
      await goToOtpStep();
      expect(screen.getByTestId("otp-target-phone")).toHaveTextContent(
        "+63 *** *** **67"
      );
    });

    it("should show step 3 of 3", async () => {
      await goToOtpStep();
      expect(screen.getByText(/Step 3 of 3/)).toBeInTheDocument();
    });

    it("should call verifyCode when OTP is submitted", async () => {
      await goToOtpStep();
      await userEvent.click(screen.getByTestId("otp-verify-btn"));
      expect(mockVerifyCode).toHaveBeenCalledWith("123456");
    });

    it("should log audit and go to success when verified", async () => {
      await goToOtpStep();

      // Trigger the onSuccess callback that the hook would call
      expect(capturedOnSuccess).toBeTruthy();
      if (capturedOnSuccess) {
        // Simulate what happens when verification succeeds
        await waitFor(async () => {
          capturedOnSuccess!("+639181234567");
        });
      }

      await waitFor(() => {
        expect(mockLogPhoneChangeAudit).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: "user-test-123",
            oldPhoneNumber: "+639171234567",
            method: "otp_only",
          })
        );
      });
    });

    it("should go back to confirm step on OTP close", async () => {
      await goToOtpStep();
      await userEvent.click(screen.getByTestId("otp-close-btn"));
      expect(screen.getByTestId("step-confirm")).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Step 4: Success
  // ==========================================================================

  describe("Step 4 - Success", () => {
    it("should show success state after OTP verified and audit logged", async () => {
      renderModal();

      // Step 1: enter phone
      const input = screen.getByTestId("phone-input");
      await userEvent.clear(input);
      await userEvent.type(input, "09181234567");
      await userEvent.click(screen.getByRole("button", { name: /continue/i }));

      // Step 2: confirm and send OTP
      await userEvent.click(
        screen.getByRole("button", { name: /send verification code/i })
      );
      await waitFor(() => {
        expect(screen.getByTestId("step-verify-otp")).toBeInTheDocument();
      });

      // Step 3: trigger onSuccess (simulates OTP verification completion)
      expect(capturedOnSuccess).toBeTruthy();
      if (capturedOnSuccess) {
        await waitFor(async () => {
          capturedOnSuccess!("+639181234567");
        });
      }

      // Should show success
      await waitFor(() => {
        expect(screen.getByTestId("step-success")).toBeInTheDocument();
      });

      expect(
        screen.getByText("Phone Number Updated")
      ).toBeInTheDocument();
      expect(mockToastSuccess).toHaveBeenCalledWith(
        "Phone number changed successfully!"
      );
    });

    it("should call onPhoneChanged and onClose when Done is clicked", async () => {
      const onPhoneChanged = jest.fn();
      const onClose = jest.fn();
      render(
        <ChangePhoneModal
          {...defaultProps}
          onPhoneChanged={onPhoneChanged}
          onClose={onClose}
        />
      );

      // Navigate to success step
      const input = screen.getByTestId("phone-input");
      await userEvent.clear(input);
      await userEvent.type(input, "09181234567");
      await userEvent.click(screen.getByRole("button", { name: /continue/i }));
      await userEvent.click(
        screen.getByRole("button", { name: /send verification code/i })
      );
      await waitFor(() => {
        expect(screen.getByTestId("step-verify-otp")).toBeInTheDocument();
      });

      if (capturedOnSuccess) {
        await waitFor(async () => {
          capturedOnSuccess!("+639181234567");
        });
      }

      await waitFor(() => {
        expect(screen.getByTestId("step-success")).toBeInTheDocument();
      });

      // Click Done
      await userEvent.click(screen.getByTestId("done-btn"));
      expect(onPhoneChanged).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Loading States
  // ==========================================================================

  describe("Loading States", () => {
    it("should disable buttons during OTP sending", async () => {
      // Make sendVerification hang indefinitely
      mockSendVerification.mockImplementationOnce(
        () => new Promise(() => {})
      );

      renderModal();
      const input = screen.getByTestId("phone-input");
      await userEvent.clear(input);
      await userEvent.type(input, "09181234567");
      await userEvent.click(screen.getByRole("button", { name: /continue/i }));

      // Click send - should show loading
      await userEvent.click(screen.getByTestId("send-otp-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("send-otp-btn")).toBeDisabled();
      });
    });
  });

  // ==========================================================================
  // Error Handling
  // ==========================================================================

  describe("Error Handling", () => {
    it("should show error when audit log fails and stay on verify step", async () => {
      mockLogPhoneChangeAudit.mockRejectedValueOnce(
        new Error("Firestore write failed")
      );

      renderModal();

      // Navigate to OTP step
      const input = screen.getByTestId("phone-input");
      await userEvent.clear(input);
      await userEvent.type(input, "09181234567");
      await userEvent.click(screen.getByRole("button", { name: /continue/i }));
      await userEvent.click(
        screen.getByRole("button", { name: /send verification code/i })
      );
      await waitFor(() => {
        expect(screen.getByTestId("step-verify-otp")).toBeInTheDocument();
      });

      // Trigger onSuccess - audit will fail
      if (capturedOnSuccess) {
        await waitFor(async () => {
          capturedOnSuccess!("+639181234567");
        });
      }

      // Should show error toast
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith("Firestore write failed");
      });

      // Should remain on verify-otp step (rollback)
      expect(screen.getByTestId("step-verify-otp")).toBeInTheDocument();
    });

    it("should show error toast for empty phone submission", async () => {
      renderModal();
      await userEvent.click(screen.getByRole("button", { name: /continue/i }));
      expect(mockToastError).toHaveBeenCalledWith(
        "Please enter a phone number"
      );
    });

    it("should show error toast for invalid phone number", async () => {
      renderModal();
      const input = screen.getByTestId("phone-input");
      await userEvent.clear(input);
      await userEvent.type(input, "12345");
      await userEvent.click(screen.getByRole("button", { name: /continue/i }));
      expect(mockToastError).toHaveBeenCalledWith(
        "Please enter a valid Philippine mobile number"
      );
    });
  });

  // ==========================================================================
  // Progress Bar
  // ==========================================================================

  describe("Progress Bar", () => {
    it("should render a progress bar", () => {
      renderModal();
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("should have correct aria attributes", () => {
      renderModal();
      const bar = screen.getByRole("progressbar");
      expect(bar).toHaveAttribute("aria-valuemin", "0");
      expect(bar).toHaveAttribute("aria-valuemax", "100");
    });
  });

  // ==========================================================================
  // 2FA Stays Active
  // ==========================================================================

  describe("2FA Preservation", () => {
    it("should mention phone verification timestamp update on success", async () => {
      renderModal();

      // Navigate to success
      const input = screen.getByTestId("phone-input");
      await userEvent.clear(input);
      await userEvent.type(input, "09181234567");
      await userEvent.click(screen.getByRole("button", { name: /continue/i }));
      await userEvent.click(
        screen.getByRole("button", { name: /send verification code/i })
      );
      await waitFor(() => {
        expect(screen.getByTestId("step-verify-otp")).toBeInTheDocument();
      });

      if (capturedOnSuccess) {
        await waitFor(async () => {
          capturedOnSuccess!("+639181234567");
        });
      }

      await waitFor(() => {
        expect(screen.getByTestId("step-success")).toBeInTheDocument();
      });

      expect(
        screen.getByText(/phone verification timestamp has been updated/i)
      ).toBeInTheDocument();
    });
  });
});
