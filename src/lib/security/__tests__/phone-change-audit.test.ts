/**
 * Phone Change Audit Service Tests
 *
 * Tests for Firestore-backed audit logging of phone number changes.
 */

import { logPhoneChange, getPhoneChangeHistory } from "../phone-change-audit";
import type { PhoneChangeMethod } from "../phone-change-audit";
import {
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
} from "firebase/firestore";

// ============================================================================
// Mocks
// ============================================================================

jest.mock("../../firebase/config", () => ({
  firebaseApp: {},
}));

jest.mock("firebase/firestore", () => {
  const mockModule = {
    getFirestore: jest.fn(() => ({})),
    collection: jest.fn(() => "mock-collection-ref"),
    doc: jest.fn(() => ({ id: "mock-doc-id" })),
    setDoc: jest.fn(() => Promise.resolve()),
    getDocs: jest.fn(() => Promise.resolve({ forEach: () => {} })),
    getDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    query: jest.fn(() => "mock-query"),
    where: jest.fn(() => "mock-where"),
    orderBy: jest.fn(() => "mock-order"),
    serverTimestamp: jest.fn(() => ({ _type: "serverTimestamp" })),
    Timestamp: {
      fromDate: (d: Date) => ({
        toDate: () => d,
        seconds: Math.floor(d.getTime() / 1000),
        nanoseconds: 0,
      }),
    },
  };
  return mockModule;
});

// Cast for easy access
const mockDoc = doc as jest.Mock;
const mockSetDoc = setDoc as jest.Mock;
const mockGetDocs = getDocs as jest.Mock;
const mockCollection = collection as jest.Mock;
const mockWhere = where as jest.Mock;
const mockOrderBy = orderBy as jest.Mock;;

// ============================================================================
// Test Suite
// ============================================================================

