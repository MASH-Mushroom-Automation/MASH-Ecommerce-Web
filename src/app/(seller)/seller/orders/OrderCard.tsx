"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, Loader2, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { FirestoreOrder } from "@/lib/firebase/orders";
import { STATUS_CONFIG, PLACEHOLDER_IMAGE } from "./orderStatusConfig";

interface OrderCardProps {
  order: FirestoreOrder;
  isActioning: boolean;
  onView: (orderId: string) => void;
  onApprove: (orderId: string) => void;
  onReject: (orderId: string) => void;
}

export function OrderCard({
  order,
  isActioning,
  onView,
  onApprove,
  onReject,
}: OrderCardProps) {
  const statusConfig = STATUS_CONFIG[order.status];
  const StatusIcon = statusConfig.icon;

  return (
    <Card
      className={`hover:shadow-md transition-shadow cursor-pointer ${statusConfig.bgColor} border`}
      onClick={() => onView(order.id)}
    >
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Order Info */}
          <div className="flex-1 space-y-4">
            {/* Header row */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {order.orderNumber || order.id}
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

            {/* Customer info */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Customer: </span>
                <span className="font-medium">{order.userName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Email: </span>
                <span className="font-medium">{order.userEmail}</span>
              </div>
              {order.userPhone && (
                <div>
                  <span className="text-muted-foreground">Phone: </span>
                  <span className="font-medium">{order.userPhone}</span>
                </div>
              )}
            </div>

            {/* Items preview */}
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

            {/* Delivery method */}
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
                  <span className="text-muted-foreground">Pickup</span>
                </>
              )}
            </div>
          </div>

          {/* Total + Actions */}
          <div className="flex flex-col items-end justify-between gap-4 min-w-[200px]">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Amount</p>
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
                  onClick={() => onReject(order.id)}
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
                  onClick={() => onApprove(order.id)}
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
}
