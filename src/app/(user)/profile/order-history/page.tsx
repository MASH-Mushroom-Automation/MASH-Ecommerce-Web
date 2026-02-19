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
import { Separator } from "@/components/ui/separator";
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
  ShoppingBag,
  CreditCard,
  Receipt,
  CalendarDays,
  Copy,
  Check,
  ArrowRight,
  Ban,
  Navigation,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import {
  useUserFirebaseOrders,
  useFirebaseOrder,
} from "@/hooks/useFirebaseOrders";
import { type FirestoreOrder, type OrderStatus, FirebaseOrdersService } from "@/lib/firebase/orders";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

const PLACEHOLDER_IMAGE = "/mushroom-placeholder.png";

// Status configuration with dark mode compatible colors
const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    color: string;
    iconColor: string;
    icon: React.ReactNode;
    tab: string;
  }
> = {
  pending_approval: {
    label: "Pending Approval",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    iconColor: "text-amber-600 dark:text-amber-400",
    icon: <Clock className="h-3.5 w-3.5" />,
    tab: "pending",
  },
  approved: {
    label: "Approved",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    tab: "pending",
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800",
    iconColor: "text-red-600 dark:text-red-400",
    icon: <XCircle className="h-3.5 w-3.5" />,
    tab: "cancelled",
  },
  processing: {
    label: "Processing",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    iconColor: "text-purple-600 dark:text-purple-400",
    icon: <Package className="h-3.5 w-3.5" />,
    tab: "active",
  },
  ready_for_pickup: {
    label: "Ready for Pickup",
    color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    icon: <MapPin className="h-3.5 w-3.5" />,
    tab: "active",
  },
  shipped: {
    label: "Shipped",
    color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    icon: <Truck className="h-3.5 w-3.5" />,
    tab: "active",
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800",
    iconColor: "text-green-600 dark:text-green-400",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    tab: "completed",
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    tab: "completed",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-gray-100 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300 border-gray-200 dark:border-gray-700",
    iconColor: "text-gray-500 dark:text-gray-400",
    icon: <XCircle className="h-3.5 w-3.5" />,
    tab: "cancelled",
  },
};

type TabType = "all" | "pending" | "active" | "completed" | "cancelled";

const TAB_CONFIG: Record<
  TabType,
  { label: string; icon: React.ReactNode }
> = {
  all: { label: "All", icon: <Package className="h-4 w-4" /> },
  pending: { label: "Pending", icon: <Clock className="h-4 w-4" /> },
  active: { label: "Active", icon: <Truck className="h-4 w-4" /> },
  completed: { label: "Completed", icon: <CheckCircle className="h-4 w-4" /> },
  cancelled: { label: "Cancelled", icon: <XCircle className="h-4 w-4" /> },
};

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

