"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ShoppingCart, Search } from "lucide-react";

type Product = {
  id: string;
  title: string;
  price: number;
  tag?: string;
};

const SAMPLE: Product[] = [
  { id: "1", title: "Classic Tote Bag", price: 39, tag: "New" },
  { id: "2", title: "Wireless Headphones", price: 89 },
  { id: "3", title: "Ceramic Mug", price: 16, tag: "Hot" },
  { id: "4", title: "Minimal Watch", price: 129 },
  { id: "5", title: "Cotton Tee", price: 22, tag: "Sale" },
  { id: "6", title: "Desk Lamp", price: 45 },
];

export default function ProductCatalogPage() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("featured");

  const filtered = useMemo(() => {
    const res = SAMPLE.filter((p) =>
      p.title.toLowerCase().includes(q.toLowerCase())
    );
    if (sort === "price-asc") res.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") res.sort((a, b) => b.price - a.price);
    return res;
  }, [q, sort]);

  return (
    <div className="flex flex-col gap-8 px-4 py-8 md:px-8 lg:px-16">
      <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">All products</h1>
          <p className="text-muted-foreground text-sm">
            Browse our latest arrivals and best-sellers.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products"
              className="pl-8 w-64"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <Card key={p.id} className="overflow-hidden">
            <div className="h-40 w-full bg-muted" />
            <CardHeader className="gap-1">
              <CardTitle className="flex items-center justify-between text-base">
                {p.title}
                {p.tag ? (
                  <Badge variant="secondary" className="rounded">
                    {p.tag}
                  </Badge>
                ) : null}
              </CardTitle>
              <CardDescription>${p.price.toFixed(2)}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2">
                <Button className="w-full">
                  <ShoppingCart /> Add to cart
                </Button>
                <Button variant="outline" className="w-full">
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
