/**
 * Checkout Schemas Tests (PAY-001)
 *
 * Validates that checkout-schemas.ts step3Schema accepts all payment methods.
 */

import { step3Schema } from "@/components/checkout/checkout-schemas";

describe("step3Schema", () => {
  it("should accept cod payment method", () => {
    expect(step3Schema.parse({ paymentMethod: "cod" })).toEqual({
      paymentMethod: "cod",
    });
  });

  it("should accept gcash payment method", () => {
    expect(step3Schema.parse({ paymentMethod: "gcash" })).toEqual({
      paymentMethod: "gcash",
    });
  });

  it("should accept grab_pay payment method", () => {
    expect(step3Schema.parse({ paymentMethod: "grab_pay" })).toEqual({
      paymentMethod: "grab_pay",
    });
  });

  it("should accept card payment method", () => {
    expect(step3Schema.parse({ paymentMethod: "card" })).toEqual({
      paymentMethod: "card",
    });
  });

  it("should accept paymaya payment method", () => {
    expect(step3Schema.parse({ paymentMethod: "paymaya" })).toEqual({
      paymentMethod: "paymaya",
    });
  });

  it("should reject invalid payment method", () => {
    expect(() =>
      step3Schema.parse({ paymentMethod: "bitcoin" })
    ).toThrow();
  });

  it("should reject empty payment method", () => {
    expect(() => step3Schema.parse({ paymentMethod: "" })).toThrow();
  });

  it("should reject missing payment method", () => {
    expect(() => step3Schema.parse({})).toThrow();
  });
});
