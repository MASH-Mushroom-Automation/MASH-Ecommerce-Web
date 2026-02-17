/**
 * useAccountRecovery Hook Tests
 *
 * Test categories:
 * 1. Initial state validation
 * 2. Send recovery email flow
 * 3. Verify recovery code flow
 * 4. Disable 2FA via recovery flow
 * 5. Generate and store backup codes
 * 6. Reset functionality
 * 7. Error handling
 */

import { renderHook, act } from "@testing-library/react";
import { useAccountRecovery } from "../useAccountRecovery";

// ============================================================================
// Mocks
// ============================================================================

// Use global auth mock from jest.setupMocks.js
const mockDisable2FA = jest.fn().mockResolvedValue(undefined);
const mockUser = { id: "user-123", email: "test@example.com" };

// Toast mocks - use global sonner mock from jest.setupMocks.js
// Access via global.__mockToast which is already configured
const mockToastSuccess = (global as Record<string, unknown>).__mockToast 
  ? ((global as Record<string, unknown>).__mockToast as Record<string, jest.Mock>).success 
  : jest.fn();
const mockToastError = (global as Record<string, unknown>).__mockToast
  ? ((global as Record<string, unknown>).__mockToast as Record<string, jest.Mock>).error
  : jest.fn();

// Mock API client
const mockApiRequest = jest.fn();
jest.mock("@/lib/api-client", () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));

// Mock security audit trail
const mockLogSecurityEvent = jest.fn().mockResolvedValue(undefined);
jest.mock("@/lib/security/audit-trail", () => ({
  logSecurityEvent: (...args: unknown[]) => mockLogSecurityEvent(...args),
}));

// Mock backup codes
const mockGenerateBackupCodes = jest.fn().mockReturnValue([
  "ABCD-1234",
  "EFGH-5678",
  "IJKL-9012",
  "MNOP-3456",
  "QRST-7890",
  "UVWX-1234",
  "YZAB-5678",
  "CDEF-9012",
]);
const mockHashAllBackupCodes = jest.fn().mockResolvedValue([
  "hash1", "hash2", "hash3", "hash4",
  "hash5", "hash6", "hash7", "hash8",
]);
jest.mock("@/lib/security/backup-codes", () => ({
  generateBackupCodes: () => mockGenerateBackupCodes(),
  hashAllBackupCodes: (...args: unknown[]) => mockHashAllBackupCodes(...args),
}));

// Firebase Firestore - use global mock from jest.setupMocks.js
// Import the mocked module to configure/assert against it
import * as firestoreMod from "firebase/firestore";
const mockUpdateDoc = firestoreMod.updateDoc as jest.Mock;
const mockDoc = firestoreMod.doc as jest.Mock;
const mockGetFirestore = firestoreMod.getFirestore as jest.Mock;

// Mock Firebase config
jest.mock("@/lib/firebase/config", () => ({
  firebaseApp: "mock-firebase-app",
}));

// Mock security types
jest.mock("@/types/security", () => ({
  SecurityEventType: {
    TWO_FA_DISABLED: "TWO_FA_DISABLED",
    TWO_FA_ENABLED: "TWO_FA_ENABLED",
    PHONE_VERIFIED: "PHONE_VERIFIED",
  },
}));

// ============================================================================
// Test Suite
// ============================================================================

