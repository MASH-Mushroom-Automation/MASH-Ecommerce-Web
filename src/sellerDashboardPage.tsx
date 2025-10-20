"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Package,
  DollarSign,
  Users,
  AlertCircle,
} from "lucide-react";

const STATS = [
  {
    label: "Total revenue",
    value: "₱24,580",
    change: "+12.5%",
    icon: DollarSign,
  },
  { label: "Orders this week", value: "47", change: "+8", icon: Package },
  { label: "Active products", value: "12", change: "—", icon: Package },
  { label: "Customers", value: "156", change: "+23", icon: Users },
];

const RECENT_ORDERS = [
  {
    id: "MASH-A1B2",
    customer: "Maria Santos",
    items: 2,
    total: 460,
    status: "Preparing",
  },
  {
    id: "MASH-C3D4",
    customer: "Jose Cruz",
    items: 1,
    total: 180,
    status: "Out for delivery",
  },
  {
    id: "MASH-E5F6",
    customer: "Ana Reyes",
    items: 3,
    total: 640,
    status: "Preparing",
  },
];

const ALERTS = [
  { type: "warning", message: "3 products running low on stock" },
  { type: "info", message: "2 new reviews pending response" },
];

export default function SellerDashboardPage() {
  return (
    <div className="flex flex-col gap-8 px-4 py-8 md:px-8 lg:px-16">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back, Manila Mushroom Farm
        </p>
      </div>

      {/* Alerts */}
      {ALERTS.map((alert, i) => (
        <Card
          key={i}
          className={
            alert.type === "warning"
              ? "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20"
              : "border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20"
          }
        >
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle
              className={`size-5 ${
                alert.type === "warning" ? "text-amber-600" : "text-blue-600"
              }`}
            />
            <p className="text-sm">{alert.message}</p>
          </CardContent>
        </Card>
      ))}

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-sm font-medium">
                  {stat.label}
                </CardDescription>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>Orders awaiting your action</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {RECENT_ORDERS.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{order.customer}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {order.id}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        order.status === "Preparing" ? "default" : "secondary"
                      }
                    >
                      {order.status}
                    </Badge>
                    <p className="font-semibold text-sm">₱{order.total}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sales Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-4" />
              Sales trend
            </CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Chart visualization
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
