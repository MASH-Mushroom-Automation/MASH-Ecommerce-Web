/**
 * Inventory Dashboard
 *
 * Displays real-time product inventory pulled from the MASH Backend
 * via GET /api/seller/inventory → GET /seller/products (backend).
 * Requires SELLER role + valid auth-token cookie.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  Package,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Search,
  ArrowRight,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BackendProduct {
  id: string;
  name: string;
  category?: string;
  price: number;
  stock: number;
  status: string;
  image?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── Custom hook: fetch seller products from backend ─────────────────────────

function useSellerInventory(search: string, page: number, limit = 20) {
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (search) params.set("search", search);

      const res = await fetch(`/api/seller/inventory?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || json.success === false) {
        throw new Error(
          json.error?.message ?? json.message ?? "Failed to fetch inventory"
        );
      }

      setProducts(Array.isArray(json.data) ? json.data : []);
      setPagination(json.pagination ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch inventory");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, page, limit]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return { products, pagination, loading, error, refetch: fetchInventory };
}

// ─── Stock helpers ────────────────────────────────────────────────────────────

const LOW_STOCK_THRESHOLD = 10;

function getStockStatus(stock: number): "out-of-stock" | "low-stock" | "in-stock" {
  if (stock <= 0) return "out-of-stock";
  if (stock <= LOW_STOCK_THRESHOLD) return "low-stock";
  return "in-stock";
}

function StockBadge({ stock }: { stock: number }) {
  const status = getStockStatus(stock);
  if (status === "out-of-stock")
    return <Badge variant="destructive">❌ Out of Stock</Badge>;
  if (status === "low-stock")
    return (
      <Badge variant="outline" className="border-yellow-400 text-yellow-700 bg-yellow-50">
        ⚠️ Low Stock
      </Badge>
    );
  return (
    <Badge variant="outline" className="border-green-400 text-green-700 bg-green-50">
      ✅ In Stock
    </Badge>
  );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

interface SummaryCardProps {
  title: string;
  value: number | string;
  sub: string;
  icon: React.ReactNode;
  color?: string;
}

function SummaryCard({ title, value, sub, icon, color = "text-foreground" }: SummaryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function InventorySkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-5 w-full max-w-xs" />
              <Skeleton className="h-5 w-24 ml-auto" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InventoryDashboard() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { products, pagination, loading, error, refetch } = useSellerInventory(
    debouncedSearch,
    page,
    20
  );

  // Derive summary counts
  const totalProducts = pagination?.total ?? products.length;
  const inStockCount = products.filter((p) => getStockStatus(p.stock) === "in-stock").length;
  const lowStockCount = products.filter((p) => getStockStatus(p.stock) === "low-stock").length;
  const outOfStockCount = products.filter((p) => getStockStatus(p.stock) === "out-of-stock").length;

  if (loading && page === 1 && !debouncedSearch) return <InventorySkeleton />;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">📦 Inventory Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Live product stock from MASH Backend •{" "}
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500 inline-block animate-pulse" />
              Connected
            </span>
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          disabled={loading}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* ── Error ── */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Inventory</AlertTitle>
          <AlertDescription>
            {error}
            <Button
              variant="link"
              className="ml-2 p-0 h-auto text-destructive underline"
              onClick={refetch}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Products"
          value={totalProducts}
          sub="Registered listings"
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
        />
        <SummaryCard
          title="In Stock"
          value={inStockCount}
          sub="Healthy stock levels"
          icon={<TrendingUp className="h-4 w-4 text-green-500" />}
          color="text-green-600"
        />
        <SummaryCard
          title="Low Stock"
          value={lowStockCount}
          sub={`≤ ${LOW_STOCK_THRESHOLD} units remaining`}
          icon={<AlertCircle className="h-4 w-4 text-yellow-500" />}
          color="text-yellow-600"
        />
        <SummaryCard
          title="Out of Stock"
          value={outOfStockCount}
          sub="Unavailable products"
          icon={<TrendingDown className="h-4 w-4 text-red-500" />}
          color="text-red-600"
        />
      </div>

      {/* ── Low Stock Alert Banner ── */}
      {lowStockCount > 0 && (
        <Alert className="bg-yellow-50 border-yellow-300">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Low Stock Warning</AlertTitle>
          <AlertDescription className="text-yellow-700">
            {lowStockCount} {lowStockCount === 1 ? "product is" : "products are"} running low on
            stock. Restock soon to avoid interruptions.
          </AlertDescription>
        </Alert>
      )}

      {/* ── Out of Stock Alert Banner ── */}
      {outOfStockCount > 0 && (
        <Alert variant="destructive" className="bg-red-50 border-red-300">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Out of Stock</AlertTitle>
          <AlertDescription className="text-red-700">
            {outOfStockCount} {outOfStockCount === 1 ? "product is" : "products are"} out of stock
            and unavailable to buyers.
          </AlertDescription>
        </Alert>
      )}

      {/* ── Product Inventory Table ── */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle>Product Inventory</CardTitle>
              <CardDescription>
                Real stock levels from MASH Backend{" "}
                {pagination && (
                  <span className="text-xs text-muted-foreground">
                    • {pagination.total} total product{pagination.total !== 1 ? "s" : ""}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-5 w-full max-w-xs" />
                  <Skeleton className="h-5 w-24 ml-auto" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {debouncedSearch ? "No products match your search" : "No Products Found"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {debouncedSearch
                  ? "Try a different search term."
                  : "Add your first product to start tracking inventory."}
              </p>
              <Link href="/seller/products">
                <Button>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Manage Products
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-foreground">Product</TableHead>
                    <TableHead className="text-foreground">Category</TableHead>
                    <TableHead className="text-right text-foreground">Price</TableHead>
                    <TableHead className="text-right text-foreground">Stock</TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                    <TableHead className="text-foreground">Stock Status</TableHead>
                    <TableHead className="text-right text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const stockStatus = getStockStatus(product.stock);
                    return (
                      <TableRow
                        key={product.id}
                        className={`hover:bg-muted/50 transition-colors ${stockStatus === "out-of-stock"
                            ? "bg-red-50/40"
                            : stockStatus === "low-stock"
                              ? "bg-yellow-50/40"
                              : ""
                          }`}
                      >
                        <TableCell className="font-medium max-w-[220px]">
                          <span className="line-clamp-2">{product.name}</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {product.category ?? "—"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₱{product.price.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`font-bold ${stockStatus === "out-of-stock"
                                ? "text-red-600"
                                : stockStatus === "low-stock"
                                  ? "text-yellow-600"
                                  : "text-green-700"
                              }`}
                          >
                            {product.stock}
                          </span>
                          <span className="text-muted-foreground text-xs ml-1">units</span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={product.status === "Active" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {product.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StockBadge stock={product.stock} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/seller/products/${product.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 text-xs">
                              Edit
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>

        {/* ── Pagination ── */}
        {pagination && pagination.totalPages > 1 && (
          <CardFooter className="flex items-center justify-between border-t pt-4">
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages} • {pagination.total} product
              {pagination.total !== 1 ? "s" : ""}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages || loading}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* ── Quick Links ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-primary" />
              Manage Products
            </CardTitle>
            <CardDescription>Add, edit, or remove your product listings</CardDescription>
          </CardHeader>
          <CardFooter className="pt-0">
            <Link href="/seller/products" className="text-sm text-primary font-medium flex items-center hover:underline">
              Go to Products <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Stock Management
            </CardTitle>
            <CardDescription>Adjust quantities and restock alerts</CardDescription>
          </CardHeader>
          <CardFooter className="pt-0">
            <Link href="/seller/stock-management" className="text-sm text-primary font-medium flex items-center hover:underline">
              Manage Stock <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
