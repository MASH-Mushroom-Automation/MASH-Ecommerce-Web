/**
 * Tests for src/hooks/useLogin.ts
 * Hook: useLogin (email/password login with 2FA support)
 * Helper: getEmailStatus (email validation)
 *
 * Uses AuthApi.login, setAuthToken, apiRequest, useAuth context, useRouter, useSearchParams.
 * All external dependencies must be mocked.
 */

import { renderHook, waitFor, act } from "@testing-library/react";

// ─── Mock dependencies ──────────────────────────────────────────

const mockPush = jest.fn();
const mockSearchParamsGet = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: mockSearchParamsGet }),
}));

const mockSignInWithEmailPassword = jest.fn();
const mockResendVerificationEmail = jest.fn();
const mockVerify2FA = jest.fn();

// Configure global AuthContext mock (from jest.setupMocks.js) with our test fns
// Do NOT use jest.mock("@/contexts/AuthContext") - global setupMocks mock takes
// precedence when transforms don't hoist properly. Instead, configure
// global.__mockUseAuth with the values our tests need.
beforeEach(() => {
  (global as any).__mockUseAuth.mockReturnValue({
    user: null,
    isAuthenticated: false,
    signInWithEmailPassword: mockSignInWithEmailPassword,
    resendVerificationEmail: mockResendVerificationEmail,
    verify2FA: mockVerify2FA,
    loading: false,
  });
});

const mockLogin = jest.fn();
jest.mock("@/lib/api/auth", () => ({
  AuthApi: {
    login: (...args: unknown[]) => mockLogin(...args),
  },
}));

const mockSetAuthToken = jest.fn();
jest.mock("@/lib/auth", () => ({
  setAuthToken: (...args: unknown[]) => mockSetAuthToken(...args),
  getAuthToken: jest.fn(),
  logout: jest.fn(),
}));

const mockApiRequest = jest.fn();
jest.mock("@/lib/api-client", () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
}));

import { useLogin, getEmailStatus } from "../useLogin";

// ═════════════════════════════════════════════════════════════════════
// getEmailStatus (pure helper)
// ═════════════════════════════════════════════════════════════════════

