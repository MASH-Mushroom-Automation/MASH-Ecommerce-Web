"use client";

import React from "react";
import { useParams } from "next/navigation";
import { EditProductForm } from "@/components/seller/product-form/EditProductForm";

export default function EditProduct() {
  const params = useParams();
  const productId = params.id as string;

  return <EditProductForm productId={productId} />;
}
