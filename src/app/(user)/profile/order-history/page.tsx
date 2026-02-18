/**
 * Order History Page (Firebase-powered)
 * 
 * Displays user's order history with real-time updates from Firebase.
 */

"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  MapPin,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useUserFirebaseOrders, useFirebaseOrder } from "@/hooks/useFirebaseOrders";
import { type FirestoreOrder, type OrderStatus } from "@/lib/firebase/orders";
import { cn } from "@/lib/utils";
import Image from "next/image";

const PLACEHOLDER_IMAGE = "/mushroom-placeholder.png";

// Status configuration
const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode; tab: string }> = {
  pending_approval: {
    label: "Pending Approval",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: <Clock className="h-4 w-4" />,
    tab: "pending",
  },
  approved: {
    label: "Approved",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: <CheckCircle className="h-4 w-4" />,
    tab: "pending",
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: <XCircle className="h-4 w-4" />,
    tab: "cancelled",
  },
  processing: {
    label: "Processing",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: <Package className="h-4 w-4" />,
    tab: "active",
  },
  ready_for_pickup: {
    label: "Ready for Pickup",
    color: "bg-cyan-100 text-cyan-800 border-cyan-200",
    icon: <MapPin className="h-4 w-4" />,
    tab: "active",
  },
  shipped: {
    label: "Shipped",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: <Truck className="h-4 w-4" />,
    tab: "active",
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: <CheckCircle className="h-4 w-4" />,
    tab: "completed",
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: <CheckCircle className="h-4 w-4" />,
    tab: "completed",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: <XCircle className="h-4 w-4" />,
    tab: "cancelled",
  },
};

type TabType = "all" | "pending" | "active" | "completed" | "cancelled";

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
};

