"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Heart } from "lucide-react";

export default function ProductDetailsPage() {
  return (
    <div className="flex flex-col gap-8 px-4 py-8 md:px-8 lg:px-16">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <Card className="overflow-hidden">
          <div className="aspect-square w-full bg-muted" />
          <CardContent className="grid grid-cols-4 gap-2 pt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-md border bg-muted"
              />
            ))}
          </CardContent>
        </Card>

        {/* Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded">
                New
              </Badge>
              <span className="text-xs text-muted-foreground">In stock</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Minimal Everyday Backpack
            </h1>
            <p className="text-muted-foreground">
              A durable, water-resistant backpack with padded laptop sleeve and
              plenty of storage for your daily essentials.
            </p>
          </div>

          <div className="text-2xl font-semibold">$79.00</div>

          <div className="flex flex-wrap items-center gap-3">
            <Select defaultValue="black">
              <SelectTrigger>
                <SelectValue placeholder="Color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="black">Black</SelectItem>
                <SelectItem value="navy">Navy</SelectItem>
                <SelectItem value="sand">Sand</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="m">
              <SelectTrigger>
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="s">S</SelectItem>
                <SelectItem value="m">M</SelectItem>
                <SelectItem value="l">L</SelectItem>
              </SelectContent>
            </Select>

            <Input type="number" min={1} defaultValue={1} className="w-24" />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button className="min-w-40">
              <ShoppingCart /> Add to cart
            </Button>
            <Button variant="outline">
              <Heart /> Save to wishlist
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
              <CardDescription>What makes this product great</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <ul className="list-inside list-disc space-y-1">
                <li>20L capacity with padded 16&quot; laptop sleeve</li>
                <li>Water-resistant recycled nylon shell</li>
                <li>Ergonomic straps and breathable back panel</li>
                <li>Internal organization and quick-access pocket</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
