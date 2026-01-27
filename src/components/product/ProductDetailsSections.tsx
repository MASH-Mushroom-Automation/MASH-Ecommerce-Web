"use client";

import React from "react";
import { CheckCircle, Clock, Sparkles, Snowflake, Truck, Utensils } from "lucide-react";
import GrowerCard from "@/components/product/GrowerCard";

interface Product {
  name: string;
  freshnessInfo?: any;
  preparationInfo?: any;
  deliveryOptions?: any;
  grower?: any;
}

interface Props {
  product: Product;
  onQuickChat?: () => void;
}

export function ProductDetailsSections({ product, onQuickChat }: Props) {
  return (
    <div className="mt-12" data-testid="product-details-sections">
      {/* Only show Grower / Seller information here for a cleaner UX */}
      {product.grower && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">From the Seller</h3>
          <GrowerCard grower={product.grower} productName={product.name} onQuickChat={onQuickChat} />
        </div>
      )}
    </div>
  );
}

export default ProductDetailsSections;
