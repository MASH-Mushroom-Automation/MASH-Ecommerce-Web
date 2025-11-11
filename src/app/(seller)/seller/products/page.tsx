"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus, Search, Filter, MoreVertical, Edit, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSellerProducts } from "@/hooks/useSeller";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SellerApi } from "@/lib/api/seller";
import { getStatusBadge } from "@/lib/status-utils";

export default function SellerProducts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null);

  // Use the seller products hook
  const { products, loading, error, pagination, refetch } = useSellerProducts({
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

  // Filter products based on status and category
  const filteredProducts = products.filter((product) => {
    const matchesStatus =
      statusFilter === "all" ||
      product.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesCategory =
      categoryFilter === "all" ||
      product.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesStatus && matchesCategory;
  });

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
        <h1 className="text-2xl font-bold text-foreground">Products</h1>
        <Link href="/seller/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New Product
          </Button>
        </Link>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="w-40">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="out of stock">Out of Stock</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-40">
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="fresh mushroom">
                      Fresh Mushroom
                    </SelectItem>
                    <SelectItem value="growing kits">Growing Kits</SelectItem>
                    <SelectItem value="mushroom products">
                      Mushroom Products
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {/* Product details column */}
                <TableHead className="w-[300px] pl-5">Product</TableHead>
                {/* Pricing column */}
                <TableHead className="text-right w-[120px]">Price</TableHead>
                {/* Inventory column */}
                <TableHead className="text-right w-[100px]">Stock</TableHead>
                {/* Category label column */}
                <TableHead className="w-[140px]">Category</TableHead>
                {/* Status badge column */}
                <TableHead className="w-[140px]">Status</TableHead>
                {/* Row actions column */}
                <TableHead className="text-right w-[100px] pr-5">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/50">
                    {/* Product details cell */}
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-16 rounded-md overflow-hidden bg-muted relative flex-shrink-0">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="font-medium text-sm line-clamp-2">
                          {product.name}
                        </span>
                      </div>
                    </TableCell>
                    {/* Pricing cell */}
                    <TableCell className="text-right font-semibold text-sm">
                      ₱{product.price.toFixed(2)}
                    </TableCell>
                    {/* Inventory cell */}
                    <TableCell className="text-right text-sm">
                      <span className={product.stock < 10 ? "text-destructive font-medium" : ""}>
                        {product.stock}
                      </span>
                    </TableCell>
                    {/* Category cell */}
                    <TableCell className="text-sm">{product.category}</TableCell>
                    {/* Status badge cell */}
                    <TableCell>
                      {getStatusBadge(product.status)}
                    </TableCell>
                    {/* Row actions cell */}
                    <TableCell className="text-right pl-5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="min-h-[44px] min-w-[44px]"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Link
                              href={`/seller/products/edit/${product.id}`}
                              className="flex items-center w-full"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="text-destructive"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Product
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &quot;{product.name}&quot;? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteProduct(product.id)
                                  }
                                  disabled={deletingProduct === product.id}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  {deletingProduct === product.id
                                    ? "Deleting..."
                                    : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <div className="text-center">
                      <p className="text-sm">No products found</p>
                      <p className="text-xs mt-1">Try adjusting your search or filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-h-[44px] min-w-[44px] text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Product</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete &quot;{product.name}&quot;? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={deletingProduct === product.id}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            {deletingProduct === product.id ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
        </div>
      </div>
    </div>
  );
}
