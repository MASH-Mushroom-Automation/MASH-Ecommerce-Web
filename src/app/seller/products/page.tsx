"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SellerDashboardLayout from "@/components/seller/SellerLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";

interface Product {
  id: string;
  name: string;
  itemId: string;
  sales: number;
  price: number;
  stock: number;
  image: string;
}

export default function MyProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const products: Product[] = [
    {
      id: "1",
      name: "Mushroom Party",
      itemId: "9X6H9Q2F5L125",
      sales: 12,
      price: 900.0,
      stock: 120,
      image: "/placeholder.png",
    },
    {
      id: "2",
      name: "Mushroom Party",
      itemId: "9X6H9Q2F5L125",
      sales: 15,
      price: 900.0,
      stock: 20,
      image: "/placeholder.png",
    },
    {
      id: "3",
      name: "Mushroom Party",
      itemId: "9X6H9Q2F5L125",
      sales: 1,
      price: 900.0,
      stock: 50,
      image: "/placeholder.png",
    },
    {
      id: "4",
      name: "Mushroom Party",
      itemId: "9X6H9Q2F5L125",
      sales: 5,
      price: 900.0,
      stock: 60,
      image: "/placeholder.png",
    },
  ];

  return (
    <SellerDashboardLayout>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-6">My Products</h1>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6 max-w-3xl">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="live">Live</TabsTrigger>
            <TabsTrigger value="soldout">Sold out</TabsTrigger>
            <TabsTrigger value="delisted">Delisted</TabsTrigger>
            <TabsTrigger value="review">Under Review</TabsTrigger>
          </TabsList>

          {/* Search */}
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Product name, Item ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <Button className="bg-[#1E392A] hover:bg-[#1E392A]/90">
              Search
            </Button>
          </div>

          <TabsContent value="all" className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              {products.length} Products
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 pb-3 border-b bg-gray-50 p-4 rounded-t-lg font-semibold text-sm">
              <div className="col-span-1 flex items-center">
                <Checkbox />
              </div>
              <div className="col-span-4">Product(s)</div>
              <div className="col-span-1 flex items-center gap-1 cursor-pointer">
                Sales <ArrowUpDown className="h-3 w-3" />
              </div>
              <div className="col-span-2 flex items-center gap-1 cursor-pointer">
                Price <ArrowUpDown className="h-3 w-3" />
              </div>
              <div className="col-span-2 flex items-center gap-1 cursor-pointer">
                Stock <ArrowUpDown className="h-3 w-3" />
              </div>
              <div className="col-span-2">Actions</div>
            </div>

            {/* Products */}
            {products.map((product) => (
              <div
                key={product.id}
                className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-gray-50 items-center"
              >
                <div className="col-span-1">
                  <Checkbox />
                </div>
                <div className="col-span-4 flex items-center space-x-3">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={60}
                    height={60}
                    className="rounded-md"
                  />
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-gray-600">Item ID:</p>
                    <p className="text-xs text-gray-600">{product.itemId}</p>
                  </div>
                </div>
                <div className="col-span-1">
                  <p className="font-medium">{product.sales}</p>
                </div>
                <div className="col-span-2">
                  <p className="font-medium">₱ {product.price.toFixed(2)}</p>
                </div>
                <div className="col-span-2">
                  <p className="font-medium">{product.stock}</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <Link
                    href={`/seller/products/${product.id}/edit`}
                    className="text-[#1E392A] hover:underline text-sm block"
                  >
                    Edit
                  </Link>
                  <button className="text-red-600 hover:underline text-sm block">
                    Delist
                  </button>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="live">
            {/* Same structure filtered by live */}
          </TabsContent>
          <TabsContent value="soldout">
            {/* Same structure filtered by sold out */}
          </TabsContent>
          <TabsContent value="delisted">
            {/* Same structure filtered by delisted */}
          </TabsContent>
          <TabsContent value="review">
            {/* Same structure filtered by under review */}
          </TabsContent>
        </Tabs>
      </div>
    </SellerDashboardLayout>
  );
}
