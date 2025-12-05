/**
 * BundleCard Component
 * Displays product bundles with savings and product list
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { ProductBundle } from "@/hooks/useSanityBundles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ShoppingCart, Package, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface BundleCardProps {
  bundle: ProductBundle;
  onAddToCart?: (bundle: ProductBundle) => void;
  className?: string;
}

export function BundleCard({ bundle, onAddToCart, className }: BundleCardProps) {
  const totalProductPrice = bundle.products.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const savings = totalProductPrice - bundle.bundlePrice;
  const savingsPercentage = Math.round((savings / totalProductPrice) * 100);

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Bundle Image */}
      <Link href={`/bundle/${bundle.slug}`}>
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {bundle.bundleImage ? (
            <Image
              src={bundle.bundleImage}
              alt={bundle.bundleName}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-16 w-16 text-muted-foreground" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {bundle.featured && (
              <Badge className="bg-yellow-500 text-black">
                <Star className="mr-1 h-3 w-3" />
                Featured
              </Badge>
            )}
            {bundle.badge && (
              <Badge variant="secondary" className="capitalize">
                {bundle.badge.replace("-", " ")}
              </Badge>
            )}
          </div>

          {/* Discount Badge */}
          {savingsPercentage > 0 && (
            <Badge
              variant="destructive"
              className="absolute top-2 right-2 text-lg font-bold"
            >
              {savingsPercentage}% OFF
            </Badge>
          )}
        </div>
      </Link>

      <CardHeader>
        <Link
          href={`/bundle/${bundle.slug}`}
          className="hover:text-primary-medium transition-colors"
        >
          <h3 className="font-semibold text-lg line-clamp-2">{bundle.bundleName}</h3>
        </Link>
        {bundle.tagline && (
          <p className="text-sm text-muted-foreground">{bundle.tagline}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Products in Bundle */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Includes:</p>
          <div className="space-y-1">
            {bundle.products.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  {item.quantity}x
                </span>
                <span className="line-clamp-1">{item.product.name}</span>
                {item.variant && (
                  <Badge variant="outline" className="text-xs">
                    {item.variant.variantName}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary-dark">
              ₱{bundle.bundlePrice.toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground line-through">
              ₱{totalProductPrice.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Save ₱{savings.toFixed(2)}
            </Badge>
            <span className="text-xs text-muted-foreground">
              vs buying separately
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          className="flex-1 bg-primary-dark hover:bg-primary-dark/90"
          onClick={() => onAddToCart?.(bundle)}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add Bundle to Cart
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/bundle/${bundle.slug}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * Compact bundle display for recommendations
 */
export function CompactBundleCard({
  bundle,
  onAddToCart,
}: {
  bundle: ProductBundle;
  onAddToCart?: (bundle: ProductBundle) => void;
}) {
  const totalProductPrice = bundle.products.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const savings = totalProductPrice - bundle.bundlePrice;

  return (
    <Card className="flex gap-4 p-4">
      {/* Bundle Image */}
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
        {bundle.bundleImage ? (
          <Image
            src={bundle.bundleImage}
            alt={bundle.bundleName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Bundle Info */}
      <div className="flex-1 space-y-1">
        <Link href={`/bundle/${bundle.slug}`} className="hover:text-primary-medium">
          <h4 className="font-medium line-clamp-1">{bundle.bundleName}</h4>
        </Link>
        <p className="text-sm text-muted-foreground">
          {bundle.products.length} products
        </p>
        <div className="flex items-center gap-2">
          <span className="font-bold text-primary-dark">
            ₱{bundle.bundlePrice.toFixed(2)}
          </span>
          <Badge variant="secondary" className="text-xs">
            Save ₱{savings.toFixed(2)}
          </Badge>
        </div>
      </div>

      {/* Add to Cart Button */}
      <Button
        size="sm"
        variant="outline"
        onClick={() => onAddToCart?.(bundle)}
      >
        <ShoppingCart className="h-4 w-4" />
      </Button>
    </Card>
  );
}

/**
 * Bundle List Component
 */
export function BundleList({
  bundles,
  onAddToCart,
  className,
}: {
  bundles: ProductBundle[];
  onAddToCart?: (bundle: ProductBundle) => void;
  className?: string;
}) {
  if (!bundles.length) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Bundles Available</h3>
        <p className="text-muted-foreground">
          Check back later for special bundle offers!
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
        className
      )}
    >
      {bundles.map((bundle) => (
        <BundleCard
          key={bundle.id}
          bundle={bundle}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
