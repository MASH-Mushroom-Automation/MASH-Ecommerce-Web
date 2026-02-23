/**
 * StockAdjustmentForm Component
 * 
 * Comprehensive form for creating stock adjustments with validation and real-time preview.
 * Uses React Hook Form + Zod for validation, integrates with stock adjustment API.
 * 
 * Features:
 * - Product selection dropdown (searchable)
 * - Adjustment type radio group with icons (6 types)
 * - Quantity input with +/- buttons
 * - Dynamic reason dropdown filtered by adjustment type
 * - Notes textarea (optional, 500 char max)
 * - Current stock display + real-time new stock preview
 * - Full client-side validation matching backend rules
 * - Optimistic UI updates on submit
 * - Success/error toast notifications
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  RotateCcw, 
  AlertTriangle, 
  ArrowRight,
  Plus,
  Minus,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';

// Types and utilities
import type { 
  StockAdjustmentType, 
  StockAdjustmentRequest 
} from '@/types/stock-management';
import { 
  STOCK_ADJUSTMENT_REASONS, 
  getReasonsForType,
  calculateNewStock,
  StockAdjustmentRequestSchema
} from '@/types/stock-management';
import { cn } from '@/lib/utils';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface StockAdjustmentFormProps {
  /** Available products for selection */
  products: Array<{
    _id: string;
    name: string;
    sku: string;
    stockQuantity: number;
    lowStockThreshold?: number;
  }>;
  
  /** Callback after successful adjustment */
  onSuccess?: (response: any) => void;
  
  /** Callback on cancel */
  onCancel?: () => void;
  
  /** Pre-selected product ID */
  defaultProductId?: string;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * Form data interface (matches StockAdjustmentRequest)
 */
interface StockAdjustmentFormData {
  productId: string;
  adjustmentType: StockAdjustmentType;
  quantityChange: number;
  reason: string;
  notes?: string;
}

// ============================================================================
// Form Validation Schema
// ============================================================================

const formSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  adjustmentType: z.enum(['received', 'sold', 'returned', 'damaged', 'transferred', 'adjustment'], {
    errorMap: () => ({ message: 'Please select an adjustment type' })
  }),
  quantityChange: z.number({
    required_error: 'Quantity is required',
    invalid_type_error: 'Quantity must be a number'
  }).refine((val) => val !== 0, {
    message: 'Quantity cannot be zero'
  }),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
}).refine((data) => {
  // Stock-in types require positive quantity
  const stockInTypes: StockAdjustmentType[] = ['received', 'returned'];
  if (stockInTypes.includes(data.adjustmentType) && data.quantityChange < 0) {
    return false;
  }
  
  // Stock-out types require negative quantity
  const stockOutTypes: StockAdjustmentType[] = ['sold', 'damaged', 'transferred'];
  if (stockOutTypes.includes(data.adjustmentType) && data.quantityChange > 0) {
    return false;
  }
  
  return true;
}, {
  message: 'Quantity direction must match adjustment type',
  path: ['quantityChange']
});

// ============================================================================
// Adjustment Type Configuration
// ============================================================================

const ADJUSTMENT_TYPE_CONFIG: Record<StockAdjustmentType, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
  quantityPrefix: '+' | '-' | '±';
}> = {
  received: {
    label: 'Received',
    icon: TrendingUp,
    description: 'Stock received from supplier or transfer',
    color: 'text-green-600',
    quantityPrefix: '+'
  },
  sold: {
    label: 'Sold',
    icon: TrendingDown,
    description: 'Stock sold to customer',
    color: 'text-blue-600',
    quantityPrefix: '-'
  },
  returned: {
    label: 'Returned',
    icon: RotateCcw,
    description: 'Customer returned product',
    color: 'text-purple-600',
    quantityPrefix: '+'
  },
  damaged: {
    label: 'Damaged',
    icon: AlertTriangle,
    description: 'Damaged, expired, or spoiled stock',
    color: 'text-red-600',
    quantityPrefix: '-'
  },
  transferred: {
    label: 'Transferred',
    icon: ArrowRight,
    description: 'Stock transferred to another location',
    color: 'text-orange-600',
    quantityPrefix: '-'
  },
  adjustment: {
    label: 'Adjustment',
    icon: Package,
    description: 'Manual stock correction',
    color: 'text-gray-600',
    quantityPrefix: '±'
  }
};

