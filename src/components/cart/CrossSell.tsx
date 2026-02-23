"use client";

import { useSanityFeaturedProducts } from "@/hooks/useSanityProducts";
import { ProductCard } from "@/components/product/ProductCard";
import { Sparkles } from "lucide-react";

interface CrossSellProps {
  /** Product IDs currently in cart, used to exclude from suggestions */
  excludeIds: string[];
  maxDisplay?: number;
}

/**
 * Cross-sell section for the cart page.
 * Displays featured products the user might also want to buy,
 * excluding items already in cart.
 */
export function CrossSell({ excludeIds, maxDisplay = 4 }: CrossSellProps) {
  const { products, loading } = useSanityFeaturedProducts(maxDisplay + excludeIds.length);

  if (loading) {
    return (
      <section className="mt-10">
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          You Might Also Like
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: maxDisplay }).map((_, i) => (
            <div
              key={i}
              className="bg-muted/30 rounded-lg animate-pulse h-64"
            />
          ))}
        </div>
      </section>
    );
  }

  const excludeSet = new Set(excludeIds);
  const filtered = products
    .filter((p) => !excludeSet.has(p.id))
    .slice(0, maxDisplay);

  if (filtered.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        You Might Also Like
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            slug={product.slug}
            name={product.name}
            farm={product.grower?.name || product.category || "MASH"}
            price={product.price}
            comparePrice={product.compareAtPrice}
            unit={product.unit || "250g"}
            image={product.image}
            images={product.images}
            inStock={product.stock > 0}
            stock={product.stock}
            tags={product.productTags || []}
            description={product.description}
          />
        ))}
      </div>
    </section>
  );
}
