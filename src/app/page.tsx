"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/product/ProductCard";
import { useHomePageData } from "@/hooks/useMain";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SanityHeroCarousel } from "@/components/hero/SanityHeroCarousel";
import { CMSFeatureSection } from "@/components/cms/FeatureSection";
import { useFeatureSections } from "@/hooks/useCMS";
import { useSanityFeaturedProducts } from "@/hooks/useSanityProducts";
import { useSanityCategories } from "@/hooks/useSanityCategories";
import {
  ProductListSkeleton,
  GrowerListSkeleton,
} from "@/components/ui/skeleton-loaders";

const HeroSection: React.FC = () => {
  // Use Sanity CMS for hero carousel with real-time updates
  return <SanityHeroCarousel />;
};

const WhyMASHSection: React.FC = () => {
  const { features, loading, error } = useFeatureSections();

  if (loading) {
    return (
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="text-center mb-8 sm:mb-12">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-96 mx-auto"></div>
            </div>
          </div>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
              <p className="text-muted-foreground">Preparing your experience...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </section>
    );
  }

  if (features.length === 0) {
    return null;
  }

  return <CMSFeatureSection data={features[0]} />;
};

const FeaturedProductsSection: React.FC = () => {
  // Use Sanity CMS for featured products
  const { products, loading, error } = useSanityFeaturedProducts(8);

  if (loading) {
    return (
      <section className="py-12 sm:py-16 lg:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Our Bestsellers
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Hand-picked favorites from our local growers, loved by our
              community.
            </p>
          </div>
          <ProductListSkeleton count={8} />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 sm:py-16 lg:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading featured products</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return (
      <section className="py-12 sm:py-16 lg:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No featured products available yet.</p>
            <Link href="/shop">
              <Button>Browse All Products</Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Our Bestsellers
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Hand-picked favorites from our local growers, loved by our
            community.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {products.slice(0, 8).map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              slug={product.slug}
              name={product.name}
              farm={product.category || "MASH Market"}
              price={product.price}
              unit={product.unit || "kg"}
              image={product.image}
              inStock={product.isAvailable}
            />
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-12">
          <Link href="/shop">
            <Button variant="outline" className="px-6 sm:px-8 py-3 sm:py-4 h-auto text-base sm:text-lg rounded-lg font-semibold transition-all duration-200">
              View More Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

// Category Showcase Components
const CategoryCard: React.FC<{
  name: string;
  slug: string;
  image?: string;
  productCount?: number;
}> = ({ name, slug, image, productCount }) => {
  return (
    <Link href={`/shop?category=${slug}`}>
      <div className="group relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300">
        {image ? (
          <div className="aspect-square overflow-hidden">
            <Image
              src={image}
              alt={name}
              width={400}
              height={400}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <span className="text-6xl opacity-20">🍄</span>
          </div>
        )}
        <div className="p-4 text-center">
          <h3 className="font-bold text-lg text-gray-800">{name}</h3>
          {productCount !== undefined && (
            <p className="text-sm text-muted-foreground">
              {productCount} {productCount === 1 ? 'product' : 'products'}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

const FeaturedCategoriesSection: React.FC = () => {
  const { categories, loading, error } = useSanityCategories(true);

  if (loading) {
    return (
      <section className="py-12 md:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-xl mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 md:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading categories: {error.message}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </section>
    );
  }

  // Only show parent categories (no parent)
  const parentCategories = categories.filter(cat => !cat.parentId);

  if (parentCategories.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {parentCategories.slice(0, 4).map((category) => (
            <CategoryCard
              key={category.id}
              name={category.name}
              slug={category.slug}
              image={category.image}
              productCount={category.productCount}
            />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark transition-colors"
          >
            View All Categories
          </Link>
        </div>
      </div>
    </section>
  );
};

const GrowerCard: React.FC<{
  grower: {
    id: number;
    name: string;
    logo?: string;
    banner?: string;
    location?: string;
    tagline?: string;
  };
}> = ({ grower }) => (
  <Card className="flex flex-col h-full min-h-[380px] overflow-hidden border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
    {/* Banner image or colored bar at top */}
    {grower.banner ? (
      <div className="relative h-32 w-full">
        <Image
          src={grower.banner}
          alt={`${grower.name} banner`}
          fill
          className="object-cover"
        />
      </div>
    ) : (
      <div className="h-32 w-full bg-gradient-to-br from-primary to-accent" />
    )}

    <CardContent className="p-6 text-center flex flex-col flex-grow">
      {/* Content section - flex-grow pushes links to bottom */}
      <div className="flex-grow flex flex-col">
        <div className="flex justify-center -mt-10 mb-4 relative z-10">
          <Image
            src={grower.logo || "/placeholder.png"}
            alt={grower.name}
            width={80}
            height={80}
            className="rounded-full shadow-lg border-4 border-background bg-background"
          />
        </div>
        <h3 className="text-2xl font-semibold mb-1 text-foreground">
          {grower.name}
        </h3>
        <p className="text-muted-foreground text-sm mb-3">
          {grower.location || "Location not specified"}
        </p>
        <p className="text-muted-foreground text-sm italic">
          &ldquo;{grower.tagline || "Quality mushrooms from local growers"}
          &rdquo;
        </p>
      </div>
      {/* Action links - always at bottom with mt-auto */}
      <div className="flex justify-center gap-4 mt-auto pt-4 border-t border-border">
        <Link
          href={`/grower/${grower.id}`}
          className="text-primary font-semibold hover:underline text-sm"
        >
          Visit Store
        </Link>
        <Link
          href={`/grower/${grower.id}`}
          className="text-muted-foreground hover:underline text-sm"
        >
          Read More
        </Link>
      </div>
    </CardContent>
  </Card>
);

const FeaturedGrowersSection: React.FC = () => {
  const { homeData, loading, error } = useHomePageData();

  if (loading) {
    return (
      <section className="py-12 sm:py-16 lg:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Meet Our Growers
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              The passionate farmers behind your food.
            </p>
          </div>
          <GrowerListSkeleton count={4} />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 sm:py-16 lg:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Meet Our Growers
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            The passionate farmers behind your food.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {homeData?.topGrowers?.slice(0, 3).map((grower) => (
            <GrowerCard key={grower.id} grower={grower} />
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-12">
          <Link href="/grower">
            <Button variant="outline" className="px-6 sm:px-8 py-3 sm:py-4 h-auto text-base sm:text-lg rounded-lg font-semibold transition-all duration-200">
              View All Growers
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />
        <FeaturedProductsSection />
        <FeaturedCategoriesSection />
        <WhyMASHSection />
        <FeaturedGrowersSection />
      </main>
    </div>
  );
}
