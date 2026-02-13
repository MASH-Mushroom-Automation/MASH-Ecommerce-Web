/**
 * OTP Service Tests
 *
 * Tests for OTP verification CRUD operations, validation, and security features.
 */

import { OTPService } from "../otp-service";
import type {
  OTPVerification,
  CreateOTPVerificationInput,
  OTPPurpose,
} from "@/types/otp";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp as FirestoreTimestamp,
} from "firebase/firestore";

// Mock Firebase
jest.mock("../config", () => ({
  firebaseApp: {},
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
  Timestamp: {
    fromDate: jest.fn((date: Date) => ({
      toDate: () => date,
      seconds: Math.floor(date.getTime() / 1000),
      nanoseconds: 0,
    })),
  },
}));

// Mock data
const mockUserId = "test-user-123";
const mockPhoneNumber = "+639171234567";
const mockHashedCode = "$2b$10$hashedCodeExample123456789";
const mockVerificationId = "verification-123";

const createMockVerification = (
  overrides?: Partial<OTPVerification>
): OTPVerification => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
  const ttlExpiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

  return {
    id: mockVerificationId,
    userId: mockUserId,
    phoneNumber: mockPhoneNumber,
    hashedCode: mockHashedCode,
    purpose: "PHONE_VERIFICATION" as OTPPurpose,
    attempts: 0,
    maxAttempts: 3,
    verified: false,
    expiresAt: FirestoreTimestamp.fromDate(expiresAt) as any,
    createdAt: FirestoreTimestamp.fromDate(now) as any,
    updatedAt: FirestoreTimestamp.fromDate(now) as any,
    _expiresAt: FirestoreTimestamp.fromDate(ttlExpiresAt) as any,
    ...overrides,
  };
};

