"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, Loader2, Pencil, Trash2, MessageSquare, Clock } from "lucide-react";
import { toast } from "sonner";
import { FirebaseReviewService } from "@/lib/firebase/reviews";
import { useAuth } from "@/contexts/AuthContext";
import type { FirestoreReview } from "@/types/reviews";

interface SellerResponseModalProps {
  open: boolean;
  onClose: () => void;
  review: FirestoreReview;
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-4 w-4 ${
            s <= rating ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

export function SellerResponseModal({ open, onClose, review }: SellerResponseModalProps) {
  const { user } = useAuth();
  const [response, setResponse] = useState(review.sellerResponse || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(!review.sellerResponse);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const hasExistingResponse = !!review.sellerResponse;
  const charCount = response.trim().length;
  const isValid = charCount >= 10 && charCount <= 500;

  // Check if within 24h edit window
  const canEdit = (): boolean => {
    if (!review.sellerResponseDate) return true;
    const responseDate = new Date(review.sellerResponseDate);
    const hoursElapsed = (Date.now() - responseDate.getTime()) / (1000 * 60 * 60);
    return hoursElapsed <= 24;
  };

  const handleSubmit = async () => {
    if (!user || !isValid) return;
    setIsSubmitting(true);
    try {
      if (hasExistingResponse) {
        await FirebaseReviewService.updateSellerResponse(
          review.id,
          user.uid,
          response.trim(),
        );
        toast.success("Response updated successfully");
      } else {
        await FirebaseReviewService.addSellerResponse(
          review.id,
          user.uid,
          user.displayName || "Seller",
          response.trim(),
        );
        toast.success("Response added successfully");
      }
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save response";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      await FirebaseReviewService.deleteSellerResponse(review.id, user.uid);
      toast.success("Response deleted");
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete response";
      toast.error(message);
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Details</DialogTitle>
        </DialogHeader>

        {/* Review Content */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{review.userName}</span>
              <RatingStars rating={review.rating} />
              {review.verifiedPurchase && (
                <Badge variant="secondary" className="text-xs">Verified</Badge>
              )}
            </div>
            {review.title && (
              <h4 className="font-medium text-foreground">{review.title}</h4>
            )}
            <p className="text-sm text-muted-foreground">{review.content}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{review.targetName}</span>
              <span>&middot;</span>
              <span>{new Date(review.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Review Images */}
          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {review.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Review image ${idx + 1}`}
                  className="w-16 h-16 rounded object-cover border"
                />
              ))}
            </div>
          )}

          <hr />

          {/* Existing Response Display */}
          {hasExistingResponse && !isEditing && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">Your Response</span>
              </div>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                {review.sellerResponse}
              </p>
              {review.sellerResponseDate && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    {new Date(review.sellerResponseDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex gap-2">
                {canEdit() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                )}
                {!confirmDelete ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      ) : null}
                      Confirm Delete
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmDelete(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
              {!canEdit() && (
                <p className="text-xs text-muted-foreground">
                  Edit window has expired (24 hours from posting)
                </p>
              )}
            </div>
          )}

          {/* Response Editor */}
          {isEditing && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">
                  {hasExistingResponse ? "Edit Response" : "Write a Response"}
                </span>
              </div>
              <Textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Write your response to this review... (minimum 10 characters)"
                rows={4}
                maxLength={500}
                className="resize-none"
              />
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs ${
                    charCount < 10 ? "text-red-500" : "text-muted-foreground"
                  }`}
                >
                  {charCount}/500 characters
                  {charCount < 10 && ` (${10 - charCount} more needed)`}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={!isValid || isSubmitting}
                  size="sm"
                >
                  {isSubmitting && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                  )}
                  {hasExistingResponse ? "Update Response" : "Submit Response"}
                </Button>
                {hasExistingResponse && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setResponse(review.sellerResponse || "");
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
