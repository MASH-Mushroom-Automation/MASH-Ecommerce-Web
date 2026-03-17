"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Package, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

import { useFirebaseOrders } from "@/hooks/useFirebaseOrders";
import { useSellerId } from "@/hooks/useSellerId";
import { useAuth } from "@/contexts/AuthContext";
import { FirestoreOrder, OrderStatus } from "@/lib/firebase/orders";
import { OrderRejectionModal } from "@/components/orders/OrderRejectionModal";

import { OrderStatsCards } from "./OrderStatsCards";
import { OrderFilters } from "./OrderFilters";
import { OrderCard } from "./OrderCard";

export default function SellerOrdersPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Seller ID comes from the backend JWT (HTTP-only cookie) via /api/seller/me.
  // user.id is the Firebase UID and does NOT match the sellerId stored on orders.
  const sellerId = useSellerId();

  // UI state
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [actioningOrderId, setActioningOrderId] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [orderToReject, setOrderToReject] = useState<FirestoreOrder | null>(
    null,
  );

  // Fetch orders scoped to this seller
  const { orders, stats, loading, error, approveOrder, rejectOrder } =
    useFirebaseOrders({ statusFilter, realtime: true, sellerId });

  // Client-side search filter
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase();
    return orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.userEmail?.toLowerCase().includes(q) ||
        o.userName?.toLowerCase().includes(q) ||
        o.userPhone?.includes(q),
    );
  }, [orders, searchQuery]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleApprove = async (orderId: string) => {
    setActioningOrderId(orderId);
    try {
      const ok = await approveOrder(orderId, user?.id || "seller-admin");
      ok
        ? toast.success("Order approved successfully")
        : toast.error("Failed to approve order");
    } catch {
      toast.error("Error approving order");
    } finally {
      setActioningOrderId(null);
    }
  };

  const handleRejectClick = (orderId: string) => {
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
      const ok = await rejectOrder(
        orderToReject.id,
        user?.id || "seller-admin",
        reason,
      );
      ok
        ? toast.success("Order rejected")
        : toast.error("Failed to reject order");
    } catch {
      toast.error("Error rejecting order");
    } finally {
      setActioningOrderId(null);
      setShowRejectDialog(false);
      setOrderToReject(null);
    }
  };

  const handleView = (orderId: string) => {
    router.push(`/seller/orders/${orderId}`);
  };

  // ── Error state ──────────────────────────────────────────────────────────────

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

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground mt-1">
          Manage and fulfill customer orders
        </p>
      </div>

      {/* Stats */}
      <OrderStatsCards stats={stats} />

      {/* Search & status filter */}
      <OrderFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {/* Order list */}
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
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isActioning={actioningOrderId === order.id}
              onView={handleView}
              onApprove={handleApprove}
              onReject={handleRejectClick}
            />
          ))}
        </div>
      )}

      {/* Rejection modal */}
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
