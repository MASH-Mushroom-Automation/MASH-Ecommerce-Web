"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import TanStackTable from "@/components/table/TanStackTable";
import BulkActionBar from "@/components/BulkActionBar";
import { useBulkSelect } from "@/hooks/useBulkSelect";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus, Search, Filter, Edit, Trash } from "lucide-react";
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
import { useSellerProducts } from "@/hooks/useSeller";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SellerApi } from "@/lib/api/seller";
import { getStatusBadge } from "@/lib/status-utils";

export default function SellerProducts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Use the seller products hook
  const { products, loading, error, pagination, refetch } = useSellerProducts({
    page,
    limit,
    search: searchTerm || undefined,
  });

  // Handle product deletion
  const handleDeleteProduct = async (productId: string) => {
    setDeletingProduct(productId);
    try {
      await SellerApi.deleteProduct(productId);

      // Refresh the products list
      refetch();
    } catch (error) {
      console.error("Failed to delete product:", error);
      // You could show a toast notification here
    } finally {
      setDeletingProduct(null);
    }
  };

  // Filter products based on status and category (support multiple categories)
  const filteredProducts = products.filter((product) => {
    const matchesStatus =
      statusFilter === "all" ||
      product.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesCategory =
      categoryFilter.length === 0 ||
      categoryFilter.map((c) => c.toLowerCase()).includes(product.category.toLowerCase());

    return matchesStatus && matchesCategory;
  });

  // Map for quick lookup
  const productsMap = useMemo(() => {
    const map: Record<string, any> = {};
    products.forEach((p) => (map[String(p.id)] = p));
    return map;
  }, [products]);

  // Dynamic lists for filters
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(String(p.category));
    });
    return Array.from(set).sort();
  }, [products]);

  const statuses = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.status) set.add(String(p.status));
    });
    return Array.from(set).sort();
  }, [products]);

  const bulk = useBulkSelect<string | number>([]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Error: {error}</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1 sm:text-base text-sm">
            Create, Update, and Organize Products
          </p>
        </div>
        <Link href="/seller/products/new">
          <Button>
            <Plus className="h-4 w-4" /> Add New Product
          </Button>
        </Link>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="p-2 sm:p-4 border-b border-border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" /> Filters
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel className="text-muted-foreground">Status</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={statusFilter} onValueChange={(v: string) => setStatusFilter(v)}>
                    <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                    {statuses.map((s) => (
                      <DropdownMenuRadioItem key={s} value={s}>{s}</DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-muted-foreground">Categories</DropdownMenuLabel>
                  {categories.map((cat) => (
                    <DropdownMenuCheckboxItem
                      key={cat}
                      checked={categoryFilter.includes(cat)}
                      onCheckedChange={() => {
                        setCategoryFilter((prev) => (prev.includes(cat) ? prev.filter((p) => p !== cat) : [...prev, cat]));
                      }}
                    >
                      {cat}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <div className="mb-3">
            <BulkActionBar
              selectedIds={bulk.selectedIds}
              productsMap={productsMap}
              onActivate={async (ids) => {
                const success: string[] = [];
                const failed: string[] = [];
                for (const id of ids) {
                  try {
                    await SellerApi.updateProduct(String(id), { status: "Active" });
                    success.push(String(id));
                  } catch (e) {
                    failed.push(String(id));
                  }
                }
                // Refresh
                refetch();
                bulk.clearAll();
                return { success, failed };
              }}
              onDeactivate={async (ids) => {
                const success: string[] = [];
                const failed: string[] = [];
                for (const id of ids) {
                  try {
                    await SellerApi.updateProduct(String(id), { status: "Inactive" });
                    success.push(String(id));
                  } catch (e) {
                    failed.push(String(id));
                  }
                }
                refetch();
                bulk.clearAll();
                return { success, failed };
              }}
              onDelete={async (ids) => {
                const success: string[] = [];
                const failed: string[] = [];
                for (const id of ids) {
                  try {
                    await SellerApi.deleteProduct(String(id));
                    success.push(String(id));
                  } catch (e) {
                    failed.push(String(id));
                  }
                }
                refetch();
                bulk.clearAll();
                return { success, failed };
              }}
              onUpdatePrice={async (ids, price) => {
                const success: string[] = [];
                const failed: string[] = [];
                for (const id of ids) {
                  try {
                    await SellerApi.updateProduct(String(id), { price });
                    success.push(String(id));
                  } catch (e) {
                    failed.push(String(id));
                  }
                }
                refetch();
                bulk.clearAll();
                return { success, failed };
              }}
              onExport={(rows) => {
                // export handled inside BulkActionBar via exportToCsv
              }}
              handlers={{ onComplete: () => {} }}
              onClear={() => bulk.clearAll()}
            />
          </div>

          <TanStackTable
            data={filteredProducts}
            rowKey="id"
            columns={[
              {
                accessorKey: "name",
                header: "Product",
                enableSorting: true,
                cell: ({ row }) => {
                  const product = row.original as any;
                  return (
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-md overflow-hidden bg-muted relative flex-shrink-0">
                        <Image src={product.image} alt={product.name} fill className="object-cover" />
                      </div>
                      <div>
                        <div className="font-medium text-sm line-clamp-2">{product.name}</div>
                        <div className="text-xs text-muted-foreground">{product.category}</div>
                      </div>
                    </div>
                  );
                },
              },
              {
                accessorKey: "price",
                header: "Price",
                enableSorting: true,
                cell: ({ getValue }) => <div className="items-center">₱{Number(getValue()).toFixed(2)}</div>,
              },
              {
                accessorKey: "stock",
                header: "Stock",
                enableSorting: true,
                cell: ({ getValue }) => <div className="items-center">{getValue()}</div>,
              },
              {
                accessorKey: "category",
                header: "Category",
                enableSorting: true,
              },
              {
                accessorKey: "status",
                header: "Status",
                enableSorting: true,
                cell: ({ getValue }) => getStatusBadge(String(getValue())),
              },
              {
                id: "actions",
                header: "Actions",
                enableSorting: false,
                cell: ({ row }) => {
                  const p = row.original as any;
                  return (
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/seller/products/edit/${p.id}`}>
                        <Button variant="ghost" size="sm" className="h-9 px-3">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-9 px-3 text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Product</DialogTitle>
                            <DialogDescription>Are you sure you want to delete "{p.name}"? This action cannot be undone.</DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="ghost">Cancel</Button>
                            </DialogClose>
                            <DialogClose asChild>
                              <Button onClick={() => handleDeleteProduct(p.id)} disabled={deletingProduct === p.id} className="bg-destructive hover:bg-destructive/90">
                                {deletingProduct === p.id ? "Deleting..." : "Delete"}
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  );
                },
              },
            ]}
            selectedIds={bulk.selectedIds}
            onToggleRow={(id) => bulk.toggleRow(id)}
            onSelectAll={(ids) => bulk.selectAll(ids)}
          />
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
          {filteredProducts.length > 0 ? (
            <div className="divide-y divide-border">
              {filteredProducts.map((product) => (
                <div key={product.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex gap-4 mb-3">
                    <div className="h-20 w-20 rounded-md overflow-hidden bg-muted relative flex-shrink-0">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-foreground mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
                      <Badge
                        variant={
                          product.status === "Active"
                            ? "outline"
                            : product.status === "Out of Stock"
                            ? "destructive"
                            : "secondary"
                        }
                        className={
                          product.status === "Active"
                            ? "bg-green-100/10 text-green-700 dark:text-green-600 border-green-300"
                            : product.status === "Out of Stock"
                            ? ""
                            : ""
                        }
                      >
                        {product.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Price</span>
                      <span className="font-semibold text-primary">₱{product.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Stock</span>
                      <span className={`font-medium ${product.stock < 10 ? "text-destructive" : ""}`}>
                        {product.stock} units
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 min-h-[44px]"
                      asChild
                    >
                      <Link href={`/seller/products/edit/${product.id}`} className="flex items-center justify-center gap-2">
                        <Edit className="h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-h-[44px] min-w-[44px] text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Product</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete &quot;{product.name}&quot;? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="ghost">Cancel</Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button
                              onClick={() => handleDeleteProduct(product.id)}
                              disabled={deletingProduct === product.id}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              {deletingProduct === product.id ? "Deleting..." : "Delete"}
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-sm">No products found</p>
              <p className="text-xs mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        <div className="py-4 border-t border-border">
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4">
              <div className="text-sm text-muted-foreground">Showing page {pagination.page} of {pagination.totalPages}</div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" disabled={pagination.page <= 1} onClick={() => setPage(Math.max(1, pagination.page - 1))}>
                  Previous
                </Button>

                {Array.from({ length: pagination.totalPages }).map((_, i) => {
                  const p = i + 1;
                  return (
                    <Button key={p} size="sm" variant={p === pagination.page ? "default" : "ghost"} onClick={() => setPage(p)}>
                      {p}
                    </Button>
                  );
                })}

                <Button size="sm" variant="ghost" disabled={pagination.page >= pagination.totalPages} onClick={() => setPage(Math.min(pagination.totalPages, pagination.page + 1))}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
