"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Eye } from "lucide-react";

const PRODUCTS = [
  {
    id: "1",
    name: "Fresh Oyster Mushrooms",
    price: 180,
    stock: 25,
    unit: "250g",
    status: "Active",
  },
  {
    id: "2",
    name: "Premium Shiitake",
    price: 280,
    stock: 12,
    unit: "200g",
    status: "Active",
  },
  {
    id: "3",
    name: "Mixed Variety Pack",
    price: 350,
    stock: 5,
    unit: "500g",
    status: "Low stock",
  },
  {
    id: "4",
    name: "King Oyster",
    price: 220,
    stock: 0,
    unit: "300g",
    status: "Out of stock",
  },
];

export default function SellerProductsPage() {
  return (
    <div className="flex flex-col gap-8 px-4 py-8 md:px-8 lg:px-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Product Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your inventory, pricing, and listings
          </p>
        </div>
        <Button>
          <Plus className="size-4" />
          Add product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your products</CardTitle>
          <CardDescription>
            Active listings and inventory status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PRODUCTS.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-md bg-muted" />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.unit}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    ₱{product.price}
                  </TableCell>
                  <TableCell>{product.stock} units</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.status === "Active"
                          ? "default"
                          : product.status === "Low stock"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="size-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Pencil className="size-4" />
                        Edit
                      </Button>
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
