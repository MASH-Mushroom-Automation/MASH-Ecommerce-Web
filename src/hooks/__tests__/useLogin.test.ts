/**
 * Tests for useLogin hook - getEmailStatus + useLogin
 * Covers: email validation, contextual messages, 2FA handlers
 */

import { renderHook, act } from "@testing-library/react";

// Mock all dependencies first
const mockPush = jest.fn();
const mockGet = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({
    get: (key: string) => mockGet(key),
  }),
}));

const mockSignInWithEmailPassword = jest.fn();
const mockResendVerification = jest.fn();
const mockVerify2FA = jest.fn();
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    signInWithEmailPassword: mockSignInWithEmailPassword,
    resendVerificationEmail: mockResendVerification,
    verify2FA: mockVerify2FA,
    loading: false,
  }),
}));

jest.mock("@/lib/api/auth", () => ({
  AuthApi: {
    login: jest.fn(),
  },
}));

jest.mock("@/lib/auth", () => ({
  setAuthToken: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock("@/lib/api-client", () => ({
  apiRequest: jest.fn(),
}));

import { getEmailStatus, useLogin } from "@/hooks/useLogin";

describe("getEmailStatus", () => {
  it("should return invalid for empty string", () => {
    const result = getEmailStatus("");
    expect(result.isValid).toBe(false);
    expect(result.message).toContain("Enter email");
  });

  it("should return valid for correct email", () => {
    const result = getEmailStatus("test@example.com");
    expect(result.isValid).toBe(true);
    expect(result.message).toContain("Valid");
  });

  it("should return invalid for email without @", () => {
    const result = getEmailStatus("testexample.com");
    expect(result.isValid).toBe(false);
  });

  it("should return invalid for email without domain", () => {
    const result = getEmailStatus("test@");
    expect(result.isValid).toBe(false);
  });

  it("should return invalid for email with spaces", () => {
    const result = getEmailStatus("test @example.com");
    expect(result.isValid).toBe(false);
  });
});

describe("useLogin hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReturnValue(null);
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useLogin());
    expect(result.current.email).toBe("");
    expect(result.current.password).toBe("");
    expect(result.current.showPassword).toBe(false);
    expect(result.current.show2FAModal).toBe(false);
    expect(result.current.contextualMessage).toBeNull();
  });

  it("should show verify message when verify param is true", () => {
    mockGet.mockImplementation((key: string) => {
      if (key === "verify") return "true";
      return null;
    });
    const { result } = renderHook(() => useLogin());
    expect(result.current.contextualMessage).toContain("verify your email");
  });

  it("should show verified message when verified param is true", () => {
    mockGet.mockImplementation((key: string) => {
      if (key === "verified") return "true";
      return null;
    });
    const { result } = renderHook(() => useLogin());
    expect(result.current.contextualMessage).toContain("Email verified");
  });

  it("should show checkout message when redirect includes /checkout", () => {
    mockGet.mockImplementation((key: string) => {
      if (key === "redirect") return "/checkout";
      return null;
    });
    const { result } = renderHook(() => useLogin());
    expect(result.current.contextualMessage).toContain("checkout");
  });

  it("should show profile message when redirect includes /profile", () => {
    mockGet.mockImplementation((key: string) => {
      if (key === "redirect") return "/profile";
      return null;
    });
    const { result } = renderHook(() => useLogin());
    expect(result.current.contextualMessage).toContain("profile");
  });

  it("should show seller message when redirect includes /seller", () => {
    mockGet.mockImplementation((key: string) => {
      if (key === "redirect") return "/seller";
      return null;
    });
    const { result } = renderHook(() => useLogin());
    expect(result.current.contextualMessage).toContain("seller");
  });

  it("should show generic sign in message for other redirect URLs", () => {
    mockGet.mockImplementation((key: string) => {
      if (key === "redirect") return "/some-page";
      return null;
    });
    const { result } = renderHook(() => useLogin());
    expect(result.current.contextualMessage).toContain("sign in to continue");
  });

  it("should show wishlist message when redirect includes /wishlist", () => {
    mockGet.mockImplementation((key: string) => {
      if (key === "redirect") return "/wishlist";
      return null;
    });
    const { result } = renderHook(() => useLogin());
    expect(result.current.contextualMessage).toContain("wishlist");
  });

  it("should show onboarding message when redirect includes /onboarding", () => {
    mockGet.mockImplementation((key: string) => {
      if (key === "redirect") return "/onboarding";
      return null;
    });
    const { result } = renderHook(() => useLogin());
    expect(result.current.contextualMessage).toContain("onboarding");
  });

  it("should update email state", () => {
    const { result } = renderHook(() => useLogin());
    act(() => {
      result.current.setEmail("test@test.com");
    });
    expect(result.current.email).toBe("test@test.com");
  });

  it("should toggle password visibility", () => {
    const { result } = renderHook(() => useLogin());
    expect(result.current.showPassword).toBe(false);
    act(() => {
      result.current.setShowPassword(true);
    });
    expect(result.current.showPassword).toBe(true);
  });

  it("should handle 2FA close", () => {
    const { result } = renderHook(() => useLogin());
    act(() => {
      result.current.handle2FAClose();
    });
    expect(result.current.show2FAModal).toBe(false);
    expect(result.current.twoFAError).toBe("");
  });
});
