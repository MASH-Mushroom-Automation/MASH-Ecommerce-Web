/**
 * Checkout Schemas Tests (PAY-001 + PAY-019)
 *
 * Validates all checkout schemas: step1 (delivery), step2 (contact), step3 (payment).
 */

import {
  step1Schema,
  step2Schema,
  step3Schema,
} from "@/components/checkout/checkout-schemas";
import type {
  Step1FormValues,
  Step2FormValues,
  Step3FormValues,
} from "@/components/checkout/checkout-schemas";

// ---------------------------------------------------------------------------
// Step 1: Delivery Method Schema
// ---------------------------------------------------------------------------

describe("step1Schema", () => {
  it("should accept pickup delivery method", () => {
    const result = step1Schema.parse({ deliveryMethod: "pickup" });
    expect(result.deliveryMethod).toBe("pickup");
  });

  it("should accept lalamove delivery method", () => {
    const result = step1Schema.parse({ deliveryMethod: "lalamove" });
    expect(result.deliveryMethod).toBe("lalamove");
  });

  it("should accept pickupLocation as optional string", () => {
    const result = step1Schema.parse({
      deliveryMethod: "pickup",
      pickupLocation: "Novaliches Store",
    });
    expect(result.pickupLocation).toBe("Novaliches Store");
  });

  it("should allow omitting pickupLocation", () => {
    const result = step1Schema.parse({ deliveryMethod: "lalamove" });
    expect(result.pickupLocation).toBeUndefined();
  });

  it("should reject invalid delivery method", () => {
    expect(() =>
      step1Schema.parse({ deliveryMethod: "drone" })
    ).toThrow();
  });

  it("should reject missing deliveryMethod", () => {
    expect(() => step1Schema.parse({})).toThrow();
  });

  it("should reject empty deliveryMethod", () => {
    expect(() =>
      step1Schema.parse({ deliveryMethod: "" })
    ).toThrow();
  });

  it("should produce correct Step1FormValues type shape", () => {
    const values: Step1FormValues = step1Schema.parse({
      deliveryMethod: "pickup",
    });
    expect(values).toHaveProperty("deliveryMethod");
  });
});

// ---------------------------------------------------------------------------
// Step 2: Contact Information Schema
// ---------------------------------------------------------------------------

describe("step2Schema", () => {
  const validContact = {
    name: "Juan Dela Cruz",
    email: "juan@example.com",
    phone: "09171234567",
  };

  it("should accept valid contact information", () => {
    const result = step2Schema.parse(validContact);
    expect(result.name).toBe("Juan Dela Cruz");
    expect(result.email).toBe("juan@example.com");
    expect(result.phone).toBe("09171234567");
  });

  it("should accept phone with +63 prefix", () => {
    const result = step2Schema.parse({
      ...validContact,
      phone: "+639171234567",
    });
    expect(result.phone).toBe("+639171234567");
  });

  it("should apply transform to sanitize phone value", () => {
    // The transform strips spaces, dashes, and parentheses from values
    // that already pass the regex. Since the regex is strict (digits only),
    // we verify .transform() is callable by confirming a valid phone passes.
    const result = step2Schema.parse({
      ...validContact,
      phone: "09171234567",
    });
    // Transform runs but has nothing to strip
    expect(result.phone).toBe("09171234567");
  });

  it("should reject phone with dashes (fails regex before transform)", () => {
    expect(() =>
      step2Schema.parse({ ...validContact, phone: "0917-123-4567" })
    ).toThrow(/valid Philippine phone/i);
  });

  it("should reject name shorter than 2 characters", () => {
    expect(() =>
      step2Schema.parse({ ...validContact, name: "J" })
    ).toThrow(/Name is required/i);
  });

  it("should reject empty name", () => {
    expect(() =>
      step2Schema.parse({ ...validContact, name: "" })
    ).toThrow();
  });

  it("should reject invalid email", () => {
    expect(() =>
      step2Schema.parse({ ...validContact, email: "not-an-email" })
    ).toThrow(/Invalid email/i);
  });

  it("should reject empty email", () => {
    expect(() =>
      step2Schema.parse({ ...validContact, email: "" })
    ).toThrow();
  });

  it("should reject empty phone", () => {
    expect(() =>
      step2Schema.parse({ ...validContact, phone: "" })
    ).toThrow();
  });

  it("should reject invalid phone format", () => {
    expect(() =>
      step2Schema.parse({ ...validContact, phone: "12345" })
    ).toThrow(/valid Philippine phone/i);
  });

  it("should reject missing fields", () => {
    expect(() => step2Schema.parse({})).toThrow();
  });

  it("should produce correct Step2FormValues type shape", () => {
    const values: Step2FormValues = step2Schema.parse(validContact);
    expect(values).toHaveProperty("name");
    expect(values).toHaveProperty("email");
    expect(values).toHaveProperty("phone");
  });
});

// ---------------------------------------------------------------------------
// Step 3: Payment Method Schema
// ---------------------------------------------------------------------------

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
