"use client";

import React, { useState } from "react";
import { Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Grower {
  name: string;
  rating?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  calcomUsername?: string;
  defaultEventSlug?: string;
  contactEmail?: string;
  calcomButtonText?: string;
  googleMapsEmbedUrl?: string; // pb-style embed URL from Google Maps share/embed snippet
  image?: string; // URL to grower logo/avatar
}

interface GrowerCardProps {
  grower: Grower;
  productName?: string;
  onQuickChat?: () => void;
  // When false, internal test ids for location and map placeholders are omitted to avoid duplicates
  renderTestIds?: boolean;
}

export function GrowerCard({ grower, productName, onQuickChat, renderTestIds = true }: GrowerCardProps) {
  const { name, rating = 0, location, calcomUsername, contactEmail, calcomButtonText, googleMapsEmbedUrl } = grower;
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [resolvedEmbed, setResolvedEmbed] = useState<string | null | undefined>(undefined);

  // Resolve short maps.app.goo.gl URLs server-side to get an embeddable URL when possible
  React.useEffect(() => {
    let mounted = true;
    if (googleMapsEmbedUrl && googleMapsEmbedUrl.includes('maps.app.goo.gl')) {
      (async () => {
        try {
          const res = await fetch('/api/maps/resolve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: googleMapsEmbedUrl }),
          });
          const json = await res.json();
          if (mounted) setResolvedEmbed(json?.embedUrl ?? null);
        } catch (err) {
          if (mounted) setResolvedEmbed(null);
        }
      })();
    }
    return () => {
      mounted = false;
    };
  }, [googleMapsEmbedUrl]);

  // Candidate embed URL (resolved for short links when available)
  const coordsEmbed = (grower.latitude !== undefined && grower.longitude !== undefined)
    ? `https://www.google.com/maps?q=${encodeURIComponent(`${grower.latitude},${grower.longitude}`)}&z=15&output=embed`
    : null;

  // If the provided URL is a short maps.app link, prefer the resolver result, but fall back to coords if resolver returns null.
  let embedCandidate: string | undefined | null = undefined;
  if (googleMapsEmbedUrl && googleMapsEmbedUrl.includes('maps.app.goo.gl')) {
    embedCandidate = resolvedEmbed ?? coordsEmbed ?? undefined;
  } else {
    embedCandidate = googleMapsEmbedUrl ?? coordsEmbed ?? undefined;
  }

  // Unified embed src helper for both the inline map and the expanded modal
  const getEmbedSrc = () => {
    if (embedCandidate) return embedCandidate;
    if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && location) {
      return `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(location)}`;
    }
    return coordsEmbed ?? null;
  };

  const [showMapModal, setShowMapModal] = useState(false);

  const embedSrc = getEmbedSrc();

  return (
    <div className={cn("bg-card rounded-xl p-5 border shadow-sm", "border-border")} data-testid="grower-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Seller</div>
          <div className="flex items-center gap-2">
            {grower.image ? (
              <img src={grower.image} alt={`Seller: ${name}`} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">{name.split(' ').map(s => s[0]).slice(0,2).join('')}</div>
            )}

            <div>
              <div className="font-semibold text-foreground">{name}</div>
              <div className="flex items-center gap-1 text-sm text-yellow-600">
                <Star className="w-4 h-4" />
                <span>{rating.toFixed(1)}</span>
              </div>
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md text-sm hover:opacity-90"
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary/90"
          >
            Quick Chat
          </button>

          <div className="mt-2 w-full">
            {location ? (
              // Use unified embed source and render a larger responsive map with expand CTA
              embedSrc ? (
                <div role="region" aria-label={`Seller location`} className="w-full h-56 md:h-72 rounded overflow-hidden border relative">
                  <iframe
                    data-testid={renderTestIds ? "grower-map" : undefined}
                    title="Seller location"
                    src={embedSrc}
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    onLoad={() => setMapLoaded(true)}
                    onError={() => setMapError(true)}
                    aria-hidden={false}
                  />

                  <button
                    data-testid="grower-map-expand"
                    onClick={() => setShowMapModal(true)}
                    className="absolute right-2 bottom-2 inline-flex items-center gap-2 bg-white/90 px-3 py-1 rounded-md text-sm shadow-sm hover:opacity-95"
                  >
                    View larger map
                  </button>
                </div>
              ) : (
                <div>
                  {mapError ? (
                    <div className="p-3 rounded bg-muted/50 text-sm text-muted-foreground" data-testid={renderTestIds ? "grower-map-error" : undefined}>
                      <div className="font-medium text-foreground">Map failed to load</div>
                      <div className="text-sm mt-1">The seller's location could not be embedded. You can view it on Google Maps or contact the seller directly.</div>
                      <div className="mt-2">
                        <a
                          data-testid={renderTestIds ? "grower-map-link" : undefined}
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-primary hover:underline mt-1"
                        >
                          <MapPin className="w-4 h-4" />
                          View on Google Maps
                        </a>
                      </div>
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
                  )}
                </div>
              )
            ) : (
              <div data-testid={renderTestIds ? "grower-location-empty" : undefined} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start p-3 border rounded bg-muted text-sm text-muted-foreground">
                <div>
                  <div className="font-medium text-foreground">Location not provided</div>
                  <div className="text-sm mt-1">This seller has not shared a precise location for this listing. If you'd like to know where the product is from, contact the seller using the appointment button or Quick Chat below.</div>

                  <div className="mt-3 flex items-center gap-2">
                    {calcomUsername ? (
                      <a
                        data-testid={renderTestIds ? "calcom-btn-empty" : undefined}
                        href={`https://cal.com/${calcomUsername}${calcomUsername && grower.defaultEventSlug ? `/${grower.defaultEventSlug}` : ''}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-md text-sm hover:opacity-90"
                      >
                        {calcomButtonText || 'Schedule with Grower'}
                      </a>
                    ) : (
                      <a data-testid={renderTestIds ? "mailto-link-empty" : undefined} href={`mailto:${contactEmail || ''}`} className="text-sm text-amber-600 hover:underline">Contact seller</a>
                    )}

                    <button
                      onClick={() => {
                        if (onQuickChat) return onQuickChat();
                        window.location.href = `mailto:${contactEmail || ''}?subject=${encodeURIComponent('Inquiry about ' + (productName || 'product'))}`;
                      }}
                      data-testid={renderTestIds ? "contact-chat-btn-empty" : undefined}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary/90"
                    >
                      Quick Chat
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-center rounded border bg-white/5 p-4" data-testid={renderTestIds ? "grower-map-placeholder" : undefined} aria-hidden="false">
                  <div className="flex flex-col items-center text-sm text-muted-foreground">
                    <MapPin className="w-8 h-8 text-muted-foreground mb-2" />
                    <div className="font-medium text-foreground">No map available</div>
                    <div className="text-sm mt-1">Seller has not provided a location for this product listing.</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded map modal */}
      {showMapModal && embedSrc && (
        <div data-testid="grower-map-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg w-[90%] md:w-[70%] h-[80%] overflow-hidden relative">
            <button aria-label="Close map" onClick={() => setShowMapModal(false)} className="absolute top-3 right-3 z-10 px-3 py-1 bg-white rounded">×</button>
            <iframe
              data-testid="grower-map-large"
              title="Seller location large"
              src={embedSrc}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default GrowerCard;
