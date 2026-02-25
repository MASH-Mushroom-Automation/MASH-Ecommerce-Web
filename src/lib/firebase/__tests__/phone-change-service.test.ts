/**
 * Tests for phone-change-service.ts
 * COVERAGE-007: Firebase Services - Phone Change Audit Trail
 */

jest.unmock("@/lib/firebase/phone-change-service");

import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  getFirestore,
  Timestamp,
} from "firebase/firestore";
import {
  logPhoneChangeAudit,
  getPhoneChangeHistory,
  executePhoneChange,
  type LogPhoneChangeOptions,
} from "@/lib/firebase/phone-change-service";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const mockDocRef = { id: "audit-doc-123", path: "phone_change_history/audit-doc-123" };
const mockCollRef = { id: "phone_change_history" };

function makeOptions(
  overrides: Partial<LogPhoneChangeOptions> = {}
): LogPhoneChangeOptions {
  return {
    userId: "user-1",
    oldPhoneNumber: "+639171234567",
    newPhoneNumber: "+639181234567",
    method: "otp_only",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------
describe("phone-change-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getFirestore).mockReturnValue({} as any);
    jest.mocked(collection).mockReturnValue(mockCollRef as any);
    jest.mocked(doc).mockReturnValue(mockDocRef as any);
    jest.mocked(query).mockReturnValue({} as any);
    jest.mocked(setDoc).mockResolvedValue(undefined);
    jest.mocked(serverTimestamp).mockReturnValue("SERVER_TIMESTAMP" as any);
  });

  // ========================================================================
  // logPhoneChangeAudit
  // ========================================================================
  describe("logPhoneChangeAudit", () => {
    it("creates an audit document and returns the doc ID", async () => {
      const id = await logPhoneChangeAudit(makeOptions());

      expect(id).toBe("audit-doc-123");
      expect(setDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          userId: "user-1",
          oldPhoneNumber: "+639171234567",
          newPhoneNumber: "+639181234567",
          method: "otp_only",
          twoFactorEnabledAtChange: false,
          changedAt: "SERVER_TIMESTAMP",
          createdAt: "SERVER_TIMESTAMP",
        })
      );
    });

    it("throws when userId is missing", async () => {
      await expect(
        logPhoneChangeAudit(makeOptions({ userId: "" }))
      ).rejects.toThrow("userId is required");
    });

    it("throws when oldPhoneNumber is missing", async () => {
      await expect(
        logPhoneChangeAudit(makeOptions({ oldPhoneNumber: "" }))
      ).rejects.toThrow("oldPhoneNumber is required");
    });

    it("throws when newPhoneNumber is missing", async () => {
      await expect(
        logPhoneChangeAudit(makeOptions({ newPhoneNumber: "" }))
      ).rejects.toThrow("newPhoneNumber is required");
    });

    it("passes metadata when provided", async () => {
      await logPhoneChangeAudit(
        makeOptions({
          metadata: {
            ipAddress: "192.168.1.1",
            userAgent: "Mozilla/5.0",
          },
        })
      );

      expect(setDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          ipAddress: "192.168.1.1",
          userAgent: "Mozilla/5.0",
        })
      );
    });

    it("sets metadata to null when not provided", async () => {
      await logPhoneChangeAudit(makeOptions());

      expect(setDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          ipAddress: null,
          userAgent: null,
        })
      );
    });

    it("defaults twoFactorEnabledAtChange to false", async () => {
      await logPhoneChangeAudit(makeOptions());

      expect(setDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({ twoFactorEnabledAtChange: false })
      );
    });

    it("passes twoFactorEnabledAtChange when true", async () => {
      await logPhoneChangeAudit(
        makeOptions({ twoFactorEnabledAtChange: true })
      );

      expect(setDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({ twoFactorEnabledAtChange: true })
      );
    });

    it("supports all PhoneChangeMethod values", async () => {
      const methods = [
        "otp_only",
        "password_otp",
        "password_2fa_otp",
        "admin_override",
      ] as const;

      for (const method of methods) {
        jest.clearAllMocks();
        jest.mocked(collection).mockReturnValue(mockCollRef as any);
        jest.mocked(doc).mockReturnValue(mockDocRef as any);
        jest.mocked(setDoc).mockResolvedValue(undefined);
        jest.mocked(serverTimestamp).mockReturnValue("SERVER_TIMESTAMP" as any);

        await logPhoneChangeAudit(makeOptions({ method }));

        expect(setDoc).toHaveBeenCalledWith(
          mockDocRef,
          expect.objectContaining({ method })
        );
      }
    });

    it("throws on Firestore write failure", async () => {
      jest.mocked(setDoc).mockRejectedValueOnce(new Error("Write failed"));

      await expect(logPhoneChangeAudit(makeOptions())).rejects.toThrow(
        "Write failed"
      );
    });
  });

  // ========================================================================
  // getPhoneChangeHistory
  // ========================================================================
  describe("getPhoneChangeHistory", () => {
    it("returns audit records for user, most recent first", async () => {
      const nowDate = new Date("2025-01-15T10:00:00Z");
      const mockTimestamp = { toDate: () => nowDate, seconds: 1 };
      const mockDocs = [
        {
          id: "audit-1",
          data: () => ({
            userId: "user-1",
            oldPhoneNumber: "+639170000001",
            newPhoneNumber: "+639180000001",
            method: "otp_only",
            ipAddress: null,
            userAgent: null,
            twoFactorEnabledAtChange: false,
            changedAt: mockTimestamp,
            createdAt: mockTimestamp,
          }),
        },
      ];

      jest.mocked(getDocs).mockResolvedValueOnce({
        docs: mockDocs,
        empty: false,
        forEach: (cb: (doc: any) => void) => mockDocs.forEach(cb),
      } as any);

      const records = await getPhoneChangeHistory("user-1");

      expect(records).toHaveLength(1);
      expect(records[0].id).toBe("audit-1");
      expect(records[0].changedAt).toEqual(nowDate);
      expect(records[0].userId).toBe("user-1");
    });

    it("throws when userId is empty", async () => {
      await expect(getPhoneChangeHistory("")).rejects.toThrow(
        "userId is required"
      );
    });

    it("builds query with where, orderBy, limit", async () => {
      jest.mocked(getDocs).mockResolvedValueOnce({
        docs: [],
        empty: true,
        forEach: () => {},
      } as any);

      await getPhoneChangeHistory("user-1", 10);

      expect(where).toHaveBeenCalledWith("userId", "==", "user-1");
      expect(orderBy).toHaveBeenCalledWith("changedAt", "desc");
      expect(limit).toHaveBeenCalledWith(10);
    });

    it("defaults maxRecords to 50", async () => {
      jest.mocked(getDocs).mockResolvedValueOnce({
        docs: [],
        empty: true,
        forEach: () => {},
      } as any);

      await getPhoneChangeHistory("user-1");

      expect(limit).toHaveBeenCalledWith(50);
    });

    it("returns empty array when no records", async () => {
      jest.mocked(getDocs).mockResolvedValueOnce({
        docs: [],
        empty: true,
        forEach: () => {},
      } as any);

      const records = await getPhoneChangeHistory("user-1");

      expect(records).toEqual([]);
    });

    it("converts raw date strings when Timestamp.toDate not available", async () => {
      const dateStr = "2025-01-15T10:00:00Z";
      const mockDocs = [
        {
          id: "audit-2",
          data: () => ({
            userId: "user-1",
            oldPhoneNumber: "+639170000001",
            newPhoneNumber: "+639180000001",
            method: "password_otp",
            changedAt: dateStr,
            createdAt: dateStr,
          }),
        },
      ];
      jest.mocked(getDocs).mockResolvedValueOnce({
        docs: mockDocs,
        empty: false,
        forEach: (cb: (doc: any) => void) => mockDocs.forEach(cb),
      } as any);

      const records = await getPhoneChangeHistory("user-1");

      expect(records[0].changedAt).toEqual(new Date(dateStr));
    });

    it("handles missing optional fields with defaults", async () => {
      const mockDocs = [
        {
          id: "audit-3",
          data: () => ({
            userId: "user-1",
            oldPhoneNumber: "+639170000001",
            newPhoneNumber: "+639180000001",
            method: "otp_only",
            changedAt: { toDate: () => new Date() },
            createdAt: { toDate: () => new Date() },
            // ipAddress, userAgent, twoFactorEnabledAtChange omitted
          }),
        },
      ];
      jest.mocked(getDocs).mockResolvedValueOnce({
        docs: mockDocs,
        empty: false,
        forEach: (cb: (doc: any) => void) => mockDocs.forEach(cb),
      } as any);

      const records = await getPhoneChangeHistory("user-1");

      expect(records[0].ipAddress).toBeNull();
      expect(records[0].userAgent).toBeNull();
      expect(records[0].twoFactorEnabledAtChange).toBe(false);
    });
  });

  // ========================================================================
  // executePhoneChange
  // ========================================================================
  describe("executePhoneChange", () => {
    it("returns success result with audit ID", async () => {
      const result = await executePhoneChange(makeOptions());

      expect(result).toEqual({
        success: true,
        auditId: "audit-doc-123",
        error: null,
      });
    });

    it("returns failure result on error", async () => {
      jest
        .mocked(setDoc)
        .mockRejectedValueOnce(new Error("Firestore unavailable"));

      const result = await executePhoneChange(makeOptions());

      expect(result).toEqual({
        success: false,
        auditId: null,
        error: "Firestore unavailable",
      });
    });

    it("returns failure result on validation error", async () => {
      const result = await executePhoneChange(makeOptions({ userId: "" }));

      expect(result.success).toBe(false);
      expect(result.auditId).toBeNull();
      expect(result.error).toContain("userId is required");
    });

    it("handles non-Error thrown values", async () => {
      jest.mocked(setDoc).mockRejectedValueOnce("raw string error");

      const result = await executePhoneChange(makeOptions());

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to log phone change");
    });
  });
});
