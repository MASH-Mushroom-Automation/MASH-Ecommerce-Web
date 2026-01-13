"use client";

import React, { useState, useMemo } from "react";
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
// Pagination removed as requested
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
import { Search, Eye, Info, CheckCircle, XCircle, Download, MoreHorizontal, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { getStatusBadge } from "@/lib/status-utils";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [refundResponse, setRefundResponse] = useState("");
  // Track whether the details view was open before showing a confirmation
  const [prevViewWasOpen, setPrevViewWasOpen] = useState(false);
  // New: manage refunds in state so bulk operations can update UI
  const [refunds, setRefunds] = useState(REFUND_REQUESTS);

  // Selection state: array of selected refund IDs (persist across filters)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Bulk action state
  const [bulkAction, setBulkAction] = useState<"approve" | "reject" | "export" | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState("");
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);

  // Filter refund requests based on search term, status filter, and current tab
  const filteredRefunds = refunds.filter((refund) => {
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
    return refunds.filter(
      (refund) =>
        status === "all" || refund.status.toLowerCase() === status.toLowerCase()
    ).length;
  };

  const handleViewRefund = (refund: any) => {
    // Close any open confirmation dialogs so only the details dialog is visible
    setIsRejectDialogOpen(false);
    setIsBulkModalOpen(false);
    setPrevViewWasOpen(false);
    setSelectedRefund(refund);
    setRefundResponse("");
    setIsViewDialogOpen(true);
  };

  // Selection helpers
  const isSelected = (id: string) => selectedIds.includes(id);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectVisible = (visibleIds: string[]) => {
    // Add any visible ids that are not yet selected
    setSelectedIds((prev) => {
      const set = new Set(prev);
      let changed = false;
      visibleIds.forEach((id) => {
        if (!set.has(id)) {
          set.add(id);
          changed = true;
        }
      });
      return changed ? Array.from(set) : prev;
    });
  };

  const deselectVisible = (visibleIds: string[]) => {
    setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
  };

  const toggleSelectAllVisible = (visibleIds: string[]) => {
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      deselectVisible(visibleIds);
    } else {
      selectVisible(visibleIds);
    }
  };

  const selectedRefunds = useMemo(
    () => refunds.filter((r) => selectedIds.includes(r.id)),
    [refunds, selectedIds]
  );

  const selectedStatuses = useMemo(
    () => Array.from(new Set(selectedRefunds.map((r) => r.status))),
    [selectedRefunds]
  );

  const mixedStatus = selectedStatuses.length > 1;
  const canBulkApprove = !mixedStatus && selectedStatuses.length === 1 && selectedStatuses[0] === "Pending";
  const canBulkReject = !mixedStatus && selectedStatuses.length === 1 && (selectedStatuses[0] === "Pending" || selectedStatuses[0] === "Processing");

  // Mock API call for bulk actions (single request)
  const performBulkAction = async (action: "approve" | "reject" | "export", ids: string[], reason?: string) => {
    setIsProcessingBulk(true);
    // Simulate API request
    await new Promise((res) => setTimeout(res, 900));

    const results: { id: string; success: boolean; message?: string }[] = [];

    ids.forEach((id) => {
      const refund = refunds.find((r) => r.id === id);
      if (!refund) {
        results.push({ id, success: false, message: "Not found" });
        return;
      }

      if (action === "approve") {
        if (refund.status !== "Pending") {
          results.push({ id, success: false, message: "Invalid status" });
        } else {
          results.push({ id, success: true });
        }
      } else if (action === "reject") {
        if (refund.status !== "Pending" && refund.status !== "Processing") {
          results.push({ id, success: false, message: "Invalid status" });
        } else {
          results.push({ id, success: true });
        }
      } else if (action === "export") {
        results.push({ id, success: true });
      }
    });

    // Apply updates for successes
    setRefunds((prev) =>
      prev.map((r) => {
        if (!ids.includes(r.id)) return r;
        const res = results.find((x) => x.id === r.id);
        if (!res || !res.success) return r;
        if (action === "approve") return { ...r, status: "Approved" };
        if (action === "reject") return { ...r, status: "Rejected" };
        return r;
      })
    );

    setIsProcessingBulk(false);
    return results;
  };

  const handleApproveRefund = () => {
    // In a real application, you would send this update to your API
    if (!selectedRefund) return;
    setRefunds((prev) => prev.map(r => r.id === selectedRefund.id ? { ...r, status: "Approved" } : r));
    setIsViewDialogOpen(false);
    toast.success("Refund approved");
  };

  const handleRejectClick = () => {
    // Remember whether the view was open so Cancel can restore it
    setPrevViewWasOpen(isViewDialogOpen);
    // Close the details view so only the reject confirmation appears
    setIsViewDialogOpen(false);
    setIsRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (!selectedRefund) return;
    setRefunds((prev) => prev.map(r => r.id === selectedRefund.id ? { ...r, status: "Rejected" } : r));
    setIsRejectDialogOpen(false);
    setIsViewDialogOpen(false);
    toast.success("Refund request rejected");
  };

  return (
    <div>
        <div className="mb-4">
          <h1 className="sm:text-2xl text-2xl font-bold">Refund Requests</h1>
          <p className="text-muted-foreground mt-1 mb-5 sm:text-sm text-xs">
           Review and respond to customer refund requests. Approve valid
            requests and provide clear reasons for any rejections.
          </p>
        </div>


      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border">
          <Tabs
            defaultValue="all"
            value={currentTab}
            onValueChange={setCurrentTab}
            className="w-full"
          >
            <TabsList>
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

          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-5 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                type="search"
                placeholder="Search by refund ID, order ID, or customer name..."
                className="pl-9 h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-40">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10">
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

        {/* Bulk Action controls: only show when at least one item is selected */}
        {selectedIds.length > 0 && (
          (currentTab === "approved" || currentTab === "rejected") ? (
            <div className="p-3 border-b border-border bg-primary/10 flex items-center justify-between">
              <div className="text-sm">Selected: <span className="font-semibold">{selectedIds.length}</span></div>
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      aria-label="Bulk actions"
                      className="bg-primary text-white w-10 h-6 p-0 rounded-md flex items-center justify-center"
                    >
                      <MoreHorizontal />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={async () => {
                        const ids = selectedIds.slice();
                        const rows = refunds.filter(r=>ids.includes(r.id)).map(r=>`"${r.id}","${r.orderId}","${r.customer}","${r.status}","${r.amount}"`);
                        const csv = ["Refund ID,Order ID,Customer,Status,Amount", ...rows].join("\n");
                        const blob = new Blob([csv], { type: "text/csv" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `refunds_export_${Date.now()}.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                        toast.success(`Exported ${ids.length} refunds`);
                      }}
                    >
                      Export
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ) : (
            <div className="p-3 border-b border-border bg-primary/10">
              <div>
                <div className="flex justify-between py-2">
                <div className="text-sm">Selected: <span className="font-semibold">{selectedIds.length}</span></div>
                 <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      aria-label="Bulk actions"
                      className="bg-primary text-white w-8 h-6 p-0 rounded-md flex items-center justify-center"
                    >
                      <MoreHorizontal />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => { setPrevViewWasOpen(isViewDialogOpen); setBulkAction("approve"); setIsViewDialogOpen(false); setIsBulkModalOpen(true); }}
                      disabled={!canBulkApprove}
                      className="text-green-600"
                    >
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => { setPrevViewWasOpen(isViewDialogOpen); setBulkAction("reject"); setIsViewDialogOpen(false); setIsBulkModalOpen(true); }}
                      disabled={!canBulkReject}
                      className="text-red-600"
                    >
                      <XCircle className="h-4 w-4 text-red-600" />
                      Reject
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={async () => {
                        const ids = selectedIds.slice();
                        const rows = refunds.filter(r=>ids.includes(r.id)).map(r=>`"${r.id}","${r.orderId}","${r.customer}","${r.status}","${r.amount}"`);
                        const csv = ["Refund ID,Order ID,Customer,Status,Amount", ...rows].join("\n");
                        const blob = new Blob([csv], { type: "text/csv" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `refunds_export_${Date.now()}.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                        toast.success(`Exported ${ids.length} refunds`);
                      }}
                    >
                      Export
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              </div>
                {mixedStatus ? (
                  <div
                    className="w-full flex items-center gap-2 bg-amber-50 text-amber-800 px-3 py-2 rounded-md text-sm"
                    role="status"
                    aria-live="polite"
                  >
                    <Info className="h-4 w-4" />
                    <span>Selected refunds have different statuses. Some bulk actions may be disabled.</span>
                  </div>
                ) : null}
              </div>
             
            </div>

            
          )
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <input
                    type="checkbox"
                    checked={filteredRefunds.length > 0 && filteredRefunds.every(r => selectedIds.includes(r.id))}
                    onChange={() => toggleSelectAllVisible(filteredRefunds.map(r => r.id))}
                    aria-label="Select all visible refunds"
                  />
                </TableHead>
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
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={isSelected(refund.id)}
                        onChange={() => toggleSelect(refund.id)}
                        aria-label={`Select refund ${refund.id}`}
                      />
                    </TableCell>
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
                    colSpan={9}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No refund requests found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination removed as requested */}
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

            <div className="space-y-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base -mb-16">
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
                  <h4 className="text-sm font-medium pt-2 mb-2">Your Response</h4>
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
                    onClick={handleRejectClick}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  {/* <Button
                    className="flex-1"
                    onClick={handleApproveRefund}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button> */}
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

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Rejection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this refund request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsRejectDialogOpen(false);
                if (prevViewWasOpen) {
                  setIsViewDialogOpen(true);
                  setPrevViewWasOpen(false);
                }
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRejectConfirm}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Reject Refund
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Action Confirmation Dialog */}
      <AlertDialog open={isBulkModalOpen} onOpenChange={setIsBulkModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkAction === "approve" && `Approve ${selectedIds.length} refund(s)`}
              {bulkAction === "reject" && `Reject ${selectedIds.length} refund(s)`}
              {bulkAction === "export" && `Export ${selectedIds.length} refund(s)`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAction === "approve" && (
                <p>Are you sure you want to approve {selectedIds.length} refund(s)? This will mark them as Approved.</p>
              )}
              {bulkAction === "reject" && (
                <p>Are you sure you want to reject {selectedIds.length} refund(s)? This action cannot be undone. A rejection reason is required.</p>
              )}
              {bulkAction === "export" && (
                <p>This will export the selected refunds to CSV.</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="p-4">
            {bulkAction === "reject" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Rejection Reason (required)</label>
                <Textarea
                  value={bulkRejectReason}
                  onChange={(e) => setBulkRejectReason(e.target.value)}
                  placeholder="Provide a reason for rejecting these refunds"
                  rows={3}
                />
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isProcessingBulk}
              onClick={() => {
                setIsBulkModalOpen(false);
                if (prevViewWasOpen) {
                  setIsViewDialogOpen(true);
                  setPrevViewWasOpen(false);
                }
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!bulkAction) return;
                if (bulkAction === "reject" && !bulkRejectReason.trim()) {
                  toast.error("Please provide a rejection reason");
                  return;
                }

                const ids = selectedIds.slice();
                setIsBulkModalOpen(false);
                setPrevViewWasOpen(false);
                const results = await performBulkAction(bulkAction, ids, bulkRejectReason);

                const successCount = results.filter(r => r.success).length;
                const failCount = results.length - successCount;

                if (bulkAction === "export") {
                  // Export handled earlier in-export path; but keep notification
                  toast.success(`Exported ${successCount} refunds`);
                } else if (failCount === 0) {
                  toast.success(`${successCount} refunds updated successfully`);
                } else if (successCount > 0) {
                  toast(`Partial success: ${successCount} succeeded, ${failCount} failed`);
                } else {
                  toast.error(`Bulk action failed for all selected refunds`);
                }

                // Deselect the successfully processed ids
                const succeededIds = results.filter(r=>r.success).map(r=>r.id);
                setSelectedIds((prev) => prev.filter(id => !succeededIds.includes(id)));
                setBulkRejectReason("");
                setBulkAction(null);
              }}
              className={bulkAction === "reject" ? "bg-red-600 text-white hover:bg-red-700" : ""}
              disabled={isProcessingBulk}
            >
              {isProcessingBulk ? "Processing..." : (bulkAction === "reject" ? "Confirm Reject" : "Confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
