"use client";

import React from "react";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import Image from "next/image";

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  videoSource?: 'youtube' | 'vimeo' | 'file';
  videoId?: string;
  alt?: string;
}

interface MediaGalleryProps {
  items: MediaItem[];
  productName?: string;
}

export function MediaGallery({ items = [], productName = 'Product' }: MediaGalleryProps) {
  if (!items || items.length === 0) {
    return (
      <div className="aspect-square bg-muted rounded-xl flex items-center justify-center" data-testid="media-placeholder">
        <Image src="/mushroom-placeholder.png" alt="No image available" width={400} height={400} />
      </div>
    );
  }

  // Map to ProductImageGallery's GalleryItem
  const mapped = items.map((it) => ({
    type: it.type,
    url: it.url,
    thumbnailUrl: it.thumbnailUrl,
    videoId: it.videoId,
    videoSource: it.videoSource,
    alt: it.alt,
  }));

  return (
    <div data-testid="media-gallery">
      <ProductImageGallery items={mapped} productName={productName} />
    </div>
  );
}

export default MediaGallery;
