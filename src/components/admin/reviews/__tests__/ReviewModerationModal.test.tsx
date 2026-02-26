/**
 * ReviewModerationModal Component Tests
 *
 * Tests the admin moderation modal with approve, reject, respond, and delete actions.
 * Covers rendering for different review statuses, action handlers, form validation,
 * and confirmation dialogs.
 */

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewModerationModal } from "../ReviewModerationModal";
import type { FirestoreReview, ModerationAction } from "@/types/reviews";

function makeReview(overrides: Partial<FirestoreReview> = {}): FirestoreReview {
  return {
    id: "review-1",
    targetType: "product",
    targetId: "product-abc",
    targetName: "Test Mushroom Kit",
    userId: "user-123",
    userName: "John Doe",
    userEmail: "john@example.com",
    rating: 4,
    title: "Great product",
    content: "Really loved this mushroom kit!",
    images: [],
    verifiedPurchase: false,
    status: "pending",
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

const defaultHandlers = {
  onModerate: jest.fn().mockResolvedValue(undefined),
  onAddAdminResponse: jest.fn().mockResolvedValue(undefined),
  onDelete: jest.fn().mockResolvedValue(undefined),
  onClearFlags: jest.fn().mockResolvedValue(undefined),
};

function renderModal(
  review: FirestoreReview = makeReview(),
  handlers = defaultHandlers,
) {
  const onClose = jest.fn();
  const result = render(
    <ReviewModerationModal
      open={true}
      onClose={onClose}
      review={review}
      {...handlers}
    />,
  );
  return { ...result, onClose };
}

describe("ReviewModerationModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders modal with review details", () => {
      renderModal();
      expect(screen.getByText("Review Moderation")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Really loved this mushroom kit!")).toBeInTheDocument();
    });

    it("displays pending status badge", () => {
      renderModal(makeReview({ status: "pending" }));
      const badges = screen.getAllByText("Pending");
      expect(badges.length).toBeGreaterThanOrEqual(1);
    });

    it("displays approved status badge", () => {
      renderModal(makeReview({ status: "approved" }));
      const badges = screen.getAllByText("Approved");
      expect(badges.length).toBeGreaterThanOrEqual(1);
    });

    it("displays flagged status badge", () => {
      renderModal(makeReview({ status: "flagged" }));
      const badges = screen.getAllByText("Flagged");
      expect(badges.length).toBeGreaterThanOrEqual(1);
    });

    it("displays rejected status badge", () => {
      renderModal(makeReview({ status: "rejected" }));
      const badges = screen.getAllByText("Rejected");
      expect(badges.length).toBeGreaterThanOrEqual(1);
    });

    it("shows review title when present", () => {
      renderModal(makeReview({ title: "Amazing Quality" }));
      expect(screen.getByText("Amazing Quality")).toBeInTheDocument();
    });

    it("shows target info", () => {
      renderModal();
      expect(screen.getByText("Test Mushroom Kit")).toBeInTheDocument();
      expect(screen.getByText("Product")).toBeInTheDocument();
    });

    it("shows grower badge for grower reviews", () => {
      renderModal(makeReview({ targetType: "grower" }));
      expect(screen.getByText("Grower")).toBeInTheDocument();
    });

    it("shows helpful count when > 0", () => {
      renderModal(makeReview({ helpfulCount: 5 }));
      expect(screen.getByText("5 helpful")).toBeInTheDocument();
    });

    it("shows flag count", () => {
      renderModal(makeReview({ flagCount: 3 }));
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("shows review images when present", () => {
      renderModal(
        makeReview({
          images: ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
        }),
      );
      expect(screen.getByText("2 images")).toBeInTheDocument();
    });

    it("shows flag reasons when flagged", () => {
      renderModal(
        makeReview({
          flagCount: 2,
          flagReasons: ["spam", "inappropriate"],
        }),
      );
      expect(screen.getByText("spam")).toBeInTheDocument();
      expect(screen.getByText("inappropriate")).toBeInTheDocument();
    });
  });

  describe("action buttons", () => {
    it("shows Approve button for pending reviews", () => {
      renderModal(makeReview({ status: "pending" }));
      expect(screen.getByRole("button", { name: /approve/i })).toBeInTheDocument();
    });

    it("hides Approve button for already-approved reviews", () => {
      renderModal(makeReview({ status: "approved" }));
      expect(screen.queryByRole("button", { name: /^approve$/i })).not.toBeInTheDocument();
    });

    it("shows Reject button for non-rejected reviews", () => {
      renderModal(makeReview({ status: "pending" }));
      expect(screen.getByRole("button", { name: /reject/i })).toBeInTheDocument();
    });

    it("hides Reject button for already-rejected reviews", () => {
      renderModal(makeReview({ status: "rejected" }));
      expect(screen.queryByRole("button", { name: /^reject$/i })).not.toBeInTheDocument();
    });

    it("shows Add Response button", () => {
      renderModal(makeReview());
      expect(
        screen.getByRole("button", { name: /add response/i }),
      ).toBeInTheDocument();
    });

    it("shows Edit Response when admin response exists", () => {
      renderModal(makeReview({ adminResponse: "Thanks for your feedback!" }));
      expect(
        screen.getByRole("button", { name: /edit response/i }),
      ).toBeInTheDocument();
    });

    it("shows Delete button", () => {
      renderModal(makeReview());
      expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
    });
  });

  describe("approve action", () => {
    it("calls onModerate with approve when Approve clicked", async () => {
      const user = userEvent.setup();
      const handlers = {
        ...defaultHandlers,
        onModerate: jest.fn().mockResolvedValue(undefined),
      };
      renderModal(makeReview({ status: "pending" }), handlers);

      await user.click(screen.getByRole("button", { name: /approve/i }));

      await waitFor(() => {
        expect(handlers.onModerate).toHaveBeenCalledWith("review-1", "approve", undefined);
      });
    });
  });

  describe("admin response", () => {
    it("shows response form when Add Response clicked", async () => {
      const user = userEvent.setup();
      renderModal();

      await user.click(screen.getByRole("button", { name: /add response/i }));

      expect(screen.getByText("Admin Response")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/write an admin response/i),
      ).toBeInTheDocument();
    });

    it("disables Save Response when text is under 10 characters", async () => {
      const user = userEvent.setup();
      renderModal();

      await user.click(screen.getByRole("button", { name: /add response/i }));

      const textarea = screen.getByPlaceholderText(/write an admin response/i);
      await user.type(textarea, "Short");

      expect(screen.getByRole("button", { name: /save response/i })).toBeDisabled();
    });

    it("calls onAddAdminResponse with valid text", async () => {
      const user = userEvent.setup();
      const handlers = {
        ...defaultHandlers,
        onAddAdminResponse: jest.fn().mockResolvedValue(undefined),
      };
      renderModal(makeReview(), handlers);

      await user.click(screen.getByRole("button", { name: /add response/i }));

      const textarea = screen.getByPlaceholderText(/write an admin response/i);
      fireEvent.change(textarea, { target: { value: "Thank you for your detailed review of our product." } });

      await user.click(screen.getByRole("button", { name: /save response/i }));

      await waitFor(() => {
        expect(handlers.onAddAdminResponse).toHaveBeenCalledWith(
          "review-1",
          "Thank you for your detailed review of our product.",
        );
      });
    });

    it("shows existing admin response", () => {
      renderModal(
        makeReview({
          adminResponse: "We appreciate your feedback!",
          adminResponseDate: "2026-02-13T12:00:00Z",
        }),
      );
      expect(screen.getByText("We appreciate your feedback!")).toBeInTheDocument();
    });
  });

  describe("delete action", () => {
    it("shows delete confirmation dialog", async () => {
      const user = userEvent.setup();
      renderModal();

      // Click the delete button (before dialog opens, only one exists)
      await user.click(screen.getByRole("button", { name: /delete/i }));

      // After dialog opens, "Delete Review" appears in both button + dialog title
      const deleteTexts = screen.getAllByText("Delete Review");
      expect(deleteTexts.length).toBeGreaterThanOrEqual(2);
      expect(
        screen.getByText(/are you sure you want to permanently delete/i),
      ).toBeInTheDocument();
    });

    it("calls onDelete when confirmed", async () => {
      const user = userEvent.setup();
      const handlers = {
        ...defaultHandlers,
        onDelete: jest.fn().mockResolvedValue(undefined),
      };
      renderModal(makeReview(), handlers);

      // Click the Delete button in the modal footer to open confirmation
      await user.click(screen.getByRole("button", { name: /^delete$/i }));

      // Wait for the confirmation dialog to appear
      await waitFor(() => {
        expect(
          screen.getByText(/are you sure you want to permanently delete/i),
        ).toBeInTheDocument();
      });

      // Click the "Delete Review" confirmation button using fireEvent
      // (AlertDialogAction from Radix can intercept userEvent clicks)
      const confirmBtn = screen.getByRole("button", { name: /delete review/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(handlers.onDelete).toHaveBeenCalledWith("review-1", "Admin deleted review");
      });
    });
  });

  describe("clear flags", () => {
    it("shows Clear All Flags button for flagged reviews", () => {
      renderModal(
        makeReview({
          flagCount: 2,
          flagReasons: ["spam"],
        }),
      );
      expect(
        screen.getByRole("button", { name: /clear all flags/i }),
      ).toBeInTheDocument();
    });

    it("calls onClearFlags when clicked", async () => {
      const user = userEvent.setup();
      const handlers = {
        ...defaultHandlers,
        onClearFlags: jest.fn().mockResolvedValue(undefined),
      };
      renderModal(
        makeReview({ flagCount: 2, flagReasons: ["spam"] }),
        handlers,
      );

      await user.click(screen.getByRole("button", { name: /clear all flags/i }));

      await waitFor(() => {
        expect(handlers.onClearFlags).toHaveBeenCalledWith("review-1");
      });
    });
  });

  describe("existing responses display", () => {
    it("shows seller response when present", () => {
      renderModal(
        makeReview({
          sellerResponse: "Thank you for your kind review!",
          sellerResponseDate: "2026-02-13T11:00:00Z",
        }),
      );
      expect(screen.getByText("Thank you for your kind review!")).toBeInTheDocument();
      expect(screen.getByText("Seller Response")).toBeInTheDocument();
    });

    it("shows moderatedBy info when present", () => {
      renderModal(
        makeReview({
          moderatedBy: "admin@example.com",
        }),
      );
      expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    });
  });
});
