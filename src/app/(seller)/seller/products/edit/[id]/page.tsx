"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Upload, X, Save, ArrowLeft } from "lucide-react";
import { SellerApi } from "@/lib/api/seller";
import { SellerProduct } from "@/types/api";

export default function EditProduct() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("");
  const [productStatus, setProductStatus] = useState("");
  const [productWeight, setProductWeight] = useState("");
  const [productUnit, setProductUnit] = useState("g");
  const [productImages, setProductImages] = useState<string[]>([]);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // In a real application, you would fetch the product by ID
        // const response = await SellerApi.getProductById(productId);
        // setProduct(response.data);

        // Mock data for now
        const mockProduct: SellerProduct = {
          id: productId,
          name: "Fresh Shiitake Mushrooms",
          category: "Fresh Mushroom",
          price: 150.0,
          stock: 25,
          status: "Active",
          image: "/placeholder.png",
        };

        // Mock description and weight (not in SellerProduct type)
        const mockDescription =
          "Premium quality shiitake mushrooms grown locally with sustainable farming practices.";
        const mockWeight = "500g";

        setProductName(mockProduct.name);
        setProductDescription(mockDescription);
        setProductCategory(mockProduct.category);
        setProductPrice(mockProduct.price.toString());
        setProductStock(mockProduct.stock.toString());
        setProductStatus(mockProduct.status);
        setProductWeight(mockWeight.replace(/[^0-9]/g, "") || "");
        setProductUnit(mockWeight.replace(/[0-9]/g, "") || "g");
        setProductImages([mockProduct.image]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch product"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Handle image upload (mock implementation)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Prepare data for API submission (only fields that exist in SellerProduct)
      const productData: Partial<SellerProduct> = {
        name: productName,
        category: productCategory,
        price: parseFloat(productPrice),
        stock: parseInt(productStock),
        status: productStatus as "Active" | "Inactive" | "Out of Stock",
        image: productImages[0] || "",
      };

      // Note: description, weight, and multiple images are not in SellerProduct type
      // You may need to extend the type or handle these separately
      await SellerApi.updateProduct(productId, productData);

      // Redirect back to products list
      router.push("/seller/products");
    } catch (error) {
      console.error("Failed to update product:", error);
      setError("Failed to update product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E392A] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
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
                      className="aspect-square relative rounded-md overflow-hidden border border-gray-200 bg-gray-50"
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
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100"
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
                    <label className="aspect-square flex flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">
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
                  Update the information about your product.
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
                            <SelectItem value="Fresh Mushroom">
                              Fresh Mushroom
                            </SelectItem>
                            <SelectItem value="Growing Kits">
                              Growing Kits
                            </SelectItem>
                            <SelectItem value="Mushroom Products">
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

                      <div>
                        <Label htmlFor="product-status">Status</Label>
                        <Select
                          value={productStatus}
                          onValueChange={setProductStatus}
                          required
                        >
                          <SelectTrigger id="product-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Out of Stock">
                              Out of Stock
                            </SelectItem>
                            <SelectItem value="Draft">Draft</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-[#1E392A] hover:bg-[#1E392A]/90"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
