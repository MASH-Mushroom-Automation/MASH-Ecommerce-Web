"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, Sprout, TrendingUp } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-12 px-4 py-10 md:px-8 lg:px-16">
      {/* Hero */}
      <section className="max-w-3xl mx-auto text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">About MASH</h1>
        <p className="text-lg text-muted-foreground">
          Connecting Filipino mushroom growers with customers who value
          freshness, quality, and supporting local agriculture.
        </p>
      </section>

      {/* Mission */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Our mission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            MASH was founded in 2024 with a simple but powerful goal: to make
            premium, locally-grown mushrooms accessible to every Filipino
            household while supporting small-scale growers across the
            archipelago.
          </p>
          <p>
            We believe that fresh, sustainable food should never be hard to
            find. By building a direct connection between growers and consumers,
            we&apos;re eliminating middlemen, reducing food miles, and ensuring
            that both farmers and customers get fair value.
          </p>
          <p>
            Every purchase on MASH directly supports a local grower&apos;s
            livelihood, helps expand Philippine mushroom cultivation, and brings
            you the freshest possible harvest.
          </p>
        </CardContent>
      </Card>

      {/* Values */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <Sprout className="size-8 text-primary mb-2" />
            <CardTitle className="text-lg">Fresh & local</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Harvested and delivered within 24-48 hours, supporting local growers
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Users className="size-8 text-primary mb-2" />
            <CardTitle className="text-lg">Grower empowerment</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Fair prices and direct sales help farmers grow sustainable
            businesses
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <TrendingUp className="size-8 text-primary mb-2" />
            <CardTitle className="text-lg">Quality assurance</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Every grower is vetted and every product meets our freshness
            guarantee
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Heart className="size-8 text-primary mb-2" />
            <CardTitle className="text-lg">Community focused</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Building connections through food education, recipes, and local
            stories
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <Card className="bg-muted/50 max-w-2xl mx-auto text-center">
        <CardContent className="pt-8 pb-8 space-y-4">
          <h2 className="text-2xl font-semibold">Join the MASH community</h2>
          <p className="text-muted-foreground">
            Whether you&apos;re a home cook, professional chef, or aspiring
            grower, there&apos;s a place for you here.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button size="lg" asChild>
              <Link href="/products">Shop now</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/sell-with-us">Become a grower</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
