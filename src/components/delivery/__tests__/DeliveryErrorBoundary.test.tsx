import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DeliveryErrorBoundary from "../DeliveryErrorBoundary";

// Suppress console.error for intentional throws
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalError;
});

function ThrowingChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Tracking data failed");
  }
  return <div>Delivery content</div>;
}

describe("DeliveryErrorBoundary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render children when no error occurs", () => {
    render(
      <DeliveryErrorBoundary>
        <div>Child content</div>
      </DeliveryErrorBoundary>
    );
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("should render default fallback when child throws", () => {
    render(
      <DeliveryErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </DeliveryErrorBoundary>
    );
    expect(screen.getByText("Delivery tracking unavailable")).toBeInTheDocument();
    expect(screen.getByText("Tracking data failed")).toBeInTheDocument();
  });

  it("should show Try again button in default fallback", () => {
    render(
      <DeliveryErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </DeliveryErrorBoundary>
    );
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("should render custom fallback when provided", () => {
    render(
      <DeliveryErrorBoundary fallback={<div>Custom error UI</div>}>
        <ThrowingChild shouldThrow={true} />
      </DeliveryErrorBoundary>
    );
    expect(screen.getByText("Custom error UI")).toBeInTheDocument();
    expect(screen.queryByText("Delivery tracking unavailable")).not.toBeInTheDocument();
  });

  it("should call onReset when Try again is clicked", () => {
    const onReset = jest.fn();
    render(
      <DeliveryErrorBoundary onReset={onReset}>
        <ThrowingChild shouldThrow={true} />
      </DeliveryErrorBoundary>
    );
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("should recover after Try again is clicked with non-throwing children", () => {
    // First render: child throws and error boundary catches
    const { rerender } = render(
      <DeliveryErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </DeliveryErrorBoundary>
    );
    expect(screen.getByText("Delivery tracking unavailable")).toBeInTheDocument();

    // Rerender with non-throwing child, then click Try again to reset error state
    rerender(
      <DeliveryErrorBoundary>
        <ThrowingChild shouldThrow={false} />
      </DeliveryErrorBoundary>
    );
    // Still showing error since state hasn't been reset
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    // After reset + rerender with non-throwing child, should show content
    rerender(
      <DeliveryErrorBoundary>
        <ThrowingChild shouldThrow={false} />
      </DeliveryErrorBoundary>
    );
    expect(screen.getByText("Delivery content")).toBeInTheDocument();
  });

  it("should log error with componentDidCatch", () => {
    render(
      <DeliveryErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </DeliveryErrorBoundary>
    );
    expect(console.error).toHaveBeenCalled();
  });

  it("should show generic message when error has no message", () => {
    function ThrowEmpty() {
      throw new Error("");
    }
    render(
      <DeliveryErrorBoundary>
        <ThrowEmpty />
      </DeliveryErrorBoundary>
    );
    expect(screen.getByText("Delivery tracking unavailable")).toBeInTheDocument();
  });

  it("should display AlertTriangle icon in error state", () => {
    render(
      <DeliveryErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </DeliveryErrorBoundary>
    );
    // The AlertTriangle is an SVG rendered by lucide-react
    const card = screen.getByText("Delivery tracking unavailable").closest(".flex");
    expect(card).toBeInTheDocument();
    expect(card?.querySelector("svg")).toBeInTheDocument();
  });

  it("should not show error UI when children render successfully", () => {
    render(
      <DeliveryErrorBoundary>
        <ThrowingChild shouldThrow={false} />
      </DeliveryErrorBoundary>
    );
    expect(screen.queryByText("Delivery tracking unavailable")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /try again/i })).not.toBeInTheDocument();
  });
});
