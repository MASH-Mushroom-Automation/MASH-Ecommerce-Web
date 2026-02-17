/**
 * Review Email Notification Service
 *
 * Fire-and-forget email triggers for review lifecycle events.
 * Uses Gmail SMTP via existing sendRawEmail helper.
 */

import { render } from "@react-email/components";
import { isGmailConfigured, sendRawEmail } from "./gmail-smtp";
import { ReviewSubmittedEmail } from "./templates/review-submitted";
import { ReviewApprovedEmail } from "./templates/review-approved";
import { ReviewResponseEmail } from "./templates/review-response";
import { ReviewFlaggedEmail } from "./templates/review-flagged";
import type { FirestoreReview } from "@/types/reviews";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.mashmarket.app";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || "";

/**
 * Send notification to seller when a new review is submitted on their product.
 */
export async function sendNewReviewNotification(
  review: FirestoreReview,
  sellerEmail: string,
  sellerName: string
): Promise<void> {
  if (!isGmailConfigured()) {
    console.warn("[ReviewEmail] Gmail not configured, skipping new review notification");
    return;
  }

  try {
    const html = await render(
      ReviewSubmittedEmail({
        sellerName,
        reviewerName: review.userName,
        productName: review.targetName,
        rating: review.rating,
        reviewExcerpt: review.content.slice(0, 200),
        reviewUrl: `${BASE_URL}/product/${review.targetId}#reviews`,
        dashboardUrl: `${BASE_URL}/seller/my-reviews`,
      })
    );

    await sendRawEmail({
      to: sellerEmail,
      subject: `New ${review.rating}-Star Review on ${review.targetName}`,
      html,
    });

    console.log(`[ReviewEmail] New review notification sent to ${sellerEmail}`);
  } catch (error) {
    console.error("[ReviewEmail] Failed to send new review notification:", error);
  }
}

/**
 * Send notification to reviewer when their review is approved.
 */
export async function sendReviewApprovedNotification(
  review: FirestoreReview
): Promise<void> {
  if (!isGmailConfigured()) {
    console.warn("[ReviewEmail] Gmail not configured, skipping approved notification");
    return;
  }

  try {
    const html = await render(
      ReviewApprovedEmail({
        reviewerName: review.userName,
        productName: review.targetName,
        rating: review.rating,
        reviewExcerpt: review.content.slice(0, 200),
        productUrl: `${BASE_URL}/product/${review.targetId}#reviews`,
      })
    );

    await sendRawEmail({
      to: review.userEmail,
      subject: `Your Review for ${review.targetName} Has Been Approved`,
      html,
    });

    console.log(`[ReviewEmail] Approved notification sent to ${review.userEmail}`);
  } catch (error) {
    console.error("[ReviewEmail] Failed to send approved notification:", error);
  }
}

/**
 * Send notification to reviewer when a seller or admin responds to their review.
 */
export async function sendResponseNotification(
  review: FirestoreReview,
  responderName: string,
  responderRole: "seller" | "admin",
  responseText: string
): Promise<void> {
  if (!isGmailConfigured()) {
    console.warn("[ReviewEmail] Gmail not configured, skipping response notification");
    return;
  }

  try {
    const html = await render(
      ReviewResponseEmail({
        reviewerName: review.userName,
        productName: review.targetName,
        responderName,
        responderRole,
        responseText,
        rating: review.rating,
        reviewExcerpt: review.content.slice(0, 200),
        productUrl: `${BASE_URL}/product/${review.targetId}#reviews`,
      })
    );

    await sendRawEmail({
      to: review.userEmail,
      subject: `${responderName} Responded to Your Review of ${review.targetName}`,
      html,
    });

    console.log(`[ReviewEmail] Response notification sent to ${review.userEmail}`);
  } catch (error) {
    console.error("[ReviewEmail] Failed to send response notification:", error);
  }
}

/**
 * Send alert to admin when a review is flagged.
 */
export async function sendFlaggedReviewAlert(
  review: FirestoreReview,
  flaggedBy: string
): Promise<void> {
  if (!isGmailConfigured() || !ADMIN_EMAIL) {
    console.warn("[ReviewEmail] Gmail or admin email not configured, skipping flag alert");
    return;
  }

  try {
    const html = await render(
      ReviewFlaggedEmail({
        adminName: "Admin",
        reviewerName: review.userName,
        productName: review.targetName,
        rating: review.rating,
        reviewExcerpt: review.content.slice(0, 200),
        flagReasons: review.flagReasons.length > 0 ? review.flagReasons : ["Flagged by user"],
        flaggedBy,
        dashboardUrl: `${BASE_URL}/seller/reviews`,
      })
    );

    await sendRawEmail({
      to: ADMIN_EMAIL,
      subject: `[FLAGGED] Review on ${review.targetName} Needs Moderation`,
      html,
    });

    console.log(`[ReviewEmail] Flag alert sent to ${ADMIN_EMAIL}`);
  } catch (error) {
    console.error("[ReviewEmail] Failed to send flag alert:", error);
  }
}
