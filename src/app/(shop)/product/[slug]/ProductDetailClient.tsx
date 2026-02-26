"use client";

import React, { useState, useMemo, useRef } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Star, Tag, ChevronRight } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { isAuthenticated } from "@/lib/auth";
import { toast } from "sonner";
import {
  useSanityProduct,
  useSanitySuggestedProducts,
} from "@/hooks/useSanityProducts";
import { useSanityReviews } from "@/hooks/useSanityReviews";
import { FirebaseReviewSection } from "@/components/reviews/FirebaseReviewSection";
import { trackProductView, trackAddToCart } from "@/lib/analytics";
import { useChat } from "@/contexts/ChatContext";
import { useStockSync } from "@/hooks/useStockSync";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { RecentlyViewed } from "@/components/products/RecentlyViewed";
import { StickyAddToCartBar } from "@/components/product/StickyAddToCartBar";
import { ProductGallery, buildGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfoSection";
import { ProductDetailCards } from "@/components/product/ProductDetailCards";
import { SuggestedProducts } from "@/components/product/SuggestedProducts";

type Props = { slug: string };

/* ================================================================== */
/*  MAIN PAGE                                                          */
/* ================================================================== */
export function ProductDetailClient({ slug }: Props) {

  const { product, loading, error } = useSanityProduct(slug);
  const [quantity, setQuantity] = useState(1);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const addToCartRef = useRef<HTMLDivElement>(null);
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { trackView } = useRecentlyViewed();
  const dynamicStock = useStockSync(
    product?.id || "",
    product?.stock || product?.quantityInStock || 0,
  );

  // Reviews hook
  const {
    reviews,
    rating,
    loading: reviewsLoading,
  } = useSanityReviews(product?.id || "");

  // Suggested Products hook
  const { suggestedProducts, loading: suggestedProductsLoading } =
    useSanitySuggestedProducts(
      product?.id || "",
      product?.grower?.id || "",
      4,
    );

  // Track product view when product loads
  React.useEffect(() => {
    if (product) {
      trackProductView({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
      });
      trackView(product.id);
    }
  }, [product]); // eslint-disable-line react-hooks/exhaustive-deps

  // Chat context
  const { setIsOpen: openChat, sendMessage: sendChatMessage } = useChat();

  // Compute discount percentage
  const discountPercent = useMemo(() => {
    if (!product?.compareAtPrice || !product?.price) return 0;
    if (product.compareAtPrice <= product.price) return 0;
    return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
  }, [product?.compareAtPrice, product?.price]);

  /* ---------- Loading ---------- */
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
  const galleryItems = buildGallery(product);

  /* ---- Handlers ---- */
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
    const productImage = product.images?.[0] || product.image || "";
    const success = addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: productImage,
        slug: product.slug,
        stock: product.stock || 100,
        grower: typeof product.grower === "object" ? product.grower?.name : product.grower,
        unit: product.unit,
        comparePrice: product.compareAtPrice,
      },
      quantity,
    );
    if (success) {
      trackAddToCart({ id: product.id, name: product.name, price: product.price, quantity, category: product.category });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text: product.description, url: window.location.href });
      } catch {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */
  return (
    <div className="min-h-screen bg-background">
      {/* ---- Breadcrumb ---- */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 py-3 text-sm text-muted-foreground overflow-x-auto">
            <Link href="/shop" className="hover:text-foreground transition-colors whitespace-nowrap">Shop</Link>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            {product.category && (
              <>
                <Link
                  href={`/shop?category=${product.categorySlug || product.category}`}
                  className="hover:text-foreground transition-colors whitespace-nowrap"
                >
                  {product.category}
                </Link>
                <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              </>
            )}
            <span className="text-foreground font-medium truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ============================================================ */}
        {/*  PRODUCT HERO: Gallery + Details side-by-side                 */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <ProductGallery
            productName={product.name}
            galleryItems={galleryItems}
            activeGalleryIndex={activeGalleryIndex}
            setActiveGalleryIndex={setActiveGalleryIndex}
            discountPercent={discountPercent}
            isPromo={product.isPromo}
            inWishlist={inWishlist}
            onToggleWishlist={toggleWishlist}
            onShare={handleShare}
          />

          <ProductInfo
            product={product}
            dynamicStock={dynamicStock}
            quantity={quantity}
            setQuantity={setQuantity}
            discountPercent={discountPercent}
            onAddToCart={handleAddToCart}
            onQuickChat={() => openChat(true)}
            addToCartRef={addToCartRef}
          />
        </div>

        {/* ============================================================ */}
        {/*  DETAILS CARDS: Rich product info below the fold             */}
        {/* ============================================================ */}
        <ProductDetailCards
          freshnessInfo={product.freshnessInfo}
          preparationInfo={product.preparationInfo}
          nutritionalHighlights={product.nutritionalHighlights}
          sku={product.sku}
          weight={product.weight}
        />

        {/* ---- Product Tags ---- */}
        {product.productTags && product.productTags.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <Tag className="w-4 h-4 text-muted-foreground" />
            {product.productTags.map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs font-normal">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* ============================================================ */}
        {/*  YOU MAY ALSO LIKE                                           */}
        {/* ============================================================ */}
        {!suggestedProductsLoading && (
          <SuggestedProducts
            products={suggestedProducts || []}
            grower={product.grower}
          />
        )}

        {/* ============================================================ */}
        {/*  CUSTOMER REVIEWS                                            */}
        {/* ============================================================ */}
        <section className="mt-14">
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b bg-muted/30 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <h2 className="text-lg font-semibold text-foreground">Customer Reviews</h2>
            </div>
            <div className="px-6 py-6">
              <FirebaseReviewSection
                targetType="product"
                targetId={product.id}
                targetName={product.name}
              />
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  RECENTLY VIEWED                                             */}
        {/* ============================================================ */}
        <section className="mt-14">
          <RecentlyViewed excludeProductId={product.id} maxDisplay={8} />
        </section>
      </div>

      {/* Sticky Mobile Add-to-Cart Bar */}
      <StickyAddToCartBar
        productName={product.name}
        price={product.price}
        unit={product.unit}
        stock={dynamicStock}
        quantity={quantity}
        setQuantity={setQuantity}
        onAddToCart={handleAddToCart}
        targetRef={addToCartRef}
      />
    </div>
  );
}
