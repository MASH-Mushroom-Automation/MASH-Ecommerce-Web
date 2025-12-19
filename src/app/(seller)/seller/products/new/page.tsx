"use client";

import React from "react";
import { AddProductForm } from "@/components/seller/product-form";

/**
 * Add New Product Page
 * Uses comprehensive product form with rich text, image upload, variants, and SEO
 */
export default function AddNewProductPage() {
  return (
    <div className="container max-w-7xl mx-auto py-8">
      <AddProductForm />
    </div>
  );
}

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
  };  // --- VALIDATION LOGIC ---

  const validateForm = useCallback(() => {
    const errors: ValidationErrors = {};

    // --- Basic Information Validation ---
    
    // Image
    if (productImages.length === 0) {
        errors.images = "Product must have at least one image.";
        setActiveTab("basic");
    }

    // Product Name
    if (productName.trim().length === 0) {
        errors.productName = "Product name is required.";
        setActiveTab("basic");
    }

    // Description
    if (productDescription.trim().length === 0) {
        errors.productDescription = "Description is required.";
        setActiveTab("basic");
    }

    // Category Display Name
    if (productCategory === "SELECT_CATEGORY") {
        errors.productCategory = "Please select a valid category.";
        setActiveTab("basic");
    }

    // Weight
    if (parseFloat(productWeight) <= 0 || productWeight.trim() === "") {
        errors.productWeight = "Weight must be greater than 0.";
        setActiveTab("basic");
    }
    
    // Product Metadata (Checkboxes)
    if (!metadataOrganic && !metadataLocalFarm) {
        errors.metadataCheckboxes = "Please check at least one metadata option.";
        setActiveTab("basic");
    }

    // Freshness/Shelf Life
    if (metadataFreshness.trim().length === 0) {
        errors.metadataFreshness = "Freshness/Shelf life is required.";
        setActiveTab("basic");
    }

    // --- Sales Information Validation ---

    // Price
    if (parseFloat(productPrice) <= 0 || productPrice.trim() === "") {
        errors.productPrice = "Price must be greater than 0.";
        setActiveTab("sales");
    }

    // Stock Quantity
    if (parseInt(productStock) <= 0 || productStock.trim() === "") {
        errors.productStock = "Stock quantity must be greater than 0.";
        setActiveTab("sales");
    }

    // Product Status
    if (productStatus === "SELECT_STATUS") {
        errors.productStatus = "Please select a valid product status.";
        setActiveTab("sales");
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [
      productImages.length, productName, productDescription, productCategory, productWeight,
      metadataOrganic, metadataLocalFarm, metadataFreshness, productPrice, productStock,
      productStatus, metadataFreshness
  ]);

  // --- STEP 1: FORM SUBMISSION (Validation & Review Trigger) ---
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
        showToast("Please correct the errors in the form.", true);
        return;
    }

    // Validation passed, move to review screen
    setIsReviewing(true);
    showToast("Review your product details before saving.", false);
  };

  // --- STEP 2: FINAL SUBMISSION (API Call) ---
  const handleFinalSubmit = async () => {
    // Re-run validation as a final safety check, although it should pass here
    if (!validateForm()) {
        setIsReviewing(false); // Go back to form if somehow invalid
        showToast("Critical Error: Please correct validation issues and try again.", true);
        return;
    }

    setIsSubmitting(true);
    
    try {
      const stockInt = parseInt(productStock);
      const priceFloat = parseFloat(productPrice);

      // Construct the final product data object
      const productData = {
        name: productName,
        description: productDescription,
        slug: productSlug || generateSlug(productName),
        sku: productSku || `SKU-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        weight: `${productWeight}${productUnit}`,
        unit: productUnit,
        images: productImages,
        category: categoryDisplayName,
        categoryId: productCategoryId,
        metadata: { 
            organic: metadataOrganic, 
            localFarm: metadataLocalFarm, 
            freshness: metadataFreshness
        }, 
        price: priceFloat,
        stock: stockInt,
        status: productStatus,
        isFeatured: isFeatured,
        inStock: stockInt > 0,
        createdAt: new Date().toISOString()
      };

      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Log the data to the console (instead of calling the API)
      console.log("--- PRODUCT DATA COLLECTED AND SAVED SUCCESSFULLY ---");
      console.log(JSON.stringify(productData, null, 2));
      
      showToast(`Product "${productName}" saved! Check console for data payload.`);
      
      // Optionally redirect user to product list after successful save
      // setTimeout(() => window.location.href = '/seller/products', 2000); 
      
    } catch (error) {
      showToast("Submission failed. An unexpected error occurred.", true);
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    } 
  };


  // --- PRODUCT REVIEW COMPONENT ---
  const ProductReview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Product Image and Description Card */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">{productName}</CardTitle>
            <CardDescription>Cover Image</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-square relative rounded-md overflow-hidden border border-border bg-muted mb-4">
              {productImages.length > 0 && (
                <Image
                  src={productImages[0]} 
                  alt={`Cover image for ${productName}`}
                  fill
                  className="object-cover"
                  onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://placehold.co/300x300/A0A0A0/FFFFFF?text=Product+Image`;
                  }}
                />
              )}
            </div>
            <h4 className="font-semibold mb-2">Description</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{productDescription}</p>
          </CardContent>
        </Card>
      </div>

      {/* Details and Sales Overview */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Product Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <DetailItem label="Category Display Name" value={categoryDisplayName} />
            <DetailItem label="Category ID" value={productCategoryId} />
            <DetailItem label="URL Slug" value={productSlug || generateSlug(productName)} />
            <DetailItem label="SKU" value={productSku || "Auto-Generated"} />
            <DetailItem label="Weight" value={`${productWeight} ${productUnit}`} />
            <div className="col-span-2">
                <h4 className="font-semibold text-sm mb-1 text-muted-foreground">Product Metadata</h4>
                <div className="flex space-x-4 text-sm font-medium">
                    <span className={metadataOrganic ? 'text-green-600' : 'text-gray-500'}>
                        {metadataOrganic ? '✓ Organic' : '✗ Organic'}
                    </span>
                    <span className={metadataLocalFarm ? 'text-green-600' : 'text-gray-500'}>
                        {metadataLocalFarm ? '✓ Local Farm' : '✗ Local Farm'}
                    </span>
                </div>
                <p className="text-sm mt-2"><span className="font-medium text-muted-foreground">Freshness/Shelf Life:</span> {metadataFreshness}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales & Inventory</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <DetailItem label="Price" value={`₱ ${parseFloat(productPrice).toFixed(2)}`} isImportant />
            <DetailItem label="Stock Quantity" value={`${parseInt(productStock)} units`} isImportant />
            <DetailItem label="Product Status" value={productStatus} />
            <DetailItem label="Featured on Homepage" value={isFeatured ? "Yes" : "No"} />
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsReviewing(false)} className="flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" /> Back to Edit
            </Button>
            <Button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
            >
                {isSubmitting ? "Saving Product..." : "Confirm & Save Product"}
            </Button>
        </div>
      </div>
    </div>
  );

  const DetailItem = ({ label, value, isImportant = false }: { label: string, value: string, isImportant?: boolean }) => (
    <div className="flex flex-col space-y-1">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={`text-base font-semibold ${isImportant ? 'text-primary' : 'text-foreground'}`}>{value}</span>
    </div>
  );

  // --- MAIN RENDER ---
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-6">
        <Link
          href="/seller/products"
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground">
          {isReviewing ? "Product Overview" : "Add New Product"}
        </h1>
        {isReviewing && <ListChecks className="h-6 w-6 text-primary ml-2" />}
      </div>

      {isReviewing ? (
        <ProductReview />
      ) : (
        <form onSubmit={handleFormSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left column - Product Images */}
            <div className="lg:col-span-1">
              <Card className={validationErrors.images ? "border-red-500" : ""}>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                  <CardDescription>
                    Upload up to 8 images. The first image will be the cover.
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
                          onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://placehold.co/100x100/A0A0A0/FFFFFF?text=Local+Image`;
                          }}
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
                          multiple={true}
                        />
                      </label>
                    )}
                  </div>
                  {validationErrors.images && (
                      <p className="text-sm text-red-500 mt-2">{validationErrors.images}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right column - Product Details */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Product Details</CardTitle>
                  <CardDescription>
                    Fill in the required information about your product.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-2 mb-6">
                      <TabsTrigger value="basic">Basic Information</TabsTrigger>
                      <TabsTrigger value="sales">Sales Information</TabsTrigger>
                    </TabsList>

                    {/* --- BASIC INFORMATION TAB --- */}
                    <TabsContent value="basic" className="space-y-6">
                      <div className="space-y-4">
                        {/* 1. Name */}
                        <div>
                          <Label htmlFor="product-name">Product Name *</Label>
                          <Input
                            id="product-name"
                            placeholder="Premium Oyster Mushroom"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            className={validationErrors.productName ? "border-red-500 focus:border-red-500" : ""}
                          />
                          {validationErrors.productName && (
                              <p className="text-sm text-red-500 mt-1">{validationErrors.productName}</p>
                          )}
                        </div>

                        {/* 2. Description */}
                        <div>
                          <Label htmlFor="product-description">Description *</Label>
                          <Textarea
                            id="product-description"
                            placeholder="Fresh premium quality oyster mushrooms..."
                            rows={3}
                            value={productDescription}
                            onChange={(e) => setProductDescription(e.target.value)}
                            className={validationErrors.productDescription ? "border-red-500 focus:border-red-500" : ""}
                          />
                          {validationErrors.productDescription && (
                              <p className="text-sm text-red-500 mt-1">{validationErrors.productDescription}</p>
                          )}
                        </div>

                        {/* 3. Slug (New Input) */}
                        <div>
                          <Label htmlFor="product-slug">URL Slug</Label>
                          <Input
                            id="product-slug"
                            placeholder="oyster-mushroom"
                            value={productSlug}
                            onChange={(e) => setProductSlug(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground mt-1">Leave empty to auto-generate from name.</p>
                        </div>

                        {/* 4. SKU & Category ID */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="product-sku">SKU (Stock Keeping Unit)</Label>
                            <Input
                              id="product-sku"
                              placeholder="SKU-OYS-001"
                              value={productSku}
                              onChange={(e) => setProductSku(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="product-category-id">Category ID</Label>
                            <Input
                              id="product-category-id"
                              placeholder="category-id-123"
                              value={productCategoryId}
                              onChange={(e) => setProductCategoryId(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* 5. Category Dropdown */}
                        <div>
                          <Label htmlFor="product-category">Category Display Name *</Label>
                          <Select
                            value={productCategory}
                            onValueChange={setProductCategory}
                          >
                            <SelectTrigger 
                              id="product-category"
                              className={validationErrors.productCategory ? "border-red-500 focus:border-red-500" : ""}
                            >
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SELECT_CATEGORY" disabled>
                                  Select Category
                              </SelectItem>
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
                          {validationErrors.productCategory && (
                              <p className="text-sm text-red-500 mt-1">{validationErrors.productCategory}</p>
                          )}
                        </div>

                        {/* 6. Weight/Unit */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2 sm:col-span-1">
                            <Label htmlFor="product-weight">Weight *</Label>
                            <div className="flex">
                              <Input
                                id="product-weight"
                                type="number"
                                min="0"
                                placeholder="0"
                                className={`rounded-r-none ${validationErrors.productWeight ? "border-red-500 focus:border-red-500" : ""}`}
                                value={productWeight}
                                onChange={(e) => setProductWeight(e.target.value)}
                                onKeyPress={restrictExponential}
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
                            {validationErrors.productWeight && (
                              <p className="text-sm text-red-500 mt-1">{validationErrors.productWeight}</p>
                            )}
                          </div>
                        </div>

                        {/* 7. Metadata (New Checkboxes & Input) */}
                        <div className={`space-y-3 pt-4 border-t ${validationErrors.metadataCheckboxes || validationErrors.metadataFreshness ? "border-red-500 p-3 rounded-md" : ""}`}>
                          <h3 className="text-md font-semibold">Product Metadata *</h3>
                          <div className="flex flex-col space-y-2">
                              <div className="flex items-center space-x-2">
                              <Checkbox
                                  id="metadata-organic"
                                  checked={metadataOrganic}
                                  onCheckedChange={(checked) => setMetadataOrganic(!!checked)}
                              />
                              <Label htmlFor="metadata-organic" className="text-sm font-medium leading-none">
                                  Organic Certified
                              </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                              <Checkbox
                                  id="metadata-local-farm"
                                  checked={metadataLocalFarm}
                                  onCheckedChange={(checked) => setMetadataLocalFarm(!!checked)}
                              />
                              <Label htmlFor="metadata-local-farm" className="text-sm font-medium leading-none">
                                  Local Farm Product
                              </Label>
                              </div>
                          </div>
                          {validationErrors.metadataCheckboxes && (
                              <p className="text-sm text-red-500 mt-1">{validationErrors.metadataCheckboxes}</p>
                          )}

                          <div className="pt-2">
                            <Label htmlFor="metadata-freshness">Freshness/Shelf Life *</Label>
                            <Input
                              id="metadata-freshness"
                              placeholder="e.g., 24 hours, 7 days refrigerated"
                              value={metadataFreshness}
                              onChange={(e) => setMetadataFreshness(e.target.value)}
                              className={validationErrors.metadataFreshness ? "border-red-500 focus:border-red-500" : ""}
                            />
                            {validationErrors.metadataFreshness && (
                              <p className="text-sm text-red-500 mt-1">{validationErrors.metadataFreshness}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* --- SALES INFORMATION TAB --- */}
                    <TabsContent value="sales" className="space-y-6">
                      <div className="space-y-4">
                        {/* 1. Price */}
                        <div>
                          <Label htmlFor="product-price">Price (₱) *</Label>
                          <Input
                            id="product-price"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={productPrice}
                            onChange={(e) => setProductPrice(e.target.value)}
                            onKeyPress={restrictExponential}
                            className={validationErrors.productPrice ? "border-red-500 focus:border-red-500" : ""}
                          />
                          {validationErrors.productPrice && (
                              <p className="text-sm text-red-500 mt-1">{validationErrors.productPrice}</p>
                          )}
                        </div>

                        {/* 2. Stock Quantity */}
                        <div>
                          <Label htmlFor="product-stock">Stock Quantity *</Label>
                          <Input
                            id="product-stock"
                            type="number"
                            min="0"
                            placeholder="0"
                            value={productStock}
                            onChange={(e) => setProductStock(e.target.value)}
                            onKeyPress={restrictExponential}
                            className={validationErrors.productStock ? "border-red-500 focus:border-red-500" : ""}
                          />
                          {validationErrors.productStock && (
                              <p className="text-sm text-red-500 mt-1">{validationErrors.productStock}</p>
                          )}
                        </div>

                        {/* 3. Status */}
                        <div>
                          <Label htmlFor="product-status">Product Status *</Label>
                          <Select
                            value={productStatus}
                            onValueChange={setProductStatus}
                          >
                            <SelectTrigger 
                              id="product-status"
                              className={validationErrors.productStatus ? "border-red-500 focus:border-red-500" : ""}
                            >
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SELECT_STATUS" disabled>
                                  Select Status
                              </SelectItem>
                              <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                              <SelectItem value="DRAFT">INACTIVE</SelectItem>
                            </SelectContent>
                          </Select>
                          {validationErrors.productStatus && (
                              <p className="text-sm text-red-500 mt-1">{validationErrors.productStatus}</p>
                          )}
                        </div>

                        {/* 4. Is Featured */}
                        <div className="flex items-center justify-between border-t border-b py-4">
                          <Label htmlFor="is-featured" className="text-sm font-medium leading-none">
                            Feature on Homepage
                            <p className="text-xs text-muted-foreground mt-0.5 font-normal">Mark this product as a featured item.</p>
                          </Label>
                          <Switch
                            id="is-featured"
                            checked={isFeatured}
                            onCheckedChange={setIsFeatured}
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
                  <Button variant="outline" disabled={isSubmitting}>Cancel</Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? "Saving Data..." : "Review Product"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}