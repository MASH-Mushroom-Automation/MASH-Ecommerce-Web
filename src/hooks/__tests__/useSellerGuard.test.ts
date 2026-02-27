/**
 * useSellerGuard Hook Tests (COV-004)
 * Tests: SELLER access, ADMIN access, BUYER redirect, expired session, unauthenticated, error
 */

import { renderHook, waitFor } from "@testing-library/react";
import { useSellerGuard } from "../useSellerGuard";

// Access the mockRouter via the global mock set up in jest.setupMocks.js
// useRouter is already mocked globally, we just need a reference to the mock router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  refresh: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  prefetch: jest.fn(),
};

// Re-mock useRouter for this specific test file to use our local mockRouter
jest.mock("next/navigation", () => ({
  ...jest.requireActual("next/navigation"),
  useRouter: jest.fn(() => mockRouter),
  usePathname: jest.fn(() => "/seller"),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Save original fetch
const originalFetch = global.fetch;

describe("useSellerGuard", () => {
  let mockFetch: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch = jest.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("should start with loading=true and hasAccess=null", () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ role: "SELLER", authenticated: true }),
    });

    const { result } = renderHook(() => useSellerGuard());

    expect(result.current.loading).toBe(true);
    expect(result.current.hasAccess).toBeNull();
    expect(result.current.role).toBeNull();
  });

  it("should grant access for SELLER role", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ role: "SELLER", authenticated: true }),
    });

    const { result } = renderHook(() => useSellerGuard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hasAccess).toBe(true);
    expect(result.current.role).toBe("SELLER");
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it("should grant access for ADMIN role", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ role: "ADMIN", authenticated: true }),
    });

    const { result } = renderHook(() => useSellerGuard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hasAccess).toBe(true);
    expect(result.current.role).toBe("ADMIN");
  });

  it("should deny access and redirect for BUYER role", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ role: "BUYER", authenticated: true }),
    });

    const { result } = renderHook(() => useSellerGuard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hasAccess).toBe(false);
    expect(result.current.role).toBe("BUYER");
    expect(mockRouter.replace).toHaveBeenCalledWith("/?error=unauthorized");
  });

  it("should redirect on expired session", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ expired: true }),
    });

    const { result } = renderHook(() => useSellerGuard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockRouter.replace).toHaveBeenCalledWith(
      "/login?redirect=/seller"
    );
  });

  it("should redirect when not authenticated", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ authenticated: false }),
    });

    const { result } = renderHook(() => useSellerGuard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockRouter.replace).toHaveBeenCalledWith(
      "/login?redirect=/seller"
    );
  });

  it("should redirect on fetch error", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useSellerGuard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockRouter.replace).toHaveBeenCalledWith("/login");
  });

  it("should redirect on non-ok response", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: "Server error" }),
    });

    const { result } = renderHook(() => useSellerGuard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockRouter.replace).toHaveBeenCalledWith("/login");
  });

  it("should call fetch with /api/auth/get-role", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ role: "SELLER", authenticated: true }),
    });

    renderHook(() => useSellerGuard());

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/auth/get-role");
    });
  });
});
