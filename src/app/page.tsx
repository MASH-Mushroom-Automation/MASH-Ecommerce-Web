"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/product/ProductCard";
import { useHomePageData } from "@/hooks/useMain";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CMSHeroSection } from "@/components/cms/HeroSection";
import { CMSFeatureSection } from "@/components/cms/FeatureSection";
import { useHeroSections, useFeatureSections } from "@/hooks/useCMS";
import {
  ProductListSkeleton,
  GrowerListSkeleton,
} from "@/components/ui/skeleton-loaders";

const HeroSection: React.FC = () => {
  const { heroes, loading, error } = useHeroSections();

  if (loading) {
    return (
      <section className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E392A]/5 to-[#6A994E]/5 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#6A994E] mx-auto"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-[#6A994E]/30 mx-auto"></div>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-800 animate-pulse">
                Discovering fresh mushrooms...
              </p>
              <p className="text-sm text-gray-600">
                Your marketplace is loading
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </section>
    );
  }

  if (heroes.length === 0) {
    return null;
  }

  return <CMSHeroSection data={heroes[0]} />;
};

const WhyMASHSection: React.FC = () => {
  const { features, loading, error } = useFeatureSections();

  if (loading) {
    return (
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="text-center mb-8 sm:mb-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-96 mx-auto"></div>
            </div>
          </div>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
              <p className="text-gray-600">Preparing your experience...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
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
  const { homeData, loading, error } = useHomePageData();

  if (loading) {
    return (
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Our Bestsellers
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
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
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
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
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Our Bestsellers
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Hand-picked favorites from our local growers, loved by our
            community.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {homeData?.featuredProducts?.slice(0, 4).map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              farm={product.grower}
              price={product.price}
              unit={product.weight}
              image={product.image}
              inStock={product.inStock}
            />
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-12">
          <Link href="/shop">
            <Button className="px-6 sm:px-8 py-3 sm:py-4 h-auto text-base sm:text-lg rounded-lg border-2 border-[#1E392A] text-[#1E392A] hover:bg-[#1E392A] hover:text-white font-semibold transition-all duration-200">
              View More Products
            </Button>
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
  <Card className="flex flex-col h-full min-h-[380px] overflow-hidden">
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
      <div className="h-32 w-full bg-gradient-to-br from-[#6A994E] to-[#A7C957]" />
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
            className="rounded-full shadow-lg border-4 border-white bg-white"
          />
        </div>
        <h3 className="text-2xl font-semibold mb-1 text-[#212121]">
          {grower.name}
        </h3>
        <p className="text-gray-500 text-sm mb-3">
          {grower.location || "Location not specified"}
        </p>
        <p className="text-gray-600 text-sm italic">
          &ldquo;{grower.tagline || "Quality mushrooms from local growers"}
          &rdquo;
        </p>
      </div>
      {/* Action links - always at bottom with mt-auto */}
      <div className="flex justify-center gap-4 mt-auto pt-4 border-t border-gray-100">
        <Link
          href={`/grower/${grower.id}`}
          className="text-[#1E392A] font-semibold hover:underline text-sm"
        >
          Visit Store
        </Link>
        <Link
          href={`/grower/${grower.id}`}
          className="text-gray-500 hover:underline text-sm"
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
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Meet Our Growers
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
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
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
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
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Meet Our Growers
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
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
            <Button className="px-6 sm:px-8 py-3 sm:py-4 h-auto text-base sm:text-lg rounded-lg border-2 border-[#1E392A] text-[#1E392A] hover:bg-[#1E392A] hover:text-white font-semibold transition-all duration-200">
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
    <div className="min-h-screen bg-gray-50">
      <main>
        <HeroSection />
        <FeaturedProductsSection />
        <WhyMASHSection />
        <FeaturedGrowersSection />
      </main>
    </div>
  );
}
