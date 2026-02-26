/**
 * Backup Codes Service
 *
 * Generates, hashes, validates, and formats one-time-use backup codes
 * for 2FA account recovery. Each user receives 10 codes when enabling
 * 2FA or after a recovery flow. Codes are stored as SHA-256 hashes in
 * Firestore; plaintext codes are shown to the user exactly once.
 *
 * Code format: 8 alphanumeric characters, displayed as XXXX-XXXX
 */

// ============================================================================
// Constants
// ============================================================================

/** Number of backup codes to generate per set */
const BACKUP_CODE_COUNT = 10;

/** Length of each raw backup code (before formatting) */
const BACKUP_CODE_LENGTH = 8;

/** Alphanumeric character set used for code generation */
const CODE_CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Omit 0/O/1/I to avoid confusion

// ============================================================================
// Code Generation
// ============================================================================

/**
 * Generate a set of unique backup codes.
 *
 * Uses `crypto.getRandomValues` when available (browser / Node 19+),
 * falling back to `Math.random` in test environments.
 *
 * @returns An array of 10 unique, randomly generated 8-character codes
 */
export function generateBackupCodes(): string[] {
  const codes = new Set<string>();

  while (codes.size < BACKUP_CODE_COUNT) {
    codes.add(generateSingleCode());
  }

  return Array.from(codes);
}

/**
 * Generate a single random alphanumeric code of BACKUP_CODE_LENGTH characters.
 */
function generateSingleCode(): string {
  const values = new Uint8Array(BACKUP_CODE_LENGTH);

  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(values);
  } else {
    // Fallback for environments without Web Crypto (e.g. older test runners)
    for (let i = 0; i < values.length; i++) {
      values[i] = Math.floor(Math.random() * 256);
    }
  }

  let code = "";
  for (let i = 0; i < BACKUP_CODE_LENGTH; i++) {
    code += CODE_CHARSET[values[i] % CODE_CHARSET.length];
  }
  return code;
}

// ============================================================================
// Hashing
// ============================================================================

/**
 * SHA-256 hash a backup code for secure storage.
 *
 * Tries Web Crypto API first (browser), then falls back to Node.js
 * `crypto` module (server / test environments).
 *
 * The code is normalised to uppercase and stripped of dashes before
 * hashing so that validation is case-insensitive.
 *
 * @param code - The plaintext backup code to hash
 * @returns Hex-encoded SHA-256 digest
 */
export async function hashBackupCode(code: string): Promise<string> {
  const normalised = code.replace(/-/g, "").toUpperCase();

  // Browser path: Web Crypto API
  if (
    typeof globalThis.crypto !== "undefined" &&
    globalThis.crypto.subtle &&
    typeof globalThis.crypto.subtle.digest === "function"
  ) {
    const data = new TextEncoder().encode(normalised);
    const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // Node.js fallback (used in server-side rendering and test environments)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nodeCrypto = require("crypto") as typeof import("crypto");
  return nodeCrypto.createHash("sha256").update(normalised).digest("hex");
}

/**
 * Hash an entire array of backup codes for storage.
 *
 * @param codes - Array of plaintext backup codes
 * @returns Array of hex-encoded SHA-256 digests (same order)
 */
export async function hashAllBackupCodes(codes: string[]): Promise<string[]> {
  return Promise.all(codes.map(hashBackupCode));
}

// ============================================================================
// Validation
// ============================================================================

/** Result of a backup code validation attempt */
export interface BackupCodeValidationResult {
  /** Whether the code matched a stored hash */
  valid: boolean;
  /** Index of the matched hash in the array (-1 if invalid) */
  usedIndex: number;
}

/**
 * Validate a user-entered backup code against stored hashes.
 *
 * Strips formatting (dashes) and normalises to uppercase before hashing,
 * then compares against each stored hash using timing-safe comparison
 * (as close as JS allows).
 *
 * @param code         - The plaintext code entered by the user
 * @param hashedCodes  - Array of hex SHA-256 hashes stored in Firestore
 * @returns Validation result with match status and index
 */
export async function validateBackupCode(
  code: string,
  hashedCodes: string[],
): Promise<BackupCodeValidationResult> {
  const inputHash = await hashBackupCode(code);

  for (let i = 0; i < hashedCodes.length; i++) {
    if (constantTimeEqual(inputHash, hashedCodes[i])) {
      return { valid: true, usedIndex: i };
    }
  }

  return { valid: false, usedIndex: -1 };
}

/**
 * Constant-time string comparison to mitigate timing attacks.
 * Both strings must be the same length (SHA-256 hex digests are always 64 chars).
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

// ============================================================================
// Formatting
// ============================================================================

/**
 * Format a raw backup code as XXXX-XXXX for display.
 *
 * @param code - Raw 8-character code (with or without existing dash)
 * @returns Formatted code string, e.g. "ABCD-EF12"
 */
export function formatBackupCode(code: string): string {
  const clean = code.replace(/-/g, "").toUpperCase();
  if (clean.length <= 4) return clean;
  return `${clean.slice(0, 4)}-${clean.slice(4, 8)}`;
}

/**
 * Format an entire array of backup codes for display.
 *
 * @param codes - Array of raw codes
 * @returns Array of formatted XXXX-XXXX strings
 */
export function formatAllBackupCodes(codes: string[]): string[] {
  return codes.map(formatBackupCode);
}
