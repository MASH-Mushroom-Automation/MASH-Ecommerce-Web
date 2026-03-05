"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  BadgeCheck,
  MapPin,
  Leaf,
  Clock,
  ChefHat,
  Truck,
  Snowflake,
  ShieldCheck,
  Zap,
  Timer,
  Minus,
  Plus,
} from "lucide-react";
import GrowerCard from "@/components/product/GrowerCard";

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
/*  ProductInfo                                                        */
/* ================================================================== */

interface ProductGrower {
  name: string;
  slug: string;
  image?: string;
  location?: string;
  isVerified?: boolean;
  id?: string;
}

interface ProductInfoProps {
  product: {
    id: string;
    name: string;
    price: number;
    unit?: string;
    compareAtPrice?: number;
    description?: string;
    category?: string;
    categorySlug?: string;
    stock: number;
    grower?: ProductGrower;
    freshnessInfo?: {
      harvestWindow?: string;
      shelfLife?: string;
    };
    preparationInfo?: {
      cookingTime?: string;
      difficultyLevel?: string;
    };
    deliveryOptions?: {
      sameDayDeliveryEligible?: boolean;
      perishable?: boolean;
    };
    nutritionalHighlights?: string[];
  };
  dynamicStock: number;
  quantity: number;
  setQuantity: (q: number) => void;
  discountPercent: number;
  onAddToCart: () => void;
  onQuickChat: () => void;
  addToCartRef: React.RefObject<HTMLDivElement | null>;
}

export function ProductInfo({
  product,
  dynamicStock,
  quantity,
  setQuantity,
  discountPercent,
  onAddToCart,
  onQuickChat,
  addToCartRef,
}: ProductInfoProps) {
  const hasRichInfo = !!(
    product.freshnessInfo ||
    product.preparationInfo ||
    product.nutritionalHighlights?.length ||
    product.deliveryOptions
  );

  return (
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
            onClick={onAddToCart}
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
            onQuickChat={() => onQuickChat()}
          />
        </div>
      )}

      {/* Grower Card (mobile) */}
      {product.grower && (
        <div className="mt-6 lg:hidden">
          <GrowerCard
            grower={product.grower}
            productName={product.name}
            onQuickChat={() => onQuickChat()}
          />
        </div>
      )}
    </div>
  );
}
