"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChartBarDefault } from "@/components/ui/Bar-Chart";
import { LineChartDefault } from "@/components/ui/Line-chart";
import {
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useSellerDashboard } from "@/hooks/useSeller";
import { Skeleton } from "@/components/ui/skeleton";

export default function SellerDashboard() {
  // Pull-to-refresh state
  const [pullStartY, setPullStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use seller dashboard hook only (no admin endpoints)
  const {
    stats,
    salesData,
    productPerformance,
    recentOrders,
    loading,
    error: sellerError,
    refetch: sellerRefetch,
  } = useSellerDashboard();

  const error = !!sellerError;

  // Calculate pending orders count from seller data
  const pendingOrdersCount =
    recentOrders?.filter((o) => o.status === "PENDING").length || 0;

  const handleRefresh = () => {
    sellerRefetch?.();
  };

  // Pull-to-refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only trigger if scrolled to top
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      setPullStartY(e.touches[0].clientY);
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || pullStartY === 0) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - pullStartY;

    // Only pull down, max 150px
    if (distance > 0 && distance <= 150) {
      setPullDistance(distance);
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 80 && !isRefreshing) {
      setIsRefreshing(true);
      await sellerRefetch?.();
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }

    setPullDistance(0);
    setPullStartY(0);
    setIsPulling(false);
  };

  // Reset pull state when loading changes
  useEffect(() => {
    if (!loading) {
      setIsRefreshing(false);
    }
  }, [loading]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">
          Error: {sellerError || "Failed to load dashboard"}
        </p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }


  return (
    <div
      ref={containerRef}
      className="relative overflow-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {(isPulling || isRefreshing) && (
        <div
          className="fixed top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 z-50 bg-background/80 backdrop-blur-sm"
          style={{
            height: `${Math.min(pullDistance, 80)}px`,
            opacity: pullDistance > 40 ? 1 : pullDistance / 40,
          }}
        >
          <div className="flex flex-col items-center gap-1">
            <RefreshCw
              className={`h-5 w-5 text-primary ${isRefreshing || pullDistance > 80 ? "animate-spin" : ""
                }`}
              style={{
                transform: isRefreshing
                  ? "rotate(0deg)"
                  : `rotate(${pullDistance * 3}deg)`,
              }}
            />
            <span className="text-xs text-muted-foreground">
              {isRefreshing
                ? "Refreshing..."
                : pullDistance > 80
                  ? "Release to refresh"
                  : "Pull to refresh"}
            </span>
          </div>
        </div>
      )}

      <div
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
        style={{
          marginTop: isPulling ? `${Math.min(pullDistance, 80)}px` : "0",
        }}
      >
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleString()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Pending Orders Alert */}
      {pendingOrdersCount > 0 ? (
        <Card className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
              <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                Pending Orders Require Attention
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                You have {pendingOrdersCount} pending{" "}
                {pendingOrdersCount === 1 ? "order" : "orders"} awaiting
                confirmation. Review and process them to keep your customers
                satisfied.
              </p>
            </div>
            <Link href="/seller/orders?status=PENDING">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                View Orders
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6 border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <AlertCircle className="h-6 w-6 text-green-600 dark:text-green-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 dark:text-green-100">
                All orders are up to date!
              </h3>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Sales"
          value={stats ? `₱${stats.totalSales.toLocaleString()}` : "₱0"}
          change={stats ? `+${stats.salesGrowth}%` : "+0%"}
          trend={(stats?.salesGrowth ?? 0) >= 0 ? "up" : "down"}
          description="vs. last month"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatsCard
          title="Orders"
          value={stats?.totalOrders.toString() || "0"}
          change={stats ? `+${stats.orderGrowth}%` : "+0%"}
          trend={(stats?.orderGrowth ?? 0) >= 0 ? "up" : "down"}
          description="vs. last month"
          icon={<ShoppingBag className="h-5 w-5" />}
        />
        <StatsCard
          title="Products"
          value={stats?.totalProducts.toString() || "0"}
          change="+0"
          trend="up"
          description="active listings"
          icon={<Package className="h-5 w-5" />}
        />
        <StatsCard
          title="Revenue"
          value={stats ? `₱${stats.totalRevenue.toLocaleString()}` : "₱0"}
          change={stats ? `+${stats.revenueGrowth}%` : "+0%"}
          trend={(stats?.revenueGrowth ?? 0) >= 0 ? "up" : "down"}
          description="vs. last month"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartBarDefault
          data={salesData.map((item) => ({
            month: item.name,
            desktop: item.sales,
          }))}
        />

        <LineChartDefault
          data={salesData.map((item) => ({
            month: item.name,
            desktop: item.revenue,
          }))}
        />
      </div>

      {/* Product Performance */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Top Performing Products</CardTitle>
          <CardDescription>
            Products with the highest sales and revenue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!productPerformance || productPerformance.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No products found</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-foreground">Product Name</TableHead>
                  <TableHead className="text-right text-foreground">Units Sold</TableHead>
                  <TableHead className="text-right text-foreground">Stock</TableHead>
                  <TableHead className="text-right text-foreground">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productPerformance.map((product) => (
                  <TableRow key={product.name} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-right">{product.sales}</TableCell>
                    <TableCell className="text-right">
                      {product.stock === 0 ? (
                        <Badge
                          variant="destructive"
                          className="bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20"
                        >
                          Out of Stock
                        </Badge>
                      ) : product.stock < 20 ? (
                        <Badge
                          variant="outline"
                          className="bg-yellow-100/10 text-yellow-700 dark:text-yellow-600 hover:bg-yellow-100/10 border-yellow-300"
                        >
                          Low: {product.stock}
                        </Badge>
                      ) : (
                        product.stock
                      )}
                    </TableCell>
                    <TableCell className="text-right">₱{product.revenue.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter>
          <Link
            href="/seller/products"
            className="text-sm text-primary font-medium flex items-center hover:underline"
          >
            Manage products <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </CardFooter>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Orders</CardTitle>
          <CardDescription>
            Latest customer orders requiring your attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!recentOrders || recentOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No orders found</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-foreground">Order ID</TableHead>
                  <TableHead className="text-foreground">Date</TableHead>
                  <TableHead className="text-foreground">Customer</TableHead>
                  <TableHead className="text-right text-foreground">Items</TableHead>
                  <TableHead className="text-right text-foreground">Total</TableHead>
                  <TableHead className="text-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell className="text-right">{order.items}</TableCell>
                    <TableCell className="text-right">₱{order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={order.status === "DELIVERED" ? "default" : order.status === "CANCELLED" ? "destructive" : "outline"}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter>
          <Link
            href="/seller/orders"
            className="text-sm text-primary font-medium flex items-center hover:underline"
          >
            View all orders <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  description: string;
  icon: React.ReactNode;
}

function StatsCard({
  title,
  value,
  change,
  trend,
  description,
  icon,
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="p-2 bg-muted rounded-full">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center mt-1">
          {trend === "up" ? (
            <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-500 mr-1" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-destructive mr-1" />
          )}
          <p
            className={`text-sm ${trend === "up"
              ? "text-green-600 dark:text-green-500"
              : "text-destructive"
              }`}
          >
            {change}
          </p>
          <p className="text-xs text-muted-foreground ml-2">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Dashboard Skeleton Component
function DashboardSkeleton() {
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Alert Skeleton */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-4 w-full max-w-2xl" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Product Performance Skeleton */}
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-56 mb-2" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-full max-w-xs" />
                <Skeleton className="h-10 w-20 ml-auto" />
                <Skeleton className="h-10 w-16" />
                <Skeleton className="h-10 w-28" />
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-4 w-32" />
        </CardFooter>
      </Card>

      {/* Recent Orders Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-16 ml-auto" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-4 w-32" />
        </CardFooter>
      </Card>
    </div>
  );
}