// ============================================================================
// Main Component
// ============================================================================

export const StockAdjustmentForm = React.memo<StockAdjustmentFormProps>(
  function StockAdjustmentForm({
    products,
    onSuccess,
    onCancel,
    defaultProductId,
    isLoading: externalLoading = false,
    className
  }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // ========================================================================
    // Form Setup
    // ========================================================================
    
    const {
      control,
      register,
      handleSubmit,
      watch,
      setValue,
      reset,
      formState: { errors }
    } = useForm<StockAdjustmentFormData>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        productId: defaultProductId || '',
        adjustmentType: 'received',
        quantityChange: 0,
        reason: '',
        notes: ''
      }
    });
    
    // Watch form values for real-time preview
    const selectedProductId = watch('productId');
    const adjustmentType = watch('adjustmentType');
    const quantityChange = watch('quantityChange');
    
    // ========================================================================
    // Product Data
    // ========================================================================
    
    const selectedProduct = useMemo(() => {
      return products.find(p => p._id === selectedProductId);
    }, [products, selectedProductId]);
    
    const currentStock = selectedProduct?.stockQuantity ?? 0;
    const newStock = calculateNewStock(currentStock, quantityChange);
    // Use raw (unclamped) value for warning and submit-disable logic
    const rawNewStock = currentStock + (quantityChange || 0);
    
    // ========================================================================
    // Dynamic Reasons
    // ========================================================================
    
    const availableReasons = useMemo(() => {
      return getReasonsForType(adjustmentType);
    }, [adjustmentType]);
    
    // Reset reason when adjustment type changes
    useEffect(() => {
      setValue('reason', '');
    }, [adjustmentType, setValue]);
    
    // ========================================================================
    // Quantity Helpers
    // ========================================================================
    
    const adjustQuantity = (delta: number) => {
      const current = quantityChange || 0;
      const config = ADJUSTMENT_TYPE_CONFIG[adjustmentType];
      
      // Ensure sign matches adjustment type
      let newValue = current + delta;
      
      if (config.quantityPrefix === '+' && newValue < 0) {
        newValue = Math.abs(newValue);
      } else if (config.quantityPrefix === '-' && newValue > 0) {
        newValue = -Math.abs(newValue);
      }
      
      setValue('quantityChange', newValue);
    };
    
    // ========================================================================
    // Form Submission
    // ========================================================================
    
    const onSubmit = async (data: StockAdjustmentFormData) => {
      if (!selectedProduct) {
        toast.error('Please select a product');
        return;
      }
      
      // Validate new stock won't go negative
      if (newStock < 0) {
        toast.error('Adjustment would result in negative stock. Please adjust quantity.');
        return;
      }
      
      setIsSubmitting(true);
      
      try {
        const response = await fetch('/api/seller/stock/adjust', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to adjust stock');
        }
        
        const result = await response.json();
        
        toast.success(
          `Stock adjusted successfully! ${selectedProduct.name}: ${currentStock} → ${newStock}`
        );
        
        // Reset form
        reset({
          productId: defaultProductId || '',
          adjustmentType: 'received',
          quantityChange: 0,
          reason: '',
          notes: ''
        });
        
        // Callback
        if (onSuccess) {
          onSuccess(result);
        }
      } catch (error) {
        console.error('[StockAdjustmentForm] Submission error:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to adjust stock');
      } finally {
        setIsSubmitting(false);
      }
    };
    
    // ========================================================================
    // Stock Status Badge
    // ========================================================================
    
    const getStockStatusBadge = (stock: number) => {
      const threshold = selectedProduct?.lowStockThreshold ?? 10;
      
      if (stock === 0) {
        return <Badge variant="destructive">Out of Stock</Badge>;
      } else if (stock <= threshold) {
        return <Badge variant="warning">Low Stock</Badge>;
      } else {
        return <Badge variant="success">In Stock</Badge>;
      }
    };
    
    // ========================================================================
    // Loading State
    // ========================================================================
    
    const isFormLoading = externalLoading || isSubmitting;
    
    // ========================================================================
    // Render
    // ========================================================================
    
    return (
      <Card className={cn('w-full max-w-3xl', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stock Adjustment
          </CardTitle>
        </CardHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Product Selection */}
            <div className="space-y-2">
              <Label htmlFor="productId">
                Product <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="productId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isFormLoading}
                  >
                    <SelectTrigger id="productId" className={cn(errors.productId && 'border-red-500')}>
                      <SelectValue placeholder="Select a product..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product._id} value={product._id}>
                          <div className="flex items-center justify-between w-full gap-4">
                            <span className="font-medium">{product.name}</span>
                            <span className="text-sm text-muted-foreground">
                              SKU: {product.sku} • Stock: {product.stockQuantity}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.productId && (
                <p className="text-sm text-red-500">{errors.productId.message}</p>
              )}
              
              {/* Current Stock Display */}
              {selectedProduct && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Current Stock:</span>
                  <span className="text-lg font-bold">{currentStock}</span>
                  {getStockStatusBadge(currentStock)}
                </div>
              )}
            </div>
            
            {/* Adjustment Type */}
            <div className="space-y-3">
              <Label>
                Adjustment Type <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="adjustmentType"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isFormLoading}
                    className="grid grid-cols-2 md:grid-cols-3 gap-3"
                  >
                    {Object.entries(ADJUSTMENT_TYPE_CONFIG).map(([type, config]) => {
                      const Icon = config.icon;
                      const isSelected = field.value === type;
                      
                      return (
                        <div key={type}>
                          <RadioGroupItem
                            value={type}
                            id={`type-${type}`}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`type-${type}`}
                            className={cn(
                              'flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all',
                              isSelected && 'bg-accent'
                            )}
                          >
                            <Icon className={cn('h-6 w-6 mb-2', config.color)} />
                            <span className="text-sm font-medium">{config.label}</span>
                            <span className="text-xs text-muted-foreground text-center mt-1">
                              {config.description}
                            </span>
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                )}
              />
              {errors.adjustmentType && (
                <p className="text-sm text-red-500">{errors.adjustmentType.message}</p>
              )}
            </div>
            
            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantityChange">
                Quantity Change <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => adjustQuantity(-1)}
                  disabled={isFormLoading}
                  aria-label="Decrease quantity by 1"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="quantityChange"
                  type="number"
                  {...register('quantityChange', { valueAsNumber: true })}
                  disabled={isFormLoading}
                  className={cn('text-center text-lg font-semibold', errors.quantityChange && 'border-red-500')}
                  placeholder="0"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => adjustQuantity(1)}
                  disabled={isFormLoading}
                  aria-label="Increase quantity by 1"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {errors.quantityChange && (
                <p className="text-sm text-red-500">{errors.quantityChange.message}</p>
              )}
              
              {/* New Stock Preview */}
              {selectedProduct && quantityChange !== 0 && (
                <div className={cn(
                  'flex items-center justify-between p-3 rounded-lg',
                  newStock < 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
                )}>
                  <span className="text-sm font-medium">New Stock:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{currentStock}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className={cn(
                      'text-lg font-bold',
                      newStock < 0 ? 'text-red-600' : 'text-green-600'
                    )}>
                      {newStock}
                    </span>
                    {newStock >= 0 && getStockStatusBadge(newStock)}
                  </div>
                </div>
              )}
              
              {rawNewStock < 0 && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  Warning: This adjustment would result in negative stock
                </p>
              )}
            </div>
            
            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="reason"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isFormLoading}
                  >
                    <SelectTrigger id="reason" className={cn(errors.reason && 'border-red-500')}>
                      <SelectValue placeholder="Select a reason..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableReasons.map((reason) => (
                        <SelectItem key={reason.code} value={reason.code}>
                          <div>
                            <div className="font-medium">{reason.label}</div>
                            {reason.description && (
                              <div className="text-xs text-muted-foreground">{reason.description}</div>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.reason && (
                <p className="text-sm text-red-500">{errors.reason.message}</p>
              )}
            </div>
            
            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">
                Notes <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Textarea
                id="notes"
                {...register('notes')}
                disabled={isFormLoading}
                className={cn(errors.notes && 'border-red-500')}
                placeholder="Add any additional notes about this adjustment..."
                rows={3}
                maxLength={500}
              />
              <div className="flex justify-between items-center">
                {errors.notes && (
                  <p className="text-sm text-red-500">{errors.notes.message}</p>
                )}
                <p className="text-xs text-muted-foreground ml-auto">
                  {watch('notes')?.length || 0} / 500 characters
                </p>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isFormLoading}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isFormLoading || rawNewStock < 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adjusting Stock...
                </>
              ) : (
                'Adjust Stock'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    );
  }
);
