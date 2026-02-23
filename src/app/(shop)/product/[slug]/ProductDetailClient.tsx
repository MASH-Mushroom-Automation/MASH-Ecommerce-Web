"use client";

import React, { useState, useMemo, useRef } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Heart,
  ArrowLeft,
  Share2,
  Star,
  ThumbsUp,
  CheckCircle,
  Leaf,
  Clock,
  ChefHat,
  Truck,
  Snowflake,
  MapPin,
  Info,
  Utensils,
  Sparkles,
  Play,
  Store,
  BadgeCheck,
  ExternalLink,
  ShieldCheck,
  Package,
  Minus,
  Plus,
  Tag,
  Zap,
  Timer,
  Thermometer,
  ChevronRight,
} from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { isAuthenticated } from "@/lib/auth";
import { toast } from "sonner";
import {
  useSanityProduct,
  useSanitySuggestedProducts,
} from "@/hooks/useSanityProducts";
import { useSanityReviews } from "@/hooks/useSanityReviews";
import { FirebaseReviewSection } from "@/components/reviews/FirebaseReviewSection";
import { CalComButton } from "@/components/appointments/CalendlyButton";
import GrowerCard from "@/components/product/GrowerCard";
import MediaGallery from "@/components/product/MediaGallery";

import { trackProductView, trackAddToCart } from "@/lib/analytics";
import { ProductCard } from "@/components/product";
import { useChat } from "@/contexts/ChatContext";
import type { MediaItem } from "@/types/sanity";

import { useStockSync } from "@/hooks/useStockSync";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { RecentlyViewed } from "@/components/products/RecentlyViewed";
import { StickyAddToCartBar } from "@/components/product/StickyAddToCartBar";

// Placeholder image for products without images
const PLACEHOLDER_IMAGE = "/mushroom-placeholder.png";

type Props = { slug: string };

// Helper to extract YouTube video ID from various URL formats
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

// Helper to get Vimeo video ID
function getVimeoVideoId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

// Media gallery item type for combined images + videos
interface GalleryItem {
  type: "image" | "video";
  url: string;
  thumbnailUrl?: string;
  videoId?: string;
  videoSource?: "youtube" | "vimeo" | "file";
  alt?: string;
  title?: string;
  isPrimary?: boolean;
}

const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

