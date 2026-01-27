"use client";

import React from "react";
import { Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Grower {
  name: string;
  rating?: number;
  location?: string;
  calcomUsername?: string;
  defaultEventSlug?: string;
  contactEmail?: string;
}

interface GrowerCardProps {
  grower: Grower;
  productName?: string;
  onQuickChat?: () => void;
}

export function GrowerCard({ grower, productName, onQuickChat }: GrowerCardProps) {
  const { name, rating = 0, location, calcomUsername, contactEmail } = grower;

  return (
    <div className={cn("bg-card rounded-xl p-4 border", "border-border") } data-testid="grower-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Seller</div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{name}</span>
            <div className="flex items-center gap-1 text-sm text-yellow-600">
              <Star className="w-4 h-4" />
              <span>{rating.toFixed(1)}</span>
            </div>
            {rating >= 4.5 && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Highly rated on Marketplace</span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {calcomUsername ? (
            <Button data-testid="calcom-btn" size="sm">Book: {calcomUsername}</Button>
          ) : (
            <a data-testid="mailto-link" href={`mailto:${contactEmail || ""}`} className="text-sm text-amber-600 hover:underline">Contact seller</a>
          )}

          <button
            type="button"
            onClick={() => {
              if (onQuickChat) return onQuickChat();
              // Fallback behaviour: open mailto if no handler
              window.location.href = `mailto:${contactEmail || ""}?subject=${encodeURIComponent('Inquiry about ' + (productName || 'product'))}`;
            }}
            data-testid="contact-chat-btn"
            className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary/90"
          >
            Quick Chat
          </button>

          {location && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline mt-1"
            >
              <MapPin className="w-4 h-4" />
              View on Google Maps
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default GrowerCard;
