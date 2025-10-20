"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, ChefHat } from "lucide-react";

const RECIPES = [
  {
    id: "1",
    title: "Garlic Butter Oyster Mushrooms",
    description:
      "Quick sauté with garlic, butter, and herbs. Perfect side dish or pasta topping.",
    time: "15 min",
    difficulty: "Easy",
    category: "Stir-fry",
  },
  {
    id: "2",
    title: "Creamy Mushroom Soup",
    description: "Rich, velvety soup with mixed mushrooms, cream, and thyme.",
    time: "30 min",
    difficulty: "Medium",
    category: "Soup",
  },
  {
    id: "3",
    title: "Crispy Enoki Tempura",
    description: "Light and crispy Japanese-style tempura with dipping sauce.",
    time: "20 min",
    difficulty: "Medium",
    category: "Fried",
  },
  {
    id: "4",
    title: "Grilled Portobello Steaks",
    description: "Marinated and grilled portobello caps with balsamic glaze.",
    time: "25 min",
    difficulty: "Easy",
    category: "Grilled",
  },
  {
    id: "5",
    title: "Shiitake Ramen Bowl",
    description: "Hearty ramen with tender shiitake, egg, and savory broth.",
    time: "40 min",
    difficulty: "Medium",
    category: "Soup",
  },
  {
    id: "6",
    title: "Mushroom Adobo",
    description: "Filipino classic reimagined with meaty mushrooms.",
    time: "35 min",
    difficulty: "Easy",
    category: "Filipino",
  },
];

export default function RecipesPage() {
  return (
    <div className="flex flex-col gap-8 px-4 py-10 md:px-8 lg:px-16">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Recipes & Cooking Guides</h1>
        <p className="text-muted-foreground">
          Discover delicious ways to cook with fresh mushrooms
        </p>
      </div>

      {/* Featured */}
      <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
        <CardContent className="pt-8 pb-8">
          <div className="grid gap-6 md:grid-cols-2 items-center">
            <div>
              <Badge variant="secondary" className="mb-3">
                Featured Recipe
              </Badge>
              <h2 className="text-2xl font-bold mb-2">Mushroom Sisig</h2>
              <p className="text-muted-foreground mb-4">
                A plant-based twist on the Filipino favorite using oyster
                mushrooms for that perfect crispy texture. Served sizzling with
                calamansi and chili.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="size-4" />
                  30 min
                </span>
                <span className="flex items-center gap-1">
                  <ChefHat className="size-4" />
                  Medium
                </span>
                <span className="flex items-center gap-1">
                  <Users className="size-4" />4 servings
                </span>
              </div>
              <Button>View recipe</Button>
            </div>
            <div className="h-64 rounded-lg bg-muted" />
          </div>
        </CardContent>
      </Card>

      {/* Recipe Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {RECIPES.map((recipe) => (
          <Card
            key={recipe.id}
            className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="h-48 bg-muted" />
            <CardHeader className="gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {recipe.category}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {recipe.difficulty}
                </Badge>
              </div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {recipe.title}
              </CardTitle>
              <CardDescription>{recipe.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="size-4" />
                  {recipe.time}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA */}
      <Card className="text-center bg-muted/50">
        <CardContent className="pt-8 pb-8 space-y-4">
          <ChefHat className="size-12 mx-auto text-muted-foreground" />
          <div>
            <h2 className="text-xl font-semibold mb-2">Share your recipe</h2>
            <p className="text-muted-foreground text-sm">
              Have a favorite mushroom recipe? We&apos;d love to feature it!
            </p>
          </div>
          <Button variant="outline">Submit recipe</Button>
        </CardContent>
      </Card>
    </div>
  );
}
