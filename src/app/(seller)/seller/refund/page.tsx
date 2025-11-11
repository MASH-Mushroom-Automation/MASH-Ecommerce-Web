"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Eye, Info, CheckCircle, XCircle } from "lucide-react";
import { getStatusBadge } from "@/lib/status-utils";

// Sample refund request data
// This would be replaced with API data in production
const REFUND_REQUESTS = [
  {
    id: "REF-001",
    orderId: "ORD-004",
    date: "2025-10-15",
    customer: "Sarah Williams",
    amount: 150,
    reason: "Damaged product",
    status: "Pending",
  },
  {
    id: "REF-002",
    orderId: "ORD-003",
    date: "2025-10-14",
    customer: "Mike Johnson",
    amount: 120,
    reason: "Wrong item received",
    status: "Processing",
  },
  {
    id: "REF-003",
    orderId: "ORD-002",
    date: "2025-10-12",
    customer: "Jane Smith",
    amount: 280,
    reason: "Changed mind",
    status: "Approved",
  },
  {
    id: "REF-004",
    orderId: "ORD-001",
    date: "2025-10-10",
    customer: "John Doe",
    amount: 200,
    reason: "Item not as described",
    status: "Rejected",
  },
];

export default function RefundPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentTab, setCurrentTab] = useState("all");
  const [selectedRefund, setSelectedRefund] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [refundResponse, setRefundResponse] = useState("");

  // Filter refund requests based on search term, status filter, and current tab
  const filteredRefunds = REFUND_REQUESTS.filter((refund) => {
    const matchesSearch =
      refund.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.customer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      refund.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesTab =
      currentTab === "all" ||
      (currentTab === "pending" && refund.status === "Pending") ||
      (currentTab === "processing" && refund.status === "Processing") ||
      (currentTab === "approved" && refund.status === "Approved") ||
      (currentTab === "rejected" && refund.status === "Rejected");

    return matchesSearch && matchesStatus && matchesTab;
  });

  // Get counts for each status for the tabs
  const getStatusCount = (status: string) => {
    return REFUND_REQUESTS.filter(
      (refund) =>
        status === "all" || refund.status.toLowerCase() === status.toLowerCase()
    ).length;
  };

  const handleViewRefund = (refund: any) => {
    setSelectedRefund(refund);
    setRefundResponse("");
    setIsViewDialogOpen(true);
  };

  const handleApproveRefund = () => {
    // In a real application, you would send this update to your API
    console.log(
      "Approving refund:",
      selectedRefund.id,
      "Response:",
      refundResponse
    );

    // Close dialog
    setIsViewDialogOpen(false);
  };

  const handleRejectRefund = () => {
    // In a real application, you would send this update to your API
    console.log(
      "Rejecting refund:",
      selectedRefund.id,
      "Response:",
      refundResponse
    );

    // Close dialog
    setIsViewDialogOpen(false);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Refund Requests</h1>
      </div>

      <div className="bg-accent/30 p-4 rounded-lg mb-6 flex gap-3 border border-accent">
        <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="text-sm text-foreground">
          <p className="font-semibold">Managing Refund Requests</p>
          <p className="mt-1 text-muted-foreground">
            Review and respond to customer refund requests. Approve valid
            requests and provide clear reasons for any rejections.
          </p>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border">
          <Tabs
            defaultValue="all"
            value={currentTab}
            onValueChange={setCurrentTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-4">
              <TabsTrigger value="all">
                All ({getStatusCount("all")})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({getStatusCount("pending")})
              </TabsTrigger>
              <TabsTrigger value="processing">
                Processing ({getStatusCount("processing")})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({getStatusCount("approved")})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({getStatusCount("rejected")})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by refund ID, order ID, or customer name..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-40">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Refund ID</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRefunds.length > 0 ? (
                filteredRefunds.map((refund) => (
                  <TableRow key={refund.id}>
                    <TableCell className="font-medium">{refund.id}</TableCell>
                    <TableCell>{refund.orderId}</TableCell>
                    <TableCell>{refund.date}</TableCell>
                    <TableCell>{refund.customer}</TableCell>
                    <TableCell className="text-right">
                      ₱{refund.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {refund.reason}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(refund.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleViewRefund(refund)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No refund requests found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="py-4 border-t border-border">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      {/* View Refund Dialog */}
      {selectedRefund && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Refund Request Details</DialogTitle>
              <DialogDescription>
                Review the refund request and take action.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    Request Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Refund ID:</span>
                    <span className="font-medium">{selectedRefund.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order ID:</span>
                    <span className="font-medium">
                      {selectedRefund.orderId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date Requested:</span>
                    <span className="font-medium">{selectedRefund.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="font-medium">
                      {selectedRefund.customer}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">
                      ₱{selectedRefund.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    {getStatusBadge(selectedRefund.status)}
                  </div>
                </CardContent>
              </Card>

              <div>
                <h4 className="text-sm font-medium mb-2">Customer's Reason</h4>
                <div className="bg-muted p-3 rounded-md text-sm">
                  {selectedRefund.reason}
                </div>
              </div>

              {(selectedRefund.status === "Pending" ||
                selectedRefund.status === "Processing") && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Your Response</h4>
                  <Textarea
                    placeholder="Provide a response to the customer's refund request..."
                    value={refundResponse}
                    onChange={(e) => setRefundResponse(e.target.value)}
                    rows={4}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              {selectedRefund.status === "Pending" ||
              selectedRefund.status === "Processing" ? (
                <div className="flex w-full gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={handleRejectRefund}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleApproveRefund}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* API Integration Comment */}
      {/* 
        API Integration Points:
        1. Fetch refund requests from backend: 
           - GET /api/seller/refunds with query parameters for pagination, filtering
        2. Get refund request details:
           - GET /api/seller/refunds/:id
        3. Approve refund:
           - PUT /api/seller/refunds/:id/approve with response message
        4. Reject refund:
           - PUT /api/seller/refunds/:id/reject with rejection reason
        5. Search functionality:
           - GET /api/seller/refunds?search=term
        6. Filter by status:
           - GET /api/seller/refunds?status=pending
      */}
    </div>
  );
}
