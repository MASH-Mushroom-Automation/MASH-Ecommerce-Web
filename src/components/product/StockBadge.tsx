/**
 * StockBadge Component
 * 
 * Displays real-time stock status for a product with color-coded badges.
 * Updates automatically when inventory changes in Sanity CMS.
 * 
 * Phase 7: Inventory Management System
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useProductInventory } from "@/hooks/useSanityInventory";

interface StockBadgeProps {
  productId: string;
  showIcon?: boolean;
  showQuantity?: boolean;
  variant?: 'default' | 'sm' | 'lg';
}

/**
 * Display stock status badge with real-time updates
 * 
 * @param productId - Sanity product document ID
 * @param showIcon - Show status icon (default: true)
 * @param showQuantity - Show exact quantity (default: true)
 * @param variant - Badge size variant (default: 'default')
 * 
 * @example
 * <StockBadge productId={product._id} />
 * <StockBadge productId={product._id} showIcon={false} />
 */
export function StockBadge({ 
  productId, 
  showIcon = true,
  showQuantity = true,
  variant = 'default'
}: StockBadgeProps) {
  const { inventory, loading } = useProductInventory(productId);

  // Don't render while loading or if inventory not tracked
  if (loading || !inventory || !inventory.trackInventory) {
    return null;
  }

  const getVariant = () => {
    switch (inventory.stockStatus) {
      case 'in-stock':
        return 'default';
      case 'low-stock':
        return 'secondary';
      case 'out-of-stock':
        return 'destructive';
    }
  };

  const getLabel = (): string => {
    if (!showQuantity) {
      switch (inventory.stockStatus) {
        case 'in-stock':
          return 'In Stock';
        case 'low-stock':
          return 'Low Stock';
        case 'out-of-stock':
          return inventory.allowBackorders ? 'Backorder' : 'Out of Stock';
        default:
          return 'Unknown';
      }
    }

    switch (inventory.stockStatus) {
      case 'in-stock':
        return `${inventory.quantityInStock} in stock`;
      case 'low-stock':
        return `Only ${inventory.quantityInStock} left!`;
      case 'out-of-stock':
        return inventory.allowBackorders ? 'Backorder available' : 'Out of stock';
      default:
        return 'Unknown';
    }
  };

  const getIcon = () => {
    if (!showIcon) return null;
    
    const iconClass = variant === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
    
    switch (inventory.stockStatus) {
      case 'in-stock':
        return <CheckCircle className={iconClass} />;
      case 'low-stock':
        return <AlertCircle className={iconClass} />;
      case 'out-of-stock':
        return <XCircle className={iconClass} />;
    }
  };

  const getSizeClass = () => {
    switch (variant) {
      case 'sm':
        return 'text-xs py-0.5 px-2';
      case 'lg':
        return 'text-base py-2 px-4';
      default:
        return 'text-sm py-1 px-3';
    }
  };

  return (
    <Badge 
      variant={getVariant()} 
      className={`flex items-center gap-1.5 ${getSizeClass()}`}
    >
      {getIcon()}
      <span>{getLabel()}</span>
    </Badge>
  );
}

/**
 * Compact version of StockBadge for use in tight spaces
 * 
 * @example
 * <CompactStockBadge productId={product._id} />
 */
export function CompactStockBadge({ productId }: { productId: string }) {
  return (
    <StockBadge 
      productId={productId} 
      showIcon={true} 
      showQuantity={false}
      variant="sm"
    />
  );
}

/**
 * Detailed stock indicator for product detail pages
 * 
 * @example
 * <DetailedStockBadge productId={product._id} />
 */
export function DetailedStockBadge({ productId }: { productId: string }) {
  return (
    <StockBadge 
      productId={productId} 
      showIcon={true} 
      showQuantity={true}
      variant="lg"
    />
  );
}
