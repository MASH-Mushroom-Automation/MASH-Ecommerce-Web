"use client";

import { useState } from "react";
import { Camera, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DeliveryProofImageProps {
  imageUrl?: string | null;
  timestamp?: string | null;
  alt?: string;
  className?: string;
}

export default function DeliveryProofImage({
  imageUrl,
  timestamp,
  alt = "Proof of delivery",
  className,
}: DeliveryProofImageProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  if (!imageUrl) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-muted-foreground",
          className
        )}
      >
        <Camera className="h-8 w-8 mb-2" />
        <p className="text-sm">No delivery proof available</p>
      </div>
    );
  }

  const formattedTimestamp = timestamp
    ? new Date(timestamp).toLocaleString()
    : null;

  return (
    <>
      <div className={cn("relative rounded-lg overflow-hidden border", className)}>
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-48 object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-black/50 px-3 py-1.5">
          {formattedTimestamp && (
            <span className="text-xs text-white">{formattedTimestamp}</span>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:text-white hover:bg-white/20 ml-auto"
            onClick={() => setIsZoomed(true)}
            aria-label="Zoom image"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isZoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setIsZoomed(false)}
          role="dialog"
          aria-label="Zoomed delivery proof"
        >
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-4 right-4 text-white hover:text-white hover:bg-white/20"
            onClick={() => setIsZoomed(false)}
            aria-label="Close zoom"
          >
            <X className="h-5 w-5" />
          </Button>
          <img
            src={imageUrl}
            alt={alt}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          {formattedTimestamp && (
            <span className="absolute bottom-6 text-sm text-white bg-black/60 px-3 py-1 rounded">
              {formattedTimestamp}
            </span>
          )}
        </div>
      )}
    </>
  );
}
