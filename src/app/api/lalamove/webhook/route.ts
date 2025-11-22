/**
 * Lalamove Webhook Handler
 * POST /api/lalamove/webhook
 * 
 * Receives real-time updates from Lalamove:
 * - Driver assigned
 * - Driver location updated
 * - Pickup complete
 * - Delivery complete
 * - Order status changed
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

interface LalamoveWebhookPayload {
  event: string;
  orderId: string;
  timestamp: string;
  data: any;
}

/**
 * Verify webhook signature for security
 * Ensures webhook actually came from Lalamove
 */
function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  
  return signature === expectedSignature;
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('X-Lalamove-Signature') || '';
    const secret = process.env.LALAMOVE_API_SECRET!;

    // Verify webhook authenticity (skip in sandbox/test mode)
    const isSandbox = process.env.LALAMOVE_HOST?.includes('sandbox');
    if (!isSandbox && signature && !verifyWebhookSignature(rawBody, signature, secret)) {
      console.error('[Webhook] Invalid signature');
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Log all webhook attempts for debugging
    console.log('[Webhook] ===== NEW WEBHOOK RECEIVED =====');
    console.log('[Webhook] Headers:', Object.fromEntries(request.headers.entries()));
    console.log('[Webhook] Body:', rawBody);
    console.log('[Webhook] Signature:', signature || 'NO SIGNATURE');
    console.log('[Webhook] Is Sandbox:', isSandbox);

    const payload: LalamoveWebhookPayload = JSON.parse(rawBody);
    
    console.log('[Webhook] Received event:', {
      event: payload.event,
      orderId: payload.orderId,
      timestamp: payload.timestamp,
    });

    // Handle different webhook events
    switch (payload.event) {
      case 'ORDER_STATUS_CHANGED':
        await handleOrderStatusChanged(payload);
        break;
      
      case 'DRIVER_ASSIGNED':
        await handleDriverAssigned(payload);
        break;
      
      case 'DRIVER_LOCATION_UPDATED':
        await handleDriverLocationUpdated(payload);
        break;
      
      case 'DRIVER_ARRIVED_AT_PICKUP':
        await handleDriverArrivedAtPickup(payload);
        break;
      
      case 'DRIVER_PICKED_UP':
        await handleDriverPickedUp(payload);
        break;
      
      case 'DRIVER_ARRIVED_AT_DROPOFF':
        await handleDriverArrivedAtDropoff(payload);
        break;
      
      case 'ORDER_COMPLETED':
        await handleOrderCompleted(payload);
        break;
      
      case 'ORDER_CANCELLED':
        await handleOrderCancelled(payload);
        break;
      
      default:
        console.log('[Webhook] Unknown event:', payload.event);
    }

    // Always return 200 OK to acknowledge receipt
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('[Webhook] Error:', error);
    
    // Still return 200 to prevent Lalamove from retrying
    return NextResponse.json({ success: true });
  }
}

/**
 * Event Handlers
 * Update database, send notifications, trigger actions
 */

async function handleOrderStatusChanged(payload: LalamoveWebhookPayload) {
  const { orderId, data } = payload;
  const newStatus = data.status;
  
  console.log(`[Webhook] Order ${orderId} status changed to ${newStatus}`);
  
  // TODO: Update order status in database
  // TODO: Send push notification to customer
  // TODO: Update admin dashboard in real-time
}

async function handleDriverAssigned(payload: LalamoveWebhookPayload) {
  const { orderId, data } = payload;
  const driverInfo = data.driver;
  
  console.log(`[Webhook] Driver assigned to order ${orderId}:`, {
    driverId: driverInfo.id,
    name: driverInfo.name,
    phone: driverInfo.phone,
    vehicle: driverInfo.plateNumber,
  });
  
  // TODO: Save driver details to database
  // TODO: Send SMS to customer with driver info
  // TODO: Show driver card on tracking page
}

async function handleDriverLocationUpdated(payload: LalamoveWebhookPayload) {
  const { orderId, data } = payload;
  const location = data.coordinates;
  
  console.log(`[Webhook] Driver location updated for order ${orderId}:`, location);
  
  // TODO: Update driver location in real-time map
  // TODO: Broadcast to WebSocket clients
  // TODO: Calculate ETA based on current location
}

async function handleDriverArrivedAtPickup(payload: LalamoveWebhookPayload) {
  const { orderId } = payload;
  
  console.log(`[Webhook] Driver arrived at pickup for order ${orderId}`);
  
  // TODO: Send notification to store staff
  // TODO: Update order status UI
  // TODO: Start pickup timer
}

async function handleDriverPickedUp(payload: LalamoveWebhookPayload) {
  const { orderId, data } = payload;
  
  console.log(`[Webhook] Package picked up for order ${orderId}`, {
    pickupTime: data.pickupTime,
    podImage: data.podImage,
  });
  
  // TODO: Update order status to "Out for delivery"
  // TODO: Send notification to customer
  // TODO: Update estimated delivery time
}

async function handleDriverArrivedAtDropoff(payload: LalamoveWebhookPayload) {
  const { orderId } = payload;
  
  console.log(`[Webhook] Driver arrived at dropoff for order ${orderId}`);
  
  // TODO: Send SMS to customer
  // TODO: Show "Driver is outside" notification
  // TODO: Prepare delivery confirmation flow
}

async function handleOrderCompleted(payload: LalamoveWebhookPayload) {
  const { orderId, data } = payload;
  
  console.log(`[Webhook] Order ${orderId} completed`, {
    completionTime: data.completionTime,
    podImage: data.podImage,
    signature: data.signature,
  });
  
  // TODO: Update order status to "Delivered"
  // TODO: Store POD (Proof of Delivery) image
  // TODO: Send delivery confirmation email
  // TODO: Request customer review
  // TODO: Mark seller payment as ready for disbursement
}

async function handleOrderCancelled(payload: LalamoveWebhookPayload) {
  const { orderId, data } = payload;
  
  console.log(`[Webhook] Order ${orderId} cancelled`, {
    reason: data.reason,
    cancelledBy: data.cancelledBy,
  });
  
  // TODO: Update order status to "Cancelled"
  // TODO: Process refund
  // TODO: Send cancellation email
  // TODO: Notify seller
  // TODO: Find alternative delivery method
}

/**
 * GET /api/lalamove/webhook
 * Test endpoint to verify webhook is accessible
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Lalamove webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
