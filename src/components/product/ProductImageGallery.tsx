"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X, Maximize2, Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface GalleryItem {
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  videoId?: string;
  videoSource?: 'youtube' | 'vimeo' | 'file';
  alt?: string;
  title?: string;
  isPrimary?: boolean;
}

interface ProductImageGalleryProps {
  items: GalleryItem[];
  productName: string;
}

export function ProductImageGallery({ items, productName }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const imageRef = useRef<HTMLDivElement>(null);

  const activeItem = items[activeIndex] || items[0];
  const hasMultipleItems = items.length > 1;

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
    setImageLoaded(false);
    setIsZoomed(false);
  }, [items.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
    setImageLoaded(false);
    setIsZoomed(false);
  }, [items.length]);

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
    setImageLoaded(false);
    setIsZoomed(false);
  };

  // Zoom on hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
  };

  const handleMouseEnter = () => {
    if (activeItem?.type === 'image') {
      setIsZoomed(true);
    }
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
    setZoomPosition({ x: 50, y: 50 });
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
        setIsZoomed(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrev, handleNext]);

  if (items.length === 0) {
    return (
      <div className="aspect-square bg-muted rounded-xl flex items-center justify-center">
        <span className="text-muted-foreground">No Image Available</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Display */}
      <div 
        ref={imageRef}
        className="relative aspect-square bg-muted rounded-xl overflow-hidden group cursor-zoom-in"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => activeItem?.type === 'image' && setIsLightboxOpen(true)}
      >
        {activeItem?.type === 'video' ? (
          // Video Display
          activeItem.videoSource === 'youtube' && activeItem.videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${activeItem.videoId}?rel=0&modestbranding=1`}
              title={activeItem.title || 'Product Video'}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : activeItem.videoSource === 'vimeo' && activeItem.videoId ? (
            <iframe
              src={`https://player.vimeo.com/video/${activeItem.videoId}`}
              title={activeItem.title || 'Product Video'}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : activeItem.videoSource === 'file' ? (
            <video
              src={activeItem.url}
              controls
              className="absolute inset-0 w-full h-full object-contain bg-black"
            >
              Your browser does not support the video tag.
            </video>
          ) : null
        ) : (
          // Image Display with Zoom
          <>
            {/* Skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
            
            {/* Main Image */}
            <Image
              src={activeItem?.url || ''}
              alt={activeItem?.alt || productName}
              fill
              className={cn(
                "object-cover transition-all duration-300",
                imageLoaded ? "opacity-100" : "opacity-0",
                isZoomed && "scale-150"
              )}
              style={isZoomed ? {
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
              } : undefined}
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              onLoad={() => setImageLoaded(true)}
            />
            
            {/* Zoom indicator */}
            <div className={cn(
              "absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-opacity duration-200",
              "opacity-0 group-hover:opacity-100"
            )}>
              {isZoomed ? (
                <>
                  <ZoomOut className="h-3.5 w-3.5" />
                  Click to expand
                </>
              ) : (
                <>
                  <ZoomIn className="h-3.5 w-3.5" />
                  Hover to zoom
                </>
              )}
            </div>

            {/* Fullscreen button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(true);
              }}
              className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/80"
              aria-label="View fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Navigation Arrows */}
        {hasMultipleItems && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-105 opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-105 opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {hasMultipleItems && (
          <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-medium">
            {activeIndex + 1} / {items.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {hasMultipleItems && (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleThumbnailClick(idx)}
              className={cn(
                "relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200",
                activeIndex === idx
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-transparent hover:border-primary/50 opacity-70 hover:opacity-100"
              )}
            >
              {item.type === 'video' ? (
                <>
                  {item.thumbnailUrl ? (
                    <Image
                      src={item.thumbnailUrl}
                      alt={item.title || `Video ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="w-4 h-4 text-primary ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                </>
              ) : (
                <Image
                  src={item.url}
                  alt={item.alt || `${productName} - Image ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black border-none">
          <div className="relative w-full h-[90vh]">
            {/* Close button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              aria-label="Close lightbox"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Navigation */}
            {hasMultipleItems && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Image */}
            {activeItem?.type === 'image' && (
              <div className="relative w-full h-full flex items-center justify-center p-8">
                <Image
                  src={activeItem.url}
                  alt={activeItem.alt || productName}
                  fill
                  className="object-contain"
                  sizes="95vw"
                  priority
                />
              </div>
            )}

            {/* Counter */}
            {hasMultipleItems && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
                {activeIndex + 1} / {items.length}
              </div>
            )}

            {/* Thumbnails in lightbox */}
            {hasMultipleItems && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
                {items.slice(0, 8).map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleThumbnailClick(idx)}
                    className={cn(
                      "relative w-12 h-12 rounded-md overflow-hidden border-2 transition-all",
                      activeIndex === idx
                        ? "border-white"
                        : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    {item.type === 'image' && (
                      <Image
                        src={item.url}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    )}
                  </button>
                ))}
                {items.length > 8 && (
                  <div className="w-12 h-12 rounded-md bg-white/20 flex items-center justify-center text-white text-xs font-medium">
                    +{items.length - 8}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
