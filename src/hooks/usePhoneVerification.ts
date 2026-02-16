/**
 * usePhoneVerification Hook
 * 
 * Custom React hook for managing the phone verification flow with OTP.
 * Handles sending, verifying, and resending OTP codes with state management,
 * timers, cooldowns, and error handling.
 * 
 * Features:
 * - State machine for verification flow (idle, sending, verifying, success, error)
 * - Timer countdown for OTP expiry (5 minutes)
 * - Cooldown management for resend button (60 seconds)
 * - Integration with OTP API (send/verify/resend endpoints)
 * - AuthContext integration for profile updates on success
 * - Automatic cleanup of timers on unmount
 * - Error recovery with retry logic (max 3 attempts)
 */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  sendFirebasePhoneVerification,
  verifyFirebasePhoneCode,
  clearRecaptchaVerifier,
  isFirebasePhoneAuthAvailable,
} from "@/lib/firebase/phone-auth";

// ============================================================================
// Types
// ============================================================================

/**
 * Verification state machine
 * - idle: No verification in progress
 * - sending: Sending OTP code
 * - sent: OTP sent successfully, waiting for verification
 * - verifying: Verifying OTP code
 * - success: Verification successful
 * - error: Error occurred
 */
export type VerificationState = 'idle' | 'sending' | 'sent' | 'verifying' | 'success' | 'error';

/**
 * Hook options
 */
export interface UsePhoneVerificationOptions {
  /** Called when verification succeeds */
  onSuccess?: (phoneNumber: string) => void;
  /** Called when verification fails */
  onError?: (error: Error) => void;
  /** Auto-update AuthContext profile on success (default: true) */
  autoUpdateProfile?: boolean;
}

/**
 * Hook return value
 */
export interface UsePhoneVerificationReturn {
  /** Current phone number being verified */
  phoneNumber: string | null;
  /** Set phone number to verify */
  setPhoneNumber: (phone: string) => void;
  /** Current verification state */
  state: VerificationState;
  /** Whether verification is successful */
  isVerified: boolean;
  /** Whether any async operation is in progress */
  isLoading: boolean;
  /** Current error message */
  error: string | null;
  /** Whether OTP can be resent (cooldown expired) */
  canResend: boolean;
  /** Remaining cooldown seconds (0-60) */
  cooldownSeconds: number;
  /** Remaining OTP expiry seconds (0-300) */
  expirySeconds: number;
  /** Number of verification attempts made */
  attempts: number;
  /** Remaining attempts before lock (3 - attempts) */
  attemptsRemaining: number;
  /** Send OTP to phone number */
  sendVerification: (phoneNumber: string) => Promise<void>;
  /** Verify OTP code */
  verifyCode: (code: string) => Promise<boolean>;
  /** Resend OTP code (enforces cooldown) */
  resendCode: () => Promise<void>;
  /** Reset to initial state */
  reset: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const OTP_EXPIRY_SECONDS = 300; // 5 minutes
const RESEND_COOLDOWN_SECONDS = 60; // 60 seconds
const MAX_ATTEMPTS = 3;

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Custom hook for phone verification with OTP
 * 
 * @param options - Configuration options
 * @returns Verification state and control functions
 * 
 * @example
 * ```tsx
 * const {
 *   phoneNumber,
 *   setPhoneNumber,
 *   state,
 *   sendVerification,
 *   verifyCode,
 *   resendCode,
 *   canResend,
 *   cooldownSeconds,
 *   expirySeconds,
 * } = usePhoneVerification({
 *   onSuccess: (phone) => console.log('Verified:', phone),
 *   autoUpdateProfile: true,
 * });
 * 
 * // Send OTP
 * await sendVerification('+639171234567');
 * 
 * // Verify OTP
 * const verified = await verifyCode('123456');
 * 
 * // Resend OTP
 * if (canResend) {
 *   await resendCode();
 * }
 * ```
 */
export function usePhoneVerification(
  options: UsePhoneVerificationOptions = {}
): UsePhoneVerificationReturn {
  const { onSuccess, onError, autoUpdateProfile = true } = options;
  const { updateUserProfile } = useAuth();

  // ============================================================================
  // State
  // ============================================================================

  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [state, setState] = useState<VerificationState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<number>(0);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const [expirySeconds, setExpirySeconds] = useState<number>(0);

  // Track which SMS provider is being used for this verification session
  const usingFirebaseRef = useRef<boolean>(false);

  // ============================================================================
  // Refs for timer management
  // ============================================================================

  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const expiryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSentAtRef = useRef<number | null>(null);
  const expiresAtRef = useRef<number | null>(null);

  // ============================================================================
  // Computed Values
  // ============================================================================

  const isVerified = state === 'success';
  const isLoading = state === 'sending' || state === 'verifying';
  const canResend = cooldownSeconds === 0 && state === 'sent' && expirySeconds > 0;
  const attemptsRemaining = Math.max(0, MAX_ATTEMPTS - attempts);

  // ============================================================================
  // Timer Management
  // ============================================================================

  /**
   * Start cooldown timer for resend button
   */
  const startCooldownTimer = useCallback(() => {
    // Clear existing timer
    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
    }

    const now = Date.now();
    lastSentAtRef.current = now;
    setCooldownSeconds(RESEND_COOLDOWN_SECONDS);

    // Countdown every second
    cooldownTimerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - now) / 1000);
      const remaining = Math.max(0, RESEND_COOLDOWN_SECONDS - elapsed);
      setCooldownSeconds(remaining);

