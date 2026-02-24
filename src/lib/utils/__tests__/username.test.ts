/**
 * Tests for Username Generation Utilities
 * @module src/lib/utils/username
 *
 * Covers: generateUsername, generateUniqueUsername, validateUsername,
 *   formatUsername, extractUsername
 */

import {
  generateUsername,
  generateUniqueUsername,
  validateUsername,
  formatUsername,
  extractUsername,
} from '../username';

// ============================================================================
// generateUsername
// ============================================================================

describe('generateUsername', () => {
  it('extracts prefix from standard email', () => {
    expect(generateUsername('ppnamias@gmail.com')).toBe('ppnamias');
    expect(generateUsername('john.doe@example.com')).toBe('johndoe');
  });

  it('converts to lowercase', () => {
    expect(generateUsername('JohnDoe@example.com')).toBe('johndoe');
    expect(generateUsername('ADMIN@corp.org')).toBe('admin');
  });

  it('removes special characters except underscores', () => {
    expect(generateUsername('john.doe@example.com')).toBe('johndoe');
    expect(generateUsername('user+tag@example.com')).toBe('usertag');
    expect(generateUsername('first&last@example.com')).toBe('firstlast');
  });

  it('preserves underscores', () => {
    expect(generateUsername('john_doe@example.com')).toBe('john_doe');
  });

  it('collapses multiple underscores', () => {
    expect(generateUsername('john__doe@example.com')).toBe('john_doe');
    expect(generateUsername('a___b@example.com')).toBe('a_b');
  });

  it('removes leading/trailing underscores', () => {
    expect(generateUsername('_john_@example.com')).toBe('john');
    expect(generateUsername('__test__@example.com')).toBe('test');
  });

  it('truncates to 30 characters', () => {
    const longPrefix = 'a'.repeat(50);
    const result = generateUsername(`${longPrefix}@example.com`);
    expect(result.length).toBeLessThanOrEqual(30);
  });

  it('returns "user" for completely invalid prefix', () => {
    expect(generateUsername('!!!@example.com')).toBe('user');
    expect(generateUsername('@example.com')).toBe('user');
  });

  it('handles email with dots and numbers', () => {
    expect(generateUsername('user123@example.com')).toBe('user123');
    expect(generateUsername('test.user.99@example.com')).toBe('testuser99');
  });
});

// ============================================================================
// generateUniqueUsername (deprecated passthrough)
// ============================================================================

describe('generateUniqueUsername', () => {
  it('returns the input unchanged (deprecated passthrough)', async () => {
    const result = await generateUniqueUsername('johndoe');
    expect(result).toBe('johndoe');
  });

  it('returns any string unchanged', async () => {
    const result = await generateUniqueUsername('test_user_123');
    expect(result).toBe('test_user_123');
  });
});

// ============================================================================
// validateUsername
// ============================================================================

describe('validateUsername', () => {
  it('accepts valid usernames', () => {
    expect(validateUsername('johndoe')).toEqual({ valid: true });
    expect(validateUsername('john_doe')).toEqual({ valid: true });
    expect(validateUsername('john-doe')).toEqual({ valid: true });
    expect(validateUsername('user123')).toEqual({ valid: true });
    expect(validateUsername('abc')).toEqual({ valid: true }); // min 3
  });

  it('rejects empty username', () => {
    const result = validateUsername('');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('at least 3 characters');
  });

  it('rejects too short username (< 3 chars)', () => {
    const result = validateUsername('ab');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('at least 3 characters');
  });

  it('rejects too long username (> 30 chars)', () => {
    const result = validateUsername('a'.repeat(31));
    expect(result.valid).toBe(false);
    expect(result.error).toContain('at most 30 characters');
  });

  it('accepts 30-character username', () => {
    const result = validateUsername('a'.repeat(30));
    expect(result.valid).toBe(true);
  });

  it('rejects uppercase characters', () => {
    const result = validateUsername('JohnDoe');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('lowercase');
  });

  it('rejects special characters', () => {
    const result = validateUsername('john.doe');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('lowercase letters, numbers, underscores, and hyphens');
  });

  it('rejects spaces', () => {
    const result = validateUsername('john doe');
    expect(result.valid).toBe(false);
  });

  it('rejects leading underscore', () => {
    const result = validateUsername('_johndoe');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('cannot start or end');
  });

  it('rejects trailing underscore', () => {
    const result = validateUsername('johndoe_');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('cannot start or end');
  });

  it('rejects leading hyphen', () => {
    const result = validateUsername('-johndoe');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('cannot start or end');
  });

  it('rejects trailing hyphen', () => {
    const result = validateUsername('johndoe-');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('cannot start or end');
  });
});

// ============================================================================
// formatUsername / extractUsername
// ============================================================================

describe('formatUsername', () => {
  it('adds @ prefix', () => {
    expect(formatUsername('johndoe')).toBe('@johndoe');
    expect(formatUsername('user_123')).toBe('@user_123');
  });

  it('handles empty string', () => {
    expect(formatUsername('')).toBe('@');
  });
});

describe('extractUsername', () => {
  it('removes @ prefix', () => {
    expect(extractUsername('@johndoe')).toBe('johndoe');
    expect(extractUsername('@user_123')).toBe('user_123');
  });

  it('returns unchanged if no @ prefix', () => {
    expect(extractUsername('johndoe')).toBe('johndoe');
  });

  it('handles empty string', () => {
    expect(extractUsername('')).toBe('');
  });

  it('only removes leading @', () => {
    expect(extractUsername('@john@doe')).toBe('john@doe');
  });
});

// ============================================================================
// Roundtrip: formatUsername -> extractUsername
// ============================================================================

describe('formatUsername <-> extractUsername roundtrip', () => {
  it('roundtrips correctly', () => {
    const username = 'johndoe';
    expect(extractUsername(formatUsername(username))).toBe(username);
  });
});
