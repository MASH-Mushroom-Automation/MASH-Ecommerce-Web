/**
 * Tests for src/lib/error-messages.ts
 * Human-friendly error message mapping and conversion - pure logic
 */
import { ERROR_MESSAGES, humanizeError, showError, getFormError } from "../error-messages";

describe("ERROR_MESSAGES constant", () => {
  it("contains network error messages", () => {
    expect(ERROR_MESSAGES["Failed to fetch"]).toBeDefined();
    expect(ERROR_MESSAGES["Network error"]).toBeDefined();
    expect(ERROR_MESSAGES["Connection timeout"]).toBeDefined();
  });

  it("contains authentication error messages", () => {
    expect(ERROR_MESSAGES["Invalid credentials"]).toBeDefined();
    expect(ERROR_MESSAGES["Unauthorized"]).toBeDefined();
    expect(ERROR_MESSAGES["Token expired"]).toBeDefined();
    expect(ERROR_MESSAGES["Session expired"]).toBeDefined();
  });

  it("contains HTTP status code messages", () => {
    expect(ERROR_MESSAGES["400"]).toBeDefined();
    expect(ERROR_MESSAGES["401"]).toBeDefined();
    expect(ERROR_MESSAGES["403"]).toBeDefined();
    expect(ERROR_MESSAGES["404"]).toBeDefined();
    expect(ERROR_MESSAGES["500"]).toBeDefined();
    expect(ERROR_MESSAGES["502"]).toBeDefined();
    expect(ERROR_MESSAGES["503"]).toBeDefined();
  });

  it("contains product error messages", () => {
    expect(ERROR_MESSAGES["Product not found"]).toBeDefined();
    expect(ERROR_MESSAGES["Out of stock"]).toBeDefined();
  });

  it("contains order error messages", () => {
    expect(ERROR_MESSAGES["Order not found"]).toBeDefined();
    expect(ERROR_MESSAGES["Payment failed"]).toBeDefined();
  });

  it("contains file upload error messages", () => {
    expect(ERROR_MESSAGES["File too large"]).toBeDefined();
    expect(ERROR_MESSAGES["Invalid file type"]).toBeDefined();
    expect(ERROR_MESSAGES["Upload failed"]).toBeDefined();
  });
});

describe("humanizeError", () => {
  // Exact match
  it("returns human-friendly message for exact match", () => {
    const result = humanizeError("Failed to fetch");
    expect(result).toBe(ERROR_MESSAGES["Failed to fetch"]);
  });

  it("returns human-friendly message for Unauthorized", () => {
    expect(humanizeError("Unauthorized")).toBe("Please sign in to continue.");
  });

  // Error object
  it("handles Error objects by extracting message", () => {
    const error = new Error("Token expired");
    expect(humanizeError(error)).toBe(ERROR_MESSAGES["Token expired"]);
  });

  it("handles Error objects with unknown message", () => {
    const error = new Error("Some random error happened");
    const result = humanizeError(error);
    // Contains "error" so falls through to fallback
    expect(result).toBe("Something unexpected happened. Please try again or contact support if the problem persists.");
  });

  // Partial match (case-insensitive)
  it("matches partial error strings case-insensitively", () => {
    const result = humanizeError("Server returned: Failed to fetch data");
    expect(result).toBe(ERROR_MESSAGES["Failed to fetch"]);
  });

  it("matches HTTP status code in error string", () => {
    const result = humanizeError("Request failed with status 404");
    expect(result).toBe(ERROR_MESSAGES["404"]);
  });

  it("matches 500 status code in error string", () => {
    const result = humanizeError("HTTP 500 Internal Server Error");
    expect(result).toBe(ERROR_MESSAGES["500"]);
  });

  // User-friendly passthrough
  it("returns the original string if already user-friendly (no technical jargon)", () => {
    const friendly = "Please update your billing information.";
    expect(humanizeError(friendly)).toBe(friendly);
  });

  // Unknown types
  it("returns fallback for null", () => {
    const result = humanizeError(null);
    expect(result).toContain("Something unexpected happened");
  });

  it("returns fallback for undefined", () => {
    const result = humanizeError(undefined);
    expect(result).toContain("Something unexpected happened");
  });

  it("returns fallback for number", () => {
    const result = humanizeError(42);
    expect(result).toContain("Something unexpected happened");
  });

  it("returns fallback for object", () => {
    const result = humanizeError({ code: "ERR" });
    expect(result).toContain("Something unexpected happened");
  });

  // Strings with technical jargon that have no match
  it("returns fallback for unknown technical error string", () => {
    const result = humanizeError("ECONNREFUSED error at port 3000");
    expect(result).toContain("Something unexpected happened");
  });

  // Cart & checkout errors
  it("matches cart is empty", () => {
    expect(humanizeError("Cart is empty")).toContain("cart is empty");
  });

  // Seller errors
  it("matches seller not found", () => {
    expect(humanizeError("Seller not found")).toContain("seller");
  });

  // 429 rate limiting
  it("matches rate limit status", () => {
    const result = humanizeError("Error 429: rate limited");
    expect(result).toBe(ERROR_MESSAGES["429"]);
  });
});

describe("showError", () => {
  it("returns humanized message for error", () => {
    const result = showError("Failed to fetch");
    expect(result).toBe(ERROR_MESSAGES["Failed to fetch"]);
  });

  it("returns custom message when provided", () => {
    const result = showError("Failed to fetch", "Custom override message");
    expect(result).toBe("Custom override message");
  });

  it("handles Error objects", () => {
    const error = new Error("Unauthorized");
    const result = showError(error);
    expect(result).toBe("Please sign in to continue.");
  });

  it("uses custom message over humanized for unknown errors", () => {
    const result = showError(42, "Something went wrong");
    expect(result).toBe("Something went wrong");
  });
});

describe("getFormError", () => {
  it("returns mapped error for known type", () => {
    const result = getFormError("email", "Invalid email");
    expect(result).toBe(ERROR_MESSAGES["Invalid email"]);
  });

  it("returns mapped error for Required field", () => {
    const result = getFormError("name", "Required field");
    expect(result).toBe(ERROR_MESSAGES["Required field"]);
  });

  it("returns fallback for unknown type", () => {
    const result = getFormError("zipCode", "unknown_type");
    expect(result).toBe("Invalid zipCode");
  });

  it("returns fallback with field name when type not in ERROR_MESSAGES", () => {
    const result = getFormError("phone", "custom_validation_rule");
    expect(result).toBe("Invalid phone");
  });
});
