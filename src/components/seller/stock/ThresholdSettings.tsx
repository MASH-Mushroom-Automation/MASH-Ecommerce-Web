/**
 * ThresholdSettings Component
 * 
 * UI for configuring stock thresholds per product with visual preview.
 * 
 * Features:
 * - Displays current threshold settings (low stock, out of stock, restock level)
 * - Inline editing with number inputs
 * - Validation: thresholds >= 0, lowStock > outOfStock
 * - Visual preview of threshold ranges with color-coded bars
 * - Bulk threshold update (apply to multiple products)
 * - Preset templates (High Volume, Low Volume, Seasonal)
 * - Save button with loading state
 * - Success/error toast notifications
 * - Keyboard shortcuts: Cmd+S/Ctrl+S to save, Esc to cancel
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Settings,
  Save,
  X,
  TrendingUp,
  Package,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Copy,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

// Types
import type { StockThresholdConfig } from '@/types/stock-management';
import { stockThresholdConfigSchema } from '@/types/stock-management';
import { cn } from '@/lib/utils';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface ThresholdSettingsProps {
  /** Product ID (for single product mode) */
  productId?: string;
  
  /** Product name */
  productName?: string;
  
  /** Current threshold configuration */
  currentThresholds?: StockThresholdConfig;
  
  /** Current stock quantity (for visual preview) */
  currentStock?: number;
  
  /** Callback after successful save */
  onSave?: (thresholds: StockThresholdConfig) => Promise<void>;
  
  /** Callback on cancel */
  onCancel?: () => void;
  
  /** Bulk mode: apply to multiple products */
  bulkMode?: boolean;
  
  /** Products available for bulk updates */
  availableProducts?: Array<{
    _id: string;
    name: string;
    sku: string;
    currentThresholds?: StockThresholdConfig;
  }>;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * Preset threshold templates
 */
interface ThresholdPreset {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  thresholds: StockThresholdConfig;
}

const THRESHOLD_PRESETS: ThresholdPreset[] = [
  {
    id: 'high-volume',
    name: 'High Volume',
    description: 'For fast-moving products with frequent restocking',
    icon: <TrendingUp className="h-4 w-4" />,
    thresholds: {
      lowStockThreshold: 20,
      outOfStockThreshold: 5,
      restockLevel: 50,
    },
  },
  {
    id: 'low-volume',
    name: 'Low Volume',
    description: 'For slow-moving products with infrequent restocking',
    icon: <Package className="h-4 w-4" />,
    thresholds: {
      lowStockThreshold: 5,
      outOfStockThreshold: 0,
      restockLevel: 10,
    },
  },
  {
    id: 'seasonal',
    name: 'Seasonal',
    description: 'For seasonal products with variable demand',
    icon: <Sparkles className="h-4 w-4" />,
    thresholds: {
      lowStockThreshold: 15,
      outOfStockThreshold: 3,
      restockLevel: 30,
    },
  },
];

/**
 * Form data schema with Zod validation
 */
const thresholdFormSchema = stockThresholdConfigSchema.refine(
  (data) => data.restockLevel >= data.lowStockThreshold,
  {
    message: 'Restock level must be greater than or equal to low stock threshold',
    path: ['restockLevel'],
  }
);

type ThresholdFormData = z.infer<typeof thresholdFormSchema>;

// ============================================================================
// ThresholdSettings Component
// ============================================================================

