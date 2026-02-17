/**
 * Security Events Service Tests
 *
 * Tests for security audit trail logging, retrieval, and filtering.
 */

import {
  logSecurityEvent,
  getSecurityEvents,
  getSecurityEventsByType,
} from "../security-events";
import type { SecurityEventType } from "../security-events";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";

// Mock Firebase
jest.mock("../config", () => ({
  firebaseApp: {},
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(() => ({ id: "mock-doc-id" })),
  setDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  getDocs: jest.fn(),
  serverTimestamp: jest.fn(() => "mock-server-timestamp"),
  Timestamp: {
    fromDate: jest.fn((d: Date) => ({
      toDate: () => d,
      seconds: Math.floor(d.getTime() / 1000),
    })),
  },
}));

// Helpers
const mockSetDoc = setDoc as jest.Mock;
const mockGetDocs = getDocs as jest.Mock;
const mockDoc = doc as jest.Mock;
const mockCollection = collection as jest.Mock;
const mockQuery = query as jest.Mock;
const mockWhere = where as jest.Mock;
const mockOrderBy = orderBy as jest.Mock;
const mockLimit = limit as jest.Mock;
const mockTimestampFromDate = Timestamp.fromDate as jest.Mock;

function createMockSnapshot(docs: Array<{ id: string; data: Record<string, unknown> }>) {
  const snapshotDocs = docs.map((d) => ({
    id: d.id,
    data: () => d.data,
  }));
  return {
    forEach: (cb: (doc: { id: string; data: () => Record<string, unknown> }) => void) => {
      snapshotDocs.forEach(cb);
    },
  };
}

