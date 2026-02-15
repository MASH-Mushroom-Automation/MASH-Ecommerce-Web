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
import { OTPApi, type SendOTPData, type VerifyOTPData } from "@/lib/api/otp";
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
  const [verificationId, setVerificationId] = useState<string | null>(null);

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
   * Tries Firebase Phone Auth first (sends real SMS), falls back to API route (dev mode).
   */
  const sendVerification = useCallback(
    async (phone: string) => {
      try {
        setState('sending');
        setError(null);
        setPhoneNumber(phone);
        setAttempts(0);

        // Try Firebase Phone Auth first
        if (isFirebasePhoneAuthAvailable()) {
          try {
            await sendFirebasePhoneVerification(phone);
            usingFirebaseRef.current = true;

            setState('sent');
            startCooldownTimer();
            // Firebase codes expire in 5 minutes
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
            startExpiryTimer(expiresAt);

            toast.success(`Verification code sent to ${phone.slice(0, 4)}****${phone.slice(-2)}. Check your SMS.`);
            return;
          } catch (firebaseErr) {
            // Firebase Phone Auth failed - fall back to API route
            console.warn('[PhoneVerification] Firebase Phone Auth failed, using API fallback:', firebaseErr);
            clearRecaptchaVerifier();
            usingFirebaseRef.current = false;
          }
        }

        // Fallback: Use API route (dev mode shows code in toast)
        const response = await OTPApi.sendOTP(phone, 'PHONE_VERIFICATION');

        if (response.success && response.data) {
          const data = response.data as SendOTPData & { verificationId?: string; devCode?: string };
          
          if (data.verificationId) {
            setVerificationId(data.verificationId);
          }

          setState('sent');
          startCooldownTimer();
          startExpiryTimer(data.expiresAt);

          if (data.devCode) {
            toast.success(`Code sent! Dev code: ${data.devCode}`, { duration: 15000 });
          } else {
            toast.success(`Verification code sent to ${data.phoneNumber}`);
          }
        } else {
          throw new Error(response.message || 'Failed to send OTP');
        }
      } catch (err) {
        const error = err as Error;
        setState('error');
        setError(error.message || 'Failed to send verification code');
        toast.error(error.message || 'Failed to send verification code');
        onError?.(error);
      }
    },
    [startCooldownTimer, startExpiryTimer, onError]
  );

  /**
   * Verify OTP code.
   * Uses Firebase Phone Auth confirm if Firebase was used for sending,
   * otherwise falls back to API route verification.
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

        // If we used Firebase Phone Auth to send, verify with Firebase
        if (usingFirebaseRef.current) {
          try {
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
          } catch (firebaseErr) {
            const fbError = firebaseErr as { code?: string; message?: string };
            setState('sent');
            const msg = fbError.code === 'auth/invalid-verification-code'
              ? 'Invalid code. Please try again.'
              : fbError.code === 'auth/code-expired'
                ? 'Code expired. Please request a new one.'
                : fbError.message || 'Verification failed';
            setError(msg);
            toast.error(msg);
            return false;
          }
        }

        // Fallback: API route verification
        const response = await OTPApi.verifyOTP(phoneNumber, code);

        if (response.success && response.data) {
          const data = response.data as VerifyOTPData;
          
          if (data.verified) {
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
          } else {
            setState('sent');
            const remainingAttempts = data.attemptsRemaining ?? (MAX_ATTEMPTS - attempts);
            setError(`Invalid code. ${remainingAttempts} attempts remaining.`);
            toast.error(`Invalid code. ${remainingAttempts} attempts remaining.`);
            return false;
          }
        } else {
          throw new Error(response.message || 'Verification failed');
        }
      } catch (err) {
        const error = err as Error;
        setState('error');
        setError(error.message || 'Verification failed');
        toast.error(error.message || 'Verification failed');
        onError?.(error);
        return false;
      }
    },
    [phoneNumber, attempts, clearTimers, autoUpdateProfile, updateUserProfile, onSuccess, onError]
  );

  /**
   * Resend OTP code (enforces cooldown).
   * Re-sends via Firebase if that was the original provider, otherwise API route.
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

      // If we used Firebase, re-send via Firebase
      if (usingFirebaseRef.current && isFirebasePhoneAuthAvailable()) {
        try {
          await sendFirebasePhoneVerification(phoneNumber);

          setState('sent');
          startCooldownTimer();
          const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
          startExpiryTimer(expiresAt);

          toast.success('Verification code resent. Check your SMS.');
          return;
        } catch (firebaseErr) {
          console.warn('[PhoneVerification] Firebase resend failed, using API fallback:', firebaseErr);
          clearRecaptchaVerifier();
          usingFirebaseRef.current = false;
        }
      }

      // Fallback: API route
      const response = await OTPApi.resendOTP(phoneNumber);

      if (response.success && response.data) {
        const data = response.data as SendOTPData & { verificationId?: string; devCode?: string };
        
        if (data.verificationId) {
          setVerificationId(data.verificationId);
        }

        setState('sent');
        startCooldownTimer();
        startExpiryTimer(data.expiresAt);

        if (data.devCode) {
          toast.success(`Code resent! Dev code: ${data.devCode}`, { duration: 15000 });
        } else {
          toast.success('Verification code resent');
        }
      } else {
        throw new Error(response.message || 'Failed to resend OTP');
      }
    } catch (err) {
      const error = err as Error;
      setState('error');
      setError(error.message || 'Failed to resend verification code');
      toast.error(error.message || 'Failed to resend verification code');
      onError?.(error);
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
    setVerificationId(null);
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
