"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Save,
  Loader2,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RichTextEditor } from "./RichTextEditor";
import { ImageUploader, UploadedImage } from "./ImageUploader";
import { VariantManager, ProductVariant } from "./VariantManager";
import { CategorySelector } from "./CategorySelector";
import { SeoFields } from "./SeoFields";
import { ProductFormData } from "@/lib/sanity/products";
import { useSellerProduct, useUpdateSellerProduct } from "@/hooks/useSeller";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

// Form validation schema
const productFormSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  compareAtPrice: z.preprocess((val) => {
    // Normalize empty and NaN values to undefined so compare price is optional
    if (val === "" || val === null) return undefined;
    if (typeof val === "number" && isNaN(val)) return undefined;
    return val;
  }, z.number().optional()),
  quantity: z.number().int().min(0, "Quantity must be 0 or greater"),
  trackInventory: z.boolean(),
  hasVariants: z.boolean(),
  sku: z.string().optional(),
  weight: z.number().optional(),
  metaTitle: z.string().max(70, "Meta title too long").optional(),
  metaDescription: z.string().max(200, "Meta description too long").optional(),
  isAvailable: z.boolean(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface EditProductFormProps {
  productId?: string;
}

export function EditProductForm({ productId }: EditProductFormProps) {
  // Support either receiving productId as a prop or reading it from the URL
  const params = useParams();
  const effectiveProductId = productId ?? (params?.id as string | undefined);

  if (!effectiveProductId) {
    return (
      <div className="text-center py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Product ID is missing from the URL or props.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  const router = useRouter();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Use custom hooks for product data and updates
  const {
    product,
    loading: isLoading,
    error: fetchError,
    refetch,
  } = useSellerProduct(effectiveProductId);

  const updateMutation = useUpdateSellerProduct();
  const queryClient = useQueryClient();
  const isSubmitting = updateMutation.isPending;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      category: "",
      price: 0,
      quantity: 0,
      trackInventory: true,
      hasVariants: false,
      isAvailable: true,
    },
  });

  const formData = watch();
  const hasVariants = watch("hasVariants");

  // Load product data into form when fetched
  useEffect(() => {
    if (product) {
      // Populate form with product data (convert null optional fields to undefined)
      reset({
        name: product.name,
        description: product.description || "",
        category: product.category,
        price: product.price,
        compareAtPrice:
          typeof product.compareAtPrice === "number"
            ? product.compareAtPrice
            : undefined,
        quantity: product.stock || 0,
        trackInventory: true,
        hasVariants: product.hasVariants || false,
        sku: product.sku || undefined,
        weight: typeof product.weight === "number" ? product.weight : undefined,
        metaTitle: product.seo?.metaTitle || undefined,
        metaDescription: product.seo?.metaDescription || undefined,
        isAvailable: product.isAvailable !== false,
      });

      // Load images (handle both legacy string arrays and newer {url, assetId} objects)
      const productImages: UploadedImage[] = [];
      if (product.image) {
        productImages.push({
          id: "existing-main",
          url: product.image,
          alt: product.name,
          isPrimary: true,
          sanityAssetId: product.imageAssetId ?? undefined,
        });
      }

      if (product.images && product.images.length > 0) {
        product.images.forEach((img: any, index: number) => {
          if (typeof img === "string") {
            productImages.push({
              id: `existing-${index}`,
              url: img,
              alt: `${product.name} - Image ${index + 1}`,
              isPrimary: false,
              sanityAssetId: undefined,
            });
          } else {
            productImages.push({
              id: `existing-${index}`,
              url: img.url,
              alt: `${product.name} - Image ${index + 1}`,
              isPrimary: false,
              sanityAssetId: img.assetId ?? undefined,
            });
          }
        });
      }

      setImages(productImages);

      // Load variants if any
      if (product.variants) {
        setVariants(product.variants);
      }
    }
  }, [product, reset]);

  const onSubmit = async (data: ProductFormValues) => {
    // Validate images
    if (images.length === 0) {
      toast.error("Please add at least one product image");
      setActiveTab("media");
      return;
    }

    // Validate variants if enabled
    if (hasVariants && variants.length === 0) {
      toast.error("Please add at least one variant or disable variants");
      setActiveTab("variants");
      return;
    }

    try {
      // Step 1: Upload new images that haven't been uploaded yet
      const imagesToUpload = images.filter(
        (img) => img.file && !img.sanityAssetId,
      );
      const uploadedImages = [...images];

      if (imagesToUpload.length > 0) {
        toast.loading("Uploading images...", { id: "upload-images" });

        for (const image of imagesToUpload) {
          if (image.file) {
            try {
              const formData = new FormData();
              formData.append("file", image.file);
              formData.append("alt", image.alt || "");

              const uploadResponse = await fetch(
                "/api/seller/products/upload-image",
                {
                  method: "POST",
                  body: formData,
                },
              );

              if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json();
                throw new Error(
                  errorData.error?.message || "Failed to upload image",
                );
              }

              const uploadData = await uploadResponse.json();

              // Update the image with the asset ID
              const imageIndex = uploadedImages.findIndex(
                (img) => img.id === image.id,
              );
              if (imageIndex !== -1) {
                uploadedImages[imageIndex] = {
                  ...uploadedImages[imageIndex],
                  sanityAssetId: uploadData.data.assetId,
                  url: uploadData.data.url,
                };
              }
            } catch (error) {
              console.error("Error uploading image:", error);
              throw new Error(
                `Failed to upload image ${image.file.name}: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`,
              );
            }
          }
        }

        toast.dismiss("upload-images");
      }

      // Step 2: Prepare product data
      const productData: ProductFormData = {
        name: data.name,
        description: data.description,
        category: data.category,
        price: data.price,
        // Convert nullable numeric inputs to undefined for validation
        compareAtPrice:
          typeof data.compareAtPrice === "number" && !isNaN(data.compareAtPrice)
            ? data.compareAtPrice
            : undefined,
        quantity: data.quantity,
        trackInventory: data.trackInventory,
        hasVariants: data.hasVariants,
        variants: data.hasVariants ? variants : undefined,
        images: uploadedImages,
        sku: data.sku,
        weight:
          typeof data.weight === "number" && !isNaN(data.weight)
            ? data.weight
            : undefined,
        seo: {
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
        },
        isAvailable: data.isAvailable,
      };

      // Step 3: Update product via hook (with optimistic updates)
      toast.loading("Updating product...", { id: "update-product" });

      await updateMutation.mutateAsync({
        productId: effectiveProductId,
        data: productData,
      });

      // Ensure product list is refreshed before navigating back
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["seller-products"] }),
        queryClient.invalidateQueries({
          queryKey: ["seller-product", effectiveProductId],
        }),
      ]);

      toast.dismiss("update-product");
      toast.success("Product updated successfully!", {
        description: `${data.name} has been updated.`,
      });

      // Redirect to product list
      router.push(`/seller/products`);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.dismiss("upload-images");
      toast.dismiss("update-product");
      toast.error("Failed to update product", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="text-center py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/seller/products">
            <Button type="button" variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Product</h1>
            <p className="text-muted-foreground">
              Update your product information
            </p>
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Update Product
            </>
          )}
        </Button>
      </div>

      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix the following errors before submitting:
            <ul className="list-disc list-inside mt-2 space-y-1">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field} className="text-sm">
                  {field}: {error?.message}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Form Tabs - Reuse from AddProductForm */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>
                Basic details about your product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., King Oyster Mushrooms"
                  {...register("name")}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Description (Rich Text) */}
              <div className="space-y-2">
                <Label>Product Description *</Label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => setValue("description", value)}
                  error={errors.description?.message}
                />
              </div>

              {/* Category */}
              <CategorySelector
                value={formData.category}
                onChange={(value) => setValue("category", value)}
                error={errors.category?.message}
              />

              {/* SKU & Weight */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU (Optional)</Label>
                  <Input
                    id="sku"
                    placeholder="e.g., MUSH-001"
                    {...register("sku")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (grams)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="0"
                    {...register("weight", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
              <CardDescription>
                Set pricing and manage inventory
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Price & Compare Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₱) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("price", { valueAsNumber: true })}
                    className={errors.price ? "border-destructive" : ""}
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive">
                      {errors.price.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compareAtPrice">Compare at Price (₱)</Label>
                  <Input
                    id="compareAtPrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("compareAtPrice", { valueAsNumber: true })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Show a discount by setting a higher compare price
                  </p>
                </div>
              </div>

              <Separator />

              {/* Inventory */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity in Stock *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="1"
                    placeholder="0"
                    {...register("quantity", { valueAsNumber: true })}
                    className={errors.quantity ? "border-destructive" : ""}
                  />
                  {errors.quantity && (
                    <p className="text-sm text-destructive">
                      {errors.quantity.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="trackInventory">Track Inventory</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically track stock levels
                    </p>
                  </div>
                  <Switch
                    id="trackInventory"
                    {...register("trackInventory")}
                    checked={formData.trackInventory}
                    onCheckedChange={(checked) =>
                      setValue("trackInventory", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="isAvailable">Available for Purchase</Label>
                    <p className="text-sm text-muted-foreground">
                      Make this product visible in your store
                    </p>
                  </div>
                  <Switch
                    id="isAvailable"
                    {...register("isAvailable")}
                    checked={formData.isAvailable}
                    onCheckedChange={(checked) =>
                      setValue("isAvailable", checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>
                Upload images to showcase your product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader
                images={images}
                onImagesChange={setImages}
                error={
                  images.length === 0
                    ? "At least one image is required"
                    : undefined
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variants Tab */}
        <TabsContent value="variants" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Variants</CardTitle>
              <CardDescription>
                Add different sizes, colors, or weight options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VariantManager
                hasVariants={hasVariants}
                onHasVariantsChange={(enabled) =>
                  setValue("hasVariants", enabled)
                }
                variants={variants}
                onVariantsChange={setVariants}
                basePrice={formData.price}
                baseSku={formData.sku || "PROD"}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search Engine Optimization</CardTitle>
              <CardDescription>
                Improve your product's visibility in search results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SeoFields
                metaTitle={formData.metaTitle || ""}
                metaDescription={formData.metaDescription || ""}
                onMetaTitleChange={(value) => setValue("metaTitle", value)}
                onMetaDescriptionChange={(value) =>
                  setValue("metaDescription", value)
                }
                productName={formData.name}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
}
