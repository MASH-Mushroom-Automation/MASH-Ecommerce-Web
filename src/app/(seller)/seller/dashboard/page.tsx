"use client";

import React from "react";
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
  Users,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useSellerDashboard } from "@/hooks/useSeller";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getStatusBadge } from "@/lib/status-utils";

export default function SellerDashboard() {
  const { stats, salesData, productPerformance, recentOrders, loading, error } =
    useSellerDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Error: {error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Sales"
          value={`₱${stats?.totalSales.toLocaleString() || "0"}`}
          change={`+${stats?.salesGrowth || 0}%`}
          trend="up"
          description="vs. last month"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatsCard
          title="Orders"
          value={stats?.totalOrders.toString() || "0"}
          change={`+${stats?.orderGrowth || 0}%`}
          trend="up"
          description="vs. last month"
          icon={<ShoppingBag className="h-5 w-5" />}
        />
        <StatsCard
          title="Products"
          value={stats?.totalProducts.toString() || "0"}
          change="+4"
          trend="up"
          description="new this month"
          icon={<Package className="h-5 w-5" />}
        />
        <StatsCard
          title="Revenue"
          value={`₱${stats?.totalRevenue.toLocaleString() || "0"}`}
          change={`+${stats?.revenueGrowth || 0}%`}
          trend="up"
          description="vs. last month"
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartBarDefault data={salesData.map(item => ({
          month: item.name,
          desktop: item.sales
        }))} />

        <LineChartDefault data={[
          { month: "May", desktop: 24000 },
          { month: "Jun", desktop: 26500 },
          { month: "Jul", desktop: 32000 },
          { month: "Aug", desktop: 28000 },
          { month: "Sep", desktop: 35000 },
          { month: "Oct", desktop: 42390 },
        ]} />
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
                  <TableCell className="text-right">
                    ₱{product.revenue.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
                  <TableCell className="text-right">
                    ₱{order.total.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(order.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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

      {/* API Integration Comment */}
      {/* 
        API Integration Points:
        1. Fetch dashboard statistics:
           - GET /api/seller/dashboard/stats
        2. Fetch sales data for charts:
           - GET /api/seller/dashboard/sales
        3. Fetch revenue trend data:
           - GET /api/seller/dashboard/revenue
        4. Fetch top performing products:
           - GET /api/seller/dashboard/top-products
        5. Fetch recent orders:
           - GET /api/seller/dashboard/recent-orders
      */}
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
            className={`text-sm ${
              trend === "up" ? "text-green-600 dark:text-green-500" : "text-destructive"
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
