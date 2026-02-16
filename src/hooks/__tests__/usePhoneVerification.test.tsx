/**
 * Unit Tests for usePhoneVerification Hook
 * 
 * Tests cover:
 * - Initial state
 * - Send verification flow (Firebase Phone Auth)
 * - Verify code flow (success and failure)
 * - Resend code flow with cooldown
 * - Timer countdown (expiry and cooldown)
 * - Error handling
 * - Cleanup on unmount
 * - Profile update integration
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { usePhoneVerification } from '../usePhoneVerification';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Mock Firebase phone auth
jest.mock('@/lib/firebase/phone-auth', () => ({
  sendFirebasePhoneVerification: jest.fn(),
  verifyFirebasePhoneCode: jest.fn(),
  clearRecaptchaVerifier: jest.fn(),
  isFirebasePhoneAuthAvailable: jest.fn().mockReturnValue(true),
}));

import {
  sendFirebasePhoneVerification,
  verifyFirebasePhoneCode,
  clearRecaptchaVerifier,
  isFirebasePhoneAuthAvailable,
} from '@/lib/firebase/phone-auth';

// Mock other dependencies
jest.mock('@/contexts/AuthContext');
jest.mock('sonner');

describe('usePhoneVerification', () => {
  const mockUpdateUserProfile = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Mock AuthContext
    (useAuth as jest.Mock).mockReturnValue({
      updateUserProfile: mockUpdateUserProfile,
    });

    // Mock toast
    (toast.success as jest.Mock).mockImplementation(() => {});
    (toast.error as jest.Mock).mockImplementation(() => {});

    // Default: Firebase Phone Auth is available
    (isFirebasePhoneAuthAvailable as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // ============================================================================
  // Initial State Tests
  // ============================================================================

  describe('Initial State', () => {
    it('should initialize with idle state', () => {
      const { result } = renderHook(() => usePhoneVerification());

      expect(result.current.state).toBe('idle');
      expect(result.current.phoneNumber).toBeNull();
      expect(result.current.isVerified).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.canResend).toBe(false);
      expect(result.current.cooldownSeconds).toBe(0);
      expect(result.current.expirySeconds).toBe(0);
      expect(result.current.attempts).toBe(0);
      expect(result.current.attemptsRemaining).toBe(3);
    });
  });

  // ============================================================================
  // Send Verification Tests
  // ============================================================================

  describe('sendVerification', () => {
    it('should send OTP successfully via Firebase Phone Auth', async () => {
      (sendFirebasePhoneVerification as jest.Mock).mockResolvedValue('test-confirmation-result');

      const { result } = renderHook(() => usePhoneVerification());

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      expect(result.current.state).toBe('sent');
      expect(result.current.phoneNumber).toBe('+639171234567');
      expect(result.current.cooldownSeconds).toBe(60);
      expect(result.current.expirySeconds).toBeGreaterThan(0);
      expect(sendFirebasePhoneVerification).toHaveBeenCalledWith('+639171234567');
      expect(toast.success).toHaveBeenCalledWith('Verification code sent via SMS. Check your phone.');
    });

    it('should handle invalid phone number error', async () => {
      const mockError = { code: 'auth/invalid-phone-number', message: 'Invalid phone number' };
      (sendFirebasePhoneVerification as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => 
        usePhoneVerification({ onError: mockOnError })
      );

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      expect(result.current.state).toBe('error');
      expect(result.current.error).toBe('Invalid phone number. Use format: 09XX XXX XXXX');
      expect(toast.error).toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalled();
      expect(clearRecaptchaVerifier).toHaveBeenCalled();
    });

    it('should handle too many requests error', async () => {
      const mockError = { code: 'auth/too-many-requests', message: 'Too many requests' };
      (sendFirebasePhoneVerification as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => usePhoneVerification());

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      expect(result.current.state).toBe('error');
      expect(result.current.error).toContain('Too many attempts');
    });

    it('should handle quota exceeded error', async () => {
      const mockError = { code: 'auth/quota-exceeded', message: 'Quota exceeded' };
      (sendFirebasePhoneVerification as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => usePhoneVerification());

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      expect(result.current.state).toBe('error');
      expect(result.current.error).toContain('SMS quota exceeded');
    });

    it('should handle internal error', async () => {
      const mockError = { code: 'auth/internal-error', message: 'Internal error' };
      (sendFirebasePhoneVerification as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => usePhoneVerification());

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      expect(result.current.state).toBe('error');
      expect(result.current.error).toContain('Phone verification service error');
    });

    it('should handle reCAPTCHA failure', async () => {
      const mockError = { code: 'auth/captcha-check-failed', message: 'Captcha failed' };
      (sendFirebasePhoneVerification as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => usePhoneVerification());

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      expect(result.current.state).toBe('error');
      expect(result.current.error).toContain('reCAPTCHA verification failed');
    });

    it('should throw error when Firebase Phone Auth is not available', async () => {
      (isFirebasePhoneAuthAvailable as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() => usePhoneVerification());

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      expect(result.current.state).toBe('error');
      expect(result.current.error).toContain('not available');
    });

    it('should reset attempts on new send', async () => {
      (sendFirebasePhoneVerification as jest.Mock).mockResolvedValue('test-id');

      const { result } = renderHook(() => usePhoneVerification());

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      expect(result.current.attempts).toBe(0);
    });
  });

  // ============================================================================
  // Verify Code Tests
  // ============================================================================

  describe('verifyCode', () => {
    it('should verify OTP successfully via Firebase', async () => {
      (sendFirebasePhoneVerification as jest.Mock).mockResolvedValue('test-id');
      (verifyFirebasePhoneCode as jest.Mock).mockResolvedValue(true);
      (mockUpdateUserProfile as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => 
        usePhoneVerification({ onSuccess: mockOnSuccess })
      );

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      let verifyResult: boolean = false;
      await act(async () => {
        verifyResult = await result.current.verifyCode('123456');
      });

      expect(verifyResult).toBe(true);
      expect(result.current.state).toBe('success');
      expect(result.current.isVerified).toBe(true);
      expect(result.current.attempts).toBe(1);
      expect(verifyFirebasePhoneCode).toHaveBeenCalledWith('123456');
      expect(mockUpdateUserProfile).toHaveBeenCalledWith({
        phone: '+639171234567',
      });
      expect(toast.success).toHaveBeenCalledWith('Phone number verified successfully!');
      expect(mockOnSuccess).toHaveBeenCalledWith('+639171234567');
    });

    it('should handle invalid verification code', async () => {
      (sendFirebasePhoneVerification as jest.Mock).mockResolvedValue('test-id');
      const mockError = { code: 'auth/invalid-verification-code', message: 'Invalid code' };
      (verifyFirebasePhoneCode as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => usePhoneVerification());

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      let verifyResult: boolean = false;
      await act(async () => {
        verifyResult = await result.current.verifyCode('000000');
      });

      expect(verifyResult).toBe(false);
      expect(result.current.state).toBe('sent');
      expect(result.current.isVerified).toBe(false);
      expect(result.current.error).toContain('Invalid code');
    });

    it('should handle expired code', async () => {
      (sendFirebasePhoneVerification as jest.Mock).mockResolvedValue('test-id');
      const mockError = { code: 'auth/code-expired', message: 'Code expired' };
      (verifyFirebasePhoneCode as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => usePhoneVerification());

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      let verifyResult: boolean = false;
      await act(async () => {
        verifyResult = await result.current.verifyCode('123456');
      });

      expect(verifyResult).toBe(false);
      expect(result.current.error).toContain('expired');
    });

    it('should handle verify without phone number', async () => {
      const { result } = renderHook(() => usePhoneVerification());

      let verifyResult: boolean = false;
      await act(async () => {
        verifyResult = await result.current.verifyCode('123456');
      });

      expect(verifyResult).toBe(false);
      expect(result.current.error).toBe('No phone number set');
    });

    it('should handle verification error with onError callback', async () => {
      (sendFirebasePhoneVerification as jest.Mock).mockResolvedValue('test-id');
      const mockError = { code: 'auth/session-expired', message: 'Session expired' };
      (verifyFirebasePhoneCode as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => 
        usePhoneVerification({ onError: mockOnError })
      );

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      let verifyResult: boolean = false;
      await act(async () => {
        verifyResult = await result.current.verifyCode('123456');
      });

      expect(verifyResult).toBe(false);
      expect(result.current.state).toBe('error');
      expect(mockOnError).toHaveBeenCalled();
    });

    it('should not fail verification if profile update fails', async () => {
      (sendFirebasePhoneVerification as jest.Mock).mockResolvedValue('test-id');
      (verifyFirebasePhoneCode as jest.Mock).mockResolvedValue(true);
      (mockUpdateUserProfile as jest.Mock).mockRejectedValue(new Error('Profile update failed'));

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const { result } = renderHook(() => usePhoneVerification());

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      let verifyResult: boolean = false;
      await act(async () => {
        verifyResult = await result.current.verifyCode('123456');
      });

      expect(verifyResult).toBe(true);
      expect(result.current.state).toBe('success');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to update profile after verification:',
        expect.any(Error)
      );

      consoleWarnSpy.mockRestore();
    });

    it('should skip profile update when autoUpdateProfile is false', async () => {
      (sendFirebasePhoneVerification as jest.Mock).mockResolvedValue('test-id');
      (verifyFirebasePhoneCode as jest.Mock).mockResolvedValue(true);

      const { result } = renderHook(() => 
        usePhoneVerification({ autoUpdateProfile: false })
      );

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      await act(async () => {
        await result.current.verifyCode('123456');
      });

      expect(mockUpdateUserProfile).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Resend Code Tests
  // ============================================================================

  describe('resendCode', () => {
    it('should resend OTP after cooldown expires', async () => {
      (sendFirebasePhoneVerification as jest.Mock).mockResolvedValue('test-id');

      const { result } = renderHook(() => usePhoneVerification());

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      // Fast-forward 60 seconds to expire cooldown
      act(() => {
        jest.advanceTimersByTime(60000);
      });

      expect(result.current.canResend).toBe(true);
      expect(result.current.cooldownSeconds).toBe(0);

      await act(async () => {
        await result.current.resendCode();
      });

      expect(result.current.state).toBe('sent');
      expect(result.current.cooldownSeconds).toBe(60);
      expect(sendFirebasePhoneVerification).toHaveBeenCalledTimes(2);
      expect(toast.success).toHaveBeenCalledWith('New verification code sent via SMS.');
    });

    it('should not allow resend during cooldown', async () => {
      (sendFirebasePhoneVerification as jest.Mock).mockResolvedValue('test-id');

      const { result } = renderHook(() => usePhoneVerification());

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      expect(result.current.canResend).toBe(false);
      expect(result.current.cooldownSeconds).toBe(60);

      await act(async () => {
        await result.current.resendCode();
      });

      expect(result.current.error).toContain('Please wait');
      expect(sendFirebasePhoneVerification).toHaveBeenCalledTimes(1);
    });

    it('should handle resend without phone number', async () => {
      const { result } = renderHook(() => usePhoneVerification());

      await act(async () => {
        await result.current.resendCode();
      });

      expect(result.current.error).toBe('No phone number set');
    });

    it('should handle resend failure', async () => {
      (sendFirebasePhoneVerification as jest.Mock)
        .mockResolvedValueOnce('test-id')
        .mockRejectedValueOnce({ code: 'auth/too-many-requests', message: 'Too many requests' });

      const { result } = renderHook(() => 
        usePhoneVerification({ onError: mockOnError })
      );

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      act(() => {
        jest.advanceTimersByTime(60000);
      });

      await act(async () => {
        await result.current.resendCode();
      });

      expect(result.current.state).toBe('error');
      expect(result.current.error).toContain('Too many attempts');
      expect(mockOnError).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Timer Tests
  // ============================================================================

  describe('Timers', () => {
    it('should countdown cooldown timer', async () => {
      (sendFirebasePhoneVerification as jest.Mock).mockResolvedValue('test-id');

      const { result } = renderHook(() => usePhoneVerification());

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      expect(result.current.cooldownSeconds).toBe(60);

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(result.current.cooldownSeconds).toBe(50);

      act(() => {
        jest.advanceTimersByTime(20000);
      });

      expect(result.current.cooldownSeconds).toBe(30);
    });

    it('should countdown expiry timer', async () => {
      (sendFirebasePhoneVerification as jest.Mock).mockResolvedValue('test-id');

      const { result } = renderHook(() => usePhoneVerification());

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      expect(result.current.expirySeconds).toBeGreaterThan(290);

      act(() => {
        jest.advanceTimersByTime(60000);
      });

      expect(result.current.expirySeconds).toBeLessThan(250);
    });

    it('should transition to error state when OTP expires', async () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);

      (sendFirebasePhoneVerification as jest.Mock).mockResolvedValue('test-id');

      const { result } = renderHook(() => usePhoneVerification());

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      // Advance past the 5-minute expiry
      jest.spyOn(Date, 'now').mockReturnValue(now + 310000);
      act(() => {
        jest.advanceTimersByTime(310000);
      });

      expect(result.current.expirySeconds).toBe(0);
      jest.restoreAllMocks();
    });

    it('should clear timers on unmount', async () => {
      (sendFirebasePhoneVerification as jest.Mock).mockResolvedValue('test-id');

      const { result, unmount } = renderHook(() => usePhoneVerification());

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();

      clearIntervalSpy.mockRestore();
    });
  });

  // ============================================================================
  // Reset Tests
  // ============================================================================

  describe('reset', () => {
    it('should reset to initial state', async () => {
      (sendFirebasePhoneVerification as jest.Mock).mockResolvedValue('test-id');

      const { result } = renderHook(() => usePhoneVerification());

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      expect(result.current.state).toBe('sent');
      expect(result.current.phoneNumber).toBe('+639171234567');

      act(() => {
        result.current.reset();
      });

      expect(result.current.state).toBe('idle');
      expect(result.current.phoneNumber).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.attempts).toBe(0);
      expect(result.current.cooldownSeconds).toBe(0);
      expect(result.current.expirySeconds).toBe(0);
      expect(clearRecaptchaVerifier).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Computed Values Tests
  // ============================================================================

  describe('Computed Values', () => {
    it('should compute canResend correctly', async () => {
      (sendFirebasePhoneVerification as jest.Mock).mockResolvedValue('test-id');

      const { result } = renderHook(() => usePhoneVerification());

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      expect(result.current.canResend).toBe(false);

      act(() => {
        jest.advanceTimersByTime(60000);
      });

      expect(result.current.canResend).toBe(true);
    });

    it('should compute attemptsRemaining correctly', async () => {
      (sendFirebasePhoneVerification as jest.Mock).mockResolvedValue('test-id');
      const mockError = { code: 'auth/invalid-verification-code', message: 'Invalid' };
      (verifyFirebasePhoneCode as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => usePhoneVerification());

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      expect(result.current.attemptsRemaining).toBe(3);

      await act(async () => {
        await result.current.verifyCode('000000');
      });

      expect(result.current.attemptsRemaining).toBe(2);
    });

    it('should compute isLoading correctly', async () => {
      (sendFirebasePhoneVerification as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve('test-id'), 1000))
      );

      const { result } = renderHook(() => usePhoneVerification());

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.sendVerification('+639171234567');
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });
});
