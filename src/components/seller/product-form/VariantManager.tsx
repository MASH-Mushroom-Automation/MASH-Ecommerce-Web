"use client";

import React, { useCallback } from "react";
import { Plus, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface ProductVariant {
  id: string;
  type: "Size" | "Weight" | "Color" | "Type" | "Package";
  value: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  quantityInStock: number;
  isAvailable: boolean;
}

interface VariantManagerProps {
  hasVariants: boolean;
  onHasVariantsChange: (enabled: boolean) => void;
  variants: ProductVariant[];
  onVariantsChange: (variants: ProductVariant[]) => void;
  basePrice: number;
  baseSku: string;
}

const VARIANT_TYPES = [
  { value: "Size", label: "Size" },
  { value: "Weight", label: "Weight" },
  { value: "Color", label: "Color" },
  { value: "Type", label: "Type" },
  { value: "Package", label: "Package" },
] as const;

export function VariantManager({
  hasVariants,
  onHasVariantsChange,
  variants,
  onVariantsChange,
  basePrice,
  baseSku,
}: VariantManagerProps) {
  const addVariant = useCallback(() => {
    const newVariant: ProductVariant = {
      id: `variant-${Date.now()}-${Math.random()}`,
      type: "Size",
      value: "",
      sku: generateVariantSku(baseSku, variants.length + 1),
      price: basePrice,
      quantityInStock: 0,
      isAvailable: true,
    };
    onVariantsChange([...variants, newVariant]);
    toast.success("Variant added");
  }, [variants, basePrice, baseSku, onVariantsChange]);

  const removeVariant = useCallback(
    (variantId: string) => {
      onVariantsChange(variants.filter((v) => v.id !== variantId));
      toast.success("Variant removed");
    },
    [variants, onVariantsChange]
  );

  const updateVariant = useCallback(
    (variantId: string, updates: Partial<ProductVariant>) => {
      onVariantsChange(
        variants.map((v) => (v.id === variantId ? { ...v, ...updates } : v))
      );
    },
    [variants, onVariantsChange]
  );

  const toggleVariantsEnabled = useCallback(
    (enabled: boolean) => {
      if (!enabled && variants.length > 0) {
        const confirm = window.confirm(
          "Disabling variants will remove all variant data. Continue?"
        );
        if (!confirm) return;
        onVariantsChange([]);
      }
      onHasVariantsChange(enabled);
    },
    [variants, onHasVariantsChange, onVariantsChange]
  );

  return (
    <div className="space-y-4">
      {/* Enable Variants Toggle */}
      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <div className="space-y-0.5">
          <Label htmlFor="has-variants" className="text-base">
            Product Has Variants
          </Label>
          <p className="text-sm text-muted-foreground">
            Enable if this product comes in different sizes, colors, or weights
          </p>
        </div>
        <Switch
          id="has-variants"
          checked={hasVariants}
          onCheckedChange={toggleVariantsEnabled}
        />
      </div>

      {/* Variants Section */}
      {hasVariants && (
        <div className="space-y-4">
          {/* Variants List */}
          {variants.length > 0 ? (
            <div className="space-y-3">
              {variants.map((variant, index) => (
                <Card key={variant.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Variant Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">
                            Variant {index + 1}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVariant(variant.id)}
                          className="h-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>

                      <Separator />

                      {/* Variant Fields Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Variant Type */}
                        <div className="space-y-2">
                          <Label htmlFor={`variant-type-${variant.id}`}>
                            Variant Type *
                          </Label>
                          <Select
                            value={variant.type}
                            onValueChange={(value) =>
                              updateVariant(variant.id, {
                                type: value as ProductVariant["type"],
                              })
                            }
                          >
                            <SelectTrigger id={`variant-type-${variant.id}`}>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {VARIANT_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Variant Value */}
                        <div className="space-y-2">
                          <Label htmlFor={`variant-value-${variant.id}`}>
                            Variant Value *
                          </Label>
                          <Input
                            id={`variant-value-${variant.id}`}
                            placeholder="e.g., Large, 500g, Red"
                            value={variant.value}
                            onChange={(e) =>
                              updateVariant(variant.id, {
                                value: e.target.value,
                              })
                            }
                          />
                        </div>

                        {/* SKU */}
                        <div className="space-y-2">
                          <Label htmlFor={`variant-sku-${variant.id}`}>
                            SKU *
                          </Label>
                          <Input
                            id={`variant-sku-${variant.id}`}
                            placeholder="e.g., MUSH-001-L"
                            value={variant.sku}
                            onChange={(e) =>
                              updateVariant(variant.id, { sku: e.target.value })
                            }
                          />
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                          <Label htmlFor={`variant-price-${variant.id}`}>
                            Price (₱) *
                          </Label>
                          <Input
                            id={`variant-price-${variant.id}`}
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={variant.price || ""}
                            onChange={(e) =>
                              updateVariant(variant.id, {
                                price: parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>

                        {/* Compare at Price */}
                        <div className="space-y-2">
                          <Label htmlFor={`variant-compare-${variant.id}`}>
                            Compare at Price (₱)
                          </Label>
                          <Input
                            id={`variant-compare-${variant.id}`}
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={variant.compareAtPrice || ""}
                            onChange={(e) =>
                              updateVariant(variant.id, {
                                compareAtPrice:
                                  parseFloat(e.target.value) || undefined,
                              })
                            }
                          />
                        </div>

                        {/* Quantity in Stock */}
                        <div className="space-y-2">
                          <Label htmlFor={`variant-stock-${variant.id}`}>
                            Quantity in Stock *
                          </Label>
                          <Input
                            id={`variant-stock-${variant.id}`}
                            type="number"
                            min="0"
                            step="1"
                            placeholder="0"
                            value={variant.quantityInStock || ""}
                            onChange={(e) =>
                              updateVariant(variant.id, {
                                quantityInStock: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                      </div>

                      {/* Availability Toggle */}
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <Label
                          htmlFor={`variant-available-${variant.id}`}
                          className="text-sm cursor-pointer"
                        >
                          Available for purchase
                        </Label>
                        <Switch
                          id={`variant-available-${variant.id}`}
                          checked={variant.isAvailable}
                          onCheckedChange={(checked) =>
                            updateVariant(variant.id, { isAvailable: checked })
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <Package className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-20" />
              <p className="text-sm text-muted-foreground mb-4">
                No variants added yet
              </p>
            </div>
          )}

          {/* Add Variant Button */}
          <Button
            type="button"
            variant="outline"
            onClick={addVariant}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Variant
          </Button>

          {/* Variants Info */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Tip:</strong> Variants allow customers to choose different
              options like size or weight. Each variant can have its own price
              and inventory.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to generate variant SKU
function generateVariantSku(baseSku: string, variantIndex: number): string {
  const base = baseSku || "PROD";
  const suffix = String(variantIndex).padStart(2, "0");
  return `${base}-V${suffix}`;
}
