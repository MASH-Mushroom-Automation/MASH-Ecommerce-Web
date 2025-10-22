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
  TrendingUp,
  Package,
  ShoppingBag,
  DollarSign,
  Users,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// Sample data for charts and statistics
// This would be replaced with API data in production
const salesData = [
  { name: "Mon", sales: 4000 },
  { name: "Tue", sales: 3000 },
  { name: "Wed", sales: 5000 },
  { name: "Thu", sales: 2780 },
  { name: "Fri", sales: 1890 },
  { name: "Sat", sales: 6390 },
  { name: "Sun", sales: 3490 },
];

const productPerformanceData = [
  {
    name: "Fresh White Oyster Mushrooms",
    sales: 120,
    stock: 50,
    revenue: 14400,
  },
  {
    name: "Vibrant Pink Oyster Mushrooms",
    sales: 85,
    stock: 30,
    revenue: 11900,
  },
  { name: "Blue Oyster Mushrooms", sales: 65, stock: 0, revenue: 9750 },
  { name: "DIY Mushroom Growing Kit", sales: 45, stock: 15, revenue: 15750 },
];

const recentOrders = [
  {
    id: "ORD-001",
    date: "2025-10-20",
    customer: "John Doe",
    items: 3,
    total: 450,
    status: "Pending",
  },
  {
    id: "ORD-002",
    date: "2025-10-19",
    customer: "Jane Smith",
    items: 2,
    total: 280,
    status: "Processing",
  },
  {
    id: "ORD-003",
    date: "2025-10-18",
    customer: "Mike Johnson",
    items: 1,
    total: 150,
    status: "Shipped",
  },
];

export default function SellerDashboard() {
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Sales"
          value="₱42,390"
          change="+12.5%"
          trend="up"
          description="vs. last month"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatsCard
          title="Orders"
          value="153"
          change="+8.2%"
          trend="up"
          description="vs. last month"
          icon={<ShoppingBag className="h-5 w-5" />}
        />
        <StatsCard
          title="Products"
          value="24"
          change="+4"
          trend="up"
          description="new this month"
          icon={<Package className="h-5 w-5" />}
        />
        <StatsCard
          title="Customers"
          value="1,205"
          change="-2.3%"
          trend="down"
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
                <Bar dataKey="sales" fill="#6A994E" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter>
            <Link
              href="/seller/orders"
              className="text-sm text-[#1E392A] font-medium flex items-center hover:underline"
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
                  stroke="#1E392A"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter>
            <Link
              href="#"
              className="text-sm text-[#1E392A] font-medium flex items-center hover:underline"
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
              {productPerformanceData.map((product) => (
                <TableRow key={product.name}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-right">{product.sales}</TableCell>
                  <TableCell className="text-right">
                    {product.stock === 0 ? (
                      <Badge
                        variant="outline"
                        className="bg-red-100 text-red-800 hover:bg-red-100"
                      >
                        Out of Stock
                      </Badge>
                    ) : product.stock < 20 ? (
                      <Badge
                        variant="outline"
                        className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
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
                      className={
                        order.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          : order.status === "Processing"
                          ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                          : "bg-purple-100 text-purple-800 hover:bg-purple-100"
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
        <CardTitle className="text-sm font-medium text-gray-500">
          {title}
        </CardTitle>
        <div className="p-2 bg-gray-100 rounded-full">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center mt-1">
          {trend === "up" ? (
            <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
          )}
          <p
            className={`text-sm ${
              trend === "up" ? "text-green-600" : "text-red-600"
            }`}
          >
            {change}
          </p>
          <p className="text-xs text-gray-500 ml-2">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
