"use client";

import React, { useState } from "react";
import { SellerOrder } from "@/types/api";
import { getStatusBadge, getStatusLabel, type OrderStatus } from "@/lib/status-utils";

interface Order extends Omit<SellerOrder, 'status'> {
  status: OrderStatus;
}
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Eye } from "lucide-react";
import { useSellerOrders } from "@/hooks/useSeller";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function SellerOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentTab, setCurrentTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Use CMS-ready hook for orders
  const { orders, loading, error, pagination, refetch } = useSellerOrders({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  // Map tab value to status
  const tabToStatus: Record<string, OrderStatus | undefined> = {
    all: undefined,
    pending: "PENDING",
    confirmed: "CONFIRMED",
    ready: "READY_FOR_PICKUP",
    completed: "COMPLETED",
    cancelled: "CANCELLED"
  };

  // Filter orders based on current tab
  const filteredOrders: Order[] =
    orders?.filter((order) => {
      const targetStatus = tabToStatus[currentTab];
      return !targetStatus || order.status === targetStatus;
    }) || [];

  // Get counts for each status for the tabs
  const getStatusCount = (tabValue: string) => {
    if (!orders) return 0;
    const targetStatus = tabToStatus[tabValue];
    return orders.filter(order => !targetStatus || order.status === targetStatus).length;
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle status filter
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading orders: {error}</p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-border">
          <Tabs
            defaultValue="all"
            value={currentTab}
            onValueChange={setCurrentTab}
            className="w-full"
          >
            <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              <TabsList className="inline-flex w-auto min-w-full sm:grid sm:grid-cols-6 mb-4">
              <TabsTrigger value="all" onClick={() => handleTabChange("all")}>
                All ({getStatusCount("all")})
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                onClick={() => handleTabChange("pending")}
              >
                Pending ({getStatusCount("pending")})
              </TabsTrigger>
              <TabsTrigger
                value="confirmed"
                onClick={() => handleTabChange("confirmed")}
              >
                Confirmed ({getStatusCount("confirmed")})
              </TabsTrigger>
              <TabsTrigger
                value="ready"
                onClick={() => handleTabChange("ready")}
              >
                Ready ({getStatusCount("ready for pickup")})
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                onClick={() => handleTabChange("completed")}
              >
                Completed ({getStatusCount("completed")})
              </TabsTrigger>
              <TabsTrigger
                value="cancelled"
                onClick={() => handleTabChange("cancelled")}
              >
                Cancelled ({getStatusCount("cancelled")})
              </TabsTrigger>
            </TabsList>
            </div>
          </Tabs>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search orders by ID or customer name..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="w-40">
                <Select value={statusFilter} onValueChange={handleStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="ready for pickup">Ready for Pickup</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {/* Order identifier column */}
                <TableHead className="w-[120px] pl-5">Order ID</TableHead>
                {/* Purchase date column */}
                <TableHead className="w-[140px]">Date</TableHead>
                {/* Buyer information column */}
                <TableHead>Customer</TableHead>
                {/* Number of items column */}
                <TableHead className="text-right w-[80px]">Items</TableHead>
                {/* Order total amount column */}
                <TableHead className="text-right w-[120px]">Total</TableHead>
                {/* Fulfillment status column */}
                <TableHead className="w-[140px]">Status</TableHead>
                {/* Row actions column */}
                <TableHead className="text-right w-[100px] pr-5">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/50">
                    {/* Order identifier cell */}
                    <TableCell className="font-medium text-sm pl-5">{order.id}</TableCell>
                    {/* Purchase date cell */}
                    <TableCell className="text-sm text-muted-foreground">{order.date}</TableCell>
                    {/* Buyer information cell */}
                    <TableCell className="text-sm">{order.customer}</TableCell>
                    {/* Number of items cell */}
                    <TableCell className="text-right text-sm">{order.items}</TableCell>
                    {/* Order total amount cell */}
                    <TableCell className="text-right font-semibold text-sm">
                      ₱{order.total.toFixed(2)}
                    </TableCell>
                    {/* Fulfillment status cell */}
                    <TableCell>
                      {getStatusBadge(order.status)}
                    </TableCell>
                    {/* Row actions cell */}
                    <TableCell className="text-right pr-5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="min-h-[44px] min-w-[44px]"
                        asChild
                      >
                        <a href={`/seller/orders/${order.id}`} className="flex items-center justify-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span className="text-xs">View</span>
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <div className="text-center">
                      <p className="text-sm">No orders found</p>
                      <p className="text-xs mt-1">Try adjusting your search or filters</p>
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
                <div key={order.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-sm text-foreground">{order.id}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{order.date}</p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Customer</span>
                      <span className="font-medium">{order.customer}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Items</span>
                      <span className="font-medium">{order.items}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-semibold text-primary">₱{order.total.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full min-h-[44px]"
                    asChild
                  >
                    <a href={`/seller/orders/${order.id}`} className="flex items-center justify-center gap-2">
                      <Eye className="h-4 w-4" />
                      View Details
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-sm">No orders found</p>
              <p className="text-xs mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* API Integration Comment */}
      {/* 
        API Integration Points:
        1. Fetch orders from backend: 
           - GET /api/seller/orders with query parameters for pagination, filtering
        2. Update order status:
           - PUT /api/seller/orders/:id with new status
        3. Search functionality:
           - GET /api/seller/orders?search=term
        4. Filter by status:
           - GET /api/seller/orders?status=pending
      */}
    </div>
  );
}
