'use client';

/**
 * ProductCard Component
 * 
 * CRITICAL: This component embeds actual product cards inside chat messages.
 * Displays product image, name, price, category, and stock status.
 * Clicking the card navigates to the product detail page.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 4, Task 4.4
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, CheckCircle2, XCircle, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductCardData } from '@/lib/ai/context-builder';
import * as analytics from '@/lib/analytics/chatbot-analytics';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

interface ProductCardProps {
  product: ProductCardData;
  className?: string;
  onAddToCart?: (productId: string) => void;
  conversationId?: string;
  messageId?: string;
}

export function ProductCard({ product, className, onAddToCart, conversationId, messageId }: ProductCardProps) {
  const router = useRouter();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const inWishlist = isInWishlist(product.id);

  const handleCardClick = async () => {
    // Track product click
    if (conversationId) {
      await analytics.logProductClick({
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        timestamp: Date.now(),
        userId: 'anonymous',
        conversationId,
        clickedFromMessage: messageId,
        leadToPurchase: false,
      });
    }
    
    router.push(`/product/${product.slug}`);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      // Track cart addition
      if (conversationId) {
        await analytics.logProductClick({
          productId: product.id,
          productName: product.name,
          productSlug: product.slug,
          timestamp: Date.now(),
          userId: 'anonymous',
          conversationId,
          clickedFromMessage: messageId,
          leadToPurchase: false,
        });
      }
      
      // Add to cart using CartContext
      const added = addToCart(
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          slug: product.slug,
          stock: product.inStock ? 1 : 0,
        },
        1
      );

      if (!added) {
        throw new Error('Failed to add to cart');
      }

      toast.success(`${product.name} added to cart!`);

      if (onAddToCart) {
        onAddToCart(product.id);
      }
    } catch (error) {
      toast.error('Failed to add to cart');
      console.error('Add to cart error:', error);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product.id);
      toast.success('Added to wishlist');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(price);
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200',
        'hover:shadow-lg hover:scale-[1.02]',
        'border-2 hover:border-primary/50',
        'max-w-sm w-full',
        className
      )}
      onClick={handleCardClick}
      data-testid="product-card"
      data-product-id={product.id}
    >
      <CardHeader className="p-0">
        <div className="relative aspect-square w-full overflow-hidden rounded-t-lg">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 384px"
          />
          {/* Stock badge overlay */}
          <Badge
            variant={product.inStock ? 'default' : 'destructive'}
            className="absolute top-2 right-2"
          >
            {product.inStock ? (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                In Stock
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Out of Stock
              </>
            )}
          </Badge>
          
          {/* Relevance score badge (for debugging) */}
          {product.relevanceScore > 0 && (
            <Badge
              variant="secondary"
              className="absolute top-2 left-2 text-xs"
            >
              {Math.round(product.relevanceScore * 100)}% match
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Category badge */}
        <Badge variant="outline" className="mb-2">
          {product.category}
        </Badge>

        {/* Product name */}
        <h3 className="font-semibold text-lg line-clamp-2 mb-2">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {product.description}
        </p>

        {/* Price */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-primary">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Grower info */}
        {product.grower && (
          <p className="text-xs text-muted-foreground">
            By {product.grower.name}
          </p>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {product.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Matched fields (for debugging) */}
        {product.matchedFields && product.matchedFields.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Matches: {product.matchedFields.join(', ')}
          </p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="flex-1"
          variant={product.inStock ? 'default' : 'secondary'}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
        <Button
          onClick={handleToggleWishlist}
          variant={inWishlist ? 'default' : 'outline'}
          size="icon"
          title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={cn('h-4 w-4', inWishlist && 'fill-current')} />
        </Button>
      </CardFooter>
    </Card>
  );
}
