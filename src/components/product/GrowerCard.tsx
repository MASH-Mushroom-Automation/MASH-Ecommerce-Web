"use client";

import React, { useState, useRef, useEffect } from "react";
import FocusTrap from 'focus-trap-react';
import { Star, MapPin, MessageCircle, Calendar, Mail, ExternalLink, Maximize2, X, Navigation, Phone, Store, Shield, Clock, Truck } from "lucide-react";
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
  phone?: string;
  isVerified?: boolean;
  responseTime?: string; // e.g., "Usually responds within 1 hour"
  deliveryInfo?: string; // e.g., "Free delivery within Metro Manila"
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
  const [showMapModal, setShowMapModal] = useState(false);
  const expandBtnRef = useRef<HTMLButtonElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

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

  const embedSrc = getEmbedSrc();

  // Generate directions URL
  const getDirectionsUrl = () => {
    if (grower.latitude !== undefined && grower.longitude !== undefined) {
      return `https://www.google.com/maps/dir/?api=1&destination=${grower.latitude},${grower.longitude}`;
    }
    if (location) {
      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`;
    }
    return null;
  };

  const directionsUrl = getDirectionsUrl();

  useEffect(() => {
    if (!showMapModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMapModal(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    setTimeout(() => closeBtnRef.current?.focus(), 0);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      expandBtnRef.current?.focus();
    };
  }, [showMapModal]);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden" data-testid="grower-card">
      {/* Header Section */}
      <div className="p-5 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider mb-3">
          <Store className="w-3.5 h-3.5" />
          <span>Seller</span>
        </div>
        
        <div className="flex items-start gap-4">
          {/* Seller Avatar */}
          <div className="relative flex-shrink-0">
            {grower.image ? (
              <img 
                src={grower.image} 
                alt={`Seller: ${name}`} 
                className="w-16 h-16 rounded-xl object-cover ring-2 ring-white shadow-md" 
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-2 ring-white shadow-md">
                <span className="text-lg font-bold text-primary">
                  {name.split(' ').map(s => s[0]).slice(0,2).join('')}
                </span>
              </div>
            )}
            {grower.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1 shadow-sm">
                <Shield className="w-3 h-3" />
              </div>
            )}
          </div>

          {/* Seller Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground text-lg truncate">{name}</h3>
              {grower.isVerified && (
                <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  <Shield className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3 mt-1.5">
              {/* Rating */}
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "w-4 h-4",
                        star <= Math.round(rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-200"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-foreground">{rating.toFixed(1)}</span>
              </div>
              
              {rating >= 4.5 && (
                <span className="text-xs text-green-600 font-medium">Top Rated</span>
              )}
            </div>

            {/* Quick Info Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              {grower.responseTime && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                  <Clock className="w-3 h-3" />
                  {grower.responseTime}
                </span>
              )}
              {grower.deliveryInfo && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                  <Truck className="w-3 h-3" />
                  {grower.deliveryInfo}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-b border-border/50 bg-muted/20">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              if (onQuickChat) return onQuickChat();
              window.location.href = `mailto:${contactEmail || ''}?subject=${encodeURIComponent('Inquiry about ' + (productName || 'product'))}`;
            }}
            data-testid="contact-chat-btn"
            className="flex-1 min-w-[140px]"
            size="sm"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Quick Chat
          </Button>
          
          {calcomUsername ? (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="flex-1 min-w-[140px] border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
              data-testid="calcom-btn"
            >
              <a
                href={`https://cal.com/${calcomUsername}${grower.defaultEventSlug ? `/${grower.defaultEventSlug}` : ''}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Calendar className="w-4 h-4 mr-2" />
                {calcomButtonText || 'Book Appointment'}
              </a>
            </Button>
          ) : contactEmail && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="flex-1 min-w-[140px]"
              data-testid="mailto-link"
            >
              <a href={`mailto:${contactEmail}`}>
                <Mail className="w-4 h-4 mr-2" />
                Email Seller
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Map Section */}
      <div className="relative">
        {location || embedSrc ? (
          <div className="relative">
            {embedSrc ? (
              <>
                {/* Map Container with proper aspect ratio */}
                <div 
                  role="region" 
                  aria-label="Seller location" 
                  className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-muted"
                >
                  {!mapLoaded && !mapError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">Loading map...</p>
                      </div>
                    </div>
                  )}
                  
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
                  
                  {/* Map Overlay Controls */}
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end pointer-events-none">
                    {/* Location Badge */}
                    {location && (
                      <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg max-w-[60%] pointer-events-auto">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-foreground font-medium line-clamp-2">{location}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 pointer-events-auto">
                      {directionsUrl && (
                        <a
                          href={directionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg text-xs font-medium text-primary hover:bg-white shadow-lg transition-colors"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Directions</span>
                        </a>
                      )}
                      
                      <button
                        ref={expandBtnRef}
                        data-testid="grower-map-expand"
                        onClick={() => setShowMapModal(true)}
                        className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-white shadow-lg transition-colors"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Expand</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Open in Google Maps Link */}
                <div className="p-3 bg-muted/30 border-t border-border/50">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location || `${grower.latitude},${grower.longitude}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in Google Maps
                  </a>
                </div>
              </>
            ) : (
              /* No embed available - show link */
              <div className="p-6 text-center">
                {mapError ? (
                  <div className="space-y-3" data-testid={renderTestIds ? "grower-map-error" : undefined}>
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                      <MapPin className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Map couldn't be loaded</p>
                      <p className="text-sm text-muted-foreground mt-1">View the location directly on Google Maps</p>
                    </div>
                    <a
                      data-testid={renderTestIds ? "grower-map-link" : undefined}
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location || '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open in Google Maps
                    </a>
                  </div>
                ) : (
                  <a
                    data-testid="grower-map-link"
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location || '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <MapPin className="w-4 h-4" />
                    View on Google Maps
                  </a>
                )}
              </div>
            )}
          </div>
        ) : (
          /* No location provided */
          <div 
            className="p-6 text-center bg-muted/30" 
            data-testid={renderTestIds ? "grower-location-empty" : undefined}
          >
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">Location not shared</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
              Contact the seller for pickup location or delivery options
            </p>
          </div>
        )}
      </div>

      {/* Expanded Map Modal */}
      {showMapModal && embedSrc && (
        <div 
          data-testid="grower-map-modal" 
          role="dialog" 
          aria-modal="true" 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && setShowMapModal(false)}
        >
          {process.env.NODE_ENV !== 'test' ? (
            <FocusTrap active={showMapModal} focusTrapOptions={{ clickOutsideDeactivates: true }}>
              <div className="bg-white rounded-2xl w-full h-full max-w-6xl max-h-[90vh] overflow-hidden relative shadow-2xl flex flex-col">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{name}</h3>
                      {location && (
                        <p className="text-sm text-muted-foreground truncate max-w-md">{location}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {directionsUrl && (
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        <Navigation className="w-4 h-4" />
                        Get Directions
                      </a>
                    )}
                    <button 
                      ref={closeBtnRef}
                      aria-label="Close map" 
                      onClick={() => setShowMapModal(false)} 
                      className="w-10 h-10 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {/* Map */}
                <div className="flex-1 relative">
                  <button style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true" tabIndex={0}></button>
                  <iframe
                    data-testid="grower-map-large"
                    title="Seller location large"
                    src={embedSrc}
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    tabIndex={-1}
                  />
                </div>
              </div>
            </FocusTrap>
          ) : (
            <div className="bg-white rounded-2xl w-full h-full max-w-6xl max-h-[90vh] overflow-hidden relative shadow-2xl flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">{name}</h3>
                <button 
                  ref={closeBtnRef}
                  aria-label="Close map" 
                  onClick={() => setShowMapModal(false)} 
                  className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1">
                <iframe
                  data-testid="grower-map-large"
                  title="Seller location large"
                  src={embedSrc}
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  tabIndex={-1}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GrowerCard;
