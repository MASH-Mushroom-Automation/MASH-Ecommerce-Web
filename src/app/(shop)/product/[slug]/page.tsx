"use client";

import React, { useState } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, ArrowLeft, Share2, Star, ThumbsUp, CheckCircle, Leaf, Clock, ChefHat, Truck, Snowflake, MapPin, Info, Utensils, Sparkles, Play, Store, BadgeCheck, ExternalLink } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { isAuthenticated } from "@/lib/auth";
import { toast } from "sonner";
import { useSanityProduct, useSanitySuggestedProducts } from "@/hooks/useSanityProducts";
import { useSanityReviews } from "@/hooks/useSanityReviews";
import { CalComButton } from "@/components/appointments/CalendlyButton"; // For grower appointment link
import ProductDetailsSections from "@/components/product/ProductDetailsSections";
import MediaGallery from "@/components/product/MediaGallery";

import { trackProductView, trackAddToCart } from "@/lib/analytics";
import { ProductCard } from "@/components/product";
import { useChat } from '@/contexts/ChatContext';
import type { MediaItem } from "@/types/sanity";

// Placeholder image for products without images
const PLACEHOLDER_IMAGE = "/mushroom-placeholder.png";

type Props = { params: Promise<{ slug: string }> };

// Helper to extract YouTube video ID from various URL formats
function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  
  // Handle youtube.com/watch?v=ID format
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return watchMatch[1];
  
  // Handle youtu.be/ID format
  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortMatch) return shortMatch[1];
  
  // Handle youtube.com/shorts/ID format
  const shortsMatch = url.match(/youtube\.com\/shorts\/([^?]+)/);
  if (shortsMatch) return shortsMatch[1];
  
  // Handle youtube.com/embed/ID format
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
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  videoId?: string;
  videoSource?: 'youtube' | 'vimeo' | 'file';
  alt?: string;
  title?: string;
  isPrimary?: boolean;
}

const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

