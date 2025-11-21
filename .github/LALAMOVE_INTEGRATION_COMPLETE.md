# 🚚 MASH - Lalamove Same-Day Delivery Integration

**Last Updated**: November 22, 2025  
**Status**: 🔴 NOT STARTED - Ready for Implementation  
**Goal**: Complete same-day delivery system with Lalamove API integration  
**Timeline**: 16-20 hours (spread across 8 phases)

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Lalamove API Capabilities](#lalamove-api-capabilities)
3. [Current Setup](#current-setup)
4. [Test Delivery Details](#test-delivery-details)
5. [Implementation Phases](#implementation-phases)
6. [Postman Collection Guide](#postman-collection-guide)
7. [Production Testing Checklist](#production-testing-checklist)
8. [Monitoring & Troubleshooting](#monitoring--troubleshooting)

---

## Project Overview

### What We're Building

A **complete same-day delivery system** integrated with Lalamove API for fresh mushroom orders:

**Customer Flow**:
```
1. Browse Products → 2. Add to Cart → 3. Checkout
   ↓
4. Select "Same-Day Delivery" → 5. Enter Address → 6. Get Quotation (₱150-₱300)
   ↓
7. Confirm Order → 8. Payment → 9. Order Placed
   ↓
10. Lalamove Driver Assigned → 11. Pickup → 12. Real-Time Tracking → 13. Delivered!
```

**Admin/Seller Flow**:
```
1. Receive Order → 2. Prepare Package → 3. Book Lalamove Driver
   ↓
4. Track Driver → 5. Confirm Pickup → 6. Monitor Delivery
   ↓
7. Delivery Complete → 8. Update Order Status → 9. Customer Notified
```

### Key Features

✅ **Quotation System** - Real-time pricing before order confirmation  
✅ **Order Placement** - Automatic driver booking on order completion  
✅ **Driver Details** - Live driver info (name, phone, vehicle, location)  
✅ **Real-Time Tracking** - GPS tracking on order status page  
✅ **Webhooks** - Automatic updates (driver assigned, pickup, delivery)  
✅ **Order Management** - View, cancel, and modify deliveries  
✅ **Chat System** - Customer ↔ Driver communication (Phase 8)  
✅ **Priority Delivery** - Express option for urgent orders  
✅ **Multi-Stop** - Support for multiple pickup/drop-off locations  

---

## Lalamove API Capabilities

### Available Endpoints (Sandbox + Production)

| # | Endpoint | Method | Purpose | Phase | Status |
|---|----------|--------|---------|-------|--------|
| 1 | `/v3/quotations` | POST | Get delivery price quote | 1 | 🔴 Not Started |
| 2 | `/v3/orders` | POST | Place delivery order | 2 | 🔴 Not Started |
| 3 | `/v3/orders/{orderId}` | GET | Get order details | 3 | 🔴 Not Started |
| 4 | `/v3/orders/{orderId}/drivers` | GET | Get driver details | 4 | 🔴 Not Started |
| 5 | `/v3/orders/{orderId}` | PATCH | Update order | 5 | 🔴 Not Started |
| 6 | `/v3/orders/{orderId}` | DELETE | Cancel order | 5 | 🔴 Not Started |
| 7 | `/v3/webhooks` | POST | Setup webhooks | 6 | 🔴 Not Started |
| 8 | `/v3/orders/{orderId}/priority` | PATCH | Set priority delivery | 7 | 🔴 Not Started |
| 9 | `/v3/cities` | GET | Get available cities | 1 | 🔴 Not Started |
| 10 | `/v3/vehicle-types` | GET | Get vehicle types | 1 | 🔴 Not Started |

### Webhook Events

Lalamove sends real-time updates via webhooks:

- `ORDER_STATUS_CHANGED` - Order status updated (assigning → assigning_driver → on_going → completed)
- `DRIVER_ASSIGNED` - Driver accepted the order
- `DRIVER_LOCATION_UPDATED` - GPS location changed
- `DRIVER_ARRIVED_AT_PICKUP` - Driver at your store
- `DRIVER_PICKED_UP` - Package picked up
- `DRIVER_ARRIVED_AT_DROPOFF` - Driver at customer location
- `ORDER_COMPLETED` - Delivery successful
- `ORDER_CANCELLED` - Order cancelled by driver/customer

---

## Current Setup

### Existing Infrastructure

✅ **Environment Variables** (`.env.local` and `studio/.env.local`):
```env
LALAMOVE_API_KEY="pk_test_8611e4fa8a2f51f6664d26aded0e5d2b"
LALAMOVE_API_SECRET="sk_test_KeCmtaJPeTEUwiP1N+upaT/2IH1Ckqqmd23db8+hVJnaysSpQVkRdbzIm2LlDztq"
LALAMOVE_HOST="https://rest.sandbox.lalamove.com"
LALAMOVE_MARKET="PH"
```

✅ **Product Schema** (Sanity CMS) - Already includes:
- `sameDayDeliveryEligible` (boolean)
- `deliveryZones` (array of cities)
- `perishable` (boolean for special handling)
- `packageWeight` (kg for pricing calculation)
- `packageDimensions` (L x W x H in cm)

✅ **Order Schema** (Sanity CMS) - Includes:
- `shippingMethod` with "lalamove" option
- `deliveryStatus` tracking
- `trackingNumber` field

### What's Missing (To Be Built)

❌ **Backend API Routes** - `/api/lalamove/*` endpoints  
❌ **Frontend Components** - Delivery selection, tracking UI  
❌ **Lalamove Service** - API wrapper class  
❌ **Webhook Handler** - Receive real-time updates  
❌ **Database Models** - Store delivery records  
❌ **Admin Dashboard** - Manage deliveries  
❌ **Testing Suite** - Automated tests for all flows  
❌ **Chat Integration** - Customer-driver messaging  

---

## Test Delivery Details

### Your Actual Delivery (November 22, 2025)

#### **PICKUP Location** (Start Point):
```
Address: 1019 Quirino Highway, Barangay Sta. Monica, Novaliches, Quezon City, 1123 Metro Manila
Landmark: In front of BDO
Google Maps: https://maps.app.goo.gl/F4FRcbt4r4k7w8d38
Coordinates: 14.724177785776938, 121.03866187637956

Contact Person:
- Name: Melrhin Bayan
- Phone: +63 966 169 2000
- Instructions: "1019 Quirino High Way brgy sta Monica novaliches quezon city land mark in front of BDO"
```

#### **DROPOFF Location** (End Point):
```
Address: 936 Llano Road, Caloocan, 1400 Metro Manila
Google Maps: https://maps.app.goo.gl/DA8HpqTEfxgzhKrk6
Coordinates: 14.741238399110145, 121.00588596965112

Contact Person:
- Name: [TO BE FILLED]
- Phone: +63 [TO BE FILLED]
- Instructions: [TO BE FILLED]
```

#### **Delivery Details**:
- **Distance**: ~7.5 km
- **Estimated Time**: 25-35 minutes
- **Estimated Cost**: ₱150-₱200 (Motorcycle), ₱250-₱350 (Car)
- **Vehicle Type**: Motorcycle (recommended for fresh produce)
- **Service Type**: Same-day delivery
- **Special Instructions**: "Handle with care - fresh mushrooms, perishable item"

---

## Implementation Phases

### **PHASE 1: Quotation System** (3 hours)
**Goal**: Get real-time delivery price quotes before order confirmation

#### Tasks:
- [ ] Create `/api/lalamove/quotation` endpoint
- [ ] Build Lalamove API service class (`src/lib/lalamove/client.ts`)
- [ ] Implement quotation request with coordinates
- [ ] Add quotation display to checkout page
- [ ] Handle errors (invalid address, out of service area)
- [ ] Cache quotes for 5 minutes to avoid duplicate API calls
- [ ] Add loading states and error UI

#### API Implementation:
```typescript
// src/lib/lalamove/client.ts
import crypto from 'crypto';

export class LalamoveClient {
  private apiKey: string;
  private apiSecret: string;
  private host: string;
  private market: string;

  constructor() {
    this.apiKey = process.env.LALAMOVE_API_KEY!;
    this.apiSecret = process.env.LALAMOVE_API_SECRET!;
    this.host = process.env.LALAMOVE_HOST!;
    this.market = process.env.LALAMOVE_MARKET!;
  }

  // Generate signature for authentication
  private generateSignature(timestamp: string, method: string, path: string, body: string): string {
    const rawSignature = `${timestamp}\r\n${method}\r\n${path}\r\n\r\n${body}`;
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(rawSignature)
      .digest('hex');
  }

  // Get quotation
  async getQuotation(params: {
    pickupLat: number;
    pickupLng: number;
    dropoffLat: number;
    dropoffLng: number;
    vehicleType?: 'MOTORCYCLE' | 'CAR' | 'VAN';
  }) {
    const timestamp = new Date().getTime().toString();
    const method = 'POST';
    const path = `/v3/quotations`;
    
    const body = JSON.stringify({
      data: {
        market: this.market,
        serviceType: 'COURIER',
        stops: [
          {
            location: {
              lat: params.pickupLat.toString(),
              lng: params.pickupLng.toString(),
            },
          },
          {
            location: {
              lat: params.dropoffLat.toString(),
              lng: params.dropoffLng.toString(),
            },
          },
        ],
        deliveries: [
          {
            toStop: 1,
            toContact: {
              name: 'Customer',
              phone: '+639000000000',
            },
          },
        ],
        item: {
          quantity: '1',
          weight: 'LESS_THAN_3KG',
          categories: ['FOOD_DELIVERY', 'OFFICE_ITEM'],
          handlingInstructions: ['KEEP_UPRIGHT', 'FRAGILE'],
        },
      },
    });

    const signature = this.generateSignature(timestamp, method, path, body);

    const response = await fetch(`${this.host}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `hmac ${this.apiKey}:${timestamp}:${signature}`,
        'Market': this.market,
      },
      body,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Lalamove API Error: ${error.message}`);
    }

    return response.json();
  }
}
```

#### Frontend Component:
```typescript
// src/components/checkout/DeliveryQuotation.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface QuotationProps {
  pickupAddress: Address;
  deliveryAddress: Address;
  onQuoteReceived: (quote: Quote) => void;
}

export function DeliveryQuotation({ pickupAddress, deliveryAddress, onQuoteReceived }: QuotationProps) {
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotation = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/lalamove/quotation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupLat: pickupAddress.coordinates.lat,
          pickupLng: pickupAddress.coordinates.lng,
          dropoffLat: deliveryAddress.coordinates.lat,
          dropoffLng: deliveryAddress.coordinates.lng,
        }),
      });

      if (!response.ok) throw new Error('Failed to get quotation');

      const data = await response.json();
      setQuote(data.quote);
      onQuoteReceived(data.quote);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold mb-4">Same-Day Delivery (Lalamove)</h3>
      
      {!quote && (
        <Button onClick={fetchQuotation} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Get Delivery Quote
        </Button>
      )}

      {quote && (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Delivery Fee:</span>
            <span className="font-semibold">₱{quote.priceBreakdown.total}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Estimated time: {quote.estimatedPickupTime} - {quote.estimatedDropoffTime}
          </div>
        </div>
      )}

      {error && (
        <div className="text-destructive text-sm mt-2">{error}</div>
      )}
    </div>
  );
}
```

#### Testing Checklist:
- [ ] Call `/api/lalamove/quotation` with test coordinates
- [ ] Verify price returned (₱150-₱200 range)
- [ ] Test error handling (invalid coordinates)
- [ ] Test caching (second call should be instant)
- [ ] Verify UI displays loading state correctly

---

### **PHASE 2: Order Placement** (3 hours)
**Goal**: Automatically book Lalamove driver when order is confirmed

#### Tasks:
- [ ] Create `/api/lalamove/orders` endpoint
- [ ] Implement order creation with full delivery details
- [ ] Store order ID in database (link to MASH order)
- [ ] Update order status to "driver_assigning"
- [ ] Send confirmation email with tracking link
- [ ] Handle payment verification before booking
- [ ] Add retry logic for failed bookings

#### API Implementation:
```typescript
// src/app/api/lalamove/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { LalamoveClient } from '@/lib/lalamove/client';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, pickupDetails, dropoffDetails, items } = body;

    // Verify order exists and is paid
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: true },
    });

    if (!order || order.paymentStatus !== 'PAID') {
      return NextResponse.json(
        { error: 'Order not found or not paid' },
        { status: 400 }
      );
    }

    // Create Lalamove order
    const lalamove = new LalamoveClient();
    const lalamoveOrder = await lalamove.createOrder({
      stops: [
        {
          location: {
            lat: pickupDetails.coordinates.lat,
            lng: pickupDetails.coordinates.lng,
          },
          contact: {
            name: pickupDetails.contactName,
            phone: pickupDetails.contactPhone,
          },
          address: pickupDetails.address,
        },
        {
          location: {
            lat: dropoffDetails.coordinates.lat,
            lng: dropoffDetails.coordinates.lng,
          },
          contact: {
            name: order.user.firstName + ' ' + order.user.lastName,
            phone: order.user.phone,
          },
          address: dropoffDetails.address,
        },
      ],
      deliveries: [
        {
          toStop: 1,
          toContact: {
            name: order.user.firstName + ' ' + order.user.lastName,
            phone: order.user.phone,
          },
          remarks: dropoffDetails.specialInstructions || '',
        },
      ],
      item: {
        quantity: items.length.toString(),
        weight: calculateTotalWeight(items),
        categories: ['FOOD_DELIVERY'],
        handlingInstructions: ['KEEP_UPRIGHT', 'FRAGILE'],
      },
      quotationId: body.quotationId, // From Phase 1
    });

    // Store Lalamove order ID
    await prisma.order.update({
      where: { id: orderId },
      data: {
        lalamoveOrderId: lalamoveOrder.data.orderId,
        deliveryStatus: 'ASSIGNING_DRIVER',
        trackingUrl: `https://www.lalamove.com/track/${lalamoveOrder.data.shareLink}`,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: lalamoveOrder.data.orderId,
      trackingUrl: lalamoveOrder.data.shareLink,
    });
  } catch (error) {
    console.error('Lalamove order creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create delivery order' },
      { status: 500 }
    );
  }
}
```

#### Testing Checklist:
- [ ] Place test order with real coordinates
- [ ] Verify Lalamove order created successfully
- [ ] Check order ID saved to database
- [ ] Verify tracking URL generated
- [ ] Test error handling (payment not completed)
- [ ] Test retry logic (simulate API timeout)

---

### **PHASE 3: Order Details & Tracking** (2 hours)
**Goal**: Display real-time delivery status and driver location

#### Tasks:
- [ ] Create `/api/lalamove/orders/[orderId]` endpoint
- [ ] Build tracking page (`/orders/[orderId]/track`)
- [ ] Implement map component with driver location
- [ ] Add status timeline (ordered → assigned → pickup → delivery)
- [ ] Auto-refresh tracking every 30 seconds
- [ ] Add manual refresh button

#### Frontend Component:
```typescript
// src/app/(user)/orders/[orderId]/track/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { useParams } from 'next/navigation';

export default function TrackOrderPage() {
  const params = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const response = await fetch(`/api/lalamove/orders/${params.orderId}`);
      const data = await response.json();
      setOrderDetails(data);
      setLoading(false);
    };

    fetchOrderDetails();
    const interval = setInterval(fetchOrderDetails, 30000); // Refresh every 30s

    return () => clearInterval(interval);
  }, [params.orderId]);

  if (loading) return <div>Loading tracking info...</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Track Your Delivery</h1>

      {/* Status Timeline */}
      <div className="mb-8">
        <OrderStatusTimeline status={orderDetails.status} />
      </div>

      {/* Map */}
      <div className="h-[500px] rounded-lg overflow-hidden border">
        <GoogleMap
          center={orderDetails.driverLocation}
          zoom={15}
          mapContainerStyle={{ width: '100%', height: '100%' }}
        >
          <Marker position={orderDetails.pickupLocation} label="Pickup" />
          <Marker position={orderDetails.dropoffLocation} label="Delivery" />
          {orderDetails.driverLocation && (
            <Marker
              position={orderDetails.driverLocation}
              icon="/icons/delivery-driver.png"
              label="Driver"
            />
          )}
        </GoogleMap>
      </div>

      {/* Driver Details */}
      {orderDetails.driver && (
        <div className="mt-6 border rounded-lg p-4">
          <h2 className="font-semibold mb-4">Driver Information</h2>
          <div className="space-y-2">
            <p><strong>Name:</strong> {orderDetails.driver.name}</p>
            <p><strong>Phone:</strong> {orderDetails.driver.phone}</p>
            <p><strong>Vehicle:</strong> {orderDetails.driver.vehicleType}</p>
            <p><strong>Plate Number:</strong> {orderDetails.driver.plateNumber}</p>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### **PHASE 4: Driver Details** (1.5 hours)
**Goal**: Get assigned driver information (name, phone, vehicle)

#### Tasks:
- [ ] Create `/api/lalamove/orders/[orderId]/driver` endpoint
- [ ] Display driver card on tracking page
- [ ] Add call driver button (tel: link)
- [ ] Show driver photo (if available)
- [ ] Display vehicle type and plate number

---

### **PHASE 5: Order Management** (2 hours)
**Goal**: Allow admins to update or cancel orders

#### Tasks:
- [ ] Create `/api/lalamove/orders/[orderId]` PATCH endpoint
- [ ] Create `/api/lalamove/orders/[orderId]` DELETE endpoint
- [ ] Build admin dashboard order management page
- [ ] Add cancel order button with confirmation
- [ ] Implement partial refund for cancellations
- [ ] Log all order modifications

---

### **PHASE 6: Webhooks** (3 hours)
**Goal**: Receive real-time updates from Lalamove

#### Tasks:
- [ ] Create `/api/webhooks/lalamove` endpoint
- [ ] Verify webhook signature for security
- [ ] Parse webhook events (driver assigned, status changed, etc.)
- [ ] Update database on each webhook
- [ ] Send push notifications to customer
- [ ] Log all webhook events for debugging
- [ ] Set up ngrok for local testing
- [ ] Configure webhook URL in Lalamove dashboard

#### Implementation:
```typescript
// src/app/api/webhooks/lalamove/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-lalamove-signature');

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.LALAMOVE_API_SECRET!)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);

    // Handle different event types
    switch (event.eventType) {
      case 'DRIVER_ASSIGNED':
        await handleDriverAssigned(event.data);
        break;
      case 'ORDER_STATUS_CHANGED':
        await handleStatusChanged(event.data);
        break;
      case 'DRIVER_LOCATION_UPDATED':
        await handleLocationUpdated(event.data);
        break;
      case 'ORDER_COMPLETED':
        await handleOrderCompleted(event.data);
        break;
      case 'ORDER_CANCELLED':
        await handleOrderCancelled(event.data);
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleDriverAssigned(data: any) {
  const order = await prisma.order.findFirst({
    where: { lalamoveOrderId: data.orderId },
    include: { user: true },
  });

  if (!order) return;

  await prisma.order.update({
    where: { id: order.id },
    data: {
      deliveryStatus: 'DRIVER_ASSIGNED',
      driverName: data.driver.name,
      driverPhone: data.driver.phone,
      driverVehicle: data.driver.vehicleType,
    },
  });

  // Send notification
  await sendPushNotification(order.userId, {
    title: 'Driver Assigned!',
    body: `${data.driver.name} is on the way to pick up your order`,
  });
}

async function handleStatusChanged(data: any) {
  const order = await prisma.order.findFirst({
    where: { lalamoveOrderId: data.orderId },
  });

  if (!order) return;

  await prisma.order.update({
    where: { id: order.id },
    data: {
      deliveryStatus: mapLalamoveStatus(data.status),
    },
  });
}

function mapLalamoveStatus(status: string): string {
  const statusMap = {
    'ASSIGNING': 'ASSIGNING_DRIVER',
    'ON_GOING': 'IN_TRANSIT',
    'PICKED_UP': 'PICKED_UP',
    'COMPLETED': 'DELIVERED',
    'CANCELLED': 'CANCELLED',
  };
  return statusMap[status] || status;
}
```

---

### **PHASE 7: Priority Delivery** (1.5 hours)
**Goal**: Add express delivery option for urgent orders

#### Tasks:
- [ ] Create `/api/lalamove/orders/[orderId]/priority` endpoint
- [ ] Add "Express Delivery" checkbox to checkout
- [ ] Calculate priority fee (+₱50-₱100)
- [ ] Update quotation to include priority option
- [ ] Test priority booking vs standard

---

### **PHASE 8: Chat Integration** (4 hours)
**Goal**: Enable customer-driver messaging

#### Tasks:
- [ ] Research Lalamove Chat API (if available)
- [ ] Create chat UI component
- [ ] Implement WebSocket connection for real-time messages
- [ ] Store chat history in database
- [ ] Add chat notification badge
- [ ] Test message delivery both ways
- [ ] Add image/photo sharing capability

**Note**: Lalamove may not provide direct chat API. Alternative:
- Use Twilio for SMS relay
- Use in-app messaging with push notifications to driver
- Provide phone call fallback

---

## Postman Collection Guide

### Setting Up Postman Collection

#### Step 1: Create New Collection
1. Open Postman
2. Click "Collections" → "+ New Collection"
3. Name it: **"MASH - Lalamove PH Integration"**
4. Add description: "Complete API collection for same-day delivery testing"

#### Step 2: Set Collection Variables
Click collection → "Variables" tab:

| Variable | Initial Value | Current Value | Type |
|----------|---------------|---------------|------|
| `baseUrl` | `https://rest.sandbox.lalamove.com` | `https://rest.lalamove.com` | default |
| `apiKey` | `pk_test_8611e4fa8a2f51f6664d26aded0e5d2b` | `pk_prod_YOUR_KEY` | secret |
| `apiSecret` | `sk_test_KeCmtaJPeTEUwiP1N+upaT/2IH1Ckqqmd23db8+hVJnaysSpQVkRdbzIm2LlDztq` | `sk_prod_YOUR_KEY` | secret |
| `market` | `PH` | `PH` | default |
| `orderId` | `` | `` | default |
| `quotationId` | `` | `` | default |

#### Step 3: Add Pre-Request Script (Collection Level)
```javascript
// Generate HMAC signature for Lalamove API authentication
const timestamp = new Date().getTime().toString();
const method = pm.request.method;
const path = pm.request.url.getPath();
const body = pm.request.body.raw || '';

const crypto = require('crypto-js');
const rawSignature = `${timestamp}\r\n${method}\r\n${path}\r\n\r\n${body}`;
const signature = crypto.HmacSHA256(rawSignature, pm.collectionVariables.get('apiSecret')).toString();

pm.collectionVariables.set('timestamp', timestamp);
pm.collectionVariables.set('signature', signature);

// Set headers
pm.request.headers.add({
    key: 'Authorization',
    value: `hmac ${pm.collectionVariables.get('apiKey')}:${timestamp}:${signature}`
});
pm.request.headers.add({
    key: 'Market',
    value: pm.collectionVariables.get('market')
});
pm.request.headers.add({
    key: 'Content-Type',
    value: 'application/json'
});
```

### Request Templates

#### 1. Get Quotation
```
POST {{baseUrl}}/v3/quotations
```
Body (raw JSON):
```json
{
  "data": {
    "market": "PH",
    "serviceType": "COURIER",
    "stops": [
      {
        "location": {
          "lat": "14.724177785776938",
          "lng": "121.03866187637956"
        },
        "address": "1019 Quirino Highway, Brgy Sta. Monica, Novaliches, Quezon City, 1123 Metro Manila"
      },
      {
        "location": {
          "lat": "14.741238399110145",
          "lng": "121.00588596965112"
        },
        "address": "936 Llano Road, Caloocan, 1400 Metro Manila"
      }
    ],
    "deliveries": [
      {
        "toStop": 1,
        "toContact": {
          "name": "Test Customer",
          "phone": "+639661692000"
        }
      }
    ],
    "item": {
      "quantity": "1",
      "weight": "LESS_THAN_3KG",
      "categories": ["FOOD_DELIVERY"],
      "handlingInstructions": ["KEEP_UPRIGHT", "FRAGILE"]
    }
  }
}
```

Tests (add to "Tests" tab):
```javascript
// Parse response
const response = pm.response.json();

// Test status
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Save quotation ID for next requests
if (response.data && response.data.quotationId) {
    pm.collectionVariables.set("quotationId", response.data.quotationId);
    console.log("Quotation ID saved:", response.data.quotationId);
}

// Display price
if (response.data && response.data.priceBreakdown) {
    console.log("Total Price:", response.data.priceBreakdown.total);
}
```

#### 2. Place Order
```
POST {{baseUrl}}/v3/orders
```
Body (raw JSON):
```json
{
  "data": {
    "quotationId": "{{quotationId}}",
    "sender": {
      "stopId": "stop_0",
      "name": "Melrhin Bayan",
      "phone": "+639661692000"
    },
    "recipients": [
      {
        "stopId": "stop_1",
        "name": "Test Customer",
        "phone": "+639000000000",
        "remarks": "Please call upon arrival"
      }
    ],
    "isPODEnabled": true,
    "metadata": {
      "mashOrderId": "ORDER_TEST_001",
      "customerEmail": "customer@example.com"
    }
  }
}
```

Tests:
```javascript
const response = pm.response.json();

pm.test("Order created successfully", function () {
    pm.response.to.have.status(201);
});

if (response.data && response.data.orderId) {
    pm.collectionVariables.set("orderId", response.data.orderId);
    console.log("Order ID saved:", response.data.orderId);
    console.log("Share Link:", response.data.shareLink);
}
```

#### 3. Get Order Details
```
GET {{baseUrl}}/v3/orders/{{orderId}}
```

#### 4. Get Driver Details
```
GET {{baseUrl}}/v3/orders/{{orderId}}/drivers
```

#### 5. Update Order
```
PATCH {{baseUrl}}/v3/orders/{{orderId}}
```
Body:
```json
{
  "data": {
    "recipients": [
      {
        "stopId": "stop_1",
        "remarks": "Updated instructions: Leave at gate"
      }
    ]
  }
}
```

#### 6. Cancel Order
```
DELETE {{baseUrl}}/v3/orders/{{orderId}}
```

#### 7. Get Cities
```
GET {{baseUrl}}/v3/cities
```

#### 8. Get Vehicle Types
```
GET {{baseUrl}}/v3/vehicle-types?market=PH
```

#### 9. Setup Webhook (Production Only)
```
POST {{baseUrl}}/v3/webhooks
```
Body:
```json
{
  "data": {
    "url": "https://your-domain.com/api/webhooks/lalamove",
    "events": [
      "ORDER_STATUS_CHANGED",
      "DRIVER_ASSIGNED",
      "DRIVER_LOCATION_UPDATED",
      "ORDER_COMPLETED",
      "ORDER_CANCELLED"
    ]
  }
}
```

#### 10. Set Priority Delivery
```
PATCH {{baseUrl}}/v3/orders/{{orderId}}/priority
```
Body:
```json
{
  "data": {
    "priority": "HIGH"
  }
}
```

### Switching to Production

To test with production API:

1. **Update Collection Variables**:
   - `baseUrl` → `https://rest.lalamove.com` (remove "sandbox")
   - `apiKey` → Your production API key (starts with `pk_prod_`)
   - `apiSecret` → Your production API secret (starts with `sk_prod_`)

2. **Get Production Keys**:
   - Log in to Lalamove Business Portal
   - Go to Settings → API
   - Generate production credentials
   - Replace in collection variables

3. **Test Order Flow**:
   - Run "1. Get Quotation" → Verify price
   - Run "2. Place Order" → **CHARGES REAL MONEY**
   - Run "3. Get Order Details" → Verify driver assigned
   - Run "6. Cancel Order" → Cancel within 5 minutes for refund

**⚠️ WARNING**: Production orders charge real money! Test thoroughly in sandbox first.

---

## Production Testing Checklist

### Pre-Testing Setup
- [ ] Verify production API credentials in `.env.local`
- [ ] Update Postman collection with production URLs
- [ ] Test sandbox environment first (all 10 endpoints)
- [ ] Confirm test delivery address is valid
- [ ] Have recipient phone number ready
- [ ] Prepare cash/payment method for driver

### Test Execution (Your Actual Delivery)

#### Step 1: Get Quotation (10:00 AM)
```bash
# API Call
POST /v3/quotations
Body: {
  pickup: "14.724177785776938, 121.03866187637956",
  dropoff: "14.741238399110145, 121.00588596965112"
}

# Expected Response
{
  "quotationId": "QUO_123456",
  "priceBreakdown": {
    "total": "₱180.00",
    "base": "₱150.00",
    "surge": "₱0.00",
    "tax": "₱30.00"
  },
  "estimatedTime": "25 minutes"
}

# Verify
- [ ] Price is reasonable (₱150-₱250)
- [ ] Quotation ID saved
- [ ] Estimated time displayed
```

#### Step 2: Place Order (10:05 AM)
```bash
# API Call
POST /v3/orders
Body: {
  quotationId: "QUO_123456",
  sender: {
    name: "Melrhin Bayan",
    phone: "+639661692000"
  },
  recipient: {
    name: "[Recipient Name]",
    phone: "+63[Phone]"
  }
}

# Expected Response
{
  "orderId": "ORD_789012",
  "status": "ASSIGNING",
  "shareLink": "https://lalamove.com/track/ABC123"
}

# Verify
- [ ] Order ID saved
- [ ] Status is "ASSIGNING"
- [ ] Tracking link accessible
- [ ] Email confirmation sent
```

#### Step 3: Driver Assignment (10:10 AM)
```bash
# Webhook Received
{
  "eventType": "DRIVER_ASSIGNED",
  "data": {
    "orderId": "ORD_789012",
    "driver": {
      "name": "Juan Dela Cruz",
      "phone": "+639123456789",
      "vehicleType": "MOTORCYCLE",
      "plateNumber": "ABC-1234"
    }
  }
}

# Verify
- [ ] Webhook received and processed
- [ ] Database updated with driver info
- [ ] Push notification sent
- [ ] Driver details visible in UI
```

#### Step 4: Driver En Route to Pickup (10:15 AM)
```bash
# API Call
GET /v3/orders/ORD_789012

# Expected Response
{
  "status": "ON_GOING",
  "driver": {
    "location": {
      "lat": "14.720000",
      "lng": "121.040000"
    }
  },
  "estimatedPickupTime": "10:20 AM"
}

# Verify
- [ ] Status changed to "ON_GOING"
- [ ] Driver location updating on map
- [ ] ETA displayed correctly
```

#### Step 5: Driver at Pickup (10:20 AM)
```bash
# Webhook Received
{
  "eventType": "DRIVER_ARRIVED_AT_PICKUP",
  "data": {
    "orderId": "ORD_789012",
    "arrivedAt": "2025-11-22T10:20:00Z"
  }
}

# Manual Action
- [ ] Receive call from driver
- [ ] Meet driver at pickup location
- [ ] Hand over package
- [ ] Take photo of package (POD)
- [ ] Driver confirms pickup in app
```

#### Step 6: Package Picked Up (10:25 AM)
```bash
# Webhook Received
{
  "eventType": "DRIVER_PICKED_UP",
  "data": {
    "orderId": "ORD_789012",
    "pickedUpAt": "2025-11-22T10:25:00Z"
  }
}

# Verify
- [ ] Status changed to "PICKED_UP"
- [ ] Customer notified via SMS/email
- [ ] Tracking shows "In Transit"
```

#### Step 7: Driver En Route to Dropoff (10:30 AM)
```bash
# Monitor via Tracking Page
- [ ] Driver location moving toward destination
- [ ] ETA updating in real-time
- [ ] Customer can call driver if needed
```

#### Step 8: Driver at Dropoff (10:45 AM)
```bash
# Webhook Received
{
  "eventType": "DRIVER_ARRIVED_AT_DROPOFF",
  "data": {
    "orderId": "ORD_789012",
    "arrivedAt": "2025-11-22T10:45:00Z"
  }
}

# Manual Action (Customer Side)
- [ ] Receive call from driver
- [ ] Meet driver at dropoff location
- [ ] Receive package
- [ ] Inspect package condition
- [ ] Sign POD or provide OTP
```

#### Step 9: Delivery Completed (10:50 AM)
```bash
# Webhook Received
{
  "eventType": "ORDER_COMPLETED",
  "data": {
    "orderId": "ORD_789012",
    "completedAt": "2025-11-22T10:50:00Z",
    "proofOfDelivery": {
      "photo": "https://...",
      "signature": "https://..."
    }
  }
}

# Verify
- [ ] Status changed to "DELIVERED"
- [ ] POD photo uploaded
- [ ] Customer notified
- [ ] Order marked complete in database
- [ ] Payment to Lalamove processed
- [ ] Review request sent to customer
```

### Post-Test Verification
- [ ] Check Lalamove invoice/billing
- [ ] Verify all webhooks received
- [ ] Review database for accuracy
- [ ] Confirm customer received package
- [ ] Collect feedback from recipient

---

## Monitoring & Troubleshooting

### Common Issues

#### 1. Quotation Failed
**Error**: `Invalid coordinates`
**Solution**:
- Verify latitude/longitude format (string, not number)
- Check coordinates are within Metro Manila
- Ensure format: `"14.724177785776938"` (not `14.724177785776938`)

#### 2. Order Placement Failed
**Error**: `Quotation expired`
**Solution**:
- Quotations valid for 10 minutes only
- Get new quotation before placing order
- Implement auto-refresh logic

#### 3. Driver Not Assigned
**Possible Reasons**:
- Peak hours (lunch/dinner time)
- Bad weather conditions
- Pickup location too far from drivers
- Service area not covered

**Solution**:
- Wait 5-10 minutes
- Try again later
- Contact Lalamove support: +63 2 8849 8888

#### 4. Webhook Not Received
**Debugging Steps**:
1. Check webhook URL is publicly accessible
2. Verify signature validation logic
3. Test with ngrok for local development
4. Check Lalamove dashboard webhook logs
5. Ensure endpoint returns 200 OK quickly

#### 5. Tracking Not Updating
**Solution**:
- Increase polling frequency (every 15s instead of 30s)
- Check API rate limits
- Verify order ID is correct
- Test with different order

### Logging Best Practices

```typescript
// src/lib/lalamove/logger.ts
export const logLalamoveEvent = async (event: {
  type: 'quotation' | 'order' | 'webhook' | 'error';
  orderId?: string;
  data: any;
  timestamp: Date;
}) => {
  await prisma.lalamoveLog.create({
    data: {
      type: event.type,
      orderId: event.orderId,
      payload: JSON.stringify(event.data),
      createdAt: event.timestamp,
    },
  });

  console.log(`[Lalamove ${event.type.toUpperCase()}]`, event.data);
};
```

### Monitoring Dashboard

Create admin page at `/admin/lalamove/dashboard`:

- **Today's Deliveries**: Count, total revenue, average delivery time
- **Active Orders**: List of ongoing deliveries with status
- **Failed Orders**: Orders that failed booking/assignment
- **Driver Performance**: Average ratings, completion rate
- **Cost Analysis**: Delivery fees vs order value
- **Peak Hours**: Busiest times for orders

---

## Next Steps After Implementation

### Phase 9: Advanced Features (Optional)

1. **Multi-Stop Deliveries** - Pickup from multiple stores
2. **Scheduled Deliveries** - Book for later (same day or next day)
3. **Recurring Deliveries** - Subscription mushroom boxes
4. **Bulk Order Management** - Admin dashboard for batch bookings
5. **Analytics Dashboard** - Delivery metrics and KPIs
6. **Customer Preferences** - Save favorite addresses, delivery times
7. **Driver Ratings** - Rate driver after delivery
8. **Delivery Insurance** - Optional coverage for high-value orders
9. **Route Optimization** - AI-powered route suggestions
10. **Integration with Inventory** - Auto-update stock on delivery completion

### Documentation Updates

After completing implementation, update these files:

- `.github/copilot-instructions.md` - Add Lalamove API usage patterns
- `docs/API_INTEGRATION_GUIDE.md` - Document all endpoints
- `README.md` - Add delivery features section
- `CHANGELOG.md` - Log all changes

---

## Summary

### Total Timeline: 16-20 hours

| Phase | Duration | Priority | Complexity |
|-------|----------|----------|------------|
| 1. Quotation System | 3h | 🔴 Critical | Medium |
| 2. Order Placement | 3h | 🔴 Critical | Medium |
| 3. Order Tracking | 2h | 🟠 High | Medium |
| 4. Driver Details | 1.5h | 🟠 High | Low |
| 5. Order Management | 2h | 🟡 Medium | Medium |
| 6. Webhooks | 3h | 🔴 Critical | High |
| 7. Priority Delivery | 1.5h | 🟢 Low | Low |
| 8. Chat Integration | 4h | 🟢 Low | High |

### Success Metrics

- ✅ **Functional**: All API endpoints working
- ✅ **Reliable**: 99% uptime, < 2% failed orders
- ✅ **Fast**: Quotation in < 2s, order placement in < 5s
- ✅ **User-Friendly**: Customer can track order in real-time
- ✅ **Secure**: Webhook signatures verified, API keys encrypted
- ✅ **Monitored**: All events logged, admin dashboard functional

### Your Next Action

1. **Read this document thoroughly**
2. **Set up Postman collection** (copy templates above)
3. **Test sandbox API** (all 10 endpoints)
4. **Switch to production** when ready for live test
5. **Execute actual delivery** following checklist
6. **Report results** and gather learnings

---

**Created**: November 22, 2025  
**Author**: GitHub Copilot  
**Status**: Ready for implementation  
**Questions**: Ask anytime during development! 🚀
