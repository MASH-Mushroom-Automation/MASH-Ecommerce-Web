/**
 * Add Priority Fee to Lalamove Order
 * POST /api/lalamove/priority
 * 
 * Adds express delivery fee for faster driver assignment
 * Must be called BEFORE driver accepts the order
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLalamoveClient } from '@/lib/lalamove/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, priorityFee } = body;

    // Validation
    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Priority fee validation (₱50-₱100)
    const fee = priorityFee || '50'; // Default ₱50
    const feeNum = parseFloat(fee);
    
    if (isNaN(feeNum) || feeNum < 50 || feeNum > 100) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Priority fee must be between ₱50-₱100' 
        },
        { status: 400 }
      );
    }

    console.log(`[Lalamove Priority] Adding ₱${fee} priority fee to order ${orderId}`);

    const client = getLalamoveClient();
    const updatedOrder = await client.addPriorityFee(orderId, fee);

    console.log('[Lalamove Priority] Priority fee added successfully:', {
      orderId: updatedOrder.orderId,
      newTotal: updatedOrder.priceBreakdown.total,
      priorityFee: updatedOrder.priceBreakdown.priorityFee,
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId: updatedOrder.orderId,
        status: updatedOrder.status,
        priceBreakdown: updatedOrder.priceBreakdown,
        message: `Priority delivery added (+₱${fee})`,
      },
    });

  } catch (error: any) {
    console.error('[Lalamove Priority] Error:', error);

    // Handle specific error cases
    if (error.message?.includes('Order already has a driver')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cannot add priority fee - driver already assigned' 
        },
        { status: 400 }
      );
    }

    if (error.message?.includes('Order not found')) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to add priority fee' 
      },
      { status: 500 }
    );
  }
}

/**
 * Get priority fee options
 * GET /api/lalamove/priority
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      priorityFeeOptions: [
        {
          value: '50',
          label: 'Express (+₱50)',
          description: '15-20% faster driver assignment',
          estimatedTime: '2-5 minutes',
        },
        {
          value: '75',
          label: 'Priority (+₱75)',
          description: '30% faster driver assignment',
          estimatedTime: '1-3 minutes',
        },
        {
          value: '100',
          label: 'VIP (+₱100)',
          description: 'Fastest driver assignment',
          estimatedTime: '1-2 minutes',
        },
      ],
      defaultFee: '50',
      minFee: 50,
      maxFee: 100,
      currency: 'PHP',
      note: 'Priority fee must be added before driver accepts order',
    },
  });
}
