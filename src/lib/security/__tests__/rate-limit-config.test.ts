/**
 * Tests for Rate Limit Configuration
 * @module src/lib/security/rate-limit-config
 *
 * Covers: RATE_LIMITS configurations, getBackoffDelay, buildRateLimitKey,
 *   RateLimitConfig interface validation
 */

import {
  RATE_LIMITS,
  getBackoffDelay,
  buildRateLimitKey,
  type RateLimitConfig,
} from '../rate-limit-config';

// ============================================================================
// RATE_LIMITS Configuration Validation
// ============================================================================

describe('RATE_LIMITS', () => {
  it('has all 5 predefined configurations', () => {
    expect(Object.keys(RATE_LIMITS)).toHaveLength(5);
    expect(RATE_LIMITS).toHaveProperty('OTP_SEND_PHONE');
    expect(RATE_LIMITS).toHaveProperty('OTP_SEND_USER');
    expect(RATE_LIMITS).toHaveProperty('OTP_VERIFY');
    expect(RATE_LIMITS).toHaveProperty('TWO_FA_LOGIN_HOURLY');
    expect(RATE_LIMITS).toHaveProperty('TWO_FA_LOGIN_DAILY');
  });

  describe('OTP_SEND_PHONE', () => {
    it('allows 3 attempts per 15 minutes', () => {
      expect(RATE_LIMITS.OTP_SEND_PHONE.maxAttempts).toBe(3);
      expect(RATE_LIMITS.OTP_SEND_PHONE.windowMs).toBe(15 * 60 * 1000);
    });

    it('blocks on limit exceeded', () => {
      expect(RATE_LIMITS.OTP_SEND_PHONE.action).toBe('block');
    });

    it('uses backoff', () => {
      expect(RATE_LIMITS.OTP_SEND_PHONE.useBackoff).toBe(true);
    });

    it('has correct key prefix', () => {
      expect(RATE_LIMITS.OTP_SEND_PHONE.keyPrefix).toBe('otp_send:phone');
    });
  });

  describe('OTP_SEND_USER', () => {
    it('allows 5 attempts per hour', () => {
      expect(RATE_LIMITS.OTP_SEND_USER.maxAttempts).toBe(5);
      expect(RATE_LIMITS.OTP_SEND_USER.windowMs).toBe(60 * 60 * 1000);
    });

    it('uses backoff', () => {
      expect(RATE_LIMITS.OTP_SEND_USER.useBackoff).toBe(true);
    });
  });

  describe('OTP_VERIFY', () => {
    it('allows 3 attempts per 10 minutes', () => {
      expect(RATE_LIMITS.OTP_VERIFY.maxAttempts).toBe(3);
      expect(RATE_LIMITS.OTP_VERIFY.windowMs).toBe(10 * 60 * 1000);
    });

    it('does not use backoff', () => {
      expect(RATE_LIMITS.OTP_VERIFY.useBackoff).toBe(false);
    });
  });

  describe('TWO_FA_LOGIN_HOURLY', () => {
    it('allows 5 attempts per hour with lockout', () => {
      expect(RATE_LIMITS.TWO_FA_LOGIN_HOURLY.maxAttempts).toBe(5);
      expect(RATE_LIMITS.TWO_FA_LOGIN_HOURLY.windowMs).toBe(60 * 60 * 1000);
      expect(RATE_LIMITS.TWO_FA_LOGIN_HOURLY.lockoutMs).toBe(60 * 60 * 1000);
    });

    it('blocks on limit exceeded', () => {
      expect(RATE_LIMITS.TWO_FA_LOGIN_HOURLY.action).toBe('block');
    });
  });

  describe('TWO_FA_LOGIN_DAILY', () => {
    it('allows 10 attempts per 24 hours', () => {
      expect(RATE_LIMITS.TWO_FA_LOGIN_DAILY.maxAttempts).toBe(10);
      expect(RATE_LIMITS.TWO_FA_LOGIN_DAILY.windowMs).toBe(24 * 60 * 60 * 1000);
    });

    it('flags for review (not blocks)', () => {
      expect(RATE_LIMITS.TWO_FA_LOGIN_DAILY.action).toBe('flag');
    });

    it('has no lockout', () => {
      expect(RATE_LIMITS.TWO_FA_LOGIN_DAILY.lockoutMs).toBeUndefined();
    });
  });

  it('all configs have required fields', () => {
    const configs = Object.values(RATE_LIMITS) as RateLimitConfig[];
    configs.forEach((config) => {
      expect(config.name).toBeTruthy();
      expect(config.maxAttempts).toBeGreaterThan(0);
      expect(config.windowMs).toBeGreaterThan(0);
      expect(['block', 'flag']).toContain(config.action);
      expect(config.keyPrefix).toBeTruthy();
      expect(typeof config.useBackoff).toBe('boolean');
    });
  });
});

// ============================================================================
// getBackoffDelay
// ============================================================================

describe('getBackoffDelay', () => {
  it('returns 0 for first attempt (0)', () => {
    expect(getBackoffDelay(0)).toBe(0);
  });

  it('returns 0 for negative attempts', () => {
    expect(getBackoffDelay(-1)).toBe(0);
    expect(getBackoffDelay(-100)).toBe(0);
  });

  it('returns 30s for second attempt (1)', () => {
    expect(getBackoffDelay(1)).toBe(30);
  });

  it('doubles each subsequent attempt', () => {
    expect(getBackoffDelay(2)).toBe(60);
    expect(getBackoffDelay(3)).toBe(120);
    expect(getBackoffDelay(4)).toBe(240);
  });

  it('caps at 300 seconds (5 minutes)', () => {
    expect(getBackoffDelay(5)).toBe(300);
    expect(getBackoffDelay(6)).toBe(300); // still capped
    expect(getBackoffDelay(100)).toBe(300); // still capped
  });

  it('follows exponential backoff formula: 30 * 2^(n-1)', () => {
    for (let i = 1; i <= 4; i++) {
      expect(getBackoffDelay(i)).toBe(Math.min(30 * Math.pow(2, i - 1), 300));
    }
  });
});

// ============================================================================
// buildRateLimitKey
// ============================================================================

describe('buildRateLimitKey', () => {
  it('builds key from config prefix and phone number', () => {
    const key = buildRateLimitKey(RATE_LIMITS.OTP_SEND_PHONE, '+639171234567');
    expect(key).toBe('otp_send:phone:+639171234567');
  });

  it('builds key from config prefix and user ID', () => {
    const key = buildRateLimitKey(RATE_LIMITS.OTP_SEND_USER, 'user-abc-123');
    expect(key).toBe('otp_send:user:user-abc-123');
  });

  it('builds key for OTP verify', () => {
    const key = buildRateLimitKey(RATE_LIMITS.OTP_VERIFY, 'otp-id-456');
    expect(key).toBe('otp_verify:otp-id-456');
  });

  it('builds key for 2FA login', () => {
    const key = buildRateLimitKey(RATE_LIMITS.TWO_FA_LOGIN_HOURLY, 'user-xyz');
    expect(key).toBe('2fa_login:user-xyz');
  });

  it('builds key for 2FA daily', () => {
    const key = buildRateLimitKey(RATE_LIMITS.TWO_FA_LOGIN_DAILY, 'user-xyz');
    expect(key).toBe('2fa_login_daily:user-xyz');
  });

  it('handles empty identifier', () => {
    const key = buildRateLimitKey(RATE_LIMITS.OTP_SEND_PHONE, '');
    expect(key).toBe('otp_send:phone:');
  });
});
