/**
 * SellerResponseModal Component Tests
 *
 * Tests the seller response modal for adding, editing, and deleting
 * responses to customer reviews. Covers character validation,
 * 24h edit window enforcement, and confirmation dialogs.
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SellerResponseModal } from "../SellerResponseModal";
import type { FirestoreReview } from "@/types/reviews";

// Mock AuthContext - uses global mock from jest.setupMocks.js
const mockUseAuth = global.__mockUseAuth as jest.Mock;

// Mock FirebaseReviewService
jest.mock("@/lib/firebase/reviews", () => ({
  FirebaseReviewService: {
    addSellerResponse: jest.fn().mockResolvedValue(undefined),
    updateSellerResponse: jest.fn().mockResolvedValue(undefined),
    deleteSellerResponse: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock sonner
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const { FirebaseReviewService } = jest.requireMock("@/lib/firebase/reviews");
const { toast } = jest.requireMock("sonner");

function makeReview(overrides: Partial<FirestoreReview> = {}): FirestoreReview {
  return {
    id: "review-1",
    targetType: "product",
    targetId: "product-abc",
    targetName: "Test Mushroom Kit",
    userId: "user-123",
    userName: "Jane Customer",
    userEmail: "jane@example.com",
    rating: 4,
    title: "Great product",
    content: "Really loved this mushroom kit!",
    images: [],
    verifiedPurchase: false,
    status: "approved",
    helpfulCount: 0,
    helpfulVotes: [],
    flagCount: 0,
    flaggedBy: [],
    flagReasons: [],
    createdAt: "2026-02-13T10:00:00.000Z",
    updatedAt: "2026-02-13T10:00:00.000Z",
    ...overrides,
  };
}

const mockUser = {
  uid: "seller-1",
  displayName: "Seller Joe",
  email: "seller@mash.ph",
};

describe("SellerResponseModal", () => {
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
    });
  });

  function renderModal(review: FirestoreReview = makeReview()) {
    return render(
      <SellerResponseModal open={true} onClose={onClose} review={review} />,
    );
  }

  describe("rendering", () => {
    it("renders modal with review details", () => {
      renderModal();
      expect(screen.getByText("Review Details")).toBeInTheDocument();
      expect(screen.getByText("Jane Customer")).toBeInTheDocument();
      expect(screen.getByText("Really loved this mushroom kit!")).toBeInTheDocument();
    });

    it("shows review target name and date", () => {
      renderModal();
      expect(screen.getByText("Test Mushroom Kit")).toBeInTheDocument();
    });

    it("shows verified badge for verified purchases", () => {
      renderModal(makeReview({ verifiedPurchase: true }));
      expect(screen.getByText("Verified")).toBeInTheDocument();
    });

    it("shows review images when present", () => {
      renderModal(
        makeReview({
          images: ["https://example.com/img1.jpg"],
        }),
      );
      const img = screen.getByAltText("Review image 1");
      expect(img).toBeInTheDocument();
    });
  });

  describe("new response", () => {
    it("shows response editor when no existing response", () => {
      renderModal();
      expect(screen.getByText("Write a Response")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/write your response/i),
      ).toBeInTheDocument();
    });

    it("shows character count", () => {
      renderModal();
      expect(screen.getByText(/0\/500 characters/)).toBeInTheDocument();
    });

    it("shows remaining needed when under 10 characters", async () => {
      const user = userEvent.setup();
      renderModal();
      const textarea = screen.getByPlaceholderText(/write your response/i);
      await user.type(textarea, "Hello");
      expect(screen.getByText(/5 more needed/)).toBeInTheDocument();
    });

    it("disables Submit Response when under 10 chars", () => {
      renderModal();
      expect(
        screen.getByRole("button", { name: /submit response/i }),
      ).toBeDisabled();
    });

    it("calls addSellerResponse on submit", async () => {
      const user = userEvent.setup();
      renderModal();

      const textarea = screen.getByPlaceholderText(/write your response/i);
      await user.type(textarea, "Thank you for your detailed review of our product!");

      await user.click(
        screen.getByRole("button", { name: /submit response/i }),
      );

      await waitFor(() => {
        expect(FirebaseReviewService.addSellerResponse).toHaveBeenCalledWith(
          "review-1",
          "seller-1",
          "Seller Joe",
          "Thank you for your detailed review of our product!",
        );
      });
    });

    it("shows success toast on submission", async () => {
      const user = userEvent.setup();
      renderModal();

      const textarea = screen.getByPlaceholderText(/write your response/i);
      await user.type(textarea, "Thank you for your detailed review of our product!");

      await user.click(
        screen.getByRole("button", { name: /submit response/i }),
      );

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Response added successfully");
      });
    });
  });

  describe("existing response", () => {
    const reviewWithResponse = makeReview({
      sellerResponse: "Thank you for your great review!",
      sellerResponseDate: new Date().toISOString(), // within 24h window
    });

    it("shows existing response text", () => {
      renderModal(reviewWithResponse);
      expect(
        screen.getByText("Thank you for your great review!"),
      ).toBeInTheDocument();
      expect(screen.getByText("Your Response")).toBeInTheDocument();
    });

    it("shows Edit button when within 24h window", () => {
      renderModal(reviewWithResponse);
      expect(
        screen.getByRole("button", { name: /edit/i }),
      ).toBeInTheDocument();
    });

    it("shows Delete button for existing responses", () => {
      renderModal(reviewWithResponse);
      expect(
        screen.getByRole("button", { name: /^delete$/i }),
      ).toBeInTheDocument();
    });

    it("hides Edit button when past 24h window", () => {
      const oldDate = new Date();
      oldDate.setHours(oldDate.getHours() - 25);
      const expiredReview = makeReview({
        sellerResponse: "Old response",
        sellerResponseDate: oldDate.toISOString(),
      });
      renderModal(expiredReview);
      expect(screen.queryByRole("button", { name: /^edit$/i })).not.toBeInTheDocument();
      expect(screen.getByText(/edit window has expired/i)).toBeInTheDocument();
    });

    it("calls updateSellerResponse when editing", async () => {
      const user = userEvent.setup();
      renderModal(reviewWithResponse);

      // Click Edit to switch to editing mode
      await user.click(screen.getByRole("button", { name: /edit/i }));

      // Clear and type new text
      const textarea = screen.getByPlaceholderText(/write your response/i);
      await user.clear(textarea);
      await user.type(textarea, "Updated response text for the review.");

      await user.click(
        screen.getByRole("button", { name: /update response/i }),
      );

      await waitFor(() => {
        expect(FirebaseReviewService.updateSellerResponse).toHaveBeenCalledWith(
          "review-1",
          "seller-1",
          "Updated response text for the review.",
        );
      });
    });

    it("shows confirm delete dialog", async () => {
      const user = userEvent.setup();
      renderModal(reviewWithResponse);

      await user.click(screen.getByRole("button", { name: /^delete$/i }));

      expect(
        screen.getByRole("button", { name: /confirm delete/i }),
      ).toBeInTheDocument();
    });

    it("calls deleteSellerResponse on confirm delete", async () => {
      const user = userEvent.setup();
      renderModal(reviewWithResponse);

      await user.click(screen.getByRole("button", { name: /^delete$/i }));
      await user.click(screen.getByRole("button", { name: /confirm delete/i }));

      await waitFor(() => {
        expect(FirebaseReviewService.deleteSellerResponse).toHaveBeenCalledWith(
          "review-1",
          "seller-1",
        );
      });
    });
  });

  describe("error handling", () => {
    it("shows error toast on submission failure", async () => {
      FirebaseReviewService.addSellerResponse.mockRejectedValueOnce(
        new Error("Network error"),
      );

      const user = userEvent.setup();
      renderModal();

      const textarea = screen.getByPlaceholderText(/write your response/i);
      await user.type(textarea, "Thank you for your detailed review of our product!");

      await user.click(
        screen.getByRole("button", { name: /submit response/i }),
      );

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Network error");
      });
    });
  });
});
