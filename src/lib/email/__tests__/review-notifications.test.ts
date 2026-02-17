/**
 * Review Email Notification Service Tests
 *
 * Tests the fire-and-forget email trigger functions.
 * Mocks the gmail-smtp sendRawEmail and isGmailConfigured helpers.
 * Mocks @react-email/components render function.
 */

// Mock gmail-smtp module
jest.mock("@/lib/email/gmail-smtp", () => ({
  isGmailConfigured: jest.fn(),
  sendRawEmail: jest.fn().mockResolvedValue(undefined),
}));

// Mock @react-email/components render
jest.mock("@react-email/components", () => ({
  render: jest.fn().mockResolvedValue("<html>mocked email</html>"),
  Button: (props: Record<string, unknown>) => props,
  Section: (props: Record<string, unknown>) => props,
  Text: (props: Record<string, unknown>) => props,
  Img: (props: Record<string, unknown>) => props,
  Link: (props: Record<string, unknown>) => props,
  Html: (props: Record<string, unknown>) => props,
  Head: (props: Record<string, unknown>) => props,
  Body: (props: Record<string, unknown>) => props,
  Container: (props: Record<string, unknown>) => props,
  Preview: (props: Record<string, unknown>) => props,
  Heading: (props: Record<string, unknown>) => props,
  Hr: () => null,
}));

// Mock email templates
jest.mock("@/lib/email/templates/review-submitted", () => ({
  ReviewSubmittedEmail: jest.fn(() => "ReviewSubmittedEmail"),
}));
jest.mock("@/lib/email/templates/review-approved", () => ({
  ReviewApprovedEmail: jest.fn(() => "ReviewApprovedEmail"),
}));
jest.mock("@/lib/email/templates/review-response", () => ({
  ReviewResponseEmail: jest.fn(() => "ReviewResponseEmail"),
}));
jest.mock("@/lib/email/templates/review-flagged", () => ({
  ReviewFlaggedEmail: jest.fn(() => "ReviewFlaggedEmail"),
}));

import {
  sendNewReviewNotification,
  sendReviewApprovedNotification,
  sendResponseNotification,
  sendFlaggedReviewAlert,
} from "../review-notifications";
import type { FirestoreReview } from "@/types/reviews";

const { isGmailConfigured, sendRawEmail } = jest.requireMock(
  "@/lib/email/gmail-smtp",
);

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
    content: "Really loved this mushroom kit! The quality was excellent and shipping was fast.",
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

describe("Review Email Notification Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isGmailConfigured.mockReturnValue(true);
  });

  describe("sendNewReviewNotification", () => {
    it("sends email to seller on new review", async () => {
      await sendNewReviewNotification(
        makeReview(),
        "seller@mash.ph",
        "Seller Joe",
      );

      expect(sendRawEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "seller@mash.ph",
          subject: expect.stringContaining("New 4-Star Review"),
        }),
      );
    });

    it("includes product name in subject", async () => {
      await sendNewReviewNotification(
        makeReview({ targetName: "Lion's Mane Kit" }),
        "seller@mash.ph",
        "Seller Joe",
      );

      expect(sendRawEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining("Lion's Mane Kit"),
        }),
      );
    });

    it("skips when Gmail not configured", async () => {
      isGmailConfigured.mockReturnValue(false);

      await sendNewReviewNotification(
        makeReview(),
        "seller@mash.ph",
        "Seller",
      );

      expect(sendRawEmail).not.toHaveBeenCalled();
    });

    it("handles sendRawEmail errors gracefully", async () => {
      sendRawEmail.mockRejectedValueOnce(new Error("SMTP failure"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      await sendNewReviewNotification(
        makeReview(),
        "seller@mash.ph",
        "Seller",
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[ReviewEmail]"),
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });
  });

  describe("sendReviewApprovedNotification", () => {
    it("sends email to reviewer", async () => {
      await sendReviewApprovedNotification(makeReview());

      expect(sendRawEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "john@example.com",
          subject: expect.stringContaining("Approved"),
        }),
      );
    });

    it("includes product name in subject", async () => {
      await sendReviewApprovedNotification(
        makeReview({ targetName: "Oyster Mushroom Kit" }),
      );

      expect(sendRawEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining("Oyster Mushroom Kit"),
        }),
      );
    });

    it("skips when Gmail not configured", async () => {
      isGmailConfigured.mockReturnValue(false);

      await sendReviewApprovedNotification(makeReview());

      expect(sendRawEmail).not.toHaveBeenCalled();
    });
  });

  describe("sendResponseNotification", () => {
    it("sends seller response notification to reviewer", async () => {
      await sendResponseNotification(
        makeReview(),
        "Seller Joe",
        "seller",
        "Thank you for your feedback!",
      );

      expect(sendRawEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "john@example.com",
          subject: expect.stringContaining("Seller Joe"),
        }),
      );
    });

    it("sends admin response notification to reviewer", async () => {
      await sendResponseNotification(
        makeReview(),
        "Admin",
        "admin",
        "We appreciate your review.",
      );

      expect(sendRawEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "john@example.com",
          subject: expect.stringContaining("Admin"),
        }),
      );
    });

    it("skips when Gmail not configured", async () => {
      isGmailConfigured.mockReturnValue(false);

      await sendResponseNotification(
        makeReview(),
        "Seller",
        "seller",
        "Thanks!",
      );

      expect(sendRawEmail).not.toHaveBeenCalled();
    });
  });

  describe("sendFlaggedReviewAlert", () => {
    it("sends flag alert to admin email", async () => {
      // Set ADMIN_EMAIL via env
      const origAdmin = process.env.ADMIN_EMAIL;
      process.env.ADMIN_EMAIL = "admin@mash.ph";

      await sendFlaggedReviewAlert(
        makeReview({
          flagReasons: ["spam"],
          flagCount: 1,
        }),
        "reporter-user",
      );

      expect(sendRawEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining("FLAGGED"),
        }),
      );

      process.env.ADMIN_EMAIL = origAdmin;
    });

    it("skips when Gmail not configured", async () => {
      isGmailConfigured.mockReturnValue(false);

      await sendFlaggedReviewAlert(makeReview(), "reporter");

      expect(sendRawEmail).not.toHaveBeenCalled();
    });

    it("handles errors gracefully", async () => {
      process.env.ADMIN_EMAIL = "admin@mash.ph";
      sendRawEmail.mockRejectedValueOnce(new Error("Failed"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      await sendFlaggedReviewAlert(makeReview(), "reporter");

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[ReviewEmail]"),
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });
  });
});
