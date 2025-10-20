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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Package, Star } from "lucide-react";

const PRODUCTS = [
  { id: "1", name: "Fresh Oyster Mushrooms", price: 180, unit: "250g" },
  { id: "2", name: "Premium Shiitake", price: 280, unit: "200g" },
  { id: "3", name: "Mixed Variety Pack", price: 350, unit: "500g" },
];

export default function StoreDetailPage() {
  return (
    <div className="flex flex-col gap-8 px-4 py-8 md:px-8 lg:px-16">
      {/* Grower Header */}
      <Card>
        <CardHeader className="flex-row items-start gap-4">
          <Avatar className="size-20">
            <AvatarFallback className="text-lg">MM</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Manila Mushroom Farm</CardTitle>
              <Badge variant="secondary" className="rounded">
                Verified Grower
              </Badge>
            </div>
            <CardDescription className="flex items-center gap-1">
              <MapPin className="size-3" />
              Quezon City, Metro Manila
            </CardDescription>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="size-4 fill-primary text-primary" />
                4.9 (127 reviews)
              </span>
              <span className="flex items-center gap-1">
                <Package className="size-4" />
                12 active products
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">About our farm</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Family-owned since 2018, we specialize in cultivating premium
              oyster mushrooms using sustainable practices. Our
              climate-controlled facilities ensure year-round fresh harvests.
              We&apos;re committed to providing Metro Manila with the freshest,
              highest-quality mushrooms while supporting local food security.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium mb-1">Specialty</h4>
              <p className="text-sm text-muted-foreground">
                Oyster Mushrooms, Mixed Varieties
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Delivery areas</h4>
              <p className="text-sm text-muted-foreground">
                Metro Manila, same-day available
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Available Products</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p) => (
            <Card key={p.id}>
              <div className="h-40 w-full bg-muted" />
              <CardHeader className="gap-1">
                <CardTitle className="text-base">{p.name}</CardTitle>
                <CardDescription>
                  ₱{p.price} per {p.unit}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button className="w-full">Add to cart</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
