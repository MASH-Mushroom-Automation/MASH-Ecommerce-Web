"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";
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

const DRAFT_KEY = "product-form-draft";

export function AddProductForm() {
  const router = useRouter();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [savedDraft, setSavedDraft] = useState<any>(null);

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

  // Autosave to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      if (hasUnsavedChanges) {
        const draft = {
          ...formData,
          images: images.map((img) => ({
            ...img,
            file: undefined, // Don't save File objects
          })),
          variants,
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        setLastSaved(new Date());
      }
    }, 30000); // Save every 30 seconds

    return () => clearTimeout(timer);
  }, [formData, images, variants, hasUnsavedChanges]);

  // Load draft on mount
  useEffect(() => {
    const draftData = localStorage.getItem(DRAFT_KEY);
    if (draftData) {
      try {
        const draft = JSON.parse(savedDraft);
        const shouldRestore = window.confirm(
          "You have an unsaved draft. Would you like to restore it?",
        );
        if (shouldRestore) {
          reset(draft);
          if (draft.images) setImages(draft.images);
          if (draft.variants) setVariants(draft.variants);
          setLastSaved(new Date());
          toast.info("Draft restored");
        } else {
          localStorage.removeItem(DRAFT_KEY);
        }
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    }
  }, [reset]);

  // Handle draft restoration
  const handleRestoreDraft = () => {
    if (savedDraft) {
      reset(savedDraft);
      if (savedDraft.images) setImages(savedDraft.images);
      if (savedDraft.variants) setVariants(savedDraft.variants);
      setLastSaved(new Date());
      toast.info("Draft restored successfully");
    }
    setShowDraftDialog(false);
  };

  // Handle draft dismissal
  const handleDismissDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setSavedDraft(null);
    setShowDraftDialog(false);
  };

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [formData, images, variants]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

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

    setIsSubmitting(true);

    try {
      // Step 1: Upload images that haven't been uploaded yet
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

      // Step 2: Prepare product data with uploaded images
      const productData: ProductFormData = {
        name: data.name,
        description: data.description,
        category: data.category,
        price: data.price,
        // Ensure optional numeric fields are undefined instead of null
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

      // Step 3: Create product via API route
      toast.loading("Creating product...", { id: "create-product" });

      const response = await fetch("/api/seller/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to create product");
      }

      const result = await response.json();

      toast.dismiss("create-product");
      toast.success("Product created successfully!", {
        description: `${data.name} has been added to your store.`,
      });

      // Clear draft
      localStorage.removeItem(DRAFT_KEY);
      setHasUnsavedChanges(false);

      // Redirect to product list or edit page
      router.push(`/seller/products`);
    } catch (error) {
      console.error("Error creating product:", error);
      toast.dismiss("upload-images");
      toast.dismiss("create-product");
      toast.error("Failed to create product", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveDraft = useCallback(() => {
    const draft = {
      ...formData,
      images: images.map((img) => ({ ...img, file: undefined })),
      variants,
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    setLastSaved(new Date());
    toast.success("Draft saved");
  }, [formData, images, variants]);

  return (
    <>
      {/* Draft Restoration Dialog */}
      <Dialog open={showDraftDialog} onOpenChange={setShowDraftDialog}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Unsaved Draft Found</DialogTitle>
            <DialogDescription>
              You have an unsaved draft from a previous session. Would you like to restore it and continue editing?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleDismissDraft}
              className="w-full sm:w-auto"
            >
              Discard Draft
            </Button>
            <Button
              type="button"
              onClick={handleRestoreDraft}
              className="w-full sm:w-auto"
            >
              Restore Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="space-y-4">
          {/* Back Button */}
          <Link href="/seller/products">
            <Button type="button" variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>

          {/* Main Header */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Title Section */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Add New Product</h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Create a new product for your store
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-3">
              {lastSaved && (
                <span className="text-xs sm:text-sm text-muted-foreground order-first sm:order-none">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={saveDraft}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial"
                >
                  <Save className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Save Draft</span>
                  <span className="sm:hidden">Draft</span>
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 sm:flex-initial">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span className="hidden sm:inline">Creating...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Create Product</span>
                      <span className="sm:hidden">Create</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
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

        {/* Form Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="basic" className="text-xs sm:text-sm px-2 sm:px-4 flex justify-center text-center                                     ">
              <span className="sm:inline flex text-center justify-center hidden">Basic Info</span>
              <span className="sm:hidden">Basic</span>
            </TabsTrigger>
            <TabsTrigger value="pricing" className="text-xs sm:text-sm px-2 sm:px-4 flex justify-center text-center ">Pricing</TabsTrigger>
            <TabsTrigger value="media" className="text-xs sm:text-sm px-2 sm:px-4 flex justify-center text-center ">Media</TabsTrigger>
            <TabsTrigger value="variants" className="text-xs sm:text-sm px-2 sm:px-4 flex justify-center text-center ">
              <span className="sm:inline flex text-center justify-center">Variants</span>
              <span className="sm:hidden">Vars</span>
            </TabsTrigger>
            <TabsTrigger value="seo" className="text-xs sm:text-sm px-2 sm:px-4 flex justify-center text-center">SEO</TabsTrigger>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
    </>
  );
}
