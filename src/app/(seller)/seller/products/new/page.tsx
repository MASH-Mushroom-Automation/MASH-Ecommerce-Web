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
