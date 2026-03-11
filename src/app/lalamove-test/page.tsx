'use client';

/**
 * Lalamove Sandbox Interactive Demo Page
 * /lalamove-test
 *
 * Full interactive test page: quotation → order → real-time tracking
 * via Firestore onSnapshot. Sandbox simulator buttons trigger events
 * that flow through Firestore and update the UI instantly.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import StatusTimeline from '@/components/delivery/StatusTimeline';
import { useLalamoveTracking } from '@/hooks/useLalamoveTracking';
import { cn } from '@/lib/utils';
import {
  Loader2,
  Truck,
  User,
  Phone,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';

export default function LalamoveTestPage() {
  const [quotationResult, setQuotationResult] = useState<Record<string, unknown> | null>(null);
  const [orderResult, setOrderResult] = useState<Record<string, unknown> | null>(null);
  const [internalOrderId, setInternalOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRawData, setShowRawData] = useState(false);
  const [simulatingEvent, setSimulatingEvent] = useState<string | null>(null);

  // Real-time Firestore subscription
  const { tracking, order: firestoreOrder, loading: trackingLoading } =
    useLalamoveTracking(internalOrderId);

  // Test coordinates (Manila area)
  const defaultPickup = {
    lat: '14.71913537416188',
    lng: '121.03718747595673',
    address: '266 Quirino Hwy, Novaliches, Quezon City, Metro Manila',
    name: 'Paulo Tongco',
    phone: '+639327677205',
  };

  const defaultDropoff = {
    lat: '14.740767636934477',
    lng: '121.00192598578872',
    address: '936 Llano Rd, Caloocan, Metro Manila',
    name: 'Mary Jane Bahay',
    phone: '+639272533969',
  };

  const testGetQuotation = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/lalamove/quotation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupLat: defaultPickup.lat,
          pickupLng: defaultPickup.lng,
          pickupAddress: defaultPickup.address,
          dropoffLat: defaultDropoff.lat,
          dropoffLng: defaultDropoff.lng,
          dropoffAddress: defaultDropoff.address,
          serviceType: 'MOTORCYCLE',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setQuotationResult(data.data);
      } else {
        setError(data.message || 'Quotation failed');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const testPlaceOrder = async () => {
    if (!quotationResult) {
      setError('Get quotation first!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const stops = quotationResult.stops as Array<{ stopId: string }>;
      const response = await fetch('/api/lalamove/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotationId: quotationResult.quotationId,
          senderStopId: stops[0].stopId,
          senderName: defaultPickup.name,
          senderPhone: defaultPickup.phone,
          recipientStopId: stops[1].stopId,
          recipientName: defaultDropoff.name,
          recipientPhone: defaultDropoff.phone,
          orderNumber: 'TEST-' + Date.now(),
          remarks: 'Test delivery - Fresh Mushrooms (2kg)',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setOrderResult(data.data);
        // Use Lalamove orderId as internalOrderId for tracking demo
        // In production this would be the Firebase order doc ID
        if (data.data.orderId) {
          setInternalOrderId(data.data.orderId);
        }
      } else {
        setError(data.message || 'Order placement failed');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const simulateEvent = async (event: string) => {
    const targetId = internalOrderId;
    if (!targetId) {
      setError('Place an order first to get an orderId for simulation');
      return;
    }

    setSimulatingEvent(event);
    setError(null);

    try {
      const response = await fetch('/api/lalamove/sandbox-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: targetId, event }),
      });

      const data = await response.json();
      if (!data.success) {
        setError(data.message || 'Simulation failed');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSimulatingEvent(null);
    }
  };

  const status = tracking?.status as string | undefined;
  const driver = tracking?.driver;
  const timelineStatus = (
    ['ASSIGNING_DRIVER', 'ON_GOING', 'PICKED_UP', 'COMPLETED', 'CANCELED'].includes(status || '')
      ? status
      : 'ASSIGNING_DRIVER'
  ) as 'ASSIGNING_DRIVER' | 'ON_GOING' | 'PICKED_UP' | 'COMPLETED' | 'CANCELED';

  return (
    <div className="container mx-auto py-10 space-y-6 max-w-4xl">
      {/* Sandbox Banner */}
      <div className="rounded-lg border-2 border-yellow-400 bg-yellow-50 p-4 text-center">
        <div className="flex items-center justify-center gap-2 font-bold text-yellow-800">
          <AlertTriangle className="h-5 w-5" />
          [SANDBOX MODE] - No real deliveries are created
          <AlertTriangle className="h-5 w-5" />
        </div>
        <p className="text-sm text-yellow-700 mt-1">
          Using sandbox API: rest.sandbox.lalamove.com
        </p>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Lalamove Interactive Demo</h1>
        <p className="text-muted-foreground">
          Full flow: Quotation → Order → Real-time tracking via Firestore onSnapshot
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Section 1: Quotation */}
      <Card>
        <CardHeader>
          <CardTitle>1. Get Quotation</CardTitle>
          <CardDescription>
            {defaultPickup.address} → {defaultDropoff.address}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="font-semibold">Pickup</Label>
              <p className="text-muted-foreground mt-1">{defaultPickup.name}</p>
              <p className="text-muted-foreground">{defaultPickup.address}</p>
            </div>
            <div>
              <Label className="font-semibold">Dropoff</Label>
              <p className="text-muted-foreground mt-1">{defaultDropoff.name}</p>
              <p className="text-muted-foreground">{defaultDropoff.address}</p>
            </div>
          </div>

          <Button onClick={testGetQuotation} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting Quote...
              </>
            ) : (
              'Get Quotation'
            )}
          </Button>

          {quotationResult && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 space-y-1 text-sm">
              <p className="font-semibold text-emerald-800">[PASS] Quotation received</p>
              <p>Quotation ID: {String(quotationResult.quotationId)}</p>
              <p>Price: PHP {String(quotationResult.price)}</p>
              <p>
                Distance: {String((quotationResult.distance as Record<string, unknown>)?.value || 'N/A')}m
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Place Order */}
      <Card>
        <CardHeader>
          <CardTitle>2. Place Order</CardTitle>
          <CardDescription>Create a Lalamove delivery order (sandbox)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={testPlaceOrder}
            disabled={loading || !quotationResult}
            variant={quotationResult ? 'default' : 'outline'}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Placing Order...
              </>
            ) : (
              'Place Order'
            )}
          </Button>

          {orderResult && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 space-y-1 text-sm">
              <p className="font-semibold text-emerald-800">[PASS] Order placed</p>
              <p>Order ID: {String(orderResult.orderId)}</p>
              <p>Status: {String(orderResult.status)}</p>
              {Boolean(orderResult.shareLink) && (
                <p>
                  Share Link:{' '}
                  <a
                    href={String(orderResult.shareLink)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {String(orderResult.shareLink)}
                  </a>
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Section 3: Real-Time Status Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            3. Real-Time Status (Firestore onSnapshot)
          </CardTitle>
          <CardDescription>
            {internalOrderId
              ? `Subscribed to order: ${internalOrderId}`
              : 'Place an order above to start real-time tracking'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!internalOrderId ? (
            <p className="text-muted-foreground text-sm py-6 text-center">
              No order to track yet. Complete steps 1 and 2 above.
            </p>
          ) : trackingLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : tracking ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge
                  className={cn(
                    'text-sm',
                    status === 'COMPLETED'
                      ? 'bg-green-100 text-green-800'
                      : status === 'CANCELED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                  )}
                >
                  {status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Last updated:{' '}
                  {tracking.lastUpdated
                    ? new Date(tracking.lastUpdated as unknown as string).toLocaleTimeString()
                    : 'N/A'}
                </span>
              </div>

              {/* Section 5: Status Timeline */}
              <StatusTimeline currentStatus={timelineStatus} />

              {/* Section 6: Driver Info */}
              {driver && (
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                      <User className="h-5 w-5 text-emerald-700" />
                    </div>
                    <div>
                      <p className="font-medium">{driver.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {driver.plateNumber}
                      </p>
                    </div>
                    {driver.phone && (
                      <Badge variant="outline" className="ml-auto">
                        <Phone className="h-3 w-3 mr-1" />
                        {driver.phone}
                      </Badge>
                    )}
                  </div>
                  {driver.coordinates && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Location: {driver.coordinates.lat}, {driver.coordinates.lng}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm py-6 text-center">
              No tracking data yet. Use the simulator below to trigger events.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Section 4: Sandbox Event Simulator */}
      <Card className="border-yellow-300">
        <CardHeader>
          <CardTitle>4. Sandbox Event Simulator</CardTitle>
          <CardDescription>
            Trigger fake Lalamove events — watch Section 3 update in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {[
              { event: 'ASSIGNING_DRIVER', label: 'Assigning', color: 'bg-yellow-500 hover:bg-yellow-600' },
              { event: 'DRIVER_ASSIGNED', label: 'Driver Assigned', color: 'bg-blue-500 hover:bg-blue-600' },
              { event: 'PICKED_UP', label: 'Picked Up', color: 'bg-indigo-500 hover:bg-indigo-600' },
              { event: 'COMPLETED', label: 'Completed', color: 'bg-green-500 hover:bg-green-600' },
              { event: 'CANCELED', label: 'Canceled', color: 'bg-red-500 hover:bg-red-600' },
            ].map(({ event, label, color }) => (
              <Button
                key={event}
                onClick={() => simulateEvent(event)}
                disabled={!internalOrderId || simulatingEvent !== null}
                className={cn('text-white text-xs', internalOrderId ? color : '')}
                size="sm"
              >
                {simulatingEvent === event ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  label
                )}
              </Button>
            ))}
          </div>
          {!internalOrderId && (
            <p className="text-xs text-muted-foreground mt-2">
              Place an order first to enable simulation.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Section 7: Raw API Data */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => setShowRawData(!showRawData)}
        >
          <CardTitle className="flex items-center justify-between text-base">
            <span>Raw API / Firestore Data</span>
            {showRawData ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CardTitle>
        </CardHeader>
        {showRawData && (
          <CardContent>
            <div className="space-y-4">
              {quotationResult && (
                <div>
                  <Label className="font-semibold text-xs">Quotation Response</Label>
                  <pre className="mt-1 rounded bg-muted p-3 text-xs overflow-auto max-h-48">
                    {JSON.stringify(quotationResult, null, 2)}
                  </pre>
                </div>
              )}
              {orderResult && (
                <div>
                  <Label className="font-semibold text-xs">Order Response</Label>
                  <pre className="mt-1 rounded bg-muted p-3 text-xs overflow-auto max-h-48">
                    {JSON.stringify(orderResult, null, 2)}
                  </pre>
                </div>
              )}
              {tracking && (
                <div>
                  <Label className="font-semibold text-xs">
                    Firestore lalamoveTracking (Real-Time)
                  </Label>
                  <pre className="mt-1 rounded bg-muted p-3 text-xs overflow-auto max-h-48">
                    {JSON.stringify(tracking, null, 2)}
                  </pre>
                </div>
              )}
              {firestoreOrder && (
                <div>
                  <Label className="font-semibold text-xs">Full Firestore Order</Label>
                  <pre className="mt-1 rounded bg-muted p-3 text-xs overflow-auto max-h-60">
                    {JSON.stringify(firestoreOrder, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
