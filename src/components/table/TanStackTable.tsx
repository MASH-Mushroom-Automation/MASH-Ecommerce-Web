"use client";

import React, { useMemo, useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

type Props<T> = {
  data: T[];
  columns: ColumnDef<T, any>[];
  rowKey: keyof T;
  pageSize?: number;
  // selection managed externally
  selectedIds?: (string | number)[];
  onToggleRow?: (id: string | number) => void;
  onSelectAll?: (ids: (string | number)[]) => void;
  globalFilter?: string;
  filters?: Record<string, any>;
};

export function TanStackTable<T extends Record<string, any>>(props: Props<T>) {
  const { data, columns, rowKey, pageSize = 10, selectedIds = [], onToggleRow, onSelectAll, globalFilter, filters } = props;

  const defaultColumns = useMemo(() => {
    const selectionColumn: ColumnDef<T, any> = {
      id: "select",
      enableSorting: false,
      header: ({ table }) => {
        const allRowIds = table.getFilteredRowModel().rows.map((r) => r.original[rowKey] as string | number);
        const allSelected = allRowIds.length > 0 && allRowIds.every((id) => selectedIds.includes(id));
        const someSelected = allRowIds.some((id) => selectedIds.includes(id));

        return (
          <Checkbox
            aria-label="Select all rows"
            checked={allSelected}
            onCheckedChange={() => {
              if (allSelected) onSelectAll?.([]);
              else onSelectAll?.(allRowIds);
            }}
          />
        );
      },
      cell: ({ row }) => {
        const id = row.original[rowKey] as string | number;
        return (
          <Checkbox
            aria-label={`Select row ${id}`}
            checked={selectedIds.includes(id)}
            onCheckedChange={() => onToggleRow?.(id)}
          />
        );
      },
      size: 40,
    } as ColumnDef<T, any>;

    return [selectionColumn as ColumnDef<T, any>, ...columns];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, selectedIds, rowKey]);

  const [sorting, setSorting] = useState<any[]>([]);

  const table = useReactTable({
    data,
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter: globalFilter ?? undefined,
      sorting: sorting ?? undefined,
    },
    onSortingChange: setSorting,
    debugTable: false,
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={
                    header.column.id === "select"
                      ? "px-2 py-3 text-sm font-medium text-muted-foreground text-center align-middle"
                      : "px-2 py-3 text-sm font-medium text-muted-foreground"
                  }
                >
                  {header.isPlaceholder ? null : (
                    header.column.getCanSort() ? (
                      <div
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex items-center gap-2 cursor-pointer select-none"
                      >
                        <span>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        <span className="opacity-70">
                          {header.column.getIsSorted() === "asc" ? (
                            <ChevronUp className="size-4" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ChevronDown className="size-4" />
                          ) : (
                            <ChevronsUpDown className="h-4 w-4 opacity-60" />
                          )}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="flex-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                      </div>
                    )
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="p-6 text-center text-muted-foreground">
                No data
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-muted/50">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={
                      cell.column.id === "select" ? "p-3 align-middle text-center" : "p-3 align-top"
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TanStackTable;
