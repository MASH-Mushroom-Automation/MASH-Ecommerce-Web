/**
 * Tests for password requirements utility
 */

import { getPasswordRequirements } from '../password';

describe('getPasswordRequirements', () => {
  it('returns all false for empty string', () => {
    const result = getPasswordRequirements('');
    expect(result).toEqual({
      minLength: false,
      hasUppercase: false,
      hasNumber: false,
      hasSpecialChar: false,
    });
  });

  it('checks minimum length of 6', () => {
    expect(getPasswordRequirements('12345').minLength).toBe(false);
    expect(getPasswordRequirements('123456').minLength).toBe(true);
    expect(getPasswordRequirements('1234567').minLength).toBe(true);
  });

  it('detects uppercase letters', () => {
    expect(getPasswordRequirements('abc').hasUppercase).toBe(false);
    expect(getPasswordRequirements('Abc').hasUppercase).toBe(true);
    expect(getPasswordRequirements('aBC').hasUppercase).toBe(true);
  });

  it('detects numbers', () => {
    expect(getPasswordRequirements('abc').hasNumber).toBe(false);
    expect(getPasswordRequirements('abc1').hasNumber).toBe(true);
    expect(getPasswordRequirements('123').hasNumber).toBe(true);
  });

  it('detects various special characters', () => {
    expect(getPasswordRequirements('abc123').hasSpecialChar).toBe(false);
    expect(getPasswordRequirements('abc!').hasSpecialChar).toBe(true);
    expect(getPasswordRequirements('abc@').hasSpecialChar).toBe(true);
    expect(getPasswordRequirements('abc#').hasSpecialChar).toBe(true);
    expect(getPasswordRequirements('abc$').hasSpecialChar).toBe(true);
    expect(getPasswordRequirements('abc%').hasSpecialChar).toBe(true);
    expect(getPasswordRequirements('abc^').hasSpecialChar).toBe(true);
    expect(getPasswordRequirements('abc&').hasSpecialChar).toBe(true);
    expect(getPasswordRequirements('abc*').hasSpecialChar).toBe(true);
    expect(getPasswordRequirements('abc_').hasSpecialChar).toBe(true);
    expect(getPasswordRequirements('abc-').hasSpecialChar).toBe(true);
    expect(getPasswordRequirements('abc+').hasSpecialChar).toBe(true);
    expect(getPasswordRequirements('abc=').hasSpecialChar).toBe(true);
  });

  it('returns all true for a strong password', () => {
    const result = getPasswordRequirements('P@ssw0rd');
    expect(result).toEqual({
      minLength: true,
      hasUppercase: true,
      hasNumber: true,
      hasSpecialChar: true,
    });
  });

  it('handles password with only numbers', () => {
    const result = getPasswordRequirements('123456');
    expect(result.minLength).toBe(true);
    expect(result.hasUppercase).toBe(false);
    expect(result.hasNumber).toBe(true);
    expect(result.hasSpecialChar).toBe(false);
  });

  it('handles password with spaces', () => {
    const result = getPasswordRequirements('abc def');
    expect(result.minLength).toBe(true);
    expect(result.hasUppercase).toBe(false);
    expect(result.hasSpecialChar).toBe(false);
  });
});