describe("useAccountRecovery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiRequest.mockReset();
    mockDisable2FA.mockResolvedValue(undefined);
    
    // Configure Firestore mocks for this test suite
    mockDoc.mockReturnValue("mock-doc-ref");
    mockUpdateDoc.mockResolvedValue(undefined);
    mockGetFirestore.mockReturnValue({});
    
    // Configure global auth mock for this test suite
    const globalAny = global as Record<string, unknown>;
    if (globalAny.__mockUseAuth) {
      (globalAny.__mockUseAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        disable2FA: mockDisable2FA,
        isAuthenticated: true,
        loading: false,
      });
    }
    if (globalAny.__mockAuthContext) {
      Object.assign(globalAny.__mockAuthContext as Record<string, unknown>, {
        user: mockUser,
        disable2FA: mockDisable2FA,
        isAuthenticated: true,
        loading: false,
      });
    }
  });

  // ==========================================================================
  // 1. Initial State
  // ==========================================================================

  describe("Initial State", () => {
    it("should have idle recovery step on mount", () => {
      const { result } = renderHook(() => useAccountRecovery());

      expect(result.current.recoveryStep).toBe("idle");
    });

    it("should not be loading on mount", () => {
      const { result } = renderHook(() => useAccountRecovery());

      expect(result.current.isLoading).toBe(false);
    });

    it("should have no error on mount", () => {
      const { result } = renderHook(() => useAccountRecovery());

      expect(result.current.error).toBeNull();
    });

    it("should have empty backup codes on mount", () => {
      const { result } = renderHook(() => useAccountRecovery());

      expect(result.current.backupCodes).toEqual([]);
    });

    it("should expose all expected functions", () => {
      const { result } = renderHook(() => useAccountRecovery());

      expect(typeof result.current.sendRecoveryEmail).toBe("function");
      expect(typeof result.current.verifyRecoveryCode).toBe("function");
      expect(typeof result.current.disableTwoFactorViaRecovery).toBe("function");
      expect(typeof result.current.generateAndStoreBackupCodes).toBe("function");
      expect(typeof result.current.reset).toBe("function");
    });
  });

  // ==========================================================================
  // 2. Send Recovery Email
  // ==========================================================================

  describe("sendRecoveryEmail", () => {
    it("should call API with correct parameters", async () => {
      mockApiRequest.mockResolvedValueOnce({});
      const { result } = renderHook(() => useAccountRecovery());

      await act(async () => {
        await result.current.sendRecoveryEmail("test@example.com");
      });

      expect(mockApiRequest).toHaveBeenCalledWith(
        "/auth/recovery/send-code",
        {
          method: "POST",
          body: JSON.stringify({ email: "test@example.com" }),
        }
      );
    });

    it("should transition to email-sent step on success", async () => {
      mockApiRequest.mockResolvedValueOnce({});
      const { result } = renderHook(() => useAccountRecovery());

      await act(async () => {
        await result.current.sendRecoveryEmail("test@example.com");
      });

      expect(result.current.recoveryStep).toBe("email-sent");
    });

    it("should show success toast on successful send", async () => {
      mockApiRequest.mockResolvedValueOnce({});
      const { result } = renderHook(() => useAccountRecovery());

      await act(async () => {
        await result.current.sendRecoveryEmail("test@example.com");
      });

      expect(mockToastSuccess).toHaveBeenCalledWith(
        "Recovery code sent to your email"
      );
    });

    it("should set error on failure", async () => {
      mockApiRequest.mockRejectedValueOnce(new Error("Network error"));
      const { result } = renderHook(() => useAccountRecovery());

      await act(async () => {
        try {
          await result.current.sendRecoveryEmail("test@example.com");
        } catch {
          // expected
        }
      });

      expect(result.current.error).toBe("Network error");
    });

    it("should show error toast on failure", async () => {
      mockApiRequest.mockRejectedValueOnce(new Error("Network error"));
      const { result } = renderHook(() => useAccountRecovery());

      await act(async () => {
        try {
          await result.current.sendRecoveryEmail("test@example.com");
        } catch {
          // expected
        }
      });

      expect(mockToastError).toHaveBeenCalledWith("Network error");
    });

    it("should set loading during API call", async () => {
      let resolveApi: () => void;
      mockApiRequest.mockImplementationOnce(
        () => new Promise<void>((resolve) => { resolveApi = resolve; })
      );
      const { result } = renderHook(() => useAccountRecovery());

      let sendPromise: Promise<void>;
      act(() => {
        sendPromise = result.current.sendRecoveryEmail("test@example.com");
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolveApi!();
        await sendPromise!;
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  // ==========================================================================
  // 3. Verify Recovery Code
  // ==========================================================================

  describe("verifyRecoveryCode", () => {
    it("should call API with correct parameters", async () => {
      mockApiRequest.mockResolvedValueOnce({ verified: true });
      const { result } = renderHook(() => useAccountRecovery());

      await act(async () => {
        await result.current.verifyRecoveryCode("123456");
      });

      expect(mockApiRequest).toHaveBeenCalledWith(
        "/auth/recovery/verify-code",
        {
          method: "POST",
          body: JSON.stringify({ code: "123456", email: "test@example.com" }),
        }
      );
    });

    it("should return true on successful verification", async () => {
      mockApiRequest.mockResolvedValueOnce({ verified: true });
      const { result } = renderHook(() => useAccountRecovery());

      let verified: boolean = false;
      await act(async () => {
        verified = await result.current.verifyRecoveryCode("123456");
      });

      expect(verified).toBe(true);
    });

    it("should show success toast on verification", async () => {
      mockApiRequest.mockResolvedValueOnce({ verified: true });
      const { result } = renderHook(() => useAccountRecovery());

      await act(async () => {
        await result.current.verifyRecoveryCode("123456");
      });

      expect(mockToastSuccess).toHaveBeenCalledWith("Recovery code verified");
    });

    it("should return false when code is invalid", async () => {
      mockApiRequest.mockResolvedValueOnce({ verified: false });
      const { result } = renderHook(() => useAccountRecovery());

      let verified: boolean = true;
      await act(async () => {
        verified = await result.current.verifyRecoveryCode("000000");
      });

      expect(verified).toBe(false);
    });

    it("should set error message for invalid code", async () => {
      mockApiRequest.mockResolvedValueOnce({ verified: false });
      const { result } = renderHook(() => useAccountRecovery());

      await act(async () => {
        await result.current.verifyRecoveryCode("000000");
      });

      expect(result.current.error).toBe("Invalid or expired recovery code");
    });

    it("should revert to email-sent step on invalid code", async () => {
      mockApiRequest.mockResolvedValueOnce({ verified: false });
      const { result } = renderHook(() => useAccountRecovery());

      await act(async () => {
        await result.current.verifyRecoveryCode("000000");
      });

      expect(result.current.recoveryStep).toBe("email-sent");
    });

    it("should transition to verifying step during verification", async () => {
      let resolveApi: (v: { verified: boolean }) => void;
      mockApiRequest.mockImplementationOnce(
        () => new Promise((resolve) => { resolveApi = resolve; })
      );
      const { result } = renderHook(() => useAccountRecovery());

      let verifyPromise: Promise<boolean>;
      act(() => {
        verifyPromise = result.current.verifyRecoveryCode("123456");
      });

      expect(result.current.recoveryStep).toBe("verifying");

      await act(async () => {
        resolveApi!({ verified: true });
        await verifyPromise!;
      });
    });

    it("should handle API error during verification", async () => {
      mockApiRequest.mockRejectedValueOnce(new Error("Server error"));
      const { result } = renderHook(() => useAccountRecovery());

      let verified: boolean = true;
      await act(async () => {
        verified = await result.current.verifyRecoveryCode("123456");
      });

      expect(verified).toBe(false);
      expect(result.current.error).toBe("Server error");
      expect(result.current.recoveryStep).toBe("email-sent");
    });
  });

  // ==========================================================================
  // 4. Disable 2FA via Recovery
  // ==========================================================================

  describe("disableTwoFactorViaRecovery", () => {
    it("should call disable2FA from auth context", async () => {
      const { result } = renderHook(() => useAccountRecovery());

      await act(async () => {
        await result.current.disableTwoFactorViaRecovery();
      });

      expect(mockDisable2FA).toHaveBeenCalledTimes(1);
    });

    it("should update Firestore with grace period", async () => {
      const { result } = renderHook(() => useAccountRecovery());

      await act(async () => {
        await result.current.disableTwoFactorViaRecovery();
      });

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        "mock-doc-ref",
        expect.objectContaining({
          twoFactorDisabledViaRecovery: true,
          twoFactorGracePeriodEnd: expect.any(Object),
        })
      );
    });

    it("should log security event for 2FA disable", async () => {
      const { result } = renderHook(() => useAccountRecovery());

      await act(async () => {
        await result.current.disableTwoFactorViaRecovery();
      });

      expect(mockLogSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-123",
          eventType: "TWO_FA_DISABLED",
          success: true,
          metadata: expect.objectContaining({
            reason: "Account recovery - phone inaccessible",
            method: "email_verification",
            gracePeriodDays: 7,
          }),
        })
      );
    });

    it("should generate backup codes", async () => {
      const { result } = renderHook(() => useAccountRecovery());

      await act(async () => {
        await result.current.disableTwoFactorViaRecovery();
      });

      expect(mockGenerateBackupCodes).toHaveBeenCalled();
      expect(result.current.backupCodes).toHaveLength(8);
    });

    it("should return backup codes array", async () => {
      const { result } = renderHook(() => useAccountRecovery());

      let codes: string[] = [];
      await act(async () => {
        codes = await result.current.disableTwoFactorViaRecovery();
      });

      expect(codes).toHaveLength(8);
      expect(codes[0]).toBe("ABCD-1234");
    });

    it("should transition to codes-generated step", async () => {
      const { result } = renderHook(() => useAccountRecovery());

      await act(async () => {
        await result.current.disableTwoFactorViaRecovery();
      });

      expect(result.current.recoveryStep).toBe("codes-generated");
    });

    it("should show success toast", async () => {
      const { result } = renderHook(() => useAccountRecovery());

      await act(async () => {
        await result.current.disableTwoFactorViaRecovery();
      });

      expect(mockToastSuccess).toHaveBeenCalledWith(
        "Two-factor authentication temporarily disabled"
      );
    });

    it("should handle error and set error state", async () => {
      mockDisable2FA.mockRejectedValueOnce(new Error("Auth service down"));
      const { result } = renderHook(() => useAccountRecovery());

      await act(async () => {
        try {
          await result.current.disableTwoFactorViaRecovery();
        } catch {
          // expected
        }
      });

      expect(result.current.error).toBe("Auth service down");
      expect(mockToastError).toHaveBeenCalledWith("Auth service down");
    });
  });

  // ==========================================================================
  // 5. Generate and Store Backup Codes
  // ==========================================================================

  describe("generateAndStoreBackupCodes", () => {
    it("should generate 8 backup codes", async () => {
      const { result } = renderHook(() => useAccountRecovery());

      let codes: string[] = [];
      await act(async () => {
        codes = await result.current.generateAndStoreBackupCodes();
      });

      expect(codes).toHaveLength(8);
    });

    it("should hash and store codes in Firestore", async () => {
      const { result } = renderHook(() => useAccountRecovery());

      await act(async () => {
        await result.current.generateAndStoreBackupCodes();
      });

      expect(mockHashAllBackupCodes).toHaveBeenCalled();
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        "mock-doc-ref",
        expect.objectContaining({
          backupCodes: expect.any(Array),
          backupCodesGeneratedAt: expect.any(Object),
        })
      );
    });

    it("should update local backup codes state", async () => {
      const { result } = renderHook(() => useAccountRecovery());

      await act(async () => {
        await result.current.generateAndStoreBackupCodes();
      });

      expect(result.current.backupCodes).toHaveLength(8);
    });

    it("should throw if user is not authenticated", async () => {
      // Temporarily override mock to return null user
      const originalUser = mockUser.id;
      (mockUser as Record<string, unknown>).id = "";
      const { result } = renderHook(() => useAccountRecovery());

      await expect(
        act(async () => {
          await result.current.generateAndStoreBackupCodes();
        })
      ).rejects.toThrow("User must be authenticated");

      (mockUser as Record<string, unknown>).id = originalUser;
    });
  });

  // ==========================================================================
  // 6. Reset
  // ==========================================================================

  describe("reset", () => {
    it("should reset recovery step to idle", async () => {
      mockApiRequest.mockResolvedValueOnce({});
      const { result } = renderHook(() => useAccountRecovery());

      // Move to email-sent step
      await act(async () => {
        await result.current.sendRecoveryEmail("test@example.com");
      });
      expect(result.current.recoveryStep).toBe("email-sent");

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.recoveryStep).toBe("idle");
    });

    it("should clear error on reset", async () => {
      mockApiRequest.mockRejectedValueOnce(new Error("Failed"));
      const { result } = renderHook(() => useAccountRecovery());

      await act(async () => {
        try {
          await result.current.sendRecoveryEmail("test@example.com");
        } catch {
          // expected
        }
      });
      expect(result.current.error).toBe("Failed");

      act(() => {
        result.current.reset();
      });

      expect(result.current.error).toBeNull();
    });

    it("should clear backup codes on reset", async () => {
      const { result } = renderHook(() => useAccountRecovery());

      await act(async () => {
        await result.current.disableTwoFactorViaRecovery();
      });
      expect(result.current.backupCodes).toHaveLength(8);

      act(() => {
        result.current.reset();
      });

      expect(result.current.backupCodes).toEqual([]);
    });

    it("should clear loading state on reset", () => {
      const { result } = renderHook(() => useAccountRecovery());

      act(() => {
        result.current.reset();
      });

      expect(result.current.isLoading).toBe(false);
    });
  });
});
