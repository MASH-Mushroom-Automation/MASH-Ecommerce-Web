/**
 * OrderCard Component
 * Displays order information with status badges and action buttons
 */

"use client";

import React, { useState } from "react";
import { Package, MapPin, CreditCard, Truck, Calendar, User, Phone, Mail, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Order } from "@/hooks/useSanityOrders";
import { OrdersApi } from "@/lib/api/orders";
import { OrderRejectionModal } from "./OrderRejectionModal";

interface OrderCardProps {
  order: Order;
  variant?: "default" | "compact";
  onViewDetails?: (orderId: string) => void;
  onUpdateStatus?: (orderId: string) => void;
  onAddTracking?: (orderId: string) => void;
  onPrintInvoice?: (orderId: string) => void;
  onOrderUpdated?: () => void; // Callback to refresh order list
  className?: string;
}

// Status badge color mapping
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-500";
    case "confirmed":
    case "to_ship":
    case "approved":
      return "bg-blue-500";
    case "processing":
      return "bg-purple-500";
    case "shipped":
      return "bg-indigo-500";
    case "delivered":
      return "bg-green-500";
    case "cancelled":
      return "bg-red-500";
    case "returned":
      return "bg-orange-500";
    default:
      return "bg-gray-500";
  }
};

// Payment status badge color
const getPaymentColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
      return "bg-green-500";
    case "pending":
      return "bg-yellow-500";
    case "failed":
      return "bg-red-500";
    case "refunded":
      return "bg-purple-500";
    default:
      return "bg-gray-500";
  }
};

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format currency
const formatCurrency = (amount: number) => {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
};

/**
 * Full Order Card
 */
