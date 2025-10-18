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
import { ShoppingBag, Truck, ShieldCheck, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-12 px-4 py-10 md:px-8 lg:px-16">
      {/* Hero */}
      <section className="grid items-center gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            New season drops are here
          </Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
            Discover quality products at honest prices
          </h1>
          <p className="text-muted-foreground text-lg">
            Shop curated collections, fast delivery, and easy returns. Built
            with shadcn/ui and Next.js.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg">
              Start shopping
              <ArrowRight className="ml-1.5" />
            </Button>
            <Button size="lg" variant="outline">
              View collections
            </Button>
          </div>
          <div className="flex items-center gap-6 pt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Truck className="size-4" />
              Free shipping over $50
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4" />
              30-day returns
            </div>
          </div>
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 via-muted to-transparent" />
      </section>

      {/* Features */}
      <section className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="size-5 text-primary" />
              Wide selection
            </CardTitle>
            <CardDescription>
              Thousands of products across fashion, home, and tech.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Explore curated collections and trending picks updated weekly.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="size-5 text-primary" />
              Fast delivery
            </CardTitle>
            <CardDescription>
              Free shipping on qualifying orders and reliable tracking.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Most orders ship within 24 hours from our regional warehouses.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              Secure checkout
            </CardTitle>
            <CardDescription>
              Encrypted payments and buyer protection on every order.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Pay with your preferred method and enjoy hassle-free returns.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