export default function ProductDetailPage({ params }: Props) {
  const resolvedParams = React.use(params);
  const slug = resolvedParams.slug;

  const { product, loading, error } = useSanityProduct(slug);
  const [quantity, setQuantity] = useState(1);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  // Variants are disabled on the storefront (managed in Seller Studio)
  // NOTE: we intentionally do not call useSanityVariants here to avoid showing variant selection to buyers.

  // Reviews hook - only fetch when product is loaded
  const { 
    reviews, 
    rating, 
    loading: reviewsLoading 
  } = useSanityReviews(product?.id || '');

  // Suggested Products hook - automatically fetch from same grower/store
  const { 
    suggestedProducts, 
    loading: suggestedProductsLoading 
  } = useSanitySuggestedProducts(
    product?.id || '',
    product?.grower?.id || '',
    4  // Limit to 4 suggested products
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
    }
  }, [product]);

  // Chat context for Quick Chat with seller
  const { setIsOpen: openChat, sendMessage: sendChatMessage } = useChat();

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
  
  // Build combined gallery from images and media
  const buildGallery = (): GalleryItem[] => {
    const gallery: GalleryItem[] = [];
    
    // Add main image first
    if (product.image && product.image !== '' && product.image !== 'null' && product.image.startsWith('http')) {
      gallery.push({
        type: 'image',
        url: product.image,
        alt: product.name,
        isPrimary: true,
      });
    }
    
    // Add additional images
    if (product.images && Array.isArray(product.images)) {
      product.images
        .filter(img => img && img !== '' && img !== 'null' && img.startsWith('http') && img !== product.image)
        .forEach(img => {
          gallery.push({
            type: 'image',
            url: img,
            alt: product.name,
          });
        });
    }
    
    // Add media gallery items (images + videos)
    if (product.media && Array.isArray(product.media)) {
      product.media.forEach((mediaItem: MediaItem) => {
        if (mediaItem.mediaType === 'video') {
          // Handle video items
          const videoUrl = mediaItem.videoUrl || mediaItem.video;
          if (videoUrl) {
            const youtubeId = getYouTubeVideoId(videoUrl);
            const vimeoId = getVimeoVideoId(videoUrl);
            
            if (youtubeId) {
              gallery.push({
                type: 'video',
                url: videoUrl,
                videoId: youtubeId,
                videoSource: 'youtube',
                thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
                title: mediaItem.title,
                isPrimary: mediaItem.isPrimary,
              });
            } else if (vimeoId) {
              gallery.push({
                type: 'video',
                url: videoUrl,
                videoId: vimeoId,
                videoSource: 'vimeo',
                title: mediaItem.title,
                isPrimary: mediaItem.isPrimary,
              });
            } else if (mediaItem.video) {
              // Direct video file
              gallery.push({
                type: 'video',
                url: mediaItem.video,
                videoSource: 'file',
                title: mediaItem.title,
                isPrimary: mediaItem.isPrimary,
              });
            }
          }
        } else if (mediaItem.mediaType === 'image' && mediaItem.image) {
          // Handle image items (avoid duplicates)
          if (!gallery.some(item => item.url === mediaItem.image)) {
            gallery.push({
              type: 'image',
              url: mediaItem.image,
              alt: mediaItem.imageAlt || mediaItem.title || product.name,
              title: mediaItem.title,
              isPrimary: mediaItem.isPrimary,
            });
          }
        }
      });
    }
    
    // Sort: primary items first
    return gallery.sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return 0;
    });
  };

  const galleryItems = buildGallery();
  
  // Get current active item
  const activeItem = galleryItems[activeGalleryIndex] || galleryItems[0];
  
  // Fallback if no gallery items
  const hasGalleryItems = galleryItems.length > 0;

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
    // Use the first valid image or placeholder
    const productImage = product.images?.[0] || product.image || '';
    
    const success = addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: productImage,
      slug: product.slug,
      stock: product.stock || 100, // Default if not available
      grower: product.grower,
      unit: product.unit,
      comparePrice: product.compareAtPrice,
    }, quantity);
    
    if (success) {
      // Track add to cart event
      trackAddToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        category: product.category,
      });
    }
    // Toast is handled by CartContext, no need to duplicate
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch {
        // Share cancelled or failed - silent fail
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/shop"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images & Videos Gallery */}
          <div className="space-y-4">
            {/* Main Display Area (Image or Video) */}
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
              {hasGalleryItems && activeItem ? (
                activeItem.type === 'video' ? (
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
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                      Video unavailable
                    </div>
                  )
                ) : (
                  // Image Display
                  <Image
                    src={activeItem.url}
                    alt={activeItem.alt || product.name}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                )
              ) : (
                // Placeholder when no images available
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

            {/* Gallery Thumbnails (Images + Video Previews) */}
            {galleryItems.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {galleryItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveGalleryIndex(idx)}
                    className={cn(
                      "relative aspect-square bg-muted rounded-lg overflow-hidden border-2 transition-all",
                      activeGalleryIndex === idx
                        ? "border-primary"
                        : "border-transparent hover:border-border"
                    )}
                  >
                    {item.type === 'video' ? (
                      // Video Thumbnail
                      <div className="relative w-full h-full">
                        {item.thumbnailUrl ? (
                          <Image
                            src={item.thumbnailUrl}
                            alt={item.title || `Video ${idx + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 25vw, 12vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-800" />
                        )}
                        {/* Play Icon Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                            <Play className="w-5 h-5 text-primary ml-0.5" fill="currentColor" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Image Thumbnail
                      <Image
                        src={item.url}
                        alt={item.alt || `${product.name} - Image ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 25vw, 12vw"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Product Name */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {product.name}
              </h1>
              {product.category && (
                <p className="text-sm text-muted-foreground mt-2">
                  Category: {product.category}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">
                ₱{product.price.toFixed(2)}
              </span>
              {product.unit && (
                <span className="text-muted-foreground">/ {product.unit}</span>
              )}
            </div>

            {/* Stock Status */}
            <div>
              {product.stock > 0 ? (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-foreground">
                    In Stock ({product.stock} available)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-destructive">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-semibold text-foreground">
                  Description
                </h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Promo Badge */}
            {product.isPromo && (
              <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                🎉 On Promotion!
              </div>
            )}

            {/* Variant selection has been removed from the storefront - variants are managed in Seller Studio only */}

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-muted transition-colors"
                    disabled={product.stock === 0}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1))
                      )
                    }
                    className="w-16 text-center border-x border-border py-2 bg-background"
                    disabled={product.stock === 0}
                  />
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="px-4 py-2 hover:bg-muted transition-colors"
                    disabled={product.stock === 0}
                  >
                    +
                  </button>
                </div>
                {product.stock > 0 && (
                  <span className="text-sm text-muted-foreground">
                    Max: {product.stock}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant={inWishlist ? "default" : "outline"}
                onClick={toggleWishlist}
              >
                <Heart
                  className={cn(
                    "w-5 h-5",
                    inWishlist && "fill-current text-red-500"
                  )}
                />
              </Button>
              <Button size="lg" variant="outline" onClick={handleShare}>
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Product Meta */}
            <div className="border-t border-border pt-6 space-y-3 text-sm">
              {product.sku && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SKU:</span>
                  <span className="text-foreground font-medium">
                    {product.sku}
                  </span>
                </div>
              )}
              {product.weight && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weight:</span>
                  <span className="text-foreground font-medium">
                    {product.weight}g
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Availability:</span>
                <span
                  className={cn(
                    "font-medium",
                    product.stock > 0 ? "text-green-600" : "text-red-600"
                  )}
                >
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Product Information Sections (extracted) */}
        <ProductDetailsSections product={product} />

        {/* Nutritional Highlights & Product Tags */}
        {/* Nutritional Highlights & Product Tags */}
        {((product.nutritionalHighlights && product.nutritionalHighlights.length > 0) || 
          (product.productTags && product.productTags.length > 0)) && (
          <div className="mt-8 p-6 bg-muted/30 rounded-xl">
            <div className="flex flex-wrap gap-6">
              {/* Nutritional Highlights */}
              {product.nutritionalHighlights && product.nutritionalHighlights.length > 0 && (
                <div className="flex-1 min-w-[200px]">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Nutritional Highlights
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.nutritionalHighlights.map((highlight, idx) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium"
                      >
                        {highlight === 'high-protein' && '💪 '}
                        {highlight === 'low-calorie' && '🔥 '}
                        {highlight === 'vitamin-d' && '☀️ '}
                        {highlight === 'antioxidants' && '🛡️ '}
                        {highlight === 'fiber-rich' && '🌾 '}
                        {highlight === 'immune-support' && '💪 '}
                        {highlight === 'b-vitamins' && '⚡ '}
                        {highlight === 'minerals' && '💎 '}
                        {highlight.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Product Tags */}
              {product.productTags && product.productTags.length > 0 && (
                <div className="flex-1 min-w-[200px]">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Product Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.productTags.map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="text-sm bg-muted text-muted-foreground px-3 py-1.5 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Frequently Bought Together Section */}
        {product.complementaryProducts && product.complementaryProducts.length > 0 && (
          <section className="mt-12 bg-muted/30 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-foreground mb-4">
              ⚡ Frequently Bought Together
            </h2>
            <div className="flex flex-wrap items-center gap-4">
              {/* Current Product */}
              <div className="flex items-center gap-4 p-3 bg-background rounded-lg border">
                <div className="relative w-16 h-16">
                  {product.image && (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover rounded"
                    />
                  )}
                </div>
                <div>
                  <p className="font-medium line-clamp-1">{product.name}</p>
                  <p className="text-primary font-semibold">₱{product.price.toFixed(2)}</p>
                </div>
              </div>
              
              <span className="text-2xl text-muted-foreground">+</span>
              
              {/* Complementary Products */}
              {product.complementaryProducts.slice(0, 2).map((item, idx) => (
                <React.Fragment key={item.id}>
                  <Link
                    href={`/product/${item.slug}`}
                    className="flex items-center gap-4 p-3 bg-background rounded-lg border hover:border-primary transition-colors"
                  >
                    <div className="relative w-16 h-16">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover rounded"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium line-clamp-1">{item.name}</p>
                      <p className="text-primary font-semibold">₱{item.price.toFixed(2)}</p>
                    </div>
                  </Link>
                  {idx < Math.min(product.complementaryProducts!.length - 1, 1) && (
                    <span className="text-2xl text-muted-foreground">+</span>
                  )}
                </React.Fragment>
              ))}
            </div>
            
            {/* Bundles removed from storefront as per product policy - bundles are no longer offered */}
            </section>
          )}

        {/* You May Also Like Section - Automatically from Same Grower */}
        {!suggestedProductsLoading && suggestedProducts && suggestedProducts.length > 0 && (
          <section className="mt-16 border-t pt-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  You May Also Like
                </h2>
                {product.grower && (
                  <p className="text-sm md:text-base text-muted-foreground flex items-center gap-2">
                    <Store className="w-4 h-4" />
                    More products from <span className="font-semibold text-foreground">{product.grower.name}</span>
                    {product.grower.isVerified && (
                      <BadgeCheck className="w-4 h-4 text-primary" title="Verified Grower" />
                    )}
                  </p>
                )}
              </div>
              {product.grower?.slug && (
                <Link 
                  href={`/grower/${product.grower.slug}`}
                  className="hidden md:flex items-center gap-2 text-sm text-primary hover:text-primary/80 hover:underline transition-colors group"
                >
                  View All Products
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              )}
            </div>
            
            {/* Product Grid using reusable ProductCard component */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {suggestedProducts.slice(0, 4).map((item) => (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  slug={item.slug}
                  name={item.name}
                  farm={product.grower?.name} // Pass grower name for context
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

            {/* Mobile: View All Link */}
            {product.grower?.slug && (
              <div className="mt-6 md:hidden text-center">
                <Link 
                  href={`/grower/${product.grower.slug}`}
                  className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
                >
                  View All Products from {product.grower.name}
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            )}
          </section>
        )}

        {/* Customer Reviews Section */}
        {!reviewsLoading && rating && rating.totalReviews > 0 && (
          <section className="mt-16 border-t pt-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Customer Reviews
            </h2>

            {/* Rating Summary */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Overall Rating */}
              <div className="bg-muted/30 rounded-lg p-6 text-center">
                <div className="text-5xl font-bold text-primary mb-2">
                  {rating.averageRating.toFixed(1)}
                </div>
                <div className="flex justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "w-5 h-5",
                        star <= Math.round(rating.averageRating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground">
                  Based on {rating.totalReviews} review{rating.totalReviews !== 1 ? "s" : ""}
                </p>
                {rating.recommendationPercentage > 0 && (
                  <p className="text-sm text-green-600 mt-2 flex items-center justify-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    {rating.recommendationPercentage}% would recommend
                  </p>
                )}
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = rating.ratingDistribution[stars as keyof typeof rating.ratingDistribution];
                  const percentage = rating.totalReviews > 0 
                    ? (count / rating.totalReviews) * 100 
                    : 0;
                  return (
                    <div key={stars} className="flex items-center gap-3">
                      <span className="text-sm w-12 text-muted-foreground">{stars} star</span>
                      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm w-8 text-muted-foreground text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-6">
              {reviews.slice(0, 5).map((review) => (
                <div key={review.id} className="border-b border-border pb-6 last:border-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground">{review.customerName}</span>
                        {review.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                "w-4 h-4",
                                star <= review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.reviewDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    {review.helpfulCount > 0 && (
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {review.helpfulCount} found helpful
                      </span>
                    )}
                  </div>
                  
                  {review.title && (
                    <h4 className="font-semibold text-foreground mb-2">{review.title}</h4>
                  )}
                  
                  <p className="text-muted-foreground leading-relaxed">{review.content}</p>
                  
                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {review.images.slice(0, 3).map((img, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden">
                          <Image
                            src={img}
                            alt={`Review image ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Load More Reviews */}
            {reviews.length > 5 && (
              <div className="text-center mt-8">
                <Button variant="outline">
                  View All {rating.totalReviews} Reviews
                </Button>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
