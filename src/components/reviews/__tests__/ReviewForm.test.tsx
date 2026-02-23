/**
 * ReviewForm Component Unit Tests
 *
 * Tests the review submission/editing form:
 * - Sign-in prompt for unauthenticated users
 * - Already reviewed state
 * - Form validation (Zod schema)
 * - Rating validation
 * - Submit new review flow
 * - Edit existing review flow
 * - Loading states
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewForm } from "../ReviewForm";
import type { CreateReviewInput, UpdateReviewInput, FirestoreReview } from "@/types/reviews";

// Mock AuthContext - uses global mock from jest.setupMocks.js
const mockUseAuth = global.__mockUseAuth as jest.Mock;

function makeReview(overrides: Partial<FirestoreReview> = {}): FirestoreReview {
  return {
    id: "review-1",
    targetType: "product",
    targetId: "product-abc",
    targetName: "Test Mushroom Kit",
    userId: "user-123",
    userName: "Test User",
    userEmail: "test@example.com",
    rating: 4,
    title: "Great product",
    content: "Really loved this mushroom kit, excellent quality!",
    images: [],
    verifiedPurchase: false,
    status: "approved",
    helpfulCount: 0,
    helpfulVotes: [],
    flagCount: 0,
    flaggedBy: [],
    flagReasons: [],
    createdAt: "2026-02-11T10:00:00.000Z",
    updatedAt: "2026-02-11T10:00:00.000Z",
    ...overrides,
  };
}

const defaultProps = {
  targetType: "product" as const,
  targetId: "product-abc",
  targetName: "Test Mushroom Kit",
  onSubmit: jest.fn(),
  onUpdate: jest.fn(),
  hasUserReviewed: false,
  existingReview: null,
};

describe("ReviewForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===== Unauthenticated State =====

  describe("when user is not authenticated", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    });

    it("shows sign-in prompt", () => {
      render(<ReviewForm {...defaultProps} />);
      expect(screen.getByText("Sign in to leave a review")).toBeInTheDocument();
    });

    it("shows sign-in button that links to login page", () => {
      render(<ReviewForm {...defaultProps} />);
      const signInLink = screen.getByRole("link", { name: /sign in/i });
      expect(signInLink).toHaveAttribute("href", "/login");
    });

    it("does not show the review form fields", () => {
      render(<ReviewForm {...defaultProps} />);
      expect(screen.queryByLabelText("Review Title")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Your Review")).not.toBeInTheDocument();
    });
  });

  // ===== Authenticated State - New Review =====

  describe("when user is authenticated and has not reviewed", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: "user-123",
          displayName: "Test User",
          email: "test@example.com",
          photoURL: null,
        },
        isAuthenticated: true,
        loading: false,
      });
    });

    it("shows the write review form", () => {
      render(<ReviewForm {...defaultProps} />);
      expect(screen.getByText("Write a Review")).toBeInTheDocument();
    });

    it("renders all form fields", () => {
      render(<ReviewForm {...defaultProps} />);
      expect(screen.getByText("Your Rating")).toBeInTheDocument();
      expect(screen.getByLabelText("Review Title")).toBeInTheDocument();
      expect(screen.getByLabelText("Your Review")).toBeInTheDocument();
    });

    it("renders submit button", () => {
      render(<ReviewForm {...defaultProps} />);
      expect(screen.getByRole("button", { name: /submit review/i })).toBeInTheDocument();
    });

    it("shows rating error when submitting without rating", async () => {
      render(<ReviewForm {...defaultProps} />);

      const titleInput = screen.getByLabelText("Review Title");
      const contentInput = screen.getByLabelText("Your Review");

      await userEvent.type(titleInput, "Test Title");
      await userEvent.type(contentInput, "This is a test review content long enough");

      const submitButton = screen.getByRole("button", { name: /submit review/i });
      await userEvent.click(submitButton);

      expect(screen.getByText("Please select a rating.")).toBeInTheDocument();
    });

    it("shows validation error for short title", async () => {
      render(<ReviewForm {...defaultProps} />);

      const titleInput = screen.getByLabelText("Review Title");
      const contentInput = screen.getByLabelText("Your Review");

      await userEvent.type(titleInput, "ab");
      await userEvent.type(contentInput, "This is a test review content");

      const submitButton = screen.getByRole("button", { name: /submit review/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Title must be at least 3 characters")).toBeInTheDocument();
      });
    });

    it("shows validation error for short content", async () => {
      render(<ReviewForm {...defaultProps} />);

      const titleInput = screen.getByLabelText("Review Title");
      const contentInput = screen.getByLabelText("Your Review");

      await userEvent.type(titleInput, "Good Title");
      await userEvent.type(contentInput, "Short");

      const submitButton = screen.getByRole("button", { name: /submit review/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Review must be at least 10 characters")).toBeInTheDocument();
      });
    });
  });

  // ===== Already Reviewed State =====

  describe("when user has already reviewed", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: "user-123",
          displayName: "Test User",
          email: "test@example.com",
        },
        isAuthenticated: true,
        loading: false,
      });
    });

    it("shows edit prompt instead of form", () => {
      render(
        <ReviewForm
          {...defaultProps}
          hasUserReviewed={true}
          existingReview={makeReview()}
        />,
      );

      expect(
        screen.getByText(/you have already reviewed this product/i),
      ).toBeInTheDocument();
    });

    it("shows edit button", () => {
      render(
        <ReviewForm
          {...defaultProps}
          hasUserReviewed={true}
          existingReview={makeReview()}
        />,
      );

      expect(screen.getByRole("button", { name: /edit review/i })).toBeInTheDocument();
    });

    it("switches to edit mode when edit button clicked", async () => {
      render(
        <ReviewForm
          {...defaultProps}
          hasUserReviewed={true}
          existingReview={makeReview()}
        />,
      );

      await userEvent.click(screen.getByRole("button", { name: /edit review/i }));

      expect(screen.getByText("Edit Your Review")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /update review/i })).toBeInTheDocument();
    });

    it("shows close button in edit mode", async () => {
      render(
        <ReviewForm
          {...defaultProps}
          hasUserReviewed={true}
          existingReview={makeReview()}
        />,
      );

      await userEvent.click(screen.getByRole("button", { name: /edit review/i }));

      // There should be a close/cancel button (X icon)
      const buttons = screen.getAllByRole("button");
      const closeButton = buttons.find((b) =>
        b.querySelector("svg") && !b.textContent?.includes("Update"),
      );
      expect(closeButton).toBeDefined();
    });
  });

  // ===== Form Submission =====

  describe("form submission", () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const onUpdate = jest.fn().mockResolvedValue(undefined);

    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: "user-123",
          displayName: "Test User",
          email: "test@example.com",
          photoURL: "https://example.com/photo.jpg",
        },
        isAuthenticated: true,
        loading: false,
      });
      onSubmit.mockClear();
      onUpdate.mockClear();
    });

    it("calls onSubmit with correct data for new review", async () => {
      render(<ReviewForm {...defaultProps} onSubmit={onSubmit} />);

      // Select rating - click the 4th star
      const starButtons = screen.getAllByLabelText(/rate \d out of 5 stars/i);
      await userEvent.click(starButtons[3]); // 4th star

      const titleInput = screen.getByLabelText("Review Title");
      const contentInput = screen.getByLabelText("Your Review");

      await userEvent.type(titleInput, "Great product!");
      await userEvent.type(contentInput, "This mushroom kit is absolutely fantastic.");

      const submitButton = screen.getByRole("button", { name: /submit review/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          targetType: "product",
          targetId: "product-abc",
          targetName: "Test Mushroom Kit",
          rating: 4,
          title: "Great product!",
          content: "This mushroom kit is absolutely fantastic.",
        });
      });
    });
  });

  // ===== Grower Reviews =====

  describe("grower reviews", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: "user-123",
          displayName: "Test User",
          email: "test@example.com",
        },
        isAuthenticated: true,
        loading: false,
      });
    });

    it("shows grower label in already-reviewed state", () => {
      render(
        <ReviewForm
          {...defaultProps}
          targetType="grower"
          targetId="grower-xyz"
          targetName="Farm ABC"
          hasUserReviewed={true}
          existingReview={makeReview({ targetType: "grower" })}
        />,
      );

      expect(
        screen.getByText(/you have already reviewed this grower/i),
      ).toBeInTheDocument();
    });
  });
});
