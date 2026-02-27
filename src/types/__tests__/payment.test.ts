/**
 * Payment Types & Zod Schema Tests (PAY-001)
 *
 * Validates payment type definitions, Zod runtime schemas,
 * and helper functions from src/types/payment.ts
 */

import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_DESCRIPTIONS,
  PAYMENT_STATUSES,
  INITIAL_PAYMENT_STATE,
  paymentMethodSchema,
  paymentStatusSchema,
  paymentCreateResponseSchema,
  paymentStatusResponseSchema,
  orderPaymentDetailsSchema,
  isRedirectMethod,
  isCardMethod,
  isCodMethod,
} from "@/types/payment";

describe("Payment Types", () => {
  describe("PAYMENT_METHODS", () => {
    it("should include all five supported methods", () => {
      expect(PAYMENT_METHODS).toEqual([
        "cod",
        "gcash",
        "grab_pay",
        "card",
        "paymaya",
      ]);
    });

    it("should have labels for every method", () => {
      for (const method of PAYMENT_METHODS) {
        expect(PAYMENT_METHOD_LABELS[method]).toBeDefined();
        expect(typeof PAYMENT_METHOD_LABELS[method]).toBe("string");
      }
    });

    it("should have descriptions for every method", () => {
      for (const method of PAYMENT_METHODS) {
        expect(PAYMENT_METHOD_DESCRIPTIONS[method]).toBeDefined();
        expect(typeof PAYMENT_METHOD_DESCRIPTIONS[method]).toBe("string");
      }
    });
  });

  describe("PAYMENT_STATUSES", () => {
    it("should include all expected status values", () => {
      expect(PAYMENT_STATUSES).toContain("idle");
      expect(PAYMENT_STATUSES).toContain("pending");
      expect(PAYMENT_STATUSES).toContain("succeeded");
      expect(PAYMENT_STATUSES).toContain("failed");
      expect(PAYMENT_STATUSES).toContain("cancelled");
      expect(PAYMENT_STATUSES).toContain("processing");
      expect(PAYMENT_STATUSES).toContain("awaiting_redirect");
      expect(PAYMENT_STATUSES).toContain("expired");
    });
  });

  describe("INITIAL_PAYMENT_STATE", () => {
    it("should default to cod method with idle status", () => {
      expect(INITIAL_PAYMENT_STATE.selectedMethod).toBe("cod");
      expect(INITIAL_PAYMENT_STATE.paymentStatus).toBe("idle");
      expect(INITIAL_PAYMENT_STATE.paymentId).toBeNull();
      expect(INITIAL_PAYMENT_STATE.checkoutUrl).toBeNull();
      expect(INITIAL_PAYMENT_STATE.error).toBeNull();
      expect(INITIAL_PAYMENT_STATE.isProcessing).toBe(false);
    });
  });
});

describe("Payment Helper Functions", () => {
  describe("isRedirectMethod", () => {
    it("should return true for gcash", () => {
      expect(isRedirectMethod("gcash")).toBe(true);
    });

    it("should return true for grab_pay", () => {
      expect(isRedirectMethod("grab_pay")).toBe(true);
    });

    it("should return true for paymaya", () => {
      expect(isRedirectMethod("paymaya")).toBe(true);
    });

    it("should return false for card", () => {
      expect(isRedirectMethod("card")).toBe(false);
    });

    it("should return false for cod", () => {
      expect(isRedirectMethod("cod")).toBe(false);
    });
  });

  describe("isCardMethod", () => {
    it("should return true for card", () => {
      expect(isCardMethod("card")).toBe(true);
    });

    it("should return false for gcash", () => {
      expect(isCardMethod("gcash")).toBe(false);
    });

    it("should return false for cod", () => {
      expect(isCardMethod("cod")).toBe(false);
    });
  });

  describe("isCodMethod", () => {
    it("should return true for cod", () => {
      expect(isCodMethod("cod")).toBe(true);
    });

    it("should return false for gcash", () => {
      expect(isCodMethod("gcash")).toBe(false);
    });

    it("should return false for card", () => {
      expect(isCodMethod("card")).toBe(false);
    });
  });
});

