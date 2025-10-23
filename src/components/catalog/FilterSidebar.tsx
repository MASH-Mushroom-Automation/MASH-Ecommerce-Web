"use client";

import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FilterSidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
}

export function FilterSidebar({ onClose, isMobile = false }: FilterSidebarProps) {
  const [priceRange, setPriceRange] = useState([0, 1000]);

  const categories = [
    { id: "fresh", label: "Fresh Mushroom" },
    { id: "dried", label: "Dried Mushroom" },
    { id: "products", label: "Mushroom Products" },
  ];

  const growers = [
    { id: "fungi-farm", label: "Fungi Fresh Farm" },
    { id: "mushroom-patch", label: "The Mushroom Patch Build..." },
    { id: "kapamilya", label: "Kapamilya ni Ama Nana" },
    { id: "shroomantics", label: "Shroomantics" },
  ];

  return (
    <div className={`bg-white ${isMobile ? 'h-full overflow-y-auto' : 'rounded-lg shadow-sm'} p-6`}>
      {isMobile && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Filters</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Categories */}
      <div className="mb-8">
        <h3 className="font-bold text-gray-900 mb-4 text-base">Categories</h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-3">
              <Checkbox id={category.id} />
              <Label
                htmlFor={category.id}
                className="text-sm text-gray-700 cursor-pointer font-normal"
              >
                {category.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Growers */}
      <div className="mb-8">
        <h3 className="font-bold text-gray-900 mb-4 text-base">Grower</h3>
        <div className="space-y-3">
          {growers.map((grower) => (
            <div key={grower.id} className="flex items-center space-x-3">
              <Checkbox id={grower.id} />
              <Label
                htmlFor={grower.id}
                className="text-sm text-gray-700 cursor-pointer font-normal"
              >
                {grower.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-8">
        <h3 className="font-bold text-gray-900 mb-4 text-base">Price</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="number"
              placeholder="From"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              placeholder="To"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            />
          </div>
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={1000}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>₱{priceRange[0]}</span>
            <span>₱{priceRange[1]}</span>
          </div>
        </div>
      </div>

      {isMobile && (
        <div className="sticky bottom-0 bg-white pt-4 border-t">
          <Button className="w-full bg-[#1E392A] hover:bg-[#1E392A]/90">
            Apply Filters
          </Button>
        </div>
      )}
    </div>
  );
}
