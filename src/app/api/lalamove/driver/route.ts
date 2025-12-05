import { NextRequest, NextResponse } from 'next/server';
import { getLalamoveClient } from '@/lib/lalamove/client';

/**
 * GET /api/lalamove/driver
 * Get driver details for a specific order
 * 
 * Query params:
 * - orderId: string (required) - Lalamove order ID
 * 
 * Example:
 * GET /api/lalamove/driver?orderId=PH_LLPH2501230001
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    // Validate required fields
    if (!orderId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Missing required field: orderId' 
        },
        { status: 400 }
      );
    }

    // Get Lalamove client
    const lalamove = getLalamoveClient();

    // First get order details to retrieve driverId
    const orderDetails = await lalamove.getOrderDetails(orderId);
    
    if (!orderDetails.driverId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No driver assigned yet. Driver details will be available once a driver accepts the order.' 
        },
        { status: 404 }
      );
    }

    // Fetch driver details using orderId and driverId
    const driverDetails = await lalamove.getDriverDetails(orderId, orderDetails.driverId);

    return NextResponse.json({
      success: true,
      data: driverDetails,
    });

  } catch (error) {
    console.error('[Lalamove Driver API] Error:', error);

    // Type-safe error handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error ? error.stack : undefined;

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch driver details',
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500 }
    );
  }
}
