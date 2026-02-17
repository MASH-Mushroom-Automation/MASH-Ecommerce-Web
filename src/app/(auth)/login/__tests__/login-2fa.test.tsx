import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ----- Mocks -----

// Use the global mock toast set up in jest.setupMocks.js
const mockToast = (global as Record<string, unknown>).__mockToast as {
  success: jest.Mock;
  error: jest.Mock;
  info: jest.Mock;
  warning: jest.Mock;
  loading: jest.Mock;
  dismiss: jest.Mock;
};

// Mock next/navigation
const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => mockSearchParams,
}));

// Mock AuthContext - define mock inside factory to avoid hoisting issues
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// Mock AuthApi
const mockLogin = jest.fn();
jest.mock("@/lib/api/auth", () => ({
  AuthApi: {
    login: (...args: unknown[]) => mockLogin(...args),
  },
}));

// Mock setAuthToken
jest.mock("@/lib/auth", () => ({
  setAuthToken: jest.fn(),
  getAuthToken: jest.fn(),
  logout: jest.fn(),
}));

// Mock getPasswordRequirements
jest.mock("@/lib/auth/password", () => ({
  getPasswordRequirements: jest.fn(() => []),
}));

// Mock apiRequest for 2FA send
const mockApiRequest = jest.fn();
jest.mock("@/lib/api-client", () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));

// Mock OTPVerificationModal
let mockOTPModalProps: Record<string, unknown> = {};
jest.mock("@/components/profile/OTPVerificationModal", () => ({
  OTPVerificationModal: (props: Record<string, unknown>) => {
    mockOTPModalProps = props;
    if (!props.open) return null;
    return (
      <div data-testid="otp-modal">
        <div data-testid="otp-phone">{props.phoneNumber as string}</div>
        <button
          data-testid="otp-verify-btn"
          onClick={() => (props.onVerifySuccess as (code: string) => void)("123456")}
        >
          Verify
        </button>
        <button
          data-testid="otp-resend-btn"
          onClick={() => (props.onResendOTP as () => Promise<void>)()}
        >
          Resend
        </button>
        <button
          data-testid="otp-close-btn"
          onClick={() => (props.onClose as () => void)()}
        >
          Close
        </button>
        {props.errorMessage ? (
          <div data-testid="otp-error">{String(props.errorMessage)}</div>
        ) : null}
        {props.isVerifying ? (
          <div data-testid="otp-verifying">Verifying...</div>
        ) : null}
      </div>
    );
  },
}));

// Mock GoogleSignInButton
jest.mock("@/components/auth/google-sign-in-button", () => ({
  GoogleSignInButton: () => <button data-testid="google-signin">Google Sign In</button>,
}));

// Mock shadcn Checkbox to avoid Radix internal render issues in tests
jest.mock("@/components/ui/checkbox", () => ({
  Checkbox: React.forwardRef(function MockCheckbox(
    { checked, onCheckedChange, id, ...props }: { checked?: boolean; onCheckedChange?: (v: boolean) => void; id?: string; "data-testid"?: string },
    ref: React.Ref<HTMLButtonElement>,
  ) {
    return (
      <button
        ref={ref}
        role="checkbox"
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        data-testid={props["data-testid"]}
        id={id}
        onClick={() => onCheckedChange?.(!checked)}
        type="button"
      />
    );
  }),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  User: ({ className }: { className?: string }) => <svg data-testid="user-icon" className={className} />,
  Mail: ({ className }: { className?: string }) => <svg data-testid="mail-icon" className={className} />,
  Lock: ({ className }: { className?: string }) => <svg data-testid="lock-icon" className={className} />,
  X: ({ className }: { className?: string }) => <svg data-testid="x-icon" className={className} />,
  AlertCircle: ({ className }: { className?: string }) => <svg data-testid="alert-icon" className={className} />,
  Check: ({ className }: { className?: string }) => <svg data-testid="check-icon" className={className} />,
  Eye: ({ className }: { className?: string }) => <svg data-testid="eye-icon" className={className} />,
  EyeOff: ({ className }: { className?: string }) => <svg data-testid="eyeoff-icon" className={className} />,
  Loader2: ({ className }: { className?: string }) => <svg data-testid="loader-icon" className={className} />,
  Shield: ({ className }: { className?: string }) => <svg data-testid="shield-icon" className={className} />,
}));

// ----- Import after mocks -----
import LoginPage from "../page";
import { useAuth } from "@/contexts/AuthContext";

const mockUseAuth = useAuth as jest.Mock;

// ----- Helpers -----

function renderLoginPage() {
  return render(<LoginPage />);
}