describe("getEmailStatus", () => {
  it("returns invalid for empty string", () => {
    const result = getEmailStatus("");
    expect(result.isValid).toBe(false);
    expect(result.message).toBe("Enter email address");
  });

  it("returns valid for correct email", () => {
    const result = getEmailStatus("user@example.com");
    expect(result.isValid).toBe(true);
    expect(result.message).toBe("Valid email");
  });

  it("returns invalid for malformed email", () => {
    const result = getEmailStatus("not-an-email");
    expect(result.isValid).toBe(false);
    expect(result.message).toBe("Please enter a valid email address");
  });

  it("returns invalid for email without domain", () => {
    const result = getEmailStatus("user@");
    expect(result.isValid).toBe(false);
  });

  it("returns valid for email with subdomain", () => {
    const result = getEmailStatus("user@sub.example.com");
    expect(result.isValid).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════
// useLogin hook
// ═════════════════════════════════════════════════════════════════════

describe("useLogin", () => {
  beforeEach(() => {
    mockSearchParamsGet.mockReturnValue(null);
    mockLogin.mockReset();
    mockSetAuthToken.mockReset();
    mockApiRequest.mockReset();
    mockVerify2FA.mockReset();
    mockPush.mockReset();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useLogin());

    expect(result.current.email).toBe("");
    expect(result.current.password).toBe("");
    expect(result.current.showPassword).toBe(false);
    expect(result.current.show2FAModal).toBe(false);
    expect(result.current.isVerifying2FA).toBe(false);
    expect(result.current.twoFAError).toBe("");
    expect(result.current.contextualMessage).toBeNull();
  });

  it("should expose form registration and control", () => {
    const { result } = renderHook(() => useLogin());

    expect(result.current.register).toBeDefined();
    expect(result.current.handleSubmit).toBeDefined();
    expect(result.current.control).toBeDefined();
    expect(result.current.errors).toBeDefined();
    expect(result.current.onSubmit).toBeDefined();
  });

  it("should toggle showPassword", () => {
    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.setShowPassword(true);
    });

    expect(result.current.showPassword).toBe(true);
  });

  it("should update email state", () => {
    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.setEmail("test@example.com");
    });

    expect(result.current.email).toBe("test@example.com");
  });

  // -------------------------------------------------------------------
  // Contextual messages
  // -------------------------------------------------------------------

  it("should show verify message when verify param is true", () => {
    mockSearchParamsGet.mockImplementation((key: string) => {
      if (key === "verify") return "true";
      return null;
    });

    const { result } = renderHook(() => useLogin());

    expect(result.current.contextualMessage).toContain("verify your email");
  });

  it("should show verified message when verified param is true", () => {
    mockSearchParamsGet.mockImplementation((key: string) => {
      if (key === "verified") return "true";
      return null;
    });

    const { result } = renderHook(() => useLogin());

    expect(result.current.contextualMessage).toContain("Email verified");
  });

  it("should show checkout message for checkout redirect", () => {
    mockSearchParamsGet.mockImplementation((key: string) => {
      if (key === "redirect") return "/checkout";
      return null;
    });

    const { result } = renderHook(() => useLogin());

    expect(result.current.contextualMessage).toContain("checkout");
  });

  it("should show profile message for profile redirect", () => {
    mockSearchParamsGet.mockImplementation((key: string) => {
      if (key === "redirect") return "/profile";
      return null;
    });

    const { result } = renderHook(() => useLogin());

    expect(result.current.contextualMessage).toContain("profile");
  });

  it("should show seller message for seller redirect", () => {
    mockSearchParamsGet.mockImplementation((key: string) => {
      if (key === "redirect") return "/seller/dashboard";
      return null;
    });

    const { result } = renderHook(() => useLogin());

    expect(result.current.contextualMessage).toContain("seller");
  });

  it("should show generic message for unknown redirect", () => {
    mockSearchParamsGet.mockImplementation((key: string) => {
      if (key === "redirect") return "/some-page";
      return null;
    });

    const { result } = renderHook(() => useLogin());

    expect(result.current.contextualMessage).toContain("sign in to continue");
  });

  // -------------------------------------------------------------------
  // Login submission
  // -------------------------------------------------------------------

  it("should handle successful login with tokens", async () => {
    mockLogin.mockResolvedValueOnce({
      data: {
        user: {
          firstName: "John",
          email: "john@test.com",
          emailVerified: true,
        },
        accessToken: "access-123",
        refreshToken: "refresh-456",
      },
    });

    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.onSubmit({
        email: "john@test.com",
        password: "password123",
        rememberMe: true,
      });
    });

    expect(mockLogin).toHaveBeenCalledWith({
      email: "john@test.com",
      password: "password123",
      rememberMe: true,
    });
    expect(mockSetAuthToken).toHaveBeenCalledWith(
      "access-123",
      "refresh-456",
      true
    );
  });

  it("should handle 2FA required response", async () => {
    mockLogin.mockResolvedValueOnce({
      requiresTwoFactor: true,
      tempToken: "temp-token-123",
      phoneNumber: "+639123456789",
    });
    mockApiRequest.mockResolvedValueOnce({});

    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.onSubmit({
        email: "user@test.com",
        password: "password123",
        rememberMe: false,
      });
    });

    expect(result.current.show2FAModal).toBe(true);
    expect(result.current.twoFAPhoneNumber).toBe("+639123456789");
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/auth/2fa/send",
      expect.objectContaining({
        method: "POST",
        headers: { Authorization: "Bearer temp-token-123" },
      })
    );
  });

  it("should handle login error with message", async () => {
    mockLogin.mockRejectedValueOnce({ message: "Invalid credentials" });

    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.onSubmit({
        email: "user@test.com",
        password: "wrong",
        rememberMe: false,
      });
    });

    // hasError should be set
    // The exact toast call depends on the error message parsing
    expect(mockLogin).toHaveBeenCalled();
  });

  it("should handle email not verified response", async () => {
    mockLogin.mockResolvedValueOnce({
      data: {
        user: {
          email: "user@test.com",
          emailVerified: false,
        },
      },
    });

    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.onSubmit({
        email: "user@test.com",
        password: "password123",
        rememberMe: false,
      });
    });

    // setAuthToken should NOT be called for unverified users
    expect(mockSetAuthToken).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------
  // 2FA handlers
  // -------------------------------------------------------------------

  it("should handle 2FA verification success", async () => {
    // First trigger 2FA modal
    mockLogin.mockResolvedValueOnce({
      requiresTwoFactor: true,
      tempToken: "temp-token",
      phoneNumber: "+63912",
    });
    mockApiRequest.mockResolvedValueOnce({});
    mockVerify2FA.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.onSubmit({
        email: "u@t.com",
        password: "pass123",
        rememberMe: false,
      });
    });

    expect(result.current.show2FAModal).toBe(true);

    await act(async () => {
      await result.current.handle2FAVerifySuccess("123456");
    });

    expect(mockVerify2FA).toHaveBeenCalledWith("123456");
    expect(result.current.show2FAModal).toBe(false);
  });

  it("should handle 2FA verification failure with remaining attempts", async () => {
    mockLogin.mockResolvedValueOnce({
      requiresTwoFactor: true,
      tempToken: "t",
      phoneNumber: "",
    });
    mockApiRequest.mockResolvedValueOnce({});
    mockVerify2FA.mockRejectedValueOnce(new Error("Invalid code"));

    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.onSubmit({
        email: "u@t.com",
        password: "p",
        rememberMe: false,
      });
    });

    await act(async () => {
      await result.current.handle2FAVerifySuccess("000000");
    });

    expect(result.current.twoFAError).toContain("2 attempts remaining");
  });

  it("should handle 2FA max attempts exceeded", async () => {
    mockLogin.mockResolvedValueOnce({
      requiresTwoFactor: true,
      tempToken: "t",
    });
    mockApiRequest.mockResolvedValue({});
    mockVerify2FA.mockRejectedValue(new Error("bad code"));

    const { result } = renderHook(() => useLogin());

    // Trigger 2FA
    await act(async () => {
      await result.current.onSubmit({
        email: "u@t.com",
        password: "p",
        rememberMe: false,
      });
    });

    // 3 failed attempts
    for (let i = 0; i < 3; i++) {
      await act(async () => {
        await result.current.handle2FAVerifySuccess("000000");
      });
    }

    expect(result.current.twoFAError).toContain("Maximum verification attempts exceeded");
  });

  it("should handle 2FA resend", async () => {
    mockLogin.mockResolvedValueOnce({
      requiresTwoFactor: true,
      tempToken: "t-resend",
      phoneNumber: "+63999",
    });
    mockApiRequest.mockResolvedValue({});

    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.onSubmit({
        email: "u@t.com",
        password: "p",
        rememberMe: false,
      });
    });

    await act(async () => {
      await result.current.handle2FAResend();
    });

    // Should have been called twice: once for initial send, once for resend
    expect(mockApiRequest).toHaveBeenCalledTimes(2);
  });

  it("should handle 2FA close", async () => {
    mockLogin.mockResolvedValueOnce({
      requiresTwoFactor: true,
      tempToken: "t",
    });
    mockApiRequest.mockResolvedValueOnce({});

    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.onSubmit({
        email: "u@t.com",
        password: "p",
        rememberMe: false,
      });
    });

    expect(result.current.show2FAModal).toBe(true);

    act(() => {
      result.current.handle2FAClose();
    });

    expect(result.current.show2FAModal).toBe(false);
    expect(result.current.twoFAError).toBe("");
  });

  it("should expose resendVerificationEmail from auth context", () => {
    const { result } = renderHook(() => useLogin());
    expect(result.current.resendVerificationEmail).toBe(
      mockResendVerificationEmail
    );
  });

  it("should expose rememberDevice state", () => {
    const { result } = renderHook(() => useLogin());

    expect(result.current.rememberDevice).toBe(false);

    act(() => {
      result.current.setRememberDevice(true);
    });

    expect(result.current.rememberDevice).toBe(true);
  });
});
