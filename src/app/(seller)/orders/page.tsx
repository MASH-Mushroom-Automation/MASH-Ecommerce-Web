/**
 * Order Management Dashboard
 * Real-time order tracking and management
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Package,
  DollarSign,
  Clock,
  TrendingUp,
  Search,
  Filter,
  Download,
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
import { useSanityOrders } from "@/hooks/useSanityOrders";
import { OrderList } from "@/components/orders/OrderCard";
import { cn } from "@/lib/utils";

export default function OrdersPage() {
  // Filters state
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateRange, setDateRange] = useState<string>("all");

  // Build filters for hook
  const filters = useMemo(() => {
    const f: any = {};
    if (statusFilter !== "all") f.status = statusFilter;
    if (paymentFilter !== "all") f.paymentStatus = paymentFilter;

    // Date range filtering
    if (dateRange !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (dateRange === "today") {
        f.startDate = today.toISOString();
      } else if (dateRange === "week") {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        f.startDate = weekAgo.toISOString();
      } else if (dateRange === "month") {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        f.startDate = monthAgo.toISOString();
      }
    }

    return f;
  }, [statusFilter, paymentFilter, dateRange]);

  // Fetch orders with real-time updates
  const { orders, summary, loading, error, searchOrders, refetch } =
    useSanityOrders(filters);

  // Apply search filter
  const filteredOrders = useMemo(() => {
    if (searchQuery.trim() === "") return orders;
    return searchOrders(searchQuery);
  }, [orders, searchQuery, searchOrders]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">
            Track and manage customer orders in real-time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-200">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-700">
              Live Updates (1-2s)
            </span>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {summary.deliveredOrders} delivered • {summary.cancelledOrders}{" "}
                cancelled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Orders
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {summary.pendingOrders}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.processingOrders} processing • {summary.shippedOrders}{" "}
                shipped
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                From {summary.totalOrders - summary.cancelledOrders} orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Order
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(summary.averageOrderValue)}
              </div>
              {summary.priorityOrders > 0 && (
                <p className="text-xs text-muted-foreground">
                  ⭐ {summary.priorityOrders} priority order
                  {summary.priorityOrders > 1 ? "s" : ""}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform z-10 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order number, customer name, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Order Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">⏳ Pending</SelectItem>
                <SelectItem value="confirmed">✅ Confirmed</SelectItem>
                <SelectItem value="processing">📦 Processing</SelectItem>
                <SelectItem value="shipped">🚚 Shipped</SelectItem>
                <SelectItem value="delivered">✅ Delivered</SelectItem>
                <SelectItem value="cancelled">❌ Cancelled</SelectItem>
                <SelectItem value="returned">↩️ Returned</SelectItem>
              </SelectContent>
            </Select>

            {/* Payment Filter */}
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">⏳ Pending</SelectItem>
                <SelectItem value="paid">💰 Paid</SelectItem>
                <SelectItem value="failed">❌ Failed</SelectItem>
                <SelectItem value="refunded">💰 Refunded</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Range Filter */}
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(statusFilter !== "all" ||
              paymentFilter !== "all" ||
              dateRange !== "all" ||
              searchQuery !== "") && (
              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter("all");
                  setPaymentFilter("all");
                  setDateRange("all");
                  setSearchQuery("");
                }}
              >
                Clear
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          <div className="flex flex-wrap gap-2 mt-4">
            {statusFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Status: {statusFilter}
              </Badge>
            )}
            {paymentFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Payment: {paymentFilter}
              </Badge>
            )}
            {dateRange !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Range: {dateRange}
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Search: "{searchQuery}"
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full border-4 border-[#6A994E] border-t-transparent animate-spin" />
            <p className="text-sm text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <Filter className="h-5 w-5" />
              <p className="font-medium">Error loading orders: {error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order List */}
      {!loading && !error && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {filteredOrders.length} Order
              {filteredOrders.length !== 1 ? "s" : ""}
            </h2>
          </div>

          <OrderList
            orders={filteredOrders}
            variant="default"
            onViewDetails={(orderId) => {
              console.log("View order:", orderId);
              // Navigate to order details page
              // router.push(`/seller/orders/${orderId}`);
            }}
            onUpdateStatus={(orderId) => {
              console.log("Update status:", orderId);
              // Open status update modal
            }}
            onAddTracking={(orderId) => {
              console.log("Add tracking:", orderId);
              // Open tracking modal
            }}
            onPrintInvoice={(orderId) => {
              console.log("Print invoice:", orderId);
              // Open print dialog
            }}
            onOrderUpdated={refetch}
          />
        </>
      )}
    </div>
  );
}
