/**
 * Tests for CMS configuration and utility functions
 */

import { CMS_CONFIG, generateId, validateRequired } from '../config';

describe('CMS_CONFIG', () => {
  it('has expected default values', () => {
    expect(CMS_CONFIG.API_VERSION).toBe('v1');
    expect(CMS_CONFIG.DEFAULT_PAGE_SIZE).toBe(20);
    expect(CMS_CONFIG.MAX_PAGE_SIZE).toBe(100);
    expect(CMS_CONFIG.UPLOAD_PATH).toBe('/uploads');
    expect(CMS_CONFIG.MAX_FILE_SIZE).toBe(5242880); // 5MB
  });

  it('has allowed file types', () => {
    expect(CMS_CONFIG.ALLOWED_FILE_TYPES).toEqual(['jpg', 'jpeg', 'png', 'webp']);
  });

  it('has rate limit configuration', () => {
    expect(CMS_CONFIG.RATE_LIMIT.windowMs).toBe(15 * 60 * 1000);
    expect(CMS_CONFIG.RATE_LIMIT.max).toBe(100);
  });

  it('has cache TTL of 5 minutes', () => {
    expect(CMS_CONFIG.CACHE_TTL).toBe(5 * 60 * 1000);
  });
});

describe('generateId', () => {
  it('returns a string', () => {
    expect(typeof generateId()).toBe('string');
  });

  it('contains a timestamp and random portion', () => {
    const id = generateId();
    expect(id).toMatch(/^\d+-[a-z0-9]+$/);
  });

  it('generates unique IDs across calls', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });

  it('starts with a numeric timestamp', () => {
    const before = Date.now();
    const id = generateId();
    const after = Date.now();
    const timestamp = parseInt(id.split('-')[0], 10);
    expect(timestamp).toBeGreaterThanOrEqual(before);
    expect(timestamp).toBeLessThanOrEqual(after);
  });
});

describe('validateRequired', () => {
  it('returns null when all required fields are present', () => {
    const data = { name: 'Test', email: 'test@example.com' };
    expect(validateRequired(data, ['name', 'email'])).toBeNull();
  });

  it('returns error message for first missing field', () => {
    const data = { name: 'Test' };
    const result = validateRequired(data, ['name', 'email']);
    expect(result).toBe('Missing required field: email');
  });

  it('returns error for empty string values', () => {
    const data = { name: '', email: 'test@example.com' };
    const result = validateRequired(data, ['name', 'email']);
    expect(result).toBe('Missing required field: name');
  });

  it('returns error for null values', () => {
    const data = { name: null, email: 'test@example.com' };
    const result = validateRequired(data, ['name', 'email']);
    expect(result).toBe('Missing required field: name');
  });

  it('returns error for undefined values', () => {
    const data = { email: 'test@example.com' };
    const result = validateRequired(data, ['name', 'email']);
    expect(result).toBe('Missing required field: name');
  });

  it('returns null for empty required fields array', () => {
    expect(validateRequired({}, [])).toBeNull();
  });

  it('returns error for zero value (falsy)', () => {
    const data = { count: 0 };
    const result = validateRequired(data, ['count']);
    expect(result).toBe('Missing required field: count');
  });

  it('accepts truthy non-string values', () => {
    const data = { count: 5, active: true, items: [1, 2] };
    expect(validateRequired(data, ['count', 'active', 'items'])).toBeNull();
  });
});
