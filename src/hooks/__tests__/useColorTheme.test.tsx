/**
 * useColorTheme Hook Tests - COVERAGE-018
 *
 * Tests for color theme management hook (cookie + DOM manipulation).
 *
 * Hook source: src/hooks/use-color-theme.ts
 * Dependencies: getThemeCookie, setThemeCookie (@/lib/cookies - global mock),
 *               getThemeByName, themes (@/lib/themes)
 *
 * Mock strategy:
 *   - @/lib/cookies: global mock via global.__mockCookies (jest.setupMocks.js)
 *   - @/lib/themes: jest.mock for getThemeByName/themes
 *   - document.documentElement: jsdom provides this
 */

import { renderHook, act } from "@testing-library/react";

// Access global cookie mocks (set up in jest.setupMocks.js)
const cookieMocks = (global as Record<string, unknown>).__mockCookies as {
  getThemeCookie: jest.Mock;
  setThemeCookie: jest.Mock;
};

const mockGetThemeByName = jest.fn();
const mockThemes = [
  { name: "nature", label: "Nature" },
  { name: "ocean", label: "Ocean" },
];

jest.mock("@/lib/themes", () => ({
  get themes() {
    return mockThemes;
  },
  get getThemeByName() {
    return mockGetThemeByName;
  },
}));

import { useColorTheme } from "../use-color-theme";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const natureTheme = {
  name: "nature",
  label: "Nature",
  cssVars: {
    light: {
      primary: "oklch(0.5 0.1 144)",
      background: "oklch(0.97 0.01 80)",
    },
    dark: {
      primary: "oklch(0.67 0.16 144)",
      background: "oklch(0.27 0.03 150)",
    },
  },
};

// ============================================================================
// Tests
// ============================================================================

describe("useColorTheme", () => {
  const originalSetAttribute = document.documentElement.setAttribute;
  const originalSetProperty =
    document.documentElement.style.setProperty;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to light mode
    document.documentElement.classList.remove("dark");
    // Reset data-theme
    document.documentElement.removeAttribute("data-theme");
    // Clear inline styles
    document.documentElement.style.cssText = "";
  });

  afterAll(() => {
    document.documentElement.setAttribute = originalSetAttribute;
    document.documentElement.style.setProperty = originalSetProperty;
  });

  it("should initialize with default theme", () => {
    cookieMocks.getThemeCookie.mockReturnValue(null);
    mockGetThemeByName.mockReturnValue(undefined);

    const { result } = renderHook(() => useColorTheme());

    expect(result.current.colorTheme).toBe("default");
    expect(result.current.themes).toEqual(mockThemes);
  });

  it("should load saved theme from cookie on mount", () => {
    cookieMocks.getThemeCookie.mockReturnValue("nature");
    mockGetThemeByName.mockReturnValue(natureTheme);

    const { result } = renderHook(() => useColorTheme());

    // useEffect runs and loads saved theme
    expect(cookieMocks.getThemeCookie).toHaveBeenCalled();
    expect(result.current.colorTheme).toBe("nature");
  });

  it("should apply theme CSS variables for light mode", () => {
    cookieMocks.getThemeCookie.mockReturnValue("nature");
    mockGetThemeByName.mockReturnValue(natureTheme);

    // Ensure light mode (no dark class)
    document.documentElement.classList.remove("dark");

    renderHook(() => useColorTheme());

    expect(document.documentElement.getAttribute("data-theme")).toBe(
      "nature"
    );
    // Check that CSS variables were set (light mode vars)
    expect(
      document.documentElement.style.getPropertyValue("--primary")
    ).toBe("oklch(0.5 0.1 144)");
    expect(
      document.documentElement.style.getPropertyValue("--background")
    ).toBe("oklch(0.97 0.01 80)");
  });

  it("should apply dark mode CSS variables when dark class present", () => {
    cookieMocks.getThemeCookie.mockReturnValue("nature");
    mockGetThemeByName.mockReturnValue(natureTheme);

    // Set dark mode
    document.documentElement.classList.add("dark");

    renderHook(() => useColorTheme());

    expect(
      document.documentElement.style.getPropertyValue("--primary")
    ).toBe("oklch(0.67 0.16 144)");
    expect(
      document.documentElement.style.getPropertyValue("--background")
    ).toBe("oklch(0.27 0.03 150)");
  });

  it("should change theme via changeTheme", () => {
    cookieMocks.getThemeCookie.mockReturnValue(null);
    mockGetThemeByName.mockReturnValue(natureTheme);

    const { result } = renderHook(() => useColorTheme());

    act(() => {
      result.current.changeTheme("nature");
    });

    expect(result.current.colorTheme).toBe("nature");
    expect(cookieMocks.setThemeCookie).toHaveBeenCalledWith("nature");
    expect(document.documentElement.getAttribute("data-theme")).toBe(
      "nature"
    );
  });

  it("should handle unknown theme gracefully in changeTheme", () => {
    cookieMocks.getThemeCookie.mockReturnValue(null);
    mockGetThemeByName.mockReturnValue(undefined); // theme not found

    const { result } = renderHook(() => useColorTheme());

    act(() => {
      result.current.changeTheme("nonexistent");
    });

    // State updates but applyTheme early-returns
    expect(result.current.colorTheme).toBe("nonexistent");
    expect(cookieMocks.setThemeCookie).toHaveBeenCalledWith("nonexistent");
  });

  it("should expose themes array", () => {
    cookieMocks.getThemeCookie.mockReturnValue(null);
    mockGetThemeByName.mockReturnValue(undefined);

    const { result } = renderHook(() => useColorTheme());

    expect(result.current.themes).toEqual(mockThemes);
  });
});
