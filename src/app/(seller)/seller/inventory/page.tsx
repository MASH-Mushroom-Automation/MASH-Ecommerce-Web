"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventory } from "@/hooks/useInventory";
import { ProductsApi } from "@/lib/api/products";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, AlertTriangle, Bell, LineChart } from "lucide-react";

interface Product {
  id: string;
  name: string;
  stock: number;
  threshold: number;
  price: number;
  image: string;
  category: string;
  lastUpdated: string;
  status: "in_stock" | "low_stock" | "out_of_stock";
}

export default function InventoryPage() {
  const {
    loading: inventoryLoading,
    error: inventoryError,
    lowStockProducts,
    getLowStockProducts,
    updateStock,
    setStockAlert,
  } = useInventory();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(null);
  const [newStockValue, setNewStockValue] = useState<Record<string, string>>({});

  // Fetch products from API on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all products from Railway backend
        const response = await ProductsApi.getProducts({ limit: 1000 });
        
        if (response.success && response.data) {
          // Convert API products to inventory format
          const inventoryProducts: Product[] = response.data.map((product) => {
            const stock = product.stock || 0;
            const threshold = product.minStock || 10;
            
            let status: "in_stock" | "low_stock" | "out_of_stock";
            if (stock === 0) {
              status = "out_of_stock";
            } else if (stock <= threshold) {
              status = "low_stock";
            } else {
              status = "in_stock";
            }
            
            return {
              id: product.id,
              name: product.name,
              stock,
              threshold,
              price: product.price,
              image: product.image || product.images?.[0] || "/placeholder.png",
              category: product.category || "Uncategorized",
              lastUpdated: product.updatedAt || new Date().toISOString(),
              status,
            };
          });
          
          setProducts(inventoryProducts);
        } else {
          throw new Error(response.message || "Failed to fetch products");
        }
      } catch (err) {
        console.error('Failed to fetch inventory:', err);
        setError(err instanceof Error ? err.message : 'Failed to load inventory');
        toast.error('Failed to load inventory from backend');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getLowStockProducts]);

  const formatDate = (iso: string) => iso.split("T")[0];
  const formatTime = (iso: string) => iso.split("T")[1]?.slice(0, 5) ?? "--:--";

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Product["status"]) => {
    switch (status) {
      case "in_stock":
        return <Badge variant="outline" className="bg-green-100/10 text-green-700 dark:text-green-600 border-green-300">In Stock</Badge>;
      case "low_stock":
        return <Badge variant="outline" className="bg-yellow-100/10 text-yellow-700 dark:text-yellow-600 border-yellow-300">Low Stock</Badge>;
      case "out_of_stock":
        return <Badge variant="destructive">Out of Stock</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Inventory Management</h1>
        <Button>
          Set Stock Alerts
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <h3 className="text-2xl font-bold text-foreground">{products.length}</h3>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
                <h3 className="text-2xl font-bold text-yellow-700 dark:text-yellow-600">
                  {products.filter((p) => p.status === "low_stock").length}
                </h3>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-700 dark:text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                <h3 className="text-2xl font-bold text-destructive">
                  {products.filter((p) => p.status === "out_of_stock").length}
                </h3>
              </div>
              <Bell className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stock">
        <TabsList>
          <TabsTrigger value="stock">Stock Levels</TabsTrigger>
          <TabsTrigger value="alerts">Stock Alerts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <CardTitle>Current Stock</CardTitle>
                <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Search products..."
                    className="w-full sm:w-[200px]"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Product</TableHead>
                      <TableHead className="w-[120px]">Stock Level</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="w-[120px] hidden md:table-cell">Last Updated</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <Package className="h-8 w-8 mb-2" />
                            <p className="text-sm">No products found</p>
                            <p className="text-xs text-muted-foreground">
                              Try adjusting your search or filter
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-muted-foreground">{product.category}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{product.stock}</div>
                            <div className="text-xs text-muted-foreground">
                              Threshold: {product.threshold}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(product.status)}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="text-sm">{formatDate(product.lastUpdated)}</div>
                            <div className="text-xs text-muted-foreground">{formatTime(product.lastUpdated)}</div>
                          </TableCell>
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full sm:w-auto"
                                  disabled={updatingProductId === product.id}
                                >
                                  {updatingProductId === product.id ? "Updating..." : "Update Stock"}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Update Stock Level</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Enter the new stock quantity for {product.name}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="py-4">
                                  <Input
                                    type="number"
                                    placeholder="Enter new stock quantity"
                                    className="mt-2"
                                    min="0"
                                    value={newStockValue[product.id] || ""}
                                    onChange={(e) =>
                                      setNewStockValue({ ...newStockValue, [product.id]: e.target.value })
                                    }
                                  />
                                </div>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={async () => {
                                      const quantity = parseInt(newStockValue[product.id] || "0");
                                      if (isNaN(quantity) || quantity < 0) {
                                        toast.error("Please enter a valid quantity");
                                        return;
                                      }
                                      setUpdatingProductId(product.id);
                                      try {
                                        // Try API call
                                        await updateStock(quantity);
                                        // Update local state
                                        setProducts((prev) =>
                                          prev.map((p) =>
                                            p.id === product.id
                                              ? {
                                                  ...p,
                                                  stock: quantity,
                                                  status:
                                                    quantity === 0
                                                      ? "out_of_stock"
                                                      : quantity <= p.threshold
                                                      ? "low_stock"
                                                      : "in_stock",
                                                  lastUpdated: new Date().toISOString(),
                                                }
                                              : p
                                          )
                                        );
                                        toast.success("Stock updated successfully");
                                      } catch (err) {
                                        // Fallback: update local state anyway
                                        setProducts((prev) =>
                                          prev.map((p) =>
                                            p.id === product.id
                                              ? {
                                                  ...p,
                                                  stock: quantity,
                                                  status:
                                                    quantity === 0
                                                      ? "out_of_stock"
                                                      : quantity <= p.threshold
                                                      ? "low_stock"
                                                      : "in_stock",
                                                  lastUpdated: new Date().toISOString(),
                                                }
                                              : p
                                          )
                                        );
                                        toast.success("Stock updated (using local data)");
                                      } finally {
                                        setUpdatingProductId(null);
                                        setNewStockValue({ ...newStockValue, [product.id]: "" });
                                      }
                                    }}
                                  >
                                    Update Stock
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.map((product) => (
                  <Card key={product.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <div className="text-sm text-muted-foreground mt-1">
                            Alert when stock falls below {product.threshold} units
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Edit Alert
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
                <div className="text-center">
                  <LineChart className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium text-foreground">
                    Stock Analytics
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Coming soon! Track your inventory trends and get insights.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
