"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ExternalLink,
  Navigation,
  Phone,
  Truck,
  User,
  XCircle,
  Loader2,
} from "lucide-react";
import StatusTimeline from "@/components/delivery/StatusTimeline";
import PriorityDelivery from "@/components/delivery/PriorityDelivery";
import { useLalamoveTracking } from "@/hooks/useLalamoveTracking";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type DeliveryStatus =
  | "ASSIGNING_DRIVER"
  | "ON_GOING"
  | "PICKED_UP"
  | "COMPLETED"
  | "CANCELED"
  | "REJECTED"
  | "EXPIRED";

const STATUS_LABELS: Record<DeliveryStatus, string> = {
  ASSIGNING_DRIVER: "Finding Driver",
  ON_GOING: "Driver En Route",
  PICKED_UP: "Picked Up",
  COMPLETED: "Delivered",
  CANCELED: "Canceled",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
};

const STATUS_COLORS: Record<string, string> = {
  ASSIGNING_DRIVER: "bg-yellow-100 text-yellow-800 border-yellow-300",
  ON_GOING: "bg-blue-100 text-blue-800 border-blue-300",
  PICKED_UP: "bg-indigo-100 text-indigo-800 border-indigo-300",
  COMPLETED: "bg-green-100 text-green-800 border-green-300",
  CANCELED: "bg-red-100 text-red-800 border-red-300",
  REJECTED: "bg-red-100 text-red-800 border-red-300",
  EXPIRED: "bg-gray-100 text-gray-800 border-gray-300",
};

interface SellerDeliveryPanelProps {
  orderId: string;
  deliveryFee?: number;
}

export default function SellerDeliveryPanel({
  orderId,
  deliveryFee = 0,
}: SellerDeliveryPanelProps) {
  const { tracking, loading, error } = useLalamoveTracking(orderId);
  const [canceling, setCanceling] = useState(false);

  const handleCancelDelivery = async () => {
    if (!tracking?.orderId) return;
    setCanceling(true);
    try {
      const res = await fetch(
        `/api/lalamove/order?orderId=${encodeURIComponent(tracking.orderId)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to cancel delivery");
      }
      toast.success("Delivery canceled successfully");
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to cancel delivery");
      console.error("[SellerDeliveryPanel] Cancel error:", error);
    } finally {
      setCanceling(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-40 rounded bg-muted" />
            <div className="h-3 w-60 rounded bg-muted" />
            <div className="h-20 w-full rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          Failed to load delivery tracking.
        </CardContent>
      </Card>
    );
  }

  if (!tracking) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          <Truck className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
          No delivery tracking data yet.
        </CardContent>
      </Card>
    );
  }

  const status = (tracking.status || "ASSIGNING_DRIVER") as DeliveryStatus;
  const driver = tracking.driver;
  const timelineStatus = (
    ["ASSIGNING_DRIVER", "ON_GOING", "PICKED_UP", "COMPLETED", "CANCELED"].includes(status)
      ? status
      : "ASSIGNING_DRIVER"
  ) as "ASSIGNING_DRIVER" | "ON_GOING" | "PICKED_UP" | "COMPLETED" | "CANCELED";

  return (
    <div className="space-y-4">
      {/* Delivery Status Card */}
      <Card className="border-emerald-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-emerald-600" />
              Lalamove Delivery
            </span>
            <Badge
              variant="outline"
              className={cn("border", STATUS_COLORS[status] || STATUS_COLORS.ASSIGNING_DRIVER)}
            >
              {STATUS_LABELS[status] || status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timeline */}
          <StatusTimeline currentStatus={timelineStatus} />

          {/* Driver Info */}
          {driver && (
            <div className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                  <User className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{driver.name}</p>
                  {driver.plateNumber && (
                    <p className="text-xs text-muted-foreground">
                      {driver.plateNumber}
                    </p>
                  )}
                </div>
                {driver.phone && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`tel:${driver.phone}`, "_self")}
                  >
                    <Phone className="h-3.5 w-3.5 mr-1" />
                    Call
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Share Link */}
          {tracking.shareLink && (
            <Button
              size="sm"
              variant="outline"
              className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              onClick={() => window.open(tracking.shareLink, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Track on Lalamove
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Priority Delivery - only show while finding driver */}
      {status === "ASSIGNING_DRIVER" && (
        <PriorityDelivery
          orderId={orderId}
          currentTotal={deliveryFee}
        />
      )}

      {/* Cancel Delivery - available before pickup */}
      {(status === "ASSIGNING_DRIVER" || status === "ON_GOING") && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              disabled={canceling}
            >
              {canceling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Canceling...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Delivery
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Delivery?</AlertDialogTitle>
              <AlertDialogDescription>
                This will cancel the Lalamove delivery for this order.
                {status === "ON_GOING" &&
                  " A driver has already been assigned. Cancellation fees may apply."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Delivery</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancelDelivery}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Yes, Cancel Delivery
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
