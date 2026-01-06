"use client";

import { useState, useCallback } from "react";

export type UseBulkSelectReturn<T extends string | number> = {
  selected: Set<T>;
  toggleRow: (id: T) => void;
  selectAll: (ids: T[] | Set<T>) => void;
  clearAll: () => void;
  isSelected: (id: T) => boolean;
  selectedIds: T[];
  selectMultiple: (ids: T[]) => void;
};

export function useBulkSelect<T extends string | number>(initial: T[] = []): UseBulkSelectReturn<T> {
  const [selected, setSelected] = useState<Set<T>>(new Set(initial));

  const toggleRow = useCallback((id: T) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: T[] | Set<T>) => {
    setSelected(() => new Set(ids as T[]));
  }, []);

  const selectMultiple = useCallback((ids: T[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((i) => next.add(i));
      return next;
    });
  }, []);

  const clearAll = useCallback(() => setSelected(new Set()), []);

  const isSelected = useCallback((id: T) => selected.has(id), [selected]);

  return {
    selected,
    toggleRow,
    selectAll,
    clearAll,
    isSelected,
    selectedIds: Array.from(selected),
    selectMultiple,
  };
}
