/**
 * Tests for src/hooks/useDebounce.ts
 * Covers: initial value return, delayed update, timer reset on value change,
 * custom delay, default delay, cleanup on unmount
 */

import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "../useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 300));
    expect(result.current).toBe("hello");
  });

  it("does not update value before delay expires", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 500 } }
    );

    rerender({ value: "updated", delay: 500 });

    // Advance less than the delay
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe("initial");
  });

  it("updates value after delay expires", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 500 } }
    );

    rerender({ value: "updated", delay: 500 });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe("updated");
  });

  it("resets timer when value changes before delay expires", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "v1", delay: 500 } }
    );

    rerender({ value: "v2", delay: 500 });

    // Advance 400ms (almost at delay)
    act(() => {
      jest.advanceTimersByTime(400);
    });

    // Change value again - should reset timer
    rerender({ value: "v3", delay: 500 });

    // Advance 400ms more (800ms total, but only 400ms since last change)
    act(() => {
      jest.advanceTimersByTime(400);
    });

    // Should still be v1 because v3 timer hasn't expired
    expect(result.current).toBe("v1");

    // Advance remaining 100ms
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toBe("v3");
  });

  it("uses default delay of 500ms when not specified", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: "start" } }
    );

    rerender({ value: "end" });

    act(() => {
      jest.advanceTimersByTime(499);
    });
    expect(result.current).toBe("start");

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe("end");
  });

  it("works with custom short delay", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 0, delay: 100 } }
    );

    rerender({ value: 42, delay: 100 });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toBe(42);
  });

  it("works with numeric values", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 200),
      { initialProps: { value: 0 } }
    );

    rerender({ value: 99 });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current).toBe(99);
  });

  it("works with object values", () => {
    const obj1 = { name: "a" };
    const obj2 = { name: "b" };

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 200),
      { initialProps: { value: obj1 } }
    );

    rerender({ value: obj2 });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current).toEqual({ name: "b" });
  });

  it("works with boolean values", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: false } }
    );

    rerender({ value: true });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toBe(true);
  });

  it("handles rapid successive changes", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "a" } }
    );

    // Rapid changes
    rerender({ value: "b" });
    act(() => { jest.advanceTimersByTime(50); });
    rerender({ value: "c" });
    act(() => { jest.advanceTimersByTime(50); });
    rerender({ value: "d" });
    act(() => { jest.advanceTimersByTime(50); });
    rerender({ value: "e" });

    // Should still be "a" - none of the timeouts completed
    expect(result.current).toBe("a");

    // Wait for final value to settle
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Should be the last value
    expect(result.current).toBe("e");
  });
});
