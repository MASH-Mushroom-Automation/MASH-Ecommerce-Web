"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Upload, X, Plus, Info } from "lucide-react";
import { toast } from "sonner";

export default function AddNewProduct() {
  const [productImages, setProductImages] = useState<string[]>([]);
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("");
  const [productWeight, setProductWeight] = useState("");
  const [productUnit, setProductUnit] = useState("g");

  const isValidPrice = (value: string) => {
    if (!value) return false;
    const priceNumber = Number(value);
    return (
      Number.isFinite(priceNumber) &&
      priceNumber > 0 &&
      /^\d+(?:\.\d{1,2})?$/.test(value)
    );
  };

  const isValidQuantity = (value: string) => {
    if (!value) return false;
    const quantityNumber = Number(value);
    return Number.isInteger(quantityNumber) && quantityNumber > 0;
  };

  // Handle image upload (mock implementation)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // In a real implementation, you would upload the file to a server
      // and get back a URL. Here we're just creating a local URL.
      const newImages = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setProductImages([...productImages, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...productImages];
    newImages.splice(index, 1);
    setProductImages(newImages);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors: string[] = [];

    if (!isValidPrice(productPrice)) {
      validationErrors.push(
        "Please enter a valid price (e.g., 150 or 150.50)."
      );
    }

    if (!isValidQuantity(productStock)) {
      validationErrors.push(
        "Stock must be a positive whole number (e.g., 10)."
      );
    }

    if (!productWeight || Number(productWeight) <= 0) {
      validationErrors.push("Weight must be greater than 0.");
    }

    if (validationErrors.length > 0) {
      toast.error("Please review the highlighted fields", {
        description: validationErrors.join(" \n"),
      });
      return;
    }

    // Prepare data for API submission
    const productData = {
      name: productName,
      description: productDescription,
      category: productCategory,
      price: parseFloat(productPrice),
      stock: parseInt(productStock),
      weight: `${productWeight}${productUnit}`,
      images: productImages,
    };

    // In a real application, you would send this data to your API
    console.log("Product data to submit:", productData);

    toast.success("Product details look great!", {
      description:
        "This is a mock submission—connect the API to start publishing products.",
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-6">
        <Link
          href="/seller/products"
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Product Images */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>
                  Upload up to 8 images. First image will be the cover.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {/* Display uploaded images */}
                  {productImages.map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square relative rounded-md overflow-hidden border border-border bg-muted"
                    >
                      <Image
                        src={image}
                        alt={`Product image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-background rounded-full p-1 shadow-sm hover:bg-muted"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 text-center">
                          Cover
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Upload button */}
                  {productImages.length < 8 && (
                    <label className="aspect-square flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted hover:bg-muted/80 cursor-pointer">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">
                        Upload Image
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Product Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
                <CardDescription>
                  Fill in the information about your product.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid grid-cols-2 mb-6">
                    <TabsTrigger value="basic">Basic Information</TabsTrigger>
                    <TabsTrigger value="sales">Sales Information</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="product-name">Product Name</Label>
                        <Input
                          id="product-name"
                          placeholder="Enter product name"
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="product-description">Description</Label>
                        <Textarea
                          id="product-description"
                          placeholder="Describe your product..."
                          rows={5}
                          value={productDescription}
                          onChange={(e) =>
                            setProductDescription(e.target.value)
                          }
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="product-category">Category</Label>
                        <Select
                          value={productCategory}
                          onValueChange={setProductCategory}
                          required
                        >
                          <SelectTrigger id="product-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fresh-mushroom">
                              Fresh Mushroom
                            </SelectItem>
                            <SelectItem value="growing-kits">
                              Growing Kits
                            </SelectItem>
                            <SelectItem value="mushroom-products">
                              Mushroom Products
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="product-weight">Weight</Label>
                          <div className="flex">
                            <Input
                              id="product-weight"
                              type="number"
                              min="0"
                              placeholder="Weight"
                              className="rounded-r-none"
                              value={productWeight}
                              onChange={(e) => setProductWeight(e.target.value)}
                              required
                            />
                            <Select
                              value={productUnit}
                              onValueChange={setProductUnit}
                            >
                              <SelectTrigger className="w-20 rounded-l-none border-l-0">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="g">g</SelectItem>
                                <SelectItem value="kg">kg</SelectItem>
                                <SelectItem value="lb">lb</SelectItem>
                                <SelectItem value="oz">oz</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="sales" className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="product-price">Price (₱)</Label>
                        <Input
                          id="product-price"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={productPrice}
                          onChange={(e) => setProductPrice(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="product-stock">Stock Quantity</Label>
                        <Input
                          id="product-stock"
                          type="number"
                          min="0"
                          placeholder="0"
                          value={productStock}
                          onChange={(e) => setProductStock(e.target.value)}
                          required
                        />
                      </div>

                      <div className="bg-blue-100/10 p-4 rounded-md flex gap-3 border border-blue-300">
                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-700 dark:text-blue-600">
                          <p className="font-semibold">Shipping Information</p>
                          <p className="mt-1">
                            Make sure to set up your shipping options in the
                            Shipping Channel section before publishing your
                            product.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className="mt-6 flex justify-end gap-3">
              <Link href="/seller/products">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit">
                Save Product
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