describe("OTPService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================
  // CRUD Operations
  // ========================================

  describe("createVerification", () => {
    it("should create a new OTP verification with default expiry", async () => {
      const mockDocRef = { id: mockVerificationId };
      (collection as jest.Mock).mockReturnValue({});
      (doc as jest.Mock).mockReturnValue(mockDocRef);

      const mockSetDoc = jest.fn().mockResolvedValue(undefined);
      require("firebase/firestore").setDoc = mockSetDoc;

      const input: CreateOTPVerificationInput = {
        userId: mockUserId,
        phoneNumber: mockPhoneNumber,
        hashedCode: mockHashedCode,
        purpose: "PHONE_VERIFICATION",
      };

      const result = await OTPService.createVerification(input);

      expect(result).toBe(mockVerificationId);
      expect(mockSetDoc).toHaveBeenCalled();
      
      // Verify the data structure
      const callArgs = mockSetDoc.mock.calls[0][1];
      expect(callArgs.userId).toBe(mockUserId);
      expect(callArgs.phoneNumber).toBe(mockPhoneNumber);
      expect(callArgs.hashedCode).toBe(mockHashedCode);
      expect(callArgs.purpose).toBe("PHONE_VERIFICATION");
      expect(callArgs.attempts).toBe(0);
      expect(callArgs.maxAttempts).toBe(3);
      expect(callArgs.verified).toBe(false);
    });

    it("should create verification with custom expiry times", async () => {
      const mockDocRef = { id: mockVerificationId };
      (collection as jest.Mock).mockReturnValue({});
      (doc as jest.Mock).mockReturnValue(mockDocRef);

      const mockSetDoc = jest.fn().mockResolvedValue(undefined);
      require("firebase/firestore").setDoc = mockSetDoc;

      const input: CreateOTPVerificationInput = {
        userId: mockUserId,
        phoneNumber: mockPhoneNumber,
        hashedCode: mockHashedCode,
        purpose: "2FA_LOGIN",
        expiryMinutes: 3,
        ttlMinutes: 8,
      };

      await OTPService.createVerification(input);

      expect(mockSetDoc).toHaveBeenCalled();
    });

    it("should handle creation errors gracefully", async () => {
      (collection as jest.Mock).mockReturnValue({});
      (doc as jest.Mock).mockReturnValue({ id: mockVerificationId });

      const mockSetDoc = jest.fn().mockRejectedValue(new Error("Firestore error"));
      require("firebase/firestore").setDoc = mockSetDoc;

      const input: CreateOTPVerificationInput = {
        userId: mockUserId,
        phoneNumber: mockPhoneNumber,
        hashedCode: mockHashedCode,
        purpose: "PHONE_CHANGE",
      };

      await expect(OTPService.createVerification(input)).rejects.toThrow(
        "Failed to create OTP verification"
      );
    });
  });

  describe("getVerification", () => {
    it("should retrieve an existing verification", async () => {
      const mockVerification = createMockVerification();
      const mockSnapshot = {
        exists: () => true,
        data: () => mockVerification,
      };

      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await OTPService.getVerification(mockVerificationId);

      expect(result).toEqual(mockVerification);
      expect(getDoc).toHaveBeenCalled();
    });

    it("should return null for non-existent verification", async () => {
      const mockSnapshot = {
        exists: () => false,
      };

      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await OTPService.getVerification("non-existent-id");

      expect(result).toBeNull();
    });

    it("should handle retrieval errors", async () => {
      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockRejectedValue(new Error("Firestore error"));

      await expect(OTPService.getVerification(mockVerificationId)).rejects.toThrow(
        "Failed to retrieve OTP verification"
      );
    });
  });

  describe("findVerifications", () => {
    it("should find verifications by userId", async () => {
      const mockVerifications = [
        createMockVerification(),
        createMockVerification({ id: "verification-456" }),
      ];

      const mockSnapshot = {
        docs: mockVerifications.map((v) => ({
          data: () => v,
        })),
      };

      (collection as jest.Mock).mockReturnValue({});
      (query as jest.Mock).mockImplementation((...args) => args);
      (where as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await OTPService.findVerifications({ userId: mockUserId });

      expect(result).toHaveLength(2);
      expect(getDocs).toHaveBeenCalled();
    });

    it("should filter out expired verifications by default", async () => {
      const now = new Date();
      const expiredDate = new Date(now.getTime() - 10 * 60 * 1000); // 10 minutes ago

      const mockVerifications = [
        createMockVerification(), // Valid
        createMockVerification({
          id: "expired-verification",
          expiresAt: FirestoreTimestamp.fromDate(expiredDate) as any,
        }), // Expired
      ];

      const mockSnapshot = {
        docs: mockVerifications.map((v) => ({
          data: () => v,
        })),
      };

      (collection as jest.Mock).mockReturnValue({});
      (query as jest.Mock).mockImplementation((...args) => args);
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await OTPService.findVerifications({ userId: mockUserId });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockVerificationId);
    });

    it("should include expired verifications when requested", async () => {
      const now = new Date();
      const expiredDate = new Date(now.getTime() - 10 * 60 * 1000);

      const mockVerifications = [
        createMockVerification(),
        createMockVerification({
          id: "expired-verification",
          expiresAt: FirestoreTimestamp.fromDate(expiredDate) as any,
        }),
      ];

      const mockSnapshot = {
        docs: mockVerifications.map((v) => ({
          data: () => v,
        })),
      };

      (collection as jest.Mock).mockReturnValue({});
      (query as jest.Mock).mockImplementation((...args) => args);
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await OTPService.findVerifications({
        userId: mockUserId,
        includeExpired: true,
      });

      expect(result).toHaveLength(2);
    });
  });

  // ========================================
  // Verification Attempts
  // ========================================

  describe("incrementAttempts", () => {
    it("should increment failed verification attempts", async () => {
      const mockVerification = createMockVerification({ attempts: 1 });
      const mockSnapshot = {
        exists: () => true,
        data: () => mockVerification,
      };

      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue(mockSnapshot);

      const mockUpdateDoc = jest.fn().mockResolvedValue(undefined);
      require("firebase/firestore").updateDoc = mockUpdateDoc;

      const result = await OTPService.incrementAttempts(mockVerificationId);

      expect(result?.attempts).toBe(2);
      expect(mockUpdateDoc).toHaveBeenCalled();
    });

    it("should return null for non-existent verification", async () => {
      const mockSnapshot = {
        exists: () => false,
      };

      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await OTPService.incrementAttempts("non-existent-id");

      expect(result).toBeNull();
    });

    it("should handle update errors", async () => {
      const mockVerification = createMockVerification();
      const mockSnapshot = {
        exists: () => true,
        data: () => mockVerification,
      };

      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue(mockSnapshot);

      const mockUpdateDoc = jest.fn().mockRejectedValue(new Error("Firestore error"));
      require("firebase/firestore").updateDoc = mockUpdateDoc;

      await expect(OTPService.incrementAttempts(mockVerificationId)).rejects.toThrow(
        "Failed to update verification attempts"
      );
    });
  });

  describe("markAsVerified", () => {
    it("should mark verification as verified", async () => {
      (doc as jest.Mock).mockReturnValue({});

      const mockUpdateDoc = jest.fn().mockResolvedValue(undefined);
      require("firebase/firestore").updateDoc = mockUpdateDoc;

      const result = await OTPService.markAsVerified(mockVerificationId);

      expect(result).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalled();
      
      const callArgs = mockUpdateDoc.mock.calls[0][1];
      expect(callArgs.verified).toBe(true);
    });

    it("should return false on error", async () => {
      (doc as jest.Mock).mockReturnValue({});

      const mockUpdateDoc = jest.fn().mockRejectedValue(new Error("Firestore error"));
      require("firebase/firestore").updateDoc = mockUpdateDoc;

      const result = await OTPService.markAsVerified(mockVerificationId);

      expect(result).toBe(false);
    });
  });

  // ========================================
  // Deletion
  // ========================================

  describe("deleteVerification", () => {
    it("should delete a verification", async () => {
      (doc as jest.Mock).mockReturnValue({});

      const mockDeleteDoc = jest.fn().mockResolvedValue(undefined);
      require("firebase/firestore").deleteDoc = mockDeleteDoc;

      const result = await OTPService.deleteVerification(mockVerificationId);

      expect(result).toBe(true);
      expect(mockDeleteDoc).toHaveBeenCalled();
    });

    it("should return false on deletion error", async () => {
      (doc as jest.Mock).mockReturnValue({});

      const mockDeleteDoc = jest.fn().mockRejectedValue(new Error("Firestore error"));
      require("firebase/firestore").deleteDoc = mockDeleteDoc;

      const result = await OTPService.deleteVerification(mockVerificationId);

      expect(result).toBe(false);
    });
  });

  describe("deleteUserVerifications", () => {
    it("should delete all verifications for a user", async () => {
      const mockVerifications = [
        createMockVerification({ id: "verification-1" }),
        createMockVerification({ id: "verification-2" }),
        createMockVerification({ id: "verification-3" }),
      ];

      const mockSnapshot = {
        docs: mockVerifications.map((v) => ({
          data: () => v,
        })),
      };

      (collection as jest.Mock).mockReturnValue({});
      (query as jest.Mock).mockImplementation((...args) => args);
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);
      (doc as jest.Mock).mockReturnValue({});

      const mockDeleteDoc = jest.fn().mockResolvedValue(undefined);
      require("firebase/firestore").deleteDoc = mockDeleteDoc;

      const result = await OTPService.deleteUserVerifications(mockUserId);

      expect(result).toBe(3);
      expect(mockDeleteDoc).toHaveBeenCalledTimes(3);
    });

    it("should return 0 on error", async () => {
      (collection as jest.Mock).mockReturnValue({});
      (query as jest.Mock).mockImplementation((...args) => args);
      (getDocs as jest.Mock).mockRejectedValue(new Error("Firestore error"));

      const result = await OTPService.deleteUserVerifications(mockUserId);

      expect(result).toBe(0);
    });
  });

  // ========================================
  // Validation
  // ========================================

  describe("isVerificationValid", () => {
    it("should return valid for fresh verification", () => {
      const mockVerification = createMockVerification();

      const result = OTPService.isVerificationValid(mockVerification);

      expect(result.success).toBe(true);
      expect(result.remainingAttempts).toBe(3);
    });

    it("should detect expired verification", () => {
      const expiredDate = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
      const mockVerification = createMockVerification({
        expiresAt: FirestoreTimestamp.fromDate(expiredDate) as any,
      });

      const result = OTPService.isVerificationValid(mockVerification);

      expect(result.success).toBe(false);
      expect(result.message).toContain("expired");
    });

    it("should detect locked verification after max attempts", () => {
      const mockVerification = createMockVerification({
        attempts: 3,
        maxAttempts: 3,
      });

      const result = OTPService.isVerificationValid(mockVerification);

      expect(result.success).toBe(false);
      expect(result.locked).toBe(true);
      expect(result.remainingAttempts).toBe(0);
      expect(result.message).toContain("Too many failed attempts");
    });

    it("should detect already verified OTP", () => {
      const mockVerification = createMockVerification({
        verified: true,
      });

      const result = OTPService.isVerificationValid(mockVerification);

      expect(result.success).toBe(false);
      expect(result.message).toContain("already been used");
    });

    it("should calculate remaining attempts correctly", () => {
      const mockVerification = createMockVerification({
        attempts: 1,
        maxAttempts: 3,
      });

      const result = OTPService.isVerificationValid(mockVerification);

      expect(result.success).toBe(true);
      expect(result.remainingAttempts).toBe(2);
    });
  });

  // ========================================
  // Helper Methods
  // ========================================

  describe("getLatestVerification", () => {
    it("should return the latest unverified verification", async () => {
      const mockVerification = createMockVerification();
      const mockSnapshot = {
        docs: [
          {
            data: () => mockVerification,
          },
        ],
      };

      (collection as jest.Mock).mockReturnValue({});
      (query as jest.Mock).mockImplementation((...args) => args);
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await OTPService.getLatestVerification(
        mockUserId,
        "PHONE_VERIFICATION"
      );

      expect(result).toEqual(mockVerification);
    });

    it("should return null if no verifications found", async () => {
      const mockSnapshot = {
        docs: [],
      };

      (collection as jest.Mock).mockReturnValue({});
      (query as jest.Mock).mockImplementation((...args) => args);
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await OTPService.getLatestVerification(
        mockUserId,
        "2FA_LOGIN"
      );

      expect(result).toBeNull();
    });

    it("should handle errors gracefully", async () => {
      (collection as jest.Mock).mockReturnValue({});
      (query as jest.Mock).mockImplementation((...args) => args);
      (getDocs as jest.Mock).mockRejectedValue(new Error("Firestore error"));

      const result = await OTPService.getLatestVerification(
        mockUserId,
        "PHONE_CHANGE"
      );

      expect(result).toBeNull();
    });
  });
});
