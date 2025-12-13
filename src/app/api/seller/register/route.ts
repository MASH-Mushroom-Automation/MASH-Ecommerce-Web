/**
 * API Route: Seller Registration
 * 
 * Handles seller registration submissions
 * POST /api/seller/register
 */

import { NextRequest, NextResponse } from "next/server";
import { SellerRegistrationFormData } from "@/lib/validations/seller-registration";

export async function POST(request: NextRequest) {
  try {
    const body: SellerRegistrationFormData = await request.json();

    // TODO: Implement actual backend integration
    // For now, return mock success response

    // Validate required fields
    if (!body.businessName || !body.email || !body.phoneNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock successful registration
    const applicationId = `APP-${Date.now()}`;

    return NextResponse.json(
      {
        success: true,
        data: {
          applicationId,
          message:
            "Your seller application has been submitted successfully. We will review your application and contact you within 2-3 business days.",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Seller registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while processing your application",
      },
      { status: 500 }
    );
  }
}
