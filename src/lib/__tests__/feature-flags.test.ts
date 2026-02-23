/**
 * Feature Flags Tests
 *
 * Tests for feature flag utilities including:
 * 1. Global enable/disable states
 * 2. Gradual rollout percentage calculation
 * 3. Per-user feature checks
 * 4. Configuration defaults and edge cases
 */

import {
  isPhoneVerificationEnabled,
  is2FAEnabled,
  isInRolloutGroup,
  isPhoneVerificationEnabledForUser,
  is2FAEnabledForUser,
  getPhoneVerificationConfig,
  get2FAConfig,
} from '../feature-flags';

// ============================================================================
// Helpers
// ============================================================================

const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
});

afterAll(() => {
  process.env = originalEnv;
});

// ============================================================================
// Test Suite 1: Global Feature Flags
// ============================================================================

describe('isPhoneVerificationEnabled', () => {
  it('should return false when env var is not set', () => {
    delete process.env.NEXT_PUBLIC_ENABLE_PHONE_VERIFICATION;
    expect(isPhoneVerificationEnabled()).toBe(false);
  });

  it('should return false when env var is "false"', () => {
    process.env.NEXT_PUBLIC_ENABLE_PHONE_VERIFICATION = 'false';
    expect(isPhoneVerificationEnabled()).toBe(false);
  });

  it('should return true when env var is "true"', () => {
    process.env.NEXT_PUBLIC_ENABLE_PHONE_VERIFICATION = 'true';
    expect(isPhoneVerificationEnabled()).toBe(true);
  });

  it('should return false for non-boolean values', () => {
    process.env.NEXT_PUBLIC_ENABLE_PHONE_VERIFICATION = '1';
    expect(isPhoneVerificationEnabled()).toBe(false);
  });

  it('should return false for empty string', () => {
    process.env.NEXT_PUBLIC_ENABLE_PHONE_VERIFICATION = '';
    expect(isPhoneVerificationEnabled()).toBe(false);
  });
});

describe('is2FAEnabled', () => {
  it('should return false when env var is not set', () => {
    delete process.env.NEXT_PUBLIC_ENABLE_2FA;
    expect(is2FAEnabled()).toBe(false);
  });

  it('should return false when env var is "false"', () => {
    process.env.NEXT_PUBLIC_ENABLE_2FA = 'false';
    expect(is2FAEnabled()).toBe(false);
  });

  it('should return true when env var is "true"', () => {
    process.env.NEXT_PUBLIC_ENABLE_2FA = 'true';
    expect(is2FAEnabled()).toBe(true);
  });

  it('should return false for arbitrary values', () => {
    process.env.NEXT_PUBLIC_ENABLE_2FA = 'yes';
    expect(is2FAEnabled()).toBe(false);
  });
});

// ============================================================================
// Test Suite 2: Gradual Rollout
// ============================================================================

describe('isInRolloutGroup', () => {
  it('should return false for 0% rollout', () => {
    expect(isInRolloutGroup('user-123', 0)).toBe(false);
  });

  it('should return true for 100% rollout', () => {
    expect(isInRolloutGroup('user-123', 100)).toBe(true);
  });

  it('should return false for empty userId', () => {
    expect(isInRolloutGroup('', 50)).toBe(false);
  });

  it('should be deterministic - same userId always returns same result', () => {
    const result1 = isInRolloutGroup('user-abc-123', 50);
    const result2 = isInRolloutGroup('user-abc-123', 50);
    const result3 = isInRolloutGroup('user-abc-123', 50);
    expect(result1).toBe(result2);
    expect(result2).toBe(result3);
  });

  it('should return different results for different userIds at 50%', () => {
    // With enough users, some should be in and some out at 50%
    const results = new Set<boolean>();
    for (let i = 0; i < 100; i++) {
      results.add(isInRolloutGroup(`test-user-${i}`, 50));
    }
    // At 50%, we expect both true and false
    expect(results.size).toBe(2);
  });

  it('should include more users as percentage increases', () => {
    const users = Array.from({ length: 200 }, (_, i) => `user-${i}`);

    const countAt10 = users.filter(u => isInRolloutGroup(u, 10)).length;
    const countAt50 = users.filter(u => isInRolloutGroup(u, 50)).length;
    const countAt90 = users.filter(u => isInRolloutGroup(u, 90)).length;

    expect(countAt10).toBeLessThan(countAt50);
    expect(countAt50).toBeLessThan(countAt90);
  });

  it('should handle negative percentage as 0%', () => {
    expect(isInRolloutGroup('user-123', -10)).toBe(false);
  });

  it('should handle percentage > 100 as 100%', () => {
    expect(isInRolloutGroup('user-123', 200)).toBe(true);
  });

  it('should handle special characters in userId', () => {
    // Should not throw
    expect(() => isInRolloutGroup('user@email.com', 50)).not.toThrow();
    expect(() => isInRolloutGroup('uid:abc-def/123', 50)).not.toThrow();
  });
});

// ============================================================================
// Test Suite 3: Per-User Feature Checks
// ============================================================================

