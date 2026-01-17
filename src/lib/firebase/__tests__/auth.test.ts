/**
 * Google Auth Unit Tests with Error Logging
 * 
 * Tests Firebase Google Authentication implementation
 * Includes comprehensive error logging and tracking
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock instances (must be defined before jest.mock)
const mockAuth = {
  currentUser: null,
};

const mockGoogleProvider = {
  addScope: jest.fn(),
  setCustomParameters: jest.fn(),
};

// Mock Firebase modules
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => mockAuth),
  GoogleAuthProvider: jest.fn(() => mockGoogleProvider),
  signInWithPopup: jest.fn(),
  signInWithRedirect: jest.fn(),
  getRedirectResult: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  setPersistence: jest.fn(),
  browserLocalPersistence: {},
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  sendEmailVerification: jest.fn(),
  updateProfile: jest.fn(),
}));

jest.mock('../config', () => ({
  firebaseApp: {},
}));

// Import after mocking
import * as authModule from '../auth';
import { signInWithPopup, setPersistence, browserLocalPersistence } from 'firebase/auth';

// Error logger mock
const errorLog: Array<{
  timestamp: string;
  function: string;
  error: any;
  context: any;
}> = [];

const logError = (functionName: string, error: any, context?: any) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    function: functionName,
    error: {
      message: error.message,
      code: error.code,
      stack: error.stack,
    },
    context: context || {},
  };
  errorLog.push(logEntry);
  console.error(`[TEST ERROR LOG] ${functionName}:`, JSON.stringify(logEntry, null, 2));
};

describe('Google Auth Firebase Tests', () => {
  beforeEach(() => {
    // Clear error log before each test
    errorLog.length = 0;
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Print error log summary after each test
    if (errorLog.length > 0) {
      console.log('\n=== ERROR LOG SUMMARY ===');
      errorLog.forEach((log, index) => {
        console.log(`\n[${index + 1}] ${log.function} at ${log.timestamp}`);
        console.log(`Error: ${log.error.message}`);
        console.log(`Code: ${log.error.code}`);
      });
      console.log('========================\n');
    }
  });

  describe('signInWithGoogle - Success Cases', () => {
    test('should successfully sign in with Google using popup', async () => {
      const mockUser = {
        uid: 'test-uid-123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
      };

      const mockResult = {
        user: mockUser,
        credential: null,
      };

      (setPersistence as jest.Mock).mockResolvedValue(undefined);
      (signInWithPopup as jest.Mock).mockResolvedValue(mockResult);

      try {
        const result = await authModule.signInWithGoogle();

        expect(setPersistence).toHaveBeenCalledWith(mockAuth, browserLocalPersistence);
        expect(signInWithPopup).toHaveBeenCalledWith(mockAuth, expect.any(Object));
        expect(result).toEqual(mockUser);

        console.log('✓ SUCCESS: Google sign-in completed successfully');
        console.log('  User ID:', result.uid);
        console.log('  Email:', result.email);
      } catch (error: any) {
        logError('signInWithGoogle', error);
        throw error;
      }
    });

    test('should set browser local persistence before sign-in', async () => {
      const mockUser = { uid: 'test-uid' };
      (setPersistence as jest.Mock).mockResolvedValue(undefined);
      (signInWithPopup as jest.Mock).mockResolvedValue({ user: mockUser });

      try {
        await authModule.signInWithGoogle();

        // Verify setPersistence was called
        expect(setPersistence).toHaveBeenCalled();
        expect(setPersistence).toHaveBeenCalledWith(expect.anything(), browserLocalPersistence);
        
        // Verify signInWithPopup was called
        expect(signInWithPopup).toHaveBeenCalled();
        
        console.log('✓ SUCCESS: Persistence set and popup called');
      } catch (error: any) {
        logError('signInWithGoogle - persistence', error);
        throw error;
      }
    });
  });

  describe('signInWithGoogle - Error Cases with Logging', () => {
    test('should log error when popup is closed by user', async () => {
      const popupClosedError = {
        code: 'auth/popup-closed-by-user',
        message: 'The popup has been closed by the user before finalizing the operation.',
      };

      (setPersistence as jest.Mock).mockResolvedValue(undefined);
      (signInWithPopup as jest.Mock).mockRejectedValue(popupClosedError);

      try {
        await authModule.signInWithGoogle();
        fail('Should have thrown an error');
      } catch (error: any) {
        logError('signInWithGoogle', error, {
          action: 'popup_closed',
          userAction: 'User closed the Google sign-in popup',
        });

        expect(error.code).toBe('auth/popup-closed-by-user');
        expect(errorLog).toHaveLength(1);
        expect(errorLog[0].function).toBe('signInWithGoogle');
        expect(errorLog[0].context.action).toBe('popup_closed');

        console.log('✓ ERROR LOGGED: Popup closed by user');
      }
    });

    test('should log error when popup is blocked', async () => {
      const popupBlockedError = {
        code: 'auth/popup-blocked',
        message: 'Unable to establish a connection with the popup.',
      };

      (setPersistence as jest.Mock).mockResolvedValue(undefined);
      (signInWithPopup as jest.Mock).mockRejectedValue(popupBlockedError);

      try {
        await authModule.signInWithGoogle();
        fail('Should have thrown an error');
      } catch (error: any) {
        logError('signInWithGoogle', error, {
          action: 'popup_blocked',
          suggestion: 'Check browser popup blocker settings',
        });

        expect(error.code).toBe('auth/popup-blocked');
        expect(errorLog[0].context.suggestion).toBe('Check browser popup blocker settings');

        console.log('✓ ERROR LOGGED: Popup blocked by browser');
      }
    });

    test('should log error for unauthorized domain', async () => {
      const unauthorizedError = {
        code: 'auth/unauthorized-domain',
        message: 'This domain is not authorized for OAuth operations.',
      };

      (setPersistence as jest.Mock).mockResolvedValue(undefined);
      (signInWithPopup as jest.Mock).mockRejectedValue(unauthorizedError);

      try {
        await authModule.signInWithGoogle();
        fail('Should have thrown an error');
      } catch (error: any) {
        logError('signInWithGoogle', error, {
          action: 'unauthorized_domain',
          suggestion: 'Add domain to Firebase Console authorized domains',
          firebaseConsoleUrl: 'https://console.firebase.google.com',
        });

        expect(error.code).toBe('auth/unauthorized-domain');
        expect(errorLog[0].context.firebaseConsoleUrl).toBeDefined();

        console.log('✓ ERROR LOGGED: Unauthorized domain');
      }
    });

    test('should log error for network failure', async () => {
      const networkError = {
        code: 'auth/network-request-failed',
        message: 'A network error has occurred.',
      };

      (setPersistence as jest.Mock).mockResolvedValue(undefined);
      (signInWithPopup as jest.Mock).mockRejectedValue(networkError);

      try {
        await authModule.signInWithGoogle();
        fail('Should have thrown an error');
      } catch (error: any) {
        logError('signInWithGoogle', error, {
          action: 'network_failure',
          suggestion: 'Check internet connection and try again',
          retryable: true,
        });

        expect(error.code).toBe('auth/network-request-failed');
        expect(errorLog[0].context.retryable).toBe(true);

        console.log('✓ ERROR LOGGED: Network failure');
      }
    });

    test('should log error for account exists with different credential', async () => {
      const accountExistsError = {
        code: 'auth/account-exists-with-different-credential',
        message: 'An account already exists with the same email address.',
      };

      (setPersistence as jest.Mock).mockResolvedValue(undefined);
      (signInWithPopup as jest.Mock).mockRejectedValue(accountExistsError);

      try {
        await authModule.signInWithGoogle();
        fail('Should have thrown an error');
      } catch (error: any) {
        logError('signInWithGoogle', error, {
          action: 'account_exists_different_provider',
          suggestion: 'User should sign in with the original provider',
          possibleProviders: ['email/password', 'Facebook', 'Twitter'],
        });

        expect(error.code).toBe('auth/account-exists-with-different-credential');
        expect(errorLog[0].context.possibleProviders).toBeDefined();

        console.log('✓ ERROR LOGGED: Account exists with different credential');
      }
    });

    test('should log error for cancelled popup', async () => {
      const cancelledError = {
        code: 'auth/cancelled-popup-request',
        message: 'This operation has been cancelled.',
      };

      (setPersistence as jest.Mock).mockResolvedValue(undefined);
      (signInWithPopup as jest.Mock).mockRejectedValue(cancelledError);

      try {
        await authModule.signInWithGoogle();
        fail('Should have thrown an error');
      } catch (error: any) {
        logError('signInWithGoogle', error, {
          action: 'popup_cancelled',
          reason: 'Multiple popup requests, only one allowed at a time',
        });

        expect(error.code).toBe('auth/cancelled-popup-request');

        console.log('✓ ERROR LOGGED: Popup request cancelled');
      }
    });
  });

  describe('Error Log Format Validation', () => {
    test('should have correct error log structure', async () => {
      const testError = {
        code: 'auth/test-error',
        message: 'Test error message',
      };

      (setPersistence as jest.Mock).mockResolvedValue(undefined);
      (signInWithPopup as jest.Mock).mockRejectedValue(testError);

      try {
        await authModule.signInWithGoogle();
      } catch (error: any) {
        logError('signInWithGoogle', error, { test: 'context' });

        const log = errorLog[0];

        // Validate log structure
        expect(log).toHaveProperty('timestamp');
        expect(log).toHaveProperty('function');
        expect(log).toHaveProperty('error');
        expect(log).toHaveProperty('context');

        // Validate error details
        expect(log.error).toHaveProperty('message');
        expect(log.error).toHaveProperty('code');
        expect(log.error).toHaveProperty('stack');

        // Validate timestamp format (ISO 8601)
        expect(log.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

        console.log('✓ SUCCESS: Error log structure validated');
      }
    });

    test('should generate error report for multiple failures', async () => {
      const errors = [
        { code: 'auth/popup-closed-by-user', message: 'Popup closed' },
        { code: 'auth/network-request-failed', message: 'Network error' },
        { code: 'auth/popup-blocked', message: 'Popup blocked' },
      ];

      (setPersistence as jest.Mock).mockResolvedValue(undefined);

      for (const error of errors) {
        (signInWithPopup as jest.Mock).mockRejectedValue(error);
        try {
          await authModule.signInWithGoogle();
        } catch (e: any) {
          logError('signInWithGoogle', e);
        }
      }

      expect(errorLog).toHaveLength(3);

      // Generate error report
      const errorReport = {
        totalErrors: errorLog.length,
        errorCodes: errorLog.map(log => log.error.code),
        timeRange: {
          first: errorLog[0].timestamp,
          last: errorLog[errorLog.length - 1].timestamp,
        },
      };

      console.log('\n=== ERROR REPORT ===');
      console.log(JSON.stringify(errorReport, null, 2));
      console.log('===================\n');

      expect(errorReport.totalErrors).toBe(3);
      expect(errorReport.errorCodes).toContain('auth/popup-closed-by-user');
    });
  });
});
