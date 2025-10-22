"use client";

import React, { useState } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { getProductById } from "@/lib/products";
import type { Product } from "@/lib/products";

type Props = { params: { id: string } };

const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

function ProductDetailsContent({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(
    product.images?.[0] ?? product.image
  );

  const allImages =
    product.images && product.images.length > 0
      ? product.images
      : [product.image, product.image, product.image];

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Product Display Section */}
        <section className="flex flex-col lg:flex-row gap-6 lg:gap-12 bg-white rounded-lg p-4 sm:p-6 lg:p-8 shadow-sm">
          {/* Image Gallery */}
          <div className="lg:w-1/2 w-full">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3 sm:mb-4 relative">
              <Image
                src={activeImage}
                alt={product.name}
                width={800}
                height={800}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {allImages.slice(0, 4).map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(img)}
                  className={cn(
                    "relative w-full bg-gray-100 rounded-md overflow-hidden ring-2 ring-offset-2 transition-all",
                    activeImage === img ? "ring-[#1E392A]" : "ring-transparent"
                  )}
                  style={{ aspectRatio: "1/1" }}
                >
                  <Image
                    src={img}
                    alt={`thumbnail ${index + 1}`}
                    width={150}
                    height={150}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:w-1/2 w-full">
            <div className="inline-block px-3 py-1 bg-[#6A994E]/10 text-[#6A994E] rounded-full text-xs sm:text-sm font-medium mb-3">
              @{product.grower}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              {product.name}
            </h1>
            <p className="text-2xl sm:text-3xl font-bold text-[#1E392A] mb-2">
              ₱{product.price.toFixed(2)}
              <span className="text-base sm:text-lg text-gray-500 font-normal ml-2">
                / {product.weight}
              </span>
            </p>
            <p className="text-sm font-medium text-green-600 mb-6">
              {product.inStock !== false ? "In Stock" : "Out of Stock"}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleQuantityChange(-1)}
                  className="h-11 sm:h-12 w-11 sm:w-12 rounded-none hover:bg-gray-100 text-lg"
                >
                  -
                </Button>
                <span className="w-11 sm:w-12 text-center font-semibold text-base sm:text-lg">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleQuantityChange(1)}
                  className="h-11 sm:h-12 w-11 sm:w-12 rounded-none hover:bg-gray-100 text-lg"
                >
                  +
                </Button>
              </div>
              <Button
                className="w-full h-11 sm:h-12 flex-1 bg-[#1E392A] hover:bg-[#1E392A]/90 text-white font-semibold rounded-lg"
                disabled={product.inStock === false}
              >
                <ShoppingCart className="mr-2" size={20} />
                Add to Cart
              </Button>
            </div>
          </div>
        </section>

        {/* Description Section */}
        <section className="mt-6 sm:mt-8 lg:mt-12">
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 lg:p-8 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Description</h2>
            <div className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base space-y-4 sm:space-y-6">
              <p className="leading-relaxed">
                {product.description ||
                  "Our best-selling mushrooms. Bold, meaty, and incredibly versatile. Perfect for sautés, soups, and stir-fries. Harvested daily for peak freshness."}
              </p>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Storage & Handling
                </h3>
                <p>
                  Keep refrigerated in a paper bag for up to 5-7 days. Avoid
                  washing until just before use to maintain freshness.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  About The Grower
                </h3>
                <p>
                  Fungi Fresh Farms is a family-run urban farm located right in
                  the heart of North Caloocan. We specialize in growing
                  high-quality White and Pink Oyster mushrooms using
                  sustainable, small-batch methods. Our passion is that fresh,
                  healthy food can be grown just around the corner. By
                  controlling every aspect of the growing environment, we ensure
                  our mushrooms are always fresh, flavorful, and free from
                  pesticides.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Related Products Section */}
        <section className="mt-6 sm:mt-8 lg:mt-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 px-1">
            Related Products
          </h2>
          <div className="relative -mx-4 sm:mx-0">
            <div className="flex overflow-x-auto space-x-4 sm:space-x-6 px-4 sm:px-0 pb-4 scroll-smooth snap-x snap-mandatory scrollbar-hide">
              {[
                {
                  id: 2,
                  name: "King Oyster Mushrooms",
                  grower: "AlingNena",
                  price: 160.0,
                  weight: "250g",
                },
                {
                  id: 3,
                  name: "Blue Oyster Mushrooms",
                  grower: "TheMushroomPatch",
                  price: 180.0,
                  weight: "200g",
                },
                {
                  id: 4,
                  name: "Classic Grey Oyster",
                  grower: "AlingNena",
                  price: 110.0,
                  weight: "250g",
                },
                {
                  id: 5,
                  name: "Golden Oyster Mushrooms",
                  grower: "AlingNena",
                  price: 130.0,
                  weight: "250g",
                },
                {
                  id: 6,
                  name: "Dried Shiitake Mushrooms",
                  grower: "FungiFreshFarms",
                  price: 200.0,
                  weight: "50g",
                },
              ].map((relatedProduct) => (
                <div
                  key={relatedProduct.id}
                  className="snap-start shrink-0 w-[180px] sm:w-[220px] lg:w-[250px] group"
                >
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                    <Image
                      src="/placeholder.png"
                      alt={relatedProduct.name}
                      width={250}
                      height={250}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="mt-2 sm:mt-3">
                    <div className="inline-block px-2 py-0.5 bg-[#6A994E]/10 text-[#6A994E] rounded-full text-xs font-medium mb-1">
                      @{relatedProduct.grower}
                    </div>
                    <h3 className="font-semibold text-sm sm:text-md line-clamp-2 h-10 sm:h-12">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex justify-between items-center mt-2 gap-2">
                      <div className="flex flex-col">
                        <p className="text-sm sm:text-base font-bold text-[#1E392A]">
                          ₱{relatedProduct.price.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          / {relatedProduct.weight}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 sm:h-9 sm:w-9 bg-[#1E392A] text-white hover:bg-[#1E392A]/90 flex-shrink-0"
                      >
                        <ShoppingCart size={14} className="sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function ProductDetailsRoute({ params }: Props) {
  const product = getProductById(params.id);
  if (!product) return notFound();
  return <ProductDetailsContent product={product} />;
}
