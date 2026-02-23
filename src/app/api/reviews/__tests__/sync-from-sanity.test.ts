/**
 * Tests for Sanity to Firebase Sync API - field extraction logic
 */

// Mock @sanity/client
jest.mock("@sanity/client", () => ({
  createClient: jest.fn(() => ({
    fetch: jest.fn(),
  })),
}));

import { extractSyncableFields } from "@/app/api/reviews/sync-from-sanity/route";

describe("extractSyncableFields", () => {
  it("should extract status field", () => {
    const result = extractSyncableFields({ status: "approved" });
    expect(result.fieldsToUpdate.status).toBe("approved");
    expect(result.fieldNames).toContain("status");
  });

  it("should extract admin response fields", () => {
    const result = extractSyncableFields({
      adminResponse: "Thank you!",
      adminResponseDate: "2025-01-02T00:00:00Z",
    });
    expect(result.fieldsToUpdate.adminResponse).toBe("Thank you!");
    expect(result.fieldsToUpdate.adminResponseDate).toBe("2025-01-02T00:00:00Z");
    expect(result.fieldNames).toContain("adminResponse");
    expect(result.fieldNames).toContain("adminResponseDate");
  });

  it("should extract moderation fields", () => {
    const result = extractSyncableFields({
      moderatedBy: "admin-1",
      moderatedAt: "2025-01-02T00:00:00Z",
    });
    expect(result.fieldsToUpdate.moderatedBy).toBe("admin-1");
    expect(result.fieldsToUpdate.moderatedAt).toBe("2025-01-02T00:00:00Z");
    expect(result.fieldNames).toContain("moderatedBy");
    expect(result.fieldNames).toContain("moderatedAt");
  });

  it("should extract flag fields", () => {
    const result = extractSyncableFields({
      flagCount: 3,
      flagReasons: ["spam", "fake"],
    });
    expect(result.fieldsToUpdate.flagCount).toBe(3);
    expect(result.fieldsToUpdate.flagReasons).toEqual(["spam", "fake"]);
    expect(result.fieldNames).toContain("flagCount");
    expect(result.fieldNames).toContain("flagReasons");
  });

  it("should return empty when no syncable fields present", () => {
    const result = extractSyncableFields({ _id: "some-id", title: "test" });
    expect(result.fieldsToUpdate).toEqual({});
    expect(result.fieldNames).toEqual([]);
  });

  it("should extract all fields when all present", () => {
    const result = extractSyncableFields({
      status: "rejected",
      adminResponse: "Rejected for spam",
      adminResponseDate: "2025-01-02",
      moderatedBy: "admin-1",
      moderatedAt: "2025-01-02",
      flagCount: 5,
      flagReasons: ["spam"],
    });
    expect(result.fieldNames).toHaveLength(7);
    expect(result.fieldNames).toEqual(
      expect.arrayContaining([
        "status",
        "adminResponse",
        "adminResponseDate",
        "moderatedBy",
        "moderatedAt",
        "flagCount",
        "flagReasons",
      ]),
    );
  });
});
