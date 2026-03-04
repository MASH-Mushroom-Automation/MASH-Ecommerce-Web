"use client";

// Mock subscription manager to avoid importing ESM-only `next-sanity` during tests
jest.mock("@/lib/sanity/realtime", () => ({
  subscriptionManager: {
    getActiveCount: jest.fn(() => 0),
    unsubscribeAll: jest.fn(),
  },
}));

import React from "react";
import { render, screen, act } from "@testing-library/react";
import RealtimeModeProvider, { useRealtimeMode } from "../RealtimeModeContext";

function TestConsumer() {
  const ctx = useRealtimeMode();
  return (
    <div>
      <span data-testid="enabled">{String(ctx.isRealtimeEnabled)}</span>
      <span data-testid="subs">{ctx.activeSubscriptions}</span>
      <span data-testid="sync">{ctx.lastSyncTime?.toISOString() ?? 'null'}</span>
      <button onClick={ctx.toggleRealtimeMode}>toggle</button>
      <button onClick={ctx.enableRealtime}>enable</button>
      <button onClick={ctx.disableRealtime}>disable</button>
      <button onClick={ctx.updateLastSyncTime}>sync</button>
    </div>
  );
}

describe("RealtimeModeProvider", () => {
  let setIntervalSpy: jest.SpyInstance;

  beforeEach(() => {
    setIntervalSpy = jest.spyOn(globalThis, "setInterval");
  });

  afterEach(() => {
    setIntervalSpy.mockRestore();
    delete (globalThis as any).__ENABLE_REALTIME_IN_TESTS;
  });

  test("does not start interval in test environment by default", () => {
    // Ensure the test env flag is unset
    delete (globalThis as any).__ENABLE_REALTIME_IN_TESTS;

    render(
      <RealtimeModeProvider>
        <div>child</div>
      </RealtimeModeProvider>
    );

    expect(setIntervalSpy).not.toHaveBeenCalled();
  });

  test("starts interval when __ENABLE_REALTIME_IN_TESTS is true", () => {
    (globalThis as any).__ENABLE_REALTIME_IN_TESTS = true;

    render(
      <RealtimeModeProvider>
        <div>child</div>
      </RealtimeModeProvider>
    );

    expect(setIntervalSpy).toHaveBeenCalled();
  });

  test("provides default disabled state", () => {
    render(
      <RealtimeModeProvider>
        <TestConsumer />
      </RealtimeModeProvider>
    );
    expect(screen.getByTestId("enabled")).toHaveTextContent("false");
    expect(screen.getByTestId("subs")).toHaveTextContent("0");
  });

  test("accepts defaultEnabled=true", () => {
    render(
      <RealtimeModeProvider defaultEnabled>
        <TestConsumer />
      </RealtimeModeProvider>
    );
    expect(screen.getByTestId("enabled")).toHaveTextContent("true");
  });

  test("toggleRealtimeMode toggles the state", () => {
    render(
      <RealtimeModeProvider>
        <TestConsumer />
      </RealtimeModeProvider>
    );
    expect(screen.getByTestId("enabled")).toHaveTextContent("false");
    act(() => { screen.getByText("toggle").click(); });
    expect(screen.getByTestId("enabled")).toHaveTextContent("true");
    act(() => { screen.getByText("toggle").click(); });
    expect(screen.getByTestId("enabled")).toHaveTextContent("false");
  });

  test("enableRealtime enables the mode", () => {
    render(
      <RealtimeModeProvider>
        <TestConsumer />
      </RealtimeModeProvider>
    );
    act(() => { screen.getByText("enable").click(); });
    expect(screen.getByTestId("enabled")).toHaveTextContent("true");
  });

  test("disableRealtime disables the mode", () => {
    render(
      <RealtimeModeProvider defaultEnabled>
        <TestConsumer />
      </RealtimeModeProvider>
    );
    act(() => { screen.getByText("disable").click(); });
    expect(screen.getByTestId("enabled")).toHaveTextContent("false");
  });

  test("updateLastSyncTime updates the sync time", () => {
    render(
      <RealtimeModeProvider>
        <TestConsumer />
      </RealtimeModeProvider>
    );
    expect(screen.getByTestId("sync")).toHaveTextContent("null");
    act(() => { screen.getByText("sync").click(); });
    expect(screen.getByTestId("sync")).not.toHaveTextContent("null");
  });
});

describe("useRealtimeMode outside provider", () => {
  test("returns default values when used outside provider", () => {
    render(<TestConsumer />);
    expect(screen.getByTestId("enabled")).toHaveTextContent("false");
    expect(screen.getByTestId("subs")).toHaveTextContent("0");
    expect(screen.getByTestId("sync")).toHaveTextContent("null");
  });

  test("does not throw when calling functions outside provider", () => {
    render(<TestConsumer />);
    expect(() => {
      act(() => { screen.getByText("toggle").click(); });
      act(() => { screen.getByText("enable").click(); });
      act(() => { screen.getByText("disable").click(); });
      act(() => { screen.getByText("sync").click(); });
    }).not.toThrow();
  });
});
