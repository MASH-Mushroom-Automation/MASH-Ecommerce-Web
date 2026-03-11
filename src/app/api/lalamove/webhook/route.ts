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
 * 
 * Phase 6: Enhanced with Firestore integration
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { FirebaseOrdersService } from '@/lib/firebase/orders';
import { collection, query, where, getDocs, getFirestore } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase/config';

interface LalamoveWebhookPayload {
  event: string;
  orderId: string;
  timestamp: string;
  data: any;
}

/** Maximum webhook body size: 1 MB */
const MAX_BODY_SIZE = 1024 * 1024;

/**
 * Verify webhook signature for security (timing-safe)
 * Uses crypto.timingSafeEqual to prevent timing attacks.
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

  // Both buffers must be the same length for timingSafeEqual
  const sigBuffer = Buffer.from(signature, 'utf8');
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

  if (sigBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();

    // Body size check (1 MB limit)
    if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_SIZE) {
      console.error('[Webhook] Request body exceeds 1 MB limit');
      return NextResponse.json(
        { success: false, message: 'Request body too large' },
        { status: 413 }
      );
    }

    const signature = request.headers.get('X-Lalamove-Signature') || '';
    const secret = process.env.LALAMOVE_API_SECRET!;

    // Verify webhook authenticity in ALL environments (sandbox + production)
    if (!signature) {
      console.error('[Webhook] Missing signature header');
      return NextResponse.json(
        { success: false, message: 'Missing signature' },
        { status: 401 }
      );
    }
    if (!verifyWebhookSignature(rawBody, signature, secret)) {
      console.error('[Webhook] Invalid signature');
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse JSON body safely
    let payload: LalamoveWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      console.error('[Webhook] Malformed JSON body');
      return NextResponse.json(
        { success: false, message: 'Malformed JSON body' },
        { status: 400 }
      );
    }

    const isSandbox = process.env.LALAMOVE_HOST?.includes('sandbox');

    // Log all webhook attempts for debugging
    console.log('[Webhook] ===== NEW WEBHOOK RECEIVED =====');
    console.log('[Webhook] Event:', payload.event);
    console.log('[Webhook] OrderId:', payload.orderId);
    console.log('[Webhook] Is Sandbox:', isSandbox);

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
 * Find Firestore order by Lalamove order ID
 */
async function findOrderByLalamoveId(lalamoveOrderId: string): Promise<string | null> {
  try {
    const db = getFirestore(firebaseApp);
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('lalamoveOrderId', '==', lalamoveOrderId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn(`[Webhook] No order found for Lalamove ID: ${lalamoveOrderId}`);
      return null;
    }

    return querySnapshot.docs[0].id;
  } catch (error) {
    console.error('[Webhook] Error finding order:', error);
    return null;
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
  
  const firestoreOrderId = await findOrderByLalamoveId(orderId);
  if (!firestoreOrderId) return;

  // Update Lalamove tracking status
  await FirebaseOrdersService.updateLalamoveTracking(firestoreOrderId, {
    status: newStatus,
    lastUpdated: new Date(),
  });
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
  
  const firestoreOrderId = await findOrderByLalamoveId(orderId);
  if (!firestoreOrderId) return;

  // Update with driver information
  await FirebaseOrdersService.updateLalamoveTracking(firestoreOrderId, {
    status: 'DRIVER_ASSIGNED',
    driver: {
      id: driverInfo.id,
      name: driverInfo.name,
      phone: driverInfo.phone,
      plateNumber: driverInfo.plateNumber,
      photo: driverInfo.photo,
    },
    lastUpdated: new Date(),
  });
}

async function handleDriverLocationUpdated(payload: LalamoveWebhookPayload) {
  const { orderId, data } = payload;
  const location = data.coordinates;
  
  console.log(`[Webhook] Driver location updated for order ${orderId}:`, location);
  
  const firestoreOrderId = await findOrderByLalamoveId(orderId);
  if (!firestoreOrderId) return;

  // Update driver coordinates
  await FirebaseOrdersService.updateLalamoveTracking(firestoreOrderId, {
    driver: {
      id: data.driver?.id || '',
      name: data.driver?.name || '',
      phone: data.driver?.phone || '',
      plateNumber: data.driver?.plateNumber || '',
      coordinates: {
        lat: location.lat,
        lng: location.lng,
        updatedAt: new Date(),
      },
    },
    lastUpdated: new Date(),
  });
}

async function handleDriverArrivedAtPickup(payload: LalamoveWebhookPayload) {
  const { orderId } = payload;
  
  console.log(`[Webhook] Driver arrived at pickup for order ${orderId}`);
  
  const firestoreOrderId = await findOrderByLalamoveId(orderId);
  if (!firestoreOrderId) return;

  await FirebaseOrdersService.updateLalamoveTracking(firestoreOrderId, {
    status: 'ARRIVED_AT_PICKUP',
    lastUpdated: new Date(),
  });
}

async function handleDriverPickedUp(payload: LalamoveWebhookPayload) {
  const { orderId, data } = payload;
  
  console.log(`[Webhook] Package picked up for order ${orderId}`, {
    pickupTime: data.pickupTime,
    podImage: data.podImage,
  });
  
  const firestoreOrderId = await findOrderByLalamoveId(orderId);
  if (!firestoreOrderId) return;

  // Update Lalamove status
  await FirebaseOrdersService.updateLalamoveTracking(firestoreOrderId, {
    status: 'PICKED_UP',
    lastUpdated: new Date(),
  });

  // Update order status to "shipped"
  await FirebaseOrdersService.updateOrderStatus(
    firestoreOrderId,
    'shipped',
    'lalamove-webhook',
    'Package picked up by driver'
  );
}

async function handleDriverArrivedAtDropoff(payload: LalamoveWebhookPayload) {
  const { orderId } = payload;
  
  console.log(`[Webhook] Driver arrived at dropoff for order ${orderId}`);
  
  const firestoreOrderId = await findOrderByLalamoveId(orderId);
  if (!firestoreOrderId) return;

  await FirebaseOrdersService.updateLalamoveTracking(firestoreOrderId, {
    status: 'ARRIVED_AT_DROPOFF',
    lastUpdated: new Date(),
  });
}

async function handleOrderCompleted(payload: LalamoveWebhookPayload) {
  const { orderId, data } = payload;
  
  console.log(`[Webhook] Order ${orderId} completed`, {
    completionTime: data.completionTime,
    podImage: data.podImage,
    signature: data.signature,
  });
  
  const firestoreOrderId = await findOrderByLalamoveId(orderId);
  if (!firestoreOrderId) return;

  // Update Lalamove status
  await FirebaseOrdersService.updateLalamoveTracking(firestoreOrderId, {
    status: 'COMPLETED',
    lastUpdated: new Date(),
  });

  // Update order status to "delivered"
  await FirebaseOrdersService.updateOrderStatus(
    firestoreOrderId,
    'delivered',
    'lalamove-webhook',
    'Successfully delivered to customer'
  );
}

async function handleOrderCancelled(payload: LalamoveWebhookPayload) {
  const { orderId, data } = payload;
  
  console.log(`[Webhook] Order ${orderId} cancelled`, {
    reason: data.reason,
    cancelledBy: data.cancelledBy,
  });
  
  const firestoreOrderId = await findOrderByLalamoveId(orderId);
  if (!firestoreOrderId) return;

  // Update Lalamove status
  await FirebaseOrdersService.updateLalamoveTracking(firestoreOrderId, {
    status: 'CANCELLED',
    lastUpdated: new Date(),
  });

  // Note: Don't auto-cancel the order - let seller decide
  // They may want to arrange alternative delivery
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
