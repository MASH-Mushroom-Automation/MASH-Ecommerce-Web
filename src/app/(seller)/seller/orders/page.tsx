"use client";

import React, { useState } from "react";
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

  // Filter orders based on current tab
  const filteredOrders =
    orders?.filter((order) => {
      const matchesTab =
        currentTab === "all" ||
        (currentTab === "pending" && order.status === "Pending") ||
        (currentTab === "processing" && order.status === "Processing") ||
        (currentTab === "shipped" && order.status === "Shipped") ||
        (currentTab === "delivered" && order.status === "Delivered") ||
        (currentTab === "cancelled" && order.status === "Cancelled");

      return matchesTab;
    }) || [];

  // Get counts for each status for the tabs
  const getStatusCount = (status: string) => {
    if (!orders) return 0;
    return orders.filter(
      (order) =>
        status === "all" || order.status.toLowerCase() === status.toLowerCase()
    ).length;
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
          <p className="text-red-600 mb-4">Error loading orders: {error}</p>
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
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
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
                value="processing"
                onClick={() => handleTabChange("processing")}
              >
                Processing ({getStatusCount("processing")})
              </TabsTrigger>
              <TabsTrigger
                value="shipped"
                onClick={() => handleTabChange("shipped")}
              >
                Shipped ({getStatusCount("shipped")})
              </TabsTrigger>
              <TabsTrigger
                value="delivered"
                onClick={() => handleTabChange("delivered")}
              >
                Delivered ({getStatusCount("delivered")})
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
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
                <TableHead className="w-[120px]">Order ID</TableHead>
                <TableHead className="w-[140px]">Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right w-[80px]">Items</TableHead>
                <TableHead className="text-right w-[120px]">Total</TableHead>
                <TableHead className="w-[140px]">Status</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-sm">{order.id}</TableCell>
                    <TableCell className="text-sm text-gray-600">{order.date}</TableCell>
                    <TableCell className="text-sm">{order.customer}</TableCell>
                    <TableCell className="text-right text-sm">{order.items}</TableCell>
                    <TableCell className="text-right font-semibold text-sm">
                      ₱{order.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          order.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                            : order.status === "Processing"
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                            : order.status === "Shipped"
                            ? "bg-purple-100 text-purple-800 hover:bg-purple-100"
                            : order.status === "Delivered"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-red-100 text-red-800 hover:bg-red-100"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
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
                    className="text-center py-12 text-gray-500"
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
            <div className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{order.id}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{order.date}</p>
                    </div>
                    <Badge
                      className={
                        order.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          : order.status === "Processing"
                          ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                          : order.status === "Shipped"
                          ? "bg-purple-100 text-purple-800 hover:bg-purple-100"
                          : order.status === "Delivered"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-red-100 text-red-800 hover:bg-red-100"
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Customer</span>
                      <span className="font-medium">{order.customer}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Items</span>
                      <span className="font-medium">{order.items}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total</span>
                      <span className="font-semibold text-[#1E392A]">₱{order.total.toFixed(2)}</span>
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
            <div className="p-8 text-center text-gray-500">
              <p className="text-sm">No orders found</p>
              <p className="text-xs mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {pagination && (
          <div className="py-4 border-t border-gray-200">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) handlePageChange(currentPage - 1);
                    }}
                    className={
                      currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={page === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < pagination.totalPages)
                        handlePageChange(currentPage + 1);
                    }}
                    className={
                      currentPage >= pagination.totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
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
