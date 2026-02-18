"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  XCircle,
  Flag,
  Star,
  Trash2,
  Loader2,
  MessageSquare,
  Calendar,
  ThumbsUp,
  Image as ImageIcon,
  User,
} from "lucide-react";
import type {
  FirestoreReview,
  ReviewStatus,
  ModerationAction,
  FlagReason,
} from "@/types/reviews";

/** Reject reason options matching FlagReason type */
const REJECT_REASONS: Array<{ value: FlagReason | "other"; label: string }> = [
  { value: "spam", label: "Spam" },
  { value: "inappropriate", label: "Inappropriate Content" },
  { value: "fake", label: "Fake Review" },
  { value: "offensive", label: "Offensive Language" },
  { value: "other", label: "Other" },
];

const STATUS_CONFIG: Record<
  ReviewStatus,
  { label: string; color: string; bgColor: string }
> = {
  pending: { label: "Pending", color: "text-yellow-700", bgColor: "bg-yellow-50" },
  approved: { label: "Approved", color: "text-green-700", bgColor: "bg-green-50" },
  flagged: { label: "Flagged", color: "text-orange-700", bgColor: "bg-orange-50" },
  rejected: { label: "Rejected", color: "text-red-700", bgColor: "bg-red-50" },
};

interface ReviewModerationModalProps {
  open: boolean;
  onClose: () => void;
  review: FirestoreReview;
  onModerate: (reviewId: string, action: ModerationAction, reason?: string) => Promise<void>;
  onAddAdminResponse: (reviewId: string, response: string) => Promise<void>;
  onDelete: (reviewId: string, reason?: string) => Promise<void>;
  onClearFlags: (reviewId: string) => Promise<void>;
}

