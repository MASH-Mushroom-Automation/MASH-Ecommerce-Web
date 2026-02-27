/**
 * Login Page render tests
 * COV-012: Page coverage batch
 */
import React from "react";
import { render, screen } from "@testing-library/react";

// Mock useLogin hook
const mockUseLogin = jest.fn();
jest.mock("@/hooks/useLogin", () => ({
  useLogin: () => mockUseLogin(),
  getEmailStatus: (email: string) => {
    if (!email) return { isValid: false, message: "Enter email address" };
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return { isValid: true, message: "Valid email" };
    return { isValid: false, message: "Please enter a valid email address" };
  },
}));

// Mock react-hook-form Controller (avoids needing real form control internals)
jest.mock("react-hook-form", () => {
  const actual = jest.requireActual("react-hook-form");
  return {
    ...actual,
    Controller: ({
      render,
      name,
    }: {
      name: string;
      render: (props: {
        field: { value: boolean; onChange: jest.Mock; onBlur: jest.Mock; name: string; ref: jest.Mock };
      }) => React.ReactElement;
    }) =>
      render({
        field: {
          value: false,
          onChange: jest.fn(),
          onBlur: jest.fn(),
          name,
          ref: jest.fn(),
        },
      }),
  };
});

// Mock components
jest.mock("@/components/auth/google-sign-in-button", () => ({
  GoogleSignInButton: (props: Record<string, unknown>) => (
    <button data-testid="google-sign-in">{String(props.text || "Google")}</button>
  ),
}));

jest.mock("@/components/auth/TwoFactorModal", () => ({
  TwoFactorModal: (props: Record<string, unknown>) =>
    props.open ? <div data-testid="2fa-modal">2FA Modal</div> : null,
}));

import LoginPage from "../page";

function createMockLoginReturn(overrides: Record<string, unknown> = {}) {
  return {
    register: jest.fn(() => ({})),
    handleSubmit: jest.fn((cb: unknown) => (e: React.FormEvent) => {
      e?.preventDefault?.();
    }),
    control: {},
    errors: {},
    isSubmitting: false,
    setValue: jest.fn(),
    clearErrors: jest.fn(),
    onSubmit: jest.fn(),
    email: "",
    setEmail: jest.fn(),
    password: "",
    setPassword: jest.fn(),
    showPassword: false,
    setShowPassword: jest.fn(),
    authLoading: false,
    contextualMessage: null,
    verifyParam: null,
    verifiedParam: null,
    resendVerificationEmail: jest.fn(),
    show2FAModal: false,
    twoFAPhoneNumber: "",
    twoFAError: "",
    isVerifying2FA: false,
    rememberDevice: false,
    setRememberDevice: jest.fn(),
    handle2FAVerifySuccess: jest.fn(),
    handle2FAResend: jest.fn(),
    handle2FAClose: jest.fn(),
    ...overrides,
  };
}

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the login form", () => {
    mockUseLogin.mockReturnValue(createMockLoginReturn());
    render(<LoginPage />);
    expect(
      screen.getByRole("heading", { name: /sign in to your account/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in to your account/i })
    ).toBeInTheDocument();
  });

  it("renders Google Sign In button", () => {
    mockUseLogin.mockReturnValue(createMockLoginReturn());
    render(<LoginPage />);
    expect(screen.getByTestId("google-sign-in")).toBeInTheDocument();
  });

  it("renders Create one link to signup", () => {
    mockUseLogin.mockReturnValue(createMockLoginReturn());
    render(<LoginPage />);
    expect(screen.getByRole("link", { name: /create one/i })).toHaveAttribute(
      "href",
      "/signup"
    );
  });

  it("renders Forgot Password link", () => {
    mockUseLogin.mockReturnValue(createMockLoginReturn());
    render(<LoginPage />);
    expect(
      screen.getByRole("link", { name: /forgot password/i })
    ).toHaveAttribute("href", "/forgot-password");
  });

  it("shows loading overlay when submitting", () => {
    mockUseLogin.mockReturnValue(
      createMockLoginReturn({ isSubmitting: true })
    );
    render(<LoginPage />);
    expect(screen.getByText("Signing you in...")).toBeInTheDocument();
    expect(screen.getByText("Signing In...")).toBeInTheDocument();
  });

  it("shows loading overlay when authLoading", () => {
    mockUseLogin.mockReturnValue(
      createMockLoginReturn({ authLoading: true })
    );
    render(<LoginPage />);
    expect(screen.getByText("Signing you in...")).toBeInTheDocument();
  });

  it("shows contextual message for verification", () => {
    mockUseLogin.mockReturnValue(
      createMockLoginReturn({
        contextualMessage: "Please verify your email",
        verifyParam: "true",
      })
    );
    render(<LoginPage />);
    expect(
      screen.getByText("Please verify your email")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /resend email/i })
    ).toBeInTheDocument();
  });

  it("shows contextual message for verified state", () => {
    mockUseLogin.mockReturnValue(
      createMockLoginReturn({
        contextualMessage: "Email verified!",
        verifiedParam: "true",
      })
    );
    render(<LoginPage />);
    expect(screen.getByText("Email verified!")).toBeInTheDocument();
  });

  it("shows email validation indicator when email is entered", () => {
    mockUseLogin.mockReturnValue(
      createMockLoginReturn({ email: "bad" })
    );
    render(<LoginPage />);
    expect(
      screen.getByText("Please enter a valid email address")
    ).toBeInTheDocument();
  });

  it("shows valid email indicator", () => {
    mockUseLogin.mockReturnValue(
      createMockLoginReturn({ email: "test@example.com" })
    );
    render(<LoginPage />);
    expect(screen.getByText("Valid email")).toBeInTheDocument();
  });

  it("shows form errors", () => {
    mockUseLogin.mockReturnValue(
      createMockLoginReturn({
        errors: {
          email: { message: "Email is required" },
          password: { message: "Password is required" },
        },
      })
    );
    render(<LoginPage />);
    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("renders 2FA modal when show2FAModal is true", () => {
    mockUseLogin.mockReturnValue(
      createMockLoginReturn({ show2FAModal: true })
    );
    render(<LoginPage />);
    expect(screen.getByTestId("2fa-modal")).toBeInTheDocument();
  });

  it("does not render 2FA modal when show2FAModal is false", () => {
    mockUseLogin.mockReturnValue(createMockLoginReturn());
    render(<LoginPage />);
    expect(screen.queryByTestId("2fa-modal")).not.toBeInTheDocument();
  });

  it("shows password toggle button", () => {
    mockUseLogin.mockReturnValue(createMockLoginReturn());
    render(<LoginPage />);
    expect(
      screen.getByRole("button", { name: /show password/i })
    ).toBeInTheDocument();
  });

  it("shows hide password when showPassword is true", () => {
    mockUseLogin.mockReturnValue(
      createMockLoginReturn({ showPassword: true })
    );
    render(<LoginPage />);
    expect(
      screen.getByRole("button", { name: /hide password/i })
    ).toBeInTheDocument();
  });
});
