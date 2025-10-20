"use client";

import Link from "next/link";
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

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12 px-4 py-10 md:px-8 lg:px-16">
      {/* Hero */}
      <section className="grid items-center gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            Fresh from local growers
          </Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
            Premium Mushrooms Direct from Philippine Growers
          </h1>
          <p className="text-muted-foreground text-lg">
            Support local agriculture with fresh, organic mushrooms delivered to
            your door. MASH connects you with trusted growers across the
            Philippines.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/products">
                Start shopping
                <ArrowRight className="ml-1.5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/stores">View growers</Link>
            </Button>
          </div>
          <div className="flex items-center gap-6 pt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Truck className="size-4" />
              Free delivery Metro Manila
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4" />
              Freshness guarantee
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
              Fresh varieties
            </CardTitle>
            <CardDescription>
              Oyster, shiitake, enoki, and specialty mushrooms from local farms.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Browse curated selections updated daily as growers harvest fresh
            batches.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="size-5 text-primary" />
              Same-day delivery
            </CardTitle>
            <CardDescription>
              Get your mushrooms delivered fresh within Metro Manila.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Orders placed before 10 AM are delivered the same day with proper
            cold chain.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              Support local growers
            </CardTitle>
            <CardDescription>
              Every purchase directly supports Philippine mushroom farmers.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Meet the growers, learn their stories, and enjoy farm-fresh quality.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
