/**
 * useFilterPresets Hook
 * Save and load filter presets from localStorage
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProductFilters, FilterPreset } from '@/types/product-filters';
import { toast } from 'sonner';

export interface UseFilterPresetsReturn {
  /** List of saved presets */
  presets: FilterPreset[];
  
  /** Save current filters as a preset */
  savePreset: (name: string, filters: ProductFilters) => void;
  
  /** Load a preset by ID */
  loadPreset: (id: string) => FilterPreset | null;
  
  /** Delete a preset by ID */
  deletePreset: (id: string) => void;
  
  /** Check if a preset name already exists */
  presetExists: (name: string) => boolean;
}

/**
 * Get localStorage key for seller filter presets
 * @param userId - User ID (seller)
 * @returns localStorage key
 */
function getStorageKey(userId?: string): string {
  return userId ? `seller-filter-presets-${userId}` : 'seller-filter-presets';
}

/**
 * Custom hook for managing filter presets
 * 
 * Features:
 * - Save/load/delete filter presets
 * - Store in localStorage (persists across sessions)
 * - Toast notifications for user feedback
 * - Seller-specific storage keys
 * 
 * @param userId - Optional user ID for seller-specific presets
 * @returns Preset list and CRUD functions
 */
export function useFilterPresets(userId?: string): UseFilterPresetsReturn {
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const storageKey = getStorageKey(userId);

  // Load presets from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as FilterPreset[];
        // Convert date strings back to Date objects
        const withDates = parsed.map((preset) => ({
          ...preset,
          createdAt: new Date(preset.createdAt),
          filters: {
            ...preset.filters,
            dateRange: preset.filters.dateRange
              ? {
                  from: new Date(preset.filters.dateRange.from),
                  to: new Date(preset.filters.dateRange.to),
                }
              : null,
          },
        }));
        setPresets(withDates);
      }
    } catch (error) {
      console.error('[useFilterPresets] Failed to load presets:', error);
      toast.error('Failed to load filter presets');
    }
  }, [storageKey]);

  // Save presets to localStorage whenever they change
  useEffect(() => {
    if (presets.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(presets));
      } catch (error) {
        console.error('[useFilterPresets] Failed to save presets:', error);
        toast.error('Failed to save filter presets');
      }
    }
  }, [presets, storageKey]);

  // Save new preset
  const savePreset = useCallback(
    (name: string, filters: ProductFilters) => {
      // Check if name already exists
      const exists = presets.some((p) => p.name.toLowerCase() === name.toLowerCase());
      if (exists) {
        toast.error(`Preset "${name}" already exists. Choose a different name.`);
        return;
      }

      const newPreset: FilterPreset = {
        id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        filters,
        createdAt: new Date(),
      };

      setPresets((prev) => [...prev, newPreset]);
      toast.success(`Filter preset "${name}" saved successfully`);
    },
    [presets]
  );

  // Load preset by ID
  const loadPreset = useCallback(
    (id: string): FilterPreset | null => {
      const preset = presets.find((p) => p.id === id);
      if (preset) {
        toast.success(`Filter preset "${preset.name}" loaded`);
        return preset;
      } else {
        toast.error('Preset not found');
        return null;
      }
    },
    [presets]
  );

  // Delete preset
  const deletePreset = useCallback(
    (id: string) => {
      const preset = presets.find((p) => p.id === id);
      if (!preset) {
        toast.error('Preset not found');
        return;
      }

      setPresets((prev) => prev.filter((p) => p.id !== id));
      toast.success(`Filter preset "${preset.name}" deleted`);
    },
    [presets]
  );

  // Check if preset name exists
  const presetExists = useCallback(
    (name: string): boolean => {
      return presets.some((p) => p.name.toLowerCase() === name.toLowerCase());
    },
    [presets]
  );

  return {
    presets,
    savePreset,
    loadPreset,
    deletePreset,
    presetExists,
  };
}
