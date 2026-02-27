"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
} from "react";
import type {
  PaymentState,
  PaymentAction,
  PaymentMethod,
} from "@/types/payment";
import { INITIAL_PAYMENT_STATE } from "@/types/payment";

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function paymentReducer(
  state: PaymentState,
  action: PaymentAction
): PaymentState {
  switch (action.type) {
    case "SELECT_METHOD":
      return {
        ...state,
        selectedMethod: action.method,
        error: null,
        paymentStatus: "idle",
        paymentId: null,
        checkoutUrl: null,
        isProcessing: false,
      };

    case "START_PAYMENT":
      return {
        ...state,
        isProcessing: true,
        error: null,
        paymentStatus: "pending",
      };

    case "PAYMENT_CREATED":
      return {
        ...state,
        paymentId: action.paymentId,
        checkoutUrl: action.checkoutUrl,
        paymentStatus: action.checkoutUrl
          ? "awaiting_redirect"
          : "processing",
      };

    case "PAYMENT_PROCESSING":
      return {
        ...state,
        paymentStatus: "processing",
      };

    case "PAYMENT_SUCCEEDED":
      return {
        ...state,
        paymentId: action.paymentId,
        paymentStatus: "succeeded",
        isProcessing: false,
        error: null,
      };

    case "PAYMENT_FAILED":
      return {
        ...state,
        paymentStatus: "failed",
        error: action.error,
        isProcessing: false,
      };

    case "PAYMENT_CANCELLED":
      return {
        ...state,
        paymentStatus: "cancelled",
        isProcessing: false,
      };

    case "RESET":
      return { ...INITIAL_PAYMENT_STATE };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface PaymentContextType {
  state: PaymentState;
  selectMethod: (method: PaymentMethod) => void;
  startPayment: () => void;
  paymentCreated: (paymentId: string, checkoutUrl: string | null) => void;
  paymentProcessing: () => void;
  paymentSucceeded: (paymentId: string) => void;
  paymentFailed: (error: string) => void;
  paymentCancelled: () => void;
  reset: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(paymentReducer, INITIAL_PAYMENT_STATE);

  const selectMethod = useCallback(
    (method: PaymentMethod) => dispatch({ type: "SELECT_METHOD", method }),
    []
  );

  const startPayment = useCallback(
    () => dispatch({ type: "START_PAYMENT" }),
    []
  );

  const paymentCreated = useCallback(
    (paymentId: string, checkoutUrl: string | null) =>
      dispatch({ type: "PAYMENT_CREATED", paymentId, checkoutUrl }),
    []
  );

  const paymentProcessing = useCallback(
    () => dispatch({ type: "PAYMENT_PROCESSING" }),
    []
  );

  const paymentSucceeded = useCallback(
    (paymentId: string) =>
      dispatch({ type: "PAYMENT_SUCCEEDED", paymentId }),
    []
  );

  const paymentFailed = useCallback(
    (error: string) => dispatch({ type: "PAYMENT_FAILED", error }),
    []
  );

  const paymentCancelled = useCallback(
    () => dispatch({ type: "PAYMENT_CANCELLED" }),
    []
  );

  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  const value = useMemo<PaymentContextType>(
    () => ({
      state,
      selectMethod,
      startPayment,
      paymentCreated,
      paymentProcessing,
      paymentSucceeded,
      paymentFailed,
      paymentCancelled,
      reset,
    }),
    [
      state,
      selectMethod,
      startPayment,
      paymentCreated,
      paymentProcessing,
      paymentSucceeded,
      paymentFailed,
      paymentCancelled,
      reset,
    ]
  );

  return (
    <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePayment(): PaymentContextType {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error("usePayment must be used within a PaymentProvider");
  }
  return context;
}

// Export reducer for testing
export { paymentReducer };
