"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/product/ProductCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SanityHeroCarousel } from "@/components/hero/SanityHeroCarousel";
import { SanityFeatureSection } from "@/components/cms/SanityFeatureSection"; // Phase 4: Use Sanity
import { TestimonialsSection } from "@/components/cms/TestimonialsSection";
import { HowItWorks } from "@/components/cms/HowItWorks";
import { NewsletterSignup } from "@/components/cms/NewsletterSignup";
import { useSanityFeatures } from "@/hooks/useSanityFeatures"; // Phase 4: Sanity hook
import { useSanityFeaturedProducts } from "@/hooks/useSanityProducts";
import { useSanityCategories } from "@/hooks/useSanityCategories";
import { useProductRatings } from "@/hooks/useProductRatings";
import { useSanityGrowers } from "@/hooks/useSanityGrowers"; // Phase 1: Use Sanity for growers
import {
  ProductListSkeleton,
  GrowerListSkeleton,
} from "@/components/ui/skeleton-loaders";
import {
  Package,
  Users,
  Star,
  Truck,
  ArrowRight,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Reusable section header with decorative badge and accent line
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
        className={`inline-block px-4 py-1.5 text-xs font-bold tracking-widest uppercase rounded-full mb-4 ${
          light
            ? "bg-white/15 text-white"
            : "bg-primary/10 text-primary"
        }`}
      >
        {badge}
      </span>
    )}
    <h2
      className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 ${
        light ? "text-white" : "text-foreground"
      }`}
    >
      {title}
    </h2>
    {subtitle && (
      <p
        className={`text-base sm:text-lg max-w-2xl mx-auto leading-relaxed ${
          light ? "text-white/75" : "text-muted-foreground"
        }`}
      >
        {subtitle}
      </p>
    )}
    <div
      className={`mt-5 mx-auto w-12 h-1 rounded-full ${
        light ? "bg-white/40" : "bg-primary/40"
      }`}
    />
  </div>
);

// ---------------------------------------------------------------------------
// Stats / trust bar displayed after the hero section
// ---------------------------------------------------------------------------
const StatsBar: React.FC = () => {
  const stats = [
    { icon: Package, value: "1,000+", label: "Products Available" },
    { icon: Users, value: "50+", label: "Local Farms" },
    { icon: Star, value: "4.9/5", label: "Customer Rating" },
    { icon: Truck, value: "Same-Day", label: "Fresh Delivery" },
  ];

  return (
    <section className="relative bg-gradient-to-r from-primary via-primary to-primary-dark text-primary-foreground py-8 sm:py-10 overflow-hidden">
      {/* Decorative blurred orbs */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-white rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center group">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/15 mb-3 group-hover:bg-white/25 transition-colors duration-300">
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight">
                {stat.value}
              </div>
              <div className="text-sm text-primary-foreground/75 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HeroSection: React.FC = () => {
  // Use Sanity CMS for hero carousel with real-time updates
  return <SanityHeroCarousel />;
};

const WhyMASHSection: React.FC = () => {
  // Phase 4: Use Sanity CMS for feature sections
  const { features, loading, error } = useSanityFeatures({
    homepageOnly: true,
  });

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
              <p className="text-muted-foreground">
                Preparing your experience...
              </p>
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
            <p className="text-red-600 mb-4">
              Error: {error?.message || "Failed to load features"}
            </p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </section>
    );
  }

  if (features.length === 0) {
    return null;
  }

  // Phase 4: Render feature sections from Sanity CMS
  return <SanityFeatureSection data={features[0]} />;
};

const FeaturedProductsSection: React.FC = () => {
  // Use Sanity CMS for featured products
  const { products, loading, error } = useSanityFeaturedProducts(8);
  const productIds = (products || []).map((p) => p.id);
  const { ratings: productRatings } = useProductRatings(productIds);

  if (loading) {
    return (
      <section className="py-14 sm:py-18 lg:py-24 bg-background">
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
    <section className="py-14 sm:py-18 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
        <SectionHeader
          badge="Best Sellers"
          title="Our Bestsellers"
          subtitle="Hand-picked favorites from our local growers, loved by our community."
        />

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
              rating={productRatings[product.id]?.averageRating}
              reviewCount={productRatings[product.id]?.totalReviews}
            />
          ))}
        </div>

        <div className="text-center mt-10 sm:mt-14">
          <Link href="/shop">
            <Button
              variant="outline"
              className="group px-8 sm:px-10 py-3.5 sm:py-4 h-auto text-base sm:text-lg rounded-xl font-semibold border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
            >
              View More Products
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
      <div className="group relative overflow-hidden rounded-2xl aspect-[4/3] shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-accent/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all duration-500" />
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          <h3 className="text-white font-bold text-lg sm:text-xl mb-1.5 drop-shadow-md">
            {name}
          </h3>
          {productCount !== undefined && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm border border-white/10">
              {productCount} {productCount === 1 ? "product" : "products"}
            </span>
          )}
        </div>
        <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/0 group-hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
          <ArrowRight className="w-5 h-5 text-white" />
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
      <section className="py-12 md:py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-foreground">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-muted rounded-xl mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 md:py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-destructive mb-4">
              Error loading categories: {error.message}
            </p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </section>
    );
  }

  // Only show parent categories (no parent)
  const parentCategories = categories.filter((cat) => !cat.parentId);

  if (parentCategories.length === 0) {
    return null;
  }

  return (
    <section className="py-14 md:py-18 lg:py-24 bg-gradient-to-b from-muted/50 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Explore"
          title="Shop by Category"
          subtitle="Browse our curated collection of premium mushroom varieties."
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
        <div className="text-center mt-10 sm:mt-14">
          <Link href="/shop">
            <Button className="group px-8 sm:px-10 py-3.5 sm:py-4 h-auto text-base sm:text-lg rounded-xl font-semibold transition-all duration-300">
              View All Categories
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
  <Card className="group flex flex-col h-full min-h-[380px] overflow-hidden border border-border bg-card shadow-sm hover:shadow-xl transition-all duration-300">
    {/* Banner image or gradient bar */}
    {grower.coverImage ? (
      <div className="relative h-32 w-full overflow-hidden">
        <Image
          src={grower.coverImage}
          alt={`${grower.name} banner`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
    ) : (
      <div className="h-32 w-full bg-gradient-to-br from-primary via-primary/80 to-accent" />
    )}

    <CardContent className="p-6 text-center flex flex-col flex-grow">
      <div className="flex-grow flex flex-col">
        <div className="flex justify-center -mt-10 mb-4 relative z-10">
          <div className="rounded-full p-1 bg-background shadow-lg">
            <Image
              src={grower.logo || grower.image || "/placeholder.png"}
              alt={grower.name}
              width={80}
              height={80}
              className="rounded-full border-2 border-primary/20 bg-background object-cover"
            />
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mb-1">
          <h3 className="text-xl font-bold text-foreground">
            {grower.name}
          </h3>
          {grower.isVerified && (
            <span
              title="Verified Seller"
              className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold"
            >
              &#10003;
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-sm mb-3">
          {grower.location || "Location not specified"}
        </p>
        <p className="text-muted-foreground text-sm italic leading-relaxed">
          &ldquo;
          {grower.tagline ||
            grower.bio ||
            "Quality mushrooms from local growers"}
          &rdquo;
        </p>
      </div>
      <div className="flex justify-center gap-4 mt-auto pt-4 border-t border-border">
        <Link
          href={`/grower/${grower.slug || grower.id}`}
          className="inline-flex items-center gap-1 text-primary font-semibold hover:underline text-sm group/link"
        >
          Visit Store
          <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
        </Link>
        <Link
          href={`/grower/${grower.slug || grower.id}`}
          className="text-muted-foreground hover:text-foreground hover:underline text-sm transition-colors"
        >
          Read More
        </Link>
      </div>
    </CardContent>
  </Card>
);

const FeaturedGrowersSection: React.FC = () => {
  // Phase 1: Use Sanity CMS for growers (replaces useHomePageData)
  const { growers, loading, error } = useSanityGrowers({
    isActive: true,
    limit: 6,
  });

  if (loading) {
    return (
      <section className="py-14 sm:py-18 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <SectionHeader
            badge="Our Farmers"
            title="Meet Our Growers"
            subtitle="The passionate farmers behind your food."
          />
          <GrowerListSkeleton count={4} />
        </div>
      </section>
    );
  }

  // Silently hide section if backend API is unavailable
  // (This prevents 404 errors from breaking the homepage)
  if (error || !growers || growers.length === 0) {
    return null;
  }

  return (
    <section className="py-14 sm:py-18 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
        <SectionHeader
          badge="Our Farmers"
          title="Meet Our Growers"
          subtitle="The passionate farmers behind your food."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {growers.slice(0, 3).map((grower) => (
            <GrowerCard key={grower.id} grower={grower} />
          ))}
        </div>

        <div className="text-center mt-10 sm:mt-14">
          <Link href="/grower">
            <Button
              variant="outline"
              className="group px-8 sm:px-10 py-3.5 sm:py-4 h-auto text-base sm:text-lg rounded-xl font-semibold border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
            >
              View All Growers
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
        <StatsBar />
        <FeaturedProductsSection />
        <FeaturedCategoriesSection />
        <HowItWorks />
        <WhyMASHSection />
        <FeaturedGrowersSection />
        <TestimonialsSection />
        <NewsletterSignup />
      </main>
    </div>
  );
}
