'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, CheckCircle2, Clock, MapPin, Phone, User, DollarSign } from 'lucide-react';

/**
 * Lalamove Production Test Page
 * 
 * ⚠️ WARNING: This page places REAL orders with REAL money!
 * Use only for production testing with actual delivery.
 * 
 * Features:
 * - Cash on Delivery (COD) support
 * - Real-time quotation
 * - Order confirmation dialogs
 * - Multiple safety checks
 */

interface QuotationResult {
  quotationId: string;
  total: string;
  distance: string;
  expiresAt: string;
  priceBreakdown: {
    base: string;
    extraMileage: string;
    adminFee: string;
  };
}

interface OrderResult {
  orderId: string;
  status: string;
  trackingUrl: string;
}

export default function TestLalamovePage() {
  // Form state
  const [codEnabled, setCodEnabled] = useState(true);
  const [codAmount, setCodAmount] = useState('500');
  const [confirmations, setConfirmations] = useState({
    pauloReady: false,
    maryJaneReady: false,
    understandCost: false,
    understandRealDelivery: false,
  });

  // API state
  const [loading, setLoading] = useState(false);
  const [quotation, setQuotation] = useState<QuotationResult | null>(null);
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Test addresses (hardcoded from your provided data)
  const PICKUP = {
    name: 'Paulo tongco',
    phone: '+639327677205',
    address: '266 Quirino Hwy, Novaliches, Quezon City, Metro Manila, Philippines',
    coordinates: { lat: '14.72176748577907', lng: '121.03832287637948' },
    instructions: 'Novaliches bayan katabi Ng mcdo sa susano china town cellphone city shop name Paulo',
  };

  const DROPOFF = {
    name: 'Mary Jane Bahay',
    phone: '+639272533969',
    address: 'Phone Craft Cellphone Repair, 936 Llano rd, Caloocan',
    coordinates: { lat: '14.74071710025935', lng: '121.00675881440075' },
    instructions: '936 Llano rd. Tapat ng INFINITY WASH malapit sa 7/11 llano',
  };

  // Validation
  const allConfirmationsChecked = Object.values(confirmations).every(Boolean);
  const canRequestQuotation = allConfirmationsChecked;
  const canPlaceOrder = quotation && allConfirmationsChecked;

  // Get Quotation
  async function handleGetQuotation() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/lalamove/quotation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickup: PICKUP,
          dropoff: DROPOFF,
          serviceType: 'MOTORCYCLE',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get quotation');
      }

      setQuotation(data.quotation);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Place Order
  async function handlePlaceOrder() {
    if (!quotation) return;

    // Final confirmation
    const confirmed = window.confirm(
      `🚨 FINAL CONFIRMATION\n\n` +
      `This will place a REAL order:\n` +
      `- Delivery Fee: ₱${quotation.total}\n` +
      `${codEnabled ? `- COD Amount: ₱${codAmount}\n` : ''}` +
      `- Real driver will be dispatched\n` +
      `- NON-REFUNDABLE\n\n` +
      `Are you absolutely sure?`
    );

    if (!confirmed) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/lalamove/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotationId: quotation.quotationId,
          sender: {
            stopId: 'stop_0',
            name: PICKUP.name,
            phone: PICKUP.phone,
          },
          recipients: [
            {
              stopId: 'stop_1',
              name: DROPOFF.name,
              phone: DROPOFF.phone,
              remarks: DROPOFF.instructions,
              ...(codEnabled && {
                payment: {
                  method: 'CASH',
                  amount: codAmount,
                },
              }),
            },
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order');
      }

      setOrder(data.order);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Warning Banner */}
      <Alert className="mb-6 border-red-500 bg-red-50">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>⚠️ PRODUCTION TEST PAGE - REAL MONEY!</strong>
          <br />
          This page places REAL Lalamove orders that charge your account. Only use for actual deliveries.
        </AlertDescription>
      </Alert>

      <h1 className="text-3xl font-bold mb-2">Lalamove Production Test</h1>
      <p className="text-muted-foreground mb-6">
        Test real delivery from Paulo (Novaliches) to Mary Jane (Caloocan) with Cash on Delivery
      </p>

      {/* Delivery Addresses */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Pickup */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              Pickup Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <div className="font-medium">{PICKUP.name}</div>
                <div className="text-muted-foreground">{PICKUP.address}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{PICKUP.phone}</span>
            </div>
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              📍 {PICKUP.instructions}
            </div>
          </CardContent>
        </Card>

        {/* Dropoff */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-600" />
              Dropoff Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <div className="font-medium">{DROPOFF.name}</div>
                <div className="text-muted-foreground">{DROPOFF.address}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{DROPOFF.phone}</span>
            </div>
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              📍 {DROPOFF.instructions}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cash on Delivery Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cash on Delivery (COD)
          </CardTitle>
          <CardDescription>
            Enable COD so driver collects payment from Mary Jane at dropoff
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={codEnabled ? 'enabled' : 'disabled'}
            onValueChange={(value) => setCodEnabled(value === 'enabled')}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="enabled" id="cod-enabled" />
              <Label htmlFor="cod-enabled" className="font-normal cursor-pointer">
                Enable COD - Driver collects cash from Mary Jane
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="disabled" id="cod-disabled" />
              <Label htmlFor="cod-disabled" className="font-normal cursor-pointer">
                No COD - Driver does NOT collect payment
              </Label>
            </div>
          </RadioGroup>

          {codEnabled && (
            <div className="space-y-2 pl-6 border-l-2 border-primary">
              <Label htmlFor="cod-amount">COD Amount (₱)</Label>
              <Input
                id="cod-amount"
                type="number"
                min="100"
                max="10000"
                value={codAmount}
                onChange={(e) => setCodAmount(e.target.value)}
                placeholder="500"
              />
              <p className="text-sm text-muted-foreground">
                Driver will collect ₱{codAmount} cash from Mary Jane and transfer to you later (minus delivery fee).
              </p>
              {quotation && (
                <div className="bg-primary/10 p-3 rounded text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Customer pays (COD):</span>
                    <span className="font-medium">₱{codAmount}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery fee:</span>
                    <span>- ₱{quotation.total}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1 border-t">
                    <span>You receive:</span>
                    <span className="text-green-600">₱{parseInt(codAmount) - parseInt(quotation.total)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Checklist */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Pre-Flight Checklist</CardTitle>
          <CardDescription>
            Check all boxes before requesting quotation. This ensures everyone is ready.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="paulo-ready"
              checked={confirmations.pauloReady}
              onCheckedChange={(checked) =>
                setConfirmations((prev) => ({ ...prev, pauloReady: checked as boolean }))
              }
            />
            <Label htmlFor="paulo-ready" className="font-normal cursor-pointer leading-tight">
              <strong>Paulo is at 266 Quirino Hwy</strong> with package ready to hand to driver
            </Label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="mary-jane-ready"
              checked={confirmations.maryJaneReady}
              onCheckedChange={(checked) =>
                setConfirmations((prev) => ({ ...prev, maryJaneReady: checked as boolean }))
              }
            />
            <Label htmlFor="mary-jane-ready" className="font-normal cursor-pointer leading-tight">
              <strong>Mary Jane is at Phone Craft Cellphone Repair</strong> ready to receive package
              {codEnabled && ` and has ₱${codAmount} cash ready`}
            </Label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="understand-cost"
              checked={confirmations.understandCost}
              onCheckedChange={(checked) =>
                setConfirmations((prev) => ({ ...prev, understandCost: checked as boolean }))
              }
            />
            <Label htmlFor="understand-cost" className="font-normal cursor-pointer leading-tight">
              I understand this will charge <strong>₱64-₱100 delivery fee</strong> (non-refundable)
            </Label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="understand-real"
              checked={confirmations.understandRealDelivery}
              onCheckedChange={(checked) =>
                setConfirmations((prev) => ({ ...prev, understandRealDelivery: checked as boolean }))
              }
            />
            <Label htmlFor="understand-real" className="font-normal cursor-pointer leading-tight">
              I understand this is a <strong>REAL delivery with REAL money</strong>, not a test/sandbox
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert className="mb-6 border-red-500 bg-red-50">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Error:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Quotation Result */}
      {quotation && (
        <Card className="mb-6 border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Quotation Received
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Quotation ID</div>
                <div className="font-mono text-xs">{quotation.quotationId}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Distance</div>
                <div className="font-medium">{(parseInt(quotation.distance) / 1000).toFixed(2)} km</div>
              </div>
            </div>

            <div className="bg-muted p-4 rounded space-y-2">
              <div className="flex justify-between text-sm">
                <span>Base Fee:</span>
                <span>₱{quotation.priceBreakdown.base}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Extra Mileage:</span>
                <span>₱{quotation.priceBreakdown.extraMileage}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Admin Fee:</span>
                <span>₱{quotation.priceBreakdown.adminFee}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Delivery Fee:</span>
                <span className="text-primary">₱{quotation.total}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Valid until: {new Date(quotation.expiresAt).toLocaleTimeString()}</span>
              <span className="text-orange-600 font-medium">(5 minutes)</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Result */}
      {order && (
        <Card className="mb-6 border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Order Placed Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Order ID</div>
              <div className="font-mono text-lg font-bold">{order.orderId}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <div className="font-medium text-orange-600">{order.status}</div>
            </div>
            {order.trackingUrl && (
              <Button variant="outline" asChild className="w-full">
                <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer">
                  Track Delivery in Real-Time
                </a>
              </Button>
            )}

            <Alert className="bg-blue-50 border-blue-500">
              <AlertDescription className="text-blue-800 space-y-2">
                <strong>Next Steps:</strong>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Driver will be assigned within 2-5 minutes</li>
                  <li>Paulo will receive call when driver is nearby</li>
                  <li>Driver picks up package from Paulo</li>
                  <li>Driver delivers to Mary Jane at Phone Craft</li>
                  {codEnabled && (
                    <li className="text-orange-700 font-medium">
                      Driver collects ₱{codAmount} cash from Mary Jane
                    </li>
                  )}
                  <li>Estimated delivery time: 30-40 minutes</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        {!quotation && (
          <Button
            onClick={handleGetQuotation}
            disabled={!canRequestQuotation || loading}
            size="lg"
            className="flex-1"
          >
            {loading ? 'Getting Quotation...' : '1. Get Quotation'}
          </Button>
        )}

        {quotation && !order && (
          <Button
            onClick={handlePlaceOrder}
            disabled={!canPlaceOrder || loading}
            size="lg"
            variant="destructive"
            className="flex-1"
          >
            {loading ? 'Placing Order...' : '2. Place Order (CHARGES ACCOUNT!)'}
          </Button>
        )}

        {order && (
          <Button size="lg" variant="outline" className="flex-1" onClick={() => window.location.reload()}>
            Start New Test
          </Button>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-6 text-sm text-muted-foreground text-center">
        <p>Need help? See documentation at <code className="bg-muted px-2 py-1 rounded">.github/LALAMOVE_COD_GUIDE.md</code></p>
        <p className="mt-1">Or run: <code className="bg-muted px-2 py-1 rounded">node scripts/test-lalamove-delivery.js</code></p>
      </div>
    </div>
  );
}
