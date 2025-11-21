/**
 * Lalamove Order API Route
 * POST /api/lalamove/order
 * 
 * Place delivery order after customer confirms checkout
 * Automatically books Lalamove driver
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLalamoveClient, LalamoveOrderRequest } from '@/lib/lalamove/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const {
      quotationId,
      senderStopId,
      senderName,
      senderPhone,
      recipientStopId,
      recipientName,
      recipientPhone,
      orderNumber,
      remarks,
    } = body;
    
    if (!quotationId || !senderStopId || !recipientStopId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Build order request
    const orderRequest: LalamoveOrderRequest = {
      quotationId,
      sender: {
        stopId: senderStopId,
        name: senderName || 'MASH E-Commerce',
        phone: senderPhone || '+639661692000', // Melrhin Bayan
      },
      recipients: [
        {
          stopId: recipientStopId,
          name: recipientName || 'Customer',
          phone: recipientPhone,
          remarks: remarks || `Order #${orderNumber}\nFresh Mushrooms\nKeep refrigerated\nHandle with care`,
        },
      ],
      isPODEnabled: true, // Enable Proof of Delivery photo
      partner: 'MASH-Ecommerce',
      metadata: {
        orderId: orderNumber || 'N/A',
        orderDate: new Date().toISOString(),
        storeBranch: 'Novaliches Main',
        itemType: 'Fresh Mushrooms',
      },
    };

    // Place order with Lalamove
    const lalamove = getLalamoveClient();
    const order = await lalamove.placeOrder(orderRequest);

    console.log('[API] Order placed:', {
      orderId: order.orderId,
      status: order.status,
      driverId: order.driverId || 'Not assigned yet',
      shareLink: order.shareLink,
    });

    // TODO: Save order details to database
    // TODO: Send confirmation email to customer
    // TODO: Notify admin/seller

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.orderId,
        status: order.status,
        driverId: order.driverId,
        shareLink: order.shareLink,
        priceBreakdown: order.priceBreakdown,
      },
      message: 'Delivery order placed successfully',
    });

  } catch (error: any) {
    console.error('[API] Place order error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to place delivery order',
        error: process.env.NODE_ENV === 'development' ? error.toString() : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/lalamove/order?orderId=xxx
 * Get order details and tracking status
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'orderId required' },
        { status: 400 }
      );
    }

    const lalamove = getLalamoveClient();
    const order = await lalamove.getOrderDetails(orderId);

    return NextResponse.json({
      success: true,
      data: order,
    });

  } catch (error: any) {
    console.error('[API] Get order error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to get order details',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/lalamove/order?orderId=xxx
 * Cancel delivery order
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'orderId required' },
        { status: 400 }
      );
    }

    const lalamove = getLalamoveClient();
    await lalamove.cancelOrder(orderId);

    console.log('[API] Order cancelled:', orderId);

    // TODO: Update database order status
    // TODO: Send cancellation email to customer
    // TODO: Process refund if payment was made

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
    });

  } catch (error: any) {
    console.error('[API] Cancel order error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to cancel order',
      },
      { status: 500 }
    );
  }
}
