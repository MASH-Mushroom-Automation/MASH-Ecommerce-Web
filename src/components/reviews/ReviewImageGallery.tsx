/**
 * ReviewImageGallery Component
 *
 * Displays review image thumbnails with a full-screen lightbox.
 * Shows max 3 thumbnails with a "+X more" badge. Clicking opens a
 * lightbox dialog with prev/next navigation.
 */

"use client";

import React, { useCallback, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const MAX_VISIBLE = 3;

interface ReviewImageGalleryProps {
  /** Array of image URLs */
  images: string[];
  /** Reviewer name for alt text */
  reviewerName?: string;
}

export function ReviewImageGallery({
  images,
  reviewerName = "Customer",
}: ReviewImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const visibleImages = images.slice(0, MAX_VISIBLE);
  const extraCount = images.length - MAX_VISIBLE;

  const openLightbox = useCallback((index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    },
    [goNext, goPrev]
  );

  if (!images || images.length === 0) return null;

  return (
    <>
      {/* Thumbnail Grid */}
      <div className="flex gap-1.5 mt-2 flex-wrap">
        {visibleImages.map((url, index) => (
          <button
            key={url}
            type="button"
            onClick={() => openLightbox(index)}
            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden border hover:ring-2 hover:ring-primary/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={`View photo ${index + 1} by ${reviewerName}`}
          >
            <Image
              src={url}
              alt={`Review photo ${index + 1} by ${reviewerName}`}
              fill
              className="object-cover"
              sizes="80px"
              loading="lazy"
            />
          </button>
        ))}

        {/* +X more badge */}
        {extraCount > 0 && (
          <button
            type="button"
            onClick={() => openLightbox(MAX_VISIBLE)}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-md border bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={`View ${extraCount} more photos`}
          >
            <span className="text-sm font-medium text-muted-foreground">
              +{extraCount}
            </span>
          </button>
        )}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className="max-w-4xl w-full h-[80vh] p-0 bg-black/95 border-none"
          onKeyDown={handleKeyDown}
        >
          <VisuallyHidden>
            <DialogTitle>Review photo {currentIndex + 1} of {images.length}</DialogTitle>
          </VisuallyHidden>

          {/* Close button */}
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-3 right-3 z-50 text-white/80 hover:text-white bg-black/40 rounded-full p-1.5 transition-colors"
            aria-label="Close lightbox"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Image counter */}
          <div className="absolute top-3 left-3 z-50 text-white/80 text-sm bg-black/40 px-3 py-1 rounded-full">
            {currentIndex + 1} of {images.length}
          </div>

          {/* Main image */}
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={images[currentIndex]}
              alt={`Review photo ${currentIndex + 1} by ${reviewerName}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 900px"
              priority
            />
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-50 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-50 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
