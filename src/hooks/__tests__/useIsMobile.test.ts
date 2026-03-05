/**
 * Tests for src/hooks/use-mobile.ts
 * Covers: useIsMobile hook with matchMedia, resize events, breakpoint behavior
 */

import { renderHook, act } from "@testing-library/react";
import { useIsMobile } from "../use-mobile";

// Store matchMedia listeners for triggering
let matchMediaListeners: Map<string, (() => void)[]>;
let mockMatches: boolean;

beforeEach(() => {
  matchMediaListeners = new Map();
  mockMatches = false;

  // Mock window.matchMedia
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: mockMatches,
      media: query,
      addEventListener: jest.fn((event: string, handler: () => void) => {
        const key = `${query}-${event}`;
        if (!matchMediaListeners.has(key)) {
          matchMediaListeners.set(key, []);
        }
        matchMediaListeners.get(key)!.push(handler);
      }),
      removeEventListener: jest.fn(),
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      onchange: null,
      dispatchEvent: jest.fn(),
    })),
  });
});

function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    value: width,
  });
}

describe("useIsMobile", () => {
  it("returns false for desktop viewport (>= 768px)", () => {
    setViewportWidth(1024);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("returns true for mobile viewport (< 768px)", () => {
    setViewportWidth(375);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("returns false at exactly 768px (breakpoint boundary)", () => {
    setViewportWidth(768);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("returns true at 767px (just below breakpoint)", () => {
    setViewportWidth(767);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("responds to matchMedia change event", () => {
    setViewportWidth(1024);
    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);

    // Simulate resize to mobile
    act(() => {
      setViewportWidth(375);
      // Trigger any registered change listeners
      matchMediaListeners.forEach((listeners) => {
        listeners.forEach((listener) => listener());
      });
    });

    expect(result.current).toBe(true);
  });

  it("calls matchMedia with correct query", () => {
    setViewportWidth(1024);
    renderHook(() => useIsMobile());

    expect(window.matchMedia).toHaveBeenCalledWith("(max-width: 767px)");
  });

  it("registers and removes event listener", () => {
    setViewportWidth(1024);
    const { unmount } = renderHook(() => useIsMobile());

    // matchMedia should have addEventListener called
    const mqlMock = (window.matchMedia as jest.Mock).mock.results[0].value;
    expect(mqlMock.addEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function)
    );

    unmount();
    expect(mqlMock.removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function)
    );
  });

  it("returns false for large viewports", () => {
    setViewportWidth(1920);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("returns true for small viewports", () => {
    setViewportWidth(320);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });
});
