"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ShoppingCart, Plus, Check, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { trackAddToCart } from "@/lib/analytics";

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image?: string;
  isPromo?: boolean;
  isFeatured?: boolean;
  stock?: number;
  unit?: string;
  grower?: string;
}

interface RelatedProductsSectionProps {
  title: string;
  subtitle?: string;
  products: RelatedProduct[];
  variant?: 'default' | 'compact' | 'horizontal';
  showAddToCart?: boolean;
  maxItems?: number;
}

export function RelatedProductsSection({
  title,
  subtitle,
  products,
  variant = 'default',
  showAddToCart = true,
  maxItems = 8,
}: RelatedProductsSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  
  const { addToCart } = useCart();

  const displayProducts = products.slice(0, maxItems);

  const checkScrollButtons = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === 'left' ? -300 : 300;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const handleAddToCart = async (product: RelatedProduct) => {
    if (addingToCart === product.id || justAdded === product.id) return;
    
    setAddingToCart(product.id);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const success = addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || '',
      slug: product.slug,
      stock: product.stock || 100,
      grower: product.grower,
      unit: product.unit,
    }, 1);
    
    setAddingToCart(null);
    
    if (success) {
      setJustAdded(product.id);
      trackAddToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      });
      setTimeout(() => setJustAdded(null), 2000);
    }
  };

  if (!displayProducts || displayProducts.length === 0) return null;

  return (
    <section className="py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        
        {/* Navigation Buttons */}
        {displayProducts.length > 4 && (
          <div className="hidden sm:flex gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={cn(
                "p-2 rounded-full border transition-all duration-200",
                canScrollLeft
                  ? "border-border hover:bg-muted hover:border-primary/50"
                  : "border-border/50 opacity-50 cursor-not-allowed"
              )}
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={cn(
                "p-2 rounded-full border transition-all duration-200",
                canScrollRight
                  ? "border-border hover:bg-muted hover:border-primary/50"
                  : "border-border/50 opacity-50 cursor-not-allowed"
              )}
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Products Container */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollButtons}
          className={cn(
            "flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2 -mx-4 px-4 sm:mx-0 sm:px-0",
            variant === 'horizontal' && "flex-col sm:flex-row"
          )}
        >
          {displayProducts.map((product) => (
            <div
              key={product.id}
              className={cn(
                "flex-shrink-0 group",
                variant === 'default' && "w-[180px] sm:w-[220px]",
                variant === 'compact' && "w-[150px] sm:w-[180px]",
                variant === 'horizontal' && "w-full sm:w-[280px]"
              )}
            >
              {variant === 'horizontal' ? (
                // Horizontal Card Layout
                <div className="flex gap-4 p-3 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-300">
                  <Link
                    href={`/product/${product.slug}`}
                    className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted"
                  >
                    {product.image && product.image.startsWith('http') ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="96px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        No Image
                      </div>
                    )}
                    {product.isPromo && (
                      <span className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        SALE
                      </span>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${product.slug}`}>
                      <h3 className="font-medium text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-primary font-bold mt-1">
                      ₱{product.price.toLocaleString('en-PH')}
                    </p>
                    {showAddToCart && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 h-8 text-xs"
                        onClick={() => handleAddToCart(product)}
                        disabled={addingToCart === product.id}
                      >
                        {addingToCart === product.id ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : justAdded === product.id ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : (
                          <Plus className="h-3 w-3 mr-1" />
                        )}
                        {justAdded === product.id ? "Added" : "Add"}
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                // Vertical Card Layout
                <div className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                  <Link
                    href={`/product/${product.slug}`}
                    className="block relative aspect-square bg-muted overflow-hidden"
                  >
                    {product.image && product.image.startsWith('http') ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes={variant === 'compact' ? "180px" : "220px"}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        No Image
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {product.isPromo && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                          SALE
                        </span>
                      )}
                      {product.isFeatured && (
                        <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                    
                    {/* Quick Add Button on Hover */}
                    {showAddToCart && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product);
                        }}
                        disabled={addingToCart === product.id}
                        className={cn(
                          "absolute bottom-2 right-2 p-2 rounded-full shadow-lg transition-all duration-300",
                          "opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0",
                          justAdded === product.id
                            ? "bg-green-500 text-white"
                            : "bg-white hover:bg-primary hover:text-white"
                        )}
                        aria-label="Add to cart"
                      >
                        {addingToCart === product.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : justAdded === product.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <ShoppingCart className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </Link>
                  
                  <div className={cn(
                    "p-3",
                    variant === 'compact' && "p-2"
                  )}>
                    <Link href={`/product/${product.slug}`}>
                      <h3 className={cn(
                        "font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors",
                        variant === 'compact' ? "text-xs" : "text-sm"
                      )}>
                        {product.name}
                      </h3>
                    </Link>
                    <p className={cn(
                      "text-primary font-bold mt-1",
                      variant === 'compact' ? "text-sm" : "text-base"
                    )}>
                      ₱{product.price.toLocaleString('en-PH')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Scroll Gradient Overlays */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-2 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none hidden sm:block" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none hidden sm:block" />
        )}
      </div>

      {/* View All Link */}
      {products.length > maxItems && (
        <div className="mt-6 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View All Products
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </section>
  );
}