export function ReviewModerationModal({
  open,
  onClose,
  review,
  onModerate,
  onAddAdminResponse,
  onDelete,
  onClearFlags,
}: ReviewModerationModalProps) {
  const [isActioning, setIsActioning] = useState(false);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [rejectReasonType, setRejectReasonType] = useState<string>("");
  const [adminResponse, setAdminResponse] = useState(review.adminResponse || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);

  const statusConfig = STATUS_CONFIG[review.status];

  const handleAction = async (action: ModerationAction, reason?: string) => {
    setIsActioning(true);
    try {
      await onModerate(review.id, action, reason);
      onClose();
    } catch {
      // Toast handled by hook
    } finally {
      setIsActioning(false);
    }
  };

  const handleReject = async () => {
    const reason = rejectReasonType === "other"
      ? rejectReason
      : REJECT_REASONS.find((r) => r.value === rejectReasonType)?.label || rejectReasonType;

    if (!reason) return;

    await handleAction("reject", reason);
    setShowRejectForm(false);
    setRejectReason("");
    setRejectReasonType("");
  };

  const handleDelete = async () => {
    setIsActioning(true);
    try {
      await onDelete(review.id, "Admin deleted review");
      setShowDeleteConfirm(false);
      onClose();
    } catch {
      // Toast handled by hook
    } finally {
      setIsActioning(false);
    }
  };

  const handleAddResponse = async () => {
    if (adminResponse.trim().length < 10) return;
    setIsActioning(true);
    try {
      await onAddAdminResponse(review.id, adminResponse.trim());
      setShowResponseForm(false);
    } catch {
      // Toast handled by hook
    } finally {
      setIsActioning(false);
    }
  };

  const handleClearFlags = async () => {
    setIsActioning(true);
    try {
      await onClearFlags(review.id);
    } catch {
      // Toast handled by hook
    } finally {
      setIsActioning(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Review Moderation
              <Badge className={`${statusConfig.color} ${statusConfig.bgColor}`}>
                {statusConfig.label}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Review details and moderation actions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Reviewer Info */}
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground">{review.userName}</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-muted text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  {review.helpfulCount > 0 && (
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      {review.helpfulCount} helpful
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Target Info */}
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Badge variant="outline">
                {review.targetType === "product" ? "Product" : "Grower"}
              </Badge>
              <span className="font-medium text-sm">{review.targetName}</span>
            </div>

            {/* Review Content */}
            <div className="space-y-2">
              {review.title && (
                <h4 className="font-semibold text-foreground">{review.title}</h4>
              )}
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {review.content}
              </p>
            </div>

            {/* Review Images */}
            {review.images && review.images.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <ImageIcon className="h-4 w-4" />
                  {review.images.length} image{review.images.length > 1 ? "s" : ""}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {review.images.map((img, idx) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img
                        src={img}
                        alt={`Review image ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-2 bg-muted/30 rounded">
                <span className="text-muted-foreground">Status:</span>{" "}
                <span className={`font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
              </div>
              <div className="p-2 bg-muted/30 rounded">
                <span className="text-muted-foreground">Helpful:</span>{" "}
                <span className="font-medium">{review.helpfulCount}</span>
              </div>
              <div className="p-2 bg-muted/30 rounded">
                <span className="text-muted-foreground">Flags:</span>{" "}
                <span className={`font-medium ${review.flagCount > 0 ? "text-red-600" : ""}`}>
                  {review.flagCount}
                </span>
              </div>
              {review.moderatedBy && (
                <div className="p-2 bg-muted/30 rounded">
                  <span className="text-muted-foreground">Moderated by:</span>{" "}
                  <span className="font-medium">{review.moderatedBy}</span>
                </div>
              )}
            </div>

            {/* Flag Reasons (if flagged) */}
            {review.flagCount > 0 && review.flagReasons && review.flagReasons.length > 0 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-orange-700">
                  <Flag className="h-4 w-4" />
                  Flag Reasons ({review.flagReasons.length})
                </div>
                <ul className="text-sm text-orange-600 space-y-1 pl-6 list-disc">
                  {review.flagReasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFlags}
                  disabled={isActioning}
                  className="mt-2"
                >
                  Clear All Flags
                </Button>
              </div>
            )}

            {/* Existing Seller Response */}
            {review.sellerResponse && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-1">
                <div className="flex items-center gap-1 text-sm font-medium text-blue-700">
                  <MessageSquare className="h-4 w-4" />
                  Seller Response
                </div>
                <p className="text-sm text-blue-600">{review.sellerResponse}</p>
                {review.sellerResponseDate && (
                  <p className="text-xs text-blue-500">
                    {new Date(review.sellerResponseDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Existing Admin Response */}
            {review.adminResponse && !showResponseForm && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg space-y-1">
                <div className="flex items-center gap-1 text-sm font-medium text-purple-700">
                  <MessageSquare className="h-4 w-4" />
                  Admin Response
                </div>
                <p className="text-sm text-purple-600">{review.adminResponse}</p>
                {review.adminResponseDate && (
                  <p className="text-xs text-purple-500">
                    {new Date(review.adminResponseDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Reject Form */}
            {showRejectForm && (
              <div className="p-4 border border-red-200 rounded-lg space-y-3">
                <h4 className="font-medium text-red-700">Reject Review</h4>
                <Select value={rejectReasonType} onValueChange={setRejectReasonType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rejection reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {REJECT_REASONS.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {rejectReasonType === "other" && (
                  <Textarea
                    placeholder="Enter custom rejection reason..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={2}
                  />
                )}
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRejectForm(false)}
                    disabled={isActioning}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleReject}
                    disabled={isActioning || !rejectReasonType || (rejectReasonType === "other" && !rejectReason.trim())}
                  >
                    {isActioning ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                    Confirm Reject
                  </Button>
                </div>
              </div>
            )}

            {/* Admin Response Form */}
            {showResponseForm && (
              <div className="p-4 border border-purple-200 rounded-lg space-y-3">
                <h4 className="font-medium text-purple-700">Admin Response</h4>
                <Textarea
                  placeholder="Write an admin response (min 10 characters)..."
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  rows={3}
                  maxLength={500}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {adminResponse.length}/500 characters
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowResponseForm(false)}
                      disabled={isActioning}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAddResponse}
                      disabled={isActioning || adminResponse.trim().length < 10}
                    >
                      {isActioning ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                      Save Response
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <DialogFooter className="flex-col sm:flex-row gap-2 pt-4 border-t">
            <div className="flex gap-2 flex-wrap">
              {review.status !== "approved" && (
                <Button
                  variant="outline"
                  onClick={() => handleAction("approve")}
                  disabled={isActioning}
                  className="border-green-200 text-green-700 hover:bg-green-50"
                >
                  {isActioning ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                  Approve
                </Button>
              )}

              {review.status !== "rejected" && !showRejectForm && (
                <Button
                  variant="outline"
                  onClick={() => setShowRejectForm(true)}
                  disabled={isActioning}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              )}

              {!showResponseForm && (
                <Button
                  variant="outline"
                  onClick={() => setShowResponseForm(true)}
                  disabled={isActioning}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  {review.adminResponse ? "Edit Response" : "Add Response"}
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isActioning}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this review by {review.userName}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActioning}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isActioning}
              className="bg-red-600 hover:bg-red-700"
            >
              {isActioning ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Delete Review
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
