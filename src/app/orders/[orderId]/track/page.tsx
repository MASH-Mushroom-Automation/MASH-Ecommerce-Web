'use client';

/**
 * Real-Time Order Tracking Page
 * /orders/[orderId]/track
 * 
 * Shows live delivery status with Google Maps and status timeline
 * Polls Lalamove API every 30 seconds for updates
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, Phone, MapPin, Package, Clock } from 'lucide-react';
import TrackingMap from '@/components/delivery/TrackingMap';
import StatusTimeline from '@/components/delivery/StatusTimeline';

interface OrderDetails {
  orderId: string;
  status: 'ASSIGNING_DRIVER' | 'ON_GOING' | 'PICKED_UP' | 'COMPLETED' | 'CANCELED' | 'REJECTED' | 'EXPIRED';
  priceBreakdown: {
    total: string;
    currency: string;
  };
  stops: Array<{
    stopId: string;
    coordinates: {
      lat: string;
      lng: string;
    };
    address: string;
  }>;
  shareLink: string;
  driverId?: string;
}

interface DriverDetails {
  driverId: string;
  name: string;
  phone: string;
  plateNumber: string;
  photo?: string;
  location?: {
    lat: string;
    lng: string;
  };
}

export default function TrackOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [driver, setDriver] = useState<DriverDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch order details
  const fetchOrderDetails = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    setError(null);

    try {
      const response = await fetch(`/api/lalamove/order?orderId=${orderId}`);
      const data = await response.json();

      if (data.success) {
        setOrder(data.data);
        setLastUpdate(new Date());

        // If driver assigned, fetch driver details
        if (data.data.driverId && !driver) {
          fetchDriverDetails(data.data.driverId);
        }
      } else {
        setError(data.message || 'Failed to load order details');
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to load order details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch driver details (may not work in sandbox)
  const fetchDriverDetails = async (driverId: string) => {
    try {
      const response = await fetch(`/api/lalamove/driver?orderId=${orderId}`);
      const data = await response.json();

      if (data.success) {
        setDriver(data.data);
      }
    } catch (err) {
      console.log('Driver details not available (expected in sandbox)');
    }
  };

  // Initial load
  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!order || order.status === 'COMPLETED' || order.status === 'CANCELED') {
      return; // Stop polling if order is complete
    }

    const interval = setInterval(() => {
      fetchOrderDetails(false); // Silent refresh
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [order?.status]);

  const handleRefresh = () => {
    fetchOrderDetails(true);
  };

  const handleCallDriver = () => {
    if (driver?.phone) {
      window.location.href = `tel:${driver.phone}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600';
      case 'CANCELED':
      case 'REJECTED':
      case 'EXPIRED':
        return 'text-red-600';
      case 'ON_GOING':
      case 'PICKED_UP':
        return 'text-blue-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ASSIGNING_DRIVER':
        return 'Finding driver...';
      case 'ON_GOING':
        return 'Driver on the way to pickup';
      case 'PICKED_UP':
        return 'Package picked up - Delivering now';
      case 'COMPLETED':
        return 'Delivered successfully!';
      case 'CANCELED':
        return 'Order canceled';
      case 'REJECTED':
        return 'Order rejected';
      case 'EXPIRED':
        return 'Order expired';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/orders')} className="mt-4">
          Back to Orders
        </Button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto py-10">
        <Alert>
          <AlertDescription>Order not found</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/orders')} className="mt-4">
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Track Your Delivery</h1>
          <p className="text-muted-foreground">Order #{orderId.slice(-8)}</p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          disabled={refreshing}
        >
          {refreshing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className={`text-2xl ${getStatusColor(order.status)}`}>
            {getStatusText(order.status)}
          </CardTitle>
          <CardDescription>
            Last updated: {lastUpdate.toLocaleTimeString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Timeline */}
          <StatusTimeline status={order.status} />

          {/* Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="flex items-center space-x-3">
              <Package className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Order Total</p>
                <p className="text-lg font-bold">
                  {order.priceBreakdown.currency} {order.priceBreakdown.total}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Delivery Address</p>
                <p className="text-sm text-muted-foreground">
                  {order.stops[1]?.address.substring(0, 30)}...
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">ETA</p>
                <p className="text-sm text-muted-foreground">
                  {order.status === 'COMPLETED' ? 'Delivered' : '25-35 minutes'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Driver Card (if assigned) */}
      {driver && (
        <Card>
          <CardHeader>
            <CardTitle>Your Driver</CardTitle>
            <CardDescription>Contact your driver for delivery updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {driver.photo ? (
                  <img
                    src={driver.photo}
                    alt={driver.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {driver.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-lg">{driver.name}</p>
                  <p className="text-sm text-muted-foreground">{driver.plateNumber}</p>
                </div>
              </div>

              <Button onClick={handleCallDriver} size="lg">
                <Phone className="mr-2 h-4 w-4" />
                Call Driver
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map */}
      <Card>
        <CardHeader>
          <CardTitle>Live Tracking</CardTitle>
          <CardDescription>
            {driver?.location
              ? 'Follow your driver in real-time'
              : 'Map showing pickup and delivery locations'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <TrackingMap
            pickup={{
              lat: parseFloat(order.stops[0].coordinates.lat),
              lng: parseFloat(order.stops[0].coordinates.lng),
              address: order.stops[0].address,
            }}
            dropoff={{
              lat: parseFloat(order.stops[1].coordinates.lat),
              lng: parseFloat(order.stops[1].coordinates.lng),
              address: order.stops[1].address,
            }}
            driverLocation={
              driver?.location
                ? {
                    lat: parseFloat(driver.location.lat),
                    lng: parseFloat(driver.location.lng),
                  }
                : undefined
            }
            status={order.status}
          />
        </CardContent>
      </Card>

      {/* Lalamove Share Link */}
      {order.shareLink && (
        <Card>
          <CardHeader>
            <CardTitle>Track on Lalamove App</CardTitle>
            <CardDescription>
              You can also track your delivery directly in the Lalamove app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => window.open(order.shareLink, '_blank')}
              variant="outline"
              className="w-full"
            >
              Open in Lalamove App
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