      if (remaining === 0 && cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
      }
    }, 1000);
  }, []);

  /**
   * Start expiry timer for OTP
   */
  const startExpiryTimer = useCallback((expiresAt: string) => {
    // Clear existing timer
    if (expiryTimerRef.current) {
      clearInterval(expiryTimerRef.current);
    }

    const expiryTime = new Date(expiresAt).getTime();
    expiresAtRef.current = expiryTime;

    // Update immediately
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
    setExpirySeconds(remaining);

    // Countdown every second
    expiryTimerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - now) / 1000);
      const timeRemaining = Math.max(0, remaining - elapsed);
      setExpirySeconds(timeRemaining);

      if (timeRemaining === 0 && expiryTimerRef.current) {
        clearInterval(expiryTimerRef.current);
        expiryTimerRef.current = null;
        setState('error');
        setError('OTP has expired. Please request a new code.');
      }
    }, 1000);
  }, []);

  /**
   * Clear all timers
   */
  const clearTimers = useCallback(() => {
    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
    }
    if (expiryTimerRef.current) {
      clearInterval(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
  }, []);

  // ============================================================================
  // Cleanup on unmount
  // ============================================================================

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  // ============================================================================
  // API Functions
  // ============================================================================

  /**
   * Send OTP verification code to phone number.
   *
   * Uses Firebase Phone Auth for SMS delivery on all environments.
   * Firebase handles reCAPTCHA verification and SMS sending through
   * Google's infrastructure. Localhost is supported natively by Firebase.
   */
  const sendVerification = useCallback(
    async (phone: string) => {
      try {
        setState('sending');
        setError(null);
        setPhoneNumber(phone);
        setAttempts(0);

        // Use Firebase Phone Auth for real SMS delivery on all environments
        if (isFirebasePhoneAuthAvailable()) {
          await sendFirebasePhoneVerification(phone);
          usingFirebaseRef.current = true;

          setState('sent');
          startCooldownTimer();
          const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
          startExpiryTimer(expiresAt);

          const isTest = process.env.NEXT_PUBLIC_PHONE_AUTH_TEST_MODE === 'true';
          if (isTest) {
            toast.info('Test mode: Use the code configured in Firebase Console.');
          } else {
            toast.success('SMS sent! Check your phone for the 6-digit code.');
          }
          return;
        }

        // SSR fallback (should not normally reach here in browser)
        throw new Error('Firebase Phone Auth is not available. Please reload the page and try again.');
      } catch (err) {
        const error = err as { code?: string; message?: string };
        setState('error');
        clearRecaptchaVerifier();

        let msg = error.message || 'Failed to send verification code';
        if (error.code === 'auth/invalid-phone-number') {
          msg = 'Invalid phone number. Use format: 09XX XXX XXXX';
        } else if (error.code === 'auth/captcha-check-failed') {
          msg = 'reCAPTCHA verification failed. Please refresh the page and try again.';
        } else if (error.code === 'auth/missing-phone-number') {
          msg = 'Please enter a phone number first.';
        } else if (error.code === 'auth/too-many-requests') {
          msg = 'Too many attempts. Please wait a few minutes before trying again.';
        } else if (error.code === 'auth/quota-exceeded') {
          msg = 'SMS quota exceeded for today. Please try again tomorrow.';
        } else if (error.code === 'auth/operation-not-allowed') {
          msg = 'Phone sign-in is not enabled. Enable Phone provider in Firebase Console > Authentication > Sign-in method.';
        } else if (error.code === 'auth/internal-error') {
          msg = 'Phone verification service error. Please ensure Phone provider is enabled in Firebase Console and reCAPTCHA is not blocked.';
        }

        console.error('[PhoneVerification] Send failed:', error.code || '(no code)', msg);
        usingFirebaseRef.current = false;

        setError(msg);
        toast.error(msg);
        onError?.(new Error(msg));
      }
    },
    [startCooldownTimer, startExpiryTimer, onError]
  );

  /**
   * Verify OTP code using Firebase Phone Auth.
   */
  const verifyCode = useCallback(
    async (code: string): Promise<boolean> => {
      if (!phoneNumber) {
        setError('No phone number set');
        return false;
      }

      try {
        setState('verifying');
        setError(null);
        setAttempts((prev) => prev + 1);

        await verifyFirebasePhoneCode(code);

        setState('success');
        clearTimers();

        if (autoUpdateProfile) {
          try {
            await updateUserProfile({ phone: phoneNumber });
          } catch (profileError) {
            console.warn('Failed to update profile after verification:', profileError);
          }
        }

        toast.success('Phone number verified successfully!');
        onSuccess?.(phoneNumber);
        return true;
      } catch (err) {
        const error = err as { code?: string; message?: string };

        let msg = error.message || 'Verification failed';
        if (error.code === 'auth/invalid-verification-code') {
          msg = 'Invalid code. Please try again.';
          setState('sent');
        } else if (error.code === 'auth/code-expired') {
          msg = 'Code expired. Please request a new one.';
          setState('sent');
        } else if (error.code === 'auth/session-expired') {
          msg = 'Verification session expired. Please request a new code.';
          setState('error');
        } else {
          setState('error');
        }

        setError(msg);
        toast.error(msg);
        onError?.(new Error(msg));
        return false;
      }
    },
    [phoneNumber, clearTimers, autoUpdateProfile, updateUserProfile, onSuccess, onError]
  );

  /**
   * Resend OTP code (enforces cooldown).
   * Uses Firebase Phone Auth for SMS delivery on all environments.
   */
  const resendCode = useCallback(async () => {
    if (!phoneNumber) {
      setError('No phone number set');
      return;
    }

    if (!canResend) {
      setError(`Please wait ${cooldownSeconds} seconds before resending`);
      return;
    }

    try {
      setState('sending');
      setError(null);

      if (isFirebasePhoneAuthAvailable()) {
        await sendFirebasePhoneVerification(phoneNumber);
        usingFirebaseRef.current = true;

        setState('sent');
        startCooldownTimer();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
        startExpiryTimer(expiresAt);

        toast.success('New SMS code sent! Check your phone.');
        return;
      }

      throw new Error('Firebase Phone Auth is not available. Please reload the page and try again.');
    } catch (err) {
      const error = err as { code?: string; message?: string };
      setState('error');
      clearRecaptchaVerifier();
      usingFirebaseRef.current = false;

      let msg = error.message || 'Failed to resend verification code';
      if (error.code === 'auth/too-many-requests') {
        msg = 'Too many attempts. Please wait a few minutes.';
      } else if (error.code === 'auth/quota-exceeded') {
        msg = 'SMS quota exceeded for today. Please try again tomorrow.';
      }

      console.error('[PhoneVerification] Resend failed:', error.code || '(no code)', msg);

      setError(msg);
      toast.error(msg);
      onError?.(new Error(msg));
    }
  }, [phoneNumber, canResend, cooldownSeconds, startCooldownTimer, startExpiryTimer, onError]);

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    setState('idle');
    setPhoneNumber(null);
    setError(null);
    setAttempts(0);
    setCooldownSeconds(0);
    setExpirySeconds(0);
    usingFirebaseRef.current = false;
    clearRecaptchaVerifier();
    clearTimers();
    lastSentAtRef.current = null;
    expiresAtRef.current = null;
  }, [clearTimers]);

  // ============================================================================
  // Return
  // ============================================================================

  return {
    phoneNumber,
    setPhoneNumber,
    state,
    isVerified,
    isLoading,
    error,
    canResend,
    cooldownSeconds,
    expirySeconds,
    attempts,
    attemptsRemaining,
    sendVerification,
    verifyCode,
    resendCode,
    reset,
  };
}
