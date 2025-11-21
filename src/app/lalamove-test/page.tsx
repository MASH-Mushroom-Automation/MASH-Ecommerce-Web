'use client';

/**
 * Lalamove Integration Test Page
 * /lalamove-test
 * 
 * Test all Lalamove API functionality before production deployment
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LalamoveTestPage() {
  const [quotationResult, setQuotationResult] = useState<any>(null);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Test coordinates from your actual delivery
  const defaultPickup = {
    lat: '14.724177785776938',
    lng: '121.03866187637956',
    address: '1019 Quirino Highway, Brgy Sta. Monica, Novaliches, Quezon City',
    name: 'Melrhin Bayan',
    phone: '+639661692000',
  };

  const defaultDropoff = {
    lat: '14.741238399110145',
    lng: '121.00588596965112',
    address: '936 Llano Road, Caloocan, 1400 Metro Manila',
    name: 'Test Customer', // Default test customer name
    phone: '+639171234567', // Default test customer phone (E.164 format)
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
        console.log('✅ Quotation successful:', data.data);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message);
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
      const response = await fetch('/api/lalamove/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotationId: quotationResult.quotationId,
          senderStopId: quotationResult.stops[0].stopId,
          senderName: defaultPickup.name,
          senderPhone: defaultPickup.phone,
          recipientStopId: quotationResult.stops[1].stopId,
          recipientName: defaultDropoff.name,
          recipientPhone: defaultDropoff.phone,
          orderNumber: 'TEST-' + Date.now(),
          remarks: 'Test delivery - Fresh Mushrooms (2kg)',
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setOrderResult(data.data);
        console.log('✅ Order placed:', data.data);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testGetOrderDetails = async () => {
    if (!orderResult) {
      setError('Place order first!');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/lalamove/order?orderId=${orderResult.orderId}`);
      const data = await response.json();
      
      if (data.success) {
        setOrderResult(data.data);
        console.log('✅ Order details:', data.data);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testCancelOrder = async () => {
    if (!orderResult) {
      setError('Place order first!');
      return;
    }

    if (!confirm('Are you sure you want to cancel this test order?')) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/lalamove/order?orderId=${orderResult.orderId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Order cancelled');
        setOrderResult(null);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Lalamove Integration Test</h1>
        <p className="text-muted-foreground">Test Phase 1 & 2 implementation (Quotation + Order Placement)</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Test Delivery Route */}
      <Card>
        <CardHeader>
          <CardTitle>Test Delivery Route</CardTitle>
          <CardDescription>Your actual delivery addresses (from Google Maps)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="font-semibold">Pickup (MASH Store)</Label>
            <div className="text-sm space-y-1 mt-2">
              <p><strong>Address:</strong> {defaultPickup.address}</p>
              <p><strong>Contact:</strong> {defaultPickup.name} ({defaultPickup.phone})</p>
              <p><strong>Coordinates:</strong> {defaultPickup.lat}, {defaultPickup.lng}</p>
            </div>
          </div>
          
          <div>
            <Label className="font-semibold">Dropoff (Customer)</Label>
            <div className="text-sm space-y-1 mt-2">
              <p><strong>Address:</strong> {defaultDropoff.address}</p>
              <p><strong>Contact:</strong> {defaultDropoff.name} ({defaultDropoff.phone})</p>
              <p><strong>Coordinates:</strong> {defaultDropoff.lat}, {defaultDropoff.lng}</p>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-sm"><strong>Expected:</strong> ~7.5 km, 25-35 min, ₱150-₱200</p>
          </div>
        </CardContent>
      </Card>

      {/* Phase 1: Quotation */}
      <Card>
        <CardHeader>
          <CardTitle>Phase 1: Get Quotation</CardTitle>
          <CardDescription>Get delivery price before order confirmation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testGetQuotation} disabled={loading}>
            {loading ? 'Loading...' : 'Get Quotation'}
          </Button>
          
          {quotationResult && (
            <div className="bg-green-50 p-4 rounded-md space-y-2">
              <p className="font-semibold">✅ Quotation Successful!</p>
              <p><strong>Quotation ID:</strong> {quotationResult.quotationId}</p>
              <p><strong>Price:</strong> ₱{quotationResult.price} {quotationResult.currency}</p>
              <p><strong>Distance:</strong> {quotationResult.distance.value}m</p>
              <p><strong>Expires At:</strong> {new Date(quotationResult.expiresAt).toLocaleString()}</p>
              <details className="mt-2">
                <summary className="cursor-pointer text-sm">Price Breakdown</summary>
                <pre className="text-xs mt-2">{JSON.stringify(quotationResult.priceBreakdown, null, 2)}</pre>
              </details>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phase 2: Place Order */}
      <Card>
        <CardHeader>
          <CardTitle>Phase 2: Place Order</CardTitle>
          <CardDescription>Book Lalamove driver (Sandbox - No real delivery)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testPlaceOrder} 
            disabled={loading || !quotationResult}
            variant={quotationResult ? 'default' : 'outline'}
          >
            {loading ? 'Loading...' : 'Place Order'}
          </Button>
          
          {orderResult && (
            <div className="bg-green-50 p-4 rounded-md space-y-2">
              <p className="font-semibold">✅ Order Placed Successfully!</p>
              <p><strong>Order ID:</strong> {orderResult.orderId}</p>
              <p><strong>Status:</strong> {orderResult.status}</p>
              <p><strong>Driver ID:</strong> {orderResult.driverId || 'Not assigned yet'}</p>
              <p><strong>Share Link:</strong> <a href={orderResult.shareLink} target="_blank" className="text-blue-600 underline">{orderResult.shareLink}</a></p>
              
              {orderResult.status === 'ASSIGNING_DRIVER' && (
                <p className="text-sm text-orange-600">⏳ Waiting for driver assignment...</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phase 3: Track Order */}
      <Card>
        <CardHeader>
          <CardTitle>Phase 3: Track Order</CardTitle>
          <CardDescription>Get real-time order status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={testGetOrderDetails} 
              disabled={loading || !orderResult}
              variant="outline"
            >
              {loading ? 'Loading...' : 'Refresh Status'}
            </Button>
            
            <Button 
              onClick={testCancelOrder} 
              disabled={loading || !orderResult}
              variant="destructive"
            >
              {loading ? 'Loading...' : 'Cancel Order'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Status */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>✅ Phase 1: Quotation System - <strong>COMPLETE</strong></div>
            <div>✅ Phase 2: Order Placement - <strong>COMPLETE</strong></div>
            <div>⏸️ Phase 3: Tracking - <strong>API READY</strong></div>
            <div>⏸️ Phase 4: Driver Details - <strong>NOT STARTED</strong></div>
            <div>⏸️ Phase 5: Order Management - <strong>PARTIAL</strong></div>
            <div>⏸️ Phase 6: Webhooks - <strong>HANDLER READY</strong></div>
            <div>⏸️ Phase 7: Priority Delivery - <strong>NOT STARTED</strong></div>
            <div>⏸️ Phase 8: Chat Integration - <strong>NOT STARTED</strong></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