describe("phone-change-audit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Re-set defaults after clearAllMocks
    mockDoc.mockReturnValue({ id: "mock-doc-id" });
    mockCollection.mockReturnValue("mock-collection-ref");
    mockSetDoc.mockResolvedValue(undefined);
    mockGetDocs.mockResolvedValue({ forEach: () => {} });
  });

  // ==========================================================================
  // logPhoneChange
  // ==========================================================================

  describe("logPhoneChange", () => {
    it("should create an audit record with all required fields", async () => {
      const recordId = await logPhoneChange(
        "user-123",
        "+639171234567",
        "+639181234567",
        "password_otp"
      );

      expect(recordId).toBe("mock-doc-id");
      expect(mockSetDoc).toHaveBeenCalledTimes(1);
      expect(mockSetDoc).toHaveBeenCalledWith(
        { id: "mock-doc-id" },
        expect.objectContaining({
          userId: "user-123",
          oldPhoneNumber: "+639171234567",
          newPhoneNumber: "+639181234567",
          method: "password_otp",
          ipAddress: null,
          userAgent: null,
        })
      );
    });

    it("should include metadata when provided", async () => {
      await logPhoneChange(
        "user-123",
        "+639171234567",
        "+639181234567",
        "password_2fa_otp",
        { ipAddress: "192.168.1.1", userAgent: "Mozilla/5.0" }
      );

      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ipAddress: "192.168.1.1",
          userAgent: "Mozilla/5.0",
          method: "password_2fa_otp",
        })
      );
    });

    it("should use serverTimestamp for changedAt and createdAt", async () => {
      await logPhoneChange(
        "user-123",
        "+639171234567",
        "+639181234567",
        "password_otp"
      );

      const docData = mockSetDoc.mock.calls[0][1];
      // serverTimestamp() returns a sentinel value used by Firestore
      expect(docData.changedAt).toBeDefined();
      expect(docData.createdAt).toBeDefined();
      // Both should be the same type (whatever serverTimestamp returns)
      expect(typeof docData.changedAt).toBe(typeof docData.createdAt);
    });

    it("should throw if userId is empty", async () => {
      await expect(
        logPhoneChange("", "+639171234567", "+639181234567", "password_otp")
      ).rejects.toThrow("userId is required");
    });

    it("should throw if oldPhoneNumber is empty", async () => {
      await expect(
        logPhoneChange("user-123", "", "+639181234567", "password_otp")
      ).rejects.toThrow("Both old and new phone numbers are required");
    });

    it("should throw if newPhoneNumber is empty", async () => {
      await expect(
        logPhoneChange("user-123", "+639171234567", "", "password_otp")
      ).rejects.toThrow("Both old and new phone numbers are required");
    });

    it("should support admin_override method", async () => {
      await logPhoneChange(
        "user-123",
        "+639171234567",
        "+639181234567",
        "admin_override"
      );

      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ method: "admin_override" })
      );
    });
  });

  // ==========================================================================
  // getPhoneChangeHistory
  // ==========================================================================

  describe("getPhoneChangeHistory", () => {
    const mockFirestoreDate = new Date("2026-01-15T10:00:00Z");
    const mockTimestamp = {
      toDate: () => mockFirestoreDate,
      seconds: Math.floor(mockFirestoreDate.getTime() / 1000),
      nanoseconds: 0,
    };

    it("should return phone change records for a user", async () => {
      mockGetDocs.mockResolvedValue({
        forEach: (cb: (doc: { id: string; data: () => Record<string, unknown> }) => void) => {
          cb({
            id: "record-1",
            data: () => ({
              userId: "user-123",
              oldPhoneNumber: "+639171234567",
              newPhoneNumber: "+639181234567",
              method: "password_otp",
              ipAddress: null,
              userAgent: null,
              changedAt: mockTimestamp,
              createdAt: mockTimestamp,
            }),
          });
        },
      });

      const history = await getPhoneChangeHistory("user-123");

      expect(history).toHaveLength(1);
      expect(history[0]).toEqual({
        id: "record-1",
        userId: "user-123",
        oldPhoneNumber: "+639171234567",
        newPhoneNumber: "+639181234567",
        method: "password_otp",
        ipAddress: null,
        userAgent: null,
        changedAt: mockFirestoreDate,
        createdAt: mockFirestoreDate,
      });
    });

    it("should query with correct userId filter and ordering", async () => {
      mockGetDocs.mockResolvedValue({
        forEach: () => {},
      });

      await getPhoneChangeHistory("user-456");

      expect(mockWhere).toHaveBeenCalledWith("userId", "==", "user-456");
      expect(mockOrderBy).toHaveBeenCalledWith("changedAt", "desc");
    });

    it("should return empty array when no records exist", async () => {
      mockGetDocs.mockResolvedValue({
        forEach: () => {},
      });

      const history = await getPhoneChangeHistory("user-no-history");

      expect(history).toEqual([]);
    });

    it("should throw if userId is empty", async () => {
      await expect(getPhoneChangeHistory("")).rejects.toThrow(
        "userId is required"
      );
    });

    it("should respect the limit parameter", async () => {
      const records: { id: string; data: () => Record<string, unknown> }[] = [];
      for (let i = 0; i < 10; i++) {
        records.push({
          id: `record-${i}`,
          data: () => ({
            userId: "user-123",
            oldPhoneNumber: "+639171234567",
            newPhoneNumber: "+639181234567",
            method: "password_otp" as PhoneChangeMethod,
            ipAddress: null,
            userAgent: null,
            changedAt: mockTimestamp,
            createdAt: mockTimestamp,
          }),
        });
      }

      mockGetDocs.mockResolvedValue({
        forEach: (cb: (doc: { id: string; data: () => Record<string, unknown> }) => void) => {
          records.forEach(cb);
        },
      });

      const history = await getPhoneChangeHistory("user-123", 3);

      expect(history).toHaveLength(3);
    });

    it("should handle records with Date objects instead of Timestamps", async () => {
      const rawDate = new Date("2026-02-01T12:00:00Z");
      mockGetDocs.mockResolvedValue({
        forEach: (cb: (doc: { id: string; data: () => Record<string, unknown> }) => void) => {
          cb({
            id: "record-date",
            data: () => ({
              userId: "user-123",
              oldPhoneNumber: "+639171234567",
              newPhoneNumber: "+639181234567",
              method: "password_2fa_otp",
              ipAddress: "10.0.0.1",
              userAgent: "TestAgent/1.0",
              changedAt: rawDate.toISOString(),
              createdAt: rawDate.toISOString(),
            }),
          });
        },
      });

      const history = await getPhoneChangeHistory("user-123");

      expect(history).toHaveLength(1);
      expect(history[0].ipAddress).toBe("10.0.0.1");
      expect(history[0].userAgent).toBe("TestAgent/1.0");
    });

    it("should return multiple records in order", async () => {
      const records = [
        {
          id: "record-new",
          data: () => ({
            userId: "user-123",
            oldPhoneNumber: "+639181234567",
            newPhoneNumber: "+639191234567",
            method: "password_otp" as PhoneChangeMethod,
            ipAddress: null,
            userAgent: null,
            changedAt: mockTimestamp,
            createdAt: mockTimestamp,
          }),
        },
        {
          id: "record-old",
          data: () => ({
            userId: "user-123",
            oldPhoneNumber: "+639171234567",
            newPhoneNumber: "+639181234567",
            method: "password_2fa_otp" as PhoneChangeMethod,
            ipAddress: null,
            userAgent: null,
            changedAt: mockTimestamp,
            createdAt: mockTimestamp,
          }),
        },
      ];

      mockGetDocs.mockResolvedValue({
        forEach: (cb: (doc: { id: string; data: () => Record<string, unknown> }) => void) => {
          records.forEach(cb);
        },
      });

      const history = await getPhoneChangeHistory("user-123");

      expect(history).toHaveLength(2);
      expect(history[0].id).toBe("record-new");
      expect(history[1].id).toBe("record-old");
    });
  });
});
