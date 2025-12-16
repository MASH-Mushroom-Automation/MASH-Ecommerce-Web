"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Star, Eye, Plus, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { getGrowerUrl } from "@/lib/grower-utils";
import { trackAddToCart } from "@/lib/analytics";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  slug?: string; // Sanity slug for SEO-friendly URLs
  name: string;
  farm?: string;
  price: number;
  comparePrice?: number; // Original price for discount display
  unit?: string;
  image: string;
  images?: string[]; // Additional images for hover effect
  inStock?: boolean;
  stock?: number; // Actual stock count for cart validation
  rating?: number; // Product rating (1-5)
  reviewCount?: number; // Number of reviews
  tags?: string[]; // Product tags like "Best Seller", "New", etc.
  description?: string; // Short description for quick view
  onQuickView?: (id: string) => void; // Quick view callback
}

export function ProductCard({
  id,
  slug,
  name,
  farm,
  price,
  comparePrice,
  unit,
  image,
  images,
  inStock = true,
  stock = 100, // Default stock if not provided
  rating,
  reviewCount,
  tags = [],
  description,
  onQuickView,
}: ProductCardProps) {
  // Use slug for URL if available (Sanity products), otherwise fall back to ID
  const productUrl = slug ? `/product/${slug}` : `/product/${id}`;
  const router = useRouter();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const inWishlist = isInWishlist(id);
  
  // Local state for interactions
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Placeholder image for products without images
  const PLACEHOLDER_IMAGE = "/mushroom-placeholder.png";
  
  // Use placeholder if no image provided or if image failed to load
  const displayImage = (!image || imageError) ? PLACEHOLDER_IMAGE : image;

  // Calculate discount percentage if comparePrice exists
  const discountPercent = comparePrice && comparePrice > price 
    ? Math.round(((comparePrice - price) / comparePrice) * 100) 
    : 0;

  // Check for special tags
  const isBestSeller = tags.some(t => t.toLowerCase().includes('best') || t.toLowerCase().includes('popular'));
  const isNew = tags.some(t => t.toLowerCase() === 'new');
  const isOrganic = tags.some(t => t.toLowerCase() === 'organic');
  const isFresh = tags.some(t => t.toLowerCase() === 'fresh');
  const isLowStock = stock > 0 && stock <= 5;

  // Get secondary image for hover effect
  const secondaryImage = images && images.length > 1 ? images[1] : null;

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Allow wishlist for all users (stored in localStorage)
    if (inWishlist) {
      removeFromWishlist(id);
      toast.success(`Removed from wishlist`, {
        description: name,
        duration: 2000,
      });
    } else {
      addToWishlist(id);
      toast.success(`Added to wishlist!`, {
        description: name,
        duration: 2000,
      });
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAddingToCart || justAdded) return;
    
    setIsAddingToCart(true);
    
    // Small delay for better UX feedback
    await new Promise(resolve => setTimeout(resolve, 300));

    const success = addToCart({
      id,
      name,
      price,
      image,
      slug: slug || id,
      stock,
      grower: farm,
      unit,
    }, 1);

    setIsAddingToCart(false);

    if (success) {
      setJustAdded(true);
      // Track add to cart event
      trackAddToCart({
        id,
        name,
        price,
        quantity: 1,
      });
      // Reset after animation
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(id);
  };

  return (
    <div 
      className={cn(
        "group bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full",
        "hover:border-primary/30 hover:-translate-y-1",
        !inStock && "opacity-80"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <Link
        href={productUrl}
        className="block relative aspect-[4/5] bg-muted overflow-hidden"
      >
        {/* Skeleton while loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        
        {/* Primary Image */}
        <Image
          src={displayImage}
          alt={name}
          fill
          className={cn(
            "object-cover transition-all duration-500",
            imageLoaded ? "opacity-100" : "opacity-0",
            isHovered && secondaryImage ? "opacity-0 scale-105" : "group-hover:scale-110",
            !inStock && "grayscale-[30%]",
            // Apply special styling for placeholder
            displayImage === PLACEHOLDER_IMAGE && "object-contain p-4"
          )}
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          priority={false}
        />
        
        {/* Secondary Image (on hover) */}
        {secondaryImage && !imageError && (
          <Image
            src={secondaryImage}
            alt={`${name} - alternate view`}
            fill
            className={cn(
              "object-cover transition-all duration-500 absolute inset-0",
              isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />
        )}
        
        {/* Gradient overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent transition-opacity duration-300",
          isHovered ? "opacity-100" : "opacity-0"
        )} />
        
        {/* Top Left Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {/* Discount Badge */}
          {discountPercent > 0 && (
            <span className="bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md shadow-lg animate-in fade-in slide-in-from-left-2 duration-300">
              -{discountPercent}% OFF
            </span>
          )}
          {/* Best Seller Badge */}
          {isBestSeller && (
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md shadow-lg flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" /> Best Seller
            </span>
          )}
          {/* New Badge */}
          {isNew && !isBestSeller && (
            <span className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md shadow-lg">
              ✨ New
            </span>
          )}
          {/* Organic Badge */}
          {isOrganic && (
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-[10px] sm:text-xs font-medium px-2 py-1 rounded-md shadow-lg flex items-center gap-1">
              🌿 Organic
            </span>
          )}
          {/* Fresh Badge */}
          {isFresh && !isOrganic && (
            <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[10px] sm:text-xs font-medium px-2 py-1 rounded-md shadow-lg">
              🌊 Fresh
            </span>
          )}
          {/* Low Stock Warning */}
          {isLowStock && inStock && (
            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] sm:text-xs font-medium px-2 py-1 rounded-md shadow-lg animate-pulse">
              Only {stock} left!
            </span>
          )}
        </div>

        {/* Farm Badge - Bottom Left */}
        {farm && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(getGrowerUrl(farm));
            }}
            className={cn(
              "absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium text-gray-700 shadow-lg hover:bg-white hover:scale-105 transition-all duration-200 max-w-[calc(100%-80px)] truncate z-10",
              "border border-gray-100"
            )}
            aria-label={`View grower ${farm}`}
            title={`@${farm}`}
          >
            @{farm}
          </button>
        )}
        
        {/* Action Buttons - Top Right */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-2 z-10">
          {/* Wishlist Button */}
          <button
            onClick={toggleWishlist}
            className={cn(
              "p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110",
              inWishlist 
                ? "bg-red-50 hover:bg-red-100 ring-2 ring-red-200" 
                : "bg-white/95 backdrop-blur-md hover:bg-white"
            )}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-all duration-200",
                inWishlist
                  ? "fill-red-500 text-red-500 scale-110"
                  : "text-gray-500 hover:text-red-500"
              )}
            />
          </button>
          
          {/* Quick View Button (visible on hover) */}
          {onQuickView && (
            <button
              onClick={handleQuickView}
              className={cn(
                "p-2 rounded-full bg-white/95 backdrop-blur-md shadow-lg transition-all duration-300",
                "hover:bg-white hover:scale-110",
                isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
              )}
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
            <span className="bg-white text-gray-800 text-sm font-semibold px-5 py-2.5 rounded-full shadow-xl">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        {/* Rating */}
        {rating && rating > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3 w-3 sm:h-3.5 sm:w-3.5",
                    i < Math.floor(rating)
                      ? "fill-amber-400 text-amber-400"
                      : i < rating
                      ? "fill-amber-400/50 text-amber-400"
                      : "fill-gray-200 text-gray-200"
                  )}
                />
              ))}
            </div>
            <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
              {rating.toFixed(1)}
            </span>
            {reviewCount && reviewCount > 0 && (
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                ({reviewCount})
              </span>
            )}
          </div>
        )}

        <Link href={productUrl} className="mb-auto group/title">
          <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-2 group-hover/title:text-primary transition-colors duration-200 leading-snug">
            {name}
          </h3>
        </Link>
        
        {/* Short description (if provided) */}
        {description && (
          <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Price and Add to Cart - Fixed at bottom */}
      <div className="p-3 sm:p-4 pt-0 mt-auto">
        <div className="flex items-end justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-base sm:text-lg font-bold text-foreground">
                ₱{price.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              {comparePrice && comparePrice > price && (
                <span className="text-xs sm:text-sm text-muted-foreground/70 line-through">
                  ₱{comparePrice.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-xs text-muted-foreground">per {unit ?? "unit"}</span>
          </div>

          <Button
            variant="default"
            size="sm"
            className={cn(
              "rounded-lg shadow-sm transition-all duration-300 min-w-[80px] sm:min-w-[90px]",
              justAdded 
                ? "bg-green-500 hover:bg-green-600" 
                : inStock 
                  ? "bg-primary hover:bg-primary/90 hover:shadow-md active:scale-95" 
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            )}
            onClick={handleAddToCart}
            disabled={!inStock || isAddingToCart}
          >
            {isAddingToCart ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : justAdded ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : inStock ? (
              <>
                <Plus className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Add</span>
              </>
            ) : (
              <span className="text-xs">Sold Out</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
