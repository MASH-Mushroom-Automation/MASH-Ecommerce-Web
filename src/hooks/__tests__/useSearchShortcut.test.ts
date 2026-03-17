/**
 * Tests for src/hooks/useSearchShortcut.ts
 * Covers: initial state, openSearch, closeSearch, toggleSearch,
 * Ctrl+K and Meta+K keyboard shortcuts, preventDefault behavior
 */

import { renderHook, act } from "@testing-library/react";
import { useSearchShortcut } from "../useSearchShortcut";

describe("useSearchShortcut", () => {
  describe("initial state", () => {
    it("starts with isOpen = false", () => {
      const { result } = renderHook(() => useSearchShortcut());
      expect(result.current.isOpen).toBe(false);
    });

    it("returns all control functions", () => {
      const { result } = renderHook(() => useSearchShortcut());
      expect(typeof result.current.openSearch).toBe("function");
      expect(typeof result.current.closeSearch).toBe("function");
      expect(typeof result.current.toggleSearch).toBe("function");
      expect(typeof result.current.setIsOpen).toBe("function");
    });
  });

  describe("openSearch", () => {
    it("sets isOpen to true", () => {
      const { result } = renderHook(() => useSearchShortcut());

      act(() => {
        result.current.openSearch();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it("is idempotent - calling when already open stays open", () => {
      const { result } = renderHook(() => useSearchShortcut());

      act(() => { result.current.openSearch(); });
      act(() => { result.current.openSearch(); });

      expect(result.current.isOpen).toBe(true);
    });
  });

  describe("closeSearch", () => {
    it("sets isOpen to false", () => {
      const { result } = renderHook(() => useSearchShortcut());

      act(() => { result.current.openSearch(); });
      act(() => { result.current.closeSearch(); });

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe("toggleSearch", () => {
    it("toggles from false to true", () => {
      const { result } = renderHook(() => useSearchShortcut());

      act(() => { result.current.toggleSearch(); });

      expect(result.current.isOpen).toBe(true);
    });

    it("toggles from true to false", () => {
      const { result } = renderHook(() => useSearchShortcut());

      act(() => { result.current.openSearch(); });
      act(() => { result.current.toggleSearch(); });

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe("setIsOpen", () => {
    it("directly sets the open state", () => {
      const { result } = renderHook(() => useSearchShortcut());

      act(() => { result.current.setIsOpen(true); });
      expect(result.current.isOpen).toBe(true);

      act(() => { result.current.setIsOpen(false); });
      expect(result.current.isOpen).toBe(false);
    });
  });

  describe("keyboard shortcuts", () => {
    it("toggles on Ctrl+K", () => {
      const { result } = renderHook(() => useSearchShortcut());

      act(() => {
        const event = new KeyboardEvent("keydown", {
          key: "k",
          ctrlKey: true,
          bubbles: true,
        });
        window.dispatchEvent(event);
      });

      expect(result.current.isOpen).toBe(true);
    });

    it("toggles on Meta+K (Mac Cmd+K)", () => {
      const { result } = renderHook(() => useSearchShortcut());

      act(() => {
        const event = new KeyboardEvent("keydown", {
          key: "k",
          metaKey: true,
          bubbles: true,
        });
        window.dispatchEvent(event);
      });

      expect(result.current.isOpen).toBe(true);
    });

    it("toggles back to false on second Ctrl+K", () => {
      const { result } = renderHook(() => useSearchShortcut());

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", {
          key: "k", ctrlKey: true, bubbles: true,
        }));
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", {
          key: "k", ctrlKey: true, bubbles: true,
        }));
      });
      expect(result.current.isOpen).toBe(false);
    });

    it("does not toggle on plain K key without modifier", () => {
      const { result } = renderHook(() => useSearchShortcut());

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", {
          key: "k", bubbles: true,
        }));
      });

      expect(result.current.isOpen).toBe(false);
    });

    it("does not toggle on Ctrl+other key", () => {
      const { result } = renderHook(() => useSearchShortcut());

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", {
          key: "a", ctrlKey: true, bubbles: true,
        }));
      });

      expect(result.current.isOpen).toBe(false);
    });

    it("calls preventDefault on Ctrl+K", () => {
      renderHook(() => useSearchShortcut());

      const event = new KeyboardEvent("keydown", {
        key: "k",
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      const preventSpy = jest.spyOn(event, "preventDefault");

      act(() => {
        window.dispatchEvent(event);
      });

      expect(preventSpy).toHaveBeenCalled();
    });

    it("cleans up event listener on unmount", () => {
      const removeSpy = jest.spyOn(window, "removeEventListener");

      const { unmount } = renderHook(() => useSearchShortcut());
      unmount();

      expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
      removeSpy.mockRestore();
    });
  });
});
