"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Eye, Check } from "lucide-react";

const ORDERS = [
  {
    id: "MASH-A1B2C3",
    customer: "Maria Santos",
    date: "Oct 18, 2025",
    items: 2,
    total: 460,
    status: "Preparing",
  },
  {
    id: "MASH-D4E5F6",
    customer: "Jose Cruz",
    date: "Oct 18, 2025",
    items: 1,
    total: 180,
    status: "Out for delivery",
  },
  {
    id: "MASH-G7H8I9",
    customer: "Ana Reyes",
    date: "Oct 17, 2025",
    items: 3,
    total: 640,
    status: "Delivered",
  },
  {
    id: "MASH-J0K1L2",
    customer: "Pedro Gomez",
    date: "Oct 17, 2025",
    items: 2,
    total: 360,
    status: "Delivered",
  },
];

const STATUS_OPTIONS = ["All", "Preparing", "Out for delivery", "Delivered"];

export default function SellerOrdersPage() {
  const [filter, setFilter] = useState("All");

  const filtered =
    filter === "All" ? ORDERS : ORDERS.filter((o) => o.status === filter);

  return (
    <div className="flex flex-col gap-8 px-4 py-8 md:px-8 lg:px-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Order Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage incoming orders and delivery status
          </p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">
                    {order.id}
                  </TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.items} products</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "Preparing"
                          ? "default"
                          : order.status === "Out for delivery"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ₱{order.total}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="size-4" />
                      </Button>
                      {order.status !== "Delivered" && (
                        <Button size="sm">
                          <Check className="size-4" />
                          Update
                        </Button>
                      )}
                    </div>
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
