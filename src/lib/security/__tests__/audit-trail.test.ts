/**
 * Security Audit Trail Service - Unit Tests
 *
 * Tests for logSecurityEvent and getRecentEvents functions.
 * Firestore is fully mocked via the global jest.setupMocks.js.
 * We configure mock behaviors in beforeEach for each test.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { SecurityEventType } from "@/types/security";
import type { LogSecurityEventInput, SecurityEvent } from "@/types/security";

// ---------------------------------------------------------------------------
// Override specific mocks that the global setupMocks doesn't cover
// ---------------------------------------------------------------------------

jest.mock("@/lib/firebase/config", () => ({
  firebaseApp: "mock-firebase-app",
}));

jest.mock("@/lib/phone-utils", () => ({
  maskPhoneNumber: jest.fn((phone: string) => {
    if (!phone) return "";
    const last2 = phone.slice(-2);
    return `+63 *** *** **${last2}`;
  }),
  formatPhoneNumber: jest.fn((p: string) => p),
  validatePhoneNumber: jest.fn(() => ({ isValid: true, formatted: "+639123456789" })),
  normalizePhoneNumber: jest.fn((p: string) => p),
}));

// ---------------------------------------------------------------------------
// Import mocked firebase/firestore functions (from global mock)
// ---------------------------------------------------------------------------

import {
  setDoc,
  getDocs,
  doc,
  collection,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  getFirestore,
} from "firebase/firestore";

// Import module under test
import { logSecurityEvent, getRecentEvents } from "../audit-trail";
import { maskPhoneNumber } from "@/lib/phone-utils";

// Cast to jest.Mock for convenience
const mockSetDoc = setDoc as jest.Mock;
const mockGetDocs = getDocs as jest.Mock;
const mockDoc = doc as jest.Mock;
const mockCollection = collection as jest.Mock;
const mockWhere = where as jest.Mock;
const mockOrderBy = orderBy as jest.Mock;
const mockLimit = limit as jest.Mock;
const mockGetFirestore = getFirestore as jest.Mock;
const mockTimestampNow = (Timestamp as any).now as jest.Mock;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MOCK_NOW_MS = 1700000000000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildInput(
  overrides: Partial<LogSecurityEventInput> = {}
): LogSecurityEventInput {
  return {
    userId: "user-123",
    eventType: SecurityEventType.OTP_SENT,
    phoneNumber: "+639123456789",
    success: true,
    metadata: { purpose: "PHONE_VERIFICATION" },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Security Audit Trail Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Configure Firestore mocks for our service
    mockGetFirestore.mockReturnValue("mock-db");
    mockDoc.mockReturnValue({ id: "mock-event-id" });
    mockCollection.mockReturnValue("mock-collection-ref");
    mockWhere.mockReturnValue("mock-where");
    mockOrderBy.mockReturnValue("mock-orderBy");
    mockLimit.mockReturnValue("mock-limit");
    mockSetDoc.mockResolvedValue(undefined);

    // Timestamp.now() must return { toMillis }
    mockTimestampNow.mockReturnValue({
      toMillis: () => MOCK_NOW_MS,
    });

    // Timestamp.fromMillis must be available
    (Timestamp as any).fromMillis = jest.fn((ms: number) => ({
      toMillis: () => ms,
    }));
  });

  // =========================================================================
  // logSecurityEvent
  // =========================================================================

  describe("logSecurityEvent", () => {
    it("should create a security event document in Firestore", async () => {
      const input = buildInput();

      await logSecurityEvent(input);

      expect(mockSetDoc).toHaveBeenCalledTimes(1);

      const [docRef, eventData] = mockSetDoc.mock.calls[0];
      expect(docRef).toEqual({ id: "mock-event-id" });
      expect(eventData.id).toBe("mock-event-id");
      expect(eventData.userId).toBe("user-123");
      expect(eventData.eventType).toBe(SecurityEventType.OTP_SENT);
      expect(eventData.success).toBe(true);
      expect(eventData.metadata).toEqual({ purpose: "PHONE_VERIFICATION" });
    });

    it("should mask the phone number before storing", async () => {
      const input = buildInput({ phoneNumber: "+639123456789" });

      await logSecurityEvent(input);

      expect(maskPhoneNumber).toHaveBeenCalledWith("+639123456789");

      const eventData = mockSetDoc.mock.calls[0][1];
      expect(eventData.phoneNumber).toBe("+63 *** *** **89");
    });

    it("should set empty string for phoneNumber when not provided", async () => {
      const input = buildInput({ phoneNumber: undefined });

      await logSecurityEvent(input);

      const eventData = mockSetDoc.mock.calls[0][1];
      expect(eventData.phoneNumber).toBe("");
    });

    it("should default success to true when not provided", async () => {
      const input = buildInput({ success: undefined });

      await logSecurityEvent(input);

      const eventData = mockSetDoc.mock.calls[0][1];
      expect(eventData.success).toBe(true);
    });

    it("should set success to false when explicitly provided", async () => {
      const input = buildInput({ success: false });

      await logSecurityEvent(input);

      const eventData = mockSetDoc.mock.calls[0][1];
      expect(eventData.success).toBe(false);
    });

    it("should populate createdAt and _expiresAt timestamps", async () => {
      await logSecurityEvent(buildInput());

      const eventData = mockSetDoc.mock.calls[0][1];

      expect(eventData.createdAt.toMillis()).toBe(MOCK_NOW_MS);

      // _expiresAt should be createdAt + 90 days in milliseconds
      const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
      expect((Timestamp as any).fromMillis).toHaveBeenCalledWith(
        MOCK_NOW_MS + ninetyDaysMs
      );
      expect(eventData._expiresAt.toMillis()).toBe(MOCK_NOW_MS + ninetyDaysMs);
    });

    it("should use fallback 'unknown' for ipAddress when not provided", async () => {
      await logSecurityEvent(buildInput({ ipAddress: undefined }));

      const eventData = mockSetDoc.mock.calls[0][1];
      expect(eventData.ipAddress).toBe("unknown");
    });

    it("should use provided ipAddress when given", async () => {
      await logSecurityEvent(buildInput({ ipAddress: "192.168.1.1" }));

      const eventData = mockSetDoc.mock.calls[0][1];
      expect(eventData.ipAddress).toBe("192.168.1.1");
    });

    it("should auto-detect userAgent from navigator when not provided", async () => {
      await logSecurityEvent(buildInput({ userAgent: undefined }));

      const eventData = mockSetDoc.mock.calls[0][1];
      // jsdom provides a navigator.userAgent; in real Node.js SSR it would be 'unknown'
      expect(typeof eventData.userAgent).toBe("string");
      expect(eventData.userAgent.length).toBeGreaterThan(0);
    });

    it("should use provided userAgent when given", async () => {
      await logSecurityEvent(
        buildInput({ userAgent: "Mozilla/5.0 TestBrowser" })
      );

      const eventData = mockSetDoc.mock.calls[0][1];
      expect(eventData.userAgent).toBe("Mozilla/5.0 TestBrowser");
    });

    it("should default metadata to empty object when not provided", async () => {
      await logSecurityEvent(buildInput({ metadata: undefined }));

      const eventData = mockSetDoc.mock.calls[0][1];
      expect(eventData.metadata).toEqual({});
    });

    it("should throw if userId is missing", async () => {
      await expect(
        logSecurityEvent(buildInput({ userId: "" }))
      ).rejects.toThrow("userId is required");
    });

    it("should throw if eventType is missing", async () => {
      await expect(
        logSecurityEvent({
          userId: "user-123",
          eventType: "" as SecurityEventType,
        })
      ).rejects.toThrow("eventType is required");
    });

    it("should log all supported event types", async () => {
      const eventTypes = Object.values(SecurityEventType);

      for (const eventType of eventTypes) {
        jest.clearAllMocks();
        // Re-apply mock config after clearAllMocks
        mockDoc.mockReturnValue({ id: "mock-event-id" });
        mockCollection.mockReturnValue("mock-collection-ref");
        mockSetDoc.mockResolvedValue(undefined);
        mockTimestampNow.mockReturnValue({ toMillis: () => MOCK_NOW_MS });
        (Timestamp as any).fromMillis = jest.fn((ms: number) => ({
          toMillis: () => ms,
        }));

        await logSecurityEvent(buildInput({ eventType }));

        const eventData = mockSetDoc.mock.calls[0][1];
        expect(eventData.eventType).toBe(eventType);
      }
    });
  });

  // =========================================================================
  // getRecentEvents
  // =========================================================================

  describe("getRecentEvents", () => {
    const mockEvent: SecurityEvent = {
      id: "evt-1",
      userId: "user-123",
      eventType: SecurityEventType.PHONE_VERIFIED,
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0",
      phoneNumber: "+63 *** *** **89",
      success: true,
      metadata: {},
      createdAt: { toMillis: () => MOCK_NOW_MS } as any,
      _expiresAt: { toMillis: () => MOCK_NOW_MS + 90 * 86400000 } as any,
    };

    it("should query Firestore for user events ordered by createdAt desc", async () => {
      mockGetDocs.mockResolvedValue({
        forEach: (cb: (doc: { data: () => SecurityEvent }) => void) => {
          cb({ data: () => mockEvent });
        },
      });

      const events = await getRecentEvents("user-123");

      expect(mockWhere).toHaveBeenCalledWith("userId", "==", "user-123");
      expect(mockOrderBy).toHaveBeenCalledWith("createdAt", "desc");
      expect(mockLimit).toHaveBeenCalledWith(10);
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe(SecurityEventType.PHONE_VERIFIED);
    });

    it("should return empty array for empty userId", async () => {
      const events = await getRecentEvents("");

      expect(mockGetDocs).not.toHaveBeenCalled();
      expect(events).toEqual([]);
    });

    it("should respect custom limit parameter", async () => {
      mockGetDocs.mockResolvedValue({
        forEach: () => {},
      });

      await getRecentEvents("user-123", 5);

      expect(mockLimit).toHaveBeenCalledWith(5);
    });

    it("should return multiple events in order", async () => {
      const event2: SecurityEvent = {
        ...mockEvent,
        id: "evt-2",
        eventType: SecurityEventType.OTP_FAILED,
        success: false,
      };

      mockGetDocs.mockResolvedValue({
        forEach: (cb: (doc: { data: () => SecurityEvent }) => void) => {
          cb({ data: () => mockEvent });
          cb({ data: () => event2 });
        },
      });

      const events = await getRecentEvents("user-123");

      expect(events).toHaveLength(2);
      expect(events[0].id).toBe("evt-1");
      expect(events[1].id).toBe("evt-2");
      expect(events[1].success).toBe(false);
    });

    it("should return empty array when no events exist", async () => {
      mockGetDocs.mockResolvedValue({
        forEach: () => {},
      });

      const events = await getRecentEvents("user-999");

      expect(events).toEqual([]);
    });
  });
});
