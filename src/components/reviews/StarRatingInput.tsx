/**
 * StarRatingInput Component
 *
 * Interactive star rating selector for review forms.
 * Supports hover preview, click selection, and keyboard navigation.
 */

"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingInputProps {
  /** Current selected rating (1-5) */
  value: number;
  /** Callback when rating changes */
  onChange: (rating: number) => void;
  /** Size of stars in pixels */
  size?: number;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Optional label */
  label?: string;
}

const RATING_LABELS = [
  "",
  "Poor",
  "Fair",
  "Good",
  "Very Good",
  "Excellent",
];

export function StarRatingInput({
  value,
  onChange,
  size = 28,
  disabled = false,
  label = "Your Rating",
}: StarRatingInputProps) {
  const [hoverValue, setHoverValue] = useState(0);

  const displayValue = hoverValue || value;

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            className={cn(
              "transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded",
              disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
            )}
            onClick={() => !disabled && onChange(star)}
            onMouseEnter={() => !disabled && setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" && star < 5) {
                onChange(star + 1);
              } else if (e.key === "ArrowLeft" && star > 1) {
                onChange(star - 1);
              }
            }}
            aria-label={`Rate ${star} out of 5 stars`}
          >
            <Star
              className={cn(
                "transition-colors",
                star <= displayValue
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300",
              )}
              style={{ width: size, height: size }}
            />
          </button>
        ))}
        {displayValue > 0 && (
          <span className="ml-2 text-sm text-muted-foreground">
            {RATING_LABELS[displayValue]}
          </span>
        )}
      </div>
    </div>
  );
}
