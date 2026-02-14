/**
 * Backup Codes Service - Unit Tests
 *
 * Tests for generateBackupCodes, hashBackupCode, validateBackupCode, and formatBackupCode.
 * Uses the native Web Crypto API available in Node.js 16+ / jsdom.
 */

import {
  generateBackupCodes,
  hashBackupCode,
  hashAllBackupCodes,
  validateBackupCode,
  formatBackupCode,
  formatAllBackupCodes,
} from "../backup-codes";

// ============================================================================
// generateBackupCodes
// ============================================================================

describe("generateBackupCodes", () => {
  it("should generate exactly 10 codes", () => {
    const codes = generateBackupCodes();
    expect(codes).toHaveLength(10);
  });

  it("should generate codes with 8 alphanumeric characters each", () => {
    const codes = generateBackupCodes();
    const validPattern = /^[A-Z2-9]{8}$/;
    for (const code of codes) {
      expect(code).toMatch(validPattern);
    }
  });

  it("should generate unique codes (no duplicates)", () => {
    const codes = generateBackupCodes();
    const unique = new Set(codes);
    expect(unique.size).toBe(codes.length);
  });

  it("should not contain ambiguous characters (0, O, 1, I)", () => {
    const codes = generateBackupCodes();
    const ambiguous = /[0OoIi1l]/;
    for (const code of codes) {
      expect(code).not.toMatch(ambiguous);
    }
  });

  it("should return an array of strings", () => {
    const codes = generateBackupCodes();
    expect(Array.isArray(codes)).toBe(true);
    for (const code of codes) {
      expect(typeof code).toBe("string");
    }
  });
});

// ============================================================================
// hashBackupCode
// ============================================================================

describe("hashBackupCode", () => {
  it("should return a hex string", async () => {
    const hash = await hashBackupCode("ABCDEFGH");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("should produce consistent hashes for the same input", async () => {
    const hash1 = await hashBackupCode("TESTCODE");
    const hash2 = await hashBackupCode("TESTCODE");
    expect(hash1).toBe(hash2);
  });

  it("should produce different hashes for different inputs", async () => {
    const hash1 = await hashBackupCode("AAAAAAAA");
    const hash2 = await hashBackupCode("BBBBBBBB");
    expect(hash1).not.toBe(hash2);
  });

  it("should be case-insensitive (normalises to uppercase)", async () => {
    const upper = await hashBackupCode("ABCDEFGH");
    const lower = await hashBackupCode("abcdefgh");
    expect(upper).toBe(lower);
  });

  it("should strip dashes before hashing", async () => {
    const withDash = await hashBackupCode("ABCD-EFGH");
    const withoutDash = await hashBackupCode("ABCDEFGH");
    expect(withDash).toBe(withoutDash);
  });
});

// ============================================================================
// hashAllBackupCodes
// ============================================================================

describe("hashAllBackupCodes", () => {
  it("should hash all codes and preserve order", async () => {
    const codes = ["AAAAAAAA", "BBBBBBBB", "CCCCCCCC"];
    const hashes = await hashAllBackupCodes(codes);

    expect(hashes).toHaveLength(3);

    const hashA = await hashBackupCode("AAAAAAAA");
    const hashB = await hashBackupCode("BBBBBBBB");
    const hashC = await hashBackupCode("CCCCCCCC");

    expect(hashes[0]).toBe(hashA);
    expect(hashes[1]).toBe(hashB);
    expect(hashes[2]).toBe(hashC);
  });
});

// ============================================================================
// validateBackupCode
// ============================================================================

describe("validateBackupCode", () => {
  let storedHashes: string[];
  const plaintextCodes = ["AAAAAAAA", "BBBBBBBB", "CCCCCCCC"];

  beforeEach(async () => {
    storedHashes = await hashAllBackupCodes(plaintextCodes);
  });

  it("should return valid:true and correct index for a matching code", async () => {
    const result = await validateBackupCode("BBBBBBBB", storedHashes);
    expect(result.valid).toBe(true);
    expect(result.usedIndex).toBe(1);
  });

  it("should return valid:false for an incorrect code", async () => {
    const result = await validateBackupCode("ZZZZZZZZ", storedHashes);
    expect(result.valid).toBe(false);
    expect(result.usedIndex).toBe(-1);
  });

  it("should match the first code at index 0", async () => {
    const result = await validateBackupCode("AAAAAAAA", storedHashes);
    expect(result.valid).toBe(true);
    expect(result.usedIndex).toBe(0);
  });

  it("should match the last code at the last index", async () => {
    const result = await validateBackupCode("CCCCCCCC", storedHashes);
    expect(result.valid).toBe(true);
    expect(result.usedIndex).toBe(2);
  });

  it("should handle codes with dashes (formatted input)", async () => {
    const result = await validateBackupCode("AAAA-AAAA", storedHashes);
    expect(result.valid).toBe(true);
    expect(result.usedIndex).toBe(0);
  });

  it("should handle lowercase input", async () => {
    const result = await validateBackupCode("bbbbbbbb", storedHashes);
    expect(result.valid).toBe(true);
    expect(result.usedIndex).toBe(1);
  });

  it("should not match a code that has already been removed from the list", async () => {
    // Simulate removing used code by splicing the hashes array
    const remainingHashes = storedHashes.filter((_, i) => i !== 1);
    const result = await validateBackupCode("BBBBBBBB", remainingHashes);
    expect(result.valid).toBe(false);
    expect(result.usedIndex).toBe(-1);
  });

  it("should return valid:false for an empty code", async () => {
    const result = await validateBackupCode("", storedHashes);
    expect(result.valid).toBe(false);
  });

  it("should return valid:false when hashedCodes is empty", async () => {
    const result = await validateBackupCode("AAAAAAAA", []);
    expect(result.valid).toBe(false);
    expect(result.usedIndex).toBe(-1);
  });
});

// ============================================================================
// formatBackupCode
// ============================================================================

describe("formatBackupCode", () => {
  it("should format an 8-char code as XXXX-XXXX", () => {
    expect(formatBackupCode("ABCDEFGH")).toBe("ABCD-EFGH");
  });

  it("should handle already-formatted codes (strip existing dashes)", () => {
    expect(formatBackupCode("ABCD-EFGH")).toBe("ABCD-EFGH");
  });

  it("should convert to uppercase", () => {
    expect(formatBackupCode("abcdefgh")).toBe("ABCD-EFGH");
  });

  it("should handle short codes gracefully", () => {
    expect(formatBackupCode("ABC")).toBe("ABC");
  });

  it("should handle exactly 4-char codes", () => {
    expect(formatBackupCode("ABCD")).toBe("ABCD");
  });
});

// ============================================================================
// formatAllBackupCodes
// ============================================================================

describe("formatAllBackupCodes", () => {
  it("should format all codes in the array", () => {
    const codes = ["ABCDEFGH", "IJKLMNOP"];
    const formatted = formatAllBackupCodes(codes);
    expect(formatted).toEqual(["ABCD-EFGH", "IJKL-MNOP"]);
  });

  it("should return empty array for empty input", () => {
    expect(formatAllBackupCodes([])).toEqual([]);
  });
});
