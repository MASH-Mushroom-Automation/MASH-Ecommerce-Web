"use client";

import { useMemo, useState } from "react";
import { PRODUCTS } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/ProductCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal, Grid, List } from "lucide-react";

// Using shared mock data for now; replace with API calls later
const MUSHROOM_PRODUCTS = PRODUCTS;

export default function ProductCatalogPage() {
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedGrowers, setSelectedGrowers] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 12000]);

  // Sort and pagination
  const [sort, setSort] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Get unique categories and growers
  const categories = Array.from(
    new Set(MUSHROOM_PRODUCTS.map((p) => p.category))
  );
  const growers = Array.from(new Set(MUSHROOM_PRODUCTS.map((p) => p.grower)));

  const filtered = useMemo(() => {
    const res = MUSHROOM_PRODUCTS.filter((p) => {
      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes(p.category);
      const growerMatch =
        selectedGrowers.length === 0 || selectedGrowers.includes(p.grower);
      const priceMatch = p.price >= priceRange[0] && p.price <= priceRange[1];
      return categoryMatch && growerMatch && priceMatch;
    });

    if (sort === "price-asc") res.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") res.sort((a, b) => b.price - a.price);
    return res;
  }, [selectedCategories, selectedGrowers, priceRange, sort]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
    setCurrentPage(1);
  };

  const toggleGrower = (grower: string) => {
    setSelectedGrowers((prev) =>
      prev.includes(grower)
        ? prev.filter((g) => g !== grower)
        : [...prev, grower]
    );
    setCurrentPage(1);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 md:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Left Sidebar - Filters (Desktop Only) */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-4 text-base">
                  Categories
                </h3>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-3">
                      <Checkbox
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                      />
                      <Label
                        htmlFor={`category-${category}`}
                        className="text-sm text-gray-700 cursor-pointer font-normal"
                      >
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-4 text-base">
                  Grower
                </h3>
                <div className="space-y-3">
                  {growers.map((grower) => (
                    <div key={grower} className="flex items-center space-x-3">
                      <Checkbox
                        id={`grower-${grower}`}
                        checked={selectedGrowers.includes(grower)}
                        onCheckedChange={() => toggleGrower(grower)}
                      />
                      <Label
                        htmlFor={`grower-${grower}`}
                        className="text-sm text-gray-700 cursor-pointer font-normal leading-tight"
                      >
                        {grower}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-4 text-base">
                  Price
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      placeholder="From"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      value={priceRange[0]}
                      onChange={(e) =>
                        setPriceRange([Number(e.target.value), priceRange[1]])
                      }
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      placeholder="To"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], Number(e.target.value)])
                      }
                    />
                  </div>
                  <Slider
                    min={0}
                    max={12000}
                    step={10}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>₱{priceRange[0]}</span>
                    <span>₱{priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Header with Sort and Mobile Filter */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden w-full sm:w-auto">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:w-80 p-0">
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Filters</h2>
                    <div className="space-y-6">
                      {/* Categories */}
                      <div>
                        <h3 className="font-bold text-gray-900 mb-4 text-base">
                          Categories
                        </h3>
                        <div className="space-y-3">
                          {categories.map((category) => (
                            <div key={category} className="flex items-center space-x-3">
                              <Checkbox
                                id={`mobile-category-${category}`}
                                checked={selectedCategories.includes(category)}
                                onCheckedChange={() => toggleCategory(category)}
                              />
                              <Label
                                htmlFor={`mobile-category-${category}`}
                                className="text-sm text-gray-700 cursor-pointer font-normal"
                              >
                                {category}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Grower */}
                      <div>
                        <h3 className="font-bold text-gray-900 mb-4 text-base">
                          Grower
                        </h3>
                        <div className="space-y-3">
                          {growers.map((grower) => (
                            <div key={grower} className="flex items-center space-x-3">
                              <Checkbox
                                id={`mobile-grower-${grower}`}
                                checked={selectedGrowers.includes(grower)}
                                onCheckedChange={() => toggleGrower(grower)}
                              />
                              <Label
                                htmlFor={`mobile-grower-${grower}`}
                                className="text-sm text-gray-700 cursor-pointer font-normal leading-tight"
                              >
                                {grower}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Price Range */}
                      <div>
                        <h3 className="font-bold text-gray-900 mb-4 text-base">
                          Price
                        </h3>
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
                            min={0}
                            max={12000}
                            step={10}
                            value={priceRange}
                            onValueChange={setPriceRange}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>₱{priceRange[0]}</span>
                            <span>₱{priceRange[1]}</span>
                          </div>
                        </div>
                      </div>

                      <Button className="w-full bg-[#1E392A] hover:bg-[#1E392A]/90">
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-full sm:w-[180px] bg-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-asc">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-desc">
                      Price: High to Low
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className="hidden sm:flex gap-2">
                  <Button variant="outline" size="icon" className="bg-white">
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-[#6A994E] text-white hover:bg-[#6A994E]/90"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  farm={product.grower}
                  price={product.price}
                  unit={product.weight}
                  image={product.image}
                  inStock={true}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="bg-white"
              >
                «
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="bg-white"
              >
                ‹
              </Button>
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    onClick={() => setCurrentPage(page)}
                    className={
                      currentPage === page
                        ? "bg-[#1E392A] text-white hover:bg-[#1E392A]/90"
                        : "bg-white"
                    }
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="bg-white"
              >
                ›
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="bg-white"
              >
                »
              </Button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
