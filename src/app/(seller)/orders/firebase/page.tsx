/**
 * Firebase Orders Dashboard
 * 
 * Real-time order management for sellers/admins.
 * Uses Firebase Firestore for order data.
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  Eye,
  Check,
  X,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useFirebaseOrders } from "@/hooks/useFirebaseOrders";
import { type FirestoreOrder, type OrderStatus } from "@/lib/firebase/orders";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";

const PLACEHOLDER_IMAGE = "/mushroom-placeholder.png";

// Status configuration
const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending_approval: {
    label: "Pending Approval",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: <Clock className="h-4 w-4" />,
  },
  approved: {
    label: "Approved",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: <XCircle className="h-4 w-4" />,
  },
  processing: {
    label: "Processing",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: <Package className="h-4 w-4" />,
  },
  ready_for_pickup: {
    label: "Ready for Pickup",
    color: "bg-cyan-100 text-cyan-800 border-cyan-200",
    icon: <MapPin className="h-4 w-4" />,
  },
  shipped: {
    label: "Shipped",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: <Truck className="h-4 w-4" />,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: <XCircle className="h-4 w-4" />,
  },
};

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
};

// Format date
const formatDate = (timestamp: any) => {
  if (!timestamp) return "N/A";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

export default function FirebaseOrdersPage() {
  const { user } = useAuth();
  const {
    orders,
    pendingOrders,
    stats,
    loading,
    error,
    approveOrder,
    rejectOrder,
    updateOrderStatus,
    refreshOrders,
    searchOrders,
  } = useFirebaseOrders({ realtime: true });

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<FirestoreOrder | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  // Filter orders
  const filteredOrders = useMemo(() => {
    let result = orders;

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }

    // Apply search
    if (searchQuery.trim()) {
      result = searchOrders(searchQuery);
    }

    return result;
  }, [orders, statusFilter, searchQuery, searchOrders]);

  // Handle approve
  const handleApprove = async (order: FirestoreOrder) => {
    if (!user?.id) {
      toast.error("You must be logged in to approve orders");
      return;
    }

    setProcessingAction(order.id);
    const success = await approveOrder(order.id, user.id);
    setProcessingAction(null);

    if (success) {
      toast.success(`Order ${order.orderNumber} approved!`);
    } else {
      toast.error("Failed to approve order");
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (!selectedOrder || !user?.id) return;

    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setProcessingAction(selectedOrder.id);
    const success = await rejectOrder(selectedOrder.id, user.id, rejectReason);
    setProcessingAction(null);

    if (success) {
      toast.success(`Order ${selectedOrder.orderNumber} rejected`);
      setShowRejectDialog(false);
      setRejectReason("");
      setSelectedOrder(null);
    } else {
      toast.error("Failed to reject order");
    }
  };

  // Handle status update
  const handleStatusUpdate = async (order: FirestoreOrder, newStatus: OrderStatus) => {
    if (!user?.id) return;

    setProcessingAction(order.id);
    const success = await updateOrderStatus(order.id, newStatus, user.id);
    setProcessingAction(null);

    if (success) {
      toast.success(`Order status updated to ${STATUS_CONFIG[newStatus].label}`);
    } else {
      toast.error("Failed to update order status");
    }
  };

  // Open reject dialog
  const openRejectDialog = (order: FirestoreOrder) => {
    setSelectedOrder(order);
    setShowRejectDialog(true);
  };

  // Get next status options
  const getNextStatusOptions = (currentStatus: OrderStatus): OrderStatus[] => {
    const statusFlow: Record<OrderStatus, OrderStatus[]> = {
      pending_approval: ["approved", "rejected"],
      approved: ["processing", "cancelled"],
      rejected: [],
      processing: ["ready_for_pickup", "shipped", "cancelled"],
      ready_for_pickup: ["completed", "cancelled"],
      shipped: ["delivered", "cancelled"],
      delivered: ["completed"],
      completed: [],
      cancelled: [],
    };
    return statusFlow[currentStatus] || [];
  };

  if (loading && orders.length === 0) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Firebase Orders</h1>
          <p className="text-muted-foreground">
            Manage customer orders in real-time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-200">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-700">Live Updates</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refreshOrders()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={cn(stats.pendingApproval > 0 && "ring-2 ring-yellow-400")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", stats.pendingApproval > 0 && "text-yellow-600")}>
              {stats.pendingApproval}
            </div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Package className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processing}</div>
            <p className="text-xs text-muted-foreground">
              {stats.readyForPickup} ready, {stats.shipped} shipped
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Orders</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayOrders}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.todayRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {stats.totalOrders - stats.cancelled - stats.rejected} orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Orders Alert */}
      {pendingOrders.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <p className="font-medium text-yellow-800">
                  {pendingOrders.length} order{pendingOrders.length > 1 ? "s" : ""} waiting for approval
                </p>
                <p className="text-sm text-yellow-700">
                  Review and approve or reject pending orders
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-yellow-400 text-yellow-800 hover:bg-yellow-100"
                onClick={() => setStatusFilter("pending_approval")}
              >
                View Pending
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders, customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as OrderStatus | "all")}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders ({stats.totalOrders})</SelectItem>
                <SelectItem value="pending_approval">
                  Pending ({stats.pendingApproval})
                </SelectItem>
                <SelectItem value="approved">Approved ({stats.approved})</SelectItem>
                <SelectItem value="processing">Processing ({stats.processing})</SelectItem>
                <SelectItem value="ready_for_pickup">
                  Ready for Pickup ({stats.readyForPickup})
                </SelectItem>
                <SelectItem value="shipped">Shipped ({stats.shipped})</SelectItem>
                <SelectItem value="delivered">Delivered ({stats.delivered})</SelectItem>
                <SelectItem value="completed">Completed ({stats.completed})</SelectItem>
                <SelectItem value="cancelled">Cancelled ({stats.cancelled})</SelectItem>
                <SelectItem value="rejected">Rejected ({stats.rejected})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No orders found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search query"
                  : statusFilter !== "all"
                  ? `No ${STATUS_CONFIG[statusFilter]?.label.toLowerCase()} orders`
                  : "Orders will appear here when customers place them"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onApprove={() => handleApprove(order)}
              onReject={() => openRejectDialog(order)}
              onStatusUpdate={(status) => handleStatusUpdate(order, status)}
              onViewDetails={() => setSelectedOrder(order)}
              isProcessing={processingAction === order.id}
              getNextStatusOptions={getNextStatusOptions}
            />
          ))
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Order</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting order{" "}
              <span className="font-semibold">{selectedOrder?.orderNumber}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || processingAction === selectedOrder?.id}
            >
              {processingAction === selectedOrder?.id ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Reject Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      {selectedOrder && !showRejectDialog && (
        <OrderDetailDialog
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onApprove={() => handleApprove(selectedOrder)}
          onReject={() => openRejectDialog(selectedOrder)}
          onStatusUpdate={(status) => handleStatusUpdate(selectedOrder, status)}
          isProcessing={processingAction === selectedOrder.id}
          getNextStatusOptions={getNextStatusOptions}
        />
      )}
    </div>
  );
}

