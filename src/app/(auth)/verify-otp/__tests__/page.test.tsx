/**
 * Verify OTP Page render tests (Client Component)
 * COV-012: Page coverage batch
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock dependencies
jest.mock("@/lib/api-client", () => ({
  apiRequest: jest.fn(),
}));
jest.mock("@/lib/auth", () => ({
  setAuthToken: jest.fn(),
}));
jest.mock("@/components/ui/input-otp", () => ({
  InputOTP: ({
    children,
    onChange,
    value,
  }: {
    children: React.ReactNode;
    onChange: (v: string) => void;
    value: string;
  }) => (
    <div data-testid="input-otp">
      <input
        data-testid="otp-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {children}
    </div>
  ),
  InputOTPGroup: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  InputOTPSlot: ({ index }: { index: number }) => (
    <span data-testid={`otp-slot-${index}`} />
  ),
}));

import { apiRequest } from "@/lib/api-client";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/verify-otp",
  useSearchParams: () => new URLSearchParams(),
}));

import VerifyOTPPage from "../page";

describe("VerifyOTPPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set pending email in session storage
    sessionStorage.setItem("pendingVerificationEmail", "test@example.com");
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it("renders the OTP verification form", () => {
    render(<VerifyOTPPage />);
    expect(
      screen.getByRole("heading", { name: /enter verification code/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId("input-otp")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /verify/i })
    ).toBeInTheDocument();
  });

  it("renders cancel button", () => {
    render(<VerifyOTPPage />);
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(mockPush).toHaveBeenCalledWith("/signup");
  });

  it("shows masked email address", () => {
    render(<VerifyOTPPage />);
    // test@example.com -> tes*****@example.com
    expect(screen.getByText(/tes\*+@example\.com/)).toBeInTheDocument();
  });

  it("redirects to signup when no pending email", () => {
    sessionStorage.removeItem("pendingVerificationEmail");
    render(<VerifyOTPPage />);
    expect(mockPush).toHaveBeenCalledWith("/signup");
  });

  it("renders resend code button", () => {
    render(<VerifyOTPPage />);
    expect(
      screen.getByRole("button", { name: /resend code/i })
    ).toBeInTheDocument();
  });

  it("disables verify button when code is incomplete", () => {
    render(<VerifyOTPPage />);
    const verifyBtn = screen.getByRole("button", { name: /verify/i });
    expect(verifyBtn).toBeDisabled();
  });
});
