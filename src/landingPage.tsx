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
  <section
    className="py-16 md:py-32 relative bg-cover bg-center"
    style={{
      backgroundImage:
        "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.2)), url(/Hero\\ Section.png)",
    }}
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white relative z-10">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 font-['Roboto'] max-w-3xl">
        Freshly Harvested Mushrooms, Straight From a Grower Near You.
      </h1>
      <p className="text-lg sm:text-xl mb-8 max-w-2xl font-['Roboto']">
        Discover the best of Philippine-grown gourmet mushrooms. Supporting
        local farmers with every order.
      </p>
      <Link href="/catalog">
        <Button className="px-8 py-6 h-auto text-lg rounded-xl transition-transform transform hover:scale-[1.05] bg-[#6A994E] text-white font-semibold shadow-xl hover:bg-[#6A994E]/90">
          Shop All Mushrooms
        </Button>
      </Link>
    </div>
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
      <div className="w-2 h-2 rounded-full bg-white opacity-100"></div>
      <div className="w-2 h-2 rounded-full bg-white opacity-50"></div>
      <div className="w-2 h-2 rounded-full bg-white opacity-50"></div>
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
  <section className="py-16 bg-white font-['Roboto']">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-semibold mb-2 text-center text-gray-700">
        Our Bestsellers
      </h2>
      <p className="text-center text-gray-500 mb-10 font-['Roboto']">
        Hand-picked favorites from our local growers, loved by our community.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {MOCK_PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="text-center mt-12">
        <Link href="/catalog">
          <Button
            variant="outline"
            className="px-8 py-6 h-auto rounded-xl border-2 border-[#1E392A] text-[#1E392A] font-semibold hover:bg-[#F5F5DC]"
          >
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
  <section className="py-16 bg-[#F5F5DC] font-['Roboto']">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-semibold mb-2 text-center text-gray-700">
        Why MASH?
      </h2>
      <p className="text-center text-gray-500 mb-10 font-['Roboto']">
        Freshness and Quality You Can Trust
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureItem
          icon={<Leaf size={28} />}
          headline="Locally Sourced"
          subheadline="Every mushroom is cultivated with care by our network of trusted Filipino growers."
        />
        <FeatureItem
          icon={<Truck size={28} />}
          headline="Peak Freshness"
          subheadline="Harvested and delivered fresh, ensuring the best flavor and nutritional value."
        />
        <FeatureItem
          icon={<Heart size={28} />}
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
  <section className="py-16 bg-white font-['Roboto']">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-semibold mb-2 text-center text-gray-700">
        Meet Our Growers
      </h2>
      <p className="text-center text-gray-500 mb-10 font-['Roboto']">
        The passionate farmers behind your food.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {MOCK_GROWERS.map((grower) => (
          <GrowerCard key={grower.id} grower={grower} />
        ))}
      </div>

      <div className="text-center mt-12">
        <Link href="/grower">
          <Button
            variant="outline"
            className="px-8 py-6 h-auto rounded-xl border-2 border-[#1E392A] text-[#1E392A] font-semibold hover:bg-[#F5F5DC]"
          >
            View All Growers
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

export default function LandingPage() {
  return (
    <div className="bg-[#F5F5DC] min-h-screen">
      <main>
        <HeroSection />
        <FeaturedProductsSection />
        <WhyMASHSection />
        <FeaturedGrowersSection />
      </main>
    </div>
  );
}
