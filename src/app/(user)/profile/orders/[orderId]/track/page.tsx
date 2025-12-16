'use client';

/**
 * Firebase Order Tracking Page
 * /profile/orders/[orderId]/track
 * 
 * Shows real-time delivery tracking for Firebase orders
 * Polls for Lalamove updates and shows live driver location
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, RefreshCw, Phone, MapPin, Package, Clock, 
  ArrowLeft, ExternalLink, Truck, User, CheckCircle,
  AlertCircle, Timer
} from 'lucide-react';
import TrackingMap from '@/components/delivery/TrackingMap';
import StatusTimeline from '@/components/delivery/StatusTimeline';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FirestoreOrder,
  FirebaseOrdersService 
} from '@/lib/firebase/orders';

// Lalamove status type
type LalamoveStatus = 'ASSIGNING_DRIVER' | 'ON_GOING' | 'PICKED_UP' | 'COMPLETED' | 'CANCELED' | 'REJECTED' | 'EXPIRED';

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
};

// Alias for formatPrice
const formatPrice = formatCurrency;

// Map Firebase order status to display info
const getOrderStatusInfo = (status: FirestoreOrder['status']) => {
  const statusMap: Record<string, { label: string; color: string; icon: typeof Package }> = {
    pending_approval: { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-800', icon: Timer },
    approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    processing: { label: 'Processing', color: 'bg-purple-100 text-purple-800', icon: Package },
    ready_for_pickup: { label: 'Ready for Pickup', color: 'bg-teal-100 text-teal-800', icon: Package },
    shipped: { label: 'Out for Delivery', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: AlertCircle },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: AlertCircle },
    refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
  };
  return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: Package };
};

// Map Lalamove status to display text
const getLalamoveStatusText = (status: LalamoveStatus) => {
  const statusMap: Record<LalamoveStatus, string> = {
    'ASSIGNING_DRIVER': 'Finding your driver...',
    'ON_GOING': 'Driver on the way to pickup',
    'PICKED_UP': 'Package picked up - On the way!',
    'COMPLETED': 'Delivered successfully!',
    'CANCELED': 'Delivery canceled',
    'REJECTED': 'Delivery rejected',
    'EXPIRED': 'Delivery request expired',
  };
  return statusMap[status] || status;
};

export default function FirebaseOrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<FirestoreOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch order from Firebase
  const fetchOrder = useCallback(async (showRefreshing = false) => {
    if (!orderId || !user?.id) return;
    
    if (showRefreshing) setRefreshing(true);
    setError(null);

    try {
      const orderData = await FirebaseOrdersService.getOrder(orderId);
      
      if (!orderData) {
        setError('Order not found');
        return;
      }

      // Verify the order belongs to the user
      if (orderData.userId !== user.id) {
        setError('Order not found');
        return;
      }

      setOrder(orderData);
      setLastUpdate(new Date());

      // If order has Lalamove ID and is not completed, fetch latest tracking
      if (orderData.lalamoveOrderId && 
          orderData.lalamoveTracking?.status !== 'COMPLETED' &&
          orderData.lalamoveTracking?.status !== 'CANCELED') {
        await fetchLalamoveUpdates(orderData.lalamoveOrderId, orderId);
      }
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching order:', error);
      setError(error.message || 'Failed to load order');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId, user?.id]);

  // Fetch latest Lalamove tracking data
  const fetchLalamoveUpdates = async (lalamoveOrderId: string, firebaseOrderId: string) => {
    try {
      // Fetch order details from Lalamove
      const orderResponse = await fetch(`/api/lalamove/order?orderId=${lalamoveOrderId}`);
      const orderData = await orderResponse.json();

      if (orderData.success) {
        const lalamoveOrder = orderData.data;
        
        // Prepare tracking update with explicit type
        const trackingUpdate: {
          status?: string;
          driverId?: string;
          driverName?: string;
          driverPhone?: string;
          driverPlateNumber?: string;
          driverPhoto?: string;
          driverLocation?: { lat: number; lng: number; updatedAt?: string };
          pickupEta?: string;
          deliveryEta?: string;
        } = {
          status: lalamoveOrder.status,
        };

        // If driver assigned, fetch driver details
        if (lalamoveOrder.driverId) {
          try {
            const driverResponse = await fetch(`/api/lalamove/driver?orderId=${lalamoveOrderId}`);
            const driverData = await driverResponse.json();

            if (driverData.success) {
              const driver = driverData.data;
              trackingUpdate.driverId = driver.driverId;
              trackingUpdate.driverName = driver.name;
              trackingUpdate.driverPhone = driver.phone;
              trackingUpdate.driverPlateNumber = driver.plateNumber;
              trackingUpdate.driverPhoto = driver.photo;
              
              if (driver.location) {
                trackingUpdate.driverLocation = {
                  lat: parseFloat(driver.location.lat),
                  lng: parseFloat(driver.location.lng),
                  updatedAt: new Date().toISOString(),
                };
              }
            }
          } catch (driverErr) {
            console.log('Driver details not available (expected in sandbox)');
          }
        }

        // Update Firebase with latest tracking
        await FirebaseOrdersService.updateLalamoveTracking(firebaseOrderId, trackingUpdate);
      }
    } catch (err) {
      console.error('Error fetching Lalamove updates:', err);
    }
  };

  // Auth check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/profile/orders');
    }
  }, [authLoading, isAuthenticated, router]);

  // Initial load
  useEffect(() => {
    if (orderId && user?.id) {
      fetchOrder();
    }
  }, [orderId, user?.id, fetchOrder]);

  // Auto-refresh every 30 seconds for active deliveries
  useEffect(() => {
    if (!order || !order.lalamoveOrderId) return;
    
    const lalamoveStatus = order.lalamoveTracking?.status;
    if (lalamoveStatus === 'COMPLETED' || lalamoveStatus === 'CANCELED') {
      return; // Stop polling if delivery is complete
    }

    const interval = setInterval(() => {
      fetchOrder(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [order?.lalamoveOrderId, order?.lalamoveTracking?.status, fetchOrder]);

  const handleRefresh = () => fetchOrder(true);

  const handleCallDriver = () => {
    if (order?.lalamoveTracking?.driverPhone) {
      window.location.href = `tel:${order.lalamoveTracking.driverPhone}`;
    }
  };

  // Loading states
  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-[60vh]">
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
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/profile/order-history')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
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
        <Button onClick={() => router.push('/profile/order-history')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
      </div>
    );
  }

  const orderStatusInfo = getOrderStatusInfo(order.status);
  const StatusIcon = orderStatusInfo.icon;
  const tracking = order.lalamoveTracking;
  const hasActiveDelivery = order.lalamoveOrderId && tracking;
  const lalamoveStatus = tracking?.status as LalamoveStatus | undefined;

  return (
    <div className="container mx-auto py-6 px-4 md:py-10 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button 
            variant="ghost" 
            onClick={() => router.push('/profile/order-history')}
            className="mb-2 -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">Track Your Order</h1>
          <p className="text-muted-foreground">Order #{order.orderNumber}</p>
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

      {/* Order Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusIcon className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-xl">Order Status</CardTitle>
                <CardDescription>
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </CardDescription>
              </div>
            </div>
            <Badge className={orderStatusInfo.color}>
              {orderStatusInfo.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Order summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <Package className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Order Total</p>
                <p className="text-lg font-bold">
                  {formatCurrency(order.total)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Delivery Address</p>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {order.deliveryMethod === 'lalamove' 
                    ? order.deliveryAddress?.address 
                    : order.pickupLocation?.address || 'Pickup'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Delivery Method</p>
                <p className="text-sm text-muted-foreground">
                  {order.deliveryMethod === 'lalamove' ? 'Same-Day Delivery' : 'Pickup'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Tracking Section */}
      {hasActiveDelivery ? (
        <>
          {/* Lalamove Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Delivery Status
              </CardTitle>
              {lalamoveStatus && (
                <CardDescription className="text-base font-medium">
                  {getLalamoveStatusText(lalamoveStatus)}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {/* Status Timeline */}
              {lalamoveStatus && (
                <StatusTimeline currentStatus={lalamoveStatus as 'ASSIGNING_DRIVER' | 'ON_GOING' | 'PICKED_UP' | 'COMPLETED' | 'CANCELED'} />
              )}

              {/* ETAs */}
              {(tracking?.pickupEta || tracking?.deliveryEta) && (
                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                  {tracking.pickupEta && (
                    <div>
                      <p className="text-sm text-muted-foreground">Pickup ETA</p>
                      <p className="font-medium">{tracking.pickupEta}</p>
                    </div>
                  )}
                  {tracking.deliveryEta && (
                    <div>
                      <p className="text-sm text-muted-foreground">Delivery ETA</p>
                      <p className="font-medium">{tracking.deliveryEta}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Driver Card */}
          {tracking?.driverId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Your Driver
                </CardTitle>
                <CardDescription>Contact your driver for delivery updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {tracking.driverPhoto ? (
                      <img
                        src={tracking.driverPhoto}
                        alt={tracking.driverName || 'Driver'}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">
                          {tracking.driverName?.charAt(0) || 'D'}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-lg">{tracking.driverName || 'Your Driver'}</p>
                      <p className="text-sm text-muted-foreground">{tracking.driverPlateNumber}</p>
                    </div>
                  </div>

                  {tracking.driverPhone && (
                    <Button onClick={handleCallDriver} size="lg">
                      <Phone className="mr-2 h-4 w-4" />
                      Call Driver
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Live Map */}
          <Card>
            <CardHeader>
              <CardTitle>Live Tracking</CardTitle>
              <CardDescription>
                {tracking?.driverLocation
                  ? 'Follow your driver in real-time'
                  : 'Map showing pickup and delivery locations'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <TrackingMap
                pickup={{
                  lat: order.pickupLocation ? 14.5995 : 14.5995, // Default Manila for now
                  lng: order.pickupLocation ? 120.9842 : 120.9842,
                  address: order.pickupLocation?.address || 'Pickup Location',
                }}
                dropoff={{
                  lat: order.deliveryAddress?.lat || 14.5995,
                  lng: order.deliveryAddress?.lng || 120.9842,
                  address: order.deliveryAddress?.address || 'Delivery Location',
                }}
                driverLocation={
                  tracking?.driverLocation
                    ? {
                        lat: tracking.driverLocation.lat,
                        lng: tracking.driverLocation.lng,
                      }
                    : undefined
                }
                status={lalamoveStatus || 'ASSIGNING_DRIVER'}
              />
            </CardContent>
          </Card>

          {/* Lalamove Share Link */}
          {tracking?.shareLink && (
            <Card>
              <CardHeader>
                <CardTitle>Track on Lalamove</CardTitle>
                <CardDescription>
                  You can also track your delivery directly in the Lalamove app
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => window.open(tracking.shareLink, '_blank')}
                  variant="outline"
                  className="w-full"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in Lalamove App
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        /* No active delivery yet */
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              {order.deliveryMethod === 'lalamove' ? (
                <>
                  <Truck className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold">Delivery Not Yet Started</h3>
                    <p className="text-muted-foreground">
                      {order.status === 'pending_approval' 
                        ? 'Your order is waiting for seller approval. Delivery will be arranged once approved.'
                        : order.status === 'approved'
                        ? 'Your order has been approved. Delivery will be arranged shortly.'
                        : 'Delivery tracking will appear here once the driver is assigned.'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <MapPin className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold">Pickup Order</h3>
                    <p className="text-muted-foreground">
                      This is a pickup order. You will receive a notification when your order is ready for pickup.
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
          <CardDescription>{order.items.length} item(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={item.productId || index} className="flex items-center space-x-4">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Qty: {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>
                <p className="font-medium">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
            
            <Separator className="my-4" />
            
            {/* Pricing breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>{formatPrice(order.deliveryFee)}</span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Need Help */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-medium">Need help with your order?</p>
              <p className="text-sm text-muted-foreground">Our support team is here to help</p>
            </div>
            <Button variant="outline" onClick={() => router.push('/contact')}>
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
