"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Eye, CheckCircle, XCircle, Loader2, Package, Truck, Clock, AlertTriangle } from "lucide-react";
import { useFirebaseOrders } from "@/hooks/useFirebaseOrders";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { FirestoreOrder, OrderStatus } from "@/lib/firebase/orders";

const PLACEHOLDER_IMAGE = "/mushroom-placeholder.png";

// Status configuration matching the order history page
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
    icon: <Package className="h-4 w-4" />,
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

type TabType = "all" | "pending" | "approved" | "processing" | "completed" | "cancelled";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
};

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


export default function SellerOrders() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [selectedOrder, setSelectedOrder] = useState<FirestoreOrder | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch all orders with real-time updates
  const { 
    orders, 
    loading, 
    error,
    approveOrder,
    rejectOrder,
  } = useFirebaseOrders({ realtime: true });

  // Calculate tab counts
  const tabCounts = useMemo(() => {
    const counts = { all: 0, pending: 0, approved: 0, processing: 0, completed: 0, cancelled: 0 };
    orders.forEach((order) => {
      counts.all++;
      if (order.status === "pending_approval") counts.pending++;
      else if (order.status === "approved") counts.approved++;
      else if (order.status === "processing" || order.status === "ready_for_pickup" || order.status === "shipped" || order.status === "delivered") counts.processing++;
      else if (order.status === "completed") counts.completed++;
      else if (order.status === "cancelled" || order.status === "rejected") counts.cancelled++;
    });
    return counts;
  }, [orders]);

  // Filter orders by tab and search
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filter by tab
    if (activeTab === "pending") {
      filtered = filtered.filter(o => o.status === "pending_approval");
    } else if (activeTab === "approved") {
      filtered = filtered.filter(o => o.status === "approved");
    } else if (activeTab === "processing") {
      filtered = filtered.filter(o => ["processing", "ready_for_pickup", "shipped", "delivered"].includes(o.status));
    } else if (activeTab === "completed") {
      filtered = filtered.filter(o => o.status === "completed");
    } else if (activeTab === "cancelled") {
      filtered = filtered.filter(o => ["cancelled", "rejected"].includes(o.status));
    }

    // Filter by search
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(lowerSearch) ||
        order.userName.toLowerCase().includes(lowerSearch) ||
        order.userEmail.toLowerCase().includes(lowerSearch)
      );
    }

    return filtered;
  }, [orders, activeTab, searchTerm]);

  const handleApprove = async () => {
    if (!selectedOrder || !user?.id) return;

    const success = await approveOrder(selectedOrder.id, user.id);
    if (success) {
      toast.success(`Order ${selectedOrder.orderNumber} approved!`);
      setShowApproveDialog(false);
      setSelectedOrder(null);
    } else {
      toast.error("Failed to approve order");
    }
  };

  const handleReject = async () => {
    if (!selectedOrder || !user?.id) return;

    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    const success = await rejectOrder(selectedOrder.id, user.id, rejectionReason);
    if (success) {
      toast.success(`Order ${selectedOrder.orderNumber} rejected`);
      setShowRejectDialog(false);
      setSelectedOrder(null);
      setRejectionReason("");
    } else {
      toast.error("Failed to reject order");
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive/30 mx-auto mb-4" />
          <p className="text-destructive mb-4">Error loading orders: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Seller Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track all customer orders
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-green-700">Live Updates</span>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-border">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="w-full mb-4">
            <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              <TabsList className="inline-flex w-auto min-w-full sm:grid sm:grid-cols-6">
                <TabsTrigger value="all">
                  All ({tabCounts.all})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending ({tabCounts.pending})
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved ({tabCounts.approved})
                </TabsTrigger>
                <TabsTrigger value="processing">
                  Processing ({tabCounts.processing})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({tabCounts.completed})
                </TabsTrigger>
                <TabsTrigger value="cancelled">
                  Cancelled ({tabCounts.cancelled})
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by order number, customer name, or email..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Order #</TableHead>
                <TableHead className="w-[140px]">Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right w-[80px]">Items</TableHead>
                <TableHead className="text-right w-[120px]">Total</TableHead>
                <TableHead className="w-[140px]">Status</TableHead>
                <TableHead className="w-[200px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm font-medium">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{order.userName}</p>
                        <p className="text-xs text-muted-foreground">{order.userEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {order.items.length}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-sm">
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("border text-xs", STATUS_CONFIG[order.status].color)}>
                        {STATUS_CONFIG[order.status].icon}
                        <span className="ml-1">{STATUS_CONFIG[order.status].label}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {order.status === "pending_approval" && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowApproveDialog(true);
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowRejectDialog(true);
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => globalThis.location.href = `/seller/orders/${order.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-12 w-12 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">No orders found</p>
                      <p className="text-xs text-muted-foreground">
                        {searchTerm ? "Try adjusting your search" : "Orders will appear here"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
          {filteredOrders.length > 0 ? (
            <div className="divide-y divide-border">
              {filteredOrders.map((order) => (
                <div key={order.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono font-semibold text-sm">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <Badge className={cn("border text-xs", STATUS_CONFIG[order.status].color)}>
                      {STATUS_CONFIG[order.status].label}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Customer</span>
                      <span className="font-medium">{order.userName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Items</span>
                      <span className="font-medium">{order.items.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-semibold text-primary">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {order.status === "pending_approval" && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowApproveDialog(true);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowRejectDialog(true);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className={order.status === "pending_approval" ? "w-auto" : "w-full"}
                      onClick={() => globalThis.location.href = `/seller/orders/${order.id}`}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No orders found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchTerm ? "Try adjusting your search" : "Orders will appear here"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Order</DialogTitle>
            <DialogDescription>
              Confirm approval for order {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This will notify the customer that their order has been approved and is being processed.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleApprove}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Order</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting order {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Out of stock, Payment issue, etc."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-1.5"
                rows={4}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              The customer will be notified with this reason.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleReject}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
