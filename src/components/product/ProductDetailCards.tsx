"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Snowflake,
  Timer,
  Thermometer,
  CheckCircle,
  ChefHat,
  Sparkles,
  Utensils,
  Leaf,
} from "lucide-react";

/* ================================================================== */
/*  ProductDetailCards - Storage, Cooking, Nutrition info               */
/* ================================================================== */
interface ProductDetailCardsProps {
  freshnessInfo?: {
    storageInstructions?: string;
    shelfLife?: string;
    qualityIndicators?: string;
  };
  preparationInfo?: {
    preparationTips?: string[];
    recipeIdeas?: string[];
  };
  nutritionalHighlights?: string[];
  sku?: string;
  weight?: number;
}

export function ProductDetailCards({
  freshnessInfo,
  preparationInfo,
  nutritionalHighlights,
  sku,
  weight,
}: ProductDetailCardsProps) {
  const hasStorageCard = freshnessInfo && (freshnessInfo.storageInstructions || freshnessInfo.shelfLife || freshnessInfo.qualityIndicators);
  const hasCookingCard = preparationInfo && (preparationInfo.preparationTips?.length || preparationInfo.recipeIdeas?.length);
  const hasNutritionCard = !!(nutritionalHighlights?.length || sku || weight);

  if (!hasStorageCard && !hasCookingCard && !hasNutritionCard) {
    return null;
  }

  return (
    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {/* ---- Storage & Freshness Card ---- */}
      {hasStorageCard && (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b bg-muted/30 flex items-center gap-2">
            <Snowflake className="w-4 h-4 text-blue-500" />
            <h3 className="font-semibold text-foreground text-sm">Storage & Freshness</h3>
          </div>
          <div className="p-5 space-y-3 text-sm">
            {freshnessInfo?.shelfLife && (
              <div className="flex items-start gap-3">
                <Timer className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-foreground">Shelf Life</div>
                  <div className="text-muted-foreground">{freshnessInfo.shelfLife}</div>
                </div>
              </div>
            )}
            {freshnessInfo?.storageInstructions && (
              <div className="flex items-start gap-3">
                <Thermometer className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-foreground">Storage</div>
                  <div className="text-muted-foreground">{freshnessInfo.storageInstructions}</div>
                </div>
              </div>
            )}
            {freshnessInfo?.qualityIndicators && (
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-foreground">Quality Signs</div>
                  <div className="text-muted-foreground">{freshnessInfo.qualityIndicators}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---- Cooking & Preparation Card ---- */}
      {hasCookingCard && (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b bg-muted/30 flex items-center gap-2">
            <ChefHat className="w-4 h-4 text-orange-500" />
            <h3 className="font-semibold text-foreground text-sm">Cooking & Preparation</h3>
          </div>
          <div className="p-5 space-y-3 text-sm">
            {preparationInfo?.preparationTips && preparationInfo.preparationTips.length > 0 && (
              <div>
                <div className="font-medium text-foreground mb-1.5">Tips</div>
                <ul className="space-y-1.5">
                  {preparationInfo.preparationTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {preparationInfo?.recipeIdeas && preparationInfo.recipeIdeas.length > 0 && (
              <div>
                <div className="font-medium text-foreground mb-1.5">Recipe Ideas</div>
                <div className="flex flex-wrap gap-1.5">
                  {preparationInfo.recipeIdeas.map((recipe, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      <Utensils className="w-3 h-3 mr-1" />
                      {recipe}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---- Nutrition & Details Card ---- */}
      {hasNutritionCard && (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b bg-muted/30 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-500" />
            <h3 className="font-semibold text-foreground text-sm">Nutrition & Details</h3>
          </div>
          <div className="p-5 space-y-3 text-sm">
            {nutritionalHighlights && nutritionalHighlights.length > 0 && (
              <div>
                <div className="font-medium text-foreground mb-2">Nutritional Highlights</div>
                <div className="flex flex-wrap gap-1.5">
                  {nutritionalHighlights.map((item, i) => (
                    <Badge key={i} variant="outline" className="text-xs border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {sku && (
              <div className="flex justify-between pt-2 border-t">
                <span className="text-muted-foreground">SKU</span>
                <span className="font-medium text-foreground">{sku}</span>
              </div>
            )}
            {weight && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Weight</span>
                <span className="font-medium text-foreground">{weight}g</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
