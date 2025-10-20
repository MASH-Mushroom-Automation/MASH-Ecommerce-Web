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
import { Search, MapPin, Store } from "lucide-react";

type Grower = {
  id: string;
  name: string;
  location: string;
  products: number;
  specialty: string;
};

const SAMPLE: Grower[] = [
  {
    id: "1",
    name: "Manila Mushroom Farm",
    location: "Quezon City",
    products: 12,
    specialty: "Oyster",
  },
  {
    id: "2",
    name: "Baguio Fresh Fungi",
    location: "Baguio City",
    products: 8,
    specialty: "Shiitake",
  },
  {
    id: "3",
    name: "Tagaytay Organic Grow",
    location: "Tagaytay",
    products: 15,
    specialty: "Mixed",
  },
  {
    id: "4",
    name: "Laguna Mushroom Hub",
    location: "Laguna",
    products: 10,
    specialty: "Enoki",
  },
  {
    id: "5",
    name: "Cavite Fungi Farms",
    location: "Cavite",
    products: 6,
    specialty: "King Oyster",
  },
  {
    id: "6",
    name: "Rizal Specialty Mushrooms",
    location: "Rizal",
    products: 9,
    specialty: "Lion's Mane",
  },
];

export default function StoresPage() {
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("all");

  const filtered = useMemo(() => {
    return SAMPLE.filter((g) => {
      const matchesQuery = g.name.toLowerCase().includes(q.toLowerCase());
      const matchesLocation = location === "all" || g.location === location;
      return matchesQuery && matchesLocation;
    });
  }, [q, location]);

  const locations = Array.from(new Set(SAMPLE.map((g) => g.location)));

  return (
    <div className="flex flex-col gap-8 px-4 py-8 md:px-8 lg:px-16">
      <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Mushroom Growers</h1>
          <p className="text-muted-foreground text-sm">
            Discover trusted local growers and their fresh harvests.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search growers"
              className="pl-8 w-64"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((g) => (
          <Card key={g.id} className="overflow-hidden">
            <div className="h-32 w-full bg-muted flex items-center justify-center">
              <Store className="size-12 text-muted-foreground" />
            </div>
            <CardHeader className="gap-1">
              <CardTitle className="flex items-center justify-between text-base">
                {g.name}
                <Badge variant="secondary" className="rounded">
                  {g.products} products
                </Badge>
              </CardTitle>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="size-3" />
                {g.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="text-sm text-muted-foreground">
                Specialty:{" "}
                <span className="font-medium text-foreground">
                  {g.specialty}
                </span>
              </div>
              <Button className="w-full" asChild>
                <a href={`/stores/${g.id}`}>View Store</a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
