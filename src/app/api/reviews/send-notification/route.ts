/**
 * Review Email Notification API Route
 *
 * POST /api/reviews/send-notification
 *
 * Server-side endpoint for triggering review email notifications.
 * Accepts notification type and review data, delegates to review-notifications service.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  sendNewReviewNotification,
  sendReviewApprovedNotification,
  sendResponseNotification,
  sendFlaggedReviewAlert,
} from "@/lib/email/review-notifications";
import type { FirestoreReview } from "@/types/reviews";

type NotificationType =
  | "review_submitted"
  | "review_approved"
  | "review_response"
  | "review_flagged";

interface NotificationPayload {
  type: NotificationType;
  review: FirestoreReview;
  sellerEmail?: string;
  sellerName?: string;
  responderName?: string;
  responderRole?: "seller" | "admin";
  responseText?: string;
  flaggedBy?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: NotificationPayload = await request.json();
    const { type, review } = body;

    if (!type || !review) {
      return NextResponse.json(
        { error: "Missing required fields: type, review" },
        { status: 400 }
      );
    }

    // Fire-and-forget: send email without blocking the response
    switch (type) {
      case "review_submitted": {
        if (!body.sellerEmail || !body.sellerName) {
          return NextResponse.json(
            { error: "Missing sellerEmail or sellerName for review_submitted" },
            { status: 400 }
          );
        }
        sendNewReviewNotification(review, body.sellerEmail, body.sellerName).catch(
          (err) => console.error("[API] review_submitted email failed:", err)
        );
        break;
      }

      case "review_approved": {
        sendReviewApprovedNotification(review).catch((err) =>
          console.error("[API] review_approved email failed:", err)
        );
        break;
      }

      case "review_response": {
        if (!body.responderName || !body.responderRole || !body.responseText) {
          return NextResponse.json(
            { error: "Missing responderName, responderRole, or responseText for review_response" },
            { status: 400 }
          );
        }
        sendResponseNotification(
          review,
          body.responderName,
          body.responderRole,
          body.responseText
        ).catch((err) => console.error("[API] review_response email failed:", err));
        break;
      }

      case "review_flagged": {
        sendFlaggedReviewAlert(review, body.flaggedBy || "Unknown").catch((err) =>
          console.error("[API] review_flagged email failed:", err)
        );
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown notification type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, message: `${type} notification queued` });
  } catch (error) {
    console.error("[API] Review notification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
