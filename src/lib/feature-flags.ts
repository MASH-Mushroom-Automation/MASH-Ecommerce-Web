/**
 * Feature Flags Utility
 *
 * Centralized feature flag management for gradual rollout of phone verification
 * and 2FA features. Uses environment variables with hash-based percentage rollout.
 *
 * Environment Variables:
 * - NEXT_PUBLIC_ENABLE_PHONE_VERIFICATION: Enable phone verification UI (default: false)
 * - NEXT_PUBLIC_ENABLE_2FA: Enable two-factor authentication UI (default: false)
 * - NEXT_PUBLIC_OTP_LENGTH: OTP code length (default: 6)
 * - NEXT_PUBLIC_OTP_EXPIRY_MINUTES: OTP expiry time (default: 5)
 * - NEXT_PUBLIC_OTP_RESEND_COOLDOWN_SECONDS: Resend cooldown (default: 60)
 * - NEXT_PUBLIC_PHONE_ROLLOUT_PERCENTAGE: Gradual rollout percentage (default: 100)
 * - NEXT_PUBLIC_2FA_ROLLOUT_PERCENTAGE: Gradual rollout percentage (default: 100)
 */

// ============================================================================
// Core Feature Flags
// ============================================================================

/**
 * Check if phone verification feature is enabled globally.
 * Reads from NEXT_PUBLIC_ENABLE_PHONE_VERIFICATION env variable.
 */
export function isPhoneVerificationEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_PHONE_VERIFICATION === 'true';
}

/**
 * Check if two-factor authentication feature is enabled globally.
 * Reads from NEXT_PUBLIC_ENABLE_2FA env variable.
 */
export function is2FAEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_2FA === 'true';
}

// ============================================================================
// Gradual Rollout
// ============================================================================

/**
 * Deterministic hash-based rollout check.
 * Hashes userId to a value 0-99 and checks if it falls within the rollout percentage.
 * The same userId always returns the same result for a given percentage,
 * ensuring consistent user experience across sessions.
 *
 * @param userId - Unique user identifier to hash
 * @param percentage - Rollout percentage (0-100). 0 = no users, 100 = all users
 * @returns true if the user is in the rollout group
 */
export function isInRolloutGroup(userId: string, percentage: number): boolean {
  if (percentage <= 0) return false;
  if (percentage >= 100) return true;
  if (!userId) return false;

  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  return (Math.abs(hash) % 100) < percentage;
}

/**
 * Check if phone verification is enabled for a specific user.
 * Combines global flag + gradual rollout percentage.
 *
 * @param userId - User ID for rollout check (optional, defaults to enabled-for-all if omitted)
 */
export function isPhoneVerificationEnabledForUser(userId?: string): boolean {
  if (!isPhoneVerificationEnabled()) return false;

  // If no userId provided, just use the global flag
  if (!userId) return true;

  const rolloutPercentage = parseInt(
    process.env.NEXT_PUBLIC_PHONE_ROLLOUT_PERCENTAGE || '100',
    10,
  );
  return isInRolloutGroup(userId, rolloutPercentage);
}

/**
 * Check if 2FA is enabled for a specific user.
 * Combines global flag + gradual rollout percentage.
 *
 * @param userId - User ID for rollout check (optional, defaults to enabled-for-all if omitted)
 */
export function is2FAEnabledForUser(userId?: string): boolean {
  if (!is2FAEnabled()) return false;

  // If no userId provided, just use the global flag
  if (!userId) return true;

  const rolloutPercentage = parseInt(
    process.env.NEXT_PUBLIC_2FA_ROLLOUT_PERCENTAGE || '100',
    10,
  );
  return isInRolloutGroup(userId, rolloutPercentage);
}

// ============================================================================
// Configuration Helpers
// ============================================================================

/**
 * Phone verification configuration derived from environment variables.
 */
export interface PhoneVerificationConfig {
  /** Whether phone verification is globally enabled */
  enabled: boolean;
  /** OTP code length (default: 6) */
  otpLength: number;
  /** OTP expiry in minutes (default: 5) */
  otpExpiryMinutes: number;
  /** Resend cooldown in seconds (default: 60) */
  resendCooldownSeconds: number;
  /** Gradual rollout percentage (default: 100) */
  rolloutPercentage: number;
}

/**
 * Get the full phone verification configuration from environment variables.
 * Returns safe defaults when env vars are missing or invalid.
 */
export function getPhoneVerificationConfig(): PhoneVerificationConfig {
  return {
    enabled: isPhoneVerificationEnabled(),
    otpLength: parseInt(process.env.NEXT_PUBLIC_OTP_LENGTH || '6', 10) || 6,
    otpExpiryMinutes: parseInt(process.env.NEXT_PUBLIC_OTP_EXPIRY_MINUTES || '5', 10) || 5,
    resendCooldownSeconds: parseInt(process.env.NEXT_PUBLIC_OTP_RESEND_COOLDOWN_SECONDS || '60', 10) || 60,
    rolloutPercentage: parseInt(process.env.NEXT_PUBLIC_PHONE_ROLLOUT_PERCENTAGE || '100', 10) || 100,
  };
}

/**
 * 2FA configuration derived from environment variables.
 */
export interface TwoFactorConfig {
  /** Whether 2FA is globally enabled */
  enabled: boolean;
  /** Gradual rollout percentage (default: 100) */
  rolloutPercentage: number;
}

/**
 * Get the full 2FA configuration from environment variables.
 */
export function get2FAConfig(): TwoFactorConfig {
  return {
    enabled: is2FAEnabled(),
    rolloutPercentage: parseInt(process.env.NEXT_PUBLIC_2FA_ROLLOUT_PERCENTAGE || '100', 10) || 100,
  };
}
