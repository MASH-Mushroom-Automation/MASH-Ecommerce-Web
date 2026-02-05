"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Truck,
  MapPin,
  Search,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { useFirebaseOrders } from "@/hooks/useFirebaseOrders";
import { FirestoreOrder, OrderStatus } from "@/lib/firebase/orders";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { OrderRejectionModal } from "@/components/orders/OrderRejectionModal";

const PLACEHOLDER_IMAGE = "/mushroom-placeholder.png";

// Status configuration
const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    icon: any;
  }
> = {
  pending_approval: {
    label: "Pending Approval",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50 border-yellow-200",
    icon: AlertCircle,
  },
  approved: {
    label: "Approved",
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "text-red-700",
    bgColor: "bg-red-50 border-red-200",
    icon: XCircle,
  },
  processing: {
    label: "Processing",
    color: "text-purple-700",
    bgColor: "bg-purple-50 border-purple-200",
    icon: Package,
  },
  ready_for_pickup: {
    label: "Ready for Pickup",
    color: "text-cyan-700",
    bgColor: "bg-cyan-50 border-cyan-200",
    icon: MapPin,
  },
  shipped: {
    label: "Shipped",
    color: "text-indigo-700",
    bgColor: "bg-indigo-50 border-indigo-200",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "text-green-700",
    bgColor: "bg-green-50 border-green-200",
    icon: CheckCircle,
  },
  completed: {
    label: "Completed",
    color: "text-gray-700",
    bgColor: "bg-gray-50 border-gray-200",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-700",
    bgColor: "bg-red-50 border-red-200",
    icon: XCircle,
  },
};

export default function SellerOrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [actioningOrderId, setActioningOrderId] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [orderToReject, setOrderToReject] = useState<FirestoreOrder | null>(
    null,
  );

  // Fetch Firebase orders
  const { orders, stats, loading, error, approveOrder, rejectOrder } =
    useFirebaseOrders({
      statusFilter,
      realtime: true,
    });

  // Filter orders by search query
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;

    const query = searchQuery.toLowerCase();
    return orders.filter(
      (order) =>
        order.id.toLowerCase().includes(query) ||
        order.userEmail?.toLowerCase().includes(query) ||
        order.userName?.toLowerCase().includes(query) ||
        order.userPhone?.includes(query),
    );
  }, [orders, searchQuery]);

  const handleApproveOrder = async (orderId: string) => {
    setActioningOrderId(orderId);
    try {
      const success = await approveOrder(orderId, user?.id || "seller-admin");
      if (success) {
        toast.success("Order approved successfully");
      } else {
        toast.error("Failed to approve order");
      }
    } catch (error) {
      toast.error("Error approving order");
    } finally {
      setActioningOrderId(null);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      setOrderToReject(order);
      setShowRejectDialog(true);
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!orderToReject) return;

    setActioningOrderId(orderToReject.id);
    try {
      const success = await rejectOrder(
        orderToReject.id,
        user?.id || "seller-admin",
        reason,
      );
      if (success) {
        toast.success("Order rejected");
      } else {
        toast.error("Failed to reject order");
      }
    } catch (error) {
      toast.error("Error rejecting order");
    } finally {
      setActioningOrderId(null);
      setShowRejectDialog(false);
      setOrderToReject(null);
    }
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/seller/orders/${orderId}`);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Error loading orders</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Manage and fulfill customer orders
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApproval}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.processing + stats.approved}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₱{stats.totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 z-10 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID, customer name, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as OrderStatus | "all")
              }
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending_approval">
                  Pending Approval
                </SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="ready_for_pickup">
                  Ready for Pickup
                </SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No orders found
            </h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "Orders will appear here once customers place them"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusConfig = STATUS_CONFIG[order.status];
            const StatusIcon = statusConfig.icon;
            const isActioning = actioningOrderId === order.id;

            return (
              <Card
                key={order.id}
                className={`hover:shadow-md transition-shadow cursor-pointer ${statusConfig.bgColor} border`}
                onClick={() => handleViewOrder(order.id)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Order Info */}
                    <div className="flex-1 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">
                              {order.id}
                            </h3>
                            <Badge
                              variant="secondary"
                              className={`${statusConfig.color} ${statusConfig.bgColor}`}
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(
                              order.createdAt?.toDate() || new Date(),
                              "MMM dd, yyyy 'at' hh:mm a",
                            )}
                          </p>
                        </div>

                        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      </div>

                      {/* Customer Info */}
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Customer:{" "}
                          </span>
                          <span className="font-medium">{order.userName}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email: </span>
                          <span className="font-medium">{order.userEmail}</span>
                        </div>
                        {order.userPhone && (
                          <div>
                            <span className="text-muted-foreground">
                              Phone:{" "}
                            </span>
                            <span className="font-medium">
                              {order.userPhone}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Order Items Preview */}
                      <div className="flex flex-wrap gap-2">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 bg-background/50 rounded-lg px-3 py-1.5 text-sm border"
                          >
                            <div className="w-8 h-8 rounded bg-muted flex-shrink-0 overflow-hidden">
                              <img
                                src={item.image || PLACEHOLDER_IMAGE}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="font-medium">{item.name}</span>
                            <span className="text-muted-foreground">
                              ×{item.quantity}
                            </span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-sm text-muted-foreground self-center">
                            +{order.items.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Delivery Method */}
                      <div className="flex items-center gap-2 text-sm">
                        {order.deliveryMethod === "lalamove" ? (
                          <>
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Lalamove Delivery
                            </span>
                          </>
                        ) : (
                          <>
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Pickup
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions & Total */}
                    <div className="flex flex-col items-end justify-between gap-4 min-w-[200px]">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Total Amount
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          ₱{order.total.toLocaleString()}
                        </p>
                      </div>

                      {order.status === "pending_approval" && (
                        <div
                          className="flex gap-2 w-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectOrder(order.id)}
                            disabled={isActioning}
                            className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                          >
                            {isActioning ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Reject"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApproveOrder(order.id)}
                            disabled={isActioning}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            {isActioning ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Approve"
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Order Rejection Modal */}
      {orderToReject && (
        <OrderRejectionModal
          open={showRejectDialog}
          onClose={() => {
            setShowRejectDialog(false);
            setOrderToReject(null);
          }}
          onConfirm={handleRejectConfirm}
          orderNumber={orderToReject.orderNumber}
          loading={actioningOrderId === orderToReject.id}
        />
      )}
    </div>
  );
}
