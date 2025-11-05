"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  MessageSquare,
  CalendarDays,
  Handshake,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useSellerOrderDetail } from "@/hooks/useSeller";
import { SellerOrderStatus, SellerOrderDetail as OrderDetailType } from "@/types/api";
import { toast } from "sonner";

// Mock fallback data for development
const MOCK_ORDER_FALLBACK: OrderDetailType = {
  id: "ORD-001",
  date: "2025-10-20",
  status: "PENDING",
  customer: {
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+63 912 345 6789",
    address: "123 Main Street, Barangay San Antonio, Quezon City, Metro Manila 1105",
  },
  items: [
    { id: "P-101", name: "Fresh Shiitake Mushrooms", quantity: 2, price: 150, total: 300 },
    { id: "P-205", name: "Oyster Mushroom Growing Kit", quantity: 1, price: 150, total: 150 },
  ],
  coordination: {
    method: "Meet-up",
    location: "MASH Farm Hub - Quezon City",
    preferredDate: "2025-10-22",
    preferredTime: "10:00 AM",
    contactPerson: "John Doe",
    contactNumber: "+63 912 345 6789",
    instructions: "Bring your reusable bag for pickup.",
  },
  payment: {
    method: "GCash",
    status: "Paid",
    transactionId: "TXN-ORD-001-20251020",
  },
  totals: {
    subtotal: 450,
    coordinationFee: 0,
    total: 450,
  },
  notes: "Buyer prefers morning pickup and will message before arrival.",
  timeline: [
    {
      status: "PENDING",
      date: "2025-10-20T10:30:00Z",
      description: "Order received and waiting for seller confirmation",
    },
  ],
  createdAt: "2025-10-20T10:30:00Z",
  updatedAt: "2025-10-20T10:30:00Z",
};

const STATUS_OPTIONS: { value: SellerOrderStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
];

const statusColorMap: Record<SellerOrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

const getStatusIcon = (status: SellerOrderStatus) => {
  switch (status) {
    case "PENDING":
      return <Clock className="h-4 w-4" />;
    case "CONFIRMED":
      return <Package className="h-4 w-4" />;
    case "PROCESSING":
      return <Package className="h-4 w-4" />;
    case "SHIPPED":
      return <Handshake className="h-4 w-4" />;
    case "DELIVERED":
      return <CheckCircle className="h-4 w-4" />;
    case "CANCELLED":
      return <XCircle className="h-4 w-4" />;
    case "REFUNDED":
      return <XCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(value);

export default function OrderDetails() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const { order, loading, error, updateStatus, refetch } = useSellerOrderDetail(orderId);
  const [newStatus, setNewStatus] = useState<SellerOrderStatus>("PENDING");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (order) {
      setNewStatus(order.status);
    }
  }, [order]);

  const handleStatusUpdate = async () => {
    if (!displayOrder) return;
    setIsUpdating(true);

    try {
      await updateStatus(newStatus);
      toast.success("Order status updated successfully");
      setIsDialogOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update status";
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Use fallback data if API fails or order not found
  const displayOrder = order || (error ? MOCK_ORDER_FALLBACK : null);

  if (error && !order) {
    toast.error("Using mock data - API unavailable", { id: "api-fallback" });
  }

  if (!displayOrder) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <p className="text-gray-600">Order not found.</p>
        <Button variant="outline" onClick={() => router.back()}>
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Order Details - {displayOrder.id}
          </h1>
          <p className="text-gray-500">Order placed on {formatDate(displayOrder.date)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(displayOrder.status)}
                  Order Status
                </CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Update Status
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Order Status</DialogTitle>
                      <DialogDescription>
                        Select the new status for this displayOrder.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Select
                        value={newStatus}
                        onValueChange={(value) =>
                          setNewStatus(value as SellerOrderStatus)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleStatusUpdate}
                        disabled={isUpdating}
                        className="bg-[#1E392A] hover:bg-[#1E392A]/90"
                      >
                        {isUpdating ? "Updating..." : "Update Status"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Badge className={statusColorMap[displayOrder.status] ?? "bg-gray-100 text-gray-800"}>
                  {displayOrder.status}
                </Badge>
                <span className="text-sm text-gray-500">
                  Last updated{" "}
                  {displayOrder.timeline.length > 0
                    ? formatDateTime(displayOrder.timeline[displayOrder.timeline.length - 1]!.date)
                    : formatDateTime(displayOrder.updatedAt)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>
                {displayOrder.items.length} item(s) in this order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayOrder.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">
                              ID: {item.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
              <CardDescription>
                Track the progress of this order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayOrder.timeline.map((event, index) => (
                  <div key={`${event.status}-${index}`} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {getStatusIcon(event.status as SellerOrderStatus)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{event.status}</p>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(event.date)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {event.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Coordination Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Handshake className="h-5 w-5" />
                Handover Coordination
              </CardTitle>
              <CardDescription>
                Details shared between seller and buyer for the handover
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Method:</span>
                <span>{displayOrder.coordination.method}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">Location</p>
                  <p>{displayOrder.coordination.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CalendarDays className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">Preferred Schedule</p>
                  <p>
                    {formatDate(displayOrder.coordination.preferredDate)} at {displayOrder.coordination.preferredTime}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Contact Person:</span>
                <span>{displayOrder.coordination.contactPerson}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Contact Number:</span>
                <span>{displayOrder.coordination.contactNumber}</span>
              </div>
              {displayOrder.coordination.instructions && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="font-medium text-gray-700">Additional Instructions</p>
                  <p className="mt-1 text-gray-600">
                    {displayOrder.coordination.instructions}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{displayOrder.customer.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{displayOrder.customer.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{displayOrder.customer.phone}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <span className="text-sm">{displayOrder.customer.address}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Method</p>
                <p className="text-sm text-gray-600">{displayOrder.payment.method}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge className="bg-green-100 text-green-800">
                  {displayOrder.payment.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Transaction ID</p>
                <p className="text-sm text-gray-600 font-mono">
                  {displayOrder.payment.transactionId}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Subtotal</span>
                <span className="text-sm">
                  {formatCurrency(displayOrder.totals.subtotal)}
                </span>
              </div>
              {typeof displayOrder.totals.coordinationFee === "number" && (
                <div className="flex justify-between">
                  <span className="text-sm">Coordination Fee</span>
                  <span className="text-sm">
                    {formatCurrency(displayOrder.totals.coordinationFee)}
                  </span>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="font-medium">Total</span>
                  <span className="font-medium">
                    {formatCurrency(displayOrder.totals.total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Notes */}
          {displayOrder.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Order Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{displayOrder.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