export function ThresholdSettings({
  productId,
  productName = 'Selected Product',
  currentThresholds = {
    lowStockThreshold: 10,
    outOfStockThreshold: 0,
    restockLevel: 20,
  },
  currentStock = 0,
  onSave,
  onCancel,
  bulkMode = false,
  availableProducts = [],
  isLoading = false,
  className,
}: ThresholdSettingsProps) {
  // ============================================================================
  // State Management
  // ============================================================================

  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // ============================================================================
  // Form Setup
  // ============================================================================

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
  } = useForm<ThresholdFormData>({
    resolver: zodResolver(thresholdFormSchema),
    defaultValues: currentThresholds,
    mode: 'onChange',
  });

  const formValues = watch();

  // Mark form as dirty when values change
  useEffect(() => {
    const subscription = watch(() => setIsDirty(true));
    return () => subscription.unsubscribe();
  }, [watch]);

  // ============================================================================
  // Visual Preview Calculations
  // ============================================================================

  const thresholdRanges = useMemo(() => {
    const { lowStockThreshold, outOfStockThreshold, restockLevel } = formValues;
    const maxValue = Math.max(restockLevel, currentStock, lowStockThreshold) + 10;

    return {
      outOfStock: {
        start: 0,
        end: outOfStockThreshold,
        percentage: (outOfStockThreshold / maxValue) * 100,
        color: 'bg-red-500',
        label: 'Out of Stock',
      },
      lowStock: {
        start: outOfStockThreshold,
        end: lowStockThreshold,
        percentage: ((lowStockThreshold - outOfStockThreshold) / maxValue) * 100,
        color: 'bg-yellow-500',
        label: 'Low Stock',
      },
      inStock: {
        start: lowStockThreshold,
        end: maxValue,
        percentage: ((maxValue - lowStockThreshold) / maxValue) * 100,
        color: 'bg-green-500',
        label: 'In Stock',
      },
      restock: {
        position: (restockLevel / maxValue) * 100,
        label: 'Restock Level',
      },
      current: {
        position: (currentStock / maxValue) * 100,
        label: 'Current Stock',
      },
    };
  }, [formValues, currentStock]);

  // ============================================================================
  // Handlers
  // ============================================================================

  /**
   * Apply preset template
   */
  const applyPreset = useCallback(
    (preset: ThresholdPreset) => {
      setValue('lowStockThreshold', preset.thresholds.lowStockThreshold, { shouldValidate: true });
      setValue('outOfStockThreshold', preset.thresholds.outOfStockThreshold, { shouldValidate: true });
      setValue('restockLevel', preset.thresholds.restockLevel, { shouldValidate: true });
      setIsDirty(true);
      toast.success(`Applied "${preset.name}" preset`);
    },
    [setValue]
  );

  /**
   * Handle form submission
   */
  const onSubmit = async (data: ThresholdFormData) => {
    try {
      setIsSaving(true);

      if (bulkMode && selectedProducts.size === 0) {
        toast.error('Please select at least one product to update');
        return;
      }

      // Call onSave callback (API integration point)
      if (onSave) {
        await onSave(data);
      }

      // Success feedback
      if (bulkMode) {
        toast.success(`Thresholds updated for ${selectedProducts.size} product(s)!`);
      } else {
        toast.success('Threshold settings saved successfully!');
      }

      setIsDirty(false);
      reset(data);
    } catch (error) {
      console.error('[ThresholdSettings] Save error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save threshold settings');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle cancel action
   */
  const handleCancel = () => {
    reset(currentThresholds);
    setIsDirty(false);
    onCancel?.();
  };

  /**
   * Toggle product selection in bulk mode
   */
  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  /**
   * Select/deselect all products in bulk mode
   */
  const toggleSelectAll = () => {
    if (selectedProducts.size === availableProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(availableProducts.map((p) => p._id)));
    }
  };

  // ============================================================================
  // Keyboard Shortcuts
  // ============================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+S / Ctrl+S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (isDirty && isValid && !isSaving) {
          handleSubmit(onSubmit)();
        }
      }

      // Esc to cancel
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDirty, isValid, isSaving, handleSubmit, onSubmit]);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Threshold Configuration</CardTitle>
          </div>
          {isDirty && (
            <Badge variant="secondary" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Unsaved Changes
            </Badge>
          )}
        </div>
        <CardDescription>
          {bulkMode
            ? `Configure thresholds for ${selectedProducts.size} selected product(s)`
            : `Configure thresholds for ${productName}`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Preset Templates */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Quick Presets</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {THRESHOLD_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border text-left transition-all',
                  'hover:border-primary hover:bg-primary/5',
                  'focus:outline-none focus:ring-2 focus:ring-primary/20'
                )}
              >
                <div className="mt-0.5 text-primary">{preset.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{preset.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {preset.description}
                  </div>
                  <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                    <span>Low: {preset.thresholds.lowStockThreshold}</span>
                    <span>•</span>
                    <span>Out: {preset.thresholds.outOfStockThreshold}</span>
                    <span>•</span>
                    <span>Restock: {preset.thresholds.restockLevel}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Threshold Input Fields */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Low Stock Threshold */}
          <div className="space-y-2">
            <Label htmlFor="lowStockThreshold">
              Low Stock Threshold
              <span className="text-xs text-muted-foreground ml-2">
                (Alert when stock falls below this level)
              </span>
            </Label>
            <Controller
              name="lowStockThreshold"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="lowStockThreshold"
                  type="number"
                  min={0}
                  step={1}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className={errors.lowStockThreshold ? 'border-red-500' : ''}
                  placeholder="Enter low stock threshold"
                />
              )}
            />
            {errors.lowStockThreshold && (
              <p className="text-xs text-red-500">{errors.lowStockThreshold.message}</p>
            )}
          </div>

          {/* Out of Stock Threshold */}
          <div className="space-y-2">
            <Label htmlFor="outOfStockThreshold">
              Out of Stock Threshold
              <span className="text-xs text-muted-foreground ml-2">
                (Stock level considered "out of stock")
              </span>
            </Label>
            <Controller
              name="outOfStockThreshold"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="outOfStockThreshold"
                  type="number"
                  min={0}
                  step={1}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className={errors.outOfStockThreshold ? 'border-red-500' : ''}
                  placeholder="Enter out of stock threshold"
                />
              )}
            />
            {errors.outOfStockThreshold && (
              <p className="text-xs text-red-500">{errors.outOfStockThreshold.message}</p>
            )}
          </div>

          {/* Restock Level */}
          <div className="space-y-2">
            <Label htmlFor="restockLevel">
              Restock Level
              <span className="text-xs text-muted-foreground ml-2">
                (Recommended quantity to order)
              </span>
            </Label>
            <Controller
              name="restockLevel"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="restockLevel"
                  type="number"
                  min={0}
                  step={1}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className={errors.restockLevel ? 'border-red-500' : ''}
                  placeholder="Enter restock level"
                />
              )}
            />
            {errors.restockLevel && (
              <p className="text-xs text-red-500">{errors.restockLevel.message}</p>
            )}
          </div>
        </form>

        {/* Visual Preview */}
        <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
          <Label className="text-sm font-medium">Visual Preview</Label>
          
          {/* Color-coded threshold bars */}
          <div className="space-y-2">
            <div className="flex h-6 rounded-md overflow-hidden border">
              <div
                className={cn(thresholdRanges.outOfStock.color, 'flex items-center justify-center text-xs text-white font-medium')}
                style={{ width: `${thresholdRanges.outOfStock.percentage}%` }}
              >
                {thresholdRanges.outOfStock.percentage > 10 && 'Out'}
              </div>
              <div
                className={cn(thresholdRanges.lowStock.color, 'flex items-center justify-center text-xs text-white font-medium')}
                style={{ width: `${thresholdRanges.lowStock.percentage}%` }}
              >
                {thresholdRanges.lowStock.percentage > 10 && 'Low'}
              </div>
              <div
                className={cn(thresholdRanges.inStock.color, 'flex items-center justify-center text-xs text-white font-medium')}
                style={{ width: `${thresholdRanges.inStock.percentage}%` }}
              >
                {thresholdRanges.inStock.percentage > 10 && 'In Stock'}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span>Out of Stock (0-{formValues.outOfStockThreshold})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-yellow-500" />
                <span>Low Stock ({formValues.outOfStockThreshold}-{formValues.lowStockThreshold})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-green-500" />
                <span>In Stock ({formValues.lowStockThreshold}+)</span>
              </div>
            </div>

            {/* Current stock indicator */}
            {currentStock > 0 && (
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Current Stock Position:</span>
                  <Badge variant={
                    currentStock <= formValues.outOfStockThreshold ? 'destructive' :
                    currentStock <= formValues.lowStockThreshold ? 'secondary' :
                    'default'
                  }>
                    {currentStock} units
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bulk Mode: Product Selection */}
        {bulkMode && availableProducts.length > 0 && (
          <div className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Select Products to Update</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={toggleSelectAll}
              >
                {selectedProducts.size === availableProducts.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <div className="max-h-[200px] overflow-y-auto space-y-2">
              {availableProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-2 rounded border hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Switch
                      checked={selectedProducts.has(product._id)}
                      onCheckedChange={() => toggleProductSelection(product._id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{product.name}</div>
                      <div className="text-xs text-muted-foreground">{product.sku}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Selected: {selectedProducts.size} of {availableProducts.length} products
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground">
          <kbd className="px-2 py-1 rounded bg-muted text-xs">Cmd+S</kbd> to save,{' '}
          <kbd className="px-2 py-1 rounded bg-muted text-xs">Esc</kbd> to cancel
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving || !isDirty}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={!isDirty || !isValid || isSaving || isLoading}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Thresholds
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
