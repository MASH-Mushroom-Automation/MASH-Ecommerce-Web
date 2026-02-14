/**
 * PhoneVerificationSection Component Tests
 *
 * Tests the feature-flag-gated phone verification wrapper:
 * 1. Feature flag disabled: renders nothing
 * 2. Feature flag enabled: renders phone section
 * 3. Verification badge states (verified / unverified)
 * 4. Edit mode toggling
 * 5. Display of masked phone number
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PhoneVerificationSection } from "../PhoneVerificationSection";
import type { PhoneVerificationSectionProps } from "../PhoneVerificationSection";

// ============================================================================
// Mocks
// ============================================================================

// Mock feature-flags module
let mockPhoneVerificationEnabled = false;

jest.mock("@/lib/feature-flags", () => ({
  isPhoneVerificationEnabled: () => mockPhoneVerificationEnabled,
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
    if (digits.startsWith("9") && digits.length === 10) return `+63${digits}`;
    return `+${digits}`;
  },
  normalizePhoneNumber: (phone: string) => phone.replace(/[^\d+]/g, ""),
}));

// Mock usePhoneVerification hook
const mockSendVerification = jest.fn().mockResolvedValue(undefined);
const mockVerifyCode = jest.fn().mockResolvedValue(true);
const mockResendCode = jest.fn().mockResolvedValue(undefined);
const mockReset = jest.fn();

jest.mock("@/hooks/usePhoneVerification", () => ({
  usePhoneVerification: () => ({
    phoneNumber: null,
    setPhoneNumber: jest.fn(),
    state: "idle" as const,
    isVerified: false,
    isLoading: false,
    error: null,
    canResend: false,
    cooldownSeconds: 0,
    expirySeconds: 0,
    attempts: 0,
    attemptsRemaining: 3,
    sendVerification: mockSendVerification,
    verifyCode: mockVerifyCode,
    resendCode: mockResendCode,
    reset: mockReset,
  }),
}));

// Mock OTPVerificationModal
jest.mock("@/components/profile/OTPVerificationModal", () => ({
  OTPVerificationModal: ({
    open,
    phoneNumber,
  }: {
    open: boolean;
    phoneNumber: string;
    onClose: () => void;
    onVerifySuccess: (code: string) => void;
    onResendOTP: () => Promise<void>;
    errorMessage?: string;
    isVerifying?: boolean;
  }) =>
    open ? (
      <div data-testid="otp-modal">OTP Modal for {phoneNumber}</div>
    ) : null,
}));

// Mock PhoneNumberInput
jest.mock("@/components/profile/PhoneNumberInput", () => ({
  PhoneNumberInput: ({
    value,
    onChange,
    disabled,
    error,
  }: {
    value?: string;
    onChange?: (v: string) => void;
    disabled?: boolean;
    error?: string;
    validationState?: string;
    required?: boolean;
    label?: string;
    placeholder?: string;
  }) => (
    <div data-testid="phone-input">
      <input
        data-testid="phone-input-field"
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
      />
      {error && <span data-testid="phone-input-error">{error}</span>}
    </div>
  ),
}));

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Phone: () => <span data-testid="icon-phone">PhoneIcon</span>,
  Shield: () => <span data-testid="icon-shield">ShieldIcon</span>,
  Edit: () => <span data-testid="icon-edit">EditIcon</span>,
  Loader2: () => <span data-testid="icon-loader">LoaderIcon</span>,
  CheckCircle2: () => <span data-testid="icon-check">CheckIcon</span>,
  AlertTriangle: () => <span data-testid="icon-alert">AlertIcon</span>,
}));

// ============================================================================
// Test Utilities
// ============================================================================

const defaultProps: PhoneVerificationSectionProps = {
  user: { uid: "user-123", phone: "+639181234567" },
  phoneVerified: false,
  phoneNumber: "+639181234567",
  onPhoneVerified: jest.fn(),
  onPhoneSaved: jest.fn(),
  onPhoneChange: jest.fn(),
};

function renderSection(overrides: Partial<PhoneVerificationSectionProps> = {}) {
  return render(
    <PhoneVerificationSection {...defaultProps} {...overrides} />,
  );
}

// ============================================================================
// Test Suite 1: Feature Flag Gating
// ============================================================================

describe("PhoneVerificationSection - Feature Flag", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render nothing when phone verification is disabled", () => {
    mockPhoneVerificationEnabled = false;

    const { container } = renderSection();

    expect(container.innerHTML).toBe("");
    expect(
      screen.queryByTestId("phone-verification-section"),
    ).not.toBeInTheDocument();
  });

  it("should render phone section when phone verification is enabled", () => {
    mockPhoneVerificationEnabled = true;

    renderSection();

    expect(
      screen.getByTestId("phone-verification-section"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Phone Number/)).toBeInTheDocument();
  });
});

// ============================================================================
// Test Suite 2: Verification Badge States
// ============================================================================

describe("PhoneVerificationSection - Badge States", () => {
  beforeEach(() => {
    mockPhoneVerificationEnabled = true;
    jest.clearAllMocks();
  });

  it("should show Verified badge when phoneVerified is true", () => {
    renderSection({ phoneVerified: true });

    expect(screen.getByTestId("verified-badge")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();
    expect(
      screen.queryByTestId("unverified-badge"),
    ).not.toBeInTheDocument();
  });

  it("should show Unverified badge when phoneVerified is false", () => {
    renderSection({ phoneVerified: false });

    expect(screen.getByTestId("unverified-badge")).toBeInTheDocument();
    expect(screen.getByText("Unverified")).toBeInTheDocument();
    expect(
      screen.queryByTestId("verified-badge"),
    ).not.toBeInTheDocument();
  });

  it("should not show any badge when phone number is empty", () => {
    renderSection({ phoneNumber: "" });

    expect(
      screen.queryByTestId("verified-badge"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("unverified-badge"),
    ).not.toBeInTheDocument();
  });
});

// ============================================================================
// Test Suite 3: Phone Display
// ============================================================================

describe("PhoneVerificationSection - Phone Display", () => {
  beforeEach(() => {
    mockPhoneVerificationEnabled = true;
    jest.clearAllMocks();
  });

  it("should display masked phone number", () => {
    renderSection({ phoneNumber: "+639181234567" });

    expect(screen.getByTestId("phone-display")).toHaveTextContent(
      "+63 *** *** **67",
    );
  });

  it('should display "No phone number set" when phone is empty', () => {
    renderSection({ phoneNumber: "" });

    expect(screen.getByTestId("phone-display")).toHaveTextContent(
      "No phone number set",
    );
  });

  it("should show delivery warning when no phone number", () => {
    renderSection({ phoneNumber: "" });

    expect(
      screen.getByText(/Phone number is required for Lalamove/),
    ).toBeInTheDocument();
  });
});

// ============================================================================
// Test Suite 4: Edit Mode
// ============================================================================

describe("PhoneVerificationSection - Edit Mode", () => {
  beforeEach(() => {
    mockPhoneVerificationEnabled = true;
    jest.clearAllMocks();
  });

  it("should show edit button in display mode", () => {
    renderSection();

    expect(screen.getByTestId("edit-phone-button")).toBeInTheDocument();
  });

  it("should show Verify button for unverified phone", () => {
    renderSection({ phoneVerified: false, phoneNumber: "+639181234567" });

    expect(screen.getByTestId("verify-button")).toBeInTheDocument();
  });

  it("should not show Verify button for verified phone", () => {
    renderSection({ phoneVerified: true, phoneNumber: "+639181234567" });

    expect(
      screen.queryByTestId("verify-button"),
    ).not.toBeInTheDocument();
  });

  it("should enter edit mode when edit button is clicked", async () => {
    const user = userEvent.setup();
    renderSection();

    await user.click(screen.getByTestId("edit-phone-button"));

    expect(screen.getByTestId("phone-input")).toBeInTheDocument();
    expect(screen.getByText(/Verify & Save/)).toBeInTheDocument();
    expect(screen.getByText("Save Without Verify")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("should exit edit mode when Cancel is clicked", async () => {
    const user = userEvent.setup();
    renderSection();

    // Enter edit mode
    await user.click(screen.getByTestId("edit-phone-button"));
    expect(screen.getByTestId("phone-input")).toBeInTheDocument();

    // Click cancel
    await user.click(screen.getByText("Cancel"));

    // Should be back in display mode
    expect(screen.queryByTestId("phone-input")).not.toBeInTheDocument();
    expect(screen.getByTestId("phone-display")).toBeInTheDocument();
  });
});

// ============================================================================
// Test Suite 5: Null User
// ============================================================================

describe("PhoneVerificationSection - Null User", () => {
  beforeEach(() => {
    mockPhoneVerificationEnabled = true;
    jest.clearAllMocks();
  });

  it("should render section even with null user", () => {
    renderSection({ user: null, phoneNumber: "" });

    expect(
      screen.getByTestId("phone-verification-section"),
    ).toBeInTheDocument();
  });
});
