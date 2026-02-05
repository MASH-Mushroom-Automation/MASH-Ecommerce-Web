/**
 * Contact Form API Route
 *
 * POST /api/contact
 *
 * Handles contact form submissions and sends notification emails.
 * - Sends confirmation email to the customer
 * - Sends notification email to MASH support team
 */

import { NextRequest, NextResponse } from "next/server";
import { sendRawEmail, isGmailConfigured, GMAIL_CONFIG } from "@/lib/email";
import { z } from "zod";

// Contact form validation schema
const ContactSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email address"),
  subject: z.enum([
    "order",
    "delivery",
    "product",
    "refund",
    "partnership",
    "other",
  ]),
  message: z
    .string()
    .min(10, "Please provide more details (min 10 characters)"),
});

type ContactFormData = z.infer<typeof ContactSchema>;

// Subject label mapping
const subjectLabels: Record<ContactFormData["subject"], string> = {
  order: "Order Inquiry",
  delivery: "Delivery Issue",
  product: "Product Question",
  refund: "Refund Request",
  partnership: "Partnership/Grower Inquiry",
  other: "Other",
};

// Generate customer confirmation email
function generateCustomerEmail(data: ContactFormData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>We received your message - MASH</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🍄 MASH</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Fresh Mushrooms, Farm to Table</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 24px;">We received your message!</h2>
              <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Hi ${data.name},<br><br>
                Thank you for reaching out to us. We've received your inquiry and our team will get back to you within 24 hours.
              </p>
              
              <!-- Message Summary -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 16px 0; color: #374151; font-size: 16px; font-weight: 600;">Your Message Summary</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 100px;">Subject:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${subjectLabels[data.subject]}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;">Message:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; line-height: 1.5;">${data.message.replace(/\n/g, "<br>")}</td>
                  </tr>
                </table>
              </div>
              
              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                If you have any urgent concerns, you can also reach us at:<br>
                📧 <a href="mailto:MASH.Mushroom.Automation@gmail.com" style="color: #16a34a; text-decoration: none;">MASH.Mushroom.Automation@gmail.com</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                Thank you for choosing MASH! 🍄
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} MASH - Mushroom Automation System for Harvest
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Generate support team notification email
function generateSupportEmail(data: ContactFormData): string {
  const timestamp = new Date().toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "full",
    timeStyle: "short",
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission - MASH</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">📬 New Contact Form Submission</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">${timestamp}</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <!-- Priority Badge -->
              <div style="margin-bottom: 24px;">
                <span style="display: inline-block; padding: 6px 12px; background-color: ${
                  data.subject === "refund"
                    ? "#fef2f2"
                    : data.subject === "order" || data.subject === "delivery"
                      ? "#fef9c3"
                      : "#f0fdf4"
                }; color: ${
                  data.subject === "refund"
                    ? "#dc2626"
                    : data.subject === "order" || data.subject === "delivery"
                      ? "#ca8a04"
                      : "#16a34a"
                }; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                  ${subjectLabels[data.subject]}
                </span>
              </div>
              
              <!-- Contact Details -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 16px 0; color: #374151; font-size: 16px; font-weight: 600;">Contact Information</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 80px;">Name:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${data.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">
                      <a href="mailto:${data.email}" style="color: #2563eb; text-decoration: none;">${data.email}</a>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Message -->
              <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;">
                <h3 style="margin: 0 0 16px 0; color: #374151; font-size: 16px; font-weight: 600;">Message</h3>
                <p style="margin: 0; color: #1f2937; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
              </div>
              
              <!-- Quick Reply Button -->
              <div style="margin-top: 24px; text-align: center;">
                <a href="mailto:${data.email}?subject=Re: ${subjectLabels[data.subject]} - MASH Support" style="display: inline-block; padding: 12px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                  Reply to ${data.name.split(" ")[0]}
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 16px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                This is an automated notification from MASH Contact Form
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const validationResult = ContactSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten();
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: errors.fieldErrors,
        },
        { status: 400 },
      );
    }

    const data = validationResult.data;

    // Check if email service is configured
    if (!isGmailConfigured()) {
      console.warn(
        "⚠️ Gmail SMTP not configured - contact form submission logged only",
      );

      // Log the submission for manual follow-up
      console.log("📬 Contact Form Submission (email not sent):", {
        name: data.name,
        email: data.email,
        subject: subjectLabels[data.subject],
        message: data.message,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: "Your message has been received. We'll get back to you soon!",
        note: "Email notifications are currently being set up.",
      });
    }

    // Send notification email to support team
    const supportEmailResult = await sendRawEmail({
      to: GMAIL_CONFIG.user || "MASH.Mushroom.Automation@gmail.com",
      subject: `[MASH Contact] ${subjectLabels[data.subject]} from ${data.name}`,
      html: generateSupportEmail(data),
    });

    if (!supportEmailResult.success) {
      console.error(
        "Failed to send support notification:",
        supportEmailResult.error,
      );
    }

    // Send confirmation email to customer
    const customerEmailResult = await sendRawEmail({
      to: data.email,
      subject: "We received your message - MASH",
      html: generateCustomerEmail(data),
    });

    if (!customerEmailResult.success) {
      console.error(
        "Failed to send customer confirmation:",
        customerEmailResult.error,
      );
    }

    // Log the submission
    console.log("✅ Contact form processed:", {
      name: data.name,
      email: data.email,
      subject: subjectLabels[data.subject],
      supportEmailSent: supportEmailResult.success,
      customerEmailSent: customerEmailResult.success,
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for your message! We'll respond within 24 hours.",
      emailSent: supportEmailResult.success && customerEmailResult.success,
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to process your request",
      },
      { status: 500 },
    );
  }
}

// Health check endpoint
export async function GET() {
  const configured = isGmailConfigured();

  return NextResponse.json({
    status: "ok",
    endpoint: "/api/contact",
    emailConfigured: configured,
    supportEmail: configured ? GMAIL_CONFIG.user : null,
  });
}
