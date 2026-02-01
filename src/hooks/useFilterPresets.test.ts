/**
 * Unit Tests for useFilterPresets Hook
 */

import { renderHook, act } from '@testing-library/react';
import { useFilterPresets } from '../useFilterPresets';
import { ProductFilters, DEFAULT_FILTERS } from '@/types/product-filters';
import { toast } from 'sonner';

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('useFilterPresets', () => {
  // Clear localStorage before each test
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should initialize with empty presets', () => {
    const { result } = renderHook(() => useFilterPresets());
    expect(result.current.presets).toEqual([]);
  });

  it('should save a new preset', () => {
    const { result } = renderHook(() => useFilterPresets());

    const filters: ProductFilters = {
      ...DEFAULT_FILTERS,
      search: 'test',
      categories: ['cat-1'],
    };

    act(() => {
      result.current.savePreset('My Preset', filters);
    });

    expect(result.current.presets).toHaveLength(1);
    expect(result.current.presets[0].name).toBe('My Preset');
    expect(result.current.presets[0].filters).toEqual(filters);
    expect(toast.success).toHaveBeenCalledWith('Filter preset "My Preset" saved successfully');
  });

  it('should prevent duplicate preset names', () => {
    const { result } = renderHook(() => useFilterPresets());

    act(() => {
      result.current.savePreset('Duplicate', DEFAULT_FILTERS);
    });

    act(() => {
      result.current.savePreset('Duplicate', DEFAULT_FILTERS);
    });

    expect(result.current.presets).toHaveLength(1);
    expect(toast.error).toHaveBeenCalledWith(
      'Preset "Duplicate" already exists. Choose a different name.'
    );
  });

  it('should handle case-insensitive duplicate names', () => {
    const { result } = renderHook(() => useFilterPresets());

    act(() => {
      result.current.savePreset('MyPreset', DEFAULT_FILTERS);
    });

    act(() => {
      result.current.savePreset('mypreset', DEFAULT_FILTERS);
    });

    expect(result.current.presets).toHaveLength(1);
    expect(toast.error).toHaveBeenCalled();
  });

  it('should load a preset by ID', () => {
    const { result } = renderHook(() => useFilterPresets());

    const filters: ProductFilters = {
      ...DEFAULT_FILTERS,
      search: 'loadable',
    };

    act(() => {
      result.current.savePreset('Test Preset', filters);
    });

    const presetId = result.current.presets[0].id;

    let loadedPreset: any;
    act(() => {
      loadedPreset = result.current.loadPreset(presetId);
    });

    expect(loadedPreset).not.toBeNull();
    expect(loadedPreset.name).toBe('Test Preset');
    expect(loadedPreset.filters.search).toBe('loadable');
    expect(toast.success).toHaveBeenCalledWith('Filter preset "Test Preset" loaded');
  });

  it('should return null for non-existent preset', () => {
    const { result } = renderHook(() => useFilterPresets());

    let loadedPreset: any;
    act(() => {
      loadedPreset = result.current.loadPreset('non-existent-id');
    });

    expect(loadedPreset).toBeNull();
    expect(toast.error).toHaveBeenCalledWith('Preset not found');
  });

  it('should delete a preset by ID', () => {
    const { result } = renderHook(() => useFilterPresets());

    act(() => {
      result.current.savePreset('Delete Me', DEFAULT_FILTERS);
    });

    expect(result.current.presets).toHaveLength(1);
    const presetId = result.current.presets[0].id;

    act(() => {
      result.current.deletePreset(presetId);
    });

    expect(result.current.presets).toHaveLength(0);
    expect(toast.success).toHaveBeenCalledWith('Filter preset "Delete Me" deleted');
  });

  it('should handle deleting non-existent preset', () => {
    const { result } = renderHook(() => useFilterPresets());

    act(() => {
      result.current.deletePreset('non-existent-id');
    });

    expect(toast.error).toHaveBeenCalledWith('Preset not found');
  });

  it('should check if preset name exists', () => {
    const { result } = renderHook(() => useFilterPresets());

    act(() => {
      result.current.savePreset('Existing', DEFAULT_FILTERS);
    });

    expect(result.current.presetExists('Existing')).toBe(true);
    expect(result.current.presetExists('existing')).toBe(true); // Case-insensitive
    expect(result.current.presetExists('NonExisting')).toBe(false);
  });

  it('should persist presets to localStorage', () => {
    const { result } = renderHook(() => useFilterPresets());

    const filters: ProductFilters = {
      ...DEFAULT_FILTERS,
      search: 'persistent',
    };

    act(() => {
      result.current.savePreset('Persistent', filters);
    });

    const stored = localStorage.getItem('seller-filter-presets');
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].name).toBe('Persistent');
  });

  it('should load presets from localStorage on mount', () => {
    const presets = [
      {
        id: 'preset-1',
        name: 'Loaded Preset',
        filters: { ...DEFAULT_FILTERS, search: 'loaded' },
        createdAt: new Date().toISOString(),
      },
    ];

    localStorage.setItem('seller-filter-presets', JSON.stringify(presets));

    const { result } = renderHook(() => useFilterPresets());

    expect(result.current.presets).toHaveLength(1);
    expect(result.current.presets[0].name).toBe('Loaded Preset');
    expect(result.current.presets[0].filters.search).toBe('loaded');
  });

  it('should handle corrupted localStorage data gracefully', () => {
    localStorage.setItem('seller-filter-presets', 'invalid json');

    const { result } = renderHook(() => useFilterPresets());

    expect(result.current.presets).toEqual([]);
    expect(toast.error).toHaveBeenCalledWith('Failed to load filter presets');
  });

  it('should use seller-specific storage key', () => {
    const { result } = renderHook(() => useFilterPresets('user-123'));

    act(() => {
      result.current.savePreset('Seller Preset', DEFAULT_FILTERS);
    });

    const stored = localStorage.getItem('seller-filter-presets-user-123');
    expect(stored).not.toBeNull();
  });

  it('should preserve date range in presets', () => {
    const { result } = renderHook(() => useFilterPresets());

    const filters: ProductFilters = {
      ...DEFAULT_FILTERS,
      dateRange: {
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
      },
    };

    act(() => {
      result.current.savePreset('Date Preset', filters);
    });

    const presetId = result.current.presets[0].id;

    let loadedPreset: any;
    act(() => {
      loadedPreset = result.current.loadPreset(presetId);
    });

    expect(loadedPreset.filters.dateRange).not.toBeNull();
    expect(loadedPreset.filters.dateRange.from).toBeInstanceOf(Date);
    expect(loadedPreset.filters.dateRange.to).toBeInstanceOf(Date);
  });

  it('should save multiple presets', () => {
    const { result } = renderHook(() => useFilterPresets());

    act(() => {
      result.current.savePreset('Preset 1', { ...DEFAULT_FILTERS, search: 'one' });
      result.current.savePreset('Preset 2', { ...DEFAULT_FILTERS, search: 'two' });
      result.current.savePreset('Preset 3', { ...DEFAULT_FILTERS, search: 'three' });
    });

    expect(result.current.presets).toHaveLength(3);
    expect(result.current.presets[0].filters.search).toBe('one');
    expect(result.current.presets[1].filters.search).toBe('two');
    expect(result.current.presets[2].filters.search).toBe('three');
  });
});