/** Fill and submit the login form */
async function submitLogin(user: ReturnType<typeof userEvent.setup>, emailVal = "test@example.com", passwordVal = "Password123") {
  const emailInput = screen.getByPlaceholderText("Enter your email");
  const passwordInput = screen.getByPlaceholderText("Enter your password");

  await user.clear(emailInput);
  await user.type(emailInput, emailVal);
  await user.clear(passwordInput);
  await user.type(passwordInput, passwordVal);

  const signInButton = screen.getByRole("button", { name: /sign in to your account/i });
  await user.click(signInButton);
}

/** Standard login response (no 2FA) */
function normalLoginResponse() {
  return {
    success: true,
    data: {
      accessToken: "jwt-token-abc",
      refreshToken: "refresh-token-xyz",
      expiresIn: 3600,
      tokenType: "Bearer",
      user: {
        id: "user-1",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        role: "USER",
        emailVerified: true,
      },
    },
  };
}

/** 2FA-required login response */
function twoFALoginResponse() {
  return {
    success: true,
    requiresTwoFactor: true,
    tempToken: "temp-jwt-2fa-token",
    phoneNumber: "+63 917 *** 4567",
  };
}

// ----- Tests -----

describe("LoginPage - Two-Factor Authentication Flow", () => {
  const user = userEvent.setup({ delay: null });

  // Per-test mock functions
  let mockVerify2FA: jest.Mock;
  let mockSignInWithEmailPassword: jest.Mock;
  let mockResendVerificationEmail: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOTPModalProps = {};
    mockApiRequest.mockResolvedValue({ success: true });
    // Reset sessionStorage
    sessionStorage.clear();

    // Create fresh mock functions each test
    mockVerify2FA = jest.fn();
    mockSignInWithEmailPassword = jest.fn();
    mockResendVerificationEmail = jest.fn();

    // Configure useAuth mock via the imported mock function
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      signInWithEmailPassword: mockSignInWithEmailPassword,
      verify2FA: mockVerify2FA,
      resendVerificationEmail: mockResendVerificationEmail,
      loading: false,
    });
  });

  // =========================================================================
  // 1. Normal login without 2FA redirects normally
  // =========================================================================
  describe("Normal Login (No 2FA)", () => {
    it("redirects to home after successful login without 2FA", async () => {
      mockLogin.mockResolvedValue(normalLoginResponse());
      renderLoginPage();

      await submitLogin(user);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "Password123",
          rememberMe: false,
        });
      });

      // Should NOT show OTP modal
      expect(screen.queryByTestId("otp-modal")).not.toBeInTheDocument();
    });

    it("does not show OTP modal for regular login", async () => {
      mockLogin.mockResolvedValue(normalLoginResponse());
      renderLoginPage();

      await submitLogin(user);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });

      expect(screen.queryByTestId("otp-modal")).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // 2. Login with 2FA enabled shows OTP modal
  // =========================================================================
  describe("2FA Login Flow", () => {
    it("shows OTP modal when login returns requiresTwoFactor", async () => {
      mockLogin.mockResolvedValue(twoFALoginResponse());
      renderLoginPage();

      await submitLogin(user);

      await waitFor(() => {
        expect(screen.getByTestId("otp-modal")).toBeInTheDocument();
      });

      // Check phone number is passed
      expect(screen.getByTestId("otp-phone")).toHaveTextContent("+63 917 *** 4567");
    });

    it("auto-sends OTP when 2FA modal opens", async () => {
      mockLogin.mockResolvedValue(twoFALoginResponse());
      renderLoginPage();

      await submitLogin(user);

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith("/auth/2fa/send", {
          method: "POST",
          headers: { Authorization: "Bearer temp-jwt-2fa-token" },
        });
      });
    });

    it("handles 2FA response nested in data field", async () => {
      mockLogin.mockResolvedValue({
        success: true,
        data: {
          requiresTwoFactor: true,
          tempToken: "nested-temp-token",
          phoneNumber: "+63 918 *** 9999",
        },
      });
      renderLoginPage();

      await submitLogin(user);

      await waitFor(() => {
        expect(screen.getByTestId("otp-modal")).toBeInTheDocument();
      });

      expect(screen.getByTestId("otp-phone")).toHaveTextContent("+63 918 *** 9999");
    });
  });

  // =========================================================================
  // 3. OTP verification completes login
  // =========================================================================
  describe("OTP Verification Success", () => {
    it("calls verify2FA and completes login on correct OTP", async () => {
      mockLogin.mockResolvedValue(twoFALoginResponse());
      mockVerify2FA.mockResolvedValue(undefined);
      renderLoginPage();

      await submitLogin(user);

      await waitFor(() => {
        expect(screen.getByTestId("otp-modal")).toBeInTheDocument();
      });

      // Click the verify button (mock OTP modal calls onVerifySuccess("123456"))
      const verifyBtn = screen.getByTestId("otp-verify-btn");
      await user.click(verifyBtn);

      await waitFor(() => {
        expect(mockVerify2FA).toHaveBeenCalledWith("123456");
      });
    });

    it("closes OTP modal after successful verification", async () => {
      mockLogin.mockResolvedValue(twoFALoginResponse());
      mockVerify2FA.mockResolvedValue(undefined);
      renderLoginPage();

      await submitLogin(user);

      await waitFor(() => {
        expect(screen.getByTestId("otp-modal")).toBeInTheDocument();
      });

      const verifyBtn = screen.getByTestId("otp-verify-btn");
      await user.click(verifyBtn);

      await waitFor(() => {
        expect(screen.queryByTestId("otp-modal")).not.toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // 4. Failed OTP shows error
  // =========================================================================
  describe("OTP Verification Failure", () => {
    it("shows error message on failed OTP verification", async () => {
      mockLogin.mockResolvedValue(twoFALoginResponse());
      mockVerify2FA.mockRejectedValue(new Error("Invalid verification code"));
      renderLoginPage();

      await submitLogin(user);

      await waitFor(() => {
        expect(screen.getByTestId("otp-modal")).toBeInTheDocument();
      });

      const verifyBtn = screen.getByTestId("otp-verify-btn");
      await user.click(verifyBtn);

      await waitFor(() => {
        expect(screen.getByTestId("otp-error")).toBeInTheDocument();
      });

      expect(screen.getByTestId("otp-error")).toHaveTextContent("Invalid verification code");
      expect(screen.getByTestId("otp-error")).toHaveTextContent("2 attempts remaining");
    });

    it("shows max attempts error after 3 failed attempts", async () => {
      mockLogin.mockResolvedValue(twoFALoginResponse());
      mockVerify2FA.mockRejectedValue(new Error("Invalid code"));
      renderLoginPage();

      await submitLogin(user);

      await waitFor(() => {
        expect(screen.getByTestId("otp-modal")).toBeInTheDocument();
      });

      const verifyBtn = screen.getByTestId("otp-verify-btn");

      // Attempt 1
      await user.click(verifyBtn);
      await waitFor(() => {
        expect(screen.getByTestId("otp-error")).toHaveTextContent("2 attempts remaining");
      });

      // Attempt 2
      await user.click(verifyBtn);
      await waitFor(() => {
        expect(screen.getByTestId("otp-error")).toHaveTextContent("1 attempt remaining");
      });

      // Attempt 3 - max exceeded
      await user.click(verifyBtn);
      await waitFor(() => {
        expect(screen.getByTestId("otp-error")).toHaveTextContent("Maximum verification attempts exceeded");
      });
    });

    it("blocks verification after max attempts reached", async () => {
      mockLogin.mockResolvedValue(twoFALoginResponse());
      mockVerify2FA.mockRejectedValue(new Error("Invalid code"));
      renderLoginPage();

      await submitLogin(user);

      await waitFor(() => {
        expect(screen.getByTestId("otp-modal")).toBeInTheDocument();
      });

      const verifyBtn = screen.getByTestId("otp-verify-btn");

      // Exhaust all 3 attempts
      await user.click(verifyBtn);
      await waitFor(() => expect(mockVerify2FA).toHaveBeenCalledTimes(1));

      await user.click(verifyBtn);
      await waitFor(() => expect(mockVerify2FA).toHaveBeenCalledTimes(2));

      await user.click(verifyBtn);
      await waitFor(() => expect(mockVerify2FA).toHaveBeenCalledTimes(3));

      // 4th attempt should be blocked
      mockVerify2FA.mockClear();
      await user.click(verifyBtn);

      // verify2FA should NOT be called on the 4th attempt
      await waitFor(() => {
        expect(screen.getByTestId("otp-error")).toHaveTextContent("Maximum verification attempts exceeded");
      });
      // The 4th click triggers handle2FAVerifySuccess which returns early before calling verify2FA
      expect(mockVerify2FA).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 5. "Can't access your phone?" link appears
  // =========================================================================
  describe("Recovery Link", () => {
    it("shows recovery link when 2FA modal is open", async () => {
      mockLogin.mockResolvedValue(twoFALoginResponse());
      renderLoginPage();

      await submitLogin(user);

      await waitFor(() => {
        expect(screen.getByTestId("otp-modal")).toBeInTheDocument();
      });

      const recoveryLink = screen.getByTestId("2fa-recovery-link");
      expect(recoveryLink).toBeInTheDocument();
      expect(recoveryLink).toHaveTextContent("Can't access your phone?");
      expect(recoveryLink).toHaveAttribute("href", "/account-recovery");
    });

    it("does not show recovery link when 2FA modal is closed", () => {
      renderLoginPage();

      expect(screen.queryByTestId("2fa-recovery-link")).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // 6. Remember device checkbox toggles state
  // =========================================================================
  describe("Remember Device", () => {
    it("renders remember device checkbox when 2FA modal is open", async () => {
      mockLogin.mockResolvedValue(twoFALoginResponse());
      renderLoginPage();

      await submitLogin(user);

      await waitFor(() => {
        expect(screen.getByTestId("otp-modal")).toBeInTheDocument();
      });

      const rememberCheckbox = screen.getByTestId("remember-device-checkbox");
      expect(rememberCheckbox).toBeInTheDocument();
    });

    it("stores preference in sessionStorage on successful 2FA with remember device checked", async () => {
      mockLogin.mockResolvedValue(twoFALoginResponse());
      mockVerify2FA.mockResolvedValue(undefined);
      renderLoginPage();

      await submitLogin(user);

      await waitFor(() => {
        expect(screen.getByTestId("otp-modal")).toBeInTheDocument();
      });

      // Check the remember device checkbox using fireEvent for Radix compatibility
      const rememberCheckbox = screen.getByTestId("remember-device-checkbox");
      // Use fireEvent.click instead of userEvent to avoid Radix internal re-render issue in tests
      await act(async () => {
        rememberCheckbox.click();
      });

      // Verify OTP
      const verifyBtn = screen.getByTestId("otp-verify-btn");
      await user.click(verifyBtn);

      await waitFor(() => {
        expect(sessionStorage.getItem("2fa-remember-device")).toBe("true");
      });
    });
  });

  // =========================================================================
  // 7. Loading states during 2FA flow
  // =========================================================================
  describe("Loading States", () => {
    it("sets isVerifying during verification and clears after", async () => {
      let resolveVerify: () => void;
      const verifyPromise = new Promise<void>((resolve) => {
        resolveVerify = resolve;
      });
      mockLogin.mockResolvedValue(twoFALoginResponse());
      mockVerify2FA.mockReturnValue(verifyPromise);
      renderLoginPage();

      await submitLogin(user);

      await waitFor(() => {
        expect(screen.getByTestId("otp-modal")).toBeInTheDocument();
      });

      const verifyBtn = screen.getByTestId("otp-verify-btn");

      // Before clicking: isVerifying should be false (mockOTPModalProps tracks it)
      expect(mockOTPModalProps.isVerifying).toBe(false);

      await act(async () => {
        await user.click(verifyBtn);
      });

      // The verify2FA should have been called
      expect(mockVerify2FA).toHaveBeenCalledWith("123456");

      // Resolve the verification
      await act(async () => {
        resolveVerify!();
      });

      // After resolve, isVerifying should be false again
      await waitFor(() => {
        expect(mockOTPModalProps.isVerifying).toBe(false);
      });
    });

    it("shows OTP sent notification on 2FA trigger", async () => {
      mockLogin.mockResolvedValue(twoFALoginResponse());
      mockApiRequest.mockResolvedValue({ success: true });
      renderLoginPage();

      await submitLogin(user);

      await waitFor(() => {
        expect(screen.getByTestId("otp-modal")).toBeInTheDocument();
      });

      // Verify info toast was shown for OTP sent
      expect(mockToast.info).toHaveBeenCalledWith(
        "Verification code sent",
        expect.objectContaining({
          description: expect.stringContaining("+63 917 *** 4567"),
        })
      );
    });
  });

  // =========================================================================
  // 8. OTP Resend
  // =========================================================================
  describe("OTP Resend", () => {
    it("calls resend API when resend button is clicked", async () => {
      mockLogin.mockResolvedValue(twoFALoginResponse());
      renderLoginPage();

      await submitLogin(user);

      await waitFor(() => {
        expect(screen.getByTestId("otp-modal")).toBeInTheDocument();
      });

      // Clear the initial send call
      mockApiRequest.mockClear();
      mockApiRequest.mockResolvedValue({ success: true });

      const resendBtn = screen.getByTestId("otp-resend-btn");
      await user.click(resendBtn);

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith("/auth/2fa/send", {
          method: "POST",
          headers: { Authorization: "Bearer temp-jwt-2fa-token" },
        });
      });
    });
  });

  // =========================================================================
  // 9. Modal close resets state
  // =========================================================================
  describe("Modal Close", () => {
    it("resets 2FA state when modal is closed", async () => {
      mockLogin.mockResolvedValue(twoFALoginResponse());
      renderLoginPage();

      await submitLogin(user);

      await waitFor(() => {
        expect(screen.getByTestId("otp-modal")).toBeInTheDocument();
      });

      const closeBtn = screen.getByTestId("otp-close-btn");
      await user.click(closeBtn);

      await waitFor(() => {
        expect(screen.queryByTestId("otp-modal")).not.toBeInTheDocument();
      });

      // Recovery link should also disappear
      expect(screen.queryByTestId("2fa-recovery-link")).not.toBeInTheDocument();
    });
  });
});
