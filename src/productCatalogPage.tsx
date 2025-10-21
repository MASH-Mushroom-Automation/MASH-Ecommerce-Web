"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PRODUCTS } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ShoppingCart } from "lucide-react";

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
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8 lg:px-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Filters */}
          <aside className="lg:w-64 space-y-6">
            {/* Categories */}
            <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
              <h3 className="font-semibold text-lg mb-4 text-[#1E392A]">
                Categories
              </h3>
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <Label
                      htmlFor={`category-${category}`}
                      className="text-sm cursor-pointer"
                    >
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Grower */}
            <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
              <h3 className="font-semibold text-lg mb-4 text-[#1E392A]">
                Grower
              </h3>
              <div className="space-y-3">
                {growers.map((grower) => (
                  <div key={grower} className="flex items-center space-x-2">
                    <Checkbox
                      id={`grower-${grower}`}
                      checked={selectedGrowers.includes(grower)}
                      onCheckedChange={() => toggleGrower(grower)}
                    />
                    <Label
                      htmlFor={`grower-${grower}`}
                      className="text-sm cursor-pointer leading-tight"
                    >
                      {grower}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
              <h3 className="font-semibold text-lg mb-4 text-[#1E392A]">
                Price
              </h3>
              <div className="space-y-4">
                <Slider
                  min={0}
                  max={12000}
                  step={10}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>₱{priceRange[0]}</span>
                  <span>to</span>
                  <span>₱{priceRange[1]}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Header with Sort */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-[200px] bg-white">
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
                <Select defaultValue="popularity">
                  <SelectTrigger className="w-[200px] bg-white">
                    <SelectValue placeholder="Popularity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity">Popularity</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="bg-white">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-[#6A994E] text-white"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </Button>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedProducts.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden shadow-md hover:shadow-2xl transition-shadow bg-white border border-gray-300"
                >
                  <Link
                    href={`/product/${product.id}`}
                    className="relative block h-48 w-full bg-gray-100"
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    {product.tag && (
                      <Badge className="absolute top-2 right-2 bg-[#6A994E] text-white">
                        {product.tag}
                      </Badge>
                    )}
                  </Link>
                  <CardHeader className="pb-3">
                    <Badge
                      variant="outline"
                      className="w-fit text-[#6A994E] border-[#6A994E] mb-2"
                    >
                      @{product.grower.split(" ")[0]}
                    </Badge>
                    <CardTitle className="text-base leading-tight text-[#1E392A]">
                      <Link
                        href={`/product/${product.id}`}
                        className="hover:underline"
                      >
                        {product.name}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-lg font-bold text-[#1E392A]">
                          ₱{product.price.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          / {product.weight}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          className="bg-[#1E392A] hover:bg-[#1E392A]/90 text-white rounded-lg"
                        >
                          <ShoppingCart className="h-5 w-5" />
                        </Button>
                        <Link href={`/product/${product.id}`}>
                          <Button variant="outline">View</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
