/**
 * Unit Tests for usePhoneVerification Hook
 * 
 * Tests cover:
 * - Initial state
 * - Send verification flow
 * - Verify code flow (success and failure)
 * - Resend code flow with cooldown
 * - Timer countdown (expiry and cooldown)
 * - Error handling
 * - Cleanup on unmount
 * - Profile update integration
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { usePhoneVerification } from '../usePhoneVerification';
import { OTPApi } from '@/lib/api/otp';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('@/lib/api/otp');
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
    it('should send OTP successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          success: true,
          message: 'OTP sent successfully',
          phoneNumber: '+63 *** *** **67',
          expiresAt: new Date(Date.now() + 300000).toISOString(), // 5 minutes
          expiresIn: 300,
        },
      };

      (OTPApi.sendOTP as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => usePhoneVerification());

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      expect(result.current.state).toBe('sent');
      expect(result.current.phoneNumber).toBe('+639171234567');
      expect(result.current.cooldownSeconds).toBe(60);
      expect(result.current.expirySeconds).toBeGreaterThan(0);
      expect(OTPApi.sendOTP).toHaveBeenCalledWith('+639171234567', 'PHONE_VERIFICATION');
      expect(toast.success).toHaveBeenCalledWith('Verification code sent to +63 *** *** **67');
    });

    it('should handle send OTP failure', async () => {
      const mockError = new Error('Rate limit exceeded');
      (OTPApi.sendOTP as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => 
        usePhoneVerification({ onError: mockOnError })
      );

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      expect(result.current.state).toBe('error');
      expect(result.current.error).toBe('Rate limit exceeded');
      expect(toast.error).toHaveBeenCalledWith('Rate limit exceeded');
      expect(mockOnError).toHaveBeenCalledWith(mockError);
    });

    it('should reset attempts on new send', async () => {
      const mockResponse = {
        success: true,
        data: {
          success: true,
          message: 'OTP sent',
          phoneNumber: '+63 *** *** **67',
          expiresAt: new Date(Date.now() + 300000).toISOString(),
          expiresIn: 300,
        },
      };

      (OTPApi.sendOTP as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => usePhoneVerification());

      // Set initial attempts
      act(() => {
        // Simulate previous attempts
        result.current.verifyCode('123456'); // Will fail but increment attempts
      });

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
    it('should verify OTP successfully', async () => {
      // First send OTP
      const sendResponse = {
        success: true,
        data: {
          success: true,
          message: 'OTP sent',
          phoneNumber: '+63 *** *** **67',
          expiresAt: new Date(Date.now() + 300000).toISOString(),
          expiresIn: 300,
        },
      };

      (OTPApi.sendOTP as jest.Mock).mockResolvedValue(sendResponse);

      const { result } = renderHook(() => 
        usePhoneVerification({ onSuccess: mockOnSuccess })
      );

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      // Then verify
      const verifyResponse = {
        success: true,
        data: {
          success: true,
          verified: true,
          message: 'Phone verified successfully',
        },
      };

      (OTPApi.verifyOTP as jest.Mock).mockResolvedValue(verifyResponse);
      (mockUpdateUserProfile as jest.Mock).mockResolvedValue(undefined);

      let verifyResult: boolean = false;
      await act(async () => {
        verifyResult = await result.current.verifyCode('123456');
      });

      expect(verifyResult).toBe(true);
      expect(result.current.state).toBe('success');
      expect(result.current.isVerified).toBe(true);
      expect(result.current.attempts).toBe(1);
      expect(OTPApi.verifyOTP).toHaveBeenCalledWith('+639171234567', '123456');
      expect(mockUpdateUserProfile).toHaveBeenCalledWith({
        phone: '+639171234567',
      });
      expect(toast.success).toHaveBeenCalledWith('Phone number verified successfully!');
      expect(mockOnSuccess).toHaveBeenCalledWith('+639171234567');
    });

    it('should handle invalid OTP code', async () => {
      // First send OTP
      const sendResponse = {
        success: true,
        data: {
          success: true,
          message: 'OTP sent',
          phoneNumber: '+63 *** *** **67',
          expiresAt: new Date(Date.now() + 300000).toISOString(),
          expiresIn: 300,
        },
      };

      (OTPApi.sendOTP as jest.Mock).mockResolvedValue(sendResponse);

      const { result } = renderHook(() => usePhoneVerification());

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      // Then verify with wrong code
      const verifyResponse = {
        success: true,
        data: {
          success: false,
          verified: false,
          message: 'Invalid OTP',
          attemptsRemaining: 2,
        },
      };

      (OTPApi.verifyOTP as jest.Mock).mockResolvedValue(verifyResponse);

      let verifyResult: boolean = false;
      await act(async () => {
        verifyResult = await result.current.verifyCode('000000');
      });

      expect(verifyResult).toBe(false);
      expect(result.current.state).toBe('sent');
      expect(result.current.isVerified).toBe(false);
      expect(result.current.attempts).toBe(1);
      expect(result.current.error).toContain('Invalid code');
      expect(result.current.error).toContain('2 attempts remaining');
      expect(toast.error).toHaveBeenCalled();
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

    it('should handle verification API error', async () => {
      // First send OTP
      const sendResponse = {
        success: true,
        data: {
          success: true,
          message: 'OTP sent',
          phoneNumber: '+63 *** *** **67',
          expiresAt: new Date(Date.now() + 300000).toISOString(),
          expiresIn: 300,
        },
      };

      (OTPApi.sendOTP as jest.Mock).mockResolvedValue(sendResponse);

      const { result } = renderHook(() => 
        usePhoneVerification({ onError: mockOnError })
      );

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      // Then verify with API error
      const mockError = new Error('Network error');
      (OTPApi.verifyOTP as jest.Mock).mockRejectedValue(mockError);

      let verifyResult: boolean = false;
      await act(async () => {
        verifyResult = await result.current.verifyCode('123456');
      });

      expect(verifyResult).toBe(false);
      expect(result.current.state).toBe('error');
      expect(result.current.error).toBe('Network error');
      expect(mockOnError).toHaveBeenCalledWith(mockError);
    });

    it('should not fail verification if profile update fails', async () => {
      // First send OTP
      const sendResponse = {
        success: true,
        data: {
          success: true,
          message: 'OTP sent',
          phoneNumber: '+63 *** *** **67',
          expiresAt: new Date(Date.now() + 300000).toISOString(),
          expiresIn: 300,
        },
      };

      (OTPApi.sendOTP as jest.Mock).mockResolvedValue(sendResponse);

      const { result } = renderHook(() => usePhoneVerification());

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      // Verify with profile update failure
      const verifyResponse = {
        success: true,
        data: {
          success: true,
          verified: true,
          message: 'Phone verified',
        },
      };

      (OTPApi.verifyOTP as jest.Mock).mockResolvedValue(verifyResponse);
      (mockUpdateUserProfile as jest.Mock).mockRejectedValue(new Error('Profile update failed'));

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      let verifyResult: boolean = false;
      await act(async () => {
        verifyResult = await result.current.verifyCode('123456');
      });

      // Verification should still succeed
      expect(verifyResult).toBe(true);
      expect(result.current.state).toBe('success');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to update profile after verification:',
        expect.any(Error)
      );

      consoleWarnSpy.mockRestore();
    });

    it('should skip profile update when autoUpdateProfile is false', async () => {
      // First send OTP
      const sendResponse = {
        success: true,
        data: {
          success: true,
          message: 'OTP sent',
          phoneNumber: '+63 *** *** **67',
          expiresAt: new Date(Date.now() + 300000).toISOString(),
          expiresIn: 300,
        },
      };

      (OTPApi.sendOTP as jest.Mock).mockResolvedValue(sendResponse);

      const { result } = renderHook(() => 
        usePhoneVerification({ autoUpdateProfile: false })
      );

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      // Verify
      const verifyResponse = {
        success: true,
        data: {
          success: true,
          verified: true,
          message: 'Phone verified',
        },
      };

      (OTPApi.verifyOTP as jest.Mock).mockResolvedValue(verifyResponse);

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
      // First send OTP
      const sendResponse = {
        success: true,
        data: {
          success: true,
          message: 'OTP sent',
          phoneNumber: '+63 *** *** **67',
          expiresAt: new Date(Date.now() + 300000).toISOString(),
          expiresIn: 300,
        },
      };

      (OTPApi.sendOTP as jest.Mock).mockResolvedValue(sendResponse);

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

      // Resend
      const resendResponse = {
        success: true,
        data: {
          success: true,
          message: 'OTP resent',
          phoneNumber: '+63 *** *** **67',
          expiresAt: new Date(Date.now() + 300000).toISOString(),
          expiresIn: 300,
        },
      };

      (OTPApi.resendOTP as jest.Mock).mockResolvedValue(resendResponse);

      await act(async () => {
        await result.current.resendCode();
      });

      expect(result.current.state).toBe('sent');
      expect(result.current.cooldownSeconds).toBe(60);
      expect(OTPApi.resendOTP).toHaveBeenCalledWith('+639171234567');
      expect(toast.success).toHaveBeenCalledWith('Verification code resent');
    });

    it('should not allow resend during cooldown', async () => {
      // First send OTP
      const sendResponse = {
        success: true,
        data: {
          success: true,
          message: 'OTP sent',
          phoneNumber: '+63 *** *** **67',
          expiresAt: new Date(Date.now() + 300000).toISOString(),
          expiresIn: 300,
        },
      };

      (OTPApi.sendOTP as jest.Mock).mockResolvedValue(sendResponse);

      const { result } = renderHook(() => usePhoneVerification());

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      expect(result.current.canResend).toBe(false);
      expect(result.current.cooldownSeconds).toBe(60);

      // Try to resend immediately
      await act(async () => {
        await result.current.resendCode();
      });

      expect(result.current.error).toContain('Please wait');
      expect(OTPApi.resendOTP).not.toHaveBeenCalled();
    });

    it('should handle resend without phone number', async () => {
      const { result } = renderHook(() => usePhoneVerification());

      await act(async () => {
        await result.current.resendCode();
      });

      expect(result.current.error).toBe('No phone number set');
    });

    it('should handle resend API error', async () => {
      // First send OTP
      const sendResponse = {
        success: true,
        data: {
          success: true,
          message: 'OTP sent',
          phoneNumber: '+63 *** *** **67',
          expiresAt: new Date(Date.now() + 300000).toISOString(),
          expiresIn: 300,
        },
      };

      (OTPApi.sendOTP as jest.Mock).mockResolvedValue(sendResponse);

      const { result } = renderHook(() => 
        usePhoneVerification({ onError: mockOnError })
      );

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      // Fast-forward cooldown
      act(() => {
        jest.advanceTimersByTime(60000);
      });

      // Resend with error
      const mockError = new Error('Twilio API failure');
      (OTPApi.resendOTP as jest.Mock).mockRejectedValue(mockError);

      await act(async () => {
        await result.current.resendCode();
      });

      expect(result.current.state).toBe('error');
      expect(result.current.error).toBe('Twilio API failure');
      expect(mockOnError).toHaveBeenCalledWith(mockError);
    });
  });

  // ============================================================================
  // Timer Tests
  // ============================================================================

  describe('Timers', () => {
    it('should countdown cooldown timer', async () => {
      const sendResponse = {
        success: true,
        data: {
          success: true,
          message: 'OTP sent',
          phoneNumber: '+63 *** *** **67',
          expiresAt: new Date(Date.now() + 300000).toISOString(),
          expiresIn: 300,
        },
      };

      (OTPApi.sendOTP as jest.Mock).mockResolvedValue(sendResponse);

      const { result } = renderHook(() => usePhoneVerification());

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      expect(result.current.cooldownSeconds).toBe(60);

      // Advance 10 seconds
      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(result.current.cooldownSeconds).toBe(50);

      // Advance another 20 seconds
      act(() => {
        jest.advanceTimersByTime(20000);
      });

      expect(result.current.cooldownSeconds).toBe(30);
    });

    it('should countdown expiry timer', async () => {
      const sendResponse = {
        success: true,
        data: {
          success: true,
          message: 'OTP sent',
          phoneNumber: '+63 *** *** **67',
          expiresAt: new Date(Date.now() + 300000).toISOString(),
          expiresIn: 300,
        },
      };

      (OTPApi.sendOTP as jest.Mock).mockResolvedValue(sendResponse);

      const { result } = renderHook(() => usePhoneVerification());

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      expect(result.current.expirySeconds).toBeGreaterThan(290);

      // Advance 60 seconds
      act(() => {
        jest.advanceTimersByTime(60000);
      });

      expect(result.current.expirySeconds).toBeLessThan(250);
    });

    it('should transition to error state when OTP expires', async () => {
      const sendResponse = {
        success: true,
        data: {
          success: true,
          message: 'OTP sent',
          phoneNumber: '+63 *** *** **67',
          expiresAt: new Date(Date.now() + 60000).toISOString(), // 1 minute
          expiresIn: 60,
        },
      };

      (OTPApi.sendOTP as jest.Mock).mockResolvedValue(sendResponse);

      const { result } = renderHook(() => usePhoneVerification());

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      // Advance past expiry
      act(() => {
        jest.advanceTimersByTime(65000);
      });

      expect(result.current.state).toBe('error');
      expect(result.current.error).toContain('OTP has expired');
      expect(result.current.expirySeconds).toBe(0);
    });

    it('should clear timers on unmount', async () => {
      const sendResponse = {
        success: true,
        data: {
          success: true,
          message: 'OTP sent',
          phoneNumber: '+63 *** *** **67',
          expiresAt: new Date(Date.now() + 300000).toISOString(),
          expiresIn: 300,
        },
      };

      (OTPApi.sendOTP as jest.Mock).mockResolvedValue(sendResponse);

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
      const sendResponse = {
        success: true,
        data: {
          success: true,
          message: 'OTP sent',
          phoneNumber: '+63 *** *** **67',
          expiresAt: new Date(Date.now() + 300000).toISOString(),
          expiresIn: 300,
        },
      };

      (OTPApi.sendOTP as jest.Mock).mockResolvedValue(sendResponse);

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
    });
  });

  // ============================================================================
  // Computed Values Tests
  // ============================================================================

  describe('Computed Values', () => {
    it('should compute canResend correctly', async () => {
      const sendResponse = {
        success: true,
        data: {
          success: true,
          message: 'OTP sent',
          phoneNumber: '+63 *** *** **67',
          expiresAt: new Date(Date.now() + 300000).toISOString(),
          expiresIn: 300,
        },
      };

      (OTPApi.sendOTP as jest.Mock).mockResolvedValue(sendResponse);

      const { result } = renderHook(() => usePhoneVerification());

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      // canResend = false during cooldown
      expect(result.current.canResend).toBe(false);

      // canResend = true after cooldown expires
      act(() => {
        jest.advanceTimersByTime(60000);
      });

      expect(result.current.canResend).toBe(true);
    });

    it('should compute attemptsRemaining correctly', async () => {
      const sendResponse = {
        success: true,
        data: {
          success: true,
          message: 'OTP sent',
          phoneNumber: '+63 *** *** **67',
          expiresAt: new Date(Date.now() + 300000).toISOString(),
          expiresIn: 300,
        },
      };

      (OTPApi.sendOTP as jest.Mock).mockResolvedValue(sendResponse);

      const verifyResponse = {
        success: true,
        data: {
          success: false,
          verified: false,
          message: 'Invalid OTP',
          attemptsRemaining: 2,
        },
      };

      (OTPApi.verifyOTP as jest.Mock).mockResolvedValue(verifyResponse);

      const { result } = renderHook(() => usePhoneVerification());

      await act(async () => {
        await result.current.sendVerification('+639171234567');
      });

      expect(result.current.attemptsRemaining).toBe(3);

      // First attempt
      await act(async () => {
        await result.current.verifyCode('000000');
      });

      expect(result.current.attemptsRemaining).toBe(2);
    });

    it('should compute isLoading correctly', async () => {
      const sendResponse = {
        success: true,
        data: {
          success: true,
          message: 'OTP sent',
          phoneNumber: '+63 *** *** **67',
          expiresAt: new Date(Date.now() + 300000).toISOString(),
          expiresIn: 300,
        },
      };

      (OTPApi.sendOTP as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(sendResponse), 1000))
      );

      const { result } = renderHook(() => usePhoneVerification());

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.sendVerification('+639171234567');
      });

      // isLoading = true during sending
      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // isLoading = false after send completes
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });
});
