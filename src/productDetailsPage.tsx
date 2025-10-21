"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/products";

type Props = { product: Product };

const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

export default function ProductDetailsPage({ product }: Props) {
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
    <div className="bg-white text-gray-800">
      <main className="container mx-auto px-6 py-12">
        {/* Product Display Section */}
        <section className="flex flex-col lg:flex-row gap-12">
          {/* Image Gallery */}
          <div className="lg:w-1/2">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
              <Image
                src={activeImage}
                alt={product.name}
                width={800}
                height={800}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-3">
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
          <div className="lg:w-1/2">
            <p className="text-sm text-gray-600">
              Sold By:{" "}
              <a href="#" className="text-[#6A994E] font-medium">
                @{product.grower}
              </a>
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mt-2">
              {product.name}
            </h1>
            <p className="text-3xl text-gray-800 mt-4">
              ₱{product.price.toFixed(2)} / {product.weight}
            </p>
            <p className="mt-4 text-sm font-medium text-green-600">
              {product.inStock !== false ? "In Stock" : "Out of Stock"}
            </p>

            <div className="mt-8 flex items-center space-x-4">
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleQuantityChange(-1)}
                  className="h-12 w-12 rounded-r-none hover:bg-gray-100"
                >
                  -
                </Button>
                <span className="w-12 text-center font-semibold">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleQuantityChange(1)}
                  className="h-12 w-12 rounded-l-none hover:bg-gray-100"
                >
                  +
                </Button>
              </div>
              <Button
                className="w-full h-12 flex-1 bg-[#1E392A] hover:bg-[#1E392A]/90"
                disabled={product.inStock === false}
              >
                <ShoppingCart className="mr-2" size={20} />
                Add to Cart
              </Button>
            </div>
          </div>
        </section>

        {/* Description Section */}
        <section className="mt-16">
          <div className="border rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900">Description</h2>
            <div className="mt-4 text-gray-600 space-y-6">
              <p>
                {product.description ||
                  "Our best-selling mushrooms. Bold, meaty, and incredibly versatile. Perfect for sautés, soups, and stir-fries. Harvested daily for peak freshness."}
              </p>
              <div>
                <h3 className="font-semibold text-gray-800">
                  Storage & Handling
                </h3>
                <p>
                  Keep refrigerated in a paper bag for up to 5-7 days. Avoid
                  washing until just before use to maintain freshness.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
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
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Related Products
          </h2>
          <div className="relative">
            <div className="flex overflow-x-auto space-x-6 pb-4 scroll-smooth snap-x snap-mandatory">
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
                  className="snap-start shrink-0 w-[250px] group"
                >
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src="/placeholder.png"
                      alt={relatedProduct.name}
                      width={250}
                      height={250}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-gray-500">
                      @{relatedProduct.grower}
                    </p>
                    <h3 className="font-semibold text-md mt-1">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm">
                        ₱{relatedProduct.price.toFixed(2)} /{" "}
                        {relatedProduct.weight}
                      </p>
                      <Button variant="outline" size="icon" className="h-9 w-9">
                        <ShoppingCart size={16} />
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
