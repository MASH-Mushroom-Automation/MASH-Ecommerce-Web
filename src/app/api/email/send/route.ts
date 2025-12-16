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
  try {
    const { isEmailConfigured, verifyConnection, GMAIL_CONFIG } = await import("@/lib/email");

    // Optionally verify SMTP connection
    let connectionVerified = false;
    let verificationError: string | undefined;
    
    if (isEmailConfigured()) {
      try {
        connectionVerified = await verifyConnection();
      } catch (err) {
        verificationError = err instanceof Error ? err.message : "Unknown verification error";
      }
    }

    return NextResponse.json({
      configured: isEmailConfigured(),
      service: "Gmail SMTP",
      host: GMAIL_CONFIG.host,
      port: GMAIL_CONFIG.port,
      connectionVerified,
      verificationError,
      message: isEmailConfigured()
        ? connectionVerified
          ? "Gmail SMTP is configured and connection verified"
          : `Gmail SMTP is configured but connection not verified${verificationError ? `: ${verificationError}` : ""}`
        : "Gmail SMTP not configured. Set EMAIL_USER and EMAIL_PASSWORD in environment variables.",
    });
  } catch (error) {
    console.error("Email health check error:", error);
    return NextResponse.json({
      configured: false,
      service: "Gmail SMTP",
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Error checking email configuration",
    });
  }
}
