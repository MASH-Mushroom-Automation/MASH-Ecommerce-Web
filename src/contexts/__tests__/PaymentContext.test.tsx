/**
 * PaymentContext Tests (PAY-001)
 *
 * Tests the PaymentContext reducer, provider, and usePayment hook.
 */

import React from "react";
import { render, screen, act } from "@testing-library/react";
import { PaymentProvider, usePayment, paymentReducer } from "@/contexts/PaymentContext";
import { INITIAL_PAYMENT_STATE } from "@/types/payment";
import type { PaymentState, PaymentAction } from "@/types/payment";

// ---------------------------------------------------------------------------
// Reducer Unit Tests
// ---------------------------------------------------------------------------

describe("paymentReducer", () => {
  it("should return initial state for unknown action", () => {
    const state = paymentReducer(INITIAL_PAYMENT_STATE, {
      type: "UNKNOWN" as PaymentAction["type"],
    } as PaymentAction);
    expect(state).toEqual(INITIAL_PAYMENT_STATE);
  });

  describe("SELECT_METHOD", () => {
    it("should update selectedMethod and reset error/status", () => {
      const prevState: PaymentState = {
        ...INITIAL_PAYMENT_STATE,
        error: "old error",
        paymentStatus: "failed",
        paymentId: "old_id",
        checkoutUrl: "https://old.url",
        isProcessing: true,
      };
      const state = paymentReducer(prevState, {
        type: "SELECT_METHOD",
        method: "gcash",
      });
      expect(state.selectedMethod).toBe("gcash");
      expect(state.error).toBeNull();
      expect(state.paymentStatus).toBe("idle");
      expect(state.paymentId).toBeNull();
      expect(state.checkoutUrl).toBeNull();
      expect(state.isProcessing).toBe(false);
    });
  });

  describe("START_PAYMENT", () => {
    it("should set isProcessing and pending status", () => {
      const state = paymentReducer(INITIAL_PAYMENT_STATE, {
        type: "START_PAYMENT",
      });
      expect(state.isProcessing).toBe(true);
      expect(state.paymentStatus).toBe("pending");
      expect(state.error).toBeNull();
    });
  });

  describe("PAYMENT_CREATED", () => {
    it("should store paymentId and checkoutUrl with awaiting_redirect status", () => {
      const state = paymentReducer(INITIAL_PAYMENT_STATE, {
        type: "PAYMENT_CREATED",
        paymentId: "pi_123",
        checkoutUrl: "https://checkout.paymongo.com/123",
      });
      expect(state.paymentId).toBe("pi_123");
      expect(state.checkoutUrl).toBe("https://checkout.paymongo.com/123");
      expect(state.paymentStatus).toBe("awaiting_redirect");
    });

    it("should set processing status when no checkout URL", () => {
      const state = paymentReducer(INITIAL_PAYMENT_STATE, {
        type: "PAYMENT_CREATED",
        paymentId: "pi_456",
        checkoutUrl: null,
      });
      expect(state.paymentId).toBe("pi_456");
      expect(state.checkoutUrl).toBeNull();
      expect(state.paymentStatus).toBe("processing");
    });
  });

  describe("PAYMENT_PROCESSING", () => {
    it("should set status to processing", () => {
      const state = paymentReducer(INITIAL_PAYMENT_STATE, {
        type: "PAYMENT_PROCESSING",
      });
      expect(state.paymentStatus).toBe("processing");
    });
  });

  describe("PAYMENT_SUCCEEDED", () => {
    it("should mark payment as succeeded and stop processing", () => {
      const prevState: PaymentState = {
        ...INITIAL_PAYMENT_STATE,
        isProcessing: true,
        paymentStatus: "processing",
      };
      const state = paymentReducer(prevState, {
        type: "PAYMENT_SUCCEEDED",
        paymentId: "pi_789",
      });
      expect(state.paymentStatus).toBe("succeeded");
      expect(state.paymentId).toBe("pi_789");
      expect(state.isProcessing).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe("PAYMENT_FAILED", () => {
    it("should mark payment as failed with error message", () => {
      const prevState: PaymentState = {
        ...INITIAL_PAYMENT_STATE,
        isProcessing: true,
        paymentStatus: "processing",
      };
      const state = paymentReducer(prevState, {
        type: "PAYMENT_FAILED",
        error: "Card declined",
      });
      expect(state.paymentStatus).toBe("failed");
      expect(state.error).toBe("Card declined");
      expect(state.isProcessing).toBe(false);
    });
  });

  describe("PAYMENT_CANCELLED", () => {
    it("should mark payment as cancelled and stop processing", () => {
      const prevState: PaymentState = {
        ...INITIAL_PAYMENT_STATE,
        isProcessing: true,
      };
      const state = paymentReducer(prevState, {
        type: "PAYMENT_CANCELLED",
      });
      expect(state.paymentStatus).toBe("cancelled");
      expect(state.isProcessing).toBe(false);
    });
  });

  describe("RESET", () => {
    it("should reset to initial state", () => {
      const prevState: PaymentState = {
        selectedMethod: "gcash",
        paymentStatus: "succeeded",
        paymentId: "pi_123",
        checkoutUrl: "https://url.com",
        error: null,
        isProcessing: false,
      };
      const state = paymentReducer(prevState, { type: "RESET" });
      expect(state).toEqual(INITIAL_PAYMENT_STATE);
    });
  });
});

// ---------------------------------------------------------------------------
// Provider & Hook Integration Tests
// ---------------------------------------------------------------------------

/** Test component that exposes context values via data-testid attributes */
function TestConsumer() {
  const {
    state,
    selectMethod,
    startPayment,
    paymentCreated,
    paymentSucceeded,
    paymentFailed,
    paymentCancelled,
    reset,
  } = usePayment();

  return (
    <div>
      <span data-testid="method">{state.selectedMethod}</span>
      <span data-testid="status">{state.paymentStatus}</span>
      <span data-testid="paymentId">{state.paymentId || "none"}</span>
      <span data-testid="error">{state.error || "none"}</span>
      <span data-testid="isProcessing">
        {state.isProcessing ? "true" : "false"}
      </span>
      <button onClick={() => selectMethod("gcash")}>select-gcash</button>
      <button onClick={startPayment}>start-payment</button>
      <button onClick={() => paymentCreated("pi_1", "https://checkout.url")}>
        payment-created
      </button>
      <button onClick={() => paymentSucceeded("pi_1")}>
        payment-succeeded
      </button>
      <button onClick={() => paymentFailed("Network error")}>
        payment-failed
      </button>
      <button onClick={paymentCancelled}>payment-cancelled</button>
      <button onClick={reset}>reset</button>
    </div>
  );
}

describe("PaymentProvider + usePayment", () => {
  it("should provide initial state", () => {
    render(
      <PaymentProvider>
        <TestConsumer />
      </PaymentProvider>
    );
    expect(screen.getByTestId("method")).toHaveTextContent("cod");
    expect(screen.getByTestId("status")).toHaveTextContent("idle");
    expect(screen.getByTestId("isProcessing")).toHaveTextContent("false");
  });

  it("should update method when selectMethod is called", () => {
    render(
      <PaymentProvider>
        <TestConsumer />
      </PaymentProvider>
    );
    act(() => {
      screen.getByText("select-gcash").click();
    });
    expect(screen.getByTestId("method")).toHaveTextContent("gcash");
  });

  it("should flow through full payment lifecycle", () => {
    render(
      <PaymentProvider>
        <TestConsumer />
      </PaymentProvider>
    );

    // Start payment
    act(() => {
      screen.getByText("start-payment").click();
    });
    expect(screen.getByTestId("status")).toHaveTextContent("pending");
    expect(screen.getByTestId("isProcessing")).toHaveTextContent("true");

    // Payment created with redirect URL
    act(() => {
      screen.getByText("payment-created").click();
    });
    expect(screen.getByTestId("status")).toHaveTextContent("awaiting_redirect");
    expect(screen.getByTestId("paymentId")).toHaveTextContent("pi_1");

    // Payment succeeded
    act(() => {
      screen.getByText("payment-succeeded").click();
    });
    expect(screen.getByTestId("status")).toHaveTextContent("succeeded");
    expect(screen.getByTestId("isProcessing")).toHaveTextContent("false");
  });

  it("should handle failed payment flow", () => {
    render(
      <PaymentProvider>
        <TestConsumer />
      </PaymentProvider>
    );

    act(() => {
      screen.getByText("start-payment").click();
    });
    act(() => {
      screen.getByText("payment-failed").click();
    });
    expect(screen.getByTestId("status")).toHaveTextContent("failed");
    expect(screen.getByTestId("error")).toHaveTextContent("Network error");
    expect(screen.getByTestId("isProcessing")).toHaveTextContent("false");
  });

  it("should handle cancelled payment flow", () => {
    render(
      <PaymentProvider>
        <TestConsumer />
      </PaymentProvider>
    );

    act(() => {
      screen.getByText("start-payment").click();
    });
    act(() => {
      screen.getByText("payment-cancelled").click();
    });
    expect(screen.getByTestId("status")).toHaveTextContent("cancelled");
    expect(screen.getByTestId("isProcessing")).toHaveTextContent("false");
  });

  it("should reset to initial state", () => {
    render(
      <PaymentProvider>
        <TestConsumer />
      </PaymentProvider>
    );

    // Make some changes first
    act(() => {
      screen.getByText("select-gcash").click();
    });
    act(() => {
      screen.getByText("start-payment").click();
    });

    // Reset
    act(() => {
      screen.getByText("reset").click();
    });
    expect(screen.getByTestId("method")).toHaveTextContent("cod");
    expect(screen.getByTestId("status")).toHaveTextContent("idle");
    expect(screen.getByTestId("isProcessing")).toHaveTextContent("false");
  });

  it("should throw when usePayment is used outside PaymentProvider", () => {
    // Suppress console.error for expected error
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => render(<TestConsumer />)).toThrow(
      "usePayment must be used within a PaymentProvider"
    );

    consoleSpy.mockRestore();
  });
});
