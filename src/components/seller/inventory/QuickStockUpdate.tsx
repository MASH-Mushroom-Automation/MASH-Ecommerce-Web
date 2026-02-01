/**
 * QuickStockUpdate Modal Component
 * 
 * Modal dialog for quickly updating product stock quantity with optimistic UI updates.
 * Integrates with Sanity CMS via PATCH mutation and React Query cache invalidation.
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Minus, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { sanityClient } from '@/lib/sanity/client';
import type { LowStockItem } from '@/types/inventory';
import { cn } from '@/lib/utils';

export interface QuickStockUpdateProps {
  /** Whether modal is open */
  open: boolean;
  
  /** Callback when modal close is requested */
  onOpenChange: (open: boolean) => void;
  
  /** Product to update */
  product: LowStockItem | null;
  
  /** Callback after successful update (for cache invalidation) */
  onSuccess?: (productId: string, newStock: number) => void;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * QuickStockUpdate Modal
 * 
 * Features:
 * - Number input for new stock quantity
 * - Increment/decrement buttons (+1, +5, +10, -1)
 * - Validation: stock must be >= 0
 * - Keyboard shortcuts (Enter to save, Esc to close)
 * - Optimistic UI update with success/error toast
 * - Sanity PATCH mutation
 */
export const QuickStockUpdate = React.memo<QuickStockUpdateProps>(
  function QuickStockUpdate({ open, onOpenChange, product, onSuccess, className }) {
    const [stockValue, setStockValue] = useState<string>('');
    const [isUpdating, setIsUpdating] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initialize stock value when product changes
    useEffect(() => {
      if (product) {
        setStockValue(product.currentStock.toString());
      }
    }, [product]);

    // Focus input when modal opens
    useEffect(() => {
      if (open && inputRef.current) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }, [open]);

    // Handle keyboard shortcuts
    useEffect(() => {
      if (!open) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !isUpdating) {
          e.preventDefault();
          handleSave();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, isUpdating, stockValue]);

    const handleIncrement = (amount: number) => {
      const current = parseInt(stockValue) || 0;
      const newValue = Math.max(0, current + amount);
      setStockValue(newValue.toString());
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      // Allow only numbers
      if (value === '' || /^\d+$/.test(value)) {
        setStockValue(value);
      }
    };

    const handleSave = async () => {
      if (!product) return;

      const newStock = parseInt(stockValue);

      // Validation
      if (isNaN(newStock) || newStock < 0) {
        toast.error('Stock quantity must be 0 or greater');
        return;
      }

      if (newStock === product.currentStock) {
        toast.info('Stock quantity unchanged');
        onOpenChange(false);
        return;
      }

      setIsUpdating(true);

      try {
        // Optimistic update via toast
        toast.loading(`Updating ${product.name}...`, { id: 'stock-update' });

        // Sanity PATCH mutation
        await sanityClient
          .patch(product._id)
          .set({ stockQuantity: newStock })
          .commit();

        // Success feedback
        toast.success(
          `Stock updated: ${product.name} (${product.currentStock} → ${newStock})`,
          { id: 'stock-update' }
        );

        // Trigger callback for cache invalidation
        onSuccess?.(product._id, newStock);

        // Close modal
        onOpenChange(false);
      } catch (error) {
        console.error('[QuickStockUpdate] Failed to update stock:', error);
        toast.error(
          error instanceof Error ? error.message : 'Failed to update stock quantity',
          { id: 'stock-update' }
        );
      } finally {
        setIsUpdating(false);
      }
    };

    const handleCancel = () => {
      if (!isUpdating) {
        onOpenChange(false);
      }
    };

    if (!product) return null;

    const parsedStock = parseInt(stockValue) || 0;
    const stockChange = parsedStock - product.currentStock;
    const hasChanges = stockChange !== 0;

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={cn('sm:max-w-[500px]', className)}>
          <DialogHeader>
            <DialogTitle>Quick Stock Update</DialogTitle>
            <DialogDescription>
              Update stock quantity for this product. Changes are applied immediately.
            </DialogDescription>
          </DialogHeader>

          {/* Product Info */}
          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
            {product.mainImage ? (
              <img
                src={product.mainImage}
                alt={product.name}
                className="h-16 w-16 rounded object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded bg-muted flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{product.name}</h3>
              <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Current Stock: <span className="font-semibold">{product.currentStock}</span>
              </p>
            </div>
          </div>

          {/* Stock Input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stock-quantity">New Stock Quantity</Label>
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  id="stock-quantity"
                  type="text"
                  inputMode="numeric"
                  value={stockValue}
                  onChange={handleInputChange}
                  disabled={isUpdating}
                  className="text-lg font-semibold text-center"
                  aria-label="New stock quantity"
                />
              </div>
            </div>

            {/* Quick Adjust Buttons */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Quick Adjust</Label>
              <div className="grid grid-cols-4 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleIncrement(-1)}
                  disabled={isUpdating || parsedStock === 0}
                  aria-label="Decrease by 1"
                >
                  <Minus className="h-3 w-3 mr-1" />
                  1
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleIncrement(1)}
                  disabled={isUpdating}
                  aria-label="Increase by 1"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  1
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleIncrement(5)}
                  disabled={isUpdating}
                  aria-label="Increase by 5"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  5
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleIncrement(10)}
                  disabled={isUpdating}
                  aria-label="Increase by 10"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  10
                </Button>
              </div>
            </div>

            {/* Change Indicator */}
            {hasChanges && (
              <div
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium',
                  stockChange > 0
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                )}
              >
                {stockChange > 0 ? '+' : ''}
                {stockChange} units
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isUpdating || !hasChanges}
            >
              {isUpdating ? 'Updating...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);
