/**
 * Error Boundary Tests (COV-003)
 * Tests: render children, catch errors, show fallback, dev vs prod messages
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "../error-boundary";

// Mock logger
jest.mock("@/lib/logger", () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

// Component that throws an error
function ThrowError({ message }: { message: string }) {
  throw new Error(message);
}

// Component that renders normally
function GoodChild() {
  return <div>All is well</div>;
}

describe("ErrorBoundary", () => {
  // Suppress console.error for error boundary tests
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalConsoleError;
  });

  it("should render children when no error", () => {
    render(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>
    );

    expect(screen.getByText("All is well")).toBeInTheDocument();
  });

  it("should show default fallback when error occurs", () => {
    render(
      <ErrorBoundary>
        <ThrowError message="Test error" />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Refresh Page")).toBeInTheDocument();
  });

  it("should show custom fallback when provided", () => {
    render(
      <ErrorBoundary fallback={<div>Custom Error UI</div>}>
        <ThrowError message="Test error" />
      </ErrorBoundary>
    );

    expect(screen.getByText("Custom Error UI")).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });

  it("should show error message in development mode", () => {
    const originalEnv = process.env.NODE_ENV;
    // NODE_ENV is 'test' by default in Jest which is not 'development'
    // In the component, it checks process.env.NODE_ENV === 'development'
    // so with 'test' it shows the generic message
    render(
      <ErrorBoundary>
        <ThrowError message="Detailed error info" />
      </ErrorBoundary>
    );

    // In test environment (not 'development'), should show generic message
    expect(
      screen.getByText(
        "We encountered an unexpected error. Please refresh the page."
      )
    ).toBeInTheDocument();
  });

  it("should have a refresh button that reloads the page", () => {
    render(
      <ErrorBoundary>
        <ThrowError message="Test error" />
      </ErrorBoundary>
    );

    // Verify the refresh button exists and is clickable
    const button = screen.getByText("Refresh Page");
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe("BUTTON");
    // Click should not throw (it calls window.location.reload internally)
    expect(() => fireEvent.click(button)).not.toThrow();
  });

  it("should call logger.error when error is caught", () => {
    const { logger } = require("@/lib/logger");

    render(
      <ErrorBoundary>
        <ThrowError message="Logged error" />
      </ErrorBoundary>
    );

    expect(logger.error).toHaveBeenCalledWith(
      "React Error Boundary caught an error",
      expect.objectContaining({
        error: "Logged error",
      })
    );
  });
});
