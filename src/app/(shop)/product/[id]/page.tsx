"use client";

import React, { useState, use } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart } from "lucide-react";
import { useProduct } from "@/hooks/useProducts";
import { useWishlist } from "@/contexts/WishlistContext";
import { ProductCard } from "@/components/product/ProductCard";
import { isAuthenticated } from "@/lib/auth";
import { Spinner } from "@/components/common/loading-states";
import { ProductCardSkeleton } from "@/components/ui/loading-spinner";
import { ProductsApi } from "@/lib/api/products";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { ProductApiResponse } from "@/types/api";
import { getGrowerUrl } from "@/lib/grower-utils";

type Props = { params: Promise<{ id: string }> };

const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

function ProductDetailsContent({ product }: { product: ProductApiResponse }) {
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(
    product.images?.[0] ?? product.image
  );
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);
  const { addToCart } = useCart();

  const toggleWishlist = () => {
    if (!isAuthenticated()) {
      window.location.href = "/auth/login";
      return;
    }
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const allImages =
    product.images && product.images.length > 0
      ? product.images
      : [product.image, product.image, product.image];

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };

  return (
    <div className="bg-background min-h-screen text-foreground">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-6 sm:py-8 lg:py-12">
        {/* Product Display Section */}
        <section className="flex flex-col lg:flex-row gap-6 lg:gap-12 bg-card rounded-lg p-4 sm:p-6 lg:p-8 shadow-sm">
          {/* Image Gallery */}
          <div className="lg:w-1/2 w-full">
            <div className="aspect-square bg-muted/30 rounded-lg overflow-hidden mb-3 sm:mb-4 relative flex items-center justify-center">
              <Image
                src={activeImage}
                alt={product.name}
                width={800}
                height={800}
                className="w-full h-full object-contain p-4"
                priority
              />
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {allImages.slice(0, 4).map((img: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(img)}
                  className={cn(
                    "relative w-full bg-muted/30 rounded-md overflow-hidden ring-2 ring-offset-2 transition-all flex items-center justify-center",
                    activeImage === img ? "ring-primary" : "ring-transparent"
                  )}
                  style={{ aspectRatio: "1/1" }}
                >
                  <Image
                    src={img}
                    alt={`thumbnail ${index + 1}`}
                    width={150}
                    height={150}
                    className="w-full h-full object-contain p-1"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:w-1/2 w-full">
            {product.grower && (
              <Link
                href={getGrowerUrl(product.grower)}
                className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-medium mb-3 hover:bg-primary/20 transition-colors"
              >
                @{product.grower}
              </Link>
            )}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              {product.name}
            </h1>
            <p className="text-2xl sm:text-3xl font-bold text-primary mb-2">
              ₱{product.price.toFixed(2)}
              <span className="text-base sm:text-lg text-muted-foreground font-normal ml-2">
                / {product.weight}
              </span>
            </p>
            <p className="text-sm font-medium text-green-600 mb-6">
              {product.inStock !== false ? "In Stock" : "Out of Stock"}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleQuantityChange(-1)}
                  className="h-11 sm:h-12 w-11 sm:w-12 rounded-none hover:bg-muted/30 text-lg"
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
                  className="h-11 sm:h-12 w-11 sm:w-12 rounded-none hover:bg-muted/30 text-lg"
                >
                  +
                </Button>
              </div>
              <Button
                variant="secondary"
                className="flex-1 h-11 sm:h-12 text-white font-semibold rounded-lg"
                disabled={product.inStock === false}
                onClick={() => {
                  addToCart(product.id, product.price, quantity);
                  toast.success(`${product.name} added to cart!`, {
                    description: `Quantity: ${quantity}. View your cart to proceed to checkout`,
                  });
                }}
              >
                <ShoppingCart className="mr-2" size={20} />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleWishlist}
                className="h-11 sm:h-12 w-11 sm:w-12 border-2 hover:bg-red-50 hover:border-red-500 transition-colors"
                aria-label={
                  inWishlist ? "Remove from wishlist" : "Add to wishlist"
                }
              >
                <Heart
                  className={cn(
                    "h-5 w-5 transition-colors",
                    inWishlist ? "fill-red-500 text-red-500" : "text-muted-foreground"
                  )}
                />
              </Button>
            </div>
          </div>
        </section>

        {/* Description Section */}
        <section className="mt-6 sm:mt-8 lg:mt-12">
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6 lg:p-8 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Description
            </h2>
            <div className="mt-3 sm:mt-4 text-muted-foreground text-sm sm:text-base space-y-4 sm:space-y-6">
              <p className="leading-relaxed">
                {product.description ||
                  "Our best-selling mushrooms. Bold, meaty, and incredibly versatile. Perfect for sautés, soups, and stir-fries. Harvested daily for peak freshness."}
              </p>
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Storage & Handling
                </h3>
                <p>
                  Keep refrigerated in a paper bag for up to 5-7 days. Avoid
                  washing until just before use to maintain freshness.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">
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
        <RelatedProductsSection currentProductId={product.id} />
      </main>
    </div>
  );
}

function RelatedProductsSection({
  currentProductId,
}: {
  currentProductId: string;
}) {
  const [relatedProducts, setRelatedProducts] = useState<ProductApiResponse[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const response = await ProductsApi.getProducts({ limit: 5 });
        const filtered = response.data.filter((p) => p.id !== currentProductId);
        setRelatedProducts(filtered);
      } catch (error) {
        console.error("Failed to fetch related products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [currentProductId]);

  return (
    <section className="mt-6 sm:mt-8 lg:mt-12">
      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6 px-1">
        Related Products
      </h2>
      <div className="relative -mx-4 sm:mx-0">
        {loading ? (
          <div className="flex space-x-4 sm:space-x-6 px-4 sm:px-0 pb-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="snap-start shrink-0 w-[180px] sm:w-[220px] lg:w-[250px]"
              >
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex overflow-x-auto space-x-4 sm:space-x-6 px-4 sm:px-0 pb-4 scroll-smooth snap-x snap-mandatory scrollbar-hide">
            {relatedProducts.map((relatedProduct) => (
              <div
                key={relatedProduct.id}
                className="snap-start shrink-0 w-[180px] sm:w-[220px] lg:w-[250px]"
              >
                <ProductCard
                  id={relatedProduct.id}
                  name={relatedProduct.name}
                  farm={relatedProduct.grower}
                  price={relatedProduct.price}
                  unit={relatedProduct.weight}
                  image={relatedProduct.image}
                  inStock={relatedProduct.inStock}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function ProductDetailsRoute({ params }: Props) {
  const { id } = use(params);
  const { product, loading, error } = useProduct(id);

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return notFound();
  }

  return <ProductDetailsContent product={product} />;
}
