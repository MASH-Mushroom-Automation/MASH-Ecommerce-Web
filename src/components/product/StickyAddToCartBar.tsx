"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StickyAddToCartBarProps {
  productName: string;
  price: number;
  unit?: string;
  stock: number;
  quantity: number;
  setQuantity: (qty: number) => void;
  onAddToCart: () => void;
  /** Ref to the main add-to-cart button to observe visibility */
  targetRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Sticky bottom bar on mobile that appears when the main "Add to Cart"
 * button scrolls out of view. Positioned above MobileBottomNav.
 */
export function StickyAddToCartBar({
  productName,
  price,
  unit,
  stock,
  quantity,
  setQuantity,
  onAddToCart,
  targetRef,
}: StickyAddToCartBarProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky bar when the main CTA is NOT visible
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [targetRef]);

  if (stock === 0) return null;

  return (
    <div
      className={cn(
        "fixed bottom-16 left-0 right-0 z-40 bg-card border-t border-border shadow-lg px-4 py-3 lg:hidden",
        "transition-all duration-300 ease-in-out",
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0 pointer-events-none"
      )}
    >
      <div className="flex items-center gap-3 max-w-lg mx-auto">
        {/* Product info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {productName}
          </p>
          <p className="text-sm font-bold text-primary">
            ₱{price.toFixed(2)}
            {unit && (
              <span className="text-xs text-muted-foreground font-normal ml-1">
                / {unit}
              </span>
            )}
          </p>
        </div>

        {/* Quantity selector */}
        <div className="flex items-center rounded-lg border bg-background">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-2 hover:bg-muted transition-colors rounded-l-lg"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-8 text-center text-sm font-semibold">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(stock, quantity + 1))}
            className="p-2 hover:bg-muted transition-colors rounded-r-lg"
            aria-label="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Add to Cart button */}
        <Button
          size="sm"
          className="h-10 px-4 font-semibold rounded-lg shadow-sm"
          onClick={onAddToCart}
        >
          <ShoppingCart className="w-4 h-4 mr-1.5" />
          Add
        </Button>
      </div>
    </div>
  );
}
