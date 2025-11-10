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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Sales</CardTitle>
            <CardDescription>
              Overview of your sales performance for the past week
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={salesData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`₱${value}`, "Sales"]}
                  labelFormatter={(label) => `Day: ${label}`}
                />
                <Bar dataKey="sales" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter>
            <Link
              href="/seller/orders"
              className="text-sm text-primary font-medium flex items-center hover:underline"
            >
              View all sales <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Revenue Trend</CardTitle>
            <CardDescription>
              Revenue performance over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[
                  { month: "May", revenue: 24000 },
                  { month: "Jun", revenue: 26500 },
                  { month: "Jul", revenue: 32000 },
                  { month: "Aug", revenue: 28000 },
                  { month: "Sep", revenue: 35000 },
                  { month: "Oct", revenue: 42390 },
                ]}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`₱${value}`, "Revenue"]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter>
            <Link
              href="#"
              className="text-sm text-primary font-medium flex items-center hover:underline"
            >
              View detailed reports <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>
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
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead className="text-right">Units Sold</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productPerformance.map((product) => (
                <TableRow key={product.name}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-right">{product.sales}</TableCell>
                  <TableCell className="text-right">
                    {product.stock === 0 ? (
                      <Badge
                        variant="destructive"
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
            className="text-sm text-[#1E392A] font-medium flex items-center hover:underline"
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
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell className="text-right">{order.items}</TableCell>
                  <TableCell className="text-right">
                    ₱{order.total.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "Pending"
                          ? "outline"
                          : "secondary"
                      }
                      className={
                        order.status === "Pending"
                          ? "bg-yellow-100/10 text-yellow-700 dark:text-yellow-600 border-yellow-300"
                          : order.status === "Processing"
                          ? "bg-blue-100/10 text-blue-700 dark:text-blue-600 border-blue-300"
                          : "bg-purple-100/10 text-purple-700 dark:text-purple-600 border-purple-300"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <Link
            href="/seller/orders"
            className="text-sm text-[#1E392A] font-medium flex items-center hover:underline"
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
