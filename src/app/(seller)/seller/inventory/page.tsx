"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventory } from "@/hooks/useInventory";
import { toast } from "sonner";
import { getStatusBadge } from "@/lib/status-utils";
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

// Mock fallback data
const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Fresh White Oyster Mushrooms",
    stock: 5,
    threshold: 10,
    price: 120,
    image: "/placeholder.png",
    category: "Fresh Mushrooms",
    lastUpdated: "2024-10-01T08:30:00Z",
    status: "low_stock",
  },
  {
    id: "2",
    name: "Dried Shiitake Mushrooms",
    stock: 0,
    threshold: 15,
    price: 180,
    image: "/placeholder.png",
    category: "Dried Mushrooms",
    lastUpdated: "2024-09-15T14:45:00Z",
    status: "out_of_stock",
  },
  {
    id: "3",
    name: "White Oyster Mushroom Growing Kit",
    stock: 25,
    threshold: 10,
    price: 350,
    image: "/placeholder.png",
    category: "Growing Kits",
    lastUpdated: "2024-08-20T10:15:00Z",
    status: "in_stock",
  },
  {
    id: "4",
    name: "Pink Oyster Mushrooms",
    stock: 15,
    threshold: 10,
    price: 140,
    image: "/placeholder.png",
    category: "Fresh Mushrooms",
    lastUpdated: "2024-10-05T09:00:00Z",
    status: "in_stock",
  },
];

export default function InventoryPage() {
  const {
    loading,
    error,
    lowStockProducts,
    getLowStockProducts,
    updateStock,
    setStockAlert,
  } = useInventory();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(null);
  const [newStockValue, setNewStockValue] = useState<Record<string, string>>({});
  const [isStockAlertModalOpen, setIsStockAlertModalOpen] = useState(false);
  const [editingAlertProductId, setEditingAlertProductId] = useState<string | null>(null);
  const [alertThresholds, setAlertThresholds] = useState<Record<string, string>>({});

  // Fetch products on mount - with fallback to mock data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Attempt to fetch from API
        const lowStock = await getLowStockProducts();
        // TODO: Convert lowStock to Product[] format when API is ready
        // For now, use mock data
      } catch (err) {
        console.warn('Using mock inventory data:', err);
        // Fallback already set with MOCK_PRODUCTS
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


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Inventory Management</h1>
        <Button onClick={() => setIsStockAlertModalOpen(true)}>
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
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setEditingAlertProductId(product.id);
                                setAlertThresholds({ ...alertThresholds, [product.id]: product.threshold.toString() });
                              }}
                            >
                              Edit Alert
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Edit Stock Alert</AlertDialogTitle>
                              <AlertDialogDescription>
                                Set the threshold for {product.name}. You'll be notified when stock falls below this number.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="py-4">
                              <Input
                                type="number"
                                placeholder="Enter threshold"
                                min="1"
                                value={alertThresholds[product.id] || product.threshold}
                                onChange={(e) =>
                                  setAlertThresholds({ ...alertThresholds, [product.id]: e.target.value })
                                }
                              />
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setEditingAlertProductId(null)}>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  const threshold = parseInt(alertThresholds[product.id] || "10");
                                  if (isNaN(threshold) || threshold < 1) {
                                    toast.error("Please enter a valid threshold");
                                    return;
                                  }
                                  setProducts((prev) =>
                                    prev.map((p) =>
                                      p.id === product.id
                                        ? { ...p, threshold }
                                        : p
                                    )
                                  );
                                  toast.success("Alert threshold updated successfully");
                                  setEditingAlertProductId(null);
                                }}
                              >
                                Save Alert
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Set Stock Alerts Modal */}
      <AlertDialog open={isStockAlertModalOpen} onOpenChange={setIsStockAlertModalOpen}>
        <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Set Stock Alerts</AlertDialogTitle>
            <AlertDialogDescription>
              Configure stock alert thresholds for your products. You'll be notified when stock levels fall below these values.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-between gap-4 p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">Current: {product.stock} units</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Threshold"
                    className="w-24"
                    min="1"
                    value={alertThresholds[product.id] || product.threshold}
                    onChange={(e) =>
                      setAlertThresholds({ ...alertThresholds, [product.id]: e.target.value })
                    }
                  />
                  <span className="text-sm text-muted-foreground">units</span>
                </div>
              </div>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                // Update all thresholds
                setProducts((prev) =>
                  prev.map((p) => ({
                    ...p,
                    threshold: parseInt(alertThresholds[p.id] || p.threshold.toString()),
                  }))
                );
                toast.success("Stock alerts updated successfully");
                setIsStockAlertModalOpen(false);
              }}
            >
              Save All Alerts
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
