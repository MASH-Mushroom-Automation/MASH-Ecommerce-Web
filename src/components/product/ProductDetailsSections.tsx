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
}

export function ProductDetailsSections({ product }: Props) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12" data-testid="product-details-sections">
      {/* Freshness & Quality */}
      {product.freshnessInfo && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Freshness & Quality</h3>
          </div>
          <div className="space-y-3">
            {product.freshnessInfo.harvestWindow && (
              <div>
                <div className="text-sm font-medium text-foreground">Harvest Window</div>
                <div className="text-sm text-muted-foreground">{product.freshnessInfo.harvestWindow}</div>
              </div>
            )}

            {product.freshnessInfo.shelfLife && (
              <div>
                <div className="text-sm font-medium text-foreground">Shelf Life</div>
                <div className="text-sm text-muted-foreground">{product.freshnessInfo.shelfLife}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cooking Guide */}
      {product.preparationInfo && (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Utensils className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Cooking Guide</h3>
          </div>
          <div className="space-y-3">
            {product.preparationInfo.cookingTime && (
              <div className="text-sm text-muted-foreground">Cooking Time: {product.preparationInfo.cookingTime}</div>
            )}
            {product.preparationInfo.preparationTips && (
              <ul className="text-sm text-muted-foreground list-disc pl-4">
                {product.preparationInfo.preparationTips.slice(0, 3).map((t: string, idx: number) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Delivery Options */}
      {product.deliveryOptions && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Delivery Options</h3>
          </div>
          <div className="space-y-3">
            {product.deliveryOptions.sameDayDeliveryEligible && (
              <div className="text-sm text-muted-foreground">⚡ Same-Day Delivery Available</div>
            )}
            {product.deliveryOptions.perishable && (
              <div className="text-sm text-muted-foreground">🧊 Perishable - Cold Transport</div>
            )}
          </div>
        </div>
      )}

      {/* From the Grower (uses GrowerCard) */}
      {product.grower && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">From the Grower</h3>
          <GrowerCard grower={product.grower} productName={product.name} />
        </div>
      )}
    </div>
  );
}

export default ProductDetailsSections;
