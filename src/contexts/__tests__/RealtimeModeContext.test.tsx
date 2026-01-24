"use client";

// Mock subscription manager to avoid importing ESM-only `next-sanity` during tests
jest.mock("@/lib/sanity/realtime", () => ({
  subscriptionManager: {
    getActiveCount: jest.fn(() => 0),
    unsubscribeAll: jest.fn(),
  },
}));

import React from "react";
import { render } from "@testing-library/react";
import RealtimeModeProvider from "../RealtimeModeContext";

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
});
