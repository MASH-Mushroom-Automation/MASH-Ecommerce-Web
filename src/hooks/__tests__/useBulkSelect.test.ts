/**
 * Tests for src/hooks/useBulkSelect.ts
 * Covers: initial state, toggleRow, selectAll, clearAll, isSelected,
 * selectedIds, selectMultiple, and edge cases
 */

import { renderHook, act } from "@testing-library/react";
import { useBulkSelect } from "../useBulkSelect";

describe("useBulkSelect", () => {
  describe("initialization", () => {
    it("starts with empty set when no initial values", () => {
      const { result } = renderHook(() => useBulkSelect<string>());
      expect(result.current.selected.size).toBe(0);
      expect(result.current.selectedIds).toEqual([]);
    });

    it("starts with provided initial values", () => {
      const { result } = renderHook(() => useBulkSelect(["a", "b", "c"]));
      expect(result.current.selected.size).toBe(3);
      expect(result.current.selectedIds).toContain("a");
      expect(result.current.selectedIds).toContain("b");
      expect(result.current.selectedIds).toContain("c");
    });

    it("works with numeric IDs", () => {
      const { result } = renderHook(() => useBulkSelect([1, 2, 3]));
      expect(result.current.selected.size).toBe(3);
      expect(result.current.isSelected(1)).toBe(true);
    });

    it("deduplicates initial values", () => {
      const { result } = renderHook(() => useBulkSelect(["a", "a", "b"]));
      expect(result.current.selected.size).toBe(2);
    });
  });

  describe("toggleRow", () => {
    it("adds item when not selected", () => {
      const { result } = renderHook(() => useBulkSelect<string>());

      act(() => {
        result.current.toggleRow("item-1");
      });

      expect(result.current.isSelected("item-1")).toBe(true);
      expect(result.current.selectedIds).toEqual(["item-1"]);
    });

    it("removes item when already selected", () => {
      const { result } = renderHook(() => useBulkSelect(["item-1"]));

      act(() => {
        result.current.toggleRow("item-1");
      });

      expect(result.current.isSelected("item-1")).toBe(false);
      expect(result.current.selectedIds).toEqual([]);
    });

    it("toggles multiple items independently", () => {
      const { result } = renderHook(() => useBulkSelect<string>());

      act(() => { result.current.toggleRow("a"); });
      act(() => { result.current.toggleRow("b"); });
      act(() => { result.current.toggleRow("c"); });

      expect(result.current.selected.size).toBe(3);

      act(() => { result.current.toggleRow("b"); });

      expect(result.current.selected.size).toBe(2);
      expect(result.current.isSelected("a")).toBe(true);
      expect(result.current.isSelected("b")).toBe(false);
      expect(result.current.isSelected("c")).toBe(true);
    });
  });

  describe("selectAll", () => {
    it("selects all provided IDs from array", () => {
      const { result } = renderHook(() => useBulkSelect<string>());

      act(() => {
        result.current.selectAll(["x", "y", "z"]);
      });

      expect(result.current.selected.size).toBe(3);
      expect(result.current.isSelected("x")).toBe(true);
      expect(result.current.isSelected("y")).toBe(true);
      expect(result.current.isSelected("z")).toBe(true);
    });

    it("replaces existing selection", () => {
      const { result } = renderHook(() => useBulkSelect(["old-1", "old-2"]));

      act(() => {
        result.current.selectAll(["new-1"]);
      });

      expect(result.current.selected.size).toBe(1);
      expect(result.current.isSelected("old-1")).toBe(false);
      expect(result.current.isSelected("new-1")).toBe(true);
    });

    it("accepts a Set as input", () => {
      const { result } = renderHook(() => useBulkSelect<string>());

      act(() => {
        result.current.selectAll(new Set(["s1", "s2"]));
      });

      expect(result.current.selected.size).toBe(2);
    });
  });

  describe("clearAll", () => {
    it("clears all selections", () => {
      const { result } = renderHook(() => useBulkSelect(["a", "b", "c"]));

      act(() => {
        result.current.clearAll();
      });

      expect(result.current.selected.size).toBe(0);
      expect(result.current.selectedIds).toEqual([]);
    });

    it("is idempotent - clearing empty set is fine", () => {
      const { result } = renderHook(() => useBulkSelect<string>());

      act(() => {
        result.current.clearAll();
      });

      expect(result.current.selected.size).toBe(0);
    });
  });

  describe("isSelected", () => {
    it("returns true for selected items", () => {
      const { result } = renderHook(() => useBulkSelect(["yes"]));
      expect(result.current.isSelected("yes")).toBe(true);
    });

    it("returns false for unselected items", () => {
      const { result } = renderHook(() => useBulkSelect(["yes"]));
      expect(result.current.isSelected("no")).toBe(false);
    });
  });

  describe("selectMultiple", () => {
    it("adds multiple items to existing selection", () => {
      const { result } = renderHook(() => useBulkSelect(["existing"]));

      act(() => {
        result.current.selectMultiple(["new-1", "new-2"]);
      });

      expect(result.current.selected.size).toBe(3);
      expect(result.current.isSelected("existing")).toBe(true);
      expect(result.current.isSelected("new-1")).toBe(true);
      expect(result.current.isSelected("new-2")).toBe(true);
    });

    it("does not duplicate already selected items", () => {
      const { result } = renderHook(() => useBulkSelect(["a", "b"]));

      act(() => {
        result.current.selectMultiple(["b", "c"]);
      });

      expect(result.current.selected.size).toBe(3);
    });

    it("handles empty array gracefully", () => {
      const { result } = renderHook(() => useBulkSelect(["a"]));

      act(() => {
        result.current.selectMultiple([]);
      });

      expect(result.current.selected.size).toBe(1);
    });
  });

  describe("selectedIds", () => {
    it("returns array representation of selected set", () => {
      const { result } = renderHook(() => useBulkSelect(["a", "b"]));
      const ids = result.current.selectedIds;
      expect(Array.isArray(ids)).toBe(true);
      expect(ids.length).toBe(2);
      expect(ids).toContain("a");
      expect(ids).toContain("b");
    });

    it("reflects changes after toggle", () => {
      const { result } = renderHook(() => useBulkSelect(["a", "b"]));

      act(() => { result.current.toggleRow("a"); });

      expect(result.current.selectedIds).toEqual(["b"]);
    });
  });
});