// Order Card Component
interface OrderCardProps {
  order: FirestoreOrder;
  onApprove: () => void;
  onReject: () => void;
  onStatusUpdate: (status: OrderStatus) => void;
  onViewDetails: () => void;
  isProcessing: boolean;
  getNextStatusOptions: (status: OrderStatus) => OrderStatus[];
}

function OrderCard({
  order,
  onApprove,
  onReject,
  onStatusUpdate,
  onViewDetails,
  isProcessing,
  getNextStatusOptions,
}: OrderCardProps) {
  const statusConfig = STATUS_CONFIG[order.status];
  const nextOptions = getNextStatusOptions(order.status);

  return (
    <Card className={cn(order.status === "pending_approval" && "ring-2 ring-yellow-300")}>
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Order Info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono font-semibold">{order.orderNumber}</span>
              <Badge className={cn("border", statusConfig.color)}>
                {statusConfig.icon}
                <span className="ml-1">{statusConfig.label}</span>
              </Badge>
              {order.deliveryMethod === "lalamove" && (
                <Badge variant="outline" className="border-green-300 text-green-700">
                  <Truck className="h-3 w-3 mr-1" />
                  Lalamove
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{order.userName}</span>
              <span>•</span>
              <span>{order.items.length} item{order.items.length > 1 ? "s" : ""}</span>
              <span>•</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              {order.items.slice(0, 3).map((item, idx) => (
                <div
                  key={idx}
                  className="w-10 h-10 rounded border overflow-hidden bg-muted"
                >
                  <Image
                    src={item.image || PLACEHOLDER_IMAGE}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {order.items.length > 3 && (
                <div className="w-10 h-10 rounded border flex items-center justify-center bg-muted text-xs font-medium">
                  +{order.items.length - 3}
                </div>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="text-right">
            <div className="text-2xl font-bold">{formatCurrency(order.total)}</div>
            {order.deliveryFee > 0 && (
              <div className="text-xs text-muted-foreground">
                incl. {formatCurrency(order.deliveryFee)} delivery
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 lg:ml-4">
            {order.status === "pending_approval" ? (
              <>
                <Button
                  size="sm"
                  onClick={onApprove}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  <span className="ml-1 hidden sm:inline">Approve</span>
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={onReject}
                  disabled={isProcessing}
                >
                  <X className="h-4 w-4" />
                  <span className="ml-1 hidden sm:inline">Reject</span>
                </Button>
              </>
            ) : nextOptions.length > 0 ? (
              <Select onValueChange={(value) => onStatusUpdate(value as OrderStatus)}>
                <SelectTrigger className="w-[140px]" disabled={isProcessing}>
                  <span className="text-sm">Update Status</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </SelectTrigger>
                <SelectContent>
                  {nextOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {STATUS_CONFIG[status].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
            <Button size="sm" variant="outline" onClick={onViewDetails}>
              <Eye className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">View</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Order Detail Dialog Component
interface OrderDetailDialogProps {
  order: FirestoreOrder;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onStatusUpdate: (status: OrderStatus) => void;
  isProcessing: boolean;
  getNextStatusOptions: (status: OrderStatus) => OrderStatus[];
}

function OrderDetailDialog({
  order,
  onClose,
  onApprove,
  onReject,
  onStatusUpdate,
  isProcessing,
  getNextStatusOptions,
}: OrderDetailDialogProps) {
  const statusConfig = STATUS_CONFIG[order.status];
  const nextOptions = getNextStatusOptions(order.status);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
          {/* Customer Info */}
          <div>
            <h4 className="font-semibold mb-2">Customer Information</h4>
            <div className="bg-muted rounded-lg p-4 space-y-1 text-sm">
              <p><span className="text-muted-foreground">Name:</span> {order.userName}</p>
              <p><span className="text-muted-foreground">Email:</span> {order.userEmail}</p>
              <p><span className="text-muted-foreground">Phone:</span> {order.userPhone}</p>
            </div>
          </div>

          {/* Delivery Info */}
          <div>
            <h4 className="font-semibold mb-2">Delivery Method</h4>
            <div className="bg-muted rounded-lg p-4 space-y-1 text-sm">
              {order.deliveryMethod === "pickup" ? (
                <>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Pickup</span>
                  </p>
                  {order.pickupLocation && (
                    <p className="text-muted-foreground ml-6">
                      {order.pickupLocation.name} - {order.pickupLocation.address}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Lalamove Delivery</span>
                  </p>
                  {order.deliveryAddress && (
                    <p className="text-muted-foreground ml-6">
                      {order.deliveryAddress.address}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h4 className="font-semibold mb-2">Order Items ({order.items.length})</h4>
            <div className="border rounded-lg divide-y">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4">
                  <div className="w-16 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={item.image || PLACEHOLDER_IMAGE}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    {item.grower && (
                      <p className="text-sm text-muted-foreground">by @{item.grower}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <div className="font-semibold">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h4 className="font-semibold mb-2">Order Summary</h4>
            <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (12%)</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>{formatCurrency(order.deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Status History */}
          <div>
            <h4 className="font-semibold mb-2">Status History</h4>
            <div className="space-y-2">
              {order.statusHistory.map((entry, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 text-sm"
                >
                  <div className={cn("w-2 h-2 mt-1.5 rounded-full", 
                    STATUS_CONFIG[entry.status]?.color.split(" ")[0] || "bg-gray-300"
                  )} />
                  <div className="flex-1">
                    <p className="font-medium">{STATUS_CONFIG[entry.status]?.label || entry.status}</p>
                    {entry.note && (
                      <p className="text-muted-foreground">{entry.note}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDate(entry.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {order.status === "pending_approval" && (
            <>
              <Button
                onClick={onApprove}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Approve Order
              </Button>
              <Button
                variant="destructive"
                onClick={onReject}
                disabled={isProcessing}
              >
                <X className="h-4 w-4 mr-2" />
                Reject Order
              </Button>
            </>
          )}
          {nextOptions.length > 0 && order.status !== "pending_approval" && (
            <Select onValueChange={(value) => onStatusUpdate(value as OrderStatus)}>
              <SelectTrigger className="w-[180px]" disabled={isProcessing}>
                <span>Update Status</span>
              </SelectTrigger>
              <SelectContent>
                {nextOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {STATUS_CONFIG[status].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
