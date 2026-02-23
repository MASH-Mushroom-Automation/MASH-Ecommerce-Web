/**
 * Tests for Firebase to Sanity Sync API - mapping logic
 */

// Mock @sanity/client before imports
jest.mock("@sanity/client", () => ({
  createClient: jest.fn(() => ({
    fetch: jest.fn(),
    createOrReplace: jest.fn(),
  })),
}));

import { mapFirebaseToSanity } from "@/app/api/reviews/sync-to-sanity/route";

describe("mapFirebaseToSanity", () => {
  const baseReviewData = {
    targetType: "product" as const,
    targetId: "product-123",
    targetName: "Test Product",
    userId: "user-1",
    userName: "John Doe",
    userEmail: "john@test.com",
    userPhotoURL: "https://example.com/photo.jpg",
    rating: 5,
    title: "Great product",
    content: "Loved it, would buy again.",
    images: ["https://example.com/img1.jpg"],
    status: "approved",
    verifiedPurchase: true,
    helpfulCount: 3,
    flagCount: 0,
    flagReasons: [],
    createdAt: "2025-01-01T00:00:00Z",
  };

  it("should map basic review fields correctly", () => {
    const result = mapFirebaseToSanity("review-1", baseReviewData, null);

    expect(result._type).toBe("review");
    expect(result.targetType).toBe("product");
    expect(result.targetId).toBe("product-123");
    expect(result.customerName).toBe("John Doe");
    expect(result.customerEmail).toBe("john@test.com");
    expect(result.firebaseUserId).toBe("user-1");
    expect(result.rating).toBe(5);
    expect(result.title).toBe("Great product");
    expect(result.content).toBe("Loved it, would buy again.");
    expect(result.verifiedPurchase).toBe(true);
    expect(result.status).toBe("approved");
    expect(result.helpfulCount).toBe(3);
    expect(result.flagCount).toBe(0);
    expect(result.reviewDate).toBe("2025-01-01T00:00:00Z");
    expect(result.firebaseReviewId).toBe("review-1");
  });

  it("should set product reference when sanityTargetRef provided", () => {
    const result = mapFirebaseToSanity("review-1", baseReviewData, "sanity-product-id");

    expect(result.product).toEqual({
      _type: "reference",
      _ref: "sanity-product-id",
    });
    expect(result.grower).toBeUndefined();
  });

  it("should set grower reference for grower reviews", () => {
    const growerData = { ...baseReviewData, targetType: "grower" as const };
    const result = mapFirebaseToSanity("review-2", growerData, "sanity-grower-id");

    expect(result.grower).toEqual({
      _type: "reference",
      _ref: "sanity-grower-id",
    });
    expect(result.product).toBeUndefined();
  });

  it("should not set reference when sanityTargetRef is null", () => {
    const result = mapFirebaseToSanity("review-1", baseReviewData, null);

    expect(result.product).toBeUndefined();
    expect(result.grower).toBeUndefined();
  });

  it("should include moderation fields when present", () => {
    const moderatedData = {
      ...baseReviewData,
      adminResponse: "Thank you for your review!",
      adminResponseDate: "2025-01-02T00:00:00Z",
      moderatedBy: "admin-1",
      moderatedAt: "2025-01-02T00:00:00Z",
    };
    const result = mapFirebaseToSanity("review-1", moderatedData, null);

    expect(result.adminResponse).toBe("Thank you for your review!");
    expect(result.adminResponseDate).toBe("2025-01-02T00:00:00Z");
    expect(result.moderatedBy).toBe("admin-1");
    expect(result.moderatedAt).toBe("2025-01-02T00:00:00Z");
  });

  it("should handle flagged reviews with reasons", () => {
    const flaggedData = {
      ...baseReviewData,
      status: "flagged",
      flagCount: 2,
      flagReasons: ["spam", "inappropriate"],
    };
    const result = mapFirebaseToSanity("review-1", flaggedData, null);

    expect(result.status).toBe("flagged");
    expect(result.flagCount).toBe(2);
    expect(result.flagReasons).toEqual(["spam", "inappropriate"]);
  });

  it("should set customerPhotoURL when provided", () => {
    const result = mapFirebaseToSanity("review-1", baseReviewData, null);
    expect(result.customerPhotoURL).toBe("https://example.com/photo.jpg");
  });

  it("should set customerPhotoURL to undefined when not provided", () => {
    const noPhotoData = { ...baseReviewData, userPhotoURL: undefined };
    const result = mapFirebaseToSanity("review-1", noPhotoData, null);
    expect(result.customerPhotoURL).toBeUndefined();
  });
});