// Format date
const formatDate = (timestamp: unknown) => {
  if (!timestamp) return "N/A";
  const ts = timestamp as { toDate?: () => Date };
  const date = ts.toDate ? ts.toDate() : new Date(timestamp as string);
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

export default function OrderHistoryPage() {
  const { user, isAuthenticated } = useAuth();
  const { orders, loading, error } = useUserFirebaseOrders(user?.id || null);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Calculate tab counts
  const tabCounts = useMemo(() => {
    const counts = { all: 0, pending: 0, active: 0, completed: 0, cancelled: 0 };
    orders.forEach((order) => {
      counts.all++;
      const tab = STATUS_CONFIG[order.status]?.tab || "all";
      if (tab in counts) {
        counts[tab as keyof typeof counts]++;
      }
    });
    return counts;
  }, [orders]);

  // Filter orders by tab
  const filteredOrders = useMemo(() => {
    if (activeTab === "all") return orders;
    return orders.filter((order) => STATUS_CONFIG[order.status]?.tab === activeTab);
  }, [orders, activeTab]);

  if (!isAuthenticated) {
    return (
      <Card className="bg-card">
        <CardContent className="p-6 sm:p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Please log in to view your orders
            </h3>
            <p className="text-muted-foreground">
              Sign in to see your order history and track deliveries.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading && orders.length === 0) {
    return (
      <Card className="bg-card">
        <CardContent className="p-6 sm:p-8 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your orders...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card">
        <CardContent className="p-6 sm:p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Package className="h-12 w-12 text-destructive/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Failed to load orders
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center flex-wrap justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-5 w-5 text-foreground" />
                <h2 className="text-xl font-bold text-foreground">Order History</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Track your orders and view order details
              </p>
            </div>
            <div className="flex items-center gap-2 px-2 py-1 mt-3 rounded-full bg-green-50 border border-green-200">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-green-700">Live Updates</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
            {(["all", "pending", "active", "completed", "cancelled"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-3 font-medium transition-colors relative whitespace-nowrap",
                  activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab === "all" && "All Orders"}
                {tab === "pending" && "Pending"}
                {tab === "active" && "Active"}
                {tab === "completed" && "Completed"}
                {tab === "cancelled" && "Cancelled"}
                {tabCounts[tab] > 0 && (
                  <span className={cn(
                    "ml-2 px-1.5 py-0.5 text-xs rounded-full",
                    activeTab === tab
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {tabCounts[tab]}
                  </span>
                )}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Orders List */}
          {filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onViewDetails={() => setSelectedOrderId(order.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">No orders found</h3>
              <p className="text-muted-foreground text-sm">
                {activeTab === "all"
                  ? "You haven't placed any orders yet."
                  : `You don't have any ${activeTab} orders.`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      {selectedOrderId && (
        <OrderDetailDialog
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </>
  );
}

// Order Card Component
function OrderCard({
  order,
  onViewDetails,
}: {
  order: FirestoreOrder;
  onViewDetails: () => void;
}) {
  const statusConfig = STATUS_CONFIG[order.status];

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="font-mono font-semibold text-sm">{order.orderNumber}</span>
          <Badge className={cn("border text-xs", statusConfig.color)}>
            {statusConfig.icon}
            <span className="ml-1">{statusConfig.label}</span>
          </Badge>
        </div>
        <span className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</span>
      </div>

      {/* Items Preview */}
      <div className="flex items-center gap-3 mb-4">
        {order.items.slice(0, 3).map((item, idx) => (
          <div key={idx} className="relative">
            <div className="w-14 h-14 bg-muted/30 rounded-lg overflow-hidden">
              <Image
                src={item.image || PLACEHOLDER_IMAGE}
                alt={item.name}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            </div>
            {item.quantity > 1 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {item.quantity}
              </span>
            )}
          </div>
        ))}
        {order.items.length > 3 && (
          <div className="w-14 h-14 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
            <span className="text-sm text-muted-foreground">+{order.items.length - 3}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground">
            {order.items.length} item{order.items.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
        {order.deliveryMethod === "pickup" ? (
          <>
            <MapPin className="h-4 w-4" />
            <span>Pickup at {order.pickupLocation?.name || "MASH Location"}</span>
          </>
        ) : (
          <>
            <Truck className="h-4 w-4 text-green-600" />
            <span>Lalamove Delivery</span>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div>
          <span className="text-sm text-muted-foreground">Total: </span>
          <span className="font-bold text-lg">{formatCurrency(order.total)}</span>
        </div>
        <Button variant="outline" size="sm" onClick={onViewDetails}>
          View Details
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// Order Detail Dialog Component
function OrderDetailDialog({
  orderId,
  onClose,
}: {
  orderId: string;
  onClose: () => void;
}) {
  const { order, loading, error } = useFirebaseOrder(orderId);

  if (loading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading Order Details</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !order) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-destructive">Failed to load order details</p>
            <Button variant="outline" onClick={onClose} className="mt-4">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{order.orderNumber}</span>
            <Badge className={cn("border", statusConfig.color)}>
              {statusConfig.label}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Placed on {formatDate(order.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Timeline */}
          <div>
            <h4 className="font-semibold mb-3">Order Status</h4>
            <div className="space-y-3">
              {order.statusHistory.map((entry, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className={cn(
                    "w-3 h-3 mt-1 rounded-full flex-shrink-0",
                    idx === order.statusHistory.length - 1
                      ? "bg-primary"
                      : "bg-muted-foreground/30"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-medium text-sm",
                      idx === order.statusHistory.length - 1 && "text-primary"
                    )}>
                      {STATUS_CONFIG[entry.status]?.label || entry.status}
                    </p>
                    {entry.note && (
                      <p className="text-xs text-muted-foreground">{entry.note}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDate(entry.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Info */}
          <div>
            <h4 className="font-semibold mb-2">Delivery</h4>
            <div className="bg-muted rounded-lg p-3 text-sm">
              {order.deliveryMethod === "pickup" ? (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Pickup</p>
                    <p className="text-muted-foreground">
                      {order.pickupLocation?.name} - {order.pickupLocation?.address}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium">Lalamove Delivery</p>
                    <p className="text-muted-foreground">
                      {order.deliveryAddress?.address}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h4 className="font-semibold mb-2">Items ({order.items.length})</h4>
            <div className="border rounded-lg divide-y">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3">
                  <div className="w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={item.image || PLACEHOLDER_IMAGE}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(item.price)} x {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-sm">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>{formatCurrency(order.deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-2 border-t">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(order.total)}</span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="text-sm">
            <span className="text-muted-foreground">Payment Method: </span>
            <span className="font-medium">
              {order.paymentMethod === "cod" && "Cash on Delivery"}
              {order.paymentMethod === "gcash" && "GCash"}
              {order.paymentMethod === "card" && "Credit/Debit Card"}
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