const formatShortDate = (timestamp: unknown) => {
  if (!timestamp) return "N/A";
  const ts = timestamp as { toDate?: () => Date };
  const date = ts.toDate ? ts.toDate() : new Date(timestamp as string);
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export default function OrderHistoryPage() {
  const { user, isAuthenticated } = useAuth();
  const { orders, loading, error } = useUserFirebaseOrders(user?.id || null);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const tabCounts = useMemo(() => {
    const counts = {
      all: 0,
      pending: 0,
      active: 0,
      completed: 0,
      cancelled: 0,
    };
    orders.forEach((order) => {
      counts.all++;
      const tab = STATUS_CONFIG[order.status]?.tab || "all";
      if (tab in counts) {
        counts[tab as keyof typeof counts]++;
      }
    });
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (activeTab === "all") return orders;
    return orders.filter(
      (order) => STATUS_CONFIG[order.status]?.tab === activeTab,
    );
  }, [orders, activeTab]);

  if (!isAuthenticated) {
    return (
      <Card className="bg-card border-0 shadow-sm">
        <CardContent className="p-8 sm:p-12 flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-sm">
            <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
              <Package className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Sign in to view your orders
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Log in to track your deliveries, view order history, and manage
              your purchases.
            </p>
            <Button asChild className="mt-6">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading && orders.length === 0) {
    return (
      <Card className="bg-card border-0 shadow-sm">
        <CardContent className="p-8 sm:p-12 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground">
              Loading your orders...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card border-0 shadow-sm">
        <CardContent className="p-8 sm:p-12 flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-sm">
            <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-destructive/50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Something went wrong
            </h3>
            <p className="text-muted-foreground text-sm mb-6">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
            >
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
      <div className="space-y-4">
        {/* Header Card */}
        <Card className="bg-card border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {/* Top gradient accent */}
            <div className="h-1 bg-gradient-to-r from-primary via-green-400 to-emerald-500" />

            <div className="p-5 sm:p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                    <Receipt className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      Order History
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Track and manage your orders
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">
                    Live Updates
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              {orders.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  <div className="bg-muted/40 dark:bg-muted/20 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {tabCounts.all}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Total Orders
                    </p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                      {tabCounts.pending}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Pending
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                      {tabCounts.active}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Active
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                      {tabCounts.completed}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Completed
                    </p>
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="flex gap-1.5 p-1 bg-muted/50 dark:bg-muted/20 rounded-xl overflow-x-auto">
                {(
                  [
                    "all",
                    "pending",
                    "active",
                    "completed",
                    "cancelled",
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center",
                      activeTab === tab
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/50",
                    )}
                  >
                    <span className="hidden sm:inline">{TAB_CONFIG[tab].icon}</span>
                    {TAB_CONFIG[tab].label}
                    {tabCounts[tab] > 0 && (
                      <span
                        className={cn(
                          "ml-1 px-1.5 py-0.5 text-xs rounded-md font-semibold tabular-nums",
                          activeTab === tab
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {tabCounts[tab]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onViewDetails={() => setSelectedOrderId(order.id)}
              />
            ))}
          </div>
        ) : (
          <Card className="bg-card border-0 shadow-sm">
            <CardContent className="p-8 sm:p-12">
              <div className="text-center max-w-sm mx-auto">
                <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-muted/40 flex items-center justify-center">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-lg">
                  {activeTab === "all"
                    ? "No orders yet"
                    : `No ${activeTab} orders`}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  {activeTab === "all"
                    ? "Start shopping to place your first order. Fresh mushrooms are waiting for you!"
                    : `You don't have any ${activeTab} orders right now.`}
                </p>
                {activeTab === "all" ? (
                  <Button asChild>
                    <Link href="/shop">
                      Browse Products
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("all")}
                  >
                    View All Orders
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

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
    <Card
      className="bg-card border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={onViewDetails}
    >
      <CardContent className="p-0">
        {/* Status accent line */}
        <div
          className={cn(
            "h-0.5 transition-all duration-200",
            order.status === "pending_approval" && "bg-amber-400",
            order.status === "approved" && "bg-blue-400",
            order.status === "rejected" && "bg-red-400",
            order.status === "processing" && "bg-purple-400",
            order.status === "ready_for_pickup" && "bg-cyan-400",
            order.status === "shipped" && "bg-indigo-400",
            order.status === "delivered" && "bg-green-400",
            order.status === "completed" && "bg-emerald-400",
            order.status === "cancelled" && "bg-gray-400",
          )}
        />

        <div className="p-4 sm:p-5">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono font-bold text-sm text-foreground">
                  {order.orderNumber}
                </span>
                <Badge
                  className={cn(
                    "border text-[11px] font-semibold gap-1 px-2 py-0.5",
                    statusConfig.color,
                  )}
                >
                  {statusConfig.icon}
                  {statusConfig.label}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="h-3 w-3" />
                {formatDate(order.createdAt)}
              </div>
            </div>

            {/* Delivery badge */}
            <div
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium shrink-0",
                order.deliveryMethod === "pickup"
                  ? "bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-400"
                  : "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400",
              )}
            >
              {order.deliveryMethod === "pickup" ? (
                <>
                  <MapPin className="h-3 w-3" />
                  Pickup
                </>
              ) : (
                <>
                  <Truck className="h-3 w-3" />
                  Delivery
                </>
              )}
            </div>
          </div>

          {/* Items Row */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center -space-x-2">
              {order.items.slice(0, 4).map((item, idx) => (
                <div
                  key={idx}
                  className="relative ring-2 ring-background rounded-lg"
                  style={{ zIndex: 4 - idx }}
                >
                  <div className="w-12 h-12 bg-muted/40 rounded-lg overflow-hidden">
                    <Image
                      src={item.image || PLACEHOLDER_IMAGE}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {item.quantity > 1 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center ring-2 ring-background">
                      {item.quantity}
                    </span>
                  )}
                </div>
              ))}
              {order.items.length > 4 && (
                <div
                  className="w-12 h-12 rounded-lg bg-muted/60 dark:bg-muted/30 flex items-center justify-center ring-2 ring-background"
                  style={{ zIndex: 0 }}
                >
                  <span className="text-xs font-semibold text-muted-foreground">
                    +{order.items.length - 4}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {order.items
                  .slice(0, 2)
                  .map((i) => i.name)
                  .join(", ")}
                {order.items.length > 2 && ` +${order.items.length - 2} more`}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {order.items.reduce((sum, i) => sum + i.quantity, 0)} item
                {order.items.reduce((sum, i) => sum + i.quantity, 0) > 1
                  ? "s"
                  : ""}{" "}
                total
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="font-bold text-lg text-foreground">
                {formatCurrency(order.total)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary font-medium gap-1 group-hover:bg-primary/5"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails();
              }}
            >
              View Details
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Copy to clipboard helper
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
      title="Copy order number"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
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
  const { user } = useAuth();
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  if (loading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Loading Order Details</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-16">
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !order) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <div className="text-center py-12">
            <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-destructive/50" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Failed to load order details.
            </p>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status];

  // Build the progress steps for the order lifecycle
  const LIFECYCLE_STEPS: { status: OrderStatus; label: string }[] =
    order.status === "cancelled" || order.status === "rejected"
      ? []
      : [
          { status: "pending_approval", label: "Order Placed" },
          { status: "approved", label: "Confirmed" },
          { status: "processing", label: "Processing" },
          ...(order.deliveryMethod === "pickup"
            ? [
                {
                  status: "ready_for_pickup" as OrderStatus,
                  label: "Ready for Pickup",
                },
              ]
            : [{ status: "shipped" as OrderStatus, label: "Shipped" }]),
          { status: "delivered", label: "Delivered" },
        ];

  const currentStepIndex = LIFECYCLE_STEPS.findIndex(
    (s) => s.status === order.status,
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0">
        {/* Header with gradient */}
        <div className="sticky top-0 z-10 bg-background">
          <div className="h-1 bg-gradient-to-r from-primary via-green-400 to-emerald-500" />
          <DialogHeader className="p-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-lg flex items-center gap-2">
                  <span className="font-mono">{order.orderNumber}</span>
                  <CopyButton text={order.orderNumber} />
                </DialogTitle>
                <DialogDescription className="flex items-center gap-1.5 mt-1">
                  <CalendarDays className="h-3 w-3" />
                  {formatDate(order.createdAt)}
                </DialogDescription>
              </div>
              <Badge
                className={cn(
                  "border text-xs font-semibold gap-1 px-2.5 py-1 shrink-0",
                  statusConfig.color,
                )}
              >
                {statusConfig.icon}
                {statusConfig.label}
              </Badge>
            </div>
          </DialogHeader>
          <Separator />
        </div>

        <div className="p-5 space-y-5">
          {/* Progress Bar (for non-cancelled/rejected) */}
          {LIFECYCLE_STEPS.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">
                Order Progress
              </h4>
              <div className="relative">
                {/* Progress track */}
                <div className="flex items-center justify-between mb-2">
                  {LIFECYCLE_STEPS.map((step, idx) => {
                    const isCompleted = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    return (
                      <div
                        key={step.status}
                        className="flex flex-col items-center relative z-10"
                        style={{
                          width: `${100 / LIFECYCLE_STEPS.length}%`,
                        }}
                      >
                        <div
                          className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                            isCompleted
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground",
                            isCurrent &&
                              "ring-4 ring-primary/20 dark:ring-primary/30",
                          )}
                        >
                          {isCompleted && idx < currentStepIndex ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            idx + 1
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-[10px] mt-1.5 text-center leading-tight max-w-[60px]",
                            isCurrent
                              ? "font-semibold text-primary"
                              : isCompleted
                                ? "font-medium text-foreground"
                                : "text-muted-foreground",
                          )}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {/* Line behind the steps */}
                <div className="absolute top-3.5 left-[10%] right-[10%] h-0.5 bg-muted -translate-y-1/2">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{
                      width:
                        currentStepIndex >= 0
                          ? `${(currentStepIndex / (LIFECYCLE_STEPS.length - 1)) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Status Timeline */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Status History
            </h4>
            <div className="relative pl-5">
              {/* Vertical line */}
              <div className="absolute left-[7px] top-1 bottom-1 w-px bg-border" />
              <div className="space-y-3">
                {order.statusHistory.map((entry, idx) => {
                  const isLatest = idx === order.statusHistory.length - 1;
                  const entryConfig = STATUS_CONFIG[entry.status];
                  return (
                    <div key={idx} className="flex items-start gap-3 relative">
                      <div
                        className={cn(
                          "w-3.5 h-3.5 rounded-full flex-shrink-0 absolute -left-5 mt-0.5 ring-2 ring-background",
                          isLatest ? "bg-primary" : "bg-muted-foreground/30",
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-sm font-medium",
                              isLatest
                                ? "text-primary"
                                : "text-foreground",
                            )}
                          >
                            {entryConfig?.label || entry.status}
                          </span>
                        </div>
                        {entry.note && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {entry.note}
                          </p>
                        )}
                        <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                          {formatDate(entry.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <Separator />

          {/* Delivery Info */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">
              Delivery
            </h4>
            <div className="bg-muted/40 dark:bg-muted/20 rounded-xl p-3.5">
              {order.deliveryMethod === "pickup" ? (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center shrink-0">
                    <MapPin className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Pickup</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.pickupLocation?.name} -{" "}
                      {order.pickupLocation?.address}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
                    <Truck className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Lalamove Delivery</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.deliveryAddress?.address}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">
              Items ({order.items.length})
            </h4>
            <div className="rounded-xl border overflow-hidden divide-y">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-card hover:bg-muted/30 transition-colors"
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted/40 flex-shrink-0">
                    <Image
                      src={item.image || PLACEHOLDER_IMAGE}
                      alt={item.name}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatCurrency(item.price)} x {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-sm shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-muted/40 dark:bg-muted/20 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span className="text-foreground">{formatCurrency(order.tax)}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="text-foreground">{formatCurrency(order.deliveryFee)}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between items-baseline">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-bold text-lg text-primary">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="flex items-center gap-3 bg-muted/40 dark:bg-muted/20 rounded-xl p-3.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Payment Method</p>
              <p className="font-medium text-sm">
                {order.paymentMethod === "cod" && "Cash on Delivery"}
                {order.paymentMethod === "gcash" && "GCash"}
                {order.paymentMethod === "card" && "Credit/Debit Card"}
                {!["cod", "gcash", "card"].includes(order.paymentMethod) &&
                  order.paymentMethod}
              </p>
            </div>
          </div>
        </div>

        {/* Sticky footer with action buttons */}
        <div className="sticky bottom-0 bg-background border-t p-4 space-y-2">
          {/* Cancel Order Confirmation */}
          {showCancelConfirm && (
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 space-y-2">
              <p className="text-sm font-medium text-destructive">Cancel this order?</p>
              <input
                type="text"
                placeholder="Reason for cancellation (optional)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full text-sm px-3 py-1.5 rounded-md border bg-background"
              />
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={cancelling}
                  onClick={async () => {
                    setCancelling(true);
                    try {
                      await FirebaseOrdersService.cancelOrder(
                        orderId,
                        user?.id || "customer",
                        cancelReason || undefined
                      );
                      toast.success("Order cancelled successfully");
                      setShowCancelConfirm(false);
                      setCancelReason("");
                    } catch (err) {
                      toast.error(
                        err instanceof Error ? err.message : "Failed to cancel order"
                      );
                    } finally {
                      setCancelling(false);
                    }
                  }}
                >
                  {cancelling ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                  ) : null}
                  Confirm Cancel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCancelConfirm(false);
                    setCancelReason("");
                  }}
                >
                  Keep Order
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {/* Track Delivery Button - visible for shipped delivery orders */}
            {order.deliveryMethod !== "pickup" &&
              ["shipped", "processing", "ready_for_pickup"].includes(order.status) && (
                <Button asChild variant="default" className="flex-1">
                  <Link href={`/profile/orders/${orderId}/track`}>
                    <Navigation className="h-4 w-4 mr-2" />
                    Track Delivery
                  </Link>
                </Button>
              )}

            {/* Cancel Order Button - visible for cancellable statuses */}
            {["pending_approval", "approved", "processing"].includes(order.status) &&
              !showCancelConfirm && (
                <Button
                  variant="outline"
                  className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/30"
                  onClick={() => setShowCancelConfirm(true)}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Cancel Order
                </Button>
              )}

            <Button
              variant="outline"
              onClick={onClose}
              className={
                !["pending_approval", "approved", "processing", "shipped", "ready_for_pickup"].includes(order.status)
                  ? "w-full"
                  : ""
              }
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
