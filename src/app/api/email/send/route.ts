/**
 * Email Send API Route
 *
 * POST /api/email/send
 *
 * Sends order notification emails.
 * Used internally by checkout and admin dashboard.
 */

import { NextRequest, NextResponse } from "next/server";
import { sendEmail, type SendEmailPayload } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, type, data } = body as SendEmailPayload;

    // Validate required fields
    if (!to || !type || !data) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: to, type, data",
        },
        { status: 400 }
      );
    }

    // Validate email type
    const validTypes = [
      "order_confirmation",
      "order_approved",
      "order_rejected",
      "order_shipped",
      "order_delivered",
      "driver_assigned",
      "welcome",
    ];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid email type. Must be one of: ${validTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate required data fields
    if (!data.customerName || !data.orderNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required data fields: customerName, orderNumber",
        },
        { status: 400 }
      );
    }

    // Send email
    const result = await sendEmail({ to, type, data });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      message: `Email sent successfully to ${to}`,
    });
  } catch (error) {
    console.error("Email API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Health check for email service
export async function GET() {
  const { isEmailConfigured } = await import("@/lib/email");

  return NextResponse.json({
    configured: isEmailConfigured(),
    service: "Resend",
    message: isEmailConfigured()
      ? "Email service is configured and ready"
      : "Email service not configured. Set RESEND_API_KEY in environment variables.",
  });
}