describe("Security Events Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetDoc.mockResolvedValue(undefined);
    mockCollection.mockReturnValue({});
    mockQuery.mockImplementation((...args: unknown[]) => args);
    mockWhere.mockReturnValue({});
    mockOrderBy.mockReturnValue({});
    mockLimit.mockReturnValue({});
  });

  // ========================================
  // logSecurityEvent
  // ========================================

  describe("logSecurityEvent", () => {
    it("should log a security event and return the document ID", async () => {
      mockDoc.mockReturnValue({ id: "event-001" });

      const result = await logSecurityEvent({
        userId: "user-123",
        eventType: "2FA_ENABLED",
      });

      expect(result).toBe("event-001");
      expect(mockSetDoc).toHaveBeenCalledTimes(1);
    });

    it("should throw if userId is missing", async () => {
      await expect(
        logSecurityEvent({ userId: "", eventType: "2FA_ENABLED" })
      ).rejects.toThrow("userId is required for security event logging");
    });

    it("should throw if eventType is missing", async () => {
      await expect(
        logSecurityEvent({ userId: "user-123", eventType: "" as SecurityEventType })
      ).rejects.toThrow("eventType is required for security event logging");
    });

    it("should set _expiresAt to approximately 90 days from now", async () => {
      mockDoc.mockReturnValue({ id: "event-ttl" });

      await logSecurityEvent({
        userId: "user-123",
        eventType: "PHONE_VERIFIED",
      });

      expect(mockTimestampFromDate).toHaveBeenCalledTimes(1);
      const dateArg: Date = mockTimestampFromDate.mock.calls[0][0];
      const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
      const diff = dateArg.getTime() - Date.now();
      // Allow 5 seconds tolerance
      expect(diff).toBeGreaterThan(ninetyDaysMs - 5000);
      expect(diff).toBeLessThanOrEqual(ninetyDaysMs + 5000);
    });

    it("should default success to true", async () => {
      mockDoc.mockReturnValue({ id: "event-default" });

      await logSecurityEvent({
        userId: "user-123",
        eventType: "2FA_ENABLED",
      });

      const dataArg = mockSetDoc.mock.calls[0][1];
      expect(dataArg.success).toBe(true);
    });

    it("should allow setting success to false", async () => {
      mockDoc.mockReturnValue({ id: "event-fail" });

      await logSecurityEvent({
        userId: "user-123",
        eventType: "2FA_LOGIN_FAILED",
        success: false,
      });

      const dataArg = mockSetDoc.mock.calls[0][1];
      expect(dataArg.success).toBe(false);
    });

    it("should store metadata in the document", async () => {
      mockDoc.mockReturnValue({ id: "event-meta" });

      await logSecurityEvent({
        userId: "user-123",
        eventType: "BACKUP_CODES_GENERATED",
        metadata: { codesCount: 8, regenerated: true },
      });

      const dataArg = mockSetDoc.mock.calls[0][1];
      expect(dataArg.metadata).toEqual({ codesCount: 8, regenerated: true });
    });

    it("should default metadata to empty object", async () => {
      mockDoc.mockReturnValue({ id: "event-no-meta" });

      await logSecurityEvent({
        userId: "user-123",
        eventType: "2FA_ENABLED",
      });

      const dataArg = mockSetDoc.mock.calls[0][1];
      expect(dataArg.metadata).toEqual({});
    });

    it("should store masked phone number", async () => {
      mockDoc.mockReturnValue({ id: "event-phone" });

      await logSecurityEvent({
        userId: "user-123",
        eventType: "PHONE_CHANGED",
        phoneNumber: "+63917***4567",
      });

      const dataArg = mockSetDoc.mock.calls[0][1];
      expect(dataArg.phoneNumber).toBe("+63917***4567");
    });

    it("should default phoneNumber to null", async () => {
      mockDoc.mockReturnValue({ id: "event-no-phone" });

      await logSecurityEvent({
        userId: "user-123",
        eventType: "2FA_ENABLED",
      });

      const dataArg = mockSetDoc.mock.calls[0][1];
      expect(dataArg.phoneNumber).toBeNull();
    });

    it("should store ipAddress and userAgent", async () => {
      mockDoc.mockReturnValue({ id: "event-ua" });

      await logSecurityEvent({
        userId: "user-123",
        eventType: "2FA_LOGIN_SUCCESS",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
      });

      const dataArg = mockSetDoc.mock.calls[0][1];
      expect(dataArg.ipAddress).toBe("192.168.1.1");
      expect(dataArg.userAgent).toBe("Mozilla/5.0");
    });

    it("should default ipAddress and userAgent to null", async () => {
      mockDoc.mockReturnValue({ id: "event-null-ua" });

      await logSecurityEvent({
        userId: "user-123",
        eventType: "2FA_ENABLED",
      });

      const dataArg = mockSetDoc.mock.calls[0][1];
      expect(dataArg.ipAddress).toBeNull();
      expect(dataArg.userAgent).toBeNull();
    });

    it("should use serverTimestamp for createdAt", async () => {
      mockDoc.mockReturnValue({ id: "event-ts" });

      await logSecurityEvent({
        userId: "user-123",
        eventType: "2FA_ENABLED",
      });

      const { serverTimestamp } = require("firebase/firestore");
      const dataArg = mockSetDoc.mock.calls[0][1];
      expect(dataArg.createdAt).toBeInstanceOf(Date);
      expect(serverTimestamp).toHaveBeenCalled();
    });

    it("should propagate Firestore write errors", async () => {
      mockDoc.mockReturnValue({ id: "event-err" });
      mockSetDoc.mockRejectedValue(new Error("Firestore write failed"));

      await expect(
        logSecurityEvent({ userId: "user-123", eventType: "2FA_ENABLED" })
      ).rejects.toThrow("Firestore write failed");
    });
  });

  // ========================================
  // getSecurityEvents
  // ========================================

  describe("getSecurityEvents", () => {
    it("should return events sorted by createdAt desc", async () => {
      const now = new Date();
      const earlier = new Date(now.getTime() - 60000);
      mockGetDocs.mockResolvedValue(
        createMockSnapshot([
          {
            id: "evt-1",
            data: {
              userId: "user-123",
              eventType: "2FA_ENABLED",
              success: true,
              metadata: {},
              createdAt: { toDate: () => now },
              _expiresAt: { toDate: () => new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000) },
            },
          },
          {
            id: "evt-2",
            data: {
              userId: "user-123",
              eventType: "PHONE_VERIFIED",
              success: true,
              metadata: {},
              createdAt: { toDate: () => earlier },
              _expiresAt: { toDate: () => new Date(earlier.getTime() + 90 * 24 * 60 * 60 * 1000) },
            },
          },
        ])
      );

      const events = await getSecurityEvents("user-123");

      expect(events).toHaveLength(2);
      expect(events[0].id).toBe("evt-1");
      expect(events[1].id).toBe("evt-2");
    });

    it("should throw if userId is missing", async () => {
      await expect(getSecurityEvents("")).rejects.toThrow(
        "userId is required to retrieve security events"
      );
    });

    it("should respect maxRecords parameter", async () => {
      mockGetDocs.mockResolvedValue(createMockSnapshot([]));

      await getSecurityEvents("user-123", 10);

      expect(mockLimit).toHaveBeenCalledWith(10);
    });

    it("should default maxRecords to 50", async () => {
      mockGetDocs.mockResolvedValue(createMockSnapshot([]));

      await getSecurityEvents("user-123");

      expect(mockLimit).toHaveBeenCalledWith(50);
    });

    it("should return empty array when no events exist", async () => {
      mockGetDocs.mockResolvedValue(createMockSnapshot([]));

      const events = await getSecurityEvents("user-123");

      expect(events).toEqual([]);
    });

    it("should use where clause for userId", async () => {
      mockGetDocs.mockResolvedValue(createMockSnapshot([]));

      await getSecurityEvents("user-456");

      expect(mockWhere).toHaveBeenCalledWith("userId", "==", "user-456");
    });

    it("should handle createdAt without toDate method", async () => {
      const dateStr = "2026-02-15T00:00:00.000Z";
      mockGetDocs.mockResolvedValue(
        createMockSnapshot([
          {
            id: "evt-raw",
            data: {
              userId: "user-123",
              eventType: "2FA_ENABLED",
              success: true,
              metadata: {},
              createdAt: dateStr,
              _expiresAt: dateStr,
            },
          },
        ])
      );

      const events = await getSecurityEvents("user-123");

      expect(events).toHaveLength(1);
      expect(events[0].createdAt).toBeInstanceOf(Date);
    });
  });

  // ========================================
  // getSecurityEventsByType
  // ========================================

  describe("getSecurityEventsByType", () => {
    it("should filter events by type", async () => {
      const now = new Date();
      mockGetDocs.mockResolvedValue(
        createMockSnapshot([
          {
            id: "evt-f1",
            data: {
              userId: "user-123",
              eventType: "2FA_LOGIN_FAILED",
              success: false,
              metadata: {},
              createdAt: { toDate: () => now },
              _expiresAt: { toDate: () => new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000) },
            },
          },
        ])
      );

      const events = await getSecurityEventsByType("user-123", "2FA_LOGIN_FAILED");

      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe("2FA_LOGIN_FAILED");
    });

    it("should throw if userId is missing", async () => {
      await expect(
        getSecurityEventsByType("", "2FA_ENABLED")
      ).rejects.toThrow("userId is required to retrieve security events");
    });

    it("should throw if eventType is missing", async () => {
      await expect(
        getSecurityEventsByType("user-123", "" as SecurityEventType)
      ).rejects.toThrow("eventType is required to filter security events");
    });

    it("should combine userId and eventType where clauses", async () => {
      mockGetDocs.mockResolvedValue(createMockSnapshot([]));

      await getSecurityEventsByType("user-789", "PHONE_CHANGED");

      expect(mockWhere).toHaveBeenCalledWith("userId", "==", "user-789");
      expect(mockWhere).toHaveBeenCalledWith("eventType", "==", "PHONE_CHANGED");
    });

    it("should respect maxRecords parameter", async () => {
      mockGetDocs.mockResolvedValue(createMockSnapshot([]));

      await getSecurityEventsByType("user-123", "2FA_ENABLED", 5);

      expect(mockLimit).toHaveBeenCalledWith(5);
    });

    it("should default maxRecords to 50", async () => {
      mockGetDocs.mockResolvedValue(createMockSnapshot([]));

      await getSecurityEventsByType("user-123", "2FA_ENABLED");

      expect(mockLimit).toHaveBeenCalledWith(50);
    });

    it("should return empty array when no matching events", async () => {
      mockGetDocs.mockResolvedValue(createMockSnapshot([]));

      const events = await getSecurityEventsByType("user-123", "ACCOUNT_RECOVERY_INITIATED");

      expect(events).toEqual([]);
    });

    it("should map nullable fields correctly", async () => {
      const now = new Date();
      mockGetDocs.mockResolvedValue(
        createMockSnapshot([
          {
            id: "evt-nullable",
            data: {
              userId: "user-123",
              eventType: "BACKUP_CODES_GENERATED",
              createdAt: { toDate: () => now },
              _expiresAt: { toDate: () => new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000) },
            },
          },
        ])
      );

      const events = await getSecurityEventsByType("user-123", "BACKUP_CODES_GENERATED");

      expect(events[0].ipAddress).toBeNull();
      expect(events[0].userAgent).toBeNull();
      expect(events[0].phoneNumber).toBeNull();
      expect(events[0].success).toBe(true);
      expect(events[0].metadata).toEqual({});
    });
  });
});
