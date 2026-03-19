"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeliveryRatingCardProps {
  onSubmit: (rating: number, comment: string) => void;
  existingRating?: number;
  existingComment?: string;
  className?: string;
}

export default function DeliveryRatingCard({
  onSubmit,
  existingRating,
  existingComment,
  className,
}: DeliveryRatingCardProps) {
  const hasExistingRating = typeof existingRating === "number" && existingRating > 0;
  const [rating, setRating] = useState<number>(existingRating ?? 0);
  const [comment, setComment] = useState<string>(existingComment ?? "");
  const [submitted, setSubmitted] = useState<boolean>(hasExistingRating);

  const canSubmit = useMemo(
    () => rating > 0 && !submitted,
    [rating, submitted]
  );

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    onSubmit(rating, comment.trim());
    setSubmitted(true);
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-emerald-200 bg-white p-4 shadow-sm",
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-emerald-900">Rate this delivery</h3>
        {submitted && (
          <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
            Submitted
          </span>
        )}
      </div>

      <div className="mb-3 flex items-center gap-1" role="group" aria-label="Delivery rating">
        {Array.from({ length: 5 }, (_, index) => {
          const value = index + 1;
          const isActive = value <= rating;
          return (
            <button
              key={value}
              type="button"
              aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
              disabled={submitted}
              onClick={() => setRating(value)}
              className="rounded p-1 transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Star
                className={cn(
                  "h-6 w-6",
                  isActive ? "fill-emerald-500 text-emerald-500" : "text-gray-300"
                )}
              />
            </button>
          );
        })}
      </div>

      <label className="mb-1 block text-xs font-medium text-gray-600" htmlFor="delivery-rating-comment">
        Comment (optional)
      </label>
      <textarea
        id="delivery-rating-comment"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        disabled={submitted}
        placeholder="Share your delivery experience"
        className="mb-3 min-h-20 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-gray-50 disabled:text-gray-500"
      />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="inline-flex min-h-10 items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
      >
        {submitted ? "Rating submitted" : "Submit rating"}
      </button>
    </div>
  );
}
