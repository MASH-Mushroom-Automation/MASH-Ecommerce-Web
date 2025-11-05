import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Mock payment info data
const MOCK_PAYMENT_INFO = {
  taxId: "123-456-789-000",
  bankName: "BDO Unibank",
  bankAccountName: "Fungi Fresh Farms Inc.",
  bankAccountNumber: "1234567890",
  paymentSchedule: "15th and 30th of each month",
  isVerified: false,
  updatedAt: new Date().toISOString()
};

// GET payment information
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value || cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required"
          }
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: MOCK_PAYMENT_INFO,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error) {
    console.error("Error fetching payment info:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch payment information"
        }
      },
      { status: 500 }
    );
  }
}

// PUT update payment information
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value || cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required"
          }
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.taxId || !body.bankName || !body.bankAccountName || !body.bankAccountNumber) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Missing required payment information fields",
            details: {
              required: ["taxId", "bankName", "bankAccountName", "bankAccountNumber"]
            }
          }
        },
        { status: 400 }
      );
    }

    // In production, update backend
    const updatedPaymentInfo = {
      ...MOCK_PAYMENT_INFO,
      taxId: body.taxId,
      bankName: body.bankName,
      bankAccountName: body.bankAccountName,
      bankAccountNumber: body.bankAccountNumber,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: updatedPaymentInfo,
      message: "Payment information updated successfully",
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error) {
    console.error("Error updating payment info:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPDATE_FAILED",
          message: "Failed to update payment information"
        }
      },
      { status: 500 }
    );
  }
}
