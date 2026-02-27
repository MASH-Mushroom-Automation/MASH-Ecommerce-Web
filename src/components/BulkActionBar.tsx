"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { SellerApi } from "@/lib/api/seller";
import { exportToCsv } from "@/lib/exportCsv";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { MoreHorizontal } from "lucide-react";

type BulkActionHandlers = {
  onComplete?: () => void;
};

type Props = {
  selectedIds: (string | number)[];
  productsMap: Record<string, any>;
  onActivate?: (ids: (string | number)[]) => Promise<{ success: string[]; failed: string[] }>;
  onDeactivate?: (ids: (string | number)[]) => Promise<{ success: string[]; failed: string[] }>;
  onDelete?: (ids: (string | number)[]) => Promise<{ success: string[]; failed: string[] }>;
  onUpdatePrice?: (ids: (string | number)[], price: number) => Promise<{ success: string[]; failed: string[] }>;
  onExport?: (rows: any[]) => void;
  handlers?: BulkActionHandlers;
  onClear?: () => void;
};

export function BulkActionBar({ selectedIds, productsMap, onActivate, onDeactivate, onDelete, onUpdatePrice, onExport, handlers, onClear }: Props) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [updatePriceDialogOpen, setUpdatePriceDialogOpen] = useState(false);
  const [updatePriceValue, setUpdatePriceValue] = useState<string>("");

  const selectedCount = selectedIds.length;

  const runBulk = async (fn: () => Promise<{ success: string[]; failed: string[] } | void>, label: string) => {
    setLoading(true);
    setSummary(null);
    try {
      const res = await fn();
      if (res && ("success" in res)) {
        setSummary(`${label} finished. Success: ${res.success.length}. Failed: ${res.failed.length}`);
      } else {
        setSummary(`${label} finished.`);
      }
      handlers?.onComplete?.();
    } catch (err: any) {
      setSummary(`${label} failed: ${err?.message ?? String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    await runBulk(() => onActivate?.(selectedIds) ?? Promise.resolve({ success: [], failed: [] }), "Activate");
  };

  const handleDeactivate = async () => {
    setDeactivateDialogOpen(true);
  };

  const confirmDeactivate = async () => {
    await runBulk(() => onDeactivate?.(selectedIds) ?? Promise.resolve({ success: [], failed: [] }), "Deactivate");
    setDeactivateDialogOpen(false);
  };

  const handleUpdatePrice = async () => {
    setUpdatePriceDialogOpen(true);
  };

  const confirmUpdatePrice = async () => {
    const price = Number(updatePriceValue);
    if (!updatePriceValue.trim() || isNaN(price) || price <= 0) {
      setSummary("Invalid price");
      return;
    }
    await runBulk(() => onUpdatePrice?.(selectedIds, price) ?? Promise.resolve({ success: [], failed: [] }), "Update Price");
    setUpdatePriceDialogOpen(false);
    setUpdatePriceValue("");
  };

  // Open the confirmation dialog for bulk delete
  const handleDelete = async () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    await runBulk(() => onDelete?.(selectedIds) ?? Promise.resolve({ success: [], failed: [] }), "Delete");
    setDeleteDialogOpen(false);
  };

  const handleExport = () => {
    const rows = selectedIds.map((id) => productsMap[String(id)]).filter(Boolean);
    onExport?.(rows);
    exportToCsv(rows, "products-export.csv");
  };

  const handleClear = () => {
    onClear?.();
  };

  if (selectedCount === 0) return null;

  // detect mixed statuses
  const statuses = Array.from(new Set(selectedIds.map((id) => String(productsMap[String(id)]?.status ?? "")).filter(Boolean)));
  const mixed = statuses.length > 1;

  return (
    <div className="rounded-md border p-3 flex items-center justify-between bg-green-50">
      <div className="flex items-center gap-3">
        <div className="font-semibold">{selectedCount} selected</div>
        {mixed && <div className="text-sm px-2 py-0.5 rounded bg-amber-100 text-amber-800">Mixed statuses detected</div>}
        {summary && <div className="text-sm text-muted-foreground">{summary}</div>}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleClear} className="text-sm text-primary underline">Clear</button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <MoreHorizontal /> Bulk Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => handleActivate()}>
              Activate Selected
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleDeactivate()}>
              Deactivate Selected
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Other</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => handleUpdatePrice()}>Update Price</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleDelete()} className="text-destructive">Delete Selected</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => handleExport()}>Export (CSV)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Bulk Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={(open) => setDeleteDialogOpen(open)}>
          <DialogTrigger asChild>
            <span />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete {selectedCount} product{selectedCount > 1 ? "s" : ""}</DialogTitle>
              <DialogDescription>Are you sure you want to delete the selected product(s)? This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button onClick={() => confirmDelete()} disabled={loading} className="bg-destructive hover:bg-destructive/90">
                {loading ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Deactivate Confirmation Dialog */}
        <Dialog open={deactivateDialogOpen} onOpenChange={(open) => setDeactivateDialogOpen(open)}>
          <DialogTrigger asChild>
            <span />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deactivate {selectedCount} product{selectedCount > 1 ? "s" : ""}</DialogTitle>
              <DialogDescription>Are you sure you want to deactivate the selected product(s)? This will mark them inactive.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button onClick={() => confirmDeactivate()} disabled={loading} className="bg-warning hover:bg-warning/90">
                {loading ? "Deactivating..." : "Deactivate"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Update Price Dialog */}
        <Dialog open={updatePriceDialogOpen} onOpenChange={(open) => setUpdatePriceDialogOpen(open)}>
          <DialogTrigger asChild>
            <span />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Price for {selectedCount} product{selectedCount > 1 ? "s" : ""}</DialogTitle>
              <DialogDescription>Enter the new price to apply to selected products.</DialogDescription>
            </DialogHeader>
            <div className="mt-2">
              <input
                type="number"
                step="0.01"
                value={updatePriceValue}
                onChange={(e) => setUpdatePriceValue(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g. 129.50"
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button onClick={() => confirmUpdatePrice()} disabled={loading} className="bg-primary">
                {loading ? "Updating..." : "Update Price"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default BulkActionBar;
function onClear() {
    throw new Error("Function not implemented.");
}

