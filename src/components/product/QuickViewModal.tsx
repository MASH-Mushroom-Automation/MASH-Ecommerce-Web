"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Heart,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Check,
  Star,
  ExternalLink,
  Truck,
  Leaf,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { isAuthenticated } from "@/lib/auth";
import { useSanityProduct } from "@/hooks/useSanityProducts";
import { useSanityReviews } from "@/hooks/useSanityReviews";
import { trackAddToCart, trackProductView } from "@/lib/analytics";

interface QuickViewModalProps {
  productId: string | null;
  productSlug?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({
  productId,
  productSlug,
  isOpen,
  onClose,
}: QuickViewModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  // Fetch product data
  const { product, loading, error } = useSanityProduct(productSlug || productId || '');
  const { rating } = useSanityReviews(product?.id || '');

  const inWishlist = product ? isInWishlist(product.id) : false;

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setActiveImageIndex(0);
      setJustAdded(false);
      setImageLoaded(false);
    }
  }, [isOpen, productId]);

  // Track product view
  useEffect(() => {
    if (product && isOpen) {
      trackProductView({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
      });
    }
  }, [product, isOpen]);

  // Placeholder image for products without images
  const PLACEHOLDER_IMAGE = "/mushroom-placeholder.png";

  // Build images array - use placeholder if no valid images
  const validImages = product
    ? [product.image, ...(product.images || [])].filter(
        (img, idx, arr) => img && img.startsWith('http') && arr.indexOf(img) === idx
      )
    : [];
  const images = validImages.length > 0 ? validImages : [PLACEHOLDER_IMAGE];

  const handlePrevImage = useCallback(() => {
    setActiveImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
    setImageLoaded(false);
  }, [images.length]);

  const handleNextImage = useCallback(() => {
    setActiveImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
    setImageLoaded(false);
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowLeft") handlePrevImage();
      if (e.key === "ArrowRight") handleNextImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handlePrevImage, handleNextImage]);

  const toggleWishlist = () => {
    if (!isAuthenticated()) {
      window.location.href = "/login";
      return;
    }
    if (!product) return;
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const handleAddToCart = async () => {
    if (!product || isAddingToCart || justAdded) return;

    setIsAddingToCart(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const success = addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        slug: product.slug,
        stock: product.stock,
        grower: product.category,
        unit: product.unit,
      },
      quantity
    );

    setIsAddingToCart(false);

    if (success) {
      setJustAdded(true);
      trackAddToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        category: product.category,
      });
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity((q) => q + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[850px] lg:max-w-[900px] max-h-[90vh] overflow-hidden p-0 gap-0 bg-background" 
        showCloseButton={false}
      >
        {/* Visually hidden title for screen reader accessibility */}
        <DialogTitle className="sr-only">
          {product ? `Quick view: ${product.name}` : 'Quick view product'}
        </DialogTitle>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-105"
          aria-label="Close quick view"
        >
          <X className="h-4 w-4" />
        </button>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading product...</p>
            </div>
          </div>
        ) : error || !product ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-destructive mb-4">Failed to load product</p>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 h-full w-full">
            {/* Image Gallery */}
            <div className="relative bg-muted aspect-square md:aspect-auto md:h-full overflow-hidden flex-shrink-0">
              {/* Main Image */}
              <div className="relative w-full h-full min-h-[280px] md:min-h-[450px]">
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-muted animate-pulse" />
                )}
                {images[activeImageIndex] && (
                  <Image
                    src={images[activeImageIndex]}
                    alt={product.name}
                    fill
                    className={cn(
                      "transition-opacity duration-300",
                      imageLoaded ? "opacity-100" : "opacity-0",
                      images[activeImageIndex] === PLACEHOLDER_IMAGE 
                        ? "object-contain p-8" 
                        : "object-cover"
                    )}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    onLoad={() => setImageLoaded(true)}
                    priority
                  />
                )}
              </div>

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-105"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-105"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Thumbnail Dots */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveImageIndex(idx);
                        setImageLoaded(false);
                      }}
                      className={cn(
                        "w-2.5 h-2.5 rounded-full transition-all",
                        idx === activeImageIndex
                          ? "bg-primary scale-125"
                          : "bg-white/70 hover:bg-white"
                      )}
                      aria-label={`View image ${idx + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isPromo && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-lg">
                    SALE
                  </span>
                )}
                {product.isFeatured && (
                  <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-lg">
                    ⭐ Featured
                  </span>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="flex flex-col p-5 md:p-6 overflow-y-auto max-h-[50vh] md:max-h-[85vh] min-w-0">
              <DialogHeader className="text-left mb-3">
                <DialogTitle className="text-xl md:text-2xl font-bold text-foreground leading-tight">
                  {product.name}
                </DialogTitle>
              </DialogHeader>

              {/* Category & Rating */}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                {product.category && (
                  <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                )}
                {rating && rating.totalReviews > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < Math.round(rating.averageRating)
                              ? "fill-amber-400 text-amber-400"
                              : "fill-gray-200 text-gray-200"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {rating.averageRating.toFixed(1)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({rating.totalReviews} reviews)
                    </span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-bold text-primary">
                  ₱{product.price.toLocaleString('en-PH')}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <>
                    <span className="text-xl text-muted-foreground/60 line-through">
                      ₱{product.compareAtPrice.toLocaleString('en-PH')}
                    </span>
                    <span className="text-sm font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded">
                      {Math.round(
                        ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
                      )}% OFF
                    </span>
                  </>
                )}
                {product.unit && (
                  <span className="text-muted-foreground">/ {product.unit}</span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-4">
                {product.stock > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-sm text-green-600 font-medium">
                      In Stock ({product.stock} available)
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-sm text-red-600 font-medium">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-6">
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Quick Info Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {product.deliveryOptions?.sameDayDeliveryEligible && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-full">
                    <Truck className="h-3.5 w-3.5" />
                    Same-Day Delivery
                  </span>
                )}
                {product.productTags?.includes('organic') && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-50 text-green-700 px-2.5 py-1.5 rounded-full">
                    <Leaf className="h-3.5 w-3.5" />
                    Organic
                  </span>
                )}
                {product.freshnessInfo?.shelfLife && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-full">
                    🌱 {product.freshnessInfo.shelfLife}
                  </span>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium text-foreground">Quantity:</span>
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className="p-2.5 hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-semibold text-foreground">
                    {quantity}
                  </span>
                  <button
                    onClick={increaseQuantity}
                    disabled={product.stock === 0 || quantity >= product.stock}
                    className="p-2.5 hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {product.stock > 0 && product.stock <= 10 && (
                  <span className="text-xs text-orange-600 font-medium">
                    Only {product.stock} left!
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                <Button
                  size="lg"
                  className={cn(
                    "flex-1 h-12 text-base font-semibold transition-all duration-300",
                    justAdded
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-primary hover:bg-primary/90"
                  )}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || isAddingToCart}
                >
                  {isAddingToCart ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : justAdded ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
                <Button
                  size="lg"
                  variant={inWishlist ? "default" : "outline"}
                  className={cn(
                    "h-12 px-4",
                    inWishlist && "bg-red-500 hover:bg-red-600"
                  )}
                  onClick={toggleWishlist}
                >
                  <Heart
                    className={cn(
                      "h-5 w-5",
                      inWishlist && "fill-current"
                    )}
                  />
                </Button>
              </div>

              {/* View Full Details Link */}
              <Link
                href={`/product/${product.slug}`}
                className="mt-4 inline-flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                onClick={onClose}
              >
                View Full Details
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