describe("Zod Schemas", () => {
  describe("paymentMethodSchema", () => {
    it("should accept valid payment methods", () => {
      expect(paymentMethodSchema.parse("cod")).toBe("cod");
      expect(paymentMethodSchema.parse("gcash")).toBe("gcash");
      expect(paymentMethodSchema.parse("grab_pay")).toBe("grab_pay");
      expect(paymentMethodSchema.parse("card")).toBe("card");
      expect(paymentMethodSchema.parse("paymaya")).toBe("paymaya");
    });

    it("should reject invalid payment methods", () => {
      expect(() => paymentMethodSchema.parse("bitcoin")).toThrow();
      expect(() => paymentMethodSchema.parse("")).toThrow();
      expect(() => paymentMethodSchema.parse(123)).toThrow();
    });
  });

  describe("paymentStatusSchema", () => {
    it("should accept valid statuses", () => {
      expect(paymentStatusSchema.parse("idle")).toBe("idle");
      expect(paymentStatusSchema.parse("succeeded")).toBe("succeeded");
      expect(paymentStatusSchema.parse("failed")).toBe("failed");
    });

    it("should reject invalid statuses", () => {
      expect(() => paymentStatusSchema.parse("unknown")).toThrow();
    });
  });

  describe("paymentCreateResponseSchema", () => {
    it("should validate a successful payment creation response", () => {
      const valid = {
        success: true,
        paymentId: "pi_123",
        checkoutUrl: "https://payments.paymongo.com/checkout/123",
        status: "pending" as const,
      };
      expect(paymentCreateResponseSchema.parse(valid)).toEqual(valid);
    });

    it("should validate a minimal success response", () => {
      const minimal = { success: true };
      expect(paymentCreateResponseSchema.parse(minimal)).toEqual(minimal);
    });

    it("should validate an error response", () => {
      const error = { success: false, error: "Insufficient funds" };
      expect(paymentCreateResponseSchema.parse(error)).toEqual(error);
    });

    it("should reject missing success field", () => {
      expect(() =>
        paymentCreateResponseSchema.parse({ paymentId: "pi_123" })
      ).toThrow();
    });
  });

  describe("paymentStatusResponseSchema", () => {
    it("should validate a valid status response", () => {
      const valid = {
        success: true,
        status: "succeeded" as const,
        paymentId: "pi_123",
        paidAt: "2026-02-27T00:00:00.000Z",
      };
      expect(paymentStatusResponseSchema.parse(valid)).toEqual(valid);
    });

    it("should reject missing required fields", () => {
      expect(() =>
        paymentStatusResponseSchema.parse({ success: true })
      ).toThrow();
    });
  });

  describe("orderPaymentDetailsSchema", () => {
    it("should validate complete order payment details", () => {
      const valid = {
        paymentId: "pi_123",
        paymentMethod: "gcash" as const,
        status: "succeeded" as const,
        amount: 15000,
        currency: "PHP",
        paidAt: "2026-02-27T00:00:00.000Z",
        sourceId: "src_123",
      };
      expect(orderPaymentDetailsSchema.parse(valid)).toEqual(valid);
    });

    it("should reject non-positive amount", () => {
      expect(() =>
        orderPaymentDetailsSchema.parse({
          paymentId: "pi_123",
          paymentMethod: "gcash",
          status: "succeeded",
          amount: 0,
          currency: "PHP",
        })
      ).toThrow();
    });

    it("should reject invalid payment method in order details", () => {
      expect(() =>
        orderPaymentDetailsSchema.parse({
          paymentId: "pi_123",
          paymentMethod: "bitcoin",
          status: "succeeded",
          amount: 100,
          currency: "PHP",
        })
      ).toThrow();
    });
  });
});
