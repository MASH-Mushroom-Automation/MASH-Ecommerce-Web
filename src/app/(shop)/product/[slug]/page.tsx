"use client";

import React, { useState } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, ArrowLeft, Share2 } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { isAuthenticated } from "@/lib/auth";
import { toast } from "sonner";
import { useSanityProduct } from "@/hooks/useSanityProducts";
import { trackProductView, trackAddToCart } from "@/lib/analytics";

type Props = { params: Promise<{ slug: string }> };

const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

export default function ProductDetailPage({ params }: Props) {
  const resolvedParams = React.use(params);
  const slug = resolvedParams.slug;

  const { product, loading, error } = useSanityProduct(slug);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>("");
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  // Set active image when product loads
  React.useEffect(() => {
    if (product && !activeImage) {
      const firstImage = product.images?.[0] ?? product.image;
      // Only set if we have a valid image URL
      if (firstImage && firstImage !== '' && firstImage !== 'null') {
        setActiveImage(firstImage);
      }
    }
  }, [product, activeImage]);

  // Track product view when product loads
  React.useEffect(() => {
    if (product) {
      trackProductView({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
      });
    }
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return notFound();
  }

  const inWishlist = isInWishlist(product.id);
  
  // Filter out empty/null/invalid images and ensure we have valid URLs
  const validImages = [
    ...(product.images && Array.isArray(product.images) 
      ? product.images.filter(img => img && img !== '' && img !== 'null' && img.startsWith('http')) 
      : []),
    product.image
  ].filter((img, index, self) => 
    img && img !== '' && img !== 'null' && img.startsWith('http') && self.indexOf(img) === index
  );
  
  const allImages = validImages.length > 0 
    ? validImages 
    : ['https://via.placeholder.com/400x400/F5F5DC/1E392A?text=No+Image'];
  
  // Set activeImage to first valid image if not set
  const displayImage = activeImage && activeImage !== '' ? activeImage : allImages[0];

  const toggleWishlist = () => {
    if (!isAuthenticated()) {
      window.location.href = "/login";
      return;
    }
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const handleAddToCart = () => {
    addToCart(product.id, product.price, quantity);
    
    // Track add to cart event
    trackAddToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      category: product.category,
    });
    
    toast.success(`${product.name} added to cart!`, {
      description: `${quantity} ${product.unit || "unit"}(s) added`,
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch {
        // Share cancelled or failed - silent fail
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/shop"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
              {displayImage && displayImage.startsWith('http') ? (
                <Image
                  src={displayImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                  No Image Available
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => img && img.startsWith('http') && setActiveImage(img)}
                    className={cn(
                      "relative aspect-square bg-muted rounded-lg overflow-hidden border-2 transition-all",
                      displayImage === img
                        ? "border-primary"
                        : "border-transparent hover:border-border"
                    )}
                  >
                    {img && img.startsWith('http') ? (
                      <Image
                        src={img}
                        alt={`${product.name} - Image ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 25vw, 12vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted text-xs text-muted-foreground">
                        N/A
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Product Name */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {product.name}
              </h1>
              {product.category && (
                <p className="text-sm text-muted-foreground mt-2">
                  Category: {product.category}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">
                ₱{product.price.toFixed(2)}
              </span>
              {product.unit && (
                <span className="text-muted-foreground">/ {product.unit}</span>
              )}
            </div>

            {/* Stock Status */}
            <div>
              {product.stock > 0 ? (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-foreground">
                    In Stock ({product.stock} available)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-destructive">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-semibold text-foreground">
                  Description
                </h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Promo Badge */}
            {product.isPromo && (
              <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                🎉 On Promotion!
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-muted transition-colors"
                    disabled={product.stock === 0}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1))
                      )
                    }
                    className="w-16 text-center border-x border-border py-2 bg-background"
                    disabled={product.stock === 0}
                  />
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="px-4 py-2 hover:bg-muted transition-colors"
                    disabled={product.stock === 0}
                  >
                    +
                  </button>
                </div>
                {product.stock > 0 && (
                  <span className="text-sm text-muted-foreground">
                    Max: {product.stock}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant={inWishlist ? "default" : "outline"}
                onClick={toggleWishlist}
              >
                <Heart
                  className={cn(
                    "w-5 h-5",
                    inWishlist && "fill-current text-red-500"
                  )}
                />
              </Button>
              <Button size="lg" variant="outline" onClick={handleShare}>
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Product Meta */}
            <div className="border-t border-border pt-6 space-y-3 text-sm">
              {product.sku && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SKU:</span>
                  <span className="text-foreground font-medium">
                    {product.sku}
                  </span>
                </div>
              )}
              {product.weight && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weight:</span>
                  <span className="text-foreground font-medium">
                    {product.weight}g
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Availability:</span>
                <span
                  className={cn(
                    "font-medium",
                    product.stock > 0 ? "text-green-600" : "text-red-600"
                  )}
                >
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Frequently Bought Together Section */}
        {product.complementaryProducts && product.complementaryProducts.length > 0 && (
          <section className="mt-12 bg-muted/30 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-foreground mb-4">
              ⚡ Frequently Bought Together
            </h2>
            <div className="flex flex-wrap items-center gap-4">
              {/* Current Product */}
              <div className="flex items-center gap-4 p-3 bg-background rounded-lg border">
                <div className="relative w-16 h-16">
                  {product.image && (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover rounded"
                    />
                  )}
                </div>
                <div>
                  <p className="font-medium line-clamp-1">{product.name}</p>
                  <p className="text-primary font-semibold">₱{product.price.toFixed(2)}</p>
                </div>
              </div>
              
              <span className="text-2xl text-muted-foreground">+</span>
              
              {/* Complementary Products */}
              {product.complementaryProducts.slice(0, 2).map((item, idx) => (
                <React.Fragment key={item.id}>
                  <Link
                    href={`/product/${item.slug}`}
                    className="flex items-center gap-4 p-3 bg-background rounded-lg border hover:border-primary transition-colors"
                  >
                    <div className="relative w-16 h-16">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover rounded"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium line-clamp-1">{item.name}</p>
                      <p className="text-primary font-semibold">₱{item.price.toFixed(2)}</p>
                    </div>
                  </Link>
                  {idx < Math.min(product.complementaryProducts!.length - 1, 1) && (
                    <span className="text-2xl text-muted-foreground">+</span>
                  )}
                </React.Fragment>
              ))}
            </div>
            
            {/* Bundle Total */}
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <div>
                <p className="text-sm text-muted-foreground">Bundle Price:</p>
                <p className="text-2xl font-bold text-primary">
                  ₱{(product.price + product.complementaryProducts.reduce((sum, p) => sum + p.price, 0)).toFixed(2)}
                </p>
              </div>
              <Button 
                onClick={() => {
                  // Add all products to cart
                  addToCart(product.id, product.price, 1);
                  product.complementaryProducts?.forEach((p) => {
                    addToCart(p.id, p.price, 1);
                  });
                  toast.success('Bundle added to cart!');
                }}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add Bundle to Cart
              </Button>
            </div>
          </section>
        )}

        {/* You May Also Like Section */}
        {product.suggestedProducts && product.suggestedProducts.length > 0 && (
          <section className="mt-16 border-t pt-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {product.suggestedProducts.slice(0, 4).map((item) => (
                <Link
                  key={item.id}
                  href={`/product/${item.slug}`}
                  className="group"
                >
                  <div className="relative aspect-square bg-muted rounded-lg overflow-hidden mb-3">
                    {item.image && item.image.startsWith('http') && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    )}
                    {item.isPromo && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        SALE
                      </span>
                    )}
                    {item.isFeatured && (
                      <span className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded">
                        ⭐
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="text-primary font-semibold">
                    ₱{item.price.toFixed(2)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
