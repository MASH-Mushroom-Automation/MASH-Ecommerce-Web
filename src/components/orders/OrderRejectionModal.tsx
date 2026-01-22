/**
 * Order Rejection Modal Component
 * Modal for rejecting orders with a reason
 */

"use client";

import React, { useState } from "react";
import { XCircle, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderRejectionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  orderNumber: string;
  loading?: boolean;
}

// Predefined rejection reasons
const REJECTION_REASONS = [
  "Out of Stock",
  "Cannot Deliver to Location",
  "Pricing Error",
  "Seller Unavailable",
  "Customer Request",
  "Payment Issue",
  "Other",
];

export function OrderRejectionModal({
  open,
  onClose,
  onConfirm,
  orderNumber,
  loading = false,
}: OrderRejectionModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");

  const handleConfirm = () => {
    const finalReason =
      selectedReason === "Other" ? customReason : selectedReason;

    if (!finalReason.trim()) {
      // You can add a toast notification here
      return;
    }

    onConfirm(finalReason);
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedReason("");
      setCustomReason("");
      onClose();
    }
  };

  const isConfirmDisabled =
    !selectedReason ||
    (selectedReason === "Other" && !customReason.trim()) ||
    loading;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Cancel Order {orderNumber}
          </DialogTitle>
          <DialogDescription>
            Please select a reason for cancelling this order. This information
            will be sent to the customer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Reason Selection */}
          <div className="space-y-2">
            <Label htmlFor="reason">Cancellation Reason *</Label>
            <Select
              value={selectedReason}
              onValueChange={setSelectedReason}
              disabled={loading}
            >
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REJECTION_REASONS.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Reason Text Area */}
          {selectedReason === "Other" && (
            <div className="space-y-2">
              <Label htmlFor="custom-reason">Please specify the reason *</Label>
              <Textarea
                id="custom-reason"
                placeholder="Enter the specific reason for cancellation..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                disabled={loading}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {customReason.length}/500 characters
              </p>
            </div>
          )}

          {/* Warning Message */}
          <div className="flex items-start gap-2 p-3 rounded-md bg-amber-50 border border-amber-200">
            <XCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-900">
                This action cannot be undone
              </p>
              <p className="text-xs text-amber-700">
                The customer will be notified via email about the cancellation
                and the reason provided.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Go Back
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Cancelling...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Confirm Cancellation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
