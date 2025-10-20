"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const COOKING_STYLES = [
  { id: "stir-fry", name: "Stir-fry & Sautéed", icon: "🍳" },
  { id: "soups", name: "Soups & Stews", icon: "🍲" },
  { id: "grilled", name: "Grilled & Roasted", icon: "🔥" },
  { id: "raw", name: "Raw & Salads", icon: "🥗" },
  { id: "baked", name: "Baked & Casseroles", icon: "🍕" },
];

const MUSHROOM_TYPES = [
  { id: "oyster", name: "Oyster" },
  { id: "shiitake", name: "Shiitake" },
  { id: "enoki", name: "Enoki" },
  { id: "button", name: "Button" },
  { id: "portobello", name: "Portobello" },
  { id: "lions-mane", name: "Lion's Mane" },
];

export default function PreferencesPage() {
  const [selectedStyles, setSelectedStyles] = useState<string[]>([
    "stir-fry",
    "soups",
  ]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    "oyster",
    "shiitake",
  ]);

  const toggleStyle = (id: string) => {
    setSelectedStyles((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleType = (id: string) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col gap-8 px-4 py-8 md:px-8 lg:px-16 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold">My Preferences</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Help us personalize your MASH experience
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cooking style</CardTitle>
          <CardDescription>
            Select your favorite ways to cook mushrooms. We&apos;ll show you
            relevant recipes and recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {COOKING_STYLES.map((style) => (
              <Card
                key={style.id}
                className={`cursor-pointer transition-all ${
                  selectedStyles.includes(style.id) ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => toggleStyle(style.id)}
              >
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="text-2xl">{style.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{style.name}</p>
                  </div>
                  {selectedStyles.includes(style.id) && (
                    <Check className="size-5 text-primary" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Favorite mushrooms</CardTitle>
          <CardDescription>
            Tell us which mushrooms you love so we can notify you about fresh
            harvests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {MUSHROOM_TYPES.map((type) => (
              <Badge
                key={type.id}
                variant={
                  selectedTypes.includes(type.id) ? "default" : "outline"
                }
                className="cursor-pointer px-4 py-2 text-sm"
                onClick={() => toggleType(type.id)}
              >
                {selectedTypes.includes(type.id) && (
                  <Check className="size-3 mr-1" />
                )}
                {type.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Reset</Button>
        <Button>Save preferences</Button>
      </div>
    </div>
  );
}
