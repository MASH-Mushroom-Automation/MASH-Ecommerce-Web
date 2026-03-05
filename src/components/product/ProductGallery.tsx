"use client";

import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Heart, Share2, Play } from "lucide-react";
import type { MediaItem } from "@/types/sanity";

const PLACEHOLDER_IMAGE = "/mushroom-placeholder.png";

/* ---- Gallery item type ---- */
export interface GalleryItem {
  type: "image" | "video";
  url: string;
  thumbnailUrl?: string;
  videoId?: string;
  videoSource?: "youtube" | "vimeo" | "file";
  alt?: string;
  title?: string;
  isPrimary?: boolean;
}

/* ---- Helpers ---- */
function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortMatch) return shortMatch[1];
  const shortsMatch = url.match(/youtube\.com\/shorts\/([^?]+)/);
  if (shortsMatch) return shortsMatch[1];
  const embedMatch = url.match(/youtube\.com\/embed\/([^?]+)/);
  if (embedMatch) return embedMatch[1];
  return null;
}

function getVimeoVideoId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

/* ---- Build gallery from product data ---- */
export function buildGallery(product: {
  name: string;
  image?: string;
  images?: string[];
  media?: MediaItem[];
}): GalleryItem[] {
  const gallery: GalleryItem[] = [];

  if (
    product.image &&
    product.image !== "" &&
    product.image !== "null" &&
    product.image.startsWith("http")
  ) {
    gallery.push({ type: "image", url: product.image, alt: product.name, isPrimary: true });
  }

  if (product.images && Array.isArray(product.images)) {
    product.images
      .filter((img) => img && img !== "" && img !== "null" && img.startsWith("http") && img !== product.image)
      .forEach((img) => {
        gallery.push({ type: "image", url: img, alt: product.name });
      });
  }

  if (product.media && Array.isArray(product.media)) {
    product.media.forEach((mediaItem: MediaItem) => {
      if (mediaItem.mediaType === "video") {
        const videoUrl = mediaItem.videoUrl || mediaItem.video;
        if (videoUrl) {
          const youtubeId = getYouTubeVideoId(videoUrl);
          const vimeoId = getVimeoVideoId(videoUrl);
          if (youtubeId) {
            gallery.push({
              type: "video", url: videoUrl, videoId: youtubeId, videoSource: "youtube",
              thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
              title: mediaItem.title, isPrimary: mediaItem.isPrimary,
            });
          } else if (vimeoId) {
            gallery.push({
              type: "video", url: videoUrl, videoId: vimeoId, videoSource: "vimeo",
              title: mediaItem.title, isPrimary: mediaItem.isPrimary,
            });
          } else if (mediaItem.video) {
            gallery.push({
              type: "video", url: mediaItem.video, videoSource: "file",
              title: mediaItem.title, isPrimary: mediaItem.isPrimary,
            });
          }
        }
      } else if (mediaItem.mediaType === "image" && mediaItem.image) {
        if (!gallery.some((item) => item.url === mediaItem.image)) {
          gallery.push({
            type: "image", url: mediaItem.image,
            alt: mediaItem.imageAlt || mediaItem.title || product.name,
            title: mediaItem.title, isPrimary: mediaItem.isPrimary,
          });
        }
      }
    });
  }

  return gallery.sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return 0;
  });
}

/* ================================================================== */
/*  ProductGallery                                                     */
/* ================================================================== */
interface ProductGalleryProps {
  productName: string;
  galleryItems: GalleryItem[];
  activeGalleryIndex: number;
  setActiveGalleryIndex: (idx: number) => void;
  discountPercent: number;
  isPromo?: boolean;
  inWishlist: boolean;
  onToggleWishlist: () => void;
  onShare: () => void;
}

export function ProductGallery({
  productName,
  galleryItems,
  activeGalleryIndex,
  setActiveGalleryIndex,
  discountPercent,
  isPromo,
  inWishlist,
  onToggleWishlist,
  onShare,
}: ProductGalleryProps) {
  const activeItem = galleryItems[activeGalleryIndex] || galleryItems[0];
  const hasGalleryItems = galleryItems.length > 0;

  return (
    <div className="space-y-3">
      {/* Main Display */}
      <div className="relative aspect-square bg-white dark:bg-muted rounded-2xl overflow-hidden border shadow-sm group">
        {/* Sale badge overlay */}
        {discountPercent > 0 && (
          <div className="absolute top-4 left-4 z-10">
            <Badge className="bg-red-500 hover:bg-red-500 text-white text-sm font-bold px-3 py-1 shadow-lg">
              -{discountPercent}%
            </Badge>
          </div>
        )}
        {isPromo && !discountPercent && (
          <div className="absolute top-4 left-4 z-10">
            <Badge className="bg-amber-500 hover:bg-amber-500 text-white text-sm font-bold px-3 py-1 shadow-lg">
              PROMO
            </Badge>
          </div>
        )}

        {/* Wishlist + Share floating buttons */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <button
            onClick={onToggleWishlist}
            className={cn(
              "p-2.5 rounded-full shadow-md backdrop-blur-sm transition-all",
              inWishlist
                ? "bg-red-500 text-white"
                : "bg-white/90 dark:bg-card/90 text-muted-foreground hover:text-red-500",
            )}
          >
            <Heart className={cn("w-5 h-5", inWishlist && "fill-current")} />
          </button>
          <button
            onClick={onShare}
            className="p-2.5 rounded-full bg-white/90 dark:bg-card/90 text-muted-foreground hover:text-foreground shadow-md backdrop-blur-sm transition-all"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {hasGalleryItems && activeItem ? (
          activeItem.type === "video" ? (
            activeItem.videoSource === "youtube" && activeItem.videoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${activeItem.videoId}?rel=0&modestbranding=1`}
                title={activeItem.title || "Product Video"}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : activeItem.videoSource === "vimeo" && activeItem.videoId ? (
              <iframe
                src={`https://player.vimeo.com/video/${activeItem.videoId}`}
                title={activeItem.title || "Product Video"}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : activeItem.videoSource === "file" ? (
              <video src={activeItem.url} controls className="absolute inset-0 w-full h-full object-contain bg-black">
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                Video unavailable
              </div>
            )
          ) : (
            <Image
              src={activeItem.url}
              alt={activeItem.alt || productName}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          )
        ) : (
          <Image
            src={PLACEHOLDER_IMAGE}
            alt={productName}
            fill
            className="object-contain p-8"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        )}
      </div>

      {/* Thumbnails */}
      {galleryItems.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {galleryItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setActiveGalleryIndex(idx)}
              className={cn(
                "relative w-20 h-20 flex-shrink-0 bg-white dark:bg-muted rounded-xl overflow-hidden border-2 transition-all",
                activeGalleryIndex === idx
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-transparent hover:border-border",
              )}
            >
              {item.type === "video" ? (
                <div className="relative w-full h-full">
                  {item.thumbnailUrl ? (
                    <Image src={item.thumbnailUrl} alt={item.title || `Video ${idx + 1}`} fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="w-full h-full bg-gray-800" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="w-4 h-4 text-primary ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                </div>
              ) : (
                <Image src={item.url} alt={item.alt || `Image ${idx + 1}`} fill className="object-cover" sizes="80px" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
