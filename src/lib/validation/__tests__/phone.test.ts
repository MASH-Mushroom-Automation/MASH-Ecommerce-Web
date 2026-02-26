/**
 * Tests for Zod Phone Validation Schemas
 * @module src/lib/validation/phone
 *
 * Covers: phoneNumberSchema, phoneNumberOptionalSchema, otpCodeSchema,
 *   phoneVerificationSchema, profileWithPhoneSchema
 */

import {
  phoneNumberSchema,
  phoneNumberOptionalSchema,
  otpCodeSchema,
  phoneVerificationSchema,
  profileWithPhoneSchema,
} from '../phone';

// ============================================================================
// phoneNumberSchema
// ============================================================================

describe('phoneNumberSchema', () => {
  it('accepts valid E.164 phone numbers', () => {
    expect(() => phoneNumberSchema.parse('+639123456789')).not.toThrow();
    expect(() => phoneNumberSchema.parse('+639171234567')).not.toThrow();
    expect(() => phoneNumberSchema.parse('+639981234567')).not.toThrow();
  });

  it('accepts valid local format (09XX)', () => {
    expect(() => phoneNumberSchema.parse('09123456789')).not.toThrow();
    expect(() => phoneNumberSchema.parse('09171234567')).not.toThrow();
  });

  it('accepts valid local format without leading 0', () => {
    expect(() => phoneNumberSchema.parse('9123456789')).not.toThrow();
  });

  it('rejects too short phone number', () => {
    const result = phoneNumberSchema.safeParse('123');
    expect(result.success).toBe(false);
  });

  it('rejects too long phone number', () => {
    const result = phoneNumberSchema.safeParse('+6391234567890');
    expect(result.success).toBe(false);
  });

  it('rejects invalid prefix', () => {
    // 900 is not a valid PH mobile prefix
    const result = phoneNumberSchema.safeParse('+639001234567');
    expect(result.success).toBe(false);
  });

  it('rejects non-PH numbers', () => {
    const result = phoneNumberSchema.safeParse('+11234567890');
    expect(result.success).toBe(false);
  });

  it('rejects non-numeric strings', () => {
    const result = phoneNumberSchema.safeParse('notaphone');
    expect(result.success).toBe(false);
  });

  it('rejects empty string', () => {
    const result = phoneNumberSchema.safeParse('');
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// phoneNumberOptionalSchema
// ============================================================================

describe('phoneNumberOptionalSchema', () => {
  it('accepts undefined', () => {
    const result = phoneNumberOptionalSchema.safeParse(undefined);
    expect(result.success).toBe(true);
  });

  it('accepts empty string', () => {
    const result = phoneNumberOptionalSchema.safeParse('');
    expect(result.success).toBe(true);
  });

  it('accepts valid phone number', () => {
    const result = phoneNumberOptionalSchema.safeParse('+639123456789');
    expect(result.success).toBe(true);
  });

  it('rejects invalid phone number', () => {
    const result = phoneNumberOptionalSchema.safeParse('invalid');
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// otpCodeSchema
// ============================================================================

describe('otpCodeSchema', () => {
  it('accepts valid 6-digit OTP', () => {
    expect(() => otpCodeSchema.parse('123456')).not.toThrow();
    expect(() => otpCodeSchema.parse('000000')).not.toThrow();
    expect(() => otpCodeSchema.parse('999999')).not.toThrow();
  });

  it('rejects too short OTP', () => {
    const result = otpCodeSchema.safeParse('12345');
    expect(result.success).toBe(false);
  });

  it('rejects too long OTP', () => {
    const result = otpCodeSchema.safeParse('1234567');
    expect(result.success).toBe(false);
  });

  it('rejects non-digit characters', () => {
    const result = otpCodeSchema.safeParse('12345a');
    expect(result.success).toBe(false);
  });

  it('rejects OTP with spaces', () => {
    const result = otpCodeSchema.safeParse('123 45');
    expect(result.success).toBe(false);
  });

  it('rejects empty string', () => {
    const result = otpCodeSchema.safeParse('');
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// phoneVerificationSchema
// ============================================================================

describe('phoneVerificationSchema', () => {
  it('accepts valid phone + OTP combination', () => {
    const data = {
      phoneNumber: '+639123456789',
      otpCode: '123456',
    };
    expect(() => phoneVerificationSchema.parse(data)).not.toThrow();
  });

  it('rejects missing phone number', () => {
    const result = phoneVerificationSchema.safeParse({
      otpCode: '123456',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing OTP code', () => {
    const result = phoneVerificationSchema.safeParse({
      phoneNumber: '+639123456789',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid phone number', () => {
    const result = phoneVerificationSchema.safeParse({
      phoneNumber: 'invalid',
      otpCode: '123456',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid OTP code', () => {
    const result = phoneVerificationSchema.safeParse({
      phoneNumber: '+639123456789',
      otpCode: 'abc',
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// profileWithPhoneSchema
// ============================================================================

describe('profileWithPhoneSchema', () => {
  it('accepts valid profile data', () => {
    const data = {
      firstName: 'Juan',
      lastName: 'Cruz',
      phoneNumber: '+639123456789',
    };
    expect(() => profileWithPhoneSchema.parse(data)).not.toThrow();
  });

  it('rejects missing first name', () => {
    const result = profileWithPhoneSchema.safeParse({
      firstName: '',
      lastName: 'Cruz',
      phoneNumber: '+639123456789',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing last name', () => {
    const result = profileWithPhoneSchema.safeParse({
      firstName: 'Juan',
      lastName: '',
      phoneNumber: '+639123456789',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid phone number', () => {
    const result = profileWithPhoneSchema.safeParse({
      firstName: 'Juan',
      lastName: 'Cruz',
      phoneNumber: '123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects completely empty object', () => {
    const result = profileWithPhoneSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
