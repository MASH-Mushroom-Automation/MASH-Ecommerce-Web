/**
 * Seller Registration API Endpoint
 * 
 * POST /api/seller/register
 * 
 * Handles seller registration submissions and forwards to backend
 */

import { NextRequest, NextResponse } from "next/server";
import { sellerRegistrationSchema, type SellerRegistrationFormData } from "@/lib/validations/seller-registration";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate with Zod schema
    const validationResult = sellerRegistrationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const data: SellerRegistrationFormData = validationResult.data;

    // TODO: Forward to backend API
    // const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    // const response = await fetch(`${API_URL}/api/v1/seller/register`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     // Add auth token if needed
    //   },
    //   body: JSON.stringify(data),
    // });

    // if (!response.ok) {
    //   const error = await response.json();
    //   throw new Error(error.message || "Registration failed");
    // }

    // const result = await response.json();

    // For now, return mock success response
    return NextResponse.json({
      success: true,
      data: {
        applicationId: `APP-${Date.now()}`,
        message: "Your seller application has been submitted successfully. We'll review it within 2-3 business days.",
        status: "pending",
        estimatedReviewTime: "2-3 business days",
      },
    });
  } catch (error) {
    console.error("Seller registration error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
