"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/product/ProductCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SanityHeroCarousel } from "@/components/hero/SanityHeroCarousel";
import { SanityFeatureSection } from "@/components/cms/SanityFeatureSection";
import { TestimonialsSection } from "@/components/cms/TestimonialsSection";
import { HowItWorks } from "@/components/cms/HowItWorks";
import { useSanityFeatures } from "@/hooks/useSanityFeatures";
import { useSanityFeaturedProducts } from "@/hooks/useSanityProducts";
import { useSanityCategories } from "@/hooks/useSanityCategories";
import { useProductRatings } from "@/hooks/useProductRatings";
import { useSanityGrowers } from "@/hooks/useSanityGrowers";
import {
  ProductListSkeleton,
  GrowerListSkeleton,
} from "@/components/ui/skeleton-loaders";
import {
  ArrowRight,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Reusable section header -- minimal, clean design
// ---------------------------------------------------------------------------
const SectionHeader: React.FC<{
  badge?: string;
  title: string;
  subtitle?: string;
  light?: boolean;
}> = ({ badge, title, subtitle, light }) => (
  <div className="text-center mb-10 sm:mb-14">
    {badge && (
      <span
        className={`inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full mb-4 ${
          light
            ? "bg-white/10 text-white border border-white/20"
            : "bg-primary/8 text-primary border border-primary/15"
        }`}
      >
        {badge}
      </span>
    )}
    <h2
      className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3 sm:mb-4 ${
        light ? "text-white" : "text-foreground"
      }`}
    >
      {title}
    </h2>
    {subtitle && (
      <p
        className={`text-base sm:text-lg max-w-2xl mx-auto leading-relaxed ${
          light ? "text-white/70" : "text-muted-foreground"
        }`}
      >
        {subtitle}
      </p>
    )}
    <div
      className={`mt-5 mx-auto w-10 h-0.5 rounded-full ${
        light ? "bg-white/30" : "bg-primary/30"
      }`}
    />
  </div>
);

const HeroSection: React.FC = () => {
  return <SanityHeroCarousel />;
};

const WhyMASHSection: React.FC = () => {
  const { features, loading, error } = useSanityFeatures({
    homepageOnly: true,
  });

  if (loading) {
    return (
      <section className="py-14 sm:py-18 lg:py-24 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="text-center mb-8 sm:mb-12">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-64 mx-auto mb-4" />
              <div className="h-4 bg-muted rounded w-96 mx-auto" />
            </div>
          </div>
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="text-center">
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">
                Loading features...
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-14 sm:py-18 lg:py-24 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="text-center">
            <p className="text-destructive mb-4">
              {error?.message || "Failed to load features"}
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (features.length === 0) {
    return null;
  }

  return <SanityFeatureSection data={features[0]} />;
};

const FeaturedProductsSection: React.FC = () => {
  const { products, loading, error } = useSanityFeaturedProducts(8);
  const productIds = (products || []).map((p) => p.id);
  const { ratings: productRatings } = useProductRatings(productIds);

  if (loading) {
    return (
      <section className="py-16 sm:py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <SectionHeader
            badge="Best Sellers"
            title="Our Bestsellers"
            subtitle="Hand-picked favorites from our local growers, loved by our community."
          />
          <ProductListSkeleton count={8} />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 sm:py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="text-center">
            <p className="text-destructive mb-4">Error loading featured products</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return (
      <section className="py-16 sm:py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              No featured products available yet.
            </p>
            <Link href="/shop">
              <Button>Browse All Products</Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20 lg:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
        <SectionHeader
          badge="Best Sellers"
          title="Our Bestsellers"
          subtitle="Hand-picked favorites from our local growers, loved by our community."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-7">
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
              rating={productRatings[product.id]?.averageRating}
              reviewCount={productRatings[product.id]?.totalReviews}
            />
          ))}
        </div>

        <div className="text-center mt-12 sm:mt-16">
          <Link href="/shop">
            <Button
              variant="outline"
              size="lg"
              className="group px-10 py-4 h-auto text-base font-semibold rounded-lg border-2 border-border hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-200"
            >
              View More Products
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
      <div className="group relative overflow-hidden rounded-xl aspect-[4/3] border border-border bg-muted hover:shadow-lg transition-all duration-300 cursor-pointer">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-muted" />
        )}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-white font-semibold text-lg mb-1.5">
            {name}
          </h3>
          {productCount !== undefined && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-white/15 text-white backdrop-blur-sm">
              {productCount} {productCount === 1 ? "product" : "products"}
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/0 group-hover:bg-white/15 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100">
          <ArrowRight className="w-4 h-4 text-white" />
        </div>
      </div>
    </Link>
  );
};

const FeaturedCategoriesSection: React.FC = () => {
  const { categories, loading, error } = useSanityCategories({
    includeProductCount: true,
  });

  if (loading) {
    return (
      <section className="py-16 sm:py-20 lg:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Explore"
            title="Shop by Category"
            subtitle="Browse our curated collection of premium mushroom varieties."
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-muted rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 sm:py-20 lg:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-destructive mb-4">
              Error loading categories: {error.message}
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const parentCategories = categories.filter((cat) => !cat.parentId);

  if (parentCategories.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20 lg:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Explore"
          title="Shop by Category"
          subtitle="Browse our curated collection of premium mushroom varieties."
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
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
        <div className="text-center mt-12 sm:mt-16">
          <Link href="/shop">
            <Button
              size="lg"
              className="group px-10 py-4 h-auto text-base font-semibold rounded-lg transition-all duration-200"
            >
              View All Categories
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

const GrowerCard: React.FC<{
  grower: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    image?: string;
    coverImage?: string;
    location?: string;
    tagline?: string;
    bio?: string;
    isVerified?: boolean;
  };
}> = ({ grower }) => (
  <Card className="group flex flex-col h-full min-h-[360px] overflow-hidden border border-border bg-card hover:shadow-md transition-shadow duration-200">
    {/* Banner */}
    {grower.coverImage ? (
      <div className="relative h-28 w-full overflow-hidden">
        <Image
          src={grower.coverImage}
          alt={`${grower.name} banner`}
          fill
          className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
        />
      </div>
    ) : (
      <div className="h-28 w-full bg-primary/10" />
    )}

    <CardContent className="p-5 text-center flex flex-col flex-grow">
      <div className="flex-grow flex flex-col">
        <div className="flex justify-center -mt-10 mb-4 relative z-10">
          <div className="rounded-full p-0.5 bg-background shadow-sm border border-border">
            <Image
              src={grower.logo || grower.image || "/placeholder.png"}
              alt={grower.name}
              width={72}
              height={72}
              className="rounded-full border border-muted bg-background object-cover"
            />
          </div>
        </div>
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <h3 className="text-lg font-semibold text-foreground">
            {grower.name}
          </h3>
          {grower.isVerified && (
            <span
              title="Verified Seller"
              className="inline-flex items-center justify-center w-4.5 h-4.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold"
            >
              &#10003;
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-sm mb-3">
          {grower.location || "Location not specified"}
        </p>
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
          {grower.tagline || grower.bio || "Quality mushrooms from local growers"}
        </p>
      </div>
      <div className="flex justify-center gap-4 mt-auto pt-4 border-t border-border">
        <Link
          href={`/grower/${grower.slug || grower.id}`}
          className="inline-flex items-center gap-1 text-primary font-medium hover:underline text-sm group/link"
        >
          Visit Store
          <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </CardContent>
  </Card>
);

const FeaturedGrowersSection: React.FC = () => {
  const { growers, loading, error } = useSanityGrowers({
    isActive: true,
    limit: 6,
  });

  if (loading) {
    return (
      <section className="py-16 sm:py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <SectionHeader
            badge="Our Farmers"
            title="Meet Our Growers"
            subtitle="The passionate farmers behind your food."
          />
          <GrowerListSkeleton count={3} />
        </div>
      </section>
    );
  }

  if (error || !growers || growers.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20 lg:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
        <SectionHeader
          badge="Our Farmers"
          title="Meet Our Growers"
          subtitle="The passionate farmers behind your food."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {growers.slice(0, 3).map((grower) => (
            <GrowerCard key={grower.id} grower={grower} />
          ))}
        </div>

        <div className="text-center mt-12 sm:mt-16">
          <Link href="/grower">
            <Button
              variant="outline"
              size="lg"
              className="group px-10 py-4 h-auto text-base font-semibold rounded-lg border-2 border-border hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-200"
            >
              View All Growers
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
        <HowItWorks />
        <WhyMASHSection />
        <FeaturedGrowersSection />
        <TestimonialsSection />
      </main>
    </div>
  );
}