/* ------------------------------------------------------------------ */
/*  Info Pill - small icon + text badge                                 */
/* ------------------------------------------------------------------ */
function InfoPill({ icon: Icon, children, className }: { icon: React.ElementType; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full border", className)}>
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{children}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Trust Badge Row                                                     */
/* ------------------------------------------------------------------ */
function TrustBadges() {
  return (
    <div className="grid grid-cols-3 gap-3 text-center">
      {[
        { icon: Truck, label: "Fast Delivery", sub: "Same-day available" },
        { icon: Leaf, label: "Farm Fresh", sub: "Harvested to order" },
        { icon: ShieldCheck, label: "Quality Guaranteed", sub: "100% satisfaction" },
      ].map(({ icon: Icon, label, sub }) => (
        <div key={label} className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/40 border border-border/50">
          <Icon className="w-5 h-5 text-primary" />
          <span className="text-xs font-semibold text-foreground leading-tight">{label}</span>
          <span className="text-[10px] text-muted-foreground leading-tight">{sub}</span>
        </div>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  MAIN PAGE                                                          */
/* ================================================================== */
export function ProductDetailClient({ slug }: Props) {

  const { product, loading, error } = useSanityProduct(slug);
  const [quantity, setQuantity] = useState(1);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const addToCartRef = useRef<HTMLDivElement>(null);
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { trackView } = useRecentlyViewed();
  const dynamicStock = useStockSync(
    product?.id || "",
    product?.stock || product?.quantityInStock || 0,
  );

  // Reviews hook
  const {
    reviews,
    rating,
    loading: reviewsLoading,
  } = useSanityReviews(product?.id || "");

  // Suggested Products hook
  const { suggestedProducts, loading: suggestedProductsLoading } =
    useSanitySuggestedProducts(
      product?.id || "",
      product?.grower?.id || "",
      4,
    );

  // Track product view when product loads
  React.useEffect(() => {
    if (product) {
      trackProductView({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
      });
      trackView(product.id);
    }
  }, [product]); // eslint-disable-line react-hooks/exhaustive-deps

  // Chat context
  const { setIsOpen: openChat, sendMessage: sendChatMessage } = useChat();

  // Compute discount percentage
  const discountPercent = useMemo(() => {
    if (!product?.compareAtPrice || !product?.price) return 0;
    if (product.compareAtPrice <= product.price) return 0;
    return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
  }, [product?.compareAtPrice, product?.price]);

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return notFound();
  }

  const inWishlist = isInWishlist(product.id);

  /* ---- Build gallery ---- */
  const buildGallery = (): GalleryItem[] => {
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
  };

  const galleryItems = buildGallery();
  const activeItem = galleryItems[activeGalleryIndex] || galleryItems[0];
  const hasGalleryItems = galleryItems.length > 0;

  /* ---- Handlers ---- */
  const toggleWishlist = () => {
    if (!isAuthenticated()) {
      window.location.href = "/login";
      return;
    }
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const handleAddToCart = () => {
    const productImage = product.images?.[0] || product.image || "";
    const success = addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: productImage,
        slug: product.slug,
        stock: product.stock || 100,
        grower: typeof product.grower === "object" ? product.grower?.name : product.grower,
        unit: product.unit,
        comparePrice: product.compareAtPrice,
      },
      quantity,
    );
    if (success) {
      trackAddToCart({ id: product.id, name: product.name, price: product.price, quantity, category: product.category });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text: product.description, url: window.location.href });
      } catch {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  /* ---- Derived data ---- */
  const hasRichInfo = !!(
    product.freshnessInfo ||
    product.preparationInfo ||
    product.nutritionalHighlights?.length ||
    product.deliveryOptions
  );

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */
  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      {/* ---- Breadcrumb ---- */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 py-3 text-sm text-muted-foreground overflow-x-auto">
            <Link href="/shop" className="hover:text-foreground transition-colors whitespace-nowrap">Shop</Link>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            {product.category && (
              <>
                <Link
                  href={`/shop?category=${product.categorySlug || product.category}`}
                  className="hover:text-foreground transition-colors whitespace-nowrap"
                >
                  {product.category}
                </Link>
                <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              </>
            )}
            <span className="text-foreground font-medium truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ============================================================ */}
        {/*  PRODUCT HERO: Gallery + Details side-by-side                 */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* ------- LEFT: Gallery ------- */}
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
              {product.isPromo && !discountPercent && (
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-amber-500 hover:bg-amber-500 text-white text-sm font-bold px-3 py-1 shadow-lg">
                    PROMO
                  </Badge>
                </div>
              )}

              {/* Wishlist + Share floating buttons */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button
                  onClick={toggleWishlist}
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
                  onClick={handleShare}
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
                    alt={activeItem.alt || product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                )
              ) : (
                <Image
                  src={PLACEHOLDER_IMAGE}
                  alt={product.name}
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

          {/* ------- RIGHT: Product Details ------- */}
          <div className="flex flex-col">
            {/* Category + Grower tagline */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {product.category && (
                <Link
                  href={`/shop?category=${product.categorySlug || product.category}`}
                  className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full hover:bg-primary/20 transition-colors"
                >
                  {product.category}
                </Link>
              )}
              {product.grower?.isVerified && (
                <Badge variant="outline" className="text-xs gap-1 border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400">
                  <BadgeCheck className="w-3 h-3" />
                  Verified Grower
                </Badge>
              )}
            </div>

            {/* Product Name */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
              {product.name}
            </h1>

            {/* Grower link */}
            {product.grower && (
              <Link
                href={`/grower/${product.grower.slug}`}
                className="inline-flex items-center gap-2 mt-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                {product.grower.image && (
                  <div className="relative w-5 h-5 rounded-full overflow-hidden bg-muted">
                    <Image src={product.grower.image} alt={product.grower.name} fill className="object-cover" />
                  </div>
                )}
                <span>by <span className="font-medium text-foreground group-hover:text-primary transition-colors">{product.grower.name}</span></span>
                {product.grower.location && (
                  <span className="text-muted-foreground/70 text-xs flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" />
                    {product.grower.location}
                  </span>
                )}
              </Link>
            )}

            {/* Divider */}
            <div className="h-px bg-border my-5" />

            {/* Price Block */}
            <div className="flex items-end gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl font-bold text-foreground">
                ₱{product.price.toFixed(2)}
              </span>
              {product.unit && (
                <span className="text-base text-muted-foreground mb-1">/ {product.unit}</span>
              )}
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-lg text-muted-foreground/60 line-through mb-1">
                  ₱{product.compareAtPrice.toFixed(2)}
                </span>
              )}
              {discountPercent > 0 && (
                <Badge className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 mb-1" variant="outline">
                  Save {discountPercent}%
                </Badge>
              )}
            </div>

            {/* Stock Status */}
            <div className="mt-3">
              {dynamicStock > 0 ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
                  </span>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    In Stock
                  </span>
                  <span className="text-muted-foreground">
                    ({dynamicStock} available)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-destructive font-medium">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Quick Info Pills */}
            {hasRichInfo && (
              <div className="flex flex-wrap gap-2 mt-4">
                {product.freshnessInfo?.harvestWindow && (
                  <InfoPill icon={Zap} className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                    Harvest: {product.freshnessInfo.harvestWindow}
                  </InfoPill>
                )}
                {product.freshnessInfo?.shelfLife && (
                  <InfoPill icon={Timer} className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
                    Shelf Life: {product.freshnessInfo.shelfLife}
                  </InfoPill>
                )}
                {product.preparationInfo?.cookingTime && (
                  <InfoPill icon={Clock} className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300">
                    Cook: {product.preparationInfo.cookingTime}
                  </InfoPill>
                )}
                {product.preparationInfo?.difficultyLevel && (
                  <InfoPill icon={ChefHat} className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300">
                    {product.preparationInfo.difficultyLevel.charAt(0).toUpperCase() + product.preparationInfo.difficultyLevel.slice(1)}
                  </InfoPill>
                )}
                {product.deliveryOptions?.sameDayDeliveryEligible && (
                  <InfoPill icon={Truck} className="bg-primary/5 border-primary/20 text-primary">
                    Same-Day Delivery
                  </InfoPill>
                )}
                {product.deliveryOptions?.perishable && (
                  <InfoPill icon={Snowflake} className="bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300">
                    Perishable
                  </InfoPill>
                )}
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="mt-5">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm sm:text-base">
                  {product.description}
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="h-px bg-border my-5" />

            {/* Quantity + Add to Cart */}
            <div ref={addToCartRef} className="space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                {/* Quantity */}
                <div className="flex items-center rounded-xl border bg-background shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-muted transition-colors rounded-l-xl disabled:opacity-40"
                    disabled={dynamicStock === 0}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))
                    }
                    className="w-14 text-center py-3 bg-transparent text-foreground font-semibold text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    disabled={dynamicStock === 0}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-3 hover:bg-muted transition-colors rounded-r-xl disabled:opacity-40"
                    disabled={dynamicStock === 0}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart */}
                <Button
                  size="lg"
                  className="flex-1 min-w-[180px] h-12 text-base font-semibold rounded-xl shadow-sm"
                  onClick={handleAddToCart}
                  disabled={dynamicStock === 0}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {dynamicStock === 0 ? "Out of Stock" : "Add to Cart"}
                </Button>
              </div>

              {/* Subtotal hint */}
              {quantity > 1 && dynamicStock > 0 && (
                <p className="text-sm text-muted-foreground">
                  Subtotal: <span className="font-semibold text-foreground">₱{(product.price * quantity).toFixed(2)}</span>
                </p>
              )}
            </div>

            {/* Trust Badges */}
            <div className="mt-6">
              <TrustBadges />
            </div>

            {/* Grower Card (desktop - inside right column) */}
            {product.grower && (
              <div className="mt-6 hidden lg:block">
                <GrowerCard
                  renderTestIds={false}
                  grower={product.grower}
                  productName={product.name}
                  onQuickChat={() => openChat(true)}
                />
              </div>
            )}

            {/* Grower Card (mobile) */}
            {product.grower && (
              <div className="mt-6 lg:hidden">
                <GrowerCard
                  grower={product.grower}
                  productName={product.name}
                  onQuickChat={() => openChat(true)}
                />
              </div>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/*  DETAILS TABS: Rich product info below the fold              */}
        {/* ============================================================ */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* ---- Storage & Freshness Card ---- */}
          {product.freshnessInfo && (product.freshnessInfo.storageInstructions || product.freshnessInfo.shelfLife || product.freshnessInfo.qualityIndicators) && (
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b bg-muted/30 flex items-center gap-2">
                <Snowflake className="w-4 h-4 text-blue-500" />
                <h3 className="font-semibold text-foreground text-sm">Storage & Freshness</h3>
              </div>
              <div className="p-5 space-y-3 text-sm">
                {product.freshnessInfo.shelfLife && (
                  <div className="flex items-start gap-3">
                    <Timer className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-foreground">Shelf Life</div>
                      <div className="text-muted-foreground">{product.freshnessInfo.shelfLife}</div>
                    </div>
                  </div>
                )}
                {product.freshnessInfo.storageInstructions && (
                  <div className="flex items-start gap-3">
                    <Thermometer className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-foreground">Storage</div>
                      <div className="text-muted-foreground">{product.freshnessInfo.storageInstructions}</div>
                    </div>
                  </div>
                )}
                {product.freshnessInfo.qualityIndicators && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-foreground">Quality Signs</div>
                      <div className="text-muted-foreground">{product.freshnessInfo.qualityIndicators}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---- Cooking & Preparation Card ---- */}
          {product.preparationInfo && (product.preparationInfo.preparationTips?.length || product.preparationInfo.recipeIdeas?.length) && (
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b bg-muted/30 flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-orange-500" />
                <h3 className="font-semibold text-foreground text-sm">Cooking & Preparation</h3>
              </div>
              <div className="p-5 space-y-3 text-sm">
                {product.preparationInfo.preparationTips && product.preparationInfo.preparationTips.length > 0 && (
                  <div>
                    <div className="font-medium text-foreground mb-1.5">Tips</div>
                    <ul className="space-y-1.5">
                      {product.preparationInfo.preparationTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-muted-foreground">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {product.preparationInfo.recipeIdeas && product.preparationInfo.recipeIdeas.length > 0 && (
                  <div>
                    <div className="font-medium text-foreground mb-1.5">Recipe Ideas</div>
                    <div className="flex flex-wrap gap-1.5">
                      {product.preparationInfo.recipeIdeas.map((recipe, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          <Utensils className="w-3 h-3 mr-1" />
                          {recipe}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---- Nutrition & Details Card ---- */}
          {(product.nutritionalHighlights?.length || product.sku || product.weight) && (
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b bg-muted/30 flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-500" />
                <h3 className="font-semibold text-foreground text-sm">Nutrition & Details</h3>
              </div>
              <div className="p-5 space-y-3 text-sm">
                {product.nutritionalHighlights && product.nutritionalHighlights.length > 0 && (
                  <div>
                    <div className="font-medium text-foreground mb-2">Nutritional Highlights</div>
                    <div className="flex flex-wrap gap-1.5">
                      {product.nutritionalHighlights.map((item, i) => (
                        <Badge key={i} variant="outline" className="text-xs border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {product.sku && (
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-muted-foreground">SKU</span>
                    <span className="font-medium text-foreground">{product.sku}</span>
                  </div>
                )}
                {product.weight && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weight</span>
                    <span className="font-medium text-foreground">{product.weight}g</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ---- Product Tags ---- */}
        {product.productTags && product.productTags.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <Tag className="w-4 h-4 text-muted-foreground" />
            {product.productTags.map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs font-normal">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* ============================================================ */}
        {/*  YOU MAY ALSO LIKE                                           */}
        {/* ============================================================ */}
        {!suggestedProductsLoading &&
          suggestedProducts &&
          suggestedProducts.length > 0 && (
            <section className="mt-14">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    You May Also Like
                  </h2>
                  {product.grower && (
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5" />
                      More from{" "}
                      <span className="font-medium text-foreground">
                        {product.grower.name}
                      </span>
                      {product.grower.isVerified && (
                        <BadgeCheck className="w-3.5 h-3.5 text-primary" />
                      )}
                    </p>
                  )}
                </div>
                {product.grower?.slug && (
                  <Link
                    href={`/grower/${product.grower.slug}`}
                    className="hidden sm:flex items-center gap-1.5 text-sm text-primary hover:underline transition-colors group font-medium"
                  >
                    View All
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {suggestedProducts.slice(0, 4).map((item) => (
                  <ProductCard
                    key={item.id}
                    id={item.id}
                    slug={item.slug}
                    name={item.name}
                    farm={product.grower?.name}
                    price={item.price}
                    comparePrice={item.compareAtPrice}
                    unit={item.unit || "kg"}
                    image={item.image || "/mushroom-placeholder.png"}
                    images={item.images}
                    inStock={item.isAvailable && (item.stock ?? 0) > 0}
                    stock={item.stock}
                    tags={[
                      ...(item.isFeatured ? ["Featured"] : []),
                      ...(item.isPromo ? ["Sale"] : []),
                      ...(item.productTags || []),
                    ]}
                    description={item.description}
                  />
                ))}
              </div>

              {product.grower?.slug && (
                <div className="mt-5 sm:hidden text-center">
                  <Link
                    href={`/grower/${product.grower.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
                  >
                    View All Products from {product.grower.name}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </section>
          )}

        {/* ============================================================ */}
        {/*  CUSTOMER REVIEWS                                            */}
        {/* ============================================================ */}
        <section className="mt-14">
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b bg-muted/30 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <h2 className="text-lg font-semibold text-foreground">Customer Reviews</h2>
            </div>
            <div className="px-6 py-6">
              <FirebaseReviewSection
                targetType="product"
                targetId={product.id}
                targetName={product.name}
              />
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  RECENTLY VIEWED                                             */}
        {/* ============================================================ */}
        <section className="mt-14">
          <RecentlyViewed excludeProductId={product.id} maxDisplay={8} />
        </section>
      </div>

      {/* Sticky Mobile Add-to-Cart Bar */}
      <StickyAddToCartBar
        productName={product.name}
        price={product.price}
        unit={product.unit}
        stock={dynamicStock}
        quantity={quantity}
        setQuantity={setQuantity}
        onAddToCart={handleAddToCart}
        targetRef={addToCartRef}
      />
    </div>
  );
}