describe('isPhoneVerificationEnabledForUser', () => {
  it('should return false when global flag is disabled', () => {
    process.env.NEXT_PUBLIC_ENABLE_PHONE_VERIFICATION = 'false';
    expect(isPhoneVerificationEnabledForUser('user-123')).toBe(false);
  });

  it('should return true when enabled and no userId provided', () => {
    process.env.NEXT_PUBLIC_ENABLE_PHONE_VERIFICATION = 'true';
    expect(isPhoneVerificationEnabledForUser()).toBe(true);
  });

  it('should respect rollout percentage for specific user', () => {
    process.env.NEXT_PUBLIC_ENABLE_PHONE_VERIFICATION = 'true';
    process.env.NEXT_PUBLIC_PHONE_ROLLOUT_PERCENTAGE = '0';
    expect(isPhoneVerificationEnabledForUser('user-123')).toBe(false);
  });

  it('should return true at 100% rollout', () => {
    process.env.NEXT_PUBLIC_ENABLE_PHONE_VERIFICATION = 'true';
    process.env.NEXT_PUBLIC_PHONE_ROLLOUT_PERCENTAGE = '100';
    expect(isPhoneVerificationEnabledForUser('user-123')).toBe(true);
  });

  it('should default to 100% rollout when env var is missing', () => {
    process.env.NEXT_PUBLIC_ENABLE_PHONE_VERIFICATION = 'true';
    delete process.env.NEXT_PUBLIC_PHONE_ROLLOUT_PERCENTAGE;
    expect(isPhoneVerificationEnabledForUser('user-123')).toBe(true);
  });
});

describe('is2FAEnabledForUser', () => {
  it('should return false when global flag is disabled', () => {
    process.env.NEXT_PUBLIC_ENABLE_2FA = 'false';
    expect(is2FAEnabledForUser('user-123')).toBe(false);
  });

  it('should return true when enabled and no userId provided', () => {
    process.env.NEXT_PUBLIC_ENABLE_2FA = 'true';
    expect(is2FAEnabledForUser()).toBe(true);
  });

  it('should respect rollout percentage for specific user', () => {
    process.env.NEXT_PUBLIC_ENABLE_2FA = 'true';
    process.env.NEXT_PUBLIC_2FA_ROLLOUT_PERCENTAGE = '0';
    expect(is2FAEnabledForUser('user-123')).toBe(false);
  });

  it('should default to 100% rollout when env var is missing', () => {
    process.env.NEXT_PUBLIC_ENABLE_2FA = 'true';
    delete process.env.NEXT_PUBLIC_2FA_ROLLOUT_PERCENTAGE;
    expect(is2FAEnabledForUser('user-123')).toBe(true);
  });
});

// ============================================================================
// Test Suite 4: Configuration
// ============================================================================

describe('getPhoneVerificationConfig', () => {
  it('should return defaults when no env vars are set', () => {
    delete process.env.NEXT_PUBLIC_ENABLE_PHONE_VERIFICATION;
    delete process.env.NEXT_PUBLIC_OTP_LENGTH;
    delete process.env.NEXT_PUBLIC_OTP_EXPIRY_MINUTES;
    delete process.env.NEXT_PUBLIC_OTP_RESEND_COOLDOWN_SECONDS;
    delete process.env.NEXT_PUBLIC_PHONE_ROLLOUT_PERCENTAGE;

    const config = getPhoneVerificationConfig();

    expect(config).toEqual({
      enabled: false,
      otpLength: 6,
      otpExpiryMinutes: 5,
      resendCooldownSeconds: 60,
      rolloutPercentage: 100,
    });
  });

  it('should read custom values from env', () => {
    process.env.NEXT_PUBLIC_ENABLE_PHONE_VERIFICATION = 'true';
    process.env.NEXT_PUBLIC_OTP_LENGTH = '4';
    process.env.NEXT_PUBLIC_OTP_EXPIRY_MINUTES = '10';
    process.env.NEXT_PUBLIC_OTP_RESEND_COOLDOWN_SECONDS = '30';
    process.env.NEXT_PUBLIC_PHONE_ROLLOUT_PERCENTAGE = '50';

    const config = getPhoneVerificationConfig();

    expect(config).toEqual({
      enabled: true,
      otpLength: 4,
      otpExpiryMinutes: 10,
      resendCooldownSeconds: 30,
      rolloutPercentage: 50,
    });
  });

  it('should fall back to defaults for invalid numeric values', () => {
    process.env.NEXT_PUBLIC_OTP_LENGTH = 'abc';
    process.env.NEXT_PUBLIC_OTP_EXPIRY_MINUTES = '';

    const config = getPhoneVerificationConfig();

    expect(config.otpLength).toBe(6);
    expect(config.otpExpiryMinutes).toBe(5);
  });
});

describe('get2FAConfig', () => {
  it('should return defaults when no env vars are set', () => {
    delete process.env.NEXT_PUBLIC_ENABLE_2FA;
    delete process.env.NEXT_PUBLIC_2FA_ROLLOUT_PERCENTAGE;

    const config = get2FAConfig();

    expect(config).toEqual({
      enabled: false,
      rolloutPercentage: 100,
    });
  });

  it('should read custom values from env', () => {
    process.env.NEXT_PUBLIC_ENABLE_2FA = 'true';
    process.env.NEXT_PUBLIC_2FA_ROLLOUT_PERCENTAGE = '25';

    const config = get2FAConfig();

    expect(config).toEqual({
      enabled: true,
      rolloutPercentage: 25,
    });
  });
});
