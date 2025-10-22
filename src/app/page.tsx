"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Truck, Heart } from "lucide-react";

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Crispy Mushroom Chicharon",
    grower: "@FungiFreshFarms",
    price: "₱150.00 / 100g pack",
    image: "/placeholder.png",
  },
  {
    id: 2,
    name: "Fresh White Oyster Mushrooms",
    grower: "@FungiFreshFarms",
    price: "₱120.00 / 250g",
    image: "/placeholder.png",
  },
  {
    id: 3,
    name: "Fresh Grey Oyster Mushroom",
    grower: "@TheMushroomPatchBukidnon",
    price: "₱150.00 / 200g",
    image: "/placeholder.png",
  },
  {
    id: 4,
    name: "DIY Mushroom Growing Kit",
    grower: "@KingFarms",
    price: "₱350.00 / kit",
    image: "/placeholder.png",
  },
];

const MOCK_GROWERS = [
  {
    id: 1,
    name: "Fungi Fresh Farms",
    tagline: "Urban-grown gourmet mushrooms for the modern kitchen.",
    location: "Caloocan City, Metro Manila",
    logo: "/placeholder.png",
  },
  {
    id: 2,
    name: "The Mushroom Patch Bukidnon",
    tagline: "From the cool highlands of Bukidnon, delivered to your door.",
    location: "Lantapan, Bukidnon",
    logo: "/placeholder.png",
  },
  {
    id: 3,
    name: "Kabutehan ni Aling Nena",
    tagline: "Traditional mushroom growing with a mother's touch.",
    location: "Antipolo, Rizal",
    logo: "/placeholder.png",
  },
];

const HeroSection: React.FC = () => (
  <section className="relative min-h-screen flex items-center bg-cover bg-center overflow-hidden">
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{
        backgroundImage: "url(/Hero\\ Section.png)",
      }}
    />
    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />

    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
      <div className="max-w-4xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
          Freshly Harvested Mushrooms, Straight From a Grower Near You.
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl leading-relaxed">
          Discover the best of Philippine-grown gourmet mushrooms. Supporting local farmers with every order.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/catalog">
            <Button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 h-auto text-base sm:text-lg rounded-lg bg-[#6A994E] hover:bg-[#6A994E]/90 text-white font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg">
              Shop All Mushrooms
            </Button>
          </Link>
          <Link href="/grower">
            <Button variant="outline" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 h-auto text-base sm:text-lg rounded-lg border-white text-white hover:bg-white hover:text-gray-900 font-semibold transition-all duration-200">
              Meet Our Growers
            </Button>
          </Link>
        </div>
      </div>
    </div>

    {/* Scroll indicator */}
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
      <div className="w-3 h-3 rounded-full bg-white/80"></div>
      <div className="w-3 h-3 rounded-full bg-white/40"></div>
      <div className="w-3 h-3 rounded-full bg-white/40"></div>
    </div>
  </section>
);

const ProductCard: React.FC<{ product: (typeof MOCK_PRODUCTS)[0] }> = ({
  product,
}) => (
  <Card className="overflow-hidden hover:shadow-xl transition-shadow">
    <Link href={`/product/${product.id}`}>
      <Image
        src={product.image}
        alt={product.name}
        width={250}
        height={150}
        className="w-full h-40 object-cover"
      />
    </Link>
    <CardContent className="p-4">
      <h3 className="text-lg font-semibold mb-1 text-[#212121]">
        {product.name}
      </h3>
      <p className="text-sm text-gray-500 mb-2">{product.grower}</p>
      <p className="text-xl font-bold text-[#1E392A] mb-4">{product.price}</p>
      <Button className="w-full bg-[#6A994E] hover:bg-[#6A994E]/90">
        Add to Cart
      </Button>
    </CardContent>
  </Card>
);

const FeaturedProductsSection: React.FC = () => (
  <section className="py-12 sm:py-16 lg:py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
          Our Bestsellers
        </h2>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Hand-picked favorites from our local growers, loved by our community.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {MOCK_PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="text-center mt-8 sm:mt-12">
        <Link href="/catalog">
          <Button className="px-6 sm:px-8 py-3 sm:py-4 h-auto text-base sm:text-lg rounded-lg border-2 border-[#1E392A] text-[#1E392A] hover:bg-[#1E392A] hover:text-white font-semibold transition-all duration-200">
            View More Products
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

const FeatureItem: React.FC<{
  icon: React.ReactNode;
  headline: string;
  subheadline: string;
}> = ({ icon, headline, subheadline }) => (
  <Card className="text-center p-6">
    <CardContent className="pt-6">
      <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full mb-4 bg-gray-200 text-[#1E392A]">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-[#212121]">{headline}</h3>
      <p className="text-gray-600 font-['Roboto'] text-sm">{subheadline}</p>
    </CardContent>
  </Card>
);

const WhyMASHSection: React.FC = () => (
  <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
          Why MASH?
        </h2>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Freshness and Quality You Can Trust
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        <FeatureItem
          icon={<Leaf size={32} className="sm:w-8 sm:h-8" />}
          headline="Locally Sourced"
          subheadline="Every mushroom is cultivated with care by our network of trusted Filipino growers."
        />
        <FeatureItem
          icon={<Truck size={32} className="sm:w-8 sm:h-8" />}
          headline="Peak Freshness"
          subheadline="Harvested and delivered fresh, ensuring the best flavor and nutritional value."
        />
        <FeatureItem
          icon={<Heart size={32} className="sm:w-8 sm:h-8" />}
          headline="Support Local"
          subheadline="Your purchase directly empowers small-scale farmers and promotes sustainable agriculture."
        />
      </div>
    </div>
  </section>
);

const GrowerCard: React.FC<{ grower: (typeof MOCK_GROWERS)[0] }> = ({
  grower,
}) => (
  <Card className="border-t-8 border-t-[#6A994E]">
    <CardContent className="p-6 text-center">
      <div className="flex justify-center mb-4">
        <Image
          src={grower.logo}
          alt={grower.name}
          width={64}
          height={64}
          className="rounded-full shadow-md"
        />
      </div>
      <h3 className="text-2xl font-semibold mb-1 text-[#212121]">
        {grower.name}
      </h3>
      <p className="text-gray-500 text-sm mb-3">{grower.location}</p>
      <p className="text-gray-600 text-sm italic mb-4">
        &ldquo;{grower.tagline}&rdquo;
      </p>
      <div className="flex justify-center gap-4 mt-4">
        <Link
          href={`/profile/${grower.id}`}
          className="text-[#1E392A] font-semibold hover:underline text-sm"
        >
          Visit Store
        </Link>
        <Link
          href={`/profile/${grower.id}`}
          className="text-gray-500 hover:underline text-sm"
        >
          Read More
        </Link>
      </div>
    </CardContent>
  </Card>
);

const FeaturedGrowersSection: React.FC = () => (
  <section className="py-12 sm:py-16 lg:py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
          Meet Our Growers
        </h2>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          The passionate farmers behind your food.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {MOCK_GROWERS.map((grower) => (
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
