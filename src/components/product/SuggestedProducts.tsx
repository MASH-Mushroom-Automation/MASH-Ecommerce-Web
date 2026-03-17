"use client";

import React from "react";
import Link from "next/link";
import { Store, BadgeCheck, ExternalLink } from "lucide-react";
import { ProductCard } from "@/components/product";

/* ================================================================== */
/*  SuggestedProducts - "You May Also Like" section                    */
/* ================================================================== */
interface SuggestedProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  unit?: string;
  image?: string;
  images?: string[];
  isAvailable?: boolean;
  stock?: number;
  isFeatured?: boolean;
  isPromo?: boolean;
  productTags?: string[];
  description?: string;
}

interface SuggestedProductsProps {
  products: SuggestedProduct[];
  grower?: {
    name: string;
    slug: string;
    isVerified?: boolean;
  };
}

export function SuggestedProducts({ products, grower }: SuggestedProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="mt-14">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            You May Also Like
          </h2>
          {grower && (
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5" />
              More from{" "}
              <span className="font-medium text-foreground">
                {grower.name}
              </span>
              {grower.isVerified && (
                <BadgeCheck className="w-3.5 h-3.5 text-primary" />
              )}
            </p>
          )}
        </div>
        {grower?.slug && (
          <Link
            href={`/grower/${grower.slug}`}
            className="hidden sm:flex items-center gap-1.5 text-sm text-primary hover:underline transition-colors group font-medium"
          >
            View All
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
        {products.slice(0, 4).map((item) => (
          <ProductCard
            key={item.id}
            id={item.id}
            slug={item.slug}
            name={item.name}
            farm={grower?.name}
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

      {grower?.slug && (
        <div className="mt-5 sm:hidden text-center">
          <Link
            href={`/grower/${grower.slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
          >
            View All Products from {grower.name}
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </section>
  );
}
