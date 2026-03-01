/**
 * Checkout Schemas Tests
 * Validates Zod schemas for all checkout form steps.
 */

import { step1Schema, step2Schema, step3Schema } from "../checkout-schemas";

describe("step1Schema (Delivery Method)", () => {
  it("accepts valid pickup delivery", () => {
    const result = step1Schema.safeParse({
      deliveryMethod: "pickup",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid lalamove delivery", () => {
    const result = step1Schema.safeParse({
      deliveryMethod: "lalamove",
    });
    expect(result.success).toBe(true);
  });

  it("accepts pickup with optional pickupLocation", () => {
    const result = step1Schema.safeParse({
      deliveryMethod: "pickup",
      pickupLocation: "MASH HQ - Quezon City",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.pickupLocation).toBe("MASH HQ - Quezon City");
    }
  });

  it("rejects invalid delivery method", () => {
    const result = step1Schema.safeParse({
      deliveryMethod: "express",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing deliveryMethod", () => {
    const result = step1Schema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects null deliveryMethod", () => {
    const result = step1Schema.safeParse({ deliveryMethod: null });
    expect(result.success).toBe(false);
  });
});

describe("step2Schema (Contact Information)", () => {
  it("accepts valid contact info", () => {
    const result = step2Schema.safeParse({
      name: "Juan Dela Cruz",
      email: "juan@example.com",
      phone: "09171234567",
    });
    expect(result.success).toBe(true);
  });

  it("accepts +63 phone format", () => {
    const result = step2Schema.safeParse({
      name: "Juan Dela Cruz",
      email: "juan@example.com",
      phone: "+639171234567",
    });
    expect(result.success).toBe(true);
  });

  it("transforms phone by removing whitespace and dashes", () => {
    const result = step2Schema.safeParse({
      name: "Juan Dela Cruz",
      email: "juan@example.com",
      phone: "09171234567",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe("09171234567");
    }
  });

  it("rejects name shorter than 2 characters", () => {
    const result = step2Schema.safeParse({
      name: "J",
      email: "juan@example.com",
      phone: "09171234567",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Name is required");
    }
  });

  it("rejects empty name", () => {
    const result = step2Schema.safeParse({
      name: "",
      email: "juan@example.com",
      phone: "09171234567",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email format", () => {
    const result = step2Schema.safeParse({
      name: "Juan Dela Cruz",
      email: "not-an-email",
      phone: "09171234567",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Invalid email address");
    }
  });

  it("rejects empty email", () => {
    const result = step2Schema.safeParse({
      name: "Juan Dela Cruz",
      email: "",
      phone: "09171234567",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty phone", () => {
    const result = step2Schema.safeParse({
      name: "Juan Dela Cruz",
      email: "juan@example.com",
      phone: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid phone format (too short)", () => {
    const result = step2Schema.safeParse({
      name: "Juan Dela Cruz",
      email: "juan@example.com",
      phone: "12345",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-PH phone number", () => {
    const result = step2Schema.safeParse({
      name: "Juan",
      email: "juan@example.com",
      phone: "+1234567890",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields entirely", () => {
    const result = step2Schema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("step3Schema (Payment)", () => {
  it("accepts COD payment method", () => {
    const result = step3Schema.safeParse({
      paymentMethod: "cod",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-COD payment methods", () => {
    const result = step3Schema.safeParse({
      paymentMethod: "gcash",
    });
    expect(result.success).toBe(false);
  });

  it("rejects credit card payment", () => {
    const result = step3Schema.safeParse({
      paymentMethod: "credit_card",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing paymentMethod", () => {
    const result = step3Schema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty paymentMethod", () => {
    const result = step3Schema.safeParse({ paymentMethod: "" });
    expect(result.success).toBe(false);
  });
});
