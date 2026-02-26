/**
 * useAdminGuard Hook Tests - COVERAGE-018
 *
 * Tests for admin role verification guard hook.
 *
 * Hook source: src/hooks/useAdminGuard.ts
 * Dependencies: global.fetch, next/navigation (useRouter), sonner (toast)
 *
 * Mock strategy:
 *   - global.fetch: jest.fn (polyfilled in jest.setupMocks.js)
 *   - useRouter: file-level jest.mock with shared mockRouter object
 *     (overrides both jest.setupMocks.js and jest.setup.js global mocks)
 *   - toast: jest.mock("sonner")
 */

import { renderHook, waitFor } from "@testing-library/react";

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));

const { toast } = jest.requireMock("sonner") as {
  toast: {
    success: jest.Mock;
    error: jest.Mock;
    info: jest.Mock;
    warning: jest.Mock;
  };
};

// CRITICAL: Override the global next/navigation mock with a shared router object.
// jest.setup.js defines useRouter as a plain function that creates a NEW object
// on every call, making it impossible to assert on router.replace() from outside.
// This file-level jest.mock overrides it with a consistent shared reference.
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
  pathname: "/",
  query: {},
  asPath: "/",
};

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => mockRouter),
  usePathname: jest.fn(() => "/"),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({})),
}));

import { useAdminGuard } from "../useAdminGuard";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockFetchResponse(data: Record<string, unknown>, ok = true) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok,
    json: () => Promise.resolve(data),
  });
}

// ============================================================================
// Tests
// ============================================================================

describe("useAdminGuard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should start in loading state", () => {
    // Keep fetch pending so loading stays true
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ role: "ADMIN", authenticated: true }),
    });

    const { result } = renderHook(() => useAdminGuard());

    expect(result.current.loading).toBe(true);
    expect(result.current.isAdmin).toBeNull();
    expect(result.current.role).toBeNull();
  });

  it(
    "should set isAdmin=true for ADMIN role",
    async () => {
      mockFetchResponse({ role: "ADMIN", authenticated: true });

      const { result } = renderHook(() => useAdminGuard());

      await waitFor(
        () => expect(result.current.loading).toBe(false),
        { timeout: 10000 }
      );

      expect(result.current.isAdmin).toBe(true);
      expect(result.current.role).toBe("ADMIN");
      expect(mockRouter.replace).not.toHaveBeenCalled();
    },
    30000
  );

  it(
    "should redirect non-admin users",
    async () => {
      mockFetchResponse({ role: "BUYER", authenticated: true });

      const { result } = renderHook(() => useAdminGuard());

      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
          expect(mockRouter.replace).toHaveBeenCalledWith("/?error=unauthorized");
        },
        { timeout: 10000 }
      );

      expect(result.current.isAdmin).toBe(false);
      expect(result.current.role).toBe("BUYER");
      expect(toast.error).toHaveBeenCalledWith(
        "Access denied. Admin role required for seller pages."
      );
    },
    30000
  );

  it(
    "should redirect on expired token",
    async () => {
      mockFetchResponse({ expired: true });

      const { result } = renderHook(() => useAdminGuard());

      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
          expect(mockRouter.replace).toHaveBeenCalledWith("/login?redirect=/seller");
        },
        { timeout: 10000 }
      );

      expect(toast.error).toHaveBeenCalledWith(
        "Session expired. Please log in again."
      );
    },
    30000
  );

  it(
    "should redirect unauthenticated users",
    async () => {
      mockFetchResponse({ authenticated: false });

      const { result } = renderHook(() => useAdminGuard());

      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
          expect(mockRouter.replace).toHaveBeenCalledWith("/login?redirect=/seller");
        },
        { timeout: 10000 }
      );

      expect(toast.info).toHaveBeenCalledWith(
        "Please log in to access seller pages."
      );
    },
    30000
  );

  it(
    "should handle fetch failure",
    async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useAdminGuard());

      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
          expect(mockRouter.replace).toHaveBeenCalledWith("/login");
        },
        { timeout: 10000 }
      );

      expect(toast.error).toHaveBeenCalledWith(
        "Failed to verify access. Please try logging in again."
      );
    },
    30000
  );

  it(
    "should handle network error",
    async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      const { result } = renderHook(() => useAdminGuard());

      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
          expect(mockRouter.replace).toHaveBeenCalledWith("/login");
        },
        { timeout: 10000 }
      );

      expect(toast.error).toHaveBeenCalledWith(
        "Failed to verify access. Please try logging in again."
      );
    },
    30000
  );
});
