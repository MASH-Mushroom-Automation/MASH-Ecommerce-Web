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
  const { name, rating = 0, location, calcomUsername, contactEmail, calcomButtonText } = grower;

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
            <a
              data-testid="calcom-btn"
              href={`https://cal.com/${calcomUsername}${calcomUsername && grower.defaultEventSlug ? `/${grower.defaultEventSlug}` : ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-md text-sm hover:opacity-90"
            >
              {calcomButtonText || 'Schedule with Grower'}
            </a>
          ) : (
            <a data-testid="mailto-link" href={`mailto:${contactEmail || ''}`} className="text-sm text-amber-600 hover:underline">Contact seller</a>
          )}

          <button
            onClick={() => {
              if (onQuickChat) return onQuickChat();
              // Fallback behaviour: open mailto if no handler
              window.location.href = `mailto:${contactEmail || ''}?subject=${encodeURIComponent('Inquiry about ' + (productName || 'product'))}`;
            }}
            data-testid="contact-chat-btn"
            className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary/90"
          >
            Quick Chat
          </button>

          <div className="mt-2 w-full">
            {location ? (
              process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                <div className="w-full h-40 rounded overflow-hidden border">
                  <iframe
                    data-testid="grower-map"
                    title="Seller location"
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(location)}`}
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              ) : (
                <a
                  data-testid="grower-map-link"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline mt-1"
                >
                  <MapPin className="w-4 h-4" />
                  View on Google Maps
                </a>
              )
            ) : (
              <div data-testid="grower-location-empty" className="p-3 border rounded bg-muted text-sm text-muted-foreground">
                <div className="font-medium text-foreground">Location not provided</div>
                <div className="text-sm mt-1">This seller has not shared a precise location. You can contact the seller using the appointment button or Quick Chat below.</div>

                <div className="mt-3 flex items-center gap-2">
                  {calcomUsername ? (
                    <a
                      data-testid="calcom-btn-empty"
                      href={`https://cal.com/${calcomUsername}${calcomUsername && grower.defaultEventSlug ? `/${grower.defaultEventSlug}` : ''}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-md text-sm hover:opacity-90"
                    >
                      {calcomButtonText || 'Schedule with Grower'}
                    </a>
                  ) : (
                    <a data-testid="mailto-link-empty" href={`mailto:${contactEmail || ''}`} className="text-sm text-amber-600 hover:underline">Contact seller</a>
                  )}

                  <button
                    onClick={() => {
                      if (onQuickChat) return onQuickChat();
                      window.location.href = `mailto:${contactEmail || ''}?subject=${encodeURIComponent('Inquiry about ' + (productName || 'product'))}`;
                    }}
                    data-testid="contact-chat-btn-empty"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary/90"
                  >
                    Quick Chat
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GrowerCard;
