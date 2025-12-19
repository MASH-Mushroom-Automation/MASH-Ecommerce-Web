"use client";

import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCategories } from "@/lib/sanity/products";

interface Category {
  _id: string;
  name: string;
  slug: { current: string };
  subcategories?: Category[];
}

interface CategorySelectorProps {
  value: string;
  onChange: (categoryId: string) => void;
  error?: string;
}

export function CategorySelector({
  value,
  onChange,
  error,
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>Category *</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="category">Category *</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          id="category"
          className={error ? "border-destructive" : ""}
        >
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <React.Fragment key={category._id}>
              <SelectItem value={category._id}>{category.name}</SelectItem>
              {category.subcategories?.map((sub) => (
                <SelectItem key={sub._id} value={sub._id} className="pl-6">
                  └ {sub.name}
                </SelectItem>
              ))}
            </React.Fragment>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
