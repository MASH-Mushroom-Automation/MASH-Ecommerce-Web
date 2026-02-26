/**
 * useNavigation Hook Tests - COVERAGE-018
 *
 * Tests for navigation items hook based on auth state and seller status.
 *
 * Hook source: src/hooks/useNavigation.ts
 * Dependencies: useUserProfile (./useUser), isAuthenticated (@/lib/auth)
 *
 * Mock strategy:
 *   - useUserProfile: jest.mock("../useUser")
 *   - isAuthenticated: jest.mock("@/lib/auth")
 *   - Pure logic hook (no API calls), returns computed navItems
 */

import { renderHook } from "@testing-library/react";

// Mock useUserProfile
jest.mock("../useUser", () => ({
  useUserProfile: jest.fn(),
}));

// Mock isAuthenticated
jest.mock("@/lib/auth", () => ({
  isAuthenticated: jest.fn(),
}));

const { useUserProfile } = jest.requireMock("../useUser") as {
  useUserProfile: jest.Mock;
};

const { isAuthenticated } = jest.requireMock("@/lib/auth") as {
  isAuthenticated: jest.Mock;
};

import { useNavigation } from "../useNavigation";

// ============================================================================
// Tests
// ============================================================================

describe("useNavigation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return base items for unauthenticated user", () => {
    isAuthenticated.mockReturnValue(false);
    useUserProfile.mockReturnValue({ profile: null });

    const { result } = renderHook(() => useNavigation());

    expect(result.current.navItems).toEqual([
      { label: "Home", path: "/" },
      { label: "Products", path: "/shop" },
      { label: "Growers", path: "/grower" },
    ]);
    expect(result.current.isLoggedIn).toBeFalsy();
    expect(result.current.isSeller).toBeFalsy();
  });

  it("should return buyer items for authenticated user without seller status", () => {
    isAuthenticated.mockReturnValue(true);
    useUserProfile.mockReturnValue({
      profile: { sellerStatus: undefined },
    });

    const { result } = renderHook(() => useNavigation());

    const labels = result.current.navItems.map(
      (item: { label: string }) => item.label
    );
    expect(labels).toContain("Home");
    expect(labels).toContain("Products");
    expect(labels).toContain("Growers");
    expect(labels).toContain("My Orders");
    expect(labels).toContain("Wishlist");
    expect(result.current.isLoggedIn).toBeTruthy();
    expect(result.current.isSeller).toBeFalsy();
  });

  it("should return seller items for approved seller", () => {
    isAuthenticated.mockReturnValue(true);
    useUserProfile.mockReturnValue({
      profile: { sellerStatus: "approved" },
    });

    const { result } = renderHook(() => useNavigation());

    const labels = result.current.navItems.map(
      (item: { label: string }) => item.label
    );
    expect(labels).toContain("Dashboard");
    expect(labels).toContain("My Products");
    expect(labels).toContain("Orders");
    expect(labels).not.toContain("Wishlist");
    expect(result.current.isSeller).toBe(true);
  });

  it("should return pending seller items", () => {
    isAuthenticated.mockReturnValue(true);
    useUserProfile.mockReturnValue({
      profile: { sellerStatus: "pending" },
    });

    const { result } = renderHook(() => useNavigation());

    const labels = result.current.navItems.map(
      (item: { label: string }) => item.label
    );
    expect(labels).toContain("Application Pending");
    expect(labels).not.toContain("Dashboard");
    expect(labels).not.toContain("My Orders");
    expect(result.current.isSeller).toBeFalsy();
  });

  it("should include base items in all authenticated states", () => {
    isAuthenticated.mockReturnValue(true);
    useUserProfile.mockReturnValue({
      profile: { sellerStatus: "approved" },
    });

    const { result } = renderHook(() => useNavigation());

    const paths = result.current.navItems.map(
      (item: { path: string }) => item.path
    );
    expect(paths).toContain("/");
    expect(paths).toContain("/shop");
    expect(paths).toContain("/grower");
  });

  it("should have correct paths for seller navigation items", () => {
    isAuthenticated.mockReturnValue(true);
    useUserProfile.mockReturnValue({
      profile: { sellerStatus: "approved" },
    });

    const { result } = renderHook(() => useNavigation());

    const dashboardItem = result.current.navItems.find(
      (item: { label: string }) => item.label === "Dashboard"
    );
    expect(dashboardItem?.path).toBe("/seller/dashboard");

    const productsItem = result.current.navItems.find(
      (item: { label: string }) => item.label === "My Products"
    );
    expect(productsItem?.path).toBe("/seller/products");

    const ordersItem = result.current.navItems.find(
      (item: { label: string }) => item.label === "Orders"
    );
    expect(ordersItem?.path).toBe("/seller/orders");
  });
});
