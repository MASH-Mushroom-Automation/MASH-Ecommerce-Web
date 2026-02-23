/**
 * Tests for Review Moderation Service Functions
 *
 * Tests the admin moderation functions added to FirebaseReviewService:
 * moderateReview, addAdminResponse, getAllReviews, getReviewsByStatus,
 * deleteReviewAsAdmin, clearFlags, addSellerResponse, updateSellerResponse,
 * deleteSellerResponse
 */

import { FirebaseReviewService } from "../reviews";

// Access mocked Firebase functions
const {
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  addDoc,
  doc,
  collection,
  query,
  where,
  orderBy,
} = jest.requireMock("firebase/firestore");

// Fix Timestamp mock - make it a proper class so instanceof works
const { Timestamp: MockTimestamp } = jest.requireMock("firebase/firestore");

describe("FirebaseReviewService - Moderation Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockReviewData = {
    targetType: "product",
    targetId: "product-123",
    targetName: "Test Mushroom",
    userId: "user-1",
    userName: "Test User",
    userEmail: "test@example.com",
    rating: 4,
    title: "Great product",
    content: "Really enjoyed these mushrooms",
    images: [],
    verifiedPurchase: false,
    status: "pending",
    helpfulCount: 0,
    helpfulVotes: [],
    flagCount: 0,
    flaggedBy: [],
    flagReasons: [],
    createdAt: "2026-02-13T00:00:00.000Z",
    updatedAt: "2026-02-13T00:00:00.000Z",
  };

  describe("moderateReview", () => {
    it("should approve a review and write moderation log", async () => {
      const mockDocRef = { id: "review-1", path: "reviews/review-1" };
      doc.mockReturnValue(mockDocRef);
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockReviewData,
        id: "review-1",
      });
      updateDoc.mockResolvedValue(undefined);
      addDoc.mockResolvedValue({ id: "log-1" });
      collection.mockReturnValue("moderationLog-collection");

      await FirebaseReviewService.moderateReview("review-1", "admin-1", "approve");

      expect(getDoc).toHaveBeenCalledWith(mockDocRef);
      expect(updateDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          status: "approved",
          moderatedBy: "admin-1",
        }),
      );
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          action: "approve",
          adminId: "admin-1",
        }),
      );
    });

    it("should reject a review with reason", async () => {
      const mockDocRef = { id: "review-1", path: "reviews/review-1" };
      doc.mockReturnValue(mockDocRef);
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockReviewData,
        id: "review-1",
      });
      updateDoc.mockResolvedValue(undefined);
      addDoc.mockResolvedValue({ id: "log-1" });
      collection.mockReturnValue("moderationLog-collection");

      await FirebaseReviewService.moderateReview("review-1", "admin-1", "reject", "Spam content");

      expect(updateDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          status: "rejected",
          rejectionReason: "Spam content",
          moderatedBy: "admin-1",
        }),
      );
    });

    it("should throw if review not found", async () => {
      doc.mockReturnValue({ id: "review-999" });
      getDoc.mockResolvedValue({ exists: () => false });

      await expect(
        FirebaseReviewService.moderateReview("review-999", "admin-1", "approve"),
      ).rejects.toThrow("Review not found.");
    });
  });

  describe("addAdminResponse", () => {
    it("should add admin response to a review", async () => {
      const mockDocRef = { id: "review-1", path: "reviews/review-1" };
      doc.mockReturnValue(mockDocRef);
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockReviewData,
        id: "review-1",
      });
      updateDoc.mockResolvedValue(undefined);
      addDoc.mockResolvedValue({ id: "log-1" });
      collection.mockReturnValue("moderationLog-collection");

      await FirebaseReviewService.addAdminResponse(
        "review-1",
        "admin-1",
        "Thank you for your feedback! We appreciate it.",
      );

      expect(updateDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          adminResponse: "Thank you for your feedback! We appreciate it.",
        }),
      );
    });

    it("should throw if response is too short", async () => {
      await expect(
        FirebaseReviewService.addAdminResponse("review-1", "admin-1", "Thanks"),
      ).rejects.toThrow("Admin response must be at least 10 characters.");
    });

    it("should throw if review not found", async () => {
      doc.mockReturnValue({ id: "review-999" });
      getDoc.mockResolvedValue({ exists: () => false });

      await expect(
        FirebaseReviewService.addAdminResponse("review-999", "admin-1", "Long enough response here"),
      ).rejects.toThrow("Review not found.");
    });
  });

  describe("getAllReviews", () => {
    it("should fetch all reviews without filters", async () => {
      const mockDocs = [
        {
          id: "review-1",
          data: () => ({ ...mockReviewData, status: "approved" }),
        },
        {
          id: "review-2",
          data: () => ({ ...mockReviewData, status: "pending", rating: 3 }),
        },
      ];
      getDocs.mockResolvedValue({ docs: mockDocs, empty: false });

      const result = await FirebaseReviewService.getAllReviews();

      expect(result.reviews).toHaveLength(2);
      expect(result.stats.totalReviews).toBe(2);
    });

    it("should apply status filter", async () => {
      const mockDocs = [
        {
          id: "review-1",
          data: () => ({ ...mockReviewData, status: "approved" }),
        },
        {
          id: "review-2",
          data: () => ({ ...mockReviewData, status: "pending" }),
        },
      ];
      getDocs.mockResolvedValue({ docs: mockDocs, empty: false });

      const result = await FirebaseReviewService.getAllReviews({ status: "pending" });

      expect(result.reviews).toHaveLength(1);
      expect(result.reviews[0].status).toBe("pending");
    });

    it("should apply keyword filter", async () => {
      const mockDocs = [
        {
          id: "review-1",
          data: () => ({ ...mockReviewData, content: "Amazing mushrooms, loved them" }),
        },
        {
          id: "review-2",
          data: () => ({ ...mockReviewData, content: "Average quality" }),
        },
      ];
      getDocs.mockResolvedValue({ docs: mockDocs, empty: false });

      const result = await FirebaseReviewService.getAllReviews({ keyword: "amazing" });

      expect(result.reviews).toHaveLength(1);
    });
  });

  describe("getReviewsByStatus", () => {
    it("should fetch reviews filtered by status", async () => {
      const mockDocs = [
        {
          id: "review-1",
          data: () => ({ ...mockReviewData, status: "pending" }),
        },
      ];
      getDocs.mockResolvedValue({ docs: mockDocs, empty: false });

      const reviews = await FirebaseReviewService.getReviewsByStatus("pending");

      expect(reviews).toHaveLength(1);
      expect(where).toHaveBeenCalledWith("status", "==", "pending");
    });
  });

  describe("deleteReviewAsAdmin", () => {
    it("should delete a review and write audit log", async () => {
      const mockDocRef = { id: "review-1", path: "reviews/review-1" };
      doc.mockReturnValue(mockDocRef);
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockReviewData,
        id: "review-1",
      });
      deleteDoc.mockResolvedValue(undefined);
      addDoc.mockResolvedValue({ id: "log-1" });
      collection.mockReturnValue("moderationLog-collection");

      await FirebaseReviewService.deleteReviewAsAdmin("review-1", "admin-1", "Violates policy");

      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          action: "delete",
          adminId: "admin-1",
          reason: "Violates policy",
        }),
      );
      expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
    });

    it("should throw if review not found", async () => {
      doc.mockReturnValue({ id: "review-999" });
      getDoc.mockResolvedValue({ exists: () => false });

      await expect(
        FirebaseReviewService.deleteReviewAsAdmin("review-999", "admin-1"),
      ).rejects.toThrow("Review not found.");
    });
  });

  describe("clearFlags", () => {
    it("should reset all flags on a review", async () => {
      const mockDocRef = { id: "review-1", path: "reviews/review-1" };
      doc.mockReturnValue(mockDocRef);
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ ...mockReviewData, flagCount: 3, flaggedBy: ["u1", "u2", "u3"] }),
        id: "review-1",
      });
      updateDoc.mockResolvedValue(undefined);
      addDoc.mockResolvedValue({ id: "log-1" });
      collection.mockReturnValue("moderationLog-collection");

      await FirebaseReviewService.clearFlags("review-1", "admin-1");

      expect(updateDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          flagCount: 0,
          flaggedBy: [],
          flagReasons: [],
          moderatedBy: "admin-1",
        }),
      );
    });
  });

  describe("addSellerResponse", () => {
    it("should add seller response to a review", async () => {
      const mockDocRef = { id: "review-1", path: "reviews/review-1" };
      doc.mockReturnValue(mockDocRef);
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockReviewData,
        id: "review-1",
      });
      updateDoc.mockResolvedValue(undefined);

      await FirebaseReviewService.addSellerResponse(
        "review-1",
        "seller-1",
        "Seller Name",
        "Thank you for your valuable feedback!",
      );

      expect(updateDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          sellerResponse: "Thank you for your valuable feedback!",
          sellerRespondedBy: "seller-1",
        }),
      );
    });

    it("should throw if response is too short", async () => {
      await expect(
        FirebaseReviewService.addSellerResponse("review-1", "seller-1", "Seller", "Thanks"),
      ).rejects.toThrow("Seller response must be at least 10 characters.");
    });
  });

  describe("updateSellerResponse", () => {
    it("should update seller response within 24 hours", async () => {
      const mockDocRef = { id: "review-1", path: "reviews/review-1" };
      doc.mockReturnValue(mockDocRef);
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          ...mockReviewData,
          sellerRespondedBy: "seller-1",
          sellerResponseDate: new Date().toISOString(),
        }),
        id: "review-1",
      });
      updateDoc.mockResolvedValue(undefined);

      await FirebaseReviewService.updateSellerResponse(
        "review-1",
        "seller-1",
        "Updated response with more detail",
      );

      expect(updateDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          sellerResponse: "Updated response with more detail",
        }),
      );
    });

    it("should throw if editing another seller's response", async () => {
      const mockDocRef = { id: "review-1", path: "reviews/review-1" };
      doc.mockReturnValue(mockDocRef);
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          ...mockReviewData,
          sellerRespondedBy: "other-seller",
          sellerResponseDate: new Date().toISOString(),
        }),
        id: "review-1",
      });

      await expect(
        FirebaseReviewService.updateSellerResponse("review-1", "seller-1", "Trying to edit"),
      ).rejects.toThrow("You can only edit your own response.");
    });

    it("should throw if 24-hour edit window passed", async () => {
      const mockDocRef = { id: "review-1", path: "reviews/review-1" };
      doc.mockReturnValue(mockDocRef);
      const oldDate = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          ...mockReviewData,
          sellerRespondedBy: "seller-1",
          sellerResponseDate: oldDate,
        }),
        id: "review-1",
      });

      await expect(
        FirebaseReviewService.updateSellerResponse("review-1", "seller-1", "Trying to edit late"),
      ).rejects.toThrow("Response can only be edited within 24 hours of posting.");
    });
  });

  describe("deleteSellerResponse", () => {
    it("should delete own seller response", async () => {
      const mockDocRef = { id: "review-1", path: "reviews/review-1" };
      doc.mockReturnValue(mockDocRef);
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          ...mockReviewData,
          sellerRespondedBy: "seller-1",
          sellerResponse: "Old response",
        }),
        id: "review-1",
      });
      updateDoc.mockResolvedValue(undefined);

      await FirebaseReviewService.deleteSellerResponse("review-1", "seller-1");

      expect(updateDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          sellerResponse: null,
          sellerResponseDate: null,
          sellerRespondedBy: null,
        }),
      );
    });

    it("should throw if deleting another seller's response", async () => {
      const mockDocRef = { id: "review-1", path: "reviews/review-1" };
      doc.mockReturnValue(mockDocRef);
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          ...mockReviewData,
          sellerRespondedBy: "other-seller",
        }),
        id: "review-1",
      });

      await expect(
        FirebaseReviewService.deleteSellerResponse("review-1", "seller-1"),
      ).rejects.toThrow("You can only delete your own response.");
    });
  });
});