export function OrderCard({
  order,
  variant = "default",
  onViewDetails,
  onUpdateStatus,
  onAddTracking,
  onPrintInvoice,
  onOrderUpdated,
  className,
}: OrderCardProps) {
  // State for approval/rejection
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [localStatus, setLocalStatus] = useState(order.status);

  if (variant === "compact") {
    return <CompactOrderCard order={order} onViewDetails={onViewDetails} className={className} />;
  }

  // Check if order is pending
  const isPending = localStatus.toLowerCase() === "pending";

  // Handle approve action
  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const response = await OrdersApi.updateOrderStatus(order.id, "TO_SHIP");
      
      if (response.success) {
        toast.success("Order Approved!", {
          description: `Order ${order.orderNumber} has been approved and is ready to ship.`,
        });
        setLocalStatus("TO_SHIP");
        onOrderUpdated?.(); // Refresh the order list
      } else {
        toast.error("Failed to approve order", {
          description: response.message || "Please try again.",
        });
      }
    } catch (error) {
      console.error("Error approving order:", error);
      toast.error("Error", {
        description: "Failed to approve order. Please try again.",
      });
    } finally {
      setIsApproving(false);
    }
  };

  // Handle reject action
  const handleRejectClick = () => {
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async (reason: string) => {
    setIsRejecting(true);
    try {
      const response = await OrdersApi.updateOrderStatus(order.id, "CANCELLED", reason);
      
      if (response.success) {
        toast.success("Order Cancelled", {
          description: `Order ${order.orderNumber} has been cancelled. Customer will be notified.`,
        });
        setLocalStatus("CANCELLED");
        setShowRejectModal(false);
        onOrderUpdated?.(); // Refresh the order list
      } else {
        toast.error("Failed to cancel order", {
          description: response.message || "Please try again.",
        });
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Error", {
        description: "Failed to cancel order. Please try again.",
      });
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-muted/50 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              {order.orderNumber}
              {order.isPriority && <Badge variant="destructive">⭐ Priority</Badge>}
            </CardTitle>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(order.orderDate)}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge className={cn("text-white", getStatusColor(localStatus))}>{localStatus.toUpperCase()}</Badge>
            <Badge className={cn("text-white", getPaymentColor(order.paymentStatus))}>
              {order.paymentStatus.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Customer Information */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <User className="h-4 w-4" />
            Customer Details
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm pl-6">
            <div>
              <span className="text-muted-foreground">Name:</span> {order.customerName}
            </div>
            <div className="flex items-center gap-1">
              <Mail className="h-3 w-3 text-muted-foreground" />
              {order.customerEmail}
            </div>
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3 text-muted-foreground" />
              {order.customerPhone}
            </div>
          </div>
        </div>

        <Separator />

        {/* Order Items */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Order Items ({order.items.length})</h4>
          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50">
                <div className="flex items-center gap-3">
                  {item.product.image && (
                    <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded object-cover" />
                  )}
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    {item.variant && <p className="text-xs text-muted-foreground">{item.variant.variantName}</p>}
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                  {item.discount > 0 && (
                    <p className="text-xs text-green-600">-{formatCurrency(item.discount * item.quantity)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Order Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {order.shippingFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping Fee:</span>
              <span>{formatCurrency(order.shippingFee)}</span>
            </div>
          )}
          {order.tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax:</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
          )}
          {order.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount:</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-base font-bold">
            <span>Total:</span>
            <span className="text-[#6A994E]">{formatCurrency(order.total)}</span>
          </div>
        </div>

        <Separator />

        {/* Shipping Address */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Shipping Address
          </h4>
          <div className="text-sm pl-6 text-muted-foreground">
            <p>{order.shippingAddress.fullAddress}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.province}
            </p>
            {order.shippingAddress.postalCode && <p>{order.shippingAddress.postalCode}</p>}
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>

        {/* Payment Information */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Information
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm pl-6">
            <div>
              <span className="text-muted-foreground">Method:</span> {order.paymentMethod.toUpperCase()}
            </div>
            {order.paymentReference && (
              <div>
                <span className="text-muted-foreground">Reference:</span> {order.paymentReference}
              </div>
            )}
          </div>
        </div>

        {/* Tracking Information */}
        {order.trackingNumber && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Tracking Information
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm pl-6">
              <div>
                <span className="text-muted-foreground">Carrier:</span> {order.carrier}
              </div>
              <div>
                <span className="text-muted-foreground">Tracking:</span> {order.trackingNumber}
              </div>
              {order.estimatedDelivery && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Est. Delivery:</span>{" "}
                  {new Date(order.estimatedDelivery).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Customer Notes */}
        {order.customerNotes && (
          <div className="space-y-2 p-3 rounded-md bg-blue-50 border border-blue-200">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              Customer Notes
            </h4>
            <p className="text-sm text-muted-foreground">{order.customerNotes}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          {/* Approve/Reject Buttons (Only for PENDING orders) */}
          {isPending && (
            <div className="flex gap-2">
              <Button
                onClick={handleApprove}
                disabled={isApproving || isRejecting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {isApproving ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept Order
                  </>
                )}
              </Button>
              <Button
                onClick={handleRejectClick}
                disabled={isApproving || isRejecting}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Decline Order
              </Button>
            </div>
          )}

          {/* Other Action Buttons */}
          <div className="flex gap-2">
            {onViewDetails && (
              <Button variant="outline" onClick={() => onViewDetails(order.id)} className="flex-1">
                View Details
              </Button>
            )}
            {onUpdateStatus && !isPending && (
              <Button variant="default" onClick={() => onUpdateStatus(order.id)} className="flex-1 bg-[#6A994E]">
                Update Status
              </Button>
            )}
            {onAddTracking && order.status === "shipped" && !order.trackingNumber && (
              <Button variant="outline" onClick={() => onAddTracking(order.id)}>
                Add Tracking
              </Button>
            )}
            {onPrintInvoice && (
              <Button variant="ghost" onClick={() => onPrintInvoice(order.id)}>
                Print Invoice
              </Button>
            )}
          </div>
        </div>
      </CardContent>

      {/* Rejection Modal */}
      <OrderRejectionModal
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleRejectConfirm}
        orderNumber={order.orderNumber}
        loading={isRejecting}
      />
    </Card>
  );
}

/**
 * Compact Order Card
 */
function CompactOrderCard({
  order,
  onViewDetails,
  className,
}: {
  order: Order;
  onViewDetails?: (orderId: string) => void;
  className?: string;
}) {
  return (
    <Card
      className={cn("hover:shadow-md transition-shadow cursor-pointer", className)}
      onClick={() => onViewDetails?.(order.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm">{order.orderNumber}</p>
              {order.isPriority && <Badge variant="destructive" className="text-xs">⭐</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{order.customerName}</p>
            <p className="text-xs text-muted-foreground">{formatDate(order.orderDate)}</p>
          </div>
          <div className="text-right space-y-2">
            <p className="font-bold text-[#6A994E]">{formatCurrency(order.total)}</p>
            <div className="flex gap-1">
              <Badge className={cn("text-xs text-white", getStatusColor(order.status))}>{order.status}</Badge>
              <Badge className={cn("text-xs text-white", getPaymentColor(order.paymentStatus))}>
                {order.paymentStatus}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Order List Component
 */
export function OrderList({
  orders,
  variant = "default",
  onViewDetails,
  onUpdateStatus,
  onAddTracking,
  onPrintInvoice,
  onOrderUpdated,
  className,
}: {
  orders: Order[];
  variant?: "default" | "compact";
  onViewDetails?: (orderId: string) => void;
  onUpdateStatus?: (orderId: string) => void;
  onAddTracking?: (orderId: string) => void;
  onPrintInvoice?: (orderId: string) => void;
  onOrderUpdated?: () => void;
  className?: string;
}) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          There are no orders matching your current filters. Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          variant={variant}
          onViewDetails={onViewDetails}
          onUpdateStatus={onUpdateStatus}
          onAddTracking={onAddTracking}
          onPrintInvoice={onPrintInvoice}
          onOrderUpdated={onOrderUpdated}
        />
      ))}
    </div>
  );
}
