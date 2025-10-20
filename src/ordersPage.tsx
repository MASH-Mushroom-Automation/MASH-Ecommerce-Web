"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Package, Eye } from "lucide-react";

const ORDERS = [
  {
    id: "MASH-A1B2C3",
    date: "Oct 15, 2025",
    items: 3,
    total: 640,
    status: "Delivered",
  },
  {
    id: "MASH-D4E5F6",
    date: "Oct 12, 2025",
    items: 2,
    total: 460,
    status: "In Transit",
  },
  {
    id: "MASH-G7H8I9",
    date: "Oct 8, 2025",
    items: 4,
    total: 820,
    status: "Delivered",
  },
  {
    id: "MASH-J0K1L2",
    date: "Oct 3, 2025",
    items: 1,
    total: 180,
    status: "Delivered",
  },
];

const STATUS_COLORS = {
  Delivered: "secondary",
  "In Transit": "default",
  Processing: "outline",
} as const;

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-8 px-4 py-8 md:px-8 lg:px-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Order History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage your MASH orders
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
          <CardDescription>
            View details and track your mushroom deliveries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ORDERS.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">
                    {order.id}
                  </TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Package className="size-4 text-muted-foreground" />
                      {order.items} products
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        STATUS_COLORS[
                          order.status as keyof typeof STATUS_COLORS
                        ] || "outline"
                      }
                      className="rounded"
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ₱{order.total.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Eye className="size-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
